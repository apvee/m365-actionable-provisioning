# Types

SharePoint-specific type definitions for the provisioning module.

## Purpose

This folder contains TypeScript type definitions that:
- Define the scope structure for SharePoint provisioning
- Provide runtime context types for action handlers
- Define result types for provisioning outcomes

## Files

| File | Description |
|------|-------------|
| index.ts | Barrel export for all types |
| sp-scope.ts | `SPScope` - SharePoint scope containing SPFI and handles |
| sp-runtime-context.ts | `SPRuntimeContext<T>` - Runtime context for action handlers |
| sp-result.ts | `SPActionResult`, `ProvisioningResultLight`, outcome types |

## Key Types

### SPScope

The scope object that flows through action execution:

```typescript
type SPScope = {
  spfi?: SPFI;     // PnPjs root instance
  site?: ISite;    // Site handle (optional)
  web?: IWeb;      // Web handle (used by most actions)
  list?: IList;    // List handle (for list subactions)
};
```

### SPRuntimeContext

Runtime context passed to action handlers:

```typescript
type SPRuntimeContext<TPayload> = ActionRuntimeContext<SPScope, TPayload>;
```

### SPActionResult

Standard result type for action handlers:

```typescript
type SPActionResult = ActionResult<SPScope, ProvisioningResultLight>;
```

## Adding New Types

1. Create a new file in this folder (e.g., `sp-custom.ts`)
2. Define and export your types
3. Add export to `index.ts`
4. If the type should be public API, add export to `../index.ts`
