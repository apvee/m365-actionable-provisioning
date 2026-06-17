/**
 * Korean strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: '확인', CancelLabel: '취소' },
    LogPanel: { EmptyMessage: '사용 가능한 로그가 없습니다' },
    ComplianceLogPanel: { EmptyMessage: '사용 가능한 규정 준수 결과가 없습니다' },
    ProvisioningActivityEntry: {
      PendingLabel: '보류 중', RunningLabel: '실행 중', ExecutedLabel: '실행됨', FailedLabel: '실패', SkippedLabel: '건너뜀',
      SkipReasonNotFound: '찾을 수 없음', SkipReasonAlreadyExists: '이미 있음', SkipReasonNoChanges: '변경 없음', SkipReasonMissingPrerequisite: '필수 구성 요소 누락', SkipReasonUnsupported: '지원되지 않음',
    },
    ComplianceActivityEntry: {
      CompliantLabel: '준수', NonCompliantLabel: '비준수', UnverifiableLabel: '확인 불가', IgnoredLabel: '무시됨', BlockedLabel: '차단됨',
      PendingLabel: '보류 중', RunningLabel: '확인 중', CancelledLabel: '취소됨',
      BlockedByPrefix: '차단 원인',
    },
    ProvisioningDialog: {
      DefaultTitle: '프로비저닝', CloseButtonAriaLabel: '닫기', CloseLabel: '닫기', BackToProvisioningLabel: '뒤로',
      TargetSiteLabel: '대상 사이트', TargetSiteMissingTitle: '대상 사이트 없음', TargetSiteMissingMessage: '프로비저닝을 실행하기 전에 Web Part 속성에서 대상 사이트를 선택하세요.', ErrorFallbackCode: '오류',
      TotalLabel: '합계', SuccessLabel: '성공', FailLabel: '실패', SkippedLabel: '건너뜀', PendingLabel: '보류 중', CompletedLabel: '완료됨',
      FinalOutcomeSucceededLabel: '성공함', FinalOutcomeFailedLabel: '실패', FinalOutcomeCancelledLabel: '취소됨', FinalOutcomeRunningLabel: '실행 중',
      InitialHelpProvisioningText: '대상 사이트에 대해 프로비저닝을 시작하려면 실행을 사용하세요. 작업이 실행되는 동안 진행률과 로그를 검토할 수 있습니다.', InitialHelpComplianceText: '변경 내용을 적용하기 전에 규정 준수 문제를 미리 보려면 확인을 사용하세요.',
      ProvisioningDefaultDescription: '구성된 계획을 사용하여 프로비저닝을 실행합니다.', ComplianceDefaultDescription: '구성된 계획을 사용하여 규정 준수 검사를 실행합니다.',
      ViewLogsLabel: '로그 보기', CheckComplianceLabel: '확인', CancelLabel: '취소', RunLabel: '실행',
      ConfirmRunTitle: '실행 확인', ConfirmRunMessage: '실행을 시작하시겠습니까?',
      ComplianceDefaultTitle: '규정 준수', ComplianceHeaderLabel: '규정 준수 검사', RunCheckLabel: '검사 실행', CancelCheckLabel: '취소', CheckingLabel: '규정 준수 확인 중...',
      OverallCompliantLabel: '준수', OverallWarningLabel: '경고', OverallNonCompliantLabel: '비준수', OverallRunningLabel: '실행 중', OverallCancelledLabel: '취소됨',
      CheckedLabel: '확인됨', BlockedLabel: '차단됨', CompliantLabel: '준수', NonCompliantLabel: '비준수', UnverifiableLabel: '확인 불가', IgnoredLabel: '무시됨',
      ComplianceTargetSiteMissingTitle: '대상 사이트', ComplianceTargetSiteMissingMessage: '규정 준수 검사를 실행하려면 대상 사이트 URL이 필요합니다.', ComplianceErrorFallbackTitle: '오류',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: '템플릿 프로비저닝', ProvisionLabel: '프로비저닝', DeprovisionLabel: '프로비저닝 해제', CheckLabel: '확인',
      StateAppliedLabel: '적용됨', StateNotAppliedLabel: '적용되지 않음', StateUnknownLabel: '알 수 없음',
      ProvisioningDialogTitle: '프로비저닝', ProvisioningDialogDescription: '구성된 계획을 사용하여 프로비저닝을 실행합니다.', DeprovisioningDialogTitle: '프로비저닝 해제', DeprovisioningDialogDescription: '구성된 계획을 사용하여 프로비저닝 해제를 실행합니다.',
      DeprovisionConfirmRunTitle: '프로비저닝 해제 확인', DeprovisionConfirmRunMessage: '프로비저닝 해제를 시작하시겠습니까?', DeprovisionConfirmLabel: '프로비저닝 해제', DeprovisionCancelLabel: '취소',
    },
    SiteSelectorField: {
      DefaultLabel: '대상 사이트', CurrentSiteLabel: '현재 사이트', HubSiteLabel: '상위 허브 사이트', HubNotAvailableLabel: '사용할 수 없음', SearchSiteLabel: '사이트 검색',
      SelectedSiteGroupAriaLabel: '선택한 사이트', SearchSitesAriaLabel: '사이트 검색', SearchPlaceholder: '제목 또는 URL로 검색',
      SearchingLabel: '검색 중', EmptySearchLabel: '검색하려면 입력', NoResultsLabel: '결과를 찾을 수 없음',
    },
    NavigationGuard: { LeavePageWarning: '작업이 진행 중입니다. 나가면 중단됩니다.' },
  };
});
