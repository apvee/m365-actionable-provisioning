# Provisioning Module

A schema-driven provisioning framework for SharePoint Online using PnPjs v4.

## Purpose

This module provides a declarative approach to SharePoint provisioning through:
- **Schema-first validation** using Zod for type-safe action definitions
- **Hierarchical execution** with scope propagation between parent and child actions
- **Real-time tracing** for monitoring provisioning progress
- **Compliance checking** to detect drift between desired and actual state

## Action Semantics

SharePoint actions follow a deliberate create/modify/delete split:

- `createSPSite`, `createSPList`, `addSPField`, and `createSPSiteColumn` ensure that the target resource exists.
- `modifySPSite`, `modifySPList`, and `modifySPField` enforce mutable configuration on existing resources.
- `deleteSPSite`, `deleteSPList`, and `deleteSPField` ensure absence.

Create actions do not reconcile mutable properties on already-existing resources. For example, an existing list with the requested `listName` but a different `Title` still satisfies the create action. Add a `modifySPList` action when the title must be enforced.

Compliance for create actions checks existence and structural compatibility. It does not fail because mutable properties differ. Structural collisions, such as an existing field with a different SharePoint field type, can return `non_compliant` because descendant actions may otherwise operate against the wrong shape.

## Architecture

```
packages/m365-actionable-provisioning/src/actions/sharepoint/
├── index.ts          # Public API barrel export
├── utils/            # General utilities (error handling, web resolution)
├── domains/          # SharePoint domain helpers
├── _composition/     # Site/list subaction schema composition
├── _shared/          # Cross-action runtime/schema utilities
├── sites/            # Site action modules
├── lists/            # List action modules
└── fields/           # Field action modules
```

## Files

| File | Description |
|------|-------------|
| index.ts | Main entry point and public API exports |

## Subfolders

| Folder | Description |
|--------|-------------|
| utils/ | General utilities (error handling, web resolution) |
| domains/ | SharePoint domain helpers used by action handlers |
| sites/, lists/, fields/ | Co-located action modules, definitions and schema |
| _composition/ | Parent/child action schema composition |
| _shared/ | Cross-action runtime/schema utilities |

## Usage

```typescript
import { ProvisioningEngine, createLogger, consoleSink } from "@apvee/m365-actionable-provisioning";
import { m365ActionDefinitions, m365ProvisioningPlanSchema, type M365Scope } from "@apvee/m365-actionable-provisioning";

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

- **New action types**: See [ADDING_ACTIONS.md](ADDING_ACTIONS.md)
- **Shared utilities**: Add to `domains/`, `_shared/`, or domain-local `_shared/` folders
- **Public M365 types**: Add to `runtime/` or `catalog/` and re-export intentionally from the package root
