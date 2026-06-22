/**
 * Provisioning activity entry types.
 * 
 * @packageDocumentation
 */

import type { ActionPath } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning';

import type { BaseActivityEntry } from './activity-entry';

/**
 * Status of a provisioning activity entry.
 * 
 * @public
 */
export type ProvisioningActivityStatus =
  | 'pending'
  | 'working'
  | 'success'
  | 'failed'
  | 'skipped';

/**
 * Activity entry representing a provisioning action's state.
 * 
 * @public
 */
export interface ProvisioningActivityEntry extends BaseActivityEntry<ActionPath> {
  status: ProvisioningActivityStatus;
  result?: ProvisioningResultLight;
  durationMs?: number;
  errorMessage?: string;
  children?: ReadonlyArray<ProvisioningActivityEntry>;
}
