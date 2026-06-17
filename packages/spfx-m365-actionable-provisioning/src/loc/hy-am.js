/**
 * Armenian strings for provisioning-ui module.
 *
 * This file follows SPFx AMD module pattern for localization.
 * To add a new language, create a new file (e.g., it-it.js) with the same structure.
 */
define([], function () {
  return {
    // ConfirmDialog strings
    ConfirmDialog: {
      ConfirmLabel: 'Հաստատել',
      CancelLabel: 'Չեղարկել',
    },

    // LogPanel strings (provisioning mode)
    LogPanel: {
      EmptyMessage: 'Մատյաններ հասանելի չեն',
    },

    // LogPanel strings (compliance mode)
    ComplianceLogPanel: {
      EmptyMessage: 'Համապատասխանության արդյունքներ հասանելի չեն',
    },

    // Provisioning activity entry strings
    ProvisioningActivityEntry: {
      PendingLabel: 'Սպասման մեջ',
      RunningLabel: 'Կատարվում է',
      ExecutedLabel: 'Կատարված է',
      FailedLabel: 'Ձախողված',
      SkippedLabel: 'Բաց թողնված',

      // Skip reason labels
      SkipReasonNotFound: 'Չի գտնվել',
      SkipReasonAlreadyExists: 'Արդեն գոյություն ունի',
      SkipReasonNoChanges: 'Փոփոխություններ չկան',
      SkipReasonMissingPrerequisite: 'Նախապայմանը բացակայում է',
      SkipReasonUnsupported: 'Չի աջակցվում',
    },

    // Compliance activity entry strings
    ComplianceActivityEntry: {
      CompliantLabel: 'Համապատասխան',
      NonCompliantLabel: 'Ոչ համապատասխան',
      UnverifiableLabel: 'Հնարավոր չէ ստուգել',
      IgnoredLabel: 'Անտեսված',
      BlockedLabel: 'Արգելափակված',

      PendingLabel: 'Սպասման մեջ',
      RunningLabel: 'Ստուգվում է',
      CancelledLabel: 'Չեղարկված',

      BlockedByPrefix: 'Արգելափակվել է',
    },

    // ProvisioningDialog strings
    ProvisioningDialog: {
      // Dialog chrome
      DefaultTitle: 'Պատրաստում',
      CloseButtonAriaLabel: 'Փակել',
      CloseLabel: 'Փակել',
      BackToProvisioningLabel: 'Հետ',

      // Target site
      TargetSiteLabel: 'Թիրախային կայք',
      TargetSiteMissingTitle: 'Թիրախային կայքը բացակայում է',
      TargetSiteMissingMessage: 'Պատրաստումը գործարկելուց առաջ web part հատկություններում ընտրեք թիրախային կայք։',
      ErrorFallbackCode: 'ՍԽԱԼ',

      // KPIs
      TotalLabel: 'Ընդամենը',
      SuccessLabel: 'Հաջողություն',
      FailLabel: 'Ձախողված',
      SkippedLabel: 'Բաց թողնված',
      PendingLabel: 'Սպասման մեջ',
      CompletedLabel: 'Ավարտված',

      // Final outcomes
      FinalOutcomeSucceededLabel: 'Հաջողված',
      FinalOutcomeFailedLabel: 'Ձախողված',
      FinalOutcomeCancelledLabel: 'Չեղարկված',
      FinalOutcomeRunningLabel: 'Կատարվում է',

      // Help text
      InitialHelpProvisioningText: 'Օգտագործեք Գործարկել հրամանը՝ թիրախային կայքի համար պատրաստումը սկսելու համար։ Գործողությունների կատարման ընթացքում կարող եք դիտել ընթացքը և մատյանները։',
      InitialHelpComplianceText: 'Օգտագործեք Ստուգել հրամանը՝ փոփոխությունները կիրառելուց առաջ համապատասխանության խնդիրները նախադիտելու համար։',

      // Default descriptions (for dialog shell)
      ProvisioningDefaultDescription: 'Գործարկել պատրաստումը՝ օգտագործելով կազմաձևված պլանը։',
      ComplianceDefaultDescription: 'Գործարկել համապատասխանության ստուգումը՝ օգտագործելով կազմաձևված պլանը։',

      // Actions
      ViewLogsLabel: 'Դիտել մատյանները',
      CheckComplianceLabel: 'Ստուգել',
      CancelLabel: 'Չեղարկել',
      RunLabel: 'Գործարկել',

      // Confirmation
      ConfirmRunTitle: 'Հաստատել գործարկումը',
      ConfirmRunMessage: 'Վստա՞հ եք, որ ցանկանում եք սկսել գործարկումը։',

      // Compliance mode
      ComplianceDefaultTitle: 'Համապատասխանություն',
      ComplianceHeaderLabel: 'Համապատասխանության ստուգում',
      RunCheckLabel: 'Գործարկել ստուգումը',
      CancelCheckLabel: 'Չեղարկել',
      CheckingLabel: 'Համապատասխանությունը ստուգվում է...',

      // Compliance overall status
      OverallCompliantLabel: 'Համապատասխան',
      OverallWarningLabel: 'Զգուշացում',
      OverallNonCompliantLabel: 'Ոչ համապատասխան',
      OverallRunningLabel: 'Կատարվում է',
      OverallCancelledLabel: 'Չեղարկված',

      // Compliance counts
      CheckedLabel: 'Ստուգված',
      BlockedLabel: 'Արգելափակված',
      CompliantLabel: 'Համապատասխան',
      NonCompliantLabel: 'Ոչ համապատասխան',
      UnverifiableLabel: 'Հնարավոր չէ ստուգել',
      IgnoredLabel: 'Անտեսված',

      // Compliance errors
      ComplianceTargetSiteMissingTitle: 'Թիրախային կայք',
      ComplianceTargetSiteMissingMessage: 'Համապատասխանության ստուգումը գործարկելու համար պահանջվում է թիրախային կայքի URL։',
      ComplianceErrorFallbackTitle: 'Սխալ',
    },

    // PropertyPaneProvisioningField strings
    PropertyPaneProvisioningField: {
      // Default label
      DefaultLabel: 'Կաղապարի պատրաստում',

      // Actions
      ProvisionLabel: 'Պատրաստել',
      DeprovisionLabel: 'Հեռացնել պատրաստումը',
      CheckLabel: 'Ստուգել',

      // State badges
      StateAppliedLabel: 'Կիրառված',
      StateNotAppliedLabel: 'Կիրառված չէ',
      StateUnknownLabel: 'Անհայտ',

      // Dialog titles
      ProvisioningDialogTitle: 'Պատրաստում',
      ProvisioningDialogDescription: 'Գործարկել պատրաստումը՝ օգտագործելով կազմաձևված պլանը։',
      DeprovisioningDialogTitle: 'Պատրաստման հեռացում',
      DeprovisioningDialogDescription: 'Գործարկել պատրաստման հեռացումը՝ օգտագործելով կազմաձևված պլանը։',

      // Deprovision confirmation
      DeprovisionConfirmRunTitle: 'Հաստատել պատրաստման հեռացումը',
      DeprovisionConfirmRunMessage: 'Վստա՞հ եք, որ ցանկանում եք սկսել պատրաստման հեռացումը։',
      DeprovisionConfirmLabel: 'Հեռացնել պատրաստումը',
      DeprovisionCancelLabel: 'Չեղարկել',
    },

    // PropertyPaneSiteSelectorField strings
    SiteSelectorField: {
      // Default label
      DefaultLabel: 'Թիրախային կայք',

      // Mode labels
      CurrentSiteLabel: 'Ընթացիկ կայք',
      HubSiteLabel: 'Ծնող hub կայք',
      HubNotAvailableLabel: 'Հասանելի չէ',
      SearchSiteLabel: 'Որոնել կայք',

      // Accessibility
      SelectedSiteGroupAriaLabel: 'Ընտրված կայք',
      SearchSitesAriaLabel: 'Որոնել կայքեր',
      SearchPlaceholder: 'Որոնել վերնագրով կամ URL-ով',

      // Search states
      SearchingLabel: 'Որոնվում է',
      EmptySearchLabel: 'Մուտքագրեք որոնելու համար',
      NoResultsLabel: 'Արդյունքներ չեն գտնվել',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Գործողություն է կատարվում։ Եթե հեռանաք, այն կդադարեցվի։',
    },
  };
});
