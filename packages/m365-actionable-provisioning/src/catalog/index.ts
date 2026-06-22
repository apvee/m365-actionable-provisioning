/**
 * Microsoft 365 provisioning catalog exports.
 *
 * @packageDocumentation
 */

export { m365ActionDefinitions } from "./action-definitions";
export { createM365ProvisioningEngine } from "./create-engine";
export type { M365ProvisioningEngineArgs } from "./create-engine";
export {
  DEFAULT_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  m365ActionsSchema,
  m365ProvisioningPlanSchema,
  m365RootActionSchema,
  m365RootActionSchemas,
} from "./provisioning-schema";
export type { M365ProvisioningPlan, SupportedSchemaVersion } from "./provisioning-schema";
