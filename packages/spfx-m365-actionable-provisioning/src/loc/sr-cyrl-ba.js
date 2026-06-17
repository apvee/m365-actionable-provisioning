/**
 * Serbian (Cyrillic, Bosnia and Herzegovina) strings for provisioning-ui module.
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
      FailedLabel: 'Неуспјело',
      SkippedLabel: 'Прескочено',

      SkipReasonNotFound: 'Није пронађено',
      SkipReasonAlreadyExists: 'Већ постоји',
      SkipReasonNoChanges: 'Нема промјена',
      SkipReasonMissingPrerequisite: 'Недостаје предуслов',
      SkipReasonUnsupported: 'Није подржано',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Усаглашено',
      NonCompliantLabel: 'Неусаглашено',
      UnverifiableLabel: 'Није могуће провјерити',
      IgnoredLabel: 'Игнорисано',
      BlockedLabel: 'Блокирано',

      PendingLabel: 'На чекању',
      RunningLabel: 'Провјера',
      CancelledLabel: 'Отказано',

      BlockedByPrefix: 'Блокирано од',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Обезбјеђивање',
      CloseButtonAriaLabel: 'Затвори',
      CloseLabel: 'Затвори',
      BackToProvisioningLabel: 'Назад',

      TargetSiteLabel: 'Циљна локација',
      TargetSiteMissingTitle: 'Недостаје циљна локација',
      TargetSiteMissingMessage: 'Изаберите циљну локацију у својствима web part прије покретања обезбјеђивања.',
      ErrorFallbackCode: 'ГРЕШКА',

      TotalLabel: 'Укупно',
      SuccessLabel: 'Успјех',
      FailLabel: 'Неуспјело',
      SkippedLabel: 'Прескочено',
      PendingLabel: 'На чекању',
      CompletedLabel: 'Завршено',

      FinalOutcomeSucceededLabel: 'Успјело',
      FinalOutcomeFailedLabel: 'Неуспјело',
      FinalOutcomeCancelledLabel: 'Отказано',
      FinalOutcomeRunningLabel: 'У току',

      InitialHelpProvisioningText: 'Користите Покрени да започнете обезбјеђивање на циљној локацији. Можете прегледати напредак и записе док се радње извршавају.',
      InitialHelpComplianceText: 'Користите Провјери да прегледате проблеме са усаглашеношћу прије примјене промјена.',

      ProvisioningDefaultDescription: 'Покрените обезбјеђивање користећи конфигурисани план.',
      ComplianceDefaultDescription: 'Покрените провјеру усаглашености користећи конфигурисани план.',

      ViewLogsLabel: 'Прикажи записе',
      CheckComplianceLabel: 'Провјери',
      CancelLabel: 'Откажи',
      RunLabel: 'Покрени',

      ConfirmRunTitle: 'Потврди покретање',
      ConfirmRunMessage: 'Да ли сте сигурни да желите започети покретање?',

      ComplianceDefaultTitle: 'Усаглашеност',
      ComplianceHeaderLabel: 'Провјера усаглашености',
      RunCheckLabel: 'Покрени провјеру',
      CancelCheckLabel: 'Откажи',
      CheckingLabel: 'Провјера усаглашености…',

      OverallCompliantLabel: 'Усаглашено',
      OverallWarningLabel: 'Упозорење',
      OverallNonCompliantLabel: 'Неусаглашено',
      OverallRunningLabel: 'У току',
      OverallCancelledLabel: 'Отказано',

      CheckedLabel: 'Провјерено',
      BlockedLabel: 'Блокирано',
      CompliantLabel: 'Усаглашено',
      NonCompliantLabel: 'Неусаглашено',
      UnverifiableLabel: 'Није могуће провјерити',
      IgnoredLabel: 'Игнорисано',

      ComplianceTargetSiteMissingTitle: 'Циљна локација',
      ComplianceTargetSiteMissingMessage: 'URL циљне локације је потребан за покретање провјере усаглашености.',
      ComplianceErrorFallbackTitle: 'Грешка',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Обезбјеђивање предлошка',
      ProvisionLabel: 'Обезбиједи',
      DeprovisionLabel: 'Уклони обезбјеђивање',
      CheckLabel: 'Провјери',

      StateAppliedLabel: 'Примијењено',
      StateNotAppliedLabel: 'Није примијењено',
      StateUnknownLabel: 'Непознато',

      ProvisioningDialogTitle: 'Обезбјеђивање',
      ProvisioningDialogDescription: 'Покрените обезбјеђивање користећи конфигурисани план.',
      DeprovisioningDialogTitle: 'Уклањање обезбјеђивања',
      DeprovisioningDialogDescription: 'Покрените уклањање обезбјеђивања користећи конфигурисани план.',

      DeprovisionConfirmRunTitle: 'Потврди уклањање обезбјеђивања',
      DeprovisionConfirmRunMessage: 'Да ли сте сигурни да желите започети уклањање обезбјеђивања?',
      DeprovisionConfirmLabel: 'Уклони обезбјеђивање',
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
