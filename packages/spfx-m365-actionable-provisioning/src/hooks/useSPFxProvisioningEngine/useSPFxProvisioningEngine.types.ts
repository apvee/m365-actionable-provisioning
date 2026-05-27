import type { BaseComponentContext } from '@microsoft/sp-component-base';

import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning/m365';
import type { CompliancePolicy, ComplianceReport } from '@apvee/m365-actionable-provisioning/core';
import type { EngineOptions, EngineSnapshotTyped } from '@apvee/m365-actionable-provisioning/core';
import type { Logger } from '@apvee/m365-actionable-provisioning/core';
import type { M365Scope, ProvisioningResultLight } from '@apvee/m365-actionable-provisioning/m365';

export interface UseSPFxProvisioningEngineOptions {
  context: BaseComponentContext;
  targetSiteUrl?: string;

  planTemplate: M365ProvisioningPlan;
  logger: Logger;

  initialScope?: M365Scope;
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
