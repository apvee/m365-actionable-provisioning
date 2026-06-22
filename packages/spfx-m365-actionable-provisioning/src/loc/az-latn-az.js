/**
 * Azerbaijani (Latin, Azerbaijan) strings for provisioning-ui module.
 *
 * This file follows SPFx AMD module pattern for localization.
 * To add a new language, create a new file (e.g., it-it.js) with the same structure.
 */
define([], function () {
  return {
    // ConfirmDialog strings
    ConfirmDialog: {
      ConfirmLabel: 'Təsdiqlə',
      CancelLabel: 'Ləğv et',
    },

    // LogPanel strings (provisioning mode)
    LogPanel: {
      EmptyMessage: 'Heç bir jurnal mövcud deyil',
    },

    // LogPanel strings (compliance mode)
    ComplianceLogPanel: {
      EmptyMessage: 'Heç bir uyğunluq nəticəsi mövcud deyil',
    },

    // Provisioning activity entry strings
    ProvisioningActivityEntry: {
      PendingLabel: 'Gözləmədə',
      RunningLabel: 'İcra olunur',
      ExecutedLabel: 'İcra edildi',
      FailedLabel: 'Uğursuz',
      SkippedLabel: 'Keçildi',

      // Skip reason labels
      SkipReasonNotFound: 'Tapılmadı',
      SkipReasonAlreadyExists: 'Artıq mövcuddur',
      SkipReasonNoChanges: 'Dəyişiklik yoxdur',
      SkipReasonMissingPrerequisite: 'İlkin şərt çatışmır',
      SkipReasonUnsupported: 'Dəstəklənmir',
    },

    // Compliance activity entry strings
    ComplianceActivityEntry: {
      CompliantLabel: 'Uyğundur',
      NonCompliantLabel: 'Uyğun deyil',
      UnverifiableLabel: 'Yoxlanıla bilməz',
      IgnoredLabel: 'Nəzərə alınmadı',
      BlockedLabel: 'Bloklandı',

      PendingLabel: 'Gözləmədə',
      RunningLabel: 'Yoxlanılır',
      CancelledLabel: 'Ləğv edildi',

      BlockedByPrefix: 'Bloklayan',
    },

    // ProvisioningDialog strings
    ProvisioningDialog: {
      // Dialog chrome
      DefaultTitle: 'Provisioning',
      CloseButtonAriaLabel: 'Bağla',
      CloseLabel: 'Bağla',
      BackToProvisioningLabel: 'Geri',

      // Target site
      TargetSiteLabel: 'Hədəf sayt',
      TargetSiteMissingTitle: 'Hədəf sayt çatışmır',
      TargetSiteMissingMessage: 'Provisioning işə salınmazdan əvvəl web part xüsusiyyətlərində hədəf sayt seçin.',
      ErrorFallbackCode: 'XƏTA',

      // KPIs
      TotalLabel: 'Cəmi',
      SuccessLabel: 'Uğur',
      FailLabel: 'Uğursuz',
      SkippedLabel: 'Keçildi',
      PendingLabel: 'Gözləmədə',
      CompletedLabel: 'Tamamlandı',

      // Final outcomes
      FinalOutcomeSucceededLabel: 'Uğurlu oldu',
      FinalOutcomeFailedLabel: 'Uğursuz',
      FinalOutcomeCancelledLabel: 'Ləğv edildi',
      FinalOutcomeRunningLabel: 'İcra olunur',

      // Help text
      InitialHelpProvisioningText: 'Hədəf saytda provisioning başlatmaq üçün Run istifadə edin. Əməliyyatlar icra olunarkən gedişatı və jurnalları nəzərdən keçirə bilərsiniz.',
      InitialHelpComplianceText: 'Dəyişiklikləri tətbiq etməzdən əvvəl uyğunluq problemlərinə baxmaq üçün Check istifadə edin.',

      // Default descriptions (for dialog shell)
      ProvisioningDefaultDescription: 'Konfiqurasiya edilmiş plandan istifadə edərək provisioning işə salın.',
      ComplianceDefaultDescription: 'Konfiqurasiya edilmiş plandan istifadə edərək uyğunluq yoxlamasını işə salın.',

      // Actions
      ViewLogsLabel: 'Jurnallara bax',
      CheckComplianceLabel: 'Yoxla',
      CancelLabel: 'Ləğv et',
      RunLabel: 'İşə sal',

      // Confirmation
      ConfirmRunTitle: 'İşə salmanı təsdiqlə',
      ConfirmRunMessage: 'İcra prosesini başlatmaq istədiyinizə əminsiniz?',

      // Compliance mode
      ComplianceDefaultTitle: 'Uyğunluq',
      ComplianceHeaderLabel: 'Uyğunluq yoxlaması',
      RunCheckLabel: 'Yoxlamanı işə sal',
      CancelCheckLabel: 'Ləğv et',
      CheckingLabel: 'Uyğunluq yoxlanılır...',

      // Compliance overall status
      OverallCompliantLabel: 'Uyğundur',
      OverallWarningLabel: 'Xəbərdarlıq',
      OverallNonCompliantLabel: 'Uyğun deyil',
      OverallRunningLabel: 'İcra olunur',
      OverallCancelledLabel: 'Ləğv edildi',

      // Compliance counts
      CheckedLabel: 'Yoxlandı',
      BlockedLabel: 'Bloklandı',
      CompliantLabel: 'Uyğundur',
      NonCompliantLabel: 'Uyğun deyil',
      UnverifiableLabel: 'Yoxlanıla bilməz',
      IgnoredLabel: 'Nəzərə alınmadı',

      // Compliance errors
      ComplianceTargetSiteMissingTitle: 'Hədəf sayt',
      ComplianceTargetSiteMissingMessage: 'Uyğunluq yoxlamasını işə salmaq üçün hədəf sayt URL-i tələb olunur.',
      ComplianceErrorFallbackTitle: 'Xəta',
    },

    // PropertyPaneProvisioningField strings
    PropertyPaneProvisioningField: {
      // Default label
      DefaultLabel: 'Şablon provisioning',

      // Actions
      ProvisionLabel: 'Provision',
      DeprovisionLabel: 'Provisioning-i geri al',
      CheckLabel: 'Yoxla',

      // State badges
      StateAppliedLabel: 'Tətbiq edildi',
      StateNotAppliedLabel: 'Tətbiq edilməyib',
      StateUnknownLabel: 'Naməlum',

      // Dialog titles
      ProvisioningDialogTitle: 'Provisioning',
      ProvisioningDialogDescription: 'Konfiqurasiya edilmiş plandan istifadə edərək provisioning işə salın.',
      DeprovisioningDialogTitle: 'Deprovisioning',
      DeprovisioningDialogDescription: 'Konfiqurasiya edilmiş plandan istifadə edərək deprovisioning işə salın.',

      // Deprovision confirmation
      DeprovisionConfirmRunTitle: 'Deprovisioning-i təsdiqlə',
      DeprovisionConfirmRunMessage: 'Deprovisioning prosesini başlatmaq istədiyinizə əminsiniz?',
      DeprovisionConfirmLabel: 'Deprovision',
      DeprovisionCancelLabel: 'Ləğv et',
    },

    // PropertyPaneSiteSelectorField strings
    SiteSelectorField: {
      // Default label
      DefaultLabel: 'Hədəf sayt',

      // Mode labels
      CurrentSiteLabel: 'Cari sayt',
      HubSiteLabel: 'Ana hub saytı',
      HubNotAvailableLabel: 'Mövcud deyil',
      SearchSiteLabel: 'Sayt axtar',

      // Accessibility
      SelectedSiteGroupAriaLabel: 'Seçilmiş sayt',
      SearchSitesAriaLabel: 'Saytları axtar',
      SearchPlaceholder: 'Başlıq və ya URL üzrə axtar',

      // Search states
      SearchingLabel: 'Axtarılır',
      EmptySearchLabel: 'Axtarmaq üçün yazın',
      NoResultsLabel: 'Nəticə tapılmadı',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Əməliyyat davam edir. Səhifədən çıxsanız, əməliyyat dayandırılacaq.',
    },
  };
});
