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

- `$` prefix = **reactive** (re-assigning will trigger Vue reactivity system. The prefix was inspired by Svelte - `$state`)
- No prefix = **non-reactive** (re-assigning won't trigger Vue reactivity system. Which means, no hooks will be called)

```ts
import { reactive, markRaw } from "vue";

const globalState = reactive({
  $layout      : { $background: { $url: null } },
  $logs        : { $debugMode: true, messages: markRaw([ /* lots of data */ ]) },
  $translations: markRaw({ /* ... */ }),
});
```

#### Considerations

- Plugins must use the provided setter methods for raw fields. Direct mutation of raw fields will not trigger Vue re-renders or hooks. The plugin API documentation must make this clear.

### Plugin Reactivity API: Hooks vs Subscriptions

Reactive and non-reactive fields have fundamentally different mutation semantics. Therefore, they use two separate plugin mechanisms.

#### The core difference

- **Raw fields** → mutations go through **setter methods** → plugins can **intercept** (before/after, cancel)
- **`$` reactive fields** → mutations happen **directly** → plugins can only **observe** (after the fact)

A "before" hook that cancels a direct mutation like `globalState.$sidebar.$width = 300` is not possible — the mutation already happened by the time anything fires. Vue's `watch` only notifies after the change.

#### Raw fields: Hooks (intercept)

The existing hook system (sync/async x void/response, before/after timing) applies here.

#### `$` reactive fields: Subscriptions (observe)

Expose a thin wrapper around Vue's `watch`. Plugins subscribe to changes and react, but they cannot cancel them:

```ts
// Launcher provides this
function subscribe({
  path,
  callback,
}: {
  "path"    : string;
  "callback": (data: { from: unknown, to: unknown }) => void;
}): void {
  // internally uses Vue's watch() on the resolved path
  return watch(
    () => getNestedValue(globalState, path),
    (data: { from: unknown, to: unknown }) => callback(data),
    { deep: true },
  );
}

// Plugin usage
const unsubscribe = App.subscribe("$sidebar.$width", ({ from, to }) => {
  console.log(`Sidebar changed from ${from} to ${to}`);
});
```

The returned function is an unsubscribe handle. The launcher tracks all subscriptions per plugin and cleans them up on plugin unload.

#### Summary

|                  | Reactive fields (`$`)          | Raw fields                        |
|------------------|--------------------------------|-----------------------------------|
| Mutation         | Direct                         | Through setter methods            |
| Plugin mechanism | **Subscribe** (observe after)  | **Hook** (intercept before/after) |
| Can cancel?      | No                             | Yes (before hook returns "stop")  |
| Can subscribe?   | Yes                            | Yes (fires after hooks)           |
| Vue reactivity   | Automatic                      | On reassignment                   |
| Use case         | Always unless the data is huge | Only if the data is huge          |

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

## References

- HMCL docs: https://docs.hmcl.net/
- nitrolaunch docs: https://nitrolaunch.github.io/nitrolaunch/
- SJMCL docs: (Shanghai Jiao Tong University Minecraft Club launcher)
- Previous Kaede docs: `src/temporary/previous-docs/`
- Previous Kaede code (hooks): `src/temporary/previous-code/hooks/`
- Launcher comparison list: https://mc-launcher.tayou.org/
