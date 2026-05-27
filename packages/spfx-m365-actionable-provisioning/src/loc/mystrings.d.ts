/**
 * Localization interface definitions for provisioning-ui module.
 *
 * This file declares all user-facing strings organized by component.
 * Following SPFx localization conventions with PascalCase keys.
 *
 * @packageDocumentation
 */

/** Strings for ConfirmDialog component */
declare interface IConfirmDialogStrings {
  /** Label for the confirm button */
  ConfirmLabel: string;
  /** Label for the cancel button */
  CancelLabel: string;
}

/** Strings for LogPanel component (provisioning mode) */
declare interface ILogPanelStrings {
  /** Message shown when no logs are available */
  EmptyMessage: string;
}

/** Strings for LogPanel component (compliance mode) */
declare interface IComplianceLogPanelStrings {
  /** Message shown when no compliance results are available */
  EmptyMessage: string;
}

/** Strings for provisioning log entries */
declare interface IProvisioningLogEntryStrings {
  /** Label for pending status */
  PendingLabel: string;
  /** Label for running status */
  RunningLabel: string;
  /** Label for executed/success status */
  ExecutedLabel: string;
  /** Label for failed status */
  FailedLabel: string;
  /** Label for skipped status */
  SkippedLabel: string;

  // Skip reason labels
  /** Skip reason: resource not found */
  SkipReasonNotFound: string;
  /** Skip reason: resource already exists */
  SkipReasonAlreadyExists: string;
  /** Skip reason: no changes needed */
  SkipReasonNoChanges: string;
  /** Skip reason: missing prerequisite */
  SkipReasonMissingPrerequisite: string;
  /** Skip reason: operation unsupported */
  SkipReasonUnsupported: string;
}

/** Strings for compliance log entries */
declare interface IComplianceLogEntryStrings {
  /** Label for compliant status */
  CompliantLabel: string;
  /** Label for non-compliant status */
  NonCompliantLabel: string;
  /** Label for unverifiable status */
  UnverifiableLabel: string;
  /** Label for ignored status */
  IgnoredLabel: string;
  /** Label for blocked status */
  BlockedLabel: string;

  /** Label for pending status */
  PendingLabel: string;
  /** Label for running/checking status */
  RunningLabel: string;
  /** Label for cancelled status */
  CancelledLabel: string;

  /** Prefix text for blocked-by message */
  BlockedByPrefix: string;
}

/** Strings for ProvisioningDialog component */
declare interface IProvisioningDialogStrings {
  // Dialog chrome
  /** Default dialog title */
  DefaultTitle: string;
  /** Aria label for close button */
  CloseButtonAriaLabel: string;
  /** Label for close button */
  CloseLabel: string;
  /** Label for back to provisioning button */
  BackToProvisioningLabel: string;

  // Target site
  /** Label for target site display */
  TargetSiteLabel: string;
  /** Title when target site is missing */
  TargetSiteMissingTitle: string;
  /** Message when target site is missing */
  TargetSiteMissingMessage: string;
  /** Fallback code for errors */
  ErrorFallbackCode: string;

  // KPIs
  /** Label for total count */
  TotalLabel: string;
  /** Label for success count */
  SuccessLabel: string;
  /** Label for fail count */
  FailLabel: string;
  /** Label for skipped count */
  SkippedLabel: string;
  /** Label for pending count */
  PendingLabel: string;
  /** Label for completed count */
  CompletedLabel: string;

  // Final outcomes
  /** Label for succeeded outcome */
  FinalOutcomeSucceededLabel: string;
  /** Label for failed outcome */
  FinalOutcomeFailedLabel: string;
  /** Label for cancelled outcome */
  FinalOutcomeCancelledLabel: string;
  /** Label for running outcome */
  FinalOutcomeRunningLabel: string;

  // Help text
  /** Initial help text for provisioning mode */
  InitialHelpProvisioningText: string;
  /** Initial help text for compliance mode */
  InitialHelpComplianceText: string;

  // Default descriptions (for dialog shell)
  /** Default description for provisioning mode */
  ProvisioningDefaultDescription: string;
  /** Default description for compliance mode */
  ComplianceDefaultDescription: string;

  // Actions
  /** Label for view logs button */
  ViewLogsLabel: string;
  /** Label for check compliance button */
  CheckComplianceLabel: string;
  /** Label for cancel button */
  CancelLabel: string;
  /** Label for run button */
  RunLabel: string;

  // Confirmation
  /** Title for run confirmation dialog */
  ConfirmRunTitle: string;
  /** Message for run confirmation dialog */
  ConfirmRunMessage: string;

  // Compliance mode
  /** Default title for compliance mode */
  ComplianceDefaultTitle: string;
  /** Header label for compliance check */
  ComplianceHeaderLabel: string;
  /** Label for run check button */
  RunCheckLabel: string;
  /** Label for cancel check button */
  CancelCheckLabel: string;
  /** Label shown while checking */
  CheckingLabel: string;

  // Compliance overall status
  /** Label for overall compliant status */
  OverallCompliantLabel: string;
  /** Label for overall warning status */
  OverallWarningLabel: string;
  /** Label for overall non-compliant status */
  OverallNonCompliantLabel: string;
  /** Label for overall running status */
  OverallRunningLabel: string;
  /** Label for overall cancelled status */
  OverallCancelledLabel: string;

  // Compliance counts
  /** Label for checked count */
  CheckedLabel: string;
  /** Label for blocked count */
  BlockedLabel: string;
  /** Label for compliant count */
  CompliantLabel: string;
  /** Label for non-compliant count */
  NonCompliantLabel: string;
  /** Label for unverifiable count */
  UnverifiableLabel: string;
  /** Label for ignored count */
  IgnoredLabel: string;

  // Compliance errors
  /** Title when compliance target site is missing */
  ComplianceTargetSiteMissingTitle: string;
  /** Message when compliance target site is missing */
  ComplianceTargetSiteMissingMessage: string;
  /** Fallback title for compliance errors */
  ComplianceErrorFallbackTitle: string;
}

/** Strings for PropertyPaneProvisioningField */
declare interface IPropertyPaneProvisioningFieldStrings {  // Default label
  /** Default label for the property pane field when no label is provided */
  DefaultLabel: string;
  // Actions
  /** Label for provision button */
  ProvisionLabel: string;
  /** Label for deprovision button */
  DeprovisionLabel: string;
  /** Label for check button */
  CheckLabel: string;

  // State badges
  /** Label for applied state */
  StateAppliedLabel: string;
  /** Label for not applied state */
  StateNotAppliedLabel: string;
  /** Label for unknown state */
  StateUnknownLabel: string;

  // Dialog titles
  /** Title for provisioning dialog */
  ProvisioningDialogTitle: string;
  /** Description for provisioning dialog */
  ProvisioningDialogDescription: string;
  /** Title for deprovisioning dialog */
  DeprovisioningDialogTitle: string;
  /** Description for deprovisioning dialog */
  DeprovisioningDialogDescription: string;

  // Deprovision confirmation (nested)
  /** Title for deprovision confirmation */
  DeprovisionConfirmRunTitle: string;
  /** Message for deprovision confirmation */
  DeprovisionConfirmRunMessage: string;
  /** Label for deprovision confirm button */
  DeprovisionConfirmLabel: string;
  /** Label for deprovision cancel button */
  DeprovisionCancelLabel: string;
}

/** Strings for PropertyPaneSiteSelectorField */
declare interface ISiteSelectorFieldStrings {
  // Default label
  /** Default label for the site selector field when no label is provided */
  DefaultLabel: string;

  // Mode labels
  /** Label for current site option */
  CurrentSiteLabel: string;
  /** Label for hub site option */
  HubSiteLabel: string;
  /** Label when hub site is not available */
  HubNotAvailableLabel: string;
  /** Label for search site option */
  SearchSiteLabel: string;

  // Accessibility
  /** Aria label for selected site group */
  SelectedSiteGroupAriaLabel: string;
  /** Aria label for search sites input */
  SearchSitesAriaLabel: string;
  /** Placeholder for search input */
  SearchPlaceholder: string;

  // Search states
  /** Label shown while searching */
  SearchingLabel: string;
  /** Label for empty search state */
  EmptySearchLabel: string;
  /** Label when no results found */
  NoResultsLabel: string;
}

/** Strings for NavigationGuard hook */
declare interface INavigationGuardStrings {
  /** Warning message shown when user tries to leave during an operation */
  LeavePageWarning: string;
}

/**
 * Root interface containing all localizable strings for provisioning-ui module.
 *
 * Organized by component for maintainability. Each sub-interface contains
 * strings specific to that component or functionality area.
 */
declare interface ISPFxProvisioningUIStrings {
  /** Strings for ConfirmDialog component */
  ConfirmDialog: IConfirmDialogStrings;

  /** Strings for LogPanel component (provisioning mode) */
  LogPanel: ILogPanelStrings;

  /** Strings for LogPanel component (compliance mode) */
  ComplianceLogPanel: IComplianceLogPanelStrings;

  /** Strings for provisioning log entries */
  ProvisioningLogEntry: IProvisioningLogEntryStrings;

  /** Strings for compliance log entries */
  ComplianceLogEntry: IComplianceLogEntryStrings;

  /** Strings for ProvisioningDialog component */
  ProvisioningDialog: IProvisioningDialogStrings;

  /** Strings for PropertyPaneProvisioningField */
  PropertyPaneProvisioningField: IPropertyPaneProvisioningFieldStrings;

  /** Strings for PropertyPaneSiteSelectorField */
  SiteSelectorField: ISiteSelectorFieldStrings;

  /** Strings for NavigationGuard hook */
  NavigationGuard: INavigationGuardStrings;
}

declare module 'SPFxProvisioningUIStrings' {
  const strings: ISPFxProvisioningUIStrings;
  export = strings;
}
