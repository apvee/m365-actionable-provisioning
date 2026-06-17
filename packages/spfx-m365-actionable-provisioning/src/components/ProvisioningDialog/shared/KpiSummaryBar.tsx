import * as React from 'react';
import { Badge, Card } from '@fluentui/react-components';
import { Flex, Group } from '@apvee/react-layout-kit';

import type { KpiBadgeSpec, KpiSummaryBarProps } from './KpiSummaryBar.types';

/**
 * Renders a single badge from a KpiBadgeSpec.
 */
const renderBadge = (spec: KpiBadgeSpec): React.ReactElement => (
    <Badge
        key={spec.key}
        appearance={spec.appearance}
        shape="rounded"
        size="large"
        color={spec.color}
    >
        {spec.text}
    </Badge>
);

/**
 * KpiSummaryBar component renders status and metric badges in a horizontal card layout.
 *
 * Returns null if neither statusBadge nor metricBadges are provided.
 *
 * @remarks
 * This component demonstrates the correct pattern for using @apvee/react-layout-kit:
 * - Layout is handled entirely by `<Group>` and `<Flex>` components
 * - No `makeStyles` is used for layout CSS (display, flex, gap, etc.)
 * - Fluent UI Card provides visual styling (shadows, borders)
 *
 * See [LAYOUT_GUIDELINES.md](../../LAYOUT_GUIDELINES.md) for complete guidelines.
 */
export const KpiSummaryBar: React.FC<KpiSummaryBarProps> = ({
    statusBadge,
    metricBadges,
    className,
}): React.ReactElement => {

    // Return empty fragment if nothing to display
    if (!statusBadge && (!metricBadges || metricBadges.length === 0)) {
        return <></>;
    }

    return (
        <Card size="small" appearance="filled-alternative" className={className}>
            <Group justify="space-between" gap="sm">
                {statusBadge && renderBadge(statusBadge)}
                <Flex direction={'row'} gap="sm">
                    {metricBadges?.map(renderBadge)}
                </Flex>
            </Group>
        </Card>
    );
};

KpiSummaryBar.displayName = 'KpiSummaryBar';
