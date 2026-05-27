/**
 * Slovenian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Potrdi',
      CancelLabel: 'Prekliči',
    },

    LogPanel: {
      EmptyMessage: 'Dnevniki niso na voljo',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Rezultati skladnosti niso na voljo',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'V čakanju',
      RunningLabel: 'Se izvaja',
      ExecutedLabel: 'Izvedeno',
      FailedLabel: 'Neuspešno',
      SkippedLabel: 'Preskočeno',

      SkipReasonNotFound: 'Ni najdeno',
      SkipReasonAlreadyExists: 'Že obstaja',
      SkipReasonNoChanges: 'Brez sprememb',
      SkipReasonMissingPrerequisite: 'Manjkajoč predpogoj',
      SkipReasonUnsupported: 'Ni podprto',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Skladno',
      NonCompliantLabel: 'Neskladno',
      UnverifiableLabel: 'Nepreverljivo',
      IgnoredLabel: 'Prezrto',
      BlockedLabel: 'Blokirano',

      PendingLabel: 'V čakanju',
      RunningLabel: 'Preverjanje',
      CancelledLabel: 'Preklicano',

      BlockedByPrefix: 'Blokirano od',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Zagotavljanje',
      CloseButtonAriaLabel: 'Zapri',
      CloseLabel: 'Zapri',
      BackToProvisioningLabel: 'Nazaj',

      TargetSiteLabel: 'Ciljno mesto',
      TargetSiteMissingTitle: 'Ciljno mesto manjka',
      TargetSiteMissingMessage: 'Izberite ciljno mesto v lastnostih spletnega gradnika, preden zaženete zagotavljanje.',
      ErrorFallbackCode: 'NAPAKA',

      TotalLabel: 'Skupaj',
      SuccessLabel: 'Uspešno',
      FailLabel: 'Neuspešno',
      SkippedLabel: 'Preskočeno',
      PendingLabel: 'V čakanju',
      CompletedLabel: 'Dokončano',

      FinalOutcomeSucceededLabel: 'Uspelo',
      FinalOutcomeFailedLabel: 'Neuspelo',
      FinalOutcomeCancelledLabel: 'Preklicano',
      FinalOutcomeRunningLabel: 'Se izvaja',

      InitialHelpProvisioningText: 'Uporabite Zaženi za začetek zagotavljanja na ciljnem mestu. Med izvajanjem dejanj lahko spremljate napredek in dnevnike.',
      InitialHelpComplianceText: 'Uporabite Preveri za predogled težav s skladnostjo pred uveljavitvijo sprememb.',

      ProvisioningDefaultDescription: 'Zaženite zagotavljanje z uporabo konfiguriranega načrta.',
      ComplianceDefaultDescription: 'Zaženite preverjanje skladnosti z uporabo konfiguriranega načrta.',

      ViewLogsLabel: 'Ogled dnevnikov',
      CheckComplianceLabel: 'Preveri',
      CancelLabel: 'Prekliči',
      RunLabel: 'Zaženi',

      ConfirmRunTitle: 'Potrdi zagon',
      ConfirmRunMessage: 'Ali ste prepričani, da želite začeti zagon?',

      ComplianceDefaultTitle: 'Skladnost',
      ComplianceHeaderLabel: 'Preverjanje skladnosti',
      RunCheckLabel: 'Zaženi preverjanje',
      CancelCheckLabel: 'Prekliči',
      CheckingLabel: 'Preverjanje skladnosti…',

      OverallCompliantLabel: 'Skladno',
      OverallWarningLabel: 'Opozorilo',
      OverallNonCompliantLabel: 'Neskladno',
      OverallRunningLabel: 'Se izvaja',
      OverallCancelledLabel: 'Preklicano',

      CheckedLabel: 'Preverjeno',
      BlockedLabel: 'Blokirano',
      CompliantLabel: 'Skladno',
      NonCompliantLabel: 'Neskladno',
      UnverifiableLabel: 'Nepreverljivo',
      IgnoredLabel: 'Prezrto',

      ComplianceTargetSiteMissingTitle: 'Ciljno mesto',
      ComplianceTargetSiteMissingMessage: 'Za zagon preverjanja skladnosti je potreben URL ciljnega mesta.',
      ComplianceErrorFallbackTitle: 'Napaka',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Zagotavljanje predloge',
      ProvisionLabel: 'Zagotovi',
      DeprovisionLabel: 'Odstrani zagotovitev',
      CheckLabel: 'Preveri',

      StateAppliedLabel: 'Uveljavljeno',
      StateNotAppliedLabel: 'Ni uveljavljeno',
      StateUnknownLabel: 'Neznano',

      ProvisioningDialogTitle: 'Zagotavljanje',
      ProvisioningDialogDescription: 'Zaženite zagotavljanje z uporabo konfiguriranega načrta.',
      DeprovisioningDialogTitle: 'Odstranitev zagotovitve',
      DeprovisioningDialogDescription: 'Zaženite odstranitev zagotovitve z uporabo konfiguriranega načrta.',

      DeprovisionConfirmRunTitle: 'Potrdi odstranitev zagotovitve',
      DeprovisionConfirmRunMessage: 'Ali ste prepričani, da želite začeti odstranitev zagotovitve?',
      DeprovisionConfirmLabel: 'Odstrani zagotovitev',
      DeprovisionCancelLabel: 'Prekliči',
    },

    SiteSelectorField: {
      DefaultLabel: 'Ciljno mesto',
      CurrentSiteLabel: 'Trenutno mesto',
      HubSiteLabel: 'Nadrejeno središčno mesto',
      HubNotAvailableLabel: 'Ni na voljo',
      SearchSiteLabel: 'Išči mesto',

      SelectedSiteGroupAriaLabel: 'Izbrano mesto',
      SearchSitesAriaLabel: 'Išči mesta',
      SearchPlaceholder: 'Išči po naslovu ali URL-ju',

      SearchingLabel: 'Iskanje',
      EmptySearchLabel: 'Vnesite za iskanje',
      NoResultsLabel: 'Ni najdenih rezultatov',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Operacija je v teku. Če zapustite stran, bo prekinjena.',
    },
  };
});
