# ProvisioningDialog Component Reference

The `ProvisioningDialog` is a Fluent UI 9 dialog component that provides a complete user interface for provisioning operations and compliance checking in SPFx web parts.

## Table of Contents

- [Overview](#overview)
- [Import](#import)
- [Props Reference](#props-reference)
- [Basic Usage](#basic-usage)
- [Dialog Modes](#dialog-modes)
- [Events and Callbacks](#events-and-callbacks)
- [Localization](#localization)
- [Styling](#styling)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Overview

The `ProvisioningDialog` component provides:

- **Provisioning mode**: Execute provisioning plans with real-time progress
- **Compliance mode**: Check drift without making changes
- **Built-in logging**: Collapsible log panel with action traces
- **Fluent UI 9**: Native theming and accessibility support
- **Localization**: Full i18n support with string overrides

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│  [Icon]  Provisioning Dialog                       [X]   │
├──────────────────────────────────────────────────────────┤
│  Description text...                                     │
│                                                          │
│  Target Site: https://contoso.sharepoint.com/sites/...   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ▶ Logs                                            │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ ✓ createSPSite - succeeded                   │  │  │
│  │  │ ✓ modifySPSite - succeeded                   │  │  │
│  │  │ ⟳ createSPList - running...                  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Total: 5  |  Success: 2  |  Failed: 0  |  Pending: 3    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│           [Check]    [Cancel]    [Run Provisioning]      │
└──────────────────────────────────────────────────────────┘
```

---

## Import

```typescript
import { ProvisioningDialog } from '@apvee/spfx-m365-actionable-provisioning';
import type { 
  ProvisioningDialogProps,
  ProvisioningDialogStrings,
  ProvisioningCompletedEvent,
  ProvisioningRunOutcome 
} from '@apvee/spfx-m365-actionable-provisioning';
```

---

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls dialog visibility |
| `onClose` | `() => void` | Callback when dialog should close |
| `context` | `BaseComponentContext` | SPFx component context |
| `planTemplate` | `M365ProvisioningPlan` | Provisioning plan to execute |
| `logger` | `Logger` | Logger instance for operation logging |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Mode-based | Dialog title |
| `description` | `string` | Mode-based | Dialog description |
| `targetSiteUrl` | `string` | Current site | Target site URL for provisioning |
| `enableComplianceCheck` | `boolean` | `false` | Show compliance check button |
| `complianceAutoRunOnOpen` | `boolean` | Varies | Auto-run compliance when entering mode |
| `compliancePolicy` | `CompliancePolicy` | `undefined` | Policy for compliance evaluation |
| `mode` | `ProvisioningDialogMode` | `'provisioning'` | Initial dialog mode |
| `strings` | `Partial<ProvisioningDialogStrings>` | Defaults | Localization overrides |
| `confirmRun` | `boolean` | `false` | Require confirmation before running |
| `onProvisioningCompleted` | `(ev) => void` | `undefined` | Callback when run completes |

### Type Definitions

```typescript
type ProvisioningDialogMode = 'provisioning' | 'compliance';

type ProvisioningRunOutcome = 'succeeded' | 'failed' | 'cancelled';

type ProvisioningCompletedEvent = Readonly<{
  siteUrl: string;
  outcome: ProvisioningRunOutcome;
  engineStatus: EngineStatus;
}>;

type CompliancePolicy = Readonly<{
  treatUnverifiableAs?: 'warning' | 'ignore';
}>;
```

---

## Basic Usage

### Minimal Example

```tsx
import * as React from 'react';
import { 
  FluentProvider, 
  IdPrefixProvider, 
  webLightTheme, 
  Button 
} from '@fluentui/react-components';
import { ProvisioningDialog } from '@apvee/spfx-m365-actionable-provisioning';
import { createLogger, consoleSink } from '@apvee/m365-actionable-provisioning/core';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { myPlan } from './provisioning-plan';

interface IMyWebPartProps {
  context: WebPartContext;
}

const MyWebPart: React.FC<IMyWebPartProps> = ({ context }) => {
  const [open, setOpen] = React.useState(false);
  
  const logger = React.useMemo(() => 
    createLogger({ level: 'debug', sink: consoleSink }), 
  []);

  return (
    <IdPrefixProvider value="my-webpart-">
      <FluentProvider theme={webLightTheme}>
        <Button 
          appearance="primary" 
          onClick={() => setOpen(true)}
        >
          Configure Site
        </Button>
        
        <ProvisioningDialog
          open={open}
          onClose={() => setOpen(false)}
          context={context}
          planTemplate={myPlan}
          logger={logger}
        />
      </FluentProvider>
    </IdPrefixProvider>
  );
};

export default MyWebPart;
```

### With All Props

```tsx
<ProvisioningDialog
  // Required
  open={isDialogOpen}
  onClose={handleClose}
  context={this.context}
  planTemplate={provisioningPlan}
  logger={logger}
  
  // Target
  targetSiteUrl="https://contoso.sharepoint.com/sites/target"
  
  // UI customization
  title="Configure Engineering Portal"
  description="This will create lists and site columns for the engineering portal."
  
  // Compliance
  enableComplianceCheck={true}
  complianceAutoRunOnOpen={false}
  compliancePolicy={{ treatUnverifiableAs: 'warning' }}
  
  // Mode
  mode="provisioning"
  
  // Confirmation
  confirmRun={true}
  
  // Events
  onProvisioningCompleted={handleProvisioningCompleted}
  
  // Localization
  strings={{
    defaultTitle: 'Site Configuration',
    runLabel: 'Apply Changes',
    cancelLabel: 'Abort'
  }}
/>
```

---

## Dialog Modes

### Provisioning Mode

The default mode for executing provisioning plans:

```tsx
<ProvisioningDialog
  open={open}
  onClose={() => setOpen(false)}
  context={context}
  planTemplate={myPlan}
  logger={logger}
  mode="provisioning"
/>
```

Features:
- Run/Cancel buttons for execution control
- Real-time progress and status
- Optional compliance check button
- Log panel with action traces

### Compliance Mode

For drift detection without making changes:

```tsx
<ProvisioningDialog
  open={open}
  onClose={() => setOpen(false)}
  context={context}
  planTemplate={myPlan}
  logger={logger}
  mode="compliance"
  complianceAutoRunOnOpen={true}
/>
```

Features:
- Run Check/Cancel buttons
- Overall compliance status (Compliant/Warning/Non-compliant)
- Per-action compliance details
- No modifications to SharePoint

### Switching Modes

When `enableComplianceCheck` is true, users can switch from provisioning to compliance mode:

```tsx
<ProvisioningDialog
  open={open}
  onClose={() => setOpen(false)}
  context={context}
  planTemplate={myPlan}
  logger={logger}
  mode="provisioning"
  enableComplianceCheck={true}
/>
```

---

## Events and Callbacks

### onClose

Called when the dialog should close (close button clicked or escape pressed):

```tsx
const [open, setOpen] = React.useState(false);

<ProvisioningDialog
  open={open}
  onClose={() => {
    setOpen(false);
    // Optional: additional cleanup
  }}
  // ...other props
/>
```

### onProvisioningCompleted

Called when a provisioning run finishes (success, failure, or cancellation):

```tsx
import type { ProvisioningCompletedEvent } from '@apvee/spfx-m365-actionable-provisioning';

const handleProvisioningCompleted = React.useCallback(
  (ev: ProvisioningCompletedEvent) => {
    console.log(`Provisioning ${ev.outcome} on ${ev.siteUrl}`);
    
    if (ev.outcome === 'succeeded') {
      // Update web part properties
      this.properties.lastProvisioningState = 'applied';
      this.render();
    } else if (ev.outcome === 'failed') {
      // Handle failure
      console.error('Provisioning failed');
    } else if (ev.outcome === 'cancelled') {
      // Handle cancellation
      console.log('Provisioning was cancelled by user');
    }
  },
  [this.properties]
);

<ProvisioningDialog
  open={open}
  onClose={() => setOpen(false)}
  context={context}
  planTemplate={myPlan}
  logger={logger}
  onProvisioningCompleted={handleProvisioningCompleted}
/>
```

### ProvisioningCompletedEvent

```typescript
type ProvisioningCompletedEvent = Readonly<{
  /** The effective target site URL used for the run */
  siteUrl: string;
  
  /** Final outcome of the run */
  outcome: 'succeeded' | 'failed' | 'cancelled';
  
  /** Engine terminal status at completion time */
  engineStatus: EngineStatus;
}>;
```

---

## Localization

### String Overrides

Override specific strings by passing a partial `strings` object:

```tsx
<ProvisioningDialog
  // ...required props
  strings={{
    // Dialog chrome
    defaultTitle: 'Site Configuration',
    closeButtonAriaLabel: 'Close dialog',
    closeLabel: 'Close',
    
    // Provisioning mode
    runLabel: 'Apply Changes',
    cancelLabel: 'Abort',
    targetSiteLabel: 'Target Site:',
    
    // Progress
    totalLabel: 'Total',
    successLabel: 'Success',
    failLabel: 'Failed',
    pendingLabel: 'Pending',
    
    // Final status
    finalOutcomeSucceededLabel: 'Configuration Applied Successfully',
    finalOutcomeFailedLabel: 'Configuration Failed',
    finalOutcomeCancelledLabel: 'Configuration Cancelled',
    
    // Compliance mode
    complianceDefaultTitle: 'Compliance Check',
    checkComplianceLabel: 'Check',
    runCheckLabel: 'Run Check',
    overallCompliantLabel: 'All items are compliant',
    overallNonCompliantLabel: 'Some items are non-compliant'
  }}
/>
```

### Full Strings Interface

```typescript
type ProvisioningDialogStrings = Readonly<{
  // Dialog chrome
  defaultTitle: string;
  closeButtonAriaLabel: string;
  closeLabel: string;
  backToProvisioningLabel: string;
  
  // Target site
  targetSiteLabel: string;
  targetSiteMissingTitle: string;
  targetSiteMissingMessage: string;
  errorFallbackCode: string;
  
  // Summary labels
  totalLabel: string;
  successLabel: string;
  failLabel: string;
  skippedLabel: string;
  pendingLabel: string;
  completedLabel: string;
  
  // Final outcome
  finalOutcomeSucceededLabel: string;
  finalOutcomeFailedLabel: string;
  finalOutcomeCancelledLabel: string;
  finalOutcomeRunningLabel: string;
  
  // Help text
  initialHelpProvisioningText: string;
  initialHelpComplianceText: string;
  provisioningDefaultDescription: string;
  complianceDefaultDescription: string;
  
  // Actions
  viewLogsLabel: string;
  checkComplianceLabel: string;
  cancelLabel: string;
  runLabel: string;
  
  // Confirmation
  confirmRunTitle: string;
  confirmRunMessage: string;
  
  // Compliance mode
  complianceDefaultTitle: string;
  complianceHeaderLabel: string;
  runCheckLabel: string;
  cancelCheckLabel: string;
  checkingLabel: string;
  
  // Compliance status
  overallCompliantLabel: string;
  overallWarningLabel: string;
  overallNonCompliantLabel: string;
  overallRunningLabel: string;
  overallCancelledLabel: string;
  
  // Compliance items
  checkedLabel: string;
  blockedLabel: string;
  compliantLabel: string;
  nonCompliantLabel: string;
  unverifiableLabel: string;
  ignoredLabel: string;
  
  // Compliance errors
  complianceTargetSiteMissingTitle: string;
  complianceTargetSiteMissingMessage: string;
  complianceErrorFallbackTitle: string;
  
  // Nested component strings (optional)
  confirmDialogStrings?: Partial<ConfirmDialogStrings>;
  logPanelStrings?: Partial<LogPanelStrings>;
  logEntryStrings?: Partial<ProvisioningLogEntryStrings>;
}>;
```

---

## Styling

### Fluent UI 9 Theming

The dialog automatically inherits the FluentProvider theme:

```tsx
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';

// Light theme
<FluentProvider theme={webLightTheme}>
  <ProvisioningDialog {...props} />
</FluentProvider>

// Dark theme
<FluentProvider theme={webDarkTheme}>
  <ProvisioningDialog {...props} />
</FluentProvider>
```

### IdPrefixProvider

For proper ID scoping in SPFx (required to avoid conflicts):

```tsx
import { IdPrefixProvider } from '@fluentui/react-components';

<IdPrefixProvider value="my-webpart-provisioning-">
  <FluentProvider theme={webLightTheme}>
    <ProvisioningDialog {...props} />
  </FluentProvider>
</IdPrefixProvider>
```

---

## Examples

### Complete Web Part Example

```tsx
import * as React from 'react';
import {
  Button,
  Card,
  CardHeader,
  FluentProvider,
  IdPrefixProvider,
  Text,
  Title3,
  makeStyles,
  tokens,
  webLightTheme
} from '@fluentui/react-components';
import { ProvisioningDialog } from '@apvee/spfx-m365-actionable-provisioning';
import type { ProvisioningCompletedEvent } from '@apvee/spfx-m365-actionable-provisioning';
import { createLogger, consoleSink } from '@apvee/m365-actionable-provisioning/core';
import { provisioningPlan } from './plans/provisioning-plan';

interface IMyWebPartProps {
  context: WebPartContext;
  targetSiteUrl: string;
  isEditMode: boolean;
  lastProvisioningState?: string;
  onStateChange: (state: string) => void;
}

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
});

const MyWebPart: React.FC<IMyWebPartProps> = (props) => {
  const styles = useStyles();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [complianceOpen, setComplianceOpen] = React.useState(false);

  const logger = React.useMemo(() => 
    createLogger({ level: 'debug', sink: consoleSink }), 
  []);

  const handleProvisioningCompleted = React.useCallback(
    (ev: ProvisioningCompletedEvent) => {
      if (ev.outcome === 'succeeded') {
        props.onStateChange('applied');
      }
    },
    [props.onStateChange]
  );

  return (
    <IdPrefixProvider value="my-webpart-">
      <FluentProvider theme={webLightTheme}>
        <Card>
          <CardHeader
            header={<Title3>Site Configuration</Title3>}
            description="Configure the target site with required lists and columns"
          />

          <div className={styles.stack}>
            <Text>
              <strong>Target Site:</strong> {props.targetSiteUrl || 'Current site'}
            </Text>
            <Text>
              <strong>Last State:</strong> {props.lastProvisioningState || 'Not applied'}
            </Text>

            <Button
              appearance="primary"
              onClick={() => setDialogOpen(true)}
              disabled={!props.isEditMode}
            >
              Configure Site
            </Button>

            <Button
              appearance="secondary"
              onClick={() => setComplianceOpen(true)}
              disabled={!props.isEditMode || !props.targetSiteUrl}
            >
              Check Compliance
            </Button>
          </div>

          {/* Provisioning Dialog */}
          <ProvisioningDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onProvisioningCompleted={handleProvisioningCompleted}
            context={props.context}
            planTemplate={provisioningPlan}
            logger={logger}
            targetSiteUrl={props.targetSiteUrl}
            enableComplianceCheck={true}
            confirmRun={true}
          />

          {/* Compliance-only Dialog */}
          <ProvisioningDialog
            open={complianceOpen}
            onClose={() => setComplianceOpen(false)}
            context={props.context}
            planTemplate={provisioningPlan}
            logger={logger}
            mode="compliance"
            complianceAutoRunOnOpen={true}
            targetSiteUrl={props.targetSiteUrl}
          />
        </Card>
      </FluentProvider>
    </IdPrefixProvider>
  );
};

export default MyWebPart;
```

---

## Best Practices

### Component Integration

1. **Always wrap with providers**: Use `IdPrefixProvider` and `FluentProvider`
2. **Memoize logger**: Create logger with `useMemo` to prevent recreation
3. **Handle completion**: Always handle `onProvisioningCompleted` to update state
4. **Disable when inactive**: Disable buttons when not in edit mode

### User Experience

1. **Use confirmRun**: Enable for destructive operations
2. **Provide clear titles**: Customize title and description for context
3. **Enable compliance**: Let users verify state before provisioning
4. **Show target site**: Always display the target site URL

### Performance

1. **Lazy loading**: Only render dialog when `open` is true
2. **Reset on close**: Engine state resets when dialog reopens
3. **Appropriate logging**: Use `'info'` level in production

### Accessibility

1. **FluentProvider**: Ensures proper theming and focus management
2. **IdPrefixProvider**: Prevents ID collisions in SPFx
3. **Keyboard support**: Built-in via Fluent UI Dialog

---

## Related Documentation

- [Introduction](./introduction.md) - Getting started guide
- [Provisioning Schema](./provisioning-schema.md) - Plan structure and actions
- [SPFx Engine](./spfx-engine.md) - Engine API for programmatic use
- [Property Pane Fields](./property-pane-fields.md) - Property pane integration
