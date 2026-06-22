/**
 * Latvian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Apstiprināt', CancelLabel: 'Atcelt' },
    LogPanel: { EmptyMessage: 'Nav pieejamu žurnālu' },
    ComplianceLogPanel: { EmptyMessage: 'Nav pieejamu atbilstības rezultātu' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Gaida', RunningLabel: 'Darbojas', ExecutedLabel: 'Izpildīts', FailedLabel: 'Neizdevās', SkippedLabel: 'Izlaists',
      SkipReasonNotFound: 'Nav atrasts', SkipReasonAlreadyExists: 'Jau pastāv', SkipReasonNoChanges: 'Nav izmaiņu', SkipReasonMissingPrerequisite: 'Trūkst priekšnosacījuma', SkipReasonUnsupported: 'Netiek atbalstīts',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Atbilst', NonCompliantLabel: 'Neatbilst', UnverifiableLabel: 'Nav pārbaudāms', IgnoredLabel: 'Ignorēts', BlockedLabel: 'Bloķēts',
      PendingLabel: 'Gaida', RunningLabel: 'Pārbaude', CancelledLabel: 'Atcelts',
      BlockedByPrefix: 'Bloķēja',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Nodrošināšana', CloseButtonAriaLabel: 'Aizvērt', CloseLabel: 'Aizvērt', BackToProvisioningLabel: 'Atpakaļ',
      TargetSiteLabel: 'Mērķa vietne', TargetSiteMissingTitle: 'Trūkst mērķa vietnes', TargetSiteMissingMessage: 'Pirms nodrošināšanas palaišanas atlasiet mērķa vietni Web Part rekvizītos.', ErrorFallbackCode: 'KĻŪDA',
      TotalLabel: 'Kopā', SuccessLabel: 'Veiksmīgi', FailLabel: 'Neizdevās', SkippedLabel: 'Izlaists', PendingLabel: 'Gaida', CompletedLabel: 'Pabeigts',
      FinalOutcomeSucceededLabel: 'Izdevās', FinalOutcomeFailedLabel: 'Neizdevās', FinalOutcomeCancelledLabel: 'Atcelts', FinalOutcomeRunningLabel: 'Darbojas',
      InitialHelpProvisioningText: 'Izmantojiet Palaist, lai sāktu nodrošināšanu mērķa vietnei. Darbību izpildes laikā varat pārskatīt progresu un žurnālus.', InitialHelpComplianceText: 'Izmantojiet Pārbaudīt, lai priekšskatītu atbilstības problēmas pirms izmaiņu lietošanas.',
      ProvisioningDefaultDescription: 'Palaidiet nodrošināšanu, izmantojot konfigurēto plānu.', ComplianceDefaultDescription: 'Palaidiet atbilstības pārbaudi, izmantojot konfigurēto plānu.',
      ViewLogsLabel: 'Skatīt žurnālus', CheckComplianceLabel: 'Pārbaudīt', CancelLabel: 'Atcelt', RunLabel: 'Palaist',
      ConfirmRunTitle: 'Apstiprināt palaišanu', ConfirmRunMessage: 'Vai tiešām vēlaties sākt palaišanu?',
      ComplianceDefaultTitle: 'Atbilstība', ComplianceHeaderLabel: 'Atbilstības pārbaude', RunCheckLabel: 'Palaist pārbaudi', CancelCheckLabel: 'Atcelt', CheckingLabel: 'Pārbauda atbilstību...',
      OverallCompliantLabel: 'Atbilst', OverallWarningLabel: 'Brīdinājums', OverallNonCompliantLabel: 'Neatbilst', OverallRunningLabel: 'Darbojas', OverallCancelledLabel: 'Atcelts',
      CheckedLabel: 'Pārbaudīts', BlockedLabel: 'Bloķēts', CompliantLabel: 'Atbilst', NonCompliantLabel: 'Neatbilst', UnverifiableLabel: 'Nav pārbaudāms', IgnoredLabel: 'Ignorēts',
      ComplianceTargetSiteMissingTitle: 'Mērķa vietne', ComplianceTargetSiteMissingMessage: 'Lai palaistu atbilstības pārbaudi, ir nepieciešams mērķa vietnes URL.', ComplianceErrorFallbackTitle: 'Kļūda',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Veidnes nodrošināšana', ProvisionLabel: 'Nodrošināt', DeprovisionLabel: 'Atcelt nodrošināšanu', CheckLabel: 'Pārbaudīt',
      StateAppliedLabel: 'Lietots', StateNotAppliedLabel: 'Nav lietots', StateUnknownLabel: 'Nezināms',
      ProvisioningDialogTitle: 'Nodrošināšana', ProvisioningDialogDescription: 'Palaidiet nodrošināšanu, izmantojot konfigurēto plānu.', DeprovisioningDialogTitle: 'Nodrošināšanas atcelšana', DeprovisioningDialogDescription: 'Palaidiet nodrošināšanas atcelšanu, izmantojot konfigurēto plānu.',
      DeprovisionConfirmRunTitle: 'Apstiprināt nodrošināšanas atcelšanu', DeprovisionConfirmRunMessage: 'Vai tiešām vēlaties sākt nodrošināšanas atcelšanu?', DeprovisionConfirmLabel: 'Atcelt nodrošināšanu', DeprovisionCancelLabel: 'Atcelt',
    },
    SiteSelectorField: {
      DefaultLabel: 'Mērķa vietne', CurrentSiteLabel: 'Pašreizējā vietne', HubSiteLabel: 'Vecākvietnes hub vietne', HubNotAvailableLabel: 'Nav pieejams', SearchSiteLabel: 'Meklēt vietni',
      SelectedSiteGroupAriaLabel: 'Atlasītā vietne', SearchSitesAriaLabel: 'Meklēt vietnes', SearchPlaceholder: 'Meklēt pēc nosaukuma vai URL',
      SearchingLabel: 'Meklēšana', EmptySearchLabel: 'Ierakstiet, lai meklētu', NoResultsLabel: 'Rezultāti nav atrasti',
    },
    NavigationGuard: { LeavePageWarning: 'Notiek operācija. Ja aiziesit, tā tiks pārtraukta.' },
  };
});
