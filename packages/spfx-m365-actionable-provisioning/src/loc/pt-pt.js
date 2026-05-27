/**
 * Portuguese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Confirmar',
      CancelLabel: 'Cancelar',
    },

    LogPanel: {
      EmptyMessage: 'Nenhum registo disponível',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Nenhum resultado de conformidade disponível',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Pendente',
      RunningLabel: 'Em execução',
      ExecutedLabel: 'Executado',
      FailedLabel: 'Falhou',
      SkippedLabel: 'Ignorado',

      SkipReasonNotFound: 'Não encontrado',
      SkipReasonAlreadyExists: 'Já existe',
      SkipReasonNoChanges: 'Sem alterações',
      SkipReasonMissingPrerequisite: 'Pré-requisito em falta',
      SkipReasonUnsupported: 'Não suportado',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Não conforme',
      UnverifiableLabel: 'Não verificável',
      IgnoredLabel: 'Ignorado',
      BlockedLabel: 'Bloqueado',

      PendingLabel: 'Pendente',
      RunningLabel: 'A verificar',
      CancelledLabel: 'Cancelado',

      BlockedByPrefix: 'Bloqueado por',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Aprovisionamento',
      CloseButtonAriaLabel: 'Fechar',
      CloseLabel: 'Fechar',
      BackToProvisioningLabel: 'Voltar',

      TargetSiteLabel: 'Site de destino',
      TargetSiteMissingTitle: 'Site de destino em falta',
      TargetSiteMissingMessage: 'Selecione um site de destino nas propriedades da peça Web antes de executar o aprovisionamento.',
      ErrorFallbackCode: 'ERRO',

      TotalLabel: 'Total',
      SuccessLabel: 'Sucesso',
      FailLabel: 'Falha',
      SkippedLabel: 'Ignorado',
      PendingLabel: 'Pendente',
      CompletedLabel: 'Concluído',

      FinalOutcomeSucceededLabel: 'Bem-sucedido',
      FinalOutcomeFailedLabel: 'Falhou',
      FinalOutcomeCancelledLabel: 'Cancelado',
      FinalOutcomeRunningLabel: 'Em execução',

      InitialHelpProvisioningText: 'Utilize Executar para iniciar o aprovisionamento no site de destino. Pode rever o progresso e os registos enquanto as ações são executadas.',
      InitialHelpComplianceText: 'Utilize Verificar para pré-visualizar problemas de conformidade antes de aplicar alterações.',

      ProvisioningDefaultDescription: 'Execute o aprovisionamento utilizando o plano configurado.',
      ComplianceDefaultDescription: 'Execute a verificação de conformidade utilizando o plano configurado.',

      ViewLogsLabel: 'Ver registos',
      CheckComplianceLabel: 'Verificar',
      CancelLabel: 'Cancelar',
      RunLabel: 'Executar',

      ConfirmRunTitle: 'Confirmar execução',
      ConfirmRunMessage: 'Tem a certeza de que pretende iniciar a execução?',

      ComplianceDefaultTitle: 'Conformidade',
      ComplianceHeaderLabel: 'Verificação de conformidade',
      RunCheckLabel: 'Executar verificação',
      CancelCheckLabel: 'Cancelar',
      CheckingLabel: 'A verificar conformidade…',

      OverallCompliantLabel: 'Conforme',
      OverallWarningLabel: 'Aviso',
      OverallNonCompliantLabel: 'Não conforme',
      OverallRunningLabel: 'Em execução',
      OverallCancelledLabel: 'Cancelado',

      CheckedLabel: 'Verificado',
      BlockedLabel: 'Bloqueado',
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Não conforme',
      UnverifiableLabel: 'Não verificável',
      IgnoredLabel: 'Ignorado',

      ComplianceTargetSiteMissingTitle: 'Site de destino',
      ComplianceTargetSiteMissingMessage: 'É necessário um URL de site de destino para executar a verificação de conformidade.',
      ComplianceErrorFallbackTitle: 'Erro',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Aprovisionamento de modelo',
      ProvisionLabel: 'Aprovisionar',
      DeprovisionLabel: 'Desaprovisionar',
      CheckLabel: 'Verificar',

      StateAppliedLabel: 'Aplicado',
      StateNotAppliedLabel: 'Não aplicado',
      StateUnknownLabel: 'Desconhecido',

      ProvisioningDialogTitle: 'Aprovisionamento',
      ProvisioningDialogDescription: 'Execute o aprovisionamento utilizando o plano configurado.',
      DeprovisioningDialogTitle: 'Desaprovisionamento',
      DeprovisioningDialogDescription: 'Execute o desaprovisionamento utilizando o plano configurado.',

      DeprovisionConfirmRunTitle: 'Confirmar desaprovisionamento',
      DeprovisionConfirmRunMessage: 'Tem a certeza de que pretende iniciar o desaprovisionamento?',
      DeprovisionConfirmLabel: 'Desaprovisionar',
      DeprovisionCancelLabel: 'Cancelar',
    },

    SiteSelectorField: {
      DefaultLabel: 'Site de destino',
      CurrentSiteLabel: 'Site atual',
      HubSiteLabel: 'Site hub principal',
      HubNotAvailableLabel: 'Não disponível',
      SearchSiteLabel: 'Pesquisar site',

      SelectedSiteGroupAriaLabel: 'Site selecionado',
      SearchSitesAriaLabel: 'Pesquisar sites',
      SearchPlaceholder: 'Pesquisar por título ou URL',

      SearchingLabel: 'A pesquisar',
      EmptySearchLabel: 'Escreva para pesquisar',
      NoResultsLabel: 'Nenhum resultado encontrado',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Uma operação está em curso. Se sair, será interrompida.',
    },
  };
});
