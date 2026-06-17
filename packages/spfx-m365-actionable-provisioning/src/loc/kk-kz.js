/**
 * Kazakh strings for provisioning-ui module.
 *
 * This file follows SPFx AMD module pattern for localization.
 * To add a new language, create a new file (e.g., it-it.js) with the same structure.
 */
define([], function () {
  return {
    // ConfirmDialog strings
    ConfirmDialog: {
      ConfirmLabel: 'Растау',
      CancelLabel: 'Бас тарту',
    },

    // LogPanel strings (provisioning mode)
    LogPanel: {
      EmptyMessage: 'Журналдар жоқ',
    },

    // LogPanel strings (compliance mode)
    ComplianceLogPanel: {
      EmptyMessage: 'Сәйкестік нәтижелері жоқ',
    },

    // Provisioning activity entry strings
    ProvisioningActivityEntry: {
      PendingLabel: 'Күтуде',
      RunningLabel: 'Орындалуда',
      ExecutedLabel: 'Орындалды',
      FailedLabel: 'Сәтсіз',
      SkippedLabel: 'Өткізіп жіберілді',

      // Skip reason labels
      SkipReasonNotFound: 'Табылмады',
      SkipReasonAlreadyExists: 'Бұрыннан бар',
      SkipReasonNoChanges: 'Өзгерістер жоқ',
      SkipReasonMissingPrerequisite: 'Алғышарт жоқ',
      SkipReasonUnsupported: 'Қолдау көрсетілмейді',
    },

    // Compliance activity entry strings
    ComplianceActivityEntry: {
      CompliantLabel: 'Сәйкес',
      NonCompliantLabel: 'Сәйкес емес',
      UnverifiableLabel: 'Тексеру мүмкін емес',
      IgnoredLabel: 'Еленбеді',
      BlockedLabel: 'Бұғатталған',

      PendingLabel: 'Күтуде',
      RunningLabel: 'Тексерілуде',
      CancelledLabel: 'Бас тартылды',

      BlockedByPrefix: 'Бұғаттаған',
    },

    // ProvisioningDialog strings
    ProvisioningDialog: {
      // Dialog chrome
      DefaultTitle: 'Дайындау',
      CloseButtonAriaLabel: 'Жабу',
      CloseLabel: 'Жабу',
      BackToProvisioningLabel: 'Артқа',

      // Target site
      TargetSiteLabel: 'Мақсатты сайт',
      TargetSiteMissingTitle: 'Мақсатты сайт жоқ',
      TargetSiteMissingMessage: 'Дайындауды іске қоспас бұрын web part сипаттарында мақсатты сайтты таңдаңыз.',
      ErrorFallbackCode: 'ҚАТЕ',

      // KPIs
      TotalLabel: 'Барлығы',
      SuccessLabel: 'Сәтті',
      FailLabel: 'Сәтсіз',
      SkippedLabel: 'Өткізіп жіберілді',
      PendingLabel: 'Күтуде',
      CompletedLabel: 'Аяқталды',

      // Final outcomes
      FinalOutcomeSucceededLabel: 'Сәтті аяқталды',
      FinalOutcomeFailedLabel: 'Сәтсіз',
      FinalOutcomeCancelledLabel: 'Бас тартылды',
      FinalOutcomeRunningLabel: 'Орындалуда',

      // Help text
      InitialHelpProvisioningText: 'Мақсатты сайтта дайындауды бастау үшін Іске қосу пәрменін пайдаланыңыз. Әрекеттер орындалған кезде орындалу барысын және журналдарды қарап шығуға болады.',
      InitialHelpComplianceText: 'Өзгерістерді қолданбас бұрын сәйкестік мәселелерін алдын ала көру үшін Тексеру пәрменін пайдаланыңыз.',

      // Default descriptions (for dialog shell)
      ProvisioningDefaultDescription: 'Конфигурацияланған жоспарды пайдаланып дайындауды іске қосыңыз.',
      ComplianceDefaultDescription: 'Конфигурацияланған жоспарды пайдаланып сәйкестік тексеруін іске қосыңыз.',

      // Actions
      ViewLogsLabel: 'Журналдарды көру',
      CheckComplianceLabel: 'Тексеру',
      CancelLabel: 'Бас тарту',
      RunLabel: 'Іске қосу',

      // Confirmation
      ConfirmRunTitle: 'Іске қосуды растау',
      ConfirmRunMessage: 'Іске қосуды бастағыңыз келетініне сенімдісіз бе?',

      // Compliance mode
      ComplianceDefaultTitle: 'Сәйкестік',
      ComplianceHeaderLabel: 'Сәйкестік тексеруі',
      RunCheckLabel: 'Тексеруді іске қосу',
      CancelCheckLabel: 'Бас тарту',
      CheckingLabel: 'Сәйкестік тексерілуде...',

      // Compliance overall status
      OverallCompliantLabel: 'Сәйкес',
      OverallWarningLabel: 'Ескерту',
      OverallNonCompliantLabel: 'Сәйкес емес',
      OverallRunningLabel: 'Орындалуда',
      OverallCancelledLabel: 'Бас тартылды',

      // Compliance counts
      CheckedLabel: 'Тексерілді',
      BlockedLabel: 'Бұғатталған',
      CompliantLabel: 'Сәйкес',
      NonCompliantLabel: 'Сәйкес емес',
      UnverifiableLabel: 'Тексеру мүмкін емес',
      IgnoredLabel: 'Еленбеді',

      // Compliance errors
      ComplianceTargetSiteMissingTitle: 'Мақсатты сайт',
      ComplianceTargetSiteMissingMessage: 'Сәйкестік тексеруін іске қосу үшін мақсатты сайт URL мекенжайы қажет.',
      ComplianceErrorFallbackTitle: 'Қате',
    },

    // PropertyPaneProvisioningField strings
    PropertyPaneProvisioningField: {
      // Default label
      DefaultLabel: 'Үлгіні дайындау',

      // Actions
      ProvisionLabel: 'Дайындау',
      DeprovisionLabel: 'Дайындауды жою',
      CheckLabel: 'Тексеру',

      // State badges
      StateAppliedLabel: 'Қолданылды',
      StateNotAppliedLabel: 'Қолданылмаған',
      StateUnknownLabel: 'Белгісіз',

      // Dialog titles
      ProvisioningDialogTitle: 'Дайындау',
      ProvisioningDialogDescription: 'Конфигурацияланған жоспарды пайдаланып дайындауды іске қосыңыз.',
      DeprovisioningDialogTitle: 'Дайындауды жою',
      DeprovisioningDialogDescription: 'Конфигурацияланған жоспарды пайдаланып дайындауды жоюды іске қосыңыз.',

      // Deprovision confirmation
      DeprovisionConfirmRunTitle: 'Дайындауды жоюды растау',
      DeprovisionConfirmRunMessage: 'Дайындауды жоюды бастағыңыз келетініне сенімдісіз бе?',
      DeprovisionConfirmLabel: 'Дайындауды жою',
      DeprovisionCancelLabel: 'Бас тарту',
    },

    // PropertyPaneSiteSelectorField strings
    SiteSelectorField: {
      // Default label
      DefaultLabel: 'Мақсатты сайт',

      // Mode labels
      CurrentSiteLabel: 'Ағымдағы сайт',
      HubSiteLabel: 'Негізгі hub сайты',
      HubNotAvailableLabel: 'Қолжетімді емес',
      SearchSiteLabel: 'Сайтты іздеу',

      // Accessibility
      SelectedSiteGroupAriaLabel: 'Таңдалған сайт',
      SearchSitesAriaLabel: 'Сайттарды іздеу',
      SearchPlaceholder: 'Тақырып немесе URL бойынша іздеу',

      // Search states
      SearchingLabel: 'Ізделуде',
      EmptySearchLabel: 'Іздеу үшін теріңіз',
      NoResultsLabel: 'Нәтижелер табылмады',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Операция орындалуда. Егер шықсаңыз, ол үзіледі.',
    },
  };
});
