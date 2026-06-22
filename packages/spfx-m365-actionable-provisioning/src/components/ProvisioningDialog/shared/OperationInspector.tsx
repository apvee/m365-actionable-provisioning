import * as React from 'react';
import {
    Avatar,
    Badge,
    Body1Strong,
    Card,
    CardHeader,
    ProgressBar,
    Text,
} from '@fluentui/react-components';
import type { AvatarProps, BadgeProps } from '@fluentui/react-components';
import { Group, Stack } from '@apvee/react-layout-kit';

import type {
    OperationInspectorProps,
    OperationInspectorStatusTone,
    OperationInspectorSummaryCard,
} from './OperationInspector.types';
import { useOperationInspectorStyles } from './OperationInspector.styles';

const toneToBadgeColor = (tone: OperationInspectorStatusTone): BadgeProps['color'] => {
    switch (tone) {
        case 'success':
            return 'success';
        case 'danger':
            return 'danger';
        case 'warning':
            return 'warning';
        case 'subtle':
            return 'subtle';
        case 'brand':
        default:
            return 'brand';
    }
};

const toneToAvatarColor = (tone: OperationInspectorStatusTone): NonNullable<AvatarProps['color']> => {
    switch (tone) {
        case 'success':
            return 'dark-green';
        case 'danger':
            return 'dark-red';
        case 'warning':
            return 'gold';
        case 'subtle':
            return 'platinum';
        case 'brand':
        default:
            return 'brand';
    }
};

const renderSummaryCard = (
    card: OperationInspectorSummaryCard,
    styles: ReturnType<typeof useOperationInspectorStyles>
): React.ReactElement | null => {
    if (card.hiddenWhenZero && card.value === 0) return null;

    const valueText = card.valueText ?? String(card.value);

    return (
        <Card key={card.key} orientation='horizontal' appearance="filled">
            <CardHeader
                image={<Avatar
                    aria-label={card.ariaLabel ?? `${card.label} ${valueText}`}
                    color={toneToAvatarColor(card.tone)}
                    initials={{ children: valueText }}
                    name={valueText}
                    size={32}
                    active='active'
                    activeAppearance={card.value > 0 ? 'ring-shadow' : 'shadow'}
                />}
                header={<Text weight="regular" className={styles.subtleLabel}>{card.label}</Text>}
            />
        </Card>
    );
};

export const OperationInspector: React.FC<OperationInspectorProps> = ({
    status,
    progress,
    summaryCards,
    pristine,
    activity,
    isPristine,
}): React.ReactElement => {
    const styles = useOperationInspectorStyles();

    if (isPristine && pristine) {
        return <>{pristine}</>;
    }

    return (
        <Stack gap="md">
            {(status || progress) && (
                <Card appearance="filled-alternative">
                    <Stack gap="sm">
                        <Group justify="space-between" align="center" gap="sm">
                            {status ? (
                                <Badge
                                    appearance={status.badgeAppearance ?? 'filled'}
                                    color={toneToBadgeColor(status.tone)}
                                    size="large"
                                >
                                    {status.label}
                                </Badge>
                            ) : null}
                            {progress?.label ? (
                                <Body1Strong className={styles.subtleLabel}>
                                    {progress.label}
                                </Body1Strong>
                            ) : null}
                        </Group>
                        {progress ? <ProgressBar value={progress.value} thickness="large" /> : null}
                    </Stack>
                </Card>
            )}

            {summaryCards.length > 0 ? (
                <div className={styles.summaryGrid}>
                    {summaryCards.map((card) => renderSummaryCard(card, styles))}
                </div>
            ) : null}

            {activity}
        </Stack>
    );
};

OperationInspector.displayName = 'OperationInspector';
