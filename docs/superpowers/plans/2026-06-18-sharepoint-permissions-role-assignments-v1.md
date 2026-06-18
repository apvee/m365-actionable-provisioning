# SharePoint Permissions Role Assignments V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build additive, targeted SharePoint site and list/library role inheritance and role assignment actions for the M365 provisioning engine.

**Architecture:** Add a focused SharePoint `permissions` action family backed by shared `domains/permissions` helpers. Public actions stay explicit (`SPSite` and `SPList` verbs), while principal resolution, role resolution, inheritance reads, and binding writes are implemented once and reused by all eight actions.

**Tech Stack:** TypeScript, Zod v4, PnPjs `@pnp/sp` security/site-users/site-groups, PnPjs `@pnp/graph` groups for optional lookup, existing smoke harness `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`.

---

## File Structure

Create:

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/schema.ts`  
  Shared payload schemas, role type mapping, principal type constants, and Zod refinements.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/errors.ts`  
  Typed helper errors and classifiers for `not_found`, `ambiguous`, and `missing_prerequisite` cases.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/securable-target.ts`  
  Site/list target resolution, scope-delta preservation, and `HasUniqueRoleAssignments` reads.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/principal-resolution.ts`  
  Principal resolution for SharePoint login names, SharePoint groups, Entra/Microsoft 365 group ids, and Graph-backed group convenience lookups.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/role-resolution.ts`  
  Role definition resolution by id, escaped name filter, and role type mapping.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/role-assignments.ts`  
  Binding existence checks, add/remove wrappers, and not-found normalization.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/index.ts`  
  Public domain barrel for action code.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/_shared/action-factory.ts`  
  Shared action classes/factories for site/list target variants without duplicating runtime logic.

- Eight action folders:
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/break-sp-site-role-inheritance/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/reset-sp-site-role-inheritance/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/grant-sp-site-role-assignment/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/remove-sp-site-role-assignment/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/break-sp-list-role-inheritance/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/reset-sp-list-role-inheritance/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/grant-sp-list-role-assignment/`
  - `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/remove-sp-list-role-assignment/`

- `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/index.ts`  
  Permission action barrel export.

Modify:

- `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`  
  Add failing contract tests before implementation, then expand runtime helper tests.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`  
  Register all eight modules in the runtime catalog.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/site-subactions-schema.ts`  
  Add site permission actions only to site subactions.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts`  
  Add list permission actions only to list subactions.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`  
  Re-export permission schemas and payload types.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`  
  Export the `permissions` action family from the public SharePoint barrel.

- `docs/provisioning-schema.md`  
  Document action contracts, examples, defaults, and caveats.

- `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`  
  Add supported permission actions and non-goals.

- `packages/m365-actionable-provisioning/README.md`  
  Update only if it lists supported SharePoint action families.

- `README.md`  
  Update only if it lists package-level action coverage.

Validation commands:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build:m365
```

If the first command fails inside the sandbox with `listen EPERM` for a `tsx` IPC pipe, rerun it with escalation using the already-approved pattern for `npm run smoke:m365-engine`.

---

### Task 1: Add Failing Smoke Contracts For Permission Schemas And Placement

**Files:**
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add imports for permission symbols that do not exist yet**

Add this import block near the current list-view imports. This intentionally fails until the implementation creates the symbols.

```ts
import {
  BreakSPListRoleInheritanceAction,
  BreakSPSiteRoleInheritanceAction,
  GrantSPListRoleAssignmentAction,
  GrantSPSiteRoleAssignmentAction,
  RemoveSPListRoleAssignmentAction,
  RemoveSPSiteRoleAssignmentAction,
  ResetSPListRoleInheritanceAction,
  ResetSPSiteRoleInheritanceAction,
  breakSPListRoleInheritanceActionModule,
  breakSPListRoleInheritanceSchema,
  breakSPSiteRoleInheritanceActionModule,
  breakSPSiteRoleInheritanceSchema,
  grantSPListRoleAssignmentActionModule,
  grantSPListRoleAssignmentSchema,
  grantSPSiteRoleAssignmentActionModule,
  grantSPSiteRoleAssignmentSchema,
  removeSPListRoleAssignmentActionModule,
  removeSPListRoleAssignmentSchema,
  removeSPSiteRoleAssignmentActionModule,
  removeSPSiteRoleAssignmentSchema,
  resetSPListRoleInheritanceActionModule,
  resetSPListRoleInheritanceSchema,
  resetSPSiteRoleInheritanceActionModule,
  resetSPSiteRoleInheritanceSchema,
} from "../src/actions/sharepoint/permissions";
```

- [ ] **Step 2: Add schema and placement assertions**

Add this function after `assertSharePointCatalogComposition()`.

```ts
function assertSharePointPermissionsCatalogComposition(): void {
  const siteGrant = siteSubactionSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Owners",
    roleName: "Full Control",
    breakRoleInheritance: true,
    copyRoleAssignments: true,
    clearSubscopes: false,
  });
  assert(siteGrant.success, "SharePoint site subaction schema should accept grantSPSiteRoleAssignment");
  if (siteGrant.success) {
    assert(siteGrant.data.principal === "Project Owners", "Permission principal should be preserved after parsing");
    assert(siteGrant.data.roleName === "Full Control", "Permission roleName should be preserved after parsing");
  }

  const listGrant = listSubactionSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "m365GroupMailNickname",
    principal: " project-members ",
    roleType: "contribute",
  });
  assert(listGrant.success, "SharePoint list subaction schema should accept grantSPListRoleAssignment");
  if (listGrant.success) {
    assert(listGrant.data.principal === "project-members", "Permission principal should be trimmed");
  }

  const listRemove = listSubactionSchema.safeParse({
    verb: "removeSPListRoleAssignment",
    principalType: "loginName",
    principal: "i:0#.f|membership|user@contoso.com",
    roleId: 1073741827,
  });
  assert(listRemove.success, "SharePoint list subaction schema should accept removeSPListRoleAssignment");

  const siteBreak = siteSubactionSchema.safeParse({
    verb: "breakSPSiteRoleInheritance",
  });
  assert(siteBreak.success, "SharePoint site subaction schema should accept breakSPSiteRoleInheritance with defaults");

  const listReset = listSubactionSchema.safeParse({
    verb: "resetSPListRoleInheritance",
  });
  assert(listReset.success, "SharePoint list subaction schema should accept resetSPListRoleInheritance");

  const rootGrant = sharePointActionsSchema.safeParse([
    {
      verb: "grantSPSiteRoleAssignment",
      principalType: "spGroupName",
      principal: "Project Owners",
      roleName: "Full Control",
    },
  ]);
  assert(!rootGrant.success, "SharePoint root schema should reject permission actions");

  const siteUsesListPermission = siteSubactionSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
  });
  assert(!siteUsesListPermission.success, "SharePoint site subaction schema should reject list permission actions directly");

  const listUsesSitePermission = listSubactionSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
  });
  assert(!listUsesSitePermission.success, "SharePoint list subaction schema should reject site permission actions");

  const twoRoleRefs = grantSPListRoleAssignmentSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleName: "Contribute",
    roleType: "contribute",
  });
  assert(!twoRoleRefs.success, "Permission schema should reject multiple role references");

  const noRoleRef = grantSPListRoleAssignmentSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
  });
  assert(!noRoleRef.success, "Permission schema should reject missing role reference");

  const copyWithoutBreak = grantSPSiteRoleAssignmentSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
    copyRoleAssignments: true,
  });
  assert(!copyWithoutBreak.success, "Permission schema should reject copyRoleAssignments without breakRoleInheritance:true");

  const clearWithoutBreak = grantSPSiteRoleAssignmentSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
    clearSubscopes: false,
  });
  assert(!clearWithoutBreak.success, "Permission schema should reject clearSubscopes without breakRoleInheritance:true");

  assertStringArrayEqual(
    breakSPSiteRoleInheritanceActionModule.placements,
    ["siteSubaction"],
    "breakSPSiteRoleInheritance action module should be site-subaction only"
  );
  assertStringArrayEqual(
    resetSPSiteRoleInheritanceActionModule.placements,
    ["siteSubaction"],
    "resetSPSiteRoleInheritance action module should be site-subaction only"
  );
  assertStringArrayEqual(
    grantSPSiteRoleAssignmentActionModule.placements,
    ["siteSubaction"],
    "grantSPSiteRoleAssignment action module should be site-subaction only"
  );
  assertStringArrayEqual(
    removeSPSiteRoleAssignmentActionModule.placements,
    ["siteSubaction"],
    "removeSPSiteRoleAssignment action module should be site-subaction only"
  );
  assertStringArrayEqual(
    breakSPListRoleInheritanceActionModule.placements,
    ["listSubaction"],
    "breakSPListRoleInheritance action module should be list-subaction only"
  );
  assertStringArrayEqual(
    resetSPListRoleInheritanceActionModule.placements,
    ["listSubaction"],
    "resetSPListRoleInheritance action module should be list-subaction only"
  );
  assertStringArrayEqual(
    grantSPListRoleAssignmentActionModule.placements,
    ["listSubaction"],
    "grantSPListRoleAssignment action module should be list-subaction only"
  );
  assertStringArrayEqual(
    removeSPListRoleAssignmentActionModule.placements,
    ["listSubaction"],
    "removeSPListRoleAssignment action module should be list-subaction only"
  );

  const permissionActions = [
    new BreakSPSiteRoleInheritanceAction(),
    new ResetSPSiteRoleInheritanceAction(),
    new GrantSPSiteRoleAssignmentAction(),
    new RemoveSPSiteRoleAssignmentAction(),
    new BreakSPListRoleInheritanceAction(),
    new ResetSPListRoleInheritanceAction(),
    new GrantSPListRoleAssignmentAction(),
    new RemoveSPListRoleAssignmentAction(),
  ];
  for (const action of permissionActions) {
    assertStringArrayEqual(
      action.requiredClients ?? [],
      ["spfi"],
      `${action.verb} should require only spfi at the action-definition level`
    );
  }

  assert(breakSPSiteRoleInheritanceSchema.safeParse({ verb: "breakSPSiteRoleInheritance" }).success, "Public breakSPSiteRoleInheritanceSchema should parse minimal payload");
  assert(resetSPSiteRoleInheritanceSchema.safeParse({ verb: "resetSPSiteRoleInheritance" }).success, "Public resetSPSiteRoleInheritanceSchema should parse minimal payload");
  assert(grantSPSiteRoleAssignmentSchema.safeParse({ verb: "grantSPSiteRoleAssignment", principalType: "loginName", principal: "i:0#.f|membership|user@contoso.com", roleType: "read" }).success, "Public grantSPSiteRoleAssignmentSchema should parse roleType payload");
  assert(removeSPSiteRoleAssignmentSchema.safeParse({ verb: "removeSPSiteRoleAssignment", principalType: "spGroupName", principal: "Visitors", roleName: "Read" }).success, "Public removeSPSiteRoleAssignmentSchema should parse roleName payload");
  assert(breakSPListRoleInheritanceSchema.safeParse({ verb: "breakSPListRoleInheritance" }).success, "Public breakSPListRoleInheritanceSchema should parse minimal payload");
  assert(resetSPListRoleInheritanceSchema.safeParse({ verb: "resetSPListRoleInheritance" }).success, "Public resetSPListRoleInheritanceSchema should parse minimal payload");
  assert(grantSPListRoleAssignmentSchema.safeParse({ verb: "grantSPListRoleAssignment", principalType: "m365GroupId", principal: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7", roleType: "edit" }).success, "Public grantSPListRoleAssignmentSchema should parse m365GroupId payload");
  assert(removeSPListRoleAssignmentSchema.safeParse({ verb: "removeSPListRoleAssignment", principalType: "entraGroupId", principal: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7", roleId: 1073741827 }).success, "Public removeSPListRoleAssignmentSchema should parse roleId payload");
}
```

- [ ] **Step 3: Call the failing assertion**

Add this line next to the other smoke assertion calls in the script's main section:

```ts
assertSharePointPermissionsCatalogComposition();
```

- [ ] **Step 4: Run smoke to verify it fails**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL with TypeScript import errors for missing permission action exports. If it fails with `listen EPERM` for a `tsx` pipe inside the sandbox, rerun the exact command with escalation.

- [ ] **Step 5: Commit failing contract tests**

```sh
git add packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "test: add SharePoint permissions contracts"
```

---

### Task 2: Implement Shared Permission Schemas And Empty Action Modules

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/schema.ts`
- Create: all eight `schema.ts`, `index.ts`, and temporary `action.ts` files under `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/index.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/action-modules.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/site-subactions-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_composition/list-subactions-schema.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/schemas.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/index.ts`

- [ ] **Step 1: Create shared schema primitives**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/schema.ts`:

```ts
import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const permissionPrincipalTypes = [
  "loginName",
  "spGroupName",
  "entraGroupId",
  "m365GroupId",
  "entraGroupName",
  "m365GroupName",
  "m365GroupMailNickname",
] as const;

export const permissionRoleTypes = [
  "read",
  "contribute",
  "edit",
  "design",
  "fullControl",
] as const;

export type PermissionPrincipalType = (typeof permissionPrincipalTypes)[number];
export type PermissionRoleType = (typeof permissionRoleTypes)[number];

export const permissionPrincipalSchema = {
  principalType: z.enum(permissionPrincipalTypes),
  principal: z.string().trim().min(1, "Permission principal cannot be empty"),
} as const;

export const permissionRoleReferenceSchema = {
  roleId: z.number().int().positive("Permission roleId must be a positive integer").optional(),
  roleName: z.string().trim().min(1, "Permission roleName cannot be empty").optional(),
  roleType: z.enum(permissionRoleTypes).optional(),
} as const;

export const roleTypeKindByPermissionRoleType = {
  read: 2,
  contribute: 3,
  design: 4,
  fullControl: 5,
  edit: 6,
} as const satisfies Record<PermissionRoleType, 2 | 3 | 4 | 5 | 6>;

export function countRoleReferences(value: {
  roleId?: number;
  roleName?: string;
  roleType?: PermissionRoleType;
}): number {
  return [value.roleId, value.roleName, value.roleType].filter((item) => item !== undefined).length;
}

export function requireExactlyOneRoleReference<TSchema extends z.ZodType>(schema: TSchema): TSchema {
  return schema.superRefine((value, ctx) => {
    const roleRefs = countRoleReferences(value as { roleId?: number; roleName?: string; roleType?: PermissionRoleType });
    if (roleRefs !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Exactly one of roleId, roleName, or roleType is required",
        path: ["role"],
      });
    }
  }) as TSchema;
}

export function rejectBreakOptionsWithoutBreak<TSchema extends z.ZodType>(schema: TSchema): TSchema {
  return schema.superRefine((value, ctx) => {
    const payload = value as {
      breakRoleInheritance?: boolean;
      copyRoleAssignments?: boolean;
      clearSubscopes?: boolean;
    };
    if (payload.breakRoleInheritance === true) return;
    if (payload.copyRoleAssignments !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "copyRoleAssignments requires breakRoleInheritance:true",
        path: ["copyRoleAssignments"],
      });
    }
    if (payload.clearSubscopes !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "clearSubscopes requires breakRoleInheritance:true",
        path: ["clearSubscopes"],
      });
    }
  }) as TSchema;
}

export function createBreakRoleInheritanceSchema<Verb extends string>(verb: Verb) {
  return z.object({
    verb: z.literal(verb),
    copyRoleAssignments: z.boolean().optional(),
    clearSubscopes: z.boolean().optional(),
    subactions: leafSubactionsSchema,
  }).strict();
}

export function createResetRoleInheritanceSchema<Verb extends string>(verb: Verb) {
  return z.object({
    verb: z.literal(verb),
    subactions: leafSubactionsSchema,
  }).strict();
}

export function createGrantRoleAssignmentSchema<Verb extends string>(verb: Verb) {
  return rejectBreakOptionsWithoutBreak(requireExactlyOneRoleReference(z.object({
    verb: z.literal(verb),
    ...permissionPrincipalSchema,
    ...permissionRoleReferenceSchema,
    breakRoleInheritance: z.boolean().optional(),
    copyRoleAssignments: z.boolean().optional(),
    clearSubscopes: z.boolean().optional(),
    subactions: leafSubactionsSchema,
  }).strict()));
}

export function createRemoveRoleAssignmentSchema<Verb extends string>(verb: Verb) {
  return requireExactlyOneRoleReference(z.object({
    verb: z.literal(verb),
    ...permissionPrincipalSchema,
    ...permissionRoleReferenceSchema,
    subactions: leafSubactionsSchema,
  }).strict());
}
```

- [ ] **Step 2: Create temporary action classes for all eight verbs**

Create `action.ts` in every action folder with the matching class name and schema import. The example below is the complete temporary file for `grant-sp-list-role-assignment/action.ts`; apply the same structure with the exact class/schema/payload triples listed after the code block.

```ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionSkipped, unverifiable } from "../../_shared/action-results";

import { grantSPListRoleAssignmentSchema, type GrantSPListRoleAssignmentPayload } from "./schema";

export class GrantSPListRoleAssignmentAction extends ActionDefinition<
  "grantSPListRoleAssignment",
  typeof grantSPListRoleAssignmentSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "grantSPListRoleAssignment";
  readonly actionSchema = grantSPListRoleAssignmentSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return { decision: "unknown", message: "SharePoint permission runtime is introduced in Task 4" };
  }

  async handler(ctx: M365RuntimeContext<GrantSPListRoleAssignmentPayload>): Promise<M365ActionResult> {
    const resource = (ctx.action.payload as { principal?: string }).principal ?? ctx.action.verb;
    return actionSkipped(resource, "unsupported");
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, GrantSPListRoleAssignmentPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const resource = (ctx.action.payload as { principal?: string }).principal ?? ctx.action.verb;
    return unverifiable({
      resource,
      reason: "not_supported",
      message: "SharePoint permission runtime is introduced in Task 4",
    });
  }
}
```

Use these exact class/schema/payload triples:

```text
BreakSPSiteRoleInheritanceAction / breakSPSiteRoleInheritanceSchema / BreakSPSiteRoleInheritancePayload
ResetSPSiteRoleInheritanceAction / resetSPSiteRoleInheritanceSchema / ResetSPSiteRoleInheritancePayload
GrantSPSiteRoleAssignmentAction / grantSPSiteRoleAssignmentSchema / GrantSPSiteRoleAssignmentPayload
RemoveSPSiteRoleAssignmentAction / removeSPSiteRoleAssignmentSchema / RemoveSPSiteRoleAssignmentPayload
BreakSPListRoleInheritanceAction / breakSPListRoleInheritanceSchema / BreakSPListRoleInheritancePayload
ResetSPListRoleInheritanceAction / resetSPListRoleInheritanceSchema / ResetSPListRoleInheritancePayload
GrantSPListRoleAssignmentAction / grantSPListRoleAssignmentSchema / GrantSPListRoleAssignmentPayload
RemoveSPListRoleAssignmentAction / removeSPListRoleAssignmentSchema / RemoveSPListRoleAssignmentPayload
```

- [ ] **Step 3: Create schema files**

Use this exact pattern for each action-specific `schema.ts`:

```ts
import { z } from "zod";

import { createGrantRoleAssignmentSchema } from "../../domains/permissions/schema";

export const grantSPListRoleAssignmentSchema = createGrantRoleAssignmentSchema("grantSPListRoleAssignment");

export type GrantSPListRoleAssignmentPayload = z.infer<typeof grantSPListRoleAssignmentSchema>;
```

Use the matching factory for each verb:

```text
break*RoleInheritance -> createBreakRoleInheritanceSchema
reset*RoleInheritance -> createResetRoleInheritanceSchema
grant*RoleAssignment -> createGrantRoleAssignmentSchema
remove*RoleAssignment -> createRemoveRoleAssignmentSchema
```

- [ ] **Step 4: Create action module `index.ts` files**

The example below is the complete file for `grant-sp-list-role-assignment/index.ts`. Create the other seven index files with the same structure and the exact class/schema/module names from Step 2.

```ts
import { defineSharePointActionModule } from "../../action-module";

import { GrantSPListRoleAssignmentAction } from "./action";
import { grantSPListRoleAssignmentSchema } from "./schema";

export { GrantSPListRoleAssignmentAction } from "./action";
export { grantSPListRoleAssignmentSchema, type GrantSPListRoleAssignmentPayload } from "./schema";

export const grantSPListRoleAssignmentActionModule = defineSharePointActionModule({
  verb: "grantSPListRoleAssignment",
  schema: grantSPListRoleAssignmentSchema,
  definition: new GrantSPListRoleAssignmentAction(),
  placements: ["listSubaction"] as const,
});
```

Site action module placement is `["siteSubaction"] as const`. List action module placement is `["listSubaction"] as const`.

- [ ] **Step 5: Create permissions barrel**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/index.ts`:

```ts
export {
  breakSPSiteRoleInheritanceActionModule,
  BreakSPSiteRoleInheritanceAction,
  breakSPSiteRoleInheritanceSchema,
  type BreakSPSiteRoleInheritancePayload,
} from "./break-sp-site-role-inheritance";
export {
  resetSPSiteRoleInheritanceActionModule,
  ResetSPSiteRoleInheritanceAction,
  resetSPSiteRoleInheritanceSchema,
  type ResetSPSiteRoleInheritancePayload,
} from "./reset-sp-site-role-inheritance";
export {
  grantSPSiteRoleAssignmentActionModule,
  GrantSPSiteRoleAssignmentAction,
  grantSPSiteRoleAssignmentSchema,
  type GrantSPSiteRoleAssignmentPayload,
} from "./grant-sp-site-role-assignment";
export {
  removeSPSiteRoleAssignmentActionModule,
  RemoveSPSiteRoleAssignmentAction,
  removeSPSiteRoleAssignmentSchema,
  type RemoveSPSiteRoleAssignmentPayload,
} from "./remove-sp-site-role-assignment";
export {
  breakSPListRoleInheritanceActionModule,
  BreakSPListRoleInheritanceAction,
  breakSPListRoleInheritanceSchema,
  type BreakSPListRoleInheritancePayload,
} from "./break-sp-list-role-inheritance";
export {
  resetSPListRoleInheritanceActionModule,
  ResetSPListRoleInheritanceAction,
  resetSPListRoleInheritanceSchema,
  type ResetSPListRoleInheritancePayload,
} from "./reset-sp-list-role-inheritance";
export {
  grantSPListRoleAssignmentActionModule,
  GrantSPListRoleAssignmentAction,
  grantSPListRoleAssignmentSchema,
  type GrantSPListRoleAssignmentPayload,
} from "./grant-sp-list-role-assignment";
export {
  removeSPListRoleAssignmentActionModule,
  RemoveSPListRoleAssignmentAction,
  removeSPListRoleAssignmentSchema,
  type RemoveSPListRoleAssignmentPayload,
} from "./remove-sp-list-role-assignment";
```

- [ ] **Step 6: Wire composition and schema exports**

Modify `action-modules.ts` to import all eight modules from `./permissions` and append them near the list/view modules. Keep stable order:

```ts
import {
  breakSPSiteRoleInheritanceActionModule,
  resetSPSiteRoleInheritanceActionModule,
  grantSPSiteRoleAssignmentActionModule,
  removeSPSiteRoleAssignmentActionModule,
  breakSPListRoleInheritanceActionModule,
  resetSPListRoleInheritanceActionModule,
  grantSPListRoleAssignmentActionModule,
  removeSPListRoleAssignmentActionModule,
} from "./permissions";
```

Append the modules in this order:

```ts
breakSPSiteRoleInheritanceActionModule,
resetSPSiteRoleInheritanceActionModule,
grantSPSiteRoleAssignmentActionModule,
removeSPSiteRoleAssignmentActionModule,
breakSPListRoleInheritanceActionModule,
resetSPListRoleInheritanceActionModule,
grantSPListRoleAssignmentActionModule,
removeSPListRoleAssignmentActionModule,
```

Modify `site-subactions-schema.ts` to include only the four site modules in `siteSubactionSchemas`. Modify `list-subactions-schema.ts` to include only the four list modules in `listSubactionSchemas`.

Modify `schemas.ts` to export all eight schemas and payload types from `./permissions`.

Modify `actions/sharepoint/index.ts` so consumers can import the permissions family from the SharePoint barrel. Add this export after the list-view action exports:

```ts
export * from "./permissions";
```

- [ ] **Step 7: Run smoke and build**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build:m365
```

Expected: smoke still fails only where runtime-specific tests have not yet been added, or passes the schema/placement assertions if only Task 1 tests exist. `build:m365` must pass.

- [ ] **Step 8: Commit schema and catalog wiring**

```sh
git add packages/m365-actionable-provisioning/src/actions/sharepoint packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: add SharePoint permission action contracts"
```

---

### Task 3: Implement Permission Domain Helpers With Fake-Shape Smoke Tests

**Files:**
- Create/Modify domain helper files under `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/`
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add smoke tests for role mapping, inheritance reads, role lookup, and binding checks**

Add imports:

```ts
import {
  buildEntraGroupClaim,
  getRoleTypeKind,
  getSecurableHasUniqueRoleAssignments,
  hasRoleAssignmentBinding,
  resolvePrincipalId,
  resolveRoleDefinitionId,
} from "../src/actions/sharepoint/domains/permissions";
```

Add these helpers near the existing fake builders:

```ts
function roleDefinitionsFrom(roles: readonly { Id: number; Name: string; RoleTypeKind: number }[]) {
  return {
    getById: (id: number) => async () => {
      const role = roles.find((item) => item.Id === id);
      if (!role) throw Object.assign(new Error("role not found"), { status: 404 });
      return role;
    },
    getByType: (kind: number) => async () => {
      const role = roles.find((item) => item.RoleTypeKind === kind);
      if (!role) throw Object.assign(new Error("role not found"), { status: 404 });
      return role;
    },
    filter: (filter: string) => ({
      top: (top: number) => ({
        select: (...fields: string[]) => async () => {
          assert(top === 2, "Role name lookup should request top(2) to detect ambiguity");
          assertStringArrayEqual(fields, ["Id", "Name", "RoleTypeKind"], "Role lookup should select stable role fields");
          const match = filter.match(/^Name eq '(.+)'$/);
          if (!match) throw new Error(`Unexpected role filter: ${filter}`);
          const expectedName = match[1].replace(/''/g, "'");
          return roles.filter((item) => item.Name === expectedName);
        },
      }),
    }),
  };
}

function graphGroupsFrom(groups: readonly { id: string; displayName?: string; mailNickname?: string; groupTypes?: readonly string[] }[]) {
  return {
    groups: {
      filter: (filter: string) => ({
        top: (top: number) => ({
          select: (...fields: string[]) => async () => {
            assert(top === 2, "Graph group lookup should request top(2) to detect ambiguity");
            assertStringArrayEqual(fields, ["id", "displayName", "mailNickname", "groupTypes"], "Graph group lookup should select stable fields");
            const displayName = filter.match(/displayName eq '((?:''|[^'])*)'/)?.[1]?.replace(/''/g, "'");
            const mailNickname = filter.match(/mailNickname eq '((?:''|[^'])*)'/)?.[1]?.replace(/''/g, "'");
            const requireUnified = filter.includes("groupTypes/any");
            return groups.filter((group) => {
              const nameMatches = displayName === undefined || group.displayName === displayName;
              const nickMatches = mailNickname === undefined || group.mailNickname === mailNickname;
              const unifiedMatches = !requireUnified || group.groupTypes?.includes("Unified");
              return nameMatches && nickMatches && unifiedMatches;
            });
          },
        }),
      }),
    },
  };
}

function roleAssignmentsFrom(bindingsByPrincipal: Record<number, readonly number[]>) {
  return {
    getById: (principalId: number) => ({
      bindings: async () => {
        const bindings = bindingsByPrincipal[principalId];
        if (!bindings) throw Object.assign(new Error("role assignment not found"), { status: 404 });
        return bindings.map((Id) => ({ Id }));
      },
    }),
  };
}
```

Add this assertion function:

```ts
async function assertSharePointPermissionDomainHelpers(): Promise<void> {
  assert(getRoleTypeKind("read") === 2, "read roleType should map to RoleTypeKind.Reader");
  assert(getRoleTypeKind("contribute") === 3, "contribute roleType should map to RoleTypeKind.Contributor");
  assert(getRoleTypeKind("design") === 4, "design roleType should map to RoleTypeKind.WebDesigner");
  assert(getRoleTypeKind("fullControl") === 5, "fullControl roleType should map to RoleTypeKind.Administrator");
  assert(getRoleTypeKind("edit") === 6, "edit roleType should map to RoleTypeKind.Editor");

  const claim = buildEntraGroupClaim("7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7");
  assert(
    claim === "c:0o.c|federateddirectoryclaimprovider|7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7",
    "Entra group claim should use the SharePoint federated directory claim provider"
  );

  const uniqueTarget = {
    select: (...fields: string[]) => async () => {
      assertStringArrayEqual(fields, ["HasUniqueRoleAssignments"], "Inheritance check should select HasUniqueRoleAssignments");
      return { HasUniqueRoleAssignments: true };
    },
  };
  assert(await getSecurableHasUniqueRoleAssignments(uniqueTarget as never), "Inheritance check should read unique role assignment state");

  const web = {
    roleDefinitions: roleDefinitionsFrom([
      { Id: 1073741826, Name: "Read", RoleTypeKind: 2 },
      { Id: 1073741827, Name: "Contribute", RoleTypeKind: 3 },
      { Id: 123, Name: "O'Brien Role", RoleTypeKind: 0 },
    ]),
    ensureUser: async (loginName: string) => ({ Id: loginName.includes("missing") ? undefined : 42, LoginName: loginName }),
    siteGroups: {
      getByName: (name: string) => async () => ({ Id: name === "Project Members" ? 77 : undefined, Title: name }),
    },
  };

  const roleByName = await resolveRoleDefinitionId(web as never, { roleName: "O'Brien Role" });
  assert(roleByName === 123, "Role name lookup should support apostrophes through escaped filter queries");
  const roleByType = await resolveRoleDefinitionId(web as never, { roleType: "contribute" });
  assert(roleByType === 1073741827, "Role type lookup should resolve to the SharePoint role definition id");

  const loginPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "loginName",
    principal: "i:0#.f|membership|user@contoso.com",
    allowEnsureUser: true,
  });
  assert(loginPrincipal === 42, "loginName principal resolution should use ensureUser");

  const spGroupPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "spGroupName",
    principal: "Project Members",
    allowEnsureUser: true,
  });
  assert(spGroupPrincipal === 77, "spGroupName principal resolution should use siteGroups.getByName");

  const graphPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: graphGroupsFrom([
      { id: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7", mailNickname: "project-members", groupTypes: ["Unified"] },
    ]) as never,
    principalType: "m365GroupMailNickname",
    principal: "project-members",
    allowEnsureUser: true,
  });
  assert(graphPrincipal === 42, "m365GroupMailNickname principal resolution should resolve Graph id then ensure the SharePoint claim");

  const hasBinding = await hasRoleAssignmentBinding(roleAssignmentsFrom({ 42: [1073741827] }) as never, 42, 1073741827);
  assert(hasBinding, "Role assignment binding check should detect existing binding");
  const missingBinding = await hasRoleAssignmentBinding(roleAssignmentsFrom({}) as never, 42, 1073741827);
  assert(!missingBinding, "Role assignment binding check should treat missing role assignment as absent");
}
```

Call it from the main async smoke flow:

```ts
await assertSharePointPermissionDomainHelpers();
```

- [ ] **Step 2: Run smoke to verify helper tests fail**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL with missing helper exports.

- [ ] **Step 3: Implement permission errors**

Create `errors.ts`:

```ts
export type PermissionResolutionReason =
  | "not_found"
  | "ambiguous"
  | "missing_prerequisite";

export class PermissionResolutionError extends Error {
  readonly reason: PermissionResolutionReason;
  readonly details?: unknown;

  constructor(reason: PermissionResolutionReason, message: string, details?: unknown) {
    super(message);
    this.name = "PermissionResolutionError";
    this.reason = reason;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;
  if (typeof error.status === "number") return error.status;
  const response = error.response;
  if (isRecord(response) && typeof response.status === "number") return response.status;
  return undefined;
}

export function isNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export function isPermissionResolutionError(error: unknown): error is PermissionResolutionError {
  return error instanceof PermissionResolutionError;
}
```

- [ ] **Step 4: Implement target helpers**

Create `securable-target.ts`:

```ts
import type { IList } from "@pnp/sp/lists";
import type { IWeb } from "@pnp/sp/webs";
import type { M365Scope } from "../../../../runtime";

import "@pnp/sp/security/web";
import "@pnp/sp/security/list";

export type PermissionTargetKind = "site" | "list";

export type PermissionSecurableTarget = Readonly<{
  kind: PermissionTargetKind;
  resource: string;
  web: IWeb;
  target: IWeb | IList;
  scopeDelta: Partial<M365Scope>;
}>;

export function resolveSitePermissionTarget(scope: M365Scope): PermissionSecurableTarget | undefined {
  if (!scope.web) return undefined;
  return {
    kind: "site",
    resource: scope.webUrl ?? scope.siteUrl ?? "site",
    web: scope.web,
    target: scope.web,
    scopeDelta: {
      ...(scope.web !== undefined ? { web: scope.web } : {}),
      ...(scope.siteUrl !== undefined ? { siteUrl: scope.siteUrl } : {}),
      ...(scope.webUrl !== undefined ? { webUrl: scope.webUrl } : {}),
    },
  };
}

export function resolveListPermissionTarget(scope: M365Scope): PermissionSecurableTarget | undefined {
  if (!scope.web || !scope.list) return undefined;
  return {
    kind: "list",
    resource: scope.listName ?? "list",
    web: scope.web,
    target: scope.list,
    scopeDelta: {
      ...(scope.web !== undefined ? { web: scope.web } : {}),
      ...(scope.list !== undefined ? { list: scope.list } : {}),
      ...(scope.webUrl !== undefined ? { webUrl: scope.webUrl } : {}),
      ...(scope.listName !== undefined ? { listName: scope.listName } : {}),
    },
  };
}

export async function getSecurableHasUniqueRoleAssignments(
  target: Pick<IWeb, "select"> | Pick<IList, "select">
): Promise<boolean> {
  const info = await target.select("HasUniqueRoleAssignments")<{ HasUniqueRoleAssignments?: boolean }>();
  return info.HasUniqueRoleAssignments === true;
}
```

- [ ] **Step 5: Implement role resolution**

Create `role-resolution.ts`:

```ts
import type { IWeb } from "@pnp/sp/webs";
import type { PermissionRoleType } from "./schema";
import { escapeODataStringLiteral } from "../lists/list-lookup";
import { PermissionResolutionError, isNotFoundError } from "./errors";
import { roleTypeKindByPermissionRoleType } from "./schema";

import "@pnp/sp/security/web";

export type RoleReference = Readonly<{
  roleId?: number;
  roleName?: string;
  roleType?: PermissionRoleType;
}>;

type RoleDefinitionInfo = Readonly<{
  Id?: number;
  Name?: string;
  RoleTypeKind?: number;
}>;

export function getRoleTypeKind(roleType: PermissionRoleType): 2 | 3 | 4 | 5 | 6 {
  return roleTypeKindByPermissionRoleType[roleType];
}

function getResolvedRoleId(info: RoleDefinitionInfo, reference: RoleReference): number {
  if (typeof info.Id === "number") return info.Id;
  throw new PermissionResolutionError("not_found", "Role definition did not include an Id", { reference, info });
}

export async function resolveRoleDefinitionId(web: IWeb, reference: RoleReference): Promise<number> {
  try {
    if (reference.roleId !== undefined) {
      const info = await web.roleDefinitions.getById(reference.roleId)() as RoleDefinitionInfo;
      return getResolvedRoleId(info, reference);
    }

    if (reference.roleType !== undefined) {
      const info = await web.roleDefinitions.getByType(getRoleTypeKind(reference.roleType))() as RoleDefinitionInfo;
      return getResolvedRoleId(info, reference);
    }

    if (reference.roleName !== undefined) {
      const safeName = escapeODataStringLiteral(reference.roleName);
      const matches = await web.roleDefinitions
        .filter(`Name eq '${safeName}'`)
        .top(2)
        .select("Id", "Name", "RoleTypeKind")<RoleDefinitionInfo[]>();
      if (matches.length > 1) {
        throw new PermissionResolutionError("ambiguous", `Role name '${reference.roleName}' matched multiple role definitions`, {
          roleName: reference.roleName,
          matches,
        });
      }
      const match = matches[0];
      if (!match) throw new PermissionResolutionError("not_found", `Role '${reference.roleName}' was not found`, { roleName: reference.roleName });
      return getResolvedRoleId(match, reference);
    }
  } catch (error) {
    if (error instanceof PermissionResolutionError) throw error;
    if (isNotFoundError(error)) {
      throw new PermissionResolutionError("not_found", "Role definition was not found", { reference });
    }
    throw error;
  }

  throw new PermissionResolutionError("not_found", "Role reference is missing", { reference });
}
```

- [ ] **Step 6: Implement principal resolution**

Create `principal-resolution.ts`:

```ts
import type { GraphFI } from "@pnp/graph";
import type { IWeb } from "@pnp/sp/webs";
import type { PermissionPrincipalType } from "./schema";
import { escapeODataStringLiteral } from "../lists/list-lookup";
import { PermissionResolutionError, isNotFoundError } from "./errors";

import "@pnp/graph/groups";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/site-users/web";

export type PrincipalReference = Readonly<{
  principalType: PermissionPrincipalType;
  principal: string;
}>;

type GraphGroupInfo = Readonly<{
  id?: string;
  displayName?: string;
  mailNickname?: string;
  groupTypes?: readonly string[];
}>;

export type ResolvePrincipalArgs = PrincipalReference & Readonly<{
  web: IWeb;
  graphClient?: GraphFI;
  allowEnsureUser: boolean;
}>;

export function buildEntraGroupClaim(groupId: string): string {
  return `c:0o.c|federateddirectoryclaimprovider|${groupId}`;
}

function getPrincipalId(info: { Id?: number }, reference: PrincipalReference): number {
  if (typeof info.Id === "number") return info.Id;
  throw new PermissionResolutionError("not_found", "Principal resolution did not include an Id", { reference, info });
}

async function ensurePrincipal(web: IWeb, loginName: string, reference: PrincipalReference, allowEnsureUser: boolean): Promise<number> {
  if (!allowEnsureUser) {
    try {
      const info = await web.siteUsers.getByLoginName(loginName)();
      return getPrincipalId(info, reference);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new PermissionResolutionError("not_found", "Principal is not materialized in the site collection", { reference, loginName });
      }
      throw error;
    }
  }

  const info = await web.ensureUser(loginName);
  return getPrincipalId(info, reference);
}

async function resolveGraphGroupId(graphClient: GraphFI | undefined, reference: PrincipalReference): Promise<string> {
  if (!graphClient) {
    throw new PermissionResolutionError("missing_prerequisite", "GraphFI instance not available for group principal lookup", {
      principalType: reference.principalType,
      principal: reference.principal,
    });
  }

  const safePrincipal = escapeODataStringLiteral(reference.principal);
  const filter = reference.principalType === "m365GroupMailNickname"
    ? `mailNickname eq '${safePrincipal}' and groupTypes/any(c:c eq 'Unified')`
    : reference.principalType === "m365GroupName"
      ? `displayName eq '${safePrincipal}' and groupTypes/any(c:c eq 'Unified')`
      : `displayName eq '${safePrincipal}'`;

  const matches = await graphClient.groups
    .filter(filter)
    .top(2)
    .select("id", "displayName", "mailNickname", "groupTypes")<GraphGroupInfo[]>();

  if (matches.length > 1) {
    throw new PermissionResolutionError("ambiguous", `Group principal '${reference.principal}' matched multiple groups`, {
      principalType: reference.principalType,
      principal: reference.principal,
      matches,
    });
  }

  const match = matches[0];
  if (!match?.id) {
    throw new PermissionResolutionError("not_found", `Group principal '${reference.principal}' was not found`, {
      principalType: reference.principalType,
      principal: reference.principal,
    });
  }

  return match.id;
}

export async function resolvePrincipalId(args: ResolvePrincipalArgs): Promise<number> {
  const reference = { principalType: args.principalType, principal: args.principal };

  if (args.principalType === "spGroupName") {
    try {
      const info = await args.web.siteGroups.getByName(args.principal)();
      return getPrincipalId(info, reference);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new PermissionResolutionError("not_found", `SharePoint group '${args.principal}' was not found`, reference);
      }
      throw error;
    }
  }

  if (args.principalType === "entraGroupId" || args.principalType === "m365GroupId") {
    return ensurePrincipal(args.web, buildEntraGroupClaim(args.principal), reference, args.allowEnsureUser);
  }

  if (
    args.principalType === "entraGroupName" ||
    args.principalType === "m365GroupName" ||
    args.principalType === "m365GroupMailNickname"
  ) {
    const groupId = await resolveGraphGroupId(args.graphClient, reference);
    return ensurePrincipal(args.web, buildEntraGroupClaim(groupId), reference, args.allowEnsureUser);
  }

  return ensurePrincipal(args.web, args.principal, reference, args.allowEnsureUser);
}
```

- [ ] **Step 7: Implement binding helpers**

Create `role-assignments.ts`:

```ts
import type { IRoleAssignments } from "@pnp/sp/security";
import { isNotFoundError } from "./errors";

import "@pnp/sp/security";

type RoleBindingInfo = Readonly<{
  Id?: number;
}>;

export async function hasRoleAssignmentBinding(
  roleAssignments: IRoleAssignments,
  principalId: number,
  roleDefId: number
): Promise<boolean> {
  try {
    const bindings = await roleAssignments.getById(principalId).bindings<RoleBindingInfo[]>();
    return bindings.some((binding) => binding.Id === roleDefId);
  } catch (error) {
    if (isNotFoundError(error)) return false;
    throw error;
  }
}

export async function addRoleAssignmentBinding(
  roleAssignments: IRoleAssignments,
  principalId: number,
  roleDefId: number
): Promise<void> {
  await roleAssignments.add(principalId, roleDefId);
}

export async function removeRoleAssignmentBinding(
  roleAssignments: IRoleAssignments,
  principalId: number,
  roleDefId: number
): Promise<void> {
  await roleAssignments.remove(principalId, roleDefId);
}
```

- [ ] **Step 8: Create domain barrel**

Create `index.ts`:

```ts
export {
  PermissionResolutionError,
  getErrorStatus,
  isNotFoundError,
  isPermissionResolutionError,
} from "./errors";
export {
  permissionPrincipalTypes,
  permissionRoleTypes,
  roleTypeKindByPermissionRoleType,
  countRoleReferences,
  createBreakRoleInheritanceSchema,
  createGrantRoleAssignmentSchema,
  createRemoveRoleAssignmentSchema,
  createResetRoleInheritanceSchema,
  type PermissionPrincipalType,
  type PermissionRoleType,
} from "./schema";
export {
  getSecurableHasUniqueRoleAssignments,
  resolveListPermissionTarget,
  resolveSitePermissionTarget,
  type PermissionSecurableTarget,
  type PermissionTargetKind,
} from "./securable-target";
export {
  buildEntraGroupClaim,
  resolvePrincipalId,
  type PrincipalReference,
  type ResolvePrincipalArgs,
} from "./principal-resolution";
export {
  getRoleTypeKind,
  resolveRoleDefinitionId,
  type RoleReference,
} from "./role-resolution";
export {
  addRoleAssignmentBinding,
  hasRoleAssignmentBinding,
  removeRoleAssignmentBinding,
} from "./role-assignments";
```

- [ ] **Step 9: Run smoke and build**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build:m365
```

Expected: helper smoke assertions pass. Action runtime still returns `unsupported` until Task 4 replaces the temporary handlers.

- [ ] **Step 10: Commit helper domain**

```sh
git add packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: add SharePoint permission domain helpers"
```

---

### Task 4: Implement Shared Action Runtime For Break Reset Grant Remove

**Files:**
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/_shared/action-factory.ts`
- Modify: all eight permission `action.ts` files
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add action runtime smoke tests**

Add this smoke helper:

```ts
function permissionTargetFrom(options: {
  unique: boolean;
  bindingsByPrincipal?: Record<number, readonly number[]>;
  onBreak?: (copyRoleAssignments: boolean, clearSubscopes: boolean) => void;
  onReset?: () => void;
  onAdd?: (principalId: number, roleDefId: number) => void;
  onRemove?: (principalId: number, roleDefId: number) => void;
}) {
  const bindingsByPrincipal = options.bindingsByPrincipal ?? {};
  return {
    select: (...fields: string[]) => async () => {
      assertStringArrayEqual(fields, ["HasUniqueRoleAssignments"], "Permission action should read HasUniqueRoleAssignments");
      return { HasUniqueRoleAssignments: options.unique };
    },
    breakRoleInheritance: async (copyRoleAssignments: boolean, clearSubscopes: boolean) => {
      options.onBreak?.(copyRoleAssignments, clearSubscopes);
    },
    resetRoleInheritance: async () => {
      options.onReset?.();
    },
    roleAssignments: {
      ...roleAssignmentsFrom(bindingsByPrincipal),
      add: async (principalId: number, roleDefId: number) => {
        options.onAdd?.(principalId, roleDefId);
      },
      remove: async (principalId: number, roleDefId: number) => {
        options.onRemove?.(principalId, roleDefId);
      },
    },
  };
}

async function assertSharePointPermissionActionRuntime(): Promise<void> {
  const web = {
    ...permissionTargetFrom({ unique: true }),
    roleDefinitions: roleDefinitionsFrom([
      { Id: 1073741827, Name: "Contribute", RoleTypeKind: 3 },
    ]),
    ensureUser: async () => ({ Id: 42 }),
    siteGroups: {
      getByName: () => async () => ({ Id: 77 }),
    },
  } as unknown as NonNullable<M365Scope["web"]>;

  let breakArgs: readonly [boolean, boolean] | undefined;
  const inheritedList = permissionTargetFrom({
    unique: false,
    onBreak: (copyRoleAssignments, clearSubscopes) => {
      breakArgs = [copyRoleAssignments, clearSubscopes];
    },
    onAdd: (principalId, roleDefId) => {
      assert(principalId === 77, "grantSPListRoleAssignment should add the resolved principal id");
      assert(roleDefId === 1073741827, "grantSPListRoleAssignment should add the resolved role definition id");
    },
  }) as unknown as NonNullable<M365Scope["list"]>;

  const grantWithBreak = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: inheritedList, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
        breakRoleInheritance: true,
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);

  assert(grantWithBreak.result?.outcome === "executed", "grantSPListRoleAssignment should execute when it breaks inherited permissions explicitly");
  assertStringArrayEqual(
    (breakArgs ?? []).map(String),
    ["true", "false"],
    "grantSPListRoleAssignment should use safe breakRoleInheritance defaults"
  );

  const inheritedGrantSkip = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);
  assert(inheritedGrantSkip.result?.outcome === "skipped", "grantSPListRoleAssignment should skip inherited targets without explicit break");
  assert(inheritedGrantSkip.result?.reason === "missing_prerequisite", "grantSPListRoleAssignment should report missing_prerequisite for inherited targets without explicit break");

  const removeMissing = await new RemoveSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: permissionTargetFrom({ unique: true }) as unknown as NonNullable<M365Scope["list"]>, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "removeSPListRoleAssignment",
      payload: {
        verb: "removeSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPListRoleAssignmentAction["handler"]>[0]);
  assert(removeMissing.result?.outcome === "skipped", "removeSPListRoleAssignment should skip missing bindings");
  assert(removeMissing.result?.reason === "not_found", "removeSPListRoleAssignment should report not_found for missing bindings");

  let resetCalled = false;
  const resetResult = await new ResetSPSiteRoleInheritanceAction().handler({
    scopeIn: {
      web: {
        ...web,
        ...permissionTargetFrom({
          unique: true,
          onReset: () => {
            resetCalled = true;
          },
        }),
      } as unknown as NonNullable<M365Scope["web"]>,
      webUrl: "https://contoso.sharepoint.com/sites/project",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "resetSPSiteRoleInheritance",
      payload: { verb: "resetSPSiteRoleInheritance" },
    },
  } as Parameters<ResetSPSiteRoleInheritanceAction["handler"]>[0]);
  assert(resetResult.result?.outcome === "executed", "resetSPSiteRoleInheritance should execute for unique permissions");
  assert(resetCalled, "resetSPSiteRoleInheritance should call resetRoleInheritance");
}
```

Call it:

```ts
await assertSharePointPermissionActionRuntime();
```

- [ ] **Step 2: Run smoke to verify runtime tests fail**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: FAIL because the temporary handlers return `unsupported`.

- [ ] **Step 3: Implement shared action factory**

Create `permissions/_shared/action-factory.ts`:

```ts
import { PermissionKind } from "@pnp/sp/security";
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  PermissionResolutionError,
  addRoleAssignmentBinding,
  getSecurableHasUniqueRoleAssignments,
  hasRoleAssignmentBinding,
  isPermissionResolutionError,
  removeRoleAssignmentBinding,
  resolveListPermissionTarget,
  resolvePrincipalId,
  resolveRoleDefinitionId,
  resolveSitePermissionTarget,
  type PermissionSecurableTarget,
} from "../../domains/permissions";

import "@pnp/sp/security";
import "@pnp/sp/security/list";
import "@pnp/sp/security/web";

type PermissionVerb = string;
type PermissionPayload = Record<string, unknown> & {
  verb: PermissionVerb;
  principalType?: string;
  principal?: string;
  roleId?: number;
  roleName?: string;
  roleType?: "read" | "contribute" | "edit" | "design" | "fullControl";
  breakRoleInheritance?: boolean;
  copyRoleAssignments?: boolean;
  clearSubscopes?: boolean;
};

type TargetKind = "site" | "list";
type OperationKind = "break" | "reset" | "grant" | "remove";

type PermissionActionOptions<Verb extends PermissionVerb, Schema> = Readonly<{
  verb: Verb;
  schema: Schema;
  targetKind: TargetKind;
  operation: OperationKind;
}>;

function getTarget(kind: TargetKind, scope: M365Scope): PermissionSecurableTarget | undefined {
  return kind === "site" ? resolveSitePermissionTarget(scope) : resolveListPermissionTarget(scope);
}

function getMissingScopeMessage(kind: TargetKind): string {
  return kind === "site" ? "SharePoint site web scope not available" : "SharePoint list scope not available";
}

function getBreakOptions(payload: PermissionPayload): { copyRoleAssignments: boolean; clearSubscopes: boolean } {
  return {
    copyRoleAssignments: payload.copyRoleAssignments ?? true,
    clearSubscopes: payload.clearSubscopes ?? false,
  };
}

function getAssignmentResource(payload: PermissionPayload): string {
  const role = payload.roleId ?? payload.roleName ?? payload.roleType ?? "role";
  return `${String(payload.principal ?? "principal")} -> ${String(role)}`;
}

function resolutionToCompliance(error: PermissionResolutionError, resource: string): ComplianceActionCheckResult<M365Scope> {
  if (error.reason === "not_found") {
    return nonCompliant({ resource, reason: "not_found", message: error.message, details: error.details });
  }
  return unverifiable({ resource, reason: error.reason, message: error.message, details: error.details });
}

export class SharePointPermissionAction<
  Verb extends PermissionVerb,
  Schema extends { parse: (value: unknown) => unknown }
> extends ActionDefinition<Verb, Schema, M365Scope, ProvisioningResultLight, M365Clients> {
  readonly verb: Verb;
  readonly actionSchema: Schema;
  readonly requiredClients = ["spfi"] as const;
  private readonly targetKind: TargetKind;
  private readonly operation: OperationKind;

  constructor(options: PermissionActionOptions<Verb, Schema>) {
    super();
    this.verb = options.verb;
    this.actionSchema = options.schema;
    this.targetKind = options.targetKind;
    this.operation = options.operation;
  }

  async checkPermissions(ctx: M365RuntimeContext<PermissionPayload>): Promise<PermissionCheckResult> {
    if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
    const target = getTarget(this.targetKind, ctx.scopeIn);
    if (!target) return { decision: "unknown", message: `${getMissingScopeMessage(this.targetKind)} for permission probe` };

    try {
      const canManagePermissions = await target.target.currentUserHasPermissions(PermissionKind.ManagePermissions);
      if (!canManagePermissions) {
        return {
          decision: "deny",
          message: `Access denied: current user lacks ManagePermissions on target. target=${target.resource}`,
        };
      }
      return {
        decision: "allow",
        message: `Permission probe passed (ManagePermissions). target=${target.resource}`,
      };
    } catch (error) {
      return {
        decision: "unknown",
        message: `Permission probe could not be completed. target=${target.resource}. error=${String(error)}`,
      };
    }
  }

  async handler(ctx: M365RuntimeContext<PermissionPayload>): Promise<M365ActionResult> {
    const target = getTarget(this.targetKind, ctx.scopeIn);
    if (!target) return actionSkipped(getMissingScopeMessage(this.targetKind), "missing_prerequisite");

    if (this.operation === "break") {
      const unique = await getSecurableHasUniqueRoleAssignments(target.target);
      if (unique) return actionSkipped(target.resource, "already_exists", target.scopeDelta);
      const options = getBreakOptions(ctx.action.payload);
      await target.target.breakRoleInheritance(options.copyRoleAssignments, options.clearSubscopes);
      return actionExecuted(target.resource, target.scopeDelta);
    }

    if (this.operation === "reset") {
      const unique = await getSecurableHasUniqueRoleAssignments(target.target);
      if (!unique) return actionSkipped(target.resource, "no_changes", target.scopeDelta);
      await target.target.resetRoleInheritance();
      return actionExecuted(target.resource, target.scopeDelta);
    }

    const resource = getAssignmentResource(ctx.action.payload);
    let principalId: number;
    let roleDefId: number;
    try {
      principalId = await resolvePrincipalId({
        web: target.web,
        graphClient: ctx.clients.graphClient,
        principalType: ctx.action.payload.principalType as never,
        principal: String(ctx.action.payload.principal),
        allowEnsureUser: true,
      });
      roleDefId = await resolveRoleDefinitionId(target.web, ctx.action.payload);
    } catch (error) {
      if (isPermissionResolutionError(error) && error.reason === "missing_prerequisite") {
        return actionSkipped(resource, "missing_prerequisite", target.scopeDelta);
      }
      throw error;
    }

    const unique = await getSecurableHasUniqueRoleAssignments(target.target);
    if (!unique) {
      if (this.operation === "grant" && ctx.action.payload.breakRoleInheritance === true) {
        const options = getBreakOptions(ctx.action.payload);
        await target.target.breakRoleInheritance(options.copyRoleAssignments, options.clearSubscopes);
      } else {
        return actionSkipped(resource, "missing_prerequisite", target.scopeDelta);
      }
    }

    const hasBinding = await hasRoleAssignmentBinding(target.target.roleAssignments, principalId, roleDefId);
    if (this.operation === "grant") {
      if (hasBinding) return actionSkipped(resource, "already_exists", target.scopeDelta);
      await addRoleAssignmentBinding(target.target.roleAssignments, principalId, roleDefId);
      return actionExecuted(resource, target.scopeDelta);
    }

    if (!hasBinding) return actionSkipped(resource, "not_found", target.scopeDelta);
    await removeRoleAssignmentBinding(target.target.roleAssignments, principalId, roleDefId);
    return actionExecuted(resource, target.scopeDelta);
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, PermissionPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const target = getTarget(this.targetKind, ctx.scopeIn);
    if (!target) {
      return unverifiable({
        resource: getMissingScopeMessage(this.targetKind),
        reason: "missing_prerequisite",
        message: getMissingScopeMessage(this.targetKind),
      });
    }

    try {
      const unique = await getSecurableHasUniqueRoleAssignments(target.target);
      if (this.operation === "break") {
        return unique
          ? compliant({ resource: target.resource, scopeDelta: target.scopeDelta })
          : nonCompliant({ resource: target.resource, reason: "inherited_permissions" });
      }
      if (this.operation === "reset") {
        return !unique
          ? compliant({ resource: target.resource, scopeDelta: target.scopeDelta })
          : nonCompliant({ resource: target.resource, reason: "unique_permissions" });
      }

      const resource = getAssignmentResource(ctx.action.payload);
      let principalId: number;
      let roleDefId: number;
      try {
        principalId = await resolvePrincipalId({
          web: target.web,
          graphClient: ctx.clients.graphClient,
          principalType: ctx.action.payload.principalType as never,
          principal: String(ctx.action.payload.principal),
          allowEnsureUser: false,
        });
        roleDefId = await resolveRoleDefinitionId(target.web, ctx.action.payload);
      } catch (error) {
        if (isPermissionResolutionError(error)) return resolutionToCompliance(error, resource);
        throw error;
      }

      const hasBinding = await hasRoleAssignmentBinding(target.target.roleAssignments, principalId, roleDefId);
      if (this.operation === "grant") {
        return hasBinding
          ? compliant({ resource, scopeDelta: target.scopeDelta })
          : nonCompliant({ resource, reason: "missing_binding" });
      }

      return !hasBinding
        ? compliant({ resource, scopeDelta: target.scopeDelta })
        : nonCompliant({ resource, reason: "binding_present" });
    } catch (error) {
      return unverifiableError(target.resource, error);
    }
  }
}
```

- [ ] **Step 4: Replace each action class with factory subclass**

For each `action.ts`, extend `SharePointPermissionAction`. Example for `grant-sp-list-role-assignment/action.ts`:

```ts
import { SharePointPermissionAction } from "../_shared/action-factory";

import { grantSPListRoleAssignmentSchema } from "./schema";

export class GrantSPListRoleAssignmentAction extends SharePointPermissionAction<
  "grantSPListRoleAssignment",
  typeof grantSPListRoleAssignmentSchema
> {
  constructor() {
    super({
      verb: "grantSPListRoleAssignment",
      schema: grantSPListRoleAssignmentSchema,
      targetKind: "list",
      operation: "grant",
    });
  }
}
```

Use these exact mappings:

```text
breakSPSiteRoleInheritance -> targetKind "site", operation "break"
resetSPSiteRoleInheritance -> targetKind "site", operation "reset"
grantSPSiteRoleAssignment -> targetKind "site", operation "grant"
removeSPSiteRoleAssignment -> targetKind "site", operation "remove"
breakSPListRoleInheritance -> targetKind "list", operation "break"
resetSPListRoleInheritance -> targetKind "list", operation "reset"
grantSPListRoleAssignment -> targetKind "list", operation "grant"
removeSPListRoleAssignment -> targetKind "list", operation "remove"
```

- [ ] **Step 5: Run smoke and build**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build:m365
```

Expected: smoke passes all local runtime helper tests. `build:m365` passes.

- [ ] **Step 6: Commit runtime implementation**

```sh
git add packages/m365-actionable-provisioning/src/actions/sharepoint/permissions packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: implement SharePoint permission actions"
```

---

### Task 5: Add Compliance-Specific Smoke Coverage

**Files:**
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add compliance assertions**

Add this function:

```ts
async function assertSharePointPermissionCompliance(): Promise<void> {
  const web = {
    ...permissionTargetFrom({ unique: true, bindingsByPrincipal: { 77: [1073741827] } }),
    roleDefinitions: roleDefinitionsFrom([{ Id: 1073741827, Name: "Contribute", RoleTypeKind: 3 }]),
    siteUsers: {
      getByLoginName: () => async () => ({ Id: 77 }),
    },
    ensureUser: async () => {
      throw new Error("Compliance should not call ensureUser");
    },
    siteGroups: {
      getByName: () => async () => ({ Id: 77 }),
    },
  } as unknown as NonNullable<M365Scope["web"]>;

  const grantCompliance = await new GrantSPSiteRoleAssignmentAction().checkCompliance({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/project" },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "grantSPSiteRoleAssignment",
      payload: {
        verb: "grantSPSiteRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPSiteRoleAssignmentAction["checkCompliance"]>[0]);
  assert(grantCompliance.outcome === "compliant", "grantSPSiteRoleAssignment compliance should be compliant when binding exists");

  const removeCompliance = await new RemoveSPSiteRoleAssignmentAction().checkCompliance({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/project" },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "removeSPSiteRoleAssignment",
      payload: {
        verb: "removeSPSiteRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPSiteRoleAssignmentAction["checkCompliance"]>[0]);
  assert(removeCompliance.outcome === "non_compliant", "removeSPSiteRoleAssignment compliance should be non-compliant when binding exists");
  assert(removeCompliance.reason === "binding_present", "removeSPSiteRoleAssignment compliance should report binding_present");

  const missingGraphCompliance = await new GrantSPSiteRoleAssignmentAction().checkCompliance({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/project" },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "grantSPSiteRoleAssignment",
      payload: {
        verb: "grantSPSiteRoleAssignment",
        principalType: "m365GroupMailNickname",
        principal: "project-members",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPSiteRoleAssignmentAction["checkCompliance"]>[0]);
  assert(missingGraphCompliance.outcome === "unverifiable", "Graph-backed principal compliance should be unverifiable without graphClient");
  assert(missingGraphCompliance.reason === "missing_prerequisite", "Graph-backed principal compliance should report missing_prerequisite without graphClient");

  const breakCompliance = await new BreakSPListRoleInheritanceAction().checkCompliance({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "breakSPListRoleInheritance",
      payload: { verb: "breakSPListRoleInheritance" },
    },
  } as Parameters<BreakSPListRoleInheritanceAction["checkCompliance"]>[0]);
  assert(breakCompliance.outcome === "non_compliant", "breakSPListRoleInheritance compliance should be non-compliant when list inherits permissions");

  const resetCompliance = await new ResetSPListRoleInheritanceAction().checkCompliance({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "resetSPListRoleInheritance",
      payload: { verb: "resetSPListRoleInheritance" },
    },
  } as Parameters<ResetSPListRoleInheritanceAction["checkCompliance"]>[0]);
  assert(resetCompliance.outcome === "compliant", "resetSPListRoleInheritance compliance should be compliant when list inherits permissions");
}
```

Call it:

```ts
await assertSharePointPermissionCompliance();
```

- [ ] **Step 2: Run smoke to verify compliance assertions pass**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```sh
npm run build:m365
```

Expected: PASS.

- [ ] **Step 4: Commit compliance coverage**

```sh
git add packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "test: cover SharePoint permission compliance"
```

---

### Task 6: Update Public Documentation

**Files:**
- Modify: `docs/provisioning-schema.md`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`
- Modify: `packages/m365-actionable-provisioning/README.md`
- Modify: `README.md`

- [ ] **Step 1: Inspect docs for action family listings**

Run:

```sh
rg -n "List Views|Content Type|createSPListView|createSPList|Supported|Action|SharePoint" docs/provisioning-schema.md packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md packages/m365-actionable-provisioning/README.md README.md
```

Expected: output identifies the sections that list action families or examples. Only edit files that contain relevant public action coverage claims.

- [ ] **Step 2: Add permissions section to `docs/provisioning-schema.md`**

Add a section after list/list-view actions or before best practices:

```md
## Permission Actions

Permission actions manage SharePoint role inheritance and explicit role bindings on site and list/library scopes. V1 is additive and targeted: it changes only the declared inheritance state or principal/role binding, and it never removes undeclared role assignments.

Site permission actions are allowed only under `createSPSite` and `modifySPSite`:

```ts
{
  verb: "modifySPSite",
  siteUrl: "https://contoso.sharepoint.com/sites/project",
  subactions: [
    {
      verb: "grantSPSiteRoleAssignment",
      principalType: "spGroupName",
      principal: "Project Owners",
      roleName: "Full Control",
      breakRoleInheritance: true,
      copyRoleAssignments: true,
      clearSubscopes: false
    }
  ]
}
```

List/library permission actions are allowed only under `createSPList` and `modifySPList`:

```ts
{
  verb: "modifySPList",
  listName: "documents",
  subactions: [
    {
      verb: "grantSPListRoleAssignment",
      principalType: "m365GroupMailNickname",
      principal: "project-members",
      roleType: "contribute"
    }
  ]
}
```

Supported verbs:

| Scope | Inheritance | Role assignments |
|-------|-------------|------------------|
| Site | `breakSPSiteRoleInheritance`, `resetSPSiteRoleInheritance` | `grantSPSiteRoleAssignment`, `removeSPSiteRoleAssignment` |
| List/library | `breakSPListRoleInheritance`, `resetSPListRoleInheritance` | `grantSPListRoleAssignment`, `removeSPListRoleAssignment` |

Principal fields:

```ts
principalType:
  | "loginName"
  | "spGroupName"
  | "entraGroupId"
  | "m365GroupId"
  | "entraGroupName"
  | "m365GroupName"
  | "m365GroupMailNickname";
principal: string;
```

Role fields require exactly one of:

```ts
roleId?: number;
roleName?: string;
roleType?: "read" | "contribute" | "edit" | "design" | "fullControl";
```

`grant*RoleAssignment` can break inherited permissions only when `breakRoleInheritance: true` is declared. The public defaults are `copyRoleAssignments: true` and `clearSubscopes: false`.

`reset*RoleInheritance` removes unique local role assignments and returns the target to inherited permissions. Use it only when that destructive behavior is intended.

Group name lookups are convenience features and must resolve to exactly one group. Prefer `entraGroupId`, `m365GroupId`, or `m365GroupMailNickname` for deterministic provisioning.
```

- [ ] **Step 3: Update `ACTIONS.md`**

Add a compact section:

```md
## Permissions V1

Permission actions are subactions only.

Site actions:

- `breakSPSiteRoleInheritance`
- `resetSPSiteRoleInheritance`
- `grantSPSiteRoleAssignment`
- `removeSPSiteRoleAssignment`

List/library actions:

- `breakSPListRoleInheritance`
- `resetSPListRoleInheritance`
- `grantSPListRoleAssignment`
- `removeSPListRoleAssignment`

V1 uses PnPjs SharePoint security APIs. It does not use Graph to write role assignments. Graph is used only for optional Entra/Microsoft 365 group lookup by name or mail nickname.
```

- [ ] **Step 4: Update README files that contain action coverage claims**

If `packages/m365-actionable-provisioning/README.md` or root `README.md` lists supported action families, add one bullet:

```md
- SharePoint site and list/library permissions: break/reset role inheritance plus additive grant/remove role assignments.
```

If a README does not list action coverage, leave it unchanged.

- [ ] **Step 5: Run grep check for stale omissions**

Run:

```sh
rg -n "permission|role assignment|breakSPSiteRoleInheritance|grantSPListRoleAssignment|m365GroupMailNickname" docs packages/m365-actionable-provisioning/README.md README.md
```

Expected: new docs mention the public verbs, flat principal fields, role fields, Graph caveat, and inheritance defaults.

- [ ] **Step 6: Commit docs**

```sh
git add docs/provisioning-schema.md packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md packages/m365-actionable-provisioning/README.md README.md
git commit -m "docs: document SharePoint permission actions"
```

If a README was not modified, omit it from `git add`.

---

### Task 7: Final Validation And Tenant Smoke Checklist

**Files:**
- Modify: `docs/superpowers/specs/2026-06-18-sharepoint-permissions-role-assignments-v1.md` only if implementation findings require a spec correction.
- No source edits unless validation reveals a bug.

- [ ] **Step 1: Run package smoke**

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: PASS. If sandbox returns `listen EPERM` for `tsx`, rerun outside the sandbox with escalation and record that in the final status.

- [ ] **Step 2: Run package build**

Run:

```sh
npm run build:m365
```

Expected: PASS.

- [ ] **Step 3: Run full repo build when package build is green**

Run:

```sh
npm run build
```

Expected: PASS. If SPFx/test app build fails for unrelated environment reasons, capture the exact failing command and error summary.

- [ ] **Step 4: Run public API grep checks**

Run:

```sh
rg -n "grantSPSiteRoleAssignment|removeSPSiteRoleAssignment|breakSPListRoleInheritance|resetSPListRoleInheritance" packages/m365-actionable-provisioning/src docs README.md
```

Expected: verbs appear in source exports, schema composition, smoke harness, and docs. They do not appear in `provisioning-schema.ts` root action schemas.

- [ ] **Step 5: Inspect git status**

Run:

```sh
git status --short
```

Expected: only intentional source/docs changes remain, or clean after commits.

- [ ] **Step 6: Prepare tenant smoke checklist for manual execution**

Add this checklist to the final handoff message:

```md
Tenant smoke still required:
- site grant to an existing SharePoint group;
- site grant to an Entra/Microsoft 365 group by id;
- list grant with `breakRoleInheritance: true`;
- list remove of an existing binding;
- reset list inheritance;
- Graph lookup by `m365GroupMailNickname`;
- ambiguous `displayName` lookup failure path if fixture groups are available.
```

- [ ] **Step 7: Commit validation-only spec correction if one was needed**

If implementation forced a spec correction, run:

```sh
git add docs/superpowers/specs/2026-06-18-sharepoint-permissions-role-assignments-v1.md
git commit -m "docs: align SharePoint permissions spec with implementation"
```

If no spec correction was needed, do not create an empty commit.
