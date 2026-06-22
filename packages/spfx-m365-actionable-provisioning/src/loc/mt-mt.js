/**
 * Maltese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Ikkonferma',
      CancelLabel: 'Ikkanċella',
    },

    LogPanel: {
      EmptyMessage: 'M\'hemmx logs disponibbli',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'M\'hemmx riżultati ta\' konformità disponibbli',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Pendenti',
      RunningLabel: 'Qed jaħdem',
      ExecutedLabel: 'Eżegwit',
      FailedLabel: 'Falla',
      SkippedLabel: 'Maqbuż',

      SkipReasonNotFound: 'Ma nstabx',
      SkipReasonAlreadyExists: 'Diġà jeżisti',
      SkipReasonNoChanges: 'L-ebda bidla',
      SkipReasonMissingPrerequisite: 'Prerekwiżit nieqes',
      SkipReasonUnsupported: 'Mhux appoġġjat',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Konformi',
      NonCompliantLabel: 'Mhux konformi',
      UnverifiableLabel: 'Ma jistax jiġi vverifikat',
      IgnoredLabel: 'Injorat',
      BlockedLabel: 'Imblukkat',

      PendingLabel: 'Pendenti',
      RunningLabel: 'Qed jiġi ċċekkjat',
      CancelledLabel: 'Ikkanċellat',

      BlockedByPrefix: 'Imblukkat minn',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Provisioning',
      CloseButtonAriaLabel: 'Agħlaq',
      CloseLabel: 'Agħlaq',
      BackToProvisioningLabel: 'Lura',

      TargetSiteLabel: 'Sit fil-mira',
      TargetSiteMissingTitle: 'Sit fil-mira nieqes',
      TargetSiteMissingMessage: 'Agħżel sit fil-mira fil-proprjetajiet tal-web part qabel ma tħaddem il-provisioning.',
      ErrorFallbackCode: 'ŻBALL',

      TotalLabel: 'Total',
      SuccessLabel: 'Suċċess',
      FailLabel: 'Falla',
      SkippedLabel: 'Maqbuż',
      PendingLabel: 'Pendenti',
      CompletedLabel: 'Tlesta',

      FinalOutcomeSucceededLabel: 'Irnexxa',
      FinalOutcomeFailedLabel: 'Falla',
      FinalOutcomeCancelledLabel: 'Ikkanċellat',
      FinalOutcomeRunningLabel: 'Qed jaħdem',

      InitialHelpProvisioningText: 'Uża Ħaddem biex tibda l-provisioning fuq is-sit fil-mira. Tista\' tirrevedi l-progress u l-logs waqt li l-azzjonijiet jiġu eżegwiti.',
      InitialHelpComplianceText: 'Uża Iċċekkja biex tara minn qabel kwistjonijiet ta\' konformità qabel tapplika bidliet.',

      ProvisioningDefaultDescription: 'Ħaddem il-provisioning billi tuża l-pjan ikkonfigurat.',
      ComplianceDefaultDescription: 'Ħaddem il-verifika ta\' konformità billi tuża l-pjan ikkonfigurat.',

      ViewLogsLabel: 'Ara l-logs',
      CheckComplianceLabel: 'Iċċekkja',
      CancelLabel: 'Ikkanċella',
      RunLabel: 'Ħaddem',

      ConfirmRunTitle: 'Ikkonferma t-tħaddim',
      ConfirmRunMessage: 'Int żgur li trid tibda t-tħaddim?',

      ComplianceDefaultTitle: 'Konformità',
      ComplianceHeaderLabel: 'Verifika ta\' konformità',
      RunCheckLabel: 'Ħaddem il-verifika',
      CancelCheckLabel: 'Ikkanċella',
      CheckingLabel: 'Qed tiġi ċċekkjata l-konformità…',

      OverallCompliantLabel: 'Konformi',
      OverallWarningLabel: 'Twissija',
      OverallNonCompliantLabel: 'Mhux konformi',
      OverallRunningLabel: 'Qed jaħdem',
      OverallCancelledLabel: 'Ikkanċellat',

      CheckedLabel: 'Iċċekkjat',
      BlockedLabel: 'Imblukkat',
      CompliantLabel: 'Konformi',
      NonCompliantLabel: 'Mhux konformi',
      UnverifiableLabel: 'Ma jistax jiġi vverifikat',
      IgnoredLabel: 'Injorat',

      ComplianceTargetSiteMissingTitle: 'Sit fil-mira',
      ComplianceTargetSiteMissingMessage: 'URL tas-sit fil-mira huwa meħtieġ biex titħaddem il-verifika ta\' konformità.',
      ComplianceErrorFallbackTitle: 'Żball',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Provisioning tal-mudell',
      ProvisionLabel: 'Ipprovdi',
      DeprovisionLabel: 'Neħħi l-provisioning',
      CheckLabel: 'Iċċekkja',

      StateAppliedLabel: 'Applikat',
      StateNotAppliedLabel: 'Mhux applikat',
      StateUnknownLabel: 'Mhux magħruf',

      ProvisioningDialogTitle: 'Provisioning',
      ProvisioningDialogDescription: 'Ħaddem il-provisioning billi tuża l-pjan ikkonfigurat.',
      DeprovisioningDialogTitle: 'Tneħħija tal-provisioning',
      DeprovisioningDialogDescription: 'Ħaddem it-tneħħija tal-provisioning billi tuża l-pjan ikkonfigurat.',

      DeprovisionConfirmRunTitle: 'Ikkonferma t-tneħħija tal-provisioning',
      DeprovisionConfirmRunMessage: 'Int żgur li trid tibda t-tneħħija tal-provisioning?',
      DeprovisionConfirmLabel: 'Neħħi l-provisioning',
      DeprovisionCancelLabel: 'Ikkanċella',
    },

    SiteSelectorField: {
      DefaultLabel: 'Sit fil-mira',
      CurrentSiteLabel: 'Sit attwali',
      HubSiteLabel: 'Sit hub ġenitur',
      HubNotAvailableLabel: 'Mhux disponibbli',
      SearchSiteLabel: 'Fittex sit',

      SelectedSiteGroupAriaLabel: 'Sit magħżul',
      SearchSitesAriaLabel: 'Fittex siti',
      SearchPlaceholder: 'Fittex skont it-titlu jew URL',

      SearchingLabel: 'Qed tfittex',
      EmptySearchLabel: 'Ittajpja biex tfittex',
      NoResultsLabel: 'Ma nstabux riżultati',
    },

    NavigationGuard: {
      LeavePageWarning: 'Operazzjoni tinsab għaddejja. Jekk titlaq, tiġi interrotta.',
    },
  };
});
