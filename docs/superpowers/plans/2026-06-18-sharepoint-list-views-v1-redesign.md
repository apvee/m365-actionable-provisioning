# SharePoint List Views V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use Markdown checkbox syntax for tracking.

**Goal:** Reintroduce list-scoped SharePoint list/library view provisioning with `createSPListView`, `modifySPListView`, and `deleteSPListView`.

**Architecture:** Add a focused `views` action domain that is available only as a list subaction. Keep action classes thin and put lookup, field normalization, field replacement, PnPjs prop mapping, and compliance comparison in `domains/views`.

**Tech Stack:** TypeScript, Zod, PnPjs v4 `@pnp/sp/views`, npm workspaces, `tsx` smoke validation, `tsc`.

**Current status:** Local implementation, docs, demo plan, package build, engine smoke, SPFx build, whitespace checks, and tenant provisioning/deprovisioning smoke have been completed. Tenant smoke was confirmed manually by running deprovisioning and provisioning against SharePoint.

---

## Execution Rules

- Do not commit. The user explicitly forbids commits after the spec commit.
- Preserve existing uncommitted changes, including the spec refinement in `docs/superpowers/specs/2026-06-18-sharepoint-list-views-v1-redesign.md`.
- Implement from `docs/superpowers/specs/2026-06-18-sharepoint-list-views-v1-redesign.md`.
- Do not restore deleted files blindly from old commits. The old implementation was removed because it had unresolved runtime issues.
- Keep V1 list-scoped only. Do not add root-level or site-subaction view schemas.
- Keep `createSPListView` create-only. It must skip existing views and must not upsert mutable state.
- Use npm workspace commands, not pnpm.

## Verification Findings Before Implementation

- Context7 could not be used because the monthly quota is exceeded.
- Local installed PnPjs types confirm:
  - `list.views.add(Title, PersonalView?, additionalSettings?)`
  - `list.views.getByTitle(title)` exists, but runtime verification showed it path-encodes titles with spaces in a way that can fail against SharePoint views.
  - Lookup should use `list.views.filter("Title eq '...' and PersonalView eq false").top(1).select(...)`, with OData string escaping, then operate on the public view through `list.views.getById(id)`.
  - `view.update(props)` accepts `Partial<IViewInfo>`.
  - `view.delete()` exists through `IDeleteable`.
  - `view.fields.add(fieldTitleOrInternalName)` accepts internal name or display name and is case-sensitive.
  - `view.fields.removeAll()` exists.
- The implementation should still resolve field references to `InternalName` before calling `view.fields.add(...)` so display titles with spaces, SharePoint encoded names, and display-title renames do not destabilize view field ordering.

## File Structure

Create these files:

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-fields.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-lookup.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-props.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/_shared/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/_shared/scope.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/schema.ts
```

Modify these files:

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md
packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
apps/test-spfx/src/webparts/testProvisioning/test-plans/demo-plans.ts
```

## Task 1: Baseline And PnPjs Contract Check

**Files:**
- Read: `node_modules/@pnp/sp/views/types.d.ts`
- Read: `node_modules/@pnp/sp/views/types.js`
- Read: `packages/m365-actionable-provisioning/src/actions/sharepoint/ADDING_ACTIONS.md`

- [x] **Step 1: Confirm worktree state**

Run:

```bash
git status --short
```

Expected: the spec and plan files may be modified/untracked. No unrelated files should be touched.

- [x] **Step 2: Confirm PnPjs view methods locally**

Run:

```bash
sed -n '1,120p' node_modules/@pnp/sp/views/types.d.ts
sed -n '1,120p' node_modules/@pnp/sp/views/types.js
```

Expected:

- `IViews.add(Title: string, PersonalView?: boolean, additionalSettings?: Record<string, any>)`
- `IViews.getByTitle(title: string)` exists, but do not use it for V1 runtime lookup because titles with spaces can produce an encoded request that SharePoint rejects.
- `IView.update(props: Partial<IViewInfo>)`
- `IView.delete`
- `IViewFields.add(fieldTitleOrInternalName: string)`
- `IViewFields.removeAll()`

- [x] **Step 3: Run baseline package validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`. If baseline fails before any implementation, stop and report the failure before modifying runtime code.

## Task 2: Shared Schemas

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/_shared/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/schema.ts`

- [x] **Step 1: Create shared view schema primitives**

Create `views/_shared/schema.ts`:

```ts
import { z } from "zod";

export const listViewTitleSchema = z
  .string()
  .trim()
  .min(1, "List view title cannot be empty")
  .max(255, "List view title cannot exceed 255 characters");

export const listViewFieldNameSchema = z
  .string()
  .trim()
  .min(1, "List view field reference cannot be empty")
  .max(255, "List view field reference cannot exceed 255 characters");

export const listViewFieldsSchema = z
  .array(listViewFieldNameSchema)
  .min(1, "List view fields cannot be empty")
  .refine((fields) => new Set(fields).size === fields.length, "List view fields cannot contain duplicate references")
  .optional();

function stripLeadingXmlPreamble(value: string): string {
  let remaining = value.trimStart();
  let previous = "";
  while (remaining !== previous) {
    previous = remaining;
    remaining = remaining
      .replace(/^<\?xml[\s\S]*?\?>/i, "")
      .replace(/^<!--[\s\S]*?-->/, "")
      .trimStart();
  }
  return remaining;
}

function startsWithCamlWrapper(value: string): boolean {
  const normalized = stripLeadingXmlPreamble(value).toLowerCase();
  return normalized.startsWith("<view") || normalized.startsWith("<query");
}

export const listViewQuerySchema = z
  .string()
  .trim()
  .min(1, "List view query cannot be empty")
  .refine((value) => !startsWithCamlWrapper(value), "List view query must be a CAML fragment without <View> or <Query> wrappers");

export const listViewMutableStateSchema = {
  fields: listViewFieldsSchema,
  viewQuery: listViewQuerySchema.optional(),
  rowLimit: z.number().int().min(1).max(50000).optional(),
  paged: z.boolean().optional(),
  defaultView: z.literal(true).optional(),
} as const;
```

- [x] **Step 1a: Create shared view scope helpers**

Create `views/_shared/scope.ts`:

```ts
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365Clients, M365Scope } from "../../../../runtime";
import { probeManageListsPermission } from "../../domains/lists";

type ListViewPermissionContext = Readonly<{
  clients: M365Clients;
  scopeIn: M365Scope;
}>;

export function buildListViewScopeDelta(scope: M365Scope): Partial<M365Scope> {
  const delta: Partial<M365Scope> = {};
  if (scope.list !== undefined) delta.list = scope.list;
  if (scope.web !== undefined) delta.web = scope.web;
  if (scope.webUrl !== undefined) delta.webUrl = scope.webUrl;
  if (scope.listName !== undefined) delta.listName = scope.listName;
  return delta;
}

export async function checkListViewManageListsPermission(ctx: ListViewPermissionContext): Promise<PermissionCheckResult> {
  if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
  if (!ctx.scopeIn.web) {
    return { decision: "unknown", message: "SharePoint web scope not available for list view permission probe" };
  }
  return probeManageListsPermission(ctx.scopeIn.web, ctx.scopeIn.webUrl ?? "(scope)");
}
```

- [x] **Step 2: Create `createSPListView` schema**

Create `views/create-sp-list-view/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const createSPListViewSchema = z.object({
  verb: z.literal("createSPListView"),
  title: listViewTitleSchema,
  ...listViewMutableStateSchema,
  subactions: leafSubactionsSchema,
});

export type CreateSPListViewPayload = z.infer<typeof createSPListViewSchema>;
```

- [x] **Step 3: Create `modifySPListView` schema**

Create `views/modify-sp-list-view/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const modifySPListViewSchema = z.object({
  verb: z.literal("modifySPListView"),
  title: listViewTitleSchema,
  ...listViewMutableStateSchema,
  subactions: leafSubactionsSchema,
});

export type ModifySPListViewPayload = z.infer<typeof modifySPListViewSchema>;
```

- [x] **Step 4: Create `deleteSPListView` schema**

Create `views/delete-sp-list-view/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listViewTitleSchema } from "../_shared/schema";

export const deleteSPListViewSchema = z.object({
  verb: z.literal("deleteSPListView"),
  title: listViewTitleSchema,
  subactions: leafSubactionsSchema,
});

export type DeleteSPListViewPayload = z.infer<typeof deleteSPListViewSchema>;
```

- [x] **Step 5: Run schema typecheck**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: build exits `0`.

## Task 3: Domain Helpers

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-lookup.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-fields.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-props.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/index.ts`

- [x] **Step 1: Create lookup helper**

Create `domains/views/list-view-lookup.ts`:

```ts
import type { IList } from "@pnp/sp/lists";
import type { IViewInfo } from "@pnp/sp/views";

import { escapeODataStringLiteral } from "../lists/list-lookup";

import "@pnp/sp/views";

const listViewSelectKeys = [
  "Id",
  "Title",
  "PersonalView",
  "DefaultView",
  "ViewQuery",
  "RowLimit",
  "Paged",
] as const;

export type ListViewInfo = Pick<IViewInfo, "Id" | "Title" | "PersonalView" | "DefaultView" | "ViewQuery" | "RowLimit" | "Paged">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  if (typeof error.status === "number") return error.status;

  const response = error.response;
  if (isRecord(response) && typeof response.status === "number") return response.status;

  return undefined;
}

function isSharePointNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export async function getPublicListViewInfoByTitle(list: IList, title: string): Promise<ListViewInfo | undefined> {
  try {
    const safeTitle = escapeODataStringLiteral(title);
    const results = await list.views
      .filter(`Title eq '${safeTitle}' and PersonalView eq false`)
      .top(1)
      .select(...listViewSelectKeys)<ListViewInfo[]>();

    return results[0];
  } catch (error) {
    if (isSharePointNotFoundError(error)) return undefined;
    throw error;
  }
}
```

- [x] **Step 2: Create field normalization helper**

Create `domains/views/list-view-fields.ts`:

```ts
import type { IList } from "@pnp/sp/lists";
import type { IView } from "@pnp/sp/views";

import { getFieldByNameOrTitle } from "../fields/field-lookup";

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

export async function replaceViewFieldsWithInternalNames(view: IView, requestedInternalNames: readonly string[]): Promise<boolean> {
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
```

- [x] **Step 3: Create prop mapping and comparison helper**

Create `domains/views/list-view-props.ts`:

```ts
import type { IList } from "@pnp/sp/lists";
import type { IView, IViewInfo } from "@pnp/sp/views";

import type { ListViewInfo } from "./list-view-lookup";
import {
  areViewFieldsEqual,
  getViewFieldNames,
  isListViewFieldResolutionError,
  resolveViewFieldInternalNames,
  type ListViewFieldResolutionError,
} from "./list-view-fields";

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
```

- [x] **Step 4: Create domain barrel**

Create `domains/views/index.ts`:

```ts
export {
  replaceViewFields,
  replaceViewFieldsWithInternalNames,
  resolveViewFieldInternalNames,
} from "./list-view-fields";
export {
  getPublicListViewInfoByTitle,
  type ListViewInfo,
} from "./list-view-lookup";
export {
  buildListViewUpdateProps,
  getListViewFieldResolutionDriftDetails,
  getListViewStateMismatches,
  hasScalarChanges,
} from "./list-view-props";
```

- [x] **Step 5: Run build**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: build exits `0` if domain helpers are not imported by missing action files yet.

## Task 4: Create Action Modules

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/index.ts`

- [x] **Step 1: Implement `CreateSPListViewAction`**

Create `views/create-sp-list-view/action.ts`:

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { buildListViewUpdateProps, getPublicListViewInfoByTitle, getListViewStateMismatches, replaceViewFieldsWithInternalNames, resolveViewFieldInternalNames } from "../../domains/views";

import { buildListViewScopeDelta, checkListViewManageListsPermission } from "../_shared/scope";
import { createSPListViewSchema, type CreateSPListViewPayload } from "./schema";

import "@pnp/sp/views";

export class CreateSPListViewAction extends ActionDefinition<
  "createSPListView",
  typeof createSPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPListView";
  readonly actionSchema = createSPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<PermissionCheckResult> {
    return checkListViewManageListsPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getPublicListViewInfoByTitle(list, payload.title);
    if (existing) return actionSkipped(payload.title, "already_exists", buildListViewScopeDelta(ctx.scopeIn));

    const requestedInternalNames = payload.fields !== undefined
      ? await resolveViewFieldInternalNames(list, payload.fields)
      : undefined;

    const created = await list.views.add(payload.title, false, {});
    const view = list.views.getById(created.Id);
    if (requestedInternalNames !== undefined) {
      await replaceViewFieldsWithInternalNames(view, requestedInternalNames);
    }

    const updateProps = buildListViewUpdateProps(payload);
    if (Object.keys(updateProps).length > 0) {
      await view.update(updateProps);
    }

    return actionExecuted(payload.title, buildListViewScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const list = ctx.scopeIn.list;
    const resource = ctx.action.payload.title;
    if (!ctx.clients.spfi) return unverifiable({ resource, reason: "missing_prerequisite", message: "SPFI instance not available in scope" });
    if (!list) return unverifiable({ resource, reason: "missing_prerequisite", message: "SharePoint list scope not available" });

    try {
      const info = await getPublicListViewInfoByTitle(list, resource);
      if (!info) return nonCompliant({ resource, reason: "not_found" });

      const view = ctx.action.payload.fields !== undefined ? list.views.getById(info.Id) : undefined;
      const mismatches = await getListViewStateMismatches(list, view, ctx.action.payload, info);

      return mismatches.length === 0
        ? compliant({ resource, scopeDelta: buildListViewScopeDelta(ctx.scopeIn) })
        : nonCompliant({ resource, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
```

- [x] **Step 2: Implement `ModifySPListViewAction`**

Create `views/modify-sp-list-view/action.ts`:

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { buildListViewUpdateProps, getPublicListViewInfoByTitle, getListViewStateMismatches, hasScalarChanges, replaceViewFields } from "../../domains/views";

import { buildListViewScopeDelta, checkListViewManageListsPermission } from "../_shared/scope";
import { modifySPListViewSchema, type ModifySPListViewPayload } from "./schema";

import "@pnp/sp/views";

export class ModifySPListViewAction extends ActionDefinition<
  "modifySPListView",
  typeof modifySPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "modifySPListView";
  readonly actionSchema = modifySPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<ModifySPListViewPayload>): Promise<PermissionCheckResult> {
    return checkListViewManageListsPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<ModifySPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getPublicListViewInfoByTitle(list, payload.title);
    if (!existing) return actionSkipped(payload.title, "not_found", buildListViewScopeDelta(ctx.scopeIn));

    const view = list.views.getById(existing.Id);
    const scalarChanges = hasScalarChanges(payload, existing);
    const fieldChanged = payload.fields !== undefined
      ? await replaceViewFields(list, view, payload.fields)
      : false;

    if (!scalarChanges && !fieldChanged) return actionSkipped(payload.title, "no_changes", buildListViewScopeDelta(ctx.scopeIn));

    if (scalarChanges) {
      await view.update(buildListViewUpdateProps(payload));
    }

    return actionExecuted(payload.title, buildListViewScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!ctx.clients.spfi) return unverifiable({ resource: payload.title, reason: "missing_prerequisite", message: "SPFI instance not available in scope" });
    if (!list) return unverifiable({ resource: payload.title, reason: "missing_prerequisite", message: "SharePoint list scope not available" });

    try {
      const info = await getPublicListViewInfoByTitle(list, payload.title);
      if (!info) return nonCompliant({ resource: payload.title, reason: "not_found" });

      const view = payload.fields !== undefined ? list.views.getById(info.Id) : undefined;
      const mismatches = await getListViewStateMismatches(list, view, payload, info);

      return mismatches.length === 0
        ? compliant({ resource: payload.title, scopeDelta: buildListViewScopeDelta(ctx.scopeIn) })
        : nonCompliant({ resource: payload.title, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
```

- [x] **Step 3: Implement `DeleteSPListViewAction`**

Create `views/delete-sp-list-view/action.ts`:

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight, ProvisioningWarning } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { getPublicListViewInfoByTitle } from "../../domains/views";

import { buildListViewScopeDelta, checkListViewManageListsPermission } from "../_shared/scope";
import { deleteSPListViewSchema, type DeleteSPListViewPayload } from "./schema";

import "@pnp/sp/views";

function buildDefaultViewDeleteWarning(title: string): ProvisioningWarning {
  return {
    code: "LIST_VIEW_DEFAULT_DELETE_BLOCKED",
    message: "The current default SharePoint list view cannot be deleted by deleteSPListView V1. Set another view as default first.",
    details: { title },
  };
}

export class DeleteSPListViewAction extends ActionDefinition<
  "deleteSPListView",
  typeof deleteSPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "deleteSPListView";
  readonly actionSchema = deleteSPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<DeleteSPListViewPayload>): Promise<PermissionCheckResult> {
    return checkListViewManageListsPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<DeleteSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const info = await getPublicListViewInfoByTitle(list, payload.title);
    if (!info) return actionSkipped(payload.title, "not_found", buildListViewScopeDelta(ctx.scopeIn));

    if (info.DefaultView) {
      return actionSkipped(payload.title, "unsupported", buildListViewScopeDelta(ctx.scopeIn), [buildDefaultViewDeleteWarning(payload.title)]);
    }

    await list.views.getById(info.Id).delete();
    return actionExecuted(payload.title, buildListViewScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const list = ctx.scopeIn.list;
    const resource = ctx.action.payload.title;
    if (!ctx.clients.spfi) return unverifiable({ resource, reason: "missing_prerequisite", message: "SPFI instance not available in scope" });
    if (!list) return unverifiable({ resource, reason: "missing_prerequisite", message: "SharePoint list scope not available" });

    try {
      const info = await getPublicListViewInfoByTitle(list, resource);
      if (!info) return compliant({ resource });
      return nonCompliant({
        resource,
        reason: info.DefaultView ? "default_view" : "exists",
        details: info.DefaultView ? { blocked: true } : undefined,
      });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
```

- [x] **Step 4: Create action module index files**

Create each action `index.ts` with this pattern.

`views/create-sp-list-view/index.ts`:

```ts
import { defineSharePointActionModule } from "../../action-module";

import { CreateSPListViewAction } from "./action";
import { createSPListViewSchema } from "./schema";

export { CreateSPListViewAction } from "./action";
export { createSPListViewSchema, type CreateSPListViewPayload } from "./schema";

export const createSPListViewActionModule = defineSharePointActionModule({
  verb: "createSPListView",
  schema: createSPListViewSchema,
  definition: new CreateSPListViewAction(),
  placements: ["listSubaction"] as const,
});
```

`views/modify-sp-list-view/index.ts`:

```ts
import { defineSharePointActionModule } from "../../action-module";

import { ModifySPListViewAction } from "./action";
import { modifySPListViewSchema } from "./schema";

export { ModifySPListViewAction } from "./action";
export { modifySPListViewSchema, type ModifySPListViewPayload } from "./schema";

export const modifySPListViewActionModule = defineSharePointActionModule({
  verb: "modifySPListView",
  schema: modifySPListViewSchema,
  definition: new ModifySPListViewAction(),
  placements: ["listSubaction"] as const,
});
```

`views/delete-sp-list-view/index.ts`:

```ts
import { defineSharePointActionModule } from "../../action-module";

import { DeleteSPListViewAction } from "./action";
import { deleteSPListViewSchema } from "./schema";

export { DeleteSPListViewAction } from "./action";
export { deleteSPListViewSchema, type DeleteSPListViewPayload } from "./schema";

export const deleteSPListViewActionModule = defineSharePointActionModule({
  verb: "deleteSPListView",
  schema: deleteSPListViewSchema,
  definition: new DeleteSPListViewAction(),
  placements: ["listSubaction"] as const,
});
```

Create `views/index.ts`:

```ts
export {
  createSPListViewActionModule,
  CreateSPListViewAction,
  createSPListViewSchema,
  type CreateSPListViewPayload,
} from "./create-sp-list-view";
export {
  modifySPListViewActionModule,
  ModifySPListViewAction,
  modifySPListViewSchema,
  type ModifySPListViewPayload,
} from "./modify-sp-list-view";
export {
  deleteSPListViewActionModule,
  DeleteSPListViewAction,
  deleteSPListViewSchema,
  type DeleteSPListViewPayload,
} from "./delete-sp-list-view";
```

- [x] **Step 5: Run build**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: any failures are local import/type issues in the new files. Fix before continuing.

## Task 5: Registration And Public Exports

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`

- [x] **Step 1: Register action modules**

In `action-modules.ts`, import the three view modules:

```ts
import {
  createSPListViewActionModule,
  deleteSPListViewActionModule,
  modifySPListViewActionModule,
} from "./views";
```

Add them in `sharePointActionModules` after list actions and before content types:

```ts
  createSPListViewActionModule,
  modifySPListViewActionModule,
  deleteSPListViewActionModule,
```

- [x] **Step 2: Add list subaction schemas only**

In `_composition/list-subactions-schema.ts`, import:

```ts
import {
  createSPListViewActionModule,
  deleteSPListViewActionModule,
  modifySPListViewActionModule,
} from "../views";
```

Add to `listSubactionSchemas`:

```ts
  createSPListViewActionModule.schema,
  modifySPListViewActionModule.schema,
  deleteSPListViewActionModule.schema,
```

Do not add view schemas to `provisioning-schema.ts` or `site-subactions-schema.ts`.

- [x] **Step 3: Export schemas from `schemas.ts`**

Add:

```ts
export {
  createSPListViewSchema,
  type CreateSPListViewPayload,
  deleteSPListViewSchema,
  type DeleteSPListViewPayload,
  modifySPListViewSchema,
  type ModifySPListViewPayload,
} from "./views";
```

- [x] **Step 4: Export actions from SharePoint public index**

In `sharepoint/index.ts`, add:

```ts
export { CreateSPListViewAction, ModifySPListViewAction, DeleteSPListViewAction } from "./views";
export {
  createSPListViewSchema,
  type CreateSPListViewPayload,
  modifySPListViewSchema,
  type ModifySPListViewPayload,
  deleteSPListViewSchema,
  type DeleteSPListViewPayload,
} from "./views";
```

- [x] **Step 5: Validate placement**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: build exits `0`.

## Task 6: Smoke Coverage

**Files:**
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [x] **Step 1: Cover accepted list view subactions and placement rejection**

Add smoke coverage for accepted list-scoped view actions and rejection outside list scope:

```ts
  const createListView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Smoke View",
    fields: ["Title", "Smoke Text"],
    viewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /></OrderBy>",
    rowLimit: 30,
    paged: true,
    defaultView: true,
  });
  assert(createListView.success, "SharePoint list subaction schema should accept createSPListView");

  const modifyListView = listSubactionSchema.safeParse({
    verb: "modifySPListView",
    title: "Smoke View",
    fields: ["Title"],
    rowLimit: 100,
  });
  assert(modifyListView.success, "SharePoint list subaction schema should accept modifySPListView");

  const deleteListView = listSubactionSchema.safeParse({
    verb: "deleteSPListView",
    title: "Smoke View",
  });
  assert(deleteListView.success, "SharePoint list subaction schema should accept deleteSPListView");

  const rootCreatesView = sharePointActionsSchema.safeParse([
    {
      verb: "createSPListView",
      title: "Invalid Root View",
    },
  ]);
  assert(!rootCreatesView.success, "SharePoint root schema should reject list view actions");

  const siteCreatesView = siteSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Invalid Site View",
  });
  assert(!siteCreatesView.success, "SharePoint site subaction schema should reject list view actions");

  const falseDefaultView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Invalid Default False",
    defaultView: false,
  });
  assert(!falseDefaultView.success, "SharePoint list view schema should reject defaultView false");

  const wrappedViewQuery = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Invalid Query Wrapper",
    viewQuery: "<Query><OrderBy><FieldRef Name=\"Modified\" /></OrderBy></Query>",
  });
  assert(!wrappedViewQuery.success, "SharePoint list view schema should reject <Query> wrappers");

  const duplicateFields = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Invalid Duplicate Fields",
    fields: ["Title", " Title "],
  });
  assert(!duplicateFields.success, "SharePoint list view schema should reject duplicate raw field references after trimming");

  const nestedViewSubaction = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Invalid Nested View",
    subactions: [{ verb: "addSPField", fieldType: "Text", fieldName: "NestedText" }],
  });
  assert(!nestedViewSubaction.success, "SharePoint list view schema should reject nested subactions");
```

- [x] **Step 2: Cover domain guardrails without tenant writes**

Use focused fake PnPjs list/view objects in `smoke-m365-engine.ts` to cover:

- internal spaces in view titles and field display names, while trimming accidental leading/trailing whitespace;
- root and site create/modify list actions accepting list view subactions through their parent list scope;
- field display titles resolving to internal names;
- duplicate raw field references after trimming;
- duplicate resolved internal names;
- public-title lookup through filtered OData with apostrophe escaping, `PersonalView eq false`, `top(1)`, and the full select set needed by handlers/compliance;
- `viewQuery` rejects `<View>`/`<Query>` wrappers even when prefixed by whitespace, XML declarations, or leading comments;
- list-view permission check outcomes for missing `spfi`, missing `web`, and allowed `ManageLists`;
- package-root and SharePoint barrel exports for the three view action classes and schemas;
- compliance prerequisite outcomes for missing `spfi` and missing list scope;
- handler prerequisite outcomes for missing list scope;
- create compliance drift detection;
- create/modify compliance avoiding view field reads when `fields` is not declared;
- compliance drift detection when SharePoint returns a missing `ViewQuery` value;
- compliance field comparison with SharePoint-wrapped `Items.results`;
- handler field validation before any create/replace/update write;
- create handler ordering with minimal creation, field replacement, then scalar updates;
- create handler idempotent skip without writes when the view already exists;
- create handler ignoring same-title personal views;
- create/modify field-only changes without empty scalar updates;
- modify handler drift correction with field replacement before scalar updates;
- modify handler scalar-only updates without field reads or field writes;
- modify handler no-change skip without field or scalar writes;
- modify and delete handler `not_found` skips without resolving mutable view handles;
- modify/delete compliance outcomes for missing and existing delete targets;
- non-default delete handler path;
- default-view delete blocking.

- [x] **Step 3: Run smoke**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: smoke exits `0`.

## Task 7: Demo Plan Update

**Files:**
- Modify: `apps/test-spfx/src/webparts/testProvisioning/test-plans/demo-plans.ts`

- [x] **Step 1: Add a customer view after customer fields**

Inside the `customers` list `subactions`, after the field actions, add:

```ts
        {
          verb: 'createSPListView',
          title: 'Customers by Code',
          fields: ['Title', 'CustomerCode', 'CustomerEmail'],
          viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
          rowLimit: 100,
          paged: true,
          defaultView: true,
        },
```

- [x] **Step 2: Add an orders view after order fields**

Inside the `orders` list `subactions`, after the lookup field action, add:

```ts
        {
          verb: 'createSPListView',
          title: 'Orders by Date',
          fields: ['Title', 'OrderDate', 'OrderTotal', 'Customer'],
          viewQuery: '<OrderBy><FieldRef Name="OrderDate" Ascending="FALSE" /></OrderBy>',
          rowLimit: 100,
          paged: true,
          defaultView: true,
        },
```

- [x] **Step 3: Do not add delete view actions to the deprovisioning plan**

The deprovisioning plan deletes the lists. Do not add `deleteSPListView` there unless another view is explicitly promoted away from the custom default first.

- [x] **Step 4: Build the demo app after package build**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
npm run build -w test-spfx
```

Expected: both commands exit `0`.

## Task 8: Documentation And Final Validation

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`
- Review: `docs/superpowers/specs/2026-06-18-sharepoint-list-views-v1-redesign.md`

- [x] **Step 1: Update action catalog docs**

Add a list views section to `ACTIONS.md` describing:

```md
## SharePoint List Views

List view actions are V1 list subactions only. They require a parent list scope.

- `createSPListView`: create-only, idempotent, skips if the view exists.
- `modifySPListView`: enforces supported mutable state on an existing view.
- `deleteSPListView`: deletes a non-default view; skips with warning if the view is default.

Supported V1 payload fields: `title`, `fields`, `viewQuery`, `rowLimit`, `paged`, `defaultView: true`.
```

- [x] **Step 2: Run final local validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
npm run build -w test-spfx
git diff --check
git status --short
```

Expected:

- smoke exits `0`;
- package build exits `0`;
- SPFx test app build exits `0`;
- `git status --short` lists only intentional files changed by this plan.

- [x] **Step 3: Tenant smoke checklist**

Before calling runtime behavior stable, run the demo plan against a disposable tenant site and verify:

- create view with fields succeeds;
- create view with `viewQuery` succeeds;
- `defaultView: true` promotes the requested custom view;
- modifying field order succeeds;
- deleting a non-default custom view succeeds;
- attempting to delete a default custom view returns skipped/unsupported with `LIST_VIEW_DEFAULT_DELETE_BLOCKED`.

Tenant validation was marked complete only after the user confirmed that real SharePoint deprovisioning and provisioning both worked.

## Self-Review Notes

- Spec coverage: the plan covers list-scoped placement, three verbs, create-only semantics, default-view delete blocking, `defaultView: true` only, field internal-name normalization, PnPjs update order, demo plan, smoke tests, and docs.
- Cleanup coverage: compliance resolves mutable view handles only when `fields` comparison is required; title-only and scalar-only compliance paths are smoke-guarded.
- Placeholder scan: no implementation step relies on TBD code or unnamed files.
- Type consistency: action payload names match the spec and schema snippets; PnPjs props use `ViewQuery`, `RowLimit`, `Paged`, and `DefaultView`.
