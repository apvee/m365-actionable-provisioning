/**
 * Japanese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: '確認', CancelLabel: 'キャンセル' },
    LogPanel: { EmptyMessage: '利用できるログはありません' },
    ComplianceLogPanel: { EmptyMessage: '利用できるコンプライアンス結果はありません' },
    ProvisioningActivityEntry: {
      PendingLabel: '保留中', RunningLabel: '実行中', ExecutedLabel: '実行済み', FailedLabel: '失敗', SkippedLabel: 'スキップ済み',
      SkipReasonNotFound: '見つかりません', SkipReasonAlreadyExists: '既に存在します', SkipReasonNoChanges: '変更なし', SkipReasonMissingPrerequisite: '前提条件が不足しています', SkipReasonUnsupported: 'サポートされていません',
    },
    ComplianceActivityEntry: {
      CompliantLabel: '準拠', NonCompliantLabel: '非準拠', UnverifiableLabel: '検証不可', IgnoredLabel: '無視済み', BlockedLabel: 'ブロック済み',
      PendingLabel: '保留中', RunningLabel: '確認中', CancelledLabel: 'キャンセル済み',
      BlockedByPrefix: 'ブロック元',
    },
    ProvisioningDialog: {
      DefaultTitle: 'プロビジョニング', CloseButtonAriaLabel: '閉じる', CloseLabel: '閉じる', BackToProvisioningLabel: '戻る',
      TargetSiteLabel: '対象サイト', TargetSiteMissingTitle: '対象サイトがありません', TargetSiteMissingMessage: 'プロビジョニングを実行する前に、Web Part のプロパティで対象サイトを選択してください。', ErrorFallbackCode: 'エラー',
      TotalLabel: '合計', SuccessLabel: '成功', FailLabel: '失敗', SkippedLabel: 'スキップ済み', PendingLabel: '保留中', CompletedLabel: '完了',
      FinalOutcomeSucceededLabel: '成功', FinalOutcomeFailedLabel: '失敗', FinalOutcomeCancelledLabel: 'キャンセル済み', FinalOutcomeRunningLabel: '実行中',
      InitialHelpProvisioningText: '対象サイトに対してプロビジョニングを開始するには、[実行] を使用します。アクションの実行中に進行状況とログを確認できます。', InitialHelpComplianceText: '変更を適用する前にコンプライアンスの問題をプレビューするには、[確認] を使用します。',
      ProvisioningDefaultDescription: '構成済みのプランを使用してプロビジョニングを実行します。', ComplianceDefaultDescription: '構成済みのプランを使用してコンプライアンス チェックを実行します。',
      ViewLogsLabel: 'ログの表示', CheckComplianceLabel: '確認', CancelLabel: 'キャンセル', RunLabel: '実行',
      ConfirmRunTitle: '実行の確認', ConfirmRunMessage: '実行を開始してもよろしいですか?',
      ComplianceDefaultTitle: 'コンプライアンス', ComplianceHeaderLabel: 'コンプライアンス チェック', RunCheckLabel: 'チェックの実行', CancelCheckLabel: 'キャンセル', CheckingLabel: 'コンプライアンスを確認しています...',
      OverallCompliantLabel: '準拠', OverallWarningLabel: '警告', OverallNonCompliantLabel: '非準拠', OverallRunningLabel: '実行中', OverallCancelledLabel: 'キャンセル済み',
      CheckedLabel: '確認済み', BlockedLabel: 'ブロック済み', CompliantLabel: '準拠', NonCompliantLabel: '非準拠', UnverifiableLabel: '検証不可', IgnoredLabel: '無視済み',
      ComplianceTargetSiteMissingTitle: '対象サイト', ComplianceTargetSiteMissingMessage: 'コンプライアンス チェックを実行するには、対象サイトの URL が必要です。', ComplianceErrorFallbackTitle: 'エラー',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'テンプレート プロビジョニング', ProvisionLabel: 'プロビジョニング', DeprovisionLabel: 'プロビジョニング解除', CheckLabel: '確認',
      StateAppliedLabel: '適用済み', StateNotAppliedLabel: '未適用', StateUnknownLabel: '不明',
      ProvisioningDialogTitle: 'プロビジョニング', ProvisioningDialogDescription: '構成済みのプランを使用してプロビジョニングを実行します。', DeprovisioningDialogTitle: 'プロビジョニング解除', DeprovisioningDialogDescription: '構成済みのプランを使用してプロビジョニング解除を実行します。',
      DeprovisionConfirmRunTitle: 'プロビジョニング解除の確認', DeprovisionConfirmRunMessage: 'プロビジョニング解除を開始してもよろしいですか?', DeprovisionConfirmLabel: 'プロビジョニング解除', DeprovisionCancelLabel: 'キャンセル',
    },
    SiteSelectorField: {
      DefaultLabel: '対象サイト', CurrentSiteLabel: '現在のサイト', HubSiteLabel: '親ハブ サイト', HubNotAvailableLabel: '利用不可', SearchSiteLabel: 'サイトの検索',
      SelectedSiteGroupAriaLabel: '選択したサイト', SearchSitesAriaLabel: 'サイトの検索', SearchPlaceholder: 'タイトルまたは URL で検索',
      SearchingLabel: '検索中', EmptySearchLabel: '入力して検索', NoResultsLabel: '結果が見つかりません',
    },
    NavigationGuard: { LeavePageWarning: '操作が進行中です。ページを離れると中断されます。' },
  };
});
