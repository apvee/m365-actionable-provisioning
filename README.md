# @apvee/spfx-actionable-provisioning

Schema-first provisioning engine for SPFx, built on PnPjs and Zod.

The repository contains:
- A generic provisioning engine (DFS execution + tracing + permissions preflight)
- A SharePoint action catalog (sites, lists, fields) designed to run from SPFx

![@apvee/spfx-actionable-provisioning demo](./docs/demo.gif)

## Documentation

Comprehensive documentation is available in the [docs](./docs) folder:

| Document | Description |
|----------|-------------|
| [Introduction](./docs/introduction.md) | Getting started guide, installation, and quick start |
| [Provisioning Schema](./docs/provisioning-schema.md) | Complete reference for plan structure and action types |
| [SPFx Engine](./docs/spfx-engine.md) | Engine API, execution model, and error handling |
| [ProvisioningDialog](./docs/provisioning-dialog.md) | Dialog component props, events, and customization |
| [Property Pane Fields](./docs/property-pane-fields.md) | PropertyPaneProvisioningField and PropertyPaneSiteSelectorField |

### Quick Start

```typescript
import { ProvisioningDialog } from '@apvee/spfx-actionable-provisioning/provisioning-ui';
import { createLogger, consoleSink } from '@apvee/spfx-actionable-provisioning/core';

// In your React component
<ProvisioningDialog
  open={isDialogOpen}
  onClose={() => setOpen(false)}
  context={this.context}
  planTemplate={myPlan}
  logger={createLogger({ level: 'debug', sink: consoleSink })}
  targetSiteUrl="https://contoso.sharepoint.com/sites/project"
/>
```

See the [Introduction](./docs/introduction.md) for complete setup instructions.

## Core concepts

### Plans are schema-governed
Each action is validated by a Zod schema before execution. Actions may contain `subactions`, which execute with a derived scope.

### Scope is an in-memory execution context
The engine passes a `scopeIn` into each action and merges an action-produced `scopeDelta` into `scopeOut`.

For SharePoint provisioning, the scope is intentionally **handle-based**:
- `spfi`: configured SPFI instance (auth + behaviors)
- `site?`: PnPjs `ISite` handle
- `web?`: PnPjs `IWeb` handle
- `list?`: PnPjs `IList` handle

Parent actions (e.g. `createSPList`) set `web`/`list` in `scopeDelta`, and subactions reuse these handles.
This avoids repeated resolution calls (no more storing `siteUrl`, `webUrl`, `listId`, `listName` in scope).

### Merge semantics (important)
Scope merging is **instance-safe**:
- Only "plain objects" are deep-merged
- Non-plain objects (including PnPjs handles) are treated as atomic values ("last wins")

This is what allows PnPjs instances to live inside scope safely.

## SharePoint actions

The main SharePoint catalog is defined in `src/provisioning/catalogs/sp-catalog.ts`.
Supported patterns:
- Site actions can contain list + site-field subactions
- List actions can contain list-field subactions
- Field actions route automatically based on scope:
  - if `scopeIn.list` exists → operate on list fields and allow view/form flags
  - otherwise → operate on root-web (site columns) and ignore list-only flags

## Example plan

See `src/webparts/testProvisioning/examplePlan.ts` for a full example. A minimal sketch:

```ts
[
  {
    verb: "modifySPSite",
    siteUrl: "https://tenant.sharepoint.com/sites/engineering",
    title: "Engineering",
    subactions: [
      {
        verb: "createSPList",
        listName: "engineeringRequests",
        title: "Engineering Requests",
        template: 100,
        subactions: [
          {
            verb: "createSPField",
            fieldType: "Text",
            fieldName: "RequestTitle",
            displayName: "Request Title",
            required: true,
            addToDefaultView: true,
          },
        ],
      },
    ],
  },
]
```

## Dev commands

```bash
npm install
npm run build
gulp serve
```
