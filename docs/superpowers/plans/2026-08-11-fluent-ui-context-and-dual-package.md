# Fluent UI Context Ownership and Dual-Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Release `@apvee/spfx-m365-actionable-provisioning@2.0.0` with consumer-owned Fluent providers, a public SPFx theme hook, authentic ESM/CommonJS outputs, and packed-artifact proof that Fluent contexts and portals are not duplicated.

**Architecture:** Move SPFx theme observation into a public hook and keep the pure mapper internal; the consumer owns the main `FluentProvider`, while autonomous property pane roots retain private providers. Compile the source three times for ESM, CommonJS, and declarations, then verify the packed tarball through clean ESM/CommonJS Webpack consumers, real-browser portal tests, and the supported SPFx version matrix.

**Tech Stack:** TypeScript 5.3, React 17, Fluent UI 9, SPFx 1.21.1–1.23.2, Vitest 4, JSDOM 30, Webpack 5 with ts-loader 9, Playwright 1.62, npm workspaces.

## Global Constraints

- Work only on the existing `dev` branch; do not create or switch branches.
- Implement with TDD and keep each task in its own commit.
- Remove `SPFxFluentProvider` and `SPFxFluentProviderProps` immediately; release as `2.0.0`.
- Export `useSPFxFluentTheme(context: BaseComponentContext): Theme` publicly.
- Keep `createFluentV9ThemeFromSPFxTheme(themeVariant: IReadonlyTheme | undefined): Theme` internal.
- The main React root's `FluentProvider` and `IdPrefixProvider` belong to the consumer.
- Property pane fields retain private `IdPrefixProvider` and `FluentProvider` boundaries with `applyStylesToPortals={true}`.
- Publish `dist/esm`, `dist/cjs`, `dist/types`, and `dist/loc`; never publish a default-only CommonJS root.
- Keep React, React DOM, Fluent, Apvee UI, SPFx, and PnP shared runtimes external as peer dependencies.
- Use SPFx peer ranges `>=1.21.1 <2.0.0` and test every stable version listed in `test/compatibility/spfx-versions.json`.
- Exclude beta and RC SPFx releases.
- Test the `.tgz` produced by `npm pack`; source-only tests do not satisfy artifact acceptance.
- Do not add global CSS, copy theme variables, force portal mount nodes, or adjust z-index as a fix.
- Do not add `sideEffects: false` in this change because PnP augmentation imports are intentionally side-effectful.
- ESM compatibility targets SPFx/Webpack; native Node execution without `SPFxProvisioningUIStrings` is not a supported runtime.

---

## File map

### New production files

- `packages/spfx-m365-actionable-provisioning/src/internal/theme/createFluentV9ThemeFromSPFxTheme.ts` — internal pure SPFx-to-Fluent mapper.
- `packages/spfx-m365-actionable-provisioning/src/hooks/useSPFxFluentTheme/useSPFxFluentTheme.ts` — public theme observation hook.
- `packages/spfx-m365-actionable-provisioning/tsconfig.esm.json` — ESM compilation.
- `packages/spfx-m365-actionable-provisioning/tsconfig.cjs.json` — CommonJS compilation.
- `packages/spfx-m365-actionable-provisioning/tsconfig.types.json` — declaration-only compilation.
- `packages/spfx-m365-actionable-provisioning/scripts/write-package-boundaries.cjs` — generated CommonJS package boundary.
- `packages/spfx-m365-actionable-provisioning/CHANGELOG.md` — package release history and migration notice.

### New test and fixture files

- `packages/spfx-m365-actionable-provisioning/vitest.config.ts`
- `packages/spfx-m365-actionable-provisioning/playwright.config.ts`
- `packages/spfx-m365-actionable-provisioning/test/setup.ts`
- `packages/spfx-m365-actionable-provisioning/test/fixtures/SPFxProvisioningUIStrings.ts`
- `packages/spfx-m365-actionable-provisioning/test/unit/harness.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/unit/createFluentV9ThemeFromSPFxTheme.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/unit/useSPFxFluentTheme.test.tsx`
- `packages/spfx-m365-actionable-provisioning/test/unit/public-api.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/unit/property-pane-providers.test.tsx`
- `packages/spfx-m365-actionable-provisioning/test/integration/build-layout.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/integration/post-install.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/artifact/package-artifact.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/artifact/helpers/package-fixture.ts`
- `packages/spfx-m365-actionable-provisioning/test/webpack/consumer-bundle.test.ts`
- `packages/spfx-m365-actionable-provisioning/test/webpack/helpers/build-consumer.ts`
- `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/esm-entry.tsx`
- `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/cjs-entry.cjs`
- `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/browser-entry.tsx`
- `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/useSPFxProvisioningEngine.stub.ts`
- `packages/spfx-m365-actionable-provisioning/test/browser/portal-theme.spec.ts`
- `packages/spfx-m365-actionable-provisioning/test/compatibility/spfx-versions.json`
- `packages/spfx-m365-actionable-provisioning/test/compatibility/spfx-matrix.test.ts`
- `packages/spfx-m365-actionable-provisioning/scripts/check-spfx-registry.cjs`
- `packages/spfx-m365-actionable-provisioning/scripts/check-release-docs.cjs`

### Removed production files

- `packages/spfx-m365-actionable-provisioning/src/components/SPFxFluentProvider/SPFxFluentProvider.tsx`
- `packages/spfx-m365-actionable-provisioning/src/components/SPFxFluentProvider/SPFxFluentProvider.types.ts`
- `packages/spfx-m365-actionable-provisioning/src/utils/spfx-theme.ts`

---

### Task 1: Establish the test harness

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/package.json`
- Modify: `package-lock.json`
- Create: `packages/spfx-m365-actionable-provisioning/vitest.config.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/setup.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/fixtures/SPFxProvisioningUIStrings.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/unit/harness.test.ts`

**Interfaces:**
- Consumes: current npm workspace and React 17 package setup.
- Produces: `npm run test:unit -w @apvee/spfx-m365-actionable-provisioning` and a localization alias reusable by later tests.

- [ ] **Step 1: Install the explicit test toolchain**

Run:

```bash
npm install --save-dev --workspace @apvee/spfx-m365-actionable-provisioning vitest@4.1.10 jsdom@30.0.1 @playwright/test@1.62.1 webpack@5.109.2 webpack-cli@7.2.2 ts-loader@9.6.2
```

Expected: `package.json` and `package-lock.json` record the tools as dev dependencies; no runtime dependency changes.

- [ ] **Step 2: Add a failing harness test and scripts**

Add these package scripts:

```json
{
  "test": "npm run test:unit",
  "test:unit": "vitest run test/unit",
  "test:integration": "vitest run test/integration test/artifact test/webpack",
  "test:browser": "playwright test",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:browser"
}
```

Create `test/unit/harness.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs package tests in JSDOM', () => {
    expect(document.createElement('div').nodeName).toBe('DIV');
  });
});
```

Run:

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning
```

Expected: FAIL because Vitest configuration and JSDOM setup do not exist yet.

- [ ] **Step 3: Configure Vitest and the localized-resource fixture**

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      SPFxProvisioningUIStrings: fileURLToPath(
        new URL('./test/fixtures/SPFxProvisioningUIStrings.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});
```

Create `test/setup.ts`:

```ts
import { afterEach } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});
```

Create named top-level localization exports backed by a read-only string proxy:

```ts
const labels = new Proxy<Record<string, string>>({}, {
  get: (_target, property) => String(property),
});

export const ConfirmDialog = labels;
export const LogPanel = labels;
export const ComplianceLogPanel = labels;
export const ProvisioningActivityEntry = labels;
export const ComplianceActivityEntry = labels;
export const ProvisioningDialog = labels;
export const PropertyPaneProvisioningField = labels;
export const SiteSelectorField = labels;
export const NavigationGuard = labels;
```

- [ ] **Step 4: Verify the harness is green**

Run:

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning
```

Expected: one passing harness test and no React/JSDOM warnings.

- [ ] **Step 5: Commit the harness**

```bash
git add package-lock.json packages/spfx-m365-actionable-provisioning/package.json packages/spfx-m365-actionable-provisioning/vitest.config.ts packages/spfx-m365-actionable-provisioning/test
git commit -m "test(spfx): add package test harness"
```

---

### Task 2: Internalize and test the SPFx theme mapper

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/src/internal/theme/createFluentV9ThemeFromSPFxTheme.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/unit/createFluentV9ThemeFromSPFxTheme.test.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/shared/PropertyPaneTheme.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/SPFxFluentProvider/SPFxFluentProvider.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/utils/index.ts`
- Delete: `packages/spfx-m365-actionable-provisioning/src/utils/spfx-theme.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `IReadonlyTheme`, `@fluentui/theme.createTheme`, `createV9Theme`, and `webLightTheme`.
- Produces: internal `createFluentV9ThemeFromSPFxTheme(themeVariant: IReadonlyTheme | undefined): Theme` with no package-root export.

- [ ] **Step 1: Write failing mapper tests**

Create a frozen SPFx theme fixture and assert representative color/font tokens and immutability:

```ts
import { describe, expect, it } from 'vitest';
import { webLightTheme } from '@fluentui/react-components';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import { createFluentV9ThemeFromSPFxTheme } from '../../src/internal/theme/createFluentV9ThemeFromSPFxTheme';

const themeVariant = Object.freeze({
  palette: Object.freeze({
    themePrimary: '#005a9e',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralPrimary: '#242424',
    neutralSecondary: '#616161',
    neutralSecondaryAlt: '#8a8886',
    neutralTertiary: '#a19f9d',
    neutralTertiaryAlt: '#c8c6c4',
    neutralQuaternary: '#d2d0ce',
    neutralLight: '#edebe9',
    neutralLighter: '#f3f2f1',
    neutralLighterAlt: '#faf9f8',
    white: '#ffffff',
    black: '#000000',
  }),
  semanticColors: Object.freeze({ bodyBackground: '#ffffff', bodyText: '#242424' }),
  fonts: Object.freeze({ medium: Object.freeze({ fontFamily: 'SPFx Test Sans', fontSize: '14px' }) }),
  isInverted: false,
} as unknown as IReadonlyTheme);

describe('createFluentV9ThemeFromSPFxTheme', () => {
  it('maps SPFx colors and fonts without mutating the source', () => {
    const before = JSON.stringify(themeVariant);
    const result = createFluentV9ThemeFromSPFxTheme(themeVariant);
    expect(result.colorNeutralForeground1).toBe('#242424');
    expect(result.fontFamilyBase).toContain('SPFx Test Sans');
    expect(JSON.stringify(themeVariant)).toBe(before);
  });

  it('returns the light theme for an absent theme', () => {
    expect(createFluentV9ThemeFromSPFxTheme(undefined)).toBe(webLightTheme);
  });
});
```

Run:

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning -- createFluentV9ThemeFromSPFxTheme
```

Expected: FAIL because the internal module does not exist.

- [ ] **Step 2: Move the mapper behind an internal boundary**

Implement the internal file:

```ts
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import { createTheme, type ITheme as V8Theme } from '@fluentui/theme';
import { type Theme, webLightTheme } from '@fluentui/react-components';
import { createV9Theme } from '@fluentui/react-migration-v8-v9';

export function createFluentV9ThemeFromSPFxTheme(
  themeVariant: IReadonlyTheme | undefined,
): Theme {
  if (!themeVariant) return webLightTheme;

  try {
    const v8Theme: V8Theme = createTheme({
      palette: themeVariant.palette,
      semanticColors: themeVariant.semanticColors,
      fonts: themeVariant.fonts,
      isInverted: themeVariant.isInverted,
    });
    return createV9Theme(v8Theme);
  } catch {
    return webLightTheme;
  }
}
```

Update both internal callers to the new path, delete `src/utils/spfx-theme.ts`, and remove its export from `src/utils/index.ts`.

- [ ] **Step 3: Tighten the direct Fluent dependency surface**

In package peers and dev dependencies:

```json
{
  "@fluentui/theme": "^2.7.2"
}
```

Remove the direct `@fluentui/react` declaration after confirming no source import remains:

```bash
rg -n "@fluentui/react['\"]" packages/spfx-m365-actionable-provisioning/src
```

Expected: no matches.

- [ ] **Step 4: Run mapper tests and the current build**

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning -- createFluentV9ThemeFromSPFxTheme
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: tests pass; the existing CommonJS build still succeeds during this intermediate task.

- [ ] **Step 5: Commit the internal mapper**

```bash
git add package-lock.json packages/spfx-m365-actionable-provisioning
git commit -m "refactor(spfx): internalize Fluent theme mapping"
```

---

### Task 3: Add the public SPFx theme hook

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/src/hooks/useSPFxFluentTheme/useSPFxFluentTheme.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/unit/useSPFxFluentTheme.test.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/hooks/index.ts`

**Interfaces:**
- Consumes: internal mapper and `ThemeProvider.serviceKey`.
- Produces: public `useSPFxFluentTheme(context: BaseComponentContext): Theme`.

- [ ] **Step 1: Write the hook harness and failing lifecycle tests**

Use `ReactDOM.render` and `act` so tests remain React 17-compatible:

```tsx
const ThemeHarness: React.FC<{
  context: BaseComponentContext;
  onTheme: (theme: Theme) => void;
}> = ({ context, onTheme }) => {
  onTheme(useSPFxFluentTheme(context));
  return null;
};
```

The mock provider stores listeners and exposes `emit(theme)`:

```ts
const createThemeProviderMock = (initialTheme: IReadonlyTheme | undefined) => {
  let currentTheme = initialTheme;
  const listeners = new Set<(args: ThemeChangedEventArgs) => void>();
  return {
    tryGetTheme: vi.fn(() => currentTheme),
    themeChangedEvent: {
      add: vi.fn((_observer: ISPEventObserver, handler: (args: ThemeChangedEventArgs) => void) => listeners.add(handler)),
      remove: vi.fn((_observer: ISPEventObserver, handler: (args: ThemeChangedEventArgs) => void) => listeners.delete(handler)),
    },
    emit(theme: IReadonlyTheme | undefined) {
      currentTheme = theme;
      listeners.forEach((handler) => handler({ theme } as ThemeChangedEventArgs));
    },
  };
};
```

Add tests for initial theme, event updates, exact `add`/`remove` references, context replacement, unmount, and invocation of a captured stale callback after unmount.

Run:

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning -- useSPFxFluentTheme
```

Expected: FAIL because the hook and export do not exist.

- [ ] **Step 2: Implement the minimal hook**

```ts
import * as React from 'react';
import {
  type BaseComponentContext,
  type IReadonlyTheme,
  ThemeProvider,
  type ThemeChangedEventArgs,
} from '@microsoft/sp-component-base';
import type { ISPEventObserver } from '@microsoft/sp-core-library';
import type { Theme } from '@fluentui/react-components';
import { createFluentV9ThemeFromSPFxTheme } from '../../internal/theme/createFluentV9ThemeFromSPFxTheme';

function readTheme(context: BaseComponentContext): IReadonlyTheme | undefined {
  return context.serviceScope.consume(ThemeProvider.serviceKey).tryGetTheme();
}

export function useSPFxFluentTheme(context: BaseComponentContext): Theme {
  const [themeVariant, setThemeVariant] = React.useState<IReadonlyTheme | undefined>(() => readTheme(context));

  React.useEffect(() => {
    const provider = context.serviceScope.consume(ThemeProvider.serviceKey);
    let active = true;
    let disposed = false;
    const observer: ISPEventObserver = {
      instanceId: `${context.instanceId}-spfx-fluent-theme`,
      componentId: context.manifest.id,
      get isDisposed() { return disposed; },
      dispose: () => { disposed = true; },
    };
    const handleThemeChanged = (args: ThemeChangedEventArgs): void => {
      if (active && !observer.isDisposed) setThemeVariant(args.theme);
    };

    setThemeVariant(provider.tryGetTheme());
    provider.themeChangedEvent.add(observer, handleThemeChanged);

    return () => {
      active = false;
      provider.themeChangedEvent.remove(observer, handleThemeChanged);
      observer.dispose();
    };
  }, [context]);

  return React.useMemo(
    () => createFluentV9ThemeFromSPFxTheme(themeVariant),
    [themeVariant],
  );
}
```

Export it from `src/hooks/index.ts`.

- [ ] **Step 3: Assert the hook has no provider ownership**

Add a source-boundary test:

```ts
const source = readFileSync(
  new URL('../../src/hooks/useSPFxFluentTheme/useSPFxFluentTheme.ts', import.meta.url),
  'utf8',
);
expect(source).not.toMatch(/FluentProvider|IdPrefixProvider|mountNode/);
```

- [ ] **Step 4: Run hook and full unit tests**

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning
```

Expected: all mapper and hook lifecycle tests pass.

- [ ] **Step 5: Commit the hook**

```bash
git add packages/spfx-m365-actionable-provisioning/src/hooks packages/spfx-m365-actionable-provisioning/test/unit/useSPFxFluentTheme.test.tsx
git commit -m "feat(spfx): expose SPFx Fluent theme hook"
```

---

### Task 4: Remove provider ownership and migrate the demo root

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/test/unit/public-api.test.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/index.ts`
- Delete: `packages/spfx-m365-actionable-provisioning/src/components/SPFxFluentProvider/SPFxFluentProvider.tsx`
- Delete: `packages/spfx-m365-actionable-provisioning/src/components/SPFxFluentProvider/SPFxFluentProvider.types.ts`
- Modify: `apps/test-spfx/src/webparts/testProvisioning/components/TestProvisioning.tsx`

**Interfaces:**
- Consumes: public `useSPFxFluentTheme` from Task 3 and Fluent UI providers owned by the demo consumer.
- Produces: package root without provider exports and a canonical consumer example in the SPFx demo.

- [ ] **Step 1: Write the failing public API test**

```ts
import { describe, expect, it } from 'vitest';
import * as publicApi from '../../src';

describe('public Fluent integration API', () => {
  it('exports the hook but not provider ownership or the internal mapper', () => {
    expect(publicApi.useSPFxFluentTheme).toBeTypeOf('function');
    expect('SPFxFluentProvider' in publicApi).toBe(false);
    expect('createFluentV9ThemeFromSPFxTheme' in publicApi).toBe(false);
  });
});
```

Run:

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning -- public-api
```

Expected: FAIL because `SPFxFluentProvider` is still exported.

- [ ] **Step 2: Remove the provider files and barrel exports**

Delete both provider files and remove these two lines from `src/components/index.ts`:

```ts
export { SPFxFluentProvider } from './SPFxFluentProvider/SPFxFluentProvider';
export type { SPFxFluentProviderProps } from './SPFxFluentProvider/SPFxFluentProvider.types';
```

- [ ] **Step 3: Make the demo the provider owner**

Replace the provider import and wrapper with this shape:

```tsx
import {
  Button,
  Card,
  CardHeader,
  FluentProvider,
  IdPrefixProvider,
  Text,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ProvisioningDialog,
  useSPFxFluentTheme,
} from '@apvee/spfx-m365-actionable-provisioning';

const theme = useSPFxFluentTheme(props.context);
const idPrefix = `wp-${props.context.instanceId.replace(/-/g, '')}-`;
```

Move the existing `<Card>...</Card>` subtree unchanged inside these exact opening and closing boundaries, keeping both existing `ProvisioningDialog` instances inside the same `FluentProvider`:

```tsx
return (
  <IdPrefixProvider value={idPrefix}>
    <FluentProvider theme={theme} applyStylesToPortals>
      <Card>
```

```tsx
      </Card>
    </FluentProvider>
  </IdPrefixProvider>
);
```

- [ ] **Step 4: Verify API and demo compilation**

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning -- public-api
npm run build:spfx
npm run build:test-spfx
```

Expected: public API test passes; package and SPFx demo compile without `SPFxFluentProvider`.

- [ ] **Step 5: Commit provider removal**

```bash
git add packages/spfx-m365-actionable-provisioning/src/components packages/spfx-m365-actionable-provisioning/test/unit/public-api.test.ts apps/test-spfx/src/webparts/testProvisioning/components/TestProvisioning.tsx
git commit -m "feat(spfx)!: move Fluent provider ownership to consumers"
```

---

### Task 5: Lock in property pane provider behavior

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/test/unit/property-pane-providers.test.tsx`
- Modify only if a test exposes a defect: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/shared/PropertyPaneTheme.ts`
- Modify only if a test exposes a defect: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField.ts`
- Modify only if a test exposes a defect: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorField.ts`

**Interfaces:**
- Consumes: existing field factories and internal mapper.
- Produces: characterization tests proving autonomous roots remain themed and disposable.

- [ ] **Step 1: Mock field views and capture `ReactDom.render`**

```ts
const renderSpy = vi.spyOn(ReactDom, 'render').mockImplementation(() => null);
const unmountSpy = vi.spyOn(ReactDom, 'unmountComponentAtNode').mockReturnValue(true);
```

Mock the two field-view modules to return inert `<div>` elements, and create a context whose theme event records `add` and `remove` calls.

- [ ] **Step 2: Add provider-tree assertions for both fields**

For each returned field, call `properties.onRender(element)` and inspect the captured element:

```ts
const idProvider = renderSpy.mock.calls[0][0] as React.ReactElement;
expect(idProvider.type).toBe(IdPrefixProvider);

const fluentProvider = React.Children.only(idProvider.props.children) as React.ReactElement;
expect(fluentProvider.type).toBe(FluentProvider);
expect(fluentProvider.props.applyStylesToPortals).toBe(true);
expect(fluentProvider.props.theme.colorNeutralForeground1).toBeTruthy();
```

Then call `properties.onDispose(element)` and assert event removal plus `unmountComponentAtNode(element)`.

- [ ] **Step 3: Run characterization tests**

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning -- property-pane-providers
```

Expected: PASS against the existing provider structure. If it fails, change only the smallest field/controller behavior necessary and rerun before continuing.

- [ ] **Step 4: Commit the regression coverage**

```bash
git add packages/spfx-m365-actionable-provisioning/test/unit/property-pane-providers.test.tsx packages/spfx-m365-actionable-provisioning/src/propertyPaneFields
git commit -m "test(spfx): preserve property pane Fluent roots"
```

---

### Task 6: Produce authentic ESM, CommonJS, declarations, and localization

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/tsconfig.esm.json`
- Create: `packages/spfx-m365-actionable-provisioning/tsconfig.cjs.json`
- Create: `packages/spfx-m365-actionable-provisioning/tsconfig.types.json`
- Create: `packages/spfx-m365-actionable-provisioning/scripts/write-package-boundaries.cjs`
- Create: `packages/spfx-m365-actionable-provisioning/test/integration/build-layout.test.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/integration/post-install.test.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/tsconfig.json`
- Modify: `packages/spfx-m365-actionable-provisioning/scripts/copy-loc.cjs`
- Modify: `packages/spfx-m365-actionable-provisioning/scripts/post-install.cjs`
- Modify: `packages/spfx-m365-actionable-provisioning/package.json`
- Modify: `apps/test-spfx/config/config.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: package source tree and internal/public API from Tasks 2–4.
- Produces: `dist/esm`, `dist/cjs`, `dist/types`, `dist/loc`, conditional exports, and `2.0.0` package metadata.

- [ ] **Step 1: Write failing output-layout assertions**

Create `test/integration/build-layout.test.ts` to assert:

```ts
expect(existsSync('dist/esm/index.js')).toBe(true);
expect(existsSync('dist/cjs/index.js')).toBe(true);
expect(existsSync('dist/types/index.d.ts')).toBe(true);
expect(existsSync('dist/loc/en-us.js')).toBe(true);
expect(existsSync('dist/cjs/package.json')).toBe(true);
expect(existsSync('lib')).toBe(false);

const esm = readFileSync('dist/esm/index.js', 'utf8');
const cjs = readFileSync('dist/cjs/index.js', 'utf8');
expect(esm).toMatch(/export\s/);
expect(esm).not.toMatch(/\brequire\s*\(/);
expect(cjs).toMatch(/\brequire\s*\(|\bexports\./);
```

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/integration/build-layout.test.ts
```

Expected: FAIL because only `lib` exists.

- [ ] **Step 2: Write failing localized-resource upgrade tests**

Create `test/integration/post-install.test.ts`. Use this helper to create a temporary `config/config.json`, run `post-install.cjs` with `INIT_CWD` set to that fixture, read the result, and clean up:

```ts
const packageRoot = fileURLToPath(new URL('../..', import.meta.url));
const postInstallScript = path.join(packageRoot, 'scripts', 'post-install.cjs');

function runPostInstall(localizedResources: Record<string, string>): Record<string, string> {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'spfx-post-install-'));
  const configDirectory = path.join(fixtureRoot, 'config');
  const configPath = path.join(configDirectory, 'config.json');
  mkdirSync(configDirectory, { recursive: true });
  writeFileSync(configPath, JSON.stringify({ localizedResources }), 'utf8');

  try {
    execFileSync(process.execPath, [postInstallScript], {
      cwd: packageRoot,
      env: { ...process.env, INIT_CWD: fixtureRoot },
      stdio: 'pipe',
    });
    return JSON.parse(readFileSync(configPath, 'utf8')).localizedResources;
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}
```

Assert all three migration behaviors:

```ts
const legacyPath = 'node_modules/@apvee/spfx-m365-actionable-provisioning/lib/loc/{locale}.js';
const distPath = 'node_modules/@apvee/spfx-m365-actionable-provisioning/dist/loc/{locale}.js';

expect(runPostInstall({ SPFxProvisioningUIStrings: legacyPath }))
  .toEqual({ SPFxProvisioningUIStrings: distPath });
expect(runPostInstall({}))
  .toEqual({ SPFxProvisioningUIStrings: distPath });
expect(runPostInstall({ SPFxProvisioningUIStrings: 'custom/strings/{locale}.js' }))
  .toEqual({ SPFxProvisioningUIStrings: 'custom/strings/{locale}.js' });
```

Run:

```bash
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/integration/post-install.test.ts
```

Expected: the legacy-path case fails because the current script treats it as a custom path and leaves it unchanged.

- [ ] **Step 3: Split TypeScript compilation**

Keep shared roots/types/includes in `tsconfig.json`; remove its single `outDir`. Add:

```json
// tsconfig.esm.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "outDir": "dist/esm",
    "declaration": false
  }
}
```

```json
// tsconfig.cjs.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "dist/cjs",
    "declaration": false
  }
}
```

```json
// tsconfig.types.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist/types",
    "declaration": true,
    "emitDeclarationOnly": true,
    "sourceMap": false
  }
}
```

Exclude `dist`, `lib`, `node_modules`, and `test` in the shared config.

- [ ] **Step 4: Generate the CommonJS package boundary and migrate localization**

`write-package-boundaries.cjs` writes exactly:

```js
const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '..', 'dist', 'cjs', 'package.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, '{"type":"commonjs"}\n', 'utf8');
```

Change `copy-loc.cjs` target to `dist/loc` and the workspace demo resource path to `../../packages/spfx-m365-actionable-provisioning/dist/loc/{locale}.js`.

In `post-install.cjs`, define both exact paths:

```js
const legacyResourcePath = 'node_modules/@apvee/spfx-m365-actionable-provisioning/lib/loc/{locale}.js';
const resourcePath = 'node_modules/@apvee/spfx-m365-actionable-provisioning/dist/loc/{locale}.js';
```

Write `resourcePath` when the current value is absent or equals `legacyResourcePath`; leave any other existing value unchanged and warn. This makes upgrades safe without overwriting consumer customization.

- [ ] **Step 5: Replace package metadata and build scripts**

Set version/exports and scripts:

```json
{
  "version": "2.0.0",
  "type": "module",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "files": ["dist", "scripts", "README.md", "CHANGELOG.md"],
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./package.json": "./package.json"
  },
  "scripts": {
    "clean": "node -e \"require('fs').rmSync('dist',{recursive:true,force:true});require('fs').rmSync('lib',{recursive:true,force:true})\"",
    "build:esm": "tsc -p tsconfig.esm.json",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:types": "tsc -p tsconfig.types.json",
    "build": "npm run clean && npm run build:esm && npm run build:cjs && npm run build:types && node scripts/copy-loc.cjs && node scripts/write-package-boundaries.cjs"
  }
}
```

Change all four direct SPFx peers to `>=1.21.1 <2.0.0`. Keep development versions pinned to `1.21.1` for the minimum-version local build.

- [ ] **Step 6: Verify all emitted files, declarations, and localization migration**

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/integration/build-layout.test.ts
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/integration/post-install.test.ts
rg -n "SPFxFluentProvider" packages/spfx-m365-actionable-provisioning/dist/types
rg -n "createFluentV9ThemeFromSPFxTheme" packages/spfx-m365-actionable-provisioning/dist/types/index.d.ts packages/spfx-m365-actionable-provisioning/dist/types/utils/index.d.ts
test -f packages/spfx-m365-actionable-provisioning/dist/types/internal/theme/createFluentV9ThemeFromSPFxTheme.d.ts
rg -n "require\(\"@fluentui/" packages/spfx-m365-actionable-provisioning/dist/esm
```

Expected: build-layout tests pass; the provider search and public-barrel mapper search return no matches; the internal mapper declaration exists; the ESM Fluent `require` search returns no matches.

- [ ] **Step 7: Commit dual packaging**

```bash
git add package-lock.json packages/spfx-m365-actionable-provisioning apps/test-spfx/config/config.json
git commit -m "build(spfx)!: publish ESM and CommonJS outputs"
```

---

### Task 7: Verify the packed artifact and conditional entry points

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/test/artifact/helpers/package-fixture.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/artifact/package-artifact.test.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/package.json`

**Interfaces:**
- Consumes: `npm pack` output from Task 6.
- Produces: clean installed fixture path, tarball manifest, ESM/CJS resolved entry paths, and dependency-tree evidence reusable by Webpack/browser tests.

- [ ] **Step 1: Write a failing packed-artifact test**

The helper must use `execFileSync` rather than a shell command and create a unique temporary directory with `mkdtempSync`:

```ts
const artifactRoot = mkdtempSync(path.join(tmpdir(), 'spfx-package-artifact-'));
const packageRoot = fileURLToPath(new URL('../..', import.meta.url));
const fixtureRoot = path.join(artifactRoot, 'consumer');
mkdirSync(fixtureRoot, { recursive: true });
const npmEnvironment = {
  ...process.env,
  npm_config_cache: path.join(artifactRoot, '.npm-cache'),
};
type PackResult = {
  filename: string;
  files: Array<{ path: string }>;
};
const packJson = execFileSync('npm', ['pack', '--json'], {
  cwd: packageRoot,
  env: npmEnvironment,
  encoding: 'utf8',
});
const [{ filename, files }] = JSON.parse(packJson) as PackResult[];
const tarballPath = path.resolve(packageRoot, filename);
const paths = files.map((file) => file.path);
```

Assert the manifest includes:

```ts
expect(paths).toContain('dist/esm/index.js');
expect(paths).toContain('dist/cjs/index.js');
expect(paths).toContain('dist/types/index.d.ts');
expect(paths).toContain('dist/cjs/package.json');
expect(paths).toContain('dist/loc/en-us.js');
expect(paths.some((path) => path.startsWith('lib/'))).toBe(false);
expect(paths.some((path) => path.startsWith('src/'))).toBe(false);
```

Run:

```bash
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/artifact/package-artifact.test.ts
```

Expected: FAIL until the install/resolve helper is implemented.

- [ ] **Step 2: Install the tarball into a clean fixture**

Generate a fixture `package.json` with explicit peers and install using:

```ts
execFileSync('npm', [
  'install',
  '--ignore-scripts',
  '--no-package-lock',
  tarballPath,
  '@apvee/m365-actionable-provisioning@1.0.0',
  '@apvee/react-layout-kit@1.2.0',
  '@fluentui/react-components@9.72.9',
  '@fluentui/react-icons@2.0.316',
  '@fluentui/react-migration-v8-v9@9.9.18',
  '@fluentui/react-motion-components-preview@0.14.2',
  '@fluentui/theme@2.7.2',
  '@microsoft/sp-component-base@1.21.1',
  '@microsoft/sp-core-library@1.21.1',
  '@microsoft/sp-property-pane@1.21.1',
  '@microsoft/sp-webpart-base@1.21.1',
  '@pnp/graph@4.17.0',
  '@pnp/sp@4.17.0',
  'react@17.0.1',
  'react-dom@17.0.1',
], { cwd: fixtureRoot, env: npmEnvironment, stdio: 'pipe' });
```

Assert the installed package is not a symlink and its real path starts with the fixture root.

- [ ] **Step 3: Resolve both conditional entry points without evaluating SPFx localization**

Create temporary resolver scripts:

```js
// resolve-esm.mjs
console.log(import.meta.resolve('@apvee/spfx-m365-actionable-provisioning'));
```

```js
// resolve-cjs.cjs
console.log(require.resolve('@apvee/spfx-m365-actionable-provisioning'));
```

Assert ESM ends in `/dist/esm/index.js` and CJS ends in `/dist/cjs/index.js`.

- [ ] **Step 4: Assert physical dependency uniqueness**

Run `npm ls --all --json` in the fixture and recursively collect versions/paths for React and Fluent packages. Allow unrelated nested implementation dependencies such as `tslib`, but assert that no nested `react`, `react-dom`, or `@fluentui/*` directory exists below the installed Apvee package and that each checked Fluent package resolves to one real path.

Wrap the helper in `try/finally`: remove the temporary fixture and generated `.tgz` after every test, including failures.

- [ ] **Step 5: Add and run the artifact script**

Add:

```json
{
  "test:artifact": "vitest run test/artifact/package-artifact.test.ts"
}
```

Run:

```bash
npm run test:artifact -w @apvee/spfx-m365-actionable-provisioning
```

Expected: packed contents, clean install, conditional resolution, and uniqueness assertions pass.

- [ ] **Step 6: Commit artifact verification**

```bash
git add packages/spfx-m365-actionable-provisioning/test/artifact packages/spfx-m365-actionable-provisioning/package.json
git commit -m "test(spfx): verify packed dual-package artifact"
```

---

### Task 8: Prove Webpack selects one Fluent graph

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/test/webpack/helpers/build-consumer.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/webpack/consumer-bundle.test.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/esm-entry.tsx`
- Create: `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/cjs-entry.cjs`
- Modify: `packages/spfx-m365-actionable-provisioning/package.json`

**Interfaces:**
- Consumes: installed packed fixture from Task 7.
- Produces: ESM and CommonJS Webpack stats with normalized module resources.

- [ ] **Step 1: Add failing ESM and CommonJS consumer entries**

ESM entry:

```tsx
import {
  ProvisioningDialog,
  useSPFxFluentTheme,
} from '@apvee/spfx-m365-actionable-provisioning';
import {
  FluentProvider,
  OverlayDrawer,
} from '@fluentui/react-components';

export const esmSymbols = {
  FluentProvider,
  OverlayDrawer,
  ProvisioningDialog,
  useSPFxFluentTheme,
};
```

CommonJS entry:

```js
const packageApi = require('@apvee/spfx-m365-actionable-provisioning');
const fluentApi = require('@fluentui/react-components');

module.exports = {
  ProvisioningDialog: packageApi.ProvisioningDialog,
  useSPFxFluentTheme: packageApi.useSPFxFluentTheme,
  FluentProvider: fluentApi.FluentProvider,
  OverlayDrawer: fluentApi.OverlayDrawer,
};
```

The initial test expects successful bundles and fails before the helper supplies localization and resolver configuration.

- [ ] **Step 2: Implement the SPFx-like Webpack helper**

Configure `mode: 'development'`, `target: 'web'`, source maps off, and these resolver fields:

```ts
resolve: {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.cjs'],
  conditionNames: dependencyKind === 'esm'
    ? ['import', 'webpack', 'browser', 'default']
    : ['require', 'webpack', 'browser', 'default'],
  mainFields: ['browser', 'module', 'main'],
  alias: {
    SPFxProvisioningUIStrings: localizationModulePath,
  },
},
module: {
  rules: [{
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'ts-loader',
      options: { transpileOnly: true },
    },
  }],
},
```

Set `context` and `resolve.modules` to the clean fixture, not the monorepo. Return `stats.toJson({ all: false, errors: true, warnings: true, modules: true, reasons: true })`.

- [ ] **Step 3: Assert format consistency from module resources**

Normalize module names and assert for each package:

```ts
const guardedPackages = [
  '@fluentui/react-shared-contexts',
  '@fluentui/react-portal',
  '@fluentui/react-provider',
];
```

For ESM, every guarded resource must contain `/lib/` and none may contain `/lib-commonjs/`. For CommonJS, every guarded resource must contain the CommonJS directory and none may contain the ESM `/lib/` directory.

Also assert the ESM bundle contains the package component and consumer drawer modules, so a trivially empty bundle cannot pass.

- [ ] **Step 4: Run bundle graph tests**

```bash
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/webpack/consumer-bundle.test.ts
```

Expected: both bundles compile and each contains one consistent Fluent graph.

- [ ] **Step 5: Commit Webpack graph proof**

```bash
git add packages/spfx-m365-actionable-provisioning/test/webpack packages/spfx-m365-actionable-provisioning/test/fixtures/consumer packages/spfx-m365-actionable-provisioning/package.json
git commit -m "test(spfx): reject duplicate Fluent module graphs"
```

---

### Task 9: Verify package and consumer portals in Chromium

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/playwright.config.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/browser-entry.tsx`
- Create: `packages/spfx-m365-actionable-provisioning/test/fixtures/consumer/useSPFxProvisioningEngine.stub.ts`
- Create: `packages/spfx-m365-actionable-provisioning/test/browser/portal-theme.spec.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/test/webpack/helpers/build-consumer.ts`

**Interfaces:**
- Consumes: packed fixture, ESM Webpack helper, `ProvisioningDialog`, and consumer `OverlayDrawer`.
- Produces: browser evidence for two distinct themed portal nodes.

Configure two Playwright projects up front so Task 10 can bind them to the version boundaries:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  projects: [
    { name: 'spfx-min', metadata: { spfxVersion: '1.21.1' } },
    { name: 'spfx-latest', metadata: { spfxVersion: '1.23.2' } },
  ],
});
```

- [ ] **Step 1: Write the failing browser assertion first**

The Playwright test must locate each portal independently:

```ts
const packageContent = page.getByText('Package portal content', { exact: true });
const consumerContent = page.getByText('Consumer drawer content', { exact: true });

const packagePortal = packageContent.locator('xpath=ancestor::*[@data-portal-node="true"]');
const consumerPortal = consumerContent.locator('xpath=ancestor::*[@data-portal-node="true"]');

await expect(packagePortal).toHaveCount(1);
await expect(consumerPortal).toHaveCount(1);
```

For each portal, evaluate computed tokens and class intersection with the provider root. Expected initial result: FAIL because no browser fixture is built.

- [ ] **Step 2: Stub only provisioning-engine behavior**

The browser test is about portal theming, so replace the installed artifact's internal engine hook through `NormalModuleReplacementPlugin` with:

```ts
export const useSPFxProvisioningEngine = () => ({
  snapshot: undefined,
  run: async () => ({ status: 'completed' }),
  cancel: () => undefined,
  checkCompliance: async () => ({ overall: 'compliant', results: [] }),
});
```

Do not replace `ProvisioningDialog`, `DialogSurface`, Fluent provider, portal, or shared-context modules.

- [ ] **Step 3: Build the browser entry from the packed package**

Render a unique test theme:

```tsx
import { createLogger, consoleSink } from '@apvee/m365-actionable-provisioning';
import type { BaseComponentContext } from '@microsoft/sp-component-base';

const testTheme = {
  ...webLightTheme,
  fontFamilyBase: 'Portal Test Font',
  colorNeutralBackground1: '#123456',
};
const contextMock = {
  instanceId: '11111111-1111-1111-1111-111111111111',
  manifest: { id: '22222222-2222-2222-2222-222222222222' },
  serviceScope: { consume: () => ({ tryGetTheme: () => undefined }) },
} as unknown as BaseComponentContext;
const logger = createLogger({ level: 'silent', sink: consoleSink });

ReactDOM.render(
  <IdPrefixProvider value="portal-test-">
    <FluentProvider theme={testTheme} applyStylesToPortals>
      <div data-testid="provider-content">Provider content</div>
      <ProvisioningDialog
        open
        onClose={() => undefined}
        context={contextMock}
        planTemplate={{ schemaVersion: '1.0', actions: [] }}
        logger={logger}
        title="Package portal content"
      />
      <OverlayDrawer open>
        <div>Consumer drawer content</div>
      </OverlayDrawer>
    </FluentProvider>
  </IdPrefixProvider>,
  document.getElementById('root'),
);
```

Generate the localization alias from the packed `dist/loc/en-us.js` by executing its AMD `define` callback in a Node `vm` and serializing the captured object as an ESM module inside the temporary fixture.

- [ ] **Step 4: Assert portal tokens and theme class**

For each distinct portal:

```ts
const providerClasses = await page.getByTestId('provider-content').evaluate((element) => (
  [...(element.parentElement?.classList ?? [])]
));
const values = await portal.evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    font: style.getPropertyValue('--fontFamilyBase').trim(),
    background: style.getPropertyValue('--colorNeutralBackground1').trim(),
    classes: [...element.classList],
  };
});

expect(values.font).toContain('Portal Test Font');
expect(values.background).toBe('#123456');
expect(values.classes.some((name) => providerClasses.includes(name))).toBe(true);
```

Use Playwright locator waiting only; do not add fixed sleeps.

- [ ] **Step 5: Install Chromium and run the browser test**

```bash
npx playwright install chromium
npm run test:browser -w @apvee/spfx-m365-actionable-provisioning
```

Expected: both package and consumer portal assertions pass against different portal nodes.

- [ ] **Step 6: Commit browser proof**

```bash
git add packages/spfx-m365-actionable-provisioning/playwright.config.ts packages/spfx-m365-actionable-provisioning/test/browser packages/spfx-m365-actionable-provisioning/test/fixtures/consumer packages/spfx-m365-actionable-provisioning/test/webpack/helpers/build-consumer.ts
git commit -m "test(spfx): verify Fluent portal theme propagation"
```

---

### Task 10: Add the stable SPFx compatibility matrix

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/test/compatibility/spfx-versions.json`
- Create: `packages/spfx-m365-actionable-provisioning/test/compatibility/spfx-matrix.test.ts`
- Create: `packages/spfx-m365-actionable-provisioning/scripts/check-spfx-registry.cjs`
- Modify: `packages/spfx-m365-actionable-provisioning/package.json`

**Interfaces:**
- Consumes: packed artifact and Webpack helper from Tasks 7–8.
- Produces: explicit stable-version bundle/type matrix and registry freshness check.

- [ ] **Step 1: Record every approved stable version**

Create:

```json
[
  "1.21.1",
  "1.22.0",
  "1.22.1",
  "1.22.2",
  "1.23.0",
  "1.23.1",
  "1.23.2"
]
```

- [ ] **Step 2: Write the failing matrix test**

For each version, create a clean fixture and install the same version of:

```ts
const spfxPackages = [
  '@microsoft/sp-component-base',
  '@microsoft/sp-core-library',
  '@microsoft/sp-property-pane',
  '@microsoft/sp-webpart-base',
];
```

The test must type-check a consumer import, create the ESM Webpack bundle, and reuse the guarded Fluent graph assertions. Expected initial result: FAIL because the matrix runner is absent.

- [ ] **Step 3: Implement the version-isolated runner**

Each fixture receives the packed tarball, explicit package peers, `typescript@5.3.3`, and `${spfxPackage}@${version}` entries. Execute the fixture-local compiler binary rather than allowing `npx` to download an unpinned compiler:

```bash
./node_modules/.bin/tsc --noEmit -p tsconfig.json
```

inside the fixture, followed by its ESM Webpack build. Do not reuse the monorepo's workspace link or node_modules resolution root.

- [ ] **Step 4: Add a stable-registry freshness check**

`check-spfx-registry.cjs` runs:

```bash
npm view @microsoft/sp-core-library versions --json
```

It filters numeric stable versions satisfying `>=1.21.1 <2.0.0`, compares them to `spfx-versions.json`, and exits nonzero with the exact missing versions. Prerelease strings containing `-beta` or `-rc` are ignored.

- [ ] **Step 5: Add scripts and run the full matrix**

```json
{
  "test:spfx-matrix": "vitest run test/compatibility/spfx-matrix.test.ts",
  "test:spfx-registry": "node scripts/check-spfx-registry.cjs"
}
```

Run:

```bash
npm run test:spfx-registry -w @apvee/spfx-m365-actionable-provisioning
npm run test:spfx-matrix -w @apvee/spfx-m365-actionable-provisioning
```

Expected: all seven stable versions type-check and bundle with one Fluent graph; the registry check reports no unlisted stable release.

- [ ] **Step 6: Run browser coverage at the version boundaries**

Parameterize browser fixture installation for `1.21.1` and `1.23.2`, then run:

```bash
npm run test:browser -w @apvee/spfx-m365-actionable-provisioning -- --project=spfx-min
npm run test:browser -w @apvee/spfx-m365-actionable-provisioning -- --project=spfx-latest
```

Expected: both portal tests pass at minimum and latest stable versions.

- [ ] **Step 7: Commit compatibility coverage**

```bash
git add packages/spfx-m365-actionable-provisioning/test/compatibility packages/spfx-m365-actionable-provisioning/scripts/check-spfx-registry.cjs packages/spfx-m365-actionable-provisioning/package.json
git commit -m "test(spfx): cover stable SPFx compatibility matrix"
```

---

### Task 11: Complete migration documentation and release metadata

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/CHANGELOG.md`
- Create: `packages/spfx-m365-actionable-provisioning/scripts/check-release-docs.cjs`
- Modify: `packages/spfx-m365-actionable-provisioning/README.md`
- Modify: `README.md`
- Modify: `docs/introduction.md`
- Modify: `docs/spfx/integration.md`
- Modify: `docs/spfx/provisioning-dialog.md`
- Modify: `apps/test-spfx/package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: final public API, package layout, SPFx range, and canonical demo from previous tasks.
- Produces: consistent `2.0.0` migration guidance and automated stale-reference rejection.

- [ ] **Step 1: Write a failing documentation check**

`check-release-docs.cjs` parses the SPFx package metadata and scans active code examples. It fails when the package version is not `2.0.0`, when the demo dependency is not `2.0.0`, or when current examples contain:

```js
const forbidden = [
  /import[^;]*SPFxFluentProvider/,
  /<\/?SPFxFluentProvider\b/,
  '/lib/loc/{locale}.js',
];
```

Explanatory migration and changelog text may name the removed API. The script also requires `useSPFxFluentTheme`, `applyStylesToPortals`, `context.instanceId`, `dist/loc/{locale}.js`, and `>=1.21.1 <2.0.0` in the package README or migration section.

Run:

```bash
node packages/spfx-m365-actionable-provisioning/scripts/check-release-docs.cjs
```

Expected: FAIL on current README and integration references.

- [ ] **Step 2: Replace every consumer example**

Use the approved pattern in package README, root README, introduction, integration guide, and provisioning-dialog guide:

```tsx
const theme = useSPFxFluentTheme(context);
const idPrefix = `wp-${context.instanceId.replace(/-/g, '')}-`;

return (
  <IdPrefixProvider value={idPrefix}>
    <FluentProvider theme={theme} applyStylesToPortals>
      <ApplicationContent />
      <ProvisioningDialog
        open={open}
        onClose={handleClose}
        context={context}
        planTemplate={plan}
        logger={logger}
      />
    </FluentProvider>
  </IdPrefixProvider>
);
```

State explicitly that all package and consumer portal components share this provider.

- [ ] **Step 3: Add the breaking migration and changelog**

`CHANGELOG.md` must contain a `2.0.0` section with:

- Removed `SPFxFluentProvider` and props.
- Added `useSPFxFluentTheme`.
- Made the mapper internal.
- Added ESM/CommonJS conditional exports.
- Moved localization from `lib/loc` to `dist/loc`.
- Expanded stable SPFx peer support to `>=1.21.1 <2.0.0`.
- Required an instance-specific `IdPrefixProvider` value.

- [ ] **Step 4: Align demo/package versions and localization paths**

Set the demo dependency to `2.0.0`, refresh `package-lock.json`, and ensure all `SPFxProvisioningUIStrings` paths use `dist/loc`.

- [ ] **Step 5: Run documentation and build checks**

```bash
node packages/spfx-m365-actionable-provisioning/scripts/check-release-docs.cjs
npm run build
npm run build:test-spfx
```

Expected: no stale provider, `lib/loc`, version, or peer-range references; monorepo and demo build successfully.

- [ ] **Step 6: Commit release documentation**

```bash
git add package-lock.json README.md docs packages/spfx-m365-actionable-provisioning/README.md packages/spfx-m365-actionable-provisioning/CHANGELOG.md packages/spfx-m365-actionable-provisioning/scripts/check-release-docs.cjs apps/test-spfx/package.json
git commit -m "docs(spfx)!: document version 2 migration"
```

---

### Task 12: Run release-level verification

**Files:**
- Verify only; no planned source changes.

**Interfaces:**
- Consumes: all implementation tasks.
- Produces: final evidence that source, package artifact, resolver graphs, portals, docs, and version matrix satisfy the specification.

- [ ] **Step 1: Verify branch and working tree before tests**

```bash
git branch --show-current
git status --short
```

Expected: branch is `dev`; working tree is clean.

- [ ] **Step 2: Run unit, build-layout, and monorepo builds**

```bash
npm run test:unit -w @apvee/spfx-m365-actionable-provisioning
npm run build
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/integration/build-layout.test.ts
```

Expected: all commands exit zero.

- [ ] **Step 3: Run packed artifact and Webpack graph tests**

```bash
npm run test:artifact -w @apvee/spfx-m365-actionable-provisioning
npm exec --workspace @apvee/spfx-m365-actionable-provisioning vitest run test/webpack/consumer-bundle.test.ts
```

Expected: tarball contents, conditional entry paths, dependency uniqueness, and ESM/CJS graph assertions pass.

- [ ] **Step 4: Run SPFx support verification**

```bash
npm run test:spfx-registry -w @apvee/spfx-m365-actionable-provisioning
npm run test:spfx-matrix -w @apvee/spfx-m365-actionable-provisioning
```

Expected: registry list is current and every stable supported version passes.

- [ ] **Step 5: Run real-browser portal verification**

```bash
npm run test:browser -w @apvee/spfx-m365-actionable-provisioning -- --project=spfx-min
npm run test:browser -w @apvee/spfx-m365-actionable-provisioning -- --project=spfx-latest
```

Expected: both distinct portal nodes receive the shared provider class and non-empty custom tokens.

- [ ] **Step 6: Inspect the final tarball directly**

```bash
npm pack -w @apvee/spfx-m365-actionable-provisioning --dry-run --json
```

Expected: the dry-run JSON lists `dist/esm`, `dist/cjs`, `dist/types`, `dist/loc`, `README.md`, and `CHANGELOG.md`, with no `lib`, `src`, or test fixture paths. The actual `.tgz` creation and installation already ran in Task 7 and Step 3.

- [ ] **Step 7: Recheck forbidden patterns and Git state**

```bash
node packages/spfx-m365-actionable-provisioning/scripts/check-release-docs.cjs
rg -n "SPFxFluentProvider" packages/spfx-m365-actionable-provisioning/dist/types
rg -n "require\(\"@fluentui/" packages/spfx-m365-actionable-provisioning/dist/esm
git status --short
```

Expected: documentation checks pass; removed provider declarations and ESM Fluent `require` searches return no matches; working tree is clean. If any verification fails, stop and return to the task that owns the failed invariant before claiming completion.
