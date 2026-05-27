/**
 * Default English strings for provisioning-ui module.
 *
 * This file follows SPFx AMD module pattern for localization.
 * To add a new language, create a new file (e.g., it-it.js) with the same structure.
 */
define([], function () {
  return {
    // ConfirmDialog strings
    ConfirmDialog: {
      ConfirmLabel: 'Confirm',
      CancelLabel: 'Cancel',
    },

    // LogPanel strings (provisioning mode)
    LogPanel: {
      EmptyMessage: 'No logs available',
    },

    // LogPanel strings (compliance mode)
    ComplianceLogPanel: {
      EmptyMessage: 'No compliance results available',
    },

    // Provisioning log entry strings
    ProvisioningLogEntry: {
      PendingLabel: 'Pending',
      RunningLabel: 'Running',
      ExecutedLabel: 'Executed',
      FailedLabel: 'Failed',
      SkippedLabel: 'Skipped',

      // Skip reason labels
      SkipReasonNotFound: 'Not found',
      SkipReasonAlreadyExists: 'Already exists',
      SkipReasonNoChanges: 'No changes',
      SkipReasonMissingPrerequisite: 'Missing prerequisite',
      SkipReasonUnsupported: 'Unsupported',
    },

    // Compliance log entry strings
    ComplianceLogEntry: {
      CompliantLabel: 'Compliant',
      NonCompliantLabel: 'Non-compliant',
      UnverifiableLabel: 'Unverifiable',
      IgnoredLabel: 'Ignored',
      BlockedLabel: 'Blocked',

      PendingLabel: 'Pending',
      RunningLabel: 'Checking',
      CancelledLabel: 'Cancelled',

      BlockedByPrefix: 'Blocked by',
    },

    // ProvisioningDialog strings
    ProvisioningDialog: {
      // Dialog chrome
      DefaultTitle: 'Provisioning',
      CloseButtonAriaLabel: 'Close',
      CloseLabel: 'Close',
      BackToProvisioningLabel: 'Back',

      // Target site
      TargetSiteLabel: 'Target Site',
      TargetSiteMissingTitle: 'Target site missing',
      TargetSiteMissingMessage: 'Select a target site in the web part properties before running provisioning.',
      ErrorFallbackCode: 'ERROR',

      // KPIs
      TotalLabel: 'Total',
      SuccessLabel: 'Success',
      FailLabel: 'Fail',
      SkippedLabel: 'Skipped',
      PendingLabel: 'Pending',
      CompletedLabel: 'Completed',

      // Final outcomes
      FinalOutcomeSucceededLabel: 'Succeeded',
      FinalOutcomeFailedLabel: 'Failed',
      FinalOutcomeCancelledLabel: 'Cancelled',
      FinalOutcomeRunningLabel: 'Running',

      // Help text
      InitialHelpProvisioningText: 'Use Run to start provisioning against the target site. You can review progress and logs as actions execute.',
      InitialHelpComplianceText: 'Use Check to preview compliance issues before applying changes.',

      // Default descriptions (for dialog shell)
      ProvisioningDefaultDescription: 'Run provisioning using the configured plan.',
      ComplianceDefaultDescription: 'Run compliance check using the configured plan.',

      // Actions
      ViewLogsLabel: 'View Logs',
      CheckComplianceLabel: 'Check',
      CancelLabel: 'Cancel',
      RunLabel: 'Run',

      // Confirmation
      ConfirmRunTitle: 'Confirm Run',
      ConfirmRunMessage: 'Are you sure you want to start the run?',

      // Compliance mode
      ComplianceDefaultTitle: 'Compliance',
      ComplianceHeaderLabel: 'Compliance check',
      RunCheckLabel: 'Run check',
      CancelCheckLabel: 'Cancel',
      CheckingLabel: 'Checking compliance…',

      // Compliance overall status
      OverallCompliantLabel: 'Compliant',
      OverallWarningLabel: 'Warning',
      OverallNonCompliantLabel: 'Non-compliant',
      OverallRunningLabel: 'Running',
      OverallCancelledLabel: 'Cancelled',

      // Compliance counts
      CheckedLabel: 'Checked',
      BlockedLabel: 'Blocked',
      CompliantLabel: 'Compliant',
      NonCompliantLabel: 'Non-compliant',
      UnverifiableLabel: 'Unverifiable',
      IgnoredLabel: 'Ignored',

      // Compliance errors
      ComplianceTargetSiteMissingTitle: 'Target Site',
      ComplianceTargetSiteMissingMessage: 'A target site URL is required to run the compliance check.',
      ComplianceErrorFallbackTitle: 'Error',
    },

    // PropertyPaneProvisioningField strings
    PropertyPaneProvisioningField: {
      // Default label
      DefaultLabel: 'Template Provisioning',

      // Actions
      ProvisionLabel: 'Provision',
      DeprovisionLabel: 'Deprovision',
      CheckLabel: 'Check',

      // State badges
      StateAppliedLabel: 'Applied',
      StateNotAppliedLabel: 'Not applied',
      StateUnknownLabel: 'Unknown',

      // Dialog titles
      ProvisioningDialogTitle: 'Provisioning',
      ProvisioningDialogDescription: 'Run provisioning using the configured plan.',
      DeprovisioningDialogTitle: 'Deprovisioning',
      DeprovisioningDialogDescription: 'Run deprovisioning using the configured plan.',

      // Deprovision confirmation
      DeprovisionConfirmRunTitle: 'Confirm deprovisioning',
      DeprovisionConfirmRunMessage: 'Are you sure you want to start deprovisioning?',
      DeprovisionConfirmLabel: 'Deprovision',
      DeprovisionCancelLabel: 'Cancel',
    },

    // PropertyPaneSiteSelectorField strings
    SiteSelectorField: {
      // Default label
      DefaultLabel: 'Target Site',

      // Mode labels
      CurrentSiteLabel: 'Current site',
      HubSiteLabel: 'Parent hub site',
      HubNotAvailableLabel: 'Not available',
      SearchSiteLabel: 'Search site',

      // Accessibility
      SelectedSiteGroupAriaLabel: 'Selected Site',
      SearchSitesAriaLabel: 'Search sites',
      SearchPlaceholder: 'Search by title or URL',

      // Search states
      SearchingLabel: 'Searching',
      EmptySearchLabel: 'Type to search',
      NoResultsLabel: 'No results found',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'An operation is in progress. If you leave, it will be interrupted.',
    },
  };
});
