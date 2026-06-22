/**
 * Galician strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Confirmar',
      CancelLabel: 'Cancelar',
    },

    LogPanel: {
      EmptyMessage: 'Non hai rexistros dispoñibles',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Non hai resultados de cumprimento dispoñibles',
    },

    ProvisioningActivityEntry: {
      PendingLabel: 'Pendente',
      RunningLabel: 'En execución',
      ExecutedLabel: 'Executado',
      FailedLabel: 'Fallou',
      SkippedLabel: 'Omitido',

      SkipReasonNotFound: 'Non atopado',
      SkipReasonAlreadyExists: 'Xa existe',
      SkipReasonNoChanges: 'Sen cambios',
      SkipReasonMissingPrerequisite: 'Falta un requisito previo',
      SkipReasonUnsupported: 'Non compatible',
    },

    ComplianceActivityEntry: {
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Non conforme',
      UnverifiableLabel: 'Non verificable',
      IgnoredLabel: 'Ignorado',
      BlockedLabel: 'Bloqueado',

      PendingLabel: 'Pendente',
      RunningLabel: 'Comprobando',
      CancelledLabel: 'Cancelado',

      BlockedByPrefix: 'Bloqueado por',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Aprovisionamento',
      CloseButtonAriaLabel: 'Pechar',
      CloseLabel: 'Pechar',
      BackToProvisioningLabel: 'Atrás',

      TargetSiteLabel: 'Sitio de destino',
      TargetSiteMissingTitle: 'Falta o sitio de destino',
      TargetSiteMissingMessage: 'Seleccione un sitio de destino nas propiedades da parte web antes de executar o aprovisionamento.',
      ErrorFallbackCode: 'ERRO',

      TotalLabel: 'Total',
      SuccessLabel: 'Éxito',
      FailLabel: 'Fallou',
      SkippedLabel: 'Omitido',
      PendingLabel: 'Pendente',
      CompletedLabel: 'Completado',

      FinalOutcomeSucceededLabel: 'Correcto',
      FinalOutcomeFailedLabel: 'Fallou',
      FinalOutcomeCancelledLabel: 'Cancelado',
      FinalOutcomeRunningLabel: 'En execución',

      InitialHelpProvisioningText: 'Use Executar para iniciar o aprovisionamento no sitio de destino. Pode revisar o progreso e os rexistros mentres se executan as accións.',
      InitialHelpComplianceText: 'Use Comprobar para previsualizar problemas de cumprimento antes de aplicar cambios.',

      ProvisioningDefaultDescription: 'Execute o aprovisionamento usando o plan configurado.',
      ComplianceDefaultDescription: 'Execute a comprobación de cumprimento usando o plan configurado.',

      ViewLogsLabel: 'Ver rexistros',
      CheckComplianceLabel: 'Comprobar',
      CancelLabel: 'Cancelar',
      RunLabel: 'Executar',

      ConfirmRunTitle: 'Confirmar execución',
      ConfirmRunMessage: 'Está seguro de que quere iniciar a execución?',

      ComplianceDefaultTitle: 'Cumprimento',
      ComplianceHeaderLabel: 'Comprobación de cumprimento',
      RunCheckLabel: 'Executar comprobación',
      CancelCheckLabel: 'Cancelar',
      CheckingLabel: 'Comprobando cumprimento…',

      OverallCompliantLabel: 'Conforme',
      OverallWarningLabel: 'Aviso',
      OverallNonCompliantLabel: 'Non conforme',
      OverallRunningLabel: 'En execución',
      OverallCancelledLabel: 'Cancelado',

      CheckedLabel: 'Comprobado',
      BlockedLabel: 'Bloqueado',
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Non conforme',
      UnverifiableLabel: 'Non verificable',
      IgnoredLabel: 'Ignorado',

      ComplianceTargetSiteMissingTitle: 'Sitio de destino',
      ComplianceTargetSiteMissingMessage: 'Requírese un URL do sitio de destino para executar a comprobación de cumprimento.',
      ComplianceErrorFallbackTitle: 'Erro',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Aprovisionamento de modelo',
      ProvisionLabel: 'Aprovisionar',
      DeprovisionLabel: 'Desaprovisionar',
      CheckLabel: 'Comprobar',

      StateAppliedLabel: 'Aplicado',
      StateNotAppliedLabel: 'Non aplicado',
      StateUnknownLabel: 'Descoñecido',

      ProvisioningDialogTitle: 'Aprovisionamento',
      ProvisioningDialogDescription: 'Execute o aprovisionamento usando o plan configurado.',
      DeprovisioningDialogTitle: 'Desaprovisionamento',
      DeprovisioningDialogDescription: 'Execute o desaprovisionamento usando o plan configurado.',

      DeprovisionConfirmRunTitle: 'Confirmar desaprovisionamento',
      DeprovisionConfirmRunMessage: 'Está seguro de que quere iniciar o desaprovisionamento?',
      DeprovisionConfirmLabel: 'Desaprovisionar',
      DeprovisionCancelLabel: 'Cancelar',
    },

    SiteSelectorField: {
      DefaultLabel: 'Sitio de destino',
      CurrentSiteLabel: 'Sitio actual',
      HubSiteLabel: 'Sitio hub principal',
      HubNotAvailableLabel: 'Non dispoñible',
      SearchSiteLabel: 'Buscar sitio',

      SelectedSiteGroupAriaLabel: 'Sitio seleccionado',
      SearchSitesAriaLabel: 'Buscar sitios',
      SearchPlaceholder: 'Buscar por título ou URL',

      SearchingLabel: 'Buscando',
      EmptySearchLabel: 'Escriba para buscar',
      NoResultsLabel: 'Non se atoparon resultados',
    },

    NavigationGuard: {
      LeavePageWarning: 'Hai unha operación en curso. Se sae, interromperase.',
    },
  };
});
