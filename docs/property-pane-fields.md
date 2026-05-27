# Property Pane Fields Reference

This document provides a complete reference for SPFx property pane fields: `PropertyPaneProvisioningField` and `PropertyPaneSiteSelectorField`.

## Table of Contents

- [Overview](#overview)
- [PropertyPaneProvisioningField](#propertypaneprovisioningfield)
- [PropertyPaneSiteSelectorField](#propertypanесiteselectorfield)
- [Complete Integration Example](#complete-integration-example)
- [Localization](#localization)
- [Best Practices](#best-practices)

---

## Overview

The library provides two custom SPFx property pane fields for easy integration:

| Field | Purpose |
|-------|---------|
| `PropertyPaneProvisioningField` | Provisioning and deprovisioning with state tracking |
| `PropertyPaneSiteSelectorField` | Site URL selection (current, hub, or search) |

Both fields:
- Use Fluent UI 9 components
- Automatically handle SPFx theming
- Support full localization
- Integrate with web part property persistence

### Visual Preview

```
Property Pane
┌─────────────────────────────────────────────┐
│  Provisioning                               │
│  ├────────────────────────────────────────┤ │
│  │  Target Site                           │ │
│  │  ┌─────────────────────────────────┐   │ │
│  │  │ ○ Current Site                  │   │ │
│  │  │ ○ Hub Site                      │   │ │
│  │  │ ● Search Sites                  │   │ │
│  │  │   [Search box____________]      │   │ │
│  │  │   · Engineering Portal          │   │ │
│  │  │   · Project Alpha Site          │   │ │
│  │  └─────────────────────────────────┘   │ │
│  ├────────────────────────────────────────┤ │
│  │  Site Configuration                    │ │
│  │  Status: ✓ Applied                     │ │
│  │  [Provision]  [Deprovision]  [Check]   │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## PropertyPaneProvisioningField

### Import

```typescript
import { 
  PropertyPaneProvisioningField 
} from '@apvee/spfx-m365-actionable-provisioning';
```

### Function Signature

```typescript
function PropertyPaneProvisioningField(
  targetProperty: string,
  props: PropertyPaneProvisioningFieldProps
): IPropertyPaneField<PropertyPaneProvisioningFieldInternalProps>;
```

### Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `context` | `BaseComponentContext` | ✓ | - | SPFx component context |
| `provisioningActionPlan` | `ProvisioningPlan` | ✓ | - | Plan to provision |
| `deprovisioningActionPlan` | `ProvisioningPlan` | ✗ | - | Plan to deprovision (enables deprovision button) |
| `targetSiteUrl` | `string` | ✗ | Current site | Target site URL |
| `label` | `string` | ✗ | Localized default | Field label |
| `effectiveState` | `TemplateAppliedState` | ✗ | - | Current effective state |
| `enableComplianceCheck` | `boolean` | ✗ | `true` | Enable compliance check button |
| `complianceAutoRunOnOpen` | `boolean` | ✗ | `true` | Auto-run compliance on dialog open |
| `confirmDeprovisionRun` | `boolean` | ✗ | `false` | Require confirmation for deprovision |
| `logger` | `Logger` | ✗ | Silent logger | Logger instance |
| `strings` | `Partial<...>` | ✗ | Defaults | Localization string overrides (see Localization section) |
| `appearance` | `"subtle" \| "filled" \| "outline" \| "filled-alternative"` | ✗ | `"filled"` | Card appearance |

### TemplateAppliedState Type

```typescript
type TemplateAppliedState = 'applied' | 'not-applied' | 'unknown';
```

### Basic Usage

```typescript
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { 
  IPropertyPaneConfiguration, 
  PropertyPaneTextField 
} from '@microsoft/sp-property-pane';
import { 
  PropertyPaneProvisioningField 
} from '@apvee/spfx-m365-actionable-provisioning';
import type { TemplateAppliedState } from '@apvee/spfx-m365-actionable-provisioning';
import { provisioningPlan } from './plans/provisioning-plan';

export interface IMyWebPartProps {
  description: string;
  provisioningState?: TemplateAppliedState;
}

export default class MyWebPart extends BaseClientSideWebPart<IMyWebPartProps> {
  
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Settings' },
          groups: [
            {
              groupName: 'Basic Settings',
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description'
                })
              ]
            },
            {
              groupName: 'Provisioning',
              groupFields: [
                PropertyPaneProvisioningField('provisioningState', {
                  context: this.context,
                  label: 'Site Configuration',
                  provisioningActionPlan: provisioningPlan,
                  effectiveState: this.properties.provisioningState
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
```

### With Deprovisioning

```typescript
import { provisioningPlan, deprovisioningPlan } from './plans';

PropertyPaneProvisioningField('provisioningState', {
  context: this.context,
  label: 'Site Configuration',
  provisioningActionPlan: provisioningPlan,
  deprovisioningActionPlan: deprovisioningPlan,
  effectiveState: this.properties.provisioningState,
  confirmDeprovisionRun: true  // Require confirmation for deprovision
})
```

### With Target Site

```typescript
PropertyPaneProvisioningField('provisioningState', {
  context: this.context,
  label: 'Site Configuration',
  provisioningActionPlan: provisioningPlan,
  targetSiteUrl: this.properties.targetSiteUrl,
  effectiveState: this.properties.provisioningState,
  enableComplianceCheck: true,
  complianceAutoRunOnOpen: true
})
```

---

## PropertyPaneSiteSelectorField

### Import

```typescript
import { 
  PropertyPaneSiteSelectorField,
  type PropertyPaneSiteSelectorFieldProps
} from '@apvee/spfx-m365-actionable-provisioning';
```

### Function Signature

```typescript
function PropertyPaneSiteSelectorField(
  targetProperty: string,
  props: PropertyPaneSiteSelectorFieldProps
): IPropertyPaneField<PropertyPaneSiteSelectorFieldInternalProps>;
```

### Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `context` | `BaseComponentContext` | ✓ | - | SPFx component context |
| `label` | `string` | ✓ | - | Field label |
| `value` | `string` | ✗ | Current site URL | Selected site URL |
| `onChange` | `(siteUrl?: string) => void` | ✗ | - | Selection change callback |
| `appearance` | `"subtle" \| "filled" \| "outline" \| "filled-alternative"` | ✗ | - | Card appearance |
| `disabled` | `boolean` | ✗ | `false` | Disable all controls |
| `strings` | `Partial<...>` | ✗ | Defaults | Localization string overrides (see Localization section) |

### Selection Modes

The field provides three selection modes:

| Mode | Description |
|------|-------------|
| **Current Site** | Uses the current page's site |
| **Hub Site** | Uses the connected hub site (if available) |
| **Search Sites** | Search for sites by name |

### Basic Usage

```typescript
import { 
  PropertyPaneSiteSelectorField 
} from '@apvee/spfx-m365-actionable-provisioning';

export interface IMyWebPartProps {
  targetSiteUrl?: string;
}

export default class MyWebPart extends BaseClientSideWebPart<IMyWebPartProps> {
  
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: 'Site Selection',
              groupFields: [
                PropertyPaneSiteSelectorField('targetSiteUrl', {
                  label: 'Target Site',
                  context: this.context,
                  value: this.properties.targetSiteUrl
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
```

### With onChange Callback

```typescript
PropertyPaneSiteSelectorField('targetSiteUrl', {
  label: 'Target Site',
  context: this.context,
  value: this.properties.targetSiteUrl,
  onChange: (siteUrl) => {
    console.log('Selected site:', siteUrl);
    // Additional logic when site changes
  }
})
```

### Disabled State

```typescript
PropertyPaneSiteSelectorField('targetSiteUrl', {
  label: 'Target Site',
  context: this.context,
  value: this.properties.targetSiteUrl,
  disabled: this.isProvisioningRunning  // Disable during provisioning
})
```

---

## Complete Integration Example

### Web Part Properties Interface

```typescript
import type { TemplateAppliedState } from '@apvee/spfx-m365-actionable-provisioning';

export interface IEngineeringWebPartProps {
  description: string;
  
  // Site selection
  targetSiteUrl?: string;
  
  // Provisioning state
  provisioningState?: TemplateAppliedState;
  
  // Property pane provisioning state (separate tracking)
  propertyPaneProvisioningState?: TemplateAppliedState;
}
```

### Web Part Class

```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { 
  PropertyPaneProvisioningField, 
  PropertyPaneSiteSelectorField 
} from '@apvee/spfx-m365-actionable-provisioning';
import type { TemplateAppliedState } from '@apvee/spfx-m365-actionable-provisioning';

import { provisioningPlan, deprovisioningPlan } from './plans';
import EngineeringWebPart from './components/EngineeringWebPart';
import type { IEngineeringWebPartProps } from './IEngineeringWebPartProps';

import * as strings from 'EngineeringWebPartStrings';

export default class EngineeringWebPart extends BaseClientSideWebPart<IEngineeringWebPartProps> {

  public render(): void {
    const element: React.ReactElement = React.createElement(
      EngineeringWebPart,
      {
        description: this.properties.description,
        targetSiteUrl: this.properties.targetSiteUrl,
        provisioningState: this.properties.provisioningState,
        isEditMode: this.displayMode === DisplayMode.Edit,
        context: this.context,
        onProvisioningStateChange: (state: TemplateAppliedState) => {
          this.properties.provisioningState = state;
          this.render();
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            },
            {
              groupName: strings.ProvisioningGroupName,
              groupFields: [
                // Site selector
                PropertyPaneSiteSelectorField('targetSiteUrl', {
                  label: strings.TargetSiteLabel,
                  context: this.context,
                  value: this.properties.targetSiteUrl,
                  appearance: 'filled'
                }),
                
                // Provisioning control
                PropertyPaneProvisioningField('propertyPaneProvisioningState', {
                  context: this.context,
                  label: strings.ProvisioningStateLabel,
                  provisioningActionPlan: provisioningPlan,
                  deprovisioningActionPlan: deprovisioningPlan,
                  targetSiteUrl: this.properties.targetSiteUrl,
                  effectiveState: this.properties.propertyPaneProvisioningState,
                  appearance: 'filled',
                  enableComplianceCheck: true,
                  complianceAutoRunOnOpen: true,
                  confirmDeprovisionRun: true,
                  strings: {
                    provisionLabel: strings.ProvisionButtonLabel,
                    deprovisionLabel: strings.DeprovisionButtonLabel,
                    checkLabel: strings.CheckButtonLabel
                  }
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
```

### Localization Strings (mystrings.d.ts)

```typescript
declare interface IEngineeringWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ProvisioningGroupName: string;
  TargetSiteLabel: string;
  ProvisioningStateLabel: string;
  ProvisionButtonLabel: string;
  DeprovisionButtonLabel: string;
  CheckButtonLabel: string;
}

declare module 'EngineeringWebPartStrings' {
  const strings: IEngineeringWebPartStrings;
  export = strings;
}
```

### Localization Strings (en-us.js)

```javascript
define([], function() {
  return {
    "PropertyPaneDescription": "Configure the Engineering Portal",
    "BasicGroupName": "Basic Settings",
    "DescriptionFieldLabel": "Description",
    "ProvisioningGroupName": "Site Provisioning",
    "TargetSiteLabel": "Target Site",
    "ProvisioningStateLabel": "Site Configuration",
    "ProvisionButtonLabel": "Apply Configuration",
    "DeprovisionButtonLabel": "Remove Configuration",
    "CheckButtonLabel": "Verify Status"
  }
});
```

---

## Localization

Both property pane fields support localization through the `strings` prop. You can pass a partial object to override specific strings while keeping the defaults for others.

### PropertyPaneProvisioningField Strings

The `strings` prop accepts a partial object with the following keys:

| Key | Description |
|-----|-------------|
| `defaultLabel` | Default label when no label prop is provided |
| `provisionLabel` | Label for the provision button |
| `deprovisionLabel` | Label for the deprovision button |
| `checkLabel` | Label for the compliance check button |
| `stateAppliedLabel` | Display text for applied state |
| `stateNotAppliedLabel` | Display text for not-applied state |
| `stateUnknownLabel` | Display text for unknown state |
| `provisioningDialogTitle` | Custom provisioning dialog title |
| `provisioningDialogDescription` | Custom provisioning dialog description |
| `deprovisioningDialogTitle` | Custom deprovisioning dialog title |
| `deprovisioningDialogDescription` | Custom deprovisioning dialog description |

### PropertyPaneSiteSelectorField Strings

The `strings` prop accepts a partial object with the following keys:

| Key | Description |
|-----|-------------|
| `defaultLabel` | Default label when no label prop is provided |
| `currentSiteLabel` | Label for "Current Site" option |
| `hubSiteLabel` | Label for "Hub Site" option |
| `hubNotAvailableLabel` | Label when hub site is not available |
| `searchSiteLabel` | Label for "Search Sites" option |
| `searchPlaceholder` | Placeholder text for search input |
| `searchingLabel` | Label shown while searching |
| `emptySearchLabel` | Label for empty search state |
| `noResultsLabel` | Label when no search results found |

### Localization Example

Pass a partial strings object to override specific labels:

```typescript
PropertyPaneProvisioningField('provisioningState', {
  context: this.context,
  provisioningActionPlan: provisioningPlan,
  effectiveState: this.properties.provisioningState,
  strings: {
    // Only override the strings you need to customize
    provisionLabel: 'Applica',
    deprovisionLabel: 'Rimuovi',
    checkLabel: 'Verifica',
    stateAppliedLabel: 'Applicato',
    stateNotAppliedLabel: 'Non applicato',
    stateUnknownLabel: 'Sconosciuto'
  }
})

PropertyPaneSiteSelectorField('targetSiteUrl', {
  label: 'Sito di Destinazione',
  context: this.context,
  value: this.properties.targetSiteUrl,
  strings: {
    // Only override the strings you need to customize
    currentSiteLabel: 'Sito corrente',
    hubSiteLabel: 'Sito hub',
    searchSiteLabel: 'Cerca siti',
    searchPlaceholder: 'Cerca per nome...',
    noResultsLabel: 'Nessun risultato'
  }
})
```

---

## Best Practices

### Property Binding

1. **Use separate properties**: Track property pane state separately from component state
2. **Persist on change**: SPFx automatically persists bound property values
3. **Handle undefined**: Always handle undefined/null property values

```typescript
// Good: Separate tracking
provisioningState?: TemplateAppliedState;          // Component state
propertyPaneProvisioningState?: TemplateAppliedState;  // Property pane state

// Usage
PropertyPaneProvisioningField('propertyPaneProvisioningState', {
  // ...
})
```

### Site Selection Integration

1. **Combine fields**: Use SiteSelector with ProvisioningField
2. **Dependency order**: Place SiteSelector before ProvisioningField
3. **Pass target URL**: Connect SiteSelector value to ProvisioningField

```typescript
{
  groupFields: [
    PropertyPaneSiteSelectorField('targetSiteUrl', { /* ... */ }),
    PropertyPaneProvisioningField('state', {
      targetSiteUrl: this.properties.targetSiteUrl,  // Connected
      // ...
    })
  ]
}
```

### Error Handling

1. **Check context**: Ensure context is available before rendering
2. **Handle missing sites**: Site selector handles hub site unavailability
3. **State persistence**: SPFx handles property persistence automatically

### Accessibility

1. **Provide labels**: Always set meaningful labels
2. **Use appearance**: Choose appropriate visual style for context
3. **ARIA labels**: Customize ARIA labels through strings prop

### Performance

1. **Avoid recreation**: Property pane fields are recreated on config change
2. **Memoize plans**: Define plans outside of getPropertyPaneConfiguration
3. **Throttle search**: Site search is automatically throttled

---

## Related Documentation

- [Introduction](./introduction.md) - Getting started guide
- [Provisioning Schema](./provisioning-schema.md) - Plan structure and actions
- [SPFx Engine](./spfx-engine.md) - Engine API for programmatic use
- [ProvisioningDialog](./provisioning-dialog.md) - Dialog component reference
