/**
 * Simplified Chinese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: '确认', CancelLabel: '取消' },
    LogPanel: { EmptyMessage: '没有可用日志' },
    ComplianceLogPanel: { EmptyMessage: '没有可用的符合性结果' },
    ProvisioningActivityEntry: {
      PendingLabel: '待处理', RunningLabel: '正在运行', ExecutedLabel: '已执行', FailedLabel: '失败', SkippedLabel: '已跳过',
      SkipReasonNotFound: '未找到', SkipReasonAlreadyExists: '已存在', SkipReasonNoChanges: '无更改', SkipReasonMissingPrerequisite: '缺少先决条件', SkipReasonUnsupported: '不受支持',
    },
    ComplianceActivityEntry: {
      CompliantLabel: '符合', NonCompliantLabel: '不符合', UnverifiableLabel: '无法验证', IgnoredLabel: '已忽略', BlockedLabel: '已阻止',
      PendingLabel: '待处理', RunningLabel: '正在检查', CancelledLabel: '已取消',
      BlockedByPrefix: '阻止者',
    },
    ProvisioningDialog: {
      DefaultTitle: '预配', CloseButtonAriaLabel: '关闭', CloseLabel: '关闭', BackToProvisioningLabel: '返回',
      TargetSiteLabel: '目标站点', TargetSiteMissingTitle: '缺少目标站点', TargetSiteMissingMessage: '运行预配前，请在 Web Part 属性中选择目标站点。', ErrorFallbackCode: '错误',
      TotalLabel: '总计', SuccessLabel: '成功', FailLabel: '失败', SkippedLabel: '已跳过', PendingLabel: '待处理', CompletedLabel: '已完成',
      FinalOutcomeSucceededLabel: '已成功', FinalOutcomeFailedLabel: '失败', FinalOutcomeCancelledLabel: '已取消', FinalOutcomeRunningLabel: '正在运行',
      InitialHelpProvisioningText: '使用“运行”开始对目标站点进行预配。操作执行时，你可以查看进度和日志。', InitialHelpComplianceText: '使用“检查”在应用更改前预览符合性问题。',
      ProvisioningDefaultDescription: '使用已配置的计划运行预配。', ComplianceDefaultDescription: '使用已配置的计划运行符合性检查。',
      ViewLogsLabel: '查看日志', CheckComplianceLabel: '检查', CancelLabel: '取消', RunLabel: '运行',
      ConfirmRunTitle: '确认运行', ConfirmRunMessage: '确定要开始运行吗？',
      ComplianceDefaultTitle: '符合性', ComplianceHeaderLabel: '符合性检查', RunCheckLabel: '运行检查', CancelCheckLabel: '取消', CheckingLabel: '正在检查符合性...',
      OverallCompliantLabel: '符合', OverallWarningLabel: '警告', OverallNonCompliantLabel: '不符合', OverallRunningLabel: '正在运行', OverallCancelledLabel: '已取消',
      CheckedLabel: '已检查', BlockedLabel: '已阻止', CompliantLabel: '符合', NonCompliantLabel: '不符合', UnverifiableLabel: '无法验证', IgnoredLabel: '已忽略',
      ComplianceTargetSiteMissingTitle: '目标站点', ComplianceTargetSiteMissingMessage: '需要目标站点 URL 才能运行符合性检查。', ComplianceErrorFallbackTitle: '错误',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: '模板预配', ProvisionLabel: '预配', DeprovisionLabel: '取消预配', CheckLabel: '检查',
      StateAppliedLabel: '已应用', StateNotAppliedLabel: '未应用', StateUnknownLabel: '未知',
      ProvisioningDialogTitle: '预配', ProvisioningDialogDescription: '使用已配置的计划运行预配。', DeprovisioningDialogTitle: '取消预配', DeprovisioningDialogDescription: '使用已配置的计划运行取消预配。',
      DeprovisionConfirmRunTitle: '确认取消预配', DeprovisionConfirmRunMessage: '确定要开始取消预配吗？', DeprovisionConfirmLabel: '取消预配', DeprovisionCancelLabel: '取消',
    },
    SiteSelectorField: {
      DefaultLabel: '目标站点', CurrentSiteLabel: '当前站点', HubSiteLabel: '父中心站点', HubNotAvailableLabel: '不可用', SearchSiteLabel: '搜索站点',
      SelectedSiteGroupAriaLabel: '选定站点', SearchSitesAriaLabel: '搜索站点', SearchPlaceholder: '按标题或 URL 搜索',
      SearchingLabel: '正在搜索', EmptySearchLabel: '键入以搜索', NoResultsLabel: '未找到结果',
    },
    NavigationGuard: { LeavePageWarning: '操作正在进行中。如果离开，操作将被中断。' },
  };
});
