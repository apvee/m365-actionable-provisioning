/**
 * Provisioning log entry types.
 * 
 * @packageDocumentation
 */

import type { ActionPath } from '@apvee/m365-actionable-provisioning/core';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning/sharepoint';

import type { BaseLogEntry } from './log-entry';

/**
 * Status of a provisioning log entry.
 * 
 * @public
 */
export type ProvisioningLogStatus =
  | 'pending'
  | 'working'
  | 'success'
  | 'failed'
  | 'skipped';

/**
 * Log entry representing a provisioning action's state.
 * 
 * @public
 */
export interface ProvisioningLogEntry extends BaseLogEntry<ActionPath> {
  status: ProvisioningLogStatus;
  result?: ProvisioningResultLight;
  durationMs?: number;
  errorMessage?: string;
  children?: ReadonlyArray<ProvisioningLogEntry>;
}
