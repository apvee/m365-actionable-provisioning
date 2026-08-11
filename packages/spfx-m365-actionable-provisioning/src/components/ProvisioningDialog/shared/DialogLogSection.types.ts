import type {
    LogPanelStrings,
    ProvisioningActivityEntryStrings,
    ComplianceLogPanelStrings,
    ComplianceActivityEntryStrings,
} from '../../LogPanel/LogPanel.types.js';
import type { ProvisioningActivityEntry } from '../../../models/index.js';
import type { ComplianceActivityEntry } from '../../../models/index.js';

/**
 * Props for the DialogLogSection component.
 * Wraps LogPanel in an Accordion with expand/collapse behavior.
 */
export type DialogLogSectionProps = Readonly<{
    /** Accordion header label */
    label: string;
    /** Currently open accordion items (controlled) */
    openItems: ReadonlyArray<string>;
    /** Called when accordion open state changes */
    onOpenItemsChange: (items: ReadonlyArray<string>) => void;
    /** Log entries to display */
    entries: ReadonlyArray<ProvisioningActivityEntry | ComplianceActivityEntry>;
    /** Display mode for log entries */
    mode?: 'provisioning' | 'compliance';
    /** Optional LogPanel string overrides (provisioning mode) */
    strings?: Partial<LogPanelStrings> | Partial<ComplianceLogPanelStrings>;
    /** Optional log entry string overrides */
    activityEntryStrings?: Partial<ProvisioningActivityEntryStrings> | Partial<ComplianceActivityEntryStrings>;
    /** Optional additional CSS class */
    className?: string;
}>;
