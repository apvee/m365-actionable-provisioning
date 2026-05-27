/**
 * SPFx provisioning engine wrapper.
 *
 * @remarks
 * This is currently a thin wrapper around {@link SharePointProvisioningEngine}.
 * It exists to provide a stable "SPFx" entry point for UI integration.
 *
 * In the future, this can evolve into a true orchestrator (SharePoint + Graph),
 * but for now it forwards all execution and tracing to the SharePoint engine.
 *
 * @packageDocumentation
 */

import type { SPFI } from "@pnp/sp";
import type { ProvisioningPlan } from "../catalogs";
import type { CompliancePolicy, ComplianceReport } from "../../core/compliance";
import type { Logger } from "../../core/logger";
import type { EngineOptions, EngineSnapshotTyped } from "../../core/engine";
import { SharePointProvisioningEngine } from "./sp-engine";
import type { ProvisioningResultLight, SPScope } from "../types";

/**
 * Configuration options for {@link SPFxProvisioningEngine}.
 *
 * @public
 */
export interface SPFxProvisioningEngineOptions {
  /** Root SPFI instance for SharePoint operations. */
  spfi: SPFI;

  /** Initial SharePoint scope (SPFI is injected automatically). */
  initialScope?: SPScope;

  /** Provisioning plan (static JSON). */
  planTemplate: ProvisioningPlan;

  /** Logger instance. */
  logger: Logger;

  /** Optional engine configuration. */
  options?: EngineOptions;
}

/**
 * SPFx provisioning engine.
 *
 * @remarks
 * For now, this is a **SharePoint-only** wrapper.
 *
 * @public
 */
export class SPFxProvisioningEngine {
  private readonly spEngine: SharePointProvisioningEngine;

  constructor(options: SPFxProvisioningEngineOptions) {
    this.spEngine = new SharePointProvisioningEngine({
      spfi: options.spfi,
      initialScope: options.initialScope ?? {},
      planTemplate: options.planTemplate,
      logger: options.logger,
      options: options.options,
    });
  }

  /** Subscribe to real-time engine snapshots. */
  public subscribe(
    fn: (snapshot: EngineSnapshotTyped<ProvisioningResultLight>) => void
  ): { unsubscribe: () => void } {
    return this.spEngine.subscribe(fn);
  }

  /** Cancel the current run (cooperative). */
  public cancel(): void {
    this.spEngine.cancel();
  }

  /** Run the provisioning plan and return the final snapshot. */
  public run(): Promise<EngineSnapshotTyped<ProvisioningResultLight>> {
    return this.spEngine.run();
  }

  /**
   * Check compliance (drift) for the current plan.
   *
   * @remarks
   * Side-effect free; does not change engine execution state.
   */
  public checkCompliance(policy?: CompliancePolicy): Promise<ComplianceReport> {
    return this.spEngine.checkCompliance(policy);
  }

  /** Escape hatch: access the underlying SharePoint engine instance. */
  public get sharepointEngine(): SharePointProvisioningEngine {
    return this.spEngine;
  }
}
