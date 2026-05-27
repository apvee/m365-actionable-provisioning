/**
 * Microsoft 365 shared runtime types.
 *
 * @packageDocumentation
 */

export type { M365Clients } from "./clients";
export type { M365Scope } from "./scope";
export type { ProvisioningOutcome, SkipReason, ProvisioningResultLight } from "./result";
export type { M365ActionResult, M365RuntimeContext } from "./runtime";
export {
  createM365ProvisioningEngine,
  m365ActionDefinitions,
} from "./catalog";
export type { M365ProvisioningEngineArgs } from "./catalog";
export {
  DEFAULT_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  m365ActionsSchema,
  m365ProvisioningPlanSchema,
  m365RootActionSchema,
  m365RootActionSchemas,
} from "./provisioning-schema";
export type { M365ProvisioningPlan, SupportedSchemaVersion } from "./provisioning-schema";
