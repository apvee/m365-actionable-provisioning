import * as React from 'react';

import type { EngineSnapshotTyped } from '../../../core/engine';
import type { ProvisioningResultLight } from '../../../provisioning';
import type { ProvisioningRunOutcome } from '../../components/ProvisioningDialog/ProvisioningDialog.types';
import type { DialogOrchestrationOptions, DialogOrchestrationReturn } from './useDialogOrchestration.types';

// Re-export types
export type { DialogOrchestrationOptions, DialogOrchestrationReturn };

/**
 * Custom hook that encapsulates all dialog orchestration logic.
 *
 * @remarks
 * This hook manages:
 * - Ref-based bookkeeping (run tracking, completion signals, timer tokens)
 * - Lifecycle effects (open/close alignment, delayed reset)
 * - Action handlers (run, cancel, compliance check, mode switching)
 * - Auto-run compliance logic
 *
 * By extracting this logic, ProvisioningDialog.tsx becomes a pure UI composition layer.
 * The hook can be unit tested independently of React rendering.
 * 
 * @public
 */
export const useDialogOrchestration = (options: DialogOrchestrationOptions): DialogOrchestrationReturn => {
    const {
        open,
        initialMode,
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

    // Engine reset key (increment to recreate engine)
    const [engineResetKey, setEngineResetKey] = React.useState(0);

    // Refs for run/completion bookkeeping
    const runSiteUrlRef = React.useRef<string | undefined>(undefined);
    const awaitingCompletionRef = React.useRef(false);
    const completionEmittedRef = React.useRef(false);

    // Refs for compliance auto-run
    const complianceAutoRunDoneRef = React.useRef(false);
    const complianceAutoRunRequestedRef = React.useRef(false);

    // Ref for tracking previous open state
    const prevOpenRef = React.useRef(open);

    // Ref for compliance run ID (invalidate stale runs)
    const checkRunIdRef = React.useRef(0);

    // Refs for close reset delay
    const closeResetTimerRef = React.useRef<number | undefined>(undefined);
    const closeResetTokenRef = React.useRef(0);

    // Helper: resolve effective site URL
    const resolveEffectiveRunSiteUrl = React.useCallback((): string => {
        return normalizedTargetSiteUrl ?? '';
    }, [normalizedTargetSiteUrl]);

    // Helper: emit completion event if terminal state reached
    const emitCompletedIfTerminal = React.useCallback(
        (snap: EngineSnapshotTyped<ProvisioningResultLight>) => {
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

    // Open/close alignment effect
    React.useEffect(() => {
        const wasOpen = prevOpenRef.current;
        prevOpenRef.current = open;

        if (!wasOpen && open) {
            // Dialog is opening
            closeResetTokenRef.current += 1;
            if (closeResetTimerRef.current !== undefined) {
                window.clearTimeout(closeResetTimerRef.current);
                closeResetTimerRef.current = undefined;
            }
            complianceAutoRunDoneRef.current = false;
            dispatch({ type: 'OPEN_ALIGN', initialMode });
            return;
        }

        if (wasOpen && !open) {
            // Dialog is closing
            cancel();
            closeResetTokenRef.current += 1;
            const token = closeResetTokenRef.current;

            if (closeResetTimerRef.current !== undefined) {
                window.clearTimeout(closeResetTimerRef.current);
                closeResetTimerRef.current = undefined;
            }

            // Delay reset to allow close animation to complete
            closeResetTimerRef.current = window.setTimeout(() => {
                if (token !== closeResetTokenRef.current) return;
                if (prevOpenRef.current) return;

                // Invalidate any in-flight compliance run
                checkRunIdRef.current += 1;

                // Reset completion bookkeeping
                runSiteUrlRef.current = undefined;
                awaitingCompletionRef.current = false;
                completionEmittedRef.current = false;

                // Reset compliance auto-run flags
                complianceAutoRunDoneRef.current = false;
                complianceAutoRunRequestedRef.current = false;

                // Dispatch hard reset
                dispatch({ type: 'CLOSE_HARD_RESET', initialMode, defaultOpenLogItems });

                // Recreate engine
                setEngineResetKey((k) => k + 1);

                closeResetTimerRef.current = undefined;
            }, 300);
        }
    }, [cancel, defaultOpenLogItems, dispatch, initialMode, open]);

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            closeResetTokenRef.current += 1;
            if (closeResetTimerRef.current !== undefined) {
                window.clearTimeout(closeResetTimerRef.current);
                closeResetTimerRef.current = undefined;
            }
        };
    }, []);

    // Completion signal effect
    React.useEffect(() => {
        if (!snapshot) return;
        emitCompletedIfTerminal(snapshot);
    }, [snapshot, emitCompletedIfTerminal]);

    // === ACTION HANDLERS ===

    // Close handler
    const handleClose = React.useCallback(() => {
        // Mark as closing to suppress badge display during close animation
        dispatch({ type: 'SET_CLOSING', value: true });

        if (state.activeMode === 'provisioning') {
            if (isRunning) return;
            onClose();
            return;
        }
        // Compliance mode
        if (state.complianceIsChecking) cancel();
        onClose();
    }, [cancel, dispatch, isRunning, onClose, state.activeMode, state.complianceIsChecking]);

    // Run provisioning
    const handleRun = React.useCallback(async () => {
        if (state.runInFlight) return;

        if (!normalizedTargetSiteUrl) {
            dispatch({
                type: 'SET_UI_ERROR',
                error: { title: strings.targetSiteMissingTitle, message: strings.targetSiteMissingMessage }
            });
            return;
        }

        dispatch({ type: 'SET_UI_ERROR', error: undefined });
        runSiteUrlRef.current = resolveEffectiveRunSiteUrl();
        awaitingCompletionRef.current = true;
        completionEmittedRef.current = false;

        dispatch({ type: 'SET_RUN_IN_FLIGHT', value: true });
        try {
            const finalSnapshot = await run();
            emitCompletedIfTerminal(finalSnapshot);
        } finally {
            dispatch({ type: 'SET_RUN_IN_FLIGHT', value: false });
        }
    }, [dispatch, emitCompletedIfTerminal, normalizedTargetSiteUrl, resolveEffectiveRunSiteUrl, run, strings.targetSiteMissingMessage, strings.targetSiteMissingTitle, state.runInFlight]);

    // Run click handler (may open confirm dialog)
    const handleRunClick = React.useCallback(() => {
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
        if (!canOpenCompliance) return;
        dispatch({ type: 'COMPLIANCE_RESET_UI', defaultOpenLogItems });
        complianceAutoRunRequestedRef.current = true;
        complianceAutoRunDoneRef.current = true;
        dispatch({ type: 'SET_CAN_GO_BACK', value: true });
        dispatch({ type: 'SET_ACTIVE_MODE', mode: 'compliance' });
    }, [canOpenCompliance, defaultOpenLogItems, dispatch]);

    // Switch to provisioning mode
    const switchToProvisioning = React.useCallback(() => {
        if (state.complianceIsChecking) cancel();
        dispatch({ type: 'SET_CAN_GO_BACK', value: false });
        dispatch({ type: 'SET_ACTIVE_MODE', mode: 'provisioning' });
    }, [cancel, dispatch, state.complianceIsChecking]);

    // === AUTO-RUN COMPLIANCE EFFECTS ===

    // Auto-run compliance when entering via Check button
    React.useEffect(() => {
        if (!open) return;
        if (state.activeMode !== 'compliance') return;
        if (!complianceAutoRunRequestedRef.current) return;

        complianceAutoRunRequestedRef.current = false;
        handleRunCompliance().catch(() => undefined);
    }, [handleRunCompliance, open, state.activeMode]);

    // Auto-run compliance when opening directly in compliance mode
    React.useEffect(() => {
        if (!open) return;
        if (state.activeMode !== 'compliance') return;
        if (complianceAutoRunOnOpen !== true) return;
        if (complianceAutoRunDoneRef.current) return;

        const canStart = !state.complianceIsChecking && Boolean(normalizedTargetSiteUrl);
        if (!canStart) return;

        complianceAutoRunDoneRef.current = true;
        handleRunCompliance().catch(() => undefined);
    }, [complianceAutoRunOnOpen, handleRunCompliance, normalizedTargetSiteUrl, open, state.activeMode, state.complianceIsChecking]);

    return {
        engineResetKey,
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
