const labels = new Proxy<Record<string, string>>({}, {
  get: (_target, property) => String(property),
});

export const ConfirmDialog = labels;
export const LogPanel = labels;
export const ComplianceLogPanel = labels;
export const ProvisioningActivityEntry = labels;
export const ComplianceActivityEntry = labels;
export const ProvisioningDialog = labels;
export const PropertyPaneProvisioningField = labels;
export const SiteSelectorField = labels;
export const NavigationGuard = labels;
