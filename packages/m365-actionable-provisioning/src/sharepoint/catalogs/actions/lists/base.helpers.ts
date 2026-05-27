/**
 * List base helpers - re-exports from shared utilities.
 *
 * @remarks
 * This file provides backward compatibility by re-exporting shared helpers.
 * New code should import directly from `../../../shared/domains/lists`.
 *
 * @packageDocumentation
 * @module provisioning/catalogs/actions/lists/base.helpers
 */

// Re-export from shared domain helpers for backward compatibility
export {
  escapeODataStringLiteral,
  getListInfoByRootFolderName,
  resolveWebUrlString,
  type ListInfo,
} from "../../../shared/domains/lists/list-lookup";

export { probeManageListsPermission } from "../../../shared/domains/lists/list-permissions";
