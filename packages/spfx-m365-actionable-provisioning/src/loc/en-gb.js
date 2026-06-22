/**
 * British English strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Confirm', CancelLabel: 'Cancel' },
    LogPanel: { EmptyMessage: 'No logs available' },
    ComplianceLogPanel: { EmptyMessage: 'No compliance results available' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Pending', RunningLabel: 'Running', ExecutedLabel: 'Executed', FailedLabel: 'Failed', SkippedLabel: 'Skipped',
      SkipReasonNotFound: 'Not found', SkipReasonAlreadyExists: 'Already exists', SkipReasonNoChanges: 'No changes', SkipReasonMissingPrerequisite: 'Missing prerequisite', SkipReasonUnsupported: 'Unsupported',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Compliant', NonCompliantLabel: 'Non-compliant', UnverifiableLabel: 'Unverifiable', IgnoredLabel: 'Ignored', BlockedLabel: 'Blocked',
      PendingLabel: 'Pending', RunningLabel: 'Checking', CancelledLabel: 'Cancelled',
      BlockedByPrefix: 'Blocked by',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Provisioning', CloseButtonAriaLabel: 'Close', CloseLabel: 'Close', BackToProvisioningLabel: 'Back',
      TargetSiteLabel: 'Target Site', TargetSiteMissingTitle: 'Target site missing', TargetSiteMissingMessage: 'Select a target site in the web part properties before running provisioning.', ErrorFallbackCode: 'ERROR',
      TotalLabel: 'Total', SuccessLabel: 'Success', FailLabel: 'Failed', SkippedLabel: 'Skipped', PendingLabel: 'Pending', CompletedLabel: 'Completed',
      FinalOutcomeSucceededLabel: 'Succeeded', FinalOutcomeFailedLabel: 'Failed', FinalOutcomeCancelledLabel: 'Cancelled', FinalOutcomeRunningLabel: 'Running',
      InitialHelpProvisioningText: 'Use Run to start provisioning against the target site. You can review progress and logs as actions execute.', InitialHelpComplianceText: 'Use Check to preview compliance issues before applying changes.',
      ProvisioningDefaultDescription: 'Run provisioning using the configured plan.', ComplianceDefaultDescription: 'Run compliance check using the configured plan.',
      ViewLogsLabel: 'View Logs', CheckComplianceLabel: 'Check', CancelLabel: 'Cancel', RunLabel: 'Run',
      ConfirmRunTitle: 'Confirm Run', ConfirmRunMessage: 'Are you sure you want to start the run?',
      ComplianceDefaultTitle: 'Compliance', ComplianceHeaderLabel: 'Compliance check', RunCheckLabel: 'Run check', CancelCheckLabel: 'Cancel', CheckingLabel: 'Checking compliance...',
      OverallCompliantLabel: 'Compliant', OverallWarningLabel: 'Warning', OverallNonCompliantLabel: 'Non-compliant', OverallRunningLabel: 'Running', OverallCancelledLabel: 'Cancelled',
      CheckedLabel: 'Checked', BlockedLabel: 'Blocked', CompliantLabel: 'Compliant', NonCompliantLabel: 'Non-compliant', UnverifiableLabel: 'Unverifiable', IgnoredLabel: 'Ignored',
      ComplianceTargetSiteMissingTitle: 'Target Site', ComplianceTargetSiteMissingMessage: 'A target site URL is required to run the compliance check.', ComplianceErrorFallbackTitle: 'Error',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Template Provisioning', ProvisionLabel: 'Provision', DeprovisionLabel: 'Deprovision', CheckLabel: 'Check',
      StateAppliedLabel: 'Applied', StateNotAppliedLabel: 'Not applied', StateUnknownLabel: 'Unknown',
      ProvisioningDialogTitle: 'Provisioning', ProvisioningDialogDescription: 'Run provisioning using the configured plan.', DeprovisioningDialogTitle: 'Deprovisioning', DeprovisioningDialogDescription: 'Run deprovisioning using the configured plan.',
      DeprovisionConfirmRunTitle: 'Confirm deprovisioning', DeprovisionConfirmRunMessage: 'Are you sure you want to start deprovisioning?', DeprovisionConfirmLabel: 'Deprovision', DeprovisionCancelLabel: 'Cancel',
    },
    SiteSelectorField: {
      DefaultLabel: 'Target Site', CurrentSiteLabel: 'Current site', HubSiteLabel: 'Parent hub site', HubNotAvailableLabel: 'Not available', SearchSiteLabel: 'Search site',
      SelectedSiteGroupAriaLabel: 'Selected Site', SearchSitesAriaLabel: 'Search sites', SearchPlaceholder: 'Search by title or URL',
      SearchingLabel: 'Searching', EmptySearchLabel: 'Type to search', NoResultsLabel: 'No results found',
    },
    NavigationGuard: { LeavePageWarning: 'An operation is in progress. If you leave, it will be interrupted.' },
  };
});
