/**
 * Internal utilities for converting compliance data to UI activity entries.
 *
 * @internal
 * @packageDocumentation
 */

import type { ActionPath } from '@apvee/m365-actionable-provisioning';
import type { ComplianceReport } from '@apvee/m365-actionable-provisioning';
import type { ComplianceTrace } from '@apvee/m365-actionable-provisioning';
import type { ComplianceActivityEntry } from '../models';
import { buildActivityTree, calculateDepth, compareActionPaths, isSubactionPath } from './activity-tree';

export function buildComplianceActivityEntriesFromReport(
  report: ComplianceReport | undefined
): ReadonlyArray<ComplianceActivityEntry> {
  if (!report) return [];

  const byPath = report.byPath;
  const paths = Object.keys(byPath).sort((a, b) => compareActionPaths(a as ActionPath, b as ActionPath));

  const entries: ComplianceActivityEntry[] = [];

  for (const p of paths) {
    const item = byPath[p as ActionPath];
    if (!item) continue;

    const path = item.path;
    const depth = calculateDepth(path);

    const status: ComplianceActivityEntry['status'] = item.checked
      ? (item.outcome ?? 'unverifiable')
      : 'blocked';

    const entry: ComplianceActivityEntry = {
      id: path,
      verb: item.verb,
      status,
      checked: item.checked,
      blockedBy: item.blockedBy,
      resource: item.resource,
      reason: item.reason,
      message: item.message,
      depth,
      kind: isSubactionPath(path) ? 'subaction' : 'action',
      children: undefined,
    };

    entries.push(entry);
  }

  return buildActivityTree(entries, {
    sort: (a, b) => compareActionPaths(a.id, b.id),
    withChildren: (entry, children) => ({ ...entry, children }),
  });
}

export function buildComplianceActivityEntriesFromTrace(
  trace: ComplianceTrace | undefined
): ReadonlyArray<ComplianceActivityEntry> {
  if (!trace) return [];

  const byPath = trace.byPath;
  const paths = [...trace.order];

  const entries: ComplianceActivityEntry[] = [];

  for (const p of paths) {
    const item = byPath[p as ActionPath];
    if (!item) continue;

    const path = item.path;
    const depth = calculateDepth(path);

    const status: ComplianceActivityEntry['status'] =
      item.status === 'idle'
        ? 'pending'
        : item.status === 'running'
          ? 'running'
          : item.status === 'cancelled'
            ? 'cancelled'
          : item.status === 'blocked'
            ? 'blocked'
            : item.status;

    const checked = status !== 'pending' && status !== 'running' && status !== 'blocked';

    const entry: ComplianceActivityEntry = {
      id: path,
      verb: item.verb,
      status,
      checked,
      blockedBy: item.blockedBy,
      resource: item.resource,
      reason: item.reason,
      message: item.message,
      depth,
      kind: isSubactionPath(path) ? 'subaction' : 'action',
      children: undefined,
    };

    entries.push(entry);
  }

  return buildActivityTree(entries, {
    sort: (a, b) => compareActionPaths(a.id, b.id),
    withChildren: (entry, children) => ({ ...entry, children }),
  });
}
