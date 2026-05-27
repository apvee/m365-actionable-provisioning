import type {
    LogPanelStrings,
    ProvisioningLogEntryStrings,
    ComplianceLogPanelStrings,
    ComplianceLogEntryStrings,
} from '../LogPanel/LogPanel.types';
import type { ProvisioningLogEntry } from '../../models';
import type { ComplianceLogEntry } from '../../models';

/**
 * Props for the LogSection component.
 * Wraps LogPanel in an Accordion with expand/collapse behavior.
 */
export type LogSectionProps = Readonly<{
    /** Accordion header label */
    label: string;
    /** Currently open accordion items (controlled) */
    openItems: ReadonlyArray<string>;
    /** Called when accordion open state changes */
    onOpenItemsChange: (items: ReadonlyArray<string>) => void;
    /** Log entries to display */
    entries: ReadonlyArray<ProvisioningLogEntry | ComplianceLogEntry>;
    /** Display mode for log entries */
    mode?: 'provisioning' | 'compliance';
    /** Optional LogPanel string overrides (provisioning mode) */
    strings?: Partial<LogPanelStrings> | Partial<ComplianceLogPanelStrings>;
    /** Optional log entry string overrides */
    logEntryStrings?: Partial<ProvisioningLogEntryStrings> | Partial<ComplianceLogEntryStrings>;
    /** Optional additional CSS class */
    className?: string;
}>;
