/**
 * Hindi strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'पुष्टि करें', CancelLabel: 'रद्द करें' },
    LogPanel: { EmptyMessage: 'कोई लॉग उपलब्ध नहीं है' },
    ComplianceLogPanel: { EmptyMessage: 'कोई अनुपालन परिणाम उपलब्ध नहीं है' },
    ProvisioningActivityEntry: {
      PendingLabel: 'लंबित', RunningLabel: 'चल रहा है', ExecutedLabel: 'निष्पादित', FailedLabel: 'विफल', SkippedLabel: 'छोड़ा गया',
      SkipReasonNotFound: 'नहीं मिला', SkipReasonAlreadyExists: 'पहले से मौजूद है', SkipReasonNoChanges: 'कोई परिवर्तन नहीं', SkipReasonMissingPrerequisite: 'पूर्वापेक्षा अनुपलब्ध', SkipReasonUnsupported: 'समर्थित नहीं',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'अनुपालक', NonCompliantLabel: 'गैर-अनुपालक', UnverifiableLabel: 'सत्यापित नहीं किया जा सकता', IgnoredLabel: 'अनदेखा किया गया', BlockedLabel: 'अवरोधित',
      PendingLabel: 'लंबित', RunningLabel: 'जांच जारी है', CancelledLabel: 'रद्द किया गया',
      BlockedByPrefix: 'इसके द्वारा अवरोधित',
    },
    ProvisioningDialog: {
      DefaultTitle: 'प्रोविजनिंग', CloseButtonAriaLabel: 'बंद करें', CloseLabel: 'बंद करें', BackToProvisioningLabel: 'वापस',
      TargetSiteLabel: 'लक्ष्य साइट', TargetSiteMissingTitle: 'लक्ष्य साइट अनुपलब्ध', TargetSiteMissingMessage: 'प्रोविजनिंग चलाने से पहले Web Part गुणों में एक लक्ष्य साइट चुनें।', ErrorFallbackCode: 'त्रुटि',
      TotalLabel: 'कुल', SuccessLabel: 'सफलता', FailLabel: 'विफल', SkippedLabel: 'छोड़ा गया', PendingLabel: 'लंबित', CompletedLabel: 'पूर्ण',
      FinalOutcomeSucceededLabel: 'सफल', FinalOutcomeFailedLabel: 'विफल', FinalOutcomeCancelledLabel: 'रद्द किया गया', FinalOutcomeRunningLabel: 'चल रहा है',
      InitialHelpProvisioningText: 'लक्ष्य साइट पर प्रोविजनिंग शुरू करने के लिए चलाएं का उपयोग करें। क्रियाओं के निष्पादित होने पर आप प्रगति और लॉग की समीक्षा कर सकते हैं।', InitialHelpComplianceText: 'परिवर्तन लागू करने से पहले अनुपालन समस्याओं का पूर्वावलोकन करने के लिए जांचें का उपयोग करें।',
      ProvisioningDefaultDescription: 'कॉन्फ़िगर की गई योजना का उपयोग करके प्रोविजनिंग चलाएं।', ComplianceDefaultDescription: 'कॉन्फ़िगर की गई योजना का उपयोग करके अनुपालन जांच चलाएं।',
      ViewLogsLabel: 'लॉग देखें', CheckComplianceLabel: 'जांचें', CancelLabel: 'रद्द करें', RunLabel: 'चलाएं',
      ConfirmRunTitle: 'चलाने की पुष्टि करें', ConfirmRunMessage: 'क्या आप वाकई रन शुरू करना चाहते हैं?',
      ComplianceDefaultTitle: 'अनुपालन', ComplianceHeaderLabel: 'अनुपालन जांच', RunCheckLabel: 'जांच चलाएं', CancelCheckLabel: 'रद्द करें', CheckingLabel: 'अनुपालन की जांच की जा रही है...',
      OverallCompliantLabel: 'अनुपालक', OverallWarningLabel: 'चेतावनी', OverallNonCompliantLabel: 'गैर-अनुपालक', OverallRunningLabel: 'चल रहा है', OverallCancelledLabel: 'रद्द किया गया',
      CheckedLabel: 'जांचा गया', BlockedLabel: 'अवरोधित', CompliantLabel: 'अनुपालक', NonCompliantLabel: 'गैर-अनुपालक', UnverifiableLabel: 'सत्यापित नहीं किया जा सकता', IgnoredLabel: 'अनदेखा किया गया',
      ComplianceTargetSiteMissingTitle: 'लक्ष्य साइट', ComplianceTargetSiteMissingMessage: 'अनुपालन जांच चलाने के लिए लक्ष्य साइट URL आवश्यक है।', ComplianceErrorFallbackTitle: 'त्रुटि',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'टेम्पलेट प्रोविजनिंग', ProvisionLabel: 'प्रोविजन करें', DeprovisionLabel: 'डीप्रोविजन करें', CheckLabel: 'जांचें',
      StateAppliedLabel: 'लागू', StateNotAppliedLabel: 'लागू नहीं', StateUnknownLabel: 'अज्ञात',
      ProvisioningDialogTitle: 'प्रोविजनिंग', ProvisioningDialogDescription: 'कॉन्फ़िगर की गई योजना का उपयोग करके प्रोविजनिंग चलाएं।', DeprovisioningDialogTitle: 'डीप्रोविजनिंग', DeprovisioningDialogDescription: 'कॉन्फ़िगर की गई योजना का उपयोग करके डीप्रोविजनिंग चलाएं।',
      DeprovisionConfirmRunTitle: 'डीप्रोविजनिंग की पुष्टि करें', DeprovisionConfirmRunMessage: 'क्या आप वाकई डीप्रोविजनिंग शुरू करना चाहते हैं?', DeprovisionConfirmLabel: 'डीप्रोविजन करें', DeprovisionCancelLabel: 'रद्द करें',
    },
    SiteSelectorField: {
      DefaultLabel: 'लक्ष्य साइट', CurrentSiteLabel: 'वर्तमान साइट', HubSiteLabel: 'मूल hub साइट', HubNotAvailableLabel: 'उपलब्ध नहीं', SearchSiteLabel: 'साइट खोजें',
      SelectedSiteGroupAriaLabel: 'चयनित साइट', SearchSitesAriaLabel: 'साइट खोजें', SearchPlaceholder: 'शीर्षक या URL से खोजें',
      SearchingLabel: 'खोज रहा है', EmptySearchLabel: 'खोजने के लिए टाइप करें', NoResultsLabel: 'कोई परिणाम नहीं मिला',
    },
    NavigationGuard: { LeavePageWarning: 'एक कार्रवाई प्रगति पर है। यदि आप छोड़ते हैं, तो यह बाधित हो जाएगी।' },
  };
});
