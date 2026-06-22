# SharePoint Provisioning Actions

Schema-driven SharePoint Online action catalog for `@apvee/m365-actionable-provisioning`.

## Purpose

This module provides:

- Zod schemas for SharePoint provisioning action payloads.
- Co-located action definitions and handlers.
- Root, site, list, and content-type subaction composition.
- Permission checks and compliance checks.
- Runtime scope propagation for SharePoint and Graph handles.

## Action Semantics

SharePoint actions follow a deliberate create/modify/delete split:

- `createSPSite`, `createSPList`, `createSPListView`, `addSPField`, `createSPSiteColumn`, and `createSPContentType` ensure that the target resource exists.
- `modifySPSite`, `modifySPList`, `modifySPListView`, `modifySPField`, `modifySPContentType`, and `modifySPContentTypeField` enforce mutable configuration on existing resources.
- `deleteSPSite`, `deleteSPList`, `deleteSPListView`, `deleteSPField`, `deleteSPContentType`, and `removeSPFieldFromContentType` ensure absence.

Create actions do not reconcile mutable properties on already-existing resources. For example, an existing list with the requested `listName` but a different `Title` still satisfies the create action. Add a `modifySPList` action when the title must be enforced.

`listName` identifies lists by stable root/name (`RootFolder/Name` in SharePoint REST and `name` in Microsoft Graph). Do not use mutable `Title` or Graph `displayName` as list identity.

## Action Placement

| Placement | Verbs |
| --- | --- |
| Root | `createSPSite`, `modifySPSite`, `deleteSPSite`, `createSPList`, `modifySPList`, `deleteSPList`, `createSPContentType`, `modifySPContentType`, `deleteSPContentType` |
| Site subaction | `createSPList`, `modifySPList`, `deleteSPList`, `createSPNavigationNode`, `modifySPNavigationNode`, `deleteSPNavigationNode`, `breakSPSiteRoleInheritance`, `resetSPSiteRoleInheritance`, `grantSPSiteRoleAssignment`, `removeSPSiteRoleAssignment`, `createSPContentType`, `modifySPContentType`, `deleteSPContentType`, `createSPSiteColumn`, `modifySPField`, `deleteSPField` |
| List subaction | `addSPField`, `modifySPField`, `deleteSPField`, `enableSPListRating`, `createSPListView`, `modifySPListView`, `deleteSPListView`, `breakSPListRoleInheritance`, `resetSPListRoleInheritance`, `grantSPListRoleAssignment`, `removeSPListRoleAssignment`, `addSPContentTypeToList`, `removeSPContentTypeFromList` |
| Content type subaction | `addSPFieldToContentType`, `modifySPContentTypeField`, `removeSPFieldFromContentType` |

Use `addSPField` for list fields and `createSPSiteColumn` for site columns.

## Content Types

Content type actions are Graph-first and require `graphClient`.

- Required Graph permission: `Sites.Manage.All`, or a higher permission such as `Sites.FullControl.All`.
- `createSPContentType` accepts `name` and `parentId`; Microsoft Graph returns the content type id.
- `contentTypeId` wins over `contentTypeName` when both are supplied.
- Field-to-content-type actions require existing site columns; they do not create fields inline.
- `setSPListDefaultContentType` is not registered in V1.

Compliance for create actions checks existence and structural compatibility. It does not fail because mutable properties differ. Structural collisions, such as an existing field with a different SharePoint field type, can return `non_compliant` because descendant actions may otherwise operate against the wrong shape.

## Architecture

```text
packages/m365-actionable-provisioning/src/actions/sharepoint/
├── index.ts          # Public API barrel export
├── schemas.ts        # Public SharePoint schema exports
├── provisioning-schema.ts
├── action-modules.ts
├── utils/            # General utilities
├── domains/          # SharePoint and Graph domain helpers
├── _composition/     # Site/list/content-type subaction schema composition
├── _shared/          # Cross-action runtime/schema utilities
├── sites/            # Site action modules
├── lists/            # List action modules
├── views/            # List/library view action modules
├── fields/           # Field action modules
├── permissions/      # Site/list role inheritance and assignment modules
├── navigation/       # Site navigation modules
└── content-types/    # Graph-backed content type action modules
```

## Usage

```typescript
import {
  createLogger,
  createM365ProvisioningEngine,
  consoleSink,
} from '@apvee/m365-actionable-provisioning';

const engine = createM365ProvisioningEngine({
  clients: { spfi: rootSPFI, graphClient },
  initialScope: {
    web: targetWeb,
    siteUrl: targetSiteUrl,
    webUrl: targetSiteUrl,
  },
  planTemplate: provisioningPlan,
  logger: createLogger({ level: 'info', sink: consoleSink }),
});

const snapshot = await engine.run();
```

`graphClient` is required when the plan includes content type actions. SharePoint-only plans can run with `spfi` alone.

## Adding New Features

- New action types: see [ADDING_ACTIONS.md](ADDING_ACTIONS.md).
- Shared utilities: add to `domains/`, `_shared/`, or domain-local `_shared/` folders.
- Public M365 runtime/catalog types: add to `runtime/` or `catalog/` and re-export intentionally from the package root.
- Public SharePoint action schemas: export from `actions/sharepoint/schemas.ts`.
