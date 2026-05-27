/**
 * SPFx provisioning engine public API.
 *
 * @remarks
 * This module provides a unified provisioning framework for SharePoint and Microsoft Graph
 * using PnPjs v4.
 *
 * **Main Exports:**
 * - `SPFxProvisioningEngine` - SPFx entry point (currently SharePoint-only wrapper)
 * - `SharePointProvisioningEngine` - SharePoint-specific engine
 * - `actionRegistry` - SharePoint action registry
 * - Types and utilities
 *
 * @packageDocumentation
 */

/* ========================================
   ENGINES
   ======================================== */

export {
  SPFxProvisioningEngine,
  type SPFxProvisioningEngineOptions,
} from "./engines";

export {
  SharePointProvisioningEngine,
  type SharePointProvisioningEngineOptions
} from "./engines";

/* ========================================
   TYPES
   ======================================== */

export type {
  SPScope,
  SPRuntimeContext,
  ProvisioningOutcome,
  SkipReason,
  ProvisioningResultLight,
  SPActionResult,
} from "./types";

/* ========================================
   CATALOGS
   ======================================== */

export {
  actionRegistry,
  actionsSchema,
  provisioningPlanSchema,
  type ProvisioningPlan,
  DEFAULT_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  type SupportedSchemaVersion,
} from "./catalogs";

export * from "./catalogs/schemas";

/* ========================================
   ACTIONS (for advanced use cases)
   ======================================== */

// Site actions - using direct imports
export { CreateSPSiteAction } from "./catalogs/actions/sites";
export { createSPSiteSchema, type CreateSPSitePayload } from "./catalogs/schemas/sites/create-sp-site.schema";

export { ModifySPSiteAction } from "./catalogs/actions/sites";
export { modifySPSiteSchema, type ModifySPSitePayload } from "./catalogs/schemas/sites/modify-sp-site.schema";

export { DeleteSPSiteAction } from "./catalogs/actions/sites";
export { deleteSPSiteSchema, type DeleteSPSitePayload } from "./catalogs/schemas/sites/delete-sp-site.schema";

// List actions - using direct imports
export { CreateSPListAction } from "./catalogs/actions/lists";
export { createSPListSchema, type CreateSPListPayload, DraftVersionVisibility } from "./catalogs/schemas/lists/create-sp-list.schema";

export { ModifySPListAction } from "./catalogs/actions/lists";
export { modifySPListSchema, type ModifySPListPayload } from "./catalogs/schemas/lists/modify-sp-list.schema";

export { DeleteSPListAction } from "./catalogs/actions/lists";
export { deleteSPListSchema, type DeleteSPListPayload } from "./catalogs/schemas/lists/delete-sp-list.schema";

export { EnableSPListRatingAction } from "./catalogs/actions/lists";
export { enableSPListRatingSchema, type EnableSPListRatingPayload } from "./catalogs/schemas/lists/enable-sp-list-rating.schema";

// Field actions - using direct imports
export { AddSPFieldAction } from "./catalogs/actions/fields";
export { addSPFieldSchema, type AddSPFieldPayload } from "./catalogs/schemas/fields/add-sp-field.schema";

export { CreateSPSiteColumnAction } from "./catalogs/actions/fields";
export { createSPSiteColumnSchema, type CreateSPSiteColumnPayload } from "./catalogs/schemas/fields/create-sp-site-column.schema";

// Field handler (for advanced use cases)
export {
  handleFieldCreation,
  checkFieldCompliance,
  type FieldHandlerContext
} from "./catalogs/actions/fields/field-handler";

export { ModifySPFieldAction } from "./catalogs/actions/fields";
export { modifySPFieldSchema, type ModifySPFieldPayload } from "./catalogs/schemas/fields/modify-sp-field.schema";

export { DeleteSPFieldAction } from "./catalogs/actions/fields";
export { deleteSPFieldSchema, type DeleteSPFieldPayload } from "./catalogs/schemas/fields/delete-sp-field.schema";

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
