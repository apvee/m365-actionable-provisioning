import { makeStyles, tokens } from '@fluentui/react-components';

export const useProvisioningDialogStyles = makeStyles({
    surface: {
        maxWidth: '900px',
        width: '90vw',
    },
    // Layout styles removed - now using @apvee/react-layout-kit components in DialogShell
    contentPristine: {
        overflowY: 'hidden',
    },
    description: {
        color: tokens.colorNeutralForeground2,
    },
    initialHelp: {
        color: tokens.colorNeutralForeground2,
    },
    logsContainer: {
        // Keep the dialog from growing as logs appear.
        // (Use min() so shorter viewports don't overflow.)
        height: 'min(256px, 60vh)',
        minHeight: 'min(256px, 60vh)',
        overflow: 'hidden',
    },
    logPanel: {
        width: '100%',
    },
    accordionPanel: {
        paddingLeft: 0,
        paddingInlineStart: 0,
        paddingRight: 0,
        paddingInlineEnd: 0,
        marginRight: 0,
        marginInlineEnd: 0,
        paddingBottom: tokens.spacingVerticalM,
        paddingInline: tokens.spacingHorizontalM,
    },
    accordionCard: {
        boxShadow: tokens.shadow4,
        borderRadius: tokens.borderRadiusMedium,
    },
});
