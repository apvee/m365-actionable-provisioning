import {
  addSPContentTypeToListActionModule,
  addSPFieldToContentTypeActionModule,
  createSPContentTypeActionModule,
  deleteSPContentTypeActionModule,
  modifySPContentTypeActionModule,
  modifySPContentTypeFieldActionModule,
  removeSPContentTypeFromListActionModule,
  removeSPFieldFromContentTypeActionModule,
} from "./content-types";
import { addSPFieldActionModule } from "./fields/add-sp-field";
import { createSPSiteColumnActionModule } from "./fields/create-sp-site-column";
import { deleteSPFieldActionModule } from "./fields/delete-sp-field";
import { modifySPFieldActionModule } from "./fields/modify-sp-field";
import { createSPListActionModule } from "./lists/create-sp-list";
import { deleteSPListActionModule } from "./lists/delete-sp-list";
import { enableSPListRatingActionModule } from "./lists/enable-sp-list-rating";
import { modifySPListActionModule } from "./lists/modify-sp-list";
import { createSPSiteActionModule } from "./sites/create-sp-site";
import { deleteSPSiteActionModule } from "./sites/delete-sp-site";
import { modifySPSiteActionModule } from "./sites/modify-sp-site";
import {
  createSPListViewActionModule,
  deleteSPListViewActionModule,
  modifySPListViewActionModule,
} from "./views";

export const sharePointActionModules = [
  createSPSiteActionModule,
  modifySPSiteActionModule,
  deleteSPSiteActionModule,
  createSPListActionModule,
  modifySPListActionModule,
  deleteSPListActionModule,
  enableSPListRatingActionModule,
  createSPListViewActionModule,
  modifySPListViewActionModule,
  deleteSPListViewActionModule,
  createSPContentTypeActionModule,
  modifySPContentTypeActionModule,
  deleteSPContentTypeActionModule,
  addSPContentTypeToListActionModule,
  removeSPContentTypeFromListActionModule,
  addSPFieldToContentTypeActionModule,
  modifySPContentTypeFieldActionModule,
  removeSPFieldFromContentTypeActionModule,
  addSPFieldActionModule,
  createSPSiteColumnActionModule,
  modifySPFieldActionModule,
  deleteSPFieldActionModule,
] as const;
