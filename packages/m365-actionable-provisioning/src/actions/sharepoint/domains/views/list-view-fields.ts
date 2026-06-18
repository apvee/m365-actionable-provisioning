import type { IList } from "@pnp/sp/lists";
import type { IView } from "@pnp/sp/views";

import { getFieldByNameOrTitle } from "../fields/field-lookup";

import "@pnp/sp/views";

type ViewFieldsInfo = Readonly<{
  Items?: unknown;
}>;

export type ListViewFieldResolutionIssue = "duplicate_references" | "missing_fields" | "duplicate_internal_names";

export class ListViewFieldResolutionError extends Error {
  override readonly name = "ListViewFieldResolutionError";
  readonly issue: ListViewFieldResolutionIssue;
  readonly fieldRefs: readonly string[];

  constructor(issue: ListViewFieldResolutionIssue, fieldRefs: readonly string[], message: string) {
    super(message);
    this.issue = issue;
    this.fieldRefs = fieldRefs;
  }
}

export function isListViewFieldResolutionError(error: unknown): error is ListViewFieldResolutionError {
  return error instanceof ListViewFieldResolutionError;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getResultsArray(value: unknown): unknown {
  return value !== null && typeof value === "object" && "results" in value
    ? value.results
    : undefined;
}

export async function getViewFieldNames(view: IView): Promise<string[]> {
  const fieldsInfo = await view.fields<ViewFieldsInfo>();
  if (Array.isArray(fieldsInfo.Items)) return toStringArray(fieldsInfo.Items);
  return toStringArray(getResultsArray(fieldsInfo.Items));
}

export function areViewFieldsEqual(expected: readonly string[], actual: readonly string[]): boolean {
  return expected.length === actual.length && expected.every((fieldName, index) => actual[index] === fieldName);
}

function getDuplicateValues(
  values: readonly string[],
  normalizeValue: (value: string) => string = (value) => value
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    const normalized = normalizeValue(value);
    if (seen.has(normalized)) duplicates.add(normalized);
    seen.add(normalized);
  }
  return [...duplicates];
}

export async function resolveViewFieldInternalNames(list: IList, fields: readonly string[]): Promise<string[]> {
  const duplicates = getDuplicateValues(fields, (field) => field.trim());
  if (duplicates.length > 0) {
    throw new ListViewFieldResolutionError(
      "duplicate_references",
      duplicates,
      `SharePoint list view fields contain duplicate references: ${duplicates.join(", ")}`
    );
  }

  const resolved: string[] = [];
  const missing: string[] = [];
  for (const rawField of fields) {
    const fieldRef = rawField.trim();
    const field = await getFieldByNameOrTitle(list, fieldRef);
    if (!field?.InternalName) {
      missing.push(fieldRef);
    } else {
      resolved.push(field.InternalName);
    }
  }

  if (missing.length > 0) {
    throw new ListViewFieldResolutionError(
      "missing_fields",
      missing,
      `SharePoint list view fields do not exist on the target list: ${missing.join(", ")}`
    );
  }

  const duplicateInternalNames = getDuplicateValues(resolved);
  if (duplicateInternalNames.length > 0) {
    throw new ListViewFieldResolutionError(
      "duplicate_internal_names",
      duplicateInternalNames,
      `SharePoint list view fields resolve to duplicate internal names: ${duplicateInternalNames.join(", ")}`
    );
  }

  return resolved;
}

export async function replaceViewFieldsWithInternalNames(
  view: IView,
  requestedInternalNames: readonly string[]
): Promise<boolean> {
  const currentFields = await getViewFieldNames(view);
  if (areViewFieldsEqual(requestedInternalNames, currentFields)) return false;

  await view.fields.removeAll();
  for (const internalName of requestedInternalNames) {
    await view.fields.add(internalName);
  }
  return true;
}

export async function replaceViewFields(list: IList, view: IView, fields: readonly string[]): Promise<boolean> {
  const requestedInternalNames = await resolveViewFieldInternalNames(list, fields);
  return replaceViewFieldsWithInternalNames(view, requestedInternalNames);
}
