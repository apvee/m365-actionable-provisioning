# Adding New SharePoint Provisioning Actions

SharePoint actions are owned by action modules. A module keeps the action schema, handler, compliance logic, permission checks, and catalog metadata together. Shared SharePoint domain logic belongs in `_shared` or `domains` folders.

## Folder Shape

Create one folder per action:

```text
<domain>/<action-name>/
  action.ts
  schema.ts
  index.ts
```

Use shared code only for behavior that is genuinely reused:

```text
_shared/schemas/                # shared Zod primitives
_composition/                   # root/subaction schema composition
<domain>/_shared/               # domain-local helpers
domains/                        # SharePoint and Graph lookup/permission helpers
_shared/                        # cross-domain action utilities
```

## 1. Schema

Define the full action schema in the action folder.

```typescript
// content-types/create-sp-content-type/schema.ts
import { z } from 'zod';
import { subactionsOf } from '../../_shared/schemas/action-schemas';
import { contentTypeSubactionSchema } from '../../_composition/content-type-subactions-schema';
import { graphTargetSchema } from '../_shared/reference-schema';

export const createSPContentTypeSchema = graphTargetSchema.extend({
  verb: z.literal('createSPContentType'),
  name: z.string().min(1),
  parentId: z.string().min(1),
  description: z.string().optional(),
  group: z.string().optional(),
  subactions: subactionsOf(contentTypeSubactionSchema),
});

export type CreateSPContentTypePayload = z.infer<typeof createSPContentTypeSchema>;
```

Use placement-specific schema variants only when the same verb needs a different payload shape depending on where it appears.

## 2. Handler

Implement the concrete `ActionDefinition` next to its schema. This Graph-backed content type example reflects the current content type action contract:

```typescript
// content-types/create-sp-content-type/action.ts
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from '../../../../core/action';
import type { PermissionCheckResult } from '../../../../core/permissions';
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from '../../../../runtime';
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable } from '../../_shared/action-results';
import { graphContentTypePermissionCheck, resolveGraphSiteTarget, resolveSiteContentType } from '../../domains/content-types';

import { createSPContentTypeSchema, type CreateSPContentTypePayload } from './schema';

import '@pnp/graph/sites';
import '@pnp/graph/content-types';

export class CreateSPContentTypeAction extends ActionDefinition<
  'createSPContentType',
  typeof createSPContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = 'createSPContentType';
  readonly actionSchema = createSPContentTypeSchema;
  readonly requiredClients = ['graphClient'] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<CreateSPContentTypePayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error('GraphFI instance not available in scope');

    const payload = ctx.action.payload;
    const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
    const existing = await resolveSiteContentType(graphClient, target.graphSiteId, { contentTypeName: payload.name });

    if (existing) {
      return actionSkipped(payload.name, 'already_exists', {
        contentType: existing.handle,
        contentTypeId: existing.info.id,
        contentTypeName: existing.info.name ?? payload.name,
        graphSiteId: target.graphSiteId,
      });
    }

    const created = await graphClient.sites.getById(target.graphSiteId).contentTypes.add({
      name: payload.name,
      description: payload.description,
      group: payload.group,
      base: { id: payload.parentId },
    });

    return actionExecuted(payload.name, {
      contentType: created.contentType,
      contentTypeId: created.data.id,
      contentTypeName: created.data.name ?? payload.name,
      graphSiteId: target.graphSiteId,
    });
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPContentTypePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) {
      return unverifiable({
        resource: ctx.action.payload.name,
        reason: 'missing_prerequisite',
        message: 'GraphFI instance not available in scope',
      });
    }

    const payload = ctx.action.payload;
    const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
    const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, { contentTypeName: payload.name });

    if (!resolved) return nonCompliant({ resource: payload.name, reason: 'not_found' });

    return compliant({
      resource: payload.name,
      scopeDelta: {
        contentType: resolved.handle,
        contentTypeId: resolved.info.id,
        contentTypeName: resolved.info.name ?? payload.name,
        graphSiteId: target.graphSiteId,
      },
    });
  }
}
```

For SharePoint REST-backed actions, declare `requiredClients = ['spfi'] as const` and use the relevant SharePoint domain permission probe. For Graph-backed actions, declare `requiredClients = ['graphClient'] as const`; content type actions should use Graph content type permission helpers.

## 3. Action Module

Export schema, handler, and placement metadata from `index.ts`.

```typescript
// content-types/create-sp-content-type/index.ts
import { defineSharePointActionModule } from '../../action-module';

import { CreateSPContentTypeAction } from './action';
import { createSPContentTypeSchema } from './schema';

export { CreateSPContentTypeAction } from './action';
export { createSPContentTypeSchema, type CreateSPContentTypePayload } from './schema';

export const createSPContentTypeActionModule = defineSharePointActionModule({
  verb: 'createSPContentType',
  schema: createSPContentTypeSchema,
  definition: new CreateSPContentTypeAction(),
  placements: ['root', 'siteSubaction'] as const,
});
```

If a placement needs a stricter schema variant, add `schemasByPlacement` to the module and use it from the relevant composition file.

## 4. Composition

Add the module to the correct runtime and schema composition files:

- `actions/sharepoint/action-modules.ts` for runtime definitions.
- `actions/sharepoint/provisioning-schema.ts` if the action is allowed at the plan root.
- `actions/sharepoint/_composition/site-subactions-schema.ts` if it is allowed under site actions.
- `actions/sharepoint/_composition/list-subactions-schema.ts` if it is allowed under list actions.
- `actions/sharepoint/_composition/content-type-subactions-schema.ts` if it is allowed under content type actions.

Public SharePoint schema exports live in `actions/sharepoint/schemas.ts`. The full M365 plan schema lives in `catalog/provisioning-schema.ts`.

## Checklist

- [ ] Folder created under the correct action domain.
- [ ] `schema.ts` exports the Zod schema and payload type.
- [ ] `action.ts` extends `ActionDefinition`.
- [ ] `requiredClients` declares `spfi` or `graphClient` when needed.
- [ ] Permission checks match the backing API.
- [ ] Handler is idempotent where the SharePoint or Graph operation allows it.
- [ ] Compliance uses the same expected-state semantics as execution.
- [ ] `index.ts` exports an action module via `defineSharePointActionModule`.
- [ ] Composition files include the action in the correct placement.
- [ ] Public schema/type exports are added intentionally.
- [ ] Smoke/build validation passes.
