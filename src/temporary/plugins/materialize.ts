/* __KAEDE_DELETE_THIS_LINE__ */ import __KAEDE_TYPE_SYSTEM__, { GlobalStatesType } from "E:/Desktop/Coding/apps/kaede/types/kaede-lib";

const Kaede = window.__KAEDE__;
const Tauri = window.__TAURI__;

const { FileStructure } = Kaede.constants;
const { ExtensionsManager, General, GlobalStateHelpers } = Kaede.libs;
const { readTextFile } = Tauri.fs;

const cssPath: string = General.cachedJoin(
  General.getCachedBaseDirectory(),
  FileStructure.Folders.Themes.Path,
  "materialized.css.hmr",
);

let previousCss: string;
let styleElement: HTMLStyleElement;

async function hotCSSModule(): Promise<number> {
  const css: string = await readTextFile(cssPath);

  if (css !== previousCss) {
    styleElement?.remove?.();

    styleElement = ExtensionsManager.handleCssTheme(css);
  }

  previousCss = css;

  const endTime: number = performance.now();

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(endTime);
    }, 500);
  });
}

const globalStates: GlobalStatesType = GlobalStateHelpers.get();
const cardStyles = General.getSidebarInnerStyles(
  globalStates?.layout?.sidebar?.background,
  globalStates?.layout?.sidebar?.color,
  globalStates?.layout?.sidebar?.blur,
);

const statsText = document.createElement("span");

statsText.setAttribute("id", "__sidebar__entry-stats-icon");
statsText.classList.add("i-lucide-bell", "block", "size-6", "shrink-0");

const sideBarInnerPart = document.createElement("button");

sideBarInnerPart.append(statsText);
sideBarInnerPart.setAttribute("id", "__sidebar__entry-stats-button");
sideBarInnerPart.setAttribute("aria-label", "profile");
sideBarInnerPart.classList.add("__sidebar__entry-stats-button", "relative", "grid", "size-12", "shrink-0", "rounded-md", "place-items-center", "transition-[background-color]", "duration-150", "disabled:bg-[theme(colors.neutral.100/.1)]", "hover:bg-[theme(colors.neutral.100/.05)]");

const sideBarButton = document.createElement("div");

sideBarButton.append(sideBarInnerPart);
sideBarButton.style.background = cardStyles.background;
sideBarButton.style.backdropFilter = cardStyles.backdropFilter ?? "";
sideBarButton.style.color = cardStyles.color;
sideBarButton.setAttribute("id", "__sidebar__inner-stats-button");
sideBarButton.classList.add("rounded-md", "shrink-0", "p-2");

document
  .getElementById("__sidebar__wrapper")
  ?.append(sideBarButton);

async function loop(): Promise<void> {
  while (true) {
    await hotCSSModule();
  }
}

const homeSectionElements = document
  .getElementById("__home-page__instance-section-wrapper");

ExtensionsManager.handleCssTheme(`
#__home-page__instance-section-wrapper > button {
  background: ${cardStyles.background};
  color: ${cardStyles.color};
  ${cardStyles.backdropFilter
    ? "backdrop-filter: " + cardStyles.backdropFilter
    : ""}
}
`);

const instanceStatsIconInner = document.createElement("span");

instanceStatsIconInner.classList.add("i-lucide-puzzle", "block", "size-8");

const instanceStatsIcon = document.createElement("span");

instanceStatsIcon.append(instanceStatsIconInner);
instanceStatsIcon.classList.add("grid", "size-12", "shrink-0", "place-items-center");

const instanceStatsLabel = document.createElement("span");

instanceStatsLabel.className = "block font-medium";
instanceStatsLabel.textContent = "Type";

const instanceStatsSubLabel = document.createElement("span");

instanceStatsSubLabel.className = "block text-sm text-neutral-400";
instanceStatsSubLabel.textContent = "NeoForge (0 mods)";

const instanceStatsText = document.createElement("span");

instanceStatsText.append(instanceStatsLabel, instanceStatsSubLabel);
instanceStatsText.className = "flex flex-col items-start pr-1";

const instanceStatsButton = document.createElement("button");

instanceStatsButton.append(instanceStatsIcon, instanceStatsText);
instanceStatsButton.classList.add("relative", "flex", "flex-nowrap", "items-center", "gap-2", "rounded-md", "p-2", "transition-[background-color]", "hover:bg-[theme(colors.neutral.100/.05)]");

homeSectionElements?.append?.(instanceStatsButton);

loop();
