/**
 * Finnish strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: {
      ConfirmLabel: 'Vahvista',
      CancelLabel: 'Peruuta',
    },

    LogPanel: {
      EmptyMessage: 'Lokeja ei ole saatavilla',
    },

    ComplianceLogPanel: {
      EmptyMessage: 'Vaatimustenmukaisuustuloksia ei ole saatavilla',
    },

    ProvisioningLogEntry: {
      PendingLabel: 'Odottaa',
      RunningLabel: 'Käynnissä',
      ExecutedLabel: 'Suoritettu',
      FailedLabel: 'Epäonnistui',
      SkippedLabel: 'Ohitettu',

      SkipReasonNotFound: 'Ei löytynyt',
      SkipReasonAlreadyExists: 'On jo olemassa',
      SkipReasonNoChanges: 'Ei muutoksia',
      SkipReasonMissingPrerequisite: 'Puuttuva edellytys',
      SkipReasonUnsupported: 'Ei tuettu',
    },

    ComplianceLogEntry: {
      CompliantLabel: 'Vaatimustenmukainen',
      NonCompliantLabel: 'Ei vaatimustenmukainen',
      UnverifiableLabel: 'Ei todennettavissa',
      IgnoredLabel: 'Ohitettu',
      BlockedLabel: 'Estetty',

      PendingLabel: 'Odottaa',
      RunningLabel: 'Tarkistetaan',
      CancelledLabel: 'Peruutettu',

      BlockedByPrefix: 'Esti',
    },

    ProvisioningDialog: {
      DefaultTitle: 'Valmistelu',
      CloseButtonAriaLabel: 'Sulje',
      CloseLabel: 'Sulje',
      BackToProvisioningLabel: 'Takaisin',

      TargetSiteLabel: 'Kohdesivusto',
      TargetSiteMissingTitle: 'Kohdesivusto puuttuu',
      TargetSiteMissingMessage: 'Valitse kohdesivusto verkko-osan ominaisuuksista ennen valmistelun suorittamista.',
      ErrorFallbackCode: 'VIRHE',

      TotalLabel: 'Yhteensä',
      SuccessLabel: 'Onnistui',
      FailLabel: 'Epäonnistui',
      SkippedLabel: 'Ohitettu',
      PendingLabel: 'Odottaa',
      CompletedLabel: 'Valmis',

      FinalOutcomeSucceededLabel: 'Onnistui',
      FinalOutcomeFailedLabel: 'Epäonnistui',
      FinalOutcomeCancelledLabel: 'Peruutettu',
      FinalOutcomeRunningLabel: 'Käynnissä',

      InitialHelpProvisioningText: 'Käytä Suorita-painiketta aloittaaksesi valmistelun kohdesivustolle. Voit seurata edistymistä ja lokeja toimintojen suorituksen aikana.',
      InitialHelpComplianceText: 'Käytä Tarkista-painiketta esikatsellaksesi vaatimustenmukaisuusongelmia ennen muutosten soveltamista.',

      ProvisioningDefaultDescription: 'Suorita valmistelu määritetyllä suunnitelmalla.',
      ComplianceDefaultDescription: 'Suorita vaatimustenmukaisuustarkistus määritetyllä suunnitelmalla.',

      ViewLogsLabel: 'Näytä lokit',
      CheckComplianceLabel: 'Tarkista',
      CancelLabel: 'Peruuta',
      RunLabel: 'Suorita',

      ConfirmRunTitle: 'Vahvista suoritus',
      ConfirmRunMessage: 'Haluatko varmasti aloittaa suorituksen?',

      ComplianceDefaultTitle: 'Vaatimustenmukaisuus',
      ComplianceHeaderLabel: 'Vaatimustenmukaisuustarkistus',
      RunCheckLabel: 'Suorita tarkistus',
      CancelCheckLabel: 'Peruuta',
      CheckingLabel: 'Tarkistetaan vaatimustenmukaisuutta…',

      OverallCompliantLabel: 'Vaatimustenmukainen',
      OverallWarningLabel: 'Varoitus',
      OverallNonCompliantLabel: 'Ei vaatimustenmukainen',
      OverallRunningLabel: 'Käynnissä',
      OverallCancelledLabel: 'Peruutettu',

      CheckedLabel: 'Tarkistettu',
      BlockedLabel: 'Estetty',
      CompliantLabel: 'Vaatimustenmukainen',
      NonCompliantLabel: 'Ei vaatimustenmukainen',
      UnverifiableLabel: 'Ei todennettavissa',
      IgnoredLabel: 'Ohitettu',

      ComplianceTargetSiteMissingTitle: 'Kohdesivusto',
      ComplianceTargetSiteMissingMessage: 'Kohdesivuston URL-osoite vaaditaan vaatimustenmukaisuustarkistuksen suorittamiseen.',
      ComplianceErrorFallbackTitle: 'Virhe',
    },

    PropertyPaneProvisioningField: {
      DefaultLabel: 'Mallin valmistelu',
      ProvisionLabel: 'Valmistele',
      DeprovisionLabel: 'Poista valmistelu',
      CheckLabel: 'Tarkista',

      StateAppliedLabel: 'Käytetty',
      StateNotAppliedLabel: 'Ei käytetty',
      StateUnknownLabel: 'Tuntematon',

      ProvisioningDialogTitle: 'Valmistelu',
      ProvisioningDialogDescription: 'Suorita valmistelu määritetyllä suunnitelmalla.',
      DeprovisioningDialogTitle: 'Valmistelun poisto',
      DeprovisioningDialogDescription: 'Suorita valmistelun poisto määritetyllä suunnitelmalla.',

      DeprovisionConfirmRunTitle: 'Vahvista valmistelun poisto',
      DeprovisionConfirmRunMessage: 'Haluatko varmasti aloittaa valmistelun poiston?',
      DeprovisionConfirmLabel: 'Poista valmistelu',
      DeprovisionCancelLabel: 'Peruuta',
    },

    SiteSelectorField: {
      DefaultLabel: 'Kohdesivusto',
      CurrentSiteLabel: 'Nykyinen sivusto',
      HubSiteLabel: 'Pääkeskussivusto',
      HubNotAvailableLabel: 'Ei saatavilla',
      SearchSiteLabel: 'Hae sivustoa',

      SelectedSiteGroupAriaLabel: 'Valittu sivusto',
      SearchSitesAriaLabel: 'Hae sivustoja',
      SearchPlaceholder: 'Hae otsikon tai URL-osoitteen mukaan',

      SearchingLabel: 'Haetaan',
      EmptySearchLabel: 'Kirjoita hakeaksesi',
      NoResultsLabel: 'Tuloksia ei löytynyt',
    },

    // NavigationGuard strings
    NavigationGuard: {
      LeavePageWarning: 'Toiminto on käynnissä. Jos poistut, toiminto keskeytyy.',
    },
  };
});
