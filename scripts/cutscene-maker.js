Hooks.on('getSceneControlButtons', controls => {
  controls.push({
    name: 'cutscene-maker',
    title: 'Cutscene Maker',
    icon: 'fas fa-film',
    layer: 'controls',
    tools: [{
      name: 'openCutsceneMaker',
      title: 'Open Cutscene Maker',
      icon: 'fas fa-film',
      onClick: () => {
        openUnifiedDialog();
      },
      button: true
    }]
  });
});

// Function to open the unified dialog
function openUnifiedDialog() {
  const dialogContent = `
    <style>
      .cutscene-maker-container {
        display: flex;
      }
      .cutscene-maker-actions {
        flex: 1;
        border-right: 1px solid #ccc;
        padding-right: 10px;
      }
      .cutscene-maker-buttons {
        flex: 1;
        padding-left: 10px;
      }
      .cutscene-maker-buttons > div {
        margin-bottom: 10px;
        cursor: pointer;
        padding: 5px;
        border: 1px solid #ccc;
        text-align: center;
      }
      .cutscene-maker-buttons > div:hover {
        background-color: #eee;
      }
    </style>
    <div class="cutscene-maker-container">
      <div class="cutscene-maker-actions">
        <ul id="actionList"></ul>
      </div>
      <div class="cutscene-maker-buttons">
        ${[
          "Camera", "Switch Scene", "Token Movement", "Screen Flash", "Screen Shake", "Run Macro", "Wait", "Image Display", "Play Animation"
        ].map(action => `<div class="cutscene-maker-button" id="${action.replace(/ /g, '')}Button">${action}</div>`).join('')}
      </div>
    </div>
  `;

  new Dialog({
    title: "Cutscene Maker",
    content: dialogContent,
    buttons: {
      close: {
        label: "Close",
        callback: () => {
          closeAllDialogs();
        }
      }
    },
    render: html => {
      setTimeout(() => {
        const dialogElement = html.closest(".window-app");
        dialogElement.style.top = "25vh";
        dialogElement.style.left = "75vw";
      }, 0);
      updateActionList();
      
      // Attach click handlers to the buttons
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
          action();
        });
      });
    }
  }).render(true);
}
