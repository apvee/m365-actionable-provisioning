# @apvee/spfx-m365-actionable-provisioning

Reusable SPFx UI, hooks, and property pane fields for `@apvee/m365-actionable-provisioning`.

For SPFx localization, add the package resource to `config/config.json`:

```json
{
  "localizedResources": {
    "SPFxProvisioningUIStrings": "node_modules/@apvee/spfx-m365-actionable-provisioning/lib/loc/{locale}.js"
  }
}
```

The package postinstall script adds this entry automatically when it can locate an SPFx `config/config.json`.
