# Apvee M365 Actionable Provisioning

Monorepo for Apvee Microsoft 365 actionable provisioning packages and the SPFx demo app.

## Workspaces

| Workspace | Package | Purpose |
| --- | --- | --- |
| `packages/m365-actionable-provisioning` | `@apvee/m365-actionable-provisioning` | Schema-first Microsoft 365 provisioning engine, runtime contracts, built-in M365 catalog, and SharePoint action catalog. |
| `packages/spfx-m365-actionable-provisioning` | `@apvee/spfx-m365-actionable-provisioning` | SPFx React UI, hooks, property pane fields, theme bridge, localization, and activity utilities for the core package. |
| `apps/test-spfx` | `test-spfx` | Private SPFx demo app that consumes both packages through npm workspaces. |

## Requirements

- Node.js `>=22.14.0 <23.0.0`
- npm workspaces
- SPFx 1.21 for the demo app and SPFx package consumers

## Common Commands

```bash
npm install
npm run build:m365
npm run build:spfx
npm run build:test-spfx
npm run build
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

## Import Surface

```typescript
import {
  createLogger,
  createM365ProvisioningEngine,
  consoleSink,
  type M365ProvisioningPlan,
} from '@apvee/m365-actionable-provisioning';

import {
  PropertyPaneProvisioningField,
  PropertyPaneSiteSelectorField,
  ProvisioningDialog,
  SPFxFluentProvider,
} from '@apvee/spfx-m365-actionable-provisioning';
```

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/introduction.md`](./docs/introduction.md) | Product and integration overview. |
| [`docs/core/engine.md`](./docs/core/engine.md) | Generic core engine usage for Node, SPFx, and other TypeScript hosts. |
| [`docs/core/provisioning-schema.md`](./docs/core/provisioning-schema.md) | Provisioning plan and SharePoint action schema reference. |
| [`docs/spfx/integration.md`](./docs/spfx/integration.md) | SPFx integration package setup, hook runtime, localization, and Graph permissions. |
| [`docs/spfx/provisioning-dialog.md`](./docs/spfx/provisioning-dialog.md) | `ProvisioningDialog` reference. |
| [`docs/spfx/property-pane-fields.md`](./docs/spfx/property-pane-fields.md) | SPFx property pane field reference. |
| [`packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md`](./packages/m365-actionable-provisioning/src/actions/sharepoint/ACTIONS.md) | SharePoint action catalog implementation notes. |
