/**
 * Serbian (Latin, Serbia) strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Potvrdi',
      CancelLabel: 'Otkaži',
    },

    LogPanel: {
      EmptyMessage: 'Nema dostupnih zapisa',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Nema dostupnih rezultata usaglašenosti',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Na čekanju',
      RunningLabel: 'U toku',
      ExecutedLabel: 'Izvršeno',
      FailedLabel: 'Neuspelo',
      SkippedLabel: 'Preskočeno',

      SkipReasonNotFound: 'Nije pronađeno',
      SkipReasonAlreadyExists: 'Već postoji',
      SkipReasonNoChanges: 'Nema promena',
      SkipReasonMissingPrerequisite: 'Nedostaje preduslov',
      SkipReasonUnsupported: 'Nije podržano',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Usaglašeno',
      NonCompliantLabel: 'Neusaglašeno',
      UnverifiableLabel: 'Nije moguće proveriti',
      IgnoredLabel: 'Ignorisano',
      BlockedLabel: 'Blokirano',

      PendingLabel: 'Na čekanju',
      RunningLabel: 'Provera',
      CancelledLabel: 'Otkazano',

      BlockedByPrefix: 'Blokirano od',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Obezbeđivanje',
      CloseButtonAriaLabel: 'Zatvori',
      CloseLabel: 'Zatvori',
      BackToProvisioningLabel: 'Nazad',

      TargetSiteLabel: 'Ciljna lokacija',
      TargetSiteMissingTitle: 'Nedostaje ciljna lokacija',
      TargetSiteMissingMessage: 'Izaberite ciljnu lokaciju u svojstvima web part pre pokretanja obezbeđivanja.',
      ErrorFallbackCode: 'GREŠKA',

      TotalLabel: 'Ukupno',
      SuccessLabel: 'Uspeh',
      FailLabel: 'Neuspelo',
      SkippedLabel: 'Preskočeno',
      PendingLabel: 'Na čekanju',
      CompletedLabel: 'Završeno',

      FinalOutcomeSucceededLabel: 'Uspelo',
      FinalOutcomeFailedLabel: 'Neuspelo',
      FinalOutcomeCancelledLabel: 'Otkazano',
      FinalOutcomeRunningLabel: 'U toku',

      InitialHelpProvisioningText: 'Koristite Pokreni da započnete obezbeđivanje na ciljnoj lokaciji. Možete pregledati napredak i zapise dok se radnje izvršavaju.',
      InitialHelpComplianceText: 'Koristite Proveri da pregledate probleme sa usaglašenošću pre primene promena.',

      ProvisioningDefaultDescription: 'Pokrenite obezbeđivanje koristeći konfigurisani plan.',
      ComplianceDefaultDescription: 'Pokrenite proveru usaglašenosti koristeći konfigurisani plan.',

      ViewLogsLabel: 'Prikaži zapise',
      CheckComplianceLabel: 'Proveri',
      CancelLabel: 'Otkaži',
      RunLabel: 'Pokreni',

      ConfirmRunTitle: 'Potvrdi pokretanje',
      ConfirmRunMessage: 'Da li ste sigurni da želite da započnete pokretanje?',

      ComplianceDefaultTitle: 'Usaglašenost',
      ComplianceHeaderLabel: 'Provera usaglašenosti',
      RunCheckLabel: 'Pokreni proveru',
      CancelCheckLabel: 'Otkaži',
      CheckingLabel: 'Provera usaglašenosti…',

      OverallCompliantLabel: 'Usaglašeno',
      OverallWarningLabel: 'Upozorenje',
      OverallNonCompliantLabel: 'Neusaglašeno',
      OverallRunningLabel: 'U toku',
      OverallCancelledLabel: 'Otkazano',

      CheckedLabel: 'Provereno',
      BlockedLabel: 'Blokirano',
      CompliantLabel: 'Usaglašeno',
      NonCompliantLabel: 'Neusaglašeno',
      UnverifiableLabel: 'Nije moguće proveriti',
      IgnoredLabel: 'Ignorisano',

      ComplianceTargetSiteMissingTitle: 'Ciljna lokacija',
      ComplianceTargetSiteMissingMessage: 'URL ciljne lokacije je potreban za pokretanje provere usaglašenosti.',
      ComplianceErrorFallbackTitle: 'Greška',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Obezbeđivanje predloška',
      ProvisionLabel: 'Obezbedi',
      DeprovisionLabel: 'Ukloni obezbeđivanje',
      CheckLabel: 'Proveri',

      StateAppliedLabel: 'Primenjeno',
      StateNotAppliedLabel: 'Nije primenjeno',
      StateUnknownLabel: 'Nepoznato',

      ProvisioningDialogTitle: 'Obezbeđivanje',
      ProvisioningDialogDescription: 'Pokrenite obezbeđivanje koristeći konfigurisani plan.',
      DeprovisioningDialogTitle: 'Uklanjanje obezbeđivanja',
      DeprovisioningDialogDescription: 'Pokrenite uklanjanje obezbeđivanja koristeći konfigurisani plan.',

      DeprovisionConfirmRunTitle: 'Potvrdi uklanjanje obezbeđivanja',
      DeprovisionConfirmRunMessage: 'Da li ste sigurni da želite da započnete uklanjanje obezbeđivanja?',
      DeprovisionConfirmLabel: 'Ukloni obezbeđivanje',
      DeprovisionCancelLabel: 'Otkaži',
    },

    SiteSelectorField: {
      DefaultLabel: 'Ciljna lokacija',
      CurrentSiteLabel: 'Trenutna lokacija',
      HubSiteLabel: 'Roditeljska hub lokacija',
      HubNotAvailableLabel: 'Nije dostupno',
      SearchSiteLabel: 'Pretraži lokaciju',

      SelectedSiteGroupAriaLabel: 'Izabrana lokacija',
      SearchSitesAriaLabel: 'Pretraži lokacije',
      SearchPlaceholder: 'Pretraži po naslovu ili URL-u',

      SearchingLabel: 'Pretraživanje',
      EmptySearchLabel: 'Unesite tekst za pretragu',
      NoResultsLabel: 'Nema pronađenih rezultata',
    },

    NavigationGuard: {
      LeavePageWarning: 'Operacija je u toku. Ako napustite stranicu, biće prekinuta.',
    },
  };
});
