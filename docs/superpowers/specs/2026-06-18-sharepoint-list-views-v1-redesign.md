# SharePoint List Views V1 Redesign

## Goal

Reintroduce SharePoint list/library view provisioning from a clean design after the previous implementation was removed.

The V1 goal is deliberately narrow: support standard SharePoint list views as list-scoped provisioning subactions using `@pnp/sp/views`, with predictable create, modify, delete semantics and tenant-smoke validation before treating the behavior as stable.

## Decisions

- V1 view actions are list-scoped only.
- V1 registers three verbs:
  - `createSPListView`
  - `modifySPListView`
  - `deleteSPListView`
- `createSPListView` is create-only and idempotent.
- If `createSPListView` finds an existing view with the same title, it skips and does not update mutable state.
- `modifySPListView` is the only action that changes an existing view.
- `deleteSPListView` ensures the view is absent, except when the target is the current default view.
- Deleting the current default view is blocked with a skip plus warning, not a hard failure.
- `defaultView` only supports `true` in V1.
- V1 payload is limited to:
  - `title`
  - `fields`
  - `viewQuery`
  - `rowLimit`
  - `paged`
  - `defaultView`

## Non-Goals

V1 does not support:

- root-level list view actions with `webUrl`, `siteUrl`, or `listName` payload resolution;
- private views;
- modern view formatting;
- gallery, calendar, board, or other specialized view formats;
- full `ViewXml` authoring through `setViewXml`;
- `scope`, `tabularView`, or additional SharePoint view properties;
- `defaultView: false`;
- automatic promotion of another view before delete;
- implicit update/upsert behavior from `createSPListView`.

## Architecture

Use thin action classes plus shared domain helpers.

Action modules own:

- action verb;
- schema;
- permission check wiring;
- compliance result shape;
- high-level handler flow;
- action result and warning semantics.

`domains/views` owns:

- list view lookup by title;
- not-found normalization;
- field existence validation;
- duplicate field validation;
- replacing view fields in declared order;
- converting action payload into PnPjs update props;
- comparing compliance state.

Proposed file layout:

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/views/
  _shared/schema.ts
  create-sp-list-view/
    action.ts
    index.ts
    schema.ts
  modify-sp-list-view/
    action.ts
    index.ts
    schema.ts
  delete-sp-list-view/
    action.ts
    index.ts
    schema.ts

packages/m365-actionable-provisioning/src/actions/sharepoint/domains/views/
  index.ts
  list-view-fields.ts
  list-view-lookup.ts
  list-view-props.ts
```

## PnPjs Surface

Use `@pnp/sp/views` only through the standard list view APIs:

- `list.views.getByTitle(title)`
- `list.views.add(title, false, props)`
- `view.update(props)`
- `view.delete()`
- `view.fields()`
- `view.fields.removeAll()`
- `view.fields.add(fieldName)`

The implementation must import `@pnp/sp/views` where the view extension methods are used.

Reference: `https://pnp.github.io/pnpjs/sp/views/`

## Shared Schema

Shared schema primitives:

```ts
listViewTitleSchema = z.string().min(1).max(255)
listViewFieldNameSchema = z.string().min(1).max(255)
listViewFieldsSchema = z.array(listViewFieldNameSchema).min(1).optional()
viewQuerySchema = z.string().refine(noViewOrQueryWrapper).optional()
rowLimitSchema = z.number().int().min(1).max(50000).optional()
pagedSchema = z.boolean().optional()
defaultViewSchema = z.literal(true).optional()
```

`viewQuery` is a CAML query fragment. It must not start with `<View` or `<Query` after trimming. Examples of valid fragments include:

```xml
<OrderBy><FieldRef Name="Modified" Ascending="FALSE" /></OrderBy>
```

```xml
<Where><Eq><FieldRef Name="Status" /><Value Type="Text">Active</Value></Eq></Where>
```

The schema performs structural guardrails only. It does not parse full CAML semantics.

## Action Contracts

### createSPListView

Allowed placement:

- list subaction only

Payload:

```ts
{
  verb: "createSPListView";
  title: string;
  fields?: string[];
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: true;
}
```

Runtime behavior:

1. Require `scopeIn.list`.
2. Look up a view by `title`.
3. If the view exists, return `actionSkipped(title, "already_exists", scopeDelta)`.
4. Validate `fields`, if provided.
5. Create the view with `list.views.add(title, false, minimalCreateProps)`.
6. Resolve the created view handle by title or from the add result.
7. If `fields` is provided, replace the field collection in declared order.
8. Apply scalar props with `view.update(updateProps)`.
9. Return `actionExecuted(title, scopeDelta)`.

Compliance behavior:

- Missing `spfi` or `scopeIn.list`: `unverifiable`.
- Missing view: `nonCompliant` with `not_found`.
- Existing view: `compliant` if create-only structural expectations are satisfied.
- If create payload includes mutable settings and the existing view differs, compliance should not require drift correction from create. A create action is satisfied by existence.

### modifySPListView

Allowed placement:

- list subaction only

Payload:

```ts
{
  verb: "modifySPListView";
  title: string;
  fields?: string[];
  viewQuery?: string;
  rowLimit?: number;
  paged?: boolean;
  defaultView?: true;
}
```

Runtime behavior:

1. Require `scopeIn.list`.
2. Look up a view by `title`.
3. If missing, return `actionSkipped(title, "not_found", scopeDelta)`.
4. Compute effective scalar and field changes.
5. If there are no effective changes, return `actionSkipped(title, "no_changes", scopeDelta)`.
6. If `fields` changed, validate and replace fields first.
7. Apply scalar props with `view.update(updateProps)`.
8. Return `actionExecuted(title, scopeDelta)`.

Compliance behavior:

- Missing `spfi` or `scopeIn.list`: `unverifiable`.
- Missing view: `nonCompliant` with `not_found`.
- Drift in requested mutable state: `nonCompliant` with mismatch details.
- No drift: `compliant`.

### deleteSPListView

Allowed placement:

- list subaction only

Payload:

```ts
{
  verb: "deleteSPListView";
  title: string;
}
```

Runtime behavior:

1. Require `scopeIn.list`.
2. Look up a view by `title`.
3. If missing, return `actionSkipped(title, "not_found", scopeDelta)`.
4. If the view is the current default view, return `actionSkipped(title, "unsupported", scopeDelta, [warning])`.
5. Otherwise call `view.delete()`.
6. Return `actionExecuted(title, scopeDelta)`.

Default-view delete warning:

```ts
{
  code: "LIST_VIEW_DEFAULT_DELETE_BLOCKED",
  message: "The current default SharePoint list view cannot be deleted by deleteSPListView V1. Set another view as default first.",
  details: { title }
}
```

Compliance behavior:

- Missing `spfi` or `scopeIn.list`: `unverifiable`.
- Missing view: `compliant`.
- Existing non-default view: `nonCompliant` with `exists`.
- Existing default view: `nonCompliant` with `default_view` and blocked details.

## Field Handling

`fields` means the final ordered view field set.

Validation:

- reject duplicate field names before touching SharePoint;
- verify every requested field exists on the target list before modifying view fields;
- use existing field lookup helpers where possible so internal names and titles follow the repo's current field-resolution behavior.

Application:

1. Read current field names.
2. If already equal in order, do nothing.
3. Call `view.fields.removeAll()`.
4. Add each field sequentially with `view.fields.add(fieldName)`.

Fields must be replaced before scalar updates when both are requested. Previous tenant smoke work showed SharePoint can reject a view when default/scalar promotion happens before the field set is valid.

## Scalar Props

Action payload maps to PnPjs update props:

```ts
viewQuery -> ViewQuery
rowLimit -> RowLimit
paged -> Paged
defaultView: true -> DefaultView: true
```

`viewQuery` is trimmed before applying or comparing.

`createSPListView` should create with minimal create props, then apply requested fields and scalar props in a controlled order. Avoid relying on `list.views.add` to apply all mutable state atomically.

## Placement And Registration

Register view actions in:

- `views/index.ts`
- `sharepoint/action-modules.ts`
- `sharepoint/schemas.ts`
- `sharepoint/index.ts`
- `_composition/list-subactions-schema.ts`
- `ACTIONS.md`

Do not register view actions in site subactions or root-level schemas in V1.

## Permissions

All three actions require `spfi`.

Permission pre-check:

- If `spfi` is missing, deny.
- If `scopeIn.web` is available, reuse the existing Manage Lists probe.
- If only `scopeIn.list` is available, return `unknown` with a clear message rather than probing through an unrelated web.

Runtime remains the source of truth; SharePoint may still reject operations due to permissions or list settings.

## Demo Plan

Update `apps/test-spfx/src/webparts/testProvisioning/test-plans/demo-plans.ts` to include list view subactions after fields are created.

Suggested provisioning flow:

1. Create `customers`.
2. Add customer fields.
3. Create a `Customers by Code` view with ordered fields and `defaultView: true`.
4. Create `orders`.
5. Add order fields, including lookup fields.
6. Create an `Orders by Date` view with ordered fields and an `<OrderBy>` `viewQuery`.

Suggested deprovisioning flow:

1. Delete custom views before deleting lists where they are not default.
2. Do not try to delete a default custom view unless another view is promoted first.
3. Delete lists in existing safe order.

The demo should avoid relying on default-view delete behavior for a successful deprovision path.

## Testing And Verification

Add or update local smoke checks for:

- list subaction schema accepts the three view verbs;
- site subaction schema rejects view actions;
- root action schema does not expose root-level view actions;
- `defaultView` rejects `false`;
- `viewQuery` rejects `<View>` and `<Query>` wrappers;
- duplicate fields are rejected by helper tests or smoke checks;
- `deleteSPListView` default-view behavior is represented in compliance/result logic.

Run at minimum:

```bash
pnpm --filter @apvee/m365-actionable-provisioning build
pnpm --filter @apvee/m365-actionable-provisioning smoke:m365-engine
```

Tenant smoke validation is required before declaring the runtime behavior done. The smoke must specifically cover:

- create view with fields;
- create view with `viewQuery`;
- promote a custom view with `defaultView: true`;
- modify field order;
- delete a non-default custom view;
- attempt to delete a default custom view and verify controlled skip/warning.

## Risks

- SharePoint view APIs are sensitive to update ordering.
- `DefaultView` promotion may fail if fields or query state is invalid.
- Field display names and internal names can be confused. Prefer the repo's existing field lookup convention and document examples accordingly.
- Create-only semantics mean a changed `createSPListView` payload will not repair drift after the view already exists; plans must use `modifySPListView` for mutable enforcement.

## Acceptance Criteria

- The three view actions are available only as list subactions.
- The schema enforces V1 payload limits.
- Create is idempotent and create-only.
- Modify performs drift correction for supported mutable state.
- Delete blocks default-view deletion with a warning.
- Shared domain helpers isolate PnPjs view lookup, field replacement, props mapping, and comparison logic.
- Local build and smoke checks pass.
- Tenant smoke verifies the PnPjs runtime order before the feature is considered stable.
