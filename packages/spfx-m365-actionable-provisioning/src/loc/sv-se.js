/**
 * Swedish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Bekräfta',
      CancelLabel: 'Avbryt',
    },

    LogPanel: {
      EmptyMessage: 'Inga loggar tillgängliga',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Inga efterlevnadsresultat tillgängliga',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Väntar',
      RunningLabel: 'Körs',
      ExecutedLabel: 'Utfört',
      FailedLabel: 'Misslyckades',
      SkippedLabel: 'Hoppades över',

      SkipReasonNotFound: 'Hittades inte',
      SkipReasonAlreadyExists: 'Finns redan',
      SkipReasonNoChanges: 'Inga ändringar',
      SkipReasonMissingPrerequisite: 'Saknad förutsättning',
      SkipReasonUnsupported: 'Stöds inte',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Kompatibel',
      NonCompliantLabel: 'Icke-kompatibel',
      UnverifiableLabel: 'Ej verifierbar',
      IgnoredLabel: 'Ignorerad',
      BlockedLabel: 'Blockerad',

      PendingLabel: 'Väntar',
      RunningLabel: 'Kontrollerar',
      CancelledLabel: 'Avbruten',

      BlockedByPrefix: 'Blockerad av',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Etablering',
      CloseButtonAriaLabel: 'Stäng',
      CloseLabel: 'Stäng',
      BackToProvisioningLabel: 'Tillbaka',

      TargetSiteLabel: 'Målwebbplats',
      TargetSiteMissingTitle: 'Målwebbplats saknas',
      TargetSiteMissingMessage: 'Välj en målwebbplats i webbdelens egenskaper innan du kör etablering.',
      ErrorFallbackCode: 'FEL',

      TotalLabel: 'Totalt',
      SuccessLabel: 'Lyckades',
      FailLabel: 'Misslyckades',
      SkippedLabel: 'Hoppades över',
      PendingLabel: 'Väntar',
      CompletedLabel: 'Slutfört',

      FinalOutcomeSucceededLabel: 'Lyckades',
      FinalOutcomeFailedLabel: 'Misslyckades',
      FinalOutcomeCancelledLabel: 'Avbruten',
      FinalOutcomeRunningLabel: 'Körs',

      InitialHelpProvisioningText: 'Använd Kör för att starta etablering mot målwebbplatsen. Du kan granska framsteg och loggar medan åtgärder utförs.',
      InitialHelpComplianceText: 'Använd Kontrollera för att förhandsgranska efterlevnadsproblem innan du tillämpar ändringar.',

      ProvisioningDefaultDescription: 'Kör etablering med den konfigurerade planen.',
      ComplianceDefaultDescription: 'Kör efterlevnadskontroll med den konfigurerade planen.',

      ViewLogsLabel: 'Visa loggar',
      CheckComplianceLabel: 'Kontrollera',
      CancelLabel: 'Avbryt',
      RunLabel: 'Kör',

      ConfirmRunTitle: 'Bekräfta körning',
      ConfirmRunMessage: 'Är du säker på att du vill starta körningen?',

      ComplianceDefaultTitle: 'Efterlevnad',
      ComplianceHeaderLabel: 'Efterlevnadskontroll',
      RunCheckLabel: 'Kör kontroll',
      CancelCheckLabel: 'Avbryt',
      CheckingLabel: 'Kontrollerar efterlevnad…',

      OverallCompliantLabel: 'Kompatibel',
      OverallWarningLabel: 'Varning',
      OverallNonCompliantLabel: 'Icke-kompatibel',
      OverallRunningLabel: 'Körs',
      OverallCancelledLabel: 'Avbruten',

      CheckedLabel: 'Kontrollerad',
      BlockedLabel: 'Blockerad',
      CompliantLabel: 'Kompatibel',
      NonCompliantLabel: 'Icke-kompatibel',
      UnverifiableLabel: 'Ej verifierbar',
      IgnoredLabel: 'Ignorerad',

      ComplianceTargetSiteMissingTitle: 'Målwebbplats',
      ComplianceTargetSiteMissingMessage: 'En målwebbplats-URL krävs för att köra efterlevnadskontroll.',
      ComplianceErrorFallbackTitle: 'Fel',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Malletablering',
      ProvisionLabel: 'Etablera',
      DeprovisionLabel: 'Avetablera',
      CheckLabel: 'Kontrollera',

      StateAppliedLabel: 'Tillämpad',
      StateNotAppliedLabel: 'Inte tillämpad',
      StateUnknownLabel: 'Okänd',

      ProvisioningDialogTitle: 'Etablering',
      ProvisioningDialogDescription: 'Kör etablering med den konfigurerade planen.',
      DeprovisioningDialogTitle: 'Avetablering',
      DeprovisioningDialogDescription: 'Kör avetablering med den konfigurerade planen.',

      DeprovisionConfirmRunTitle: 'Bekräfta avetablering',
      DeprovisionConfirmRunMessage: 'Är du säker på att du vill starta avetablering?',
      DeprovisionConfirmLabel: 'Avetablera',
      DeprovisionCancelLabel: 'Avbryt',
    },

    SiteSelectorField: {
      DefaultLabel: 'Målwebbplats',
      CurrentSiteLabel: 'Aktuell webbplats',
      HubSiteLabel: 'Överordnad hubbwebbplats',
      HubNotAvailableLabel: 'Inte tillgänglig',
      SearchSiteLabel: 'Sök webbplats',

      SelectedSiteGroupAriaLabel: 'Vald webbplats',
      SearchSitesAriaLabel: 'Sök webbplatser',
      SearchPlaceholder: 'Sök efter titel eller URL',

      SearchingLabel: 'Söker',
      EmptySearchLabel: 'Skriv för att söka',
      NoResultsLabel: 'Inga resultat hittades',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'En åtgärd pågår. Om du lämnar sidan avbryts den.',
    },
  };
});
