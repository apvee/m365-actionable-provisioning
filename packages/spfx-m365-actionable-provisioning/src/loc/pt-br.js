/**
 * Brazilian Portuguese strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Confirmar', CancelLabel: 'Cancelar' },
    LogPanel: { EmptyMessage: 'Nenhum log disponível' },
    ComplianceLogPanel: { EmptyMessage: 'Nenhum resultado de conformidade disponível' },
    ProvisioningActivityEntry: {
      PendingLabel: 'Pendente', RunningLabel: 'Em execução', ExecutedLabel: 'Executado', FailedLabel: 'Falhou', SkippedLabel: 'Ignorado',
      SkipReasonNotFound: 'Não encontrado', SkipReasonAlreadyExists: 'Já existe', SkipReasonNoChanges: 'Sem alterações', SkipReasonMissingPrerequisite: 'Pré-requisito ausente', SkipReasonUnsupported: 'Sem suporte',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Em conformidade', NonCompliantLabel: 'Não conforme', UnverifiableLabel: 'Não verificável', IgnoredLabel: 'Ignorado', BlockedLabel: 'Bloqueado',
      PendingLabel: 'Pendente', RunningLabel: 'Verificando', CancelledLabel: 'Cancelado',
      BlockedByPrefix: 'Bloqueado por',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Provisionamento', CloseButtonAriaLabel: 'Fechar', CloseLabel: 'Fechar', BackToProvisioningLabel: 'Voltar',
      TargetSiteLabel: 'Site de destino', TargetSiteMissingTitle: 'Site de destino ausente', TargetSiteMissingMessage: 'Selecione um site de destino nas propriedades da Web Part antes de executar o provisionamento.', ErrorFallbackCode: 'ERRO',
      TotalLabel: 'Total', SuccessLabel: 'Sucesso', FailLabel: 'Falhou', SkippedLabel: 'Ignorado', PendingLabel: 'Pendente', CompletedLabel: 'Concluído',
      FinalOutcomeSucceededLabel: 'Bem-sucedido', FinalOutcomeFailedLabel: 'Falhou', FinalOutcomeCancelledLabel: 'Cancelado', FinalOutcomeRunningLabel: 'Em execução',
      InitialHelpProvisioningText: 'Use Executar para iniciar o provisionamento no site de destino. Você pode revisar o progresso e os logs enquanto as ações são executadas.', InitialHelpComplianceText: 'Use Verificar para visualizar problemas de conformidade antes de aplicar alterações.',
      ProvisioningDefaultDescription: 'Execute o provisionamento usando o plano configurado.', ComplianceDefaultDescription: 'Execute a verificação de conformidade usando o plano configurado.',
      ViewLogsLabel: 'Exibir logs', CheckComplianceLabel: 'Verificar', CancelLabel: 'Cancelar', RunLabel: 'Executar',
      ConfirmRunTitle: 'Confirmar execução', ConfirmRunMessage: 'Tem certeza de que deseja iniciar a execução?',
      ComplianceDefaultTitle: 'Conformidade', ComplianceHeaderLabel: 'Verificação de conformidade', RunCheckLabel: 'Executar verificação', CancelCheckLabel: 'Cancelar', CheckingLabel: 'Verificando conformidade...',
      OverallCompliantLabel: 'Em conformidade', OverallWarningLabel: 'Aviso', OverallNonCompliantLabel: 'Não conforme', OverallRunningLabel: 'Em execução', OverallCancelledLabel: 'Cancelado',
      CheckedLabel: 'Verificado', BlockedLabel: 'Bloqueado', CompliantLabel: 'Em conformidade', NonCompliantLabel: 'Não conforme', UnverifiableLabel: 'Não verificável', IgnoredLabel: 'Ignorado',
      ComplianceTargetSiteMissingTitle: 'Site de destino', ComplianceTargetSiteMissingMessage: 'Uma URL de site de destino é obrigatória para executar a verificação de conformidade.', ComplianceErrorFallbackTitle: 'Erro',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Provisionamento de modelo', ProvisionLabel: 'Provisionar', DeprovisionLabel: 'Desprovisionar', CheckLabel: 'Verificar',
      StateAppliedLabel: 'Aplicado', StateNotAppliedLabel: 'Não aplicado', StateUnknownLabel: 'Desconhecido',
      ProvisioningDialogTitle: 'Provisionamento', ProvisioningDialogDescription: 'Execute o provisionamento usando o plano configurado.', DeprovisioningDialogTitle: 'Desprovisionamento', DeprovisioningDialogDescription: 'Execute o desprovisionamento usando o plano configurado.',
      DeprovisionConfirmRunTitle: 'Confirmar desprovisionamento', DeprovisionConfirmRunMessage: 'Tem certeza de que deseja iniciar o desprovisionamento?', DeprovisionConfirmLabel: 'Desprovisionar', DeprovisionCancelLabel: 'Cancelar',
    },
    SiteSelectorField: {
      DefaultLabel: 'Site de destino', CurrentSiteLabel: 'Site atual', HubSiteLabel: 'Site hub pai', HubNotAvailableLabel: 'Não disponível', SearchSiteLabel: 'Pesquisar site',
      SelectedSiteGroupAriaLabel: 'Site selecionado', SearchSitesAriaLabel: 'Pesquisar sites', SearchPlaceholder: 'Pesquisar por título ou URL',
      SearchingLabel: 'Pesquisando', EmptySearchLabel: 'Digite para pesquisar', NoResultsLabel: 'Nenhum resultado encontrado',
    },
    NavigationGuard: { LeavePageWarning: 'Uma operação está em andamento. Se você sair, ela será interrompida.' },
  };
});
