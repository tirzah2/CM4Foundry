// Load jQuery UI for sortable functionality
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

function initializeCutsceneMacroMaker() {
  let cutsceneActions = [];
  let actionCounter = 0;

  const generateUniqueId = () => `action-${actionCounter++}`;

  // Define the custom window class
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
        { id: "ShowHideTokenButton", label: "Show/Hide Token - PLACEHOLDER", action: dummyAction },
        { id: "ChatButton", label: "Chat - PLACEHOLDER", action: dummyAction },
        { id: "ConditionalBranchButton", label: "Conditional Branch - PLACEHOLDER", action: dummyAction },
        { id: "TileMovementButton", label: "Tile Movement - PLACEHOLDER", action: dummyAction },
        { id: "DoorStateButton", label: "Door State - PLACEHOLDER", action: dummyAction },
        { id: "LightStateButton", label: "Light State - PLACEHOLDER", action: dummyAction },
        { id: "AmbientSoundStateButton", label: "Ambient Sound State - PLACEHOLDER", action: dummyAction },
        { id: "PlaySoundButton", label: "Play Sound - PLACEHOLDER", action: dummyAction },
        { id: "ChangePlaylistButton", label: "Change Playlist - PLACEHOLDER", action: dummyAction },
        { id: "FadeOutButton", label: "Fade Out", action: addFadeOutAction },
        { id: "FadeInButton", label: "Fade In", action: addFadeInAction },        
        { id: "HideUIButton", label: "Hide UI", action: addHideUIAction },
        { id: "ShowUIButton", label: "Show UI", action: addShowUIAction },
        { id: "WeatherParticleEffectsButton", label: "Weather/Particle Effects - PLACEHOLDER", action: dummyAction },
        { id: "LocationBannerButton", label: "Location Banner - PLACEHOLDER", action: dummyAction }
      ];
    
      const availableActionsContainer = html.find("#availableActions");

      actions.forEach(({ id, label, action }) => {
        const button = $(`<button id="${id}" class="cutscene-maker-button">${label}</button>`);
        button.click(() => {
          action();
        });
        availableActionsContainer.append(button);
      });
  
      // Add Import Button
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

function testRunActions() {
  const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");

  // Wrap the script content in a function that returns a promise
  const wrappedScript = `
    (async function() {
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
    })();
  `;

  // Execute the wrapped script
  new Promise((resolve, reject) => {
    try {
      new Function(wrappedScript)();
      resolve();
    } catch (error) {
      reject(error);
    }
  })
    .then(() => {
      ui.notifications.info("Test run executed successfully.");
    })
    .catch(error => {
      console.error("Error during test run:", error);
    });
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
  if (section.includes("Screen Shake Action")) return "screenShake";
  if (section.includes("Screen Flash Action")) return "screenFlash";
  if (section.includes("Run Macro Action")) return "runMacro";
  if (section.includes("Image Display Action")) return "imageDisplay";
  if (section.includes("Animation Action")) return "animation";
  if (section.includes("Fade Out Action")) return "fadeOut";
  if (section.includes("Fade In Action")) return "fadeIn";
  if (section.includes("Hide UI Action")) return "hideUI";
  if (section.includes("Show UI Action")) return "showUI";
  // Add more cases as needed
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
    case "showUI":
      params.duration = parseInt(getMatch(/duration: (\d+)/, 500));
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
          // No action needed here
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
  if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select exactly one token.");
    return;
  }
  const selectedToken = canvas.tokens.controlled[0];
  const action = existingAction || {};
  const waitForCompletionChecked = action.params && typeof action.params.waitForCompletion !== 'undefined' ? action.params.waitForCompletion : true; // Default to true if not specified
  const dialog = new Dialog({
    title: "Token Movement",
    content: `
      <p>Move the selected token to the new position, then click OK.</p>
      <form>
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
          <input type="number" id="tokenRotation" name="tokenRotation" value="${action.params ? action.params.rotation : selectedToken?.data?.rotation || 0}" step="1" style="width: 100%;">
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
          const newPosition = { x: selectedToken.x, y: selectedToken.y };
          const newRotation = parseFloat(html.find("#tokenRotation").val());
          const animatePan = html.find("#animatePan")[0].checked;
          const teleport = html.find("#teleport")[0].checked;
          const waitForCompletion = html.find("#waitForCompletion")[0].checked;
          const params = { id: selectedToken.id, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan, teleport, waitForCompletion };
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
        callback: () => {
        }
      }
    },
    default: "ok",
    render: html => {
      console.log("Dialog rendered: Token Movement Action");
      setTimeout(() => {
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
      }, 0);
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

function dummyAction(existingAction = null) {
  console.log("Add Dummy Action");
  const action = existingAction || {};
  const params = {}; // No parameters for the dummy action
  const description = "Dummy Action"; // Description for the dummy action

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
      console.log("Dialog rendered: Screen Shake Action");
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

// Add this to define the new functions
function addFadeOutAction(existingAction = null) {
  console.log("Add Fade Out Action");
  const actionId = generateUniqueId();
  const description = "Fade Out";
  const params = { fadeDuration: 2000 }; // Default duration

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
  const params = { fadeDuration: 2000 }; // Default duration

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
  const params = { duration: 500 }; // Default duration

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
  const params = { duration: 500 }; // Default duration

  if (existingAction) {
    updateAction(existingAction.id, params, description);
  } else {
    cutsceneActions.push({ id: actionId, description, type: "showUI", params });
  }
  updateActionList();
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
    case "wait":
      return `
        // Wait Action
        // This script pauses the execution for the specified duration in milliseconds.
        await new Promise(resolve => setTimeout(resolve, ${params.duration}));
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
        { id: "PlayAnimationButton", action: addAnimationAction }
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
