/**
 * Estonian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Kinnita', CancelLabel: 'Loobu' },
    LogPanel: { EmptyMessage: 'Logisid pole saadaval' },
    ComplianceLogPanel: { EmptyMessage: 'Vastavuse tulemusi pole saadaval' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Ootel', RunningLabel: 'Käimas', ExecutedLabel: 'Käivitatud', FailedLabel: 'Nurjunud', SkippedLabel: 'Vahele jäetud',
      SkipReasonNotFound: 'Ei leitud', SkipReasonAlreadyExists: 'On juba olemas', SkipReasonNoChanges: 'Muudatusi pole', SkipReasonMissingPrerequisite: 'Eeltingimus puudub', SkipReasonUnsupported: 'Pole toetatud',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Vastavuses', NonCompliantLabel: 'Pole vastavuses', UnverifiableLabel: 'Kontrollimatu', IgnoredLabel: 'Eiratud', BlockedLabel: 'Blokeeritud',
      PendingLabel: 'Ootel', RunningLabel: 'Kontrollimine', CancelledLabel: 'Tühistatud',
      BlockedByPrefix: 'Blokeeris',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Ettevalmistus', CloseButtonAriaLabel: 'Sule', CloseLabel: 'Sule', BackToProvisioningLabel: 'Tagasi',
      TargetSiteLabel: 'Sihtsait', TargetSiteMissingTitle: 'Sihtsait puudub', TargetSiteMissingMessage: 'Valige enne ettevalmistuse käivitamist Web Parti atribuutides sihtsait.', ErrorFallbackCode: 'TÕRGE',
      TotalLabel: 'Kokku', SuccessLabel: 'Õnnestus', FailLabel: 'Nurjunud', SkippedLabel: 'Vahele jäetud', PendingLabel: 'Ootel', CompletedLabel: 'Lõpetatud',
      FinalOutcomeSucceededLabel: 'Õnnestus', FinalOutcomeFailedLabel: 'Nurjunud', FinalOutcomeCancelledLabel: 'Tühistatud', FinalOutcomeRunningLabel: 'Käimas',
      InitialHelpProvisioningText: 'Kasutage käsku Käivita, et alustada ettevalmistust sihtsaidil. Toimingute täitmise ajal saate edenemist ja logisid vaadata.', InitialHelpComplianceText: 'Kasutage käsku Kontrolli, et vaadata vastavusprobleeme enne muudatuste rakendamist.',
      ProvisioningDefaultDescription: 'Käivitage ettevalmistus konfigureeritud plaani abil.', ComplianceDefaultDescription: 'Käivitage vastavuskontroll konfigureeritud plaani abil.',
      ViewLogsLabel: 'Kuva logid', CheckComplianceLabel: 'Kontrolli', CancelLabel: 'Loobu', RunLabel: 'Käivita',
      ConfirmRunTitle: 'Kinnita käivitamine', ConfirmRunMessage: 'Kas soovite kindlasti käivitamist alustada?',
      ComplianceDefaultTitle: 'Vastavus', ComplianceHeaderLabel: 'Vastavuskontroll', RunCheckLabel: 'Käivita kontroll', CancelCheckLabel: 'Loobu', CheckingLabel: 'Vastavuse kontrollimine...',
      OverallCompliantLabel: 'Vastavuses', OverallWarningLabel: 'Hoiatus', OverallNonCompliantLabel: 'Pole vastavuses', OverallRunningLabel: 'Käimas', OverallCancelledLabel: 'Tühistatud',
      CheckedLabel: 'Kontrollitud', BlockedLabel: 'Blokeeritud', CompliantLabel: 'Vastavuses', NonCompliantLabel: 'Pole vastavuses', UnverifiableLabel: 'Kontrollimatu', IgnoredLabel: 'Eiratud',
      ComplianceTargetSiteMissingTitle: 'Sihtsait', ComplianceTargetSiteMissingMessage: 'Vastavuskontrolli käivitamiseks on nõutav sihtsaidi URL.', ComplianceErrorFallbackTitle: 'Tõrge',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Malli ettevalmistus', ProvisionLabel: 'Valmista ette', DeprovisionLabel: 'Eemalda ettevalmistus', CheckLabel: 'Kontrolli',
      StateAppliedLabel: 'Rakendatud', StateNotAppliedLabel: 'Pole rakendatud', StateUnknownLabel: 'Tundmatu',
      ProvisioningDialogTitle: 'Ettevalmistus', ProvisioningDialogDescription: 'Käivitage ettevalmistus konfigureeritud plaani abil.', DeprovisioningDialogTitle: 'Ettevalmistuse eemaldamine', DeprovisioningDialogDescription: 'Käivitage ettevalmistuse eemaldamine konfigureeritud plaani abil.',
      DeprovisionConfirmRunTitle: 'Kinnita ettevalmistuse eemaldamine', DeprovisionConfirmRunMessage: 'Kas soovite kindlasti ettevalmistuse eemaldamist alustada?', DeprovisionConfirmLabel: 'Eemalda ettevalmistus', DeprovisionCancelLabel: 'Loobu',
    },
    SiteSelectorField: {
      DefaultLabel: 'Sihtsait', CurrentSiteLabel: 'Praegune sait', HubSiteLabel: 'Ülem hub-sait', HubNotAvailableLabel: 'Pole saadaval', SearchSiteLabel: 'Otsi saiti',
      SelectedSiteGroupAriaLabel: 'Valitud sait', SearchSitesAriaLabel: 'Otsi saite', SearchPlaceholder: 'Otsi pealkirja või URL-i järgi',
      SearchingLabel: 'Otsimine', EmptySearchLabel: 'Otsimiseks tippige', NoResultsLabel: 'Tulemusi ei leitud',
    },
    NavigationGuard: { LeavePageWarning: 'Toiming on pooleli. Kui lahkute, katkestatakse see.' },
  };
});
