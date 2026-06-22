import type { ColumnDefinition } from "@microsoft/microsoft-graph-types";
import type { GraphFI } from "@pnp/graph";
import type { IColumn } from "@pnp/graph/columns";
import type { IContentType } from "@pnp/graph/content-types";
import type { M365Scope } from "../../../../runtime";

import "@pnp/graph/sites";
import "@pnp/graph/columns";
import "@pnp/graph/content-types";

export type FieldReference = Readonly<{
  fieldId?: string;
  fieldName?: string;
}>;

export type ContentTypeColumnSettings = Readonly<{
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  displayName?: string;
}>;

export function resolveFieldReferenceFromScope<TReference extends FieldReference>(
  scope: Pick<M365Scope, "siteColumnIdsByFieldName">,
  reference: TReference
): TReference {
  if (reference.fieldId || !reference.fieldName) return reference;

  const scopedFieldId = scope.siteColumnIdsByFieldName?.[reference.fieldName];
  return scopedFieldId ? { ...reference, fieldId: scopedFieldId } : reference;
}

export async function resolveSiteColumn(
  graphClient: GraphFI,
  graphSiteId: string,
  reference: FieldReference
): Promise<{ id: string; info: ColumnDefinition; handle: IColumn }> {
  const columns = graphClient.sites.getById(graphSiteId).columns;

  if (reference.fieldId) {
    const handle = columns.getById(reference.fieldId);
    return { id: reference.fieldId, info: { id: reference.fieldId }, handle };
  }

  if (!reference.fieldName) {
    throw new Error("Either fieldId or fieldName must be provided.");
  }

  const all = await columns();
  const matches = all.filter((column) => column.name === reference.fieldName || column.displayName === reference.fieldName);
  if (matches.length > 1) {
    throw new Error(`Ambiguous site column reference '${reference.fieldName}' matched ${matches.length} columns.`);
  }

  const match = matches[0];
  if (!match?.id) throw new Error(`Site column '${reference.fieldName}' was not found.`);
  return { id: match.id, info: match, handle: columns.getById(match.id) };
}

export async function getContentTypeColumn(
  contentType: IContentType,
  reference: FieldReference
): Promise<ColumnDefinition | undefined> {
  const columns = await contentType.columns();
  return columns.find((column) =>
    (reference.fieldId !== undefined && column.id === reference.fieldId) ||
    (reference.fieldName !== undefined && (column.name === reference.fieldName || column.displayName === reference.fieldName))
  );
}

export function buildContentTypeColumnPatch(settings: ContentTypeColumnSettings): Partial<ColumnDefinition> {
  return {
    ...(settings.required !== undefined ? { required: settings.required } : {}),
    ...(settings.hidden !== undefined ? { hidden: settings.hidden } : {}),
    ...(settings.readOnly !== undefined ? { readOnly: settings.readOnly } : {}),
    ...(settings.displayName !== undefined ? { displayName: settings.displayName } : {}),
  };
}

export async function updateContentTypeColumnSettings(
  contentType: IContentType,
  columnId: string,
  settings: ContentTypeColumnSettings
): Promise<boolean> {
  const patch = buildContentTypeColumnPatch(settings);
  if (Object.keys(patch).length === 0) return false;
  await contentType.columns.getById(columnId).update(patch);
  return true;
}
