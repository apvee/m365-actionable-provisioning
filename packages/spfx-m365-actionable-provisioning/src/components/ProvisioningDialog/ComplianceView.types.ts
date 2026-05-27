import type { EngineSnapshotTyped } from '../../../core/engine';
import type { ComplianceReport } from '../../../core/compliance';
import type { ProvisioningResultLight } from '../../../provisioning';
import type { ComplianceLogEntry } from '../../models';
import type { DialogUiError } from './ProvisioningDialog.state';
import type { ComplianceLogPanelStrings, ComplianceLogEntryStrings } from '../LogPanel/LogPanel.types';

/**
 * Localized strings for the ComplianceView component.
 */
export type ComplianceViewStrings = Readonly<{
    /** Label for logs accordion header */
    viewLogsLabel: string;
    /** Label for checked count */
    checkedLabel: string;
    /** Label for blocked count */
    blockedLabel: string;
    /** Label for compliant count */
    compliantLabel: string;
    /** Label for non-compliant count */
    nonCompliantLabel: string;
    /** Label for unverifiable count */
    unverifiableLabel: string;
    /** Label for ignored count */
    ignoredLabel: string;
    /** Overall status labels */
    overallCompliantLabel: string;
    overallWarningLabel: string;
    overallNonCompliantLabel: string;
    overallRunningLabel: string;
    overallCancelledLabel: string;
    /** Fallback title for errors */
    errorFallbackTitle: string;
    /** Label shown when check failed */
    finalOutcomeFailedLabel: string;
    finalOutcomeCancelledLabel: string;
    /** Optional LogPanel string overrides (compliance mode) */
    complianceStrings?: Partial<ComplianceLogPanelStrings>;
    /** Optional compliance log entry string overrides */
    complianceLogEntryStrings?: Partial<ComplianceLogEntryStrings>;
}>;

/**
 * Props for the ComplianceView component.
 * Renders compliance mode content including check progress, results, and logs.
 */
export type ComplianceViewProps = Readonly<{
    /** Engine snapshot for current state */
    snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined;
    /** Final compliance report (when check completes) */
    complianceReport: ComplianceReport | undefined;

    /** Whether dialog is in pristine state (no check started) */
    isPristine: boolean;
    /** Whether compliance check is currently running */
    isChecking: boolean;
    /** Whether the dialog close animation is in progress (suppresses badge display) */
    isClosing: boolean;
    /** UI-level error to display */
    uiError: DialogUiError | undefined;
    /** Currently open log items (controlled) */
    openLogItems: ReadonlyArray<string>;
    /** Called when log accordion open state changes */
    onOpenLogItemsChange: (items: ReadonlyArray<string>) => void;

    /** Log entries to display (computed by parent) */
    logEntries: ReadonlyArray<ComplianceLogEntry>;

    /** Localized strings */
    strings: ComplianceViewStrings;
}>;
