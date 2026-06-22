# Introduction to M365 Actionable Provisioning

> Schema-first Microsoft 365 provisioning engine, with an optional SPFx integration package.

This repository contains two publishable packages with different responsibilities:

| Package | Scope | Can be used in |
| --- | --- | --- |
| `@apvee/m365-actionable-provisioning` | Core provisioning engine, schemas, runtime contracts, logging, compliance checks, and SharePoint action catalog. | SPFx, Node.js services, scripts, CLIs, tests, or any TypeScript project that can provide authenticated PnPjs clients. |
| `@apvee/spfx-m365-actionable-provisioning` | SPFx-specific React UI, hooks, property pane fields, theme bridge, localization, and activity helpers. | SharePoint Framework solutions only. |

![@apvee/m365-actionable-provisioning demo](./demo.gif)

## Architecture At A Glance

```text
Any TypeScript host
  -> creates authenticated PnPjs clients
  -> createM365ProvisioningEngine
  -> M365ProvisioningPlan
  -> SharePoint action catalog
  -> run() / checkCompliance()

SPFx host
  -> @apvee/spfx-m365-actionable-provisioning
  -> SPFxFluentProvider / ProvisioningDialog / property pane fields
  -> useSPFxProvisioningEngine
  -> createM365ProvisioningEngine
```

The core engine validates each plan against Zod schemas before execution. Actions receive SDK clients through `ctx.clients` and propagated runtime state through `ctx.scopeIn`.

## Core Package

Install the core package when you need provisioning behavior without SPFx UI:

```bash
npm install @apvee/m365-actionable-provisioning @pnp/sp @pnp/graph
```

The host application owns authentication and passes PnPjs clients to the engine:

```typescript
import {
  createLogger,
  createM365ProvisioningEngine,
  consoleSink,
  type M365ProvisioningPlan,
} from '@apvee/m365-actionable-provisioning';

const plan: M365ProvisioningPlan = {
  schemaVersion: '1.0',
  actions: [
    {
      verb: 'modifySPSite',
      siteUrl: 'https://contoso.sharepoint.com/sites/engineering',
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
            },
          ],
        },
      ],
    },
  ],
};

const engine = createM365ProvisioningEngine({
  clients: { spfi, graphClient },
  initialScope: { web: targetWeb, siteUrl: targetSiteUrl, webUrl: targetSiteUrl },
  planTemplate: plan,
  logger: createLogger({ level: 'info', sink: consoleSink }),
});

await engine.run();
await engine.checkCompliance();
```

Use `addSPField` for list fields and `createSPSiteColumn` for site columns.

## SPFx Package

Install the SPFx package only in SharePoint Framework solutions:

```bash
npm install @apvee/spfx-m365-actionable-provisioning @apvee/m365-actionable-provisioning
```

The SPFx package adapts the core engine to SharePoint Framework by creating `spfi` and `graphClient` from SPFx context, applying SPFx theme tokens to Fluent UI 9, wiring localization, and exposing ready-to-use UI surfaces.

## Permissions

SharePoint-backed actions run with the current user's SharePoint permissions through `spfi`.

Content type actions are Graph-backed and require `graphClient`. Any host that uses content type actions must provide a Graph client with Microsoft Graph `Sites.Manage.All` or a higher permission such as `Sites.FullControl.All`.

SPFx solutions request this in `webApiPermissionRequests`:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Sites.Manage.All"
  }
]
```

The engine validates missing clients before execution. It does not inspect token claims; Graph authorization failures surface as Graph `401` or `403` responses.

## Documentation Map

| Area | Document | Description |
| --- | --- | --- |
| Core | [Core engine](./core/engine.md) | Generic engine usage for Node, SPFx, and other TypeScript hosts. |
| Core | [Provisioning schema](./core/provisioning-schema.md) | Plan structure, action placement, and SharePoint action payloads. |
| SPFx | [SPFx integration](./spfx/integration.md) | SPFx package setup, hook behavior, localization, and permissions. |
| SPFx | [ProvisioningDialog](./spfx/provisioning-dialog.md) | Dialog component props, modes, events, and localization. |
| SPFx | [Property pane fields](./spfx/property-pane-fields.md) | Property pane field props, state persistence, and localization. |

## Recommended Reading Order

1. Read [Core engine](./core/engine.md) to understand the generic runtime.
2. Read [Provisioning schema](./core/provisioning-schema.md) before authoring plans.
3. Read [SPFx integration](./spfx/integration.md) only when building a SharePoint Framework solution.
