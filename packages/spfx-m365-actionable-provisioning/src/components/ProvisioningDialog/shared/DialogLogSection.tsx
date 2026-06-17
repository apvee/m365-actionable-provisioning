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

import { LogPanel } from '../../LogPanel/LogPanel';
import type { DialogLogSectionProps } from './DialogLogSection.types';
import type {
    LogPanelStrings,
    ProvisioningActivityEntryStrings,
    ComplianceLogPanelStrings,
    ComplianceActivityEntryStrings,
} from '../../LogPanel/LogPanel.types';

export type { DialogLogSectionProps };

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
 * DialogLogSection component wraps LogPanel in an Accordion with expand/collapse behavior.
 *
 * Returns null if no entries to display.
 */
export const DialogLogSection: React.FC<DialogLogSectionProps> = ({
    label,
    openItems,
    onOpenItemsChange,
    entries,
    mode = 'provisioning',
    strings,
    activityEntryStrings,
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
                complianceActivityEntryStrings: activityEntryStrings as Partial<ComplianceActivityEntryStrings> | undefined,
            };
        }

        return {
            ...baseProps,
            strings: strings as Partial<LogPanelStrings> | undefined,
            activityEntryStrings: activityEntryStrings as Partial<ProvisioningActivityEntryStrings> | undefined,
        };
    }, [entries, mode, strings, activityEntryStrings]);

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

DialogLogSection.displayName = 'DialogLogSection';
