# Property Pane Fields Reference

This document covers the SPFx property pane fields exported by `@apvee/spfx-m365-actionable-provisioning`:

- `PropertyPaneProvisioningField`
- `PropertyPaneSiteSelectorField`

Both fields render Fluent UI 9 controls, use the SPFx theme through the package theme bridge, support localized string overrides, and persist values through standard SPFx property pane binding.

## PropertyPaneProvisioningField

### Import

```typescript
import {
  PropertyPaneProvisioningField,
  type TemplateAppliedState,
} from '@apvee/spfx-m365-actionable-provisioning';
```

### Signature

```typescript
function PropertyPaneProvisioningField(
  targetProperty: string,
  props: {
    context: BaseComponentContext;
    provisioningActionPlan: M365ProvisioningPlan;
    deprovisioningActionPlan?: M365ProvisioningPlan;
    targetSiteUrl?: string;
    label?: string;
    effectiveState?: TemplateAppliedState;
    enableComplianceCheck?: boolean;
    complianceAutoRunOnOpen?: boolean;
    confirmDeprovisionRun?: boolean;
    logger?: Logger;
    strings?: Partial<PropertyPaneProvisioningFieldStrings>;
    appearance?: 'subtle' | 'filled' | 'outline' | 'filled-alternative';
  }
): IPropertyPaneField<unknown>;
```

The implementation returns an SPFx custom property pane field. Internal render props are not part of the public contract. The package root does not currently export a named `PropertyPaneProvisioningFieldProps` type, so consumer examples should pass the object inline.

### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `context` | `BaseComponentContext` | Yes | - | SPFx component context. |
| `provisioningActionPlan` | `M365ProvisioningPlan` | Yes | - | Plan executed by the provision action. |
| `deprovisioningActionPlan` | `M365ProvisioningPlan` | No | - | Plan executed by the deprovision action. Enables the deprovision button. |
| `targetSiteUrl` | `string` | No | Current site | Target site URL. |
| `label` | `string` | No | Localized default | Field label. |
| `effectiveState` | `TemplateAppliedState` | No | - | Current persisted or computed template state. |
| `enableComplianceCheck` | `boolean` | No | `true` | Enables the compliance check button. |
| `complianceAutoRunOnOpen` | `boolean` | No | `true` | Auto-runs compliance when the dialog enters compliance mode. |
| `confirmDeprovisionRun` | `boolean` | No | `false` | Requires confirmation before running the deprovisioning plan. |
| `logger` | `Logger` | No | Silent logger | Logger used by the field and dialog. |
| `strings` | `Partial<PropertyPaneProvisioningFieldStrings>` | No | Defaults | Localized string overrides. |
| `appearance` | `'subtle' \| 'filled' \| 'outline' \| 'filled-alternative'` | No | `'filled'` | Card appearance. |

### TemplateAppliedState

```typescript
type TemplateAppliedState = 'applied' | 'notApplied' | 'unknown';
```

`targetProperty` is the persisted property name. Pass the current value back with `effectiveState`. When the field changes state, the custom field writes the next `TemplateAppliedState` to the bound SPFx property. When compliance checking is enabled, the field can also update the bound state after an automatic compliance check maps the result to `applied`, `notApplied`, or `unknown`.

### Basic Usage

```typescript
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import {
  PropertyPaneProvisioningField,
  type TemplateAppliedState,
} from '@apvee/spfx-m365-actionable-provisioning';
import { provisioningPlan } from './plans/provisioning-plan';

export interface IMyWebPartProps {
  description: string;
  provisioningState?: TemplateAppliedState;
}

export default class MyWebPart extends BaseClientSideWebPart<IMyWebPartProps> {
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        groups: [{
          groupName: 'Provisioning',
          groupFields: [
            PropertyPaneTextField('description', {
              label: 'Description',
            }),
            PropertyPaneProvisioningField('provisioningState', {
              context: this.context,
              label: 'Site configuration',
              provisioningActionPlan: provisioningPlan,
              effectiveState: this.properties.provisioningState,
            }),
          ],
        }],
      }],
    };
  }
}
```

### With Deprovisioning And Compliance

```typescript
PropertyPaneProvisioningField('provisioningState', {
  context: this.context,
  label: 'Site configuration',
  provisioningActionPlan,
  deprovisioningActionPlan,
  targetSiteUrl: this.properties.targetSiteUrl,
  effectiveState: this.properties.provisioningState,
  enableComplianceCheck: true,
  complianceAutoRunOnOpen: true,
  confirmDeprovisionRun: true,
});
```

## PropertyPaneSiteSelectorField

### Import

```typescript
import {
  PropertyPaneSiteSelectorField,
  type PropertyPaneSiteSelectorFieldProps,
} from '@apvee/spfx-m365-actionable-provisioning';
```

### Signature

```typescript
function PropertyPaneSiteSelectorField(
  targetProperty: string,
  props: PropertyPaneSiteSelectorFieldProps
): IPropertyPaneField<unknown>;
```

### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | Yes | - | Field label. |
| `context` | `BaseComponentContext` | Yes | - | SPFx component context. |
| `value` | `string` | No | Current site URL | Selected site URL. Empty values are treated as current site. |
| `onChange` | `(siteUrl?: string) => void` | No | - | Called when the selected site changes. |
| `appearance` | `'subtle' \| 'filled' \| 'outline' \| 'filled-alternative'` | No | - | Card appearance. |
| `disabled` | `boolean` | No | `false` | Disables all controls. |
| `strings` | `Partial<SiteSelectorFieldStrings>` | No | Defaults | Localized string overrides. |

The field supports current site, hub site, and search modes. On first render, if the bound value is empty and the field is enabled, it auto-persists the current site URL so the stored property matches the UI default.

### Basic Usage

```typescript
PropertyPaneSiteSelectorField('targetSiteUrl', {
  label: 'Target site',
  context: this.context,
  value: this.properties.targetSiteUrl,
  onChange: (siteUrl) => {
    this.properties.targetSiteUrl = siteUrl;
  },
});
```

## Complete Integration Example

```typescript
import {
  PropertyPaneProvisioningField,
  PropertyPaneSiteSelectorField,
  type TemplateAppliedState,
} from '@apvee/spfx-m365-actionable-provisioning';

export interface IEngineeringWebPartProps {
  targetSiteUrl?: string;
  propertyPaneProvisioningState?: TemplateAppliedState;
}

protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
  return {
    pages: [{
      groups: [{
        groupName: strings.ProvisioningGroupName,
        groupFields: [
          PropertyPaneSiteSelectorField('targetSiteUrl', {
            label: strings.TargetSiteLabel,
            context: this.context,
            value: this.properties.targetSiteUrl,
            appearance: 'filled',
          }),
          PropertyPaneProvisioningField('propertyPaneProvisioningState', {
            context: this.context,
            label: strings.ProvisioningStateLabel,
            provisioningActionPlan,
            deprovisioningActionPlan,
            targetSiteUrl: this.properties.targetSiteUrl,
            effectiveState: this.properties.propertyPaneProvisioningState,
            appearance: 'filled',
            enableComplianceCheck: true,
            complianceAutoRunOnOpen: true,
            confirmDeprovisionRun: true,
            strings: {
              provisionLabel: strings.ProvisionActionLabel,
              deprovisionLabel: strings.DeprovisionActionLabel,
              checkLabel: strings.CheckComplianceActionLabel,
            },
          }),
        ],
      }],
    }],
  };
}
```

The consumer-owned `strings.*` names above are examples. The package override keys are `provisionLabel`, `deprovisionLabel`, and `checkLabel`.

## Localization

Both fields accept a `strings` prop. Pass a partial object to override only the labels you need.

### PropertyPaneProvisioningField Strings

| Key | Description |
| --- | --- |
| `defaultLabel` | Default label when no `label` prop is provided. |
| `provisionLabel` | Label for the provision button. |
| `deprovisionLabel` | Label for the deprovision button. |
| `checkLabel` | Label for the compliance check button. |
| `stateAppliedLabel` | Display text for applied state. |
| `stateNotAppliedLabel` | Display text when the state value is `notApplied`. |
| `stateUnknownLabel` | Display text for unknown state. |
| `provisioningDialogTitle` | Provisioning dialog title. |
| `provisioningDialogDescription` | Provisioning dialog description. |
| `provisioningDialogStrings` | Pass-through string overrides for `ProvisioningDialog`. |
| `deprovisioningDialogTitle` | Deprovisioning dialog title. |
| `deprovisioningDialogDescription` | Deprovisioning dialog description. |
| `deprovisioningDialogStrings` | Pass-through string overrides for the deprovisioning dialog. |

### PropertyPaneSiteSelectorField Strings

| Key | Description |
| --- | --- |
| `defaultLabel` | Default label when no label is provided. |
| `currentSiteLabel` | Label for the current site option. |
| `hubSiteLabel` | Label for the hub site option. |
| `hubNotAvailableLabel` | Label when no hub site is available. |
| `searchSiteLabel` | Label for search mode. |
| `selectedSiteGroupAriaLabel` | ARIA label for the selected site option group. |
| `searchSitesAriaLabel` | ARIA label for site search. |
| `searchPlaceholder` | Search input placeholder. |
| `searchingLabel` | Label shown while searching. |
| `emptySearchLabel` | Empty search prompt. |
| `noResultsLabel` | Label when no search results are found. |

### Localization Example

```typescript
PropertyPaneProvisioningField('provisioningState', {
  context: this.context,
  provisioningActionPlan,
  effectiveState: this.properties.provisioningState,
  strings: {
    provisionLabel: 'Applica',
    deprovisionLabel: 'Rimuovi',
    checkLabel: 'Verifica',
    stateAppliedLabel: 'Applicato',
    stateNotAppliedLabel: 'Non applicato',
    stateUnknownLabel: 'Sconosciuto',
  },
});

PropertyPaneSiteSelectorField('targetSiteUrl', {
  label: 'Sito di destinazione',
  context: this.context,
  value: this.properties.targetSiteUrl,
  strings: {
    currentSiteLabel: 'Sito corrente',
    hubSiteLabel: 'Sito hub',
    searchSiteLabel: 'Cerca siti',
    searchPlaceholder: 'Cerca per nome...',
    noResultsLabel: 'Nessun risultato',
  },
});
```

## Best Practices

- Use `PropertyPaneSiteSelectorField` before `PropertyPaneProvisioningField` when provisioning targets can change.
- Pass the selected site URL to `PropertyPaneProvisioningField.targetSiteUrl`.
- Keep plan objects stable and avoid recreating large plans inside render-heavy code paths.
- Persist property pane state separately from any runtime component state when the two can diverge.
- Use `effectiveState` as the source of truth for the currently selected target site.
- Provide Graph permissions when the plans include content type actions.

## Related Documentation

- [Introduction](../introduction.md)
- [Core engine](../core/engine.md)
- [Provisioning schema](../core/provisioning-schema.md)
- [SPFx integration](./integration.md)
- [ProvisioningDialog](./provisioning-dialog.md)
