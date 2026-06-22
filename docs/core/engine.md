# Unified M365 Provisioning Engine

The previous `SPFxProvisioningEngine` and `SharePointProvisioningEngine` wrappers were removed. Consumers now use the single core `ProvisioningEngine` with explicit PnPjs clients.

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
  [key: string]: unknown;
};
```

Clients are injected once through the engine constructor and are available to actions as `ctx.clients`. Scope remains only for propagated runtime state such as `web`, `list`, `groupId`, or `driveId`.

## Direct Usage

```typescript
import { ProvisioningEngine, createLogger, consoleSink } from "@apvee/m365-actionable-provisioning";
import {
  m365ActionDefinitions,
  m365ProvisioningPlanSchema,
  type M365Clients,
  type M365Scope,
  type ProvisioningResultLight,
} from "@apvee/m365-actionable-provisioning";

const engine = new ProvisioningEngine<M365Scope, ProvisioningResultLight, M365Clients>({
  clients: { spfi, graphClient },
  initialScope: { web: targetWeb },
  planTemplate,
  logger: createLogger({ level: "info", sink: consoleSink }),
  options,
  definitions: m365ActionDefinitions,
  provisioningSchema: m365ProvisioningPlanSchema,
});

const snapshot = await engine.run();
```

For the built-in M365 catalog, use the convenience factory when you do not need to override the definitions or schema:

```typescript
import { createM365ProvisioningEngine } from "@apvee/m365-actionable-provisioning";

const engine = createM365ProvisioningEngine({
  clients: { spfi, graphClient },
  initialScope: { web: targetWeb },
  planTemplate,
  logger,
  options,
});
```

## SPFx Hook

`useSPFxProvisioningEngine` still owns the React lifecycle, but internally it now creates the unified `ProvisioningEngine` and passes `clients: { spfi }`.

```typescript
const { snapshot, run, cancel, checkCompliance } = useSPFxProvisioningEngine({
  context,
  targetSiteUrl,
  planTemplate,
  logger,
  initialScope,
  engineOptions,
});
```

## Action Requirements

Action definitions can declare required clients:

```typescript
readonly requiredClients = ["spfi"] as const;
```

The engine validates required clients before permission checks, handlers, and compliance checks. Missing clients fail execution with `MISSING_CLIENT`; during compliance they are reported as unverifiable.
