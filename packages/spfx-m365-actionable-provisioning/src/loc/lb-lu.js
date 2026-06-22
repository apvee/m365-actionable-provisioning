/**
 * Luxembourgish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Confirméieren',
      CancelLabel: 'Ofbriechen',
    },

    LogPanel: {
      EmptyMessage: 'Keng Logbicher verfügbar',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Keng Compliance-Resultater verfügbar',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Waart',
      RunningLabel: 'Leeft',
      ExecutedLabel: 'Ausgefouert',
      FailedLabel: 'Ausgefall',
      SkippedLabel: 'Iwwersprongen',

      SkipReasonNotFound: 'Net fonnt',
      SkipReasonAlreadyExists: 'Existéiert schonn',
      SkipReasonNoChanges: 'Keng Ännerungen',
      SkipReasonMissingPrerequisite: 'Viraussetzung feelt',
      SkipReasonUnsupported: 'Net ënnerstëtzt',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Konform',
      NonCompliantLabel: 'Net konform',
      UnverifiableLabel: 'Net iwwerpréifbar',
      IgnoredLabel: 'Ignoréiert',
      BlockedLabel: 'Blockéiert',

      PendingLabel: 'Waart',
      RunningLabel: 'Iwwerpréift',
      CancelledLabel: 'Ofgebrach',

      BlockedByPrefix: 'Blockéiert vun',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Provisionéierung',
      CloseButtonAriaLabel: 'Zoumaachen',
      CloseLabel: 'Zoumaachen',
      BackToProvisioningLabel: 'Zréck',

      TargetSiteLabel: 'Zilsäit',
      TargetSiteMissingTitle: 'Zilsäit feelt',
      TargetSiteMissingMessage: 'Wielt eng Zilsäit an den Eegeschafte vum web part ier Dir d\'Provisionéierung leeft.',
      ErrorFallbackCode: 'FEELER',

      TotalLabel: 'Total',
      SuccessLabel: 'Erfolleg',
      FailLabel: 'Ausgefall',
      SkippedLabel: 'Iwwersprongen',
      PendingLabel: 'Waart',
      CompletedLabel: 'Fäerdeg',

      FinalOutcomeSucceededLabel: 'Erfollegräich',
      FinalOutcomeFailedLabel: 'Ausgefall',
      FinalOutcomeCancelledLabel: 'Ofgebrach',
      FinalOutcomeRunningLabel: 'Leeft',

      InitialHelpProvisioningText: 'Benotzt Leeft fir d\'Provisionéierung géint d\'Zilsäit ze starten. Dir kënnt de Fortschrëtt an d\'Logbicher iwwerpréiwen, während Aktiounen ausgefouert ginn.',
      InitialHelpComplianceText: 'Benotzt Iwwerpréiwen fir Compliance-Problemer virun der Uwendung vun Ännerungen ze kucken.',

      ProvisioningDefaultDescription: 'Leeft d\'Provisionéierung mam konfiguréiertem Plang.',
      ComplianceDefaultDescription: 'Leeft d\'Compliance-Iwwerpréiwung mam konfiguréiertem Plang.',

      ViewLogsLabel: 'Logbicher weisen',
      CheckComplianceLabel: 'Iwwerpréiwen',
      CancelLabel: 'Ofbriechen',
      RunLabel: 'Leeft',

      ConfirmRunTitle: 'Laf confirméieren',
      ConfirmRunMessage: 'Sidd Dir sécher, datt Dir de Laf starte wëllt?',

      ComplianceDefaultTitle: 'Compliance',
      ComplianceHeaderLabel: 'Compliance-Iwwerpréiwung',
      RunCheckLabel: 'Iwwerpréiwung starten',
      CancelCheckLabel: 'Ofbriechen',
      CheckingLabel: 'Compliance gëtt iwwerpréift…',

      OverallCompliantLabel: 'Konform',
      OverallWarningLabel: 'Warnung',
      OverallNonCompliantLabel: 'Net konform',
      OverallRunningLabel: 'Leeft',
      OverallCancelledLabel: 'Ofgebrach',

      CheckedLabel: 'Iwwerpréift',
      BlockedLabel: 'Blockéiert',
      CompliantLabel: 'Konform',
      NonCompliantLabel: 'Net konform',
      UnverifiableLabel: 'Net iwwerpréifbar',
      IgnoredLabel: 'Ignoréiert',

      ComplianceTargetSiteMissingTitle: 'Zilsäit',
      ComplianceTargetSiteMissingMessage: 'Eng URL vun der Zilsäit ass erfuerderlech fir d\'Compliance-Iwwerpréiwung ze starten.',
      ComplianceErrorFallbackTitle: 'Feeler',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Schabloun-Provisionéierung',
      ProvisionLabel: 'Provisionéieren',
      DeprovisionLabel: 'Deprovisionéieren',
      CheckLabel: 'Iwwerpréiwen',

      StateAppliedLabel: 'Ugewandt',
      StateNotAppliedLabel: 'Net ugewandt',
      StateUnknownLabel: 'Onbekannt',

      ProvisioningDialogTitle: 'Provisionéierung',
      ProvisioningDialogDescription: 'Leeft d\'Provisionéierung mam konfiguréiertem Plang.',
      DeprovisioningDialogTitle: 'Deprovisionéierung',
      DeprovisioningDialogDescription: 'Leeft d\'Deprovisionéierung mam konfiguréiertem Plang.',

      DeprovisionConfirmRunTitle: 'Deprovisionéierung confirméieren',
      DeprovisionConfirmRunMessage: 'Sidd Dir sécher, datt Dir d\'Deprovisionéierung starte wëllt?',
      DeprovisionConfirmLabel: 'Deprovisionéieren',
      DeprovisionCancelLabel: 'Ofbriechen',
    },

    SiteSelectorField: {
      DefaultLabel: 'Zilsäit',
      CurrentSiteLabel: 'Aktuell Säit',
      HubSiteLabel: 'Iwwergeuerdent hub-Säit',
      HubNotAvailableLabel: 'Net verfügbar',
      SearchSiteLabel: 'Säit sichen',

      SelectedSiteGroupAriaLabel: 'Ausgewielte Säit',
      SearchSitesAriaLabel: 'Säite sichen',
      SearchPlaceholder: 'No Titel oder URL sichen',

      SearchingLabel: 'Sicht',
      EmptySearchLabel: 'Tippt fir ze sichen',
      NoResultsLabel: 'Keng Resultater fonnt',
    },

    NavigationGuard: {
      LeavePageWarning: 'Eng Operatioun leeft. Wann Dir fortgitt, gëtt se ënnerbrach.',
    },
  };
});
