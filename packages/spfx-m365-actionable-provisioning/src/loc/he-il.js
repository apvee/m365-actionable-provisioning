/**
 * Hebrew strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'אשר', CancelLabel: 'בטל' },
    LogPanel: { EmptyMessage: 'אין יומנים זמינים' },
    ComplianceLogPanel: { EmptyMessage: 'אין תוצאות תאימות זמינות' },
    ProvisioningActivityEntry: {
      PendingLabel: 'בהמתנה', RunningLabel: 'פועל', ExecutedLabel: 'בוצע', FailedLabel: 'נכשל', SkippedLabel: 'דולג',
      SkipReasonNotFound: 'לא נמצא', SkipReasonAlreadyExists: 'כבר קיים', SkipReasonNoChanges: 'אין שינויים', SkipReasonMissingPrerequisite: 'חסר תנאי מוקדם', SkipReasonUnsupported: 'לא נתמך',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'תואם', NonCompliantLabel: 'לא תואם', UnverifiableLabel: 'לא ניתן לאימות', IgnoredLabel: 'התעלם', BlockedLabel: 'חסום',
      PendingLabel: 'בהמתנה', RunningLabel: 'בודק', CancelledLabel: 'בוטל',
      BlockedByPrefix: 'חסום על-ידי',
    },
    ProvisioningDialog: {
      DefaultTitle: 'הקצאה', CloseButtonAriaLabel: 'סגור', CloseLabel: 'סגור', BackToProvisioningLabel: 'חזור',
      TargetSiteLabel: 'אתר יעד', TargetSiteMissingTitle: 'אתר היעד חסר', TargetSiteMissingMessage: 'בחר אתר יעד במאפייני ה-Web Part לפני הפעלת ההקצאה.', ErrorFallbackCode: 'שגיאה',
      TotalLabel: 'סה"כ', SuccessLabel: 'הצלחה', FailLabel: 'נכשל', SkippedLabel: 'דולג', PendingLabel: 'בהמתנה', CompletedLabel: 'הושלם',
      FinalOutcomeSucceededLabel: 'הצליח', FinalOutcomeFailedLabel: 'נכשל', FinalOutcomeCancelledLabel: 'בוטל', FinalOutcomeRunningLabel: 'פועל',
      InitialHelpProvisioningText: 'השתמש בהפעל כדי להתחיל הקצאה מול אתר היעד. ניתן לעיין בהתקדמות וביומנים בזמן שהפעולות מתבצעות.', InitialHelpComplianceText: 'השתמש בבדוק כדי להציג בעיות תאימות לפני החלת שינויים.',
      ProvisioningDefaultDescription: 'הפעל הקצאה באמצעות התוכנית המוגדרת.', ComplianceDefaultDescription: 'הפעל בדיקת תאימות באמצעות התוכנית המוגדרת.',
      ViewLogsLabel: 'הצג יומנים', CheckComplianceLabel: 'בדוק', CancelLabel: 'בטל', RunLabel: 'הפעל',
      ConfirmRunTitle: 'אשר הפעלה', ConfirmRunMessage: 'האם אתה בטוח שברצונך להתחיל את ההפעלה?',
      ComplianceDefaultTitle: 'תאימות', ComplianceHeaderLabel: 'בדיקת תאימות', RunCheckLabel: 'הפעל בדיקה', CancelCheckLabel: 'בטל', CheckingLabel: 'בודק תאימות...',
      OverallCompliantLabel: 'תואם', OverallWarningLabel: 'אזהרה', OverallNonCompliantLabel: 'לא תואם', OverallRunningLabel: 'פועל', OverallCancelledLabel: 'בוטל',
      CheckedLabel: 'נבדק', BlockedLabel: 'חסום', CompliantLabel: 'תואם', NonCompliantLabel: 'לא תואם', UnverifiableLabel: 'לא ניתן לאימות', IgnoredLabel: 'התעלם',
      ComplianceTargetSiteMissingTitle: 'אתר יעד', ComplianceTargetSiteMissingMessage: 'נדרשת כתובת URL של אתר יעד כדי להפעיל את בדיקת התאימות.', ComplianceErrorFallbackTitle: 'שגיאה',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'הקצאת תבנית', ProvisionLabel: 'הקצה', DeprovisionLabel: 'בטל הקצאה', CheckLabel: 'בדוק',
      StateAppliedLabel: 'הוחל', StateNotAppliedLabel: 'לא הוחל', StateUnknownLabel: 'לא ידוע',
      ProvisioningDialogTitle: 'הקצאה', ProvisioningDialogDescription: 'הפעל הקצאה באמצעות התוכנית המוגדרת.', DeprovisioningDialogTitle: 'ביטול הקצאה', DeprovisioningDialogDescription: 'הפעל ביטול הקצאה באמצעות התוכנית המוגדרת.',
      DeprovisionConfirmRunTitle: 'אשר ביטול הקצאה', DeprovisionConfirmRunMessage: 'האם אתה בטוח שברצונך להתחיל ביטול הקצאה?', DeprovisionConfirmLabel: 'בטל הקצאה', DeprovisionCancelLabel: 'בטל',
    },
    SiteSelectorField: {
      DefaultLabel: 'אתר יעד', CurrentSiteLabel: 'אתר נוכחי', HubSiteLabel: 'אתר רכזת אב', HubNotAvailableLabel: 'לא זמין', SearchSiteLabel: 'חפש אתר',
      SelectedSiteGroupAriaLabel: 'אתר נבחר', SearchSitesAriaLabel: 'חפש אתרים', SearchPlaceholder: 'חפש לפי כותרת או URL',
      SearchingLabel: 'מחפש', EmptySearchLabel: 'הקלד כדי לחפש', NoResultsLabel: 'לא נמצאו תוצאות',
    },
    NavigationGuard: { LeavePageWarning: 'פעולה מתבצעת. אם תעזוב, היא תופסק.' },
  };
});
