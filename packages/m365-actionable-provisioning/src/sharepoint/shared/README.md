# Shared

Internal shared helpers for action handlers. **NOT part of public API.**

## Purpose

This folder contains internal utilities that:
- Provide consistent SPFI validation across all actions
- Standardize compliance check result creation
- Centralize permission checking patterns
- Organize domain-specific helpers (lists, sites, fields)

⚠️ **Important**: These helpers are internal. Do not export from the root `index.ts`.

## Files

| File | Description |
|------|-------------|
| index.ts | Barrel export for all shared helpers |
| spfi-guard.ts | SPFI validation guards (`requireSpfi`, `getSpfiOrUnverifiable`) |
| compliance-helpers.ts | Compliance result factories (`compliant`, `nonCompliant`, etc.) |
| permission-helpers.ts | Permission check helpers for list/site operations |
| domains/ | Domain-specific helpers (lists, sites, fields) |

## Key Functions

### SPFI Guards

```typescript
// In handler() - throws if SPFI missing
const spfi = requireSpfi(ctx.scopeIn);

// In checkCompliance() - returns unverifiable if SPFI missing
const result = getSpfiOrUnverifiable(ctx.scopeIn);
if (isUnverifiableResult(result)) {
  return result;
}
const spfi = result;
```

### Compliance Helpers

```typescript
// Missing prerequisite
return unverifiableMissingPrereq("SPFI not available");

// Error during check
return unverifiableError(resourceName, caughtError);

// Resource is compliant
return compliant(resourceName, { web });

// Resource needs action
return nonCompliant(resourceName, "not_found");
```

### Permission Helpers

```typescript
// For list operations
return checkListOperationPermission(ctx);

// For site operations
return checkSiteOperationPermission(ctx);
```

## Adding New Helpers

1. Create a new file in this folder
2. Add `@internal` JSDoc tag to all exports
3. Export from `index.ts`
4. **Do NOT export from `../index.ts`** (keep internal)
