# SPFx Integration

`@apvee/spfx-m365-actionable-provisioning` is the SharePoint Framework integration package for the generic `@apvee/m365-actionable-provisioning` engine.

Use this package only in SPFx solutions. It provides React components, hooks, property pane fields, theme integration, localization wiring, and activity helpers.

## What The SPFx Package Adds

- `SPFxFluentProvider` for SPFx theme-aware Fluent UI 9 rendering.
- `ProvisioningDialog` for provisioning and compliance runs.
- `useSPFxProvisioningEngine` for custom React UI around the core engine.
- `PropertyPaneProvisioningField` and `PropertyPaneSiteSelectorField`.
- SPFx localization resource `SPFxProvisioningUIStrings`.
- Utilities that convert provisioning and compliance traces into UI activity entries.

## Installation

```bash
npm install @apvee/spfx-m365-actionable-provisioning @apvee/m365-actionable-provisioning
```

SPFx applications must also provide the declared peer dependencies, including SPFx 1.21, React 17, Fluent UI 8/9, `@apvee/react-layout-kit`, `@pnp/sp`, and `@pnp/graph`.

## Localization

The package uses the SPFx localized resource name `SPFxProvisioningUIStrings`.

The `postinstall` script adds this entry automatically when it can locate an SPFx `config/config.json` and the resource name is not already mapped:

```json
{
  "localizedResources": {
    "SPFxProvisioningUIStrings": "node_modules/@apvee/spfx-m365-actionable-provisioning/lib/loc/{locale}.js"
  }
}
```

If package lifecycle scripts are skipped, add the mapping manually. If the resource name already exists with a different path, the script leaves it unchanged and reports the conflict instead of overwriting the SPFx config.

## Hook Runtime

`useSPFxProvisioningEngine` creates PnPjs clients from the SPFx context and passes them to the core factory:

```typescript
clients: { spfi, graphClient }
```

```typescript
const { snapshot, run, cancel, checkCompliance } = useSPFxProvisioningEngine({
  context,
  targetSiteUrl,
  planTemplate,
  logger,
  initialScope,
  engineOptions,
});
```

When `targetSiteUrl` is supplied, the hook resolves the target web and seeds `siteUrl`, `webUrl`, and `web` unless the caller-provided `initialScope` overrides them.

Cross-site targeting is handled through seeded engine scope and PnPjs web handles derived from the current SPFx context. The hook does not create a new root `SPFI` at the target URL.

## Graph Permissions

SharePoint-only actions run with the current user's SharePoint permissions. Content type actions use Microsoft Graph and require `Sites.Manage.All` or a higher permission such as `Sites.FullControl.All`.

SPFx solutions that use content type actions should include:

```json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "Sites.Manage.All"
  }
]
```

## Related Documentation

- [Core engine](../core/engine.md)
- [ProvisioningDialog](./provisioning-dialog.md)
- [Property pane fields](./property-pane-fields.md)
