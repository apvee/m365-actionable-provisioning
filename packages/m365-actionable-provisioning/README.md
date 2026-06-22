# @apvee/m365-actionable-provisioning

Schema-first actionable provisioning engine for Microsoft 365, starting with SharePoint actions.

This package contains the core runtime, the built-in Microsoft 365 provisioning catalog, Zod schemas, logging utilities, compliance checks, and SharePoint action definitions. It does not contain SPFx React UI. Use `@apvee/spfx-m365-actionable-provisioning` for SPFx components, hooks, property pane fields, and localization.

## Installation

```bash
npm install @apvee/m365-actionable-provisioning @pnp/sp @pnp/graph
```

`@pnp/sp` and `@pnp/graph` are peer dependencies because host applications own their authenticated PnPjs clients.

## Public API

The npm package exposes only the package root (`@apvee/m365-actionable-provisioning`) and `./package.json`. Import public APIs from the package root; deep import paths are not part of the package export contract.

The package root exports these public areas:

- `core`: generic provisioning engine, action definitions, compliance types, permissions, logging, and tracing.
- `runtime`: Microsoft 365 client, scope, context, and lightweight result types.
- `catalog`: built-in M365 provisioning catalog, `createM365ProvisioningEngine`, and provisioning plan schema/types.
- `actions/sharepoint`: SharePoint action schemas, definitions, modules, and action-specific payload types.

Prefer `createM365ProvisioningEngine` for the built-in catalog. Construct `ProvisioningEngine` directly only when you need to replace the action definitions or provisioning schema.

## Quick Start

```typescript
import {
  createLogger,
  createM365ProvisioningEngine,
  consoleSink,
  type M365ProvisioningPlan,
} from '@apvee/m365-actionable-provisioning';

const plan: M365ProvisioningPlan = {
  schemaVersion: '1.0',
  parameters: [
    { key: 'SiteUrl', value: 'https://contoso.sharepoint.com/sites/engineering' },
  ],
  actions: [
    {
      verb: 'modifySPSite',
      siteUrl: '{parameter:SiteUrl}',
      title: 'Engineering Portal',
      subactions: [
        {
          verb: 'createSPList',
          listName: 'requests',
          title: 'Requests',
          template: 100,
          subactions: [
            {
              verb: 'addSPField',
              fieldType: 'Text',
              fieldName: 'RequestTitle',
              displayName: 'Request Title',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

const engine = createM365ProvisioningEngine({
  clients: { spfi, graphClient },
  initialScope: { web: targetWeb, siteUrl: 'https://contoso.sharepoint.com/sites/engineering' },
  planTemplate: plan,
  logger: createLogger({ level: 'info', sink: consoleSink }),
});

const snapshot = await engine.run();
const report = await engine.checkCompliance();
```

## Runtime Clients And Scope

Clients are injected once when the engine is created and are available to actions through `ctx.clients`:

```typescript
type M365Clients = {
  spfi?: SPFI;
  graphClient?: GraphFI;
};
```

Runtime scope is reserved for propagated handles and identifiers such as `site`, `web`, `list`, `graphSiteId`, `graphListId`, `siteUrl`, `webUrl`, `listName`, `contentTypeId`, `contentTypeName`, and `siteColumnIdsByFieldName`.

## SharePoint Action Placement

| Placement | Verbs |
| --- | --- |
| Root | `createSPSite`, `modifySPSite`, `deleteSPSite`, `createSPList`, `modifySPList`, `deleteSPList`, `createSPContentType`, `modifySPContentType`, `deleteSPContentType` |
| Site subaction | `createSPList`, `modifySPList`, `deleteSPList`, `createSPNavigationNode`, `modifySPNavigationNode`, `deleteSPNavigationNode`, `breakSPSiteRoleInheritance`, `resetSPSiteRoleInheritance`, `grantSPSiteRoleAssignment`, `removeSPSiteRoleAssignment`, `createSPContentType`, `modifySPContentType`, `deleteSPContentType`, `createSPSiteColumn`, `modifySPField`, `deleteSPField` |
| List subaction | `addSPField`, `modifySPField`, `deleteSPField`, `enableSPListRating`, `createSPListView`, `modifySPListView`, `deleteSPListView`, `breakSPListRoleInheritance`, `resetSPListRoleInheritance`, `grantSPListRoleAssignment`, `removeSPListRoleAssignment`, `addSPContentTypeToList`, `removeSPContentTypeFromList` |
| Content type subaction | `addSPFieldToContentType`, `modifySPContentTypeField`, `removeSPFieldFromContentType` |

Use `addSPField` for list fields and `createSPSiteColumn` for site columns.

## Action Semantics

Provisioning actions use explicit semantics:

- `create*` actions ensure a resource exists.
- `modify*` actions enforce mutable desired state.
- `delete*` actions ensure a resource is absent.

Create actions are intentionally idempotent and tolerant. If a resource already exists with the same stable identity, the action may return `skipped` with `reason: "already_exists"` and continue. Mutable properties supplied to create actions, such as titles, descriptions, groups, required flags, versioning settings, or default values, are create-time defaults. They are not reconciled when the resource already exists.

Use a follow-up `modify*` action when a plan must enforce mutable state:

```typescript
{
  verb: 'createSPList',
  listName: 'requests',
  title: 'Requests',
},
{
  verb: 'modifySPList',
  listName: 'requests',
  title: 'Richieste',
  enableVersioning: true,
}
```

Create actions may still report structural warnings or non-compliant compliance results for collisions that make the plan ambiguous, such as an existing field with the requested internal name but a different SharePoint field type.

`listName` always means the stable SharePoint list root/name, not the mutable list title or Graph display name.

## Content Types And Graph Permissions

Content type actions are Graph-first and require `graphClient`.

Consumer applications must configure Microsoft Graph `Sites.Manage.All` or a higher permission such as `Sites.FullControl.All` when they use content type actions. SPFx packages typically need:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Sites.Manage.All"
  }
]
```

The engine does not inspect token claims. Missing Graph clients are caught during preflight. Insufficient Graph permissions are reported when Graph returns `401` or `403`.

## Compliance And Warnings

Call `checkCompliance()` to compare the current Microsoft 365 state with a plan without making changes. Compliance for create actions checks existence and structural compatibility; it does not fail because mutable properties differ unless the collision makes descendant actions unsafe or ambiguous.

Action results may include `warnings`. Warnings are non-blocking audit details used when an action succeeds or skips but part of the operation needs operator attention.

## Package Scripts

```bash
npm run build -w @apvee/m365-actionable-provisioning
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

## Deeper Documentation

- [Introduction](../../docs/introduction.md)
- [Core engine](../../docs/core/engine.md)
- [Provisioning schema](../../docs/core/provisioning-schema.md)
- [SPFx integration package](../../docs/spfx/integration.md)
- [SharePoint action catalog notes](./src/actions/sharepoint/ACTIONS.md)
- [Adding SharePoint actions](./src/actions/sharepoint/ADDING_ACTIONS.md)
