/**
 * Slovak strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Potvrdiť', CancelLabel: 'Zrušiť' },
    LogPanel: { EmptyMessage: 'Nie sú dostupné žiadne denníky' },
    ComplianceLogPanel: { EmptyMessage: 'Nie sú dostupné žiadne výsledky súladu' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Čaká sa', RunningLabel: 'Prebieha', ExecutedLabel: 'Vykonané', FailedLabel: 'Neúspešné', SkippedLabel: 'Preskočené',
      SkipReasonNotFound: 'Nenašlo sa', SkipReasonAlreadyExists: 'Už existuje', SkipReasonNoChanges: 'Žiadne zmeny', SkipReasonMissingPrerequisite: 'Chýba predpoklad', SkipReasonUnsupported: 'Nepodporované',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'V súlade', NonCompliantLabel: 'Nie je v súlade', UnverifiableLabel: 'Neoveriteľné', IgnoredLabel: 'Ignorované', BlockedLabel: 'Blokované',
      PendingLabel: 'Čaká sa', RunningLabel: 'Kontrola', CancelledLabel: 'Zrušené',
      BlockedByPrefix: 'Blokované položkou',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Zriaďovanie', CloseButtonAriaLabel: 'Zavrieť', CloseLabel: 'Zavrieť', BackToProvisioningLabel: 'Späť',
      TargetSiteLabel: 'Cieľová lokalita', TargetSiteMissingTitle: 'Chýba cieľová lokalita', TargetSiteMissingMessage: 'Pred spustením zriaďovania vyberte cieľovú lokalitu vo vlastnostiach Web Part.', ErrorFallbackCode: 'CHYBA',
      TotalLabel: 'Celkom', SuccessLabel: 'Úspech', FailLabel: 'Neúspešné', SkippedLabel: 'Preskočené', PendingLabel: 'Čaká sa', CompletedLabel: 'Dokončené',
      FinalOutcomeSucceededLabel: 'Úspešné', FinalOutcomeFailedLabel: 'Neúspešné', FinalOutcomeCancelledLabel: 'Zrušené', FinalOutcomeRunningLabel: 'Prebieha',
      InitialHelpProvisioningText: 'Pomocou Spustiť začnete zriaďovanie pre cieľovú lokalitu. Počas vykonávania akcií môžete sledovať priebeh a denníky.', InitialHelpComplianceText: 'Pomocou Skontrolovať zobrazíte ukážku problémov so súladom pred použitím zmien.',
      ProvisioningDefaultDescription: 'Spustite zriaďovanie pomocou nakonfigurovaného plánu.', ComplianceDefaultDescription: 'Spustite kontrolu súladu pomocou nakonfigurovaného plánu.',
      ViewLogsLabel: 'Zobraziť denníky', CheckComplianceLabel: 'Skontrolovať', CancelLabel: 'Zrušiť', RunLabel: 'Spustiť',
      ConfirmRunTitle: 'Potvrdiť spustenie', ConfirmRunMessage: 'Naozaj chcete spustiť beh?',
      ComplianceDefaultTitle: 'Súlad', ComplianceHeaderLabel: 'Kontrola súladu', RunCheckLabel: 'Spustiť kontrolu', CancelCheckLabel: 'Zrušiť', CheckingLabel: 'Kontrola súladu...',
      OverallCompliantLabel: 'V súlade', OverallWarningLabel: 'Upozornenie', OverallNonCompliantLabel: 'Nie je v súlade', OverallRunningLabel: 'Prebieha', OverallCancelledLabel: 'Zrušené',
      CheckedLabel: 'Skontrolované', BlockedLabel: 'Blokované', CompliantLabel: 'V súlade', NonCompliantLabel: 'Nie je v súlade', UnverifiableLabel: 'Neoveriteľné', IgnoredLabel: 'Ignorované',
      ComplianceTargetSiteMissingTitle: 'Cieľová lokalita', ComplianceTargetSiteMissingMessage: 'Na spustenie kontroly súladu sa vyžaduje URL cieľovej lokality.', ComplianceErrorFallbackTitle: 'Chyba',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Zriaďovanie šablóny', ProvisionLabel: 'Zriadiť', DeprovisionLabel: 'Zrušiť zriadenie', CheckLabel: 'Skontrolovať',
      StateAppliedLabel: 'Použité', StateNotAppliedLabel: 'Nepoužité', StateUnknownLabel: 'Neznáme',
      ProvisioningDialogTitle: 'Zriaďovanie', ProvisioningDialogDescription: 'Spustite zriaďovanie pomocou nakonfigurovaného plánu.', DeprovisioningDialogTitle: 'Rušenie zriadenia', DeprovisioningDialogDescription: 'Spustite rušenie zriadenia pomocou nakonfigurovaného plánu.',
      DeprovisionConfirmRunTitle: 'Potvrdiť rušenie zriadenia', DeprovisionConfirmRunMessage: 'Naozaj chcete začať rušenie zriadenia?', DeprovisionConfirmLabel: 'Zrušiť zriadenie', DeprovisionCancelLabel: 'Zrušiť',
    },
    SiteSelectorField: {
      DefaultLabel: 'Cieľová lokalita', CurrentSiteLabel: 'Aktuálna lokalita', HubSiteLabel: 'Nadradená centrálna lokalita', HubNotAvailableLabel: 'Nie je dostupné', SearchSiteLabel: 'Vyhľadať lokalitu',
      SelectedSiteGroupAriaLabel: 'Vybratá lokalita', SearchSitesAriaLabel: 'Vyhľadať lokality', SearchPlaceholder: 'Hľadať podľa názvu alebo URL',
      SearchingLabel: 'Vyhľadáva sa', EmptySearchLabel: 'Zadajte text na vyhľadanie', NoResultsLabel: 'Nenašli sa žiadne výsledky',
    },
    NavigationGuard: { LeavePageWarning: 'Prebieha operácia. Ak odídete, preruší sa.' },
  };
});
