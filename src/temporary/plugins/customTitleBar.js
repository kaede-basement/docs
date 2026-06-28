const KaedeAPI = window.__KAEDE__;
const TauriAPI = window.__TAURI__;
const log = KaedeAPI.libs.Logging.log;
const ExtensionsManager = KaedeAPI.libs.ExtensionsManager;
const GlobalStateHelpers = KaedeAPI.libs.GlobalStateHelpers;
const getCurrentWebviewWindow = TauriAPI.webviewWindow.getCurrentWebviewWindow;

function initialize() {
  log.info("Hiii from the Custom Title Bar plugin :3");
  const layoutElement = document.getElementById("__layout__wrapper");
  const customTitleBarElement = document.createElement("div");
  const { background, blur } = GlobalStateHelpers.get().layout.sidebar;

  ExtensionsManager.handleCssTheme(".custom-title-bar__wrapper { z-index: 9999 } .custom-title-bar__wrapper:hover { background: rgba(17, 17, 17, 0.3) } .custom-title-bar__button:hover { background: transparent !important }");

  customTitleBarElement.className = "custom-title-bar__wrapper transition-[background-color]";
  customTitleBarElement.setAttribute("data-tauri-drag-region", "");
  customTitleBarElement.setAttribute("style", "position:absolute;display:flex;flex-wrap:nowrap;justify-content:flex-end;padding:8px;gap:8px;left:80px;right:0;border-radius:0 0 0 6px");
  customTitleBarElement.innerHTML = `
<button id="__custom-title-bar__button-minimize" class="custom-title-bar__button size-8 rounded-md grid place-items-center transition-[background-color]" style="background:${background};backdrop-filter:blur(${blur}px)">
  <svg class="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14"/></svg>
</button>
<button id="__custom-title-bar__button-maximize" class="custom-title-bar__button size-8 rounded-md grid place-items-center transition-[background-color]" style="background:${background};backdrop-filter:blur(${blur}px)">
  <svg class="pointer-events-none" style="transform:scaleX(-100%)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-squares-subtract-icon lucide-squares-subtract"><path d="M10 22a2 2 0 0 1-2-2"/><path d="M16 22h-2"/><path d="M16 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-5a2 2 0 0 1 2-2h5a1 1 0 0 0 1-1z"/><path d="M20 8a2 2 0 0 1 2 2"/><path d="M22 14v2"/><path d="M22 20a2 2 0 0 1-2 2"/></svg>
</button>
<button id="__custom-title-bar__button-close" class="custom-title-bar__button size-8 rounded-md grid place-items-center transition-[background-color]" style="background:${background};backdrop-filter:blur(${blur}px)">
  <svg class="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
</button>
`;

  const window = getCurrentWebviewWindow();

  customTitleBarElement.addEventListener("contextmenu", (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
  });
  customTitleBarElement.addEventListener("click", async (event) => {
    const id = event?.target?.id;

    switch (id) {
      case "__custom-title-bar__button-minimize": {
        await window.minimize();

        break;
      }
      case "__custom-title-bar__button-maximize": {
        const maximized = await window.isMaximized();

        if (maximized) {
          await window.unmaximize();
        } else {
          await window.maximize();
        }

        break;
      }
      case "__custom-title-bar__button-close": {
        await window.close();

        break;
      }
    }
  });
  layoutElement.append(customTitleBarElement);
  window.setDecorations(false);
}

initialize();