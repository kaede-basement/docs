const Tauri = window.__TAURI_PLUGINS_COMMUNITY__;
const Kaede = window.__KAEDE__;

const Shell = Tauri.shell;
const Command = Shell.Command;
const FileStructure = Kaede.constants.FileStructure;
const Logging = Kaede.libs.Logging;
const General = Kaede.libs.General;
const GlobalStateHelpers = Kaede.libs.GlobalStateHelpers;

const log = Logging.log;

const routerId = "__custom-page__wrapper";
const workingDirectory = General.cachedJoin(
  General.getCachedBaseDirectory(),
  FileStructure.Folders.Extensions.Path,
  "serverManager",
);

log.info("server-manager", workingDirectory);

async function launcherPaperMC() {
  const serverManagerWrapper = document.getElementById("__page-wrapper__server-manager");

  if (!serverManagerWrapper) {
    return;
  }

  const onLine = line => {
    log.info("server-manager", line);

    const lineElement = document.createElement("div");

    lineElement.style.background = "#2e2e2e";
    lineElement.style.fontFamily = "monospace";
    lineElement.textContent = line;

    serverManagerWrapper.append(lineElement);
  };
  const command = Command.create("java", [
    "-DPaper.IgnoreJavaVersion=true",
    "-jar",
    "paper-1.16.5-794.jar",
  ], {
    cwd: workingDirectory,
  });

  command.stdout.on("data", onLine);
  command.stderr.on("data", onLine);

  try {
    await command.spawn();
  } catch (error) {
    log.error("server-manager", "uhee", error);
  }
}

function cleanPage() {
  const serverManagerWrapper = document.getElementById("__page-wrapper__server-manager");

  if (serverManagerWrapper) {
    serverManagerWrapper.remove();
  }
}

let previous = undefined;

function mountPage(value) {
  if (previous === value.current) {
    return;
  }

  previous = value.current;

  log.info("server-manager", "Mounting the page");
  cleanPage();

  if (value.current !== "server-manager") {
    return { "status": "continue" };
  }

  const routerWrapper = document.getElementById(routerId);

  if (!routerWrapper) {
    log.error("server-manager", "Could not find the router wrapper element");

    return { "status": "continue" };
  }

  const pageWrapper = document.createElement("div");

  pageWrapper.setAttribute("id", "__page-wrapper__server-manager");
  pageWrapper.className = "__page-wrapper overflow-y-auto";

  const launchServer = document.createElement("button");

  launchServer.textContent = "Launch PaperMC 1.16.5";
  launchServer.onclick = () => launcherPaperMC();

  pageWrapper.append(launchServer);
  routerWrapper.append(pageWrapper);

  return { "status": "continue" };
}

async function initialize() {
  const currentSidebarItems = GlobalStateHelpers.get().sidebarItems;

  GlobalStateHelpers.change("sidebarItems", [
    ...currentSidebarItems,
    "divider",
    {
      "path"  : "cvnny",
      "name"  : "server-manager",
      "action": () => {
        GlobalStateHelpers.Pages.navigate("cvnny");
      },
      "image": "https://stickershop.line-scdn.net/stickershop/v1/product/12065206/LINEStorePC/main.png?v=1",
    },
  ]);

  Kaede.hooks.onPagesChange.after.push(mountPage)
  Kaede.hooks.onPreLaunchInformation.after.push(({ instance, statuses }) => {
    const isCustomGame = instance["custom/type"] === "steam";

    if (!isCustomGame) {
      return { "status": "continue" };
    }

    Shell.open("steam://rungameid/2220360");
    statuses.current = "general-success";

    return { "status": "stop", "response": false };
  });
}

await initialize();