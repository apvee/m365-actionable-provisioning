# SharePoint Content Types V1 Design

## Goal

Add first-class SharePoint content type provisioning to `@apvee/m365-actionable-provisioning`.

The new domain must cover site content type lifecycle, list binding, and field membership on content types. It must preserve the existing provisioning semantics:

- `create*` means ensure the resource exists.
- `modify*` means enforce mutable desired state.
- `delete*` means ensure absent.
- Create compliance checks existence plus structural compatibility, not mutable drift.
- Non-blocking partial failures are reported as `warnings`.

This design intentionally uses Microsoft Graph for content type and content type field operations. The engine remains runtime-agnostic and can run from SPFx delegated auth or server/app authentication.

## Current Context

The current SharePoint catalog covers:

- sites: create, modify, delete
- lists: create, modify, delete, rating
- fields/site columns: create, modify, delete

It does not yet cover:

- content types
- content type field links / columns
- binding content types to lists
- list default content type behavior

The package already has:

- `M365Clients.graphClient?: GraphFI`
- client-gated actions through `requiredClients`
- structured `warnings` on action results
- action module placements for root, site subactions, and list subactions

V1 must extend the action placement model with a new content type subaction placement.

## Technical Verification Summary

Context7 could not be used because the quota was exhausted. Verification was done against local installed PnPjs types and primary documentation.

Observed locally in `@pnp/sp@4.17.0`:

- `web.contentTypes` and `list.contentTypes` exist.
- `contentTypes.addAvailableContentType(contentTypeId)` exists.
- `contentTypes.getById(id)` exists.
- `contentTypes.add(id, name, ...)` exists but requires an explicit content type id.
- `contentType.fieldLinks` exists, but PnPjs SP exposes no clear typed add/update/delete field link API.

Observed locally in `@pnp/graph@4.17.0`:

- `site.contentTypes.add(contentType)` exists.
- Graph content types are updateable and deleteable.
- `list.contentTypes.addCopy(siteContentType)` exists.
- `contentType.columns.addRef(siteColumn)` exists.
- content type columns are updateable and deleteable through Graph column resources.

Primary docs used:

- PnPjs SP content types: `https://pnp.github.io/pnpjs/sp/content-types/`
- Microsoft Graph contentType resource: `https://learn.microsoft.com/en-us/graph/api/resources/contenttype?view=graph-rest-1.0`
- Microsoft Graph create content type: `https://learn.microsoft.com/en-us/graph/api/site-post-contenttypes?view=graph-rest-1.0`
- Microsoft Graph add content type column: `https://learn.microsoft.com/en-us/graph/api/contenttype-post-columns?view=graph-rest-1.0`
- Microsoft Graph columnDefinition resource: `https://learn.microsoft.com/en-us/graph/api/resources/columndefinition?view=graph-rest-1.0`

## Architecture Decision

Content type actions are Graph-first.

Use `@pnp/graph` for:

- creating site content types
- modifying site/list content types
- deleting site/list content types
- adding a site content type copy to a list
- adding a site column to a content type
- modifying content type column settings
- removing a column from a content type

Use `@pnp/sp` only where it already owns existing runtime scope or has reliable list/web lookup helpers. Do not use `@pnp/sp` for content type field add/modify/remove in V1.

## Runtime Clients And Permissions

Content type actions that call Graph declare:

```ts
readonly requiredClients = ["graphClient"] as const;
```

No token claim inspection is included in V1.

Pre-check behavior:

- `graphClient` missing: deny with a clear message.
- `graphClient` present: allow the client requirement. Do not inspect `scp` or `roles`.

Runtime/compliance behavior:

- Graph `401` or `403`: normalize to a clear Graph permission error.
- Runtime error message should name the required permission:
  - `Sites.Manage.All` or higher, such as `Sites.FullControl.All`.
- Compliance should return `unverifiable` with a reason such as `graph_permission_denied`.

Documentation must state that SPFx consumers need Microsoft Graph permission approval, for example:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Sites.Manage.All"
  }
]
```

Server/app-auth consumers must configure equivalent Microsoft Graph application permissions.

## Scope Model

Add content type information to `M365Scope`:

```ts
contentType?: unknown; // Graph content type handle or local wrapper
contentTypeId?: string;
contentTypeName?: string;
graphSiteId?: string;
graphListId?: string;
siteUrl?: string;
webUrl?: string;
listName?: string;
```

The concrete handle type should stay internal if exposing the Graph handle would make the public scope contract too narrow. Action handlers can still pass a runtime object through scope.

The content type scope is produced by:

- `createSPContentType`
- resolving an existing content type in future root/site placement actions

It is consumed by:

- `addSPFieldToContentType`
- `modifySPContentTypeField`
- `removeSPFieldFromContentType`

List scope remains produced by list actions and consumed by:

- `addSPContentTypeToList`
- `removeSPContentTypeFromList`

## Action Catalog

### Site Content Type Actions

Allowed placements:

- root
- site subaction

Actions:

- `createSPContentType`
- `modifySPContentType`
- `deleteSPContentType`

### Content Type Field Actions

Allowed placements:

- content type subaction

Actions:

- `addSPFieldToContentType`
- `modifySPContentTypeField`
- `removeSPFieldFromContentType`

These actions operate on the content type column / field link. They do not modify the global site column.

### List Binding Actions

Allowed placements:

- list subaction

Actions:

- `addSPContentTypeToList`
- `removeSPContentTypeFromList`

Candidate action after spike:

- `setSPListDefaultContentType`

Do not register schema, module, or documentation examples for `setSPListDefaultContentType` unless the spike proves a reliable implementation. Default content type behavior may require SharePoint folder content type order APIs rather than a simple Graph update.

## Graph Resolution Contract

Graph actions need Graph site/list identifiers, but existing SharePoint actions currently propagate PnP `web` and `list` handles. The implementation must add an explicit resolution contract instead of assuming a Graph action can infer Graph IDs from PnP objects.

Resolution inputs may come from:

- existing payload fields such as `siteUrl`, `webUrl`, and `listName`;
- scope metadata propagated by parent actions, such as `siteUrl`, `webUrl`, `listName`, `graphSiteId`, and `graphListId`;
- explicit future payload fields if a root-level Graph action needs them.

Resolution rules:

- Graph-first content type actions always require `graphClient`.
- If Graph IDs are not already in scope, the action may also require `spfi` only when it needs SharePoint context to resolve or validate `webUrl`, `listName`, or current scope.
- Parent site/list actions should propagate enough stable metadata for child Graph actions to resolve the Graph site/list without inspecting internal PnP handles.
- `listName` means the stable list root/name, aligned with existing list actions and lookup-field behavior. It must not be resolved through SharePoint `Title` or Graph `displayName`; display/title remains mutable metadata only.
- The technical spike must confirm the exact Graph site/list resolution path from the current SharePoint web/list context.
- If Graph resolution is impossible, the action returns `unverifiable` in compliance or a controlled runtime error with reason `graph_scope_unresolved`.

## Identity Contract

### Create Content Type

`createSPContentType` uses:

```ts
{
  verb: "createSPContentType",
  name: string,
  parentId: string,
  description?: string,
  group?: string,
  webUrl?: string,
  siteUrl?: string,
  subactions?: ContentTypeSubaction[]
}
```

No custom content type id is generated by the library.

Graph create supports parent/base content type input and returns the generated id. The handler stores the returned id in scope.

`parentId` is required in V1. There is no implicit default parent.

### Reference Existing Content Type

Actions that refer to an existing content type use:

```ts
contentTypeId?: string;
contentTypeName?: string;
```

Rules:

- At least one is required unless a content type is already available in scope.
- If both are supplied, `contentTypeId` wins.
- If both are supplied and the resolved name differs, return a warning such as `CONTENT_TYPE_REFERENCE_NAME_MISMATCH`.
- Name lookup ambiguity is not silently accepted.

Ambiguous references:

- runtime: fail or skip with a clear ambiguity error depending on action semantics.
- compliance: `unverifiable` or `non_compliant` with reason `ambiguous_reference`.

## Field Reference Contract

Content type field actions use:

```ts
fieldId?: string;
fieldName?: string;
```

Rules:

- At least one is required.
- If both are supplied, `fieldId` wins.
- The field must already exist as a site column.
- When the site column is created earlier in the same run, reference it by `fieldName`; the runtime can use the propagated actual SharePoint field id to avoid Graph name lookup timing differences.
- No inline field creation is supported in content type field actions.
- If the field is missing:
  - runtime: `skipped/missing_prerequisite` or controlled error depending on operation.
  - compliance: `non_compliant/not_found`.

## Semantics By Action

### `createSPContentType`

Meaning: ensure a site content type exists.

Create matching:

- `createSPContentType` does not accept `contentTypeId` in V1.
- Resolve existing site content types by exact `name` in the target site.
- Validate `parentId` as structural compatibility when parent/base information is readable.
- Existing mutable differences in `description` or `group` do not make create non-compliant.
- Parent/base mismatch is structural and should produce a warning during runtime and `non_compliant` during compliance when readable.

Runtime output:

- `executed` when created.
- `skipped/already_exists` when already present.
- Propagates `contentType`, `contentTypeId`, `contentTypeName`.

### `modifySPContentType`

Meaning: enforce mutable content type metadata.

Payload:

```ts
{
  verb: "modifySPContentType",
  contentTypeId?: string,
  contentTypeName?: string,
  name?: string,
  description?: string,
  group?: string,
  webUrl?: string,
  siteUrl?: string
}
```

Mutable properties:

- `name`
- `description`
- `group`
- additional Graph-supported mutable properties only after verification.

Do not modify parent/base id.

### `deleteSPContentType`

Meaning: ensure absent.

Payload:

```ts
{
  verb: "deleteSPContentType",
  contentTypeId?: string,
  contentTypeName?: string,
  webUrl?: string,
  siteUrl?: string
}
```

Delete is conservative:

- If not found: skipped/not_found or compliant.
- If sealed, readonly, inherited, in use, or blocked by Graph: do not force.
- Normalize blocked deletes into clear errors or `skipped/unsupported` with warnings based on the existing action-result pattern.
- Compliance should report `non_compliant` with reason `delete_blocked` or `in_use` when the block is readable.

### `addSPFieldToContentType`

Meaning: ensure a site column is present on the content type.

Implementation target:

- Graph content type columns `addRef(siteColumn)`.

Payload:

```ts
{
  verb: "addSPFieldToContentType",
  fieldId?: string,
  fieldName?: string,
  required?: boolean,
  hidden?: boolean,
  readOnly?: boolean,
  displayName?: string
}
```

Creation semantics:

- Adds the site column reference if missing.
- If already present, skip as `already_exists`.
- If mutable column settings differ, do not reconcile in create; use `modifySPContentTypeField`.

### `modifySPContentTypeField`

Meaning: enforce mutable settings of a content type column.

Payload:

```ts
{
  verb: "modifySPContentTypeField",
  fieldId?: string,
  fieldName?: string,
  required?: boolean,
  hidden?: boolean,
  readOnly?: boolean,
  displayName?: string
}
```

Target:

- The column/field as attached to the content type, not the global site column.

Properties to support after Graph verification:

- `required`
- `hidden`
- `readOnly`
- `displayName`

If Graph rejects a property for a column type, return a clear error or warning based on whether the property was required by the action.

### `removeSPFieldFromContentType`

Meaning: ensure the content type column is absent.

Payload:

```ts
{
  verb: "removeSPFieldFromContentType",
  fieldId?: string,
  fieldName?: string
}
```

Rules:

- If missing: skipped/not_found or compliant.
- If Graph blocks removal, normalize the error with action/resource context.

### `addSPContentTypeToList`

Meaning: ensure a site content type is available on a list.

Payload:

```ts
{
  verb: "addSPContentTypeToList",
  contentTypeId?: string,
  contentTypeName?: string
}
```

Implementation target:

- Graph list content types `addCopy(siteContentType)` when possible.

Behavior:

- If list content types are not enabled, enable them automatically if the current API path requires it.
- If enabling content types fails, return a warning or controlled error with action context.
- If already bound, skip as `already_exists`.

### `removeSPContentTypeFromList`

Meaning: ensure a list content type is absent.

Payload:

```ts
{
  verb: "removeSPContentTypeFromList",
  contentTypeId?: string,
  contentTypeName?: string
}
```

Rules:

- If missing: skipped/not_found or compliant.
- If the content type is default or in use, delete should be conservative and normalize Graph failure.

### `setSPListDefaultContentType`

Meaning: enforce the default content type for new list items/documents.

This is a candidate action after spike, not a guaranteed V1 registered action.

Candidate payload if the spike proves a reliable implementation:

```ts
{
  verb: "setSPListDefaultContentType",
  contentTypeId?: string,
  contentTypeName?: string
}
```

Do not register schema, module, or documentation examples for this action unless the spike proves a reliable implementation.

The spike must determine whether reliable implementation should use:

- Graph content type `order`
- Graph list content type update
- SharePoint RootFolder `UniqueContentTypeOrder`
- another SharePoint REST endpoint

If no reliable implementation is found, the implementation plan should defer this action rather than shipping a misleading no-op.

## Schema Composition

Extend the placement contract:

```ts
export type SharePointActionPlacement =
  | "root"
  | "siteSubaction"
  | "listSubaction"
  | "contentTypeSubaction";
```

Add a new content type subaction composition file:

```text
actions/sharepoint/_composition/content-type-subactions-schema.ts
```

`createSPContentType` uses `subactionsOf(contentTypeSubactionSchema)`. Field-to-content-type modules declare:

```ts
placements: ["contentTypeSubaction"] as const
```

Root, site, list, and content type schemas must be generated from action modules. Do not create a second hand-maintained verb list.

Add a new domain folder:

```text
actions/sharepoint/content-types/
  create-sp-content-type/
  modify-sp-content-type/
  delete-sp-content-type/
  add-sp-field-to-content-type/
  modify-sp-content-type-field/
  remove-sp-field-from-content-type/
  add-sp-content-type-to-list/
  remove-sp-content-type-from-list/
```

Only add `set-sp-list-default-content-type/` after the default-content-type spike proves a reliable implementation.

Add shared helpers:

```text
actions/sharepoint/domains/content-types/
  content-type-lookup.ts
  content-type-reference.ts
  content-type-permissions.ts
  content-type-errors.ts
```

Composition updates:

- root schema includes content type site actions.
- site subactions include content type site actions.
- content type subactions include field-to-content-type actions.
- list subactions include list binding/default actions.
- action modules remain the single source of truth.

## Error Handling

Add a Graph permission normalization helper near existing PnPjs error utilities or in a content type domain helper.

Required normalized cases:

- `401`: `GRAPH_AUTHENTICATION_FAILED`
- `403`: `GRAPH_PERMISSION_DENIED`
- missing `graphClient`: existing missing-client preflight path

Messages should include:

- action verb
- resource identifier
- required permission: `Sites.Manage.All` or `Sites.FullControl.All`
- short remediation note for SPFx and server/app-auth consumers

Do not inspect access token claims in V1.

## Compliance Behavior

Compliance mirrors runtime semantics:

- create checks existence and structural compatibility.
- modify checks mutable desired state.
- delete checks absence.
- add/bind actions check attachment exists.
- remove/unbind actions check attachment is absent.
- Graph 401/403 produces `unverifiable` with explicit permission reason.

Compliance must not require live tenant-specific hidden behavior for smoke tests. Pure helper tests and schema tests should cover local validation; tenant behavior remains manual/integration scope.

## Documentation Requirements

Update package and schema docs with:

- Content type action examples.
- Graph-first implementation note.
- Required Microsoft Graph permission `Sites.Manage.All` or higher.
- SPFx `webApiPermissionRequests` example.
- Server/app-auth note for application permissions.
- No token inspection in engine.
- Field actions operate on content type columns/field links, not global site columns.
- Site columns must exist before field-to-content-type actions.
- `setSPListDefaultContentType` availability depends on technical spike result.

## Technical Spikes Before Implementation Plan

Before writing the detailed implementation plan, verify these with a small code/API spike:

1. Create content type through Graph with `name + base.id` and no custom generated id.
2. Resolve a Graph site from the current SharePoint web/list context.
3. Resolve site columns through Graph by `fieldId` and by `fieldName`.
4. Add a site column to a content type via `contentType.columns.addRef(siteColumn)`.
5. Update content type column settings through Graph.
6. Delete a content type column through Graph.
7. Add a site content type copy to a list through Graph.
8. Determine reliable implementation for list default content type.
9. Normalize Graph 401/403 errors from PnPjs Graph responses.

If a spike fails for an action, the implementation plan must either defer that action or implement it as explicitly unsupported. Do not ship a silent no-op.

## Acceptance Criteria

- Content type actions are registered through the existing action-module architecture.
- Content type actions require `graphClient`.
- No token claim inspection is added.
- Missing `graphClient` is caught by preflight.
- Graph permission failures are normalized clearly at runtime and compliance time.
- `createSPContentType` does not generate custom content type ids locally.
- Content type field actions require existing site columns.
- Field-to-content-type actions use Graph, not `@pnp/sp` fieldLinks.
- List binding actions support `contentTypeId` and `contentTypeName`.
- ID wins over name when both are supplied.
- Mismatch and ambiguity are surfaced as warnings/errors, not silently ignored.
- `setSPListDefaultContentType` is implemented only after a reliable spike.
- Smoke validation covers schema composition and pure helper contracts.
- Package README, SharePoint action catalog docs, and schema docs include content type examples, Graph permission notes, and default-content-type spike status.
- Documentation examples parse through the exported schema.
- Package build passes.

## Out Of Scope

- Content type hub publishing and association.
- Document templates and default content locations.
- Content type id custom generation.
- Inline field creation inside content type actions.
- Token claim inspection.
- UI-specific warning badges or SPFx rendering changes.
