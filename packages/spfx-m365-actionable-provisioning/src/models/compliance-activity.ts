/**
 * Compliance activity entry types.
 * 
 * @packageDocumentation
 */

import type { ActionPath } from '@apvee/m365-actionable-provisioning';
import type { ComplianceOutcome } from '@apvee/m365-actionable-provisioning';

import type { BaseActivityEntry } from './activity-entry';

/**
 * Status for completed compliance checks.
 * @public
 */
type ComplianceActivityStatus = ComplianceOutcome | 'blocked';

/**
 * Additional states used during realtime compliance checks.
 * @internal
 */
type ComplianceActivityStatusRealtime = 'pending' | 'running' | 'cancelled';

/**
 * Activity entry representing a compliance check's state.
 * 
 * @public
 */
export interface ComplianceActivityEntry extends BaseActivityEntry<ActionPath> {
  status: ComplianceActivityStatus | ComplianceActivityStatusRealtime;

  checked: boolean;
  blockedBy?: ActionPath;

  resource?: string;
  reason?: string;
  message?: string;

  children?: ReadonlyArray<ComplianceActivityEntry>;
}
