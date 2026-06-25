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

However, using fully deep `reactive` is also not ideal because global states store large data (arrays of instances, thousands of log entries, plugin metadata, etc.), and making all of that deeply reactive would be a significant performance waste.

#### Solution

Use Vue's `reactive` for the global state object, but opt out of deep reactivity on heavy fields using `markRaw`.

To make it immediately clear which fields are deeply reactive and which are raw, use a naming convention:

- `$` prefix = **deeply reactive** (inspired by Svelte's `$state` convention)
- `_` prefix = **raw** (marked with `markRaw`, needs explicit setters)

```ts
import { reactive, markRaw } from "vue";

const globalState = reactive({
  // $ = deeply reactive: small UI-relevant data, mutations trigger Vue automatically
  $currentPage: "home",
  $sidebar: { expanded: true, width: 240 },
  $theme: { name: "dark", accent: "#a1fee4" },

  // _ = raw: heavy data, no deep reactivity overhead
  _instances: markRaw([/* hundreds of instance objects */]),
  _logs: markRaw([/* thousands of log entries */]),
  _plugins: markRaw([/* plugin metadata */]),
});
```

#### How it works

- **`$` fields** (deeply reactive, small UI state): mutating `globalState.$sidebar.width = 300` triggers Vue reactivity automatically. No cloning needed.
- **`_` fields** (raw, heavy data): mutating `globalState._instances[0].name = "blah"` does nothing reactively, which is desired for performance. To trigger both Vue re-renders and hooks, use an explicit setter that reassigns the raw reference:

```ts
function updateInstances(mutator: (instances: Instance[]) => void) {
  // fire "before" hooks
  mutator(globalState._instances);
  // reassign to trigger Vue reactivity:
  globalState._instances = markRaw(globalState._instances);
  // fire "after" hooks
}
```

#### Benefits

- **Hooks stay clean** — heavy data changes go through explicit setter methods where hooks are fired. Light UI state usually does not need hooks.
- **Plugins get a sane API** — `App.updateInstances(...)` instead of reconstructing entire objects.
- **Performance is good** — only deliberately unmarked (small) fields get deep tracking.
- **Vue rendering works** — raw fields re-render on reassignment; reactive fields re-render on any mutation.

#### Considerations

- Plugins must use the provided setter methods for raw fields. Direct mutation of raw fields will not trigger Vue re-renders or hooks. The plugin API documentation must make this clear.
- As an extra safety measure, raw objects could be frozen and only unfrozen inside setter methods.

#### Mixed nesting

It is possible to combine both conventions in a nested structure. For example, an `$instances` field that is reactive at the top level but has a heavy raw list inside:

```ts
const globalState = reactive({
  $instances: {
    current: "my-server",          // reactive, direct mutation OK
    _list: markRaw([/* ... */]),   // raw, needs setter
  },
});
```

- `globalState.$instances.current = "other"` → triggers Vue automatically, plugins subscribe
- `globalState.$instances._list` → needs `App.updateInstanceList(...)` → plugins hook

### Plugin Reactivity API: Hooks vs Subscriptions

`$` reactive fields and `_` raw fields have fundamentally different mutation semantics. Therefore, they use two separate plugin mechanisms.

#### The core difference

- **`_` raw fields** → mutations go through **setter methods** → plugins can **intercept** (before/after, cancel)
- **`$` reactive fields** → mutations happen **directly** → plugins can only **observe** (after the fact)

A "before" hook that cancels a direct mutation like `globalState.$sidebar.width = 300` is not possible — the mutation already happened by the time anything fires. Vue's `watch` only notifies after the change.

#### `_` raw fields: Hooks (intercept)

The existing hook system (sync/async x void/response, before/after timing) applies here. Setter functions fire hooks. Plugins can cancel or transform via response hooks:

```ts
// Launcher provides this
function updateInstances(mutator: (instances: Instance[]) => void) {
  const response = catchSyncResponseHooks({ scope: "instances", timing: "before", toPass: { ... } });
  if (response === "stop") return;

  mutator(globalState.$instances._list);
  globalState.$instances._list = markRaw(globalState.$instances._list);

  catchAsyncVoidHooks({ scope: "instances", timing: "after", toPass: { ... } });
}
```

#### `$` reactive fields: Subscriptions (observe)

Expose a thin wrapper around Vue's `watch`. Plugins subscribe to changes and react, but they cannot cancel them:

```ts
// Launcher provides this
function subscribe(
  path: string,
  callback: (newVal: unknown, oldVal: unknown) => void,
): () => void {
  // internally uses Vue's watch() on the resolved path
  return watch(
    () => getNestedValue(globalState, path),
    (newVal, oldVal) => callback(newVal, oldVal),
    { deep: true },
  );
}

// Plugin usage
App.subscribe("$sidebar.width", (newVal, oldVal) => {
  console.log(`Sidebar changed from ${oldVal} to ${newVal}`);
});
```

The returned function is an unsubscribe handle. The launcher tracks all subscriptions per plugin and cleans them up on plugin unload.

#### Subscribing to `_` raw fields

Plugins that only want to observe `_` field changes (without needing to intercept) can use the same `App.subscribe()` API. The setter notifies subscribers after hooks complete:

```ts
function updateInstances(mutator: (instances: Instance[]) => void) {
  // hooks (intercept) — can cancel
  catchHooks({ scope: "instances", timing: "before" });

  mutator(globalState.$instances._list);
  globalState.$instances._list = markRaw(globalState.$instances._list);

  catchHooks({ scope: "instances", timing: "after" });

  // subscriptions (observe) — fire after hooks complete
  notifySubscribers("$instances._list");
}
```

#### Summary

| | `$` reactive fields | `_` raw fields |
|---|---|---|
| Mutation | Direct | Through setter methods |
| Plugin mechanism | **Subscribe** (observe after) | **Hook** (intercept before/after) |
| Can cancel? | No | Yes (before hook returns "stop") |
| Can subscribe? | Yes | Yes (fires after hooks) |
| Vue reactivity | Automatic | On reassignment |
| Use case | UI state, lightweight | Heavy data, lists, configs |

### Plugin System Notes

From the research and previous implementation, the following notes were made:

- **Self-contained plugin utils are important.** Previously, everything was exposed via `window.__KAEDE__` with no scoped helpers. Adding purpose-built functions like `App.getPluginConfig()` (creates, reads, and returns a plugin-specific config) or `App.addState()` (adds a global state without manual `GlobalStateHelpers.get()` manipulation) would significantly improve the plugin developer experience.
- **Two environments**: sandboxed (Secure ECMAScript, permission-based) for KAUR plugins, and unrestricted (`new Function` / Module Federation Runtime) for trusted plugins.
- **Hook system**: four variants (sync/async x void/response) with before/after timing. Response hooks can stop the chain by returning a `Stop` status.

## References

- HMCL docs: https://docs.hmcl.net/
- nitrolaunch docs: https://nitrolaunch.github.io/nitrolaunch/
- SJMCL docs: (Shanghai Jiao Tong University Minecraft Club launcher)
- Previous Kaede docs: `src/temporary/previous-docs/`
- Previous Kaede code (hooks): `src/temporary/previous-code/hooks/`
- Launcher comparison list: https://mc-launcher.tayou.org/
