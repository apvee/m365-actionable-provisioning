/**
 * Traditional Chinese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: '確認', CancelLabel: '取消' },
    LogPanel: { EmptyMessage: '沒有可用的記錄' },
    ComplianceLogPanel: { EmptyMessage: '沒有可用的合規性結果' },
    ProvisioningActivityEntry: {
      PendingLabel: '擱置中', RunningLabel: '執行中', ExecutedLabel: '已執行', FailedLabel: '失敗', SkippedLabel: '已略過',
      SkipReasonNotFound: '找不到', SkipReasonAlreadyExists: '已存在', SkipReasonNoChanges: '沒有變更', SkipReasonMissingPrerequisite: '缺少必要條件', SkipReasonUnsupported: '不支援',
    },
    ComplianceActivityEntry: {
      CompliantLabel: '合規', NonCompliantLabel: '不合規', UnverifiableLabel: '無法驗證', IgnoredLabel: '已忽略', BlockedLabel: '已封鎖',
      PendingLabel: '擱置中', RunningLabel: '正在檢查', CancelledLabel: '已取消',
      BlockedByPrefix: '封鎖者',
    },
    ProvisioningDialog: {
      DefaultTitle: '佈建', CloseButtonAriaLabel: '關閉', CloseLabel: '關閉', BackToProvisioningLabel: '返回',
      TargetSiteLabel: '目標網站', TargetSiteMissingTitle: '缺少目標網站', TargetSiteMissingMessage: '執行佈建前，請在 Web Part 屬性中選取目標網站。', ErrorFallbackCode: '錯誤',
      TotalLabel: '總計', SuccessLabel: '成功', FailLabel: '失敗', SkippedLabel: '已略過', PendingLabel: '擱置中', CompletedLabel: '已完成',
      FinalOutcomeSucceededLabel: '已成功', FinalOutcomeFailedLabel: '失敗', FinalOutcomeCancelledLabel: '已取消', FinalOutcomeRunningLabel: '執行中',
      InitialHelpProvisioningText: '使用「執行」開始對目標網站進行佈建。動作執行時，您可以檢閱進度和記錄。', InitialHelpComplianceText: '使用「檢查」在套用變更前預覽合規性問題。',
      ProvisioningDefaultDescription: '使用已設定的計畫執行佈建。', ComplianceDefaultDescription: '使用已設定的計畫執行合規性檢查。',
      ViewLogsLabel: '檢視記錄', CheckComplianceLabel: '檢查', CancelLabel: '取消', RunLabel: '執行',
      ConfirmRunTitle: '確認執行', ConfirmRunMessage: '確定要開始執行嗎？',
      ComplianceDefaultTitle: '合規性', ComplianceHeaderLabel: '合規性檢查', RunCheckLabel: '執行檢查', CancelCheckLabel: '取消', CheckingLabel: '正在檢查合規性...',
      OverallCompliantLabel: '合規', OverallWarningLabel: '警告', OverallNonCompliantLabel: '不合規', OverallRunningLabel: '執行中', OverallCancelledLabel: '已取消',
      CheckedLabel: '已檢查', BlockedLabel: '已封鎖', CompliantLabel: '合規', NonCompliantLabel: '不合規', UnverifiableLabel: '無法驗證', IgnoredLabel: '已忽略',
      ComplianceTargetSiteMissingTitle: '目標網站', ComplianceTargetSiteMissingMessage: '需要目標網站 URL 才能執行合規性檢查。', ComplianceErrorFallbackTitle: '錯誤',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: '範本佈建', ProvisionLabel: '佈建', DeprovisionLabel: '取消佈建', CheckLabel: '檢查',
      StateAppliedLabel: '已套用', StateNotAppliedLabel: '未套用', StateUnknownLabel: '未知',
      ProvisioningDialogTitle: '佈建', ProvisioningDialogDescription: '使用已設定的計畫執行佈建。', DeprovisioningDialogTitle: '取消佈建', DeprovisioningDialogDescription: '使用已設定的計畫執行取消佈建。',
      DeprovisionConfirmRunTitle: '確認取消佈建', DeprovisionConfirmRunMessage: '確定要開始取消佈建嗎？', DeprovisionConfirmLabel: '取消佈建', DeprovisionCancelLabel: '取消',
    },
    SiteSelectorField: {
      DefaultLabel: '目標網站', CurrentSiteLabel: '目前網站', HubSiteLabel: '上層中樞網站', HubNotAvailableLabel: '無法使用', SearchSiteLabel: '搜尋網站',
      SelectedSiteGroupAriaLabel: '選取的網站', SearchSitesAriaLabel: '搜尋網站', SearchPlaceholder: '依標題或 URL 搜尋',
      SearchingLabel: '搜尋中', EmptySearchLabel: '輸入以搜尋', NoResultsLabel: '找不到結果',
    },
    NavigationGuard: { LeavePageWarning: '作業正在進行中。如果您離開，作業將會中斷。' },
  };
});
