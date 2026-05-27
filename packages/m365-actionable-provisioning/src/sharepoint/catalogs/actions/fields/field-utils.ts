/**
 * SharePoint Field utilities for the provisioning catalog.
 *
 * @remarks
 * This file provides backward compatibility by re-exporting shared helpers.
 * New code should import directly from `../../../shared/domains/fields`.
 *
 * @packageDocumentation
 * @module provisioning/catalogs/actions/fields/field-utils
 */

// Re-export from shared domain helpers for backward compatibility
export {
  getFieldByNameOrTitle,
  checkFieldExists,
  extractFieldId,
  updateFieldDisplayName,
  applyFieldViewSettings,
  type FieldInfoLite,
  type FieldContainer,
  type FieldViewSettings,
} from "../../../shared/domains/fields/field-lookup";
