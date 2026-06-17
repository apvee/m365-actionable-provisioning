# SharePoint List Views V1 Design

## Goal

Add first-class SharePoint list view provisioning to `@apvee/m365-actionable-provisioning`.

The V1 domain must cover public standard list views with predictable provisioning semantics:

- `create*` means ensure the view exists and matches the declared V1 state.
- `modify*` means enforce mutable desired state on an existing view.
- `delete*` means ensure absent.
- Compliance uses the same declared-state surface as execution.
- Modern rendering features are intentionally excluded until a dedicated V2 spike proves stable behavior.

## Current Context

The current SharePoint catalog covers:

- sites: create, modify, delete
- lists: create, modify, delete, rating
- fields/site columns: create, modify, delete
- content types: site lifecycle, list binding, and content type field membership

It does not yet cover:

- SharePoint list views
- default list view configuration
- ordered view field membership

The package already has:

- `M365Clients.spfi?: SPFI`
- client-gated actions through `requiredClients`
- list scope propagation from list actions through `M365Scope.list`
- list subaction composition through `_composition/list-subactions-schema.ts`
- reusable list lookup and permission helpers in `actions/sharepoint/domains/lists`

## Technical Verification Summary

Verification was done against local installed PnPjs types in `@pnp/sp@4.17.0`.

Observed locally:

- `@pnp/sp/views` adds `views`, `defaultView`, and `getView` to list handles.
- `list.views.add(title, personalView, additionalSettings)` exists.
- `list.views.getByTitle(title)` and `list.views.getById(id)` exist.
- `view.update(props)` exists.
- `view.delete()` exists through the deleteable interface.
- `view.setViewXml(viewXml)` exists.
- `view.fields.add`, `view.fields.remove`, `view.fields.removeAll`, and `view.fields.move` exist.
- `ViewScope` includes default, recursive, recursive all, and files-only modes.

The V1 design is therefore SP-first. It does not use Microsoft Graph for list views.

## Architecture Decision

Create a new SharePoint action domain:

```text
actions/sharepoint/views/
  create-sp-list-view/
    action.ts
    schema.ts
    index.ts
  modify-sp-list-view/
    action.ts
    schema.ts
    index.ts
  delete-sp-list-view/
    action.ts
    schema.ts
    index.ts
```

Create a supporting domain helper folder:

```text
actions/sharepoint/domains/views/
  index.ts
  list-view-lookup.ts
  list-view-fields.ts
  list-view-props.ts
  list-view-compliance.ts
```

List view actions are allowed only as `listSubaction` in V1. This keeps target resolution aligned with existing list-owned operations such as `addSPField`, `modifySPField`, and `enableSPListRating`.

Example:

```ts
{
  verb: "modifySPList",
  listName: "Documents",
  subactions: [
    {
      verb: "createSPListView",
      title: "Active documents",
      fields: ["DocIcon", "LinkFilename", "Modified"],
      viewQuery: "<Where><Eq><FieldRef Name=\"Status\" /><Value Type=\"Text\">Active</Value></Eq></Where>",
      rowLimit: 100,
      paged: true,
      defaultView: true
    }
  ]
}
```

Root-level placement can be added later if real use cases need direct `webUrl + listName` targeting outside list parent actions.

## Runtime Clients And Permissions

All list view actions declare:

```ts
readonly requiredClients = ["spfi"] as const;
```

Permission checks use the existing list/web permission pattern:

- Missing `spfi`: deny with a clear message.
- Existing target web/list: use the existing `ManageLists` probe.
- Runtime `401` or `403`: return or throw a normalized SharePoint permission error.

V1 does not inspect token claims or app roles.

## Scope Model

V1 does not add required public properties to `M365Scope`.

Actions consume:

- `scopeIn.web`
- `scopeIn.list`
- `scopeIn.webUrl`
- `scopeIn.listName`

Actions may return the same list scope delta after successful operations:

```ts
{
  web,
  list,
  webUrl,
  listName
}
```

V1 does not introduce a `view` scope handle because no view subactions exist yet. If future view subactions are added, the handle can be introduced behind a deliberate scope contract.

## Action Catalog

### `createSPListView`

Allowed placements:

- list subaction

Payload:

```ts
{
  verb: "createSPListView";
  title: string;
  fields?: string[];
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: boolean;
  tabularView?: boolean;
  scope?: "default" | "recursive" | "recursiveAll" | "filesOnly";
}
```

Behavior:

- Resolve the parent list from `scopeIn.list`.
- Find the view by title.
- If the view does not exist, create it as a public view.
- If the view already exists, do not create another view.
- Apply the declared mutable V1 state after create or existing-view resolution.
- If `fields` is supplied, replace the visible view fields with the declared ordered sequence.
- If `defaultView: true`, set the view as the default view after creation/update.

Reasoning:

For list views, create semantics should be practical and idempotent. Unlike list creation, a view's key useful state is largely mutable. Applying declared V1 state during `createSPListView` avoids plans that create a view and immediately require a second modify action for basic fields/query/default settings.

### `modifySPListView`

Allowed placements:

- list subaction

Payload:

```ts
{
  verb: "modifySPListView";
  title: string;
  newTitle?: string;
  fields?: string[];
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: boolean;
  tabularView?: boolean;
  scope?: "default" | "recursive" | "recursiveAll" | "filesOnly";
}
```

Behavior:

- Resolve the parent list from `scopeIn.list`.
- Find the view by `title`.
- If missing, return `skipped/not_found`.
- Update only properties explicitly supplied by the payload.
- If `fields` is supplied, replace the visible view fields with the declared ordered sequence.
- If `newTitle` is supplied, rename the view.
- If `newTitle` is supplied and a different view already uses that title, fail with a controlled title-collision error instead of overwriting or silently targeting the other view.
- If `defaultView: true`, set the view as default.
- If `defaultView: false`, do not send a `DefaultView: false` update. Compliance may still report drift when the target view is default, but runtime changes default status only by setting `defaultView: true` on another view.

### `deleteSPListView`

Allowed placements:

- list subaction

Payload:

```ts
{
  verb: "deleteSPListView";
  title: string;
}
```

Behavior:

- Resolve the parent list from `scopeIn.list`.
- Find the view by title.
- If missing, return `skipped/not_found`.
- If the view is the default view, return `skipped/unsupported` with a warning explaining that V1 will not delete the current default view.
- Otherwise delete the view.

V1 does not include `replacementDefaultViewTitle`. If users need to delete a default view, they should first mark another view with `defaultView: true`, then delete the old view in a later action.

## Schema Rules

Shared primitives:

- `title`: non-empty string using the existing display-name style constraints where practical.
- `fields`: optional non-empty array of non-empty SharePoint internal field names.
- `viewQuery`: optional CAML fragment string.
- `rowLimit`: optional positive integer.
- `paged`: optional boolean.
- `defaultView`: optional boolean.
- `tabularView`: optional boolean.
- `scope`: enum mapped to PnPjs `ViewScope`.

Excluded from V1 schema:

- `personalView`
- `viewType`
- `viewType2`
- JSON view formatting
- calendar-specific settings
- gallery/tile-specific settings
- full `viewXml` input

## Compliance Contract

### Create

`createSPListView` is compliant when:

- the target view exists;
- every declared scalar property matches;
- declared `fields` match the actual view fields in order;
- declared `defaultView` matches actual default-view state. Runtime can enforce `true`; runtime reports `false` drift until another view is made default.

It is non-compliant when the view is missing or declared state differs.

### Modify

`modifySPListView` is compliant when:

- the target view exists;
- every declared scalar property matches;
- declared `fields` match the actual view fields in order;
- declared `defaultView` matches actual default-view state. Runtime can enforce `true`; runtime reports `false` drift until another view is made default.

It is non-compliant when the view is missing or declared state differs.

If `newTitle` is supplied, compliance resolves by `newTitle` first, then falls back to `title`:

- If the renamed view exists and declared state matches, compliant.
- If only the old title exists, non-compliant.

### Delete

`deleteSPListView` is compliant when:

- the target view does not exist.

If the view exists and is default, compliance is non-compliant with details that deletion is blocked by default-view status.

## Comparison Rules

Field comparison:

- compare only when `fields` is declared;
- use field internal names;
- preserve order;
- treat extra actual fields as drift.

Query comparison:

- compare only when `viewQuery` is declared;
- normalize leading/trailing whitespace;
- do not parse CAML semantically in V1.

Scalar comparison:

- compare only properties declared by the payload;
- use nullish equality where SharePoint omits unset values;
- map `scope` to PnPjs numeric `ViewScope` before comparing.

## Error Handling And Warnings

Expected non-fatal conditions use skipped results or compliance outcomes:

- missing parent list scope: `missing_prerequisite`
- target view missing on modify/delete: `not_found`
- default view delete attempt at runtime: `unsupported`

Warnings:

- `LIST_VIEW_DEFAULT_DELETE_BLOCKED` when delete targets the current default view.
- `LIST_VIEW_QUERY_UNVERIFIABLE` if SharePoint returns view query data in a shape that cannot be compared.

Field synchronization failures are blocking errors, not warnings. The declared field list is part of the V1 desired state; if `removeAll`, `add`, or `move` fails, the action should fail with normalized details and remain retryable.

Unexpected SharePoint or PnPjs errors use existing normalization helpers and should include the view title as the resource.

## Composition And Public API

Implementation must update:

- `actions/sharepoint/action-modules.ts`
- `actions/sharepoint/_composition/list-subactions-schema.ts`
- `actions/sharepoint/schemas.ts`
- `actions/sharepoint/views/index.ts`
- `actions/sharepoint/index.ts` if needed by the existing barrel structure
- `actions/sharepoint/ACTIONS.md`
- package README or schema docs if they list supported SharePoint actions

No root-level schema registration is added in V1.

## Testing Strategy

Unit tests should cover:

- schema acceptance and rejection for all three actions;
- scope enum mapping;
- update property building;
- ordered field sync planning;
- field order comparison;
- scalar compliance comparison;
- default-view delete blocked behavior;
- modify rename compliance behavior.

Composition tests should cover:

- each action module is included in `sharePointActionModules`;
- each schema is included in `listSubactionSchema`;
- public schema exports are available from the expected public barrels;
- root action schema does not accept list view actions in V1.

Runtime tests can use mocks for PnPjs handles. A tenant smoke test is useful before release, but V1 should not depend on a live tenant for normal CI.

## V1 Non-Goals

V1 does not implement:

- root-level list view actions;
- personal views;
- modern Gallery/Tiles/Calendar view provisioning;
- JSON column/view formatting;
- full view XML authoring;
- CAML semantic equivalence;
- view subactions or view scope propagation;
- deleting the current default view in one action.

These are candidates for V2 after targeted spikes.
