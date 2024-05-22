import { openUnifiedDialog } from './dialogs.js';

export function initializeCutsceneMacroMaker() {
  // This function will initialize your cutscene maker and set up any necessary hooks or event listeners
  console.log('Cutscene Maker | Initializing Cutscene Macro Maker');

  // Register a control button to open the cutscene maker dialog
  Hooks.on('getSceneControlButtons', controls => {
    controls.push({
      name: 'cutsceneMaker',
      title: 'Cutscene Maker',
      icon: 'fas fa-video',
      onClick: () => openUnifiedDialog(),
      button: true
    });
  });
}
