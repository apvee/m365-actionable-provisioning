/**
 * Unified Microsoft 365 provisioning catalog.
 *
 * @packageDocumentation
 */

import { ProvisioningEngine, type ProvisioningEngineArgs } from "../core";
import { m365ActionDefinitions } from "./action-definitions";
import { m365ProvisioningPlanSchema } from "./provisioning-schema";
import type { M365Clients, M365Scope, ProvisioningResultLight } from "../runtime";

/**
 * Arguments for creating a default M365 provisioning engine.
 *
 * @public
 */
export type M365ProvisioningEngineArgs = Omit<
  ProvisioningEngineArgs<M365Scope, ProvisioningResultLight, M365Clients>,
  "definitions" | "provisioningSchema"
> & Partial<Pick<
  ProvisioningEngineArgs<M365Scope, ProvisioningResultLight, M365Clients>,
  "definitions" | "provisioningSchema"
>>;

/**
 * Creates a ProvisioningEngine using the built-in M365 catalog.
 *
 * @public
 */
export function createM365ProvisioningEngine(
  args: M365ProvisioningEngineArgs
): ProvisioningEngine<M365Scope, ProvisioningResultLight, M365Clients> {
  return new ProvisioningEngine<M365Scope, ProvisioningResultLight, M365Clients>({
    ...args,
    definitions: args.definitions ?? m365ActionDefinitions,
    provisioningSchema: args.provisioningSchema ?? m365ProvisioningPlanSchema,
  });
}
