/**
 * SharePoint provisioning engine implementation.
 * 
 * @remarks
 * Concrete provisioning engine for SharePoint operations.
 * Extends ProvisioningEngineBase with SharePoint-specific context injection.
 * 
 * @packageDocumentation
 */

import type { SPFI } from "@pnp/sp";
import { ProvisioningEngineBase } from "../../core/engine";
import type { EngineOptions } from "../../core/engine";
import { actionRegistry, provisioningPlanSchema, type ProvisioningPlan } from "../catalogs";
import type { ProvisioningResultLight, SPScope } from "../types";
import type { Logger } from "../../core/logger";
import { extractPnPjsHttpErrorDetails } from "../utils";

/**
 * Configuration options for SharePointProvisioningEngine.
 * 
 * @public
 */
export interface SharePointProvisioningEngineOptions {
  /**
   * Root SPFI instance for SharePoint operations.
   * 
   * @remarks
   * This instance is injected into every action's runtime context.
   * Actions construct specific Web/List instances using URLs from scope/payload.
   * 
   * **Important:** This should be the root SPFI context with appropriate authentication.
   * Individual actions will create scoped instances (Web, List) as needed.
   * 
   * @example
   * ```typescript
   * import { spfi } from "@pnp/sp";
   * import { SPFx } from "@pnp/sp";
   * import "@pnp/sp/webs";
   * import "@pnp/sp/lists";
   * import "@pnp/sp/site";
   * 
   * const rootSPFI = spfi().using(SPFx(this.context));
   * 
   * const engine = new SharePointProvisioningEngine({
   *   spfi: rootSPFI,
   *   initialScope: {},
   *   planTemplate: plan,
   *   logger: logger
   * });
   * ```
   */
  spfi: SPFI;

  /**
   * Initial SharePoint scope.
   */
  initialScope: SPScope;

  /**
    * Provisioning plan (static JSON).
   */
  planTemplate: ProvisioningPlan;

  /**
   * Logger instance.
   */
  logger: Logger;

  /**
   * Optional engine configuration.
   */
  options?: EngineOptions;
}

/**
 * SharePoint provisioning engine.
 * 
 * @remarks
 * Executes provisioning plans containing SharePoint actions.
 * 
 * **Features:**
 * - Schema-first validation using Zod
 * - Type-safe action definitions
 * - Real-time execution tracing
 * - Two-phase permission checks (preflight + JIT)
 * - Hierarchical scope propagation
 * - SPFI context injection
 * 
 * **Supported Actions:**
 * - Site operations: createSPSite, modifySPSite, deleteSPSite
 * - List operations: createSPList, modifySPList, deleteSPList
 * 
 * @example
 * Basic usage:
 * ```typescript
 * import { SharePointProvisioningEngine } from "@/provisioning";
 * import { spfi } from "@pnp/sp";
 * import { SPFx } from "@pnp/sp";
 * import { createLogger, consoleSink } from "@/core/logger";
 * 
 * // Setup SPFI
 * const rootSPFI = spfi().using(SPFx(this.context));
 * 
 * // Define plan
 * const plan = [
 *   {
 *     verb: "createSPSite",
 *     url: "https://contoso.sharepoint.com/sites/project",
 *     title: "Project Alpha",
 *     subactions: [
 *       {
 *         verb: "createSPList",
 *         title: "Tasks",
 *         template: "genericList"
 *       }
 *     ]
 *   }
 * ];
 * 
 * // Create engine
 * const engine = new SharePointProvisioningEngine({
 *   spfi: rootSPFI,
 *   initialScope: {},
 *   planTemplate: plan,
 *   logger: createLogger({ level: "info", sink: consoleSink })
 * });
 * 
 * // Execute
 * const result = await engine.run();
 * 
 * // Check results
 * if (result.status === "completed") {
 *   console.log("Provisioning completed successfully");
 *   console.log("Created site:", result.out.scopeOut.siteUrl);
 * }
 * ```
 * 
 * @example
 * With observer for real-time progress:
 * ```typescript
 * const engine = new SharePointProvisioningEngine({ ... });
 * 
 * const subscription = engine.subscribe((snapshot) => {
 *   console.log(`Status: ${snapshot.status}`);
 *   console.log(`Progress: ${JSON.stringify(snapshot.out.trace.counts)}`);
 *   
 *   if (snapshot.cursor) {
 *     console.log(`Current: ${snapshot.cursor.verb} at ${snapshot.cursor.path}`);
 *   }
 * });
 * 
 * await engine.run();
 * subscription.unsubscribe();
 * ```
 * 
 * @public
 */
export class SharePointProvisioningEngine extends ProvisioningEngineBase<SPScope, ProvisioningResultLight> {
  /**
   * Zod schema for validating root-level actions.
   *
   * @internal
   */
  protected static readonly provisioningSchema = provisioningPlanSchema;

  /**
   * Action definitions (handlers + permission checkers).
   *
   * @internal
   */
  protected static readonly definitions = actionRegistry.definitions;

  /**
   * Creates a new SharePointProvisioningEngine instance.
   * 
   * @param options - Engine configuration options
   * 
   * @remarks
   * The engine is initialized but not executed.
   * Call `run()` to start provisioning.
   */
  constructor(options: SharePointProvisioningEngineOptions) {
    // Merge SPFI into the initial scope before passing to parent
    const scopeWithSpfi = {
      ...options.initialScope,
      spfi: options.spfi
    };

    super({
      initialScope: scopeWithSpfi,
      planTemplate: options.planTemplate,
      logger: options.logger,
      options: options.options
    });
  }

  protected override async validateEngineContextOrThrow(scope: SPScope): Promise<void> {
    // Minimal validation (per request): only check presence
    if (scope.spfi === null || scope.spfi === undefined) {
      throw new Error("SPFI instance not available in engine initial scope");
    }
  }

  protected override async enrichCaughtError(err: unknown): Promise<unknown | undefined> {
    const http = await extractPnPjsHttpErrorDetails(err);
    return http ? { http } : undefined;
  }
}
