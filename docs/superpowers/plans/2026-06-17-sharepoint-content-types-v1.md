# SharePoint Content Types V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Graph-first SharePoint content type provisioning for site content types, content type field membership, and list content type binding.

**Architecture:** Extend the existing SharePoint action-module system with a `contentTypeSubaction` placement, add Graph-backed content type domain helpers, and register V1 actions for create/modify/delete content types, add/modify/remove fields on content types, and add/remove content types on lists. Keep `setSPListDefaultContentType` out of registered V1 actions until a dedicated spike proves a reliable implementation.

**Tech Stack:** TypeScript, Zod, PnPjs v4 `@pnp/graph`, PnPjs v4 `@pnp/sp` for existing SharePoint context, npm workspaces, `tsx` smoke validation, `tsc`.

---

## Execution Rules

- Do not commit. The user explicitly forbids commits.
- Treat every "checkpoint" step as a `git diff` / validation review, not a commit.
- Preserve existing uncommitted user changes.
- If Task 1 Graph spike disproves a required Graph operation, stop and update this plan before implementing dependent tasks.
- Do not implement or register `setSPListDefaultContentType` in this V1 plan.
- Do not create `index.ts` files that import `./action` until the matching `action.ts` exists with a real implementation. Do not use placeholder action classes or temporary bodies.
- Keep `content-type-subactions-schema.ts` module-driven: it must import the three field-to-content-type action modules after their real action classes exist.
- Execute in this dependency order, even though the domain task numbers group related work: Tasks 1-5, then Task 7 field actions/composition, then Task 6 site content type actions, then Tasks 8-11. `createSPContentType` depends on `content-type-subactions-schema.ts`.

## Source Spec

Implement from:

```text
docs/superpowers/specs/2026-06-17-sharepoint-content-types-design.md
```

## File Structure

Create these runtime files:

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/_shared/reference-schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/create-sp-content-type/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/create-sp-content-type/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/create-sp-content-type/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/delete-sp-content-type/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/delete-sp-content-type/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/delete-sp-content-type/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/add-sp-field-to-content-type/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/add-sp-field-to-content-type/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/add-sp-field-to-content-type/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type-field/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type-field/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type-field/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/remove-sp-field-from-content-type/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/remove-sp-field-from-content-type/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/remove-sp-field-from-content-type/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/add-sp-content-type-to-list/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/add-sp-content-type-to-list/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/add-sp-content-type-to-list/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/remove-sp-content-type-from-list/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/remove-sp-content-type-from-list/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/remove-sp-content-type-from-list/schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/content-type-subactions-schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-errors.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-graph-resolution.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-lookup.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-reference.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-columns.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/index.ts
packages/m365-actionable-provisioning/scripts/spike-m365-content-types-graph.ts
```

Modify these runtime files:

```text
packages/m365-actionable-provisioning/src/runtime/scope.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/action-module.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/provisioning-schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/sites/create-sp-site/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts
packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
```

Modify these docs:

```text
packages/m365-actionable-provisioning/README.md
packages/m365-actionable-provisioning/src/actions/sharepoint/README.md
docs/provisioning-schema.md
```

Do not create these files in V1:

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/set-sp-list-default-content-type/**
```

## Task 1: Graph Capability Spike And Baseline

**Files:**
- Create: `packages/m365-actionable-provisioning/scripts/spike-m365-content-types-graph.ts`
- Read: `node_modules/@pnp/graph/content-types/*.d.ts`
- Read: `node_modules/@pnp/graph/columns/*.d.ts`
- Read: `node_modules/@pnp/graph/lists/*.d.ts`

- [ ] **Step 1: Confirm worktree state**

Run:

```bash
git status --short
```

Expected: only intentional spec/plan files or known user changes. Do not revert unrelated files.

- [ ] **Step 2: Run baseline validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 3: Create a local Graph capability spike script**

Create `packages/m365-actionable-provisioning/scripts/spike-m365-content-types-graph.ts`:

```ts
import "@pnp/graph/sites";
import "@pnp/graph/lists";
import "@pnp/graph/content-types";
import "@pnp/graph/columns";

type SpikeResult = Readonly<{
  capability: string;
  status: "confirmed_locally" | "requires_tenant";
  evidence: string;
}>;

const results: SpikeResult[] = [
  {
    capability: "site.contentTypes.add(contentType)",
    status: "confirmed_locally",
    evidence: "@pnp/graph/content-types/sites.d.ts augments _ContentTypes with add(contentType)",
  },
  {
    capability: "contentType update/delete",
    status: "confirmed_locally",
    evidence: "@pnp/graph/content-types/types.d.ts makes IContentType updateable and deleteable",
  },
  {
    capability: "contentType.columns.addRef(siteColumn)",
    status: "confirmed_locally",
    evidence: "@pnp/graph/columns/content-types.d.ts augments IContentType with columns.addRef",
  },
  {
    capability: "list.contentTypes.addCopy(siteContentType)",
    status: "confirmed_locally",
    evidence: "@pnp/graph/content-types/lists.d.ts augments list contentTypes with addCopy",
  },
  {
    capability: "set default list content type",
    status: "requires_tenant",
    evidence: "No reliable PnPjs Graph wrapper confirmed; keep setSPListDefaultContentType unregistered in V1",
  },
];

for (const result of results) {
  console.log(`${result.status}: ${result.capability} - ${result.evidence}`);
}
```

- [ ] **Step 4: Run the spike script**

Run:

```bash
npx tsx packages/m365-actionable-provisioning/scripts/spike-m365-content-types-graph.ts
```

Expected: output includes four `confirmed_locally` lines and one `requires_tenant` line for default content type.

- [ ] **Step 5: Checkpoint**

Run:

```bash
git diff -- packages/m365-actionable-provisioning/scripts/spike-m365-content-types-graph.ts
```

Expected: only the spike script. Do not commit.

## Task 2: Extend Scope And Action Placement Contracts

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/runtime/scope.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/action-module.ts`

- [ ] **Step 1: Extend `M365Scope` metadata**

In `runtime/scope.ts`, add:

```ts
import type { IContentType } from "@pnp/graph/content-types";
```

Then add explicit metadata before the extension point:

```ts
  /** Graph site id propagated for Graph-backed SharePoint actions. */
  graphSiteId?: string;

  /** Graph list id propagated for Graph-backed SharePoint list actions. */
  graphListId?: string;

  /** Canonical site collection URL when known. */
  siteUrl?: string;

  /** Canonical web URL when known. */
  webUrl?: string;

  /** SharePoint list root folder name when known. */
  listName?: string;

  /** Graph content type handle propagated by content type actions. */
  contentType?: IContentType;

  /** Content type id propagated by content type actions. */
  contentTypeId?: string;

  /** Content type name propagated by content type actions. */
  contentTypeName?: string;
```

- [ ] **Step 2: Extend SharePoint action placements**

In `action-module.ts`, replace:

```ts
export type SharePointActionPlacement = "root" | "siteSubaction" | "listSubaction";
```

with:

```ts
export type SharePointActionPlacement = "root" | "siteSubaction" | "listSubaction" | "contentTypeSubaction";
```

- [ ] **Step 3: Propagate site URL metadata from `createSPSite`**

In `sites/create-sp-site/action.ts`, include stable URL metadata in every `scopeDelta` that currently returns `site` and `web`.

For the already-existing site branch, add:

```ts
siteUrl: targetUrl,
webUrl: targetUrl,
```

For the created site branch, add:

```ts
siteUrl: response.SiteUrl,
webUrl: response.SiteUrl,
```

In `checkCompliance`, include the same `siteUrl` and `webUrl` values in the compliant `scopeDelta`. Do not try to populate `graphSiteId` here; Graph resolution remains owned by the Graph content type helper.

- [ ] **Step 4: Checkpoint**

Run:

```bash
git diff -- packages/m365-actionable-provisioning/src/runtime/scope.ts packages/m365-actionable-provisioning/src/actions/sharepoint/action-module.ts packages/m365-actionable-provisioning/src/actions/sharepoint/sites/create-sp-site/action.ts
```

Expected: only scope metadata, the new `contentTypeSubaction` placement, and `siteUrl`/`webUrl` propagation from `createSPSite`.

## Task 3: Add Shared Content Type Schemas

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/_shared/reference-schema.ts`

- [ ] **Step 1: Create reusable Zod schemas**

Create `reference-schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const contentTypeIdSchema = z.string().min(1);
export const contentTypeNameSchema = z.string().min(1);
export const fieldIdSchema = z.string().min(1);
export const fieldNameSchema = z.string().min(1);

export const contentTypeReferenceSchema = z.object({
  contentTypeId: contentTypeIdSchema.optional(),
  contentTypeName: contentTypeNameSchema.optional(),
}).refine(
  (value) => value.contentTypeId !== undefined || value.contentTypeName !== undefined,
  { message: "Either contentTypeId or contentTypeName must be provided" }
);

export const fieldReferenceSchema = z.object({
  fieldId: fieldIdSchema.optional(),
  fieldName: fieldNameSchema.optional(),
}).refine(
  (value) => value.fieldId !== undefined || value.fieldName !== undefined,
  { message: "Either fieldId or fieldName must be provided" }
);

export const graphTargetSchema = z.object({
  siteUrl: z.string().url().optional(),
  webUrl: z.string().url().optional(),
});

export const contentTypeLeafSubactionsSchema = leafSubactionsSchema;
```

- [ ] **Step 2: Review schema decisions**

Run:

```bash
sed -n '1,180p' packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/_shared/reference-schema.ts
```

Expected: `contentTypeReferenceSchema` and `fieldReferenceSchema` both enforce at least one identifier.

## Task 4: Add Graph Content Type Domain Helpers

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-errors.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-reference.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-graph-resolution.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-lookup.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/content-type-columns.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types/index.ts`

- [ ] **Step 1: Add Graph error normalization helper**

Create `content-type-errors.ts`:

```ts
import { normalizeError } from "../../../../core";

export type GraphPermissionErrorInfo = Readonly<{
  code: "GRAPH_AUTHENTICATION_FAILED" | "GRAPH_PERMISSION_DENIED" | "GRAPH_ERROR";
  message: string;
  status?: number;
}>;

export function normalizeGraphContentTypeError(error: unknown, operation: string): GraphPermissionErrorInfo {
  const normalized = normalizeError(error);
  const status = typeof (error as { status?: unknown })?.status === "number"
    ? (error as { status: number }).status
    : typeof (error as { response?: { status?: unknown } })?.response?.status === "number"
      ? (error as { response: { status: number } }).response.status
      : undefined;

  if (status === 401) {
    return {
      code: "GRAPH_AUTHENTICATION_FAILED",
      status,
      message: `Microsoft Graph authentication failed during ${operation}. Ensure the Graph client is authenticated.`,
    };
  }

  if (status === 403) {
    return {
      code: "GRAPH_PERMISSION_DENIED",
      status,
      message: `Microsoft Graph permission denied during ${operation}. Required permission: Sites.Manage.All or Sites.FullControl.All.`,
    };
  }

  return {
    code: "GRAPH_ERROR",
    status,
    message: normalized.message,
  };
}
```

- [ ] **Step 2: Add reference helper**

Create `content-type-reference.ts`:

```ts
import type { ProvisioningWarning } from "../../../../runtime";

export type ContentTypeReference = Readonly<{
  contentTypeId?: string;
  contentTypeName?: string;
}>;

export function getContentTypeReferenceResource(reference: ContentTypeReference): string {
  return reference.contentTypeId ?? reference.contentTypeName ?? "(content type)";
}

export function buildContentTypeNameMismatchWarning(
  expectedName: string,
  actualName: string,
  contentTypeId: string
): ProvisioningWarning {
  return {
    code: "CONTENT_TYPE_REFERENCE_NAME_MISMATCH",
    message: "Content type id resolved to a content type with a different name than the supplied contentTypeName.",
    details: { contentTypeId, expectedName, actualName },
  };
}
```

- [ ] **Step 3: Add Graph site/list resolution helper**

Create `content-type-graph-resolution.ts`:

```ts
import type { GraphFI } from "@pnp/graph";
import type { M365Scope } from "../../../../runtime";

import "@pnp/graph/sites";
import "@pnp/graph/lists";

export type GraphSharePointTarget = Readonly<{
  graphSiteId: string;
  graphListId?: string;
}>;

function parseSharePointUrl(url: string): { hostname: string; serverRelativeUrl: string } {
  const parsed = new URL(url);
  return {
    hostname: parsed.hostname,
    serverRelativeUrl: parsed.pathname || "/",
  };
}

export async function resolveGraphSiteTarget(
  graphClient: GraphFI,
  scope: M365Scope,
  payload: { siteUrl?: string; webUrl?: string }
): Promise<GraphSharePointTarget> {
  if (typeof scope.graphSiteId === "string") {
    return { graphSiteId: scope.graphSiteId };
  }

  const url = payload.webUrl ?? payload.siteUrl ?? (typeof scope.webUrl === "string" ? scope.webUrl : undefined) ?? (typeof scope.siteUrl === "string" ? scope.siteUrl : undefined);
  if (!url) {
    throw new Error("Graph site resolution failed: provide siteUrl/webUrl or propagate graphSiteId in scope.");
  }

  const { hostname, serverRelativeUrl } = parseSharePointUrl(url);
  const site = await graphClient.sites.getByUrl(hostname, serverRelativeUrl);
  const siteInfo = await site.select("id")();
  if (!siteInfo.id) {
    throw new Error(`Graph site resolution failed: Microsoft Graph did not return a site id for ${url}.`);
  }

  return { graphSiteId: siteInfo.id };
}

export async function resolveGraphListTarget(
  graphClient: GraphFI,
  scope: M365Scope,
  payload: { siteUrl?: string; webUrl?: string; listName?: string }
): Promise<Required<GraphSharePointTarget>> {
  const siteTarget = await resolveGraphSiteTarget(graphClient, scope, payload);
  if (typeof scope.graphListId === "string") {
    return { graphSiteId: siteTarget.graphSiteId, graphListId: scope.graphListId };
  }

  const listName = payload.listName ?? (typeof scope.listName === "string" ? scope.listName : undefined);
  if (!listName) {
    throw new Error("Graph list resolution failed: provide listName or propagate graphListId in scope.");
  }

  const lists = await graphClient.sites.getById(siteTarget.graphSiteId).lists.select("id", "name", "displayName")();
  const matches = Array.isArray(lists) ? lists.filter((list) => list.name === listName) : [];
  if (matches.length > 1) {
    throw new Error(`Graph list resolution failed: listName '${listName}' matched multiple lists by Graph name.`);
  }
  const match = matches[0];
  if (!match?.id) {
    throw new Error(`Graph list resolution failed: list '${listName}' was not found.`);
  }

  return { graphSiteId: siteTarget.graphSiteId, graphListId: match.id };
}
```

- [ ] **Step 4: Add content type lookup helper**

Create `content-type-lookup.ts`:

```ts
import type { ContentType as GraphContentType } from "@microsoft/microsoft-graph-types";
import type { GraphFI } from "@pnp/graph";
import type { IContentType } from "@pnp/graph/content-types";
import type { ProvisioningWarning } from "../../../../runtime";
import { buildContentTypeNameMismatchWarning, type ContentTypeReference } from "./content-type-reference";

import "@pnp/graph/sites";
import "@pnp/graph/lists";
import "@pnp/graph/content-types";

export type ResolvedContentType = Readonly<{
  handle: IContentType;
  info: GraphContentType;
  warnings: readonly ProvisioningWarning[];
}>;

export async function resolveSiteContentType(
  graphClient: GraphFI,
  graphSiteId: string,
  reference: ContentTypeReference
): Promise<ResolvedContentType | undefined> {
  const collection = graphClient.sites.getById(graphSiteId).contentTypes;

  if (reference.contentTypeId) {
    const handle = collection.getById(reference.contentTypeId);
    const info = await handle();
    const warnings = reference.contentTypeName && info.name && info.name !== reference.contentTypeName
      ? [buildContentTypeNameMismatchWarning(reference.contentTypeName, info.name, reference.contentTypeId)]
      : [];
    return { handle, info, warnings };
  }

  if (!reference.contentTypeName) return undefined;

  const all = await collection();
  const matches = all.filter((contentType) => contentType.name === reference.contentTypeName);
  if (matches.length > 1) {
    throw new Error(`Ambiguous content type reference '${reference.contentTypeName}' matched ${matches.length} content types.`);
  }
  const match = matches[0];
  if (!match?.id) return undefined;

  return { handle: collection.getById(match.id), info: match, warnings: [] };
}

export async function resolveListContentType(
  graphClient: GraphFI,
  graphSiteId: string,
  graphListId: string,
  reference: ContentTypeReference
): Promise<ResolvedContentType | undefined> {
  const collection = graphClient.sites.getById(graphSiteId).lists.getById(graphListId).contentTypes;

  if (reference.contentTypeId) {
    const handle = collection.getById(reference.contentTypeId);
    const info = await handle();
    const warnings = reference.contentTypeName && info.name && info.name !== reference.contentTypeName
      ? [buildContentTypeNameMismatchWarning(reference.contentTypeName, info.name, reference.contentTypeId)]
      : [];
    return { handle, info, warnings };
  }

  if (!reference.contentTypeName) return undefined;

  const all = await collection();
  const matches = all.filter((contentType) => contentType.name === reference.contentTypeName);
  if (matches.length > 1) {
    throw new Error(`Ambiguous list content type reference '${reference.contentTypeName}' matched ${matches.length} content types.`);
  }
  const match = matches[0];
  if (!match?.id) return undefined;

  return { handle: collection.getById(match.id), info: match, warnings: [] };
}
```

- [ ] **Step 5: Add content type column helper**

Create `content-type-columns.ts`:

```ts
import type { ColumnDefinition } from "@microsoft/microsoft-graph-types";
import type { GraphFI } from "@pnp/graph";
import type { IColumn } from "@pnp/graph/columns";
import type { IContentType } from "@pnp/graph/content-types";

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

export async function resolveSiteColumn(
  graphClient: GraphFI,
  graphSiteId: string,
  reference: FieldReference
): Promise<{ id: string; info: ColumnDefinition; handle: IColumn }> {
  const columns = graphClient.sites.getById(graphSiteId).columns;

  if (reference.fieldId) {
    const handle = columns.getById(reference.fieldId);
    const info = await handle();
    if (!info.id) throw new Error(`Graph site column '${reference.fieldId}' did not return an id.`);
    return { id: info.id, info, handle };
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
```

- [ ] **Step 6: Add barrel export**

Create `domains/content-types/index.ts`:

```ts
export { normalizeGraphContentTypeError } from "./content-type-errors";
export type { GraphPermissionErrorInfo } from "./content-type-errors";
export { getContentTypeReferenceResource, buildContentTypeNameMismatchWarning } from "./content-type-reference";
export type { ContentTypeReference } from "./content-type-reference";
export { resolveGraphSiteTarget, resolveGraphListTarget } from "./content-type-graph-resolution";
export type { GraphSharePointTarget } from "./content-type-graph-resolution";
export { resolveSiteContentType, resolveListContentType } from "./content-type-lookup";
export type { ResolvedContentType } from "./content-type-lookup";
export { resolveSiteColumn, getContentTypeColumn, buildContentTypeColumnPatch, updateContentTypeColumnSettings } from "./content-type-columns";
export type { ContentTypeColumnSettings, FieldReference } from "./content-type-columns";
```

- [ ] **Step 7: Checkpoint**

Run:

```bash
rg -n "TODO|TBD|as never|Graph site resolution|Ambiguous" packages/m365-actionable-provisioning/src/actions/sharepoint/domains/content-types
```

Expected: no `TODO`, `TBD`, or `as never`. `Graph site resolution` and `Ambiguous` may appear in intentional error messages.

## Task 5: Add Content Type Action Schemas And Modules

**Files:**
- Create `schema.ts` files under `packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/**` in dependency-safe order: field schemas first, list binding schemas next, `modifySPContentType`/`deleteSPContentType` next, and `createSPContentType` only after `content-type-subactions-schema.ts` exists
- Defer all `packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/**/index.ts` files until the matching `action.ts` exists in Tasks 6, 7, and 8
- Defer `packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/index.ts` until all eight action modules exist
- Defer `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/content-type-subactions-schema.ts` until the three field-to-content-type action modules exist
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/provisioning-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/site-subactions-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts`

Task 5 records all schema contents, but execution must respect the dependency order above. Do not create module indexes, barrels, or registry imports in this task. Those files must be created in the implementation tasks after the concrete action classes exist.

- [ ] **Step 1: Record `createSPContentType` schema for after content type subaction composition exists**

Create `create-sp-content-type/schema.ts` only after Task 7 creates `content-type-subactions-schema.ts`:

```ts
import { z } from "zod";

import { subactionsOf } from "../../_shared/schemas/action-schemas";
import { contentTypeSubactionSchema } from "../../_composition/content-type-subactions-schema";
import { graphTargetSchema } from "../_shared/reference-schema";

export const createSPContentTypeSchema = graphTargetSchema.extend({
  verb: z.literal("createSPContentType"),
  name: z.string().min(1),
  parentId: z.string().min(1),
  description: z.string().optional(),
  group: z.string().optional(),
  subactions: subactionsOf(contentTypeSubactionSchema),
});

export type CreateSPContentTypePayload = z.infer<typeof createSPContentTypeSchema>;
```

- [ ] **Step 2: Add `modifySPContentType` schema**

Create `modify-sp-content-type/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema, graphTargetSchema } from "../_shared/reference-schema";

export const modifySPContentTypeSchema = graphTargetSchema
  .merge(contentTypeReferenceSchema)
  .extend({
    verb: z.literal("modifySPContentType"),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    group: z.string().optional(),
    subactions: leafSubactionsSchema,
  });

export type ModifySPContentTypePayload = z.infer<typeof modifySPContentTypeSchema>;
```

- [ ] **Step 3: Add `deleteSPContentType` schema**

Create `delete-sp-content-type/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema, graphTargetSchema } from "../_shared/reference-schema";

export const deleteSPContentTypeSchema = graphTargetSchema
  .merge(contentTypeReferenceSchema)
  .extend({
    verb: z.literal("deleteSPContentType"),
    subactions: leafSubactionsSchema,
  });

export type DeleteSPContentTypePayload = z.infer<typeof deleteSPContentTypeSchema>;
```

- [ ] **Step 4: Add content type field schemas**

Create `add-sp-field-to-content-type/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { fieldReferenceSchema } from "../_shared/reference-schema";

export const addSPFieldToContentTypeSchema = fieldReferenceSchema.extend({
  verb: z.literal("addSPFieldToContentType"),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  displayName: z.string().min(1).optional(),
  subactions: leafSubactionsSchema,
});

export type AddSPFieldToContentTypePayload = z.infer<typeof addSPFieldToContentTypeSchema>;
```

Create `modify-sp-content-type-field/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { fieldReferenceSchema } from "../_shared/reference-schema";

export const modifySPContentTypeFieldSchema = fieldReferenceSchema.extend({
  verb: z.literal("modifySPContentTypeField"),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  displayName: z.string().min(1).optional(),
  subactions: leafSubactionsSchema,
});

export type ModifySPContentTypeFieldPayload = z.infer<typeof modifySPContentTypeFieldSchema>;
```

Create `remove-sp-field-from-content-type/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { fieldReferenceSchema } from "../_shared/reference-schema";

export const removeSPFieldFromContentTypeSchema = fieldReferenceSchema.extend({
  verb: z.literal("removeSPFieldFromContentType"),
  subactions: leafSubactionsSchema,
});

export type RemoveSPFieldFromContentTypePayload = z.infer<typeof removeSPFieldFromContentTypeSchema>;
```

- [ ] **Step 5: Add list binding schemas**

Create `add-sp-content-type-to-list/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema } from "../_shared/reference-schema";

export const addSPContentTypeToListSchema = contentTypeReferenceSchema.extend({
  verb: z.literal("addSPContentTypeToList"),
  subactions: leafSubactionsSchema,
});

export type AddSPContentTypeToListPayload = z.infer<typeof addSPContentTypeToListSchema>;
```

Create `remove-sp-content-type-from-list/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema } from "../_shared/reference-schema";

export const removeSPContentTypeFromListSchema = contentTypeReferenceSchema.extend({
  verb: z.literal("removeSPContentTypeFromList"),
  subactions: leafSubactionsSchema,
});

export type RemoveSPContentTypeFromListPayload = z.infer<typeof removeSPContentTypeFromListSchema>;
```

- [ ] **Step 6: Record module index pattern for later tasks**

When Tasks 6, 7, and 8 create each `action.ts`, create the matching `index.ts` in the same step using this pattern:

```ts
import { defineSharePointActionModule } from "../../action-module";

import { CreateSPContentTypeAction } from "./action";
import { createSPContentTypeSchema } from "./schema";

export { CreateSPContentTypeAction } from "./action";
export { createSPContentTypeSchema, type CreateSPContentTypePayload } from "./schema";

export const createSPContentTypeActionModule = defineSharePointActionModule({
  verb: "createSPContentType",
  schema: createSPContentTypeSchema,
  definition: new CreateSPContentTypeAction(),
  placements: ["root", "siteSubaction"] as const,
});
```

Use these placement values:

```text
createSPContentType: ["root", "siteSubaction"]
modifySPContentType: ["root", "siteSubaction"]
deleteSPContentType: ["root", "siteSubaction"]
addSPFieldToContentType: ["contentTypeSubaction"]
modifySPContentTypeField: ["contentTypeSubaction"]
removeSPFieldFromContentType: ["contentTypeSubaction"]
addSPContentTypeToList: ["listSubaction"]
removeSPContentTypeFromList: ["listSubaction"]
```

- [ ] **Step 7: Defer content types barrel**

Do not create `content-types/index.ts` yet. Create it after all eight action folder indexes exist:

```ts
export { createSPContentTypeActionModule, CreateSPContentTypeAction, createSPContentTypeSchema, type CreateSPContentTypePayload } from "./create-sp-content-type";
export { modifySPContentTypeActionModule, ModifySPContentTypeAction, modifySPContentTypeSchema, type ModifySPContentTypePayload } from "./modify-sp-content-type";
export { deleteSPContentTypeActionModule, DeleteSPContentTypeAction, deleteSPContentTypeSchema, type DeleteSPContentTypePayload } from "./delete-sp-content-type";
export { addSPFieldToContentTypeActionModule, AddSPFieldToContentTypeAction, addSPFieldToContentTypeSchema, type AddSPFieldToContentTypePayload } from "./add-sp-field-to-content-type";
export { modifySPContentTypeFieldActionModule, ModifySPContentTypeFieldAction, modifySPContentTypeFieldSchema, type ModifySPContentTypeFieldPayload } from "./modify-sp-content-type-field";
export { removeSPFieldFromContentTypeActionModule, RemoveSPFieldFromContentTypeAction, removeSPFieldFromContentTypeSchema, type RemoveSPFieldFromContentTypePayload } from "./remove-sp-field-from-content-type";
export { addSPContentTypeToListActionModule, AddSPContentTypeToListAction, addSPContentTypeToListSchema, type AddSPContentTypeToListPayload } from "./add-sp-content-type-to-list";
export { removeSPContentTypeFromListActionModule, RemoveSPContentTypeFromListAction, removeSPContentTypeFromListSchema, type RemoveSPContentTypeFromListPayload } from "./remove-sp-content-type-from-list";
```

- [ ] **Step 8: Defer composition and registration until action files exist**

Do not create `content-type-subactions-schema.ts` until Task 7 has created the three field-to-content-type action modules. When creating it, keep it module-driven:

```ts
import { z } from "zod";

import { addSPFieldToContentTypeActionModule } from "../content-types/add-sp-field-to-content-type";
import { modifySPContentTypeFieldActionModule } from "../content-types/modify-sp-content-type-field";
import { removeSPFieldFromContentTypeActionModule } from "../content-types/remove-sp-field-from-content-type";

const contentTypeSubactionSchemas = [
  addSPFieldToContentTypeActionModule.schema,
  modifySPContentTypeFieldActionModule.schema,
  removeSPFieldFromContentTypeActionModule.schema,
] as const;

export const contentTypeSubactionSchema = z.discriminatedUnion("verb", contentTypeSubactionSchemas);
```

After Tasks 6, 7, and 8 create the real action classes, indexes, content type barrel, and content type subaction composition file:

Update `action-modules.ts` to import all content type action modules and insert them after site/list modules and before field modules.

Update `provisioning-schema.ts` root schema to include:

```ts
createSPContentTypeActionModule.schema,
modifySPContentTypeActionModule.schema,
deleteSPContentTypeActionModule.schema,
```

Update `site-subactions-schema.ts` to include the same three site content type schemas.

Update `list-subactions-schema.ts` to include:

```ts
addSPContentTypeToListActionModule.schema,
removeSPContentTypeFromListActionModule.schema,
```

Update `schemas.ts` to export all new public schemas and `contentTypeSubactionSchema`.

Do not run build until Tasks 6, 7, and 8 create the action classes referenced by the module indexes and `content-type-subactions-schema.ts`.

## Task 6: Implement Site Content Type Actions

**Files:**
- Create: `create-sp-content-type/action.ts`
- Create: `create-sp-content-type/index.ts`
- Create: `modify-sp-content-type/action.ts`
- Create: `modify-sp-content-type/index.ts`
- Create: `delete-sp-content-type/action.ts`
- Create: `delete-sp-content-type/index.ts`

- [ ] **Step 1: Implement `createSPContentType`**

Required behavior:

```ts
readonly requiredClients = ["graphClient"] as const;
```

Handler flow:

```ts
const graphClient = ctx.clients.graphClient;
if (!graphClient) throw new Error("GraphFI instance not available in scope");
const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, ctx.action.payload);
const existing = await resolveSiteContentType(graphClient, target.graphSiteId, { contentTypeName: payload.name });
if (existing) {
  return actionSkipped(payload.name, "already_exists", {
    contentType: existing.handle,
    contentTypeId: existing.info.id,
    contentTypeName: existing.info.name,
    graphSiteId: target.graphSiteId,
  }, existing.warnings);
}
const created = await graphClient.sites.getById(target.graphSiteId).contentTypes.add({
  name: payload.name,
  description: payload.description,
  group: payload.group,
  base: { id: payload.parentId },
});
return actionExecuted(payload.name, {
  contentType: created.contentType,
  contentTypeId: created.data.id,
  contentTypeName: created.data.name ?? payload.name,
  graphSiteId: target.graphSiteId,
});
```

Compliance flow:

- missing `graphClient`: `unverifiable` missing prerequisite
- not found by exact name: `non_compliant/not_found`
- parent mismatch readable: `non_compliant/parent_mismatch`
- found and parent compatible or parent unreadable: `compliant` with `scopeDelta`

- [ ] **Step 2: Implement `modifySPContentType`**

Handler flow:

```ts
const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, payload);
if (!resolved) return actionSkipped(getContentTypeReferenceResource(payload), "not_found");
await resolved.handle.update({
  ...(payload.name !== undefined ? { name: payload.name } : {}),
  ...(payload.description !== undefined ? { description: payload.description } : {}),
  ...(payload.group !== undefined ? { group: payload.group } : {}),
});
return actionExecuted(payload.name ?? payload.contentTypeName ?? payload.contentTypeId ?? "(content type)", {
  contentType: resolved.handle,
  contentTypeId: resolved.info.id,
  contentTypeName: payload.name ?? resolved.info.name,
  graphSiteId: target.graphSiteId,
}, resolved.warnings);
```

Compliance compares only supplied mutable fields and returns `non_compliant/mismatch` with `details.mismatches`.

- [ ] **Step 3: Implement `deleteSPContentType`**

Handler flow:

```ts
const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, payload);
if (!resolved) return actionSkipped(getContentTypeReferenceResource(payload), "not_found");
await resolved.handle.delete();
return actionExecuted(getContentTypeReferenceResource(payload), undefined, resolved.warnings);
```

Wrap Graph delete errors with `normalizeGraphContentTypeError`. For 401/403 rethrow with the normalized message. For sealed/in-use errors, use a clear message containing `deleteSPContentType` and the resource.

- [ ] **Step 4: Create site action module indexes**

Create the three site content type action folder `index.ts` files using the Task 5 module pattern with these placements:

```ts
placements: ["root", "siteSubaction"] as const,
```

Do not add these modules to `action-modules.ts`, `provisioning-schema.ts`, or `site-subactions-schema.ts` until Task 8, after all eight action modules exist.

- [ ] **Step 5: Validate**

Run:

```bash
git diff -- packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/create-sp-content-type packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/delete-sp-content-type
rg -n "TODO|TBD|not implemented|as never|setSPListDefaultContentType" packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/create-sp-content-type packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/modify-sp-content-type packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/delete-sp-content-type
```

Expected: diff shows real action classes and module indexes; search returns no placeholder text, no `as never`, and no default-content-type registration. Build waits until Tasks 7 and 8 finish the remaining action modules and composition.

## Task 7: Implement Content Type Field Actions

**Files:**
- Create: `add-sp-field-to-content-type/action.ts`
- Create: `add-sp-field-to-content-type/index.ts`
- Create: `modify-sp-content-type-field/action.ts`
- Create: `modify-sp-content-type-field/index.ts`
- Create: `remove-sp-field-from-content-type/action.ts`
- Create: `remove-sp-field-from-content-type/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/content-type-subactions-schema.ts`

- [ ] **Step 1: Implement `addSPFieldToContentType`**

Handler flow:

```ts
const graphClient = ctx.clients.graphClient;
if (!graphClient) throw new Error("GraphFI instance not available in scope");
const graphSiteId = typeof ctx.scopeIn.graphSiteId === "string" ? ctx.scopeIn.graphSiteId : undefined;
const contentType = ctx.scopeIn.contentType;
if (!graphSiteId || !contentType) {
  return actionSkipped(ctx.action.payload.fieldId ?? ctx.action.payload.fieldName ?? "(field)", "missing_prerequisite");
}
const existing = await getContentTypeColumn(contentType, ctx.action.payload);
if (existing) {
  return actionSkipped(ctx.action.payload.fieldName ?? ctx.action.payload.fieldId ?? existing.id ?? "(field)", "already_exists");
}
const siteColumn = await resolveSiteColumn(graphClient, graphSiteId, ctx.action.payload);
const added = await contentType.columns.addRef(siteColumn.handle);
if (added.id) {
  await updateContentTypeColumnSettings(contentType, added.id, ctx.action.payload);
}
return actionExecuted(ctx.action.payload.fieldName ?? ctx.action.payload.fieldId ?? siteColumn.id);
```

After add, if `required`, `hidden`, `readOnly`, or `displayName` are supplied, call `updateContentTypeColumnSettings`. If the add succeeds but the update fails, return `executed` with a warning that includes the normalized Graph error.

- [ ] **Step 2: Implement `modifySPContentTypeField`**

Handler flow:

```ts
const contentType = ctx.scopeIn.contentType;
if (!contentType) return actionSkipped(resource, "missing_prerequisite");
const existing = await getContentTypeColumn(contentType, payload);
if (!existing?.id) return actionSkipped(resource, "not_found");
await updateContentTypeColumnSettings(contentType, existing.id, payload);
return actionExecuted(resource);
```

Compliance reports mismatch for supplied properties only.

- [ ] **Step 3: Implement `removeSPFieldFromContentType`**

Handler flow:

```ts
const existing = await getContentTypeColumn(contentType, payload);
if (!existing?.id) return actionSkipped(resource, "not_found");
await contentType.columns.getById(existing.id).delete();
return actionExecuted(resource);
```

Compliance returns compliant when missing and non_compliant when present.

- [ ] **Step 4: Create field action module indexes and content type subaction composition**

Create each field action folder `index.ts` using the Task 5 module pattern with these placements:

```ts
placements: ["contentTypeSubaction"] as const,
```

Then create `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/content-type-subactions-schema.ts` exactly as shown in Task 5 Step 8. This file must import the field action modules, not the raw field schemas.

- [ ] **Step 5: Validate field action schemas**

Add smoke assertions in Task 9, then run smoke/build there. Do not register the content type action modules globally yet.

## Task 8: Implement List Content Type Binding Actions

**Files:**
- Create: `add-sp-content-type-to-list/action.ts`
- Create: `add-sp-content-type-to-list/index.ts`
- Create: `remove-sp-content-type-from-list/action.ts`
- Create: `remove-sp-content-type-from-list/index.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts`

- [ ] **Step 1: Propagate list metadata from `createSPList`**

In `create-sp-list/action.ts`, include these scope fields in every `scopeDelta` that currently returns `web` and `list`: compliance found-list returns, runtime already-exists returns, and runtime created-list returns.

```ts
webUrl: resolvedWebUrl,
listName,
```

Do not add Graph ids here unless a helper can resolve them without extra Graph calls. The list binding actions must use `resolveGraphListTarget` to turn `webUrl` + `listName` into Graph IDs when `graphSiteId`/`graphListId` are absent.

- [ ] **Step 2: Implement `addSPContentTypeToList`**

Handler flow:

```ts
const graphClient = ctx.clients.graphClient;
if (!graphClient) throw new Error("GraphFI instance not available in scope");
const target = await resolveGraphListTarget(graphClient, ctx.scopeIn, ctx.action.payload);
const siteContentType = await resolveSiteContentType(graphClient, target.graphSiteId, ctx.action.payload);
if (!siteContentType) return actionSkipped(getContentTypeReferenceResource(ctx.action.payload), "missing_prerequisite");
const existing = await resolveListContentType(graphClient, target.graphSiteId, target.graphListId, ctx.action.payload);
if (existing) return actionSkipped(getContentTypeReferenceResource(ctx.action.payload), "already_exists", undefined, existing.warnings);
const added = await graphClient.sites.getById(target.graphSiteId).lists.getById(target.graphListId).contentTypes.addCopy(siteContentType.handle);
return actionExecuted(added.data.name ?? getContentTypeReferenceResource(ctx.action.payload), {
  graphSiteId: target.graphSiteId,
  graphListId: target.graphListId,
}, siteContentType.warnings);
```

If Graph reports that content types are disabled on the list, use `spfi` only when available to enable `ContentTypesEnabled`; otherwise rethrow a normalized error. Document this branch in code comments.

- [ ] **Step 3: Implement `removeSPContentTypeFromList`**

Handler flow:

```ts
const target = await resolveGraphListTarget(graphClient, ctx.scopeIn, ctx.action.payload);
const existing = await resolveListContentType(graphClient, target.graphSiteId, target.graphListId, ctx.action.payload);
if (!existing) return actionSkipped(getContentTypeReferenceResource(ctx.action.payload), "not_found");
await existing.handle.delete();
return actionExecuted(getContentTypeReferenceResource(ctx.action.payload), undefined, existing.warnings);
```

If Graph rejects because the content type is default or in use, rethrow a clear normalized error. Do not force delete.

- [ ] **Step 4: Compliance**

For `addSPContentTypeToList`, compliance is compliant when `resolveListContentType` finds the target list content type; otherwise non_compliant/not_found.

For `removeSPContentTypeFromList`, compliance is compliant when missing; otherwise non_compliant/still_present.

- [ ] **Step 5: Create list binding module indexes**

Create the two list binding action folder `index.ts` files using the Task 5 module pattern with these placements:

```ts
placements: ["listSubaction"] as const,
```

- [ ] **Step 6: Create content types barrel and register schemas/modules**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/content-types/index.ts` exactly as shown in Task 5 Step 7.

Then perform the Task 5 Step 8 registration updates:

- `action-modules.ts` imports all eight content type action modules and includes them in `sharePointActionModules`.
- `provisioning-schema.ts` includes only the three root/site content type schemas at root.
- `site-subactions-schema.ts` includes only the three site content type schemas.
- `list-subactions-schema.ts` includes only `addSPContentTypeToList` and `removeSPContentTypeFromList`.
- `schemas.ts` exports the new public schemas and `contentTypeSubactionSchema`.

Do not import, export, register, or document a `setSPListDefaultContentTypeActionModule`.

## Task 9: Smoke Tests And Schema Guardrails

**Files:**
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Import new schemas**

Add:

```ts
import { contentTypeSubactionSchema } from "../src/actions/sharepoint/_composition/content-type-subactions-schema";
```

- [ ] **Step 2: Add catalog schema assertions**

Inside `assertSharePointCatalogComposition()`, add:

```ts
  const rootContentType = sharePointActionsSchema.safeParse([
    {
      verb: "createSPContentType",
      name: "Smoke Document",
      parentId: "0x0101",
    },
  ]);
  assert(rootContentType.success, "SharePoint root schema should accept createSPContentType");

  const contentTypeField = contentTypeSubactionSchema.safeParse({
    verb: "addSPFieldToContentType",
    fieldName: "SmokeText",
  });
  assert(contentTypeField.success, "Content type subaction schema should accept addSPFieldToContentType");

  const nestedContentType = siteSubactionSchema.safeParse({
    verb: "createSPContentType",
    name: "Smoke Nested Document",
    parentId: "0x0101",
    subactions: [
      {
        verb: "addSPFieldToContentType",
        fieldName: "SmokeText",
      },
    ],
  });
  assert(nestedContentType.success, "SharePoint site subaction schema should accept content type actions with field subactions");

  const listContentTypeBinding = listSubactionSchema.safeParse({
    verb: "addSPContentTypeToList",
    contentTypeName: "Smoke Document",
  });
  assert(listContentTypeBinding.success, "SharePoint list subaction schema should accept content type binding");

  const defaultContentType = listSubactionSchema.safeParse({
    verb: "setSPListDefaultContentType",
    contentTypeName: "Smoke Document",
  });
  assert(!defaultContentType.success, "SharePoint list subaction schema should not expose setSPListDefaultContentType until its spike passes");
```

- [ ] **Step 3: Add action module order assertion**

Extend the existing module/definition order assertion only if new modules are included in `sharePointActionModules`. Expected verbs must include the eight V1 content type verbs and must not include `setSPListDefaultContentType`.

- [ ] **Step 4: Run smoke/build**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

## Task 10: Documentation

**Files:**
- Modify: `packages/m365-actionable-provisioning/README.md`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/README.md`
- Modify: `docs/provisioning-schema.md`

- [ ] **Step 1: Add package README content type section**

Add a `## Content Types` section:

````md
## Content Types

Content type actions use Microsoft Graph through `graphClient`. Consumer applications must configure Microsoft Graph `Sites.Manage.All` or a higher permission such as `Sites.FullControl.All`.

SPFx packages typically need:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Sites.Manage.All"
  }
]
```

The engine does not inspect token claims. Missing Graph clients are caught during preflight; insufficient Graph permissions are reported when Graph returns `401` or `403`.
````

- [ ] **Step 2: Add schema docs examples**

In `docs/provisioning-schema.md`, add examples for:

```ts
{
  verb: "createSPSiteColumn",
  fieldType: "Text",
  fieldName: "CustomerCode",
  displayName: "Customer Code"
},
{
  verb: "createSPContentType",
  name: "Customer Document",
  parentId: "0x0101",
  subactions: [
    {
      verb: "addSPFieldToContentType",
      fieldName: "CustomerCode",
      required: true
    }
  ]
}
```

and:

```ts
{
  verb: "createSPList",
  listName: "documents",
  title: "Documents",
  template: 101,
  enableContentTypes: true,
  subactions: [
    {
      verb: "addSPContentTypeToList",
      contentTypeName: "Customer Document"
    }
  ]
}
```

Explicitly state that `setSPListDefaultContentType` is not registered in V1.

- [ ] **Step 3: Run docs/schema sanity search**

Run:

```bash
rg -n "Sites.Manage.All|createSPContentType|addSPFieldToContentType|addSPContentTypeToList|setSPListDefaultContentType" packages/m365-actionable-provisioning/README.md packages/m365-actionable-provisioning/src/actions/sharepoint/README.md docs/provisioning-schema.md packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
```

Expected:

- `Sites.Manage.All` appears in docs.
- `setSPListDefaultContentType` appears only as not registered / spike-gated text or negative smoke assertion.

## Task 11: Final Validation

**Files:**
- Review all files changed by this plan.

- [ ] **Step 1: Run package validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 2: Run root build**

Run:

```bash
npm run build
```

Expected: exit code `0`. If this fails because of unrelated SPFx environment noise, record the exact failure and keep the M365 package smoke/build as the package acceptance gate.

- [ ] **Step 3: Run no-placeholder scans**

Run:

```bash
rg -n "TODO|TBD|not implemented|Action implementation is added in the next task|setSPListDefaultContentTypeActionModule" packages/m365-actionable-provisioning/src/actions/sharepoint packages/m365-actionable-provisioning/scripts docs/provisioning-schema.md packages/m365-actionable-provisioning/README.md
```

Expected: no matches for temporary implementation text or registered default-content-type action.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git diff --stat
git diff --check
```

Expected: `git diff --check` exits `0`.

- [ ] **Step 5: Review checkpoint**

Do not commit. Summarize:

- files changed
- validation commands and results
- whether `setSPListDefaultContentType` remained unregistered
- any tenant-only behavior still requiring manual validation

## Final Acceptance Criteria

- `contentTypeSubaction` placement exists and is used by field-to-content-type actions.
- `createSPContentType`, `modifySPContentType`, and `deleteSPContentType` are valid root and site subactions.
- `addSPFieldToContentType`, `modifySPContentTypeField`, and `removeSPFieldFromContentType` are valid only under content type subactions.
- `addSPContentTypeToList` and `removeSPContentTypeFromList` are valid list subactions.
- `setSPListDefaultContentType` is not registered in V1.
- Content type actions require `graphClient`.
- No token claim inspection is added.
- Graph 401/403 errors are normalized with `Sites.Manage.All` / `Sites.FullControl.All` remediation text.
- Field-to-content-type actions require existing site columns.
- `createSPContentType` does not accept or generate a custom content type id.
- `contentTypeId` wins over `contentTypeName` for reference actions.
- Ambiguous name references are not silently accepted.
- Docs include Graph permission requirements and examples.
- Smoke and package build pass.
