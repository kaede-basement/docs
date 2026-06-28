/* __KAEDE_DELETE_THIS_LINE__ */ import __KAEDE_TYPE_SYSTEM__ from "E:/Desktop/Coding/apps/kaede/types/kaede-lib";

const Kaede = window.__KAEDE__;
const Tauri = window.__TAURI__;
const { Errors, General, Logging } = Kaede.libs;
const { exists, watch, mkdir, readFile } = Tauri.fs;
const log = Logging.log;

const watching: Record<number, () => void> = {};

Kaede.hooks.onMinecraftLaunch.after.push(async ({
  process,
  necessaries,
}) => {
  const rootPath: string = necessaries.directories.instance;
  const screenshotsPath: string = General.cachedJoin(
    rootPath,
    "screenshots",
  );
  const validDirectory: boolean = await exists(screenshotsPath);

  if (!validDirectory) {
    await mkdir(screenshotsPath);
  }

  watching[process.pid] = await watch(screenshotsPath, async ({ type, paths }) => {
    if (typeof type !== "object" || type === null || !("create" in type)) {
      return;
    }

    const path: string | undefined = paths[0];

    if (!path) {
      return;
    }

    try {
      log.info("copy-screenshots-to-clipboard.ts", `Reading a new screenshot at '${path}'`);
      const screenshotToCopy: Uint8Array = await readFile(path);

      log.info("copy-screenshots-to-clipboard.ts", `Copying a screenshot at '${path}' to the clipboard`);
      await Tauri.clipboardManager.writeImage(screenshotToCopy);

      log.info("copy-screenshots-to-clipboard.ts", `Successfully copied a screenshot at '${path}' to the clipboard`);
    } catch (error: unknown) {
      log.error(
        "copy-screenshots-to-clipboard.ts",
        `Caught an error while copying a screenshot at '${path}':`,
        Errors.prettify(error),
      );
    }
  }, { "delayMs": 500 });
});
Kaede.hooks.onMinecraftKill.after.push(async (pid) => {
  const unwatch: () => void = watching[pid];

  return unwatch();
});
