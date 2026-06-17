/**
 * Welsh strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Cadarnhau',
      CancelLabel: 'Canslo',
    },

    LogPanel: {
      EmptyMessage: 'Dim logiau ar gael',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Dim canlyniadau cydymffurfiaeth ar gael',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Yn aros',
      RunningLabel: 'Yn rhedeg',
      ExecutedLabel: 'Wedi gweithredu',
      FailedLabel: 'Wedi methu',
      SkippedLabel: 'Wedi hepgor',

      SkipReasonNotFound: 'Heb ei ganfod',
      SkipReasonAlreadyExists: 'Eisoes yn bodoli',
      SkipReasonNoChanges: 'Dim newidiadau',
      SkipReasonMissingPrerequisite: 'Rhagofyniad ar goll',
      SkipReasonUnsupported: 'Heb ei gefnogi',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Yn cydymffurfio',
      NonCompliantLabel: 'Ddim yn cydymffurfio',
      UnverifiableLabel: 'Ni ellir gwirio',
      IgnoredLabel: 'Wedi anwybyddu',
      BlockedLabel: 'Wedi blocio',

      PendingLabel: 'Yn aros',
      RunningLabel: 'Yn gwirio',
      CancelledLabel: 'Wedi canslo',

      BlockedByPrefix: 'Wedi blocio gan',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Darparu',
      CloseButtonAriaLabel: 'Cau',
      CloseLabel: 'Cau',
      BackToProvisioningLabel: 'Yn ôl',

      TargetSiteLabel: 'Safle targed',
      TargetSiteMissingTitle: 'Safle targed ar goll',
      TargetSiteMissingMessage: 'Dewiswch safle targed yn briodweddau\'r web part cyn rhedeg darparu.',
      ErrorFallbackCode: 'GWALL',

      TotalLabel: 'Cyfanswm',
      SuccessLabel: 'Llwyddiant',
      FailLabel: 'Wedi methu',
      SkippedLabel: 'Wedi hepgor',
      PendingLabel: 'Yn aros',
      CompletedLabel: 'Wedi cwblhau',

      FinalOutcomeSucceededLabel: 'Wedi llwyddo',
      FinalOutcomeFailedLabel: 'Wedi methu',
      FinalOutcomeCancelledLabel: 'Wedi canslo',
      FinalOutcomeRunningLabel: 'Yn rhedeg',

      InitialHelpProvisioningText: 'Defnyddiwch Rhedeg i ddechrau darparu yn erbyn y safle targed. Gallwch adolygu cynnydd a logiau wrth i gamau gweithredu redeg.',
      InitialHelpComplianceText: 'Defnyddiwch Gwirio i ragweld problemau cydymffurfiaeth cyn cymhwyso newidiadau.',

      ProvisioningDefaultDescription: 'Rhedeg darparu gan ddefnyddio\'r cynllun wedi\'i ffurfweddu.',
      ComplianceDefaultDescription: 'Rhedeg gwiriad cydymffurfiaeth gan ddefnyddio\'r cynllun wedi\'i ffurfweddu.',

      ViewLogsLabel: 'Gweld logiau',
      CheckComplianceLabel: 'Gwirio',
      CancelLabel: 'Canslo',
      RunLabel: 'Rhedeg',

      ConfirmRunTitle: 'Cadarnhau rhedeg',
      ConfirmRunMessage: 'Ydych chi\'n siŵr eich bod am ddechrau\'r rhediad?',

      ComplianceDefaultTitle: 'Cydymffurfiaeth',
      ComplianceHeaderLabel: 'Gwiriad cydymffurfiaeth',
      RunCheckLabel: 'Rhedeg gwiriad',
      CancelCheckLabel: 'Canslo',
      CheckingLabel: 'Yn gwirio cydymffurfiaeth…',

      OverallCompliantLabel: 'Yn cydymffurfio',
      OverallWarningLabel: 'Rhybudd',
      OverallNonCompliantLabel: 'Ddim yn cydymffurfio',
      OverallRunningLabel: 'Yn rhedeg',
      OverallCancelledLabel: 'Wedi canslo',

      CheckedLabel: 'Wedi gwirio',
      BlockedLabel: 'Wedi blocio',
      CompliantLabel: 'Yn cydymffurfio',
      NonCompliantLabel: 'Ddim yn cydymffurfio',
      UnverifiableLabel: 'Ni ellir gwirio',
      IgnoredLabel: 'Wedi anwybyddu',

      ComplianceTargetSiteMissingTitle: 'Safle targed',
      ComplianceTargetSiteMissingMessage: 'Mae angen URL safle targed i redeg y gwiriad cydymffurfiaeth.',
      ComplianceErrorFallbackTitle: 'Gwall',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Darparu templed',
      ProvisionLabel: 'Darparu',
      DeprovisionLabel: 'Dad-ddarparu',
      CheckLabel: 'Gwirio',

      StateAppliedLabel: 'Wedi cymhwyso',
      StateNotAppliedLabel: 'Heb ei gymhwyso',
      StateUnknownLabel: 'Anhysbys',

      ProvisioningDialogTitle: 'Darparu',
      ProvisioningDialogDescription: 'Rhedeg darparu gan ddefnyddio\'r cynllun wedi\'i ffurfweddu.',
      DeprovisioningDialogTitle: 'Dad-ddarparu',
      DeprovisioningDialogDescription: 'Rhedeg dad-ddarparu gan ddefnyddio\'r cynllun wedi\'i ffurfweddu.',

      DeprovisionConfirmRunTitle: 'Cadarnhau dad-ddarparu',
      DeprovisionConfirmRunMessage: 'Ydych chi\'n siŵr eich bod am ddechrau dad-ddarparu?',
      DeprovisionConfirmLabel: 'Dad-ddarparu',
      DeprovisionCancelLabel: 'Canslo',
    },

    SiteSelectorField: {
      DefaultLabel: 'Safle targed',
      CurrentSiteLabel: 'Safle cyfredol',
      HubSiteLabel: 'Prif safle hub',
      HubNotAvailableLabel: 'Ddim ar gael',
      SearchSiteLabel: 'Chwilio safle',

      SelectedSiteGroupAriaLabel: 'Safle wedi\'i ddewis',
      SearchSitesAriaLabel: 'Chwilio safleoedd',
      SearchPlaceholder: 'Chwilio yn ôl teitl neu URL',

      SearchingLabel: 'Yn chwilio',
      EmptySearchLabel: 'Teipiwch i chwilio',
      NoResultsLabel: 'Ni chanfuwyd canlyniadau',
    },

    NavigationGuard: {
      LeavePageWarning: 'Mae gweithred ar y gweill. Os byddwch yn gadael, caiff ei thorri.',
    },
  };
});
