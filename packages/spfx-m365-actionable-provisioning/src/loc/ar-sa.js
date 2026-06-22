/**
 * Arabic strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'تأكيد', CancelLabel: 'إلغاء' },
    LogPanel: { EmptyMessage: 'لا توجد سجلات متوفرة' },
    ComplianceLogPanel: { EmptyMessage: 'لا توجد نتائج توافق متوفرة' },
    ProvisioningActivityEntry: {
      PendingLabel: 'معلق', RunningLabel: 'قيد التشغيل', ExecutedLabel: 'تم التنفيذ', FailedLabel: 'فشل', SkippedLabel: 'تم التخطي',
      SkipReasonNotFound: 'غير موجود', SkipReasonAlreadyExists: 'موجود بالفعل', SkipReasonNoChanges: 'لا توجد تغييرات', SkipReasonMissingPrerequisite: 'متطلب أساسي مفقود', SkipReasonUnsupported: 'غير مدعوم',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'متوافق', NonCompliantLabel: 'غير متوافق', UnverifiableLabel: 'يتعذر التحقق منه', IgnoredLabel: 'تم تجاهله', BlockedLabel: 'محظور',
      PendingLabel: 'معلق', RunningLabel: 'جارٍ التحقق', CancelledLabel: 'تم الإلغاء',
      BlockedByPrefix: 'محظور بواسطة',
    },
    ProvisioningDialog: {
      DefaultTitle: 'التوفير', CloseButtonAriaLabel: 'إغلاق', CloseLabel: 'إغلاق', BackToProvisioningLabel: 'رجوع',
      TargetSiteLabel: 'الموقع الهدف', TargetSiteMissingTitle: 'الموقع الهدف مفقود', TargetSiteMissingMessage: 'حدد موقعًا هدفًا في خصائص Web Part قبل تشغيل التوفير.', ErrorFallbackCode: 'خطأ',
      TotalLabel: 'الإجمالي', SuccessLabel: 'نجاح', FailLabel: 'فشل', SkippedLabel: 'تم التخطي', PendingLabel: 'معلق', CompletedLabel: 'مكتمل',
      FinalOutcomeSucceededLabel: 'نجح', FinalOutcomeFailedLabel: 'فشل', FinalOutcomeCancelledLabel: 'تم الإلغاء', FinalOutcomeRunningLabel: 'قيد التشغيل',
      InitialHelpProvisioningText: 'استخدم تشغيل لبدء التوفير على الموقع الهدف. يمكنك مراجعة التقدم والسجلات أثناء تنفيذ الإجراءات.', InitialHelpComplianceText: 'استخدم تحقق لمعاينة مشكلات التوافق قبل تطبيق التغييرات.',
      ProvisioningDefaultDescription: 'قم بتشغيل التوفير باستخدام الخطة المكونة.', ComplianceDefaultDescription: 'قم بتشغيل فحص التوافق باستخدام الخطة المكونة.',
      ViewLogsLabel: 'عرض السجلات', CheckComplianceLabel: 'تحقق', CancelLabel: 'إلغاء', RunLabel: 'تشغيل',
      ConfirmRunTitle: 'تأكيد التشغيل', ConfirmRunMessage: 'هل أنت متأكد من أنك تريد بدء التشغيل؟',
      ComplianceDefaultTitle: 'التوافق', ComplianceHeaderLabel: 'فحص التوافق', RunCheckLabel: 'تشغيل الفحص', CancelCheckLabel: 'إلغاء', CheckingLabel: 'جارٍ التحقق من التوافق...',
      OverallCompliantLabel: 'متوافق', OverallWarningLabel: 'تحذير', OverallNonCompliantLabel: 'غير متوافق', OverallRunningLabel: 'قيد التشغيل', OverallCancelledLabel: 'تم الإلغاء',
      CheckedLabel: 'تم التحقق', BlockedLabel: 'محظور', CompliantLabel: 'متوافق', NonCompliantLabel: 'غير متوافق', UnverifiableLabel: 'يتعذر التحقق منه', IgnoredLabel: 'تم تجاهله',
      ComplianceTargetSiteMissingTitle: 'الموقع الهدف', ComplianceTargetSiteMissingMessage: 'يلزم عنوان URL للموقع الهدف لتشغيل فحص التوافق.', ComplianceErrorFallbackTitle: 'خطأ',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'توفير القالب', ProvisionLabel: 'توفير', DeprovisionLabel: 'إلغاء التوفير', CheckLabel: 'تحقق',
      StateAppliedLabel: 'تم التطبيق', StateNotAppliedLabel: 'لم يتم التطبيق', StateUnknownLabel: 'غير معروف',
      ProvisioningDialogTitle: 'التوفير', ProvisioningDialogDescription: 'قم بتشغيل التوفير باستخدام الخطة المكونة.', DeprovisioningDialogTitle: 'إلغاء التوفير', DeprovisioningDialogDescription: 'قم بتشغيل إلغاء التوفير باستخدام الخطة المكونة.',
      DeprovisionConfirmRunTitle: 'تأكيد إلغاء التوفير', DeprovisionConfirmRunMessage: 'هل أنت متأكد من أنك تريد بدء إلغاء التوفير؟', DeprovisionConfirmLabel: 'إلغاء التوفير', DeprovisionCancelLabel: 'إلغاء',
    },
    SiteSelectorField: {
      DefaultLabel: 'الموقع الهدف', CurrentSiteLabel: 'الموقع الحالي', HubSiteLabel: 'موقع المحور الأصلي', HubNotAvailableLabel: 'غير متوفر', SearchSiteLabel: 'بحث عن موقع',
      SelectedSiteGroupAriaLabel: 'الموقع المحدد', SearchSitesAriaLabel: 'بحث في المواقع', SearchPlaceholder: 'البحث حسب العنوان أو URL',
      SearchingLabel: 'جارٍ البحث', EmptySearchLabel: 'اكتب للبحث', NoResultsLabel: 'لم يتم العثور على نتائج',
    },
    NavigationGuard: { LeavePageWarning: 'هناك عملية قيد التقدم. إذا غادرت، فسيتم مقاطعتها.' },
  };
});
