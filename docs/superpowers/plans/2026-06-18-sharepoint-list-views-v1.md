# SharePoint List Views V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SP-first SharePoint standard list view provisioning as list subactions: create, modify, and delete.

**Architecture:** Implement a new `actions/sharepoint/views` action domain backed by `@pnp/sp/views`, plus reusable `domains/views` helpers for mapping, lookup, field synchronization, and compliance comparison. V1 registers list view actions only in `listSubactionSchema`, keeps root action schemas unchanged, and extends the existing smoke script as the regression harness because the package does not currently have a test runner.

**Tech Stack:** TypeScript, Zod v4, PnPjs `@pnp/sp@4.17.0`, existing provisioning engine/action module model, existing `scripts/smoke-m365-engine.ts`, `npm run build -w @apvee/m365-actionable-provisioning`, `npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning`.

---

## File Structure

Create:

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/index.ts`  
  Barrel export for internal view helpers.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-props.ts`  
  Scope enum mapping, SharePoint property mapping, scalar comparison, and query normalization.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-lookup.ts`  
  Case-sensitive lookup by view title and 404-safe missing-view handling.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-fields.ts`  
  Ordered field retrieval, comparison, and replacement.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/_shared/schema.ts`  
  Shared Zod primitives for V1 list view schemas.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/action.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/action.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/action.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/views/index.ts`

Modify:

- `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`  
  Add schema/helper/composition assertions for list view V1.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts`  
  Register list view subaction schemas.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`  
  Register list view action modules.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`  
  Re-export public list view schemas and payload types.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`  
  Re-export action classes, schemas, and payload types for advanced use cases.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`  
  Document the new actions in the action catalog.

Do not modify:

- `packages/m365-actionable-provisioning/src/actions/sharepoint/provisioning-schema.ts`  
  Root schema must keep rejecting list view actions in V1.
- `packages/m365-actionable-provisioning/src/runtime/scope.ts`  
  V1 does not add a public view handle to `M365Scope`.

---

### Task 1: Add Failing Smoke Coverage For The Public Contract

**Files:**
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add failing imports**

Add these imports beside the existing SharePoint domain/helper imports:

```ts
import {
  areViewFieldsEqual,
  buildListViewUpdateProps,
  compareListViewState,
  mapListViewScope,
  normalizeViewQuery,
} from "../src/actions/sharepoint/domains/views";
import {
  createSPListViewSchema,
  deleteSPListViewSchema,
  modifySPListViewSchema,
} from "../src/actions/sharepoint/views";
```

- [ ] **Step 2: Add list view smoke assertions**

Add this function after `assertSharePointCatalogComposition()`:

```ts
function assertSharePointListViewV1Contract(): void {
  const createView = createSPListViewSchema.safeParse({
    verb: "createSPListView",
    title: "Active documents",
    fields: ["DocIcon", "LinkFilename", "Modified"],
    viewQuery: " <OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /></OrderBy> ",
    rowLimit: 100,
    paged: true,
    defaultView: true,
    tabularView: true,
    scope: "recursiveAll",
  });
  assert(createView.success, "createSPListView schema should accept the V1 standard view shape");

  const invalidCreateView = createSPListViewSchema.safeParse({
    verb: "createSPListView",
    title: "",
    fields: [],
    scope: "calendar",
  });
  assert(!invalidCreateView.success, "createSPListView schema should reject empty title, empty fields, and unsupported scopes");

  const modifyView = modifySPListViewSchema.safeParse({
    verb: "modifySPListView",
    title: "Active documents",
    newTitle: "Recently changed documents",
    fields: ["LinkFilename", "Editor", "Modified"],
    defaultView: false,
  });
  assert(modifyView.success, "modifySPListView schema should accept rename and explicitly supplied mutable properties");

  const deleteView = deleteSPListViewSchema.safeParse({
    verb: "deleteSPListView",
    title: "Old documents",
  });
  assert(deleteView.success, "deleteSPListView schema should accept a title-only payload");

  const listCreateView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Active documents",
    fields: ["LinkFilename", "Modified"],
  });
  assert(listCreateView.success, "SharePoint list subaction schema should accept createSPListView");

  const rootCreateView = sharePointActionsSchema.safeParse([
    {
      verb: "createSPListView",
      title: "Invalid root view",
    },
  ]);
  assert(!rootCreateView.success, "SharePoint root schema should reject list view actions in V1");

  const updateProps = buildListViewUpdateProps({
    newTitle: "Recently changed documents",
    viewQuery: " <Where><IsNotNull><FieldRef Name=\"Modified\" /></IsNotNull></Where> ",
    rowLimit: 50,
    paged: false,
    defaultView: true,
    tabularView: false,
    scope: "filesOnly",
  });
  assert(updateProps.Title === "Recently changed documents", "List view update props should map newTitle to Title");
  assert(updateProps.ViewQuery === "<Where><IsNotNull><FieldRef Name=\"Modified\" /></IsNotNull></Where>", "List view update props should trim ViewQuery");
  assert(updateProps.RowLimit === 50, "List view update props should map rowLimit to RowLimit");
  assert(updateProps.Paged === false, "List view update props should preserve false Paged");
  assert(updateProps.DefaultView === true, "List view update props should map defaultView true to DefaultView");
  assert(updateProps.TabularView === false, "List view update props should preserve false TabularView");
  assert(updateProps.Scope === 3, "List view update props should map filesOnly to ViewScope.FilesOnly");

  const falseDefaultUpdateProps = buildListViewUpdateProps({ defaultView: false });
  assert(
    falseDefaultUpdateProps.DefaultView === undefined,
    "List view update props should not send DefaultView false because SharePoint default status is changed by setting another view as default"
  );

  assert(mapListViewScope("default") === 0, "default scope should map to ViewScope.DefaultValue");
  assert(mapListViewScope("recursive") === 1, "recursive scope should map to ViewScope.Recursive");
  assert(mapListViewScope("recursiveAll") === 2, "recursiveAll scope should map to ViewScope.RecursiveAll");
  assert(mapListViewScope("filesOnly") === 3, "filesOnly scope should map to ViewScope.FilesOnly");
  assert(normalizeViewQuery("  <View />\n") === "<View />", "View query normalization should trim only outer whitespace");
  assert(areViewFieldsEqual(["Title", "Modified"], ["Title", "Modified"]), "Field comparison should accept exact ordered matches");
  assert(!areViewFieldsEqual(["Title", "Modified"], ["Modified", "Title"]), "Field comparison should reject order drift");

  const mismatches = compareListViewState(
    {
      viewQuery: "<Where />",
      rowLimit: 30,
      fields: ["Title", "Modified"],
      defaultView: true,
    },
    {
      ViewQuery: " <Where /> ",
      RowLimit: 30,
      Paged: true,
      DefaultView: false,
      TabularView: true,
      Scope: 0,
    },
    ["Title", "Editor"]
  );
  assert(
    mismatches.some((mismatch) => mismatch.key === "DefaultView"),
    "List view state comparison should report default view drift"
  );
  assert(
    mismatches.some((mismatch) => mismatch.key === "fields"),
    "List view state comparison should report ordered field drift"
  );
}
```

- [ ] **Step 3: Call the smoke assertion**

Add this line in the same area where the script invokes other assertion functions:

```ts
assertSharePointListViewV1Contract();
```

- [ ] **Step 4: Run smoke and verify failure**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL because `../src/actions/sharepoint/domains/views` and `../src/actions/sharepoint/views` do not exist yet.

- [ ] **Step 5: Keep the smoke changes unstaged until the feature passes**

```bash
git status --short
```

Expected: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts` appears as modified. Do not commit yet because the red smoke assertion is intentionally failing.

---

### Task 2: Add List View Domain Helpers

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-props.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-fields.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/list-view-lookup.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/index.ts`

- [ ] **Step 1: Create property mapping and compliance helpers**

Create `list-view-props.ts` with:

```ts
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
  const expectedProps = buildListViewUpdateProps(expected);

  for (const key of Object.keys(expectedProps) as Array<keyof typeof expectedProps>) {
    const expectedValue = expectedProps[key];
    const actualValue = actual[key as keyof ListViewComparableState];
    const normalizedActualValue = key === "ViewQuery" && typeof actualValue === "string"
      ? normalizeViewQuery(actualValue)
      : actualValue;
    if (normalizedActualValue !== expectedValue) {
      mismatches.push({ key, expected: expectedValue, actual: actualValue });
    }
  }

  if (expected.defaultView !== undefined && actual.DefaultView !== expected.defaultView) {
    mismatches.push({ key: "DefaultView", expected: expected.defaultView, actual: actual.DefaultView });
  }

  if (expected.fields !== undefined) {
    const fields = actualFields ?? [];
    if (!areViewFieldsEqual(expected.fields, fields)) {
      mismatches.push({ key: "fields", expected: expected.fields, actual: fields });
    }
  }

  return mismatches;
}
```

- [ ] **Step 2: Create field helpers**

Create `list-view-fields.ts` with:

```ts
import type { IView } from "@pnp/sp/views";

type ViewFieldsInfo = Readonly<{
  Items?: string[];
}>;

export async function getViewFieldNames(view: IView): Promise<string[]> {
  const fieldsInfo = await view.fields<ViewFieldsInfo>();
  return Array.isArray(fieldsInfo.Items) ? [...fieldsInfo.Items] : [];
}

export async function replaceViewFields(view: IView, fields: readonly string[]): Promise<void> {
  await view.fields.removeAll();
  for (const fieldName of fields) {
    await view.fields.add(fieldName);
  }
}
```

- [ ] **Step 3: Create lookup helpers**

Create `list-view-lookup.ts` with:

```ts
import type { IList } from "@pnp/sp/lists";
import type { IView, IViewInfo } from "@pnp/sp/views";

import "@pnp/sp/views";

export const listViewSelectKeys = [
  "Id",
  "Title",
  "DefaultView",
  "ViewQuery",
  "RowLimit",
  "Paged",
  "TabularView",
  "Scope",
] as const;

export type ListViewInfo = Pick<
  IViewInfo,
  "Id" | "Title" | "DefaultView" | "ViewQuery" | "RowLimit" | "Paged" | "TabularView" | "Scope"
>;

function getErrorStatus(error: unknown): number | undefined {
  if (typeof (error as { status?: unknown })?.status === "number") return (error as { status: number }).status;
  if (typeof (error as { response?: { status?: unknown } })?.response?.status === "number") {
    return (error as { response: { status: number } }).response.status;
  }
  return undefined;
}

export function isSharePointNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export function getListViewByTitle(list: IList, title: string): IView {
  return list.views.getByTitle(title);
}

export async function getListViewInfoByTitle(list: IList, title: string): Promise<ListViewInfo | undefined> {
  try {
    return await getListViewByTitle(list, title).select(...listViewSelectKeys)<ListViewInfo>();
  } catch (error) {
    if (isSharePointNotFoundError(error)) return undefined;
    throw error;
  }
}
```

- [ ] **Step 4: Create barrel export**

Create `index.ts` with:

```ts
export {
  areViewFieldsEqual,
  buildListViewUpdateProps,
  compareListViewState,
  mapListViewScope,
  normalizeViewQuery,
  type ListViewComparableState,
  type ListViewScope,
  type ListViewStateInput,
  type ListViewStateMismatch,
} from "./list-view-props";
export { getViewFieldNames, replaceViewFields } from "./list-view-fields";
export {
  getListViewByTitle,
  getListViewInfoByTitle,
  isSharePointNotFoundError,
  listViewSelectKeys,
  type ListViewInfo,
} from "./list-view-lookup";
```

- [ ] **Step 5: Run smoke and verify partial progress**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL because `../src/actions/sharepoint/views` still does not exist; helper imports should now resolve.

- [ ] **Step 6: Run build and record helper type status**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: PASS for package source compilation. The red smoke script from Task 1 is outside the package `src` include and remains intentionally uncommitted until Task 5.

---

### Task 3: Add List View Schemas And Action Modules

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/_shared/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/index.ts`

- [ ] **Step 1: Create shared schema primitives**

Create `_shared/schema.ts` with:

```ts
import { z } from "zod";

export const listViewTitleSchema = z
  .string()
  .min(1, "List view title cannot be empty")
  .max(255, "List view title cannot exceed 255 characters");

export const listViewFieldNameSchema = z
  .string()
  .min(1, "List view field name cannot be empty")
  .max(255, "List view field name cannot exceed 255 characters");

export const listViewFieldsSchema = z
  .array(listViewFieldNameSchema)
  .min(1, "List view fields cannot be empty")
  .optional();

export const listViewScopeSchema = z.enum(["default", "recursive", "recursiveAll", "filesOnly"]);

export const listViewMutableStateSchema = {
  fields: listViewFieldsSchema,
  viewQuery: z.string().optional(),
  rowLimit: z.number().int().min(1).max(50000).optional(),
  paged: z.boolean().optional(),
  defaultView: z.boolean().optional(),
  tabularView: z.boolean().optional(),
  scope: listViewScopeSchema.optional(),
} as const;
```

- [ ] **Step 2: Create action schemas**

Create `create-sp-list-view/schema.ts` with:

```ts
import { z } from "zod";

import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const createSPListViewSchema = z.object({
  verb: z.literal("createSPListView"),
  title: listViewTitleSchema,
  ...listViewMutableStateSchema,
});

export type CreateSPListViewPayload = z.infer<typeof createSPListViewSchema>;
```

Create `modify-sp-list-view/schema.ts` with:

```ts
import { z } from "zod";

import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const modifySPListViewSchema = z.object({
  verb: z.literal("modifySPListView"),
  title: listViewTitleSchema,
  newTitle: listViewTitleSchema.optional(),
  ...listViewMutableStateSchema,
});

export type ModifySPListViewPayload = z.infer<typeof modifySPListViewSchema>;
```

Create `delete-sp-list-view/schema.ts` with:

```ts
import { z } from "zod";

import { listViewTitleSchema } from "../_shared/schema";

export const deleteSPListViewSchema = z.object({
  verb: z.literal("deleteSPListView"),
  title: listViewTitleSchema,
});

export type DeleteSPListViewPayload = z.infer<typeof deleteSPListViewSchema>;
```

---

### Task 4: Implement List View Action Classes

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/action.ts`

- [ ] **Step 1: Implement create action**

Create `create-sp-list-view/action.ts` with this structure:

```ts
import { normalizeError } from "../../../../core";
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { probeManageListsPermission } from "../../domains/lists";
import {
  buildListViewUpdateProps,
  compareListViewState,
  getListViewByTitle,
  getListViewInfoByTitle,
  getViewFieldNames,
  replaceViewFields,
} from "../../domains/views";

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
    const web = ctx.scopeIn.web;
    if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
    if (!web) return { decision: "unknown", message: "SharePoint web scope not available for list view permission probe" };
    return probeManageListsPermission(web, ctx.scopeIn.webUrl ?? "(scope)");
  }

  async handler(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    if (!list) return actionSkipped(ctx.action.payload.title, "missing_prerequisite");

    const payload = ctx.action.payload;
    const existingInfo = await getListViewInfoByTitle(list, payload.title);
    const view = existingInfo
      ? getListViewByTitle(list, payload.title)
      : getListViewByTitle(list, (await list.views.add(payload.title, false, buildListViewUpdateProps(payload))).Title);

    if (existingInfo) {
      const updateProps = buildListViewUpdateProps(payload);
      if (Object.keys(updateProps).length > 0) await view.update(updateProps);
    }

    const appliedState = existingInfo
      ? Object.keys(buildListViewUpdateProps(payload)).length > 0 || payload.fields !== undefined
      : true;

    if (payload.fields !== undefined) {
      await replaceViewFields(view, payload.fields);
    }

    if (existingInfo && !appliedState) {
      return actionSkipped(payload.title, "already_exists", {
        list,
        web: ctx.scopeIn.web,
        webUrl: ctx.scopeIn.webUrl,
        listName: ctx.scopeIn.listName,
      });
    }

    return actionExecuted(payload.title, {
      list,
      web: ctx.scopeIn.web,
      webUrl: ctx.scopeIn.webUrl,
      listName: ctx.scopeIn.listName,
    });
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const list = ctx.scopeIn.list;
    const resource = ctx.action.payload.title;
    if (!ctx.clients.spfi) return unverifiable({ resource, reason: "missing_prerequisite", message: "SPFI instance not available in scope" });
    if (!list) return unverifiable({ resource, reason: "missing_prerequisite", message: "SharePoint list scope not available" });

    try {
      const info = await getListViewInfoByTitle(list, resource);
      if (!info) return nonCompliant({ resource, reason: "not_found" });
      const fields = ctx.action.payload.fields !== undefined ? await getViewFieldNames(getListViewByTitle(list, resource)) : undefined;
      const mismatches = compareListViewState(ctx.action.payload, info, fields);
      return mismatches.length === 0
        ? compliant({ resource, scopeDelta: { list, web: ctx.scopeIn.web, webUrl: ctx.scopeIn.webUrl, listName: ctx.scopeIn.listName } })
        : nonCompliant({ resource, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
```

After creating the file, remove unused imports reported by TypeScript. In particular, remove `normalizeError` if no branch uses it after the final implementation.

- [ ] **Step 2: Implement modify action**

Create `modify-sp-list-view/action.ts` using the same class pattern as create, with these behavior differences:

```ts
// Handler behavior to encode inside ModifySPListViewAction.handler:
const payload = ctx.action.payload;
const existingInfo = await getListViewInfoByTitle(list, payload.title);
if (!existingInfo) return actionSkipped(payload.title, "not_found");

if (payload.newTitle !== undefined && payload.newTitle !== payload.title) {
  const collision = await getListViewInfoByTitle(list, payload.newTitle);
  if (collision) {
    throw new Error(`Cannot rename SharePoint list view '${payload.title}' to '${payload.newTitle}' because another view already uses that title.`);
  }
}

const view = getListViewByTitle(list, payload.title);
const updateProps = buildListViewUpdateProps(payload);
if (Object.keys(updateProps).length > 0) await view.update(updateProps);
if (payload.fields !== undefined) await replaceViewFields(view, payload.fields);
return actionExecuted(payload.newTitle ?? payload.title, {
  list,
  web: ctx.scopeIn.web,
  webUrl: ctx.scopeIn.webUrl,
  listName: ctx.scopeIn.listName,
});
```

Compliance behavior:

```ts
const targetTitle = payload.newTitle ?? payload.title;
const renamedInfo = payload.newTitle !== undefined ? await getListViewInfoByTitle(list, payload.newTitle) : undefined;
const info = renamedInfo ?? await getListViewInfoByTitle(list, payload.title);
if (!info) return nonCompliant({ resource: targetTitle, reason: "not_found" });
if (payload.newTitle !== undefined && !renamedInfo) return nonCompliant({ resource: targetTitle, reason: "rename_pending" });
const fields = payload.fields !== undefined ? await getViewFieldNames(getListViewByTitle(list, targetTitle)) : undefined;
const mismatches = compareListViewState({ ...payload, newTitle: undefined }, info, fields);
```

- [ ] **Step 3: Implement delete action**

Create `delete-sp-list-view/action.ts` with the same class pattern and this core behavior:

```ts
const payload = ctx.action.payload;
const info = await getListViewInfoByTitle(list, payload.title);
if (!info) return actionSkipped(payload.title, "not_found");
if (info.DefaultView) {
  return actionSkipped(payload.title, "unsupported", undefined, [
    {
      code: "LIST_VIEW_DEFAULT_DELETE_BLOCKED",
      message: "The current default SharePoint list view cannot be deleted by deleteSPListView V1. Set another view as default first.",
      details: { title: payload.title },
    },
  ]);
}
await getListViewByTitle(list, payload.title).delete();
return actionExecuted(payload.title, {
  list,
  web: ctx.scopeIn.web,
  webUrl: ctx.scopeIn.webUrl,
  listName: ctx.scopeIn.listName,
});
```

Compliance behavior:

```ts
const info = await getListViewInfoByTitle(list, payload.title);
if (!info) return compliant({ resource: payload.title });
return nonCompliant({
  resource: payload.title,
  reason: info.DefaultView ? "default_view" : "exists",
  details: info.DefaultView ? { blocked: true } : undefined,
});
```

- [ ] **Step 4: Run package build and fix action typing**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: FAIL until index files are added in Task 5. Any TypeScript errors in the action files should be fixed before continuing.

---

### Task 5: Wire Action Modules, Barrels, And Composition

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/create-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/modify-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/delete-sp-list-view/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/views/index.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`

- [ ] **Step 1: Create action module index files**

Create `create-sp-list-view/index.ts`:

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

Create `modify-sp-list-view/index.ts`:

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

Create `delete-sp-list-view/index.ts`:

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

- [ ] **Step 2: Create views barrel**

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

- [ ] **Step 3: Register list subactions**

In `_composition/list-subactions-schema.ts`, import:

```ts
import {
  createSPListViewActionModule,
  deleteSPListViewActionModule,
  modifySPListViewActionModule,
} from "../views";
```

Add these schemas to `listSubactionSchemas`:

```ts
createSPListViewActionModule.schema,
modifySPListViewActionModule.schema,
deleteSPListViewActionModule.schema,
```

- [ ] **Step 4: Register runtime action modules**

In `action-modules.ts`, import:

```ts
import {
  createSPListViewActionModule,
  deleteSPListViewActionModule,
  modifySPListViewActionModule,
} from "./views";
```

Add the modules after `enableSPListRatingActionModule`:

```ts
createSPListViewActionModule,
modifySPListViewActionModule,
deleteSPListViewActionModule,
```

- [ ] **Step 5: Export public schemas**

In `schemas.ts`, add:

```ts
export {
  createSPListViewSchema,
  type CreateSPListViewPayload,
} from "./views/create-sp-list-view";

export {
  modifySPListViewSchema,
  type ModifySPListViewPayload,
} from "./views/modify-sp-list-view";

export {
  deleteSPListViewSchema,
  type DeleteSPListViewPayload,
} from "./views/delete-sp-list-view";
```

- [ ] **Step 6: Export advanced action API**

In `actions/sharepoint/index.ts`, add a "List view actions" section after list actions:

```ts
// List view actions - using direct imports
export { CreateSPListViewAction } from "./views";
export { createSPListViewSchema, type CreateSPListViewPayload } from "./views/create-sp-list-view";

export { ModifySPListViewAction } from "./views";
export { modifySPListViewSchema, type ModifySPListViewPayload } from "./views/modify-sp-list-view";

export { DeleteSPListViewAction } from "./views";
export { deleteSPListViewSchema, type DeleteSPListViewPayload } from "./views/delete-sp-list-view";
```

- [ ] **Step 7: Run smoke and build**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both PASS. If smoke fails because `assertSharePointListViewV1Contract()` was not called, add the call and rerun.

- [ ] **Step 8: Commit**

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: add sharepoint list view actions"
```

---

### Task 6: Update Documentation And Run Final Verification

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`
- Modify only when the file enumerates action verbs: `packages/m365-actionable-provisioning/README.md`

- [ ] **Step 1: Document the V1 list view actions**

Add a "List Views" section to `ACTIONS.md` near the existing list actions:

```md
## List Views

V1 list view actions are SharePoint-backed list subactions. They require `spfi`
and run under a parent `createSPList` or `modifySPList` action.

### `createSPListView`

Ensures a public standard SharePoint list view exists and applies declared V1 state.

```ts
{
  verb: "createSPListView",
  title: "Active documents",
  fields: ["DocIcon", "LinkFilename", "Modified"],
  viewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /></OrderBy>",
  rowLimit: 100,
  paged: true,
  defaultView: true,
  tabularView: true,
  scope: "recursiveAll"
}
```

### `modifySPListView`

Updates an existing public standard SharePoint list view. If `newTitle` is used
and another view already has that title, the action fails with a controlled
collision error.

### `deleteSPListView`

Ensures a public SharePoint list view is absent. V1 does not delete the current
default view; set another view as default first.
```

- [ ] **Step 2: Add README mention only if the README has an action list**

Run:

```bash
rg -n "createSPList|SharePoint actions|Actions|list view" packages/m365-actionable-provisioning/README.md
```

If the README enumerates action verbs, add `createSPListView`, `modifySPListView`, and `deleteSPListView` to that list. If it does not enumerate action verbs, leave it unchanged.

- [ ] **Step 3: Run final verification**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
git status --short
```

Expected:

```text
> @apvee/m365-actionable-provisioning@0.0.1 smoke:m365-engine
...
```

The exact smoke output may include existing smoke messages. The command must exit `0`. The build command must exit `0`. `git status --short` should show only intentional documentation changes before the commit.

- [ ] **Step 4: Commit**

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md packages/m365-actionable-provisioning/README.md
git commit -m "docs: document sharepoint list view actions"
```

If `packages/m365-actionable-provisioning/README.md` was not changed, omit it from `git add`.
