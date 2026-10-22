# SPFx provisioning demo

The app exposes two existing entrypoints with different plans:

| Entrypoint | Plan | Target |
| --- | --- | --- |
| Property Pane provisioning control | `provisioningPlan` / `deprovisioningPlan` in `src/webparts/testProvisioning/test-plans/demo-plans.ts` | The selected Provisioning Site URL |
| Open Provisioning Dialog / Open Compliance Dialog | `createExamplePlan(currentUserLoginName)` in `src/webparts/testProvisioning/test-plans/complete-plan.ts` | The communication site addressed by the plan's `TenantUrl` and `CommSiteName` parameters |

The group actions are separate from site/list grants. Groups start empty; these
plans demonstrate their lifecycle and permission bindings without managing
membership. The document library's existing current-user grant is preserved.

## Groups and roles

| Parameter | Default group name | Usage |
| --- | --- | --- |
| `DemoReadersGroupName` | M365 Demo Readers | Property Pane persistent group |
| `DemoContributorsGroupName` | M365 Demo Contributors | Property Pane persistent group |
| `EngineeringReadersGroupName` | Engineering Demo Readers | Main-dialog persistent group |
| `EngineeringContributorsGroupName` | Engineering Demo Contributors | Main-dialog persistent group |
| `EngineeringTemporaryGroupName` | Engineering Demo Temporary | Main-dialog create/modify/delete demonstration |

The Property Pane provisioning and cleanup plans define matching names for
their two groups. Modify actions change descriptions rather than names, keeping
all subsequent references stable.

The persistent groups receive these separate role bindings:

| Scope | Readers | Contributors |
| --- | --- | --- |
| Site | `read` | `read` |
| Each created or modified list/library | `read` | `contribute` |

The shared `createDemoListGroupGrants` helper produces explicit
`grantSPListRoleAssignment` actions with `principalType: 'spGroupName'`,
`breakRoleInheritance: true`, `copyRoleAssignments: true` and
`clearSubscopes: false`. Existing assignments are copied when inheritance is
broken; child scopes are retained. These are additive grants, so existing
permissions continue to apply.

## Property Pane scenario

Provisioning prepares the two groups and updates their descriptions, grants
site read access, then creates `customers` and `orders` with their fields,
views, lookup relationship and group grants. Navigation is added afterwards.

Both site grants also use `breakRoleInheritance: true`,
`copyRoleAssignments: true` and `clearSubscopes: false` so an inherited
subweb selected as the target can receive the bindings while preserving
existing assignments and child scopes.

Cleanup removes navigation, recycles `orders` before its lookup source
`customers`, removes the two explicit site read bindings, and finally deletes
the two demo groups. Recycling retains the lists in the SharePoint recycle bin;
group deletion removes those groups from the site collection.

Rerunning provisioning skips existing groups, converges their descriptions and
skips role bindings that already exist. Rerunning cleanup skips absent
resources. Cleanup targets the named demo groups, so keep provisioning and
deprovisioning parameter values aligned if customizing them.

## Main-dialog scenario

Site creation ensures the two persistent engineering groups exist. The
following site-modify phase updates their descriptions, grants site read access
and runs a separate temporary-group sequence: create, modify description,
delete. The temporary group receives no roles and is never used by lists.

Both persistent group grants are included in all active list/library actions:

- `requestCategories` creation.
- `engineeringRequests` creation and modification.
- `engineeringDocuments` creation, alongside the original current-user grant.
- `tempToRecycle` creation.

The existing fields, lookup dependency, Likes/Stars ratings, navigation and
document content type remain part of the demo. Existing commented-out
list/field deletion examples remain inactive. The persistent engineering
groups remain available after the plan; the Property Pane cleanup applies to
its separate `M365 Demo ...` groups.

The complete plan demonstrates successive lifecycle operations, rather than a
single persistent desired-state snapshot. After provisioning, the temporary
group is absent: its create/modify checks can therefore report noncompliance
while its delete check is compliant. On another run it is recreated and deleted
again. Other successive field/list changes in the existing demo may likewise
show per-action drift. Use individual action results when inspecting this
scenario; a uniformly green full-plan compliance report is not the expected
outcome.

## Local validation

Run from the repository root:

```bash
npm run build:m365
npm run smoke:demo-plans -w test-spfx
node --import tsx packages/m365-actionable-provisioning/scripts/smoke-sp-groups.ts
node --import tsx packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
npm run build:spfx
npm run build:test-spfx
```

The app smoke script imports the actual templates, expands their parameters
using the core resolver, validates them with the real plan schema and checks
group ordering, grant coverage and cleanup ordering. It does not run the engine
or contact SharePoint. Build the local core first so package imports resolve to
the current API.

## Manual SharePoint checks

1. Start the app in the SPFx workbench as usual. For the Property Pane flow,
   select the target site and apply its provisioning plan. For the main-dialog
   flow, check `TenantUrl`/`CommSiteName` in `complete-plan.ts`, then use
   **Open Provisioning Dialog** in edit mode.
2. Inspect the persistent groups and their updated descriptions. Inspect the
   separate site read bindings and both group bindings on each relevant
   list/library. The main-dialog temporary group should be absent afterwards.
3. Repeat provisioning and inspect the skipped existing groups/bindings and the
   temporary lifecycle. Use **Open Compliance Dialog** to inspect per-action
   checks, accounting for the transient steps described above.
4. For the Property Pane scenario, run its deprovisioning action. Verify the
   orders/customers recycle sequence, site-binding removals and final group
   deletions. Repeat cleanup to check absent-resource handling.

These live checks require a configured SharePoint test environment; they are
separate from local schema, smoke and build validation.
