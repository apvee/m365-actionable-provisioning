/**
 * Romanian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Confirmați', CancelLabel: 'Anulați' },
    LogPanel: { EmptyMessage: 'Nu există jurnale disponibile' },
    ComplianceLogPanel: { EmptyMessage: 'Nu există rezultate de conformitate disponibile' },
    ProvisioningActivityEntry: {
      PendingLabel: 'În așteptare', RunningLabel: 'În rulare', ExecutedLabel: 'Executat', FailedLabel: 'Eșuat', SkippedLabel: 'Omis',
      SkipReasonNotFound: 'Nu a fost găsit', SkipReasonAlreadyExists: 'Există deja', SkipReasonNoChanges: 'Nicio modificare', SkipReasonMissingPrerequisite: 'Cerință preliminară lipsă', SkipReasonUnsupported: 'Neacceptat',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Conform', NonCompliantLabel: 'Neconform', UnverifiableLabel: 'Neverificabil', IgnoredLabel: 'Ignorat', BlockedLabel: 'Blocat',
      PendingLabel: 'În așteptare', RunningLabel: 'Se verifică', CancelledLabel: 'Anulat',
      BlockedByPrefix: 'Blocat de',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Aprovizionare', CloseButtonAriaLabel: 'Închideți', CloseLabel: 'Închideți', BackToProvisioningLabel: 'Înapoi',
      TargetSiteLabel: 'Site țintă', TargetSiteMissingTitle: 'Site țintă lipsă', TargetSiteMissingMessage: 'Selectați un site țintă în proprietățile Web Part înainte de a rula aprovizionarea.', ErrorFallbackCode: 'EROARE',
      TotalLabel: 'Total', SuccessLabel: 'Succes', FailLabel: 'Eșuat', SkippedLabel: 'Omis', PendingLabel: 'În așteptare', CompletedLabel: 'Finalizat',
      FinalOutcomeSucceededLabel: 'Reușit', FinalOutcomeFailedLabel: 'Eșuat', FinalOutcomeCancelledLabel: 'Anulat', FinalOutcomeRunningLabel: 'În rulare',
      InitialHelpProvisioningText: 'Utilizați Rulare pentru a începe aprovizionarea pentru site-ul țintă. Puteți examina progresul și jurnalele în timp ce acțiunile se execută.', InitialHelpComplianceText: 'Utilizați Verificare pentru a previzualiza problemele de conformitate înainte de a aplica modificări.',
      ProvisioningDefaultDescription: 'Rulați aprovizionarea folosind planul configurat.', ComplianceDefaultDescription: 'Rulați verificarea conformității folosind planul configurat.',
      ViewLogsLabel: 'Vizualizați jurnalele', CheckComplianceLabel: 'Verificare', CancelLabel: 'Anulați', RunLabel: 'Rulare',
      ConfirmRunTitle: 'Confirmați rularea', ConfirmRunMessage: 'Sigur doriți să începeți rularea?',
      ComplianceDefaultTitle: 'Conformitate', ComplianceHeaderLabel: 'Verificare conformitate', RunCheckLabel: 'Rulați verificarea', CancelCheckLabel: 'Anulați', CheckingLabel: 'Se verifică conformitatea...',
      OverallCompliantLabel: 'Conform', OverallWarningLabel: 'Avertisment', OverallNonCompliantLabel: 'Neconform', OverallRunningLabel: 'În rulare', OverallCancelledLabel: 'Anulat',
      CheckedLabel: 'Verificat', BlockedLabel: 'Blocat', CompliantLabel: 'Conform', NonCompliantLabel: 'Neconform', UnverifiableLabel: 'Neverificabil', IgnoredLabel: 'Ignorat',
      ComplianceTargetSiteMissingTitle: 'Site țintă', ComplianceTargetSiteMissingMessage: 'Este necesară o adresă URL a site-ului țintă pentru a rula verificarea conformității.', ComplianceErrorFallbackTitle: 'Eroare',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Aprovizionare șablon', ProvisionLabel: 'Aprovizionați', DeprovisionLabel: 'Dezaprovisionați', CheckLabel: 'Verificare',
      StateAppliedLabel: 'Aplicat', StateNotAppliedLabel: 'Neaplicat', StateUnknownLabel: 'Necunoscut',
      ProvisioningDialogTitle: 'Aprovizionare', ProvisioningDialogDescription: 'Rulați aprovizionarea folosind planul configurat.', DeprovisioningDialogTitle: 'Dezaprovisionare', DeprovisioningDialogDescription: 'Rulați dezaprovisionarea folosind planul configurat.',
      DeprovisionConfirmRunTitle: 'Confirmați dezaprovisionarea', DeprovisionConfirmRunMessage: 'Sigur doriți să începeți dezaprovisionarea?', DeprovisionConfirmLabel: 'Dezaprovisionați', DeprovisionCancelLabel: 'Anulați',
    },
    SiteSelectorField: {
      DefaultLabel: 'Site țintă', CurrentSiteLabel: 'Site curent', HubSiteLabel: 'Site hub părinte', HubNotAvailableLabel: 'Indisponibil', SearchSiteLabel: 'Căutați site',
      SelectedSiteGroupAriaLabel: 'Site selectat', SearchSitesAriaLabel: 'Căutați site-uri', SearchPlaceholder: 'Căutați după titlu sau URL',
      SearchingLabel: 'Se caută', EmptySearchLabel: 'Tastați pentru a căuta', NoResultsLabel: 'Nu s-au găsit rezultate',
    },
    NavigationGuard: { LeavePageWarning: 'O operațiune este în desfășurare. Dacă plecați, aceasta va fi întreruptă.' },
  };
});
