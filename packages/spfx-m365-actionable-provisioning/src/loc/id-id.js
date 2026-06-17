/**
 * Indonesian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Konfirmasi', CancelLabel: 'Batal' },
    LogPanel: { EmptyMessage: 'Tidak ada log yang tersedia' },
    ComplianceLogPanel: { EmptyMessage: 'Tidak ada hasil kepatuhan yang tersedia' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Tertunda', RunningLabel: 'Berjalan', ExecutedLabel: 'Dijalankan', FailedLabel: 'Gagal', SkippedLabel: 'Dilewati',
      SkipReasonNotFound: 'Tidak ditemukan', SkipReasonAlreadyExists: 'Sudah ada', SkipReasonNoChanges: 'Tidak ada perubahan', SkipReasonMissingPrerequisite: 'Prasyarat tidak ada', SkipReasonUnsupported: 'Tidak didukung',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Patuh', NonCompliantLabel: 'Tidak patuh', UnverifiableLabel: 'Tidak dapat diverifikasi', IgnoredLabel: 'Diabaikan', BlockedLabel: 'Diblokir',
      PendingLabel: 'Tertunda', RunningLabel: 'Memeriksa', CancelledLabel: 'Dibatalkan',
      BlockedByPrefix: 'Diblokir oleh',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Penyediaan', CloseButtonAriaLabel: 'Tutup', CloseLabel: 'Tutup', BackToProvisioningLabel: 'Kembali',
      TargetSiteLabel: 'Situs Target', TargetSiteMissingTitle: 'Situs target tidak ada', TargetSiteMissingMessage: 'Pilih situs target di properti Web Part sebelum menjalankan penyediaan.', ErrorFallbackCode: 'KESALAHAN',
      TotalLabel: 'Total', SuccessLabel: 'Berhasil', FailLabel: 'Gagal', SkippedLabel: 'Dilewati', PendingLabel: 'Tertunda', CompletedLabel: 'Selesai',
      FinalOutcomeSucceededLabel: 'Berhasil', FinalOutcomeFailedLabel: 'Gagal', FinalOutcomeCancelledLabel: 'Dibatalkan', FinalOutcomeRunningLabel: 'Berjalan',
      InitialHelpProvisioningText: 'Gunakan Jalankan untuk memulai penyediaan terhadap situs target. Anda dapat meninjau kemajuan dan log saat tindakan dijalankan.', InitialHelpComplianceText: 'Gunakan Periksa untuk melihat pratinjau masalah kepatuhan sebelum menerapkan perubahan.',
      ProvisioningDefaultDescription: 'Jalankan penyediaan menggunakan rencana yang dikonfigurasi.', ComplianceDefaultDescription: 'Jalankan pemeriksaan kepatuhan menggunakan rencana yang dikonfigurasi.',
      ViewLogsLabel: 'Lihat Log', CheckComplianceLabel: 'Periksa', CancelLabel: 'Batal', RunLabel: 'Jalankan',
      ConfirmRunTitle: 'Konfirmasi Jalankan', ConfirmRunMessage: 'Apakah Anda yakin ingin memulai eksekusi?',
      ComplianceDefaultTitle: 'Kepatuhan', ComplianceHeaderLabel: 'Pemeriksaan kepatuhan', RunCheckLabel: 'Jalankan pemeriksaan', CancelCheckLabel: 'Batal', CheckingLabel: 'Memeriksa kepatuhan...',
      OverallCompliantLabel: 'Patuh', OverallWarningLabel: 'Peringatan', OverallNonCompliantLabel: 'Tidak patuh', OverallRunningLabel: 'Berjalan', OverallCancelledLabel: 'Dibatalkan',
      CheckedLabel: 'Diperiksa', BlockedLabel: 'Diblokir', CompliantLabel: 'Patuh', NonCompliantLabel: 'Tidak patuh', UnverifiableLabel: 'Tidak dapat diverifikasi', IgnoredLabel: 'Diabaikan',
      ComplianceTargetSiteMissingTitle: 'Situs Target', ComplianceTargetSiteMissingMessage: 'URL situs target diperlukan untuk menjalankan pemeriksaan kepatuhan.', ComplianceErrorFallbackTitle: 'Kesalahan',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Penyediaan Templat', ProvisionLabel: 'Sediakan', DeprovisionLabel: 'Batalkan penyediaan', CheckLabel: 'Periksa',
      StateAppliedLabel: 'Diterapkan', StateNotAppliedLabel: 'Tidak diterapkan', StateUnknownLabel: 'Tidak diketahui',
      ProvisioningDialogTitle: 'Penyediaan', ProvisioningDialogDescription: 'Jalankan penyediaan menggunakan rencana yang dikonfigurasi.', DeprovisioningDialogTitle: 'Pembatalan penyediaan', DeprovisioningDialogDescription: 'Jalankan pembatalan penyediaan menggunakan rencana yang dikonfigurasi.',
      DeprovisionConfirmRunTitle: 'Konfirmasi pembatalan penyediaan', DeprovisionConfirmRunMessage: 'Apakah Anda yakin ingin memulai pembatalan penyediaan?', DeprovisionConfirmLabel: 'Batalkan penyediaan', DeprovisionCancelLabel: 'Batal',
    },
    SiteSelectorField: {
      DefaultLabel: 'Situs Target', CurrentSiteLabel: 'Situs saat ini', HubSiteLabel: 'Situs hub induk', HubNotAvailableLabel: 'Tidak tersedia', SearchSiteLabel: 'Cari situs',
      SelectedSiteGroupAriaLabel: 'Situs Terpilih', SearchSitesAriaLabel: 'Cari situs', SearchPlaceholder: 'Cari berdasarkan judul atau URL',
      SearchingLabel: 'Mencari', EmptySearchLabel: 'Ketik untuk mencari', NoResultsLabel: 'Tidak ada hasil ditemukan',
    },
    NavigationGuard: { LeavePageWarning: 'Operasi sedang berlangsung. Jika Anda keluar, operasi akan terganggu.' },
  };
});
