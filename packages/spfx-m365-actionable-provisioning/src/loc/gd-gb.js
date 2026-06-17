/**
 * Scottish Gaelic strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Dearbhaich',
      CancelLabel: 'Sguir dheth',
    },

    LogPanel: {
      EmptyMessage: 'Chan eil logaichean rim faighinn',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Chan eil toraidhean gèillidh rim faighinn',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Ri feitheamh',
      RunningLabel: 'A\' ruith',
      ExecutedLabel: 'Air a chur an gnìomh',
      FailedLabel: 'Dh\'fhàillig',
      SkippedLabel: 'Air a leum seachad',

      SkipReasonNotFound: 'Cha deach a lorg',
      SkipReasonAlreadyExists: 'Tha e ann mu thràth',
      SkipReasonNoChanges: 'Gun atharrachaidhean',
      SkipReasonMissingPrerequisite: 'Ro-riatanas a dhìth',
      SkipReasonUnsupported: 'Gun taic',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'A\' gèilleadh',
      NonCompliantLabel: 'Gun ghèilleadh',
      UnverifiableLabel: 'Cha ghabh a dhearbhadh',
      IgnoredLabel: 'Air a leigeil seachad',
      BlockedLabel: 'Air a bhacadh',

      PendingLabel: 'Ri feitheamh',
      RunningLabel: 'A\' sgrùdadh',
      CancelledLabel: 'Air a chur dheth',

      BlockedByPrefix: 'Air a bhacadh le',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Solarachadh',
      CloseButtonAriaLabel: 'Dùin',
      CloseLabel: 'Dùin',
      BackToProvisioningLabel: 'Air ais',

      TargetSiteLabel: 'Làrach targaid',
      TargetSiteMissingTitle: 'Tha làrach targaid a dhìth',
      TargetSiteMissingMessage: 'Tagh làrach targaid ann an roghainnean a\' web part mus ruith thu solarachadh.',
      ErrorFallbackCode: 'MEARACHD',

      TotalLabel: 'Iomlan',
      SuccessLabel: 'Soirbheachas',
      FailLabel: 'Dh\'fhàillig',
      SkippedLabel: 'Air a leum seachad',
      PendingLabel: 'Ri feitheamh',
      CompletedLabel: 'Crìochnaichte',

      FinalOutcomeSucceededLabel: 'Shoirbhich',
      FinalOutcomeFailedLabel: 'Dh\'fhàillig',
      FinalOutcomeCancelledLabel: 'Air a chur dheth',
      FinalOutcomeRunningLabel: 'A\' ruith',

      InitialHelpProvisioningText: 'Cleachd Ruith gus solarachadh a thòiseachadh an aghaidh na làraich targaid. Faodaidh tu adhartas agus logaichean a sgrùdadh fhad \'s a tha gnìomhan gan cur an gnìomh.',
      InitialHelpComplianceText: 'Cleachd Sgrùdaich gus cùisean gèillidh fhaicinn ro-làimh mus cuir thu atharrachaidhean an sàs.',

      ProvisioningDefaultDescription: 'Ruith solarachadh leis a\' phlana rèitichte.',
      ComplianceDefaultDescription: 'Ruith sgrùdadh gèillidh leis a\' phlana rèitichte.',

      ViewLogsLabel: 'Seall logaichean',
      CheckComplianceLabel: 'Sgrùdaich',
      CancelLabel: 'Sguir dheth',
      RunLabel: 'Ruith',

      ConfirmRunTitle: 'Dearbhaich ruith',
      ConfirmRunMessage: 'A bheil thu cinnteach gu bheil thu airson an ruith a thòiseachadh?',

      ComplianceDefaultTitle: 'Gèilleadh',
      ComplianceHeaderLabel: 'Sgrùdadh gèillidh',
      RunCheckLabel: 'Ruith sgrùdadh',
      CancelCheckLabel: 'Sguir dheth',
      CheckingLabel: 'A\' sgrùdadh gèillidh…',

      OverallCompliantLabel: 'A\' gèilleadh',
      OverallWarningLabel: 'Rabhadh',
      OverallNonCompliantLabel: 'Gun ghèilleadh',
      OverallRunningLabel: 'A\' ruith',
      OverallCancelledLabel: 'Air a chur dheth',

      CheckedLabel: 'Air a sgrùdadh',
      BlockedLabel: 'Air a bhacadh',
      CompliantLabel: 'A\' gèilleadh',
      NonCompliantLabel: 'Gun ghèilleadh',
      UnverifiableLabel: 'Cha ghabh a dhearbhadh',
      IgnoredLabel: 'Air a leigeil seachad',

      ComplianceTargetSiteMissingTitle: 'Làrach targaid',
      ComplianceTargetSiteMissingMessage: 'Tha URL làraich targaid a dhìth gus an sgrùdadh gèillidh a ruith.',
      ComplianceErrorFallbackTitle: 'Mearachd',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Solarachadh teamplaid',
      ProvisionLabel: 'Solaraich',
      DeprovisionLabel: 'Dì-sholaraich',
      CheckLabel: 'Sgrùdaich',

      StateAppliedLabel: 'Air a chur an sàs',
      StateNotAppliedLabel: 'Gun a chur an sàs',
      StateUnknownLabel: 'Neo-aithnichte',

      ProvisioningDialogTitle: 'Solarachadh',
      ProvisioningDialogDescription: 'Ruith solarachadh leis a\' phlana rèitichte.',
      DeprovisioningDialogTitle: 'Dì-sholarachadh',
      DeprovisioningDialogDescription: 'Ruith dì-sholarachadh leis a\' phlana rèitichte.',

      DeprovisionConfirmRunTitle: 'Dearbhaich dì-sholarachadh',
      DeprovisionConfirmRunMessage: 'A bheil thu cinnteach gu bheil thu airson dì-sholarachadh a thòiseachadh?',
      DeprovisionConfirmLabel: 'Dì-sholaraich',
      DeprovisionCancelLabel: 'Sguir dheth',
    },

    SiteSelectorField: {
      DefaultLabel: 'Làrach targaid',
      CurrentSiteLabel: 'Làrach làithreach',
      HubSiteLabel: 'Làrach hub phàrant',
      HubNotAvailableLabel: 'Chan eil ri fhaighinn',
      SearchSiteLabel: 'Lorg làrach',

      SelectedSiteGroupAriaLabel: 'Làrach taghte',
      SearchSitesAriaLabel: 'Lorg làraichean',
      SearchPlaceholder: 'Lorg a rèir tiotail no URL',

      SearchingLabel: 'A\' lorg',
      EmptySearchLabel: 'Sgrìobh gus lorg',
      NoResultsLabel: 'Cha deach toraidhean a lorg',
    },

    NavigationGuard: {
      LeavePageWarning: 'Tha gnìomh a\' dol air adhart. Ma dh\'fhàgas tu, thèid stad a chur air.',
    },
  };
});
