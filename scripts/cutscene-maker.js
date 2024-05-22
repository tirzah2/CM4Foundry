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

function openUnifiedDialog() {
  const dialogContent = `
    <style>
      .cutscene-maker-container {
        display: flex;
        height: 450px;
      }
      .cutscene-maker-actions {
        flex: 1;
        border-right: 1px solid #ccc;
        padding-right: 10px;
        overflow-y: auto;
      }
      .cutscene-maker-buttons {
        flex: 1;
        padding-left: 10px;
        overflow-y: auto;
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
      .cutscene-maker-footer {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
      }
      .cutscene-maker-footer button {
        flex: 1;
        margin: 0 5px;
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
    <div class="cutscene-maker-footer">
      <button id="testRunButton">Test Run</button>
      <button id="exportButton">Export</button>
    </div>
  `;

  new Dialog({
    title: "Cutscene Maker",
    content: dialogContent,
    buttons: {},
    render: html => {
      setTimeout(() => {
        const dialogElement = html.closest(".window-app");
        dialogElement.style.top = "25vh";
        dialogElement.style.left = "75vw";
        dialogElement.style.width = "30vw";
        dialogElement.style.height = "450px";
        dialogElement.classList.add("cutscene-maker-dialog"); // Adding a class to the dialog for easy targeting
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

      // Attach click handlers for the footer buttons
      html.find("#testRunButton").click(() => {
        testRunActions();
      });

      html.find("#exportButton").click(() => {
        exportCutsceneScript();
      });
    }
  }).render(true);
}

function testRunActions() {
  const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");
  const asyncScript = `(async () => { ${scriptContent} })();`;

  try {
    new Function(asyncScript)();
    ui.notifications.info("Test run executed successfully.");
  } catch (error) {
    console.error("Error executing cutscene script: ", error);
    ui.notifications.error("Error executing cutscene script. Check the console for details.");
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
          openUnifiedDialog();
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
