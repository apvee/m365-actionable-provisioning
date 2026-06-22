import type { ReactNode } from 'react';
import type { BadgeProps } from '@fluentui/react-components';

export type OperationInspectorStatusTone = 'brand' | 'success' | 'danger' | 'warning' | 'subtle';

export type OperationInspectorProgress = Readonly<{
    label?: string;
    value: number;
}>;

export type OperationInspectorSummaryCard = Readonly<{
    key: string;
    label: string;
    value: number;
    valueText?: string;
    tone: OperationInspectorStatusTone;
    hiddenWhenZero?: boolean;
    ariaLabel?: string;
}>;

export type OperationInspectorStatus = Readonly<{
    label: string;
    tone: OperationInspectorStatusTone;
    badgeAppearance?: BadgeProps['appearance'];
}>;

export type OperationInspectorProps = Readonly<{
    status?: OperationInspectorStatus;
    progress?: OperationInspectorProgress;
    summaryCards: ReadonlyArray<OperationInspectorSummaryCard>;
    pristine?: ReactNode;
    activity: ReactNode;
    isPristine: boolean;
}>;
