# Core M365 Provisioning Engine

`@apvee/m365-actionable-provisioning` is the generic provisioning engine package. It is not tied to SPFx. It can run in any TypeScript host that can provide authenticated PnPjs clients, including SPFx web parts, Node.js services, scripts, CLIs, and tests.

The SPFx package uses this same engine through `createM365ProvisioningEngine`; it does not own a separate provisioning runtime.

## Runtime Model

```typescript
type M365Clients = {
  spfi?: SPFI;
  graphClient?: GraphFI;
};

type M365Scope = {
  site?: ISite;
  web?: IWeb;
  list?: IList;
  groupId?: string;
  teamId?: string;
  userId?: string;
  driveId?: string;
  graphSiteId?: string;
  graphListId?: string;
  siteUrl?: string;
  webUrl?: string;
  listName?: string;
  contentType?: IContentType;
  contentTypeId?: string;
  contentTypeName?: string;
  siteColumnIdsByFieldName?: Record<string, string>;
  [key: string]: unknown;
};
```

Clients are injected once when the engine is created and are available to actions as `ctx.clients`. Scope is reserved for propagated runtime state produced by parent actions.

## Built-In Catalog Usage

Use `createM365ProvisioningEngine` for the built-in Microsoft 365 catalog:

```typescript
import {
  createLogger,
  createM365ProvisioningEngine,
  consoleSink,
} from '@apvee/m365-actionable-provisioning';

const engine = createM365ProvisioningEngine({
  clients: { spfi, graphClient },
  initialScope: {
    web: targetWeb,
    siteUrl: targetSiteUrl,
    webUrl: targetSiteUrl,
  },
  planTemplate,
  logger: createLogger({ level: 'info', sink: consoleSink }),
  options,
});

const snapshot = await engine.run();
const report = await engine.checkCompliance();
```

SharePoint list, field, view, navigation, and permission actions use `spfi`. Content type actions are Graph-first and require `graphClient`.

## Advanced Direct Usage

Construct `ProvisioningEngine` directly only when replacing the default action definitions or provisioning schema:

```typescript
import {
  ProvisioningEngine,
  m365ActionDefinitions,
  m365ProvisioningPlanSchema,
  type M365Clients,
  type M365Scope,
  type ProvisioningResultLight,
} from '@apvee/m365-actionable-provisioning';

const engine = new ProvisioningEngine<M365Scope, ProvisioningResultLight, M365Clients>({
  clients: { spfi, graphClient },
  initialScope,
  planTemplate,
  logger,
  options,
  definitions: m365ActionDefinitions,
  provisioningSchema: m365ProvisioningPlanSchema,
});
```

## Action Requirements

Action definitions can declare required clients:

```typescript
readonly requiredClients = ['spfi'] as const;
readonly requiredClients = ['graphClient'] as const;
```

The engine validates required clients before permission checks, handlers, and compliance checks. Missing clients fail execution with `MISSING_CLIENT`; during compliance they are reported as unverifiable.

## Related Documentation

- [Introduction](../introduction.md)
- [Provisioning schema](./provisioning-schema.md)
- [SPFx integration](../spfx/integration.md)
