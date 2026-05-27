import type * as React from 'react';

/**
 * Props for the DialogShell presentational component.
 * DialogShell provides consistent dialog chrome (title, content area, footer)
 * without owning any business logic.
 */
export type DialogShellProps = Readonly<{
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

    /** Called when close button is clicked */
    onClose: () => void;

    /** Optional additional CSS class */
    className?: string;
}>;
