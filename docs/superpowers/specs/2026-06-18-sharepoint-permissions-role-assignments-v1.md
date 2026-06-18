# SharePoint Permissions And Role Assignments V1

## Goal

Add additive, targeted SharePoint permissions provisioning for site and list/library scopes.

V1 supports role inheritance and role assignment operations on the same scoped resources that the current provisioning model already exposes:

- site permissions as subactions of `createSPSite` and `modifySPSite`;
- list/library permissions as subactions of `createSPList` and `modifySPList`.

The design intentionally avoids item, file, folder, subweb, and authoritative ACL enforcement. V1 changes only the explicitly requested inheritance state or principal/role binding.

## Decisions

- V1 is additive/targeted, not authoritative.
- V1 exposes separate action families for site and list targets.
- Site verbs use `SPSite` naming to align with existing `createSPSite` and `modifySPSite` public contracts, even though the PnPjs implementation operates on the scoped root web.
- List/library verbs use `SPList` naming and are list subactions only.
- Permission actions are not allowed as root-level actions.
- `grant*` can break role inheritance only when `breakRoleInheritance: true` is explicitly declared.
- `remove*` is idempotent. A missing binding is skipped with `not_found`, and compliance treats the binding absence as compliant.
- `reset*RoleInheritance` does not require an extra `confirm: true` guard; the verb is explicit enough for V1.
- The public schema is flat rather than nested.
- Role references require exactly one of `roleId`, `roleName`, or `roleType`.
- Principal references use `principalType` plus `principal`.
- `requiredClients` for all permission actions is `["spfi"]`. Graph is required dynamically only for Graph-backed principal lookup types.

## Non-Goals

V1 does not support:

- root-level permission actions;
- item, file, folder, sharing link, or document-level ACL management;
- subweb-specific public verbs;
- authoritative ACL reconciliation or removal of undeclared bindings;
- creating SharePoint groups;
- creating, modifying, or managing membership of Entra ID or Microsoft 365 groups;
- lookup by user email unless supplied as a SharePoint-resolvable `loginName`;
- Graph-based write operations for SharePoint role assignments;
- `shareWith` or simplified sharing roles;
- resolving ambiguous group display names by picking the first match.

## Public Actions

Site subactions:

```ts
breakSPSiteRoleInheritance
resetSPSiteRoleInheritance
grantSPSiteRoleAssignment
removeSPSiteRoleAssignment
```

List subactions:

```ts
breakSPListRoleInheritance
resetSPListRoleInheritance
grantSPListRoleAssignment
removeSPListRoleAssignment
```

Allowed placements:

- `breakSPSiteRoleInheritance`, `resetSPSiteRoleInheritance`, `grantSPSiteRoleAssignment`, and `removeSPSiteRoleAssignment` are allowed only under `createSPSite` and `modifySPSite`.
- `breakSPListRoleInheritance`, `resetSPListRoleInheritance`, `grantSPListRoleAssignment`, and `removeSPListRoleAssignment` are allowed only under `createSPList` and `modifySPList`.
- When a list is nested under a site action, list permission actions live inside that list action, not directly under the site action.

Example:

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
    },
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
  ]
}
```

## Schema

Shared principal schema:

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

Rules:

- `principalType` and `principal` are required for `grant*` and `remove*`.
- `principal` is trimmed and must be non-empty.
- Name-based Graph principal types are convenience forms and must resolve to exactly one group.

Shared role schema:

```ts
roleId?: number;
roleName?: string;
roleType?: "read" | "contribute" | "edit" | "design" | "fullControl";
```

Rules:

- Exactly one of `roleId`, `roleName`, or `roleType` is allowed.
- `roleId` is a positive integer.
- `roleName` is trimmed and must be non-empty.
- `roleType` maps to SharePoint `RoleTypeKind`.

V1 role type mapping:

| `roleType` | PnPjs `RoleTypeKind` | SharePoint role family |
|------------|----------------------|------------------------|
| `read` | `2` | Reader |
| `contribute` | `3` | Contributor |
| `design` | `4` | WebDesigner |
| `fullControl` | `5` | Administrator |
| `edit` | `6` | Editor |

`grant*` additionally supports:

```ts
breakRoleInheritance?: boolean;
copyRoleAssignments?: boolean;
clearSubscopes?: boolean;
```

Rules:

- `breakRoleInheritance` defaults to `false`.
- `copyRoleAssignments` public default is `true`.
- `clearSubscopes` public default is `false`.
- `copyRoleAssignments` and `clearSubscopes` may be provided only when `breakRoleInheritance: true`.
- If the target inherits permissions and `breakRoleInheritance` is not `true`, the handler skips with `missing_prerequisite`.

`break*RoleInheritance` supports:

```ts
copyRoleAssignments?: boolean;
clearSubscopes?: boolean;
```

Rules:

- Public default `copyRoleAssignments` is `true`.
- Public default `clearSubscopes` is `false`.
- The implementation must pass these defaults explicitly to PnPjs. PnPjs defaults `copyRoleAssignments` to `false`, which is too destructive for this provisioning contract.

`reset*RoleInheritance` has no payload fields beyond `verb` and leaf `subactions`.

## Runtime Architecture

Add a permissions domain:

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/permissions/
  break-sp-site-role-inheritance/
  reset-sp-site-role-inheritance/
  grant-sp-site-role-assignment/
  remove-sp-site-role-assignment/
  break-sp-list-role-inheritance/
  reset-sp-list-role-inheritance/
  grant-sp-list-role-assignment/
  remove-sp-list-role-assignment/

packages/m365-actionable-provisioning/src/actions/sharepoint/domains/permissions/
  inheritance.ts
  principal-resolution.ts
  role-assignments.ts
  role-resolution.ts
  schema.ts
  securable-target.ts
```

Action modules own:

- verb;
- schema;
- placement metadata;
- `requiredClients`;
- high-level handler and compliance flow;
- result semantics.

The `domains/permissions` helpers own:

- resolving site/list securable targets from scope;
- resolving principals;
- resolving role definitions;
- checking unique role inheritance;
- checking whether a role binding exists;
- adding and removing role bindings;
- normalizing not-found and ambiguity conditions.

## PnPjs Surface

Use PnPjs SharePoint security APIs:

- `@pnp/sp/security`
- `@pnp/sp/security/web`
- `@pnp/sp/security/list`
- `@pnp/sp/site-users/web`
- `@pnp/sp/site-groups/web`

Confirmed local APIs:

- `web.roleDefinitions.getById(id)()`
- `web.roleDefinitions.getByName(name)()`
- `web.roleDefinitions.getByType(roleTypeKind)()`
- `target.roleAssignments.add(principalId, roleDefId)`
- `target.roleAssignments.remove(principalId, roleDefId)`
- `target.roleAssignments.getById(principalId).bindings()`
- `target.breakRoleInheritance(copyRoleAssignments, clearSubscopes)`
- `target.resetRoleInheritance()`
- `web.ensureUser(loginName)`
- `web.siteGroups.getByName(groupName)()`

Use PnPjs Graph only for convenience group lookup:

- `@pnp/graph/groups`
- `graphClient.groups.filter(...).select(...).top(...)()`

Do not use Graph to write SharePoint role assignments.

## Target Resolution

Site permission actions:

- require `scopeIn.web`;
- operate on `scopeIn.web`;
- return scope delta preserving `web`, `siteUrl`, and `webUrl` when known.

List permission actions:

- require `scopeIn.list`;
- require `scopeIn.web` for principal and role definition resolution;
- operate on `scopeIn.list`;
- return scope delta preserving `web`, `list`, `webUrl`, and `listName` when known.

Handlers skip with `missing_prerequisite` when the required scope is missing. Compliance returns `unverifiable` with `missing_prerequisite`.

## Principal Resolution

Resolution rules:

- `loginName`: call `web.ensureUser(principal)` and use the returned `Id`.
- `spGroupName`: call `web.siteGroups.getByName(principal)()` and use the returned `Id`.
- `entraGroupId`: build SharePoint group claim and resolve it through `web.ensureUser(claim)`.
- `m365GroupId`: same as `entraGroupId`.
- `entraGroupName`: require `graphClient`; look up group by `displayName`; require exactly one match; build claim from `id`; resolve through `web.ensureUser(claim)`.
- `m365GroupName`: require `graphClient`; look up group by `displayName` and `groupTypes/any(c:c eq 'Unified')`; require exactly one match; build claim from `id`; resolve through `web.ensureUser(claim)`.
- `m365GroupMailNickname`: require `graphClient`; look up group by `mailNickname` and `groupTypes/any(c:c eq 'Unified')`; require exactly one match; build claim from `id`; resolve through `web.ensureUser(claim)`.

SharePoint group claim format for Entra/Microsoft 365 groups:

```ts
`c:0o.c|federateddirectoryclaimprovider|${groupId}`
```

Lookup rules:

- 0 matches: principal not found.
- more than 1 match: ambiguous principal; runtime must not modify permissions.
- Graph missing for Graph-backed principal types: runtime skips with `missing_prerequisite`; compliance returns `unverifiable`.

Graph `$filter` string values must be OData escaped. Reuse or mirror the existing `escapeODataStringLiteral` helper.

## Role Resolution

Resolve roles from the scoped web:

- `roleId`: `web.roleDefinitions.getById(roleId)()`
- `roleName`: query `web.roleDefinitions` by escaped `Name` and require exactly one match
- `roleType`: `web.roleDefinitions.getByType(mappedRoleTypeKind)()`

The resolved role definition must expose an `Id`. Runtime fails if the role cannot be resolved.

Do not use PnPjs `getByName` for `roleName` in V1. Local introspection showed that the installed PnPjs version builds a quoted path segment for `getByName`, so the safer V1 implementation is an escaped OData filter over the role definitions collection. Role name lookup must be tested with names containing apostrophes.

## Inheritance Semantics

`break*RoleInheritance`:

1. Require target scope.
2. Read `HasUniqueRoleAssignments`.
3. If already unique, skip `already_exists`.
4. Otherwise call `breakRoleInheritance(copyRoleAssignments ?? true, clearSubscopes ?? false)`.
5. Return `executed`.

`reset*RoleInheritance`:

1. Require target scope.
2. Read `HasUniqueRoleAssignments`.
3. If not unique, skip `no_changes`.
4. Otherwise call `resetRoleInheritance()`.
5. Return `executed`.

`grant*RoleAssignment`:

1. Require target scope.
2. Resolve principal.
3. Resolve role.
4. Read `HasUniqueRoleAssignments`.
5. If target inherits and `breakRoleInheritance !== true`, skip with `missing_prerequisite`.
6. If target inherits and `breakRoleInheritance === true`, call `breakRoleInheritance(copyRoleAssignments ?? true, clearSubscopes ?? false)`.
7. Check whether the principal already has the role binding.
8. If binding exists, skip `already_exists`.
9. Otherwise call `roleAssignments.add(principalId, roleDefId)`.
10. Return `executed`.

`remove*RoleAssignment`:

1. Require target scope.
2. Resolve principal.
3. Resolve role.
4. Read `HasUniqueRoleAssignments`.
5. If target inherits, skip with `missing_prerequisite`.
6. Check whether the principal has the role binding.
7. If binding is absent, skip `not_found`.
8. Otherwise call `roleAssignments.remove(principalId, roleDefId)`.
9. Return `executed`.

## Compliance Semantics

Compliance is read-only.

`break*RoleInheritance`:

- compliant when `HasUniqueRoleAssignments === true`;
- non-compliant when `HasUniqueRoleAssignments === false`;
- unverifiable when scope or target cannot be read.

`reset*RoleInheritance`:

- compliant when `HasUniqueRoleAssignments === false`;
- non-compliant when `HasUniqueRoleAssignments === true`;
- unverifiable when scope or target cannot be read.

`grant*RoleAssignment`:

- compliant when the principal/role binding exists;
- non-compliant with `not_found` or `missing_binding` when the binding is absent;
- unverifiable when Graph-backed principal lookup requires a missing `graphClient`;
- unverifiable when name lookup is ambiguous;
- unverifiable on read errors that are not clean not-found conditions.

`remove*RoleAssignment`:

- compliant when the principal/role binding is absent;
- non-compliant when the binding exists;
- unverifiable under the same lookup/read conditions as grant.

Compliance should avoid side effects:

- No `ensureUser` during compliance for Graph/name principal types if it would add the principal to the site collection.
- Prefer read-only principal lookup where possible. If SharePoint only supports reliable claim materialization through `ensureUser`, compliance for not-yet-materialized Entra/M365 group principals may return `unverifiable` rather than mutating the site.

## Permission Checks

Use best-effort checks similar to existing SharePoint actions.

- Site permission actions probe `PermissionKind.ManagePermissions` on `scopeIn.web` when possible.
- List permission actions probe `PermissionKind.ManagePermissions` on `scopeIn.list` when possible.
- If the probe returns false, return `deny`.
- If the probe throws, return `unknown`.
- If scope is missing, return `unknown` rather than blocking preflight.

Because all permission actions declare `requiredClients = ["spfi"]`, the engine will still validate SPFI availability during preflight/JIT and execution. Graph remains optional at the action-definition level.

## Error Handling

Use existing result helpers:

- successful mutation: `actionExecuted(resource, scopeDelta)`;
- idempotent skip: `actionSkipped(resource, reason, scopeDelta)`;
- compliance satisfied: `compliant(...)`;
- desired state missing/drifted: `nonCompliant(...)`;
- missing verification support or read failure: `unverifiable(...)`.

Recommended reason values:

- `missing_prerequisite` for missing scope, inherited target without allowed break, or missing dynamic Graph client at runtime;
- `already_exists` for grant binding already present or break inheritance already unique;
- `no_changes` for reset when already inherited;
- `not_found` for remove binding absence or unresolved principal/role where no mutation is needed.

Ambiguous name lookups should throw at runtime before mutation and return `unverifiable` in compliance with structured details.

## Public Exports And Composition

Add modules to:

- `actions/sharepoint/action-modules.ts`;
- `_composition/site-subactions-schema.ts`;
- `_composition/list-subactions-schema.ts`;
- `actions/sharepoint/schemas.ts`;
- `actions/sharepoint/permissions/index.ts`;
- root package exports through existing barrels.

Do not add permission actions to `provisioning-schema.ts` root action schemas.

Action modules must set placements accurately:

- site permission actions: `["siteSubaction"]`;
- list permission actions: `["listSubaction"]`.

## Documentation

Update:

- `docs/provisioning-schema.md`;
- `packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`;
- `packages/m365-actionable-provisioning/README.md` if it lists supported action families;
- root `README.md` only if it has action coverage claims.

Document the sharp edges explicitly:

- `reset*RoleInheritance` removes unique local assignments.
- `grant*` does not automatically break inheritance unless `breakRoleInheritance: true`.
- `copyRoleAssignments` defaults to `true` in this library, not to PnPjs defaults.
- Group display names are convenience lookups and must resolve uniquely.
- ID-based group references are preferred for deterministic provisioning.

## Testing And Validation

Extend `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts` with contract coverage for:

- all 8 verbs are registered in action modules in the expected order;
- site permission actions are accepted only by `siteSubactionSchema`;
- list permission actions are accepted only by `listSubactionSchema`;
- root schema rejects all permission actions;
- `grant*` schema requires exactly one role reference;
- `copyRoleAssignments` and `clearSubscopes` are rejected unless `breakRoleInheritance: true`;
- schema trims `principal` and `roleName`;
- role type mapping is stable;
- `requiredClients` is `["spfi"]`, not `["graphClient"]`;
- public barrel exports schemas, payload types, and action classes;
- Graph name lookup returns not-found, unique, and ambiguous outcomes using a fake GraphFI shape;
- role name lookup uses escaped filters and supports apostrophes;
- binding existence checks handle missing role assignment as absent;
- break/reset compliance reads `HasUniqueRoleAssignments`;
- grant with inherited target and no break flag skips with `missing_prerequisite`;
- remove missing binding skips with `not_found`.

Run:

```sh
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build:m365
```

In the current local sandbox, `tsx` smoke may require running outside the sandbox because it creates an IPC pipe under the OS temp directory. The baseline smoke passed outside the sandbox before this spec was written, and `build:m365` passed inside the sandbox.

Tenant smoke remains required before treating the domain as production-stable:

- site grant to SharePoint group;
- site grant to Entra/Microsoft 365 group by id;
- list grant with `breakRoleInheritance: true`;
- list remove;
- reset inheritance;
- Graph lookup by `m365GroupMailNickname`;
- ambiguous `displayName` failure path, if the tenant can provide such fixture groups.
