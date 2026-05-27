import * as React from 'react';
import {
    Button,
    CardHeader,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogTitle,
    Text,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { Flex, Stack } from '@apvee/react-layout-kit';

import { ErrorBoundary } from './ErrorBoundary';
import type { DialogShellProps } from './DialogShell.types';

const useStyles = makeStyles({
    // Layout styles removed - now using @apvee/react-layout-kit components
    contentPristine: {
        overflowY: 'hidden',
    },
    description: {
        color: tokens.colorNeutralForeground2,
    },
});

/**
 * DialogShell is a presentational component providing consistent dialog chrome.
 *
 * It renders the header (title, icon, close button), content area with ErrorBoundary,
 * and footer slot. The parent component owns the Dialog instance and open/close state.
 *
 * This component does not contain any business logic.
 */
export const DialogShell: React.FC<DialogShellProps> = ({
    title,
    description,
    headerIcon,
    isPristine,
    closeDisabled,
    children,
    footer,
    closeButtonAriaLabel,
    onClose,
    className,
}): React.ReactElement => {
    const styles = useStyles();

    const contentClassName = `${isPristine ? styles.contentPristine : ''} ${className ?? ''}`;

    // CardHeader's image slot requires a proper slot shorthand or undefined
    const imageSlot = headerIcon ? { children: headerIcon } : undefined;

    return (
        <DialogBody>
            <DialogTitle
                action={
                    closeDisabled ? undefined : (
                        <Button
                            appearance="subtle"
                            aria-label={closeButtonAriaLabel}
                            icon={<DismissRegular />}
                            onClick={onClose}
                        />
                    )
                }
            >
                <CardHeader
                    image={imageSlot}
                    header={title}
                    description={
                        description ? (
                            <Text className={styles.description}>{description}</Text>
                        ) : undefined
                    }
                />
            </DialogTitle>

            <DialogContent className={contentClassName}>
                <Stack gap={{ xs: 'md', lg: 'lg' }} py={{ xs: 'sm', md: 'md' }}>
                    <ErrorBoundary>{children}</ErrorBoundary>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Flex direction="row" align="center" gap="md" style={{ width: '100%' }}>
                    {footer}
                </Flex>
            </DialogActions>
        </DialogBody>
    );
};

DialogShell.displayName = 'DialogShell';
