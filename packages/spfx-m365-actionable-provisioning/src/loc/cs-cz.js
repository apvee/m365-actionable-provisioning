/**
 * Czech strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Potvrdit', CancelLabel: 'Zrušit' },
    LogPanel: { EmptyMessage: 'Nejsou dostupné žádné protokoly' },
    ComplianceLogPanel: { EmptyMessage: 'Nejsou dostupné žádné výsledky souladu' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Čeká na zpracování', RunningLabel: 'Probíhá', ExecutedLabel: 'Provedeno', FailedLabel: 'Neúspěšné', SkippedLabel: 'Přeskočeno',
      SkipReasonNotFound: 'Nenalezeno', SkipReasonAlreadyExists: 'Již existuje', SkipReasonNoChanges: 'Žádné změny', SkipReasonMissingPrerequisite: 'Chybí předpoklad', SkipReasonUnsupported: 'Nepodporováno',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'V souladu', NonCompliantLabel: 'Není v souladu', UnverifiableLabel: 'Nelze ověřit', IgnoredLabel: 'Ignorováno', BlockedLabel: 'Blokováno',
      PendingLabel: 'Čeká na zpracování', RunningLabel: 'Kontrola', CancelledLabel: 'Zrušeno',
      BlockedByPrefix: 'Blokováno položkou',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Zřizování', CloseButtonAriaLabel: 'Zavřít', CloseLabel: 'Zavřít', BackToProvisioningLabel: 'Zpět',
      TargetSiteLabel: 'Cílový web', TargetSiteMissingTitle: 'Chybí cílový web', TargetSiteMissingMessage: 'Před spuštěním zřizování vyberte cílový web ve vlastnostech Web Part.', ErrorFallbackCode: 'CHYBA',
      TotalLabel: 'Celkem', SuccessLabel: 'Úspěch', FailLabel: 'Neúspěšné', SkippedLabel: 'Přeskočeno', PendingLabel: 'Čeká na zpracování', CompletedLabel: 'Dokončeno',
      FinalOutcomeSucceededLabel: 'Úspěšné', FinalOutcomeFailedLabel: 'Neúspěšné', FinalOutcomeCancelledLabel: 'Zrušeno', FinalOutcomeRunningLabel: 'Probíhá',
      InitialHelpProvisioningText: 'Pomocí Spustit zahájíte zřizování pro cílový web. Během provádění akcí můžete sledovat průběh a protokoly.', InitialHelpComplianceText: 'Pomocí Zkontrolovat zobrazíte náhled problémů se souladem před použitím změn.',
      ProvisioningDefaultDescription: 'Spusťte zřizování pomocí nakonfigurovaného plánu.', ComplianceDefaultDescription: 'Spusťte kontrolu souladu pomocí nakonfigurovaného plánu.',
      ViewLogsLabel: 'Zobrazit protokoly', CheckComplianceLabel: 'Zkontrolovat', CancelLabel: 'Zrušit', RunLabel: 'Spustit',
      ConfirmRunTitle: 'Potvrdit spuštění', ConfirmRunMessage: 'Opravdu chcete spustit běh?',
      ComplianceDefaultTitle: 'Soulad', ComplianceHeaderLabel: 'Kontrola souladu', RunCheckLabel: 'Spustit kontrolu', CancelCheckLabel: 'Zrušit', CheckingLabel: 'Kontrola souladu...',
      OverallCompliantLabel: 'V souladu', OverallWarningLabel: 'Upozornění', OverallNonCompliantLabel: 'Není v souladu', OverallRunningLabel: 'Probíhá', OverallCancelledLabel: 'Zrušeno',
      CheckedLabel: 'Zkontrolováno', BlockedLabel: 'Blokováno', CompliantLabel: 'V souladu', NonCompliantLabel: 'Není v souladu', UnverifiableLabel: 'Nelze ověřit', IgnoredLabel: 'Ignorováno',
      ComplianceTargetSiteMissingTitle: 'Cílový web', ComplianceTargetSiteMissingMessage: 'Ke spuštění kontroly souladu je vyžadována URL cílového webu.', ComplianceErrorFallbackTitle: 'Chyba',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Zřizování šablony', ProvisionLabel: 'Zřídit', DeprovisionLabel: 'Zrušit zřízení', CheckLabel: 'Zkontrolovat',
      StateAppliedLabel: 'Použito', StateNotAppliedLabel: 'Nepoužito', StateUnknownLabel: 'Neznámé',
      ProvisioningDialogTitle: 'Zřizování', ProvisioningDialogDescription: 'Spusťte zřizování pomocí nakonfigurovaného plánu.', DeprovisioningDialogTitle: 'Rušení zřízení', DeprovisioningDialogDescription: 'Spusťte rušení zřízení pomocí nakonfigurovaného plánu.',
      DeprovisionConfirmRunTitle: 'Potvrdit rušení zřízení', DeprovisionConfirmRunMessage: 'Opravdu chcete zahájit rušení zřízení?', DeprovisionConfirmLabel: 'Zrušit zřízení', DeprovisionCancelLabel: 'Zrušit',
    },
    SiteSelectorField: {
      DefaultLabel: 'Cílový web', CurrentSiteLabel: 'Aktuální web', HubSiteLabel: 'Nadřazený centrální web', HubNotAvailableLabel: 'Není dostupné', SearchSiteLabel: 'Vyhledat web',
      SelectedSiteGroupAriaLabel: 'Vybraný web', SearchSitesAriaLabel: 'Vyhledat weby', SearchPlaceholder: 'Hledat podle názvu nebo URL',
      SearchingLabel: 'Vyhledávání', EmptySearchLabel: 'Začněte psát pro vyhledávání', NoResultsLabel: 'Nebyly nalezeny žádné výsledky',
    },
    NavigationGuard: { LeavePageWarning: 'Probíhá operace. Pokud stránku opustíte, bude přerušena.' },
  };
});
