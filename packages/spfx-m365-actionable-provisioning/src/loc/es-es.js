/**
 * Spanish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Confirmar',
      CancelLabel: 'Cancelar',
    },

    LogPanel: {
      EmptyMessage: 'No hay registros disponibles',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'No hay resultados de cumplimiento disponibles',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Pendiente',
      RunningLabel: 'En ejecución',
      ExecutedLabel: 'Ejecutado',
      FailedLabel: 'Error',
      SkippedLabel: 'Omitido',

      SkipReasonNotFound: 'No encontrado',
      SkipReasonAlreadyExists: 'Ya existe',
      SkipReasonNoChanges: 'Sin cambios',
      SkipReasonMissingPrerequisite: 'Requisito previo faltante',
      SkipReasonUnsupported: 'No compatible',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'No conforme',
      UnverifiableLabel: 'No verificable',
      IgnoredLabel: 'Ignorado',
      BlockedLabel: 'Bloqueado',

      PendingLabel: 'Pendiente',
      RunningLabel: 'Verificando',
      CancelledLabel: 'Cancelado',

      BlockedByPrefix: 'Bloqueado por',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Aprovisionamiento',
      CloseButtonAriaLabel: 'Cerrar',
      CloseLabel: 'Cerrar',
      BackToProvisioningLabel: 'Volver',

      TargetSiteLabel: 'Sitio de destino',
      TargetSiteMissingTitle: 'Falta el sitio de destino',
      TargetSiteMissingMessage: 'Seleccione un sitio de destino en las propiedades del elemento web antes de ejecutar el aprovisionamiento.',
      ErrorFallbackCode: 'ERROR',

      TotalLabel: 'Total',
      SuccessLabel: 'Éxito',
      FailLabel: 'Error',
      SkippedLabel: 'Omitido',
      PendingLabel: 'Pendiente',
      CompletedLabel: 'Completado',

      FinalOutcomeSucceededLabel: 'Correcto',
      FinalOutcomeFailedLabel: 'Error',
      FinalOutcomeCancelledLabel: 'Cancelado',
      FinalOutcomeRunningLabel: 'En ejecución',

      InitialHelpProvisioningText: 'Use Ejecutar para iniciar el aprovisionamiento en el sitio de destino. Puede revisar el progreso y los registros mientras se ejecutan las acciones.',
      InitialHelpComplianceText: 'Use Verificar para obtener una vista previa de los problemas de cumplimiento antes de aplicar cambios.',

      ProvisioningDefaultDescription: 'Ejecute el aprovisionamiento utilizando el plan configurado.',
      ComplianceDefaultDescription: 'Ejecute la verificación de cumplimiento utilizando el plan configurado.',

      ViewLogsLabel: 'Ver registros',
      CheckComplianceLabel: 'Verificar',
      CancelLabel: 'Cancelar',
      RunLabel: 'Ejecutar',

      ConfirmRunTitle: 'Confirmar ejecución',
      ConfirmRunMessage: '¿Está seguro de que desea iniciar la ejecución?',

      ComplianceDefaultTitle: 'Cumplimiento',
      ComplianceHeaderLabel: 'Verificación de cumplimiento',
      RunCheckLabel: 'Ejecutar verificación',
      CancelCheckLabel: 'Cancelar',
      CheckingLabel: 'Verificando cumplimiento…',

      OverallCompliantLabel: 'Conforme',
      OverallWarningLabel: 'Advertencia',
      OverallNonCompliantLabel: 'No conforme',
      OverallRunningLabel: 'En ejecución',
      OverallCancelledLabel: 'Cancelado',

      CheckedLabel: 'Verificado',
      BlockedLabel: 'Bloqueado',
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'No conforme',
      UnverifiableLabel: 'No verificable',
      IgnoredLabel: 'Ignorado',

      ComplianceTargetSiteMissingTitle: 'Sitio de destino',
      ComplianceTargetSiteMissingMessage: 'Se requiere una URL del sitio de destino para ejecutar la verificación de cumplimiento.',
      ComplianceErrorFallbackTitle: 'Error',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Aprovisionamiento de plantilla',
      ProvisionLabel: 'Aprovisionar',
      DeprovisionLabel: 'Desaprovisionar',
      CheckLabel: 'Verificar',

      StateAppliedLabel: 'Aplicado',
      StateNotAppliedLabel: 'No aplicado',
      StateUnknownLabel: 'Desconocido',

      ProvisioningDialogTitle: 'Aprovisionamiento',
      ProvisioningDialogDescription: 'Ejecute el aprovisionamiento utilizando el plan configurado.',
      DeprovisioningDialogTitle: 'Desaprovisionamiento',
      DeprovisioningDialogDescription: 'Ejecute el desaprovisionamiento utilizando el plan configurado.',

      DeprovisionConfirmRunTitle: 'Confirmar desaprovisionamiento',
      DeprovisionConfirmRunMessage: '¿Está seguro de que desea iniciar el desaprovisionamiento?',
      DeprovisionConfirmLabel: 'Desaprovisionar',
      DeprovisionCancelLabel: 'Cancelar',
    },

    SiteSelectorField: {
      DefaultLabel: 'Sitio de destino',
      CurrentSiteLabel: 'Sitio actual',
      HubSiteLabel: 'Sitio del concentrador principal',
      HubNotAvailableLabel: 'No disponible',
      SearchSiteLabel: 'Buscar sitio',

      SelectedSiteGroupAriaLabel: 'Sitio seleccionado',
      SearchSitesAriaLabel: 'Buscar sitios',
      SearchPlaceholder: 'Buscar por título o URL',

      SearchingLabel: 'Buscando',
      EmptySearchLabel: 'Escriba para buscar',
      NoResultsLabel: 'No se encontraron resultados',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Hay una operación en curso. Si abandona la página, se interrumpirá.',
    },
  };
});
