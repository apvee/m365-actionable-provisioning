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

// Site actions
export { CreateSPSiteAction } from "./sites";
export { createSPSiteSchema, type CreateSPSitePayload } from "./sites/create-sp-site";

export { ModifySPSiteAction } from "./sites";
export { modifySPSiteSchema, type ModifySPSitePayload } from "./sites/modify-sp-site";

export { DeleteSPSiteAction } from "./sites";
export { deleteSPSiteSchema, type DeleteSPSitePayload } from "./sites/delete-sp-site";

// List actions
export { CreateSPListAction } from "./lists";
export { createSPListSchema, type CreateSPListPayload, DraftVersionVisibility } from "./lists/create-sp-list";

export { ModifySPListAction } from "./lists";
export { modifySPListSchema, type ModifySPListPayload } from "./lists/modify-sp-list";

export { DeleteSPListAction } from "./lists";
export { deleteSPListSchema, type DeleteSPListPayload } from "./lists/delete-sp-list";

export { EnableSPListRatingAction } from "./lists";
export { enableSPListRatingSchema, type EnableSPListRatingPayload } from "./lists/enable-sp-list-rating";

// List view actions
export { CreateSPListViewAction, ModifySPListViewAction, DeleteSPListViewAction } from "./views";
export {
  createSPListViewSchema,
  type CreateSPListViewPayload,
  modifySPListViewSchema,
  type ModifySPListViewPayload,
  deleteSPListViewSchema,
  type DeleteSPListViewPayload,
} from "./views";

// Content type actions
export { CreateSPContentTypeAction } from "./content-types";
export { createSPContentTypeSchema, type CreateSPContentTypePayload } from "./content-types/create-sp-content-type";

export { ModifySPContentTypeAction } from "./content-types";
export { modifySPContentTypeSchema, type ModifySPContentTypePayload } from "./content-types/modify-sp-content-type";

export { DeleteSPContentTypeAction } from "./content-types";
export { deleteSPContentTypeSchema, type DeleteSPContentTypePayload } from "./content-types/delete-sp-content-type";

export { AddSPFieldToContentTypeAction } from "./content-types";
export { addSPFieldToContentTypeSchema, type AddSPFieldToContentTypePayload } from "./content-types/add-sp-field-to-content-type";

export { ModifySPContentTypeFieldAction } from "./content-types";
export { modifySPContentTypeFieldSchema, type ModifySPContentTypeFieldPayload } from "./content-types/modify-sp-content-type-field";

export { RemoveSPFieldFromContentTypeAction } from "./content-types";
export { removeSPFieldFromContentTypeSchema, type RemoveSPFieldFromContentTypePayload } from "./content-types/remove-sp-field-from-content-type";

export { AddSPContentTypeToListAction } from "./content-types";
export { addSPContentTypeToListSchema, type AddSPContentTypeToListPayload } from "./content-types/add-sp-content-type-to-list";

export { RemoveSPContentTypeFromListAction } from "./content-types";
export { removeSPContentTypeFromListSchema, type RemoveSPContentTypeFromListPayload } from "./content-types/remove-sp-content-type-from-list";

// Field actions
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
