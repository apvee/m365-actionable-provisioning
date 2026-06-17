import * as React from 'react';
import {
    Text,
} from '@fluentui/react-components';
import { Stack } from '@apvee/react-layout-kit';

import type { ProvisioningRunOutcome } from '../ProvisioningDialog.types';
import type { ProvisioningRunViewProps, ProvisioningRunViewStrings } from './ProvisioningRunView.types';
import type { ProvisioningDialogUiError } from '../ProvisioningDialogSession.state';
import { DialogLogSection } from '../shared/DialogLogSection';
import { DialogErrorMessage } from '../shared/DialogErrorMessage';
import { OperationInspector } from '../shared/OperationInspector';
import type {
    OperationInspectorStatus,
    OperationInspectorSummaryCard,
} from '../shared/OperationInspector.types';

export type { ProvisioningRunViewProps, ProvisioningRunViewStrings };

/**
 * ProvisioningRunView renders the provisioning mode content.
 *
 * Displays:
 * - Initial help text when pristine
 * - Error messages (UI error and engine error)
 * - Progress bar with completion count
 * - KPI badges (status + metrics)
 * - Log section with accordion
 *
 * This component is purely presentational - all state is passed via props.
 */
export const ProvisioningRunView: React.FC<ProvisioningRunViewProps> = ({
    snapshot,
    summary,
    activityEntries,
    isPristine,
    uiError,
    openLogItems,
    onOpenLogItemsChange,
    canOpenCompliance,
    strings,
}): React.ReactElement => {
    // Derived state: final outcome
    const finalOutcome = React.useMemo<ProvisioningRunOutcome | undefined>(() => {
        if (!snapshot) return undefined;
        if (snapshot.status === 'cancelled') return 'cancelled';
        if (snapshot.status === 'failed') return 'failed';
        if (snapshot.status === 'completed') {
            const failCount = snapshot.out?.trace?.counts?.fail ?? 0;
            return failCount > 0 ? 'failed' : 'succeeded';
        }
        return undefined;
    }, [snapshot]);

    const isRunning = summary?.isRunning === true;

    // Status strip state (memoized for performance)
    const inspectorStatus = React.useMemo<OperationInspectorStatus | undefined>(() => {
        if (isRunning) {
            return { label: strings.finalOutcomeRunningLabel, tone: 'brand', badgeAppearance: 'tint' };
        }
        if (finalOutcome === 'succeeded') {
            return { label: strings.finalOutcomeSucceededLabel, tone: 'success', badgeAppearance: 'tint' };
        }
        if (finalOutcome === 'failed') {
            return { label: strings.finalOutcomeFailedLabel, tone: 'danger', badgeAppearance: 'tint' };
        }
        if (finalOutcome === 'cancelled') {
            return { label: strings.finalOutcomeCancelledLabel, tone: 'warning', badgeAppearance: 'tint' };
        }
        return undefined;
    }, [isRunning, finalOutcome, strings.finalOutcomeRunningLabel, strings.finalOutcomeSucceededLabel, strings.finalOutcomeFailedLabel, strings.finalOutcomeCancelledLabel]);

    // Summary cards (memoized for performance)
    const counts = summary?.counts;
    const total = snapshot?.out?.trace?.total;
    const ratioDenominator = summary?.progress?.total ?? total;

    const formatRatio = React.useCallback(
        (value: number | undefined): string => {
            const left = value ?? 0;
            const right = ratioDenominator !== undefined ? String(ratioDenominator) : '-';
            return `${left}/${right}`;
        },
        [ratioDenominator]
    );

    const summaryCards = React.useMemo<ReadonlyArray<OperationInspectorSummaryCard>>(() => {
        if (ratioDenominator === undefined) return [];

        return [
            {
                key: 'success',
                label: strings.successLabel,
                value: counts?.success ?? 0,
                tone: 'success',
                hiddenWhenZero: false,
            },
            {
                key: 'skipped',
                label: strings.skippedLabel,
                value: counts?.skipped ?? 0,
                tone: 'subtle',
                hiddenWhenZero: false,
            },
            {
                key: 'fail',
                label: strings.failLabel,
                value: counts?.fail ?? 0,
                tone: 'danger',
                hiddenWhenZero: false,
            },
        ];
    }, [counts?.success, counts?.skipped, counts?.fail, ratioDenominator, strings.successLabel, strings.skippedLabel, strings.failLabel]);

    // Progress calculation (memoized)
    const completed = summary?.progress?.completed;
    const progressTotal = summary?.progress?.total;
    const progressRatio = React.useMemo(() => {
        if (!progressTotal) return undefined;
        const c = completed ?? 0;
        return Math.max(0, Math.min(1, c / progressTotal));
    }, [completed, progressTotal]);

    const showCompletedKpi = (ratioDenominator !== undefined) && (completed ?? 0) > 0;
    const showProgress = !isPristine && progressRatio !== undefined;

    const inspectorProgress = React.useMemo(() => {
        if (!showProgress) return undefined;
        return {
            label: showCompletedKpi ? `${strings.completedLabel} ${formatRatio(completed)}` : undefined,
            value: progressRatio ?? 0,
        };
    }, [showProgress, showCompletedKpi, strings.completedLabel, formatRatio, completed, progressRatio]);

    // Engine error
    const engineError = React.useMemo<ProvisioningDialogUiError | undefined>(() => {
        if (!snapshot?.error) return undefined;
        return {
            title: snapshot.error.code ?? strings.errorFallbackCode,
            message: snapshot.error.message,
        };
    }, [snapshot?.error, strings.errorFallbackCode]);

    // Handle log items change (stable callback)
    const handleOpenLogItemsChange = React.useCallback(
        (items: ReadonlyArray<string>) => {
            onOpenLogItemsChange(items);
        },
        [onOpenLogItemsChange]
    );

    const pristineContent = (
        <>
            <Text>{strings.initialHelpProvisioningText}</Text>
            {canOpenCompliance ? <Text>{strings.initialHelpComplianceText}</Text> : null}
        </>
    );

    return (
        <Stack gap="md">
            <DialogErrorMessage error={uiError} />
            <DialogErrorMessage error={engineError} />

            <OperationInspector
                status={inspectorStatus}
                progress={inspectorProgress}
                summaryCards={summaryCards}
                pristine={pristineContent}
                activity={
                    <DialogLogSection
                        label={strings.viewLogsLabel}
                        openItems={openLogItems}
                        onOpenItemsChange={handleOpenLogItemsChange}
                        entries={activityEntries}
                        mode="provisioning"
                        strings={strings.logPanelStrings}
                        activityEntryStrings={strings.activityEntryStrings}
                    />
                }
                isPristine={isPristine}
            />
        </Stack>
    );
};

ProvisioningRunView.displayName = 'ProvisioningRunView';
