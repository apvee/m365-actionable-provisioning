/**
 * French strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Confirmer',
      CancelLabel: 'Annuler',
    },

    LogPanel: {
      EmptyMessage: 'Aucun journal disponible',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Aucun résultat de conformité disponible',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'En attente',
      RunningLabel: 'En cours',
      ExecutedLabel: 'Exécuté',
      FailedLabel: 'Échoué',
      SkippedLabel: 'Ignoré',

      SkipReasonNotFound: 'Non trouvé',
      SkipReasonAlreadyExists: 'Existe déjà',
      SkipReasonNoChanges: 'Aucune modification',
      SkipReasonMissingPrerequisite: 'Prérequis manquant',
      SkipReasonUnsupported: 'Non pris en charge',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Non conforme',
      UnverifiableLabel: 'Non vérifiable',
      IgnoredLabel: 'Ignoré',
      BlockedLabel: 'Bloqué',

      PendingLabel: 'En attente',
      RunningLabel: 'Vérification',
      CancelledLabel: 'Annulé',

      BlockedByPrefix: 'Bloqué par',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Approvisionnement',
      CloseButtonAriaLabel: 'Fermer',
      CloseLabel: 'Fermer',
      BackToProvisioningLabel: 'Retour',

      TargetSiteLabel: 'Site cible',
      TargetSiteMissingTitle: 'Site cible manquant',
      TargetSiteMissingMessage: 'Sélectionnez un site cible dans les propriétés du composant WebPart avant d\'exécuter l\'approvisionnement.',
      ErrorFallbackCode: 'ERREUR',

      TotalLabel: 'Total',
      SuccessLabel: 'Réussi',
      FailLabel: 'Échoué',
      SkippedLabel: 'Ignoré',
      PendingLabel: 'En attente',
      CompletedLabel: 'Terminé',

      FinalOutcomeSucceededLabel: 'Réussi',
      FinalOutcomeFailedLabel: 'Échoué',
      FinalOutcomeCancelledLabel: 'Annulé',
      FinalOutcomeRunningLabel: 'En cours',

      InitialHelpProvisioningText: 'Utilisez Exécuter pour démarrer l\'approvisionnement sur le site cible. Vous pouvez suivre la progression et les journaux pendant l\'exécution des actions.',
      InitialHelpComplianceText: 'Utilisez Vérifier pour prévisualiser les problèmes de conformité avant d\'appliquer les modifications.',

      ProvisioningDefaultDescription: 'Exécutez l\'approvisionnement en utilisant le plan configuré.',
      ComplianceDefaultDescription: 'Exécutez la vérification de conformité en utilisant le plan configuré.',

      ViewLogsLabel: 'Voir les journaux',
      CheckComplianceLabel: 'Vérifier',
      CancelLabel: 'Annuler',
      RunLabel: 'Exécuter',

      ConfirmRunTitle: 'Confirmer l\'exécution',
      ConfirmRunMessage: 'Êtes-vous sûr de vouloir démarrer l\'exécution ?',

      ComplianceDefaultTitle: 'Conformité',
      ComplianceHeaderLabel: 'Vérification de conformité',
      RunCheckLabel: 'Exécuter la vérification',
      CancelCheckLabel: 'Annuler',
      CheckingLabel: 'Vérification de la conformité…',

      OverallCompliantLabel: 'Conforme',
      OverallWarningLabel: 'Avertissement',
      OverallNonCompliantLabel: 'Non conforme',
      OverallRunningLabel: 'En cours',
      OverallCancelledLabel: 'Annulé',

      CheckedLabel: 'Vérifié',
      BlockedLabel: 'Bloqué',
      CompliantLabel: 'Conforme',
      NonCompliantLabel: 'Non conforme',
      UnverifiableLabel: 'Non vérifiable',
      IgnoredLabel: 'Ignoré',

      ComplianceTargetSiteMissingTitle: 'Site cible',
      ComplianceTargetSiteMissingMessage: 'Une URL de site cible est requise pour exécuter la vérification de conformité.',
      ComplianceErrorFallbackTitle: 'Erreur',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Approvisionnement de modèle',
      ProvisionLabel: 'Approvisionner',
      DeprovisionLabel: 'Désapprovisionner',
      CheckLabel: 'Vérifier',

      StateAppliedLabel: 'Appliqué',
      StateNotAppliedLabel: 'Non appliqué',
      StateUnknownLabel: 'Inconnu',

      ProvisioningDialogTitle: 'Approvisionnement',
      ProvisioningDialogDescription: 'Exécutez l\'approvisionnement en utilisant le plan configuré.',
      DeprovisioningDialogTitle: 'Désapprovisionnement',
      DeprovisioningDialogDescription: 'Exécutez le désapprovisionnement en utilisant le plan configuré.',

      DeprovisionConfirmRunTitle: 'Confirmer le désapprovisionnement',
      DeprovisionConfirmRunMessage: 'Êtes-vous sûr de vouloir démarrer le désapprovisionnement ?',
      DeprovisionConfirmLabel: 'Désapprovisionner',
      DeprovisionCancelLabel: 'Annuler',
    },

    SiteSelectorField: {
      DefaultLabel: 'Site cible',
      CurrentSiteLabel: 'Site actuel',
      HubSiteLabel: 'Site hub parent',
      HubNotAvailableLabel: 'Non disponible',
      SearchSiteLabel: 'Rechercher un site',

      SelectedSiteGroupAriaLabel: 'Site sélectionné',
      SearchSitesAriaLabel: 'Rechercher des sites',
      SearchPlaceholder: 'Rechercher par titre ou URL',

      SearchingLabel: 'Recherche',
      EmptySearchLabel: 'Tapez pour rechercher',
      NoResultsLabel: 'Aucun résultat trouvé',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Une opération est en cours. Si vous quittez, elle sera interrompue.',
    },
  };
});
