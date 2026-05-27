/**
 * Italian strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Conferma',
      CancelLabel: 'Annulla',
    },

    LogPanel: {
      EmptyMessage: 'Nessun log disponibile',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Nessun risultato di conformità disponibile',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'In attesa',
      RunningLabel: 'In esecuzione',
      ExecutedLabel: 'Eseguito',
      FailedLabel: 'Non riuscito',
      SkippedLabel: 'Ignorato',

      SkipReasonNotFound: 'Non trovato',
      SkipReasonAlreadyExists: 'Già esistente',
      SkipReasonNoChanges: 'Nessuna modifica',
      SkipReasonMissingPrerequisite: 'Prerequisito mancante',
      SkipReasonUnsupported: 'Non supportato',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Non conforme',
      UnverifiableLabel: 'Non verificabile',
      IgnoredLabel: 'Ignorato',
      BlockedLabel: 'Bloccato',

      PendingLabel: 'In attesa',
      RunningLabel: 'Verifica in corso',
      CancelledLabel: 'Annullato',

      BlockedByPrefix: 'Bloccato da',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Provisioning',
      CloseButtonAriaLabel: 'Chiudi',
      CloseLabel: 'Chiudi',
      BackToProvisioningLabel: 'Indietro',

      TargetSiteLabel: 'Sito di destinazione',
      TargetSiteMissingTitle: 'Sito di destinazione mancante',
      TargetSiteMissingMessage: 'Seleziona un sito di destinazione nelle proprietà della web part prima di eseguire il provisioning.',
      ErrorFallbackCode: 'ERRORE',

      TotalLabel: 'Totale',
      SuccessLabel: 'Riusciti',
      FailLabel: 'Non riusciti',
      SkippedLabel: 'Ignorati',
      PendingLabel: 'In attesa',
      CompletedLabel: 'Completati',

      FinalOutcomeSucceededLabel: 'Completato con successo',
      FinalOutcomeFailedLabel: 'Non riuscito',
      FinalOutcomeCancelledLabel: 'Annullato',
      FinalOutcomeRunningLabel: 'In esecuzione',

      InitialHelpProvisioningText: 'Usa Esegui per avviare il provisioning sul sito di destinazione. Puoi monitorare l\'avanzamento e i log durante l\'esecuzione delle azioni.',
      InitialHelpComplianceText: 'Usa Verifica per visualizzare in anteprima i problemi di conformità prima di applicare le modifiche.',

      ProvisioningDefaultDescription: 'Esegui il provisioning utilizzando il piano configurato.',
      ComplianceDefaultDescription: 'Esegui la verifica di conformità utilizzando il piano configurato.',

      ViewLogsLabel: 'Visualizza log',
      CheckComplianceLabel: 'Verifica',
      CancelLabel: 'Annulla',
      RunLabel: 'Esegui',

      ConfirmRunTitle: 'Conferma esecuzione',
      ConfirmRunMessage: 'Sei sicuro di voler avviare l\'esecuzione?',

      ComplianceDefaultTitle: 'Conformità',
      ComplianceHeaderLabel: 'Verifica conformità',
      RunCheckLabel: 'Esegui verifica',
      CancelCheckLabel: 'Annulla',
      CheckingLabel: 'Verifica conformità in corso…',

      OverallCompliantLabel: 'Conforme',
      OverallWarningLabel: 'Avviso',
      OverallNonCompliantLabel: 'Non conforme',
      OverallRunningLabel: 'In esecuzione',
      OverallCancelledLabel: 'Annullato',

      CheckedLabel: 'Verificati',
      BlockedLabel: 'Bloccati',
      CompliantLabel: 'Conformi',
      NonCompliantLabel: 'Non conformi',
      UnverifiableLabel: 'Non verificabili',
      IgnoredLabel: 'Ignorati',

      ComplianceTargetSiteMissingTitle: 'Sito di destinazione',
      ComplianceTargetSiteMissingMessage: 'È necessario un URL del sito di destinazione per eseguire la verifica di conformità.',
      ComplianceErrorFallbackTitle: 'Errore',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Provisioning modello',
      ProvisionLabel: 'Provisioning',
      DeprovisionLabel: 'Deprovisioning',
      CheckLabel: 'Verifica',

      StateAppliedLabel: 'Applicato',
      StateNotAppliedLabel: 'Non applicato',
      StateUnknownLabel: 'Sconosciuto',

      ProvisioningDialogTitle: 'Provisioning',
      ProvisioningDialogDescription: 'Esegui il provisioning utilizzando il piano configurato.',
      DeprovisioningDialogTitle: 'Deprovisioning',
      DeprovisioningDialogDescription: 'Esegui il deprovisioning utilizzando il piano configurato.',

      DeprovisionConfirmRunTitle: 'Conferma deprovisioning',
      DeprovisionConfirmRunMessage: 'Sei sicuro di voler avviare il deprovisioning?',
      DeprovisionConfirmLabel: 'Deprovisioning',
      DeprovisionCancelLabel: 'Annulla',
    },

    SiteSelectorField: {
      DefaultLabel: 'Sito di destinazione',
      CurrentSiteLabel: 'Sito corrente',
      HubSiteLabel: 'Sito hub principale',
      HubNotAvailableLabel: 'Non disponibile',
      SearchSiteLabel: 'Cerca sito',

      SelectedSiteGroupAriaLabel: 'Sito selezionato',
      SearchSitesAriaLabel: 'Cerca siti',
      SearchPlaceholder: 'Cerca per titolo o URL',

      SearchingLabel: 'Ricerca in corso',
      EmptySearchLabel: 'Digita per cercare',
      NoResultsLabel: 'Nessun risultato trovato',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'È in corso un\'operazione. Se abbandoni la pagina, verrà interrotta.',
    },
  };
});
