import { z } from "zod";

import {
  addSPContentTypeToListActionModule,
  removeSPContentTypeFromListActionModule,
} from "../content-types";
import { addSPFieldActionModule } from "../fields/add-sp-field";
import { deleteSPFieldActionModule } from "../fields/delete-sp-field";
import { modifySPFieldActionModule } from "../fields/modify-sp-field";
import { enableSPListRatingActionModule } from "../lists/enable-sp-list-rating";
import {
  breakSPListRoleInheritanceActionModule,
  grantSPListRoleAssignmentActionModule,
  removeSPListRoleAssignmentActionModule,
  resetSPListRoleInheritanceActionModule,
} from "../permissions";
import {
  createSPListViewActionModule,
  modifySPListViewActionModule,
  deleteSPListViewActionModule,
} from "../views";

const listSubactionSchemas = [
  addSPFieldActionModule.schema,
  modifySPFieldActionModule.schemasByPlacement.listSubaction,
  deleteSPFieldActionModule.schemasByPlacement.listSubaction,
  enableSPListRatingActionModule.schema,
  createSPListViewActionModule.schema,
  modifySPListViewActionModule.schema,
  deleteSPListViewActionModule.schema,
  breakSPListRoleInheritanceActionModule.schema,
  resetSPListRoleInheritanceActionModule.schema,
  grantSPListRoleAssignmentActionModule.schema,
  removeSPListRoleAssignmentActionModule.schema,
  addSPContentTypeToListActionModule.schema,
  removeSPContentTypeFromListActionModule.schema,
] as const;

export const listSubactionSchema = z.discriminatedUnion("verb", listSubactionSchemas);
