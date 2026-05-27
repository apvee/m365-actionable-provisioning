import type { BaseComponentContext } from '@microsoft/sp-component-base';

import type { ProvisioningPlan } from "../../../provisioning/catalogs";
import type { CompliancePolicy, ComplianceReport } from '../../../core/compliance';
import type { EngineOptions, EngineSnapshotTyped } from '../../../core/engine';
import type { Logger } from '../../../core/logger';
import type { ProvisioningResultLight, SPScope } from '../../../provisioning';

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
