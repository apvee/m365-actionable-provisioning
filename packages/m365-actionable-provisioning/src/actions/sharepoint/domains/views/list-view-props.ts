import type { IList } from "@pnp/sp/lists";
import type { IView, IViewInfo } from "@pnp/sp/views";

import {
  areViewFieldsEqual,
  getViewFieldNames,
  isListViewFieldResolutionError,
  resolveViewFieldInternalNames,
  type ListViewFieldResolutionError,
} from "./list-view-fields";
import type { ListViewInfo } from "./list-view-lookup";

export type ListViewStateInput = Readonly<{
  fields?: readonly string[];
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: true;
}>;

export type ListViewStateMismatch = Readonly<{
  key: string;
  expected: unknown;
  actual: unknown;
  reason?: string;
}>;

function normalizeViewQuery(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function buildListViewUpdateProps(input: ListViewStateInput): Partial<IViewInfo> {
  const props: Partial<IViewInfo> = {};
  if (input.viewQuery !== undefined) props.ViewQuery = normalizeViewQuery(input.viewQuery);
  if (input.rowLimit !== undefined) props.RowLimit = input.rowLimit;
  if (input.paged !== undefined) props.Paged = input.paged;
  if (input.defaultView === true) props.DefaultView = true;
  return props;
}

export function hasScalarChanges(expected: ListViewStateInput, actual: ListViewInfo): boolean {
  if (expected.viewQuery !== undefined && normalizeViewQuery(actual.ViewQuery) !== normalizeViewQuery(expected.viewQuery)) return true;
  if (expected.rowLimit !== undefined && actual.RowLimit !== expected.rowLimit) return true;
  if (expected.paged !== undefined && actual.Paged !== expected.paged) return true;
  if (expected.defaultView === true && actual.DefaultView !== true) return true;
  return false;
}

function compareListViewState(
  expected: ListViewStateInput,
  actual: ListViewInfo,
  expectedInternalFields?: readonly string[],
  actualFields?: readonly string[]
): ListViewStateMismatch[] {
  const mismatches: ListViewStateMismatch[] = [];

  if (expected.viewQuery !== undefined) {
    const expectedViewQuery = normalizeViewQuery(expected.viewQuery);
    const actualViewQuery = normalizeViewQuery(actual.ViewQuery);
    if (actualViewQuery !== expectedViewQuery) {
      mismatches.push({ key: "ViewQuery", expected: expectedViewQuery, actual: actual.ViewQuery ?? null });
    }
  }
  if (expected.rowLimit !== undefined && actual.RowLimit !== expected.rowLimit) {
    mismatches.push({ key: "RowLimit", expected: expected.rowLimit, actual: actual.RowLimit });
  }
  if (expected.paged !== undefined && actual.Paged !== expected.paged) {
    mismatches.push({ key: "Paged", expected: expected.paged, actual: actual.Paged });
  }
  if (expected.defaultView !== undefined && actual.DefaultView !== expected.defaultView) {
    mismatches.push({ key: "DefaultView", expected: expected.defaultView, actual: actual.DefaultView });
  }
  if (expected.fields !== undefined) {
    const expectedFields = expectedInternalFields ?? [];
    const fields = actualFields ?? [];
    if (!areViewFieldsEqual(expectedFields, fields)) {
      mismatches.push({ key: "fields", expected: expectedFields, actual: fields });
    }
  }

  return mismatches;
}

export async function getListViewStateMismatches(
  list: IList,
  view: IView | undefined,
  expected: ListViewStateInput,
  actual: ListViewInfo
): Promise<ListViewStateMismatch[]> {
  const expectedFields = expected.fields !== undefined ? await resolveViewFieldInternalNames(list, expected.fields) : undefined;
  let actualFields: string[] | undefined;
  if (expected.fields !== undefined) {
    if (!view) throw new Error("SharePoint list view handle is required when comparing view fields");
    actualFields = await getViewFieldNames(view);
  }
  return compareListViewState(expected, actual, expectedFields, actualFields);
}

function getListViewFieldResolutionMismatches(
  error: ListViewFieldResolutionError
): ListViewStateMismatch[] {
  return [{
    key: "fields",
    expected: error.fieldRefs,
    actual: null,
    reason: error.issue,
  }];
}

export function getListViewFieldResolutionDriftDetails(error: unknown): { mismatches: ListViewStateMismatch[] } | undefined {
  return isListViewFieldResolutionError(error)
    ? { mismatches: getListViewFieldResolutionMismatches(error) }
    : undefined;
}
