import type { ComplianceActivityEntry, ProvisioningActivityEntry } from '../../models';
import type { SkipReason } from '@apvee/m365-actionable-provisioning';

export type ProvisioningActivityEntryStrings = Readonly<{
  pendingLabel: string;
  runningLabel: string;
  executedLabel: string;
  failedLabel: string;
  skippedLabel: string;

  skipReasonLabels: Readonly<Record<SkipReason, string>>;
}>;

export type LogPanelStrings = Readonly<{
  emptyMessage: string;
}>;

export type ComplianceActivityEntryStrings = Readonly<{
  compliantLabel: string;
  nonCompliantLabel: string;
  unverifiableLabel: string;
  ignoredLabel: string;
  blockedLabel: string;

  pendingLabel: string;
  runningLabel: string;
  cancelledLabel: string;

  blockedByPrefix: string;
}>;

export type ComplianceLogPanelStrings = Readonly<{
  emptyMessage: string;
}>;

export type LogPanelMode = 'provisioning' | 'compliance';

export interface LogPanelProps {
  entries: ReadonlyArray<ProvisioningActivityEntry | ComplianceActivityEntry>;
  className?: string;

  /** Rendering mode (defaults to "provisioning"). */
  mode?: LogPanelMode;

  /** Optional localized strings overrides (provisioning mode). */
  strings?: Partial<LogPanelStrings>;

  /** Optional localized strings overrides (compliance mode). */
  complianceStrings?: Partial<ComplianceLogPanelStrings>;

  /** Optional localized strings for provisioning activity entries (rendered via LogItem). */
  activityEntryStrings?: Partial<ProvisioningActivityEntryStrings>;

  /** Optional localized strings for compliance activity entries (rendered via LogItem). */
  complianceActivityEntryStrings?: Partial<ComplianceActivityEntryStrings>;
}
