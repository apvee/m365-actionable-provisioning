/**
 * Dutch (Netherlands) strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Bevestigen',
      CancelLabel: 'Annuleren',
    },

    LogPanel: {
      EmptyMessage: 'Geen logboeken beschikbaar',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Geen nalevingsresultaten beschikbaar',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'In behandeling',
      RunningLabel: 'Wordt uitgevoerd',
      ExecutedLabel: 'Uitgevoerd',
      FailedLabel: 'Mislukt',
      SkippedLabel: 'Overgeslagen',

      SkipReasonNotFound: 'Niet gevonden',
      SkipReasonAlreadyExists: 'Bestaat al',
      SkipReasonNoChanges: 'Geen wijzigingen',
      SkipReasonMissingPrerequisite: 'Ontbrekende vereiste',
      SkipReasonUnsupported: 'Niet ondersteund',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Conform',
      NonCompliantLabel: 'Niet-conform',
      UnverifiableLabel: 'Niet verifieerbaar',
      IgnoredLabel: 'Genegeerd',
      BlockedLabel: 'Geblokkeerd',

      PendingLabel: 'In behandeling',
      RunningLabel: 'Wordt gecontroleerd',
      CancelledLabel: 'Geannuleerd',

      BlockedByPrefix: 'Geblokkeerd door',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Inrichting',
      CloseButtonAriaLabel: 'Sluiten',
      CloseLabel: 'Sluiten',
      BackToProvisioningLabel: 'Terug',

      TargetSiteLabel: 'Doelsite',
      TargetSiteMissingTitle: 'Doelsite ontbreekt',
      TargetSiteMissingMessage: 'Selecteer een doelsite in de webonderdeel-eigenschappen voordat u de inrichting uitvoert.',
      ErrorFallbackCode: 'FOUT',

      TotalLabel: 'Totaal',
      SuccessLabel: 'Geslaagd',
      FailLabel: 'Mislukt',
      SkippedLabel: 'Overgeslagen',
      PendingLabel: 'In behandeling',
      CompletedLabel: 'Voltooid',

      FinalOutcomeSucceededLabel: 'Geslaagd',
      FinalOutcomeFailedLabel: 'Mislukt',
      FinalOutcomeCancelledLabel: 'Geannuleerd',
      FinalOutcomeRunningLabel: 'Wordt uitgevoerd',

      InitialHelpProvisioningText: 'Gebruik Uitvoeren om de inrichting op de doelsite te starten. U kunt de voortgang en logboeken bekijken terwijl acties worden uitgevoerd.',
      InitialHelpComplianceText: 'Gebruik Controleren om nalevingsproblemen te bekijken voordat u wijzigingen toepast.',

      ProvisioningDefaultDescription: 'Voer de inrichting uit met behulp van het geconfigureerde plan.',
      ComplianceDefaultDescription: 'Voer de nalevingscontrole uit met behulp van het geconfigureerde plan.',

      ViewLogsLabel: 'Logboeken bekijken',
      CheckComplianceLabel: 'Controleren',
      CancelLabel: 'Annuleren',
      RunLabel: 'Uitvoeren',

      ConfirmRunTitle: 'Uitvoering bevestigen',
      ConfirmRunMessage: 'Weet u zeker dat u de uitvoering wilt starten?',

      ComplianceDefaultTitle: 'Naleving',
      ComplianceHeaderLabel: 'Nalevingscontrole',
      RunCheckLabel: 'Controle uitvoeren',
      CancelCheckLabel: 'Annuleren',
      CheckingLabel: 'Naleving wordt gecontroleerd…',

      OverallCompliantLabel: 'Conform',
      OverallWarningLabel: 'Waarschuwing',
      OverallNonCompliantLabel: 'Niet-conform',
      OverallRunningLabel: 'Wordt uitgevoerd',
      OverallCancelledLabel: 'Geannuleerd',

      CheckedLabel: 'Gecontroleerd',
      BlockedLabel: 'Geblokkeerd',
      CompliantLabel: 'Conform',
      NonCompliantLabel: 'Niet-conform',
      UnverifiableLabel: 'Niet verifieerbaar',
      IgnoredLabel: 'Genegeerd',

      ComplianceTargetSiteMissingTitle: 'Doelsite',
      ComplianceTargetSiteMissingMessage: 'Een doelsite-URL is vereist om de nalevingscontrole uit te voeren.',
      ComplianceErrorFallbackTitle: 'Fout',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Sjablooninrichting',
      ProvisionLabel: 'Inrichten',
      DeprovisionLabel: 'Inrichting ongedaan maken',
      CheckLabel: 'Controleren',

      StateAppliedLabel: 'Toegepast',
      StateNotAppliedLabel: 'Niet toegepast',
      StateUnknownLabel: 'Onbekend',

      ProvisioningDialogTitle: 'Inrichting',
      ProvisioningDialogDescription: 'Voer de inrichting uit met behulp van het geconfigureerde plan.',
      DeprovisioningDialogTitle: 'Inrichting ongedaan maken',
      DeprovisioningDialogDescription: 'Voer het ongedaan maken van de inrichting uit met behulp van het geconfigureerde plan.',

      DeprovisionConfirmRunTitle: 'Ongedaan maken van inrichting bevestigen',
      DeprovisionConfirmRunMessage: 'Weet u zeker dat u het ongedaan maken van de inrichting wilt starten?',
      DeprovisionConfirmLabel: 'Inrichting ongedaan maken',
      DeprovisionCancelLabel: 'Annuleren',
    },

    SiteSelectorField: {
      DefaultLabel: 'Doelsite',
      CurrentSiteLabel: 'Huidige site',
      HubSiteLabel: 'Bovenliggende hubsite',
      HubNotAvailableLabel: 'Niet beschikbaar',
      SearchSiteLabel: 'Site zoeken',

      SelectedSiteGroupAriaLabel: 'Geselecteerde site',
      SearchSitesAriaLabel: 'Sites zoeken',
      SearchPlaceholder: 'Zoeken op titel of URL',

      SearchingLabel: 'Zoeken',
      EmptySearchLabel: 'Typ om te zoeken',
      NoResultsLabel: 'Geen resultaten gevonden',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Er is een bewerking bezig. Als u de pagina verlaat, wordt deze onderbroken.',
    },
  };
});
