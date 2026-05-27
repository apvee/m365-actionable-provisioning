/**
 * Danish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Bekræft',
      CancelLabel: 'Annuller',
    },

    LogPanel: {
      EmptyMessage: 'Ingen logfiler tilgængelige',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Ingen overholdelsesresultater tilgængelige',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Afventer',
      RunningLabel: 'Kører',
      ExecutedLabel: 'Udført',
      FailedLabel: 'Mislykkedes',
      SkippedLabel: 'Sprunget over',

      SkipReasonNotFound: 'Ikke fundet',
      SkipReasonAlreadyExists: 'Findes allerede',
      SkipReasonNoChanges: 'Ingen ændringer',
      SkipReasonMissingPrerequisite: 'Manglende forudsætning',
      SkipReasonUnsupported: 'Ikke understøttet',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Overholder',
      NonCompliantLabel: 'Overholder ikke',
      UnverifiableLabel: 'Kan ikke verificeres',
      IgnoredLabel: 'Ignoreret',
      BlockedLabel: 'Blokeret',

      PendingLabel: 'Afventer',
      RunningLabel: 'Kontrollerer',
      CancelledLabel: 'Annulleret',

      BlockedByPrefix: 'Blokeret af',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Klargøring',
      CloseButtonAriaLabel: 'Luk',
      CloseLabel: 'Luk',
      BackToProvisioningLabel: 'Tilbage',

      TargetSiteLabel: 'Målwebsted',
      TargetSiteMissingTitle: 'Målwebsted mangler',
      TargetSiteMissingMessage: 'Vælg et målwebsted i webdelens egenskaber, før du kører klargøring.',
      ErrorFallbackCode: 'FEJL',

      TotalLabel: 'Total',
      SuccessLabel: 'Succes',
      FailLabel: 'Fejl',
      SkippedLabel: 'Sprunget over',
      PendingLabel: 'Afventer',
      CompletedLabel: 'Fuldført',

      FinalOutcomeSucceededLabel: 'Lykkedes',
      FinalOutcomeFailedLabel: 'Mislykkedes',
      FinalOutcomeCancelledLabel: 'Annulleret',
      FinalOutcomeRunningLabel: 'Kører',

      InitialHelpProvisioningText: 'Brug Kør for at starte klargøring mod målwebstedet. Du kan gennemgå fremskridt og logfiler, mens handlinger udføres.',
      InitialHelpComplianceText: 'Brug Kontroller for at få vist overholdelsesproblemer, før du anvender ændringer.',

      ProvisioningDefaultDescription: 'Kør klargøring ved hjælp af den konfigurerede plan.',
      ComplianceDefaultDescription: 'Kør overholdelseskontrol ved hjælp af den konfigurerede plan.',

      ViewLogsLabel: 'Vis logfiler',
      CheckComplianceLabel: 'Kontroller',
      CancelLabel: 'Annuller',
      RunLabel: 'Kør',

      ConfirmRunTitle: 'Bekræft kørsel',
      ConfirmRunMessage: 'Er du sikker på, at du vil starte kørslen?',

      ComplianceDefaultTitle: 'Overholdelse',
      ComplianceHeaderLabel: 'Overholdelseskontrol',
      RunCheckLabel: 'Kør kontrol',
      CancelCheckLabel: 'Annuller',
      CheckingLabel: 'Kontrollerer overholdelse…',

      OverallCompliantLabel: 'Overholder',
      OverallWarningLabel: 'Advarsel',
      OverallNonCompliantLabel: 'Overholder ikke',
      OverallRunningLabel: 'Kører',
      OverallCancelledLabel: 'Annulleret',

      CheckedLabel: 'Kontrolleret',
      BlockedLabel: 'Blokeret',
      CompliantLabel: 'Overholder',
      NonCompliantLabel: 'Overholder ikke',
      UnverifiableLabel: 'Kan ikke verificeres',
      IgnoredLabel: 'Ignoreret',

      ComplianceTargetSiteMissingTitle: 'Målwebsted',
      ComplianceTargetSiteMissingMessage: 'En målwebsteds-URL er påkrævet for at køre overholdelseskontrol.',
      ComplianceErrorFallbackTitle: 'Fejl',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Skabelonklargøring',
      ProvisionLabel: 'Klargør',
      DeprovisionLabel: 'Fjern klargøring',
      CheckLabel: 'Kontroller',

      StateAppliedLabel: 'Anvendt',
      StateNotAppliedLabel: 'Ikke anvendt',
      StateUnknownLabel: 'Ukendt',

      ProvisioningDialogTitle: 'Klargøring',
      ProvisioningDialogDescription: 'Kør klargøring ved hjælp af den konfigurerede plan.',
      DeprovisioningDialogTitle: 'Fjern klargøring',
      DeprovisioningDialogDescription: 'Kør fjernelse af klargøring ved hjælp af den konfigurerede plan.',

      DeprovisionConfirmRunTitle: 'Bekræft fjernelse af klargøring',
      DeprovisionConfirmRunMessage: 'Er du sikker på, at du vil starte fjernelse af klargøring?',
      DeprovisionConfirmLabel: 'Fjern klargøring',
      DeprovisionCancelLabel: 'Annuller',
    },

    SiteSelectorField: {
      DefaultLabel: 'Målwebsted',
      CurrentSiteLabel: 'Nuværende websted',
      HubSiteLabel: 'Overordnet hubwebsted',
      HubNotAvailableLabel: 'Ikke tilgængelig',
      SearchSiteLabel: 'Søg websted',

      SelectedSiteGroupAriaLabel: 'Valgt websted',
      SearchSitesAriaLabel: 'Søg websteder',
      SearchPlaceholder: 'Søg efter titel eller URL',

      SearchingLabel: 'Søger',
      EmptySearchLabel: 'Skriv for at søge',
      NoResultsLabel: 'Ingen resultater fundet',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'En operation er i gang. Hvis du forlader siden, vil den blive afbrudt.',
    },
  };
});
