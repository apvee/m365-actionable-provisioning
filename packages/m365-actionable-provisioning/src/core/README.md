# Provisioning Engine Core

A **schema-first, type-safe provisioning engine** for executing declarative action plans with real-time tracing, permission checks, and hierarchical scope management.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Creating a Custom Engine](#creating-a-custom-engine)
5. [Action Development](#action-development)
6. [Permission System](#permission-system)
7. [Scope Management](#scope-management)
8. [Real-Time Tracing](#real-time-tracing)
9. [Examples](#examples)
10. [Best Practices](#best-practices)
11. [Compliance (Drift Checking)](#compliance-drift-checking)
12. [API Reference](#api-reference)

---

## Introduction

This provisioning engine enables **declarative infrastructure-as-code** workflows for any domain (SharePoint, Azure, custom APIs, etc.). It provides:

- **Schema-first validation** using Zod
- **Type-safe action definitions** with generic constraints
- **Real-time execution tracing** for monitoring and debugging
- **Two-phase permission checks** (preflight + just-in-time)
- **Hierarchical scope propagation** from parent to child actions
- **Dual-mode actions** (standalone or nested subactions)
- **Permission caching** for performance optimization

### Why This Engine?

- ✅ **Built-in parameter placeholders** - Resolve `{parameter:Key}` in strings (no external templating engine)
- ✅ **Browser-compatible** - No Node-only assumptions; consistent error normalization
- ✅ **Immutable state** - All snapshots are readonly
- ✅ **Event-driven** - Subscribe to state changes via `engine.subscribe()`
- ✅ **Cancellable** - Stop execution at any point with `engine.cancel()`

---

## Core Concepts

### 1. Actions

Actions are the building blocks of provisioning plans. Each action:
- Has a **verb** (e.g., `"createSPSite"`, `"addField"`)
- Contains **properties** at root level (no nested `params`)
- Can have **subactions** for hierarchical execution
- Is validated by a **Zod schema**

```typescript
{
  verb: "createSPSite",
  url: "https://contoso.sharepoint.com/sites/project",
  title: "Project Alpha",
  subactions: [
    {
      verb: "createSPList",
      title: "Tasks",
      template: "genericList"
    }
  ]
}
```

### 1.1 Parameters (Template Placeholders)

Plans can include a `parameters` array (key/value strings) and reference them from any string field using `{parameter:Key}`.
Replacement happens **before** Zod parsing and governance checks.

Note: placeholders are **not** applied to any action `verb` field.

```typescript
const plan = {
  version: "1.0.0",
  parameters: [
    { key: "SiteTitle", value: "Project Alpha" },
    { key: "TasksListTitle", value: "Tasks" }
  ],
  actions: [
    {
      verb: "createSPSite",
      title: "{parameter:SiteTitle}",
      subactions: [
        {
          verb: "createSPList",
          title: "{parameter:TasksListTitle} for {parameter:SiteTitle}"
        }
      ]
    }
  ]
};
```

If a placeholder references a missing key, initialization fails with `code: "PLAN_TEMPLATE"`.

### 2. Scope

**Scope** is a mutable JSON object that flows through action execution:
- **Initial scope** is set when creating the engine
- **Parent actions** can add properties via `scopeDelta`
- **Child actions** inherit scope from their parent
- Enables **context sharing** without explicit parameters

```typescript
// Parent action returns scopeDelta
{ scopeDelta: { siteUrl: "...", siteId: "..." } }

// Child action accesses via ctx.scopeIn
const siteUrl = ctx.scopeIn.siteUrl;
```

### 3. Catalogs

**Catalogs** organize related actions into cohesive groups:

```typescript
export const myCatalog: ActionCatalog<MyScope> = {
  definitions: [new Action1(), new Action2(), ...]
};
```

### 4. Engines

**Engines** execute plans by referencing a catalog and a plan schema:

```typescript
class MyEngine extends ProvisioningEngineBase<MyScope> {
  protected static readonly provisioningSchema = myProvisioningPlanSchema;
  protected static readonly definitions = myCatalog.definitions;
}
```

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Provisioning Engine                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ProvisioningPlan│─▶│  Validation  │─▶│  Preprocessing  │   │
│  │  (JSON)       │  │  (Zod)       │  │  (Parse only)   │   │
│  └───────────────┘  └──────────────┘  └─────────────────┘   │
│                                              │              │
│                                              ▼              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Preflight Permissions Check                │  │
│  │  - Check all actions before execution                 │  │
│  │  - Stop only on explicit deny (decision: "deny")       │  │
│  │  - Cache results for JIT phase                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                             │                               │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Action Execution (DFS)                   │  │
│  │  1. Check JIT permissions (if not preflight-allowed)  │  │
│  │  2. Execute handler (optional)                        │  │
│  │  3. Merge scopeDelta into scope                       │  │
│  │  4. Recurse into subactions                           │  │
│  │  5. Update trace with results                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                             │                               │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Real-Time Trace                       │  │
│  │  - Status per action (idle/running/success/fail)      │  │
│  │  - Timing (startedAt, endedAt, durationMs)            │  │
│  │  - Permission results (preflight/jit/cache)           │  │
│  │  - Errors with codes and details                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
core/
├── README.md              # This file
├── index.ts               # Public API exports
├── json.ts                # JSON type definitions
├── logger.ts              # Structured logging system
├── permissions.ts         # Permission check types
├── compliance.ts          # Compliance (drift) checking types
├── action.ts              # Action model and ActionDefinition base class
├── catalog.ts             # ActionCatalog type
├── engine.ts              # ProvisioningEngineBase implementation
├── engine-internals.ts    # Internal engine helpers (@internal)
├── provisioning-plan.ts   # Plan schema and template utilities
├── trace.ts               # Unified trace types and builders
└── utils.ts               # Internal utilities (normalizeError is public)
```

> **Note**: The `trace/` subdirectory and `_examples/` have been consolidated
> into `trace.ts`. Compliance and execution trace share a unified model.

### Execution Flow

```
1. Constructor
   ↓
2. Preprocessing (Zod validation)
   ↓
3. Trace Initialization (1-based paths: "1", "1/1", "2", ...)
   ↓
4. Preflight Permissions (all actions checked before execution)
   ↓
5. Execution (DFS with scope propagation)
   ├─ Action "1"
   │  ├─ JIT permission check (if not preflight-allowed)
   │  ├─ Handler execution
   │  ├─ Scope merge (scopeDelta)
   │  └─ Subactions
   │     ├─ Action "1/1"
   │     └─ Action "1/2"
   ├─ Action "2"
   └─ Action "3"
   ↓
6. Completed/Failed/Cancelled
```

---

## Creating a Custom Engine

### Step 1: Define Your Scope Type

```typescript
// my-catalog.ts
import type { JsonObject } from "./json";

export type MyScope = JsonObject & {
  environment?: string;
  tenantId?: string;
  // Add your domain-specific properties
};
```

### Step 2: Define Action Schemas

```typescript
import { z } from "zod";

// Child action schema (leaf node)
const addFieldSchema = z.object({
  verb: z.literal("addField"),
  fieldName: z.string(),
  fieldType: z.enum(["Text", "Number", "DateTime"]),
  subactions: z.array(z.never()).optional() // No subactions allowed
});

// Parent action schema
const createListSchema = z.object({
  verb: z.literal("createList"),
  listName: z.string(),
  title: z.string(),
  subactions: z.array(z.union([
    addFieldSchema // Only addField allowed as subaction
  ])).optional()
});

// Root-level schema
const provisioningSchema = z.array(z.union([
  createListSchema // Only createList allowed at root
]));
```

### Step 3: Implement Action Definitions

```typescript
import { ActionDefinition, type ActionRuntimeContext } from "./action";

class CreateListAction extends ActionDefinition<
  "createList",
  typeof createListSchema,
  MyScope
> {
  readonly verb = "createList";
  readonly actionSchema = createListSchema;

  // Optional: Permission check
  async checkPermissions(ctx: ActionRuntimeContext<MyScope, z.infer<typeof createListSchema>>): Promise<PermissionCheckResult> {
    const { listName } = ctx.action.payload;
    const { logger } = ctx;

    // Your permission logic here
    const hasPermission = await checkUserPermissions(ctx.scopeIn.tenantId);

    if (hasPermission) {
      return {
        decision: "allow",
        message: "User has ManageLists permissions",
        cache: {
          key: `list:create:${listName}`,
          ttlMs: 300000 // 5 minutes
        }
      };
    } else {
      return {
        decision: "deny",
        message: "Insufficient permissions to create list",
        findings: [{
          code: "PERMISSION_DENIED",
          message: "User lacks ManageLists permission",
          details: { required: ["ManageLists"], actual: ["Read"] }
        }]
      };
    }
  }

  // Handler (execution logic)
  async handler(ctx: ActionRuntimeContext<MyScope, z.infer<typeof createListSchema>>): Promise<{ result?: unknown; scopeDelta?: JsonObject }> {
    const { listName, title } = ctx.action.payload;
    const { logger, scopeIn } = ctx;

    logger.info("Creating list", { listName, title });

    // Your API calls here
    const listId = await createListInAPI(listName, title);

    logger.info("List created", { listId });

    return {
      result: { listId, listName, title },
      scopeDelta: {
        createdListId: listId,
        createdListName: listName
      }
    };
  }
}

class AddFieldAction extends ActionDefinition<
  "addField",
  typeof addFieldSchema,
  MyScope
> {
  readonly verb = "addField";
  readonly actionSchema = addFieldSchema;

  async checkPermissions(ctx: ActionRuntimeContext<MyScope, z.infer<typeof addFieldSchema>>): Promise<PermissionCheckResult> {
    // Fields inherit scope from parent (list context available)
    const listId = ctx.scopeIn.createdListId;
    
    return {
      decision: "allow",
      message: "User has ManageLists permissions"
    };
  }

  async handler(ctx: ActionRuntimeContext<MyScope, z.infer<typeof addFieldSchema>>): Promise<{ result?: unknown }> {
    const { fieldName, fieldType } = ctx.action.payload;
    const listId = ctx.scopeIn.createdListId; // From parent scope!
    const { logger } = ctx;

    logger.info("Adding field to list", { listId, fieldName, fieldType });

    const fieldId = await addFieldToList(listId, fieldName, fieldType);

    return {
      result: { fieldId, fieldName, fieldType }
    };
  }
}
```

### Step 4: Create the Catalog

```typescript
import type { ActionCatalog } from "./catalog";
import { createProvisioningPlanSchema } from "./provisioning-plan";

export const myActionsSchema = provisioningSchema;
export const myProvisioningPlanSchema = createProvisioningPlanSchema(myActionsSchema);

export const myCatalog: ActionCatalog<MyScope> = {
  definitions: [
    new CreateListAction(),
    new AddFieldAction()
  ]
};
```

### Step 5: Create the Engine

```typescript
import { ProvisioningEngineBase, type EngineOptions } from "./engine";

export class MyEngine extends ProvisioningEngineBase<MyScope> {
  protected static readonly provisioningSchema = myProvisioningPlanSchema;
  protected static readonly definitions = myCatalog.definitions;

  /** Optional: validate injected runtime context before any work starts */
  protected async validateEngineContextOrThrow(scope: MyScope): Promise<void> {
    // Example: require tenantId to be present
    if (!scope.tenantId) throw new Error("tenantId is required in initialScope");
  }

  /** Optional: enrich caught errors with domain-specific details */
  protected async enrichCaughtError(
    err: unknown,
    ctx: { phase: "preflight" | "execute"; path?: string; verb?: string }
  ): Promise<unknown | undefined> {
    return { phase: ctx.phase, verb: ctx.verb, original: err };
  }

  constructor(options: EngineOptions<MyScope>) {
    super(options);
  }
}
```

### Step 6: Use the Engine

```typescript
import { MyEngine } from "./engines/my-engine";
import { createLogger, consoleSink } from "./logger";

const plan = {
  version: "1.0.0",
  actions: [
    {
      verb: "createList",
      listName: "Tasks",
      title: "Project Tasks",
      subactions: [
        { verb: "addField", fieldName: "Priority", fieldType: "Text" },
        { verb: "addField", fieldName: "DueDate", fieldType: "DateTime" }
      ]
    }
  ]
};

const engine = new MyEngine({
  initialScope: { environment: "production", tenantId: "abc-123" },
  planTemplate: plan,
  logger: createLogger({ level: "info", sink: consoleSink })
});

// Subscribe to state changes
engine.subscribe((snapshot) => {
  console.log("Status:", snapshot.status);
  console.log("Actions completed:", snapshot.out?.trace.counts.success);
});

// Execute
const result = await engine.run();

console.log("Final status:", result.status);
console.log("Trace:", result.out?.trace);
console.log("Results by action:", result.out?.byAction);
```

---

## Action Development

### Dual-Mode Actions

Actions can work both as **root-level** or **subactions**:

```typescript
const createListSchema = z.object({
  verb: z.literal("createList"),
  siteUrl: z.string().url().optional(), // Optional: can come from scope
  listName: z.string()
});

class CreateListAction extends ActionDefinition<...> {
  async handler(ctx) {
    // Try payload first, fallback to scope
    const siteUrl = ctx.action.payload.siteUrl ?? ctx.scopeIn.siteUrl;
    
    if (!siteUrl) {
      throw new Error("siteUrl required (payload or scope)");
    }
    
    // Use siteUrl...
  }
}
```

### Scope Propagation

Parent actions populate scope for children via `scopeDelta`:

```typescript
// Parent handler
async handler(ctx) {
  const siteId = await createSite(...);
  
  return {
    scopeDelta: {
      siteUrl: "https://...",
      siteId: siteId
    }
  };
}

// Child checkPermissions (runs during preflight)
async checkPermissions(ctx) {
  // Permission check logic...
}
```

**Important:** Preflight permission checks are intentionally **isolated per action**.
The engine passes a per-action cloned `scopeIn` to `checkPermissions` to avoid cross-action leakage.

If a child permission check needs data, prefer:
- Including required inputs in the child payload, or
- Performing permission-sensitive discovery during execution and returning it via `scopeDelta`.

### Simulating API Delays

Add realistic delays to simulate real operations:

```typescript
async handler(ctx) {
  const delay = 1000 + Math.floor(Math.random() * 1000); // 1-2s
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Your logic...
}
```

---

## Permission System

### Permission Check Result

```typescript
type PermissionCheckResult = {
  decision: "allow" | "deny" | "unknown";
  message?: string;                      // Optional summary
  findings?: PermissionFinding[];        // Optional detailed findings
  cache?: { key: string; ttlMs?: number }; // Optional caching
};
```

### Decision Semantics

Use `decision` values consistently:

- `allow`: You have high confidence the permission is granted.
- `deny`: You have high confidence the permission is missing and the action must not run.
- `unknown`: You cannot determine cheaply/reliably (e.g., would require extra calls or tenant-level APIs). The result is still captured in the trace, but the engine proceeds and the handler may fail with a domain/API error.

### Two-Phase Permission Checks

1. **Preflight** (before execution):
   - Checks all actions recursively
  - Stops only if any permission check returns `decision: "deny"` (failFast mode)
  - `decision: "unknown"` is recorded in the trace but does not block execution
   - Results cached in trace with `permissionsSource: "preflight"`

2. **Just-In-Time (JIT)** (during execution):
   - Only runs if not already preflight-allowed
   - Runs immediately before handler
  - Stops only if the JIT permission check returns `decision: "deny"`
  - `decision: "unknown"` is recorded in the trace but does not block execution
   - Results cached with `permissionsSource: "jit"`

### Permission Caching

```typescript
return {
  decision: "allow",
  cache: {
    key: "tenant:fullcontrol:user123",
    ttlMs: 300000 // 5 minutes
  }
};
```

Cache is checked **before** calling `checkPermissions` again. If found, cached result is used with `permissionsSource: "cache"`.

### Simulating Random Denials

```typescript
async checkPermissions(ctx) {
  const isAllowed = Math.random() > 0.5; // 50% chance
  
  if (isAllowed) {
    return { decision: "allow", message: "Permission granted" };
  } else {
    return {
      decision: "deny",
      message: "Insufficient permissions",
      findings: [{
        code: "PERMISSION_DENIED",
        message: "User lacks required role",
        details: { required: ["Owner"], actual: ["Member"] }
      }]
    };
  }
}
```

---

## Scope Management

### Initial Scope

Set when creating the engine:

```typescript
const engine = new MyEngine({
  initialScope: {
    environment: "production",
    tenantId: "abc-123",
    userId: "user@example.com"
  },
  // ...
});
```

### Scope Propagation

```typescript
// Action 1: Creates site, returns scopeDelta
return {
  scopeDelta: { siteUrl: "...", siteId: "..." }
};

// Action 2: Receives merged scope
ctx.scopeIn // { environment, tenantId, userId, siteUrl, siteId }

// Action 2: Adds more to scope
return {
  scopeDelta: { listId: "...", listTitle: "..." }
};

// Action 2.1 (subaction): Receives full scope
ctx.scopeIn // { environment, tenantId, userId, siteUrl, siteId, listId, listTitle }
```

### Scope in Preflight

For **preflight**, keep `checkPermissions` side-effect free.

The engine passes a per-action cloned scope object into permission checks to avoid accidental cross-action leakage.
If child actions need context, prefer:
- Including the minimum required inputs in the child payload, or
- Producing context during execution via `scopeDelta` in the parent handler.

```typescript
async checkPermissions(ctx) {
  // Continue with permission logic...
}
```

---

## Real-Time Tracing

### Trace Structure

```typescript
type EngineTrace = {
  total: number;                              // Total actions in plan
  order: ActionPath[];                        // Execution order ["1", "1/1", "1/2", "2"]
  byPath: Record<ActionPath, ActionTraceItem>; // Fast lookup
  counts: {                                   // Status distribution
    idle: number;
    running: number;
    success: number;
    fail: number;
    skipped: number;
  };
};
```

### Action Trace Item

```typescript
type ActionTraceItem = {
  path: ActionPath;              // "1", "1/1", "2/3", etc. (1-based)
  verb: string;                  // "createSPSite", "addField", etc.
  status: ActionStatus;          // "idle" | "running" | "success" | "fail" | "skipped"
  startedAt?: string;            // ISO timestamp
  endedAt?: string;              // ISO timestamp
  durationMs?: number;           // Calculated duration
  permissions?: PermissionCheckResult;     // Permission check result
  permissionsSource?: "preflight" | "jit" | "cache"; // Where permission came from
  error?: {
    message: string;
    code?: string;               // "FORBIDDEN", "ZOD", "ACTION_FAIL"
    details?: unknown;
  };
};
```

### Subscribing to Updates

```typescript
const unsubscribe = engine.subscribe((snapshot) => {
  console.log("Status:", snapshot.status);
  console.log("Trace counts:", snapshot.out?.trace.counts);
  
  // Find current action
  const currentAction = snapshot.cursor?.path;
  if (currentAction) {
    const traceItem = snapshot.out?.trace.byPath[currentAction];
    console.log("Current action:", traceItem);
  }
});

// Later: unsubscribe when done
unsubscribe();
```

### Path Indexing (1-based)

Paths are generated from array indices **starting at 1**:

```json
[
  { "verb": "createSite", "subactions": [...]},  // Path: "1"
    { "verb": "createList", ... },               // Path: "1/1"
    { "verb": "createList", ... }                // Path: "1/2"
  { "verb": "modifySite", ... }                   // Path: "2"
]
```

This makes traces more **user-friendly** (natural counting).

---

## Examples

### Complete Example: SharePoint Provisioning

See `catalogs/example-catalog.ts` and `engines/example-engine.ts` for a full implementation with:
- ✅ Site creation and modification
- ✅ List operations (create, modify, delete)
- ✅ Permission checks with random denials
- ✅ Dual-mode actions
- ✅ Realistic delays
- ✅ Scope propagation

### Minimal Example

```typescript
import { z } from "zod";
import { ActionDefinition, type ActionRuntimeContext } from "./action";
import { ProvisioningEngineBase } from "./engine";
import type { ActionCatalog } from "./catalog";
import type { JsonObject } from "./json";

// 1. Scope type
type MyScope = JsonObject;

// 2. Schema
const doSomethingSchema = z.object({
  verb: z.literal("doSomething"),
  value: z.string()
});

const provisioningSchema = z.array(z.union([doSomethingSchema]));

const actionsSchema = provisioningSchema;
const provisioningPlanSchema = createProvisioningPlanSchema(actionsSchema);

// 3. Action definition
class DoSomethingAction extends ActionDefinition<
  "doSomething",
  typeof doSomethingSchema,
  MyScope
> {
  readonly verb = "doSomething";
  readonly actionSchema = doSomethingSchema;

  async handler(ctx: ActionRuntimeContext<MyScope, z.infer<typeof doSomethingSchema>>) {
    const { value } = ctx.action.payload;
    ctx.logger.info("Doing something", { value });
    return { result: { done: true, value } };
  }
}

// 4. Catalog
const catalog: ActionCatalog<MyScope> = {
  definitions: [new DoSomethingAction()]
};

// 5. Engine
class MinimalEngine extends ProvisioningEngineBase<MyScope> {
  protected static readonly provisioningSchema = provisioningPlanSchema;
  protected static readonly definitions = catalog.definitions;
}

// 6. Usage
const engine = new MinimalEngine({
  initialScope: {},
  planTemplate: { version: "1.0.0", actions: [{ verb: "doSomething", value: "Hello World" }] },
  logger: createLogger({ level: "info", sink: consoleSink })
});

await engine.run();
```

---

## Best Practices

### 1. Schema Governance

Use Zod discriminated unions to **control which actions can appear where**:

```typescript
// Root schema: Only site operations allowed
const rootSchema = z.array(z.union([createSiteSchema, modifySiteSchema]));

// Site subactions: Only list operations allowed
const createSiteSchema = z.object({
  verb: z.literal("createSite"),
  subactions: z.array(z.union([createListSchema, modifyListSchema])).optional()
});

// List subactions: Only field operations allowed
const createListSchema = z.object({
  verb: z.literal("createList"),
  subactions: z.array(z.union([addFieldSchema])).optional()
});

// Leaf action: No subactions allowed
const addFieldSchema = z.object({
  verb: z.literal("addField"),
  subactions: z.array(z.never()).optional()
});
```

### 2. Scope Propagation in Preflight

Keep `checkPermissions` side-effect free. If children need context, provide it via payload or `scopeDelta` (execution phase).

```typescript
async checkPermissions(ctx) {
  // ... permission logic
}
```

### 3. Error Handling

Return structured errors from handlers:

```typescript
async handler(ctx) {
  try {
    // Your logic
  } catch (err) {
    const error = new Error("Failed to create list") as Error & { code: string; details: unknown };
    error.code = "API_ERROR";
    error.details = { original: err };
    throw error;
  }
}
```

### 4. Logging

Use structured logging with context:

```typescript
ctx.logger.info("Creating list", { listName, tenantId: ctx.scopeIn.tenantId });
ctx.logger.warn("Retrying operation", { attempt: 2, maxAttempts: 3 });
ctx.logger.error("Operation failed", { error: err.message });
```

### 5. Testing

Test catalogs independently from engines:

```typescript
// Test action schema
const parsed = createListSchema.parse({ verb: "createList", listName: "Tasks" });

// Test action handler
const action = new CreateListAction();
const ctx = {
  scopeIn: { tenantId: "test" },
  out: {},
  logger: testLogger,
  action: { path: "1", verb: "createList", payload: parsed }
};
const result = await action.handler(ctx);
expect(result.scopeDelta?.createdListId).toBeDefined();
```

---

## API Reference

### Core Exports

- **Types**: `JsonValue`, `JsonObject`, `ActionNode`, `BaseProvisioningPlan`, `ProvisioningPlanParameter`, `ActionPath`, `ActionStatus`, `EngineStatus`
- **Logging**: `Logger`, `createLogger`, `consoleSink`
- **Permissions**: `PermissionCheckResult`, `PermissionDecision`, `PermissionFinding`
- **Compliance**: `CompliancePolicy`, `ComplianceReport`, `ComplianceOutcome`, `ComplianceOverall`
- **Actions**: `ActionDefinition`, `ActionRuntimeContext`, `ActionResult`, `ComplianceRuntimeContext`, `ComplianceActionCheckResult`
- **Catalog**: `ActionCatalog`
- **Engine**: `ProvisioningEngineBase`, `EngineOptions`, `EngineSnapshot`
- **Trace**: `EngineTrace`, `ActionTraceItem`

### Key Methods

- `engine.run()` - Start execution (returns final snapshot)
- `engine.cancel()` - Stop execution gracefully
- `engine.subscribe(callback)` - Subscribe to state changes (returns unsubscribe function)
- `engine.checkCompliance(policy?)` - Evaluate drift/compliance (returns a `ComplianceReport`)
- `engine.getSnapshot()` - Get current state snapshot

---

## Compliance (Drift Checking)

The engine supports a **read-only compliance pass** that evaluates whether the current environment matches the desired state implied by the provisioning plan.

### When to use it

- After a successful run, to confirm the template is fully applied
- Periodically, to detect configuration drift
- Before running destructive changes, to understand what is already in place

### API

```typescript
const report = await engine.checkCompliance({
  // default: "warning"
  treatUnverifiableAs: "warning" // or "ignore"
});

console.log(report.overall); // "compliant" | "warning" | "non_compliant"
```

### Report model

- `ComplianceOutcome`: `"compliant" | "non_compliant" | "unverifiable" | "ignored"`
- `ComplianceOverall`: `"compliant" | "warning" | "non_compliant"`

Each action path produces a `ComplianceItem` in `report.byPath[path]`.

Key fields:

- `checked`: whether the action was actually evaluated
- `outcome`: present only when `checked=true`
- `blockedBy`: present only when `checked=false`

### Pruning / blocked children

If an action is evaluated as `non_compliant`, the engine **does not evaluate its descendants**.
Instead, all descendants are included in the report with:

- `checked: false`
- `blockedBy: <ancestorPath>`

This keeps the report complete (all actions listed) without inventing an extra outcome like `skipped_due_to_parent`.

### Action-level integration

Actions can optionally implement a compliance checker:

```typescript
class MyAction extends ActionDefinition<"myVerb", typeof mySchema, MyScope> {
  async checkCompliance(ctx: ComplianceRuntimeContext<MyScope, z.infer<typeof mySchema>>)
    : Promise<ComplianceActionCheckResult<MyScope>> {
    // Must be side-effect free.
    // Verify only the subset of properties implied by ctx.action.payload.
    return { outcome: "compliant" };
  }
}
```

Notes:

- Compliance checkers are intended to be **best-effort**: when a reliable check is not possible without heavy/unsafe probing, return `outcome: "unverifiable"`.
- Compliance checkers may optionally return `scopeDelta` to propagate handles/context to child checks (mirrors execution scope propagation).

### Engine Hooks (Protected)

Specialized engines can override these hooks to validate injected runtime context and enrich errors.

- `protected validateEngineContextOrThrow(scope)`
  - Called at the beginning of `engine.run()` before initialization, preflight, or execution.
  - Use it to validate required injected context in `initialScope` (e.g., presence of an authenticated client).
  - Throwing causes the engine to fail with `code: "ENGINE_FAIL"`.

- `protected enrichCaughtError(err, ctx)`
  - Called when the engine catches an error during preflight or execution.
  - `ctx.phase` is either `"preflight"` or `"execute"` and may include `path`/`verb`.
  - Return value is attached to the engine snapshot under `error.details` and passed to structured logging.

---

## License

Part of the pnpjs-provisioning project.
