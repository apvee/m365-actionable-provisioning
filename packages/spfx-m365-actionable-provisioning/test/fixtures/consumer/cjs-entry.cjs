const packageApi = require('@apvee/spfx-m365-actionable-provisioning');
const fluentApi = require('@fluentui/react-components');

module.exports = {
  ProvisioningDialog: packageApi.ProvisioningDialog,
  useSPFxFluentTheme: packageApi.useSPFxFluentTheme,
  FluentProvider: fluentApi.FluentProvider,
  OverlayDrawer: fluentApi.OverlayDrawer,
};
