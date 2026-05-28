/**
 * SharePoint provisioning action API.
 *
 * @remarks
 * This module exposes SharePoint action definitions, schemas, utilities and
 * action implementations. Use the M365 module for engine/catalog construction.
 *
 * **Main Exports:**
 * - `sharePointActionDefinitions` - SharePoint action definitions
 * - `sharePointActionsSchema` - SharePoint root action schema
 * - Types and utilities
 *
 * @packageDocumentation
 */

/* ========================================
   TYPES
   ======================================== */

export type {
  M365ActionResult,
  M365Clients,
  M365RuntimeContext,
  M365Scope,
  ProvisioningOutcome,
  ProvisioningResultLight,
  SkipReason,
} from "../m365";

/* ========================================
   CATALOGS
   ======================================== */

export {
  sharePointActionDefinitions,
  sharePointActionsSchema,
  sharePointRootActionSchema,
  sharePointRootActionSchemas,
  type SharePointActionDefinition,
} from "./catalogs";

export * from "./catalogs/schemas";
export { extractPnPjsHttpErrorDetails } from "./utils";

/* ========================================
   ACTIONS (for advanced use cases)
   ======================================== */

// Site actions - using direct imports
export { CreateSPSiteAction } from "./catalogs/actions/sites";
export { createSPSiteSchema, type CreateSPSitePayload } from "./catalogs/actions/sites/create-sp-site";

export { ModifySPSiteAction } from "./catalogs/actions/sites";
export { modifySPSiteSchema, type ModifySPSitePayload } from "./catalogs/actions/sites/modify-sp-site";

export { DeleteSPSiteAction } from "./catalogs/actions/sites";
export { deleteSPSiteSchema, type DeleteSPSitePayload } from "./catalogs/actions/sites/delete-sp-site";

// List actions - using direct imports
export { CreateSPListAction } from "./catalogs/actions/lists";
export { createSPListSchema, type CreateSPListPayload, DraftVersionVisibility } from "./catalogs/actions/lists/create-sp-list";

export { ModifySPListAction } from "./catalogs/actions/lists";
export { modifySPListSchema, type ModifySPListPayload } from "./catalogs/actions/lists/modify-sp-list";

export { DeleteSPListAction } from "./catalogs/actions/lists";
export { deleteSPListSchema, type DeleteSPListPayload } from "./catalogs/actions/lists/delete-sp-list";

export { EnableSPListRatingAction } from "./catalogs/actions/lists";
export { enableSPListRatingSchema, type EnableSPListRatingPayload } from "./catalogs/actions/lists/enable-sp-list-rating";

// Field actions - using direct imports
export { AddSPFieldAction } from "./catalogs/actions/fields";
export { addSPFieldSchema, type AddSPFieldPayload } from "./catalogs/actions/fields/add-sp-field";

export { CreateSPSiteColumnAction } from "./catalogs/actions/fields";
export { createSPSiteColumnSchema, type CreateSPSiteColumnPayload } from "./catalogs/actions/fields/create-sp-site-column";

// Field handler (for advanced use cases)
export {
  handleFieldCreation,
  checkFieldCompliance,
  type FieldHandlerContext
} from "./catalogs/actions/fields/_shared/field-handler";

export { ModifySPFieldAction } from "./catalogs/actions/fields";
export { modifySPFieldSchema, type ModifySPFieldPayload } from "./catalogs/actions/fields/modify-sp-field";

export { DeleteSPFieldAction } from "./catalogs/actions/fields";
export { deleteSPFieldSchema, type DeleteSPFieldPayload } from "./catalogs/actions/fields/delete-sp-field";

/* ========================================
   CORE RE-EXPORTS (for convenience)
   ======================================== */

export type {
  ActionNode
} from "../core/action";

export type {
  BaseProvisioningPlan,
  ProvisioningPlanParameter
} from "../core/provisioning-plan";

export type {
  EngineSnapshot,
  EngineStatus
} from "../core/engine";

export type {
  CompliancePolicy,
  ComplianceReport,
  ComplianceOutcome,
  ComplianceOverall
} from "../core/compliance";

export type {
  Logger,
  LogLevel,
  LogEvent,
  LogSink
} from "../core/logger";
