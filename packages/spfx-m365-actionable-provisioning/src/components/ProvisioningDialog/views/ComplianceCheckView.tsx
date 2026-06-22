import * as React from 'react';
import {
    Text,
} from '@fluentui/react-components';
import { Stack } from '@apvee/react-layout-kit';

import type { ComplianceReport } from '@apvee/m365-actionable-provisioning';
import { computeComplianceOverall } from '@apvee/m365-actionable-provisioning';
import type { ComplianceCheckViewProps, ComplianceCheckViewStrings } from './ComplianceCheckView.types';
import { DialogLogSection } from '../shared/DialogLogSection';
import { DialogErrorMessage } from '../shared/DialogErrorMessage';
import { OperationInspector } from '../shared/OperationInspector';
import type {
    OperationInspectorStatus,
    OperationInspectorStatusTone,
    OperationInspectorSummaryCard,
} from '../shared/OperationInspector.types';

export type { ComplianceCheckViewProps, ComplianceCheckViewStrings };

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
    s: ComplianceCheckViewStrings
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
 * ComplianceCheckView renders the compliance check mode content.
 *
 * Displays:
 * - Error messages (UI error)
 * - Progress bar with checked count
 * - KPI badges (overall status + detailed metrics)
 * - Log section with accordion
 *
 * This component is purely presentational - all state is passed via props.
 */
export const ComplianceCheckView: React.FC<ComplianceCheckViewProps> = ({
    snapshot,
    complianceReport,
    isPristine,
    isChecking,
    uiError,
    openLogItems,
    onOpenLogItemsChange,
    activityEntries,
    strings,
}): React.ReactElement => {
    const compliance = snapshot?.compliance;

    // Build KPIs from either the final report or the live snapshot
    const displayedKpis = React.useMemo(() => {
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
    }, [complianceReport, compliance, isChecking, strings]);

    // Status strip state (memoized)
    const inspectorStatus = React.useMemo<OperationInspectorStatus | undefined>(() => {
        if (!displayedKpis?.badge) return undefined;

        const tone: OperationInspectorStatusTone =
            displayedKpis.badge.color === 'success'
                ? 'success'
                : displayedKpis.badge.color === 'danger'
                    ? 'danger'
                    : displayedKpis.badge.color === 'warning'
                        ? 'warning'
                        : displayedKpis.badge.color === 'subtle'
                            ? 'subtle'
                            : 'brand';

        return {
            label: displayedKpis.badge.text,
            tone,
            badgeAppearance: 'tint',
        };
    }, [displayedKpis?.badge]);

    // Summary cards (memoized)
    const summaryCards = React.useMemo<ReadonlyArray<OperationInspectorSummaryCard>>(() => {
        if (!displayedKpis) return [];

        return [
            {
                key: 'compliant',
                label: strings.compliantLabel,
                value: displayedKpis.counts.compliant,
                tone: 'success',
                hiddenWhenZero: false,
            },
            {
                key: 'non_compliant',
                label: strings.nonCompliantLabel,
                value: displayedKpis.counts.non_compliant,
                tone: 'danger',
                hiddenWhenZero: false,
            },
            {
                key: 'unverifiable',
                label: strings.unverifiableLabel,
                value: displayedKpis.counts.unverifiable,
                tone: 'warning',
                hiddenWhenZero: false,
            },
            {
                key: 'blocked',
                label: strings.blockedLabel,
                value: displayedKpis.blocked,
                tone: 'subtle',
                hiddenWhenZero: false,
            },
            {
                key: 'ignored',
                label: strings.ignoredLabel,
                value: displayedKpis.counts.ignored,
                tone: 'subtle',
                hiddenWhenZero: true,
            },
        ];
    }, [displayedKpis, strings.blockedLabel, strings.compliantLabel, strings.nonCompliantLabel, strings.unverifiableLabel, strings.ignoredLabel]);

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

    const pristineContent = (
        <Text>{strings.initialHelpComplianceText}</Text>
    );

    return (
        <Stack gap="md">
            <DialogErrorMessage error={uiError} />
            <OperationInspector
                status={inspectorStatus}
                progress={progress}
                summaryCards={summaryCards}
                pristine={pristineContent}
                activity={
                    <DialogLogSection
                        label={strings.viewLogsLabel}
                        openItems={openLogItems}
                        onOpenItemsChange={handleOpenLogItemsChange}
                        entries={activityEntries}
                        mode="compliance"
                        strings={strings.complianceStrings}
                        activityEntryStrings={strings.complianceActivityEntryStrings}
                    />
                }
                isPristine={isPristine}
            />
        </Stack>
    );
};

ComplianceCheckView.displayName = 'ComplianceCheckView';
