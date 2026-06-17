# Provisioning Dialog Session Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `@apvee/spfx-m365-actionable-provisioning` dialog UI so dialog runtime state lives in a per-open session, reset logic is removed, and shared controls/names are rationalized.

**Architecture:** Keep one top-level `ProvisioningDialog` controlled component. Move reducer, engine, actions, mode views, and confirmation state into `ProvisioningDialogSession`, which is mounted inside Fluent `DialogSurface` and disposed by `unmountOnClose`. Split mode-specific views from shared dialog controls and rename misleading internal/public API names because backward compatibility is not required.

**Tech Stack:** TypeScript, React 17, Fluent UI 9, SPFx 1.21, npm workspaces, `tsc`.

---

## File Structure

Create or move files to this target structure:

```text
packages/spfx-m365-actionable-provisioning/src/components/
  shared/
    ConfirmationDialog/
      ConfirmationDialog.tsx
      ConfirmationDialog.types.ts
  ProvisioningDialog/
    ProvisioningDialog.tsx
    ProvisioningDialog.types.ts
    ProvisioningDialogSession.tsx
    ProvisioningDialogSession.state.ts
    ProvisioningDialog.styles.ts
    hooks/
      useProvisioningDialogActions.ts
      useProvisioningDialogActions.types.ts
    views/
      ProvisioningRunView.tsx
      ProvisioningRunView.types.ts
      ComplianceCheckView.tsx
      ComplianceCheckView.types.ts
    shared/
      DialogErrorMessage.tsx
      DialogLogSection.tsx
      DialogLogSection.types.ts
      KpiSummaryBar.tsx
      KpiSummaryBar.types.ts
      ProvisioningDialogShell.tsx
      ProvisioningDialogShell.types.ts
      ProvisioningDialogErrorBoundary.tsx
```

Files intentionally left in place:

```text
packages/spfx-m365-actionable-provisioning/src/components/LogPanel/*
packages/spfx-m365-actionable-provisioning/src/components/SPFxFluentProvider/*
packages/spfx-m365-actionable-provisioning/src/hooks/useSPFxProvisioningEngine/*
packages/spfx-m365-actionable-provisioning/src/hooks/useProvisioningDerivedState/*
packages/spfx-m365-actionable-provisioning/src/hooks/useNavigationGuard/*
```

The plan assumes no test runner exists for this package today. Use `npm run build:spfx` as the required automated verification after each coherent slice.

---

### Task 1: Baseline And Working Guardrails

**Files:**
- Read: `docs/superpowers/specs/2026-06-17-provisioning-dialog-session-refactor-design.md`
- Read: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.tsx`
- Read: `packages/spfx-m365-actionable-provisioning/src/hooks/useDialogOrchestration/useDialogOrchestration.ts`
- Read: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.tsx`

- [ ] **Step 1: Confirm clean worktree**

Run:

```bash
git status --short
```

Expected: no output. If there is output, inspect it and do not overwrite unrelated changes.

- [ ] **Step 2: Run baseline build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0` with `tsc -p tsconfig.json` and `node scripts/copy-loc.cjs` completing.

- [ ] **Step 3: Record current old-name surface**

Run:

```bash
rg -n "ConfirmDialog|KPIDisplay|LogSection|DialogShell|ErrorBoundary|ProvisioningView|ComplianceView|useDialogOrchestration|DialogState|mode=" packages/spfx-m365-actionable-provisioning/src apps/test-spfx/src docs
```

Expected: current usages in the dialog package, property pane, demo app, and docs. Use this output as the checklist for rename closure in Task 10.

- [ ] **Step 4: Commit baseline marker only if there are pre-existing user changes**

If Step 1 was clean, skip this step. If Step 1 showed unrelated user changes, do not commit them. Continue with careful file-scoped edits.

---

### Task 2: Move Generic Confirmation UI To Components Shared

**Files:**
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ConfirmDialog/ConfirmDialog.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ConfirmDialog/ConfirmDialog.types.ts`
- Create: `packages/spfx-m365-actionable-provisioning/src/components/shared/ConfirmationDialog/ConfirmationDialog.tsx`
- Create: `packages/spfx-m365-actionable-provisioning/src/components/shared/ConfirmationDialog/ConfirmationDialog.types.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.types.ts`

- [ ] **Step 1: Create target folder and move files**

Run:

```bash
mkdir -p packages/spfx-m365-actionable-provisioning/src/components/shared/ConfirmationDialog
git mv packages/spfx-m365-actionable-provisioning/src/components/ConfirmDialog/ConfirmDialog.tsx packages/spfx-m365-actionable-provisioning/src/components/shared/ConfirmationDialog/ConfirmationDialog.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ConfirmDialog/ConfirmDialog.types.ts packages/spfx-m365-actionable-provisioning/src/components/shared/ConfirmationDialog/ConfirmationDialog.types.ts
```

Expected: files moved and old `ConfirmDialog` folder empty.

- [ ] **Step 2: Rename exported types and component**

In `ConfirmationDialog.types.ts`, replace content with:

```ts
export type ConfirmationDialogStrings = Readonly<{
  confirmLabel: string;
  cancelLabel: string;
}>;

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmAppearance?: 'primary' | 'secondary' | 'subtle';

  /** Optional localized strings overrides. */
  strings?: Partial<ConfirmationDialogStrings>;

  onConfirm: () => void;
  onCancel: () => void;
}
```

In `ConfirmationDialog.tsx`, replace the file with:

```tsx
/**
 * Internal confirmation dialog component for user confirmation prompts.
 *
 * @internal
 * @packageDocumentation
 */

import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';

import type { ConfirmationDialogProps, ConfirmationDialogStrings } from './ConfirmationDialog.types';

import * as locStrings from 'SPFxProvisioningUIStrings';

const DEFAULT_STRINGS: ConfirmationDialogStrings = {
  confirmLabel: locStrings.ConfirmDialog.ConfirmLabel,
  cancelLabel: locStrings.ConfirmDialog.CancelLabel,
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmAppearance = 'primary',
  strings,
  onConfirm,
  onCancel,
}) => {
  const s = React.useMemo(() => {
    return {
      ...DEFAULT_STRINGS,
      ...(strings ?? {}),
    } satisfies ConfirmationDialogStrings;
  }, [strings]);

  const handleConfirm = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) handleCancel();
      }}
      modalType="modal"
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{message}</DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleCancel}>
              {s.cancelLabel}
            </Button>
            <Button appearance={confirmAppearance} onClick={handleConfirm}>
              {s.confirmLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

ConfirmationDialog.displayName = 'ConfirmationDialog';
```

- [ ] **Step 3: Update dialog imports**

In `ProvisioningDialog.tsx`, replace:

```ts
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
```

with:

```ts
import { ConfirmationDialog } from '../shared/ConfirmationDialog/ConfirmationDialog';
```

Replace JSX tag:

```tsx
<ConfirmDialog
```

with:

```tsx
<ConfirmationDialog
```

In `ProvisioningDialog.types.ts`, replace:

```ts
import type { ConfirmDialogStrings } from '../ConfirmDialog/ConfirmDialog.types';
```

with:

```ts
import type { ConfirmationDialogStrings } from '../shared/ConfirmationDialog/ConfirmationDialog.types';
```

Replace the string prop type:

```ts
confirmDialogStrings?: Partial<ConfirmationDialogStrings>;
```

- [ ] **Step 4: Remove empty folder**

Run:

```bash
rmdir packages/spfx-m365-actionable-provisioning/src/components/ConfirmDialog
```

Expected: command succeeds.

- [ ] **Step 5: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src/components
git commit -m "refactor: rename shared confirmation dialog"
```

Expected: commit created.

---

### Task 3: Rename Dialog Shared Controls And Mode Views Without Behavior Changes

**Files:**
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/DialogShell.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/DialogShell.types.ts`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ErrorBoundary.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/KPIDisplay.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/KPIDisplay.types.ts`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/LogSection.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/LogSection.types.ts`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningView.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningView.types.ts`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ComplianceView.tsx`
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ComplianceView.types.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.tsx`

- [ ] **Step 1: Create folders**

Run:

```bash
mkdir -p packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared
mkdir -p packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views
```

Expected: folders exist.

- [ ] **Step 2: Move files**

Run:

```bash
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/DialogShell.tsx packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/ProvisioningDialogShell.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/DialogShell.types.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/ProvisioningDialogShell.types.ts
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ErrorBoundary.tsx packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/ProvisioningDialogErrorBoundary.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/KPIDisplay.tsx packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/KpiSummaryBar.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/KPIDisplay.types.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/KpiSummaryBar.types.ts
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/LogSection.tsx packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/DialogLogSection.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/LogSection.types.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/DialogLogSection.types.ts
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningView.tsx packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ProvisioningRunView.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningView.types.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ProvisioningRunView.types.ts
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ComplianceView.tsx packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ComplianceCheckView.tsx
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ComplianceView.types.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ComplianceCheckView.types.ts
```

Expected: files moved.

- [ ] **Step 3: Rename symbols in moved files**

Apply these exact symbol replacements inside moved files:

```text
DialogShell -> ProvisioningDialogShell
DialogShellProps -> ProvisioningDialogShellProps
ErrorBoundary -> ProvisioningDialogErrorBoundary
KPIDisplay -> KpiSummaryBar
KPIDisplayProps -> KpiSummaryBarProps
KPIBadgeSpec -> KpiBadgeSpec
LogSection -> DialogLogSection
LogSectionProps -> DialogLogSectionProps
ProvisioningView -> ProvisioningRunView
ProvisioningViewProps -> ProvisioningRunViewProps
ProvisioningViewStrings -> ProvisioningRunViewStrings
ComplianceView -> ComplianceCheckView
ComplianceViewProps -> ComplianceCheckViewProps
ComplianceViewStrings -> ComplianceCheckViewStrings
```

Also update import paths in moved files:

```ts
// From views/* to shared/*
import { KpiSummaryBar } from '../shared/KpiSummaryBar';
import { DialogLogSection } from '../shared/DialogLogSection';

// From shared/* to LogPanel
import { LogPanel } from '../../LogPanel/LogPanel';
```

Expected: TypeScript symbols use the new names.

- [ ] **Step 4: Update `ProvisioningDialog.tsx` imports**

Replace imports:

```ts
import { DialogShell } from './DialogShell';
import { ProvisioningView } from './ProvisioningView';
import type { ProvisioningViewStrings } from './ProvisioningView.types';
import { ComplianceView } from './ComplianceView';
import type { ComplianceViewStrings } from './ComplianceView.types';
```

with:

```ts
import { ProvisioningDialogShell } from './shared/ProvisioningDialogShell';
import { ProvisioningRunView } from './views/ProvisioningRunView';
import type { ProvisioningRunViewStrings } from './views/ProvisioningRunView.types';
import { ComplianceCheckView } from './views/ComplianceCheckView';
import type { ComplianceCheckViewStrings } from './views/ComplianceCheckView.types';
```

Replace JSX tags and type names:

```text
DialogShell -> ProvisioningDialogShell
ProvisioningView -> ProvisioningRunView
ProvisioningViewStrings -> ProvisioningRunViewStrings
ComplianceView -> ComplianceCheckView
ComplianceViewStrings -> ComplianceCheckViewStrings
```

- [ ] **Step 5: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src/components
git commit -m "refactor: organize provisioning dialog controls"
```

Expected: commit created.

---

### Task 4: Rename Public Initial Mode API And Update Call Sites

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.types.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.tsx`
- Modify: `apps/test-spfx/src/webparts/testProvisioning/components/TestProvisioning.tsx`
- Modify: `docs/provisioning-dialog.md`
- Modify: `docs/introduction.md`

- [ ] **Step 1: Rename prop in type**

In `ProvisioningDialog.types.ts`, replace:

```ts
    mode?: ProvisioningDialogMode;
```

with:

```ts
    initialMode?: ProvisioningDialogMode;
```

Update the comment to:

```ts
    /**
     * Initial dialog mode applied when the dialog opens.
     * This is not treated as a controlled prop while the dialog is already open.
     */
    initialMode?: ProvisioningDialogMode;
```

- [ ] **Step 2: Rename prop in component destructuring**

In `ProvisioningDialog.tsx`, replace destructured `mode,` with:

```ts
    initialMode: initialModeProp,
```

Replace:

```ts
const initialMode: ProvisioningDialogMode = mode ?? 'provisioning';
```

with:

```ts
const initialMode: ProvisioningDialogMode = initialModeProp ?? 'provisioning';
```

Replace remaining default title/description checks that read `mode ?? 'provisioning'` with `initialMode`.

- [ ] **Step 3: Update in-repo JSX call sites**

Replace:

```tsx
mode="compliance"
```

with:

```tsx
initialMode="compliance"
```

Replace:

```tsx
mode={mode === 'compliance' ? 'compliance' : 'provisioning'}
```

with:

```tsx
initialMode={mode === 'compliance' ? 'compliance' : 'provisioning'}
```

Files:

```text
packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.tsx
apps/test-spfx/src/webparts/testProvisioning/components/TestProvisioning.tsx
docs/provisioning-dialog.md
docs/introduction.md
```

- [ ] **Step 4: Verify old prop is gone**

Run:

```bash
rg -n "mode=" packages/spfx-m365-actionable-provisioning/src apps/test-spfx/src docs/provisioning-dialog.md docs/introduction.md
```

Expected: no `ProvisioningDialog` JSX usage with `mode=`.

- [ ] **Step 5: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src apps/test-spfx/src docs/provisioning-dialog.md docs/introduction.md
git commit -m "refactor: rename provisioning dialog initial mode prop"
```

Expected: commit created.

---

### Task 5: Rename State And Action Hook Files Without Removing Logic

**Files:**
- Move: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.state.ts`
- Move: `packages/spfx-m365-actionable-provisioning/src/hooks/useDialogOrchestration/useDialogOrchestration.ts`
- Move: `packages/spfx-m365-actionable-provisioning/src/hooks/useDialogOrchestration/useDialogOrchestration.types.ts`
- Create directory: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/hooks`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/hooks/index.ts`

- [ ] **Step 1: Move state file**

Run:

```bash
git mv packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.state.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialogSession.state.ts
```

Expected: file moved.

- [ ] **Step 2: Rename state types and functions**

In `ProvisioningDialogSession.state.ts`, replace:

```text
DialogState -> ProvisioningDialogSessionState
DialogAction -> ProvisioningDialogSessionAction
dialogReducer -> provisioningDialogSessionReducer
buildInitialDialogState -> buildInitialProvisioningDialogSessionState
DialogUiError -> ProvisioningDialogUiError
```

Keep the reducer body unchanged for now, including close-reset actions. This is a naming-only slice.

- [ ] **Step 3: Move action hook files into dialog folder**

Run:

```bash
mkdir -p packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/hooks
git mv packages/spfx-m365-actionable-provisioning/src/hooks/useDialogOrchestration/useDialogOrchestration.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/hooks/useProvisioningDialogActions.ts
git mv packages/spfx-m365-actionable-provisioning/src/hooks/useDialogOrchestration/useDialogOrchestration.types.ts packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/hooks/useProvisioningDialogActions.types.ts
rmdir packages/spfx-m365-actionable-provisioning/src/hooks/useDialogOrchestration
```

Expected: files moved and old folder removed.

- [ ] **Step 4: Rename hook exports and types**

In moved hook files, replace:

```text
useDialogOrchestration -> useProvisioningDialogActions
DialogOrchestrationOptions -> ProvisioningDialogActionsOptions
DialogOrchestrationReturn -> ProvisioningDialogActionsReturn
```

Update imports to point to:

```ts
import type { ProvisioningDialogSessionAction, ProvisioningDialogSessionState } from '../ProvisioningDialogSession.state';
```

Keep hook behavior unchanged for now, including `engineResetKey`.

- [ ] **Step 5: Update component imports**

In `ProvisioningDialog.tsx`, replace state import with:

```ts
import {
    buildInitialProvisioningDialogSessionState,
    getComplianceFooterModel,
    provisioningDialogSessionReducer,
} from './ProvisioningDialogSession.state';
```

Replace hook import with:

```ts
import { useProvisioningDialogActions } from './hooks/useProvisioningDialogActions';
```

Replace reducer call:

```ts
const [state, dispatch] = React.useReducer(
    provisioningDialogSessionReducer,
    { initialMode, defaultOpenLogItems } as const,
    ({ initialMode, defaultOpenLogItems }) => buildInitialProvisioningDialogSessionState({ initialMode, defaultOpenLogItems })
);
```

Replace hook call:

```ts
} = useProvisioningDialogActions({
```

- [ ] **Step 6: Update hook index**

In `packages/spfx-m365-actionable-provisioning/src/hooks/index.ts`, remove any export for `useDialogOrchestration` if present. Do not export the new dialog-internal hook from the package-level hooks index.

- [ ] **Step 7: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 8: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src
git commit -m "refactor: rename provisioning dialog session state and actions"
```

Expected: commit created.

---

### Task 6: Extract `ProvisioningDialogSession` Preserving Behavior

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialogSession.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialog.types.ts`

- [ ] **Step 1: Add internal session props type**

In `ProvisioningDialog.types.ts`, add:

```ts
/** @internal */
export type ProvisioningDialogSessionProps = Omit<ProvisioningDialogProps, 'open' | 'onClose'> & Readonly<{
    onClose: () => void;
    registerCloseHandler: (handler: (() => void) | undefined) => void;
}>;
```

Expected: public `ProvisioningDialogProps` remains available; session props are internal.

- [ ] **Step 2: Create session file by moving runtime code**

Create `ProvisioningDialogSession.tsx` with this structure:

```tsx
import * as React from 'react';
import { Button } from '@fluentui/react-components';
import { AppsColor, ShieldCheckmarkColor } from '@fluentui/react-icons';

import { useProvisioningDerivedState } from '../../hooks/useProvisioningDerivedState/useProvisioningDerivedState';
import { useNavigationGuard } from '../../hooks/useNavigationGuard/useNavigationGuard';
import { useSPFxProvisioningEngine } from '../../hooks/useSPFxProvisioningEngine/useSPFxProvisioningEngine';
import { buildComplianceActivityEntriesFromReport, buildComplianceActivityEntriesFromTrace } from '../../utils/compliance-to-activity';
import { normalizeUrl } from '../../utils/url';
import type { ComplianceActivityEntry } from '../../models';
import { ConfirmationDialog } from '../shared/ConfirmationDialog/ConfirmationDialog';
import type { ProvisioningDialogSessionProps, ProvisioningDialogMode, ProvisioningDialogStrings, ProvisioningRunOutcome } from './ProvisioningDialog.types';
import { ProvisioningDialogShell } from './shared/ProvisioningDialogShell';
import { ProvisioningRunView } from './views/ProvisioningRunView';
import type { ProvisioningRunViewStrings } from './views/ProvisioningRunView.types';
import { ComplianceCheckView } from './views/ComplianceCheckView';
import type { ComplianceCheckViewStrings } from './views/ComplianceCheckView.types';
import {
    buildInitialProvisioningDialogSessionState,
    getComplianceFooterModel,
    provisioningDialogSessionReducer,
} from './ProvisioningDialogSession.state';
import { useProvisioningDialogActions } from './hooks/useProvisioningDialogActions';

export const ProvisioningDialogSession: React.FC<ProvisioningDialogSessionProps> = (props) => {
    const {
        onClose,
        registerCloseHandler,
        context,
        planTemplate,
        logger,
        title,
        description,
        targetSiteUrl,
        enableComplianceCheck,
        complianceAutoRunOnOpen,
        compliancePolicy,
        initialMode: initialModeProp,
        strings,
        confirmRun,
        defaultStrings,
        surfaceContentClassName,
    } = props as ProvisioningDialogSessionProps & {
        defaultStrings?: ProvisioningDialogStrings;
        surfaceContentClassName?: string;
    };

    const defaultOpenLogItems = React.useMemo(() => ['logs'], []);
    const normalizedTargetSiteUrl = React.useMemo(() => normalizeUrl(targetSiteUrl), [targetSiteUrl]);
    const s = React.useMemo(() => ({
        ...defaultStrings,
        ...(strings ?? {}),
    } satisfies ProvisioningDialogStrings), [defaultStrings, strings]);
    const initialMode: ProvisioningDialogMode = initialModeProp ?? 'provisioning';

    // Paste the existing reducer, engine, derived state, action hook, footer, and content code
    // from the current ProvisioningDialog body below this point. In this task keep behavior
    // unchanged, including engineResetKey and close reset logic; Task 7 removes that lifecycle code.
};

ProvisioningDialogSession.displayName = 'ProvisioningDialogSession';
```

Then move all runtime code currently inside `ProvisioningDialog` into this component:

- normalized target URL
- merged strings
- effective title/description
- reducer
- `localEngineResetKey`
- `useSPFxProvisioningEngine`
- derived state
- navigation guard
- `useProvisioningDialogActions`
- final outcome and compliance derived state
- footer render functions
- content render function
- `ConfirmationDialog`

Do not include `<Dialog>` or `<DialogSurface>` in the session.

- [ ] **Step 3: Register close handler from session**

Inside `ProvisioningDialogSession`, after `handleClose` is returned by `useProvisioningDialogActions`, add:

```ts
React.useEffect(() => {
    registerCloseHandler(handleClose);
    return () => registerCloseHandler(undefined);
}, [handleClose, registerCloseHandler]);
```

Expected: wrapper can route Escape close requests to session-owned rules.

- [ ] **Step 4: Reduce wrapper to controlled Fluent shell**

In `ProvisioningDialog.tsx`, keep:

- `DEFAULT_STRINGS`
- export type re-exports
- `useProvisioningDialogStyles`
- `<Dialog>`
- `<DialogSurface>`
- `ProvisioningDialogSession`

The component body should be shaped like:

```tsx
export const ProvisioningDialog: React.FC<ProvisioningDialogProps> = (props) => {
    const styles = useProvisioningDialogStyles();
    const closeHandlerRef = React.useRef<(() => void) | undefined>(undefined);

    const registerCloseHandler = React.useCallback((handler: (() => void) | undefined) => {
        closeHandlerRef.current = handler;
    }, []);

    const requestClose = React.useCallback(() => {
        closeHandlerRef.current?.();
    }, []);

    return (
        <Dialog
            open={props.open}
            modalType="alert"
            unmountOnClose={true}
            onOpenChange={(_, data) => {
                if (!data.open) requestClose();
            }}
        >
            <DialogSurface className={styles.surface}>
                <ProvisioningDialogSession
                    {...props}
                    defaultStrings={DEFAULT_STRINGS}
                    registerCloseHandler={registerCloseHandler}
                />
            </DialogSurface>
        </Dialog>
    );
};
```

If TypeScript rejects `defaultStrings` because it is not in the session props, add it explicitly to `ProvisioningDialogSessionProps`.

- [ ] **Step 5: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`. If imports fail because relative paths changed, update only the broken import paths and rerun.

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog
git commit -m "refactor: extract provisioning dialog session"
```

Expected: commit created.

---

### Task 7: Remove Close Reset And Engine Reset Key

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/hooks/useProvisioningDialogActions.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/hooks/useProvisioningDialogActions.types.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialogSession.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/ProvisioningDialogSession.state.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ComplianceCheckView.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ComplianceCheckView.types.ts`

- [ ] **Step 1: Remove open/close lifecycle from action hook options**

In `useProvisioningDialogActions.types.ts`, remove these option fields:

```ts
open: boolean;
defaultOpenLogItems: ReadonlyArray<string>;
```

Remove return field:

```ts
engineResetKey: number;
```

Expected: action hook no longer exposes artificial engine reset.

- [ ] **Step 2: Delete close lifecycle refs and effects**

In `useProvisioningDialogActions.ts`, remove:

```ts
const [engineResetKey, setEngineResetKey] = React.useState(0);
const prevOpenRef = React.useRef(open);
const closeResetTimerRef = React.useRef<number | undefined>(undefined);
const closeResetTokenRef = React.useRef(0);
```

Remove the open/close alignment effect and timer cleanup effect. Remove dispatches:

```ts
dispatch({ type: 'OPEN_ALIGN', initialMode });
dispatch({ type: 'CLOSE_HARD_RESET', initialMode, defaultOpenLogItems });
dispatch({ type: 'SET_CLOSING', value: true });
```

Keep `checkRunIdRef`, `runSiteUrlRef`, `awaitingCompletionRef`, `completionEmittedRef`, and auto-run refs.

- [ ] **Step 3: Add unmount cleanup in the action hook**

Add this cleanup effect to invalidate async work on session unmount:

```ts
React.useEffect(() => {
    return () => {
        checkRunIdRef.current += 1;
        awaitingCompletionRef.current = false;
        completionEmittedRef.current = true;
        cancel();
    };
}, [cancel]);
```

Expected: external parent close disposes session, cancels active work, and prevents late completion emission.

- [ ] **Step 4: Keep direct close handler simple**

In `handleClose`, use:

```ts
const handleClose = React.useCallback(() => {
    if (state.activeMode === 'provisioning') {
        if (isRunning || state.runInFlight) return;
        onClose();
        return;
    }

    if (state.complianceIsChecking) cancel();
    onClose();
}, [cancel, isRunning, onClose, state.activeMode, state.complianceIsChecking, state.runInFlight]);
```

Expected: close button and Escape use the same logic.

- [ ] **Step 5: Remove close-reset state actions**

In `ProvisioningDialogSession.state.ts`, remove:

```ts
isClosing: boolean;
| Readonly<{ type: 'OPEN_ALIGN'; initialMode: ProvisioningDialogMode }>
| Readonly<{ type: 'CLOSE_HARD_RESET'; initialMode: ProvisioningDialogMode; defaultOpenLogItems: ReadonlyArray<string> }>
| Readonly<{ type: 'SET_CLOSING'; value: boolean }>
```

Remove corresponding reducer cases. Remove `isClosing: false` from initial state.

- [ ] **Step 6: Remove engine reset from session**

In `ProvisioningDialogSession.tsx`, remove:

```ts
const [localEngineResetKey, setLocalEngineResetKey] = React.useState(0);
resetKey: localEngineResetKey,
engineResetKey,
React.useEffect(() => {
    setLocalEngineResetKey(engineResetKey);
}, [engineResetKey]);
```

Do not pass `resetKey` to `useSPFxProvisioningEngine` from the dialog. Session unmount now resets engine state.

- [ ] **Step 7: Remove `isClosing` from compliance view**

In `ComplianceCheckView.types.ts`, remove:

```ts
isClosing: boolean;
```

In `ComplianceCheckView.tsx`, remove prop destructuring and remove this condition:

```ts
if (isClosing) return undefined;
```

In `ProvisioningDialogSession.tsx`, remove:

```tsx
isClosing={state.isClosing}
```

In final outcome calculation, remove:

```ts
if (state.isClosing) return undefined;
```

- [ ] **Step 8: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 9: Verify reset code is gone**

Run:

```bash
rg -n "CLOSE_HARD_RESET|OPEN_ALIGN|SET_CLOSING|isClosing|engineResetKey|localEngineResetKey|closeReset|prevOpenRef" packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog packages/spfx-m365-actionable-provisioning/src/hooks
```

Expected: no output.

- [ ] **Step 10: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src
git commit -m "refactor: remove provisioning dialog close reset"
```

Expected: commit created.

---

### Task 8: Add Shared Error Message Control And Clean View Duplication

**Files:**
- Create: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/shared/DialogErrorMessage.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ProvisioningRunView.tsx`
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/views/ComplianceCheckView.tsx`

- [ ] **Step 1: Create shared error component**

Create `DialogErrorMessage.tsx`:

```tsx
import * as React from 'react';
import {
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
} from '@fluentui/react-components';

import type { ProvisioningDialogUiError } from '../ProvisioningDialogSession.state';

export type DialogErrorMessageProps = Readonly<{
    error: ProvisioningDialogUiError | undefined;
}>;

export const DialogErrorMessage: React.FC<DialogErrorMessageProps> = ({ error }): React.ReactElement | null => {
    if (!error) return null;

    return (
        <MessageBar intent="error">
            <MessageBarBody>
                <MessageBarTitle>{error.title}</MessageBarTitle>
                {error.message}
            </MessageBarBody>
        </MessageBar>
    );
};

DialogErrorMessage.displayName = 'DialogErrorMessage';
```

- [ ] **Step 2: Use in `ProvisioningRunView`**

Remove imports:

```ts
MessageBar,
MessageBarBody,
MessageBarTitle,
```

Add:

```ts
import { DialogErrorMessage } from '../shared/DialogErrorMessage';
```

Remove local `renderErrorBox`. Replace:

```tsx
{renderErrorBox(uiError)}
{renderErrorBox(engineError)}
```

with:

```tsx
<DialogErrorMessage error={uiError} />
<DialogErrorMessage error={engineError} />
```

- [ ] **Step 3: Use in `ComplianceCheckView`**

Remove imports:

```ts
MessageBar,
MessageBarBody,
MessageBarTitle,
```

Add:

```ts
import { DialogErrorMessage } from '../shared/DialogErrorMessage';
```

Remove local `renderErrorBox`. Replace:

```tsx
{renderErrorBox(uiError)}
```

with:

```tsx
<DialogErrorMessage error={uiError} />
```

- [ ] **Step 4: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog
git commit -m "refactor: share provisioning dialog error message"
```

Expected: commit created.

---

### Task 9: Rationalize Property Pane Dialog Configuration

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.utils.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView.tsx`

- [ ] **Step 1: Replace generic mode type and helper**

In `PropertyPaneProvisioningFieldView.utils.ts`, replace file content with:

```ts
/**
 * Internal utilities for PropertyPaneProvisioningField view.
 *
 * @internal
 * @packageDocumentation
 */

import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningDialogMode, ProvisioningDialogStrings } from '../../components';
import type { PropertyPaneProvisioningFieldStrings } from './types';

export type PropertyPaneProvisioningDialogIntent = 'provision' | 'deprovision' | 'compliance';

export type ProvisioningFieldDialogConfig = Readonly<{
  title: string | undefined;
  description: string | undefined;
  initialMode: ProvisioningDialogMode;
  planTemplate: M365ProvisioningPlan;
  strings: Partial<ProvisioningDialogStrings> | undefined;
  confirmRun: boolean;
  complianceAutoRunOnOpen: boolean | undefined;
}>;

type DialogConfigPlans = Readonly<{
  provisioningActionPlan: M365ProvisioningPlan;
  deprovisioningActionPlan?: M365ProvisioningPlan;
}>;

export function getProvisioningFieldDialogConfig(
  intent: PropertyPaneProvisioningDialogIntent,
  args: Readonly<{
    plans: DialogConfigPlans;
    strings: PropertyPaneProvisioningFieldStrings;
    complianceAutoRunOnOpen?: boolean;
    confirmDeprovisionRun?: boolean;
  }>
): ProvisioningFieldDialogConfig {
  const isDeprovision = intent === 'deprovision';
  const isCompliance = intent === 'compliance';
  const dialogStrings = isDeprovision ? args.strings.deprovisioningDialogStrings : args.strings.provisioningDialogStrings;

  const defaultProvisioningHelp = isDeprovision
    ? 'Use Run to remove the template from the target site (deprovision). You can monitor progress and review logs as actions execute.'
    : 'Use Run to apply the template to the target site. You can monitor progress and review logs as actions execute.';

  const defaultComplianceHelp = 'Use Check to preview compliance issues before applying changes.';

  return {
    title: isDeprovision
      ? args.strings.deprovisioningDialogTitle
      : intent === 'provision'
        ? args.strings.provisioningDialogTitle
        : undefined,
    description: isDeprovision
      ? args.strings.deprovisioningDialogDescription
      : intent === 'provision'
        ? args.strings.provisioningDialogDescription
        : undefined,
    initialMode: isCompliance ? 'compliance' : 'provisioning',
    planTemplate: isDeprovision
      ? (args.plans.deprovisioningActionPlan ?? args.plans.provisioningActionPlan)
      : args.plans.provisioningActionPlan,
    strings: {
      ...dialogStrings,
      initialHelpProvisioningText: dialogStrings?.initialHelpProvisioningText ?? defaultProvisioningHelp,
      initialHelpComplianceText: dialogStrings?.initialHelpComplianceText ?? defaultComplianceHelp,
    },
    confirmRun: isDeprovision && args.confirmDeprovisionRun === true,
    complianceAutoRunOnOpen: isCompliance ? true : (!isDeprovision ? args.complianceAutoRunOnOpen : undefined),
  };
}
```

- [ ] **Step 2: Update property pane view imports and state**

In `PropertyPaneProvisioningFieldView.tsx`, replace:

```ts
import { getDialogPlanTemplate, type Mode } from './PropertyPaneProvisioningFieldView.utils';
```

with:

```ts
import {
  getProvisioningFieldDialogConfig,
  type PropertyPaneProvisioningDialogIntent,
} from './PropertyPaneProvisioningFieldView.utils';
```

Replace:

```ts
const [mode, setMode] = React.useState<Mode>('provision');
```

with:

```ts
const [dialogIntent, setDialogIntent] = React.useState<PropertyPaneProvisioningDialogIntent>('provision');
```

Replace `setMode(...)` calls with `setDialogIntent(...)`.

- [ ] **Step 3: Replace scattered dialog config**

Remove local variables:

```ts
dialogTitle
dialogDescription
dialogStrings
effectiveDialogStrings
dialogPlanTemplate
```

Add:

```ts
const dialogConfig = React.useMemo(() => getProvisioningFieldDialogConfig(dialogIntent, {
  plans: {
    provisioningActionPlan: props.provisioningActionPlan,
    deprovisioningActionPlan: props.deprovisioningActionPlan,
  },
  strings: props.strings,
  complianceAutoRunOnOpen: props.complianceAutoRunOnOpen,
  confirmDeprovisionRun: props.confirmDeprovisionRun,
}), [
  dialogIntent,
  props.provisioningActionPlan,
  props.deprovisioningActionPlan,
  props.strings,
  props.complianceAutoRunOnOpen,
  props.confirmDeprovisionRun,
]);
```

Update completion mapping:

```ts
const next: TemplateAppliedState =
  ev.outcome === 'succeeded'
    ? (dialogIntent === 'deprovision' ? 'notApplied' : 'applied')
    : 'unknown';
```

Update JSX:

```tsx
planTemplate={dialogConfig.planTemplate}
title={dialogConfig.title}
description={dialogConfig.description}
initialMode={dialogConfig.initialMode}
complianceAutoRunOnOpen={dialogConfig.complianceAutoRunOnOpen}
confirmRun={dialogConfig.confirmRun}
strings={dialogConfig.strings}
```

- [ ] **Step 4: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src/propertyPaneFields/PropertyPaneProvisioningField
git commit -m "refactor: centralize property pane dialog config"
```

Expected: commit created.

---

### Task 10: Update Public Exports And Documentation For New Names

**Files:**
- Modify: `packages/spfx-m365-actionable-provisioning/src/components/index.ts`
- Modify: `packages/spfx-m365-actionable-provisioning/src/index.ts`
- Modify: `docs/provisioning-dialog.md`
- Modify: `docs/property-pane-fields.md`
- Modify: `docs/introduction.md`

- [ ] **Step 1: Update component exports**

In `components/index.ts`, keep public exports focused:

```ts
export { ProvisioningDialog } from './ProvisioningDialog/ProvisioningDialog';
export type {
	ProvisioningCompletedEvent,
	ProvisioningDialogProps,
	ProvisioningDialogStrings,
	ProvisioningRunOutcome,
} from './ProvisioningDialog/ProvisioningDialog.types';

export {
	type ProvisioningDialogMode,
} from './ProvisioningDialog/ProvisioningDialog.types';

export { SPFxFluentProvider } from './SPFxFluentProvider/SPFxFluentProvider';
export type { SPFxFluentProviderProps } from './SPFxFluentProvider/SPFxFluentProvider.types';
```

Do not export dialog-internal session/action/view/shared components unless an in-repo consumer requires them.

- [ ] **Step 2: Update docs for `initialMode`**

Run:

```bash
perl -0pi -e 's/\bmode\b/initialMode/g' docs/provisioning-dialog.md docs/introduction.md
```

Then manually review the changed docs and fix grammar where needed. Keep prose accurate: `initialMode` is read on open and is not controlled while already open.

- [ ] **Step 3: Update docs for renamed internals only where mentioned**

Run:

```bash
perl -0pi -e 's/ProvisioningView/ProvisioningRunView/g; s/ComplianceView/ComplianceCheckView/g; s/KPIDisplay/KpiSummaryBar/g; s/LogSection/DialogLogSection/g; s/ConfirmDialog/ConfirmationDialog/g; s/useDialogOrchestration/useProvisioningDialogActions/g' docs/provisioning-dialog.md docs/introduction.md docs/property-pane-fields.md
```

Expected: docs use new names.

- [ ] **Step 4: Verify old names are closed**

Run:

```bash
rg -n "ConfirmDialog|KPIDisplay|LogSection|DialogShell|ErrorBoundary|ProvisioningView|ComplianceView|useDialogOrchestration|DialogState|mode=" packages/spfx-m365-actionable-provisioning/src apps/test-spfx/src docs
```

Expected: no results for old implementation names. If docs intentionally mention old names in migration notes, remove those notes because backward compatibility is not required.

- [ ] **Step 5: Build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/spfx-m365-actionable-provisioning/src docs apps/test-spfx/src
git commit -m "docs: update provisioning dialog naming"
```

Expected: commit created.

---

### Task 11: Final Verification And Manual Checklist

**Files:**
- Read: all changed files from previous tasks.

- [ ] **Step 1: Run final build**

Run:

```bash
npm run build:spfx
```

Expected: exit code `0`.

- [ ] **Step 2: Run full monorepo build if time allows**

Run:

```bash
npm run build
```

Expected: exit code `0`. If this fails outside the SPFx UI package, record the failing workspace and diagnostic without changing unrelated code.

- [ ] **Step 3: Verify reset code closure**

Run:

```bash
rg -n "CLOSE_HARD_RESET|OPEN_ALIGN|SET_CLOSING|isClosing|engineResetKey|localEngineResetKey|closeReset|prevOpenRef" packages/spfx-m365-actionable-provisioning/src
```

Expected: no output.

- [ ] **Step 4: Verify naming closure**

Run:

```bash
rg -n "ConfirmDialog|KPIDisplay|LogSection|DialogShell|ProvisioningView|ComplianceView|useDialogOrchestration|DialogState|mode=" packages/spfx-m365-actionable-provisioning/src apps/test-spfx/src docs
```

Expected: no output.

- [ ] **Step 5: Manual SPFx verification checklist**

Start the demo app:

```bash
npm run serve:test-spfx
```

Expected: SPFx dev server starts. In the browser or workbench, verify:

```text
[ ] Open provisioning dialog, close, reopen: initial help state is clean.
[ ] Run provisioning, close after terminal result, reopen: previous logs/result are gone.
[ ] Open direct compliance dialog: compliance auto-run starts once.
[ ] From provisioning dialog, click Check compliance: compliance check starts once and Back returns to provisioning.
[ ] During provisioning run, close button/Escape do not close the dialog.
[ ] During compliance check, close request cancels check and closes.
[ ] Deprovision with confirmation enabled: Cancel returns to the main dialog; Confirm runs once.
[ ] Property pane effective-state update is still buffered until dialog close.
```

- [ ] **Step 6: Commit final verification notes if docs changed**

If manual verification required adding notes to docs, commit them:

```bash
git add docs
git commit -m "docs: record provisioning dialog verification"
```

If no docs changed, skip this step.

---

## Self-Review

- Spec coverage: Tasks cover naming cleanup, folder layout, shared controls, `initialMode`, session extraction, reset removal, action hook rename, property pane rationalization, docs/call sites, and verification.
- Drafting-marker scan: no unresolved implementation markers are intentionally left in this plan.
- Type consistency: New names used consistently are `ConfirmationDialog`, `KpiSummaryBar`, `DialogLogSection`, `ProvisioningDialogShell`, `ProvisioningRunView`, `ComplianceCheckView`, `ProvisioningDialogSessionState`, `useProvisioningDialogActions`, `initialMode`, `PropertyPaneProvisioningDialogIntent`, and `getProvisioningFieldDialogConfig`.
