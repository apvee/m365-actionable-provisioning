/**
 * Serbian (Cyrillic, Serbia) strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Потврди',
      CancelLabel: 'Откажи',
    },

    LogPanel: {
      EmptyMessage: 'Нема доступних записа',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Нема доступних резултата усаглашености',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'На чекању',
      RunningLabel: 'У току',
      ExecutedLabel: 'Извршено',
      FailedLabel: 'Неуспело',
      SkippedLabel: 'Прескочено',

      SkipReasonNotFound: 'Није пронађено',
      SkipReasonAlreadyExists: 'Већ постоји',
      SkipReasonNoChanges: 'Нема промена',
      SkipReasonMissingPrerequisite: 'Недостаје предуслов',
      SkipReasonUnsupported: 'Није подржано',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Усаглашено',
      NonCompliantLabel: 'Неусаглашено',
      UnverifiableLabel: 'Није могуће проверити',
      IgnoredLabel: 'Игнорисано',
      BlockedLabel: 'Блокирано',

      PendingLabel: 'На чекању',
      RunningLabel: 'Провера',
      CancelledLabel: 'Отказано',

      BlockedByPrefix: 'Блокирано од',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Обезбеђивање',
      CloseButtonAriaLabel: 'Затвори',
      CloseLabel: 'Затвори',
      BackToProvisioningLabel: 'Назад',

      TargetSiteLabel: 'Циљна локација',
      TargetSiteMissingTitle: 'Недостаје циљна локација',
      TargetSiteMissingMessage: 'Изаберите циљну локацију у својствима web part пре покретања обезбеђивања.',
      ErrorFallbackCode: 'ГРЕШКА',

      TotalLabel: 'Укупно',
      SuccessLabel: 'Успех',
      FailLabel: 'Неуспело',
      SkippedLabel: 'Прескочено',
      PendingLabel: 'На чекању',
      CompletedLabel: 'Завршено',

      FinalOutcomeSucceededLabel: 'Успело',
      FinalOutcomeFailedLabel: 'Неуспело',
      FinalOutcomeCancelledLabel: 'Отказано',
      FinalOutcomeRunningLabel: 'У току',

      InitialHelpProvisioningText: 'Користите Покрени да започнете обезбеђивање на циљној локацији. Можете прегледати напредак и записе док се радње извршавају.',
      InitialHelpComplianceText: 'Користите Провери да прегледате проблеме са усаглашеношћу пре примене промена.',

      ProvisioningDefaultDescription: 'Покрените обезбеђивање користећи конфигурисани план.',
      ComplianceDefaultDescription: 'Покрените проверу усаглашености користећи конфигурисани план.',

      ViewLogsLabel: 'Прикажи записе',
      CheckComplianceLabel: 'Провери',
      CancelLabel: 'Откажи',
      RunLabel: 'Покрени',

      ConfirmRunTitle: 'Потврди покретање',
      ConfirmRunMessage: 'Да ли сте сигурни да желите да започнете покретање?',

      ComplianceDefaultTitle: 'Усаглашеност',
      ComplianceHeaderLabel: 'Провера усаглашености',
      RunCheckLabel: 'Покрени проверу',
      CancelCheckLabel: 'Откажи',
      CheckingLabel: 'Провера усаглашености…',

      OverallCompliantLabel: 'Усаглашено',
      OverallWarningLabel: 'Упозорење',
      OverallNonCompliantLabel: 'Неусаглашено',
      OverallRunningLabel: 'У току',
      OverallCancelledLabel: 'Отказано',

      CheckedLabel: 'Проверено',
      BlockedLabel: 'Блокирано',
      CompliantLabel: 'Усаглашено',
      NonCompliantLabel: 'Неусаглашено',
      UnverifiableLabel: 'Није могуће проверити',
      IgnoredLabel: 'Игнорисано',

      ComplianceTargetSiteMissingTitle: 'Циљна локација',
      ComplianceTargetSiteMissingMessage: 'URL циљне локације је потребан за покретање провере усаглашености.',
      ComplianceErrorFallbackTitle: 'Грешка',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Обезбеђивање предлошка',
      ProvisionLabel: 'Обезбеди',
      DeprovisionLabel: 'Уклони обезбеђивање',
      CheckLabel: 'Провери',

      StateAppliedLabel: 'Примењено',
      StateNotAppliedLabel: 'Није примењено',
      StateUnknownLabel: 'Непознато',

      ProvisioningDialogTitle: 'Обезбеђивање',
      ProvisioningDialogDescription: 'Покрените обезбеђивање користећи конфигурисани план.',
      DeprovisioningDialogTitle: 'Уклањање обезбеђивања',
      DeprovisioningDialogDescription: 'Покрените уклањање обезбеђивања користећи конфигурисани план.',

      DeprovisionConfirmRunTitle: 'Потврди уклањање обезбеђивања',
      DeprovisionConfirmRunMessage: 'Да ли сте сигурни да желите да започнете уклањање обезбеђивања?',
      DeprovisionConfirmLabel: 'Уклони обезбеђивање',
      DeprovisionCancelLabel: 'Откажи',
    },

    SiteSelectorField: {
      DefaultLabel: 'Циљна локација',
      CurrentSiteLabel: 'Тренутна локација',
      HubSiteLabel: 'Родитељска hub локација',
      HubNotAvailableLabel: 'Није доступно',
      SearchSiteLabel: 'Претражи локацију',

      SelectedSiteGroupAriaLabel: 'Изабрана локација',
      SearchSitesAriaLabel: 'Претражи локације',
      SearchPlaceholder: 'Претражи по наслову или URL-у',

      SearchingLabel: 'Претраживање',
      EmptySearchLabel: 'Унесите текст за претрагу',
      NoResultsLabel: 'Нема пронађених резултата',
    },

    NavigationGuard: {
      LeavePageWarning: 'Операција је у току. Ако напустите страницу, биће прекинута.',
    },
  };
});
