/**
 * Valencian Catalan strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Confirma',
      CancelLabel: 'Cancel·la',
    },

    LogPanel: {
      EmptyMessage: 'No hi ha registres disponibles',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'No hi ha resultats de compliment disponibles',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Pendent',
      RunningLabel: 'En execució',
      ExecutedLabel: 'Executat',
      FailedLabel: 'Ha fallat',
      SkippedLabel: 'Omés',

      SkipReasonNotFound: 'No trobat',
      SkipReasonAlreadyExists: 'Ja existix',
      SkipReasonNoChanges: 'Sense canvis',
      SkipReasonMissingPrerequisite: 'Falta un requisit previ',
      SkipReasonUnsupported: 'No compatible',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'No conforme',
      UnverifiableLabel: 'No verificable',
      IgnoredLabel: 'Ignorat',
      BlockedLabel: 'Bloquejat',

      PendingLabel: 'Pendent',
      RunningLabel: 'Comprovant',
      CancelledLabel: 'Cancel·lat',

      BlockedByPrefix: 'Bloquejat per',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Proveïment',
      CloseButtonAriaLabel: 'Tanca',
      CloseLabel: 'Tanca',
      BackToProvisioningLabel: 'Arrere',

      TargetSiteLabel: 'Lloc de destinació',
      TargetSiteMissingTitle: 'Falta el lloc de destinació',
      TargetSiteMissingMessage: 'Seleccioneu un lloc de destinació en les propietats de la part web abans d\'executar el proveïment.',
      ErrorFallbackCode: 'ERROR',

      TotalLabel: 'Total',
      SuccessLabel: 'Correcte',
      FailLabel: 'Ha fallat',
      SkippedLabel: 'Omés',
      PendingLabel: 'Pendent',
      CompletedLabel: 'Completat',

      FinalOutcomeSucceededLabel: 'Correcte',
      FinalOutcomeFailedLabel: 'Ha fallat',
      FinalOutcomeCancelledLabel: 'Cancel·lat',
      FinalOutcomeRunningLabel: 'En execució',

      InitialHelpProvisioningText: 'Utilitzeu Executa per a iniciar el proveïment en el lloc de destinació. Podeu revisar el progrés i els registres mentre s\'executen les accions.',
      InitialHelpComplianceText: 'Utilitzeu Comprova per a previsualitzar els problemes de compliment abans d\'aplicar els canvis.',

      ProvisioningDefaultDescription: 'Executeu el proveïment amb el pla configurat.',
      ComplianceDefaultDescription: 'Executeu la comprovació de compliment amb el pla configurat.',

      ViewLogsLabel: 'Mostra els registres',
      CheckComplianceLabel: 'Comprova',
      CancelLabel: 'Cancel·la',
      RunLabel: 'Executa',

      ConfirmRunTitle: 'Confirma l\'execució',
      ConfirmRunMessage: 'Esteu segur que voleu iniciar l\'execució?',

      ComplianceDefaultTitle: 'Compliment',
      ComplianceHeaderLabel: 'Comprovació de compliment',
      RunCheckLabel: 'Executa la comprovació',
      CancelCheckLabel: 'Cancel·la',
      CheckingLabel: 'Comprovant el compliment…',

      OverallCompliantLabel: 'Conforme',
      OverallWarningLabel: 'Avís',
      OverallNonCompliantLabel: 'No conforme',
      OverallRunningLabel: 'En execució',
      OverallCancelledLabel: 'Cancel·lat',

      CheckedLabel: 'Comprovat',
      BlockedLabel: 'Bloquejat',
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'No conforme',
      UnverifiableLabel: 'No verificable',
      IgnoredLabel: 'Ignorat',

      ComplianceTargetSiteMissingTitle: 'Lloc de destinació',
      ComplianceTargetSiteMissingMessage: 'Cal una URL del lloc de destinació per a executar la comprovació de compliment.',
      ComplianceErrorFallbackTitle: 'Error',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Proveïment de plantilla',
      ProvisionLabel: 'Proveir',
      DeprovisionLabel: 'Desproveir',
      CheckLabel: 'Comprova',

      StateAppliedLabel: 'Aplicat',
      StateNotAppliedLabel: 'No aplicat',
      StateUnknownLabel: 'Desconegut',

      ProvisioningDialogTitle: 'Proveïment',
      ProvisioningDialogDescription: 'Executeu el proveïment amb el pla configurat.',
      DeprovisioningDialogTitle: 'Desproveïment',
      DeprovisioningDialogDescription: 'Executeu el desproveïment amb el pla configurat.',

      DeprovisionConfirmRunTitle: 'Confirma el desproveïment',
      DeprovisionConfirmRunMessage: 'Esteu segur que voleu iniciar el desproveïment?',
      DeprovisionConfirmLabel: 'Desproveir',
      DeprovisionCancelLabel: 'Cancel·la',
    },

    SiteSelectorField: {
      DefaultLabel: 'Lloc de destinació',
      CurrentSiteLabel: 'Lloc actual',
      HubSiteLabel: 'Lloc del concentrador pare',
      HubNotAvailableLabel: 'No disponible',
      SearchSiteLabel: 'Busca lloc',

      SelectedSiteGroupAriaLabel: 'Lloc seleccionat',
      SearchSitesAriaLabel: 'Busca llocs',
      SearchPlaceholder: 'Busca per títol o URL',

      SearchingLabel: 'Buscant',
      EmptySearchLabel: 'Escriviu per a buscar',
      NoResultsLabel: 'No s\'han trobat resultats',
    },

    NavigationGuard: {
      LeavePageWarning: 'Hi ha una operació en curs. Si eixiu, s\'interromprà.',
    },
  };
});
