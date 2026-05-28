/**
 * SharePoint provisioning action API.
 *
 * @remarks
 * This module exposes SharePoint action definitions, schemas, utilities and
 * action implementations. Use the package root for engine/catalog construction.
 *
 * **Main Exports:**
 * - `sharePointActionDefinitions` - SharePoint action definitions
 * - `sharePointActionsSchema` - SharePoint root action schema
 * - Types and utilities
 *
 * @packageDocumentation
 */

/* ========================================
   CATALOGS
   ======================================== */

export {
  sharePointActionDefinitions,
  type SharePointActionDefinition,
} from "./action-definitions";
export {
  sharePointActionsSchema,
  sharePointRootActionSchema,
  sharePointRootActionSchemas,
} from "./provisioning-schema";

export * from "./schemas";
export { extractPnPjsHttpErrorDetails } from "./utils";

/* ========================================
   ACTIONS (for advanced use cases)
   ======================================== */

// Site actions - using direct imports
export { CreateSPSiteAction } from "./sites";
export { createSPSiteSchema, type CreateSPSitePayload } from "./sites/create-sp-site";

export { ModifySPSiteAction } from "./sites";
export { modifySPSiteSchema, type ModifySPSitePayload } from "./sites/modify-sp-site";

export { DeleteSPSiteAction } from "./sites";
export { deleteSPSiteSchema, type DeleteSPSitePayload } from "./sites/delete-sp-site";

// List actions - using direct imports
export { CreateSPListAction } from "./lists";
export { createSPListSchema, type CreateSPListPayload, DraftVersionVisibility } from "./lists/create-sp-list";

export { ModifySPListAction } from "./lists";
export { modifySPListSchema, type ModifySPListPayload } from "./lists/modify-sp-list";

export { DeleteSPListAction } from "./lists";
export { deleteSPListSchema, type DeleteSPListPayload } from "./lists/delete-sp-list";

export { EnableSPListRatingAction } from "./lists";
export { enableSPListRatingSchema, type EnableSPListRatingPayload } from "./lists/enable-sp-list-rating";

// Field actions - using direct imports
export { AddSPFieldAction } from "./fields";
export { addSPFieldSchema, type AddSPFieldPayload } from "./fields/add-sp-field";

export { CreateSPSiteColumnAction } from "./fields";
export { createSPSiteColumnSchema, type CreateSPSiteColumnPayload } from "./fields/create-sp-site-column";

// Field handler (for advanced use cases)
export {
  handleFieldCreation,
  checkFieldCompliance,
  type FieldHandlerContext
} from "./fields/_shared/field-handler";

export { ModifySPFieldAction } from "./fields";
export { modifySPFieldSchema, type ModifySPFieldPayload } from "./fields/modify-sp-field";

export { DeleteSPFieldAction } from "./fields";
export { deleteSPFieldSchema, type DeleteSPFieldPayload } from "./fields/delete-sp-field";
