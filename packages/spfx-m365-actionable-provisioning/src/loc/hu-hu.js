/**
 * Hungarian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Megerősítés',
      CancelLabel: 'Mégse',
    },

    LogPanel: {
      EmptyMessage: 'Nincsenek elérhető naplók',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Nincsenek elérhető megfelelőségi eredmények',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Függőben',
      RunningLabel: 'Fut',
      ExecutedLabel: 'Végrehajtva',
      FailedLabel: 'Sikertelen',
      SkippedLabel: 'Kihagyva',

      SkipReasonNotFound: 'Nem található',
      SkipReasonAlreadyExists: 'Már létezik',
      SkipReasonNoChanges: 'Nincs változás',
      SkipReasonMissingPrerequisite: 'Hiányzó előfeltétel',
      SkipReasonUnsupported: 'Nem támogatott',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Megfelelő',
      NonCompliantLabel: 'Nem megfelelő',
      UnverifiableLabel: 'Nem ellenőrizhető',
      IgnoredLabel: 'Figyelmen kívül hagyva',
      BlockedLabel: 'Letiltva',

      PendingLabel: 'Függőben',
      RunningLabel: 'Ellenőrzés',
      CancelledLabel: 'Megszakítva',

      BlockedByPrefix: 'Letiltotta',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Kiépítés',
      CloseButtonAriaLabel: 'Bezárás',
      CloseLabel: 'Bezárás',
      BackToProvisioningLabel: 'Vissza',

      TargetSiteLabel: 'Célwebhely',
      TargetSiteMissingTitle: 'Hiányzó célwebhely',
      TargetSiteMissingMessage: 'Válasszon célwebhelyet a kijelző tulajdonságaiban a kiépítés futtatása előtt.',
      ErrorFallbackCode: 'HIBA',

      TotalLabel: 'Összesen',
      SuccessLabel: 'Sikeres',
      FailLabel: 'Sikertelen',
      SkippedLabel: 'Kihagyva',
      PendingLabel: 'Függőben',
      CompletedLabel: 'Befejezve',

      FinalOutcomeSucceededLabel: 'Sikeres',
      FinalOutcomeFailedLabel: 'Sikertelen',
      FinalOutcomeCancelledLabel: 'Megszakítva',
      FinalOutcomeRunningLabel: 'Fut',

      InitialHelpProvisioningText: 'A Futtatás gombbal indítsa el a kiépítést a célwebhelyen. A műveletek végrehajtása közben nyomon követheti a folyamatot és a naplókat.',
      InitialHelpComplianceText: 'Az Ellenőrzés gombbal tekintse meg a megfelelőségi problémákat a módosítások alkalmazása előtt.',

      ProvisioningDefaultDescription: 'Futtassa a kiépítést a konfigurált terv használatával.',
      ComplianceDefaultDescription: 'Futtassa a megfelelőségi ellenőrzést a konfigurált terv használatával.',

      ViewLogsLabel: 'Naplók megtekintése',
      CheckComplianceLabel: 'Ellenőrzés',
      CancelLabel: 'Mégse',
      RunLabel: 'Futtatás',

      ConfirmRunTitle: 'Futtatás megerősítése',
      ConfirmRunMessage: 'Biztosan el szeretné indítani a futtatást?',

      ComplianceDefaultTitle: 'Megfelelőség',
      ComplianceHeaderLabel: 'Megfelelőségi ellenőrzés',
      RunCheckLabel: 'Ellenőrzés futtatása',
      CancelCheckLabel: 'Mégse',
      CheckingLabel: 'Megfelelőség ellenőrzése…',

      OverallCompliantLabel: 'Megfelelő',
      OverallWarningLabel: 'Figyelmeztetés',
      OverallNonCompliantLabel: 'Nem megfelelő',
      OverallRunningLabel: 'Fut',
      OverallCancelledLabel: 'Megszakítva',

      CheckedLabel: 'Ellenőrizve',
      BlockedLabel: 'Letiltva',
      CompliantLabel: 'Megfelelő',
      NonCompliantLabel: 'Nem megfelelő',
      UnverifiableLabel: 'Nem ellenőrizhető',
      IgnoredLabel: 'Figyelmen kívül hagyva',

      ComplianceTargetSiteMissingTitle: 'Célwebhely',
      ComplianceTargetSiteMissingMessage: 'A megfelelőségi ellenőrzés futtatásához célwebhely URL szükséges.',
      ComplianceErrorFallbackTitle: 'Hiba',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Sablon kiépítése',
      ProvisionLabel: 'Kiépítés',
      DeprovisionLabel: 'Kiépítés visszavonása',
      CheckLabel: 'Ellenőrzés',

      StateAppliedLabel: 'Alkalmazva',
      StateNotAppliedLabel: 'Nincs alkalmazva',
      StateUnknownLabel: 'Ismeretlen',

      ProvisioningDialogTitle: 'Kiépítés',
      ProvisioningDialogDescription: 'Futtassa a kiépítést a konfigurált terv használatával.',
      DeprovisioningDialogTitle: 'Kiépítés visszavonása',
      DeprovisioningDialogDescription: 'Futtassa a kiépítés visszavonását a konfigurált terv használatával.',

      DeprovisionConfirmRunTitle: 'Kiépítés visszavonásának megerősítése',
      DeprovisionConfirmRunMessage: 'Biztosan el szeretné indítani a kiépítés visszavonását?',
      DeprovisionConfirmLabel: 'Kiépítés visszavonása',
      DeprovisionCancelLabel: 'Mégse',
    },

    SiteSelectorField: {
      DefaultLabel: 'Célwebhely',
      CurrentSiteLabel: 'Jelenlegi webhely',
      HubSiteLabel: 'Szülő központi webhely',
      HubNotAvailableLabel: 'Nem érhető el',
      SearchSiteLabel: 'Webhely keresése',

      SelectedSiteGroupAriaLabel: 'Kiválasztott webhely',
      SearchSitesAriaLabel: 'Webhelyek keresése',
      SearchPlaceholder: 'Keresés cím vagy URL alapján',

      SearchingLabel: 'Keresés',
      EmptySearchLabel: 'Írjon be a kereséshez',
      NoResultsLabel: 'Nincs találat',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Egy művelet van folyamatban. Ha elhagyja az oldalt, megszakad.',
    },
  };
});
