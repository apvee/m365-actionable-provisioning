# Fluent UI Context Ownership and Dual-Package Design

**Status:** Approved for implementation planning

**Target package:** `@apvee/spfx-m365-actionable-provisioning`

**Target release:** `2.0.0`

**Working branch:** `dev`

## Problem statement

Version `1.0.0` publishes one CommonJS entry point. Its compiled React components call `require("@fluentui/react-components")`, while the SPFx consumer imports Fluent UI components through ESM. Fluent UI exposes different `import` and `require` branches, so Webpack can include both `lib` and `lib-commonjs` implementations of `@fluentui/react-shared-contexts`, `@fluentui/react-provider`, and `@fluentui/react-portal` in one application bundle.

Those branches create different React Context instances. The package-owned `SPFxFluentProvider` writes the theme class to the CommonJS context, while ESM portals created by consumer components read a different context. `applyStylesToPortals` is enabled, but it cannot bridge two independent context instances.

`ProvisioningDialog` also renders Fluent UI portals through `DialogSurface`. Removing the package-owned provider without adding a real ESM entry point would leave the same failure inside package portals. Provider ownership and dual-format packaging must therefore change in the same release.

## Goals

- Make the application consumer the sole owner of the main React root's `FluentProvider` and `IdPrefixProvider`.
- Remove `SPFxFluentProvider` from the public API in a major release.
- Expose a hook that converts and tracks the SPFx theme without creating or consuming Fluent React Context.
- Keep provider ownership internal to property pane fields, because each field is an autonomous React root.
- Publish authentic ESM and CommonJS JavaScript with shared declaration files.
- Ensure an ESM SPFx/Webpack consumer resolves only Fluent UI ESM branches.
- Verify the packed tarball from clean consumer fixtures rather than importing package sources.
- Support every stable SPFx release from `1.21.1` through the latest stable `1.x` release.
- Preserve SPFx localization and document the breaking migration.

## Non-goals

- Making the entire transitive dependency graph ESM-only. `@apvee/react-layout-kit`, `@apvee/m365-actionable-provisioning`, React 17, and SPFx localization may remain CommonJS or AMD where appropriate.
- Supporting native Node.js execution without the SPFx localized-resource resolver.
- Supporting SPFx beta or release-candidate versions.
- Changing portal mount nodes, copying theme variables manually, adding global CSS, or changing z-index values.
- Refactoring unrelated provisioning behavior or property pane functionality.
- Declaring support for SPFx `2.x` before it exists and is tested.

## Public API and ownership

### Removed API

The following runtime export and type are removed from the package root:

```ts
SPFxFluentProvider
SPFxFluentProviderProps
```

Their source files are deleted rather than retained as a deprecated compatibility wrapper. This is the primary breaking change that requires version `2.0.0`.

### New public API

The package exports one theme-integration hook:

```ts
function useSPFxFluentTheme(context: BaseComponentContext): Theme;
```

The hook:

- Consumes `ThemeProvider.serviceKey` from the supplied SPFx context.
- Reads `tryGetTheme()` for the initial value and again when an effect is established.
- Converts the SPFx theme to a Fluent UI 9 plain theme object.
- Subscribes to `themeChangedEvent` and updates when the theme changes.
- Removes the same observer and handler instances during cleanup.
- Marks the observer disposed and ignores callbacks after cleanup.
- Unsubscribes from the old context and subscribes to the new context when `context` changes.
- Returns only `Theme`; it renders no JSX and owns no portal mount node.

The hook does not import or call `FluentProvider`, `IdPrefixProvider`, portal APIs, or Fluent shared-context hooks.

### Internal mapper

The existing mapper remains internal:

```ts
function createFluentV9ThemeFromSPFxTheme(
  themeVariant: IReadonlyTheme | undefined
): Theme;
```

It is shared by `useSPFxFluentTheme` and the property pane theme controller, but it is removed from `src/utils/index.ts` and from all package-root declarations. Internal unit tests may import its source module directly.

The mapper must remain deterministic, must not mutate its input, and must return `webLightTheme` when SPFx provides no usable theme. It imports `createTheme` and the v8 theme type directly from `@fluentui/theme`, rather than importing the entire `@fluentui/react` umbrella solely for that function.

## Consumer React root

The main application root owns both providers and places package and consumer components below the same boundary:

```tsx
import {
  FluentProvider,
  IdPrefixProvider,
} from "@fluentui/react-components";
import {
  ProvisioningDialog,
  useSPFxFluentTheme,
} from "@apvee/spfx-m365-actionable-provisioning";

const theme = useSPFxFluentTheme(context);
const idPrefix = `wp-${context.instanceId.replace(/-/g, "")}-`;

return (
  <IdPrefixProvider value={idPrefix}>
    <FluentProvider theme={theme} applyStylesToPortals>
      <ApplicationContent />
      <ProvisioningDialog
        open={open}
        onClose={handleClose}
        context={context}
        planTemplate={plan}
      />
    </FluentProvider>
  </IdPrefixProvider>
);
```

The prefix is derived from `context.instanceId`; a constant prefix is not permitted because multiple web part instances can share a page.

Drawer, dialog, menu, popover, combobox, and tooltip components from either the package or the consumer inherit this same provider.

## Autonomous property pane roots

`PropertyPaneProvisioningField` and `PropertyPaneSiteSelectorField` continue to create their own provider boundaries because `ReactDom.render` mounts each field into an independent React root that cannot inherit the web part tree.

Each field retains this internal structure:

```tsx
<IdPrefixProvider value={idPrefix}>
  <FluentProvider theme={theme} applyStylesToPortals>
    <PropertyPaneFieldView />
  </FluentProvider>
</IdPrefixProvider>
```

The fields continue to use `PropertyPaneThemeController` for subscription and disposal. They do not call the public hook and do not reintroduce `SPFxFluentProvider`.

## Package formats

The package produces four output areas:

```text
dist/
├── esm/       ESM JavaScript and source maps
├── cjs/       CommonJS JavaScript and source maps
├── types/     shared declarations
└── loc/       SPFx AMD localization resources
```

Three TypeScript configurations compile the same source tree:

- ESM compilation uses `module: "ESNext"`, preserves `import` and `export`, and emits no declarations.
- CommonJS compilation uses `module: "CommonJS"`, emits `require`/`exports`, and emits no declarations.
- Types compilation uses `emitDeclarationOnly` and writes to `dist/types`.

The package format is unambiguous through package boundaries. The root package is ESM-aware, while `dist/cjs/package.json` declares `{"type":"commonjs"}`. The exact package metadata is:

```json
{
  "type": "module",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

All executable package scripts keep the `.cjs` extension so root `type: "module"` does not reinterpret them.

The clean script removes both `dist` and the legacy `lib` directory. The `files` allowlist includes `dist`, required installation scripts, `README.md`, and `CHANGELOG.md`; it excludes sources, tests, and fixtures.

This ESM contract targets the SPFx/Webpack resolver. Relative output specifiers only need to satisfy that resolver; native Node execution is not a supported runtime because `SPFxProvisioningUIStrings` is supplied by SPFx.

## Dependency policy

React, React DOM, Fluent UI packages, and other runtime libraries shared with the SPFx application remain peer dependencies and are never incorporated into package output.

At minimum, the policy covers:

- `react`
- `react-dom`
- `@fluentui/react-components`
- `@fluentui/react-icons`
- `@fluentui/react-migration-v8-v9`
- `@fluentui/react-motion-components-preview`
- `@fluentui/theme`

Development dependencies mirror the peers solely for building and testing.

`@fluentui/react-migration-v8-v9` declares its own dependency on `@fluentui/react-components`. The artifact tests must therefore prove that the consumer's selected version satisfies and deduplicates that dependency. A correct top-level peer declaration alone is not sufficient evidence.

The two Apvee dependencies may remain CommonJS because they do not import Fluent UI shared contexts. Their format is recorded as a non-blocking limitation rather than expanded into this release.

The package does not add `sideEffects: false` blindly. Source modules include intentional PnP augmentation imports such as `@pnp/sp/webs` and `@pnp/sp/search`; tree-shaking changes require separate evidence from Webpack stats.

## SPFx support policy

All direct `@microsoft/sp-*` peer ranges used by the package become:

```text
>=1.21.1 <2.0.0
```

The initial stable compatibility matrix is:

- `1.21.1`
- `1.22.0`
- `1.22.1`
- `1.22.2`
- `1.23.0`
- `1.23.1`
- `1.23.2`

Beta and RC versions, including the currently published `1.24.0` beta, are excluded. The repository stores the stable matrix explicitly and includes a registry check that reports a stable `>=1.21.1 <2.0.0` version missing from the matrix. A release cannot claim the new version until it has been added and passed.

Build, type-check, and Webpack bundle verification run for every matrix entry. Browser portal tests run against the minimum supported version and the newest stable version in the matrix.

## Localization

`copy-loc.cjs` copies every `.js` and `.d.ts` localization resource from `src/loc` to `dist/loc`. `post-install.cjs`, the demo SPFx configuration, package README, root documentation, and integration documentation reference:

```text
node_modules/@apvee/spfx-m365-actionable-provisioning/dist/loc/{locale}.js
```

The workspace demo may use its relative workspace equivalent. Artifact tests inspect the tarball for the complete locale set and bundle `ProvisioningDialog` through a fixture-provided `SPFxProvisioningUIStrings` resource.

## Test architecture

### Unit tests

Vitest with a React 17-compatible DOM environment covers the mapper, hook, and property pane wrappers.

Mapper tests verify:

- SPFx palette colors become the expected Fluent tokens.
- SPFx font families become the expected Fluent font tokens.
- Missing or invalid themes return the light fallback.
- Nested palette, semantic-color, and font objects remain unchanged.

Hook tests use a mock `ThemeProvider` event surface and verify:

- Initial synchronous theme reading.
- Refresh when the effect subscribes.
- Updates from `themeChangedEvent`.
- Removal with the exact observer and callback references.
- Disposal and no state update after unmount.
- Correct unsubscribe/resubscribe behavior when the context changes.
- The hook module does not render or import provider components.

Property pane tests intercept the React element passed to `ReactDom.render` for both field implementations and verify `IdPrefixProvider`, `FluentProvider`, the mapped theme, and `applyStylesToPortals: true`. Disposal tests verify theme unsubscription and React root unmounting.

### Packed-artifact tests

An integration script performs these operations in an isolated temporary directory:

1. Builds the package.
2. Runs `npm pack --json`.
3. Inspects the tarball allowlist.
4. Creates clean ESM and CommonJS consumer fixtures.
5. Installs the tarball and explicit peer versions.
6. Resolves package files from the fixture's `node_modules`, rejecting workspace links and source paths.
7. Imports the package through ESM and requires it through CommonJS.
8. Verifies that the removed provider and internal mapper are not public exports.
9. Verifies that the public hook and existing public APIs have declarations.
10. Verifies that no nested React or Fluent package copies exist beneath the installed package.

The ESM fixture imports both the Apvee package and Fluent components with `import`. The CommonJS fixture requires both with `require`. Each fixture must select one consistent Fluent format.

### Webpack graph tests

Webpack 5 runs in development mode with condition names and resolution behavior matching the SPFx consumer. Tests analyze `stats.toJson()` module resource identifiers rather than relying only on minified bundle text.

The ESM consumer graph must not contain both `lib` and `lib-commonjs` for any of:

- `@fluentui/react-shared-contexts`
- `@fluentui/react-portal`
- `@fluentui/react-provider`

The ESM graph must select the `lib` variants; the CommonJS graph must select the CommonJS variants. The package's ESM output is scanned recursively to reject `require("@fluentui/...")`. Its CommonJS output is scanned to require actual CommonJS syntax.

`npm ls` and `require.resolve`/`import.meta.resolve` checks complement the Webpack evidence by detecting physical nested copies and version divergence.

### Browser portal tests

Playwright runs a real Chromium page built from the packed-artifact fixture. The page renders a custom test theme under one consumer-owned provider and opens:

- Package portal content through `ProvisioningDialog`.
- Consumer portal content through `OverlayDrawer`.

The test locates each component by its own text or accessible role, then walks to that component's `[data-portal-node="true"]`. It never assumes the first portal belongs to both components.

For each portal it verifies:

- The provider theme class is present on the portal node.
- `--fontFamilyBase` is non-empty and equals the custom test token.
- `--colorNeutralBackground1` is non-empty and equals the custom test token.

Locators wait for portal readiness and token propagation; fixed sleeps are not used.

## Documentation and migration

The package README, root README, SPFx integration guide, provisioning-dialog guide, introduction, and demo app are updated together.

The migration guide instructs `1.x` consumers to:

1. Remove `SPFxFluentProvider` imports and JSX.
2. Import `useSPFxFluentTheme` from the package.
3. Import `FluentProvider` and `IdPrefixProvider` directly from Fluent UI.
4. Create an instance-specific prefix from `context.instanceId`.
5. Place application content and `ProvisioningDialog` below the same provider.
6. Change localized-resource paths from `lib/loc` to `dist/loc`.

A package-level `CHANGELOG.md` records the `2.0.0` breaking changes, ESM/CommonJS exports, new hook, localization path, and SPFx peer range.

## Release gates

The release is blocked unless all of the following pass:

- Unit tests for mapper, hook, and property pane roots.
- TypeScript ESM, CommonJS, and declaration builds.
- Packed-artifact ESM and CommonJS smoke tests.
- Tarball contents and localization checks.
- Full stable SPFx compatibility matrix.
- Webpack module-graph duplication assertions.
- Browser portal tests on minimum and latest stable SPFx versions.
- Package README and migration documentation checks.
- A clean Git working tree apart from intended release files.

## Acceptance criteria

- `SPFxFluentProvider` and its props are absent from runtime exports and declarations.
- `useSPFxFluentTheme` is public and returns only a plain Fluent `Theme`.
- The mapper and property pane controller are internal.
- The main consumer React root owns exactly one provider boundary.
- Both property pane roots remain independently themed.
- `exports.import` points to authentic ESM and `exports.require` points to authentic CommonJS.
- The packed ESM output contains no `require("@fluentui/react-components")`.
- Clean ESM and CommonJS fixtures resolve the expected conditional branches.
- No nested React or Fluent copies exist in fixture installations.
- ESM Webpack stats contain only Fluent ESM provider, portal, and shared-context modules.
- Package and consumer portals each receive the provider theme class and required CSS variables.
- All stable SPFx versions from `1.21.1` through the latest stable `1.x` matrix entry pass.
- Localization loads from `dist/loc`.
- Version, changelog, README, migration guide, and demo consistently describe `2.0.0`.

## Risks and mitigations

- **Conditional exports select an unexpected branch:** prove the selected resource paths through clean Webpack fixtures and stats.
- **A transitive Fluent dependency installs a nested copy:** install explicit peers, run `npm ls`, and assert resolved real paths.
- **Portal tests pass against the wrong node:** anchor each portal to distinct accessible content before checking tokens.
- **Dual TypeScript output becomes ambiguous:** use explicit package boundaries and syntax scans.
- **Localization breaks after moving `lib`:** update every known reference and bundle the packed fixture with a localized-resource mock.
- **Future SPFx stable releases enter the peer range untested:** compare the maintained matrix with stable registry versions and block releases when it is stale.
- **Tree-shaking drops PnP augmentations:** avoid an unsupported `sideEffects: false` declaration in this change.
