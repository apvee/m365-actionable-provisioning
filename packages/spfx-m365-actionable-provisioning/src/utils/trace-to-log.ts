/**
 * Internal utilities for converting engine trace data to UI log entries.
 *
 * @internal
 * @packageDocumentation
 */

import type { EngineSnapshotTyped, EngineStatus } from '../../core/engine';
import type { EngineTrace, ActionStatus } from '../../core/trace';
import type { ProvisioningResultLight } from '../../provisioning';
import type { ProvisioningLogEntry, ProvisioningLogStatus } from '../models';

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

const mapActionStatusToLogStatus = (s: ActionStatus): ProvisioningLogStatus => {
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

const mapTraceAndResultToUiLogStatus = (
  traceStatus: ActionStatus,
  result: ProvisioningResultLight | undefined
): ProvisioningLogStatus => {
  // Engine currently marks actions as "success" even when their domain result is "skipped".
  // Keep UI semantics by interpreting skipped outcomes as skipped status.
  if (traceStatus === 'success' && result?.outcome === 'skipped') return 'skipped';
  return mapActionStatusToLogStatus(traceStatus);
};

const isSubactionPath = (path: string): boolean => path.includes('/');

const calculateDepth = (path: string): number => {
  return path.split('/').length - 1;
};

const buildHierarchicalEntries = (
  snapshot: EngineSnapshotTyped<ProvisioningResultLight>,
  trace: EngineTrace
): ReadonlyArray<ProvisioningLogEntry> => {
  const entriesByPath = new Map<string, ProvisioningLogEntry>();

  // Prima passata: crea tutte le entry
  for (const path of trace.order) {
    const traceItem = trace.byPath[path];
    if (!traceItem) continue;

    const result = snapshot.out.byAction?.[path]?.result;
    const depth = calculateDepth(path);

    const entry: ProvisioningLogEntry = {
      id: path,
      verb: traceItem.verb,
      result,
      kind: isSubactionPath(path) ? 'subaction' : 'action',
      status: mapTraceAndResultToUiLogStatus(traceItem.status, result),
      durationMs: traceItem.durationMs,
      errorMessage: traceItem.error?.message,
      depth,
      children: undefined,
    };

    entriesByPath.set(path, entry);
  }

  // Seconda passata: costruisce la gerarchia
  const rootEntries: ProvisioningLogEntry[] = [];
  const childrenByParent = new Map<string, ProvisioningLogEntry[]>();

  for (const [path, entry] of entriesByPath) {
    if (entry.depth === 0) {
      rootEntries.push(entry);
    } else {
      const parentPath = path.substring(0, path.lastIndexOf('/'));
      if (!childrenByParent.has(parentPath)) {
        childrenByParent.set(parentPath, []);
      }
      childrenByParent.get(parentPath)?.push(entry);
    }
  }

  // Terza passata: assegna children alle entry
  const assignChildren = (entry: ProvisioningLogEntry): ProvisioningLogEntry => {
    const children = childrenByParent.get(entry.id);
    if (!children || children.length === 0) {
      return entry;
    }

    const childrenWithGrandchildren = children.map(assignChildren);

    return {
      ...entry,
      children: childrenWithGrandchildren,
    };
  };

  return rootEntries.map(assignChildren);
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

export function buildProvisioningLogEntriesFromSnapshot(
  snapshot: EngineSnapshotTyped<ProvisioningResultLight> | undefined
): ReadonlyArray<ProvisioningLogEntry> {
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
