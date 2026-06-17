# Property Pane Fields Behavior-Preserving Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields` in small slices while preserving the current SPFx property pane behavior.

**Architecture:** Keep the public property pane factories and props unchanged. First harden pure/internal helpers and unstable render-time values, then tighten async effect lifecycles. Defer any shared SPFx wrapper extraction until the lower-risk slices are verified because wrapper extraction touches render/dispose/theme lifecycle.

**Tech Stack:** TypeScript, React 17, Fluent UI 9, SPFx 1.21, PnPjs, npm workspaces, `tsc`.

---

## Behavior Contract

Preserve these externally visible behaviors:

- `PropertyPaneSiteSelectorField` still auto-persists the current site on first render when the bound property is empty and the field is not disabled.
- Empty/undefined site selector value still resolves to the current web URL.
- Site selector modes remain `current`, `hub`, and `search`.
- The search picker still debounces input, shows loading/empty/no-results rows, caches titles in `sessionStorage`, and opens selected tags in a new browser tab.
- `PropertyPaneProvisioningField` still defaults `enableComplianceCheck` and `complianceAutoRunOnOpen` to `true`, `confirmDeprovisionRun` to `false`, and `appearance` to `filled`.
- Provisioning dialog property updates are still buffered while the dialog is open and flushed when it closes.
- Auto-compliance checks still do not run against the current site accidentally when an explicitly supplied target URL is invalid.
- No public export, prop name, localized string key, package entrypoint, or docs example changes in this refactor.

## File Structure

Modify only these files in the first execution:

```text
packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/
  PropertyPaneProvisioningField/
    PropertyPaneProvisioningField.ts
  PropertyPaneSiteSelectorField/
    PropertyPaneSiteSelectorFieldView.tsx
    PropertyPaneSiteSelectorFieldView.utils.ts
```

Do not modify these files in the first execution:

```text
packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/shared/PropertyPaneTheme.ts
packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/index.ts
packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/**
```

Reason: the shared theme controller and provisioning dialog internals are lifecycle-sensitive and already have separate refactor planning.

---

### Task 1: Baseline And Scope Guard

**Files:**
- Read: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField.ts`
- Read: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.tsx`
- Read: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorField.ts`
- Read: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.tsx`
- Read: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.utils.ts`

- [ ] **Step 1: Confirm worktree state**

Run:

```bash
git status --short
```

Expected: no unrelated dirty files in the target paths. If unrelated changes exist, inspect them and preserve them.

- [ ] **Step 2: Confirm available automated validation**

Run:

```bash
rg --files --glob '!node_modules/**' | rg '(__tests__|\.test\.|\.spec\.)'
```

Expected: no output in the current repository state. Exit code `1` is acceptable for this command because `rg` returns `1` when no matches are found. This confirms there are no existing focused tests to run for these fields.

- [ ] **Step 3: Run baseline package build**

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 4: Record the behavior-sensitive areas before editing**

Inspect these exact areas:

```bash
nl -ba packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField.ts | sed -n '70,170p'
nl -ba packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.tsx | sed -n '108,190p'
nl -ba packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorField.ts | sed -n '70,150p'
nl -ba packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.tsx | sed -n '95,225p'
```

Expected: confirm the buffering, auto-persist, async search cancellation, and auto-check dedupe behavior before changing anything.

---

### Task 2: Stabilize The Provisioning Field Default Logger

**Invariant:** The effective logger remains `props.logger` when provided; otherwise it remains a silent console logger scoped to `PropertyPaneProvisioningField`. The default logger object should no longer be recreated on every `renderTo`.

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField.ts`

- [ ] **Step 1: Move default logger creation out of `renderTo`**

In `PropertyPaneProvisioningField`, replace the current `getLogger` function with a stable value plus simple getter:

```ts
  const defaultLogger =
    props.logger ??
    createLogger({
      level: 'silent',
      sink: consoleSink,
      scope: { component: 'PropertyPaneProvisioningField' },
    });

  const getLogger = (): Logger => defaultLogger;
```

Expected: `logger: getLogger()` in the `PropertyPaneProvisioningFieldView` props stays unchanged.

- [ ] **Step 2: Build after the logger refactor**

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 3: Review diff for behavior**

Run:

```bash
git diff -- packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField.ts
```

Expected: only logger identity stabilization. No changes to defaults, strings merge, `targetSiteUrl`, `getEffectiveState`, callbacks, or render/dispose lifecycle.

---

### Task 3: Harden Title Cache Loading Without Changing Valid Cache Behavior

**Invariant:** Valid cache entries still load as before. Invalid JSON, arrays, null, and non-string values are ignored instead of being trusted through a cast.

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.utils.ts`

- [ ] **Step 1: Add a local string-record parser**

Add this helper above `loadTitleCache`:

```ts
function parseTitleCache(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};

  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    const normalizedKey = normalizeUrl(key);
    if (!normalizedKey) return acc;
    if (typeof value !== 'string') return acc;

    acc[normalizedKey] = value;
    return acc;
  }, {});
}
```

- [ ] **Step 2: Use the parser in `loadTitleCache`**

Replace `loadTitleCache` with:

```ts
export function loadTitleCache(): Record<string, string> {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? parseTitleCache(JSON.parse(saved)) : {};
  } catch {
    return {};
  }
}
```

- [ ] **Step 3: Build after cache hardening**

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 4: Review diff for behavior**

Run:

```bash
git diff -- packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.utils.ts
```

Expected: valid string cache entries are preserved; corrupted cache data is ignored; `STORAGE_KEY`, `MAX_CACHE_ENTRIES`, and persist timing are unchanged.

---

### Task 4: Centralize Site Search Query Construction

**Invariant:** Search text without apostrophes must produce exactly the same SharePoint Search query string as before: quoted text followed by `contentclass:STS_Site`. Text containing a single quote is the only intentional hardening case and should not break the quoted query.

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.utils.ts`

- [ ] **Step 1: Add a pure query builder**

Add this helper above `searchSites`:

```ts
export function buildSiteSearchQuery(queryText: string): string {
  const escapedQueryText = queryText.replace(/'/g, "''");
  return `'${escapedQueryText}' contentclass:STS_Site`;
}
```

Do not call `trim()` here. The caller already skips empty/whitespace-only search text before calling `searchSites`, and trimming inside this helper would change the query generated for leading/trailing-space input.

- [ ] **Step 2: Use the helper in `searchSites`**

Replace the inline `Querytext` value in `searchSites`:

```ts
  const searchResults = await sp.search({
    Querytext: buildSiteSearchQuery(queryText),
    RowLimit: MAX_SEARCH_RESULTS,
    SelectProperties: ['Title', 'Path'],
  });
```

- [ ] **Step 3: Build after query helper extraction**

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 4: Verify query helper equivalence for normal input**

Inspect the helper and confirm these examples:

```text
buildSiteSearchQuery('contoso') -> "'contoso' contentclass:STS_Site"
buildSiteSearchQuery(' contoso ') -> "' contoso ' contentclass:STS_Site"
buildSiteSearchQuery("owner's site") -> "'owner''s site' contentclass:STS_Site"
```

Expected: the first two outputs match the old inline template exactly for the same input. The third output is the hardening case.

- [ ] **Step 5: Review diff for behavior**

Run:

```bash
git diff -- packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.utils.ts
```

Expected: `RowLimit`, `SelectProperties`, result mapping, and URL normalization are unchanged.

---

### Task 5: Add Cancellation Guards To Remaining Site Selector Async Effects

**Invariant:** Successful hub resolution and title fetch still update state exactly as before while mounted. Late async results after cleanup should be ignored.

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.tsx`

- [ ] **Step 1: Guard `resolveHub` effect**

Replace the current `resolveHub` effect with:

```tsx
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const hub = await resolveHub(sp);
      if (cancelled) return;

      setHasHubSite(hub.hasHubSite);
      setHubUrl(hub.hubUrl);
    })().catch((): void => undefined);

    return () => {
      cancelled = true;
    };
  }, [sp]);
```

- [ ] **Step 2: Guard the full `fetchSiteTitle` effect**

Replace the whole selected-site title fetch effect with:

```tsx
  React.useEffect(() => {
    if (mode !== 'search') return;

    const effectiveSelected = selectedSiteUrl;
    if (!effectiveSelected || effectiveSelected === currentWebUrl || effectiveSelected === hubUrl) return;

    const inResults = results.some((r) => normalizeUrl(r.url) === effectiveSelected);
    if (inResults || titleCache[effectiveSelected]) return;

    let cancelled = false;

    (async () => {
      const title = await fetchSiteTitle(sp, effectiveSelected);
      if (cancelled) return;
      if (!title) return;

      setTitleCache((prev) => ({
        ...prev,
        [effectiveSelected]: title,
      }));
    })().catch((): void => undefined);

    return () => {
      cancelled = true;
    };
  }, [mode, selectedSiteUrl, currentWebUrl, hubUrl, sp, results, titleCache]);
```

- [ ] **Step 3: Build after async guards**

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 4: Review diff for behavior**

Run:

```bash
git diff -- packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView.tsx
```

Expected: only cancellation guards are added. `mode`, `selectedSite`, `handleModeChange`, debounced search, picker options, and tag click behavior are unchanged.

---

### Task 6: Final Automated Verification

**Files:**
- Verify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/**`

- [ ] **Step 1: Run package build**

Run:

```bash
npm run build -w @apvee/spfx-m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 2: Run root SPFx package build script**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 3: Inspect target diff**

Run:

```bash
git diff -- packages/spfx-m365-actionable-provisioning/src/propertyPaneFields
```

Expected:

- no public prop/type/export changes;
- no localized string key changes;
- no changes to `PropertyPaneFieldType.Custom`;
- no changes to `ReactDom.render` or `ReactDom.unmountComponentAtNode`;
- no changes to `themeController.ensureInitialized()` or `themeController.dispose()`;
- no changes to provisioning dialog open/close/update buffering.

---

### Task 7: Manual SPFx Property Pane Smoke Test

**Files:**
- Read: `apps/test-spfx/src/webparts/testProvisioning/TestProvisioningWebPart.ts`

- [ ] **Step 1: Start the SPFx test app**

Run:

```bash
npm run serve:test-spfx
```

Expected: SPFx local workbench/dev server starts successfully. Keep the process running for the manual checks.

- [ ] **Step 2: Verify site selector current-site behavior**

Manual check:

```text
Open the test web part property pane.
Confirm the site selector shows the current site as the selected/default value.
Confirm the bound property is populated without requiring a user click when initially empty.
```

Expected: same behavior as before the refactor.

- [ ] **Step 3: Verify hub/search behavior**

Manual check:

```text
Switch to Hub Site if available.
Switch to Search Site.
Type a normal search term.
Select a result.
Click the selected tag.
```

Expected:

- hub option remains disabled when no hub exists;
- search still debounces and shows loading/results;
- selected result is persisted to the bound property;
- selected tag opens the site URL in a new tab.

- [ ] **Step 4: Verify provisioning field behavior**

Manual check:

```text
Open the provisioning field.
Confirm the state badge renders.
Open Provision.
Close without running.
Open Check.
Close after compliance check starts or completes.
Open Deprovision when state is applied and a deprovisioning plan exists.
```

Expected:

- dialog opens and closes as before;
- property updates do not close an open dialog unexpectedly;
- compliance check still updates effective state only after completion;
- deprovision button visibility still depends on `effectiveState === 'applied'`.

- [ ] **Step 5: Stop the SPFx dev server**

Stop the terminal process with `Ctrl+C`.

Expected: dev server exits cleanly.

---

## Deferred Refactor: Shared SPFx Field Renderer

Do not execute this in the first pass.

Candidate: extract duplicated `IdPrefixProvider`, `FluentProvider`, theme controller render, and dispose wiring from:

```text
packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField.ts
packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorField.ts
```

Reason to defer: this touches SPFx property pane lifecycle and can regress theme updates, change callback timing, default auto-persist timing, or React unmount behavior. Execute only after the first-pass refactor is validated and ideally after characterization tests or stronger manual coverage exist.

Acceptance criteria for a future wrapper extraction:

- `onRender` still stores the latest `changeCallback`.
- `themeController.ensureInitialized()` still runs before rendering.
- theme changes still re-render the last element.
- `onDispose` still disposes the theme controller before unmount cleanup completes.
- each field keeps its own closure state (`currentValue`, `didAutoPersistDefault`, dialog state).
- manual smoke test from Task 7 still passes.

---

## Completion Criteria

The refactor is complete when:

- `npm run build -w @apvee/spfx-m365-actionable-provisioning` passes.
- `npm run build:spfx` passes.
- Target diff is limited to the three first-pass files.
- Manual SPFx smoke test is completed or explicitly recorded as not run.
- Final summary calls out that no automated tests existed before the refactor.
