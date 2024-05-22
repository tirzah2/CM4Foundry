export const updateActionList = () => {
  console.log("Updating action list");
  const actionList = $("#actionList");
  actionList.empty();
  cutsceneActions.forEach(action => {
    actionList.append(`
      <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 4px;">
        <span class="drag-handle" style="cursor: move; margin-right: 10px;">&#9776;</span>
        <span style="flex-grow: 1; max-width: 200px; overflow: overlay;">${action.description}</span>
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
      closeAllDialogs();
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
};

export const exportCutsceneScript = () => {
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
};

// Add other utility functions like addCameraPositionAction, addSwitchSceneAction, etc.
