/**
 * Greek strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Επιβεβαίωση',
      CancelLabel: 'Ακύρωση',
    },

    LogPanel: {
      EmptyMessage: 'Δεν υπάρχουν διαθέσιμα αρχεία καταγραφής',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Δεν υπάρχουν διαθέσιμα αποτελέσματα συμμόρφωσης',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Σε αναμονή',
      RunningLabel: 'Εκτελείται',
      ExecutedLabel: 'Εκτελέστηκε',
      FailedLabel: 'Απέτυχε',
      SkippedLabel: 'Παραλείφθηκε',

      SkipReasonNotFound: 'Δεν βρέθηκε',
      SkipReasonAlreadyExists: 'Υπάρχει ήδη',
      SkipReasonNoChanges: 'Χωρίς αλλαγές',
      SkipReasonMissingPrerequisite: 'Λείπει προαπαιτούμενο',
      SkipReasonUnsupported: 'Δεν υποστηρίζεται',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Συμμορφούμενο',
      NonCompliantLabel: 'Μη συμμορφούμενο',
      UnverifiableLabel: 'Μη επαληθεύσιμο',
      IgnoredLabel: 'Αγνοήθηκε',
      BlockedLabel: 'Αποκλείστηκε',

      PendingLabel: 'Σε αναμονή',
      RunningLabel: 'Έλεγχος',
      CancelledLabel: 'Ακυρώθηκε',

      BlockedByPrefix: 'Αποκλείστηκε από',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Παροχή',
      CloseButtonAriaLabel: 'Κλείσιμο',
      CloseLabel: 'Κλείσιμο',
      BackToProvisioningLabel: 'Πίσω',

      TargetSiteLabel: 'Τοποθεσία προορισμού',
      TargetSiteMissingTitle: 'Λείπει η τοποθεσία προορισμού',
      TargetSiteMissingMessage: 'Επιλέξτε μια τοποθεσία προορισμού στις ιδιότητες του τμήματος web πριν εκτελέσετε την παροχή.',
      ErrorFallbackCode: 'ΣΦΑΛΜΑ',

      TotalLabel: 'Σύνολο',
      SuccessLabel: 'Επιτυχία',
      FailLabel: 'Αποτυχία',
      SkippedLabel: 'Παραλείφθηκε',
      PendingLabel: 'Σε αναμονή',
      CompletedLabel: 'Ολοκληρώθηκε',

      FinalOutcomeSucceededLabel: 'Επιτυχής',
      FinalOutcomeFailedLabel: 'Απέτυχε',
      FinalOutcomeCancelledLabel: 'Ακυρώθηκε',
      FinalOutcomeRunningLabel: 'Εκτελείται',

      InitialHelpProvisioningText: 'Χρησιμοποιήστε το Εκτέλεση για να ξεκινήσετε την παροχή στην τοποθεσία προορισμού. Μπορείτε να ελέγξετε την πρόοδο και τα αρχεία καταγραφής καθώς εκτελούνται οι ενέργειες.',
      InitialHelpComplianceText: 'Χρησιμοποιήστε το Έλεγχος για προεπισκόπηση ζητημάτων συμμόρφωσης πριν εφαρμόσετε αλλαγές.',
      ProvisioningDefaultDescription: 'Εκτελέστε την παροχή χρησιμοποιώντας το διαμορφωμένο σχέδιο.',
      ComplianceDefaultDescription: 'Εκτελέστε τον έλεγχο συμμόρφωσης χρησιμοποιώντας το διαμορφωμένο σχέδιο.',
      ViewLogsLabel: 'Προβολή αρχείων καταγραφής',
      CheckComplianceLabel: 'Έλεγχος',
      CancelLabel: 'Ακύρωση',
      RunLabel: 'Εκτέλεση',

      ConfirmRunTitle: 'Επιβεβαίωση εκτέλεσης',
      ConfirmRunMessage: 'Είστε βέβαιοι ότι θέλετε να ξεκινήσετε την εκτέλεση;',

      ComplianceDefaultTitle: 'Συμμόρφωση',
      ComplianceHeaderLabel: 'Έλεγχος συμμόρφωσης',
      RunCheckLabel: 'Εκτέλεση ελέγχου',
      CancelCheckLabel: 'Ακύρωση',
      CheckingLabel: 'Έλεγχος συμμόρφωσης…',

      OverallCompliantLabel: 'Συμμορφούμενο',
      OverallWarningLabel: 'Προειδοποίηση',
      OverallNonCompliantLabel: 'Μη συμμορφούμενο',
      OverallRunningLabel: 'Εκτελείται',
      OverallCancelledLabel: 'Ακυρώθηκε',

      CheckedLabel: 'Ελέγχθηκε',
      BlockedLabel: 'Αποκλείστηκε',
      CompliantLabel: 'Συμμορφούμενο',
      NonCompliantLabel: 'Μη συμμορφούμενο',
      UnverifiableLabel: 'Μη επαληθεύσιμο',
      IgnoredLabel: 'Αγνοήθηκε',

      ComplianceTargetSiteMissingTitle: 'Τοποθεσία προορισμού',
      ComplianceTargetSiteMissingMessage: 'Απαιτείται URL τοποθεσίας προορισμού για την εκτέλεση του ελέγχου συμμόρφωσης.',
      ComplianceErrorFallbackTitle: 'Σφάλμα',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Παροχή προτύπου',
      ProvisionLabel: 'Παροχή',
      DeprovisionLabel: 'Αφαίρεση παροχής',
      CheckLabel: 'Έλεγχος',

      StateAppliedLabel: 'Εφαρμόστηκε',
      StateNotAppliedLabel: 'Δεν εφαρμόστηκε',
      StateUnknownLabel: 'Άγνωστο',

      ProvisioningDialogTitle: 'Παροχή',
      ProvisioningDialogDescription: 'Εκτελέστε την παροχή χρησιμοποιώντας το διαμορφωμένο σχέδιο.',
      DeprovisioningDialogTitle: 'Αφαίρεση παροχής',
      DeprovisioningDialogDescription: 'Εκτελέστε την αφαίρεση παροχής χρησιμοποιώντας το διαμορφωμένο σχέδιο.',

      DeprovisionConfirmRunTitle: 'Επιβεβαίωση αφαίρεσης παροχής',
      DeprovisionConfirmRunMessage: 'Είστε βέβαιοι ότι θέλετε να ξεκινήσετε την αφαίρεση παροχής;',
      DeprovisionConfirmLabel: 'Αφαίρεση παροχής',
      DeprovisionCancelLabel: 'Ακύρωση',
    },

    SiteSelectorField: {
      DefaultLabel: 'Τοποθεσία προορισμού',
      CurrentSiteLabel: 'Τρέχουσα τοποθεσία',
      HubSiteLabel: 'Γονική τοποθεσία hub',
      HubNotAvailableLabel: 'Μη διαθέσιμο',
      SearchSiteLabel: 'Αναζήτηση τοποθεσίας',

      SelectedSiteGroupAriaLabel: 'Επιλεγμένη τοποθεσία',
      SearchSitesAriaLabel: 'Αναζήτηση τοποθεσιών',
      SearchPlaceholder: 'Αναζήτηση με τίτλο ή URL',

      SearchingLabel: 'Αναζήτηση',
      EmptySearchLabel: 'Πληκτρολογήστε για αναζήτηση',
      NoResultsLabel: 'Δεν βρέθηκαν αποτελέσματα',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Μια εργασία βρίσκεται σε εξέλιξη. Αν φύγετε, θα διακοπεί.',
    },
  };
});
