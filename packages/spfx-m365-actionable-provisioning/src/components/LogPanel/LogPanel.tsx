/**
 * Internal LogPanel component for displaying provisioning and compliance activity.
 *
 * @internal
 * @packageDocumentation
 */

import * as React from 'react';

import { Badge, Text, makeStyles, tokens } from '@fluentui/react-components';
import {
  ArrowStepOverRegular,
  CheckmarkCircle20Filled,
  Circle20Regular,
  Clock20Regular,
  ErrorCircle20Filled,
  Warning20Filled,
} from '@fluentui/react-icons';
import { Center, Stack } from '@apvee/react-layout-kit';

import type { ComplianceActivityEntry, ProvisioningActivityEntry } from '../../models';

import * as locStrings from 'SPFxProvisioningUIStrings';

import { LogItem } from './LogItem/LogItem';
import type { LogItemBadgeSpec, LogItemRenderers, LogItemStyles } from './LogItem/LogItem.types';

import type {
  ComplianceActivityEntryStrings,
  ComplianceLogPanelStrings,
  LogPanelProps,
  LogPanelStrings,
  ProvisioningActivityEntryStrings,
} from './LogPanel.types';
import { prunePendingComplianceEntries, prunePendingEntries } from './LogPanel.utils';

const useInternalLogScrollPanelStyles = makeStyles({
  emptyState: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
  },
  scrollContainer: {
    height: '100%',
    overflowY: 'auto',
  },
  // Layout styles removed - now using @apvee/react-layout-kit components
  emptyStateContainer: {
    height: '100%',
  },
});

type InternalLogScrollPanelProps<TEntry extends { id: React.Key }> = Readonly<{
  entries: ReadonlyArray<TEntry>;
  className?: string;
  emptyMessage: string;
  renderItem: (entry: TEntry) => React.ReactNode;
}>;

function InternalLogScrollPanel<TEntry extends { id: React.Key }>({
  entries,
  className = '',
  emptyMessage,
  renderItem,
}: InternalLogScrollPanelProps<TEntry>): JSX.Element {
  const styles = useInternalLogScrollPanelStyles();

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const pinnedRef = React.useRef(true);

  const scrollToBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  }, []);

  const onScroll = React.useCallback((ev: React.UIEvent<HTMLDivElement>) => {
    const el = ev.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    // Keep auto-scroll enabled while the user is near the bottom.
    pinnedRef.current = distanceFromBottom <= 16;
  }, []);

  React.useEffect(() => {
    if (!pinnedRef.current) {
      return;
    }

    // Wait a frame so layout is up-to-date before scrolling.
    const handle = requestAnimationFrame(() => {
      scrollToBottom();
    });

    return () => cancelAnimationFrame(handle);
  }, [entries, scrollToBottom]);

  if (entries.length === 0) {
    return (
      <div className={`${styles.scrollContainer} ${className}`} ref={scrollRef} onScroll={onScroll}>
        <Center className={styles.emptyStateContainer}>
          <Text className={styles.emptyState}>{emptyMessage}</Text>
        </Center>
      </div>
    );
  }

  return (
    <div className={`${styles.scrollContainer} ${className}`} ref={scrollRef} onScroll={onScroll}>
      <Stack>
        {entries.map((entry) => (
          <React.Fragment key={entry.id}>{renderItem(entry)}</React.Fragment>
        ))}
      </Stack>
    </div>
  );
}

const DEFAULT_STRINGS: LogPanelStrings = {
  emptyMessage: locStrings.LogPanel.EmptyMessage,
};

const DEFAULT_COMPLIANCE_STRINGS: ComplianceLogPanelStrings = {
  emptyMessage: locStrings.ComplianceLogPanel.EmptyMessage,
};

const DEFAULT_PROVISIONING_ACTIVITY_ENTRY_STRINGS: ProvisioningActivityEntryStrings = {
  pendingLabel: locStrings.ProvisioningActivityEntry.PendingLabel,
  runningLabel: locStrings.ProvisioningActivityEntry.RunningLabel,
  executedLabel: locStrings.ProvisioningActivityEntry.ExecutedLabel,
  failedLabel: locStrings.ProvisioningActivityEntry.FailedLabel,
  skippedLabel: locStrings.ProvisioningActivityEntry.SkippedLabel,
  skipReasonLabels: {
    not_found: locStrings.ProvisioningActivityEntry.SkipReasonNotFound,
    already_exists: locStrings.ProvisioningActivityEntry.SkipReasonAlreadyExists,
    no_changes: locStrings.ProvisioningActivityEntry.SkipReasonNoChanges,
    missing_prerequisite: locStrings.ProvisioningActivityEntry.SkipReasonMissingPrerequisite,
    unsupported: locStrings.ProvisioningActivityEntry.SkipReasonUnsupported,
  },
};

const DEFAULT_COMPLIANCE_ACTIVITY_ENTRY_STRINGS: ComplianceActivityEntryStrings = {
  compliantLabel: locStrings.ComplianceActivityEntry.CompliantLabel,
  nonCompliantLabel: locStrings.ComplianceActivityEntry.NonCompliantLabel,
  unverifiableLabel: locStrings.ComplianceActivityEntry.UnverifiableLabel,
  ignoredLabel: locStrings.ComplianceActivityEntry.IgnoredLabel,
  blockedLabel: locStrings.ComplianceActivityEntry.BlockedLabel,

  pendingLabel: locStrings.ComplianceActivityEntry.PendingLabel,
  runningLabel: locStrings.ComplianceActivityEntry.RunningLabel,
  cancelledLabel: locStrings.ComplianceActivityEntry.CancelledLabel,

  blockedByPrefix: locStrings.ComplianceActivityEntry.BlockedByPrefix,
};

const provisioningStatusIcon = (entry: ProvisioningActivityEntry): JSX.Element => {
  if (entry.status === 'success') {
    return <CheckmarkCircle20Filled primaryFill={tokens.colorPaletteGreenForeground1} />;
  }

  if (entry.status === 'failed') {
    return <ErrorCircle20Filled primaryFill={tokens.colorPaletteRedForeground1} />;
  }

  if (entry.status === 'working') {
    return <Clock20Regular primaryFill={tokens.colorPaletteBlueForeground2} />;
  }

  if (entry.status === 'skipped') {
    return <ArrowStepOverRegular primaryFill={tokens.colorNeutralForeground3} />;
  }

  return <Circle20Regular primaryFill={tokens.colorNeutralForeground3} />;
};

const buildProvisioningActivityBadge = (entry: ProvisioningActivityEntry, s: ProvisioningActivityEntryStrings): LogItemBadgeSpec => {
  if (entry.status === 'failed') {
    return { text: s.failedLabel, appearance: 'filled', color: 'danger' };
  }

  if (entry.status === 'working') {
    return { text: s.runningLabel, appearance: 'tint', color: 'brand' };
  }

  if (entry.status === 'skipped') {
    const reason = entry.result?.outcome === 'skipped' ? entry.result.reason : undefined;
    const reasonText = reason ? s.skipReasonLabels[reason] : undefined;
    return {
      text: reasonText ? `${s.skippedLabel}: ${reasonText}` : s.skippedLabel,
      appearance: 'tint',
      color: 'subtle',
    };
  }

  if (entry.status === 'success') {
    return { text: s.executedLabel, appearance: 'tint', color: 'success' };
  }

  return { text: s.pendingLabel, appearance: 'outline', color: undefined };
};

const createProvisioningActivityRenderers = (s: ProvisioningActivityEntryStrings): LogItemRenderers<ProvisioningActivityEntry> => {
  return {
    getKey: (e) => e.id,
    getChildren: (e) => e.children,
    getInfo: (e) => e.errorMessage,

    renderIcon: (e) => provisioningStatusIcon(e),

    renderTitle: (e, styles: LogItemStyles) => {
      const resourceText = e.result?.resource;
      return (
        <Text className={styles.titleText} size={e.kind === 'subaction' ? 200 : 300}>
          <span className={styles.titleVerb}>{e.verb}</span>
          {resourceText ? <span className={styles.titleRest}>: {resourceText}</span> : null}
        </Text>
      );
    },

    renderMetadata: (e) => {
      const badge = buildProvisioningActivityBadge(e, s);
      return (
        <>
          <Badge appearance={badge.appearance} color={badge.color} size="small">
            {badge.text}
          </Badge>

          {e.durationMs !== undefined && e.status !== 'pending' && <Text size={200}>{e.durationMs}ms</Text>}
        </>
      );
    },
  };
};

const complianceStatusIcon = (entry: ComplianceActivityEntry): JSX.Element => {
  switch (entry.status) {
    case 'running':
      return <Circle20Regular primaryFill={tokens.colorBrandForeground1} />;
    case 'pending':
      return <Circle20Regular primaryFill={tokens.colorNeutralForeground3} />;
    case 'cancelled':
      return <Circle20Regular primaryFill={tokens.colorNeutralForeground3} />;
    case 'compliant':
      return <CheckmarkCircle20Filled primaryFill={tokens.colorPaletteGreenForeground1} />;
    case 'non_compliant':
      return <ErrorCircle20Filled primaryFill={tokens.colorPaletteRedForeground1} />;
    case 'unverifiable':
      return <Warning20Filled primaryFill={tokens.colorPaletteYellowForeground1} />;
    case 'ignored':
      return <Circle20Regular primaryFill={tokens.colorNeutralForeground3} />;
    case 'blocked':
      return <ArrowStepOverRegular primaryFill={tokens.colorNeutralForeground3} />;
    default:
      return <Circle20Regular primaryFill={tokens.colorNeutralForeground3} />;
  }
};

const buildComplianceBadge = (entry: ComplianceActivityEntry, s: ComplianceActivityEntryStrings): LogItemBadgeSpec => {
  switch (entry.status) {
    case 'running':
      return { text: s.runningLabel, appearance: 'tint', color: 'brand' };
    case 'pending':
      return { text: s.pendingLabel, appearance: 'outline', color: undefined };
    case 'cancelled':
      return { text: s.cancelledLabel, appearance: 'outline', color: undefined };
    case 'non_compliant':
      return { text: s.nonCompliantLabel, appearance: 'filled', color: 'danger' };
    case 'compliant':
      return { text: s.compliantLabel, appearance: 'tint', color: 'success' };
    case 'unverifiable':
      return { text: s.unverifiableLabel, appearance: 'tint', color: 'brand' };
    case 'ignored':
      return { text: s.ignoredLabel, appearance: 'outline', color: undefined };
    case 'blocked':
      return { text: s.blockedLabel, appearance: 'outline', color: undefined };
    default:
      return { text: s.unverifiableLabel, appearance: 'outline', color: undefined };
  }
};

const buildComplianceInfo = (entry: ComplianceActivityEntry, s: ComplianceActivityEntryStrings): string | undefined => {
  if (entry.status === 'running' || entry.status === 'pending' || entry.status === 'cancelled') return undefined;

  if (!entry.checked && entry.blockedBy) {
    return `${s.blockedByPrefix} ${entry.blockedBy}`;
  }

  const parts: string[] = [];
  if (entry.reason) parts.push(entry.reason);
  if (entry.message) parts.push(entry.message);
  if (parts.length === 0) return undefined;
  return parts.join(' • ');
};

const createComplianceActivityRenderers = (s: ComplianceActivityEntryStrings): LogItemRenderers<ComplianceActivityEntry> => {
  return {
    getKey: (e) => e.id,
    getChildren: (e) => e.children,
    getInfo: (e) => buildComplianceInfo(e, s),

    renderIcon: (e) => complianceStatusIcon(e),

    renderTitle: (e, styles: LogItemStyles) => {
      return (
        <Text className={styles.titleText} size={e.kind === 'subaction' ? 200 : 300}>
          <span className={styles.titleVerb}>{e.verb}</span>
          {e.resource ? <span className={styles.titleRest}>: {e.resource}</span> : null}
        </Text>
      );
    },

    renderMetadata: (e) => {
      const badge = buildComplianceBadge(e, s);
      return (
        <Badge appearance={badge.appearance} color={badge.color} size="small">
          {badge.text}
        </Badge>
      );
    },

    renderExtra: (e, styles: LogItemStyles) => {
      if (!e.message || !e.checked) return null;
      return (
        <div className={styles.message}>
          <Text size={200}>{e.message}</Text>
        </div>
      );
    },
  };
};

type ProvisioningLogPanelProps = Readonly<{
  entries: ReadonlyArray<ProvisioningActivityEntry>;
  className?: string;
  strings?: Partial<LogPanelStrings>;
  activityEntryStrings?: Partial<ProvisioningActivityEntryStrings>;
}>;

const ProvisioningLogPanel: React.FC<ProvisioningLogPanelProps> = ({
  entries,
  className = '',
  strings,
  activityEntryStrings,
}) => {
  const s = React.useMemo(() => {
    return {
      ...DEFAULT_STRINGS,
      ...(strings ?? {}),
    } satisfies LogPanelStrings;
  }, [strings]);

  const itemStrings = React.useMemo(() => {
    return {
      ...DEFAULT_PROVISIONING_ACTIVITY_ENTRY_STRINGS,
      ...(activityEntryStrings ?? {}),
    } satisfies ProvisioningActivityEntryStrings;
  }, [activityEntryStrings]);

  const renderers = React.useMemo(() => {
    return createProvisioningActivityRenderers(itemStrings);
  }, [itemStrings]);

  const visibleEntries = React.useMemo(() => {
    return prunePendingEntries(entries);
  }, [entries]);

  return (
    <InternalLogScrollPanel
      className={className}
      entries={visibleEntries}
      emptyMessage={s.emptyMessage}
      renderItem={(entry) => <LogItem entry={entry} renderers={renderers} />}
    />
  );
};

type ComplianceLogPanelProps = Readonly<{
  entries: ReadonlyArray<ComplianceActivityEntry>;
  className?: string;
  complianceStrings?: Partial<ComplianceLogPanelStrings>;
  complianceActivityEntryStrings?: Partial<ComplianceActivityEntryStrings>;
}>;

const ComplianceLogPanel: React.FC<ComplianceLogPanelProps> = ({
  entries,
  className = '',
  complianceStrings,
  complianceActivityEntryStrings,
}) => {
  const s = React.useMemo(() => {
    return {
      ...DEFAULT_COMPLIANCE_STRINGS,
      ...(complianceStrings ?? {}),
    } satisfies ComplianceLogPanelStrings;
  }, [complianceStrings]);

  const itemStrings = React.useMemo(() => {
    return {
      ...DEFAULT_COMPLIANCE_ACTIVITY_ENTRY_STRINGS,
      ...(complianceActivityEntryStrings ?? {}),
    } satisfies ComplianceActivityEntryStrings;
  }, [complianceActivityEntryStrings]);

  const renderers = React.useMemo(() => {
    return createComplianceActivityRenderers(itemStrings);
  }, [itemStrings]);

  const visibleEntries = React.useMemo(() => {
    return prunePendingComplianceEntries(entries);
  }, [entries]);

  return (
    <InternalLogScrollPanel
      className={className}
      entries={visibleEntries}
      emptyMessage={s.emptyMessage}
      renderItem={(entry) => <LogItem entry={entry} renderers={renderers} />}
    />
  );
};

export const LogPanel: React.FC<LogPanelProps> = ({
  entries,
  className = '',
  mode = 'provisioning',
  strings,
  activityEntryStrings,
  complianceStrings,
  complianceActivityEntryStrings,
}) => {
  if (mode === 'compliance') {
    return (
      <ComplianceLogPanel
        className={className}
        entries={entries as ReadonlyArray<ComplianceActivityEntry>}
        complianceStrings={complianceStrings}
        complianceActivityEntryStrings={complianceActivityEntryStrings}
      />
    );
  }

  return (
    <ProvisioningLogPanel
      className={className}
      entries={entries as ReadonlyArray<ProvisioningActivityEntry>}
      strings={strings}
      activityEntryStrings={activityEntryStrings}
    />
  );
};
