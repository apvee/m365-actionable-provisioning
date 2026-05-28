/**
 * Internal utilities for PropertyPaneProvisioningField view.
 *
 * @internal
 * @packageDocumentation
 */

import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';

export type Mode = 'provision' | 'deprovision' | 'compliance';

export function getDialogPlanTemplate(
  mode: Mode,
  plans: { provisioningActionPlan: M365ProvisioningPlan; deprovisioningActionPlan?: M365ProvisioningPlan }
): M365ProvisioningPlan {
  return mode === 'deprovision'
    ? (plans.deprovisioningActionPlan ?? plans.provisioningActionPlan)
    : plans.provisioningActionPlan;
}
