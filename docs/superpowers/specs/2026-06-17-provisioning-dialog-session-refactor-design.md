# Provisioning Dialog Session Refactor Design

## Context

`@apvee/spfx-m365-actionable-provisioning` exposes `ProvisioningDialog` as the reusable UI for provisioning and compliance checks. The current implementation already uses Fluent UI 9 `Dialog`, whose installed `@fluentui/react-dialog` package supports `unmountOnClose` and defaults it to `true`.

The current reset complexity does not come from the Fluent surface staying mounted. It comes from the fact that the stateful provisioning runtime lives above the `<Dialog>` subtree:

- `ProvisioningDialog` creates the reducer state, provisioning engine, derived state, navigation guard, and orchestration hook before rendering `<Dialog>`.
- Fluent can unmount `DialogSurface`, but the parent component state and hooks remain alive while `open={false}`.
- `useDialogOrchestration` compensates with open/close tracking, a delayed reset timer, token invalidation, manual ref cleanup, and an `engineResetKey`.

The target refactor moves the runtime boundary so each dialog opening owns a short-lived session. Closing the dialog should dispose the session naturally instead of simulating disposal through reducer actions and timers.

## Goals

- Preserve the public `ProvisioningDialogProps` API.
- Preserve current visible behavior for provisioning, deprovisioning, compliance checks, auto-run compliance, confirmation, cancellation, and completion callbacks.
- Make a new dialog opening start from a fresh runtime session by construction.
- Remove lifecycle/reset code that exists only because the runtime currently survives close.
- Keep the refactor incremental enough to validate with TypeScript build and focused manual SPFx demo flows.
- Improve component boundaries so UI controls are easier to reason about and reuse.

## Non-Goals

- Do not change provisioning engine behavior.
- Do not change SharePoint action schemas or runtime semantics.
- Do not redesign the visual UI.
- Do not remove the property pane update buffering, because SPFx property changes can re-render or remount the property pane while the dialog is open.
- Do not introduce new runtime dependencies.
- Do not make `mode` a fully controlled prop while the dialog is already open.

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

## Target Architecture

### Component Boundary

Split the dialog into two layers:

```text
ProvisioningDialog
  - public API component
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

`ProvisioningDialog` remains the only exported component. `ProvisioningDialogSession` is internal.

### Lifecycle Model

When `open` becomes true:

1. `ProvisioningDialog` renders `<Dialog open={true} unmountOnClose>`.
2. Fluent mounts the surface.
3. `ProvisioningDialogSession` is created with fresh reducer state and fresh engine state.
4. Initial mode is read from `props.mode ?? 'provisioning'`.
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

`buildInitialDialogState` can remain, but it should only initialize a session. It should not need close reset semantics.

## Orchestration Hook Design

Refactor `useDialogOrchestration` into a session action hook.

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
- Render `ConfirmDialog` only if it must live outside the session. Prefer keeping confirmation inside session unless nested dialog behavior proves problematic.
- Pass all public props to `ProvisioningDialogSession`.
- Handle `onOpenChange` by routing close requests into the session close handler.

Because close permission depends on session state, the wrapper needs a stable bridge from session to dialog close. Two acceptable designs:

1. Keep `<Dialog>` in the wrapper and let `DialogShell` close button call a session-owned `handleClose`. For Escape/backdrop, pass `onOpenChange` down through a session-owned callback exposed via a ref.
2. Move `<Dialog>` itself into an internal mounted branch while preserving exported `ProvisioningDialog`. The exported component conditionally renders the internal dialog only when `open` is true or when Fluent needs to animate close.

Recommended choice: keep `<Dialog>` in the wrapper and use a small close-request ref only if needed. First try the simpler version where `onOpenChange` calls the session close handler through a local callback prop; TypeScript and runtime behavior will reveal if a ref bridge is necessary.

## UI Component Rationalization

### ProvisioningView and ComplianceView

Keep both views separate because they represent different domain states, but extract tiny shared helpers only where duplication is exact:

- `DialogMessageBar` or `renderDialogError`
- optional KPI badge builder helpers if they stay readable

Do not force a generic `OperationView` unless it clearly reduces code after the lifecycle refactor.

### Footer Models

Keep `getComplianceFooterModel` and consider adding `getProvisioningFooterModel` if it makes button rendering declarative. Footer model functions should be pure and testable without React.

### Log and KPI Controls

Keep `LogSection` and `KPIDisplay` as reusable internal controls. They are already useful boundaries. Only adjust them if the session refactor exposes direct duplication or typing friction.

## Property Pane Rationalization

Introduce a pure helper, likely in `PropertyPaneProvisioningFieldView.utils.ts`:

```ts
getDialogConfigForMode(mode, props)
```

It should derive:

- `title`
- `description`
- `dialogMode`
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
- Engine errors are displayed from the snapshot in provisioning view.
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
- Cancel provisioning/compliance and verify close behavior is unchanged.
- Property pane provisioning/deprovisioning still buffers effective-state updates until close.

## Acceptance Criteria

- Public exports remain compatible.
- `ProvisioningDialog` no longer needs delayed close reset logic.
- `useDialogOrchestration` no longer returns or manages `engineResetKey`.
- `ProvisioningDialog.state.ts` no longer contains close-reset actions or `isClosing`.
- `useSPFxProvisioningEngine` is reset by session unmount, not by an artificial reset key from dialog close.
- `npm run build:spfx` passes.
- User-visible provisioning and compliance flows remain equivalent.

## Risks

- Fluent close animation timing may affect when the session unmounts. Explicit `unmountOnClose={true}` should keep this aligned with Fluent's supported motion lifecycle.
- Escape/backdrop close needs careful routing so it respects the same close rules as the close button.
- Removing `isClosing` could briefly show terminal badges during close animation. If this is visually observable, prefer solving it with session unmount timing or a local visual-only flag, not by restoring hard reset.
- Completion callbacks must not be lost if `run()` resolves and the parent closes immediately after success. The action handler should emit from the returned final snapshot before close.

## Implementation Slices

1. Extract `ProvisioningDialogSession` without changing behavior.
2. Move reducer, engine, derived state, navigation guard, orchestration, content, and footer into the session.
3. Set explicit `unmountOnClose={true}` on Fluent `Dialog`.
4. Remove close-reset logic and `engineResetKey`.
5. Remove obsolete reducer actions and state fields.
6. Simplify `useDialogOrchestration` around session actions.
7. Add `getDialogConfigForMode` for the property pane.
8. Run `npm run build:spfx` and perform manual demo checks.

## Self-Review

- No placeholders remain.
- Scope is limited to the SPFx UI package dialog/property pane lifecycle and control rationalization.
- The design preserves the public API and current behavior.
- The primary simplification mechanism is explicit: move runtime state into a mounted session instead of resetting it manually.
- Risks call out the two critical behavioral points: close routing and completion callback emission.
