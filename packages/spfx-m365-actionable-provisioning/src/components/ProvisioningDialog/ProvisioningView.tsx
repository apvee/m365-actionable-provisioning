import * as React from 'react';
import {
    Field,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    ProgressBar,
    Text,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { Stack } from '@apvee/react-layout-kit';

import type { ProvisioningRunOutcome } from './ProvisioningDialog.types';
import type { KPIBadgeSpec } from './KPIDisplay.types';
import type { ProvisioningViewProps, ProvisioningViewStrings } from './ProvisioningView.types';
import type { DialogUiError } from './ProvisioningDialog.state';
import { KPIDisplay } from './KPIDisplay';
import { LogSection } from './LogSection';

// Re-export types for external consumers
export type { ProvisioningViewProps, ProvisioningViewStrings };

const useStyles = makeStyles({
    // Layout styles removed - now using @apvee/react-layout-kit components
    initialHelp: {
        color: tokens.colorNeutralForeground2,
    },
});

/**
 * ProvisioningView renders the provisioning mode content.
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
export const ProvisioningView: React.FC<ProvisioningViewProps> = ({
    snapshot,
    summary,
    logEntries,
    isPristine,
    uiError,
    openLogItems,
    onOpenLogItemsChange,
    canOpenCompliance,
    strings,
}): React.ReactElement => {
    const styles = useStyles();

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

    // Status badge (memoized for performance)
    const statusBadge = React.useMemo<KPIBadgeSpec | undefined>(() => {
        if (isRunning) {
            return { key: 'status', text: strings.finalOutcomeRunningLabel, color: 'brand', appearance: 'filled' };
        }
        if (finalOutcome === 'succeeded') {
            return { key: 'status', text: strings.finalOutcomeSucceededLabel, color: 'success', appearance: 'filled' };
        }
        if (finalOutcome === 'failed') {
            return { key: 'status', text: strings.finalOutcomeFailedLabel, color: 'danger', appearance: 'filled' };
        }
        if (finalOutcome === 'cancelled') {
            return { key: 'status', text: strings.finalOutcomeCancelledLabel, color: 'warning', appearance: 'filled' };
        }
        return undefined;
    }, [isRunning, finalOutcome, strings.finalOutcomeRunningLabel, strings.finalOutcomeSucceededLabel, strings.finalOutcomeFailedLabel, strings.finalOutcomeCancelledLabel]);

    // Metric badges (memoized for performance)
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

    const metricBadges = React.useMemo<ReadonlyArray<KPIBadgeSpec>>(() => {
        const hasDenominator = ratioDenominator !== undefined;
        const badges: KPIBadgeSpec[] = [];

        if (hasDenominator && (counts?.success ?? 0) > 0) {
            badges.push({
                key: 'success',
                text: `${strings.successLabel} ${formatRatio(counts?.success)}`,
                color: 'success',
                appearance: 'tint',
            });
        }

        if (hasDenominator && (counts?.skipped ?? 0) > 0) {
            badges.push({
                key: 'skipped',
                text: `${strings.skippedLabel} ${formatRatio(counts?.skipped)}`,
                color: 'subtle',
                appearance: 'tint',
            });
        }

        if (hasDenominator && (counts?.fail ?? 0) > 0) {
            badges.push({
                key: 'fail',
                text: `${strings.failLabel} ${formatRatio(counts?.fail)}`,
                color: 'danger',
                appearance: 'tint',
            });
        }

        return badges;
    }, [counts?.success, counts?.skipped, counts?.fail, ratioDenominator, formatRatio, strings.successLabel, strings.skippedLabel, strings.failLabel]);

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

    // Engine error
    const engineError = React.useMemo<DialogUiError | undefined>(() => {
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

    // Render helpers
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
            {renderErrorBox(engineError)}

            {isPristine && (
                <Stack gap="sm" className={styles.initialHelp}>
                    <Text>{strings.initialHelpProvisioningText}</Text>
                    {canOpenCompliance && <Text>{strings.initialHelpComplianceText}</Text>}
                </Stack>
            )}

            {showProgress && (
                <Field label={showCompletedKpi ? `${strings.completedLabel} ${formatRatio(completed)}` : undefined}>
                    <ProgressBar value={progressRatio ?? 0} thickness="large" />
                </Field>
            )}

            <KPIDisplay statusBadge={statusBadge} metricBadges={metricBadges} />

            <LogSection
                label={strings.viewLogsLabel}
                openItems={openLogItems}
                onOpenItemsChange={handleOpenLogItemsChange}
                entries={logEntries}
                mode="provisioning"
                strings={strings.logPanelStrings}
                logEntryStrings={strings.logEntryStrings}
            />
        </Stack>
    );
};

ProvisioningView.displayName = 'ProvisioningView';
