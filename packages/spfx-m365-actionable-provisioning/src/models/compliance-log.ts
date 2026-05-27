/**
 * Compliance log entry types.
 * 
 * @packageDocumentation
 */

import type { ActionPath } from '../../core/trace';
import type { ComplianceOutcome } from '../../core/compliance';

import type { BaseLogEntry } from './log-entry';

/**
 * Status for completed compliance checks.
 * @public
 */
type ComplianceLogStatus = ComplianceOutcome | 'blocked';

/**
 * Additional states used during realtime compliance checks.
 * @internal
 */
type ComplianceLogStatusRealtime = 'pending' | 'running' | 'cancelled';

/**
 * Log entry representing a compliance check's state.
 * 
 * @public
 */
export interface ComplianceLogEntry extends BaseLogEntry<ActionPath> {
  status: ComplianceLogStatus | ComplianceLogStatusRealtime;

  checked: boolean;
  blockedBy?: ActionPath;

  resource?: string;
  reason?: string;
  message?: string;

  children?: ReadonlyArray<ComplianceLogEntry>;
}
