/**
 * Norwegian Nynorsk strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Stadfest',
      CancelLabel: 'Avbryt',
    },

    LogPanel: {
      EmptyMessage: 'Ingen loggar tilgjengelege',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Ingen samsvarsresultat tilgjengelege',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Ventande',
      RunningLabel: 'Køyrer',
      ExecutedLabel: 'Utført',
      FailedLabel: 'Mislukka',
      SkippedLabel: 'Hoppa over',

      SkipReasonNotFound: 'Ikkje funne',
      SkipReasonAlreadyExists: 'Finst allereie',
      SkipReasonNoChanges: 'Ingen endringar',
      SkipReasonMissingPrerequisite: 'Manglar føresetnad',
      SkipReasonUnsupported: 'Ikkje støtta',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'I samsvar',
      NonCompliantLabel: 'Ikkje i samsvar',
      UnverifiableLabel: 'Kan ikkje verifiserast',
      IgnoredLabel: 'Ignorert',
      BlockedLabel: 'Blokkert',

      PendingLabel: 'Ventande',
      RunningLabel: 'Kontrollerer',
      CancelledLabel: 'Avbroten',

      BlockedByPrefix: 'Blokkert av',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Klargjering',
      CloseButtonAriaLabel: 'Lukk',
      CloseLabel: 'Lukk',
      BackToProvisioningLabel: 'Tilbake',

      TargetSiteLabel: 'Målnettstad',
      TargetSiteMissingTitle: 'Målnettstad manglar',
      TargetSiteMissingMessage: 'Vel ein målnettstad i eigenskapane for web part før du køyrer klargjering.',
      ErrorFallbackCode: 'FEIL',

      TotalLabel: 'Totalt',
      SuccessLabel: 'Suksess',
      FailLabel: 'Mislukka',
      SkippedLabel: 'Hoppa over',
      PendingLabel: 'Ventande',
      CompletedLabel: 'Fullført',

      FinalOutcomeSucceededLabel: 'Lukka',
      FinalOutcomeFailedLabel: 'Mislukka',
      FinalOutcomeCancelledLabel: 'Avbroten',
      FinalOutcomeRunningLabel: 'Køyrer',

      InitialHelpProvisioningText: 'Bruk Køyr for å starte klargjering mot målnettstaden. Du kan sjå framdrift og loggar medan handlingar blir utførte.',
      InitialHelpComplianceText: 'Bruk Kontroller for å førehandsvise samsvarsproblem før endringar blir brukte.',

      ProvisioningDefaultDescription: 'Køyr klargjering med den konfigurerte planen.',
      ComplianceDefaultDescription: 'Køyr samsvarskontroll med den konfigurerte planen.',

      ViewLogsLabel: 'Vis loggar',
      CheckComplianceLabel: 'Kontroller',
      CancelLabel: 'Avbryt',
      RunLabel: 'Køyr',

      ConfirmRunTitle: 'Stadfest køyring',
      ConfirmRunMessage: 'Er du sikker på at du vil starte køyringa?',

      ComplianceDefaultTitle: 'Samsvar',
      ComplianceHeaderLabel: 'Samsvarskontroll',
      RunCheckLabel: 'Køyr kontroll',
      CancelCheckLabel: 'Avbryt',
      CheckingLabel: 'Kontrollerer samsvar…',

      OverallCompliantLabel: 'I samsvar',
      OverallWarningLabel: 'Åtvaring',
      OverallNonCompliantLabel: 'Ikkje i samsvar',
      OverallRunningLabel: 'Køyrer',
      OverallCancelledLabel: 'Avbroten',

      CheckedLabel: 'Kontrollert',
      BlockedLabel: 'Blokkert',
      CompliantLabel: 'I samsvar',
      NonCompliantLabel: 'Ikkje i samsvar',
      UnverifiableLabel: 'Kan ikkje verifiserast',
      IgnoredLabel: 'Ignorert',

      ComplianceTargetSiteMissingTitle: 'Målnettstad',
      ComplianceTargetSiteMissingMessage: 'Ei URL-adresse til målnettstaden er nødvendig for å køyre samsvarskontrollen.',
      ComplianceErrorFallbackTitle: 'Feil',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Klargjering av mal',
      ProvisionLabel: 'Klargjer',
      DeprovisionLabel: 'Fjern klargjering',
      CheckLabel: 'Kontroller',

      StateAppliedLabel: 'Brukt',
      StateNotAppliedLabel: 'Ikkje brukt',
      StateUnknownLabel: 'Ukjend',

      ProvisioningDialogTitle: 'Klargjering',
      ProvisioningDialogDescription: 'Køyr klargjering med den konfigurerte planen.',
      DeprovisioningDialogTitle: 'Fjerning av klargjering',
      DeprovisioningDialogDescription: 'Køyr fjerning av klargjering med den konfigurerte planen.',

      DeprovisionConfirmRunTitle: 'Stadfest fjerning av klargjering',
      DeprovisionConfirmRunMessage: 'Er du sikker på at du vil starte fjerning av klargjering?',
      DeprovisionConfirmLabel: 'Fjern klargjering',
      DeprovisionCancelLabel: 'Avbryt',
    },

    SiteSelectorField: {
      DefaultLabel: 'Målnettstad',
      CurrentSiteLabel: 'Gjeldande nettstad',
      HubSiteLabel: 'Overordna hub-nettstad',
      HubNotAvailableLabel: 'Ikkje tilgjengeleg',
      SearchSiteLabel: 'Søk etter nettstad',

      SelectedSiteGroupAriaLabel: 'Vald nettstad',
      SearchSitesAriaLabel: 'Søk etter nettstader',
      SearchPlaceholder: 'Søk etter tittel eller URL',

      SearchingLabel: 'Søkjer',
      EmptySearchLabel: 'Skriv for å søkje',
      NoResultsLabel: 'Fann ingen resultat',
    },

    NavigationGuard: {
      LeavePageWarning: 'Ei handling er i gang. Om du forlèt sida, blir ho avbroten.',
    },
  };
});
