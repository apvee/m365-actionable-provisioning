import * as React from 'react';
import {
    Avatar,
    Button,
    Dialog,
    DialogSurface,
} from '@fluentui/react-components';
import { ShieldCheckmarkColor, WrenchScrewdriverColor } from '@fluentui/react-icons';

import { useSPFxProvisioningEngine, useProvisioningDerivedState } from '../../hooks';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';
import { buildComplianceLogEntriesFromReport, buildComplianceLogEntriesFromTrace } from '../../utils/compliance-to-log';
import { normalizeUrl } from '../../utils/url';
import type { ComplianceLogEntry } from '../../models';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import { useProvisioningDialogStyles } from './ProvisioningDialog.styles';
import { buildInitialDialogState, dialogReducer, getComplianceFooterModel } from './ProvisioningDialog.state';
import type {
    ProvisioningDialogMode,
    ProvisioningDialogProps,
    ProvisioningDialogStrings,
    ProvisioningRunOutcome,
} from './ProvisioningDialog.types';
import { DialogShell } from './DialogShell';
import { ProvisioningView } from './ProvisioningView';
import type { ProvisioningViewStrings } from './ProvisioningView.types';
import { ComplianceView } from './ComplianceView';
import type { ComplianceViewStrings } from './ComplianceView.types';

import * as locStrings from 'SPFxProvisioningUIStrings';
import { useDialogOrchestration } from '../../hooks/useDialogOrchestration';

// Re-export public types
export type {
    ProvisioningCompletedEvent,
    ProvisioningDialogProps,
    ProvisioningDialogStrings,
    ProvisioningRunOutcome,
} from './ProvisioningDialog.types';

const DEFAULT_STRINGS: ProvisioningDialogStrings = {
    defaultTitle: locStrings.ProvisioningDialog.DefaultTitle,
    closeButtonAriaLabel: locStrings.ProvisioningDialog.CloseButtonAriaLabel,
    closeLabel: locStrings.ProvisioningDialog.CloseLabel,
    backToProvisioningLabel: locStrings.ProvisioningDialog.BackToProvisioningLabel,
    targetSiteLabel: locStrings.ProvisioningDialog.TargetSiteLabel,
    targetSiteMissingTitle: locStrings.ProvisioningDialog.TargetSiteMissingTitle,
    targetSiteMissingMessage: locStrings.ProvisioningDialog.TargetSiteMissingMessage,
    errorFallbackCode: locStrings.ProvisioningDialog.ErrorFallbackCode,

    totalLabel: locStrings.ProvisioningDialog.TotalLabel,
    successLabel: locStrings.ProvisioningDialog.SuccessLabel,
    failLabel: locStrings.ProvisioningDialog.FailLabel,
    skippedLabel: locStrings.ProvisioningDialog.SkippedLabel,
    pendingLabel: locStrings.ProvisioningDialog.PendingLabel,
    completedLabel: locStrings.ProvisioningDialog.CompletedLabel,

    finalOutcomeSucceededLabel: locStrings.ProvisioningDialog.FinalOutcomeSucceededLabel,
    finalOutcomeFailedLabel: locStrings.ProvisioningDialog.FinalOutcomeFailedLabel,
    finalOutcomeCancelledLabel: locStrings.ProvisioningDialog.FinalOutcomeCancelledLabel,
    finalOutcomeRunningLabel: locStrings.ProvisioningDialog.FinalOutcomeRunningLabel,

    initialHelpProvisioningText: locStrings.ProvisioningDialog.InitialHelpProvisioningText,
    initialHelpComplianceText: locStrings.ProvisioningDialog.InitialHelpComplianceText,

    provisioningDefaultDescription: locStrings.ProvisioningDialog.ProvisioningDefaultDescription,
    complianceDefaultDescription: locStrings.ProvisioningDialog.ComplianceDefaultDescription,

    viewLogsLabel: locStrings.ProvisioningDialog.ViewLogsLabel,
    checkComplianceLabel: locStrings.ProvisioningDialog.CheckComplianceLabel,
    cancelLabel: locStrings.ProvisioningDialog.CancelLabel,
    runLabel: locStrings.ProvisioningDialog.RunLabel,

    complianceDefaultTitle: locStrings.ProvisioningDialog.ComplianceDefaultTitle,
    complianceHeaderLabel: locStrings.ProvisioningDialog.ComplianceHeaderLabel,
    runCheckLabel: locStrings.ProvisioningDialog.RunCheckLabel,
    cancelCheckLabel: locStrings.ProvisioningDialog.CancelCheckLabel,

    checkingLabel: locStrings.ProvisioningDialog.CheckingLabel,

    overallCompliantLabel: locStrings.ProvisioningDialog.OverallCompliantLabel,
    overallWarningLabel: locStrings.ProvisioningDialog.OverallWarningLabel,
    overallNonCompliantLabel: locStrings.ProvisioningDialog.OverallNonCompliantLabel,
    overallRunningLabel: locStrings.ProvisioningDialog.OverallRunningLabel,
    overallCancelledLabel: locStrings.ProvisioningDialog.OverallCancelledLabel,

    checkedLabel: locStrings.ProvisioningDialog.CheckedLabel,
    blockedLabel: locStrings.ProvisioningDialog.BlockedLabel,
    compliantLabel: locStrings.ProvisioningDialog.CompliantLabel,
    nonCompliantLabel: locStrings.ProvisioningDialog.NonCompliantLabel,
    unverifiableLabel: locStrings.ProvisioningDialog.UnverifiableLabel,
    ignoredLabel: locStrings.ProvisioningDialog.IgnoredLabel,

    complianceTargetSiteMissingTitle: locStrings.ProvisioningDialog.ComplianceTargetSiteMissingTitle,
    complianceTargetSiteMissingMessage: locStrings.ProvisioningDialog.ComplianceTargetSiteMissingMessage,
    complianceErrorFallbackTitle: locStrings.ProvisioningDialog.ComplianceErrorFallbackTitle,

    confirmRunTitle: locStrings.ProvisioningDialog.ConfirmRunTitle,
    confirmRunMessage: locStrings.ProvisioningDialog.ConfirmRunMessage,
};

/**
 * ProvisioningDialog is the main dialog component for provisioning operations.
 *
 * This component orchestrates the UI for both provisioning and compliance modes,
 * delegating orchestration logic to useDialogOrchestration and rendering to
 * presentational components (DialogShell, ProvisioningView, ComplianceView).
 *
 * Architecture:
 * - useDialogOrchestration: Manages refs, lifecycle effects, action handlers
 * - useSPFxProvisioningEngine: Manages engine state and operations
 * - useProvisioningDerivedState: Computes derived UI state from snapshot
 * - DialogShell: Provides consistent dialog chrome
 * - ProvisioningView/ComplianceView: Render mode-specific content
 */
export const ProvisioningDialog: React.FC<ProvisioningDialogProps> = ({
    open,
    onClose,
    onProvisioningCompleted,
    context,
    planTemplate,
    logger,
    title,
    description,
    targetSiteUrl,
    enableComplianceCheck,
    complianceAutoRunOnOpen,
    compliancePolicy,
    mode,
    strings,
    confirmRun,
}) => {
    const styles = useProvisioningDialogStyles();

    // Normalized props
    const defaultOpenLogItems = React.useMemo(() => ['logs'], []);
    const normalizedTargetSiteUrl = React.useMemo(() => normalizeUrl(targetSiteUrl), [targetSiteUrl]);
    const s = React.useMemo(() => ({
        ...DEFAULT_STRINGS,
        ...(strings ?? {}),
    } satisfies ProvisioningDialogStrings), [strings]);
    const initialMode: ProvisioningDialogMode = mode ?? 'provisioning';

    // Mode-aware default title: use explicit prop, or fall back to mode-based default
    const effectiveTitle = React.useMemo(() => {
        if (title !== undefined) return title;
        return (mode ?? 'provisioning') === 'compliance' ? s.complianceDefaultTitle : s.defaultTitle;
    }, [title, mode, s.complianceDefaultTitle, s.defaultTitle]);

    // Mode-aware default description: use explicit prop, or fall back to mode-based default
    const effectiveDescription = React.useMemo(() => {
        if (description !== undefined) return description;
        return (mode ?? 'provisioning') === 'compliance' ? s.complianceDefaultDescription : s.provisioningDefaultDescription;
    }, [description, mode, s.complianceDefaultDescription, s.provisioningDefaultDescription]);

    // Dialog state (reducer pattern)
    const [state, dispatch] = React.useReducer(
        dialogReducer,
        { initialMode, defaultOpenLogItems } as const,
        ({ initialMode, defaultOpenLogItems }) => buildInitialDialogState({ initialMode, defaultOpenLogItems })
    );

    // Engine (uses reset key from orchestration hook)
    const [localEngineResetKey, setLocalEngineResetKey] = React.useState(0);
    const { snapshot, run, cancel, checkCompliance } = useSPFxProvisioningEngine({
        context,
        targetSiteUrl: normalizedTargetSiteUrl,
        planTemplate,
        logger,
        resetKey: localEngineResetKey,
    });

    const { summary, logEntries } = useProvisioningDerivedState(snapshot);
    const isRunning = summary?.isRunning === true;

    // Navigation guard: warn user before leaving while operation is in progress
    const isOperationActive = state.runInFlight || state.complianceIsChecking;
    useNavigationGuard(isOperationActive);

    // Orchestration hook (manages refs, lifecycle, action handlers)
    const {
        engineResetKey,
        handleClose,
        handleRun,
        handleRunClick,
        handleCancel,
        handleRunCompliance,
        switchToCompliance: baseSwitchToCompliance,
        switchToProvisioning,
        canOpenCompliance: baseCanOpenCompliance,
    } = useDialogOrchestration({
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
        strings: {
            targetSiteMissingTitle: s.targetSiteMissingTitle,
            targetSiteMissingMessage: s.targetSiteMissingMessage,
            complianceTargetSiteMissingTitle: s.complianceTargetSiteMissingTitle,
            complianceTargetSiteMissingMessage: s.complianceTargetSiteMissingMessage,
            complianceErrorFallbackTitle: s.complianceErrorFallbackTitle,
        },
        confirmRun,
    });

    // Sync engine reset key from orchestration hook
    React.useEffect(() => {
        setLocalEngineResetKey(engineResetKey);
    }, [engineResetKey]);

    // Compliance mode can only be opened if enableComplianceCheck is true
    const canOpenCompliance = Boolean(enableComplianceCheck) && baseCanOpenCompliance;
    const switchToCompliance = React.useCallback(() => {
        if (!enableComplianceCheck) return;
        baseSwitchToCompliance();
    }, [enableComplianceCheck, baseSwitchToCompliance]);

    // Derived UI state: final outcome for provisioning mode
    const finalOutcome = React.useMemo<ProvisioningRunOutcome | undefined>(() => {
        // Suppress badge display during close animation
        if (state.isClosing) return undefined;
        if (!snapshot) return undefined;
        if (snapshot.status === 'cancelled') return 'cancelled';
        if (snapshot.status === 'failed') return 'failed';
        if (snapshot.status === 'completed') {
            const failCount = snapshot.out?.trace?.counts?.fail ?? 0;
            return failCount > 0 ? 'failed' : 'succeeded';
        }
        return undefined;
    }, [snapshot, state.isClosing]);

    // Pristine state for provisioning mode
    const isPristine = !isRunning && !state.runInFlight && !finalOutcome && logEntries.length === 0 && !state.uiError && !snapshot?.error;

    // Compliance mode derived state
    const complianceEntries = React.useMemo(() => {
        return state.complianceReport
            ? buildComplianceLogEntriesFromReport(state.complianceReport)
            : ([] as ReadonlyArray<ComplianceLogEntry>);
    }, [state.complianceReport]);

    const liveComplianceEntries = React.useMemo(() => {
        return buildComplianceLogEntriesFromTrace(snapshot?.compliance?.trace);
    }, [snapshot?.compliance?.trace]);

    const displayedComplianceEntries = React.useMemo(() => {
        if (state.complianceReport && snapshot?.compliance?.status === 'completed') return complianceEntries;
        if (state.complianceIsChecking || snapshot?.compliance?.status === 'running' || snapshot?.compliance?.status === 'cancelled') return liveComplianceEntries;
        return [];
    }, [complianceEntries, liveComplianceEntries, snapshot?.compliance?.status, state.complianceIsChecking, state.complianceReport]);

    const complianceIsPristine =
        !state.complianceIsChecking && !state.complianceReport && !state.complianceError && displayedComplianceEntries.length === 0;

    const complianceIsOverallCompliant = React.useMemo(() => {
        if (!state.complianceReport) return false;
        return state.complianceReport.overall === 'compliant';
    }, [state.complianceReport]);

    // Mode-specific UI props
    const isComplianceMode = state.activeMode === 'compliance';
    // Shell title: use explicit title prop, or mode-aware default
    const shellTitle = isComplianceMode
        ? (title !== undefined ? title : s.complianceDefaultTitle)
        : effectiveTitle;
    // Shell description: use mode-aware default based on active mode
    const shellDescription = isComplianceMode
        ? (description !== undefined ? description : s.initialHelpComplianceText)
        : effectiveDescription;
    const shellHeaderIcon = isComplianceMode ? <ShieldCheckmarkColor fontSize={28} /> : <WrenchScrewdriverColor fontSize={28} />;
    const shellIsPristine = isComplianceMode ? complianceIsPristine : isPristine;
    const shellCloseDisabled = isComplianceMode ? state.complianceIsChecking : isRunning;

    // Log items handlers
    const handleProvisioningOpenLogItemsChange = React.useCallback(
        (items: ReadonlyArray<string>) => dispatch({ type: 'SET_OPEN_LOG_ITEMS', items: [...items] }),
        []
    );

    const handleComplianceOpenLogItemsChange = React.useCallback(
        (items: ReadonlyArray<string>) => dispatch({ type: 'SET_COMPLIANCE_OPEN_LOG_ITEMS', items: [...items] }),
        []
    );

    // Build strings for view components
    const provisioningViewStrings = React.useMemo<ProvisioningViewStrings>(() => ({
        initialHelpProvisioningText: s.initialHelpProvisioningText,
        initialHelpComplianceText: s.initialHelpComplianceText,
        viewLogsLabel: s.viewLogsLabel,
        completedLabel: s.completedLabel,
        successLabel: s.successLabel,
        skippedLabel: s.skippedLabel,
        failLabel: s.failLabel,
        errorFallbackCode: s.errorFallbackCode,
        finalOutcomeRunningLabel: s.finalOutcomeRunningLabel,
        finalOutcomeSucceededLabel: s.finalOutcomeSucceededLabel,
        finalOutcomeFailedLabel: s.finalOutcomeFailedLabel,
        finalOutcomeCancelledLabel: s.finalOutcomeCancelledLabel,
        logPanelStrings: s.logPanelStrings,
        logEntryStrings: s.logEntryStrings,
    }), [s]);

    const complianceViewStrings = React.useMemo<ComplianceViewStrings>(() => ({
        viewLogsLabel: s.complianceHeaderLabel,
        checkedLabel: s.checkedLabel,
        blockedLabel: s.blockedLabel,
        compliantLabel: s.compliantLabel,
        nonCompliantLabel: s.nonCompliantLabel,
        unverifiableLabel: s.unverifiableLabel,
        ignoredLabel: s.ignoredLabel,
        overallCompliantLabel: s.overallCompliantLabel,
        overallWarningLabel: s.overallWarningLabel,
        overallNonCompliantLabel: s.overallNonCompliantLabel,
        overallRunningLabel: s.overallRunningLabel,
        overallCancelledLabel: s.overallCancelledLabel,
        errorFallbackTitle: s.complianceErrorFallbackTitle,
        finalOutcomeFailedLabel: s.finalOutcomeFailedLabel,
        finalOutcomeCancelledLabel: s.finalOutcomeCancelledLabel,
    }), [s]);

    // Footer rendering
    const renderProvisioningFooter = (): React.ReactNode => (
        <>
            {enableComplianceCheck && canOpenCompliance ? (
                <Button appearance="secondary" onClick={switchToCompliance}>
                    {s.checkComplianceLabel}
                </Button>
            ) : null}

            {finalOutcome === 'succeeded' ? (
                <Button appearance="primary" onClick={handleClose}>
                    {s.closeLabel}
                </Button>
            ) : (
                <>
                    {isRunning || state.runInFlight ? (
                        <Button appearance="secondary" onClick={handleCancel}>
                            {s.cancelLabel}
                        </Button>
                    ) : null}

                    {!isRunning && !state.runInFlight ? (
                        <Button appearance="primary" onClick={handleRunClick}>
                            {s.runLabel}
                        </Button>
                    ) : null}
                </>
            )}
        </>
    );

    const renderComplianceFooter = (): React.ReactNode => {
        const model = getComplianceFooterModel({
            isChecking: state.complianceIsChecking,
            hasTargetSite: Boolean(normalizedTargetSiteUrl),
        });

        return (
            <>
                {state.canGoBackFromCompliance ? (
                    <Button appearance="secondary" onClick={switchToProvisioning}>
                        {s.backToProvisioningLabel}
                    </Button>
                ) : null}

                {model.showCancel ? (
                    <Button appearance="secondary" onClick={cancel}>
                        {s.cancelCheckLabel}
                    </Button>
                ) : null}

                {model.showRun ? (
                    <Button
                        appearance={complianceIsOverallCompliant ? 'secondary' : 'primary'}
                        onClick={handleRunCompliance}
                        disabled={model.runDisabled}
                    >
                        {s.runCheckLabel}
                    </Button>
                ) : null}

                {model.showClose ? (
                    <Button
                        appearance={complianceIsOverallCompliant ? 'primary' : 'secondary'}
                        onClick={handleClose}
                    >
                        {s.closeLabel}
                    </Button>
                ) : null}
            </>
        );
    };

    // Render content based on mode
    const renderContent = (): React.ReactNode => {
        if (isComplianceMode) {
            return (
                <ComplianceView
                    snapshot={snapshot}
                    complianceReport={state.complianceReport}
                    isPristine={complianceIsPristine}
                    isChecking={state.complianceIsChecking}
                    isClosing={state.isClosing}
                    uiError={state.complianceError}
                    openLogItems={state.complianceOpenLogItems}
                    onOpenLogItemsChange={handleComplianceOpenLogItemsChange}
                    logEntries={displayedComplianceEntries}
                    strings={complianceViewStrings}
                />
            );
        }

        return (
            <ProvisioningView
                snapshot={snapshot}
                summary={summary}
                logEntries={logEntries}
                isPristine={isPristine}
                uiError={state.uiError}
                openLogItems={state.openLogItems}
                onOpenLogItemsChange={handleProvisioningOpenLogItemsChange}
                canOpenCompliance={canOpenCompliance}
                strings={provisioningViewStrings}
            />
        );
    };

    return (
        <>
            <Dialog
                open={open}
                modalType="alert"
                onOpenChange={(_, data) => {
                    if (!data.open) handleClose();
                }}
            >
                <DialogSurface className={styles.surface}>
                    <DialogShell
                        title={shellTitle}
                        description={shellDescription}
                        headerIcon={
                            <Avatar icon={shellHeaderIcon} shape="square" size={48} />
                        }
                        isPristine={shellIsPristine}
                        closeDisabled={shellCloseDisabled}
                        closeButtonAriaLabel={s.closeButtonAriaLabel}
                        onClose={handleClose}
                        footer={isComplianceMode ? renderComplianceFooter() : renderProvisioningFooter()}
                    >
                        {renderContent()}
                    </DialogShell>
                </DialogSurface>
            </Dialog>

            <ConfirmDialog
                open={state.confirmOpen}
                title={s.confirmRunTitle}
                message={s.confirmRunMessage}
                strings={s.confirmDialogStrings}
                confirmAppearance="primary"
                onCancel={() => dispatch({ type: 'SET_CONFIRM_OPEN', value: false })}
                onConfirm={() => {
                    dispatch({ type: 'SET_CONFIRM_OPEN', value: false });
                    handleRun().catch(() => undefined);
                }}
            />
        </>
    );
};
