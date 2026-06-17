import type { EngineSnapshotTyped } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningActivityEntry } from '../../../models';
import type { ProvisioningUiSummary } from '../../../utils/trace-to-activity';
import type { LogPanelStrings, ProvisioningActivityEntryStrings } from '../../LogPanel/LogPanel.types';
import type { DialogUiError } from '../ProvisioningDialog.state';

/**
 * Localized strings for the ProvisioningRunView component.
 */
export type ProvisioningRunViewStrings = Readonly<{
    /** Help text shown when dialog opens and no run has started */
    initialHelpProvisioningText: string;
    /** Help text shown only when compliance check button is enabled */
    initialHelpComplianceText: string;
    /** Label for logs accordion */
    viewLogsLabel: string;
    /** Label for completed count */
    completedLabel: string;
    /** Label for success badge */
    successLabel: string;
    /** Label for skipped badge */
    skippedLabel: string;
    /** Label for fail badge */
    failLabel: string;
    /** Fallback code for errors */
    errorFallbackCode: string;
    /** Status badge labels */
    finalOutcomeRunningLabel: string;
    finalOutcomeSucceededLabel: string;
    finalOutcomeFailedLabel: string;
    finalOutcomeCancelledLabel: string;
    /** Optional LogPanel string overrides */
    logPanelStrings?: Partial<LogPanelStrings>;
    /** Optional log entry string overrides */
    activityEntryStrings?: Partial<ProvisioningActivityEntryStrings>;
}>;

/**
 * Props for the ProvisioningRunView component.
 * Renders provisioning mode content including progress, KPIs, and logs.
 */
export type ProvisioningRunViewProps = Readonly<{
    /** Engine snapshot for current state */
    snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined;
    /** Derived UI summary from snapshot */
    summary: ProvisioningUiSummary | undefined;
    /** Log entries to display */
    activityEntries: ReadonlyArray<ProvisioningActivityEntry>;

    /** Whether dialog is in pristine state (no operations started) */
    isPristine: boolean;
    /** UI-level error to display */
    uiError: DialogUiError | undefined;
    /** Currently open log items (controlled) */
    openLogItems: ReadonlyArray<string>;
    /** Called when log accordion open state changes */
    onOpenLogItemsChange: (items: ReadonlyArray<string>) => void;

    /** Whether compliance check button can be shown */
    canOpenCompliance: boolean;

    /** Localized strings */
    strings: ProvisioningRunViewStrings;
}>;
