/**
 * Icelandic strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Staðfesta',
      CancelLabel: 'Hætta við',
    },

    LogPanel: {
      EmptyMessage: 'Engar færslur tiltækar',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Engar niðurstöður samræmis tiltækar',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Í bið',
      RunningLabel: 'Í gangi',
      ExecutedLabel: 'Keyrt',
      FailedLabel: 'Mistókst',
      SkippedLabel: 'Sleppt',

      SkipReasonNotFound: 'Fannst ekki',
      SkipReasonAlreadyExists: 'Er þegar til',
      SkipReasonNoChanges: 'Engar breytingar',
      SkipReasonMissingPrerequisite: 'Forsenda vantar',
      SkipReasonUnsupported: 'Ekki stutt',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Samræmist',
      NonCompliantLabel: 'Samræmist ekki',
      UnverifiableLabel: 'Ekki hægt að staðfesta',
      IgnoredLabel: 'Hunsað',
      BlockedLabel: 'Lokað',

      PendingLabel: 'Í bið',
      RunningLabel: 'Athugar',
      CancelledLabel: 'Hætt við',

      BlockedByPrefix: 'Lokað af',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Úthlutun',
      CloseButtonAriaLabel: 'Loka',
      CloseLabel: 'Loka',
      BackToProvisioningLabel: 'Til baka',

      TargetSiteLabel: 'Marksíða',
      TargetSiteMissingTitle: 'Marksíðu vantar',
      TargetSiteMissingMessage: 'Veldu marksíðu í eiginleikum web part áður en úthlutun er keyrð.',
      ErrorFallbackCode: 'VILLA',

      TotalLabel: 'Samtals',
      SuccessLabel: 'Tókst',
      FailLabel: 'Mistókst',
      SkippedLabel: 'Sleppt',
      PendingLabel: 'Í bið',
      CompletedLabel: 'Lokið',

      FinalOutcomeSucceededLabel: 'Tókst',
      FinalOutcomeFailedLabel: 'Mistókst',
      FinalOutcomeCancelledLabel: 'Hætt við',
      FinalOutcomeRunningLabel: 'Í gangi',

      InitialHelpProvisioningText: 'Notaðu Keyra til að hefja úthlutun á marksíðunni. Þú getur skoðað framvindu og færslur á meðan aðgerðir keyra.',
      InitialHelpComplianceText: 'Notaðu Athuga til að forskoða samræmisvandamál áður en breytingum er beitt.',

      ProvisioningDefaultDescription: 'Keyra úthlutun með stilltu áætluninni.',
      ComplianceDefaultDescription: 'Keyra samræmisathugun með stilltu áætluninni.',

      ViewLogsLabel: 'Skoða færslur',
      CheckComplianceLabel: 'Athuga',
      CancelLabel: 'Hætta við',
      RunLabel: 'Keyra',

      ConfirmRunTitle: 'Staðfesta keyrslu',
      ConfirmRunMessage: 'Ertu viss um að þú viljir hefja keyrsluna?',

      ComplianceDefaultTitle: 'Samræmi',
      ComplianceHeaderLabel: 'Samræmisathugun',
      RunCheckLabel: 'Keyra athugun',
      CancelCheckLabel: 'Hætta við',
      CheckingLabel: 'Athugar samræmi…',

      OverallCompliantLabel: 'Samræmist',
      OverallWarningLabel: 'Viðvörun',
      OverallNonCompliantLabel: 'Samræmist ekki',
      OverallRunningLabel: 'Í gangi',
      OverallCancelledLabel: 'Hætt við',

      CheckedLabel: 'Athugað',
      BlockedLabel: 'Lokað',
      CompliantLabel: 'Samræmist',
      NonCompliantLabel: 'Samræmist ekki',
      UnverifiableLabel: 'Ekki hægt að staðfesta',
      IgnoredLabel: 'Hunsað',

      ComplianceTargetSiteMissingTitle: 'Marksíða',
      ComplianceTargetSiteMissingMessage: 'URL marksíðu er nauðsynlegt til að keyra samræmisathugunina.',
      ComplianceErrorFallbackTitle: 'Villa',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Úthlutun sniðmáts',
      ProvisionLabel: 'Úthluta',
      DeprovisionLabel: 'Afturkalla úthlutun',
      CheckLabel: 'Athuga',

      StateAppliedLabel: 'Beitt',
      StateNotAppliedLabel: 'Ekki beitt',
      StateUnknownLabel: 'Óþekkt',

      ProvisioningDialogTitle: 'Úthlutun',
      ProvisioningDialogDescription: 'Keyra úthlutun með stilltu áætluninni.',
      DeprovisioningDialogTitle: 'Afturköllun úthlutunar',
      DeprovisioningDialogDescription: 'Keyra afturköllun úthlutunar með stilltu áætluninni.',

      DeprovisionConfirmRunTitle: 'Staðfesta afturköllun úthlutunar',
      DeprovisionConfirmRunMessage: 'Ertu viss um að þú viljir hefja afturköllun úthlutunar?',
      DeprovisionConfirmLabel: 'Afturkalla úthlutun',
      DeprovisionCancelLabel: 'Hætta við',
    },

    SiteSelectorField: {
      DefaultLabel: 'Marksíða',
      CurrentSiteLabel: 'Núverandi síða',
      HubSiteLabel: 'Yfirliggjandi hub-síða',
      HubNotAvailableLabel: 'Ekki tiltækt',
      SearchSiteLabel: 'Leita að síðu',

      SelectedSiteGroupAriaLabel: 'Valin síða',
      SearchSitesAriaLabel: 'Leita að síðum',
      SearchPlaceholder: 'Leita eftir titli eða URL',

      SearchingLabel: 'Leitar',
      EmptySearchLabel: 'Sláðu inn til að leita',
      NoResultsLabel: 'Engar niðurstöður fundust',
    },

    NavigationGuard: {
      LeavePageWarning: 'Aðgerð er í gangi. Ef þú ferð af síðunni verður hún rofin.',
    },
  };
});
