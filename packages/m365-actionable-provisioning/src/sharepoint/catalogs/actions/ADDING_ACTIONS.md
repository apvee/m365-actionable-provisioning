# Adding New SharePoint Provisioning Actions

This guide explains how to add new provisioning actions to the SharePoint catalog.

## Overview

Each action in the provisioning system follows a consistent structure:

1. **Schema** - Zod schema defining the action payload
2. **Handler** - Action class extending `ActionDefinition`
3. **Registry** - Registration in the action registry

## Quick Start

To add a new action (e.g., `createSPContentType`):

1. Create schema in `schemas/<domain>/create-sp-content-type.schema.ts`
2. Create handler in `actions/<domain>/create-sp-content-type.ts`
3. Register in `action.registry.ts`
4. Export from barrel files

## Step-by-Step Guide

### 1. Create the Schema

Create a new file in `schemas/<domain>/` with the Zod schema:

```typescript
// schemas/content-types/create-sp-content-type.schema.ts
import { z } from "zod";
import { basePayloadSchema, subactionsSchema } from "../shared/base.schemas";

/**
 * Payload schema for createSPContentType action.
 */
export const createSPContentTypePayloadSchema = z.object({
  name: z.string().min(1, "Content type name is required"),
  parentId: z.string().optional(),
  description: z.string().optional(),
  group: z.string().optional(),
  webUrl: z.string().optional(),
  siteUrl: z.string().optional(),
});

/**
 * Full action schema including verb, payload, and optional subactions.
 */
export const createSPContentTypeSchema = z.object({
  verb: z.literal("createSPContentType"),
  payload: createSPContentTypePayloadSchema.merge(basePayloadSchema),
  subactions: subactionsSchema.optional(),
});

export type CreateSPContentTypePayload = z.infer<typeof createSPContentTypePayloadSchema>;
```

### 2. Create the Handler

Create a new file in `actions/<domain>/` with the action class:

```typescript
// actions/content-types/create-sp-content-type.ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../sp-types";
import { resolveTargetWeb } from "../../../sp-utils";
import { createSPContentTypeSchema, type CreateSPContentTypePayload } from "../../schemas/content-types";

// Import from shared helpers for common patterns
import { probeManageListsPermission, resolveWebUrlString } from "../lists/base.helpers";

/**
 * CreateSPContentType action implementation.
 */
export class CreateSPContentTypeAction extends ActionDefinition<
  "createSPContentType",
  typeof createSPContentTypeSchema,
  SPScope
> {
  readonly verb = "createSPContentType";
  readonly actionSchema = createSPContentTypeSchema;

  /**
   * Check permissions for content type creation.
   * 
   * @remarks
   * Only implement permission logic specific to this action.
   * Use shared helpers for common patterns.
   */
  async checkPermissions(
    ctx: SPRuntimeContext<CreateSPContentTypePayload>
  ): Promise<PermissionCheckResult> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      return { decision: "deny", message: "SPFI instance not available in scope" };
    }

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: ctx.scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    return probeManageListsPermission(web, effectiveWebUrl);
  }

  /**
   * Execute the content type creation.
   * 
   * @remarks
   * Implement idempotent behavior - check if exists before creating.
   */
  async handler(
    ctx: SPRuntimeContext<CreateSPContentTypePayload>
  ): Promise<SPActionResult> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      throw new Error("SPFI instance not available in scope");
    }

    const { name, parentId, description, group } = ctx.action.payload;

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: ctx.scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    // TODO: Implement content type creation logic
    // Check if exists → skip if found
    // Create if not exists
    // Return result

    ctx.logger.info("Content type created", { name, webUrl: effectiveWebUrl });
    return {
      result: {
        outcome: "executed",
        resource: name,
      },
    };
  }

  /**
   * Check compliance - verify the content type exists.
   */
  async checkCompliance(
    ctx: ComplianceRuntimeContext<SPScope, CreateSPContentTypePayload>
  ): Promise<ComplianceActionCheckResult<SPScope>> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available" };
    }

    const { name } = ctx.action.payload;
    
    // TODO: Check if content type exists
    // If exists with expected config → compliant
    // If exists with wrong config → non_compliant
    // If not exists → non_compliant

    return { outcome: "compliant", resource: name };
  }
}
```

### 3. Register the Action

Add the action to `action.registry.ts`:

```typescript
// In action.registry.ts

// Add import at top
import { CreateSPContentTypeAction } from "./actions/content-types/create-sp-content-type";

// Add to registry initialization
registry.register("createSPContentType", () => new CreateSPContentTypeAction());
```

### 4. Update Barrel Exports

Export from the domain's index file:

```typescript
// schemas/content-types/index.ts
export * from "./create-sp-content-type.schema";

// actions/content-types/index.ts
export * from "./create-sp-content-type";
```

Update the root schema union in `provisioning.schema.ts`:

```typescript
// Add to the action discriminated union
export const actionsSchema = z.discriminatedUnion("verb", [
  // ... existing actions
  createSPContentTypeSchema,
]);
```

## Action Structure

Every action class should implement these three methods:

| Method | Purpose | Return Type |
|--------|---------|-------------|
| `checkPermissions` | Validate user has required permissions | `Promise<PermissionCheckResult>` |
| `handler` | Execute the action (idempotent) | `Promise<SPActionResult>` |
| `checkCompliance` | Verify resource matches expected state | `Promise<ComplianceActionCheckResult>` |

## Using Shared Helpers

### SPFI Validation

```typescript
import { requireSpfi, getSpfiOrUnverifiable, isUnverifiableResult } from "../../shared";

// In handler (throws if missing)
const spfi = requireSpfi(ctx);

// In compliance (returns unverifiable result if missing)
const spOrResult = getSpfiOrUnverifiable(ctx, ctx.action);
if (isUnverifiableResult(spOrResult)) {
  return spOrResult;
}
const spfi = spOrResult;
```

### Permission Checking

```typescript
import { probeManageListsPermission } from "../lists/base.helpers";

// Reuse list permission helper
return probeManageListsPermission(web, effectiveWebUrl);
```

### Field Operations

```typescript
import { getFieldByNameOrTitle, checkFieldExists } from "../fields/field-utils";

// Check if field exists
const exists = await checkFieldExists(container, fieldName);
```

## Testing

1. Add unit tests in `tests/provisioning/catalogs/actions/<domain>/`
2. Test all three methods: `checkPermissions`, `handler`, `checkCompliance`
3. Test idempotent behavior (running twice should be safe)
4. Test error scenarios and edge cases

## Checklist

- [ ] Schema created with proper Zod validation
- [ ] Handler extends `ActionDefinition<Verb, Schema, SPScope>`
- [ ] `checkPermissions` validates user access
- [ ] `handler` is idempotent (safe to run multiple times)
- [ ] `checkCompliance` verifies expected state
- [ ] Action registered in `action.registry.ts`
- [ ] Schema added to root discriminated union
- [ ] Exports added to barrel files
- [ ] JSDoc comments with examples
- [ ] Unit tests written

## Common Patterns

### Idempotent Create

```typescript
const existing = await findResource(name);
if (existing) {
  ctx.logger.info("Resource already exists, skipping");
  return { result: { outcome: "skipped", resource: name, reason: "already_exists" } };
}

await createResource(name);
return { result: { outcome: "executed", resource: name } };
```

### Idempotent Delete

```typescript
const existing = await findResource(name);
if (!existing) {
  ctx.logger.info("Resource not found, skipping delete");
  return { result: { outcome: "skipped", resource: name, reason: "not_found" } };
}

await deleteResource(name);
return { result: { outcome: "executed", resource: name } };
```

### Compliance Non-Compliant vs Unverifiable

```typescript
// Resource should exist but doesn't → non_compliant
if (!found) {
  return { outcome: "non_compliant", resource: name, reason: "not_found" };
}

// Cannot check state (error, missing permissions) → unverifiable
try {
  const state = await checkState();
} catch (e) {
  return { outcome: "unverifiable", reason: "error", message: e.message };
}
```
