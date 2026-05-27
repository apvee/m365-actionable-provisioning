// Compatibility facade: schema ownership lives with each action module.
export {
  addSPFieldSchema,
  type AddSPFieldPayload,
} from "./actions/fields/add-sp-field";

export {
  createSPSiteColumnSchema,
  type CreateSPSiteColumnPayload,
} from "./actions/fields/create-sp-site-column";

export {
  modifySPFieldSchema,
  modifySPFieldSchema_List,
  modifySPFieldSchema_Site,
  type ModifySPFieldPayload,
} from "./actions/fields/modify-sp-field";

export {
  deleteSPFieldSchema,
  deleteSPFieldSchema_List,
  deleteSPFieldSchema_Site,
  type DeleteSPFieldPayload,
} from "./actions/fields/delete-sp-field";

export {
  DraftVersionVisibility,
  draftVersionVisibilitySchema,
  displayNameSchema as listDisplayNameSchema,
  listNameSchema,
} from "./actions/lists";

export {
  createSPListSchema,
  type CreateSPListPayload,
} from "./actions/lists/create-sp-list";

export {
  modifySPListSchema,
  type ModifySPListPayload,
} from "./actions/lists/modify-sp-list";

export {
  deleteSPListSchema,
  type DeleteSPListPayload,
} from "./actions/lists/delete-sp-list";

export {
  enableSPListRatingSchema,
  type EnableSPListRatingPayload,
} from "./actions/lists/enable-sp-list-rating";

export { listSubactionSchema } from "./actions/_composition/list-subactions-schema";

export {
  createSPSiteSchema,
  type CreateSPSitePayload,
} from "./actions/sites/create-sp-site";

export {
  modifySPSiteSchema,
  type ModifySPSitePayload,
} from "./actions/sites/modify-sp-site";

export {
  deleteSPSiteSchema,
  type DeleteSPSitePayload,
} from "./actions/sites/delete-sp-site";

export { siteSubactionSchema } from "./actions/_composition/site-subactions-schema";
