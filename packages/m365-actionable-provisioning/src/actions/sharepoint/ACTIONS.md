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
    _shared/
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

## List Views

SharePoint list view V1 actions provision public standard list views as list
subactions. They are valid under `createSPList` or `modifySPList`; they are not
root-level SharePoint actions in V1.

Supported verbs:

- `createSPListView` ensures a public standard list view exists and applies the
  declared mutable V1 state.
- `modifySPListView` enforces mutable state on an existing public standard list
  view.
- `deleteSPListView` ensures a public standard list view is absent.

Example:

```ts
{
  verb: "createSPList",
  listName: "documents",
  title: "Documents",
  template: 101,
  subactions: [
    {
      verb: "createSPListView",
      title: "Active documents",
      fields: ["DocIcon", "LinkFilename", "Modified"],
      viewQuery: "<Where><Eq><FieldRef Name=\"Status\" /><Value Type=\"Text\">Active</Value></Eq></Where>",
      rowLimit: 100,
      paged: true,
      defaultView: true,
      tabularView: true,
      scope: "recursiveAll"
    },
    {
      verb: "modifySPListView",
      title: "Active documents",
      newTitle: "Recently changed documents",
      fields: ["DocIcon", "LinkFilename", "Editor", "Modified"],
      viewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /></OrderBy>",
      rowLimit: 50
    },
    {
      verb: "deleteSPListView",
      title: "Old documents"
    }
  ]
}
```

V1 supports ordered visible field membership, CAML view query fragments, row
limit, paging, default view promotion, tabular view, and standard SharePoint
view scopes: `default`, `recursive`, `recursiveAll`, and `filesOnly`.
`viewQuery` expects the contents of the CAML `<Query>` node, such as
`<Where>...</Where>` or `<OrderBy>...</OrderBy>`, without wrapping it in
`<View>` or `<Query>`.

`defaultView: false` is compliance-only drift information. Runtime changes the
default view by setting `defaultView: true` on another view; it does not send a
false default-view update to SharePoint.

Deleting the current default view is blocked in V1. `deleteSPListView` returns a
skipped unsupported result with warning code
`LIST_VIEW_DEFAULT_DELETE_BLOCKED`; set another view as default first, then
delete the old view.

V1 intentionally excludes personal views, Gallery/Tiles/Calendar views, and
modern JSON formatting.

## Shared Utilities

Action handlers use SharePoint domain helpers from `domains`
for lookup, permission probing and field/list operations. Keep reusable
SharePoint behavior there; keep action-specific mapping and payload handling in
the action folder.
