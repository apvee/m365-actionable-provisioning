/**
 * Polish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Potwierdź',
      CancelLabel: 'Anuluj',
    },

    LogPanel: {
      EmptyMessage: 'Brak dostępnych dzienników',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Brak dostępnych wyników zgodności',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Oczekujące',
      RunningLabel: 'Uruchomione',
      ExecutedLabel: 'Wykonane',
      FailedLabel: 'Niepowodzenie',
      SkippedLabel: 'Pominięte',

      SkipReasonNotFound: 'Nie znaleziono',
      SkipReasonAlreadyExists: 'Już istnieje',
      SkipReasonNoChanges: 'Brak zmian',
      SkipReasonMissingPrerequisite: 'Brak wymagania wstępnego',
      SkipReasonUnsupported: 'Nieobsługiwane',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Zgodne',
      NonCompliantLabel: 'Niezgodne',
      UnverifiableLabel: 'Nieweryfikowalne',
      IgnoredLabel: 'Zignorowane',
      BlockedLabel: 'Zablokowane',

      PendingLabel: 'Oczekujące',
      RunningLabel: 'Sprawdzanie',
      CancelledLabel: 'Anulowane',

      BlockedByPrefix: 'Zablokowane przez',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Aprowizacja',
      CloseButtonAriaLabel: 'Zamknij',
      CloseLabel: 'Zamknij',
      BackToProvisioningLabel: 'Wstecz',

      TargetSiteLabel: 'Witryna docelowa',
      TargetSiteMissingTitle: 'Brak witryny docelowej',
      TargetSiteMissingMessage: 'Wybierz witrynę docelową we właściwościach składnika Web Part przed uruchomieniem aprowizacji.',
      ErrorFallbackCode: 'BŁĄD',

      TotalLabel: 'Razem',
      SuccessLabel: 'Powodzenie',
      FailLabel: 'Niepowodzenie',
      SkippedLabel: 'Pominięte',
      PendingLabel: 'Oczekujące',
      CompletedLabel: 'Ukończone',

      FinalOutcomeSucceededLabel: 'Powodzenie',
      FinalOutcomeFailedLabel: 'Niepowodzenie',
      FinalOutcomeCancelledLabel: 'Anulowane',
      FinalOutcomeRunningLabel: 'Uruchomione',

      InitialHelpProvisioningText: 'Użyj Uruchom, aby rozpocząć aprowizację w witrynie docelowej. Możesz przeglądać postęp i dzienniki podczas wykonywania akcji.',
      InitialHelpComplianceText: 'Użyj Sprawdź, aby wyświetlić podgląd problemów ze zgodnością przed zastosowaniem zmian.',

      ProvisioningDefaultDescription: 'Uruchom aprowizację przy użyciu skonfigurowanego planu.',
      ComplianceDefaultDescription: 'Uruchom sprawdzanie zgodności przy użyciu skonfigurowanego planu.',

      ViewLogsLabel: 'Wyświetl dzienniki',
      CheckComplianceLabel: 'Sprawdź',
      CancelLabel: 'Anuluj',
      RunLabel: 'Uruchom',

      ConfirmRunTitle: 'Potwierdź uruchomienie',
      ConfirmRunMessage: 'Czy na pewno chcesz rozpocząć uruchamianie?',

      ComplianceDefaultTitle: 'Zgodność',
      ComplianceHeaderLabel: 'Sprawdzanie zgodności',
      RunCheckLabel: 'Uruchom sprawdzanie',
      CancelCheckLabel: 'Anuluj',
      CheckingLabel: 'Sprawdzanie zgodności…',

      OverallCompliantLabel: 'Zgodne',
      OverallWarningLabel: 'Ostrzeżenie',
      OverallNonCompliantLabel: 'Niezgodne',
      OverallRunningLabel: 'Uruchomione',
      OverallCancelledLabel: 'Anulowane',

      CheckedLabel: 'Sprawdzone',
      BlockedLabel: 'Zablokowane',
      CompliantLabel: 'Zgodne',
      NonCompliantLabel: 'Niezgodne',
      UnverifiableLabel: 'Nieweryfikowalne',
      IgnoredLabel: 'Zignorowane',

      ComplianceTargetSiteMissingTitle: 'Witryna docelowa',
      ComplianceTargetSiteMissingMessage: 'Adres URL witryny docelowej jest wymagany do uruchomienia sprawdzania zgodności.',
      ComplianceErrorFallbackTitle: 'Błąd',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Aprowizacja szablonu',
      ProvisionLabel: 'Aprowizuj',
      DeprovisionLabel: 'Usuń aprowizację',
      CheckLabel: 'Sprawdź',

      StateAppliedLabel: 'Zastosowane',
      StateNotAppliedLabel: 'Niezastosowane',
      StateUnknownLabel: 'Nieznane',

      ProvisioningDialogTitle: 'Aprowizacja',
      ProvisioningDialogDescription: 'Uruchom aprowizację przy użyciu skonfigurowanego planu.',
      DeprovisioningDialogTitle: 'Usuwanie aprowizacji',
      DeprovisioningDialogDescription: 'Uruchom usuwanie aprowizacji przy użyciu skonfigurowanego planu.',

      DeprovisionConfirmRunTitle: 'Potwierdź usunięcie aprowizacji',
      DeprovisionConfirmRunMessage: 'Czy na pewno chcesz rozpocząć usuwanie aprowizacji?',
      DeprovisionConfirmLabel: 'Usuń aprowizację',
      DeprovisionCancelLabel: 'Anuluj',
    },

    SiteSelectorField: {
      DefaultLabel: 'Witryna docelowa',
      CurrentSiteLabel: 'Bieżąca witryna',
      HubSiteLabel: 'Nadrzędna witryna centrum',
      HubNotAvailableLabel: 'Niedostępne',
      SearchSiteLabel: 'Wyszukaj witrynę',

      SelectedSiteGroupAriaLabel: 'Wybrana witryna',
      SearchSitesAriaLabel: 'Wyszukaj witryny',
      SearchPlaceholder: 'Wyszukaj według tytułu lub adresu URL',

      SearchingLabel: 'Wyszukiwanie',
      EmptySearchLabel: 'Wpisz, aby wyszukać',
      NoResultsLabel: 'Nie znaleziono wyników',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Operacja jest w toku. Jeśli opuścisz stronę, zostanie przerwana.',
    },
  };
});
