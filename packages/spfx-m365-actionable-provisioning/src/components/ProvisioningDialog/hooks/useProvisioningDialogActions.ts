import * as React from 'react';

import type { EngineSnapshotTyped } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningRunOutcome } from '../ProvisioningDialog.types';
import { shouldCancelComplianceOnClose } from '../ProvisioningDialogSession.state';
import type { ProvisioningDialogActionsOptions, ProvisioningDialogActionsReturn } from './useProvisioningDialogActions.types';

// Re-export types
export type { ProvisioningDialogActionsOptions, ProvisioningDialogActionsReturn };

/**
 * Custom hook that encapsulates all provisioning dialog action logic.
 *
 * @remarks
 * This hook manages:
 * - Ref-based bookkeeping (run tracking, completion signals)
 * - Lifecycle effects (unmount cleanup, completion handling)
 * - Action handlers (run, cancel, compliance check, mode switching)
 * - Auto-run compliance logic
 */
export const useProvisioningDialogActions = (options: ProvisioningDialogActionsOptions): ProvisioningDialogActionsReturn => {
    const {
        disposeRequested,
        normalizedTargetSiteUrl,
        defaultOpenLogItems,
        complianceAutoRunOnOpen,
        compliancePolicy,
        run,
        cancel,
        checkCompliance,
        onProvisioningCompleted,
        onClose,
        dispatch,
        snapshot,
        isRunning,
        state,
        strings,
        confirmRun,
    } = options;

    // Refs for run/completion bookkeeping
    const runSiteUrlRef = React.useRef<string | undefined>(undefined);
    const awaitingCompletionRef = React.useRef(false);
    const completionEmittedRef = React.useRef(false);
    const disposedRef = React.useRef(false);
    const provisioningRunIdRef = React.useRef(0);

    // Refs for compliance auto-run
    const complianceAutoRunDoneRef = React.useRef(false);
    const complianceAutoRunRequestedRef = React.useRef(false);

    // Ref for compliance run ID (invalidate stale runs)
    const checkRunIdRef = React.useRef(0);

    const disposeSession = React.useCallback(() => {
        if (disposedRef.current) return;

        disposedRef.current = true;
        provisioningRunIdRef.current += 1;
        checkRunIdRef.current += 1;
        awaitingCompletionRef.current = false;
        completionEmittedRef.current = true;
        cancel();
    }, [cancel]);

    // Helper: resolve effective site URL
    const resolveEffectiveRunSiteUrl = React.useCallback((): string => {
        return normalizedTargetSiteUrl ?? '';
    }, [normalizedTargetSiteUrl]);

    // Helper: emit completion event if terminal state reached
    const emitCompletedIfTerminal = React.useCallback(
        (snap: EngineSnapshotTyped<ProvisioningResultLight>) => {
            if (disposedRef.current) return;
            if (!awaitingCompletionRef.current) return;

            const status = snap.status;
            const isTerminal = status === 'completed' || status === 'failed' || status === 'cancelled';
            if (!isTerminal) return;
            if (completionEmittedRef.current) return;

            const failCount = snap.out?.trace?.counts?.fail ?? 0;
            const outcome: ProvisioningRunOutcome =
                status === 'cancelled'
                    ? 'cancelled'
                    : failCount > 0 || status === 'failed'
                        ? 'failed'
                        : 'succeeded';

            completionEmittedRef.current = true;
            awaitingCompletionRef.current = false;

            const siteUrl = runSiteUrlRef.current ?? resolveEffectiveRunSiteUrl();
            onProvisioningCompleted?.({
                siteUrl,
                outcome,
                engineStatus: status,
            });
        },
        [onProvisioningCompleted, resolveEffectiveRunSiteUrl]
    );

    // Derived: can open compliance
    const canOpenCompliance = Boolean(normalizedTargetSiteUrl) && !isRunning && !state.runInFlight;

    // === LIFECYCLE EFFECTS ===

    // Invalidate async work when the mounted dialog session is disposed.
    React.useEffect(() => {
        return () => {
            disposeSession();
        };
    }, [disposeSession]);

    // Parent-controlled close can leave the session mounted during exit animation.
    React.useEffect(() => {
        if (!disposeRequested) return;
        disposeSession();
    }, [disposeRequested, disposeSession]);

    // Completion signal effect
    React.useEffect(() => {
        if (!snapshot) return;
        emitCompletedIfTerminal(snapshot);
    }, [snapshot, emitCompletedIfTerminal]);

    // === ACTION HANDLERS ===

    // Close handler
    const handleClose = React.useCallback(() => {
        if (state.activeMode === 'provisioning') {
            if (isRunning || state.runInFlight) return;
            onClose();
            return;
        }

        if (shouldCancelComplianceOnClose({
            isChecking: state.complianceIsChecking,
            hasComplianceReport: Boolean(state.complianceReport),
            complianceStatus: snapshot?.compliance?.status,
        })) {
            cancel();
        }
        onClose();
    }, [cancel, isRunning, onClose, snapshot?.compliance?.status, state.activeMode, state.complianceIsChecking, state.complianceReport, state.runInFlight]);

    // Run provisioning
    const handleRun = React.useCallback(async () => {
        if (disposedRef.current) return;
        if (state.runInFlight) return;

        if (!normalizedTargetSiteUrl) {
            dispatch({
                type: 'SET_UI_ERROR',
                error: { title: strings.targetSiteMissingTitle, message: strings.targetSiteMissingMessage }
            });
            return;
        }

        dispatch({ type: 'SET_UI_ERROR', error: undefined });
        const runId = ++provisioningRunIdRef.current;
        runSiteUrlRef.current = resolveEffectiveRunSiteUrl();
        awaitingCompletionRef.current = true;
        completionEmittedRef.current = false;

        dispatch({ type: 'SET_RUN_IN_FLIGHT', value: true });
        try {
            const finalSnapshot = await run();
            if (disposedRef.current || runId !== provisioningRunIdRef.current) return;
            emitCompletedIfTerminal(finalSnapshot);
        } finally {
            if (!disposedRef.current && runId === provisioningRunIdRef.current) {
                dispatch({ type: 'SET_RUN_IN_FLIGHT', value: false });
            }
        }
    }, [dispatch, emitCompletedIfTerminal, normalizedTargetSiteUrl, resolveEffectiveRunSiteUrl, run, strings.targetSiteMissingMessage, strings.targetSiteMissingTitle, state.runInFlight]);

    // Run click handler (may open confirm dialog)
    const handleRunClick = React.useCallback(() => {
        if (disposedRef.current) return;
        if (state.runInFlight) return;

        if (!normalizedTargetSiteUrl) {
            dispatch({
                type: 'SET_UI_ERROR',
                error: { title: strings.targetSiteMissingTitle, message: strings.targetSiteMissingMessage }
            });
            return;
        }

        if (confirmRun) {
            dispatch({ type: 'SET_CONFIRM_OPEN', value: true });
            return;
        }

        handleRun().catch(() => undefined);
    }, [confirmRun, dispatch, handleRun, normalizedTargetSiteUrl, strings.targetSiteMissingMessage, strings.targetSiteMissingTitle, state.runInFlight]);

    // Cancel handler
    const handleCancel = React.useCallback(() => {
        cancel();
    }, [cancel]);

    // Run compliance check
    const handleRunCompliance = React.useCallback(async () => {
        if (disposedRef.current) return;
        if (state.complianceIsChecking) return;

        const runId = ++checkRunIdRef.current;

        if (!normalizedTargetSiteUrl) {
            dispatch({
                type: 'COMPLIANCE_SET_ERROR',
                error: { title: strings.complianceTargetSiteMissingTitle, message: strings.complianceTargetSiteMissingMessage }
            });
            return;
        }

        dispatch({ type: 'COMPLIANCE_START' });

        try {
            const next = await checkCompliance(compliancePolicy);
            if (runId !== checkRunIdRef.current) return;

            const err = next.error ? { title: strings.complianceErrorFallbackTitle, message: next.error.message } : undefined;
            dispatch({ type: 'COMPLIANCE_SET_RESULT', report: next, error: err });
        } catch (e) {
            if (runId !== checkRunIdRef.current) return;

            const message = e instanceof Error ? e.message : String(e);
            dispatch({ type: 'COMPLIANCE_SET_ERROR', error: { title: strings.complianceErrorFallbackTitle, message } });
        } finally {
            if (runId === checkRunIdRef.current) dispatch({ type: 'COMPLIANCE_SET_CHECKING', value: false });
        }
    }, [checkCompliance, compliancePolicy, dispatch, normalizedTargetSiteUrl, state.complianceIsChecking, strings.complianceErrorFallbackTitle, strings.complianceTargetSiteMissingMessage, strings.complianceTargetSiteMissingTitle]);

    // Switch to compliance mode
    const switchToCompliance = React.useCallback(() => {
        if (disposedRef.current) return;
        if (!canOpenCompliance) return;
        dispatch({ type: 'COMPLIANCE_RESET_UI', defaultOpenLogItems });
        complianceAutoRunRequestedRef.current = true;
        complianceAutoRunDoneRef.current = true;
        dispatch({ type: 'SET_CAN_GO_BACK', value: true });
        dispatch({ type: 'SET_ACTIVE_MODE', mode: 'compliance' });
    }, [canOpenCompliance, defaultOpenLogItems, dispatch]);

    // Switch to provisioning mode
    const switchToProvisioning = React.useCallback(() => {
        if (disposedRef.current) return;
        if (state.complianceIsChecking) cancel();
        dispatch({ type: 'SET_CAN_GO_BACK', value: false });
        dispatch({ type: 'SET_ACTIVE_MODE', mode: 'provisioning' });
    }, [cancel, dispatch, state.complianceIsChecking]);

    // === AUTO-RUN COMPLIANCE EFFECTS ===

    // Auto-run compliance when entering via Check button
    React.useEffect(() => {
        if (state.activeMode !== 'compliance') return;
        if (!complianceAutoRunRequestedRef.current) return;

        complianceAutoRunRequestedRef.current = false;
        handleRunCompliance().catch(() => undefined);
    }, [handleRunCompliance, state.activeMode]);

    // Auto-run compliance when opening directly in compliance mode
    React.useEffect(() => {
        if (state.activeMode !== 'compliance') return;
        if (complianceAutoRunOnOpen !== true) return;
        if (complianceAutoRunDoneRef.current) return;

        const canStart = !state.complianceIsChecking && Boolean(normalizedTargetSiteUrl);
        if (!canStart) return;

        complianceAutoRunDoneRef.current = true;
        handleRunCompliance().catch(() => undefined);
    }, [complianceAutoRunOnOpen, handleRunCompliance, normalizedTargetSiteUrl, state.activeMode, state.complianceIsChecking]);

    return {
        handleClose,
        handleRun,
        handleRunClick,
        handleCancel,
        handleRunCompliance,
        switchToCompliance,
        switchToProvisioning,
        canOpenCompliance,
    };
};
