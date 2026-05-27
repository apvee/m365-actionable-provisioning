/**
 * Type definitions for ProvisioningDialog component.
 *
 * @packageDocumentation
 */

import type { BaseComponentContext } from '@microsoft/sp-component-base';

import type { ProvisioningPlan } from "../../../provisioning/catalogs";
import type { EngineStatus } from '../../../core/engine';
import type { Logger } from '../../../core/logger';
import type { CompliancePolicy } from '../../../core/compliance';

import type { ConfirmDialogStrings } from '../ConfirmDialog/ConfirmDialog.types';
import type { LogPanelProps, LogPanelStrings, ProvisioningLogEntryStrings } from '../LogPanel/LogPanel.types';

/**
 * Localized strings for the provisioning dialog.
 * @public
 */
export type ProvisioningDialogStrings = Readonly<{
    defaultTitle: string;
    closeButtonAriaLabel: string;
    closeLabel: string;
    backToProvisioningLabel: string;
    targetSiteLabel: string;
    targetSiteMissingTitle: string;
    targetSiteMissingMessage: string;
    errorFallbackCode: string;

    totalLabel: string;
    successLabel: string;
    failLabel: string;
    skippedLabel: string;
    pendingLabel: string;
    completedLabel: string;

    finalOutcomeSucceededLabel: string;
    finalOutcomeFailedLabel: string;
    finalOutcomeCancelledLabel: string;
    finalOutcomeRunningLabel: string;

    /** Help text shown when the dialog is opened and no run has started yet. */
    initialHelpProvisioningText: string;

    /** Help text shown only when the compliance check button is enabled. */
    initialHelpComplianceText: string;

    /** Default description for provisioning mode (used in dialog shell). */
    provisioningDefaultDescription: string;

    /** Default description for compliance mode (used in dialog shell). */
    complianceDefaultDescription: string;

    viewLogsLabel: string;
    checkComplianceLabel: string;
    cancelLabel: string;
    runLabel: string;

    confirmRunTitle: string;
    confirmRunMessage: string;

    // Compliance mode strings (when the dialog is switched to mode="compliance")
    complianceDefaultTitle: string;
    complianceHeaderLabel: string;
    runCheckLabel: string;
    cancelCheckLabel: string;

    checkingLabel: string;

    overallCompliantLabel: string;
    overallWarningLabel: string;
    overallNonCompliantLabel: string;
    overallRunningLabel: string;
    overallCancelledLabel: string;

    checkedLabel: string;
    blockedLabel: string;
    compliantLabel: string;
    nonCompliantLabel: string;
    unverifiableLabel: string;
    ignoredLabel: string;

    complianceTargetSiteMissingTitle: string;
    complianceTargetSiteMissingMessage: string;
    complianceErrorFallbackTitle: string;

    /** Optional pass-through localized strings for nested ConfirmDialog. */
    confirmDialogStrings?: Partial<ConfirmDialogStrings>;

    /** Optional pass-through localized strings for nested controls. */
    logPanelStrings?: Partial<LogPanelStrings>;

    /** Optional localized strings for log entries (rendered via LogItem). */
    logEntryStrings?: Partial<ProvisioningLogEntryStrings>;
}>;

/**
 * Final outcome of a provisioning run.
 * @public
 */
export type ProvisioningRunOutcome = 'succeeded' | 'failed' | 'cancelled';

/**
 * Dialog mode indicating current operation type.
 * @public
 */
export type ProvisioningDialogMode = 'provisioning' | 'compliance';

/**
 * Event fired when a provisioning run completes.
 * @public
 */
export type ProvisioningCompletedEvent = Readonly<{
    /** The effective target site URL used for the run. */
    siteUrl: string;
    /** Final outcome of the run. */
    outcome: ProvisioningRunOutcome;
    /** Engine terminal status at completion time. */
    engineStatus: EngineStatus;
}>;

/**
 * Props for the ProvisioningDialog component.
 * @public
 */
export type ProvisioningDialogProps = Readonly<{
    open: boolean;
    onClose: () => void;

    /** Fired once at the end of a run (success/failure/cancellation). */
    onProvisioningCompleted?: (ev: ProvisioningCompletedEvent) => void;

    context: BaseComponentContext;
    planTemplate: ProvisioningPlan;
    logger: Logger;

    title?: string;
    description?: string;
    targetSiteUrl?: string;

    /** Enables a button inside the dialog to open the compliance checker. */
    enableComplianceCheck?: boolean;

    /**
     * If true, compliance checks run automatically when entering compliance mode.
        * Defaults to true when the dialog opens in provisioning mode, and false when opened directly with mode="compliance".
        * Note: entering compliance via the provisioning "Check" action may still force a run regardless of this default.
     */
    complianceAutoRunOnOpen?: boolean;

    /** Optional compliance policy used when running checks in mode="compliance". */
    compliancePolicy?: CompliancePolicy;

    /**
     * Initial dialog mode (applied when the dialog opens); internally switchable via the UI.
     * This is not treated as a controlled prop while the dialog is already open.
     */
    mode?: ProvisioningDialogMode;

    /** Optional localized strings overrides. */
    strings?: Partial<ProvisioningDialogStrings>;

    /** If true, clicking Run requires confirmation (defaults to false). */
    confirmRun?: boolean;
}>;

/** @internal */
export type ExecutionDialogShellError = Readonly<{
    title: string;
    message: string;
}>;

/** @internal */
export type ExecutionDialogShellProgress = Readonly<{
    label?: string;
    value: number;
}>;

/** @internal */
export type ExecutionDialogShellLogSection = Readonly<{
    label: string;
    openItems: ReadonlyArray<string>;
    onOpenItemsChange: (nextOpenItems: ReadonlyArray<string>) => void;
    logPanelProps: Omit<LogPanelProps, 'className'>;
}>;
