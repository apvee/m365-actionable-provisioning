import type * as React from 'react';
import type { EngineSnapshotTyped } from '../../../core/engine';
import type { CompliancePolicy, ComplianceReport } from '../../../core/compliance';
import type { ProvisioningResultLight } from '../../../provisioning';
import type { Logger } from '../../../core/logger';
import type { DialogAction, DialogState } from '../../components/ProvisioningDialog/ProvisioningDialog.state';
import type { ProvisioningCompletedEvent, ProvisioningDialogMode } from '../../components/ProvisioningDialog/ProvisioningDialog.types';

/**
 * Options for the useDialogOrchestration hook.
 */
export type DialogOrchestrationOptions = Readonly<{
    /** Whether the dialog is currently open */
    open: boolean;
    /** Initial mode (provisioning or compliance) */
    initialMode: ProvisioningDialogMode;
    /** Normalized target site URL */
    normalizedTargetSiteUrl: string | undefined;
    /** Default accordion open items */
    defaultOpenLogItems: ReadonlyArray<string>;
    /** Whether to auto-run compliance when opening in compliance mode */
    complianceAutoRunOnOpen?: boolean;
    /** Compliance policy for checks */
    compliancePolicy?: CompliancePolicy;

    /** Engine run function */
    run: () => Promise<EngineSnapshotTyped<ProvisioningResultLight>>;
    /** Engine cancel function */
    cancel: () => void;
    /** Engine compliance check function */
    checkCompliance: (policy?: CompliancePolicy) => Promise<ComplianceReport>;

    /** Called when provisioning completes */
    onProvisioningCompleted?: (ev: ProvisioningCompletedEvent) => void;
    /** Called when dialog should close */
    onClose: () => void;

    /** State dispatch function */
    dispatch: React.Dispatch<DialogAction>;

    /** Current engine snapshot */
    snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined;
    /** Whether engine is currently running */
    isRunning: boolean;
    /** Current dialog state */
    state: DialogState;

    /** Localized strings for error messages */
    strings: {
        targetSiteMissingTitle: string;
        targetSiteMissingMessage: string;
        complianceTargetSiteMissingTitle: string;
        complianceTargetSiteMissingMessage: string;
        complianceErrorFallbackTitle: string;
    };

    /** Whether run requires confirmation */
    confirmRun?: boolean;

    /** Optional logger for debug */
    logger?: Logger;
}>;

/**
 * Return value from the useDialogOrchestration hook.
 */
export type DialogOrchestrationReturn = Readonly<{
    /** Key to reset engine (increment to recreate) */
    engineResetKey: number;

    /** Close dialog handler */
    handleClose: () => void;
    /** Run provisioning handler */
    handleRun: () => Promise<void>;
    /** Run button click handler (may open confirm dialog) */
    handleRunClick: () => void;
    /** Cancel operation handler */
    handleCancel: () => void;
    /** Run compliance check handler */
    handleRunCompliance: () => Promise<void>;
    /** Switch to compliance mode */
    switchToCompliance: () => void;
    /** Switch to provisioning mode */
    switchToProvisioning: () => void;

    /** Whether compliance mode can be opened */
    canOpenCompliance: boolean;
}>;
