/**
 * Russian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Подтвердить', CancelLabel: 'Отмена' },
    LogPanel: { EmptyMessage: 'Журналы недоступны' },
    ComplianceLogPanel: { EmptyMessage: 'Результаты соответствия недоступны' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Ожидает', RunningLabel: 'Выполняется', ExecutedLabel: 'Выполнено', FailedLabel: 'Не выполнено', SkippedLabel: 'Пропущено',
      SkipReasonNotFound: 'Не найдено', SkipReasonAlreadyExists: 'Уже существует', SkipReasonNoChanges: 'Нет изменений', SkipReasonMissingPrerequisite: 'Отсутствует предварительное условие', SkipReasonUnsupported: 'Не поддерживается',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Соответствует', NonCompliantLabel: 'Не соответствует', UnverifiableLabel: 'Невозможно проверить', IgnoredLabel: 'Проигнорировано', BlockedLabel: 'Заблокировано',
      PendingLabel: 'Ожидает', RunningLabel: 'Проверка', CancelledLabel: 'Отменено',
      BlockedByPrefix: 'Заблокировано',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Подготовка', CloseButtonAriaLabel: 'Закрыть', CloseLabel: 'Закрыть', BackToProvisioningLabel: 'Назад',
      TargetSiteLabel: 'Целевой сайт', TargetSiteMissingTitle: 'Целевой сайт отсутствует', TargetSiteMissingMessage: 'Перед запуском подготовки выберите целевой сайт в свойствах Web Part.', ErrorFallbackCode: 'ОШИБКА',
      TotalLabel: 'Всего', SuccessLabel: 'Успешно', FailLabel: 'Не выполнено', SkippedLabel: 'Пропущено', PendingLabel: 'Ожидает', CompletedLabel: 'Завершено',
      FinalOutcomeSucceededLabel: 'Успешно', FinalOutcomeFailedLabel: 'Не выполнено', FinalOutcomeCancelledLabel: 'Отменено', FinalOutcomeRunningLabel: 'Выполняется',
      InitialHelpProvisioningText: 'Используйте команду Запустить, чтобы начать подготовку для целевого сайта. Во время выполнения действий можно просматривать ход выполнения и журналы.', InitialHelpComplianceText: 'Используйте команду Проверить, чтобы просмотреть проблемы соответствия перед применением изменений.',
      ProvisioningDefaultDescription: 'Запустите подготовку с использованием настроенного плана.', ComplianceDefaultDescription: 'Запустите проверку соответствия с использованием настроенного плана.',
      ViewLogsLabel: 'Просмотреть журналы', CheckComplianceLabel: 'Проверить', CancelLabel: 'Отмена', RunLabel: 'Запустить',
      ConfirmRunTitle: 'Подтвердить запуск', ConfirmRunMessage: 'Вы действительно хотите начать выполнение?',
      ComplianceDefaultTitle: 'Соответствие', ComplianceHeaderLabel: 'Проверка соответствия', RunCheckLabel: 'Запустить проверку', CancelCheckLabel: 'Отмена', CheckingLabel: 'Проверка соответствия...',
      OverallCompliantLabel: 'Соответствует', OverallWarningLabel: 'Предупреждение', OverallNonCompliantLabel: 'Не соответствует', OverallRunningLabel: 'Выполняется', OverallCancelledLabel: 'Отменено',
      CheckedLabel: 'Проверено', BlockedLabel: 'Заблокировано', CompliantLabel: 'Соответствует', NonCompliantLabel: 'Не соответствует', UnverifiableLabel: 'Невозможно проверить', IgnoredLabel: 'Проигнорировано',
      ComplianceTargetSiteMissingTitle: 'Целевой сайт', ComplianceTargetSiteMissingMessage: 'Для запуска проверки соответствия требуется URL целевого сайта.', ComplianceErrorFallbackTitle: 'Ошибка',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Подготовка шаблона', ProvisionLabel: 'Подготовить', DeprovisionLabel: 'Отменить подготовку', CheckLabel: 'Проверить',
      StateAppliedLabel: 'Применено', StateNotAppliedLabel: 'Не применено', StateUnknownLabel: 'Неизвестно',
      ProvisioningDialogTitle: 'Подготовка', ProvisioningDialogDescription: 'Запустите подготовку с использованием настроенного плана.', DeprovisioningDialogTitle: 'Отмена подготовки', DeprovisioningDialogDescription: 'Запустите отмену подготовки с использованием настроенного плана.',
      DeprovisionConfirmRunTitle: 'Подтвердить отмену подготовки', DeprovisionConfirmRunMessage: 'Вы действительно хотите начать отмену подготовки?', DeprovisionConfirmLabel: 'Отменить подготовку', DeprovisionCancelLabel: 'Отмена',
    },
    SiteSelectorField: {
      DefaultLabel: 'Целевой сайт', CurrentSiteLabel: 'Текущий сайт', HubSiteLabel: 'Родительский hub-сайт', HubNotAvailableLabel: 'Недоступно', SearchSiteLabel: 'Поиск сайта',
      SelectedSiteGroupAriaLabel: 'Выбранный сайт', SearchSitesAriaLabel: 'Поиск сайтов', SearchPlaceholder: 'Поиск по названию или URL',
      SearchingLabel: 'Поиск', EmptySearchLabel: 'Введите текст для поиска', NoResultsLabel: 'Результаты не найдены',
    },
    NavigationGuard: { LeavePageWarning: 'Выполняется операция. Если вы покинете страницу, она будет прервана.' },
  };
});
