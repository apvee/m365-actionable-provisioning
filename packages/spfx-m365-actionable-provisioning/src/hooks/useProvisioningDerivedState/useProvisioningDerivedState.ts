/**
 * Hook for deriving provisioning state from engine snapshots.
 *
 * @packageDocumentation
 */

import { useMemo } from 'react';

import type { EngineSnapshotTyped } from '../../../core/engine';
import type { ProvisioningResultLight } from '../../../provisioning';
import type { ProvisioningLogEntry } from '../../models';
import {
  buildProvisioningLogEntriesFromSnapshot,
  buildProvisioningUiSummary,
  type ProvisioningUiSummary,
} from '../../utils/trace-to-log';

/**
 * Derived state from a provisioning engine snapshot.
 * @public
 */
export type ProvisioningDerivedState = Readonly<{
  summary?: ProvisioningUiSummary;
  logEntries: ReadonlyArray<ProvisioningLogEntry>;
}>;

/**
 * React hook that derives UI-friendly state from engine snapshots.
 * @public
 */
export function useProvisioningDerivedState(
  snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined
): ProvisioningDerivedState {
  return useMemo(() => {
    return {
      summary: buildProvisioningUiSummary(snapshot),
      logEntries: buildProvisioningLogEntriesFromSnapshot(snapshot),
    };
  }, [snapshot]);
}
