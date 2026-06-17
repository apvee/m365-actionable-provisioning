import { makeStyles, tokens } from '@fluentui/react-components';

export const useOperationInspectorStyles = makeStyles({
    subtleLabel: {
        color: tokens.colorNeutralForeground2,
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
        gap: tokens.spacingHorizontalS,
    },
});
