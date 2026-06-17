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
import type {
    ProvisioningDialogMode,
    ProvisioningDialogSessionProps,
    ProvisioningDialogStrings,
    ProvisioningRunOutcome,
} from './ProvisioningDialog.types';
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
        open,
        onClose,
        registerCloseHandler,
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
        initialMode: initialModeProp,
        strings,
        confirmRun,
        defaultStrings,
    } = props;

    const defaultOpenLogItems = React.useMemo(() => ['logs'], []);
    const normalizedTargetSiteUrl = React.useMemo(() => normalizeUrl(targetSiteUrl), [targetSiteUrl]);
    const s = React.useMemo(() => ({
        ...defaultStrings,
        ...(strings ?? {}),
    } satisfies ProvisioningDialogStrings), [defaultStrings, strings]);
    const initialMode: ProvisioningDialogMode = initialModeProp ?? 'provisioning';

    // Mode-aware default title: use explicit prop, or fall back to mode-based default
    const effectiveTitle = React.useMemo(() => {
        if (title !== undefined) return title;
        return initialMode === 'compliance' ? s.complianceDefaultTitle : s.defaultTitle;
    }, [title, initialMode, s.complianceDefaultTitle, s.defaultTitle]);

    // Mode-aware default description: use explicit prop, or fall back to mode-based default
    const effectiveDescription = React.useMemo(() => {
        if (description !== undefined) return description;
        return initialMode === 'compliance' ? s.complianceDefaultDescription : s.provisioningDefaultDescription;
    }, [description, initialMode, s.complianceDefaultDescription, s.provisioningDefaultDescription]);

    // Dialog state (reducer pattern)
    const [state, dispatch] = React.useReducer(
        provisioningDialogSessionReducer,
        { initialMode, defaultOpenLogItems } as const,
        ({ initialMode, defaultOpenLogItems }) =>
            buildInitialProvisioningDialogSessionState({ initialMode, defaultOpenLogItems })
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

    const { summary, activityEntries } = useProvisioningDerivedState(snapshot);
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
    } = useProvisioningDialogActions({
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

    React.useEffect(() => {
        registerCloseHandler(handleClose);
        return () => registerCloseHandler(undefined);
    }, [handleClose, registerCloseHandler]);

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
    const isPristine = !isRunning && !state.runInFlight && !finalOutcome && activityEntries.length === 0 && !state.uiError && !snapshot?.error;

    // Compliance mode derived state
    const complianceEntries = React.useMemo(() => {
        return state.complianceReport
            ? buildComplianceActivityEntriesFromReport(state.complianceReport)
            : ([] as ReadonlyArray<ComplianceActivityEntry>);
    }, [state.complianceReport]);

    const liveComplianceEntries = React.useMemo(() => {
        return buildComplianceActivityEntriesFromTrace(snapshot?.compliance?.trace);
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
    const shellHeaderIcon = isComplianceMode ? <ShieldCheckmarkColor fontSize={48} /> : <AppsColor fontSize={48} />;
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
    const provisioningViewStrings = React.useMemo<ProvisioningRunViewStrings>(() => ({
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
        activityEntryStrings: s.activityEntryStrings,
    }), [s]);

    const complianceViewStrings = React.useMemo<ComplianceCheckViewStrings>(() => ({
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
                <ComplianceCheckView
                    snapshot={snapshot}
                    complianceReport={state.complianceReport}
                    isPristine={complianceIsPristine}
                    isChecking={state.complianceIsChecking}
                    isClosing={state.isClosing}
                    uiError={state.complianceError}
                    openLogItems={state.complianceOpenLogItems}
                    onOpenLogItemsChange={handleComplianceOpenLogItemsChange}
                    activityEntries={displayedComplianceEntries}
                    strings={complianceViewStrings}
                />
            );
        }

        return (
            <ProvisioningRunView
                snapshot={snapshot}
                summary={summary}
                activityEntries={activityEntries}
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
            <ProvisioningDialogShell
                title={shellTitle}
                description={shellDescription}
                headerIcon={shellHeaderIcon}
                isPristine={shellIsPristine}
                closeDisabled={shellCloseDisabled}
                closeButtonAriaLabel={s.closeButtonAriaLabel}
                errorFallbackTitle={s.complianceErrorFallbackTitle}
                logger={logger}
                onClose={handleClose}
                footer={isComplianceMode ? renderComplianceFooter() : renderProvisioningFooter()}
            >
                {renderContent()}
            </ProvisioningDialogShell>

            <ConfirmationDialog
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

ProvisioningDialogSession.displayName = 'ProvisioningDialogSession';
