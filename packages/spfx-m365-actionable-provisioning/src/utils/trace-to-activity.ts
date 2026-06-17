/**
 * Internal utilities for converting engine trace data to UI activity entries.
 *
 * @internal
 * @packageDocumentation
 */

import type { EngineSnapshotTyped, EngineStatus } from '@apvee/m365-actionable-provisioning';
import type { EngineTrace, ActionStatus } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningResultLight } from '@apvee/m365-actionable-provisioning';
import type { ProvisioningActivityEntry, ProvisioningActivityStatus } from '../models';
import { buildActivityTree, calculateDepth, isSubactionPath } from './activity-tree';

export type ProvisioningUiProgress = Readonly<{
  completed: number;
  total: number;
  text: string;
}>;

export type ProvisioningUiSummary = Readonly<{
  engineStatus: EngineStatus;
  isRunning: boolean;
  progress?: ProvisioningUiProgress;
  counts: EngineTrace['counts'];
}>;

const mapActionStatusToActivityStatus = (s: ActionStatus): ProvisioningActivityStatus => {
  switch (s) {
    case 'idle':
      return 'pending';
    case 'running':
      return 'working';
    case 'success':
      return 'success';
    case 'fail':
      return 'failed';
    case 'skipped':
      return 'skipped';
    default:
      return 'pending';
  }
};

const mapTraceAndResultToActivityStatus = (
  traceStatus: ActionStatus,
  result: ProvisioningResultLight | undefined
): ProvisioningActivityStatus => {
  // Engine currently marks actions as "success" even when their domain result is "skipped".
  // Keep UI semantics by interpreting skipped outcomes as skipped status.
  if (traceStatus === 'success' && result?.outcome === 'skipped') return 'skipped';
  return mapActionStatusToActivityStatus(traceStatus);
};

const buildHierarchicalEntries = (
  snapshot: EngineSnapshotTyped<ProvisioningResultLight>,
  trace: EngineTrace
): ReadonlyArray<ProvisioningActivityEntry> => {
  const entries: ProvisioningActivityEntry[] = [];

  for (const path of trace.order) {
    const traceItem = trace.byPath[path];
    if (!traceItem) continue;

    const result = snapshot.out.byAction?.[path]?.result;
    const depth = calculateDepth(path);

    const entry: ProvisioningActivityEntry = {
      id: path,
      verb: traceItem.verb,
      result,
      kind: isSubactionPath(path) ? 'subaction' : 'action',
      status: mapTraceAndResultToActivityStatus(traceItem.status, result),
      durationMs: traceItem.durationMs,
      errorMessage: traceItem.error?.message,
      depth,
      children: undefined,
    };

    entries.push(entry);
  }

  return buildActivityTree(entries, {
    withChildren: (entry, children) => ({ ...entry, children }),
  });
};

const buildProvisioningUiCounts = (
  snapshot: EngineSnapshotTyped<ProvisioningResultLight>
): EngineTrace['counts'] => {
  const trace = snapshot.out.trace;

  // Keep the same shape as EngineTrace counts.
  const counts: EngineTrace['counts'] = {
    idle: 0,
    running: 0,
    success: 0,
    fail: 0,
    skipped: 0,
  };

  for (const path of trace.order) {
    const traceItem = trace.byPath[path];
    const traceStatus = traceItem?.status ?? 'idle';

    if (traceStatus === 'success') {
      const result = snapshot.out.byAction?.[path]?.result;
      if (result?.outcome === 'skipped') counts.skipped += 1;
      else counts.success += 1;
      continue;
    }

    if (traceStatus === 'skipped') {
      counts.skipped += 1;
      continue;
    }

    if (traceStatus === 'running') {
      counts.running += 1;
      continue;
    }

    if (traceStatus === 'fail') {
      counts.fail += 1;
      continue;
    }

    counts.idle += 1;
  }

  return counts;
};

export function buildProvisioningActivityEntriesFromSnapshot(
  snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined
): ReadonlyArray<ProvisioningActivityEntry> {
  const trace = snapshot?.out?.trace;
  if (!trace) return [];

  return buildHierarchicalEntries(snapshot, trace);
}

export function buildProvisioningUiSummary(
  snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined
): ProvisioningUiSummary | undefined {
  if (!snapshot?.out?.trace) return undefined;

  const { status } = snapshot;
  const counts = buildProvisioningUiCounts(snapshot);
  const total = snapshot.out.trace.total;
  const completed = (counts.success ?? 0) + (counts.fail ?? 0) + (counts.skipped ?? 0);

  const isRunning = status === 'preprocessing' || status === 'preflightPermissions' || status === 'running';

  const progress: ProvisioningUiProgress | undefined = total
    ? { completed, total, text: `${completed}/${total}` }
    : undefined;

  return {
    engineStatus: status,
    isRunning,
    progress,
    counts,
  };
}
