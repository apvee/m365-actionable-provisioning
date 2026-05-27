/**
 * German strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Bestätigen',
      CancelLabel: 'Abbrechen',
    },

    LogPanel: {
      EmptyMessage: 'Keine Protokolle verfügbar',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Keine Compliance-Ergebnisse verfügbar',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Ausstehend',
      RunningLabel: 'Wird ausgeführt',
      ExecutedLabel: 'Ausgeführt',
      FailedLabel: 'Fehlgeschlagen',
      SkippedLabel: 'Übersprungen',

      SkipReasonNotFound: 'Nicht gefunden',
      SkipReasonAlreadyExists: 'Bereits vorhanden',
      SkipReasonNoChanges: 'Keine Änderungen',
      SkipReasonMissingPrerequisite: 'Fehlende Voraussetzung',
      SkipReasonUnsupported: 'Nicht unterstützt',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Konform',
      NonCompliantLabel: 'Nicht konform',
      UnverifiableLabel: 'Nicht überprüfbar',
      IgnoredLabel: 'Ignoriert',
      BlockedLabel: 'Blockiert',

      PendingLabel: 'Ausstehend',
      RunningLabel: 'Wird überprüft',
      CancelledLabel: 'Abgebrochen',

      BlockedByPrefix: 'Blockiert von',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Bereitstellung',
      CloseButtonAriaLabel: 'Schließen',
      CloseLabel: 'Schließen',
      BackToProvisioningLabel: 'Zurück',

      TargetSiteLabel: 'Zielwebsite',
      TargetSiteMissingTitle: 'Zielwebsite fehlt',
      TargetSiteMissingMessage: 'Wählen Sie eine Zielwebsite in den Webpart-Eigenschaften aus, bevor Sie die Bereitstellung ausführen.',
      ErrorFallbackCode: 'FEHLER',

      TotalLabel: 'Gesamt',
      SuccessLabel: 'Erfolgreich',
      FailLabel: 'Fehlgeschlagen',
      SkippedLabel: 'Übersprungen',
      PendingLabel: 'Ausstehend',
      CompletedLabel: 'Abgeschlossen',

      FinalOutcomeSucceededLabel: 'Erfolgreich',
      FinalOutcomeFailedLabel: 'Fehlgeschlagen',
      FinalOutcomeCancelledLabel: 'Abgebrochen',
      FinalOutcomeRunningLabel: 'Wird ausgeführt',

      InitialHelpProvisioningText: 'Verwenden Sie Ausführen, um die Bereitstellung auf der Zielwebsite zu starten. Sie können den Fortschritt und die Protokolle während der Ausführung der Aktionen überprüfen.',
      InitialHelpComplianceText: 'Verwenden Sie Prüfen, um Compliance-Probleme vor dem Anwenden von Änderungen anzuzeigen.',
      ProvisioningDefaultDescription: 'Führen Sie die Bereitstellung mit dem konfigurierten Plan aus.',
      ComplianceDefaultDescription: 'Führen Sie die Compliance-Prüfung mit dem konfigurierten Plan aus.',
      ViewLogsLabel: 'Protokolle anzeigen',
      CheckComplianceLabel: 'Prüfen',
      CancelLabel: 'Abbrechen',
      RunLabel: 'Ausführen',

      ConfirmRunTitle: 'Ausführung bestätigen',
      ConfirmRunMessage: 'Sind Sie sicher, dass Sie die Ausführung starten möchten?',

      ComplianceDefaultTitle: 'Compliance',
      ComplianceHeaderLabel: 'Compliance-Prüfung',
      RunCheckLabel: 'Prüfung ausführen',
      CancelCheckLabel: 'Abbrechen',
      CheckingLabel: 'Compliance wird überprüft…',

      OverallCompliantLabel: 'Konform',
      OverallWarningLabel: 'Warnung',
      OverallNonCompliantLabel: 'Nicht konform',
      OverallRunningLabel: 'Wird ausgeführt',
      OverallCancelledLabel: 'Abgebrochen',

      CheckedLabel: 'Geprüft',
      BlockedLabel: 'Blockiert',
      CompliantLabel: 'Konform',
      NonCompliantLabel: 'Nicht konform',
      UnverifiableLabel: 'Nicht überprüfbar',
      IgnoredLabel: 'Ignoriert',

      ComplianceTargetSiteMissingTitle: 'Zielwebsite',
      ComplianceTargetSiteMissingMessage: 'Eine Zielwebsite-URL ist erforderlich, um die Compliance-Prüfung auszuführen.',
      ComplianceErrorFallbackTitle: 'Fehler',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Vorlagenbereitstellung',
      ProvisionLabel: 'Bereitstellen',
      DeprovisionLabel: 'Bereitstellung aufheben',
      CheckLabel: 'Prüfen',

      StateAppliedLabel: 'Angewendet',
      StateNotAppliedLabel: 'Nicht angewendet',
      StateUnknownLabel: 'Unbekannt',

      ProvisioningDialogTitle: 'Bereitstellung',
      ProvisioningDialogDescription: 'Führen Sie die Bereitstellung mit dem konfigurierten Plan aus.',
      DeprovisioningDialogTitle: 'Bereitstellung aufheben',
      DeprovisioningDialogDescription: 'Führen Sie die Aufhebung der Bereitstellung mit dem konfigurierten Plan aus.',

      DeprovisionConfirmRunTitle: 'Aufhebung der Bereitstellung bestätigen',
      DeprovisionConfirmRunMessage: 'Sind Sie sicher, dass Sie die Aufhebung der Bereitstellung starten möchten?',
      DeprovisionConfirmLabel: 'Bereitstellung aufheben',
      DeprovisionCancelLabel: 'Abbrechen',
    },

    SiteSelectorField: {
      DefaultLabel: 'Zielwebsite',
      CurrentSiteLabel: 'Aktuelle Website',
      HubSiteLabel: 'Übergeordnete Hub-Website',
      HubNotAvailableLabel: 'Nicht verfügbar',
      SearchSiteLabel: 'Website suchen',

      SelectedSiteGroupAriaLabel: 'Ausgewählte Website',
      SearchSitesAriaLabel: 'Websites suchen',
      SearchPlaceholder: 'Nach Titel oder URL suchen',

      SearchingLabel: 'Suche läuft',
      EmptySearchLabel: 'Zum Suchen eingeben',
      NoResultsLabel: 'Keine Ergebnisse gefunden',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Ein Vorgang wird ausgeführt. Wenn Sie die Seite verlassen, wird er unterbrochen.',
    },
  };
});
