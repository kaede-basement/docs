# Research & Decisions

This document covers research findings from analyzing other Minecraft launchers and architectural decisions made during the early design phase of Kaede.

## Launcher Documentation Comparison

Several popular Minecraft launchers were studied to understand how they structure their documentation and features. The full research is available in `src/temporary/temporary.md`.

### HMCL

[HMCL](https://docs.hmcl.net/) has a user-oriented documentation structure:

- **FAQ** section with common questions (account login, game download, mod/resourcepack info, Java installation, etc.)
- **Starter packs** presented as cards linking to useful pages per topic (user, integration, multiplayer)
- **User Help** covering various Minecraft and launcher topics (auth, instances, mod loaders, shaders, launch configurations, etc.)
- **Developer Help** limited to HMCL-compatible instance import/export
- **Changelog** per version
- **Other**: user agreement, contribution guide, website/GitHub links

Takeaway: card-based navigation for getting started is a good UX pattern worth adopting.

### nitrolaunch

[nitrolaunch](https://nitrolaunch.github.io/nitrolaunch/) is the most technically detailed among the studied launchers:

- **Features** with brief explanations (low-level IO config, shared worlds)
- **User Guide** as a short walkthrough
- **Patches** explaining a MultiMC-like patch concept with script support (`@meta`, `@properties`, `@install`)
- **Plugins** documenting a Rust-based plugin system with JS GUI invokes, plus descriptions of existing plugins
- **Configuration** covering launcher configuration structure, including instances
- **Loaders** specifying supported/unsupported mod loaders
- **Principles** resembling business requirements

Takeaway: their instance configuration structure is a useful reference (see the full JSON schema in `src/temporary/temporary.md`).

### PrismLauncher

PrismLauncher's documentation is mostly FAQ and GUI explanations with nothing deeply technical. They did not document their own launch process. The full MultiMC/Prism patch system was reverse-engineered independently and documented in `src/temporary/previous-docs/MULTIMC.md`.

### SJMCL

SJMCL has a standard structure (introduction, download/install, beginner's guide, mod loaders). Notable for having an **AI/MCP integration** section for using AI agents with launcher tool calls.

## Documentation Plan

### Approach

1. **Feature comparison table** — compare features across launchers. Columns: feature name, which launchers support it, how Kaede plans to handle it (native, via plugin, not planned), priority level. This doubles as a requirements document and communicates Kaede's value proposition.
2. **Prototype design** — after the comparison table is finalized, create a prototype design for the launcher.
3. Further steps are to be decided.

### Proposed Documentation Structure

The documentation should be split into four areas:

- **User Docs** — getting started (card-based navigation like HMCL), FAQ, user guides
- **Plugin Developer Docs** — extension system, hooks API, permissions, sandboxed vs unrestricted environments. This is Kaede's unique selling point and deserves the most attention
- **Launcher Internals** — technical documentation for contributors (e.g., MultiMC patch system)
- **Design Docs** — requirements, architecture decisions, comparison tables

## Architectural Decisions

### Global State Management: `reactive` + `markRaw`

#### Problem

Using `shallowReactive` for global states means that changing a deeply nested value (e.g., `state.settings.ui.sidebar.width = 300`) does not trigger Vue's reactivity. The entire top-level object must be replaced, which:

- Requires inconvenient boilerplate (cloning and reassigning)
- Fires hooks for the entire object even when only one small nested value changed
- Is especially painful for plugin developers who must reconstruct objects they barely understand

However, using fully deep `reactive` is also not ideal because global states store large data, and making all of that deeply reactive would be a significant performance waste.

#### Solution

Use Vue's `reactive` for the global state object, but opt out of deep reactivity on heavy fields using `markRaw`.

To make it immediately clear which fields are deeply reactive and which are raw, use a naming convention:

- `$` prefix = **reactive** (deeply tracked by Vue, assigning triggers reactivity. Inspired by Svelte's `$state`)
- `_$` prefix = **markRaw** (reactive at the property level — reassigning triggers Vue — but internals are NOT tracked. Used for large data like instance lists, translation tables, log arrays)
- No prefix = **non-reactive** (inside a `_$` markRaw object. Assigning won't trigger Vue on its own — the setter handles reactivity by shallow-cloning the nearest `_$` parent)

```ts
import { reactive, markRaw } from "vue";

const globalState = reactive({
  $layout      : { $background: { $url: null } },
  $logs        : { $debugMode: true, _$messages: markRaw([ /* lots of data */ ]) },
  $instances   : { _$list: markRaw([ /* instance objects */ ]) },
  _$translations: markRaw({ /* ... */ }),
});
```

#### Considerations

- `globalState` IS exposed to plugins. Plugins mutate state directly (e.g., `globalState.$layout.$background.$url = null`), and Vue's reactivity handles the rest.
- For `_$` (markRaw) fields, plugins must reassign the `_$` field with a shallow clone to trigger Vue: `globalState.$instances._$list = markRaw([...globalState.$instances._$list])`. A helper like `App.touch("$instances._$list")` may be provided to simplify this.
- Intercepting state changes (before/after hooks on mutations) was considered but discarded — see "Plugin Reactivity API" below.

### Plugin Reactivity API: Subscriptions

#### Evolution of this decision

1. **Hooks vs Subscriptions (first approach)**: split into two systems — hooks (intercept, cancel) for raw fields, subscriptions (observe-only) for reactive fields. Discarded because maintaining two mechanisms was complex.

2. **Unified Hooks (second approach)**: hide `globalState` from plugins, force all mutations through `App.state.set(path, value)`, enabling before/after hooks with cancellation on ALL fields. This required building a custom setter with path parsing, `parsePath`, chain arrays, and prefix-based dispatch logic. Discarded because the setter was turning into its own mini scripting language for a use case (intercepting state changes) that would occur extremely rarely in practice.

3. **Direct access + Subscriptions (current approach)**: expose `globalState` directly. Plugins mutate state using plain JavaScript assignments. Vue's reactivity system already handles change detection and re-rendering. Plugins can subscribe to changes using a thin wrapper around Vue's `watch`. No interception, no cancellation — if a plugin truly needs to intercept changes, it can override the property setter itself.

#### Current approach

```ts
// Direct mutation — Vue handles everything
globalState.$layout.$background.$url = "https://example.com/bg.png";
globalState.$sidebar.$width = 300;

// Subscribe to changes (thin wrapper around Vue's watch)
const unsubscribe = App.subscribe("$sidebar.$width", ({ from, to }) => {
  console.log(`Sidebar changed from ${from} to ${to}`);
});

// Unsubscribe when done (also auto-cleaned on plugin unload)
unsubscribe();
```

#### Why interception was dropped

- State change interception would occur extremely rarely in real plugins
- Building a full setter/getter system with path parsing was overengineering
- Vue's reactive proxy already handles change detection, re-rendering, and subscriber notification
- If a plugin genuinely needs to intercept, it can use JavaScript's own `Object.defineProperty` or a Proxy on the specific field

#### Summary

|                    | All fields                                    |
|--------------------|-----------------------------------------------|
| Mutation           | Direct assignment                             |
| Plugin mechanism   | **Subscribe** (observe via Vue `watch`)       |
| Can cancel?        | No (use property setter override if needed)   |
| Direct access?     | Yes — `globalState` is exposed to plugins     |

### Plugin System Notes

From the research and previous implementation, the following notes were made:

- **Self-contained plugin utils are important.** Previously, everything was exposed via `window.__KAEDE__` with no scoped helpers. Adding plugin-scoped functions like this would significantly improve the plugin developer experience:

```
extension.pass({
  "scopedThis": {
    "App": {
      "PluginDirectory": "...",
      "addState"       : (path, value) => {
        // Add the field to global states
      },
      "getPluginConfig": async () => {
        // Read `config.json` in the plugin-specific folder
        // Re-create if missing the file/folder
        // Parse the config and return it
      },
    },
  },
});

await extension.run();
```

- **Two environments**: sandboxed (Secure ECMAScript, permission-based) for KAUR plugins, and unrestricted (`new Function` / Module Federation Runtime) for trusted plugins.
- **Hook system**: four variants (sync/async x void/response) with before/after timing. Response hooks can stop the chain by returning a `Stop` status.

For the unrestricted plugins, the chaining API looks like this:

```ts
// main entry point of a plugin code (main.ts)
import NewPage from ".../new-page.vue";
import MySidebar from ".../my-sidebar.vue";
import SettingsTab from ".../settings-tab.vue";

const { App, globalState } = scopedThis;

App
  // Lifecycle events (IDs allow targeted removal and overwriting)
  .on("plugin:reload", { "id": "1", "callback": async () => {} })
  .on("plugin:unload", { "id": "1", "callback": async () => {} })
  .on("app:reload", { "id": "1", "callback": async () => {} })
  .on("app:error", { "id": "1", "callback": async ({ severity, message }) => {} })

  // Register Vue components (makes them available for .page(), .override(), etc.)
  .registerComponent("NewPage", NewPage)
  .registerComponent("MySidebar", MySidebar)
  .registerComponent("SettingsTab", SettingsTab)

  // Pages & component overrides
  .page("mcp", "NewPage")
  .override("sidebar", "MySidebar")
  .settings("$myNewTab", { "label": "New Tab", "icon": "i-lucide-cube" }, "SettingsTab")

  // Hooks (for launcher events, not state changes)
  .hook("app:navigation", { "id": "1", "timing": "before", "callback": ({ from, to }) => {} })
  .hook("app:navigation", { "id": "2", "timing": "after", "callback": async ({ from, to }) => {} })

  // Subscribe to state changes (observe-only, wraps Vue's watch)
  .subscribe("$sidebar.$width", { "id": "1", "callback": ({ from, to }) => {} })

  // CSS injection
  .style({ "id": "1", "code": "#app { /* ... */ }" })

  // Commands (for keybinds / other plugins)
  .command("doTheThing", () => {})

  .run();

// Direct state mutation — Vue handles reactivity
globalState.$layout.$background.$url = "https://example.com/bg.png";

// For _$ (markRaw) fields, reassign with shallow clone to trigger Vue
globalState.$instances._$list[0].name = "new name";
globalState.$instances._$list = markRaw([...globalState.$instances._$list]);
```

Note: plugin metadata (id, version, authors, permissions, etc.) is NOT registered via code. It lives in the plugin's manifest file. Permissions for sandboxed plugins can be extended at runtime via `requestPermissions()`, which prompts the user with a modal.

#### Sharing Vue & Registering components

OH MY GOT IT WORKED I DON'T NEED MODULE FEDERATION ANYMORE. THANK YOU THANK YOU :3333333333333333333 This is how I did it:
```
// main.ts of Kaede
const AppInstance = createApp(App);

// @ts-expect-error For testing purposes
window.__KAEDE__.appInstance = AppInstance;
```
```
// App.vue of Kaede
// @ts-expect-error For testing purposes
window.__KAEDE__.vue = Vue;
// @ts-expect-error For testing purposes
window.__KAEDE__.registerComponent = (name: string, component: Vue.Compone
// @ts-expect-error For testing purposes
window.__KAEDE__.appInstance?.component?.(name, component);
};
```
```
// main.ts of a plugin
import './assets/main.css'

import App from './App.vue'

// @ts-ignore
const { registerComponent } = window.__KAEDE__;

console.log("uhh 1");

registerComponent("cvnny", App);

console.log("uhh 2");
```
and used <component :is="page" /> (where page would be the name of a regis

## Plugin API Structure

### Design principles

1. **Direct `globalState` access** — plugins mutate state with plain assignments. Vue's reactivity handles change detection and re-rendering. No custom setter/getter layer.
2. **Metadata in manifest, not code** — id, version, authors, permissions, categories, etc. live in a JSON manifest file. Sandboxed plugins can extend permissions at runtime via `requestPermissions()`
3. **Method chaining** — inspired by Elysia.js, `.method().method().run()` pattern makes plugin capabilities immediately readable
4. **Automatic cleanup** — everything registered through the chain is tracked and torn down on plugin unload. IDs allow targeted mid-lifecycle removal when needed.
5. **Subscriptions over interception** — plugins observe state changes via `App.subscribe()` (wraps Vue `watch`), not intercept them. Interception was deemed too rare to justify the infrastructure.

### Plugin manifest (JSON)

```json
{
  "id": "my-plugin",
  "logo": "",
  "name": "My Plugin",
  "type": "unrestricted",
  "source": "https://github.com/author",
  "version": "0.1",
  "authors": ["author"],
  "languages": ["en"],
  "categories": ["customization"],
  "enabled": false
}
```

Sandboxed plugins additionally declare `"permissions": [...]` in the manifest.

### `App` object (provided to every plugin)

```ts
App.log.info(message)
App.log.error(message)
App.log.warn(message)
App.log.debug(message)

App.subscribe(path, opts)            // observe state changes (wraps Vue watch)
App.touch(path)                      // shallow-clone a _$ field to trigger Vue

App.layout.setBackground(opts)
App.layout.toggle(elements)

App.navigation.current()
App.navigation.go(path)
App.navigation.override(handler)

App.path.join(...segments)
App.path.baseDir()

App.window.current()
App.window.create(id, opts)          // permission-gated
App.window.setDecorations(bool)      // permission-gated

App.fs.*                             // permission-gated
App.clipboard.*                      // permission-gated
App.shell.*                          // permission-gated

App.requestPermissions(perms)        // prompt user for additional permissions
```

`globalState` is also provided via `scopedThis` for direct mutation.

### Chaining API methods

| Method | Purpose |
|--------|---------|
| `.on(event, opts)` | Listen to lifecycle/app events (with ID for removal) |
| `.registerComponent(name, Component)` | Register a Vue component for use in pages/overrides |
| `.page(id, componentName)` | Register a page |
| `.override(target, componentName)` | Override a built-in component |
| `.settings(tabId, opts, componentName)` | Add a settings tab |
| `.hook(event, opts)` | Hook into app events (navigation, etc.) with before/after timing |
| `.subscribe(path, opts)` | Observe state changes |
| `.style(opts)` | Inject CSS |
| `.command(name, fn)` | Register a command (for keybinds / other plugins) |
| `.run()` | Finalize and activate (tracks everything for auto-cleanup) |

### Hot reload (development)

In development, Kaede watches plugin output files using Tauri's `fs.watch`. When a file changes:

1. Call the plugin's `onUnload` handlers
2. Tear down everything the plugin registered (hooks, pages, sidebar items, styles, components)
3. Read the new code via `readTextFile`
4. Execute it via `new Function(code)()`
5. The new code calls `.run()` → re-registers everything

Plugin developers run `vite build --watch` and symlink their `dist/` into Kaede's extensions folder. Edit → save → Vite rebuilds → Kaede reloads. No manual copying or window reloads.

### Sharing Vue with plugins

Kaede exposes Vue via `window.__KAEDE__.vue` and provides `registerComponent(name, component)`. Plugins externalize `vue` in their Vite config:

```js
// vite.config.ts of a plugin
_ = {
  rollupOptions: {
    external: ["vue"],
    output: {
      format: "iife",
      globals: { vue: "window.__KAEDE__.vue" },
    },
  }
};
```

Plugin CSS is bundled inline via `import style from './main.css?inline'` and injected through the `.style()` chain method.

### Log Viewer

Make two states:

```ts
const logs = shallowRef<Array<string>>([]);
const logCount = ref<number>(0);
```

on every log message, do:

```ts
logCount.value = logs.value.length;
```

Then use `logCount` in your own log viewer implementation to manage the empty container height, and display corresponding lines in the virtual viewer.

## References

- HMCL docs: https://docs.hmcl.net/
- nitrolaunch docs: https://nitrolaunch.github.io/nitrolaunch/
- SJMCL docs: (Shanghai Jiao Tong University Minecraft Club launcher)
- Previous Kaede docs: `src/temporary/previous-docs/`
- Previous Kaede code (hooks): `src/temporary/previous-code/hooks/`
- Launcher comparison list: https://mc-launcher.tayou.org/
