# @apvee/m365-actionable-provisioning

Schema-first actionable provisioning engine for Microsoft 365.

## Public API

- `@apvee/m365-actionable-provisioning`

## Action Semantics

Provisioning actions use explicit semantics:

- `create*` actions ensure a resource exists.
- `modify*` actions enforce mutable desired state.
- `delete*` actions ensure a resource is absent.

Create actions are intentionally idempotent and tolerant. If a resource already exists with the same stable identity, the action may return `skipped` with `reason: "already_exists"` and continue. Mutable properties supplied to create actions, such as titles, descriptions, groups, required flags, versioning settings, or default values, are create-time defaults. They are not reconciled when the resource already exists.

Use a follow-up `modify*` action when a plan must enforce mutable state:

```ts
{
  verb: "createSPList",
  listName: "requests",
  title: "Requests"
},
{
  verb: "modifySPList",
  listName: "requests",
  title: "Richieste",
  enableVersioning: true
}
```

Create actions may still report structural warnings or non-compliant compliance results for collisions that make the plan ambiguous, such as an existing field with the requested internal name but a different SharePoint field type.

## Warnings

Action results may include `warnings`. Warnings are non-blocking audit details. They are used when an action succeeds or skips but part of the operation needs operator attention, such as a best-effort SharePoint post-create setting that could not be applied.

## Content Types

Content type actions use Microsoft Graph through `graphClient`. Consumer applications must configure Microsoft Graph `Sites.Manage.All` or a higher permission such as `Sites.FullControl.All`.

SPFx packages typically need:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Sites.Manage.All"
  }
]
```

The engine does not inspect token claims. Missing Graph clients are caught during preflight; insufficient Graph permissions are reported when Graph returns `401` or `403`.

`listName` always means the stable SharePoint list root/name, not the mutable list title. A list may already exist with the requested `listName` and a different display title; that is acceptable for create actions unless a follow-up `modifySPList` enforces the title.
