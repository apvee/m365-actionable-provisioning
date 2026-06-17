/**
 * Turkish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Onayla', CancelLabel: 'İptal' },
    LogPanel: { EmptyMessage: 'Kullanılabilir günlük yok' },
    ComplianceLogPanel: { EmptyMessage: 'Kullanılabilir uyumluluk sonucu yok' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Beklemede', RunningLabel: 'Çalışıyor', ExecutedLabel: 'Yürütüldü', FailedLabel: 'Başarısız', SkippedLabel: 'Atlandı',
      SkipReasonNotFound: 'Bulunamadı', SkipReasonAlreadyExists: 'Zaten var', SkipReasonNoChanges: 'Değişiklik yok', SkipReasonMissingPrerequisite: 'Ön koşul eksik', SkipReasonUnsupported: 'Desteklenmiyor',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Uyumlu', NonCompliantLabel: 'Uyumlu değil', UnverifiableLabel: 'Doğrulanamaz', IgnoredLabel: 'Yoksayıldı', BlockedLabel: 'Engellendi',
      PendingLabel: 'Beklemede', RunningLabel: 'Denetleniyor', CancelledLabel: 'İptal edildi',
      BlockedByPrefix: 'Engelleyen',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Sağlama', CloseButtonAriaLabel: 'Kapat', CloseLabel: 'Kapat', BackToProvisioningLabel: 'Geri',
      TargetSiteLabel: 'Hedef Site', TargetSiteMissingTitle: 'Hedef site eksik', TargetSiteMissingMessage: 'Sağlamayı çalıştırmadan önce Web Part özelliklerinde bir hedef site seçin.', ErrorFallbackCode: 'HATA',
      TotalLabel: 'Toplam', SuccessLabel: 'Başarı', FailLabel: 'Başarısız', SkippedLabel: 'Atlandı', PendingLabel: 'Beklemede', CompletedLabel: 'Tamamlandı',
      FinalOutcomeSucceededLabel: 'Başarılı', FinalOutcomeFailedLabel: 'Başarısız', FinalOutcomeCancelledLabel: 'İptal edildi', FinalOutcomeRunningLabel: 'Çalışıyor',
      InitialHelpProvisioningText: 'Hedef siteye karşı sağlamayı başlatmak için Çalıştır seçeneğini kullanın. Eylemler yürütülürken ilerlemeyi ve günlükleri inceleyebilirsiniz.', InitialHelpComplianceText: 'Değişiklikleri uygulamadan önce uyumluluk sorunlarını önizlemek için Denetle seçeneğini kullanın.',
      ProvisioningDefaultDescription: 'Yapılandırılmış planı kullanarak sağlamayı çalıştırın.', ComplianceDefaultDescription: 'Yapılandırılmış planı kullanarak uyumluluk denetimini çalıştırın.',
      ViewLogsLabel: 'Günlükleri Görüntüle', CheckComplianceLabel: 'Denetle', CancelLabel: 'İptal', RunLabel: 'Çalıştır',
      ConfirmRunTitle: 'Çalıştırmayı Onayla', ConfirmRunMessage: 'Çalıştırmayı başlatmak istediğinizden emin misiniz?',
      ComplianceDefaultTitle: 'Uyumluluk', ComplianceHeaderLabel: 'Uyumluluk denetimi', RunCheckLabel: 'Denetimi çalıştır', CancelCheckLabel: 'İptal', CheckingLabel: 'Uyumluluk denetleniyor...',
      OverallCompliantLabel: 'Uyumlu', OverallWarningLabel: 'Uyarı', OverallNonCompliantLabel: 'Uyumlu değil', OverallRunningLabel: 'Çalışıyor', OverallCancelledLabel: 'İptal edildi',
      CheckedLabel: 'Denetlendi', BlockedLabel: 'Engellendi', CompliantLabel: 'Uyumlu', NonCompliantLabel: 'Uyumlu değil', UnverifiableLabel: 'Doğrulanamaz', IgnoredLabel: 'Yoksayıldı',
      ComplianceTargetSiteMissingTitle: 'Hedef Site', ComplianceTargetSiteMissingMessage: 'Uyumluluk denetimini çalıştırmak için hedef site URL’si gereklidir.', ComplianceErrorFallbackTitle: 'Hata',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Şablon Sağlama', ProvisionLabel: 'Sağla', DeprovisionLabel: 'Sağlamayı kaldır', CheckLabel: 'Denetle',
      StateAppliedLabel: 'Uygulandı', StateNotAppliedLabel: 'Uygulanmadı', StateUnknownLabel: 'Bilinmiyor',
      ProvisioningDialogTitle: 'Sağlama', ProvisioningDialogDescription: 'Yapılandırılmış planı kullanarak sağlamayı çalıştırın.', DeprovisioningDialogTitle: 'Sağlamayı kaldırma', DeprovisioningDialogDescription: 'Yapılandırılmış planı kullanarak sağlamayı kaldırmayı çalıştırın.',
      DeprovisionConfirmRunTitle: 'Sağlamayı kaldırmayı onayla', DeprovisionConfirmRunMessage: 'Sağlamayı kaldırmayı başlatmak istediğinizden emin misiniz?', DeprovisionConfirmLabel: 'Sağlamayı kaldır', DeprovisionCancelLabel: 'İptal',
    },
    SiteSelectorField: {
      DefaultLabel: 'Hedef Site', CurrentSiteLabel: 'Geçerli site', HubSiteLabel: 'Üst hub sitesi', HubNotAvailableLabel: 'Kullanılamaz', SearchSiteLabel: 'Site ara',
      SelectedSiteGroupAriaLabel: 'Seçili Site', SearchSitesAriaLabel: 'Siteleri ara', SearchPlaceholder: 'Başlığa veya URL’ye göre ara',
      SearchingLabel: 'Aranıyor', EmptySearchLabel: 'Aramak için yazın', NoResultsLabel: 'Sonuç bulunamadı',
    },
    NavigationGuard: { LeavePageWarning: 'Bir işlem devam ediyor. Ayrılırsanız işlem kesintiye uğrar.' },
  };
});
