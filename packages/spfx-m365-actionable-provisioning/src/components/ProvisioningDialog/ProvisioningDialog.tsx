import * as React from 'react';
import {
    Dialog,
    DialogSurface,
} from '@fluentui/react-components';

import { useProvisioningDialogStyles } from './ProvisioningDialog.styles';
import type {
    ProvisioningDialogProps,
    ProvisioningDialogStrings,
} from './ProvisioningDialog.types';
import { ProvisioningDialogSession } from './ProvisioningDialogSession';

import * as locStrings from 'SPFxProvisioningUIStrings';

// Re-export public types
export type {
    ProvisioningCompletedEvent,
    ProvisioningDialogProps,
    ProvisioningDialogStrings,
    ProvisioningRunOutcome,
} from './ProvisioningDialog.types';

const DEFAULT_STRINGS: ProvisioningDialogStrings = {
    defaultTitle: locStrings.ProvisioningDialog.DefaultTitle,
    closeButtonAriaLabel: locStrings.ProvisioningDialog.CloseButtonAriaLabel,
    closeLabel: locStrings.ProvisioningDialog.CloseLabel,
    backToProvisioningLabel: locStrings.ProvisioningDialog.BackToProvisioningLabel,
    targetSiteLabel: locStrings.ProvisioningDialog.TargetSiteLabel,
    targetSiteMissingTitle: locStrings.ProvisioningDialog.TargetSiteMissingTitle,
    targetSiteMissingMessage: locStrings.ProvisioningDialog.TargetSiteMissingMessage,
    errorFallbackCode: locStrings.ProvisioningDialog.ErrorFallbackCode,

    totalLabel: locStrings.ProvisioningDialog.TotalLabel,
    successLabel: locStrings.ProvisioningDialog.SuccessLabel,
    failLabel: locStrings.ProvisioningDialog.FailLabel,
    skippedLabel: locStrings.ProvisioningDialog.SkippedLabel,
    pendingLabel: locStrings.ProvisioningDialog.PendingLabel,
    completedLabel: locStrings.ProvisioningDialog.CompletedLabel,

    finalOutcomeSucceededLabel: locStrings.ProvisioningDialog.FinalOutcomeSucceededLabel,
    finalOutcomeFailedLabel: locStrings.ProvisioningDialog.FinalOutcomeFailedLabel,
    finalOutcomeCancelledLabel: locStrings.ProvisioningDialog.FinalOutcomeCancelledLabel,
    finalOutcomeRunningLabel: locStrings.ProvisioningDialog.FinalOutcomeRunningLabel,

    initialHelpProvisioningText: locStrings.ProvisioningDialog.InitialHelpProvisioningText,
    initialHelpComplianceText: locStrings.ProvisioningDialog.InitialHelpComplianceText,

    provisioningDefaultDescription: locStrings.ProvisioningDialog.ProvisioningDefaultDescription,
    complianceDefaultDescription: locStrings.ProvisioningDialog.ComplianceDefaultDescription,

    viewLogsLabel: locStrings.ProvisioningDialog.ViewLogsLabel,
    checkComplianceLabel: locStrings.ProvisioningDialog.CheckComplianceLabel,
    cancelLabel: locStrings.ProvisioningDialog.CancelLabel,
    runLabel: locStrings.ProvisioningDialog.RunLabel,

    complianceDefaultTitle: locStrings.ProvisioningDialog.ComplianceDefaultTitle,
    complianceHeaderLabel: locStrings.ProvisioningDialog.ComplianceHeaderLabel,
    runCheckLabel: locStrings.ProvisioningDialog.RunCheckLabel,
    cancelCheckLabel: locStrings.ProvisioningDialog.CancelCheckLabel,

    checkingLabel: locStrings.ProvisioningDialog.CheckingLabel,

    overallCompliantLabel: locStrings.ProvisioningDialog.OverallCompliantLabel,
    overallWarningLabel: locStrings.ProvisioningDialog.OverallWarningLabel,
    overallNonCompliantLabel: locStrings.ProvisioningDialog.OverallNonCompliantLabel,
    overallRunningLabel: locStrings.ProvisioningDialog.OverallRunningLabel,
    overallCancelledLabel: locStrings.ProvisioningDialog.OverallCancelledLabel,

    checkedLabel: locStrings.ProvisioningDialog.CheckedLabel,
    blockedLabel: locStrings.ProvisioningDialog.BlockedLabel,
    compliantLabel: locStrings.ProvisioningDialog.CompliantLabel,
    nonCompliantLabel: locStrings.ProvisioningDialog.NonCompliantLabel,
    unverifiableLabel: locStrings.ProvisioningDialog.UnverifiableLabel,
    ignoredLabel: locStrings.ProvisioningDialog.IgnoredLabel,

    complianceTargetSiteMissingTitle: locStrings.ProvisioningDialog.ComplianceTargetSiteMissingTitle,
    complianceTargetSiteMissingMessage: locStrings.ProvisioningDialog.ComplianceTargetSiteMissingMessage,
    complianceErrorFallbackTitle: locStrings.ProvisioningDialog.ComplianceErrorFallbackTitle,

    confirmRunTitle: locStrings.ProvisioningDialog.ConfirmRunTitle,
    confirmRunMessage: locStrings.ProvisioningDialog.ConfirmRunMessage,
};

/**
 * ProvisioningDialog is the main dialog component for provisioning operations.
 *
 * This component owns the controlled Fluent dialog shell and delegates runtime
 * orchestration to ProvisioningDialogSession.
 */
export const ProvisioningDialog: React.FC<ProvisioningDialogProps> = (props) => {
    const styles = useProvisioningDialogStyles();
    const closeHandlerRef = React.useRef<(() => void) | undefined>(undefined);
    const { open, ...sessionProps } = props;

    const registerCloseHandler = React.useCallback((handler: (() => void) | undefined) => {
        closeHandlerRef.current = handler;
    }, []);

    const requestClose = React.useCallback(() => {
        closeHandlerRef.current?.();
    }, []);

    return (
        <Dialog
            open={open}
            modalType="alert"
            unmountOnClose={true}
            onOpenChange={(_, data) => {
                if (!data.open) requestClose();
            }}
        >
            <DialogSurface className={styles.surface}>
                <ProvisioningDialogSession
                    {...sessionProps}
                    open={open}
                    defaultStrings={DEFAULT_STRINGS}
                    registerCloseHandler={registerCloseHandler}
                />
            </DialogSurface>
        </Dialog>
    );
};
