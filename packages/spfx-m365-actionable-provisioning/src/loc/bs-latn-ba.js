/**
 * Bosnian (Latin) strings for provisioning-ui module.
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
      EmptyMessage: 'Nema dostupnih rezultata usklađenosti',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Na čekanju',
      RunningLabel: 'U toku',
      ExecutedLabel: 'Izvršeno',
      FailedLabel: 'Neuspjelo',
      SkippedLabel: 'Preskočeno',

      SkipReasonNotFound: 'Nije pronađeno',
      SkipReasonAlreadyExists: 'Već postoji',
      SkipReasonNoChanges: 'Nema promjena',
      SkipReasonMissingPrerequisite: 'Nedostaje preduslov',
      SkipReasonUnsupported: 'Nije podržano',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Usklađeno',
      NonCompliantLabel: 'Neusklađeno',
      UnverifiableLabel: 'Nije moguće provjeriti',
      IgnoredLabel: 'Zanemareno',
      BlockedLabel: 'Blokirano',

      PendingLabel: 'Na čekanju',
      RunningLabel: 'Provjeravanje',
      CancelledLabel: 'Otkazano',

      BlockedByPrefix: 'Blokirano od strane',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Dodjeljivanje',
      CloseButtonAriaLabel: 'Zatvori',
      CloseLabel: 'Zatvori',
      BackToProvisioningLabel: 'Nazad',

      TargetSiteLabel: 'Ciljna lokacija',
      TargetSiteMissingTitle: 'Ciljna lokacija nedostaje',
      TargetSiteMissingMessage: 'Odaberite ciljnu lokaciju u svojstvima web-dijela prije pokretanja dodjeljivanja.',
      ErrorFallbackCode: 'GREŠKA',

      TotalLabel: 'Ukupno',
      SuccessLabel: 'Uspjeh',
      FailLabel: 'Neuspjelo',
      SkippedLabel: 'Preskočeno',
      PendingLabel: 'Na čekanju',
      CompletedLabel: 'Završeno',

      FinalOutcomeSucceededLabel: 'Uspjelo',
      FinalOutcomeFailedLabel: 'Neuspjelo',
      FinalOutcomeCancelledLabel: 'Otkazano',
      FinalOutcomeRunningLabel: 'U toku',

      InitialHelpProvisioningText: 'Koristite Pokreni za početak dodjeljivanja na ciljnoj lokaciji. Možete pregledati napredak i zapise dok se radnje izvršavaju.',
      InitialHelpComplianceText: 'Koristite Provjeri za pregled problema s usklađenošću prije primjene promjena.',

      ProvisioningDefaultDescription: 'Pokrenite dodjeljivanje koristeći konfigurisani plan.',
      ComplianceDefaultDescription: 'Pokrenite provjeru usklađenosti koristeći konfigurisani plan.',

      ViewLogsLabel: 'Prikaži zapise',
      CheckComplianceLabel: 'Provjeri',
      CancelLabel: 'Otkaži',
      RunLabel: 'Pokreni',

      ConfirmRunTitle: 'Potvrdi pokretanje',
      ConfirmRunMessage: 'Jeste li sigurni da želite započeti pokretanje?',

      ComplianceDefaultTitle: 'Usklađenost',
      ComplianceHeaderLabel: 'Provjera usklađenosti',
      RunCheckLabel: 'Pokreni provjeru',
      CancelCheckLabel: 'Otkaži',
      CheckingLabel: 'Provjeravanje usklađenosti…',

      OverallCompliantLabel: 'Usklađeno',
      OverallWarningLabel: 'Upozorenje',
      OverallNonCompliantLabel: 'Neusklađeno',
      OverallRunningLabel: 'U toku',
      OverallCancelledLabel: 'Otkazano',

      CheckedLabel: 'Provjereno',
      BlockedLabel: 'Blokirano',
      CompliantLabel: 'Usklađeno',
      NonCompliantLabel: 'Neusklađeno',
      UnverifiableLabel: 'Nije moguće provjeriti',
      IgnoredLabel: 'Zanemareno',

      ComplianceTargetSiteMissingTitle: 'Ciljna lokacija',
      ComplianceTargetSiteMissingMessage: 'URL ciljne lokacije je potreban za pokretanje provjere usklađenosti.',
      ComplianceErrorFallbackTitle: 'Greška',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Dodjeljivanje predloška',
      ProvisionLabel: 'Dodijeli',
      DeprovisionLabel: 'Ukloni dodjelu',
      CheckLabel: 'Provjeri',

      StateAppliedLabel: 'Primijenjeno',
      StateNotAppliedLabel: 'Nije primijenjeno',
      StateUnknownLabel: 'Nepoznato',

      ProvisioningDialogTitle: 'Dodjeljivanje',
      ProvisioningDialogDescription: 'Pokrenite dodjeljivanje koristeći konfigurisani plan.',
      DeprovisioningDialogTitle: 'Uklanjanje dodjele',
      DeprovisioningDialogDescription: 'Pokrenite uklanjanje dodjele koristeći konfigurisani plan.',

      DeprovisionConfirmRunTitle: 'Potvrdi uklanjanje dodjele',
      DeprovisionConfirmRunMessage: 'Jeste li sigurni da želite započeti uklanjanje dodjele?',
      DeprovisionConfirmLabel: 'Ukloni dodjelu',
      DeprovisionCancelLabel: 'Otkaži',
    },

    SiteSelectorField: {
      DefaultLabel: 'Ciljna lokacija',
      CurrentSiteLabel: 'Trenutna lokacija',
      HubSiteLabel: 'Nadređena hub lokacija',
      HubNotAvailableLabel: 'Nije dostupno',
      SearchSiteLabel: 'Pretraži lokaciju',

      SelectedSiteGroupAriaLabel: 'Odabrana lokacija',
      SearchSitesAriaLabel: 'Pretraži lokacije',
      SearchPlaceholder: 'Pretraži po naslovu ili URL-u',

      SearchingLabel: 'Pretraživanje',
      EmptySearchLabel: 'Unesite tekst za pretraživanje',
      NoResultsLabel: 'Nema pronađenih rezultata',
    },

    NavigationGuard: {
      LeavePageWarning: 'Operacija je u toku. Ako napustite stranicu, bit će prekinuta.',
    },
  };
});
