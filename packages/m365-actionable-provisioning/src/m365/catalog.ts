/**
 * Unified Microsoft 365 provisioning catalog.
 *
 * @packageDocumentation
 */

import { ProvisioningEngine, type ProvisioningEngineArgs } from "../core";
import { sharePointActionDefinitions } from "../sharepoint/catalogs";
import type { M365Clients } from "./clients";
import { m365ProvisioningPlanSchema } from "./provisioning-schema";
import type { ProvisioningResultLight } from "./result";
import type { M365Scope } from "./scope";

/**
 * Unified M365 action definitions.
 *
 * @remarks
 * The catalog currently contains SharePoint actions. Graph support is wired
 * through the same engine/client infrastructure and covered by smoke tests until
 * public Graph actions are introduced.
 *
 * @public
 */
export const m365ActionDefinitions = [
  ...sharePointActionDefinitions,
] as const;

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
