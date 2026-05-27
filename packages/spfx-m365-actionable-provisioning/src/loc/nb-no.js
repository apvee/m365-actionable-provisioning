/**
 * Norwegian (Bokmål) strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Bekreft',
      CancelLabel: 'Avbryt',
    },

    LogPanel: {
      EmptyMessage: 'Ingen logger tilgjengelig',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Ingen samsvarsresultater tilgjengelig',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Venter',
      RunningLabel: 'Kjører',
      ExecutedLabel: 'Utført',
      FailedLabel: 'Mislyktes',
      SkippedLabel: 'Hoppet over',

      SkipReasonNotFound: 'Ikke funnet',
      SkipReasonAlreadyExists: 'Finnes allerede',
      SkipReasonNoChanges: 'Ingen endringer',
      SkipReasonMissingPrerequisite: 'Manglende forutsetning',
      SkipReasonUnsupported: 'Ikke støttet',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Samsvarende',
      NonCompliantLabel: 'Ikke samsvarende',
      UnverifiableLabel: 'Ikke verifiserbar',
      IgnoredLabel: 'Ignorert',
      BlockedLabel: 'Blokkert',

      PendingLabel: 'Venter',
      RunningLabel: 'Kontrollerer',
      CancelledLabel: 'Avbrutt',

      BlockedByPrefix: 'Blokkert av',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Klargjøring',
      CloseButtonAriaLabel: 'Lukk',
      CloseLabel: 'Lukk',
      BackToProvisioningLabel: 'Tilbake',

      TargetSiteLabel: 'Målområde',
      TargetSiteMissingTitle: 'Målområde mangler',
      TargetSiteMissingMessage: 'Velg et målområde i webdelens egenskaper før du kjører klargjøring.',
      ErrorFallbackCode: 'FEIL',

      TotalLabel: 'Totalt',
      SuccessLabel: 'Vellykket',
      FailLabel: 'Mislyktes',
      SkippedLabel: 'Hoppet over',
      PendingLabel: 'Venter',
      CompletedLabel: 'Fullført',

      FinalOutcomeSucceededLabel: 'Vellykket',
      FinalOutcomeFailedLabel: 'Mislyktes',
      FinalOutcomeCancelledLabel: 'Avbrutt',
      FinalOutcomeRunningLabel: 'Kjører',

      InitialHelpProvisioningText: 'Bruk Kjør for å starte klargjøring mot målområdet. Du kan gjennomgå fremdrift og logger mens handlinger utføres.',
      InitialHelpComplianceText: 'Bruk Kontroller for å forhåndsvise samsvarsproblemer før du bruker endringer.',

      ProvisioningDefaultDescription: 'Kjør klargjøring ved hjelp av den konfigurerte planen.',
      ComplianceDefaultDescription: 'Kjør samsvarskontroll ved hjelp av den konfigurerte planen.',

      ViewLogsLabel: 'Vis logger',
      CheckComplianceLabel: 'Kontroller',
      CancelLabel: 'Avbryt',
      RunLabel: 'Kjør',

      ConfirmRunTitle: 'Bekreft kjøring',
      ConfirmRunMessage: 'Er du sikker på at du vil starte kjøringen?',

      ComplianceDefaultTitle: 'Samsvar',
      ComplianceHeaderLabel: 'Samsvarskontroll',
      RunCheckLabel: 'Kjør kontroll',
      CancelCheckLabel: 'Avbryt',
      CheckingLabel: 'Kontrollerer samsvar…',

      OverallCompliantLabel: 'Samsvarende',
      OverallWarningLabel: 'Advarsel',
      OverallNonCompliantLabel: 'Ikke samsvarende',
      OverallRunningLabel: 'Kjører',
      OverallCancelledLabel: 'Avbrutt',

      CheckedLabel: 'Kontrollert',
      BlockedLabel: 'Blokkert',
      CompliantLabel: 'Samsvarende',
      NonCompliantLabel: 'Ikke samsvarende',
      UnverifiableLabel: 'Ikke verifiserbar',
      IgnoredLabel: 'Ignorert',

      ComplianceTargetSiteMissingTitle: 'Målområde',
      ComplianceTargetSiteMissingMessage: 'En målområde-URL er nødvendig for å kjøre samsvarskontroll.',
      ComplianceErrorFallbackTitle: 'Feil',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Malklargjøring',
      ProvisionLabel: 'Klargjør',
      DeprovisionLabel: 'Fjern klargjøring',
      CheckLabel: 'Kontroller',

      StateAppliedLabel: 'Brukt',
      StateNotAppliedLabel: 'Ikke brukt',
      StateUnknownLabel: 'Ukjent',

      ProvisioningDialogTitle: 'Klargjøring',
      ProvisioningDialogDescription: 'Kjør klargjøring ved hjelp av den konfigurerte planen.',
      DeprovisioningDialogTitle: 'Fjern klargjøring',
      DeprovisioningDialogDescription: 'Kjør fjerning av klargjøring ved hjelp av den konfigurerte planen.',

      DeprovisionConfirmRunTitle: 'Bekreft fjerning av klargjøring',
      DeprovisionConfirmRunMessage: 'Er du sikker på at du vil starte fjerning av klargjøring?',
      DeprovisionConfirmLabel: 'Fjern klargjøring',
      DeprovisionCancelLabel: 'Avbryt',
    },

    SiteSelectorField: {
      DefaultLabel: 'Målområde',
      CurrentSiteLabel: 'Gjeldende område',
      HubSiteLabel: 'Overordnet hubområde',
      HubNotAvailableLabel: 'Ikke tilgjengelig',
      SearchSiteLabel: 'Søk etter område',

      SelectedSiteGroupAriaLabel: 'Valgt område',
      SearchSitesAriaLabel: 'Søk etter områder',
      SearchPlaceholder: 'Søk etter tittel eller URL',

      SearchingLabel: 'Søker',
      EmptySearchLabel: 'Skriv for å søke',
      NoResultsLabel: 'Ingen resultater funnet',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'En operasjon pågår. Hvis du forlater siden, vil den bli avbrutt.',
    },
  };
});
