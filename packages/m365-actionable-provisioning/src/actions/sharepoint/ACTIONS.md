# SharePoint Provisioning Actions

This folder contains the SharePoint actions used by the unified M365
provisioning engine.

## Folder Structure

```text
actions/sharepoint/
  index.ts                    # SharePoint public API export
  action-definitions.ts       # Definitions derived from action modules
  provisioning-schema.ts      # Root SharePoint action schema composition
  schemas.ts                  # Public schema exports
  action-module.ts            # Lightweight action module metadata
  action-modules.ts           # Ordered built-in action module list
  _composition/               # Site/list subaction schema composition
  _shared/                    # Cross-action runtime/schema utilities
  domains/                    # SharePoint lookup and permission helpers
  fields/
    <action>/
      action.ts
      schema.ts
      index.ts
    _shared/
  lists/
    <action>/
      action.ts
      schema.ts
      index.ts
    _shared/
  sites/
    <action>/
      action.ts
      schema.ts
      index.ts
  views/
    <action>/
      action.ts
      schema.ts
      index.ts
```

## Architecture

Each concrete action owns its own schema and handler. The action folder exports an
action module containing:

- `verb`
- `schema`
- `definition`
- `placements`
- optional `schemasByPlacement`

SharePoint-level files only compose these modules:

- `action-definitions.ts` maps modules to runtime definitions
- `provisioning-schema.ts` composes root-level schemas
- `_composition/*` composes site/list subaction schemas
- `schemas.ts` re-exports public schema symbols without owning implementation

This keeps the engine concrete and avoids provider-style indirection while
removing the old drift between schema registration and handler registration.

## Public API

```ts
import {
  sharePointActionsSchema,
  sharePointActionDefinitions,
} from ".";
```

## Adding Actions

See `ADDING_ACTIONS.md`.

## List Views V1

SharePoint list/library view actions are list subactions only. In SharePoint and
PnPjs, document libraries are lists, so the same parent list scope is used for
both custom list views and library views. V1 exposes:

- `createSPListView`
- `modifySPListView`
- `deleteSPListView`

`createSPListView` is create-only. Existing views with the same title are
skipped rather than updated; use `modifySPListView` for mutable view changes.
Compliance still compares any mutable state declared on the create payload and
reports drift when the existing public view differs.

Create and modify payloads support:

```ts
{
  verb: "createSPListView" | "modifySPListView";
  title: string;
  fields?: string[];
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: true;
}
```

`deleteSPListView` accepts only `title` plus the verb. V1 does not support
root-level view actions, site subaction view actions, private views, formatted
modern views, full `ViewXml`, or `defaultView: false`.

Title lookup is restricted to public views (`PersonalView eq false`) so personal
views with the same title are ignored by V1 actions.

View actions are leaf actions. Non-empty `subactions` arrays are rejected.

Requested fields are resolved to SharePoint internal names before comparison or
write operations. During compliance, unresolved requested fields are reported as
`drift` details; handlers still fail before modifying the view. Duplicate raw
field references are rejected by the schema after trimming. Different
references that resolve to the same internal name are also rejected before
handler writes.

`viewQuery` is a CAML query fragment, not a wrapped `<View>` or `<Query>`
document. Wrapper payloads are rejected even when prefixed by XML declarations
or leading XML comments:

```xml
<OrderBy><FieldRef Name="Modified" Ascending="FALSE" /></OrderBy>
```

## Navigation V1

SharePoint navigation node actions are site subactions only. They run under
`createSPSite` or `modifySPSite` and use the target web propagated by the parent
site action. V1 exposes:

- `createSPNavigationNode`
- `modifySPNavigationNode`
- `deleteSPNavigationNode`

The `location` field uses PnPjs web navigation collection names:

- `quicklaunch`
- `topNavigationBar`

Use an absolute URL or a server-relative URL that includes the target site path.
For example, use `/sites/demo/Lists/orders/AllItems.aspx` rather than
`/Lists/orders/AllItems.aspx`; the latter is resolved from the tenant root.

Navigation node actions are leaf actions. Non-empty `subactions` arrays are
rejected.

V1 supports root navigation nodes only. It does not support root-level
navigation actions, list-level navigation actions, footer navigation, child
nodes, ordering, audience targeting, or duplicate-title mutation. If multiple
nodes in the selected location have the same title, handlers skip with an
`unsupported` result and emit a `NAVIGATION_NODE_AMBIGUOUS_TITLE` warning.

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

V1 uses PnPjs SharePoint security APIs. It does not use Graph to write role
assignments. Graph is used only for optional Entra/Microsoft 365 group lookup
by name or mail nickname.

## Shared Utilities

Action handlers use SharePoint domain helpers from `domains`
for lookup, permission probing and field/list operations. Keep reusable
SharePoint behavior there; keep action-specific mapping and payload handling in
the action folder.
