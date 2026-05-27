/**
 * Croatian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Potvrdi',
      CancelLabel: 'Odustani',
    },

    LogPanel: {
      EmptyMessage: 'Nema dostupnih zapisa',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Nema dostupnih rezultata usklađenosti',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Na čekanju',
      RunningLabel: 'U tijeku',
      ExecutedLabel: 'Izvršeno',
      FailedLabel: 'Neuspjelo',
      SkippedLabel: 'Preskočeno',

      SkipReasonNotFound: 'Nije pronađeno',
      SkipReasonAlreadyExists: 'Već postoji',
      SkipReasonNoChanges: 'Nema promjena',
      SkipReasonMissingPrerequisite: 'Nedostaje preduvjet',
      SkipReasonUnsupported: 'Nije podržano',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Usklađeno',
      NonCompliantLabel: 'Neusklađeno',
      UnverifiableLabel: 'Neprovjerljivo',
      IgnoredLabel: 'Zanemareno',
      BlockedLabel: 'Blokirano',

      PendingLabel: 'Na čekanju',
      RunningLabel: 'Provjeravanje',
      CancelledLabel: 'Otkazano',

      BlockedByPrefix: 'Blokirano od',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Dodjeljivanje',
      CloseButtonAriaLabel: 'Zatvori',
      CloseLabel: 'Zatvori',
      BackToProvisioningLabel: 'Natrag',

      TargetSiteLabel: 'Odredišna web-lokacija',
      TargetSiteMissingTitle: 'Nedostaje odredišna web-lokacija',
      TargetSiteMissingMessage: 'Odaberite odredišnu web-lokaciju u svojstvima web-dijela prije pokretanja dodjeljivanja.',
      ErrorFallbackCode: 'GREŠKA',

      TotalLabel: 'Ukupno',
      SuccessLabel: 'Uspješno',
      FailLabel: 'Neuspješno',
      SkippedLabel: 'Preskočeno',
      PendingLabel: 'Na čekanju',
      CompletedLabel: 'Dovršeno',

      FinalOutcomeSucceededLabel: 'Uspjelo',
      FinalOutcomeFailedLabel: 'Neuspjelo',
      FinalOutcomeCancelledLabel: 'Otkazano',
      FinalOutcomeRunningLabel: 'U tijeku',

      InitialHelpProvisioningText: 'Koristite Pokreni za početak dodjeljivanja na odredišnoj web-lokaciji. Možete pratiti napredak i zapise dok se radnje izvršavaju.',
      InitialHelpComplianceText: 'Koristite Provjeri za pregled problema s usklađenošću prije primjene promjena.',

      ProvisioningDefaultDescription: 'Pokrenite dodjeljivanje koristeći konfigurirani plan.',
      ComplianceDefaultDescription: 'Pokrenite provjeru usklađenosti koristeći konfigurirani plan.',

      ViewLogsLabel: 'Pregledaj zapise',
      CheckComplianceLabel: 'Provjeri',
      CancelLabel: 'Odustani',
      RunLabel: 'Pokreni',

      ConfirmRunTitle: 'Potvrdi pokretanje',
      ConfirmRunMessage: 'Jeste li sigurni da želite započeti pokretanje?',

      ComplianceDefaultTitle: 'Usklađenost',
      ComplianceHeaderLabel: 'Provjera usklađenosti',
      RunCheckLabel: 'Pokreni provjeru',
      CancelCheckLabel: 'Odustani',
      CheckingLabel: 'Provjeravanje usklađenosti…',

      OverallCompliantLabel: 'Usklađeno',
      OverallWarningLabel: 'Upozorenje',
      OverallNonCompliantLabel: 'Neusklađeno',
      OverallRunningLabel: 'U tijeku',
      OverallCancelledLabel: 'Otkazano',

      CheckedLabel: 'Provjereno',
      BlockedLabel: 'Blokirano',
      CompliantLabel: 'Usklađeno',
      NonCompliantLabel: 'Neusklađeno',
      UnverifiableLabel: 'Neprovjerljivo',
      IgnoredLabel: 'Zanemareno',

      ComplianceTargetSiteMissingTitle: 'Odredišna web-lokacija',
      ComplianceTargetSiteMissingMessage: 'URL odredišne web-lokacije potreban je za pokretanje provjere usklađenosti.',
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
      ProvisioningDialogDescription: 'Pokrenite dodjeljivanje koristeći konfigurirani plan.',
      DeprovisioningDialogTitle: 'Uklanjanje dodjele',
      DeprovisioningDialogDescription: 'Pokrenite uklanjanje dodjele koristeći konfigurirani plan.',

      DeprovisionConfirmRunTitle: 'Potvrdi uklanjanje dodjele',
      DeprovisionConfirmRunMessage: 'Jeste li sigurni da želite započeti uklanjanje dodjele?',
      DeprovisionConfirmLabel: 'Ukloni dodjelu',
      DeprovisionCancelLabel: 'Odustani',
    },

    SiteSelectorField: {
      DefaultLabel: 'Ciljna web-lokacija',
      CurrentSiteLabel: 'Trenutna web-lokacija',
      HubSiteLabel: 'Nadređena središnja web-lokacija',
      HubNotAvailableLabel: 'Nije dostupno',
      SearchSiteLabel: 'Pretraži web-lokaciju',

      SelectedSiteGroupAriaLabel: 'Odabrana web-lokacija',
      SearchSitesAriaLabel: 'Pretraži web-lokacije',
      SearchPlaceholder: 'Pretraži po naslovu ili URL-u',

      SearchingLabel: 'Pretraživanje',
      EmptySearchLabel: 'Upišite za pretraživanje',
      NoResultsLabel: 'Nema pronađenih rezultata',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Operacija je u tijeku. Ako napustite stranicu, bit će prekinuta.',
    },
  };
});
