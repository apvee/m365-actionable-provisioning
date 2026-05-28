/**
 * Hook for deriving provisioning state from engine snapshots.
 *
 * @packageDocumentation
 */

import { useMemo } from 'react';

import type { EngineSnapshotTyped } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningActivityEntry } from '../../models';
import {
  buildProvisioningActivityEntriesFromSnapshot,
  buildProvisioningUiSummary,
  type ProvisioningUiSummary,
} from '../../utils/trace-to-activity';

/**
 * Derived state from a provisioning engine snapshot.
 * @public
 */
export type ProvisioningDerivedState = Readonly<{
  summary?: ProvisioningUiSummary;
  activityEntries: ReadonlyArray<ProvisioningActivityEntry>;
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
      activityEntries: buildProvisioningActivityEntriesFromSnapshot(snapshot),
    };
  }, [snapshot]);
}
