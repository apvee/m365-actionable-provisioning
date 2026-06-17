/**
 * Basque strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Berretsi',
      CancelLabel: 'Utzi',
    },

    LogPanel: {
      EmptyMessage: 'Ez dago erregistrorik erabilgarri',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Ez dago betetze-emaitzarik erabilgarri',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Zain',
      RunningLabel: 'Exekutatzen',
      ExecutedLabel: 'Exekutatuta',
      FailedLabel: 'Huts egin du',
      SkippedLabel: 'Saltatuta',

      SkipReasonNotFound: 'Ez da aurkitu',
      SkipReasonAlreadyExists: 'Dagoeneko badago',
      SkipReasonNoChanges: 'Aldaketarik ez',
      SkipReasonMissingPrerequisite: 'Aurrebaldintza falta da',
      SkipReasonUnsupported: 'Ez da onartzen',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Betetzen du',
      NonCompliantLabel: 'Ez du betetzen',
      UnverifiableLabel: 'Ezin da egiaztatu',
      IgnoredLabel: 'Ezikusia eginda',
      BlockedLabel: 'Blokeatuta',

      PendingLabel: 'Zain',
      RunningLabel: 'Egiaztatzen',
      CancelledLabel: 'Bertan behera utzita',

      BlockedByPrefix: 'Honek blokeatuta',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Hornitzea',
      CloseButtonAriaLabel: 'Itxi',
      CloseLabel: 'Itxi',
      BackToProvisioningLabel: 'Atzera',

      TargetSiteLabel: 'Helburuko gunea',
      TargetSiteMissingTitle: 'Helburuko gunea falta da',
      TargetSiteMissingMessage: 'Hautatu helburuko gune bat web-zatiaren propietateetan hornitzea exekutatu aurretik.',
      ErrorFallbackCode: 'ERROREA',

      TotalLabel: 'Guztira',
      SuccessLabel: 'Arrakasta',
      FailLabel: 'Huts egin du',
      SkippedLabel: 'Saltatuta',
      PendingLabel: 'Zain',
      CompletedLabel: 'Osatuta',

      FinalOutcomeSucceededLabel: 'Arrakastatsua',
      FinalOutcomeFailedLabel: 'Huts egin du',
      FinalOutcomeCancelledLabel: 'Bertan behera utzita',
      FinalOutcomeRunningLabel: 'Exekutatzen',

      InitialHelpProvisioningText: 'Erabili Exekutatu helburuko gunean hornitzea hasteko. Aurrerapena eta erregistroak berrikus ditzakezu ekintzak exekutatu ahala.',
      InitialHelpComplianceText: 'Erabili Egiaztatu betetze-arazoak aurrez ikusteko aldaketak aplikatu aurretik.',

      ProvisioningDefaultDescription: 'Exekutatu hornitzea konfiguratutako plana erabiliz.',
      ComplianceDefaultDescription: 'Exekutatu betetze-egiaztapena konfiguratutako plana erabiliz.',

      ViewLogsLabel: 'Ikusi erregistroak',
      CheckComplianceLabel: 'Egiaztatu',
      CancelLabel: 'Utzi',
      RunLabel: 'Exekutatu',

      ConfirmRunTitle: 'Berretsi exekuzioa',
      ConfirmRunMessage: 'Ziur exekuzioa hasi nahi duzula?',

      ComplianceDefaultTitle: 'Betetzea',
      ComplianceHeaderLabel: 'Betetze-egiaztapena',
      RunCheckLabel: 'Exekutatu egiaztapena',
      CancelCheckLabel: 'Utzi',
      CheckingLabel: 'Betetzea egiaztatzen…',

      OverallCompliantLabel: 'Betetzen du',
      OverallWarningLabel: 'Abisua',
      OverallNonCompliantLabel: 'Ez du betetzen',
      OverallRunningLabel: 'Exekutatzen',
      OverallCancelledLabel: 'Bertan behera utzita',

      CheckedLabel: 'Egiaztatuta',
      BlockedLabel: 'Blokeatuta',
      CompliantLabel: 'Betetzen du',
      NonCompliantLabel: 'Ez du betetzen',
      UnverifiableLabel: 'Ezin da egiaztatu',
      IgnoredLabel: 'Ezikusia eginda',

      ComplianceTargetSiteMissingTitle: 'Helburuko gunea',
      ComplianceTargetSiteMissingMessage: 'Helburuko gunearen URLa behar da betetze-egiaztapena exekutatzeko.',
      ComplianceErrorFallbackTitle: 'Errorea',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Txantiloia hornitzea',
      ProvisionLabel: 'Hornitu',
      DeprovisionLabel: 'Deshornitu',
      CheckLabel: 'Egiaztatu',

      StateAppliedLabel: 'Aplikatuta',
      StateNotAppliedLabel: 'Aplikatu gabe',
      StateUnknownLabel: 'Ezezaguna',

      ProvisioningDialogTitle: 'Hornitzea',
      ProvisioningDialogDescription: 'Exekutatu hornitzea konfiguratutako plana erabiliz.',
      DeprovisioningDialogTitle: 'Deshornitzea',
      DeprovisioningDialogDescription: 'Exekutatu deshornitzea konfiguratutako plana erabiliz.',

      DeprovisionConfirmRunTitle: 'Berretsi deshornitzea',
      DeprovisionConfirmRunMessage: 'Ziur deshornitzea hasi nahi duzula?',
      DeprovisionConfirmLabel: 'Deshornitu',
      DeprovisionCancelLabel: 'Utzi',
    },

    SiteSelectorField: {
      DefaultLabel: 'Helburuko gunea',
      CurrentSiteLabel: 'Uneko gunea',
      HubSiteLabel: 'Guraso hub gunea',
      HubNotAvailableLabel: 'Ez dago erabilgarri',
      SearchSiteLabel: 'Bilatu gunea',

      SelectedSiteGroupAriaLabel: 'Hautatutako gunea',
      SearchSitesAriaLabel: 'Bilatu guneak',
      SearchPlaceholder: 'Bilatu izenburuaren edo URLaren arabera',

      SearchingLabel: 'Bilatzen',
      EmptySearchLabel: 'Idatzi bilatzeko',
      NoResultsLabel: 'Ez da emaitzarik aurkitu',
    },

    NavigationGuard: {
      LeavePageWarning: 'Eragiketa bat abian da. Irteten bazara, eten egingo da.',
    },
  };
});
