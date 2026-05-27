import * as React from 'react';
import {
    Field,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    ProgressBar,
} from '@fluentui/react-components';
import { Stack } from '@apvee/react-layout-kit';

import type { ComplianceReport } from '../../../core/compliance';
import { computeComplianceOverall } from '../../../core/compliance';
import type { KPIBadgeSpec } from './KPIDisplay.types';
import type { ComplianceViewProps, ComplianceViewStrings } from './ComplianceView.types';
import type { DialogUiError } from './ProvisioningDialog.state';
import { KPIDisplay } from './KPIDisplay';
import { LogSection } from './LogSection';

// Re-export types for external consumers
export type { ComplianceViewProps, ComplianceViewStrings };

type ComplianceOverallBadge = Readonly<{
    text: string;
    appearance: 'filled' | 'tint' | 'outline';
    color: 'success' | 'danger' | 'warning' | 'brand' | 'subtle' | undefined;
}>;

/**
 * Builds overall status badge from compliance overall result.
 */
const buildOverallBadgeFromOverall = (
    overall: ComplianceReport['overall'],
    s: ComplianceViewStrings
): ComplianceOverallBadge => {
    switch (overall) {
        case 'non_compliant':
            return { text: s.overallNonCompliantLabel, appearance: 'tint', color: 'danger' };
        case 'warning':
            return { text: s.overallWarningLabel, appearance: 'tint', color: 'warning' };
        case 'compliant':
        default:
            return { text: s.overallCompliantLabel, appearance: 'tint', color: 'success' };
    }
};

/**
 * ComplianceView renders the compliance check mode content.
 *
 * Displays:
 * - Error messages (UI error)
 * - Progress bar with checked count
 * - KPI badges (overall status + detailed metrics)
 * - Log section with accordion
 *
 * This component is purely presentational - all state is passed via props.
 */
export const ComplianceView: React.FC<ComplianceViewProps> = ({
    snapshot,
    complianceReport,
    isPristine,
    isChecking,
    isClosing,
    uiError,
    openLogItems,
    onOpenLogItemsChange,
    logEntries,
    strings,
}): React.ReactElement => {
    const compliance = snapshot?.compliance;

    // Build KPIs from either the final report or the live snapshot
    const displayedKpis = React.useMemo(() => {
        // Suppress badge display during close animation
        if (isClosing) return undefined;

        // If we have a completed report and snapshot shows completed, use report data
        if (complianceReport && compliance?.status === 'completed') {
            return {
                badge: buildOverallBadgeFromOverall(complianceReport.overall, strings),
                total: complianceReport.total,
                checked: complianceReport.checked,
                blocked: complianceReport.blocked,
                counts: complianceReport.counts,
            };
        }

        // While checking or cancelled, use live engine state
        if (isChecking || compliance?.status === 'running' || compliance?.status === 'cancelled') {
            if (!compliance) return undefined;

            const counts = compliance.trace.counts;
            const outcomeCounts = {
                compliant: counts.compliant ?? 0,
                non_compliant: counts.non_compliant ?? 0,
                unverifiable: counts.unverifiable ?? 0,
                ignored: counts.ignored ?? 0,
            } as const;

            const checked =
                outcomeCounts.compliant +
                outcomeCounts.non_compliant +
                outcomeCounts.unverifiable +
                outcomeCounts.ignored;
            const blocked = counts.blocked ?? 0;
            const total = compliance.trace.total;

            const badge: ComplianceOverallBadge =
                compliance.status === 'running'
                    ? { text: strings.overallRunningLabel, appearance: 'tint', color: 'brand' }
                    : compliance.status === 'cancelled'
                        ? { text: strings.overallCancelledLabel, appearance: 'tint', color: 'warning' }
                        : buildOverallBadgeFromOverall(
                            computeComplianceOverall({ counts: outcomeCounts, policy: compliance.policy }),
                            strings
                        );

            return {
                badge,
                total,
                checked,
                blocked,
                counts: outcomeCounts,
            };
        }

        return undefined;
    }, [complianceReport, compliance, isChecking, isClosing, strings]);

    // Status badge (memoized)
    const statusBadge = React.useMemo<KPIBadgeSpec | undefined>(() => {
        if (!displayedKpis?.badge) return undefined;
        return {
            key: 'overall-status',
            text: displayedKpis.badge.text,
            color: displayedKpis.badge.color ?? 'brand',
            appearance: 'filled',
        };
    }, [displayedKpis?.badge]);

    // Metric badges (memoized)
    const metricBadges = React.useMemo<ReadonlyArray<KPIBadgeSpec>>(() => {
        if (!displayedKpis) return [];

        const badges: KPIBadgeSpec[] = [];

        if (displayedKpis.checked > 0) {
            badges.push({
                key: 'checked',
                text: `${strings.checkedLabel} ${displayedKpis.checked}/${displayedKpis.total}`,
                color: 'brand',
                appearance: 'tint',
            });
        }

        if (displayedKpis.blocked > 0) {
            badges.push({
                key: 'blocked',
                text: `${strings.blockedLabel} ${displayedKpis.blocked}/${displayedKpis.total}`,
                color: 'subtle',
                appearance: 'tint',
            });
        }

        if (displayedKpis.counts.compliant > 0) {
            badges.push({
                key: 'compliant',
                text: `${strings.compliantLabel} ${displayedKpis.counts.compliant}`,
                color: 'success',
                appearance: 'tint',
            });
        }

        if (displayedKpis.counts.non_compliant > 0) {
            badges.push({
                key: 'non_compliant',
                text: `${strings.nonCompliantLabel} ${displayedKpis.counts.non_compliant}`,
                color: 'danger',
                appearance: 'tint',
            });
        }

        if (displayedKpis.counts.unverifiable > 0) {
            badges.push({
                key: 'unverifiable',
                text: `${strings.unverifiableLabel} ${displayedKpis.counts.unverifiable}`,
                color: 'brand',
                appearance: 'tint',
            });
        }

        if (displayedKpis.counts.ignored > 0) {
            badges.push({
                key: 'ignored',
                text: `${strings.ignoredLabel} ${displayedKpis.counts.ignored}`,
                color: 'subtle',
                appearance: 'tint',
            });
        }

        return badges;
    }, [displayedKpis, strings.checkedLabel, strings.blockedLabel, strings.compliantLabel, strings.nonCompliantLabel, strings.unverifiableLabel, strings.ignoredLabel]);

    // Progress calculation (memoized)
    const progress = React.useMemo(() => {
        if (isPristine) return undefined;

        const checked = displayedKpis?.checked;
        const total = displayedKpis?.total;

        if (!total) return { label: undefined, value: 0 };

        const ratio = Math.max(0, Math.min(1, (checked ?? 0) / total));
        return {
            label: `${strings.checkedLabel} ${checked ?? 0}/${total}`,
            value: ratio,
        };
    }, [isPristine, displayedKpis?.checked, displayedKpis?.total, strings.checkedLabel]);

    // Handle log items change (stable callback)
    const handleOpenLogItemsChange = React.useCallback(
        (items: ReadonlyArray<string>) => {
            onOpenLogItemsChange(items);
        },
        [onOpenLogItemsChange]
    );

    // Render error box helper
    const renderErrorBox = (err: DialogUiError | undefined): React.ReactNode => {
        if (!err) return null;
        return (
            <MessageBar intent="error">
                <MessageBarBody>
                    <MessageBarTitle>{err.title}</MessageBarTitle>
                    {err.message}
                </MessageBarBody>
            </MessageBar>
        );
    };

    return (
        <Stack gap="md">
            {renderErrorBox(uiError)}

            {progress && (
                <Field label={progress.label}>
                    <ProgressBar value={progress.value} thickness="large" />
                </Field>
            )}

            <KPIDisplay statusBadge={statusBadge} metricBadges={metricBadges} />

            <LogSection
                label={strings.viewLogsLabel}
                openItems={openLogItems}
                onOpenItemsChange={handleOpenLogItemsChange}
                entries={logEntries}
                mode="compliance"
                strings={strings.complianceStrings}
                logEntryStrings={strings.complianceLogEntryStrings}
            />
        </Stack>
    );
};

ComplianceView.displayName = 'ComplianceView';
