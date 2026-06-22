/**
 * Tatar strings for provisioning-ui module.
 *
 * This file follows SPFx AMD module pattern for localization.
 * To add a new language, create a new file (e.g., it-it.js) with the same structure.
 */
define([], function () {
  return {
    // ConfirmDialog strings
    ConfirmDialog: {
      ConfirmLabel: 'Раслау',
      CancelLabel: 'Баш тарту',
    },

    // LogPanel strings (provisioning mode)
    LogPanel: {
      EmptyMessage: 'Журналлар юк',
    },

    // LogPanel strings (compliance mode)
    ComplianceLogPanel: {
      EmptyMessage: 'Тиешлелек нәтиҗәләре юк',
    },

    // Provisioning activity entry strings
    ProvisioningActivityEntry: {
      PendingLabel: 'Көтелә',
      RunningLabel: 'Башкарыла',
      ExecutedLabel: 'Башкарылды',
      FailedLabel: 'Уңышсыз',
      SkippedLabel: 'Калдырып кителде',

      // Skip reason labels
      SkipReasonNotFound: 'Табылмады',
      SkipReasonAlreadyExists: 'Инде бар',
      SkipReasonNoChanges: 'Үзгәрешләр юк',
      SkipReasonMissingPrerequisite: 'Алшарт юк',
      SkipReasonUnsupported: 'Ярдәм ителми',
    },

    // Compliance activity entry strings
    ComplianceActivityEntry: {
      CompliantLabel: 'Тиешле',
      NonCompliantLabel: 'Тиешле түгел',
      UnverifiableLabel: 'Тикшереп булмый',
      IgnoredLabel: 'Игътибарсыз калдырылды',
      BlockedLabel: 'Блокланган',

      PendingLabel: 'Көтелә',
      RunningLabel: 'Тикшерелә',
      CancelledLabel: 'Баш тартылды',

      BlockedByPrefix: 'Блоклаучы',
    },

    // ProvisioningDialog strings
    ProvisioningDialog: {
      // Dialog chrome
      DefaultTitle: 'Әзерләү',
      CloseButtonAriaLabel: 'Ябу',
      CloseLabel: 'Ябу',
      BackToProvisioningLabel: 'Артка',

      // Target site
      TargetSiteLabel: 'Максат сайт',
      TargetSiteMissingTitle: 'Максат сайт юк',
      TargetSiteMissingMessage: 'Әзерләүне эшләтеп җибәргәнче web part үзлекләрендә максат сайтны сайлагыз.',
      ErrorFallbackCode: 'ХАТА',

      // KPIs
      TotalLabel: 'Барлыгы',
      SuccessLabel: 'Уңыш',
      FailLabel: 'Уңышсыз',
      SkippedLabel: 'Калдырып кителде',
      PendingLabel: 'Көтелә',
      CompletedLabel: 'Тәмамланды',

      // Final outcomes
      FinalOutcomeSucceededLabel: 'Уңышлы булды',
      FinalOutcomeFailedLabel: 'Уңышсыз',
      FinalOutcomeCancelledLabel: 'Баш тартылды',
      FinalOutcomeRunningLabel: 'Башкарыла',

      // Help text
      InitialHelpProvisioningText: 'Максат сайтта әзерләүне башлау өчен Эшләтеп җибәрүне кулланыгыз. Гамәлләр башкарылганда барышны һәм журналларны карый аласыз.',
      InitialHelpComplianceText: 'Үзгәрешләрне кулланганчы тиешлелек проблемаларын алдан карау өчен Тикшерүне кулланыгыз.',

      // Default descriptions (for dialog shell)
      ProvisioningDefaultDescription: 'Көйләнгән планны кулланып әзерләүне эшләтеп җибәрегез.',
      ComplianceDefaultDescription: 'Көйләнгән планны кулланып тиешлелек тикшерүен эшләтеп җибәрегез.',

      // Actions
      ViewLogsLabel: 'Журналларны карау',
      CheckComplianceLabel: 'Тикшерү',
      CancelLabel: 'Баш тарту',
      RunLabel: 'Эшләтеп җибәрү',

      // Confirmation
      ConfirmRunTitle: 'Эшләтеп җибәрүне раслау',
      ConfirmRunMessage: 'Эшләтеп җибәрүне башларга теләвегезгә ышанасызмы?',

      // Compliance mode
      ComplianceDefaultTitle: 'Тиешлелек',
      ComplianceHeaderLabel: 'Тиешлелек тикшерүе',
      RunCheckLabel: 'Тикшерүне эшләтеп җибәрү',
      CancelCheckLabel: 'Баш тарту',
      CheckingLabel: 'Тиешлелек тикшерелә...',

      // Compliance overall status
      OverallCompliantLabel: 'Тиешле',
      OverallWarningLabel: 'Кисәтү',
      OverallNonCompliantLabel: 'Тиешле түгел',
      OverallRunningLabel: 'Башкарыла',
      OverallCancelledLabel: 'Баш тартылды',

      // Compliance counts
      CheckedLabel: 'Тикшерелде',
      BlockedLabel: 'Блокланган',
      CompliantLabel: 'Тиешле',
      NonCompliantLabel: 'Тиешле түгел',
      UnverifiableLabel: 'Тикшереп булмый',
      IgnoredLabel: 'Игътибарсыз калдырылды',

      // Compliance errors
      ComplianceTargetSiteMissingTitle: 'Максат сайт',
      ComplianceTargetSiteMissingMessage: 'Тиешлелек тикшерүен эшләтеп җибәрү өчен максат сайт URL-ы кирәк.',
      ComplianceErrorFallbackTitle: 'Хата',
    },

    // PropertyPaneProvisioningField strings
    PropertyPaneProvisioningField: {
      // Default label
      DefaultLabel: 'Шаблон әзерләү',

      // Actions
      ProvisionLabel: 'Әзерләү',
      DeprovisionLabel: 'Әзерләүне бетерү',
      CheckLabel: 'Тикшерү',

      // State badges
      StateAppliedLabel: 'Кулланылды',
      StateNotAppliedLabel: 'Кулланылмаган',
      StateUnknownLabel: 'Билгесез',

      // Dialog titles
      ProvisioningDialogTitle: 'Әзерләү',
      ProvisioningDialogDescription: 'Көйләнгән планны кулланып әзерләүне эшләтеп җибәрегез.',
      DeprovisioningDialogTitle: 'Әзерләүне бетерү',
      DeprovisioningDialogDescription: 'Көйләнгән планны кулланып әзерләүне бетерүне эшләтеп җибәрегез.',

      // Deprovision confirmation
      DeprovisionConfirmRunTitle: 'Әзерләүне бетерүне раслау',
      DeprovisionConfirmRunMessage: 'Әзерләүне бетерүне башларга теләвегезгә ышанасызмы?',
      DeprovisionConfirmLabel: 'Әзерләүне бетерү',
      DeprovisionCancelLabel: 'Баш тарту',
    },

    // PropertyPaneSiteSelectorField strings
    SiteSelectorField: {
      // Default label
      DefaultLabel: 'Максат сайт',

      // Mode labels
      CurrentSiteLabel: 'Хәзерге сайт',
      HubSiteLabel: 'Ана hub сайты',
      HubNotAvailableLabel: 'Мөмкин түгел',
      SearchSiteLabel: 'Сайт эзләү',

      // Accessibility
      SelectedSiteGroupAriaLabel: 'Сайланган сайт',
      SearchSitesAriaLabel: 'Сайтлар эзләү',
      SearchPlaceholder: 'Исем яки URL буенча эзләү',

      // Search states
      SearchingLabel: 'Эзләнә',
      EmptySearchLabel: 'Эзләү өчен языгыз',
      NoResultsLabel: 'Нәтиҗәләр табылмады',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Операция бара. Китсәгез, ул өзеләчәк.',
    },
  };
});
