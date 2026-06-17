import { ViewScope, type IViewInfo } from "@pnp/sp/views";

export type ListViewScope = "default" | "recursive" | "recursiveAll" | "filesOnly";

export type ListViewStateInput = Readonly<{
  newTitle?: string;
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: boolean;
  tabularView?: boolean;
  scope?: ListViewScope;
  fields?: readonly string[];
}>;

export type ListViewComparableState = Pick<
  IViewInfo,
  "ViewQuery" | "RowLimit" | "Paged" | "DefaultView" | "TabularView" | "Scope"
>;

export type ListViewStateMismatch = Readonly<{
  key: string;
  expected: unknown;
  actual: unknown;
}>;

export function mapListViewScope(scope: ListViewScope): ViewScope {
  switch (scope) {
    case "default":
      return ViewScope.DefaultValue;
    case "recursive":
      return ViewScope.Recursive;
    case "recursiveAll":
      return ViewScope.RecursiveAll;
    case "filesOnly":
      return ViewScope.FilesOnly;
  }
}

export function normalizeViewQuery(value: string): string {
  return value.trim();
}

export function buildListViewUpdateProps(input: ListViewStateInput): Partial<IViewInfo> {
  const props: Partial<IViewInfo> = {};
  if (input.newTitle !== undefined) props.Title = input.newTitle;
  if (input.viewQuery !== undefined) props.ViewQuery = normalizeViewQuery(input.viewQuery);
  if (input.rowLimit !== undefined) props.RowLimit = input.rowLimit;
  if (input.paged !== undefined) props.Paged = input.paged;
  if (input.defaultView === true) props.DefaultView = true;
  if (input.tabularView !== undefined) props.TabularView = input.tabularView;
  if (input.scope !== undefined) props.Scope = mapListViewScope(input.scope);
  return props;
}

export function areViewFieldsEqual(expected: readonly string[], actual: readonly string[]): boolean {
  return expected.length === actual.length && expected.every((fieldName, index) => actual[index] === fieldName);
}

export function compareListViewState(
  expected: ListViewStateInput,
  actual: ListViewComparableState,
  actualFields?: readonly string[]
): ListViewStateMismatch[] {
  const mismatches: ListViewStateMismatch[] = [];

  if (expected.viewQuery !== undefined && normalizeViewQuery(actual.ViewQuery) !== normalizeViewQuery(expected.viewQuery)) {
    mismatches.push({ key: "ViewQuery", expected: normalizeViewQuery(expected.viewQuery), actual: actual.ViewQuery });
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
  if (expected.tabularView !== undefined && actual.TabularView !== expected.tabularView) {
    mismatches.push({ key: "TabularView", expected: expected.tabularView, actual: actual.TabularView });
  }
  if (expected.scope !== undefined && actual.Scope !== mapListViewScope(expected.scope)) {
    mismatches.push({ key: "Scope", expected: mapListViewScope(expected.scope), actual: actual.Scope });
  }

  if (expected.fields !== undefined) {
    const fields = actualFields ?? [];
    if (!areViewFieldsEqual(expected.fields, fields)) {
      mismatches.push({ key: "fields", expected: expected.fields, actual: fields });
    }
  }

  return mismatches;
}
