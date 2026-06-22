/**
 * Georgian strings for provisioning-ui module.
 *
 * This file follows SPFx AMD module pattern for localization.
 * To add a new language, create a new file (e.g., it-it.js) with the same structure.
 */
define([], function () {
  return {
    // ConfirmDialog strings
    ConfirmDialog: {
      ConfirmLabel: 'დადასტურება',
      CancelLabel: 'გაუქმება',
    },

    // LogPanel strings (provisioning mode)
    LogPanel: {
      EmptyMessage: 'ჟურნალები ხელმისაწვდომი არ არის',
    },

    // LogPanel strings (compliance mode)
    ComplianceLogPanel: {
      EmptyMessage: 'შესაბამისობის შედეგები ხელმისაწვდომი არ არის',
    },

    // Provisioning activity entry strings
    ProvisioningActivityEntry: {
      PendingLabel: 'მოლოდინში',
      RunningLabel: 'მიმდინარეობს',
      ExecutedLabel: 'შესრულებულია',
      FailedLabel: 'წარუმატებელი',
      SkippedLabel: 'გამოტოვებულია',

      // Skip reason labels
      SkipReasonNotFound: 'ვერ მოიძებნა',
      SkipReasonAlreadyExists: 'უკვე არსებობს',
      SkipReasonNoChanges: 'ცვლილებები არ არის',
      SkipReasonMissingPrerequisite: 'წინაპირობა აკლია',
      SkipReasonUnsupported: 'მხარდაჭერილი არ არის',
    },

    // Compliance activity entry strings
    ComplianceActivityEntry: {
      CompliantLabel: 'შესაბამისია',
      NonCompliantLabel: 'არ შეესაბამება',
      UnverifiableLabel: 'ვერ მოწმდება',
      IgnoredLabel: 'იგნორირებულია',
      BlockedLabel: 'დაბლოკილია',

      PendingLabel: 'მოლოდინში',
      RunningLabel: 'მოწმდება',
      CancelledLabel: 'გაუქმებულია',

      BlockedByPrefix: 'დაბლოკილია',
    },

    // ProvisioningDialog strings
    ProvisioningDialog: {
      // Dialog chrome
      DefaultTitle: 'მომზადება',
      CloseButtonAriaLabel: 'დახურვა',
      CloseLabel: 'დახურვა',
      BackToProvisioningLabel: 'უკან',

      // Target site
      TargetSiteLabel: 'სამიზნე საიტი',
      TargetSiteMissingTitle: 'სამიზნე საიტი აკლია',
      TargetSiteMissingMessage: 'მომზადების გაშვებამდე აირჩიეთ სამიზნე საიტი web part თვისებებში.',
      ErrorFallbackCode: 'შეცდომა',

      // KPIs
      TotalLabel: 'სულ',
      SuccessLabel: 'წარმატება',
      FailLabel: 'წარუმატებელი',
      SkippedLabel: 'გამოტოვებულია',
      PendingLabel: 'მოლოდინში',
      CompletedLabel: 'დასრულებულია',

      // Final outcomes
      FinalOutcomeSucceededLabel: 'წარმატებით დასრულდა',
      FinalOutcomeFailedLabel: 'წარუმატებელი',
      FinalOutcomeCancelledLabel: 'გაუქმებულია',
      FinalOutcomeRunningLabel: 'მიმდინარეობს',

      // Help text
      InitialHelpProvisioningText: 'სამიზნე საიტზე მომზადების დასაწყებად გამოიყენეთ გაშვება. მოქმედებების შესრულებისას შეგიძლიათ გადახედოთ პროგრესს და ჟურნალებს.',
      InitialHelpComplianceText: 'ცვლილებების გამოყენებამდე შესაბამისობის პრობლემების სანახავად გამოიყენეთ შემოწმება.',

      // Default descriptions (for dialog shell)
      ProvisioningDefaultDescription: 'გაუშვით მომზადება კონფიგურირებული გეგმის გამოყენებით.',
      ComplianceDefaultDescription: 'გაუშვით შესაბამისობის შემოწმება კონფიგურირებული გეგმის გამოყენებით.',

      // Actions
      ViewLogsLabel: 'ჟურნალების ნახვა',
      CheckComplianceLabel: 'შემოწმება',
      CancelLabel: 'გაუქმება',
      RunLabel: 'გაშვება',

      // Confirmation
      ConfirmRunTitle: 'გაშვების დადასტურება',
      ConfirmRunMessage: 'დარწმუნებული ხართ, რომ გსურთ გაშვების დაწყება?',

      // Compliance mode
      ComplianceDefaultTitle: 'შესაბამისობა',
      ComplianceHeaderLabel: 'შესაბამისობის შემოწმება',
      RunCheckLabel: 'შემოწმების გაშვება',
      CancelCheckLabel: 'გაუქმება',
      CheckingLabel: 'შესაბამისობა მოწმდება...',

      // Compliance overall status
      OverallCompliantLabel: 'შესაბამისია',
      OverallWarningLabel: 'გაფრთხილება',
      OverallNonCompliantLabel: 'არ შეესაბამება',
      OverallRunningLabel: 'მიმდინარეობს',
      OverallCancelledLabel: 'გაუქმებულია',

      // Compliance counts
      CheckedLabel: 'შემოწმებულია',
      BlockedLabel: 'დაბლოკილია',
      CompliantLabel: 'შესაბამისია',
      NonCompliantLabel: 'არ შეესაბამება',
      UnverifiableLabel: 'ვერ მოწმდება',
      IgnoredLabel: 'იგნორირებულია',

      // Compliance errors
      ComplianceTargetSiteMissingTitle: 'სამიზნე საიტი',
      ComplianceTargetSiteMissingMessage: 'შესაბამისობის შემოწმების გასაშვებად საჭიროა სამიზნე საიტის URL.',
      ComplianceErrorFallbackTitle: 'შეცდომა',
    },

    // PropertyPaneProvisioningField strings
    PropertyPaneProvisioningField: {
      // Default label
      DefaultLabel: 'შაბლონის მომზადება',

      // Actions
      ProvisionLabel: 'მომზადება',
      DeprovisionLabel: 'მომზადების გაუქმება',
      CheckLabel: 'შემოწმება',

      // State badges
      StateAppliedLabel: 'გამოყენებულია',
      StateNotAppliedLabel: 'არ არის გამოყენებული',
      StateUnknownLabel: 'უცნობია',

      // Dialog titles
      ProvisioningDialogTitle: 'მომზადება',
      ProvisioningDialogDescription: 'გაუშვით მომზადება კონფიგურირებული გეგმის გამოყენებით.',
      DeprovisioningDialogTitle: 'მომზადების გაუქმება',
      DeprovisioningDialogDescription: 'გაუშვით მომზადების გაუქმება კონფიგურირებული გეგმის გამოყენებით.',

      // Deprovision confirmation
      DeprovisionConfirmRunTitle: 'მომზადების გაუქმების დადასტურება',
      DeprovisionConfirmRunMessage: 'დარწმუნებული ხართ, რომ გსურთ მომზადების გაუქმების დაწყება?',
      DeprovisionConfirmLabel: 'მომზადების გაუქმება',
      DeprovisionCancelLabel: 'გაუქმება',
    },

    // PropertyPaneSiteSelectorField strings
    SiteSelectorField: {
      // Default label
      DefaultLabel: 'სამიზნე საიტი',

      // Mode labels
      CurrentSiteLabel: 'მიმდინარე საიტი',
      HubSiteLabel: 'მშობელი hub საიტი',
      HubNotAvailableLabel: 'ხელმისაწვდომი არ არის',
      SearchSiteLabel: 'საიტის ძებნა',

      // Accessibility
      SelectedSiteGroupAriaLabel: 'არჩეული საიტი',
      SearchSitesAriaLabel: 'საიტების ძებნა',
      SearchPlaceholder: 'ძებნა სათაურით ან URL-ით',

      // Search states
      SearchingLabel: 'იძებნება',
      EmptySearchLabel: 'ჩაწერეთ საძებნად',
      NoResultsLabel: 'შედეგები ვერ მოიძებნა',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'მიმდინარეობს ოპერაცია. თუ დატოვებთ, ის შეწყდება.',
    },
  };
});
