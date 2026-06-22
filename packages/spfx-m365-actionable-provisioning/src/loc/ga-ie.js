/**
 * Irish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Deimhnigh',
      CancelLabel: 'Cealaigh',
    },

    LogPanel: {
      EmptyMessage: 'Níl aon logaí ar fáil',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Níl aon torthaí comhlíontachta ar fáil',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Ar feitheamh',
      RunningLabel: 'Á rith',
      ExecutedLabel: 'Curtha i gcrích',
      FailedLabel: 'Theip',
      SkippedLabel: 'Scipeáilte',

      SkipReasonNotFound: 'Níor aimsíodh',
      SkipReasonAlreadyExists: 'Tá sé ann cheana',
      SkipReasonNoChanges: 'Gan athruithe',
      SkipReasonMissingPrerequisite: 'Réamhriachtanas ar iarraidh',
      SkipReasonUnsupported: 'Gan tacaíocht',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Comhlíontach',
      NonCompliantLabel: 'Neamhchomhlíontach',
      UnverifiableLabel: 'Ní féidir a fhíorú',
      IgnoredLabel: 'Neamhaird tugtha air',
      BlockedLabel: 'Blocáilte',

      PendingLabel: 'Ar feitheamh',
      RunningLabel: 'Á sheiceáil',
      CancelledLabel: 'Cealaithe',

      BlockedByPrefix: 'Blocáilte ag',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Soláthar',
      CloseButtonAriaLabel: 'Dún',
      CloseLabel: 'Dún',
      BackToProvisioningLabel: 'Siar',

      TargetSiteLabel: 'Spriocshuíomh',
      TargetSiteMissingTitle: 'Spriocshuíomh ar iarraidh',
      TargetSiteMissingMessage: 'Roghnaigh spriocshuíomh in airíonna an web part sula rithfidh tú soláthar.',
      ErrorFallbackCode: 'EARRÁID',

      TotalLabel: 'Iomlán',
      SuccessLabel: 'Rath',
      FailLabel: 'Theip',
      SkippedLabel: 'Scipeáilte',
      PendingLabel: 'Ar feitheamh',
      CompletedLabel: 'Críochnaithe',

      FinalOutcomeSucceededLabel: 'D\'éirigh',
      FinalOutcomeFailedLabel: 'Theip',
      FinalOutcomeCancelledLabel: 'Cealaithe',
      FinalOutcomeRunningLabel: 'Á rith',

      InitialHelpProvisioningText: 'Úsáid Rith chun soláthar a thosú i gcoinne an spriocshuíomh. Is féidir leat dul chun cinn agus logaí a athbhreithniú agus gníomhartha á gcur i gcrích.',
      InitialHelpComplianceText: 'Úsáid Seiceáil chun réamhamharc a dhéanamh ar cheisteanna comhlíontachta sula gcuirtear athruithe i bhfeidhm.',

      ProvisioningDefaultDescription: 'Rith soláthar leis an bplean cumraithe.',
      ComplianceDefaultDescription: 'Rith seiceáil comhlíontachta leis an bplean cumraithe.',

      ViewLogsLabel: 'Féach ar logaí',
      CheckComplianceLabel: 'Seiceáil',
      CancelLabel: 'Cealaigh',
      RunLabel: 'Rith',

      ConfirmRunTitle: 'Deimhnigh rith',
      ConfirmRunMessage: 'An bhfuil tú cinnte gur mhaith leat an rith a thosú?',

      ComplianceDefaultTitle: 'Comhlíontacht',
      ComplianceHeaderLabel: 'Seiceáil comhlíontachta',
      RunCheckLabel: 'Rith seiceáil',
      CancelCheckLabel: 'Cealaigh',
      CheckingLabel: 'Comhlíontacht á seiceáil…',

      OverallCompliantLabel: 'Comhlíontach',
      OverallWarningLabel: 'Rabhadh',
      OverallNonCompliantLabel: 'Neamhchomhlíontach',
      OverallRunningLabel: 'Á rith',
      OverallCancelledLabel: 'Cealaithe',

      CheckedLabel: 'Seiceáilte',
      BlockedLabel: 'Blocáilte',
      CompliantLabel: 'Comhlíontach',
      NonCompliantLabel: 'Neamhchomhlíontach',
      UnverifiableLabel: 'Ní féidir a fhíorú',
      IgnoredLabel: 'Neamhaird tugtha air',

      ComplianceTargetSiteMissingTitle: 'Spriocshuíomh',
      ComplianceTargetSiteMissingMessage: 'Tá URL spriocshuíomh ag teastáil chun an seiceáil comhlíontachta a rith.',
      ComplianceErrorFallbackTitle: 'Earráid',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Soláthar teimpléid',
      ProvisionLabel: 'Soláthair',
      DeprovisionLabel: 'Dísholáthair',
      CheckLabel: 'Seiceáil',

      StateAppliedLabel: 'Curtha i bhfeidhm',
      StateNotAppliedLabel: 'Gan cur i bhfeidhm',
      StateUnknownLabel: 'Anaithnid',

      ProvisioningDialogTitle: 'Soláthar',
      ProvisioningDialogDescription: 'Rith soláthar leis an bplean cumraithe.',
      DeprovisioningDialogTitle: 'Dísholáthar',
      DeprovisioningDialogDescription: 'Rith dísholáthar leis an bplean cumraithe.',

      DeprovisionConfirmRunTitle: 'Deimhnigh dísholáthar',
      DeprovisionConfirmRunMessage: 'An bhfuil tú cinnte gur mhaith leat dísholáthar a thosú?',
      DeprovisionConfirmLabel: 'Dísholáthair',
      DeprovisionCancelLabel: 'Cealaigh',
    },

    SiteSelectorField: {
      DefaultLabel: 'Spriocshuíomh',
      CurrentSiteLabel: 'Suíomh reatha',
      HubSiteLabel: 'Máthairshuíomh hub',
      HubNotAvailableLabel: 'Níl ar fáil',
      SearchSiteLabel: 'Cuardaigh suíomh',

      SelectedSiteGroupAriaLabel: 'Suíomh roghnaithe',
      SearchSitesAriaLabel: 'Cuardaigh suíomhanna',
      SearchPlaceholder: 'Cuardaigh de réir teidil nó URL',

      SearchingLabel: 'Á chuardach',
      EmptySearchLabel: 'Clóscríobh chun cuardach',
      NoResultsLabel: 'Níor aimsíodh aon torthaí',
    },

    NavigationGuard: {
      LeavePageWarning: 'Tá oibríocht ar siúl. Má fhágann tú, cuirfear isteach uirthi.',
    },
  };
});
