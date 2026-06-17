import type { EngineSnapshotTyped } from '@apvee/m365-actionable-provisioning';
import type { ComplianceReport } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning';
import type { ComplianceActivityEntry } from '../../../models';
import type { DialogUiError } from '../ProvisioningDialog.state';
import type { ComplianceLogPanelStrings, ComplianceActivityEntryStrings } from '../../LogPanel/LogPanel.types';

/**
 * Localized strings for the ComplianceCheckView component.
 */
export type ComplianceCheckViewStrings = Readonly<{
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
    complianceActivityEntryStrings?: Partial<ComplianceActivityEntryStrings>;
}>;

/**
 * Props for the ComplianceCheckView component.
 * Renders compliance mode content including check progress, results, and logs.
 */
export type ComplianceCheckViewProps = Readonly<{
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
    activityEntries: ReadonlyArray<ComplianceActivityEntry>;

    /** Localized strings */
    strings: ComplianceCheckViewStrings;
}>;
