const KaedeAPI = window.__KAEDE__;
const TauriAPI = window.__TAURI__;
const General = KaedeAPI.libs.General;
const GlobalStateHelpers = KaedeAPI.libs.GlobalStateHelpers;
const ExtensionsManager = KaedeAPI.libs.ExtensionsManager;
const log = KaedeAPI.libs.Logging.log;
const baseDirectory = KaedeAPI.__internals.initialBaseDirectory;

const obj = {
  "main": General.cachedJoin(baseDirectory, "resources", "arona-main.webp"),
  "navigation_window_library": General.cachedJoin(baseDirectory, "resources", "arona-library.webp"),
  "navigation_window_profile": General.cachedJoin(baseDirectory, "resources", "arisu-profile.webp"),
  "navigation_window_add-instance": General.cachedJoin(baseDirectory, "resources", "hoshino-add-instance.webp"),
  "navigation_window_settings": General.cachedJoin(baseDirectory, "resources", "ba-settings.webp"),
};

function handleNavigation(path) {
  const webviewId = path === "home" ? "main" : `navigation_window_${path}`;
  const sidebarButton = document.getElementById(`__sidebar__entry-${path}-button`);

  if (!sidebarButton) {
    return;
  }

  sidebarButton.setAttribute("disabled", "");
  
  const handleWindowDestroy = () => {
    log.debug(`The '${path}' page window was closed`);
    sidebarButton.removeAttribute("disabled");
  };

  const pageWindow = new TauriAPI.webviewWindow.WebviewWindow(webviewId, {
    "url": `/?route=${path}`,
    "visible": false,
    "title": "Kaede - " + General.capitalize(path),
  });

  pageWindow.once("tauri://destroyed", handleWindowDestroy);
}

function initialize() {
  const currentWebviewWindow = TauriAPI.webviewWindow.getCurrentWebviewWindow();

  if (currentWebviewWindow.label !== "main") {
    ExtensionsManager.handleCssTheme(".__sidebar__wrapper { display: none; }");
    GlobalStateHelpers.Layout.toggle(["sidebar"]);
  }

  log.info(
    "\n" + "====================" +
    "\n" + " Multi-Window | 0.1 " +
    "\n" + "===================="
  );
  GlobalStateHelpers.Pages.navigate = handleNavigation;

  GlobalStateHelpers.Layout.overrideBackground({
    "url": TauriAPI.core.convertFileSrc(obj[currentWebviewWindow.label]),
  });
}

initialize();