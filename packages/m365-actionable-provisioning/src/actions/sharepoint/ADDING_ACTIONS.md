# Adding New SharePoint Provisioning Actions

SharePoint actions are owned by action modules. A module keeps the action schema,
handler and catalog metadata in one folder, while shared SharePoint domain logic
stays in `_shared` folders.

## Folder Shape

Create one folder per action:

```text
actions/<domain>/<action-name>/
  action.ts
  schema.ts
  index.ts
```

Use shared code only for behavior that is genuinely reused:

```text
actions/_shared/schemas/        # shared Zod primitives
actions/_composition/           # root/subaction schema composition
actions/<domain>/_shared/       # domain-local helpers
actions/shared/                 # cross-domain action utilities
```

## 1. Schema

Define the full action schema in the action folder.

```ts
// actions/content-types/create-sp-content-type/schema.ts
import { z } from "zod";
import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const createSPContentTypeSchema = z.object({
  verb: z.literal("createSPContentType"),
  name: z.string().min(1),
  parentId: z.string().optional(),
  description: z.string().optional(),
  group: z.string().optional(),
  webUrl: z.string().url().optional(),
  subactions: leafSubactionsSchema,
});

export type CreateSPContentTypePayload = z.infer<typeof createSPContentTypeSchema>;
```

## 2. Handler

Implement the concrete `ActionDefinition` next to its schema.

```ts
// actions/content-types/create-sp-content-type/action.ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../../core/action";
import type { PermissionCheckResult } from "../../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../../m365";
import { resolveTargetWeb } from "../../../../utils/sp-utils";
import { probeManageListsPermission } from "../../../../shared/domains/lists";

import { createSPContentTypeSchema, type CreateSPContentTypePayload } from "./schema";

export class CreateSPContentTypeAction extends ActionDefinition<
  "createSPContentType",
  typeof createSPContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPContentType";
  readonly actionSchema = createSPContentTypeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPContentTypePayload>): Promise<PermissionCheckResult> {
    const spfi = ctx.clients.spfi;
    if (!spfi) return { decision: "deny", message: "SPFI instance not available in scope" };

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: ctx.scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    return probeManageListsPermission(web, effectiveWebUrl);
  }

  async handler(ctx: M365RuntimeContext<CreateSPContentTypePayload>): Promise<M365ActionResult> {
    const spfi = ctx.clients.spfi;
    if (!spfi) throw new Error("SPFI instance not available in scope");

    return {
      result: {
        outcome: "executed",
        resource: ctx.action.payload.name,
      },
    };
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPContentTypePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    return { outcome: "unverifiable", resource: ctx.action.payload.name, reason: "not_supported" };
  }
}
```

## 3. Action Module

Export schema, handler and placement metadata from `index.ts`.

```ts
// actions/content-types/create-sp-content-type/index.ts
import { defineSharePointActionModule } from "../../action-module";

import { CreateSPContentTypeAction } from "./action";
import { createSPContentTypeSchema } from "./schema";

export { CreateSPContentTypeAction } from "./action";
export { createSPContentTypeSchema, type CreateSPContentTypePayload } from "./schema";

export const createSPContentTypeActionModule = defineSharePointActionModule({
  verb: "createSPContentType",
  schema: createSPContentTypeSchema,
  definition: new CreateSPContentTypeAction(),
  placements: ["root"] as const,
});
```

If a placement needs a stricter schema variant, add `schemasByPlacement` and use it
from the relevant composition file.

## 4. Composition

Add the module to:

- `actions/action-modules.ts` for runtime definitions
- `catalogs/provisioning.schema.ts` if it is allowed at root
- `actions/_composition/site-subactions-schema.ts` if it is allowed under site actions
- `actions/_composition/list-subactions-schema.ts` if it is allowed under list actions

The public schema facade in `catalogs/schemas.ts` should re-export public schemas
only; it should not own implementation logic.

## Checklist

- [ ] Folder created under `actions/<domain>/<action-name>/`
- [ ] `schema.ts` exports the Zod schema and payload type
- [ ] `action.ts` extends `ActionDefinition`
- [ ] `requiredClients` declares `spfi` or `graphClient` when needed
- [ ] Handler is idempotent where the SharePoint operation allows it
- [ ] Compliance uses the same expected-state semantics as execution
- [ ] `index.ts` exports an action module via `defineSharePointActionModule`
- [ ] Composition files include the action in the correct placement
- [ ] Public schema facade exports any public schema/type
- [ ] Smoke/build validation passes
