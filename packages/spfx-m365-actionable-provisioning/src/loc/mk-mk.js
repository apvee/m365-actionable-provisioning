/**
 * Macedonian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Потврди',
      CancelLabel: 'Откажи',
    },

    LogPanel: {
      EmptyMessage: 'Нема достапни записи',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Нема достапни резултати за усогласеност',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'На чекање',
      RunningLabel: 'Се извршува',
      ExecutedLabel: 'Извршено',
      FailedLabel: 'Неуспешно',
      SkippedLabel: 'Прескокнато',

      SkipReasonNotFound: 'Не е пронајдено',
      SkipReasonAlreadyExists: 'Веќе постои',
      SkipReasonNoChanges: 'Нема промени',
      SkipReasonMissingPrerequisite: 'Недостасува предуслов',
      SkipReasonUnsupported: 'Не е поддржано',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Усогласено',
      NonCompliantLabel: 'Неусогласено',
      UnverifiableLabel: 'Не може да се провери',
      IgnoredLabel: 'Игнорирано',
      BlockedLabel: 'Блокирано',

      PendingLabel: 'На чекање',
      RunningLabel: 'Се проверува',
      CancelledLabel: 'Откажано',

      BlockedByPrefix: 'Блокирано од',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Обезбедување',
      CloseButtonAriaLabel: 'Затвори',
      CloseLabel: 'Затвори',
      BackToProvisioningLabel: 'Назад',

      TargetSiteLabel: 'Целна локација',
      TargetSiteMissingTitle: 'Недостасува целна локација',
      TargetSiteMissingMessage: 'Изберете целна локација во својствата на web part пред да го извршите обезбедувањето.',
      ErrorFallbackCode: 'ГРЕШКА',

      TotalLabel: 'Вкупно',
      SuccessLabel: 'Успех',
      FailLabel: 'Неуспешно',
      SkippedLabel: 'Прескокнато',
      PendingLabel: 'На чекање',
      CompletedLabel: 'Завршено',

      FinalOutcomeSucceededLabel: 'Успешно',
      FinalOutcomeFailedLabel: 'Неуспешно',
      FinalOutcomeCancelledLabel: 'Откажано',
      FinalOutcomeRunningLabel: 'Се извршува',

      InitialHelpProvisioningText: 'Користете Изврши за да започнете обезбедување на целната локација. Можете да го прегледувате напредокот и записите додека се извршуваат дејствата.',
      InitialHelpComplianceText: 'Користете Провери за да ги прегледате проблемите со усогласеност пред да ги примените промените.',

      ProvisioningDefaultDescription: 'Извршете обезбедување со конфигурираниот план.',
      ComplianceDefaultDescription: 'Извршете проверка на усогласеност со конфигурираниот план.',

      ViewLogsLabel: 'Прикажи записи',
      CheckComplianceLabel: 'Провери',
      CancelLabel: 'Откажи',
      RunLabel: 'Изврши',

      ConfirmRunTitle: 'Потврди извршување',
      ConfirmRunMessage: 'Дали сте сигурни дека сакате да го започнете извршувањето?',

      ComplianceDefaultTitle: 'Усогласеност',
      ComplianceHeaderLabel: 'Проверка на усогласеност',
      RunCheckLabel: 'Изврши проверка',
      CancelCheckLabel: 'Откажи',
      CheckingLabel: 'Се проверува усогласеноста…',

      OverallCompliantLabel: 'Усогласено',
      OverallWarningLabel: 'Предупредување',
      OverallNonCompliantLabel: 'Неусогласено',
      OverallRunningLabel: 'Се извршува',
      OverallCancelledLabel: 'Откажано',

      CheckedLabel: 'Проверено',
      BlockedLabel: 'Блокирано',
      CompliantLabel: 'Усогласено',
      NonCompliantLabel: 'Неусогласено',
      UnverifiableLabel: 'Не може да се провери',
      IgnoredLabel: 'Игнорирано',

      ComplianceTargetSiteMissingTitle: 'Целна локација',
      ComplianceTargetSiteMissingMessage: 'Потребна е URL-адреса на целната локација за да се изврши проверката на усогласеност.',
      ComplianceErrorFallbackTitle: 'Грешка',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Обезбедување шаблон',
      ProvisionLabel: 'Обезбеди',
      DeprovisionLabel: 'Отстрани обезбедување',
      CheckLabel: 'Провери',

      StateAppliedLabel: 'Применето',
      StateNotAppliedLabel: 'Не е применето',
      StateUnknownLabel: 'Непознато',

      ProvisioningDialogTitle: 'Обезбедување',
      ProvisioningDialogDescription: 'Извршете обезбедување со конфигурираниот план.',
      DeprovisioningDialogTitle: 'Отстранување обезбедување',
      DeprovisioningDialogDescription: 'Извршете отстранување на обезбедување со конфигурираниот план.',

      DeprovisionConfirmRunTitle: 'Потврди отстранување обезбедување',
      DeprovisionConfirmRunMessage: 'Дали сте сигурни дека сакате да започнете отстранување на обезбедувањето?',
      DeprovisionConfirmLabel: 'Отстрани обезбедување',
      DeprovisionCancelLabel: 'Откажи',
    },

    SiteSelectorField: {
      DefaultLabel: 'Целна локација',
      CurrentSiteLabel: 'Тековна локација',
      HubSiteLabel: 'Родителска hub локација',
      HubNotAvailableLabel: 'Не е достапно',
      SearchSiteLabel: 'Пребарај локација',

      SelectedSiteGroupAriaLabel: 'Избрана локација',
      SearchSitesAriaLabel: 'Пребарај локации',
      SearchPlaceholder: 'Пребарај по наслов или URL',

      SearchingLabel: 'Се пребарува',
      EmptySearchLabel: 'Внесете за пребарување',
      NoResultsLabel: 'Не се пронајдени резултати',
    },

    NavigationGuard: {
      LeavePageWarning: 'Операција е во тек. Ако ја напуштите страницата, таа ќе биде прекината.',
    },
  };
});
