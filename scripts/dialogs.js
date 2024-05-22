import { updateActionList, exportCutsceneScript, addCameraPositionAction, /* other action functions */ } from './utils.js';

export function openUnifiedDialog() {
  const dialogContent = `
    <style>
      .cutscene-maker-container {
        display: flex;
      }
      .action-list, .action-buttons {
        flex: 1;
      }
      .action-list {
        border-right: 1px solid #ccc;
        padding-right: 10px;
      }
      .action-buttons {
        padding-left: 10px;
      }
      .cutscene-maker-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .cutscene-maker-button {
        text-align: center;
        padding: 5px;
        border: 1px solid #ccc;
        cursor: pointer;
      }
    </style>
    <div class="cutscene-maker-container">
      <div class="action-list">
        <ul id="actionList"></ul>
      </div>
      <div class="action-buttons">
        <div class="cutscene-maker-buttons">
          ${[
            "Camera", "Switch Scene", "Token Movement", "Screen Flash", "Screen Shake",
            "Play Animation", "Run Macro", "Wait", "Image Display"
          ].map(action => `<div class="cutscene-maker-button" id="${action.replace(/ /g, '')}Button">${action}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  const d = new Dialog({
    title: "Cutscene Maker",
    content: dialogContent,
    buttons: {
      export: {
        label: "Export",
        callback: () => {
          exportCutsceneScript();
        }
      },
      close: {
        label: "Close",
        callback: () => {
          d.close();
        }
      }
    },
    render: html => {
      const actionMappings = [
        { id: "CameraButton", action: addCameraPositionAction },
        { id: "SwitchSceneButton", action: addSwitchSceneAction },
        { id: "TokenMovementButton", action: addTokenMovementAction },
        { id: "ScreenFlashButton", action: addScreenFlashAction },
        { id: "ScreenShakeButton", action: addScreenShakeAction },
        { id: "PlayAnimationButton", action: addAnimationAction },
        { id: "RunMacroButton", action: addRunMacroAction },
        { id: "WaitButton", action: addWaitAction },
        { id: "ImageDisplayButton", action: addImageDisplayAction }
      ];

      actionMappings.forEach(({ id, action }) => {
        html.find(`#${id}`).click(() => {
          console.log(`Button ${id} clicked`);
          action();
        });
      });

      updateActionList();
    }
  });

  d.render(true);
}
