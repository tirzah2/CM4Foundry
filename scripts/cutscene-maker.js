import { initializeCutsceneMacroMaker } from './actions.js';

Hooks.once('init', async function() {
  console.log('Cutscene Maker | Initializing cutscene maker module');

  // Load styles
  loadStylesheet('modules/cutscene-maker/styles/styles.css');

  // Initialize the cutscene maker
  initializeCutsceneMacroMaker();
});

function loadStylesheet(url) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}
