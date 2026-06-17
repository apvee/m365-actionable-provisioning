/**
 * Albanian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Konfirmo',
      CancelLabel: 'Anulo',
    },

    LogPanel: {
      EmptyMessage: 'Nuk ka regjistra të disponueshëm',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Nuk ka rezultate përputhshmërie të disponueshme',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Në pritje',
      RunningLabel: 'Në ekzekutim',
      ExecutedLabel: 'Ekzekutuar',
      FailedLabel: 'Dështoi',
      SkippedLabel: 'Anashkaluar',

      SkipReasonNotFound: 'Nuk u gjet',
      SkipReasonAlreadyExists: 'Ekziston tashmë',
      SkipReasonNoChanges: 'Pa ndryshime',
      SkipReasonMissingPrerequisite: 'Mungon parakushti',
      SkipReasonUnsupported: 'Nuk mbështetet',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Në përputhje',
      NonCompliantLabel: 'Jo në përputhje',
      UnverifiableLabel: 'I paverifikueshëm',
      IgnoredLabel: 'Injoruar',
      BlockedLabel: 'Bllokuar',

      PendingLabel: 'Në pritje',
      RunningLabel: 'Po kontrollohet',
      CancelledLabel: 'Anuluar',

      BlockedByPrefix: 'Bllokuar nga',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Provizionim',
      CloseButtonAriaLabel: 'Mbyll',
      CloseLabel: 'Mbyll',
      BackToProvisioningLabel: 'Prapa',

      TargetSiteLabel: 'Sajti i synuar',
      TargetSiteMissingTitle: 'Mungon sajti i synuar',
      TargetSiteMissingMessage: 'Zgjidhni një sajt të synuar në vetitë e web part përpara se të ekzekutoni provizionimin.',
      ErrorFallbackCode: 'GABIM',

      TotalLabel: 'Gjithsej',
      SuccessLabel: 'Sukses',
      FailLabel: 'Dështoi',
      SkippedLabel: 'Anashkaluar',
      PendingLabel: 'Në pritje',
      CompletedLabel: 'Përfunduar',

      FinalOutcomeSucceededLabel: 'Me sukses',
      FinalOutcomeFailedLabel: 'Dështoi',
      FinalOutcomeCancelledLabel: 'Anuluar',
      FinalOutcomeRunningLabel: 'Në ekzekutim',

      InitialHelpProvisioningText: 'Përdorni Ekzekuto për të nisur provizionimin kundrejt sajtit të synuar. Mund të rishikoni progresin dhe regjistrat ndërsa veprimet ekzekutohen.',
      InitialHelpComplianceText: 'Përdorni Kontrollo për të parapamë problemet e përputhshmërisë përpara se të aplikoni ndryshime.',

      ProvisioningDefaultDescription: 'Ekzekutoni provizionimin duke përdorur planin e konfiguruar.',
      ComplianceDefaultDescription: 'Ekzekutoni kontrollin e përputhshmërisë duke përdorur planin e konfiguruar.',

      ViewLogsLabel: 'Shiko regjistrat',
      CheckComplianceLabel: 'Kontrollo',
      CancelLabel: 'Anulo',
      RunLabel: 'Ekzekuto',

      ConfirmRunTitle: 'Konfirmo ekzekutimin',
      ConfirmRunMessage: 'Jeni i sigurt që dëshironi të nisni ekzekutimin?',

      ComplianceDefaultTitle: 'Përputhshmëri',
      ComplianceHeaderLabel: 'Kontroll përputhshmërie',
      RunCheckLabel: 'Ekzekuto kontrollin',
      CancelCheckLabel: 'Anulo',
      CheckingLabel: 'Po kontrollohet përputhshmëria…',

      OverallCompliantLabel: 'Në përputhje',
      OverallWarningLabel: 'Paralajmërim',
      OverallNonCompliantLabel: 'Jo në përputhje',
      OverallRunningLabel: 'Në ekzekutim',
      OverallCancelledLabel: 'Anuluar',

      CheckedLabel: 'Kontrolluar',
      BlockedLabel: 'Bllokuar',
      CompliantLabel: 'Në përputhje',
      NonCompliantLabel: 'Jo në përputhje',
      UnverifiableLabel: 'I paverifikueshëm',
      IgnoredLabel: 'Injoruar',

      ComplianceTargetSiteMissingTitle: 'Sajti i synuar',
      ComplianceTargetSiteMissingMessage: 'Kërkohet URL-ja e sajtit të synuar për të ekzekutuar kontrollin e përputhshmërisë.',
      ComplianceErrorFallbackTitle: 'Gabim',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Provizionim shablloni',
      ProvisionLabel: 'Proviziono',
      DeprovisionLabel: 'Çproviziono',
      CheckLabel: 'Kontrollo',

      StateAppliedLabel: 'Aplikuar',
      StateNotAppliedLabel: 'Nuk është aplikuar',
      StateUnknownLabel: 'I panjohur',

      ProvisioningDialogTitle: 'Provizionim',
      ProvisioningDialogDescription: 'Ekzekutoni provizionimin duke përdorur planin e konfiguruar.',
      DeprovisioningDialogTitle: 'Çprovizionim',
      DeprovisioningDialogDescription: 'Ekzekutoni çprovizionimin duke përdorur planin e konfiguruar.',

      DeprovisionConfirmRunTitle: 'Konfirmo çprovizionimin',
      DeprovisionConfirmRunMessage: 'Jeni i sigurt që dëshironi të nisni çprovizionimin?',
      DeprovisionConfirmLabel: 'Çproviziono',
      DeprovisionCancelLabel: 'Anulo',
    },

    SiteSelectorField: {
      DefaultLabel: 'Sajti i synuar',
      CurrentSiteLabel: 'Sajti aktual',
      HubSiteLabel: 'Sajti hub prind',
      HubNotAvailableLabel: 'Nuk disponohet',
      SearchSiteLabel: 'Kërko sajt',

      SelectedSiteGroupAriaLabel: 'Sajti i zgjedhur',
      SearchSitesAriaLabel: 'Kërko sajte',
      SearchPlaceholder: 'Kërko sipas titullit ose URL-së',

      SearchingLabel: 'Po kërkohet',
      EmptySearchLabel: 'Shkruani për të kërkuar',
      NoResultsLabel: 'Nuk u gjetën rezultate',
    },

    NavigationGuard: {
      LeavePageWarning: 'Një operacion është në progres. Nëse largoheni, ai do të ndërpritet.',
    },
  };
});
