# Provisioning Module

A schema-driven provisioning framework for SharePoint Online using PnPjs v4.

## Purpose

This module provides a declarative approach to SharePoint provisioning through:
- **Schema-first validation** using Zod for type-safe action definitions
- **Hierarchical execution** with scope propagation between parent and child actions
- **Real-time tracing** for monitoring provisioning progress
- **Compliance checking** to detect drift between desired and actual state

## Architecture

```
packages/m365-actionable-provisioning/src/sharepoint/
├── index.ts          # Public API barrel export
├── utils/            # General utilities (error handling, web resolution)
├── shared/           # SharePoint domain helpers
└── catalogs/         # Co-located action modules and schema composition
```

## Files

| File | Description |
|------|-------------|
| index.ts | Main entry point and public API exports |

## Subfolders

| Folder | Description |
|--------|-------------|
| utils/ | General utilities (error handling, web resolution) |
| shared/ | SharePoint domain helpers used by action handlers |
| catalogs/ | Co-located action modules, definitions and schema composition |

## Usage

```typescript
import { ProvisioningEngine, createLogger, consoleSink } from "@apvee/m365-actionable-provisioning/core";
import { m365ActionDefinitions, m365ProvisioningPlanSchema, type M365Scope } from "@apvee/m365-actionable-provisioning/m365";

const engine = new ProvisioningEngine<M365Scope>({
  clients: { spfi: rootSPFI },
  initialScope: { web: targetWeb },
  planTemplate: provisioningPlan,
  logger: createLogger({ level: "info", sink: consoleSink }),
  definitions: m365ActionDefinitions,
  provisioningSchema: m365ProvisioningPlanSchema,
});

const result = await engine.run();
```

## Adding New Features

- **New action types**: See [catalogs/actions/ADDING_ACTIONS.md](catalogs/actions/ADDING_ACTIONS.md)
- **Shared utilities**: Add to `shared/` folder (internal only)
- **Public M365 types**: Add to the `m365/` module and re-export intentionally
