// Load jQuery UI for sortable functionality
let recorder; // Define the recorder variable globally
let selectionData = {};
const loadScript = (url, callback) => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
};

const addStylesheet = url => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
};

addStylesheet("https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css");

loadScript("https://code.jquery.com/ui/1.12.1/jquery-ui.js", () => {
  console.log("jQuery UI loaded");
  initializeCutsceneMacroMaker();
});
document.body.insertAdjacentHTML('beforeend', `
<div id="screen-select-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000;">
  <!-- Instruction Text -->
  <div style="position:absolute; top:10px; left:10px; color:white; font-size:14px;">
    Use the mouse and drag a rectangle on the screen to select the area.
  </div>

  <div id="selection-box" style="position:absolute; border:2px dashed #fff;"></div>
</div>

`);
function initializeCutsceneMacroMaker() {
  let cutsceneActions = [];
  let actionCounter = 0;

  const generateUniqueId = () => `action-${actionCounter++}`;

  class CutsceneMakerWindow extends Application {
    constructor(options = {}) {
      super(options);
    }

    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "cutscene-maker-window",
        title: "Cutscene Maker",
        template: "modules/cutscene-maker/templates/cutscene-maker.html",
        width: 700,
        resizable: true,
        classes: ["cutscene-maker"]
      });
    }

    getData() {
      return {};
    }
    activateListeners(html) {
      super.activateListeners(html);
    
      this.populateActionButtons(html);
      this.updateActionList();
    
      html.find("#testRunButton").click(() => {
        testRunActions();
      });
    
      html.find("#exportButton").click(() => {
        exportCutsceneScript();
      });
    
      html.find("#importButton").click(() => {
        openImportDialog();
      });
    
      // Add Rec Test Run button
      html.find("#recTestRunButton").click(async () => {
        try {
          // Show the selection overlay to allow the user to select the recording area
          const selection = await showSelectionOverlay();
      
          // Now prompt the user to choose where to save the recording file
          const suggestedName = "screen-recording.webm";
          const handle = await window.showSaveFilePicker({ suggestedName });
          const writable = await handle.createWritable();
      
          // Pass the selected area to the recording function
          await recTestRunActions(writable, selection);
        } catch (error) {
          console.error("Error during file save dialog:", error);
        }
      });
    }
    

    populateActionButtons(html) {
    const actions = [
      { id: "CameraButton", label: "Camera", action: addCameraPositionAction },
      { id: "SwitchSceneButton", label: "Switch Scene", action: addSwitchSceneAction },
      { id: "TokenMovementButton", label: "Token Movement", action: addTokenMovementAction },
      { id: "WaitButton", label: "Wait", action: addWaitAction },
      { id: "ScreenFlashButton", label: "Screen Flash", action: addScreenFlashAction },
      { id: "ScreenShakeButton", label: "Screen Shake", action: addScreenShakeAction },
      { id: "RunMacroButton", label: "Run Macro", action: addRunMacroAction },
      { id: "ImageDisplayButton", label: "Image Display", action: addImageDisplayAction },
      { id: "PlayAnimationButton", label: "Play Animation", action: addAnimationAction },
      { id: "ShowHideTokenButton", label: "Show/Hide Token", action: showHideAction },
      { id: "TileMovementButton", label: "Tile Movement", action: addTileMovementAction },
      { id: "DoorStateButton", label: "Door State", action: addDoorStateAction },
      { id: "FadeOutButton", label: "Fade Out", action: addFadeOutAction },
      { id: "FadeInButton", label: "Fade In", action: addFadeInAction },
      { id: "HideUIButton", label: "Hide UI", action: addHideUIAction },
      { id: "ShowUIButton", label: "Show UI", action: addShowUIAction },  
      { id: "PlayAudioButton", label: "Play Audio", action: addPlayAudioAction }, // Add this line
      { id: "TokenSayButton", label: "Token Say", action: addTokenSayAction },
      { id: "StopRecordingButton", label: "Stop Recording", action: addStopRecordingAction } 
    ];
    
      const availableActionsContainer = html.find("#availableActions");
    
      actions.forEach(({ id, label, action }) => {
        const button = $(`<button id="${id}" class="cutscene-maker-button">${label}</button>`);
        button.click(() => {
          action();
        });
        availableActionsContainer.append(button);
      });
    
      const importButton = $(`<button id="importButton" class="cutscene-maker-button">Import Script</button>`);
      availableActionsContainer.append(importButton);
    }

    updateActionList() {
      const actionList = $("#actionList");
      actionList.empty();
      cutsceneActions.forEach(action => {
        actionList.append(`
          <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 4px;">
            <span class="drag-handle" style="cursor: move; margin-right: 10px;">&#9776;</span>
            <span class="action-description" style="flex-grow: 1; overflow: overlay;">${action.description}</span>
            <span style="display: flex; gap: 5px;">
              <button class="edit-button" data-id="${action.id}" style="min-width: 60px; max-width: 60px;">Edit</button>
              <button class="remove-button" data-id="${action.id}" style="min-width: 60px; max-width: 60px;">Remove</button>
            </span>
          </li>
        `);
      });

      $(".edit-button").click(function() {
        const actionId = $(this).data("id");
        const action = cutsceneActions.find(action => action.id === actionId);
        if (action) {
          switch (action.type) {
            case "camera":
              addCameraPositionAction(action);
              break;
            case "switchScene":
              addSwitchSceneAction(action);
              break;
            case "tokenMovement":
              addTokenMovementAction(action);
              break;
            case "showHideToken":
              showHideAction(action);
              break;
            case "wait":
              addWaitAction(action);
              break;
            case "screenShake":
              addScreenShakeAction(action);
              break;
            case "screenFlash":
              addScreenFlashAction(action);
              break;
            case "runMacro":
              addRunMacroAction(action);
              break;
            case "imageDisplay":
              addImageDisplayAction(action);
              break;
            case "animation":
              addAnimationAction(action);
              break;
            case "fadeOut":
              addFadeOutAction(action);
              break;
            case "fadeIn":
              addFadeInAction(action);
              break;
            case "hideUI":
              addHideUIAction(action);
              break;
              case "addPlayAudioAction":
                addPlayAudioAction(action);
                break;
                case "addTokenSayAction":
                  addTokenSayAction(action);
                  break;
            case "showUI":
              addShowUIAction(action);
              break;
              case "stopRecording":
                addStopRecordingAction(action);
                break;
            default:
              break;
          }
        }
      });

      $(".remove-button").click(function() {
        const actionId = $(this).data("id");
        removeAction(actionId);
      });

      if (!actionList.data('ui-sortable')) {
        actionList.sortable({
          handle: '.drag-handle',
          update: function(event, ui) {
            const newOrder = $(this).sortable("toArray");
            const reorderedActions = newOrder.map(id => cutsceneActions.find(action => action.id === id));
            cutsceneActions = reorderedActions;
          }
        });
      }
      actionList.disableSelection();
    }
  }

  // Hook to add the button to the controls
  Hooks.on('getSceneControlButtons', controls => {
    controls.push({
      name: 'cutscene-maker',
      title: 'Cutscene Maker',
      icon: 'fas fa-video',
      layer: 'controls',
      tools: [{
        name: 'openCutsceneMaker',
        title: 'Open Cutscene Maker',
        icon: 'fas fa-film',
        onClick: () => {
          openCutsceneMakerWindow();
        },
        button: true
      }]
    });
  });

  // Function to open the custom window
  function openCutsceneMakerWindow() {
    new CutsceneMakerWindow().render(true);
  }
  function showSelectionOverlay() {
    return new Promise((resolve) => {
      const overlay = document.getElementById('screen-select-overlay');
      const selectionBox = document.getElementById('selection-box');
      let startX, startY, currentX, currentY;
  
      overlay.style.display = 'block';
  
      function mouseMoveHandler(e) {
        currentX = e.clientX;
        currentY = e.clientY;
    
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);
    
        // Apply the calculated styles to the selection box
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
    
        // Save the selection data
        selectionData = { width, height, left, top };
    
        console.log(`Selection Box Style -> width: ${width}px, height: ${height}px, left: ${left}px, top: ${top}px`);
    }
    
    function mouseUpHandler() {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        overlay.style.display = 'none';
    
        console.log(`mouse up final sizes -> width: ${selectionData.width}px, height: ${selectionData.height}px, left: ${selectionData.left}px, top: ${selectionData.top}px`);
    
        // Use the saved dimensions instead of getBoundingClientRect()
        if (selectionData.width > 0 && selectionData.height > 0) {
            resolve({ x: selectionData.left, y: selectionData.top, width: selectionData.width, height: selectionData.height });
        } else {
            console.warn("Invalid selection area. Please try again.");
            resolve(null);
        }
    
    }
    
  
      function mouseDownHandler(e) {
        startX = e.clientX;
        startY = e.clientY;
        console.log(`Mouse down: (${startX}, ${startY})`);
  
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
  
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      }
  
      overlay.addEventListener('mousedown', mouseDownHandler);
    });
  }
  
  
  async function recTestRunActions(writable, selection) {
    console.log(selection);
    try {
        // Change the position of the HUD to relative during recording
        const hudElement = document.getElementById('hud');
        if (hudElement) {
            hudElement.style.position = 'relative';
        }

        // Get the height of the canvas element
        const boardCanvas = document.getElementById('board');
        if (!boardCanvas) {
            console.error("Canvas element with id 'board' not found.");
            return;
        }

        // Calculate the adjustment based on canvas height and window height
        const canvasHeight = boardCanvas.clientHeight; // height of the canvas in pixels
        const winHeight = window.screen.height;
        const adjustmentHeight = winHeight - canvasHeight;

        // Adjust the selection to account for the browser's chrome height
        selection.y += adjustmentHeight + 115;
        console.log("Adjusted selection area:", selection);

        // Capture the display stream with video only
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always",
                displaySurface: "browser",
                selfBrowserSurface: 'include', // Include the current tab in the choices offered for capture
            },
            audio: false, // No audio capture
        });

        // Get the video track
        const [videoTrack] = displayStream.getVideoTracks();
        if (!videoTrack) {
            console.error("No video track available.");
            return;
        }

        // Create an offscreen canvas to crop the video
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = selection.width;
        cropCanvas.height = selection.height;
        const ctx = cropCanvas.getContext('2d');

        // Create a video element to play the captured stream
        const video = document.createElement('video');
        video.srcObject = new MediaStream([videoTrack]);
        
        video.addEventListener('loadedmetadata', () => {
            console.log("Video metadata loaded. Dimensions:", video.videoWidth, video.videoHeight);
            video.play().then(() => {
                console.log("Video is playing.");
                startAnimating(60); // Start drawing frames at 60 FPS
            }).catch((error) => {
                console.error("Error playing video:", error);
            });
        });

        let stop = false;
        let fps, fpsInterval, startTime, now, then, elapsed;

        function startAnimating(fps) {
            fpsInterval = 1000 / fps;
            then = Date.now();
            startTime = then;
            animate();
        }

        function animate() {
            if (stop) {
                return;
            }

            requestAnimationFrame(animate);

            now = Date.now();
            elapsed = now - then;

            if (elapsed > fpsInterval) {
                then = now - (elapsed % fpsInterval);

                ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
                ctx.drawImage(video, selection.x, selection.y, selection.width, selection.height, 0, 0, selection.width, selection.height);
            }
        }

        // Capture the cropped canvas as a stream
        const croppedStream = cropCanvas.captureStream(60); // 60 FPS

        // Set up the media recorder
        const options = { mimeType: 'video/webm; codecs=vp9' };
        recorder = new MediaRecorder(croppedStream, options); // Assign to global variable
        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                console.log("Data available: ", event.data.size);
                chunks.push(event.data);
            }
        };

        recorder.onstop = async () => {
            console.log("Recording stopped. Chunks length: ", chunks.length);
            if (chunks.length > 0) {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recording.webm';
                a.click();
                console.log("Recording saved successfully.");
            } else {
                console.warn("No chunks to save.");
            }

            // Cleanup resources
            video.pause();
            video.srcObject = null;
            videoTrack.stop();
            cropCanvas.width = 0;
            cropCanvas.height = 0;

            // Revert the HUD position back to absolute after recording
            if (hudElement) {
                hudElement.style.position = 'absolute';
            }

            console.log("Resources cleaned up.");
        };

        recorder.onerror = (event) => {
            console.error("Recorder error: ", event.error);
        };

        // Start recording
        recorder.start();
        console.log("Recording started.");

        // Perform the test run actions without stopping the recording automatically
        await testRunActions();

    } catch (error) {
        console.error("Error during Rec Test Run:", error);
    }
}


  
  async function testRunActions() {
    const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");
  
    // Wrap the script content in a function that returns a promise
    const wrappedScript = `
      (async function(recorder) {
        try {
          // Minimize the window
          const windowApp = ui.windows[Object.keys(ui.windows).find(key => ui.windows[key].id === 'cutscene-maker-window')];
          if (windowApp) {
            windowApp.minimize();
          }
  
          // The user's script content
          ${scriptContent}
  
          // Ensure we maximize the window after execution
          if (windowApp) {
            windowApp.maximize();
          }
        } catch (error) {
          console.error("Error executing cutscene script: ", error);
          ui.notifications.error("Error executing cutscene script. Check the console for details.");
          throw error; // Ensure the error is propagated
        }
      })(recorder);
    `;
  
    // Execute the wrapped script
    try {
      await new Function('recorder', wrappedScript)(recorder);
      ui.notifications.info("Test run executed successfully.");
    } catch (error) {
      console.error("Error during test run:", error);
    }
  }
  
  

  function openImportDialog() {
    new Dialog({
      title: "Import Script",
      content: `
        <form>
          <div class="form-group">
            <label for="importScript">Paste the script to import:</label>
            <textarea id="importScript" name="importScript" style="width: 100%; height: 200px;"></textarea>
          </div>
        </form>
      `,
      buttons: {
        import: {
          label: "Import",
          callback: html => {
            const script = html.find("#importScript").val();
            if (script) {
              importScript(script);
            }
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "import",
      render: html => {
        console.log("Import dialog rendered");
      }
    }).render(true);
  }

  function parseScript(script) {
    const actions = script.split("\n\n").map(section => {
      const type = parseActionType(section);
      if (type === "dummy") return null; // Ignore unregistered actions
      const params = parseParamsFromScript(section, type);
      return { type, params, description: generateDescription(type, section) };
    }).filter(action => action !== null); // Filter out null values
    return actions;
  }
  
  function parseActionType(section) {
    if (section.includes("Camera Position Action")) return "camera";
    if (section.includes("Wait Action")) return "wait";
    if (section.includes("Switch Scene Action")) return "switchScene";
    if (section.includes("Token Teleport Action") || section.includes("Token Movement Action")) return "tokenMovement";
    if (section.includes("Show/Hide Token Action")) return "showHideToken";
    if (section.includes("Tile Movement Action")) return "tileMovement";
    if (section.includes("Screen Shake Action")) return "screenShake";
    if (section.includes("Screen Flash Action")) return "screenFlash";
    if (section.includes("Run Macro Action")) return "runMacro";
    if (section.includes("Image Display Action")) return "imageDisplay";
    if (section.includes("Animation Action")) return "animation";
    if (section.includes("Fade Out Action")) return "fadeOut";
    if (section.includes("Fade In Action")) return "fadeIn";
    if (section.includes("Hide UI Action")) return "hideUI";
    if (section.includes("Show UI Action")) return "showUI";
    if (section.includes("Door State Action")) return "doorState";
    if (section.includes("Stop Recording Action")) return "stopRecording";
    return "dummy"; // Default to "dummy" if no match is found
  }

  function reconstructActions(parsedActions) {
    parsedActions.forEach((action, index) => {
      const actionId = `action-${cutsceneActions.length + index}`;
      cutsceneActions.push({
        id: actionId,
        type: action.type,
        params: action.params,
        description: action.description
      });
    });
    updateActionList();
  }  

  function importScript(script) {
    const parsedActions = parseScript(script);
    reconstructActions(parsedActions);
  }  

  function parseParamsFromScript(section, type) {
    const params = {};

    const getMatch = (regex, defaultValue = null) => {
      const match = section.match(regex);
      return match ? match[1] : defaultValue;
    };


    switch (type) {
      case "camera":
        params.x = parseFloat(getMatch(/x: (\d+\.?\d*)/, 0));
        params.y = parseFloat(getMatch(/y: (\d+\.?\d*)/, 0));
        params.scale = parseFloat(getMatch(/scale: (\d+\.?\d*)/, 1));
        params.duration = parseInt(getMatch(/duration: (\d+)/, 1000));
        break;
      case "wait":
        params.duration = parseInt(getMatch(/setTimeout\(resolve, (\d+)\)/, 1000));
        break;
      case "switchScene":
        params.sceneId = getMatch(/get\("(.+?)"\)/, "");
        break;
      case "tokenMovement":
        params.id = getMatch(/get\("(.+?)"\)/, "");
        params.x = parseFloat(getMatch(/x: (\d+\.?\d*)/, 0));
        params.y = parseFloat(getMatch(/y: (\d+\.?\d*)/, 0));
        params.rotation = parseFloat(getMatch(/rotation: (\d+\.?\d*)/, 0));
        params.teleport = section.includes("Token Teleport Action");
        params.animatePan = section.includes("animatePan");
        params.waitForCompletion = section.includes("await new Promise(resolve => setTimeout(resolve");
        break;
      case "showHideToken":
        params.tokenId = getMatch(/canvas\.tokens\.get\("(.+?)"\)/, "");
        params.async = getMatch(/async: (true|false)/, "false") === "true";
        break;
      case "tileMovement":
        params.tileId = getMatch(/get\("(.+?)"\)/, "");
        params.x = parseFloat(getMatch(/x: (\d+\.?\d*)/, 0));
        params.y = parseFloat(getMatch(/y: (\d+\.?\d*)/, 0));
        params.rotation = parseFloat(getMatch(/rotation: (\d+\.?\d*)/, 0));
        params.animatePan = section.includes("animateTilePan");
        break;
      case "doorState":
        params.wallId = getMatch(/get\("(.+?)"\)/, "");
        params.doorState = getMatch(/ds: (0|1|2)/, "0");
        break;
      case "screenShake":
        params.duration = parseInt(getMatch(/duration: (\d+)/, 1000));
        params.speed = parseInt(getMatch(/speed: (\d+)/, 10));
        params.intensity = parseInt(getMatch(/intensity: (\d+)/, 5));
        break;
      case "screenFlash":
        params.color = getMatch(/backgroundColor = "(.+?)"/, "#FFFFFF");
        params.opacity = parseFloat(getMatch(/opacity = (\d+\.?\d*)/, 0.5));
        params.duration = parseInt(getMatch(/duration = (\d+)/, 1000));
        break;
      case "runMacro":
        params.macroName = getMatch(/find\(m => m\.name === "(.+?)"\)/, "");
        break;
      case "imageDisplay":
        params.imageUrl = getMatch(/new ImagePopout\("(.+?)"/, "");
        break;
      case "animation":
        params.animationUrl = getMatch(/file\("(.+?)"\)/, "");
        params.scale = parseFloat(getMatch(/scale\((\d+\.?\d*)\)/, 1));
        params.rotation = parseInt(getMatch(/rotate\((\d+\.?\d*)\)/, 0));
        params.duration = parseInt(getMatch(/duration\((\d+)\)/, 1000));
        params.sourceTokenId = getMatch(/attachTo\(canvas\.tokens\.get\("(.+?)"\)\)/, null);
        params.targetTokenId = getMatch(/stretchTo\(canvas\.tokens\.get\("(.+?)"\)\)/, null);
        break;
      case "fadeOut":
      case "fadeIn":
        params.fadeDuration = parseInt(getMatch(/duration: (\d+)/, 2000));
        break;
      case "hideUI":
        params.duration = parseInt(getMatch(/duration: (\d+)/, 500));
        break;
      case "showUI":
        params.duration = parseInt(getMatch(/duration: (\d+)/, 500));
        break;
      case "playAudio":
        params.audioFilePath = getMatch(/src: "(.+?)"/, "");
        break;
      case "tokenSay":
        params.tokenId = getMatch(/canvas\.tokens\.get\("(.+?)"\)/, "");
        params.message = getMatch(/content: "(.+?)"/, "");
        break;
      case "stopRecording":
        break;
      // Add more cases as needed
      default:
        break;
    }

    return params;
  }

  function generateDescription(type, section) {
    const getMatch = (regex, defaultValue = "") => {
      const match = section.match(regex);
      return match ? match[1] : defaultValue;
    };

    switch (type) {
      case "camera":
        const camX = getMatch(/x: (\d+\.?\d*)/, 0);
        const camY = getMatch(/y: (\d+\.?\d*)/, 0);
        const camScale = getMatch(/scale: (\d+\.?\d*)/, 1);
        const camDuration = getMatch(/duration: (\d+)/, 1000);
        return `Camera Position (X: ${camX}, Y: ${camY}, Zoom: ${camScale}, Duration: ${camDuration}ms)`;
      case "wait":
        const waitDuration = getMatch(/setTimeout\(resolve, (\d+)\)/, 1000);
        return `Wait for ${waitDuration} ms`;
      case "switchScene":
        const sceneId = getMatch(/get\("(.+?)"\)/, "");
        return `Switch Scene to (ID: ${sceneId})`;
      case "tokenMovement":
        const tokenId = getMatch(/get\("(.+?)"\)/, "");
        const tokenX = getMatch(/x: (\d+\.?\d*)/, 0);
        const tokenY = getMatch(/y: (\d+\.?\d*)/, 0);
        const tokenRotation = getMatch(/rotation: (\d+\.?\d*)/, 0);
        return section.includes("Token Teleport Action")
          ? `Token Teleport (X: ${tokenX}, Y: ${tokenY}, Rotation: ${tokenRotation}°)`
          : `Token Movement (X: ${tokenX}, Y: ${tokenY}, Rotation: ${tokenRotation}°, Pan: ${section.includes("animatePan") ? 'Yes' : 'No'})`;
      case "showHideToken":
        const tokenIdSingle = getMatch(/canvas\.tokens\.get\("(.+?)"\)/, "");
        const asyncSingle = getMatch(/async: (true|false)/, "false");
        return `Show/Hide Token (ID: ${tokenIdSingle}, Async: ${asyncSingle === "true" ? "Yes" : "No"})`;
      case "tileMovement":
        const tileId = getMatch(/tileId: "(.+?)"/, "");
        const tileX = getMatch(/x: (\d+\.?\d*)/, 0);
        const tileY = getMatch(/y: (\d+\.?\d*)/, 0);
        const tileRotation = getMatch(/rotation: (\d+\.?\d*)/, 0);
        const tilePan = getMatch(/animatePan: (true|false)/, "false");
        return `Tile Movement (X: ${tileX}, Y: ${tileY}, Rotation: ${tileRotation}°, Pan: ${tilePan === "true" ? 'Yes' : 'No'})`;
      case "doorState":
        const doorState = getMatch(/ds: (0|1|2)/, "0");
        const doorStateText = doorState === "1" ? "Open" : doorState === "2" ? "Locked" : "Closed";
        return `Door State (State: ${doorStateText})`;
      case "screenShake":
        const shakeDuration = getMatch(/duration: (\d+)/, 1000);
        const shakeSpeed = getMatch(/speed: (\d+)/, 10);
        const shakeIntensity = getMatch(/intensity: (\d+)/, 5);
        return `Screen Shake (Duration: ${shakeDuration}ms, Speed: ${shakeSpeed}, Intensity: ${shakeIntensity}px)`;
      case "screenFlash":
        const flashColor = getMatch(/backgroundColor = "(.+?)"/, "#FFFFFF");
        const flashOpacity = getMatch(/opacity = (\d+\.?\d*)/, 0.5);
        const flashDuration = getMatch(/duration = (\d+)/, 1000);
        return `Screen Flash (Color: ${flashColor}, Opacity: ${flashOpacity}, Duration: ${flashDuration}ms)`;
      case "runMacro":
        const macroName = getMatch(/find\(m => m\.name === "(.+?)"\)/, "");
        return `Run Macro: ${macroName}`;
      case "imageDisplay":
        const imageUrl = getMatch(/new ImagePopout\("(.+?)"/, "");
        return `Display Image: ${imageUrl}`;
      case "animation":
        const animationUrl = getMatch(/file\("(.+?)"\)/, "");
        const animationScale = getMatch(/scale\((\d+\.?\d*)\)/, 1);
        const animationRotation = getMatch(/rotate\((\d+\.?\d*)\)/, 0);
        const animationDuration = getMatch(/duration\((\d+)\)/, 1000);
        return `Play Animation (URL: ${animationUrl}, Scale: ${animationScale}, Rotation: ${animationRotation}, Duration: ${animationDuration}ms)`;
      case "fadeOut":
        const fadeOutDuration = getMatch(/duration: (\d+)/, 2000);
        return `Fade Out (Duration: ${fadeOutDuration}ms)`;
      case "fadeIn":
        const fadeInDuration = getMatch(/duration: (\d+)/, 2000);
        return `Fade In (Duration: ${fadeInDuration}ms)`;
      case "hideUI":
        const hideUIDuration = getMatch(/duration: (\d+)/, 500);
        return `Hide UI (Duration: ${hideUIDuration}ms)`;
      case "showUI":
        const showUIDuration = getMatch(/duration: (\d+)/, 500);
        return `Show UI (Duration: ${showUIDuration}ms)`;
      case "playAudio":
        const audioFilePath = getMatch(/src: "(.+?)"/, "");
        return `Play Audio: ${audioFilePath}`;
      case "tokenSay":
        const tokenMessage = getMatch(/content: "(.+?)"/, "");
        return `Token says: ${tokenMessage}`;
      case "stopRecording":
        return "Stop Recording";
      // Add more cases as needed
      default:
        return "Unregistered Action"; // Default to a generic description
    }
  }

  function exportCutsceneScript() {
    const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");
    new Dialog({
      title: "Export Script",
      content: `
        <textarea id="cutsceneScript" style="width:100%; height:300px;">${scriptContent}</textarea>
      `,
      buttons: {
        copy: {
          label: "Copy to Clipboard",
          callback: html => {
            const copyText = document.getElementById("cutsceneScript");
            copyText.select();
            document.execCommand("copy");
            ui.notifications.info("Script copied to clipboard.");
          }
        },
        back: {
          label: "Back",
          callback: () => {
            openCutsceneMakerWindow();
          }
        },
        close: {
          label: "Close",
          callback: () => {
            closeAllDialogs();
          }
        }
      },
      default: "close",
      render: html => {
        setTimeout(() => {
        }, 0);
      }
    }).render(true);
  }
  function addStopRecordingAction(existingAction = null) {
    console.log("Add Stop Recording Action");
    const actionId = generateUniqueId();
    const description = "Stop Recording";
    const params = {}; // No additional parameters needed
  
    if (existingAction) {
      updateAction(existingAction.id, params, description);
    } else {
      cutsceneActions.push({ id: actionId, description, type: "stopRecording", params });
    }
    updateActionList();
  }
  
  function addCameraPositionAction(existingAction = null, copiedParams = null) {
    console.log("Add Camera Position Action");
    const action = existingAction || {};
    let currentX, currentY, currentZoom;

    const updateCurrentPosition = () => {
      const viewPosition = canvas.scene._viewPosition;
      currentX = viewPosition.x;
      currentY = viewPosition.y;
      currentZoom = viewPosition.scale;
    };

    if (copiedParams) {
      currentX = copiedParams.x;
      currentY = copiedParams.y;
      currentZoom = copiedParams.scale;
    } else if (!action.params) {
      updateCurrentPosition();
    } else {
      currentX = action.params.x;
      currentY = action.params.y;
      currentZoom = action.params.scale;
    }

    const dialog = new Dialog({
      title: "Camera Position Action",
      content: `
        <form>
          <div class="form-group">
            <label for="cameraX">Camera X:</label>
            <input type="number" id="cameraX" name="cameraX" value="${currentX}" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="cameraY">Camera Y:</label>
            <input type="number" id="cameraY" name="cameraY" value="${currentY}" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="cameraZoom">Zoom Level:</label>
            <input type="number" id="cameraZoom" name="cameraZoom" value="${currentZoom}" step="0.1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="panDuration">Pan Duration (in milliseconds):</label>
            <input type="number" id="panDuration" name="panDuration" value="${action.params ? action.params.duration : 1000}" step="100" style="width: 100%;">
          </div>
        </form>
        <p>Specify the camera position and zoom level, or copy the current screen position.</p>
      `,
      buttons: {
        copy: {
          icon: '<i class="fas fa-copy"></i>',
          label: "Copy Current Screen Position",
          callback: html => {
            updateCurrentPosition();
            dialog.close();
            addCameraPositionAction(existingAction, { x: currentX, y: currentY, scale: currentZoom });
          }
        },
        ok: {
          label: "OK",
          callback: html => {
            const x = parseFloat(html.find("#cameraX").val());
            const y = parseFloat(html.find("#cameraY").val());
            const scale = parseFloat(html.find("#cameraZoom").val());
            const duration = parseInt(html.find("#panDuration").val());
            const params = { x, y, scale, duration };
            if (existingAction) {
              updateAction(existingAction.id, params, `Camera Position (X: ${x}, Y: ${y}, Zoom: ${scale}, Duration: ${duration}ms)`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Camera Position (X: ${x}, Y: ${y}, Zoom: ${scale}, Duration: ${duration}ms)`, type: "camera", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Camera Position Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addSwitchSceneAction(existingAction = null) {
    console.log("Add Switch Scene Action");
    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Switch Scene",
      content: `
        <form>
          <div class="form-group">
            <label for="sceneId">Scene ID:</label>
            <input type="text" id="sceneId" name="sceneId" value="${action.params ? action.params.sceneId : ''}" placeholder="Enter the scene ID here" style="width: 100%;">
          </div>
        </form>
        <p>Enter the ID of the scene you wish to switch to.</p>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const sceneId = html.find("#sceneId").val();
            const scene = game.scenes.get(sceneId);
            const sceneName = scene ? scene.name : "Unknown Scene";
            const params = { sceneId };
            if (existingAction) {
              updateAction(existingAction.id, params, `Switch Scene to ${sceneName} (ID: ${sceneId})`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Switch Scene to ${sceneName} (ID: ${sceneId})`, type: "switchScene", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Switch Scene Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addTokenMovementAction(existingAction = null) {
    console.log("Add Token Movement Action");
    const action = existingAction || {};
    const selectedTokenId = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0].id : (action.params ? action.params.id : "");
    const waitForCompletionChecked = action.params && typeof action.params.waitForCompletion !== 'undefined' ? action.params.waitForCompletion : true; // Default to true if not specified
    
    const dialog = new Dialog({
      title: "Token Movement",
      content: `
        <form>
          <div class="form-group">
            <label for="tokenId">Token ID:</label>
            <input type="text" id="tokenId" name="tokenId" value="${selectedTokenId}" style="width: 100%;">
          </div>
          <button type="button" id="getSelectedToken" style="width: 100%;">Get currently selected token</button>
          <div class="form-group">
            <label for="animatePan">Enable Screen Panning:</label>
            <input type="checkbox" id="animatePan" name="animatePan" value="1" ${action.params && action.params.animatePan ? 'checked' : ''} style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Camera Panning.</p>
          </div>
          <div class="form-group">
            <label for="teleport">Teleport:</label>
            <input type="checkbox" id="teleport" name="teleport" ${action.params && action.params.teleport ? 'checked' : ''} style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Instantly move to the new position without animation.</p>
          </div>
          <div class="form-group">
            <label for="tokenRotation">Token Rotation (in degrees):</label>
            <input type="number" id="tokenRotation" name="tokenRotation" value="${action.params ? action.params.rotation : 0}" step="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="waitForCompletion">Wait for Completion:</label>
            <input type="checkbox" id="waitForCompletion" name="waitForCompletion" ${waitForCompletionChecked ? 'checked' : ''} style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Wait for movement to complete before proceeding.</p>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const tokenId = html.find("#tokenId").val();
            const newPosition = { x: canvas.tokens.get(tokenId)?.x || 0, y: canvas.tokens.get(tokenId)?.y || 0 };
            const newRotation = parseFloat(html.find("#tokenRotation").val());
            const animatePan = html.find("#animatePan")[0].checked;
            const teleport = html.find("#teleport")[0].checked;
            const waitForCompletion = html.find("#waitForCompletion")[0].checked;
            const params = { id: tokenId, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan, teleport, waitForCompletion };
            const description = teleport
              ? `Token Teleport (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°)`
              : `Token Movement (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°, Pan: ${params.animatePan ? 'Yes' : 'No'})`;
  
            if (existingAction) {
              updateAction(existingAction.id, params, description);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description, type: "tokenMovement", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Token Movement Action");
        html.find("#getSelectedToken").click(() => {
          if (canvas.tokens.controlled.length === 1) {
            html.find("#tokenId").val(canvas.tokens.controlled[0].id);
          } else {
            ui.notifications.warn("Please select exactly one token.");
          }
        });
      }
    });
  
    dialog.render(true);
  }
  function addTokenSayAction(existingAction = null) {
    console.log("Add Token Say Action");
    const action = existingAction || {};
    const selectedTokenId = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0].id : (action.params ? action.params.tokenId : "");
  
    const dialog = new Dialog({
      title: "Token Say",
      content: `
        <form>
          <div class="form-group">
            <label for="tokenId">Token ID:</label>
            <input type="text" id="tokenId" name="tokenId" value="${selectedTokenId}" style="width: 100%;">
          </div>
          <button type="button" id="getSelectedToken" style="width: 100%;">Get currently selected token</button>
          <div class="form-group">
            <label for="tokenMessage">Message:</label>
            <textarea id="tokenMessage" name="tokenMessage" style="width: 100%;" rows="4">${action.params ? action.params.message : ''}</textarea>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const tokenId = html.find("#tokenId").val();
            const message = html.find("#tokenMessage").val();
            const params = { tokenId, message };
            const description = `Token ${tokenId} says: ${message}`;
    
            if (existingAction) {
              updateAction(existingAction.id, params, description);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description, type: "tokenSay", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Token Say Action");
        html.find("#getSelectedToken").click(() => {
          if (canvas.tokens.controlled.length === 1) {
            html.find("#tokenId").val(canvas.tokens.controlled[0].id);
          } else {
            ui.notifications.warn("Please select exactly one token.");
          }
        });
      }
    });
  
    dialog.render(true);
  }
  function addPlayAudioAction(existingAction = null) {
    console.log("Add Play Audio Action");
    const action = existingAction || {};
  
    const dialog = new Dialog({
      title: "Play Audio",
      content: `
        <form>
          <div class="form-group">
            <label for="audioFile">Audio File:</label>
            <input type="text" id="audioFilePath" name="audioFilePath" placeholder="filename" style="width: 100%;">
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const audioFilePath = html.find("#audioFilePath").val();
            if (audioFilePath) {
              const params = { audioFilePath };
              if (existingAction) {
                updateAction(existingAction.id, params, `Play Audio: ${audioFilePath}`);
              } else {
                const actionId = generateUniqueId();
                cutsceneActions.push({ id: actionId, description: `Play Audio: ${audioFilePath}`, type: "playAudio", params });
              }
              updateActionList();
            }
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Play Audio Action");
  
        html.find("#browseAudioFile").click(async () => {
          const audioFilePath = await FilePicker.browse("data");
          if (audioFilePath.target) {
            html.find("#audioFilePath").val(audioFilePath.target);
          }
        });
      }
    });
  
    dialog.render(true);
  }
  function addDoorStateAction(existingAction = null) {
    console.log("Add Door State Action");
    const action = existingAction || {};
    const selectedWallId = canvas.walls.controlled.length === 1 ? canvas.walls.controlled[0].id : (action.params ? action.params.wallId : "");
    const doorState = action.params && typeof action.params.doorState !== 'undefined' ? action.params.doorState : "0";
  
    const dialog = new Dialog({
      title: "Door State Action",
      content: `
        <form>
          <div class="form-group">
            <label for="wallId">Wall ID:</label>
            <input type="text" id="wallId" name="wallId" value="${selectedWallId}" style="width: 100%;">
          </div>
          <button type="button" id="getSelectedWall" style="width: 100%;">Get currently selected wall</button>
          <div class="form-group">
            <label for="doorState">Door State:</label>
            <select id="doorState" name="doorState" style="width: 100%;">
              <option value="0" ${doorState === "0" ? "selected" : ""}>Closed</option>
              <option value="1" ${doorState === "1" ? "selected" : ""}>Open</option>
              <option value="2" ${doorState === "2" ? "selected" : ""}>Locked</option>
            </select>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const wallId = html.find("#wallId").val();
            const doorState = html.find("#doorState").val();
            const params = { wallId, doorState };
            const description = `Door State (State: ${doorState === "1" ? "Open" : doorState === "2" ? "Locked" : "Closed"})`;
  
            if (existingAction) {
              updateAction(existingAction.id, params, description);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description, type: "doorState", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Door State Action");
        html.find("#getSelectedWall").click(() => {
          if (canvas.walls.controlled.length === 1) {
            const wall = canvas.walls.controlled[0];
            html.find("#wallId").val(wall.id);
          } else {
            ui.notifications.warn("Please select exactly one wall.");
          }
        });
      }
    });
  
    dialog.render(true);
  }
  
  function addWaitAction(existingAction = null) {
    console.log("Add Wait Action");
    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Wait Duration",
      content: `
        <form>
          <div class="form-group">
            <label for="waitDuration">Enter wait duration in milliseconds:</label>
            <input type="number" id="waitDuration" name="waitDuration" min="0" step="100" value="${action.params ? action.params.duration : 1000}" style="width: 100%;">
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const duration = html.find("#waitDuration").val();
            const params = { duration };
            if (existingAction) {
              updateAction(existingAction.id, params, `Wait for ${duration} ms`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Wait for ${duration} ms`, type: "wait", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Wait Duration");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addTileMovementAction(existingAction = null) {
    console.log("Add Tile Movement Action");
    const action = existingAction || {};
    const selectedTile = canvas.tiles.controlled.length === 1 ? canvas.tiles.controlled[0] : null;
    const selectedTileId = selectedTile ? selectedTile.id : (action.params ? action.params.tileId : "");
    const selectedTileX = selectedTile ? selectedTile.x : (action.params ? action.params.x : 0);
    const selectedTileY = selectedTile ? selectedTile.y : (action.params ? action.params.y : 0);
  
    const dialog = new Dialog({
      title: "Tile Movement",
      content: `
        <form>
          <div class="form-group">
            <label for="tileId">Tile ID:</label>
            <input type="text" id="tileId" name="tileId" value="${selectedTileId}" style="width: 100%;">
          </div>
          <button type="button" id="getSelectedTile" style="width: 100%;">Get currently selected tile</button>
          <div class="form-group">
            <label for="tileX">Tile X:</label>
            <input type="number" id="tileX" name="tileX" value="${selectedTileX}" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="tileY">Tile Y:</label>
            <input type="number" id="tileY" name="tileY" value="${selectedTileY}" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="tileRotation">Tile Rotation (in degrees):</label>
            <input type="number" id="tileRotation" name="tileRotation" value="${action.params ? action.params.rotation : 0}" step="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="animateTilePan">Enable Screen Panning:</label>
            <input type="checkbox" id="animateTilePan" name="animateTilePan" value="1" ${action.params && action.params.animatePan ? 'checked' : ''} style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Camera Panning.</p>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const tileId = html.find("#tileId").val();
            const newPosition = { x: parseFloat(html.find("#tileX").val()), y: parseFloat(html.find("#tileY").val()) };
            const newRotation = parseFloat(html.find("#tileRotation").val());
            const animatePan = html.find("#animateTilePan")[0].checked;
            const params = { tileId, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan };
            const description = `Tile Movement (X: ${newPosition.x}, Y: ${newPosition.y}, Rotation: ${newRotation}°, Pan: ${animatePan ? 'Yes' : 'No'})`;
  
            if (existingAction) {
              updateAction(existingAction.id, params, description);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description, type: "tileMovement", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Tile Movement Action");
        html.find("#getSelectedTile").click(() => {
          if (canvas.tiles.controlled.length === 1) {
            const tile = canvas.tiles.controlled[0];
            html.find("#tileId").val(tile.id);
            html.find("#tileX").val(tile.x);
            html.find("#tileY").val(tile.y);
          } else {
            ui.notifications.warn("Please select exactly one tile.");
          }
        });
      }
    });
  
    dialog.render(true);
  }
  
  function dummyAction(existingAction = null) {
    console.log("Add Dummy Action");
    const action = existingAction || {};
    const params = {}; // No parameters for the dummy action
    const description = "Dummy Action";

    if (existingAction) {
      updateAction(existingAction.id, params, description);
    } else {
      const actionId = generateUniqueId();
      cutsceneActions.push({ id: actionId, description, type: "dummy", params });
    }
    updateActionList();
  }

  function addScreenFlashAction(existingAction = null) {
    console.log("Add Screen Flash Action");
    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Add Screen Flash Effect",
      content: `
        <form>
          <div class="form-group">
            <label for="flashColor">Flash Color (hex):</label>
            <input type="text" id="flashColor" name="flashColor" value="${action.params ? action.params.color : '#FFFFFF'}" placeholder="#FFFFFF" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="flashOpacity">Opacity (0.0 - 1.0):</label>
            <input type="number" id="flashOpacity" name="flashOpacity" step="0.1" min="0.0" max="1.0" value="${action.params ? action.params.opacity : 0.5}" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="flashDuration">Duration (milliseconds):</label>
            <input type="number" id="flashDuration" name="flashDuration" step="100" min="100" value="${action.params ? action.params.duration : 1000}" style="width: 100%;">
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const color = html.find("#flashColor").val();
            const opacity = parseFloat(html.find("#flashOpacity").val());
            const duration = parseInt(html.find("#flashDuration").val());
            const params = { color, opacity, duration };
            if (existingAction) {
              updateAction(existingAction.id, params, `Screen Flash (Color: ${color}, Opacity: ${opacity}, Duration: ${duration}ms)`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Screen Flash (Color: ${color}, Opacity: ${opacity}, Duration: ${duration}ms)`, type: "screenFlash", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Screen Flash Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addScreenShakeAction(existingAction = null) {
    console.log("Add Screen Shake Action");
    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Add Screen Shake Effect",
      content: `
        <form>
          <div class="form-group">
            <label for="shakeDuration">Duration (milliseconds):</label>
            <input type="number" id="shakeDuration" name="shakeDuration" value="${action.params ? action.params.duration : 1000}" step="100" min="100" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="shakeSpeed">Speed (frequency of shakes):</label>
            <input type="number" id="shakeSpeed" name="shakeSpeed" value="${action.params ? action.params.speed : 10}" step="1" min="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="shakeIntensity">Intensity (pixel displacement):</label>
            <input type="number" id="shakeIntensity" name="shakeIntensity" value="${action.params ? action.params.intensity : 5}" step="1" min="1" style="width: 100%;">
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const duration = parseInt(html.find("#shakeDuration").val());
            const speed = parseInt(html.find("#shakeSpeed").val());
            const intensity = parseInt(html.find("#shakeIntensity").val());
            const params = { duration, speed, intensity };
            if (existingAction) {
              updateAction(existingAction.id, params, `Screen Shake (Duration: ${duration}ms, Speed: ${speed}, Intensity: ${intensity}px)`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Screen Shake (Duration: ${duration}ms, Speed: ${speed}, Intensity: ${intensity}px)`, type: "screenShake", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Add Screen Shake Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addRunMacroAction(existingAction = null) {
    console.log("Add Run Macro Action");
    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Run Macro Action",
      content: `
        <form>
          <div class="form-group">
            <label for="macroName">Macro Name:</label>
            <input type="text" id="macroName" name="macroName" value="${action.params ? action.params.macroName : ''}" placeholder="Enter macro name here" style="width: 100%;">
          </div>
        </form>
        <p>Enter the name of the macro you wish to run.</p>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const macroName = html.find("#macroName").val();
            const params = { macroName };
            if (existingAction) {
              updateAction(existingAction.id, params, `Run Macro: ${macroName}`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Run Macro: ${macroName}`, type: "runMacro", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Run Macro Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addImageDisplayAction(existingAction = null) {
    console.log("Add Image Display Action");
    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Add Image Display Action",
      content: `
        <form>
          <div class="form-group">
            <label for="imageUrl">Image URL:</label>
            <input type="text" id="imageUrl" name="imageUrl" value="${action.params ? action.params.imageUrl : ''}" placeholder="http://example.com/image.png" style="width: 100%;">
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const imageUrl = html.find("#imageUrl").val();
            const params = { imageUrl };
            if (existingAction) {
              updateAction(existingAction.id, params, `Display Image: ${imageUrl}`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Display Image: ${imageUrl}`, type: "imageDisplay", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Image Display Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addAnimationAction(existingAction = null) {
    console.log("Add Animation Action");
    if (canvas.tokens.controlled.length === 0) {
      ui.notifications.warn("Please select a token.");
      return;
    }
    const sourceToken = canvas.tokens.controlled[0];
    let targetedTokens = Array.from(game.user.targets);
    let targetToken = targetedTokens.length > 0 ? targetedTokens[0] : null;

    const action = existingAction || {};
    const dialog = new Dialog({
      title: "Add Animation",
      content: `
        <form>
          <div class="form-group">
            <label for="animationUrl">Animation URL:</label>
            <input type="text" id="animationUrl" name="animationUrl" value="${action.params ? action.params.animationUrl : ''}" placeholder="https://example.com/animation.webm" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="scale">Scale:</label>
            <input type="number" id="scale" name="scale" value="${action.params ? action.params.scale : 1}" step="0.1" min="0.1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="rotation">Rotation (degrees):</label>
            <input type="number" id="rotation" name="rotation" value="${action.params ? action.params.rotation : 0}" step="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="duration">Duration (ms):</label>
            <input type="number" id="duration" name="duration" value="${action.params ? action.params.duration : 1000}" step="100" min="100" style="width: 100%;">
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const animationUrl = html.find("#animationUrl").val();
            const scale = parseFloat(html.find("#scale").val());
            const rotation = parseInt(html.find("#rotation").val());
            const duration = parseInt(html.find("#duration").val());
            let sequencerScript = `
              // Animation Action
              // This script plays an animation from the specified URL. It either attaches the animation to a target token
              // or stretches the animation from the selected token to a target token, depending on the presence of a target token.
              new Sequence()`;

            if (targetToken) {
              sequencerScript += `
                // Stretch the animation from the selected token to the target token.
                .effect()
                .file("${animationUrl}") // URL of the animation file
                .attachTo(canvas.tokens.get("${sourceToken.id}")) // Attach the animation to the selected token
                .stretchTo(canvas.tokens.get("${targetToken.id}")) // Stretch the animation to the target token
                .scale(${scale}) // Scale of the animation
                .rotate(${rotation}) // Rotation of the animation in degrees
                .duration(${duration}) // Duration of the animation in milliseconds
                .play();`;
            } else {
              sequencerScript += `
                // Play the animation at the location of the selected token.
                .effect()
                .file("${animationUrl}") // URL of the animation file
                .atLocation(canvas.tokens.get("${sourceToken.id}")) // Play the animation at the selected token's location
                .scale(${scale}) // Scale of the animation
                .rotate(${rotation}) // Rotation of the animation in degrees
                .duration(${duration}) // Duration of the animation in milliseconds
                .play();`;
            }

            const params = { animationUrl, scale, rotation, duration, sourceTokenId: sourceToken.id, targetTokenId: targetToken ? targetToken.id : null };
            if (existingAction) {
              updateAction(existingAction.id, params, `Play Animation (URL: ${animationUrl}, Scale: ${scale}, Rotation: ${rotation}, Duration: ${duration}ms)`);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description: `Play Animation (URL: ${animationUrl}, Scale: ${scale}, Rotation: ${rotation}, Duration: ${duration}ms)`, type: "animation", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Add Animation Action");
        setTimeout(() => {
        }, 0);
      }
    });

    dialog.render(true);
  }

  function addFadeOutAction(existingAction = null) {
    console.log("Add Fade Out Action");
    const actionId = generateUniqueId();
    const description = "Fade Out";
    const params = { fadeDuration: 2000 };

    if (existingAction) {
      updateAction(existingAction.id, params, description);
    } else {
      cutsceneActions.push({ id: actionId, description, type: "fadeOut", params });
    }
    updateActionList();
  }

  function addFadeInAction(existingAction = null) {
    console.log("Add Fade In Action");
    const actionId = generateUniqueId();
    const description = "Fade In";
    const params = { fadeDuration: 2000 };

    if (existingAction) {
      updateAction(existingAction.id, params, description);
    } else {
      cutsceneActions.push({ id: actionId, description, type: "fadeIn", params });
    }
    updateActionList();
  }

  function addHideUIAction(existingAction = null) {
    console.log("Add Hide UI Action");
    const actionId = generateUniqueId();
    const description = "Hide UI";
    const params = { duration: 500 };

    if (existingAction) {
      updateAction(existingAction.id, params, description);
    } else {
      cutsceneActions.push({ id: actionId, description, type: "hideUI", params });
    }
    updateActionList();
  }

  function addShowUIAction(existingAction = null) {
    console.log("Add Show UI Action");
    const actionId = generateUniqueId();
    const description = "Show UI";
    const params = { duration: 500 };

    if (existingAction) {
      updateAction(existingAction.id, params, description);
    } else {
      cutsceneActions.push({ id: actionId, description, type: "showUI", params });
    }
    updateActionList();
  }

  function showHideAction(existingAction = null) {
    console.log("Add Show/Hide Token Action");
    const action = existingAction || {};
    const selectedTokenId = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0].id : (action.params ? action.params.tokenId : "");
    const isAsync = action.params && typeof action.params.async !== 'undefined' ? action.params.async : false;
  
    const dialog = new Dialog({
      title: "Show/Hide Token Action",
      content: `
        <form>
          <div class="form-group">
            <label for="tokenId">Token ID:</label>
            <input type="text" id="tokenId" name="tokenId" value="${selectedTokenId}" style="width: 100%;">
          </div>
          <button type="button" id="getSelectedToken" style="width: 100%;">Get currently selected token</button>
          <div class="form-group">
            <label for="asyncAction">Asynchronous:</label>
            <input type="checkbox" id="asyncAction" name="asyncAction" ${isAsync ? 'checked' : ''} style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">If checked, the action will run asynchronously.</p>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: html => {
            const tokenId = html.find("#tokenId").val();
            const asyncAction = html.find("#asyncAction")[0].checked;
            const params = { tokenId, async: asyncAction };
            const description = `Show/Hide Token (ID: ${tokenId}, Async: ${asyncAction ? 'Yes' : 'No'})`;
  
            if (existingAction) {
              updateAction(existingAction.id, params, description);
            } else {
              const actionId = generateUniqueId();
              cutsceneActions.push({ id: actionId, description, type: "showHideToken", params });
            }
            updateActionList();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "ok",
      render: html => {
        console.log("Dialog rendered: Show/Hide Token Action");
        html.find("#getSelectedToken").click(() => {
          if (canvas.tokens.controlled.length === 1) {
            html.find("#tokenId").val(canvas.tokens.controlled[0].id);
          } else {
            ui.notifications.warn("Please select exactly one token.");
          }
        });
      }
    });
  
    dialog.render(true);
  }

  function updateActionList() {
    const actionList = $("#actionList");
    actionList.empty();
    cutsceneActions.forEach(action => {
      actionList.append(`
        <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 4px;">
          <span class="drag-handle" style="cursor: move; margin-right: 10px;">&#9776;</span>
          <span class="action-description" style="flex-grow: 1; max-width: 200px; overflow: overlay;">${action.description}</span>
          <span style="display: flex; gap: 5px;">
            <button class="edit-button" data-id="${action.id}" style="min-width: 60px; max-width: 60px;">Edit</button>
            <button class="remove-button" data-id="${action.id}" style="min-width: 60px; max-width: 60px;">Remove</button>
          </span>
        </li>
      `);
    });
  
    $(".edit-button").click(function() {
      const actionId = $(this).data("id");
      const action = cutsceneActions.find(action => action.id === actionId);
      if (action) {
        switch (action.type) {
          case "camera":
            addCameraPositionAction(action);
            break;
          case "switchScene":
            addSwitchSceneAction(action);
            break;
          case "tokenMovement":
            addTokenMovementAction(action);
            break;
          case "showHideToken":
            showHideAction(action);
            break;
          case "tileMovement":
            addTileMovementAction(action);
            break;
          case "wait":
            addWaitAction(action);
            break;
          case "screenShake":
            addScreenShakeAction(action);
            break;
          case "screenFlash":
            addScreenFlashAction(action);
            break;
          case "runMacro":
            addRunMacroAction(action);
            break;
          case "imageDisplay":
            addImageDisplayAction(action);
            break;
          case "animation":
            addAnimationAction(action);
            break;
          case "fadeOut":
            addFadeOutAction(action);
            break;
          case "fadeIn":
            addFadeInAction(action);
            break;
          case "hideUI":
            addHideUIAction(action);
            break;
          case "showUI":
            addShowUIAction(action);
            break;
          case "doorState":
            addDoorStateAction(action);
            break;
          case "playAudio":
            addPlayAudioAction(action);
            break;
          case "tokenSay":
            addTokenSayAction(action);
            break;
          default:
            break;
        }
      }
    });
  
    $(".remove-button").click(function() {
      const actionId = $(this).data("id");
      removeAction(actionId);
    });
  
    if (!actionList.data('ui-sortable')) {
      actionList.sortable({
        handle: '.drag-handle',
        update: function(event, ui) {
          const newOrder = $(this).sortable("toArray");
          const reorderedActions = newOrder.map(id => cutsceneActions.find(action => action.id === id));
          cutsceneActions = reorderedActions;
        }
      });
    }
    actionList.disableSelection();
  }
  

  function removeAction(actionId) {
    cutsceneActions = cutsceneActions.filter(action => action.id !== actionId);
    updateActionList();
  }

  function updateAction(actionId, params, description) {
    const actionIndex = cutsceneActions.findIndex(action => action.id === actionId);
    if (actionIndex !== -1) {
      cutsceneActions[actionIndex].params = params;
      cutsceneActions[actionIndex].description = description;
      updateActionList();
    }
  }

  function closeAllDialogs() {
    Object.values(ui.windows).forEach(dialog => dialog.close());
  }

  function generateScript(type, params) {
    switch (type) {
      case "camera":
        return `
          // Camera Position Action
          (async function() {
            try {
              const targetPosition = {
                x: ${params.x},
                y: ${params.y},
                scale: ${params.scale}
              };
              await canvas.animatePan({
                x: targetPosition.x,
                y: targetPosition.y,
                scale: targetPosition.scale,
                duration: ${params.duration}
              });
              await new Promise(resolve => setTimeout(resolve, ${params.duration}));
            } catch (error) {
              console.error("Error in camera position action:", error);
            }
          })();
        `;
        case "stopRecording":
          return `
            // Stop Recording Action
            if (recorder && recorder.state === "recording") {
              recorder.stop();
              console.log("Recording stopped by action.");
            } else {
              console.warn("No active recording found to stop.");
            }
          `;
      case "wait":
        return `
          // Wait Action
          // This script pauses the execution for the specified duration in milliseconds.
          await new Promise(resolve => setTimeout(resolve, ${params.duration}));
        `;
        case "playAudio":
          return `
            // Play Audio Action
            (async function() {
              try {
                AudioHelper.play({ src: "${params.audioFilePath}", volume: 0.8, autoplay: true, loop: false }, true);
              } catch (error) {
                console.error("Error in play audio action:", error);
              }
            })();
          `;
          case "tokenSay":
            return `
              // Token Say Action
              (async function() {
                try {
                  const token = canvas.tokens.get("${params.tokenId}");
                  if (token) {
                    let chatData = {
                      user: game.user._id,
                      speaker: ChatMessage.getSpeaker(token),
                      content: "${params.message}"
                    };
                    ChatMessage.create(chatData, { chatBubble: true });
                  }
                } catch (error) {
                  console.error("Error in token say action:", error);
                }
              })();
            `;
      case "switchScene":
        return `
          // Switch Scene Action
          (async function() {
            try {
              const scene = game.scenes.get("${params.sceneId}");
              if (scene) {
                await scene.view();
                console.log("Switched to scene: " + scene.name);
              } else {
                console.error("Scene not found with ID: ${params.sceneId}");
              }
            } catch (error) {
              console.error("Error in scene switch action:", error);
            }
          })();
        `;
      case "tokenMovement":
        const moveScript = params.teleport
          ? `
            // Token Teleport Action
            (async function() {
              try {
                const token = canvas.tokens.get("${params.id}");
                if (token) {
                  await token.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} }, { animate: false });
                }
              } catch (error) {
                console.error("Error in token teleport action:", error);
              }
            })();
          `
          : `
            // Token Movement Action
            (async function() {
              try {
                const token = canvas.tokens.get("${params.id}");
                if (token) {
                  await token.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} });
                  ${params.animatePan ? `await canvas.animatePan({ x: ${params.x}, y: ${params.y}, duration: 1000 });` : ""}
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for movement to complete
                }
              } catch (error) {
                console.error("Error in token movement action:", error);
              }
            })();
          `;
        return params.waitForCompletion ? `await ${moveScript}` : moveScript;
      case "showHideToken":
        return `
          // Show/Hide Token Action
          (async function() {
            try {
              const token = canvas.tokens.get("${params.tokenId}");
              if (token) {
                await token.document.update({ hidden: !token.document.hidden }, { animate: ${params.async} });
                ${params.async ? 'await new Promise(resolve => setTimeout(resolve, 1000));' : ''}
              }
            } catch (error) {
              console.error("Error in show/hide token action:", error);
            }
          })();
        `;
      case "tileMovement":
        return `
          // Tile Movement Action
          (async function() {
            try {
              const tile = canvas.tiles.get("${params.tileId}");
              if (tile) {
                await tile.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} });
                ${params.animatePan ? `await canvas.animatePan({ x: ${params.x}, y: ${params.y}, duration: 1000 });` : ""}
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for movement to complete
              }
            } catch (error) {
              console.error("Error in tile movement action:", error);
            }
          })();
        `;
      case "doorState":
        return `
          // Door State Action
          (async function() {
            try {
              const wall = canvas.walls.get("${params.wallId}");
              if (wall) {
                await wall.document.update({
                  ds: ${params.doorState}
                });
                console.log("Door state changed to: ${params.doorState === "1" ? "Open" : params.doorState === "2" ? "Locked" : "Closed"}");
              }
            } catch (error) {
              console.error("Error in door state action:", error);
            }
          })();
        `;
      case "screenShake":
        return `
          // Screen Shake Action
          (async function() {
            try {
              const originalTransform = document.body.style.transform;
              let startTime = performance.now();

              function shakeScreen(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = elapsedTime / ${params.duration};

                if (progress < 1) {
                  let displacement = ${params.intensity} * Math.sin(progress * ${params.speed} * 2 * Math.PI);
                  displacement *= 1 - progress;

                  document.body.style.transform = \`translate(\${displacement}px, \${displacement}px)\`;

                  requestAnimationFrame(shakeScreen);
                } else {
                  document.body.style.transform = originalTransform;
                }
              }

              requestAnimationFrame(shakeScreen);
            } catch (error) {
              console.error("Error in screen shake action:", error);
            }
          })();
        `;
      case "screenFlash":
        return `
          // Screen Flash Action
          (async function() {
            try {
              const flashEffect = document.createElement("div");
              flashEffect.style.position = "fixed";
              flashEffect.style.left = 0;
              flashEffect.style.top = 0;
              flashEffect.style.width = "100vw";
              flashEffect.style.height = "100vh";
              flashEffect.style.backgroundColor = "${params.color}";
              flashEffect.style.opacity = ${params.opacity};
              flashEffect.style.pointerEvents = "none";
              flashEffect.style.zIndex = "10000";
              document.body.appendChild(flashEffect);

              setTimeout(() => {
                flashEffect.style.transition = "opacity ${params.duration}ms";
                flashEffect.style.opacity = 0;
              }, 50);

              setTimeout(() => {
                flashEffect.remove();
              }, ${params.duration} + 50);
            } catch (error) {
              console.error("Error in screen flash action:", error);
            }
          })();
        `;
      case "runMacro":
        return `
          // Run Macro Action
          (async function() {
            try {
              const macro = game.macros.find(m => m.name === "${params.macroName}");
              if (macro) {
                await macro.execute();
                console.log("Executed macro: ${params.macroName}");
              } else {
                console.warn("Macro not found: ${params.macroName}");
              }
            } catch (error) {
              console.error("Error in run macro action:", error);
            }
          })();
        `;
      case "imageDisplay":
        return `
          // Image Display Action
          (async function() {
            try {
              const popout = new ImagePopout("${params.imageUrl}", {
                title: "Image Display",
                shareable: true
              });
              popout.render(true);
              popout.shareImage();
            } catch (error) {
              console.error("Error in image display action:", error);
            }
          })();
        `;
      case "animation":
        return params.targetTokenId
          ? `
            // Animation Action
            new Sequence()
              .effect()
              .file("${params.animationUrl}") // URL of the animation file
              .attachTo(canvas.tokens.get("${params.sourceTokenId}")) // Attach the animation to the selected token
              .stretchTo(canvas.tokens.get("${params.targetTokenId}")) // Stretch the animation to the target token
              .scale(${params.scale}) // Scale of the animation
              .rotate(${params.rotation}) // Rotation of the animation in degrees
              .duration(${params.duration}) // Duration of the animation in milliseconds
              .play();
          `
          : `
            // Animation Action
            new Sequence()
              .effect()
              .file("${params.animationUrl}") // URL of the animation file
              .atLocation(canvas.tokens.get("${params.sourceTokenId}")) // Play the animation at the selected token's location
              .scale(${params.scale}) // Scale of the animation
              .rotate(${params.rotation}) // Rotation of the animation in degrees
              .duration(${params.duration}) // Duration of the animation in milliseconds
              .play();
          `;
      case "fadeOut":
        return `
          // Fade Out Action
          (async function() {
            try {
              const canvasElement = document.querySelector("canvas#board");
              canvasElement.style.transition = "filter ${params.fadeDuration}ms ease-in-out";
              canvasElement.style.filter = "brightness(0)";
              await new Promise(resolve => setTimeout(resolve, ${params.fadeDuration}));
              console.log("Screen faded out over ${params.fadeDuration}ms.");
            } catch (error) {
              console.error("Error in fade out action:", error);
            }
          })();
        `;
      case "fadeIn":
        return `
          // Fade In Action
          (async function() {
            try {
              const canvasElement = document.querySelector("canvas#board");
              canvasElement.style.transition = "filter ${params.fadeDuration}ms ease-in-out";
              canvasElement.style.filter = "brightness(1)";
              await new Promise(resolve => setTimeout(resolve, ${params.fadeDuration}));
              console.log("Screen faded in over ${params.fadeDuration}ms.");
            } catch (error) {
              console.error("Error in fade in action:", error);
            }
          })();
        `;
      case "hideUI":
        return `
          // Hide UI Action
          (async function() {
            try {
              const uiSelectors = ["#ui-left", "#ui-top", "#taskbar", "#ui-right", "#players", "#hotbar"];
              uiSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                  element.style.transition = 'transform ${params.duration}ms ease, opacity ${params.duration}ms ease';
                  element.style.opacity = '0';
                }
              });
              await new Promise(resolve => setTimeout(resolve, ${params.duration}));
              console.log("UI elements hidden over ${params.duration}ms.");
            } catch (error) {
              console.error("Error in hide UI action:", error);
            }
          })();
        `;
      case "showUI":
        return `
          // Show UI Action
          (async function() {
            try {
              const uiSelectors = ["#ui-left", "#ui-top", "#taskbar", "#ui-right", "#players", "#hotbar"];
              uiSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                  element.style.transition = 'transform ${params.duration}ms ease, opacity ${params.duration}ms ease';
                  element.style.opacity = '1';
                }
              });
              await new Promise(resolve => setTimeout(resolve, ${params.duration}));
              console.log("UI elements shown over ${params.duration}ms.");
            } catch (error) {
              console.error("Error in show UI action:", error);
            }
          })();
        `;
      // Add more cases for other action types here as needed
      default:
        return "// Unknown Action";
    }
  }

  function openInitialDialog() {
    const dialogContent = `
      <div class="cutscene-maker-buttons">
        ${[
          "Camera", "Switch Scene", "Token Movement", "Screen Flash", "Screen Shake", "Run Macro", "Wait", "Image Display", "Play Animation"
        ].map(action => `<div class="cutscene-maker-button" id="${action.replace(/ /g, '')}Button">${action}</div>`).join('')}
      </div>
    `;

    const dialog = new Dialog({
      title: "Cutscene Macro Maker",
      content: dialogContent,
      buttons: {},
      render: html => {
        console.log("Initial dialog rendered");
        const closeDialogAndExecute = actionFunction => {
          dialog.close();
          actionFunction();
        };

        const actionMappings = [
          { id: "CameraButton", action: addCameraPositionAction },
          { id: "SwitchSceneButton", action: addSwitchSceneAction },
          { id: "TokenMovementButton", action: addTokenMovementAction },
          { id: "ScreenFlashButton", action: addScreenFlashAction },
          { id: "ScreenShakeButton", action: addScreenShakeAction },
          { id: "RunMacroButton", action: addRunMacroAction },
          { id: "WaitButton", action: addWaitAction },
          { id: "ImageDisplayButton", action: addImageDisplayAction },
          { id: "PlayAnimationButton", action: addAnimationAction },
          { id: "HideUIButton", action: addHideUIAction },
          { id: "ShowUIButton", action: addShowUIAction }
        ];

        actionMappings.forEach(({ id, action }) => {
          html.find(`#${id}`).click(() => {
            console.log(`Button ${id} clicked`);
            closeDialogAndExecute(action);
          });
        });
      }
    });
    dialog.render(true);
  }

  openInitialDialog();
}
