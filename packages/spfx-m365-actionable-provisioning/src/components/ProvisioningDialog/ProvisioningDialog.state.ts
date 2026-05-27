import type { ComplianceReport } from '../../../core/compliance';

import type { ProvisioningDialogMode } from './ProvisioningDialog.types';

/**
 * Represents a user-facing error message with title and message content.
 * Used for both provisioning and compliance error states.
 */
export type DialogUiError = Readonly<{ title: string; message: string }>;

/**
 * Complete state shape for the ProvisioningDialog component.
 *
 * This state is managed by a reducer pattern and contains:
 * - Mode tracking (provisioning vs compliance)
 * - Provisioning run state (in-flight flag, UI errors)
 * - UI preferences (log accordion state, confirmation dialog)
 * - Compliance check state (checking flag, results, errors)
 * - Close animation state (isClosing flag)
 *
 * All state changes flow through the dialogReducer via dispatch.
 * Ref-based bookkeeping (completion signals, timer tokens) lives outside this state.
 */
export type DialogState = Readonly<{
    /** Current active mode: 'provisioning' or 'compliance' */
    activeMode: ProvisioningDialogMode;
    /** Whether user can navigate back to provisioning mode (entered via Check button) */
    canGoBackFromCompliance: boolean;

    /** Whether a provisioning run is currently in progress */
    runInFlight: boolean;
    /** User-facing error for provisioning mode (e.g., missing target site) */
    uiError: DialogUiError | undefined;

    /** Currently expanded accordion items in provisioning mode logs */
    openLogItems: ReadonlyArray<string>;
    /** Whether the confirmation dialog is open */
    confirmOpen: boolean;

    /** Currently expanded accordion items in compliance mode logs */
    complianceOpenLogItems: ReadonlyArray<string>;
    /** Final compliance report after check completes */
    complianceReport: ComplianceReport | undefined;
    /** Whether a compliance check is currently running */
    complianceIsChecking: boolean;
    /** User-facing error for compliance mode */
    complianceError: DialogUiError | undefined;

    /** Whether the dialog close animation is in progress (suppresses badge display) */
    isClosing: boolean;
}>;

/**
 * Discriminated union of all actions that can modify DialogState.
 *
 * Action categories:
 * - Lifecycle: OPEN_ALIGN, CLOSE_HARD_RESET, SET_CLOSING
 * - Mode switching: SET_ACTIVE_MODE, SET_CAN_GO_BACK
 * - Provisioning: SET_RUN_IN_FLIGHT, SET_UI_ERROR
 * - UI preferences: SET_OPEN_LOG_ITEMS, SET_CONFIRM_OPEN, SET_COMPLIANCE_OPEN_LOG_ITEMS
 * - Compliance: COMPLIANCE_RESET_UI, COMPLIANCE_START, COMPLIANCE_SET_RESULT, COMPLIANCE_SET_ERROR, COMPLIANCE_SET_CHECKING
 */
export type DialogAction =
    /** Aligns dialog state when opening - sets mode and resets navigation flag */
    | Readonly<{ type: 'OPEN_ALIGN'; initialMode: ProvisioningDialogMode }>
    /** Complete state reset when dialog closes - returns to initial state */
    | Readonly<{ type: 'CLOSE_HARD_RESET'; initialMode: ProvisioningDialogMode; defaultOpenLogItems: ReadonlyArray<string> }>
    /** Marks dialog as closing (suppresses badge display during close animation) */
    | Readonly<{ type: 'SET_CLOSING'; value: boolean }>
    /** Switches between provisioning and compliance modes */
    | Readonly<{ type: 'SET_ACTIVE_MODE'; mode: ProvisioningDialogMode }>
    /** Enables/disables back navigation from compliance to provisioning */
    | Readonly<{ type: 'SET_CAN_GO_BACK'; value: boolean }>
    /** Marks provisioning run as started/completed */
    | Readonly<{ type: 'SET_RUN_IN_FLIGHT'; value: boolean }>
    /** Sets or clears provisioning mode UI error */
    | Readonly<{ type: 'SET_UI_ERROR'; error: DialogUiError | undefined }>
    /** Updates which log accordion items are expanded (provisioning mode) */
    | Readonly<{ type: 'SET_OPEN_LOG_ITEMS'; items: ReadonlyArray<string> }>
    /** Opens/closes the run confirmation dialog */
    | Readonly<{ type: 'SET_CONFIRM_OPEN'; value: boolean }>
    /** Updates which log accordion items are expanded (compliance mode) */
    | Readonly<{ type: 'SET_COMPLIANCE_OPEN_LOG_ITEMS'; items: ReadonlyArray<string> }>
    /** Resets compliance UI state when switching to compliance mode */
    | Readonly<{ type: 'COMPLIANCE_RESET_UI'; defaultOpenLogItems: ReadonlyArray<string> }>
    /** Marks compliance check as started, clears previous results */
    | Readonly<{ type: 'COMPLIANCE_START' }>
    /** Sets compliance check result and optional error */
    | Readonly<{ type: 'COMPLIANCE_SET_RESULT'; report: ComplianceReport; error: DialogUiError | undefined }>
    /** Sets compliance error and clears report */
    | Readonly<{ type: 'COMPLIANCE_SET_ERROR'; error: DialogUiError }>
    /** Explicitly sets compliance checking flag */
    | Readonly<{ type: 'COMPLIANCE_SET_CHECKING'; value: boolean }>;

/**
 * Creates the initial state for DialogState.
 *
 * @param args.initialMode - Starting mode ('provisioning' or 'compliance')
 * @param args.defaultOpenLogItems - Default accordion items to expand
 * @returns Fresh DialogState with all values at their defaults
 */
export const buildInitialDialogState = (args: Readonly<{ initialMode: ProvisioningDialogMode; defaultOpenLogItems: ReadonlyArray<string> }>): DialogState => {
    return {
        activeMode: args.initialMode,
        canGoBackFromCompliance: false,

        runInFlight: false,
        uiError: undefined,

        openLogItems: args.defaultOpenLogItems,
        confirmOpen: false,

        complianceOpenLogItems: args.defaultOpenLogItems,
        complianceReport: undefined,
        complianceIsChecking: false,
        complianceError: undefined,

        isClosing: false,
    };
};

/**
 * Reducer function for DialogState management.
 *
 * All state transitions are handled here. The reducer is pure and returns
 * a new state object for any recognized action. Unrecognized actions return
 * the current state unchanged.
 *
 * @param state - Current dialog state
 * @param action - Action to process
 * @returns Updated state (new object if changed, same reference if unchanged)
 *
 * @example
 * // Switch to compliance mode
 * dispatch({ type: 'SET_ACTIVE_MODE', mode: 'compliance' });
 *
 * @example
 * // Start a compliance check
 * dispatch({ type: 'COMPLIANCE_START' });
 */
export const dialogReducer = (state: DialogState, action: DialogAction): DialogState => {
    switch (action.type) {
        /**
         * OPEN_ALIGN: Called when dialog opens.
         * - Sets activeMode to match incoming prop
         * - Resets navigation flag (can't go back yet)
         * - Does NOT reset other state (preserves any cached data)
         */
        case 'OPEN_ALIGN':
            return {
                ...state,
                activeMode: action.initialMode,
                canGoBackFromCompliance: false,
            };

        /**
         * CLOSE_HARD_RESET: Called after dialog close animation completes.
         * - Returns to completely fresh initial state
         * - Clears all cached results, errors, and preferences
         * - Ensures next open starts clean
         */
        case 'CLOSE_HARD_RESET':
            return buildInitialDialogState({ initialMode: action.initialMode, defaultOpenLogItems: action.defaultOpenLogItems });

        /**
         * SET_CLOSING: Marks dialog as entering close animation.
         * - Set true at start of handleClose to suppress badge display
         * - Automatically reset to false by CLOSE_HARD_RESET (via buildInitialDialogState)
         */
        case 'SET_CLOSING':
            return { ...state, isClosing: action.value };

        /**
         * SET_ACTIVE_MODE: Switches between provisioning and compliance modes.
         * - Only changes the activeMode field
         * - Does not affect other state (caller responsible for cleanup)
         */
        case 'SET_ACTIVE_MODE':
            return { ...state, activeMode: action.mode };

        /**
         * SET_CAN_GO_BACK: Controls Back button visibility in compliance mode.
         * - Set true when entering compliance via the Check button
         * - Set false when switching back to provisioning
         */
        case 'SET_CAN_GO_BACK':
            return { ...state, canGoBackFromCompliance: action.value };

        /**
         * SET_RUN_IN_FLIGHT: Tracks provisioning run lifecycle.
         * - Set true when run() is called
         * - Set false in finally block (success or failure)
         * - Used to prevent duplicate runs and show cancel button
         */
        case 'SET_RUN_IN_FLIGHT':
            return { ...state, runInFlight: action.value };

        /**
         * SET_UI_ERROR: Sets or clears provisioning mode error.
         * - Set to error object when validation fails (e.g., no target site)
         * - Set to undefined to clear errors before starting a run
         */
        case 'SET_UI_ERROR':
            return { ...state, uiError: action.error };

        /**
         * SET_OPEN_LOG_ITEMS: Updates log accordion state in provisioning mode.
         * - Called when user expands/collapses log sections
         * - Items array contains value strings of open AccordionItems
         */
        case 'SET_OPEN_LOG_ITEMS':
            return { ...state, openLogItems: action.items };

        /**
         * SET_CONFIRM_OPEN: Controls confirmation dialog visibility.
         * - Set true to show "Are you sure?" dialog before run
         * - Set false when user cancels or confirms
         */
        case 'SET_CONFIRM_OPEN':
            return { ...state, confirmOpen: action.value };

        /**
         * SET_COMPLIANCE_OPEN_LOG_ITEMS: Updates log accordion state in compliance mode.
         * - Same behavior as SET_OPEN_LOG_ITEMS but for compliance view
         */
        case 'SET_COMPLIANCE_OPEN_LOG_ITEMS':
            return { ...state, complianceOpenLogItems: action.items };

        /**
         * COMPLIANCE_RESET_UI: Prepares compliance mode for a fresh check.
         * - Called when switching to compliance mode
         * - Clears previous report, error, and checking flag
         * - Resets log accordion to default state
         */
        case 'COMPLIANCE_RESET_UI':
            return {
                ...state,
                complianceOpenLogItems: action.defaultOpenLogItems,
                complianceReport: undefined,
                complianceIsChecking: false,
                complianceError: undefined,
            };

        /**
         * COMPLIANCE_START: Marks beginning of compliance check.
         * - Sets checking flag to true
         * - Clears any previous error and report
         * - UI should show progress indicators
         */
        case 'COMPLIANCE_START':
            return {
                ...state,
                complianceIsChecking: true,
                complianceError: undefined,
                complianceReport: undefined,
            };

        /**
         * COMPLIANCE_SET_RESULT: Stores successful compliance check result.
         * - Saves the ComplianceReport for display
         * - May include error (report can have error property)
         * - Clears checking flag
         */
        case 'COMPLIANCE_SET_RESULT':
            return {
                ...state,
                complianceReport: action.report,
                complianceError: action.error,
                complianceIsChecking: false,
            };

        /**
         * COMPLIANCE_SET_ERROR: Handles compliance check failure.
         * - Stores error for display
         * - Clears any previous report (failed check = no results)
         * - Does NOT clear checking flag (use COMPLIANCE_SET_CHECKING separately)
         */
        case 'COMPLIANCE_SET_ERROR':
            return {
                ...state,
                complianceError: action.error,
                complianceReport: undefined,
            };

        /**
         * COMPLIANCE_SET_CHECKING: Explicitly sets checking flag.
         * - Typically used in finally block to ensure flag is cleared
         * - Provides fallback if COMPLIANCE_SET_RESULT not reached
         */
        case 'COMPLIANCE_SET_CHECKING':
            return { ...state, complianceIsChecking: action.value };

        default:
            return state;
    }
};

/**
 * View model for compliance mode footer buttons.
 * Determines which buttons to show and their enabled state.
 */
export type ComplianceFooterModel = Readonly<{
    /** Show the Close button (hidden during check) */
    showClose: boolean;
    /** Show the Run Check button (hidden during check) */
    showRun: boolean;
    /** Show the Cancel button (only during check) */
    showCancel: boolean;
    /** Disable the Run button (during check or no target site) */
    runDisabled: boolean;
}>;

/**
 * Computes the footer button visibility/state for compliance mode.
 *
 * UX rules:
 * - While checking: show only Cancel button
 * - When idle/done: show Run + Close buttons
 * - Run is disabled if no target site is configured
 *
 * @param args.isChecking - Whether a compliance check is in progress
 * @param args.hasTargetSite - Whether a target site URL is configured
 * @returns Model describing button visibility and enabled state
 */
export const getComplianceFooterModel = (args: Readonly<{ isChecking: boolean; hasTargetSite: boolean }>): ComplianceFooterModel => {
    return {
        showClose: !args.isChecking,
        showRun: !args.isChecking,
        showCancel: args.isChecking,
        runDisabled: args.isChecking || !args.hasTargetSite,
    };
};
