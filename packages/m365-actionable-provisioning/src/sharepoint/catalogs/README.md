# SharePoint Provisioning Catalogs

This folder contains the SharePoint provisioning action catalog for the PnPjs Provisioning library.

## Folder Structure

```
catalogs/
├── index.ts                    # Barrel export (public API)
├── provisioning.schema.ts      # Schema definitions + versioning
├── action.registry.ts          # Lazy action registry
├── schemas/                    # Individual action schemas
│   ├── index.ts
│   ├── fields/                 # Field action schemas
│   ├── lists/                  # List action schemas
│   ├── shared/                 # Shared schema components
│   └── sites/                  # Site action schemas
└── actions/                    # Action handler implementations
    ├── fields/                 # Field action handlers
    ├── lists/                  # List action handlers
    ├── shared/                 # Shared action utilities
    └── sites/                  # Site action handlers
```

## Architecture

### Schema / Registry Separation

The catalog architecture follows separation of concerns:

1. **Schema Layer** (`provisioning.schema.ts`)
   - Zod schema definitions for validation
   - Schema versioning support
   - Action composition into provisioning plan schema

2. **Registry Layer** (`action.registry.ts`)
   - Factory-based action registration
   - Lazy instantiation of handlers
   - Singleton caching per verb

### Version Support

The schema supports versioning via the `schemaVersion` field:

- Default version: `"1.0"`
- Backward compatible: Plans without `schemaVersion` default to `"1.0"`
- Version format: `major.minor` (e.g., `"1.0"`, `"2.0"`)

### Lazy Loading

Action handlers are registered as factory functions and only instantiated when first accessed:

```typescript
// No handlers instantiated yet
import { actionRegistry } from "./catalogs";

// Handler created on first access
const handler = actionRegistry.get("createSPSite");

// Cached for subsequent calls
const same = actionRegistry.get("createSPSite"); // Returns cached instance
```

## Public API

Import from the barrel export:

```typescript
import {
  // Schema
  provisioningPlanSchema,
  actionsSchema,
  type ProvisioningPlan,
  
  // Registry
  actionRegistry,
  
  // Version constants
  DEFAULT_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
} from "./catalogs";
```

## Internal APIs

The following are marked `@internal` and should not be used directly:

- `ActionRegistry` class (use `actionRegistry` singleton)
- Root action schema composition functions
- Parameter validation schemas

## Shared Utilities

Action handlers leverage shared utilities from the `../shared/` folder to reduce code duplication:

### SPFI Guards (`shared/spfi-guard.ts`)

```typescript
import { requireSpfi, getSpfiOrUnverifiable } from "../shared";

// For operations that MUST have SPFI (throws if missing)
const sp = requireSpfi(runtime);

// For operations that return "unverifiable" if SPFI missing
const spOrResult = getSpfiOrUnverifiable(runtime, action);
if (isUnverifiableResult(spOrResult)) {
  return spOrResult; // Return early with unverifiable result
}
```

### Compliance Helpers (`shared/compliance-helpers.ts`)

```typescript
import { compliant, nonCompliant, unverifiableMissingPrereq } from "../shared";

// Standardized result creation
return compliant(action, summary);
return nonCompliant(action, summary, details);
return unverifiableMissingPrereq(action, "List not found");
```

### Domain-Specific Helpers

- **`shared/domains/lists/`** - List lookup, permission probing
- **`shared/domains/sites/`** - Site utilities  
- **`shared/domains/fields/`** - Field lookup, existence checks, updates

See `../shared/README.md` for comprehensive documentation.

## Adding New Actions

1. Create schema in `schemas/<category>/`
2. Create handler in `actions/<category>/`
3. **Use shared helpers** from `../shared/` for common operations
4. Register factory in `action.registry.ts`
5. Add schema to root action discriminated union in `provisioning.schema.ts`
6. Export from `schemas/index.ts` and `catalogs/index.ts`
