/**
 * Lithuanian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Patvirtinti', CancelLabel: 'Atšaukti' },
    LogPanel: { EmptyMessage: 'Žurnalų nėra' },
    ComplianceLogPanel: { EmptyMessage: 'Atitikties rezultatų nėra' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Laukiama', RunningLabel: 'Vykdoma', ExecutedLabel: 'Įvykdyta', FailedLabel: 'Nepavyko', SkippedLabel: 'Praleista',
      SkipReasonNotFound: 'Nerasta', SkipReasonAlreadyExists: 'Jau yra', SkipReasonNoChanges: 'Nėra pakeitimų', SkipReasonMissingPrerequisite: 'Trūksta būtinos sąlygos', SkipReasonUnsupported: 'Nepalaikoma',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Atitinka', NonCompliantLabel: 'Neatitinka', UnverifiableLabel: 'Nepatikrinama', IgnoredLabel: 'Nepaisyta', BlockedLabel: 'Užblokuota',
      PendingLabel: 'Laukiama', RunningLabel: 'Tikrinama', CancelledLabel: 'Atšaukta',
      BlockedByPrefix: 'Užblokavo',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Parengimas', CloseButtonAriaLabel: 'Uždaryti', CloseLabel: 'Uždaryti', BackToProvisioningLabel: 'Atgal',
      TargetSiteLabel: 'Tikslinė svetainė', TargetSiteMissingTitle: 'Trūksta tikslinės svetainės', TargetSiteMissingMessage: 'Prieš vykdydami parengimą, Web Part ypatybėse pasirinkite tikslinę svetainę.', ErrorFallbackCode: 'KLAIDA',
      TotalLabel: 'Iš viso', SuccessLabel: 'Sėkmingai', FailLabel: 'Nepavyko', SkippedLabel: 'Praleista', PendingLabel: 'Laukiama', CompletedLabel: 'Baigta',
      FinalOutcomeSucceededLabel: 'Pavyko', FinalOutcomeFailedLabel: 'Nepavyko', FinalOutcomeCancelledLabel: 'Atšaukta', FinalOutcomeRunningLabel: 'Vykdoma',
      InitialHelpProvisioningText: 'Naudokite Vykdyti, kad pradėtumėte tikslinės svetainės parengimą. Vykdant veiksmus galite peržiūrėti eigą ir žurnalus.', InitialHelpComplianceText: 'Naudokite Tikrinti, kad prieš taikydami pakeitimus peržiūrėtumėte atitikties problemas.',
      ProvisioningDefaultDescription: 'Vykdykite parengimą naudodami sukonfigūruotą planą.', ComplianceDefaultDescription: 'Vykdykite atitikties tikrinimą naudodami sukonfigūruotą planą.',
      ViewLogsLabel: 'Peržiūrėti žurnalus', CheckComplianceLabel: 'Tikrinti', CancelLabel: 'Atšaukti', RunLabel: 'Vykdyti',
      ConfirmRunTitle: 'Patvirtinti vykdymą', ConfirmRunMessage: 'Ar tikrai norite pradėti vykdymą?',
      ComplianceDefaultTitle: 'Atitiktis', ComplianceHeaderLabel: 'Atitikties tikrinimas', RunCheckLabel: 'Vykdyti tikrinimą', CancelCheckLabel: 'Atšaukti', CheckingLabel: 'Tikrinama atitiktis...',
      OverallCompliantLabel: 'Atitinka', OverallWarningLabel: 'Įspėjimas', OverallNonCompliantLabel: 'Neatitinka', OverallRunningLabel: 'Vykdoma', OverallCancelledLabel: 'Atšaukta',
      CheckedLabel: 'Patikrinta', BlockedLabel: 'Užblokuota', CompliantLabel: 'Atitinka', NonCompliantLabel: 'Neatitinka', UnverifiableLabel: 'Nepatikrinama', IgnoredLabel: 'Nepaisyta',
      ComplianceTargetSiteMissingTitle: 'Tikslinė svetainė', ComplianceTargetSiteMissingMessage: 'Norint vykdyti atitikties tikrinimą, reikalingas tikslinės svetainės URL.', ComplianceErrorFallbackTitle: 'Klaida',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Šablono parengimas', ProvisionLabel: 'Parengti', DeprovisionLabel: 'Atšaukti parengimą', CheckLabel: 'Tikrinti',
      StateAppliedLabel: 'Pritaikyta', StateNotAppliedLabel: 'Nepritaikyta', StateUnknownLabel: 'Nežinoma',
      ProvisioningDialogTitle: 'Parengimas', ProvisioningDialogDescription: 'Vykdykite parengimą naudodami sukonfigūruotą planą.', DeprovisioningDialogTitle: 'Parengimo atšaukimas', DeprovisioningDialogDescription: 'Vykdykite parengimo atšaukimą naudodami sukonfigūruotą planą.',
      DeprovisionConfirmRunTitle: 'Patvirtinti parengimo atšaukimą', DeprovisionConfirmRunMessage: 'Ar tikrai norite pradėti parengimo atšaukimą?', DeprovisionConfirmLabel: 'Atšaukti parengimą', DeprovisionCancelLabel: 'Atšaukti',
    },
    SiteSelectorField: {
      DefaultLabel: 'Tikslinė svetainė', CurrentSiteLabel: 'Dabartinė svetainė', HubSiteLabel: 'Pirminė hub svetainė', HubNotAvailableLabel: 'Nepasiekiama', SearchSiteLabel: 'Ieškoti svetainės',
      SelectedSiteGroupAriaLabel: 'Pasirinkta svetainė', SearchSitesAriaLabel: 'Ieškoti svetainių', SearchPlaceholder: 'Ieškoti pagal pavadinimą arba URL',
      SearchingLabel: 'Ieškoma', EmptySearchLabel: 'Įveskite, kad ieškotumėte', NoResultsLabel: 'Rezultatų nerasta',
    },
    NavigationGuard: { LeavePageWarning: 'Vykdoma operacija. Jei išeisite, ji bus nutraukta.' },
  };
});
