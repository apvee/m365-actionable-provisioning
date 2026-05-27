/**
 * Field lookup and manipulation utilities for SharePoint provisioning.
 *
 * @remarks
 * Provides functions for finding, checking, and updating SharePoint fields.
 * Extracted from catalogs/actions/fields/field-utils.ts for reuse.
 *
 * @module provisioning/shared/domains/fields/field-lookup
 * @internal
 */

import "@pnp/sp/fields";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import "@pnp/sp/webs";

import type { IWeb } from "@pnp/sp/webs";
import type { IList } from "@pnp/sp/lists";
import type { IFieldInfo } from "@pnp/sp/fields";

/**
 * Lightweight field info type with essential properties.
 */
export type FieldInfoLite = Pick<IFieldInfo, "Id" | "InternalName" | "Title">;

/**
 * Container that can hold fields (List or Web).
 */
export type FieldContainer = IList | IWeb;

/**
 * Finds a field by internal name or title.
 *
 * @remarks
 * Uses the fast path of targeting a single field via `getByInternalNameOrTitle`.
 * This avoids downloading the entire fields collection which can be large.
 *
 * @param container - The list or web containing the field
 * @param internalNameOrTitle - The field's internal name or title
 * @returns The field info if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const field = await getFieldByNameOrTitle(list, "Title");
 * if (field) {
 *   console.log(`Found field: ${field.InternalName} (ID: ${field.Id})`);
 * }
 * ```
 */
export async function getFieldByNameOrTitle(
  container: FieldContainer,
  internalNameOrTitle: string
): Promise<FieldInfoLite | undefined> {
  try {
    const field = container.fields.getByInternalNameOrTitle(internalNameOrTitle);
    const info = (await field.select("Id", "InternalName", "Title")()) as FieldInfoLite;
    if (!info?.Id) return undefined;
    return info;
  } catch {
    // Not found / forbidden / transient failure → treat as missing for idempotent callers
    return undefined;
  }
}

/**
 * Checks if a field exists in a container.
 *
 * @param container - The list or web containing the field
 * @param internalNameOrTitle - The field's internal name or title
 * @returns True if the field exists, false otherwise
 *
 * @example
 * ```typescript
 * if (await checkFieldExists(list, "CustomColumn")) {
 *   // Field already exists, skip creation
 * }
 * ```
 */
export async function checkFieldExists(
  container: FieldContainer,
  internalNameOrTitle: string
): Promise<boolean> {
  const fieldInfo = await getFieldByNameOrTitle(container, internalNameOrTitle);
  return fieldInfo !== undefined;
}

/**
 * Extracts the field ID from various result shapes.
 *
 * @remarks
 * PnPjs field creation can return different result shapes depending on the method used.
 * This helper normalizes the ID extraction.
 *
 * @param result - The result object from a field operation
 * @returns The field ID if present, undefined otherwise
 */
export function extractFieldId(
  result: { Id?: string; data?: { Id?: string } }
): string | undefined {
  if (result.Id) return result.Id;
  if (result.data?.Id) return result.data.Id;
  return undefined;
}

/**
 * Updates a field's display name (Title).
 *
 * @param container - The list or web containing the field
 * @param internalName - The field's internal name
 * @param displayName - The new display name (Title)
 *
 * @example
 * ```typescript
 * await updateFieldDisplayName(list, "CustomField", "My Custom Field");
 * ```
 */
export async function updateFieldDisplayName(
  container: FieldContainer,
  internalName: string,
  displayName: string
): Promise<void> {
  const field = container.fields.getByInternalNameOrTitle(internalName);
  await field.update({ Title: displayName });
}

/**
 * Settings for field view configuration.
 */
export interface FieldViewSettings {
  addToDefaultView?: boolean;
  showInDisplayForm?: boolean;
  showInEditForm?: boolean;
  showInNewForm?: boolean;
}

/**
 * Applies view settings to a field in a list.
 *
 * @remarks
 * Handles adding/removing from default view and form visibility settings.
 * Operations are idempotent - adding an existing field or removing a missing one won't throw.
 *
 * @param list - The list containing the field
 * @param fieldInternalName - The field's internal name
 * @param settings - The view settings to apply
 *
 * @example
 * ```typescript
 * await applyFieldViewSettings(list, "CustomColumn", {
 *   addToDefaultView: true,
 *   showInEditForm: true,
 *   showInNewForm: false,
 * });
 * ```
 */
export async function applyFieldViewSettings(
  list: IList,
  fieldInternalName: string,
  settings: FieldViewSettings
): Promise<void> {
  // Handle default view membership
  if (settings.addToDefaultView === true) {
    try {
      await list.defaultView.fields.add(fieldInternalName);
    } catch {
      // Ignore - idempotent add
    }
  } else if (settings.addToDefaultView === false) {
    try {
      const viewFields = await list.defaultView.fields();
      const exists = viewFields.Items.includes(fieldInternalName);
      if (exists) {
        await list.defaultView.fields.remove(fieldInternalName);
      }
    } catch {
      // Ignore - idempotent remove
    }
  }

  // Handle form visibility settings
  const field = list.fields.getByInternalNameOrTitle(fieldInternalName);

  if (settings.showInDisplayForm !== undefined) {
    await field.setShowInDisplayForm(settings.showInDisplayForm);
  }
  if (settings.showInEditForm !== undefined) {
    await field.setShowInEditForm(settings.showInEditForm);
  }
  if (settings.showInNewForm !== undefined) {
    await field.setShowInNewForm(settings.showInNewForm);
  }
}
