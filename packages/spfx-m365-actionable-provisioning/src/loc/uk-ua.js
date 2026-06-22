/**
 * Ukrainian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Підтвердити', CancelLabel: 'Скасувати' },
    LogPanel: { EmptyMessage: 'Немає доступних журналів' },
    ComplianceLogPanel: { EmptyMessage: 'Немає доступних результатів відповідності' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Очікує', RunningLabel: 'Виконується', ExecutedLabel: 'Виконано', FailedLabel: 'Не виконано', SkippedLabel: 'Пропущено',
      SkipReasonNotFound: 'Не знайдено', SkipReasonAlreadyExists: 'Уже існує', SkipReasonNoChanges: 'Без змін', SkipReasonMissingPrerequisite: 'Відсутня передумова', SkipReasonUnsupported: 'Не підтримується',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Відповідає', NonCompliantLabel: 'Не відповідає', UnverifiableLabel: 'Неможливо перевірити', IgnoredLabel: 'Проігноровано', BlockedLabel: 'Заблоковано',
      PendingLabel: 'Очікує', RunningLabel: 'Перевірка', CancelledLabel: 'Скасовано',
      BlockedByPrefix: 'Заблоковано через',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Підготовка', CloseButtonAriaLabel: 'Закрити', CloseLabel: 'Закрити', BackToProvisioningLabel: 'Назад',
      TargetSiteLabel: 'Цільовий сайт', TargetSiteMissingTitle: 'Цільовий сайт відсутній', TargetSiteMissingMessage: 'Перед запуском підготовки виберіть цільовий сайт у властивостях Web Part.', ErrorFallbackCode: 'ПОМИЛКА',
      TotalLabel: 'Усього', SuccessLabel: 'Успішно', FailLabel: 'Не виконано', SkippedLabel: 'Пропущено', PendingLabel: 'Очікує', CompletedLabel: 'Завершено',
      FinalOutcomeSucceededLabel: 'Успішно', FinalOutcomeFailedLabel: 'Не виконано', FinalOutcomeCancelledLabel: 'Скасовано', FinalOutcomeRunningLabel: 'Виконується',
      InitialHelpProvisioningText: 'Використайте Запустити, щоб почати підготовку для цільового сайту. Під час виконання дій можна переглядати перебіг і журнали.', InitialHelpComplianceText: 'Використайте Перевірити, щоб переглянути проблеми відповідності перед застосуванням змін.',
      ProvisioningDefaultDescription: 'Запустіть підготовку за допомогою налаштованого плану.', ComplianceDefaultDescription: 'Запустіть перевірку відповідності за допомогою налаштованого плану.',
      ViewLogsLabel: 'Переглянути журнали', CheckComplianceLabel: 'Перевірити', CancelLabel: 'Скасувати', RunLabel: 'Запустити',
      ConfirmRunTitle: 'Підтвердити запуск', ConfirmRunMessage: 'Ви справді хочете почати виконання?',
      ComplianceDefaultTitle: 'Відповідність', ComplianceHeaderLabel: 'Перевірка відповідності', RunCheckLabel: 'Запустити перевірку', CancelCheckLabel: 'Скасувати', CheckingLabel: 'Перевірка відповідності...',
      OverallCompliantLabel: 'Відповідає', OverallWarningLabel: 'Попередження', OverallNonCompliantLabel: 'Не відповідає', OverallRunningLabel: 'Виконується', OverallCancelledLabel: 'Скасовано',
      CheckedLabel: 'Перевірено', BlockedLabel: 'Заблоковано', CompliantLabel: 'Відповідає', NonCompliantLabel: 'Не відповідає', UnverifiableLabel: 'Неможливо перевірити', IgnoredLabel: 'Проігноровано',
      ComplianceTargetSiteMissingTitle: 'Цільовий сайт', ComplianceTargetSiteMissingMessage: 'Для запуску перевірки відповідності потрібна URL-адреса цільового сайту.', ComplianceErrorFallbackTitle: 'Помилка',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Підготовка шаблону', ProvisionLabel: 'Підготувати', DeprovisionLabel: 'Скасувати підготовку', CheckLabel: 'Перевірити',
      StateAppliedLabel: 'Застосовано', StateNotAppliedLabel: 'Не застосовано', StateUnknownLabel: 'Невідомо',
      ProvisioningDialogTitle: 'Підготовка', ProvisioningDialogDescription: 'Запустіть підготовку за допомогою налаштованого плану.', DeprovisioningDialogTitle: 'Скасування підготовки', DeprovisioningDialogDescription: 'Запустіть скасування підготовки за допомогою налаштованого плану.',
      DeprovisionConfirmRunTitle: 'Підтвердити скасування підготовки', DeprovisionConfirmRunMessage: 'Ви справді хочете почати скасування підготовки?', DeprovisionConfirmLabel: 'Скасувати підготовку', DeprovisionCancelLabel: 'Скасувати',
    },
    SiteSelectorField: {
      DefaultLabel: 'Цільовий сайт', CurrentSiteLabel: 'Поточний сайт', HubSiteLabel: 'Батьківський hub-сайт', HubNotAvailableLabel: 'Недоступно', SearchSiteLabel: 'Пошук сайту',
      SelectedSiteGroupAriaLabel: 'Вибраний сайт', SearchSitesAriaLabel: 'Пошук сайтів', SearchPlaceholder: 'Пошук за назвою або URL',
      SearchingLabel: 'Пошук', EmptySearchLabel: 'Введіть текст для пошуку', NoResultsLabel: 'Результатів не знайдено',
    },
    NavigationGuard: { LeavePageWarning: 'Операція виконується. Якщо ви вийдете, її буде перервано.' },
  };
});
