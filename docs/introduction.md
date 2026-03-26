# Introduction to @apvee/spfx-actionable-provisioning

> **Schema-first provisioning for SharePoint Framework**

This library provides a powerful, type-safe provisioning engine for SPFx, built on [PnPjs](https://pnp.github.io/pnpjs/) v4 and [Zod](https://zod.dev/) v4. It enables declarative site and list provisioning with built-in compliance checking and a ready-to-use UI for SPFx web parts.

![@apvee/spfx-actionable-provisioning demo](./demo.gif)

## Overview

`@apvee/spfx-actionable-provisioning` follows a **schema-first architecture** where every provisioning action is validated against Zod schemas before execution. This ensures:

- **Type Safety**: Full TypeScript support with inferred types from schemas
- **Validation**: Runtime validation prevents malformed plans from executing
- **Predictability**: Schema-governed execution produces consistent results
- **Compliance Checking**: Built-in drift detection without modifying your environment

### Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                     SPFx Web Part                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │ ProvisioningDialog │  │        PropertyPaneFields          │ │
│  │ (React + FluentUI) │  │ ├─ PropertyPaneProvisioningField   │ │
│  └────────┬───────────┘  │ └─ PropertyPaneSiteSelectorField   │ │
│           │              └─────────────────┬──────────────────┘ │
│           │                                │                    │
│           ▼                                ▼                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                       React Hooks                          │ │
│  │  ├─ useSPFxProvisioningEngine: Engine lifecycle            │ │
│  │  └─ useProvisioningDerivedState: UI state derivation       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  SPFxProvisioningEngine                    │ │
│  │  ├─ run(): Execute provisioning plan                       │ │
│  │  ├─ checkCompliance(): Drift detection                     │ │
│  │  └─ subscribe(): Real-time progress                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  ProvisioningPlan (JSON)                   │ │
│  │  ├─ schemaVersion, version, parameters                     │ │
│  │  └─ actions: [createSPSite, modifySPSite, ...]             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Concepts

### Provisioning Plans

A provisioning plan is a JSON object that declares what SharePoint resources to create or modify. Plans are **declarative**—you describe the desired state, and the engine handles the execution.

```typescript
import type { ProvisioningPlan } from '@apvee/spfx-actionable-provisioning/provisioning';

const plan: ProvisioningPlan = {
  schemaVersion: "1.0",
  version: "1.0.0",
  parameters: [
    { key: "TenantUrl", value: "https://contoso.sharepoint.com" },
    { key: "ProjectName", value: "engineering" }
  ],
  actions: [
    {
      verb: "createSPSite",
      siteType: "CommunicationSite",
      title: "Engineering Portal",
      url: "{parameter:TenantUrl}/sites/{parameter:ProjectName}"
    }
  ]
};
```

### Scope-Based Execution

The engine uses a **scope chain** model for execution context:

- Each action receives a `scopeIn` containing PnPjs handles (`spfi`, `site`, `web`, `list`)
- Actions produce a `scopeDelta` that is merged into `scopeOut`
- Subactions inherit the parent's scope automatically

This handle-based approach eliminates redundant API calls and provides natural context inheritance.

### Subactions

Actions can contain nested `subactions` that execute within the parent's scope:

```typescript
{
  verb: "modifySPSite",
  siteUrl: "{parameter:TenantUrl}/sites/{parameter:ProjectName}",
  subactions: [
    {
      verb: "createSPList",
      listName: "requests",
      title: "Engineering Requests",
      template: 100,
      subactions: [
        {
          verb: "createSPField",
          fieldType: "Text",
          fieldName: "RequestTitle",
          displayName: "Request Title",
          required: true
        }
      ]
    }
  ]
}
```

### Compliance Checking

The engine supports **drift detection** without modifying your environment. Call `checkCompliance()` to compare the current SharePoint state against your plan and receive a detailed report.

## Prerequisites

Before using this library, ensure your environment meets these requirements:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥22.14.0, <23.0.0 | Required for development |
| SPFx | 1.21+ | SharePoint Framework runtime |
| TypeScript | ~5.3.3 | Strict mode enabled |
| PnPjs | v4 | `@pnp/sp`, `@pnp/graph` |
| Zod | ^4.2.1 | Schema validation |
| Fluent UI 9 | Latest | `@fluentui/react-components` |
| React | 17.0.1 | SPFx 1.21 peer dependency |

### SharePoint Permissions

This library operates using the **current user's permissions**. No additional API permission requests are required in your SPFx solution manifest.

The provisioning operations will succeed or fail based on what the current user is authorized to do:

| Operation | Required Permission |
|-----------|--------------------|
| Create site collections | Tenant admin or Site Collection Administrator |
| Modify site settings | Site Owner or Site Collection Administrator |
| Create/modify lists | Site Owner or Member with Edit permissions |
| Create/modify fields | Site Owner or List Administrator |

> **Note**: Ensure users running provisioning operations have appropriate permissions on the target site.

## Installation

Install the package via npm:

```bash
npm install @apvee/spfx-actionable-provisioning
```

### Peer Dependencies

Ensure you have the required peer dependencies:

```bash
npm install @pnp/sp @pnp/graph @fluentui/react-components zod
```

### TypeScript Configuration

Add the library to your `tsconfig.json` if using path aliases:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

## Quick Start

### 1. Define Your Provisioning Plan

Create a plan file (`provisioning-plan.ts`):

```typescript
import type { ProvisioningPlan } from '@apvee/spfx-actionable-provisioning/provisioning';

export const myPlan: ProvisioningPlan = {
  schemaVersion: "1.0",
  version: "1.0.0",
  parameters: [
    { key: "SiteUrl", value: "https://contoso.sharepoint.com/sites/project" }
  ],
  actions: [
    {
      verb: "modifySPSite",
      siteUrl: "{parameter:SiteUrl}",
      title: "My Project Site",
      subactions: [
        {
          verb: "createSPList",
          listName: "tasks",
          title: "Project Tasks",
          template: 100,
          enableVersioning: true
        }
      ]
    }
  ]
};
```

### 2. Add ProvisioningDialog to Your Web Part

In your React component:

```tsx
import * as React from 'react';
import { FluentProvider, webLightTheme, Button } from '@fluentui/react-components';
import { ProvisioningDialog } from '@apvee/spfx-actionable-provisioning/provisioning-ui';
import { createLogger, consoleSink } from '@apvee/spfx-actionable-provisioning/core';
import { myPlan } from './provisioning-plan';

const MyWebPart: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const [open, setOpen] = React.useState(false);
  
  const logger = React.useMemo(() => 
    createLogger({ level: 'debug', sink: consoleSink }), 
  []);

  return (
    <FluentProvider theme={webLightTheme}>
      <Button onClick={() => setOpen(true)}>Configure Site</Button>
      
      <ProvisioningDialog
        open={open}
        onClose={() => setOpen(false)}
        context={context}
        planTemplate={myPlan}
        logger={logger}
        targetSiteUrl={context.pageContext.web.absoluteUrl}
      />
    </FluentProvider>
  );
};
```

### 3. Or Use Property Pane Integration

In your web part class:

```typescript
import { 
  PropertyPaneProvisioningField, 
  PropertyPaneSiteSelectorField 
} from '@apvee/spfx-actionable-provisioning/provisioning-ui';

protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
  return {
    pages: [{
      groups: [{
        groupName: "Provisioning",
        groupFields: [
          PropertyPaneSiteSelectorField('targetSiteUrl', {
            label: 'Target Site',
            context: this.context,
            value: this.properties.targetSiteUrl
          }),
          PropertyPaneProvisioningField('provisioningState', {
            context: this.context,
            label: 'Site Configuration',
            provisioningActionPlan: myPlan,
            targetSiteUrl: this.properties.targetSiteUrl,
            value: this.properties.provisioningState
          })
        ]
      }]
    }]
  };
}
```

## Documentation Map

This documentation is organized into the following guides:

| Document | Description |
|----------|-------------|
| [Provisioning Schema](./provisioning-schema.md) | Complete reference for plan structure, action types, and parameters |
| [SPFx Engine](./spfx-engine.md) | Engine API, execution model, and error handling |
| [ProvisioningDialog](./provisioning-dialog.md) | Dialog component props, events, and customization |
| [Property Pane Fields](./property-pane-fields.md) | PropertyPaneProvisioningField and PropertyPaneSiteSelectorField |

### Recommended Reading Order

1. **New users**: Start with this introduction, then read [Provisioning Schema](./provisioning-schema.md)
2. **UI integration**: Read [ProvisioningDialog](./provisioning-dialog.md) and [Property Pane Fields](./property-pane-fields.md)
3. **Advanced usage**: Deep dive into [SPFx Engine](./spfx-engine.md) for programmatic control

## Support

For issues and feature requests, visit the [GitHub repository](https://github.com/AhmedMohamedAbdallah/pnpjs-provisioning).
