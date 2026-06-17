/**
 * Belarusian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Пацвердзіць',
      CancelLabel: 'Скасаваць',
    },

    LogPanel: {
      EmptyMessage: 'Журналы недаступныя',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Вынікі адпаведнасці недаступныя',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'У чаканні',
      RunningLabel: 'Выконваецца',
      ExecutedLabel: 'Выканана',
      FailedLabel: 'Не ўдалося',
      SkippedLabel: 'Прапушчана',

      SkipReasonNotFound: 'Не знойдзена',
      SkipReasonAlreadyExists: 'Ужо існуе',
      SkipReasonNoChanges: 'Няма змен',
      SkipReasonMissingPrerequisite: 'Адсутнічае папярэдняя ўмова',
      SkipReasonUnsupported: 'Не падтрымліваецца',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Адпавядае патрабаванням',
      NonCompliantLabel: 'Не адпавядае патрабаванням',
      UnverifiableLabel: 'Немагчыма праверыць',
      IgnoredLabel: 'Праігнаравана',
      BlockedLabel: 'Заблакіравана',

      PendingLabel: 'У чаканні',
      RunningLabel: 'Правяраецца',
      CancelledLabel: 'Скасавана',

      BlockedByPrefix: 'Заблакіравана праз',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Падрыхтоўка',
      CloseButtonAriaLabel: 'Закрыць',
      CloseLabel: 'Закрыць',
      BackToProvisioningLabel: 'Назад',

      TargetSiteLabel: 'Мэтавы сайт',
      TargetSiteMissingTitle: 'Мэтавы сайт адсутнічае',
      TargetSiteMissingMessage: 'Выберыце мэтавы сайт ва ўласцівасцях вэб-часткі перад запускам падрыхтоўкі.',
      ErrorFallbackCode: 'ПАМЫЛКА',

      TotalLabel: 'Усяго',
      SuccessLabel: 'Паспяхова',
      FailLabel: 'Не ўдалося',
      SkippedLabel: 'Прапушчана',
      PendingLabel: 'У чаканні',
      CompletedLabel: 'Завершана',

      FinalOutcomeSucceededLabel: 'Паспяхова',
      FinalOutcomeFailedLabel: 'Не ўдалося',
      FinalOutcomeCancelledLabel: 'Скасавана',
      FinalOutcomeRunningLabel: 'Выконваецца',

      InitialHelpProvisioningText: 'Выкарыстоўвайце Запусціць, каб пачаць падрыхтоўку для мэтавага сайта. Вы можаце праглядаць ход выканання і журналы падчас выканання дзеянняў.',
      InitialHelpComplianceText: 'Выкарыстоўвайце Праверыць, каб папярэдне праглядзець праблемы адпаведнасці перад ужываннем змен.',

      ProvisioningDefaultDescription: 'Запусціць падрыхтоўку з выкарыстаннем наладжанага плана.',
      ComplianceDefaultDescription: 'Запусціць праверку адпаведнасці з выкарыстаннем наладжанага плана.',

      ViewLogsLabel: 'Праглядзець журналы',
      CheckComplianceLabel: 'Праверыць',
      CancelLabel: 'Скасаваць',
      RunLabel: 'Запусціць',

      ConfirmRunTitle: 'Пацвердзіць запуск',
      ConfirmRunMessage: 'Вы ўпэўнены, што хочаце пачаць запуск?',

      ComplianceDefaultTitle: 'Адпаведнасць',
      ComplianceHeaderLabel: 'Праверка адпаведнасці',
      RunCheckLabel: 'Запусціць праверку',
      CancelCheckLabel: 'Скасаваць',
      CheckingLabel: 'Правяраецца адпаведнасць…',

      OverallCompliantLabel: 'Адпавядае патрабаванням',
      OverallWarningLabel: 'Папярэджанне',
      OverallNonCompliantLabel: 'Не адпавядае патрабаванням',
      OverallRunningLabel: 'Выконваецца',
      OverallCancelledLabel: 'Скасавана',

      CheckedLabel: 'Праверана',
      BlockedLabel: 'Заблакіравана',
      CompliantLabel: 'Адпавядае патрабаванням',
      NonCompliantLabel: 'Не адпавядае патрабаванням',
      UnverifiableLabel: 'Немагчыма праверыць',
      IgnoredLabel: 'Праігнаравана',

      ComplianceTargetSiteMissingTitle: 'Мэтавы сайт',
      ComplianceTargetSiteMissingMessage: 'Для запуску праверкі адпаведнасці патрабуецца URL мэтавага сайта.',
      ComplianceErrorFallbackTitle: 'Памылка',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Падрыхтоўка шаблона',
      ProvisionLabel: 'Падрыхтаваць',
      DeprovisionLabel: 'Адмяніць падрыхтоўку',
      CheckLabel: 'Праверыць',

      StateAppliedLabel: 'Ужыта',
      StateNotAppliedLabel: 'Не ўжыта',
      StateUnknownLabel: 'Невядома',

      ProvisioningDialogTitle: 'Падрыхтоўка',
      ProvisioningDialogDescription: 'Запусціць падрыхтоўку з выкарыстаннем наладжанага плана.',
      DeprovisioningDialogTitle: 'Адмена падрыхтоўкі',
      DeprovisioningDialogDescription: 'Запусціць адмену падрыхтоўкі з выкарыстаннем наладжанага плана.',

      DeprovisionConfirmRunTitle: 'Пацвердзіць адмену падрыхтоўкі',
      DeprovisionConfirmRunMessage: 'Вы ўпэўнены, што хочаце пачаць адмену падрыхтоўкі?',
      DeprovisionConfirmLabel: 'Адмяніць падрыхтоўку',
      DeprovisionCancelLabel: 'Скасаваць',
    },

    SiteSelectorField: {
      DefaultLabel: 'Мэтавы сайт',
      CurrentSiteLabel: 'Бягучы сайт',
      HubSiteLabel: 'Бацькоўскі hub-сайт',
      HubNotAvailableLabel: 'Недаступна',
      SearchSiteLabel: 'Пошук сайта',

      SelectedSiteGroupAriaLabel: 'Выбраны сайт',
      SearchSitesAriaLabel: 'Пошук сайтаў',
      SearchPlaceholder: 'Пошук па назве або URL',

      SearchingLabel: 'Пошук',
      EmptySearchLabel: 'Увядзіце тэкст для пошуку',
      NoResultsLabel: 'Вынікі не знойдзены',
    },

    NavigationGuard: {
      LeavePageWarning: 'Выконваецца аперацыя. Калі вы пакінеце старонку, яна будзе перапынена.',
    },
  };
});
