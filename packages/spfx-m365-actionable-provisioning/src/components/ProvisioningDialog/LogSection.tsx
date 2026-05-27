import * as React from 'react';
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { Flex } from '@apvee/react-layout-kit';

import { LogPanel } from '../LogPanel/LogPanel';
import type { LogSectionProps } from './LogSection.types';
import type {
    LogPanelStrings,
    ProvisioningLogEntryStrings,
    ComplianceLogPanelStrings,
    ComplianceLogEntryStrings,
} from '../LogPanel/LogPanel.types';

// Re-export types for external consumers
export type { LogSectionProps };

const useStyles = makeStyles({
    accordionCard: {
        boxShadow: tokens.shadow4,
        borderRadius: tokens.borderRadiusMedium,
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
});

/**
 * LogSection component wraps LogPanel in an Accordion with expand/collapse behavior.
 *
 * Returns null if no entries to display.
 */
export const LogSection: React.FC<LogSectionProps> = ({
    label,
    openItems,
    onOpenItemsChange,
    entries,
    mode = 'provisioning',
    strings,
    logEntryStrings,
    className,
}): React.ReactElement => {
    const styles = useStyles();

    // Return empty fragment if no entries
    if (entries.length === 0) {
        return <></>;
    }

    const handleToggle = React.useCallback(
        (_: unknown, data: { openItems: string | string[] }) => {
            const raw = data.openItems;
            const next = Array.isArray(raw) ? raw : [raw];
            onOpenItemsChange(next.map(String));
        },
        [onOpenItemsChange]
    );

    // Build LogPanel props based on mode
    const logPanelProps = React.useMemo(() => {
        const baseProps = {
            entries,
            mode,
        };

        if (mode === 'compliance') {
            return {
                ...baseProps,
                complianceStrings: strings as Partial<ComplianceLogPanelStrings> | undefined,
                complianceLogEntryStrings: logEntryStrings as Partial<ComplianceLogEntryStrings> | undefined,
            };
        }

        return {
            ...baseProps,
            strings: strings as Partial<LogPanelStrings> | undefined,
            logEntryStrings: logEntryStrings as Partial<ProvisioningLogEntryStrings> | undefined,
        };
    }, [entries, mode, strings, logEntryStrings]);

    return (
        <Accordion
            className={`${styles.accordionCard} ${className ?? ''}`}
            collapsible
            multiple
            openItems={openItems as string[]}
            onToggle={handleToggle}
        >
            <AccordionItem value="logs">
                <AccordionHeader>{label}</AccordionHeader>
                <AccordionPanel className={styles.accordionPanel}>
                    <Flex className={styles.logsContainer}>
                        <LogPanel
                            className={styles.logPanel}
                            {...logPanelProps}
                        />
                    </Flex>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

LogSection.displayName = 'LogSection';
