import type { ComplianceLogEntry, ProvisioningLogEntry } from '../../models';
import type { SkipReason } from '../../../provisioning';

export type ProvisioningLogEntryStrings = Readonly<{
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

export type ComplianceLogEntryStrings = Readonly<{
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
  entries: ReadonlyArray<ProvisioningLogEntry | ComplianceLogEntry>;
  className?: string;

  /** Rendering mode (defaults to "provisioning"). */
  mode?: LogPanelMode;

  /** Optional localized strings overrides (provisioning mode). */
  strings?: Partial<LogPanelStrings>;

  /** Optional localized strings overrides (compliance mode). */
  complianceStrings?: Partial<ComplianceLogPanelStrings>;

  /** Optional localized strings for provisioning log entries (rendered via LogItem). */
  logEntryStrings?: Partial<ProvisioningLogEntryStrings>;

  /** Optional localized strings for compliance log entries (rendered via LogItem). */
  complianceLogEntryStrings?: Partial<ComplianceLogEntryStrings>;
}
