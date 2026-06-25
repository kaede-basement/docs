starting from scratch

the following text is temporary

# [HMCL](https://docs.hmcl.net/)

```
Problem Set
|- FAQ
   > How to log in to account
   > How to download the game
   > What is Minecraft
   > What are mods and resourcepacks
   > Installing Java
   > etc.
|_ (User/integration/multiplayer) starter pack
   > Several cards that link to the useful pages on the selected topic

User's Help
> Basically user-friendly information on various Minecraft and launcher topics (auth, instances, mod loaders, shaders, launch configurations, etc.)

Developer Help
> Information about HMCL-compatible instances import/export

Changelog
> Self-explanatory. It specifies changes for each version

Other
|- User Agreement
   > Some kind of "terms of service"
|- Contribution Guide
   > Just two sentences of some info with links to Discord, QQ, and Github
|_ (Website/Github) links
```

# [nitrolaunch](https://nitrolaunch.github.io/nitrolaunch/)

```
Features
> Brief explanations of two features (low-level IO config and shared worlds)

User Guide
> A short user-friendly walkthrough

Patches
> Explanations of a concept similar to MultiMC patches. Those also allow scripts (@meta, @properties, @install)

Plugins
> Explanations of a rust-based plugin system with some available JS GUI invokes. Also has descriptions for existing plugins

Configurting
> Launcher configuration strucure. I am only interested in instances one.

Loaders
> Just specifies which mod loaders are supported and which are not

Principles
> Feels like Business Requirements, to be honest
```

# PrismLauncher

It's mostly FAQ and GUI explanations. Nothing really technical. They didn't even cover their own launch process, that's why I spent a month to fully cover it myself in `./previous-docs/MULTIMC.md`

# SJMCL

```
Getting Started
|- Introduction
   > Specifies features with brief descriptions
|- Download and Install
   > Explanations on how to install the launcher
|_ Beginner's Guide
   > Explanations on how to use the launcher

Game Instances
|_ Mods and Loaders
   > Explanations of mod loaders, how to install them, and what to do if some errors occur

Intelligence
|- Launcher MCP Service
   > Seems to be a guide about using AI agents with the launcher tool_calls
|_ MiuChat
   > "This feature is provided exclusively for internal use within the Shanghai Jiao Tong University Minecraft Club. TBD", nothing else

Other
> Background gallery, changelog, terms of service, and a link to QQ group
```

# Important things to consider/note

- When making a plugin system, make self-contained utils for them. Previously, I just exposed all available variables and libs to `window.__KAEDE__`, and that was it for plugin makers. While it is powerful, adding some useful scoped functions specifically for plugins, such as `App.getPluginConfig()` (which will create (if missing), read, and return a plugin-specific configuration) or `App.addState()` (adds a global state instead of manually doing things like `GlobalStateHelpers.get()["new-field"] = { /* some data */ }`), would be even more convenient.
- `shallowReactive` is cool for global states, but sometimes replacing the whole object just to change deeply nested value is... inconvenient since hooks are executed on those changes. How to deal with it?
- Getting started should probably show useful links as cards, just like HMCL
- Instances structure from nitrolaunch:

```
"id": {
	"type": "client" | "server",
	"from": string | [string],
	"version": string,
	"name": string,
	"icon": string,
	"loader": string,
	"package_stability": "stable" | "latest",
	"launch": {
		"args": {
			"jvm": [string] | string,
			"game": [string] | string
		},
		"memory": string | {
			"init": string,
			"max": string
		},
		"env": { ... },
		"wrapper": {
			"cmd": string,
			"args": [string]
		},
		"java": "auto" | "system" | "adoptium" | string,
		"quick_play": {
			"type": "world" | "server" | "realm",
			"world": string,
			"server": string,
			"port": string,
			"realm": string
		},
		"use_log4j_config": bool
	},
	"window": {
		"resolution": {
			"width": integer,
			"height": integer
		}
	},
	"datapack_folder": string,
	"packages": [ ... ],
	"overrides": {
		"suppress": [string],
		"force": [string]
	},
	"game_dir": string
}
```

Type declarations of an unfinished launcher are located in this folder. All existing docs were located in `./previous-docs/` Previous file structure of the launcher:

```
<directory_structure>
.github/
  workflows/
    build.yml
    compile-txiki.yml
    preview.yml
docs/
  demos/
    misono_mika_l2d_as_a_plugin.mp4
  CODE_OF_CONDUCT.md
  CONTRIBUTING.md
  CREDITS.md
  EXTENSIONS.md
  MULTIMC.md
  PLAN.md
  README.md
  README.ru.md
src/
  __mocks__/
    api/
      window.cjs
    log.cjs
    README.md
  components/
    add-instance/
      sections/
        ChangeCustomOptions.vue
        ChangeInstanceGroups.vue
        ChangeInstanceIcon.vue
        ChangeInstanceName.vue
        ChangeInstancePatch.vue
        ChangeInstanceResolution.vue
        ChangeInstanceVersion.vue
        ChangeInstanceVersionDropdown.vue
        ChangeJavaBinary.vue
        ChangeMemoryAllocation.vue
        CreateInstance.vue
      tabs/
        CleanInstance.vue
      AddInstance.vue
    general/
      base/
        CustomButton.vue
        CustomInput.vue
        Dropdown.vue
        Image.vue
        MaterialRipple.vue
      development-mode/
        DevelopmentMode.vue
        FramesPerSecondCounter.vue
      errors/
        ErrorBoundary.vue
        ExtensionsError.vue
        GlobalError.vue
        PageError.vue
      extensions/
        permissions/
          AllowButton.vue
        CssThemeLoader.vue
        ExtensionLoader.vue
        PermissionsHandler.vue
      layout/
        ContextMenu.vue
        CustomLayout.vue
        GlobalBackground.vue
        LaunchProgress.vue
        Layout.vue
        PagesSelector.vue
        PageTeleports.vue
        PageWrapper.vue
        Router.vue
        Sidebar.vue
        SidebarProfile.vue
        Tabs.vue
      misc/
        ConfigSyncer.vue
        ContextProviders.vue
        NonBundledClasses.vue
    home/
      glance/
        AtAGlance.vue
      instance/
        CurrentInstance.vue
        CurrentPlaytime.vue
        LastPlayed.vue
        Launch.vue
        LaunchOptions.vue
      Home.vue
    library/
      Library.vue
    logging/
      controls/
        LogControls.vue
        LogFilterer.vue
        LogSearcher.vue
      header/
        LogHeader.vue
      lines/
        LogEntry.vue
        LogHighlighter.vue
      wrappers/
        NonVirtualizedLogs.vue
        VirtualizedLogs.vue
      LogViewer.vue
    profile/
      Profile.vue
    settings/
      tabs/
        GeneralSettings.vue
        PluginPlayground.vue
      Settings.vue
    README.md
  constants/
    ui/
      pages.ts
    application.ts
    ascii-art.ts
    browser.ts
    english.json
    event-listeners.ts
    file-structure.ts
    hooks.ts
    launcher.ts
    meta.ts
    permissions.ts
    README.md
    routes.ts
  extendable/
    global-internals.ts
    global-object.ts
  lib/
    browser/
      scopes/
        detect-is-browser.ts
        get-database-store.ts
        handle-body-read.ts
        handle-database.ts
        handle-logs-flush.ts
        handle-tauri-environment.ts
        list-stores.ts
        placeholder-invoke.ts
        read-storage-path.ts
        write-to-storage-path.ts
      index.ts
    configs/
      scopes/
        get-accounts.ts
        get-cached-initial.ts
        get-config-file.test.ts
        get-config-file.ts
        get-default-config.test.ts
        get-default-config.ts
        get-safe-config-file.ts
        get-translations.ts
        initialize-config-file.ts
        regenerate-config-file.ts
      index.ts
    development-mode-helpers/
      scopes/
        disable-debug-mode.ts
        enable-debug-mode.ts
        exit.ts
        get-default-development-states.ts
        handle-native-reload-key-binds.ts
        initialize.ts
      index.ts
    errors/
      scopes/
        extract.test.ts
        extract.ts
        handle-capture.ts
        prettify.ts
        stringify.ts
      index.ts
    extensions-manager/
      scopes/
        events/
          on-global-state-change.ts
          on-instance-state-change.ts
        hooks/
          catch-async-response-hooks.ts
          catch-async-void-hooks.ts
          catch-sync-response-hooks.ts
          catch-sync-void-hooks.ts
          handle-hook-response.ts
        permissions/
          internet.ts
          logging.ts
        txiki/
          get-free-port.ts
          handle-server-process.ts
          serve-code.ts
          serve-file.ts
        grant-event-listeners.ts
        grant-static-permissions.ts
        handle-css-theme.ts
        handle-event.ts
        handle-permission.ts
        lockdown-environment.ts
        read-all-extensions.ts
        read-all-metadata.ts
        request-permissions.ts
        run-in-sandbox.ts
        run-in-unrestricted.ts
        show-webview-window.ts
      index.ts
    general/
      scopes/
        cached-join.ts
        capitalize.ts
        check-days-difference.ts
        check-is-portable.ts
        concurrently-download.ts
        gcd.ts
        get-at-a-glance.ts
        get-base-directory.ts
        get-cached-base-directory.ts
        get-cached-portable.ts
        get-executable-directory.ts
        get-java-major.ts
        get-launcher-version.ts
        get-missing-paths.ts
        get-relative-date.test.ts
        get-relative-date.ts
        get-sha1-mismatches.ts
        get-sidebar-inner-styles.ts
        handle-json-file.ts
        hash-file-contents.ts
        hash-offline-nickname.ts
        hash-string-crypto.ts
        hash-string.ts
        initialize-launcher.ts
        unzip.ts
      index.ts
    global-state-helpers/
      scopes/
        change-global-state.ts
        get-config-global-states.ts
        get-default-global-states.ts
        layout.ts
        logs.ts
        pages.ts
        show-context-menu.ts
      index.ts
    globals/
      scopes/
        cache-launcher-version.ts
        cache-path-join.ts
        declare-globals.ts
        get-launch-count.ts
      index.ts
    instances/
      scopes/
        add-instance-with-sync.ts
        change-instance-state.ts
        create-instance.ts
        extract-saved-from-pages.ts
        find-current.ts
        get-config-instance-states.ts
        get-minecraft-directory.ts
        read-stored-instances.ts
        save-instance-states-to-file.ts
      index.ts
    launcher/
      scopes/
        applet/
          src/
            META-INF/
              MANIFEST.MF
            Main.java
          README.md
        arguments/
          get-additional-start-arguments.ts
          get-class-paths.ts
          get-game-arguments.ts
          get-java-binary.ts
          get-jvm-arguments.ts
          index.ts
          join-arguments.ts
          replace-launch-arguments.ts
          split-arguments.ts
        extractors/
          extract-native-archives.ts
          extract-pre-launch-information.ts
          index.ts
        fetching/
          download-assets.ts
          download-client.ts
          download-libraries.ts
          download-logging.ts
          download-with-progress.ts
          fetch-all-versions.ts
          fetch-metadata.ts
          index.ts
        parsers/
          build-url-from-base.ts
          check-is-native.ts
          finalize-patches.ts
          handle-platform-rule.ts
          index.ts
          normalize-artifact-path.ts
          parse-libraries.ts
          parse-library.ts
          parse-logging.ts
          parse-main-jar.ts
          parse-native.ts
          should-include-library.ts
          unify-platform-with-arch.ts
        patches/
          index.ts
          resolve-patch-version.ts
          resolve-patch.ts
          resolve-sub-patches.ts
        validators/
          ensure-minecraft-directory.ts
          ensure-patch-directories.ts
          index.ts
          initialize-assets-directories.ts
          initialize-short-hash-directories.ts
          shallowly-validate-library.ts
          shallowly-validate-meta.ts
          verify-artifacts.ts
        create-command.ts
        handle-launch.ts
        spawn-minecraft.ts
        use-applet.ts
        use-shell.ts
      index.ts
    logging/
      scopes/
        close-viewer.ts
        get-log-entry-information.ts
        get-log-field-text.ts
        get-log-level-color.ts
        get-log-target-color.ts
        handle-virtual-list-text-selection.ts
        handle-virtual-text-copy.ts
        log.ts
        open-viewer.ts
        read-logs.ts
        select-all-text.ts
        toggle-virtualization.ts
      index.ts
    schemas/
      scopes/
        accounts/
          index.ts
        config/
          development.schema.ts
          extensions.schema.ts
          index.ts
          layout.schema.ts
          logs.schema.ts
          minecraft.schema.ts
          misc.schema.ts
        extensions/
          index.ts
        instances/
          index.ts
        meta/
          asset-index.schema.ts
          index.ts
          library.schema.ts
          logging.schema.ts
          main-jar.schema.ts
          patch-uid.schema.ts
          require.schema.ts
        validate.ts
      index.ts
    README.md
  resources/
    ATLauncherIcon.svg
    FTBIcon.svg
    README.md
  states/
    global.ts
    instance.ts
    plugin-playground.ts
    servers.ts
  types/
    application/
      dropdown-item.type.ts
      global-states.type.ts
      instance-states.type.ts
      route.type.ts
      tab-section.type.ts
    browser/
      database.type.ts
    configs/
      account.type.ts
      config.type.ts
    errors/
      error-handling.type.ts
    extensions/
      custom-theme.type.ts
      event-listeners.type.ts
      extension-info.type.ts
      extension-metadata.type.ts
      hook-return.type.ts
      permission.type.ts
    launcher/
      artifacts/
        asset-objects.type.ts
        mapped-artifact.type.ts
      launch/
        argument-replacements.type.ts
        launch-response.type.ts
        launch-status.type.ts
      meta/
        current-instance.type.ts
        patch-index.type.ts
        pre-launch-information.type.ts
        specific-patch-meta.type.ts
      patch/
        finalized-patch.type.ts
    logging/
      log-button.type.ts
      log-controls.type.ts
      log-entry-information.type.ts
      log-field-text.type.ts
      log-method.type.ts
    misc/
      at-a-glance.type.ts
    schemas/
      validation-arguments.type.ts
    translations/
      translations.type.ts
    utils/
      deep-non-nullable.type.ts
      deep-required.type.ts
      is-key-in-object.ts
    README.md
  App.vue
  declarations.ts
  globals.css
  main.ts
  README.md
  vite-env.d.ts
src-tauri/
  binaries/
    txiki-server-aarch64-apple-darwin
    txiki-server-x86_64-apple-darwin
    txiki-server-x86_64-pc-windows-msvc.exe
    txiki-server-x86_64-unknown-linux-gnu
  capabilities/
    core-app.json
    core-event.json
    core-image.json
    core-menu.json
    core-path.json
    core-resources.json
    core-tray.json
    core-webview.json
    core-window.json
    default.json
    plugin-clipboard-manager.json
    plugin-dialog.json
    plugin-fs.json
    plugin-http.json
    plugin-log.json
    plugin-notification.json
    plugin-opener.json
    plugin-os.json
    plugin-process.json
    plugin-shellx.json
    plugin-upload.json
  icons/
    icon.icns
    icon.ico
  jarfiles/
    launcher.jar
  src/
    launcher.rs
    lib.rs
    main.rs
    system.rs
    zip.rs
  .gitignore
  build.rs
  Cargo.toml
  README.md
  tauri.conf.json
types/
  kaede-lib.d.ts
  README.md
.envrc
.gitignore
eslint.config.js
flake.lock
flake.nix
index.html
kaede-extra.json
LICENSE
package.json
tsconfig.app.json
tsconfig.json
tsconfig.node.json
uno.config.ts
vite.config.ts
vitest.setup.ts
</directory_structure>
```
