# Engines

Provisioning engine implementations that orchestrate action execution.

## Purpose

This folder contains the main engine classes that:
- Validate provisioning plans against Zod schemas
- Execute actions in dependency order
- Manage scope propagation between parent and child actions
- Provide real-time execution tracing
- Support compliance checking for drift detection

## Files

| File | Description |
|------|-------------|
| index.ts | Barrel export for all engines |
| spfx-engine.ts | `SPFxProvisioningEngine` - main entry point for SPFx-based provisioning |
| sp-engine.ts | `SharePointProvisioningEngine` - SharePoint-specific engine implementation |

## Usage

```typescript
import { SPFxProvisioningEngine } from "./engines";

const engine = new SPFxProvisioningEngine({
  spfi: rootSPFI,
  planTemplate: plan,
  logger: logger,
});

// Execute provisioning
const result = await engine.run();

// Or check compliance only
const report = await engine.checkCompliance();
```

## Adding New Engines

1. Extend `ProvisioningEngineBase<Scope, ResultType>` from `../../core/engine`
2. Implement required abstract methods:
   - `validateEngineContextOrThrow(scope)` - context validation
   - `enrichCaughtError(err)` - error enrichment
3. Define static `provisioningSchema` and `definitions` for the engine
4. Export from `index.ts`
