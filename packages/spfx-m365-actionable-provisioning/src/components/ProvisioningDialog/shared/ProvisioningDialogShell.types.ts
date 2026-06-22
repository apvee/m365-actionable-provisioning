import type * as React from 'react';
import type { Logger } from '@apvee/m365-actionable-provisioning';

/**
 * Props for the ProvisioningDialogShell presentational component.
 * ProvisioningDialogShell provides consistent dialog chrome (title, content area, footer)
 * without owning any business logic.
 */
export type ProvisioningDialogShellProps = Readonly<{
    /** Dialog title text */
    title: string;
    /** Optional description text below title */
    description?: string;
    /** Icon to display in header (typically 28px Fluent UI icon) */
    headerIcon: React.ReactNode;

    /** Whether the dialog is in pristine state (no operations started) */
    isPristine: boolean;
    /** Whether the close button should be hidden (during operations) */
    closeDisabled: boolean;

    /** Main content slot (progress, KPIs, logs, or pristine help text) */
    children: React.ReactNode;
    /** Footer slot (action buttons) */
    footer: React.ReactNode;

    /** Accessible label for close button */
    closeButtonAriaLabel: string;
    /** Localized title for unexpected render errors. */
    errorFallbackTitle: string;
    /** Optional logger for unexpected render errors. */
    logger?: Logger;

    /** Called when close button is clicked */
    onClose: () => void;

    /** Optional additional CSS class */
    className?: string;
}>;
