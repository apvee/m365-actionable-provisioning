/**
 * Internal utilities for PropertyPaneProvisioningField view.
 *
 * @internal
 * @packageDocumentation
 */

import type { ProvisioningPlan } from "../../../provisioning/catalogs";

export type Mode = 'provision' | 'deprovision' | 'compliance';

export function getDialogPlanTemplate(
  mode: Mode,
  plans: { provisioningActionPlan: ProvisioningPlan; deprovisioningActionPlan?: ProvisioningPlan }
): ProvisioningPlan {
  return mode === 'deprovision'
    ? (plans.deprovisioningActionPlan ?? plans.provisioningActionPlan)
    : plans.provisioningActionPlan;
}
