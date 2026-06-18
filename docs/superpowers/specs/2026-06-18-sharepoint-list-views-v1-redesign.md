# SharePoint List Views V1 Redesign

## Goal

Reintroduce SharePoint list/library view provisioning from a clean design after the previous implementation was removed.

The V1 goal is deliberately narrow: support standard SharePoint list/library views as list-scoped provisioning subactions using `@pnp/sp/views`, with predictable create, modify, delete semantics and tenant-smoke validation before treating the behavior as stable. Document libraries use the same SharePoint list scope and PnPjs views API.

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

- `list.views.filter("Title eq '...' and PersonalView eq false").top(1).select(...)` for public title lookup, with OData string escaping
- `list.views.getById(id)` for the mutable view handle after lookup or creation
- `list.views.add(title, false, {})` for minimal public view creation before field/scalar updates
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
listViewTitleSchema = z.string().trim().min(1).max(255)
listViewFieldNameSchema = z.string().trim().min(1).max(255)
listViewFieldsSchema = z.array(listViewFieldNameSchema).min(1).refine(noDuplicateRefsAfterTrim).optional()
viewQuerySchema = z.string().trim().min(1).refine(noViewOrQueryWrapperAfterLeadingXmlPreamble).optional()
rowLimitSchema = z.number().int().min(1).max(50000).optional()
pagedSchema = z.boolean().optional()
defaultViewSchema = z.literal(true).optional()
```

`viewQuery` is a CAML query fragment. It must not start with `<View` or `<Query` after trimming leading whitespace, XML declarations, and leading XML comments. Examples of valid fragments include:

```xml
<OrderBy><FieldRef Name="Modified" Ascending="FALSE" /></OrderBy>
```

```xml
<Where><Eq><FieldRef Name="Status" /><Value Type="Text">Active</Value></Eq></Where>
```

The schema performs structural guardrails only. It does not parse full CAML semantics.

Names with spaces are valid when SharePoint accepts them. The schema trims leading/trailing whitespace to prevent accidental distinct titles or field references, but it does not reject internal spaces such as `Customers by Code` or `Customer Email`.

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
5. Create the view with `list.views.add(title, false, {})`.
6. Resolve the created view handle from the add result `Id`.
7. If `fields` is provided, replace the field collection in declared order.
8. Apply scalar props with `view.update(updateProps)`.
9. Return `actionExecuted(title, scopeDelta)`.

Compliance behavior:

- Missing `spfi` or `scopeIn.list`: `unverifiable`.
- Missing view: `nonCompliant` with `not_found`.
- Existing view: compare supported mutable state from the create payload.
- If the existing view differs from requested `fields`, `viewQuery`, `rowLimit`, `paged`, or `defaultView`, return `nonCompliant` with `drift`. The handler remains create-only and will not repair that drift; plans must use `modifySPListView` for mutable enforcement.
- If requested fields cannot be resolved during compliance, return `nonCompliant` with `drift` and field-resolution mismatch details. Runtime handlers still fail before touching the view.

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
- If requested fields cannot be resolved during compliance, return `nonCompliant` with `drift` and field-resolution mismatch details. Runtime handlers still fail before touching the view.

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

`fields` means the final ordered view field set. Payload entries may use a field internal name or display title, including titles with spaces.

Validation:

- normalize field references by trimming leading/trailing whitespace;
- reject duplicate field references before touching SharePoint;
- resolve every requested field through the existing `getFieldByNameOrTitle` helper;
- fail before modifying the view if any requested field is missing;
- reject duplicate resolved internal names, for example when a display title and internal name point to the same field;
- convert resolved fields to `InternalName` before comparing or applying view fields.

Application:

1. Read current field names.
2. Resolve the requested field references to ordered SharePoint internal names.
3. If the current internal-name order already matches, do nothing.
4. Call `view.fields.removeAll()`.
5. Add each field sequentially with `view.fields.add(internalName)`.

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
View actions are leaf actions; non-empty `subactions` arrays are rejected.

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
- package-root and SharePoint barrel exports expose the three view action classes and schemas;
- `defaultView` rejects `false`;
- public title lookup uses the expected filter, `top(1)`, and selects all fields required by handlers/compliance;
- `viewQuery` rejects `<View>` and `<Query>` wrappers, including wrapper payloads prefixed by whitespace, XML declarations, or leading XML comments;
- duplicate fields are rejected by helper tests or smoke checks;
- compliance prerequisite checks keep stable `missing_prerequisite` outcomes for missing `spfi` and missing list scope;
- modify scalar-only updates do not read or rewrite view fields;
- `deleteSPListView` default-view behavior is represented in compliance/result logic.

Run at minimum:

```bash
npm run build -w @apvee/m365-actionable-provisioning
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w test-spfx
git diff --check
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
- Create-only handler semantics mean a changed `createSPListView` payload will not repair drift after the view already exists. Compliance still reports that drift, and plans must use `modifySPListView` for mutable enforcement.

## Acceptance Criteria

- The three view actions are available only as list subactions.
- The schema enforces V1 payload limits.
- Create is idempotent and create-only.
- Modify performs drift correction for supported mutable state.
- Delete blocks default-view deletion with a warning.
- Shared domain helpers isolate PnPjs view lookup, field replacement, props mapping, and comparison logic.
- Local build and smoke checks pass.
- Tenant smoke verifies the PnPjs runtime order before the feature is considered stable.
