/**
 * Bulgarian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Потвърждаване', CancelLabel: 'Отказ' },
    LogPanel: { EmptyMessage: 'Няма налични регистрационни файлове' },
    ComplianceLogPanel: { EmptyMessage: 'Няма налични резултати за съответствие' },
    ProvisioningActivityEntry: {
      PendingLabel: 'В изчакване', RunningLabel: 'Изпълнява се', ExecutedLabel: 'Изпълнено', FailedLabel: 'Неуспешно', SkippedLabel: 'Пропуснато',
      SkipReasonNotFound: 'Не е намерено', SkipReasonAlreadyExists: 'Вече съществува', SkipReasonNoChanges: 'Няма промени', SkipReasonMissingPrerequisite: 'Липсва предварително условие', SkipReasonUnsupported: 'Не се поддържа',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Съответства', NonCompliantLabel: 'Не съответства', UnverifiableLabel: 'Не може да се провери', IgnoredLabel: 'Игнорирано', BlockedLabel: 'Блокирано',
      PendingLabel: 'В изчакване', RunningLabel: 'Проверява се', CancelledLabel: 'Отменено',
      BlockedByPrefix: 'Блокирано от',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Осигуряване', CloseButtonAriaLabel: 'Затваряне', CloseLabel: 'Затваряне', BackToProvisioningLabel: 'Назад',
      TargetSiteLabel: 'Целеви сайт', TargetSiteMissingTitle: 'Липсва целеви сайт', TargetSiteMissingMessage: 'Изберете целеви сайт в свойствата на Web Part, преди да изпълните осигуряването.', ErrorFallbackCode: 'ГРЕШКА',
      TotalLabel: 'Общо', SuccessLabel: 'Успех', FailLabel: 'Неуспешно', SkippedLabel: 'Пропуснато', PendingLabel: 'В изчакване', CompletedLabel: 'Завършено',
      FinalOutcomeSucceededLabel: 'Успешно', FinalOutcomeFailedLabel: 'Неуспешно', FinalOutcomeCancelledLabel: 'Отменено', FinalOutcomeRunningLabel: 'Изпълнява се',
      InitialHelpProvisioningText: 'Използвайте Изпълнение, за да стартирате осигуряване за целевия сайт. Можете да преглеждате напредъка и регистрационните файлове, докато действията се изпълняват.', InitialHelpComplianceText: 'Използвайте Проверка, за да прегледате проблемите със съответствието, преди да приложите промени.',
      ProvisioningDefaultDescription: 'Изпълнете осигуряването с конфигурирания план.', ComplianceDefaultDescription: 'Изпълнете проверката за съответствие с конфигурирания план.',
      ViewLogsLabel: 'Преглед на регистрационни файлове', CheckComplianceLabel: 'Проверка', CancelLabel: 'Отказ', RunLabel: 'Изпълнение',
      ConfirmRunTitle: 'Потвърждаване на изпълнението', ConfirmRunMessage: 'Сигурни ли сте, че искате да стартирате изпълнението?',
      ComplianceDefaultTitle: 'Съответствие', ComplianceHeaderLabel: 'Проверка за съответствие', RunCheckLabel: 'Изпълнение на проверка', CancelCheckLabel: 'Отказ', CheckingLabel: 'Проверява се съответствието...',
      OverallCompliantLabel: 'Съответства', OverallWarningLabel: 'Предупреждение', OverallNonCompliantLabel: 'Не съответства', OverallRunningLabel: 'Изпълнява се', OverallCancelledLabel: 'Отменено',
      CheckedLabel: 'Проверено', BlockedLabel: 'Блокирано', CompliantLabel: 'Съответства', NonCompliantLabel: 'Не съответства', UnverifiableLabel: 'Не може да се провери', IgnoredLabel: 'Игнорирано',
      ComplianceTargetSiteMissingTitle: 'Целеви сайт', ComplianceTargetSiteMissingMessage: 'За изпълнение на проверката за съответствие е необходим URL адрес на целевия сайт.', ComplianceErrorFallbackTitle: 'Грешка',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Осигуряване на шаблон', ProvisionLabel: 'Осигуряване', DeprovisionLabel: 'Премахване на осигуряване', CheckLabel: 'Проверка',
      StateAppliedLabel: 'Приложено', StateNotAppliedLabel: 'Не е приложено', StateUnknownLabel: 'Неизвестно',
      ProvisioningDialogTitle: 'Осигуряване', ProvisioningDialogDescription: 'Изпълнете осигуряването с конфигурирания план.', DeprovisioningDialogTitle: 'Премахване на осигуряване', DeprovisioningDialogDescription: 'Изпълнете премахване на осигуряването с конфигурирания план.',
      DeprovisionConfirmRunTitle: 'Потвърждаване на премахването на осигуряване', DeprovisionConfirmRunMessage: 'Сигурни ли сте, че искате да започнете премахване на осигуряването?', DeprovisionConfirmLabel: 'Премахване на осигуряване', DeprovisionCancelLabel: 'Отказ',
    },
    SiteSelectorField: {
      DefaultLabel: 'Целеви сайт', CurrentSiteLabel: 'Текущ сайт', HubSiteLabel: 'Родителски hub сайт', HubNotAvailableLabel: 'Не е налично', SearchSiteLabel: 'Търсене на сайт',
      SelectedSiteGroupAriaLabel: 'Избран сайт', SearchSitesAriaLabel: 'Търсене на сайтове', SearchPlaceholder: 'Търсене по заглавие или URL',
      SearchingLabel: 'Търсене', EmptySearchLabel: 'Въведете за търсене', NoResultsLabel: 'Няма намерени резултати',
    },
    NavigationGuard: { LeavePageWarning: 'Изпълнява се операция. Ако напуснете, тя ще бъде прекъсната.' },
  };
});
