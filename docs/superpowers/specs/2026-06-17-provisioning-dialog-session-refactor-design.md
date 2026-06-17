# Provisioning Dialog Session Refactor Design

## Context

`@apvee/spfx-m365-actionable-provisioning` exposes `ProvisioningDialog` as the reusable UI for provisioning and compliance checks. The current implementation already uses Fluent UI 9 `Dialog`, whose installed `@fluentui/react-dialog` package supports `unmountOnClose` and defaults it to `true`.

The current reset complexity does not come from the Fluent surface staying mounted. It comes from the fact that the stateful provisioning runtime lives above the `<Dialog>` subtree:

- `ProvisioningDialog` creates the reducer state, provisioning engine, derived state, navigation guard, and orchestration hook before rendering `<Dialog>`.
- Fluent can unmount `DialogSurface`, but the parent component state and hooks remain alive while `open={false}`.
- `useDialogOrchestration` compensates with open/close tracking, a delayed reset timer, token invalidation, manual ref cleanup, and an `engineResetKey`.

The target refactor moves the runtime boundary so each dialog opening owns a short-lived session. Closing the dialog should dispose the session naturally instead of simulating disposal through reducer actions and timers.

## Goals

- Clean the public and internal API names where current names hide intent or lifecycle.
- Preserve current visible behavior for provisioning, deprovisioning, compliance checks, auto-run compliance, confirmation, cancellation, and completion callbacks.
- Make a new dialog opening start from a fresh runtime session by construction.
- Remove lifecycle/reset code that exists only because the runtime currently survives close.
- Keep the refactor incremental enough to validate with TypeScript build and focused manual SPFx demo flows.
- Improve component boundaries so UI controls are easier to reason about and reuse.
- Move shared dialog controls into explicit shared folders instead of leaving them mixed with mode-specific views.

## Non-Goals

- Backward compatibility is not required for this refactor. Public exports, props, and type names may change if the new names are clearer and all in-repo consumers/docs are updated in the same change.
- Do not change provisioning engine behavior.
- Do not change SharePoint action schemas or runtime semantics.
- Do not redesign the visual UI.
- Do not remove the property pane update buffering, because SPFx property changes can re-render or remount the property pane while the dialog is open.
- Do not introduce new runtime dependencies.
- Do not make the initial dialog mode a fully controlled prop while the dialog is already open.

## Current Problems

### Reset Is Implemented Twice

Fluent UI can remove dialog content from the DOM on close, but the application-level runtime remains mounted. The code therefore does manual cleanup through:

- `prevOpenRef`
- `closeResetTimerRef`
- `closeResetTokenRef`
- `CLOSE_HARD_RESET`
- `SET_CLOSING`
- `isClosing`
- `engineResetKey`
- `localEngineResetKey`
- reset logic for completion refs and compliance auto-run refs

This makes close behavior harder to reason about than the actual user flow.

### Dialog Runtime Boundary Is Too High

`ProvisioningDialog` currently does three jobs:

- Public controlled component wrapper.
- Runtime session owner for engine, reducer, effects, and callbacks.
- UI composition layer for shell, content, footer, and nested confirmation dialog.

Those concerns should have different lifetimes.

### Orchestration Hook Owns Too Much Lifecycle

`useDialogOrchestration` should coordinate user actions, not emulate component remounting. The hook currently owns both action handlers and open/close lifecycle cleanup.

### Property Pane Dialog Configuration Is Scattered

`PropertyPaneProvisioningFieldView` derives title, description, strings, plan, mode, auto-run, and confirmation through multiple local branches. The behavior is understandable but more fragile than necessary.

### Names Mix Lifetime, Domain, And Rendering

Current names such as `ProvisioningView`, `ComplianceView`, `KPIDisplay`, `LogSection`, `DialogState`, and `useDialogOrchestration` are understandable locally, but they do not consistently communicate whether the unit is:

- a public component,
- a per-open runtime session,
- a mode-specific view,
- a shared control,
- a state type,
- or an action hook.

This matters because the refactor is primarily about moving lifecycle boundaries. Names should make those boundaries obvious.

## Target Architecture

### Component Boundary

Split the dialog into two layers:

```text
ProvisioningDialog
  - public controlled component
  - owns only controlled open/close shell concerns
  - renders Fluent Dialog with explicit unmountOnClose
  - mounts ProvisioningDialogSession inside DialogSurface

ProvisioningDialogSession
  - owns one open dialog runtime
  - owns reducer, engine hook, derived state, navigation guard
  - owns provisioning/compliance actions
  - owns shell content and footer composition
  - is discarded on close
```

`ProvisioningDialog` remains the top-level dialog component. There should not be separate public `ProvisioningDialog` and `ComplianceDialog` components. Compliance is a mode of the same provisioning workflow, shares the same shell, target site, plan, engine, log model, close handling, and navigation path, and can be entered from inside the provisioning flow.

The implementation should split by lifetime and mode, not by creating two independent dialogs:

```text
ProvisioningDialog
  ProvisioningDialogSession
    ProvisioningRunView
    ComplianceCheckView
```

Rename the public prop currently named `mode` to `initialMode` because it is not controlled after open. This is allowed by the no-backward-compatibility constraint and avoids implying a controlled mode prop.

### Target Folder Layout

Use folder boundaries to distinguish shared controls from mode-specific views:

```text
components/
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

Keep low-level `LogPanel` as a package-level shared component if it is intended to be reusable outside `ProvisioningDialog`. Keep dialog-specific wrappers such as accordion layout under `ProvisioningDialog/shared`.

### Naming Rules

- Use `ProvisioningDialog` for the top-level controlled component.
- Use `ProvisioningDialogSession` for anything whose lifetime is one open dialog instance.
- Use `ProvisioningRunView` for the execution/provisioning/deprovisioning mode view.
- Use `ComplianceCheckView` for the compliance mode view.
- Use `ProvisioningDialogShell` for dialog chrome if the component stays domain-specific.
- Use `ConfirmationDialog`, not `ConfirmDialog`, for a generic reusable confirmation control.
- Use `KpiSummaryBar`, not `KPIDisplay`, for KPI badge summaries.
- Use `DialogLogSection`, not `LogSection`, for the dialog accordion wrapper around `LogPanel`.
- Use `DialogErrorMessage` for the repeated Fluent `MessageBar` error block.
- Use `useProvisioningDialogActions`, not `useDialogOrchestration`, after lifecycle logic is removed.
- Use `ProvisioningDialogSessionState`, not `DialogState`, once state becomes session-owned.
- Use `PropertyPaneProvisioningDialogIntent`, not `Mode`, for the property-pane intent union.

### Lifecycle Model

When `open` becomes true:

1. `ProvisioningDialog` renders `<Dialog open={true} unmountOnClose>`.
2. Fluent mounts the surface.
3. `ProvisioningDialogSession` is created with fresh reducer state and fresh engine state.
4. Initial mode is read from `props.initialMode ?? 'provisioning'`.
5. Compliance auto-run may start if mode and props allow it.

When the user requests close:

1. The session-level close handler checks whether close is allowed.
2. Provisioning mode blocks close while provisioning is running.
3. Compliance mode cancels an active check before closing.
4. The wrapper calls `onClose`.
5. Parent sets `open={false}`.
6. Fluent unmounts the surface and session.
7. Engine cleanup happens through `useSPFxProvisioningEngine` effect cleanup.

No delayed hard reset is required.

If a parent externally changes `open` to `false` while an operation is active, the session is still disposed by unmount. That path should preserve today's effective behavior: the engine cleanup cancels active work, stale async results are ignored, and no extra completion event is emitted after the session has been abandoned.

### Explicit Fluent Contract

Set `unmountOnClose={true}` explicitly even though the installed package defaults to true. This is not relied on as the only fix; it documents the component contract and protects against future default changes.

## State Model

### Keep

Keep reducer state for state that is real while a session is open:

- `activeMode`
- `canGoBackFromCompliance`
- `runInFlight`
- `uiError`
- `openLogItems`
- `confirmOpen`
- `complianceOpenLogItems`
- `complianceReport`
- `complianceIsChecking`
- `complianceError`

### Remove

Remove state and actions whose only purpose is close/reset simulation:

- `isClosing`
- `OPEN_ALIGN`
- `CLOSE_HARD_RESET`
- `SET_CLOSING`

### Simplify Initial State

`buildInitialProvisioningDialogSessionState` can remain, but it should only initialize a session. It should not need close reset semantics.

## Action Hook Design

Refactor `useDialogOrchestration` into `useProvisioningDialogActions`.

### Keep Responsibilities

- Validate target site before run.
- Open confirmation before run when `confirmRun` is true.
- Start provisioning and emit `onProvisioningCompleted` once.
- Cancel active operation when requested.
- Start compliance checks.
- Ignore stale compliance results through a run id.
- Switch between provisioning and compliance modes.
- Trigger compliance auto-run for the current session.

### Remove Responsibilities

- Tracking previous `open` value.
- Scheduling delayed close resets.
- Resetting reducer state on close.
- Resetting engine through `engineResetKey`.
- Resetting auto-run refs on close.
- Suppressing badges during close animation.

### Completion Callback Invariant

`onProvisioningCompleted` must fire at most once for a provisioning run. This remains protected through per-session refs:

- `runSiteUrlRef`
- `awaitingCompletionRef`
- `completionEmittedRef`

These refs reset naturally when the session unmounts.

## ProvisioningDialog Wrapper Design

The wrapper should:

- Compute strings that are pure public API defaults if needed by the shell.
- Keep `ConfirmationDialog` session-owned so confirmation state is disposed with the rest of the opened dialog session.
- Pass all public props to `ProvisioningDialogSession`.
- Handle `onOpenChange` by routing close requests into the session close handler.

Because close permission depends on session state, the wrapper needs a stable bridge from session to dialog close. Use one design:

- Keep `<Dialog>` in the wrapper.
- Store the active session close handler in a wrapper ref.
- Let `ProvisioningDialogSession` register its `handleClose` on mount and clear it on unmount.
- Let `ProvisioningDialogShell` close button call the same session-owned `handleClose`.
- Let `<Dialog onOpenChange>` call the registered session close handler when `data.open === false`.
- If no session close handler is registered, do nothing except for already-closed cleanup paths.

The current dialog uses `modalType="alert"`. Fluent's installed implementation sends `onOpenChange` for Escape, but backdrop clicks only request close for `modalType="modal"`. Keep `modalType="alert"` unless there is a separate product decision to change dismissal semantics. The ref bridge must therefore preserve Escape and close-button behavior; backdrop dismissal is not part of the current contract.

`ConfirmationDialog` can remain implemented with Fluent `Dialog`, but it should be rendered from the session so `confirmOpen` does not need to move to the wrapper. Because this makes it a nested dialog in React context, confirm/cancel focus behavior must be included in manual verification.

## UI Component Rationalization

### Mode Views

Rename the current mode views:

- `ProvisioningView` -> `ProvisioningRunView`
- `ComplianceView` -> `ComplianceCheckView`

Keep these as separate mode views because they represent different domain states. Do not merge them into a generic `OperationView`; that would hide domain differences. Instead, move exact shared UI pieces into `ProvisioningDialog/shared`.

### Shared Dialog Controls

Move shared controls used by both mode views into `ProvisioningDialog/shared`:

- `DialogErrorMessage`: one Fluent `MessageBar` implementation for user-facing errors.
- `KpiSummaryBar`: shared badge summary container used by both modes.
- `DialogLogSection`: shared accordion wrapper around `LogPanel`.
- `ProvisioningDialogShell`: shared title/description/icon/content/footer chrome.
- `ProvisioningDialogErrorBoundary`: shell-level boundary, renamed for domain clarity.

Keep each shared control small and presentational. Shared controls must not know about provisioning engine snapshots or compliance reports; mode views should compute view models and pass plain props.

### Footer Models

Keep `getComplianceFooterModel` and add `getProvisioningRunFooterModel` if it makes button rendering declarative. Footer model functions should be pure and testable without React.

### Log and KPI Controls

Keep `LogPanel` as the lower-level renderer for provisioning and compliance activity entries. Rename dialog-specific controls to avoid generic names that look package-wide when they are not.

### Package-Level Shared Controls

Move `ConfirmDialog` out of `components/ConfirmDialog` and rename it to `components/shared/ConfirmationDialog` only if it remains generic after review. If it becomes provisioning-run-specific, keep it under `ProvisioningDialog/shared` as `RunConfirmationDialog`.

Recommended choice: `components/shared/ConfirmationDialog`, because the current props are generic enough and no provisioning domain types leak into it.

## Property Pane Rationalization

Rename the property pane intent type and introduce a pure config helper in `PropertyPaneProvisioningFieldView.utils.ts`:

```ts
type PropertyPaneProvisioningDialogIntent = 'provision' | 'deprovision' | 'compliance';

getProvisioningFieldDialogConfig(intent, props)
```

It should derive:

- `title`
- `description`
- `initialMode`
- `planTemplate`
- `strings`
- `confirmRun`
- `complianceAutoRunOnOpen`

Keep these behaviors:

- Provision mode uses provisioning plan.
- Deprovision mode uses deprovisioning plan and optional confirmation.
- Compliance mode uses provisioning plan and auto-runs compliance.
- The field passes `enableComplianceCheck={false}` to avoid nested mode switching inside the property pane dialog.
- Pending property updates remain buffered until dialog close.

## Error Handling

Preserve current user-facing errors:

- Missing target site in provisioning mode sets provisioning UI error.
- Missing target site in compliance mode sets compliance UI error.
- Engine errors are displayed from the snapshot in `ProvisioningRunView`.
- Compliance check exceptions show `complianceErrorFallbackTitle`.

Session unmount should not emit new errors. It should cancel or ignore stale async results.

## Testing And Verification

### Required Automated Verification

- `npm run build:spfx`

### Recommended Focused Characterization

If test infrastructure is added or already available, cover:

- Opening after close starts with no previous logs, errors, confirmation state, compliance report, or run state.
- `onProvisioningCompleted` fires once for terminal success/failure/cancelled snapshots.
- Compliance auto-run fires once per opened compliance session.
- Stale compliance result is ignored after a newer run starts.
- Close is blocked while provisioning is running.
- Compliance close cancels active check and closes.
- Property pane deprovision success maps effective state to `notApplied`.

### Manual SPFx Demo Verification

Using the test SPFx app:

- Open provisioning dialog, run, close, reopen: previous result/log state is gone.
- Open compliance dialog directly: auto-run starts once.
- Open provisioning dialog, switch to compliance: check starts once and Back returns to provisioning.
- Open deprovisioning with confirmation enabled: confirm runs once, cancel returns to the main dialog, and focus remains usable.
- Cancel provisioning/compliance and verify close behavior is unchanged.
- Property pane provisioning/deprovisioning still buffers effective-state updates until close.

## Acceptance Criteria

- Public exports, prop names, docs, and in-repo consumers use the new cleaned names.
- `ProvisioningDialog` no longer needs delayed close reset logic.
- `useProvisioningDialogActions` replaces `useDialogOrchestration` and no longer returns or manages `engineResetKey`.
- `ProvisioningDialogSession.state.ts` no longer contains close-reset actions or `isClosing`.
- `useSPFxProvisioningEngine` is reset by session unmount, not by an artificial reset key from dialog close.
- Shared controls that are reused by both mode views live under `ProvisioningDialog/shared`.
- Generic confirmation UI is named `ConfirmationDialog`; if kept package-level, it lives under `components/shared`.
- The property pane uses `PropertyPaneProvisioningDialogIntent` and `getProvisioningFieldDialogConfig`.
- `npm run build:spfx` passes.
- User-visible provisioning and compliance flows remain equivalent.

## Risks

- Fluent close animation timing may affect when the session unmounts. Explicit `unmountOnClose={true}` should keep this aligned with Fluent's supported motion lifecycle.
- Escape close needs careful routing so it respects the same close rules as the close button.
- The active dialog uses `modalType="alert"`, so backdrop close should not accidentally become enabled while refactoring close handling.
- Removing `isClosing` could briefly show terminal badges during close animation. If this is visually observable, prefer solving it with session unmount timing or a local visual-only flag, not by restoring hard reset.
- Completion callbacks must not be lost if `run()` resolves and the parent closes immediately after success. The action handler should emit from the returned final snapshot before close.
- Moving `ConfirmationDialog` under the session changes it from sibling-owned state to session-owned nested dialog state. Confirm/cancel and focus restoration need manual verification.

## Implementation Slices

1. Rename mode/shared controls to the target names and update imports while preserving behavior.
2. Extract `ProvisioningDialogSession` without changing behavior.
3. Move reducer, engine, derived state, navigation guard, actions, content, and footer into the session.
4. Rename `mode` to `initialMode` and update in-repo call sites/docs.
5. Set explicit `unmountOnClose={true}` on Fluent `Dialog`.
6. Remove close-reset logic and `engineResetKey`.
7. Remove obsolete reducer actions and state fields.
8. Replace `useDialogOrchestration` with `useProvisioningDialogActions`.
9. Add `getProvisioningFieldDialogConfig` and `PropertyPaneProvisioningDialogIntent` for the property pane.
10. Move shared controls to `ProvisioningDialog/shared` or `components/shared` according to the target folder layout.
11. Verify Escape, close button, confirm/cancel, and external parent-close behavior.
12. Run `npm run build:spfx` and perform manual demo checks.

## Self-Review

- No unresolved drafting markers remain.
- Scope is limited to the SPFx UI package dialog/property pane lifecycle and control rationalization.
- The design intentionally allows public API cleanup and preserves current visible behavior.
- The primary simplification mechanism is explicit: move runtime state into a mounted session instead of resetting it manually.
- Risks call out the critical behavioral points: close routing, alert dismissal semantics, completion callback emission, and nested confirmation behavior.
