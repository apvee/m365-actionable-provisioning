/**
 * Internal utilities for PropertyPaneProvisioningField view.
 *
 * @internal
 * @packageDocumentation
 */

import type { ProvisioningPlan } from '@apvee/m365-actionable-provisioning/sharepoint';

export type Mode = 'provision' | 'deprovision' | 'compliance';

export function getDialogPlanTemplate(
  mode: Mode,
  plans: { provisioningActionPlan: ProvisioningPlan; deprovisioningActionPlan?: ProvisioningPlan }
): ProvisioningPlan {
  return mode === 'deprovision'
    ? (plans.deprovisioningActionPlan ?? plans.provisioningActionPlan)
    : plans.provisioningActionPlan;
}
