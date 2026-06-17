/**
 * Internal utilities for PropertyPaneProvisioningField view.
 *
 * @internal
 * @packageDocumentation
 */

import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningDialogMode, ProvisioningDialogStrings } from '../../components';
import type { PropertyPaneProvisioningFieldStrings } from './types';

export type PropertyPaneProvisioningDialogIntent = 'provision' | 'deprovision' | 'compliance';

export type ProvisioningFieldDialogConfig = Readonly<{
  title?: string;
  description?: string;
  initialMode: ProvisioningDialogMode;
  planTemplate: M365ProvisioningPlan;
  strings?: Partial<ProvisioningDialogStrings>;
  confirmRun: boolean;
  complianceAutoRunOnOpen?: boolean;
}>;

type DialogConfigPlans = Readonly<{
  provisioningActionPlan: M365ProvisioningPlan;
  deprovisioningActionPlan?: M365ProvisioningPlan;
}>;

type GetProvisioningFieldDialogConfigArgs = Readonly<{
  plans: DialogConfigPlans;
  strings: PropertyPaneProvisioningFieldStrings;
  complianceAutoRunOnOpen?: boolean;
  confirmDeprovisionRun?: boolean;
}>;

export function getProvisioningFieldDialogConfig(
  intent: PropertyPaneProvisioningDialogIntent,
  args: GetProvisioningFieldDialogConfigArgs
): ProvisioningFieldDialogConfig {
  const title =
    intent === 'deprovision'
      ? args.strings.deprovisioningDialogTitle
      : intent === 'provision'
        ? args.strings.provisioningDialogTitle
        : undefined;

  const description =
    intent === 'deprovision'
      ? args.strings.deprovisioningDialogDescription
      : intent === 'provision'
        ? args.strings.provisioningDialogDescription
        : undefined;

  const dialogStrings: Partial<ProvisioningDialogStrings> | undefined =
    intent === 'deprovision' ? args.strings.deprovisioningDialogStrings : args.strings.provisioningDialogStrings;

  const defaultProvisioningHelp =
    intent === 'provision'
      ? 'Use Run to apply the template to the target site. You can monitor progress and review logs as actions execute.'
      : 'Use Run to remove the template from the target site (deprovision). You can monitor progress and review logs as actions execute.';

  const defaultComplianceHelp =
    'Use Check to preview compliance issues before applying changes.';

  return {
    title,
    description,
    initialMode: intent === 'compliance' ? 'compliance' : 'provisioning',
    planTemplate:
      intent === 'deprovision'
        ? (args.plans.deprovisioningActionPlan ?? args.plans.provisioningActionPlan)
        : args.plans.provisioningActionPlan,
    strings: {
      ...dialogStrings,
      initialHelpProvisioningText: dialogStrings?.initialHelpProvisioningText ?? defaultProvisioningHelp,
      initialHelpComplianceText: dialogStrings?.initialHelpComplianceText ?? defaultComplianceHelp,
    },
    confirmRun: intent === 'deprovision' && args.confirmDeprovisionRun === true,
    complianceAutoRunOnOpen:
      intent === 'compliance' ? true : (intent !== 'deprovision' ? args.complianceAutoRunOnOpen : undefined),
  };
}
