/**
 * Public barrel export.
 * Only @public exports are included.
 * @module
 */

export { escapeODataStringLiteral, getListInfoByRootFolderName, resolveWebUrlString } from "./list-lookup";
export type { ListInfo } from "./list-lookup";
export {
  checkListStructuralCompatibility,
  type ListStructuralCompatibility,
} from "./list-structural-compatibility";
export { probeManageListsPermission } from "./list-permissions";
