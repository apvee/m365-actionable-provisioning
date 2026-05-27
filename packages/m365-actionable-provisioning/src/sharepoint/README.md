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
src/provisioning/
├── index.ts          # Public API barrel export
├── engines/          # Provisioning engine implementations
├── types/            # Type definitions (SPScope, SPRuntimeContext, etc.)
├── utils/            # General utilities (error handling, web resolution)
├── shared/           # Internal helpers (NOT exported publicly)
└── catalogs/         # Action definitions, schemas, and registry
```

## Files

| File | Description |
|------|-------------|
| index.ts | Main entry point and public API exports |

## Subfolders

| Folder | Description |
|--------|-------------|
| engines/ | Provisioning engine implementations |
| types/ | Type definitions (SPScope, SPRuntimeContext, etc.) |
| utils/ | General utilities (error handling, web resolution) |
| shared/ | Internal helpers (NOT exported publicly) |
| catalogs/ | Action definitions, schemas, and registry |

## Usage

```typescript
import { PnPjsProvisioningEngine, type SPScope } from "./provisioning";

const engine = new PnPjsProvisioningEngine({
  spfi: rootSPFI,
  planTemplate: provisioningPlan,
  logger: createLogger({ level: "info", sink: consoleSink }),
});

const result = await engine.run();
```

## Adding New Features

- **New action types**: See [catalogs/actions/ADDING_ACTIONS.md](catalogs/actions/ADDING_ACTIONS.md)
- **Shared utilities**: Add to `shared/` folder (internal only)
- **Public types**: Add to `types/` folder and update `types/index.ts`
