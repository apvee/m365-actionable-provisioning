# Apvee M365 Actionable Provisioning

Monorepo for the Apvee actionable provisioning packages.

## Packages

| Workspace | Package | Purpose |
| --- | --- | --- |
| `packages/m365-actionable-provisioning` | `@apvee/m365-actionable-provisioning` | Schema-first provisioning core plus SharePoint action catalog and engines. |
| `packages/spfx-m365-actionable-provisioning` | `@apvee/spfx-m365-actionable-provisioning` | Reusable SPFx React UI, hooks, property pane fields, and localization wiring. |
| `apps/test-spfx` | `test-spfx` | SPFx demo app that consumes the two packages through npm workspaces. |

## Common Commands

```bash
npm install
npm run build:m365
npm run build:spfx
npm run build:test-spfx
npm run build
```

## Import Surface

```typescript
import { createLogger, consoleSink } from '@apvee/m365-actionable-provisioning/core';
import type { ProvisioningPlan } from '@apvee/m365-actionable-provisioning/sharepoint';

import {
  ProvisioningDialog,
  PropertyPaneProvisioningField,
  PropertyPaneSiteSelectorField,
} from '@apvee/spfx-m365-actionable-provisioning';
```

## Documentation

The detailed documentation is in [docs](./docs). Some examples still describe SharePoint-specific behavior, now exposed through `@apvee/m365-actionable-provisioning/sharepoint`.
