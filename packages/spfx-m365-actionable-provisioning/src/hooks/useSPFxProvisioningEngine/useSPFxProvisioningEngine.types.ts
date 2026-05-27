import type { BaseComponentContext } from '@microsoft/sp-component-base';

import type { ProvisioningPlan } from '@apvee/m365-actionable-provisioning/sharepoint';
import type { CompliancePolicy, ComplianceReport } from '@apvee/m365-actionable-provisioning/core';
import type { EngineOptions, EngineSnapshotTyped } from '@apvee/m365-actionable-provisioning/core';
import type { Logger } from '@apvee/m365-actionable-provisioning/core';
import type { ProvisioningResultLight, SPScope } from '@apvee/m365-actionable-provisioning/sharepoint';

export interface UseSPFxProvisioningEngineOptions {
  context: BaseComponentContext;
  targetSiteUrl?: string;

  planTemplate: ProvisioningPlan;
  logger: Logger;

  initialScope?: SPScope;
  engineOptions?: EngineOptions;

  /** Optional key to force the engine to reset (dispose + recreate). */
  resetKey?: unknown;
}

export interface UseSPFxProvisioningEngineReturn {
  snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined;

  run: () => Promise<EngineSnapshotTyped<ProvisioningResultLight>>;
  cancel: () => void;

  checkCompliance: (policy?: CompliancePolicy) => Promise<ComplianceReport>;
}
