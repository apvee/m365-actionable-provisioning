# SharePoint Navigation Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SharePoint navigation node provisioning as site-scoped actions usable under `createSPSite` and `modifySPSite`.

**Architecture:** Navigation is a new SharePoint action family with three leaf actions: `createSPNavigationNode`, `modifySPNavigationNode`, and `deleteSPNavigationNode`. The actions are registered only as `siteSubaction` actions, so plans apply navigation through `createSPSite.subactions` or `modifySPSite.subactions`. The implementation uses PnPjs web navigation collections directly and exposes the standard PnPjs location names: `quicklaunch` and `topNavigationBar`.

**Tech Stack:** TypeScript, Zod, PnPjs `@pnp/sp/navigation`, existing SharePoint action-module registry, existing smoke harness in `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`.

---

## Scope Decision

Use site subactions, not inline site payload properties.

Accepted:

```ts
{
  verb: "modifySPSite",
  siteUrl: "https://contoso.sharepoint.com/sites/demo",
  subactions: [
    {
      verb: "createSPNavigationNode",
      location: "quicklaunch",
      title: "Orders",
      url: "/sites/demo/Lists/Orders/AllItems.aspx"
    }
  ]
}
```

Rejected:

```ts
{
  verb: "modifySPSite",
  siteUrl: "https://contoso.sharepoint.com/sites/demo",
  navigation: [
    {
      location: "quicklaunch",
      title: "Orders",
      url: "/sites/demo/Lists/Orders/AllItems.aspx"
    }
  ]
}
```

Reason: the repo already models provisioning behavior as composable actions. `createSPSite` and `modifySPSite` already compose `siteSubactionSchema`, propagate `web`/`site` scope, and the engine executes subactions after parent handlers even when `modifySPSite` has no direct web-property changes.

## V1 Contract

Locations:

```ts
export const spNavigationLocationSchema = z.enum(["quicklaunch", "topNavigationBar"]);
export type SPNavigationLocation = z.infer<typeof spNavigationLocationSchema>;
```

Actions:

```ts
{
  verb: "createSPNavigationNode";
  location: "quicklaunch" | "topNavigationBar";
  title: string;
  url: string;
  isVisible?: boolean;
  subactions?: never[];
}
```

```ts
{
  verb: "modifySPNavigationNode";
  location: "quicklaunch" | "topNavigationBar";
  title: string;
  newTitle?: string;
  url?: string;
  isVisible?: boolean;
  subactions?: never[];
}
```

```ts
{
  verb: "deleteSPNavigationNode";
  location: "quicklaunch" | "topNavigationBar";
  title: string;
  subactions?: never[];
}
```

V1 exclusions:

- No root-level navigation actions.
- No list-level navigation actions.
- No footer support.
- No child navigation nodes.
- No `moveAfter` or ordering guarantees.
- No audience targeting.
- No duplicate-title mutation.

## File Structure

Create:

- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/_shared/schema.ts`
  Owns `location`, `title`, `url`, and shared mutable-state schemas.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/_shared/scope.ts`
  Owns web-scope prerequisites, ManageWeb permission probing, and scope delta helpers.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/index.ts`
  Re-exports navigation domain helpers.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/navigation-node-lookup.ts`
  Resolves a root navigation node by `location + title` and detects duplicate titles.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/navigation-node-props.ts`
  Maps payload fields to PnPjs update props and compares desired vs actual state.
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/action.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/action.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/action.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/index.ts`

Modify:

- `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/site-subactions-schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`
- `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`
- `apps/test-spfx/src/webparts/testProvisioning/test-plans/demo-plans.ts`

Do not modify:

- `packages/m365-actionable-provisioning/src/actions/sharepoint/provisioning-schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/sites/create-sp-site/schema.ts`
- `packages/m365-actionable-provisioning/src/actions/sharepoint/sites/modify-sp-site/schema.ts`

---

### Task 1: Add Navigation Schemas And Domain Helpers

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/_shared/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/navigation-node-lookup.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/navigation-node-props.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/index.ts`
- Test: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add failing smoke imports and schema assertions**

Add imports for the future schemas near the existing list-view imports:

```ts
import {
  createSPNavigationNodeSchema,
  deleteSPNavigationNodeSchema,
  modifySPNavigationNodeSchema,
} from "../src/actions/sharepoint/navigation";
```

Add a smoke function:

```ts
function assertSharePointNavigationSchemas(): void {
  const create = createSPNavigationNodeSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo/Lists/Orders/AllItems.aspx",
  });
  assert(create.success, "createSPNavigationNode schema should accept quicklaunch root nodes");

  const modify = modifySPNavigationNodeSchema.safeParse({
    verb: "modifySPNavigationNode",
    location: "topNavigationBar",
    title: "Orders",
    newTitle: "Customer Orders",
    url: "/sites/demo/SitePages/Orders.aspx",
    isVisible: false,
  });
  assert(modify.success, "modifySPNavigationNode schema should accept topNavigationBar mutable state");

  const del = deleteSPNavigationNodeSchema.safeParse({
    verb: "deleteSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
  });
  assert(del.success, "deleteSPNavigationNode schema should accept title and location");

  const footer = createSPNavigationNodeSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "site-footer",
    title: "Footer",
    url: "/sites/demo",
  });
  assert(!footer.success, "navigation schema should reject unsupported footer location");

  const nested = createSPNavigationNodeSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo",
    subactions: [{ verb: "deleteSPList", name: "Orders" }],
  });
  assert(!nested.success, "navigation node actions should reject nested subactions");
}
```

Call `assertSharePointNavigationSchemas()` from the smoke `main` sequence.

- [ ] **Step 2: Run smoke and verify it fails**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL because `../src/actions/sharepoint/navigation` does not exist.

- [ ] **Step 3: Create shared navigation schema**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/_shared/schema.ts`:

```ts
import { z } from "zod";

export const spNavigationLocationSchema = z.enum(["quicklaunch", "topNavigationBar"]);
export type SPNavigationLocation = z.infer<typeof spNavigationLocationSchema>;

export const spNavigationNodeTitleSchema = z
  .string()
  .trim()
  .min(1, "Navigation node title cannot be empty")
  .max(255, "Navigation node title cannot exceed 255 characters");

export const spNavigationNodeUrlSchema = z
  .string()
  .trim()
  .min(1, "Navigation node URL cannot be empty")
  .max(2048, "Navigation node URL cannot exceed 2048 characters");

export const spNavigationNodeMutableStateSchema = {
  url: spNavigationNodeUrlSchema.optional(),
  isVisible: z.boolean().optional(),
} as const;
```

- [ ] **Step 4: Create navigation domain lookup helper**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/navigation-node-lookup.ts`:

```ts
import type { IWeb } from "@pnp/sp/webs/types";
import type { SPNavigationLocation } from "../../navigation/_shared/schema";
import "@pnp/sp/navigation";

export type NavigationNodeInfo = {
  Id: number;
  Title: string;
  Url?: string;
  IsVisible?: boolean;
};

export type NavigationNodeLookupResult =
  | { kind: "missing" }
  | { kind: "found"; node: NavigationNodeInfo }
  | { kind: "ambiguous"; matches: readonly NavigationNodeInfo[] };

export function getNavigationCollection(web: IWeb, location: SPNavigationLocation) {
  return location === "quicklaunch"
    ? web.navigation.quicklaunch
    : web.navigation.topNavigationBar;
}

export async function getNavigationNodeInfoByTitle(
  web: IWeb,
  location: SPNavigationLocation,
  title: string
): Promise<NavigationNodeLookupResult> {
  const nodes = await getNavigationCollection(web, location)();
  const matches = nodes
    .filter((node) => node.Title === title)
    .map((node) => ({
      Id: node.Id,
      Title: node.Title,
      Url: node.Url,
      IsVisible: node.IsVisible,
    }));

  if (matches.length === 0) return { kind: "missing" };
  if (matches.length > 1) return { kind: "ambiguous", matches };
  return { kind: "found", node: matches[0] };
}
```

- [ ] **Step 5: Create navigation prop helper**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/navigation-node-props.ts`:

```ts
import type { INavNodeInfo } from "@pnp/sp/navigation";
import { pickDefined } from "../../utils/object-utils";

export type NavigationNodeMutablePayload = {
  newTitle?: string;
  url?: string;
  isVisible?: boolean;
};

export type NavigationNodeUpdateProps = Partial<Pick<INavNodeInfo, "Title" | "Url" | "IsVisible">>;

export function buildNavigationNodeUpdateProps(payload: NavigationNodeMutablePayload): NavigationNodeUpdateProps {
  return pickDefined({
    Title: payload.newTitle,
    Url: payload.url,
    IsVisible: payload.isVisible,
  });
}

export function getNavigationNodeMismatches(
  expected: NavigationNodeMutablePayload,
  actual: { Title?: string; Url?: string; IsVisible?: boolean }
): readonly { field: string; expected: unknown; actual: unknown }[] {
  const mismatches: { field: string; expected: unknown; actual: unknown }[] = [];
  if (expected.newTitle !== undefined && expected.newTitle !== actual.Title) {
    mismatches.push({ field: "Title", expected: expected.newTitle, actual: actual.Title });
  }
  if (expected.url !== undefined && expected.url !== actual.Url) {
    mismatches.push({ field: "Url", expected: expected.url, actual: actual.Url });
  }
  if (expected.isVisible !== undefined && expected.isVisible !== actual.IsVisible) {
    mismatches.push({ field: "IsVisible", expected: expected.isVisible, actual: actual.IsVisible });
  }
  return mismatches;
}
```

- [ ] **Step 6: Export navigation domain helpers**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/navigation/index.ts`:

```ts
export {
  getNavigationCollection,
  getNavigationNodeInfoByTitle,
  type NavigationNodeInfo,
  type NavigationNodeLookupResult,
} from "./navigation-node-lookup";
export {
  buildNavigationNodeUpdateProps,
  getNavigationNodeMismatches,
  type NavigationNodeMutablePayload,
  type NavigationNodeUpdateProps,
} from "./navigation-node-props";
```

- [ ] **Step 7: Run smoke and verify schema import still fails**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL because action schemas are not created yet.

### Task 2: Add Create Navigation Node Action

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/_shared/scope.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/index.ts`
- Test: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add failing create handler smoke**

Add a smoke function:

```ts
async function assertCreateSPNavigationNodeSkipsExistingWithoutWrites(): Promise<void> {
  let addCalled = false;
  const web = {
    navigation: {
      quicklaunch: Object.assign(
        async () => [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
        {
          add: async () => {
            addCalled = true;
            return { Id: 8 };
          },
        }
      ),
      topNavigationBar: Object.assign(async () => [], { add: async () => ({ Id: 9 }) }),
    },
  };

  const result = await new CreateSPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  } as Parameters<CreateSPNavigationNodeAction["handler"]>[0]);

  assert(result.result?.outcome === "skipped", "createSPNavigationNode should skip existing nodes");
  assert(result.result?.outcome === "skipped" && result.result.reason === "already_exists", "createSPNavigationNode should report already_exists");
  assert(!addCalled, "createSPNavigationNode should not add when title already exists");
}
```

Add the corresponding imports for `CreateSPNavigationNodeAction`.

- [ ] **Step 2: Create shared scope helper**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/_shared/scope.ts`:

```ts
import type { ComplianceActionCheckResult, ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365Clients, M365RuntimeContext, M365Scope } from "../../../../runtime";
import { PermissionKind } from "@pnp/sp/security";
import "@pnp/sp/security/web";

export function buildNavigationScopeDelta(scopeIn: M365Scope): Partial<M365Scope> {
  return {
    ...(scopeIn.site ? { site: scopeIn.site } : {}),
    ...(scopeIn.web ? { web: scopeIn.web } : {}),
    ...(scopeIn.siteUrl ? { siteUrl: scopeIn.siteUrl } : {}),
    ...(scopeIn.webUrl ? { webUrl: scopeIn.webUrl } : {}),
  };
}

export async function checkNavigationManageWebPermission<TPayload extends Record<string, unknown>>(
  ctx: M365RuntimeContext<TPayload>
): Promise<PermissionCheckResult> {
  const web = ctx.scopeIn.web;
  if (!web) {
    return { decision: "unknown", message: "Unable to verify navigation permissions without web scope" };
  }

  try {
    const canManageWeb = await web.currentUserHasPermissions(PermissionKind.ManageWeb);
    return canManageWeb
      ? { decision: "allow", message: "Permission probe passed (ManageWeb)." }
      : { decision: "deny", message: "Access denied: current user lacks Manage Web on target site." };
  } catch (e) {
    return { decision: "unknown", message: `Permission probe could not be completed. error=${String(e)}` };
  }
}

export function getNavigationCompliancePrerequisites<TPayload extends Record<string, unknown>>(
  ctx: ComplianceRuntimeContext<M365Scope, TPayload, M365Clients>,
  resource: string
): { ok: true; web: NonNullable<M365Scope["web"]> } | { ok: false; result: ComplianceActionCheckResult<M365Scope> } {
  const web = ctx.scopeIn.web;
  if (!web) {
    return {
      ok: false,
      result: {
        outcome: "unverifiable",
        resource,
        reason: "missing_prerequisite",
        message: "Web scope not available for SharePoint navigation action",
      },
    };
  }
  return { ok: true, web };
}
```

- [ ] **Step 3: Create create schema**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import {
  spNavigationLocationSchema,
  spNavigationNodeTitleSchema,
  spNavigationNodeUrlSchema,
} from "../_shared/schema";

export const createSPNavigationNodeSchema = z.object({
  verb: z.literal("createSPNavigationNode"),
  location: spNavigationLocationSchema,
  title: spNavigationNodeTitleSchema,
  url: spNavigationNodeUrlSchema,
  isVisible: z.boolean().optional(),
  subactions: leafSubactionsSchema,
}).strict();

export type CreateSPNavigationNodePayload = z.infer<typeof createSPNavigationNodeSchema>;
```

- [ ] **Step 4: Create create action**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/action.ts`:

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { getNavigationCollection, getNavigationNodeInfoByTitle, getNavigationNodeMismatches } from "../../domains/navigation";
import { buildNavigationScopeDelta, checkNavigationManageWebPermission, getNavigationCompliancePrerequisites } from "../_shared/scope";
import { createSPNavigationNodeSchema, type CreateSPNavigationNodePayload } from "./schema";
import "@pnp/sp/navigation";

export class CreateSPNavigationNodeAction extends ActionDefinition<
  "createSPNavigationNode",
  typeof createSPNavigationNodeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPNavigationNode";
  readonly actionSchema = createSPNavigationNodeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPNavigationNodePayload>): Promise<PermissionCheckResult> {
    return checkNavigationManageWebPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<CreateSPNavigationNodePayload>): Promise<M365ActionResult> {
    const web = ctx.scopeIn.web;
    const payload = ctx.action.payload;
    if (!web) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getNavigationNodeInfoByTitle(web, payload.location, payload.title);
    if (existing.kind === "found") return actionSkipped(payload.title, "already_exists", buildNavigationScopeDelta(ctx.scopeIn));
    if (existing.kind === "ambiguous") return actionSkipped(payload.title, "ambiguous", buildNavigationScopeDelta(ctx.scopeIn));

    await getNavigationCollection(web, payload.location).add(payload.title, payload.url, payload.isVisible ?? true);
    return actionExecuted(payload.title, buildNavigationScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPNavigationNodePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getNavigationCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;

    try {
      const existing = await getNavigationNodeInfoByTitle(prerequisites.web, payload.location, payload.title);
      if (existing.kind === "missing") return nonCompliant({ resource: payload.title, reason: "not_found" });
      if (existing.kind === "ambiguous") return nonCompliant({ resource: payload.title, reason: "ambiguous" });

      const mismatches = getNavigationNodeMismatches(
        { url: payload.url, isVisible: payload.isVisible },
        existing.node
      );

      return mismatches.length === 0
        ? compliant({ resource: payload.title, scopeDelta: buildNavigationScopeDelta(ctx.scopeIn) })
        : nonCompliant({ resource: payload.title, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
```

- [ ] **Step 5: Create create index**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/create-sp-navigation-node/index.ts`:

```ts
import { defineSharePointActionModule } from "../../action-module";
import { CreateSPNavigationNodeAction } from "./action";
import { createSPNavigationNodeSchema } from "./schema";

export { CreateSPNavigationNodeAction } from "./action";
export { createSPNavigationNodeSchema, type CreateSPNavigationNodePayload } from "./schema";

export const createSPNavigationNodeActionModule = defineSharePointActionModule({
  verb: "createSPNavigationNode",
  schema: createSPNavigationNodeSchema,
  definition: new CreateSPNavigationNodeAction(),
  placements: ["siteSubaction"] as const,
});
```

- [ ] **Step 6: Run smoke and verify create-specific progress**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL only because modify/delete navigation exports are not created yet.

### Task 3: Add Modify And Delete Navigation Node Actions

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/schema.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/action.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/index.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/index.ts`
- Test: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Create modify schema**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import {
  spNavigationLocationSchema,
  spNavigationNodeMutableStateSchema,
  spNavigationNodeTitleSchema,
} from "../_shared/schema";

export const modifySPNavigationNodeSchema = z.object({
  verb: z.literal("modifySPNavigationNode"),
  location: spNavigationLocationSchema,
  title: spNavigationNodeTitleSchema,
  newTitle: spNavigationNodeTitleSchema.optional(),
  ...spNavigationNodeMutableStateSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type ModifySPNavigationNodePayload = z.infer<typeof modifySPNavigationNodeSchema>;
```

- [ ] **Step 2: Create modify action**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/action.ts`:

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { buildNavigationNodeUpdateProps, getNavigationCollection, getNavigationNodeInfoByTitle, getNavigationNodeMismatches } from "../../domains/navigation";
import { buildNavigationScopeDelta, checkNavigationManageWebPermission, getNavigationCompliancePrerequisites } from "../_shared/scope";
import { modifySPNavigationNodeSchema, type ModifySPNavigationNodePayload } from "./schema";
import "@pnp/sp/navigation";

export class ModifySPNavigationNodeAction extends ActionDefinition<
  "modifySPNavigationNode",
  typeof modifySPNavigationNodeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "modifySPNavigationNode";
  readonly actionSchema = modifySPNavigationNodeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<ModifySPNavigationNodePayload>): Promise<PermissionCheckResult> {
    return checkNavigationManageWebPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<ModifySPNavigationNodePayload>): Promise<M365ActionResult> {
    const web = ctx.scopeIn.web;
    const payload = ctx.action.payload;
    if (!web) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getNavigationNodeInfoByTitle(web, payload.location, payload.title);
    if (existing.kind === "missing") return actionSkipped(payload.title, "not_found", buildNavigationScopeDelta(ctx.scopeIn));
    if (existing.kind === "ambiguous") return actionSkipped(payload.title, "ambiguous", buildNavigationScopeDelta(ctx.scopeIn));

    const updateProps = buildNavigationNodeUpdateProps(payload);
    if (Object.keys(updateProps).length === 0) return actionSkipped(payload.title, "no_changes", buildNavigationScopeDelta(ctx.scopeIn));

    const mismatches = getNavigationNodeMismatches(payload, existing.node);
    if (mismatches.length === 0) return actionSkipped(payload.title, "no_changes", buildNavigationScopeDelta(ctx.scopeIn));

    await getNavigationCollection(web, payload.location).getById(existing.node.Id).update(updateProps);
    return actionExecuted(payload.title, buildNavigationScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPNavigationNodePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getNavigationCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;

    try {
      const existing = await getNavigationNodeInfoByTitle(prerequisites.web, payload.location, payload.title);
      if (existing.kind === "missing") return nonCompliant({ resource: payload.title, reason: "not_found" });
      if (existing.kind === "ambiguous") return nonCompliant({ resource: payload.title, reason: "ambiguous" });

      const mismatches = getNavigationNodeMismatches(payload, existing.node);
      return mismatches.length === 0
        ? compliant({ resource: payload.title, scopeDelta: buildNavigationScopeDelta(ctx.scopeIn) })
        : nonCompliant({ resource: payload.title, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
```

- [ ] **Step 3: Create modify index**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/modify-sp-navigation-node/index.ts`:

```ts
import { defineSharePointActionModule } from "../../action-module";
import { ModifySPNavigationNodeAction } from "./action";
import { modifySPNavigationNodeSchema } from "./schema";

export { ModifySPNavigationNodeAction } from "./action";
export { modifySPNavigationNodeSchema, type ModifySPNavigationNodePayload } from "./schema";

export const modifySPNavigationNodeActionModule = defineSharePointActionModule({
  verb: "modifySPNavigationNode",
  schema: modifySPNavigationNodeSchema,
  definition: new ModifySPNavigationNodeAction(),
  placements: ["siteSubaction"] as const,
});
```

- [ ] **Step 4: Create delete schema**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { spNavigationLocationSchema, spNavigationNodeTitleSchema } from "../_shared/schema";

export const deleteSPNavigationNodeSchema = z.object({
  verb: z.literal("deleteSPNavigationNode"),
  location: spNavigationLocationSchema,
  title: spNavigationNodeTitleSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type DeleteSPNavigationNodePayload = z.infer<typeof deleteSPNavigationNodeSchema>;
```

- [ ] **Step 5: Create delete action**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/action.ts`:

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { getNavigationCollection, getNavigationNodeInfoByTitle } from "../../domains/navigation";
import { buildNavigationScopeDelta, checkNavigationManageWebPermission, getNavigationCompliancePrerequisites } from "../_shared/scope";
import { deleteSPNavigationNodeSchema, type DeleteSPNavigationNodePayload } from "./schema";
import "@pnp/sp/navigation";

export class DeleteSPNavigationNodeAction extends ActionDefinition<
  "deleteSPNavigationNode",
  typeof deleteSPNavigationNodeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "deleteSPNavigationNode";
  readonly actionSchema = deleteSPNavigationNodeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<DeleteSPNavigationNodePayload>): Promise<PermissionCheckResult> {
    return checkNavigationManageWebPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<DeleteSPNavigationNodePayload>): Promise<M365ActionResult> {
    const web = ctx.scopeIn.web;
    const payload = ctx.action.payload;
    if (!web) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getNavigationNodeInfoByTitle(web, payload.location, payload.title);
    if (existing.kind === "missing") return actionSkipped(payload.title, "not_found", buildNavigationScopeDelta(ctx.scopeIn));
    if (existing.kind === "ambiguous") return actionSkipped(payload.title, "ambiguous", buildNavigationScopeDelta(ctx.scopeIn));

    await getNavigationCollection(web, payload.location).getById(existing.node.Id).delete();
    return actionExecuted(payload.title, buildNavigationScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPNavigationNodePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getNavigationCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;

    try {
      const existing = await getNavigationNodeInfoByTitle(prerequisites.web, payload.location, payload.title);
      if (existing.kind === "missing") return compliant({ resource: payload.title });
      return nonCompliant({ resource: payload.title, reason: existing.kind === "ambiguous" ? "ambiguous" : "exists" });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
```

- [ ] **Step 6: Create delete index and navigation barrel**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/delete-sp-navigation-node/index.ts`:

```ts
import { defineSharePointActionModule } from "../../action-module";
import { DeleteSPNavigationNodeAction } from "./action";
import { deleteSPNavigationNodeSchema } from "./schema";

export { DeleteSPNavigationNodeAction } from "./action";
export { deleteSPNavigationNodeSchema, type DeleteSPNavigationNodePayload } from "./schema";

export const deleteSPNavigationNodeActionModule = defineSharePointActionModule({
  verb: "deleteSPNavigationNode",
  schema: deleteSPNavigationNodeSchema,
  definition: new DeleteSPNavigationNodeAction(),
  placements: ["siteSubaction"] as const,
});
```

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/navigation/index.ts`:

```ts
export {
  CreateSPNavigationNodeAction,
  createSPNavigationNodeActionModule,
  createSPNavigationNodeSchema,
  type CreateSPNavigationNodePayload,
} from "./create-sp-navigation-node";
export {
  ModifySPNavigationNodeAction,
  modifySPNavigationNodeActionModule,
  modifySPNavigationNodeSchema,
  type ModifySPNavigationNodePayload,
} from "./modify-sp-navigation-node";
export {
  DeleteSPNavigationNodeAction,
  deleteSPNavigationNodeActionModule,
  deleteSPNavigationNodeSchema,
  type DeleteSPNavigationNodePayload,
} from "./delete-sp-navigation-node";
export { spNavigationLocationSchema, type SPNavigationLocation } from "./_shared/schema";
```

- [ ] **Step 7: Run smoke and verify action-level tests compile**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: PASS for direct schema/action imports added so far. Registry and site-subaction placement are intentionally checked in Task 4.

### Task 4: Register Navigation As Site Subactions Only

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/site-subactions-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`
- Test: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add failing placement smoke assertions**

Add assertions:

```ts
function assertSharePointNavigationPlacement(): void {
  const createSiteNav = siteSubactionSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo/Lists/Orders/AllItems.aspx",
  });
  assert(createSiteNav.success, "SharePoint site subaction schema should accept createSPNavigationNode");

  const rootNav = sharePointActionsSchema.safeParse([
    {
      verb: "createSPNavigationNode",
      location: "quicklaunch",
      title: "Orders",
      url: "/sites/demo/Lists/Orders/AllItems.aspx",
    },
  ]);
  assert(!rootNav.success, "SharePoint root schema should reject navigation node actions");

  const listNav = listSubactionSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo/Lists/Orders/AllItems.aspx",
  });
  assert(!listNav.success, "SharePoint list subaction schema should reject navigation node actions");

  assertStringArrayEqual(
    createSPNavigationNodeActionModule.placements,
    ["siteSubaction"],
    "createSPNavigationNode action module should be site-subaction only"
  );
}
```

Add imports for the three action modules and call this function from the smoke `main` sequence.

- [ ] **Step 2: Register modules**

Modify `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`:

```ts
import {
  createSPNavigationNodeActionModule,
  modifySPNavigationNodeActionModule,
  deleteSPNavigationNodeActionModule,
} from "./navigation";
```

Add the modules after site actions and before list actions:

```ts
  createSPSiteActionModule,
  modifySPSiteActionModule,
  deleteSPSiteActionModule,
  createSPNavigationNodeActionModule,
  modifySPNavigationNodeActionModule,
  deleteSPNavigationNodeActionModule,
  createSPListActionModule,
```

- [ ] **Step 3: Register site subaction schemas**

Modify `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/site-subactions-schema.ts`:

```ts
import {
  createSPNavigationNodeActionModule,
  modifySPNavigationNodeActionModule,
  deleteSPNavigationNodeActionModule,
} from "../navigation";
```

Add to `siteSubactionSchemas`:

```ts
  createSPNavigationNodeActionModule.schema,
  modifySPNavigationNodeActionModule.schema,
  deleteSPNavigationNodeActionModule.schema,
```

- [ ] **Step 4: Export public schemas**

Modify `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`:

```ts
export {
  createSPNavigationNodeSchema,
  modifySPNavigationNodeSchema,
  deleteSPNavigationNodeSchema,
  spNavigationLocationSchema,
  type CreateSPNavigationNodePayload,
  type ModifySPNavigationNodePayload,
  type DeleteSPNavigationNodePayload,
  type SPNavigationLocation,
} from "./navigation";
```

Modify `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`:

```ts
// Navigation actions
export {
  CreateSPNavigationNodeAction,
  ModifySPNavigationNodeAction,
  DeleteSPNavigationNodeAction,
  createSPNavigationNodeSchema,
  modifySPNavigationNodeSchema,
  deleteSPNavigationNodeSchema,
  spNavigationLocationSchema,
  type CreateSPNavigationNodePayload,
  type ModifySPNavigationNodePayload,
  type DeleteSPNavigationNodePayload,
  type SPNavigationLocation,
} from "./navigation";
```

- [ ] **Step 5: Run smoke**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: PASS for schema, module-placement, root rejection, site-subaction acceptance, and list-subaction rejection assertions added so far. Full handler and compliance coverage is added in Task 5.

### Task 5: Add Handler And Compliance Smoke Coverage

**Files:**
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add root navigation mock**

Add helper:

```ts
function navigationCollectionFrom(nodes: {
  items: Array<{ Id: number; Title: string; Url?: string; IsVisible?: boolean }>;
  onAdd?: (title: string, url: string, isVisible: boolean) => void;
  onUpdate?: (id: number, props: Record<string, unknown>) => void;
  onDelete?: (id: number) => void;
}) {
  const collection = Object.assign(
    async () => nodes.items,
    {
      add: async (title: string, url: string, isVisible: boolean) => {
        nodes.onAdd?.(title, url, isVisible);
        return { Id: 999 };
      },
      getById: (id: number) => ({
        update: async (props: Record<string, unknown>) => {
          nodes.onUpdate?.(id, props);
        },
        delete: async () => {
          nodes.onDelete?.(id);
        },
      }),
    }
  );
  return collection;
}
```

- [ ] **Step 2: Add create writes test**

Add:

```ts
async function assertCreateSPNavigationNodeAddsMissingNode(): Promise<void> {
  let added: { title: string; url: string; isVisible: boolean } | undefined;
  const web = {
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: [],
        onAdd: (title, url, isVisible) => {
          added = { title, url, isVisible };
        },
      }),
      topNavigationBar: navigationCollectionFrom({ items: [] }),
    },
  };

  const result = await new CreateSPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
        isVisible: false,
      },
    },
  } as Parameters<CreateSPNavigationNodeAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "createSPNavigationNode should execute when missing");
  assert(added?.title === "Orders", "createSPNavigationNode should pass title to PnPjs add");
  assert(added?.url === "/sites/demo/orders", "createSPNavigationNode should pass url to PnPjs add");
  assert(added?.isVisible === false, "createSPNavigationNode should pass isVisible to PnPjs add");
}
```

- [ ] **Step 3: Add modify and delete write tests**

Add:

```ts
async function assertModifySPNavigationNodeUpdatesChangedNode(): Promise<void> {
  let updated: { id: number; props: Record<string, unknown> } | undefined;
  const web = {
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
        onUpdate: (id, props) => {
          updated = { id, props };
        },
      }),
      topNavigationBar: navigationCollectionFrom({ items: [] }),
    },
  };

  const result = await new ModifySPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/1",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        newTitle: "Customer Orders",
        url: "/sites/demo/customer-orders",
        isVisible: false,
      },
    },
  } as Parameters<ModifySPNavigationNodeAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "modifySPNavigationNode should execute when mutable state differs");
  assert(updated?.id === 7, "modifySPNavigationNode should update the matched node by Id");
  assert(JSON.stringify(updated?.props) === JSON.stringify({
    Title: "Customer Orders",
    Url: "/sites/demo/customer-orders",
    IsVisible: false,
  }), "modifySPNavigationNode should send expected PnPjs update props");
}
```

Add:

```ts
async function assertModifySPNavigationNodeSkipsWhenAlreadyCompliant(): Promise<void> {
  let updateCalled = false;
  const web = {
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
        onUpdate: () => {
          updateCalled = true;
        },
      }),
      topNavigationBar: navigationCollectionFrom({ items: [] }),
    },
  };

  const result = await new ModifySPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/1",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
        isVisible: true,
      },
    },
  } as Parameters<ModifySPNavigationNodeAction["handler"]>[0]);

  assert(result.result?.outcome === "skipped", "modifySPNavigationNode should skip already-compliant nodes");
  assert(result.result?.outcome === "skipped" && result.result.reason === "no_changes", "modifySPNavigationNode should report no_changes");
  assert(!updateCalled, "modifySPNavigationNode should not update when state already matches");
}
```

Add:

```ts
async function assertDeleteSPNavigationNodeDeletesMatchedNode(): Promise<void> {
  let deletedId: number | undefined;
  const web = {
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
        onDelete: (id) => {
          deletedId = id;
        },
      }),
      topNavigationBar: navigationCollectionFrom({ items: [] }),
    },
  };

  const result = await new DeleteSPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/1",
      verb: "deleteSPNavigationNode",
      payload: {
        verb: "deleteSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
      },
    },
  } as Parameters<DeleteSPNavigationNodeAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "deleteSPNavigationNode should execute when one matching node exists");
  assert(deletedId === 7, "deleteSPNavigationNode should delete the matched node by Id");
}
```

- [ ] **Step 4: Add ambiguous duplicate tests**

Add:

```ts
async function assertNavigationHandlersSkipAmbiguousDuplicateTitles(): Promise<void> {
  const web = {
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: [
          { Id: 7, Title: "Orders", Url: "/sites/demo/orders-a", IsVisible: true },
          { Id: 8, Title: "Orders", Url: "/sites/demo/orders-b", IsVisible: true },
        ],
      }),
      topNavigationBar: navigationCollectionFrom({ items: [] }),
    },
  };

  const createResult = await new CreateSPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  } as Parameters<CreateSPNavigationNodeAction["handler"]>[0]);

  const modifyResult = await new ModifySPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/2",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        isVisible: false,
      },
    },
  } as Parameters<ModifySPNavigationNodeAction["handler"]>[0]);

  const deleteResult = await new DeleteSPNavigationNodeAction().handler({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    out: { byAction: {}, trace: buildInitialTrace([]) },
    action: {
      path: "1/3",
      verb: "deleteSPNavigationNode",
      payload: {
        verb: "deleteSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
      },
    },
  } as Parameters<DeleteSPNavigationNodeAction["handler"]>[0]);

  for (const result of [createResult, modifyResult, deleteResult]) {
    assert(result.result?.outcome === "skipped", "navigation action should skip ambiguous duplicate titles");
    assert(result.result?.outcome === "skipped" && result.result.reason === "ambiguous", "navigation action should report ambiguous duplicate titles");
  }
}
```

- [ ] **Step 5: Add compliance tests**

Add compliance checks:

```ts
async function assertNavigationCompliancePrerequisites(): Promise<void> {
  const compliance = await new CreateSPNavigationNodeAction().checkCompliance({
    scopeIn: {},
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  } as Parameters<CreateSPNavigationNodeAction["checkCompliance"]>[0]);

  assert(compliance.outcome === "unverifiable", "navigation compliance should be unverifiable without web scope");
  assert(compliance.reason === "missing_prerequisite", "navigation compliance should report missing web prerequisite");
}
```

Add drift check:

```ts
async function assertNavigationComplianceDetectsDrift(): Promise<void> {
  const web = {
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: [{ Id: 7, Title: "Orders", Url: "/sites/demo/old-orders", IsVisible: true }],
      }),
      topNavigationBar: navigationCollectionFrom({ items: [] }),
    },
  };

  const compliance = await new CreateSPNavigationNodeAction().checkCompliance({
    scopeIn: { web },
    clients: { spfi: { marker: "spfi" } },
    logger: createLogger({ sinks: [] }),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  } as Parameters<CreateSPNavigationNodeAction["checkCompliance"]>[0]);

  assert(compliance.outcome === "non_compliant", "navigation compliance should detect drift");
  assert(compliance.reason === "drift", "navigation compliance should report drift when URL differs");
}
```

Call all smoke functions added in this task from the smoke `main` sequence.

- [ ] **Step 6: Run smoke**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: PASS.

### Task 6: Add Docs And Demo Plan Coverage

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`
- Modify: `apps/test-spfx/src/webparts/testProvisioning/test-plans/demo-plans.ts`

- [ ] **Step 1: Update action catalog docs**

Add a section after site actions:

```md
## Navigation V1

SharePoint navigation node actions are site subactions only. They are intended
to run under `createSPSite` or `modifySPSite`, using the target web propagated
by the parent site action.

V1 exposes:

- `createSPNavigationNode`
- `modifySPNavigationNode`
- `deleteSPNavigationNode`

The `location` field uses PnPjs web navigation collection names:

- `quicklaunch`
- `topNavigationBar`

V1 supports root navigation nodes only. It does not support footer navigation,
child nodes, ordering, audience targeting, or duplicate-title mutation.
```

- [ ] **Step 2: Add a demo navigation subaction through modifySPSite**

In `apps/test-spfx/src/webparts/testProvisioning/test-plans/demo-plans.ts`, add this root action after the two list creation actions:

```ts
{
  verb: 'modifySPSite',
  subactions: [
    {
      verb: 'createSPNavigationNode',
      location: 'quicklaunch',
      title: '{parameter:OrdersTitle} workspace',
      url: '/Lists/{parameter:OrdersListName}/AllItems.aspx',
    },
  ],
}
```

This intentionally uses `modifySPSite` as the site-level wrapper for the current web. It does not set `siteUrl`, `title`, or `description`, so the parent action should return `no_changes` while still propagating `web` scope to the navigation subaction.

The title must be distinct from `{parameter:OrdersTitle}` because the existing list action already sets `onQuickLaunch: true`, which can create a default list navigation link named `Orders`.

In the same file, add this root action at the beginning of `deprovisioningPlan.actions`, before deleting the lists:

```ts
{
  verb: 'modifySPSite',
  subactions: [
    {
      verb: 'deleteSPNavigationNode',
      location: 'quicklaunch',
      title: '{parameter:OrdersTitle} workspace',
    },
  ],
}
```

- [ ] **Step 3: Run build and smoke**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
git diff --check
```

Expected: all commands PASS.

## Tenant Verification Checklist

Local smoke proves schema/handler contracts, not SharePoint runtime fidelity. Before declaring the feature tenant-stable, run a real tenant provisioning/deprovisioning smoke with a plan that:

```ts
{
  verb: "modifySPSite",
  siteUrl: "https://tenant.sharepoint.com/sites/actionable-provisioning-test",
  subactions: [
    {
      verb: "createSPNavigationNode",
      location: "quicklaunch",
      title: "AP Orders",
      url: "/sites/actionable-provisioning-test/Lists/Orders/AllItems.aspx"
    },
    {
      verb: "modifySPNavigationNode",
      location: "quicklaunch",
      title: "AP Orders",
      newTitle: "AP Customer Orders",
      isVisible: true
    },
    {
      verb: "deleteSPNavigationNode",
      location: "quicklaunch",
      title: "AP Customer Orders"
    }
  ]
}
```

Manual tenant assertions:

- Node appears after create.
- Node title or visibility changes after modify.
- Node disappears after delete.
- Running create twice skips with `already_exists`.
- Duplicate-title scenarios do not mutate an arbitrary node.

## Self-Review

Spec coverage:

- `location` uses PnPjs standard names: covered by shared schema and smoke rejection of `site-footer`.
- Site-level only: covered by `siteSubactionSchema` registration and root/list rejection smoke.
- `createSPSite` and `modifySPSite` integration: covered by using existing site subactions, without editing site schemas.
- CRUD semantics: covered by create, modify, delete action tasks.
- Compliance: covered by missing-prerequisite and drift smoke tasks.
- Footer exclusion: covered by schema rejection and docs.
- Tenant validation: covered by explicit tenant checklist.

Placeholder scan:

- The plan contains no `TBD`, no `TODO`, and no open implementation placeholders.
- The demo plan step uses the existing `OrdersTitle` and `OrdersListName` parameters, uses a distinct navigation title to avoid the existing `onQuickLaunch` list link, and adds deprovisioning cleanup.

Type consistency:

- Action names match across schemas, classes, modules, and public exports.
- `location` is consistently typed as `"quicklaunch" | "topNavigationBar"`.
- `newTitle` is used only by modify and maps to PnPjs `Title`.
- `isVisible` maps to PnPjs add third argument and update `IsVisible`.

Design check:

- Keeping navigation as `siteSubaction` is correct for the requested "add/modify site level" direction.
- Adding inline `navigation` arrays to `createSPSite` or `modifySPSite` would be less consistent with the existing action catalog and would create a second composition model.
- Not adding root-level navigation actions is intentional: callers can target an existing site with `modifySPSite` and a `siteUrl`, or use inherited scope inside `createSPSite`.
