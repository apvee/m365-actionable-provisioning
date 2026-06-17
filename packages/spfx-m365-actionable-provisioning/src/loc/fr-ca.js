/**
 * Canadian French strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'Confirmer', CancelLabel: 'Annuler' },
    LogPanel: { EmptyMessage: 'Aucun journal disponible' },
    ComplianceLogPanel: { EmptyMessage: 'Aucun résultat de conformité disponible' },
    ProvisioningActivityEntry: {
      PendingLabel: 'En attente', RunningLabel: 'En cours', ExecutedLabel: 'Exécuté', FailedLabel: 'Échoué', SkippedLabel: 'Ignoré',
      SkipReasonNotFound: 'Introuvable', SkipReasonAlreadyExists: 'Existe déjà', SkipReasonNoChanges: 'Aucune modification', SkipReasonMissingPrerequisite: 'Préalable manquant', SkipReasonUnsupported: 'Non pris en charge',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'Conforme', NonCompliantLabel: 'Non conforme', UnverifiableLabel: 'Non vérifiable', IgnoredLabel: 'Ignoré', BlockedLabel: 'Bloqué',
      PendingLabel: 'En attente', RunningLabel: 'Vérification', CancelledLabel: 'Annulé',
      BlockedByPrefix: 'Bloqué par',
    },
    ProvisioningDialog: {
      DefaultTitle: 'Approvisionnement', CloseButtonAriaLabel: 'Fermer', CloseLabel: 'Fermer', BackToProvisioningLabel: 'Retour',
      TargetSiteLabel: 'Site cible', TargetSiteMissingTitle: 'Site cible manquant', TargetSiteMissingMessage: 'Sélectionnez un site cible dans les propriétés du composant WebPart avant d’exécuter l’approvisionnement.', ErrorFallbackCode: 'ERREUR',
      TotalLabel: 'Total', SuccessLabel: 'Réussite', FailLabel: 'Échoué', SkippedLabel: 'Ignoré', PendingLabel: 'En attente', CompletedLabel: 'Terminé',
      FinalOutcomeSucceededLabel: 'Réussi', FinalOutcomeFailedLabel: 'Échoué', FinalOutcomeCancelledLabel: 'Annulé', FinalOutcomeRunningLabel: 'En cours',
      InitialHelpProvisioningText: 'Utilisez Exécuter pour démarrer l’approvisionnement sur le site cible. Vous pouvez consulter la progression et les journaux pendant l’exécution des actions.', InitialHelpComplianceText: 'Utilisez Vérifier pour prévisualiser les problèmes de conformité avant d’appliquer les modifications.',
      ProvisioningDefaultDescription: 'Exécutez l’approvisionnement à l’aide du plan configuré.', ComplianceDefaultDescription: 'Exécutez la vérification de conformité à l’aide du plan configuré.',
      ViewLogsLabel: 'Afficher les journaux', CheckComplianceLabel: 'Vérifier', CancelLabel: 'Annuler', RunLabel: 'Exécuter',
      ConfirmRunTitle: 'Confirmer l’exécution', ConfirmRunMessage: 'Voulez-vous vraiment démarrer l’exécution?',
      ComplianceDefaultTitle: 'Conformité', ComplianceHeaderLabel: 'Vérification de conformité', RunCheckLabel: 'Exécuter la vérification', CancelCheckLabel: 'Annuler', CheckingLabel: 'Vérification de la conformité...',
      OverallCompliantLabel: 'Conforme', OverallWarningLabel: 'Avertissement', OverallNonCompliantLabel: 'Non conforme', OverallRunningLabel: 'En cours', OverallCancelledLabel: 'Annulé',
      CheckedLabel: 'Vérifié', BlockedLabel: 'Bloqué', CompliantLabel: 'Conforme', NonCompliantLabel: 'Non conforme', UnverifiableLabel: 'Non vérifiable', IgnoredLabel: 'Ignoré',
      ComplianceTargetSiteMissingTitle: 'Site cible', ComplianceTargetSiteMissingMessage: 'Une URL de site cible est requise pour exécuter la vérification de conformité.', ComplianceErrorFallbackTitle: 'Erreur',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'Approvisionnement de modèle', ProvisionLabel: 'Approvisionner', DeprovisionLabel: 'Déprovisionner', CheckLabel: 'Vérifier',
      StateAppliedLabel: 'Appliqué', StateNotAppliedLabel: 'Non appliqué', StateUnknownLabel: 'Inconnu',
      ProvisioningDialogTitle: 'Approvisionnement', ProvisioningDialogDescription: 'Exécutez l’approvisionnement à l’aide du plan configuré.', DeprovisioningDialogTitle: 'Déprovisionnement', DeprovisioningDialogDescription: 'Exécutez le déprovisionnement à l’aide du plan configuré.',
      DeprovisionConfirmRunTitle: 'Confirmer le déprovisionnement', DeprovisionConfirmRunMessage: 'Voulez-vous vraiment démarrer le déprovisionnement?', DeprovisionConfirmLabel: 'Déprovisionner', DeprovisionCancelLabel: 'Annuler',
    },
    SiteSelectorField: {
      DefaultLabel: 'Site cible', CurrentSiteLabel: 'Site actuel', HubSiteLabel: 'Site hub parent', HubNotAvailableLabel: 'Non disponible', SearchSiteLabel: 'Rechercher un site',
      SelectedSiteGroupAriaLabel: 'Site sélectionné', SearchSitesAriaLabel: 'Rechercher des sites', SearchPlaceholder: 'Rechercher par titre ou URL',
      SearchingLabel: 'Recherche', EmptySearchLabel: 'Tapez pour rechercher', NoResultsLabel: 'Aucun résultat trouvé',
    },
    NavigationGuard: { LeavePageWarning: 'Une opération est en cours. Si vous quittez la page, elle sera interrompue.' },
  };
});
