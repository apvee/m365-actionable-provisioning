# SharePoint Provisioning Catalogs

This folder contains the SharePoint action catalog used by the unified M365
provisioning engine.

## Folder Structure

```text
catalogs/
  index.ts                    # Barrel export
  action-definitions.ts       # Definitions derived from action modules
  provisioning.schema.ts      # Root SharePoint action schema composition
  schemas.ts                  # Public compatibility facade for schemas
  actions/
    action-module.ts          # Lightweight action module metadata
    action-modules.ts         # Ordered built-in action module list
    _composition/             # Site/list subaction schema composition
    _shared/schemas/          # Shared schema primitives
    shared/                   # Cross-action runtime utilities
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
```

## Architecture

Each concrete action owns its own schema and handler. The action folder exports an
action module containing:

- `verb`
- `schema`
- `definition`
- `placements`
- optional `schemasByPlacement`

Catalog-level files only compose these modules:

- `action-definitions.ts` maps modules to runtime definitions
- `provisioning.schema.ts` composes root-level schemas
- `_composition/*` composes site/list subaction schemas
- `schemas.ts` re-exports public schema symbols without owning implementation

This keeps the engine concrete and avoids provider-style indirection while
removing the old drift between schema registration and handler registration.

## Public API

```ts
import {
  sharePointActionsSchema,
  sharePointActionDefinitions,
} from "./catalogs";
```

## Adding Actions

See `actions/ADDING_ACTIONS.md`.

## Shared Utilities

Action handlers use SharePoint domain helpers from `sharepoint/shared/domains`
for lookup, permission probing and field/list operations. Keep reusable
SharePoint behavior there; keep action-specific mapping and payload handling in
the action folder.
