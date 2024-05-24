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
        template: "modules/cutscene-maker/templates/cutscene-maker.html", // Adjusted path to your HTML template
        width: 700, // Set the width to 700px
        height: "auto", // Let the height adjust automatically
        resizable: true,
        classes: ["cutscene-maker"]
      });
    }

    getData() {
      return {}; // Return data to be used in the template rendering
    }

    activateListeners(html) {
      super.activateListeners(html);

      this.populateActionButtons(html);

      this.updateActionList();

      // Attach click handlers to the footer buttons
      html.find("#testRunButton").click(() => {
        testRunActions();
      });

      html.find("#exportButton").click(() => {
        exportCutsceneScript();
      });
    }

    populateActionButtons(html) {
      const actions = [
        { id: "CameraButton", label: "Camera", action: addCameraPositionAction },
        { id: "SwitchSceneButton", label: "Switch Scene", action: addSwitchSceneAction },
        { id: "TokenMovementButton", label: "Token Movement", action: addTokenMovementAction },
        { id: "ScreenFlashButton", label: "Screen Flash", action: addScreenFlashAction },
        { id: "ScreenShakeButton", label: "Screen Shake", action: addScreenShakeAction },
        { id: "RunMacroButton", label: "Run Macro", action: addRunMacroAction },
        { id: "WaitButton", label: "Wait", action: addWaitAction },
        { id: "ImageDisplayButton", label: "Image Display", action: addImageDisplayAction },
        { id: "PlayAnimationButton", label: "Play Animation", action: addAnimationAction }
      ];
    
      const availableActionsContainer = html.find("#availableActions");
    
      actions.forEach(({ id, label, action }) => {
        const button = $(`<button id="${id}" class="cutscene-maker-button">${label}</button>`);
        button.click(() => {
          console.log(`Button ${id} clicked`);
          action();
        });
        availableActionsContainer.append(button);
      });
    }

    updateActionList() {
      const actionList = $("#actionList");
      actionList.empty();
      cutsceneActions.forEach(action => {
        actionList.append(`
          <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 4px;">
            <span class="drag-handle" style="cursor: move; margin-right: 10px;">&#9776;</span>
            <span style="flex-grow: 1; max-width: 200px; max-height: 80px; overflow: overlay;">${action.description}</span>
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

// Your existing functions like testRunActions, exportCutsceneScript, etc., remain unchanged

function testRunActions() {
  const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");

  // Wrap the script content in a function that returns a promise
  const wrappedScript = `
    (async function() {
      try {
        // Minimize the window
        const windowApp = document.querySelector('#cutscene-maker-window').closest('.window-app');
        windowApp.classList.add('minimized');

        // The user's script content
        ${scriptContent}

        // Ensure the script returns a promise that resolves when the script is done
        return Promise.resolve();
      } catch (error) {
        console.error("Error executing cutscene script: ", error);
        ui.notifications.error("Error executing cutscene script. Check the console for details.");
        return Promise.reject(error);
      }
    })();
  `;

  // Execute the wrapped script
  new Function(wrappedScript)()
    .then(() => {
      // Unminimize the window
      const windowApp = document.querySelector('#cutscene-maker-window').closest('.window-app');
      windowApp.classList.remove('minimized');
      ui.notifications.info("Test run executed successfully.");
    })
    .catch(error => {
      console.error("Error during test run:", error);
      ui.notifications.error("Error during test run. Check the console for details.");
    });
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
        const dialogElement = html.closest(".window-app");
        dialogElement.style.top = "25vh";
        dialogElement.style.left = "75vw";
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
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
          <input type="number" id="tokenRotation" name="tokenRotation" value="${action.params ? action.params.rotation : selectedToken.data.rotation}" step="1" style="width: 100%;">
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
          const params = { id: selectedToken.id, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan, teleport };
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
      }, 0);
    }
  });

  dialog.render(true);
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
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
        dialog.element[0].style.top = "25vh";
        dialog.element[0].style.left = "75vw";
      }, 0);
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
      return params.teleport
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
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.error("Error in token movement action:", error);
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
