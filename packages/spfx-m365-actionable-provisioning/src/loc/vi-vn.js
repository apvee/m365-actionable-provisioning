/**
 * Vietnamese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Xác nhận', CancelLabel: 'Hủy' },
    LogPanel: { EmptyMessage: 'Không có nhật ký nào' },
    ComplianceLogPanel: { EmptyMessage: 'Không có kết quả tuân thủ nào' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Đang chờ', RunningLabel: 'Đang chạy', ExecutedLabel: 'Đã thực thi', FailedLabel: 'Thất bại', SkippedLabel: 'Đã bỏ qua',
      SkipReasonNotFound: 'Không tìm thấy', SkipReasonAlreadyExists: 'Đã tồn tại', SkipReasonNoChanges: 'Không có thay đổi', SkipReasonMissingPrerequisite: 'Thiếu điều kiện tiên quyết', SkipReasonUnsupported: 'Không được hỗ trợ',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Tuân thủ', NonCompliantLabel: 'Không tuân thủ', UnverifiableLabel: 'Không thể xác minh', IgnoredLabel: 'Đã bỏ qua', BlockedLabel: 'Bị chặn',
      PendingLabel: 'Đang chờ', RunningLabel: 'Đang kiểm tra', CancelledLabel: 'Đã hủy',
      BlockedByPrefix: 'Bị chặn bởi',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Cấp phát', CloseButtonAriaLabel: 'Đóng', CloseLabel: 'Đóng', BackToProvisioningLabel: 'Quay lại',
      TargetSiteLabel: 'Site đích', TargetSiteMissingTitle: 'Thiếu site đích', TargetSiteMissingMessage: 'Chọn một site đích trong thuộc tính Web Part trước khi chạy cấp phát.', ErrorFallbackCode: 'LỖI',
      TotalLabel: 'Tổng cộng', SuccessLabel: 'Thành công', FailLabel: 'Thất bại', SkippedLabel: 'Đã bỏ qua', PendingLabel: 'Đang chờ', CompletedLabel: 'Hoàn tất',
      FinalOutcomeSucceededLabel: 'Thành công', FinalOutcomeFailedLabel: 'Thất bại', FinalOutcomeCancelledLabel: 'Đã hủy', FinalOutcomeRunningLabel: 'Đang chạy',
      InitialHelpProvisioningText: 'Dùng Chạy để bắt đầu cấp phát cho site đích. Bạn có thể xem lại tiến độ và nhật ký trong khi các hành động được thực thi.', InitialHelpComplianceText: 'Dùng Kiểm tra để xem trước các vấn đề tuân thủ trước khi áp dụng thay đổi.',
      ProvisioningDefaultDescription: 'Chạy cấp phát bằng kế hoạch đã cấu hình.', ComplianceDefaultDescription: 'Chạy kiểm tra tuân thủ bằng kế hoạch đã cấu hình.',
      ViewLogsLabel: 'Xem nhật ký', CheckComplianceLabel: 'Kiểm tra', CancelLabel: 'Hủy', RunLabel: 'Chạy',
      ConfirmRunTitle: 'Xác nhận chạy', ConfirmRunMessage: 'Bạn có chắc chắn muốn bắt đầu chạy không?',
      ComplianceDefaultTitle: 'Tuân thủ', ComplianceHeaderLabel: 'Kiểm tra tuân thủ', RunCheckLabel: 'Chạy kiểm tra', CancelCheckLabel: 'Hủy', CheckingLabel: 'Đang kiểm tra tuân thủ...',
      OverallCompliantLabel: 'Tuân thủ', OverallWarningLabel: 'Cảnh báo', OverallNonCompliantLabel: 'Không tuân thủ', OverallRunningLabel: 'Đang chạy', OverallCancelledLabel: 'Đã hủy',
      CheckedLabel: 'Đã kiểm tra', BlockedLabel: 'Bị chặn', CompliantLabel: 'Tuân thủ', NonCompliantLabel: 'Không tuân thủ', UnverifiableLabel: 'Không thể xác minh', IgnoredLabel: 'Đã bỏ qua',
      ComplianceTargetSiteMissingTitle: 'Site đích', ComplianceTargetSiteMissingMessage: 'Cần có URL site đích để chạy kiểm tra tuân thủ.', ComplianceErrorFallbackTitle: 'Lỗi',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Cấp phát mẫu', ProvisionLabel: 'Cấp phát', DeprovisionLabel: 'Hủy cấp phát', CheckLabel: 'Kiểm tra',
      StateAppliedLabel: 'Đã áp dụng', StateNotAppliedLabel: 'Chưa áp dụng', StateUnknownLabel: 'Không xác định',
      ProvisioningDialogTitle: 'Cấp phát', ProvisioningDialogDescription: 'Chạy cấp phát bằng kế hoạch đã cấu hình.', DeprovisioningDialogTitle: 'Hủy cấp phát', DeprovisioningDialogDescription: 'Chạy hủy cấp phát bằng kế hoạch đã cấu hình.',
      DeprovisionConfirmRunTitle: 'Xác nhận hủy cấp phát', DeprovisionConfirmRunMessage: 'Bạn có chắc chắn muốn bắt đầu hủy cấp phát không?', DeprovisionConfirmLabel: 'Hủy cấp phát', DeprovisionCancelLabel: 'Hủy',
    },
    SiteSelectorField: {
      DefaultLabel: 'Site đích', CurrentSiteLabel: 'Site hiện tại', HubSiteLabel: 'Site hub cha', HubNotAvailableLabel: 'Không khả dụng', SearchSiteLabel: 'Tìm kiếm site',
      SelectedSiteGroupAriaLabel: 'Site đã chọn', SearchSitesAriaLabel: 'Tìm kiếm site', SearchPlaceholder: 'Tìm kiếm theo tiêu đề hoặc URL',
      SearchingLabel: 'Đang tìm kiếm', EmptySearchLabel: 'Nhập để tìm kiếm', NoResultsLabel: 'Không tìm thấy kết quả',
    },
    NavigationGuard: { LeavePageWarning: 'Một thao tác đang diễn ra. Nếu bạn rời đi, thao tác đó sẽ bị gián đoạn.' },
  };
});
