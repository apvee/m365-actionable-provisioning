import type { IList } from "@pnp/sp/lists";
import type { IView } from "@pnp/sp/views";

import { getFieldByNameOrTitle } from "../fields/field-lookup";
import { areViewFieldsEqual } from "./list-view-props";

type ViewFieldsInfo = Readonly<{
  Items?: string[];
}>;

export async function getViewFieldNames(view: IView): Promise<string[]> {
  const fieldsInfo = await view.fields<ViewFieldsInfo>();
  return Array.isArray(fieldsInfo.Items) ? [...fieldsInfo.Items] : [];
}

function getDuplicateFieldNames(fields: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const fieldName of fields) {
    if (seen.has(fieldName)) duplicates.add(fieldName);
    seen.add(fieldName);
  }
  return [...duplicates];
}

export async function validateViewFields(list: IList, fields: readonly string[]): Promise<void> {
  const duplicates = getDuplicateFieldNames(fields);
  if (duplicates.length > 0) {
    throw new Error(`SharePoint list view fields contain duplicates: ${duplicates.join(", ")}`);
  }

  const missing: string[] = [];
  for (const fieldName of fields) {
    const field = await getFieldByNameOrTitle(list, fieldName);
    if (!field) missing.push(fieldName);
  }

  if (missing.length > 0) {
    throw new Error(`SharePoint list view fields do not exist on the target list: ${missing.join(", ")}`);
  }
}

export async function replaceViewFields(list: IList, view: IView, fields: readonly string[]): Promise<void> {
  const currentFields = await getViewFieldNames(view);
  if (areViewFieldsEqual(fields, currentFields)) return;

  await validateViewFields(list, fields);
  await view.fields.removeAll();
  for (const fieldName of fields) {
    await view.fields.add(fieldName);
  }
}
