/**
 * Internal utilities for converting compliance data to log entries.
 *
 * @internal
 * @packageDocumentation
 */

import type { ActionPath } from '../../core/trace';
import type { ComplianceReport } from '../../core/compliance';
import type { ComplianceTrace } from '../../core/trace';
import type { ComplianceLogEntry } from '../models';

const isSubactionPath = (path: string): boolean => path.includes('/');

const calculateDepth = (path: string): number => {
  return path.split('/').length - 1;
};

const compareActionPaths = (a: ActionPath, b: ActionPath): number => {
  const aParts = String(a).split('/').map((x) => Number.parseInt(x, 10));
  const bParts = String(b).split('/').map((x) => Number.parseInt(x, 10));

  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const av = aParts[i];
    const bv = bParts[i];

    if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
    if (Number.isNaN(av)) return -1;
    if (Number.isNaN(bv)) return 1;

    if (av !== bv) return av - bv;
  }

  return aParts.length - bParts.length;
};

export function buildComplianceLogEntriesFromReport(
  report: ComplianceReport | undefined
): ReadonlyArray<ComplianceLogEntry> {
  if (!report) return [];

  const byPath = report.byPath;
  const paths = Object.keys(byPath).sort((a, b) => compareActionPaths(a as ActionPath, b as ActionPath));

  const entriesByPath = new Map<ActionPath, ComplianceLogEntry>();

  for (const p of paths) {
    const item = byPath[p as ActionPath];
    if (!item) continue;

    const path = item.path;
    const depth = calculateDepth(path);

    const status: ComplianceLogEntry['status'] = item.checked
      ? (item.outcome ?? 'unverifiable')
      : 'blocked';

    const entry: ComplianceLogEntry = {
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

    entriesByPath.set(path, entry);
  }

  const rootEntries: ComplianceLogEntry[] = [];
  const childrenByParent = new Map<ActionPath, ComplianceLogEntry[]>();

  for (const [path, entry] of entriesByPath) {
    if (entry.depth === 0) {
      rootEntries.push(entry);
      continue;
    }

    const parentPath = path.substring(0, path.lastIndexOf('/')) as ActionPath;
    if (!childrenByParent.has(parentPath)) {
      childrenByParent.set(parentPath, []);
    }

    childrenByParent.get(parentPath)?.push(entry);
  }

  const assignChildren = (entry: ComplianceLogEntry): ComplianceLogEntry => {
    const children = childrenByParent.get(entry.id);
    if (!children || children.length === 0) {
      return entry;
    }

    const sortedChildren = [...children].sort((a, b) => compareActionPaths(a.id, b.id));
    const childrenWithGrandchildren = sortedChildren.map(assignChildren);

    return {
      ...entry,
      children: childrenWithGrandchildren,
    };
  };

  return rootEntries.sort((a, b) => compareActionPaths(a.id, b.id)).map(assignChildren);
}

export function buildComplianceLogEntriesFromTrace(
  trace: ComplianceTrace | undefined
): ReadonlyArray<ComplianceLogEntry> {
  if (!trace) return [];

  const byPath = trace.byPath;
  const paths = [...trace.order];

  const entriesByPath = new Map<ActionPath, ComplianceLogEntry>();

  for (const p of paths) {
    const item = byPath[p as ActionPath];
    if (!item) continue;

    const path = item.path;
    const depth = calculateDepth(path);

    const status: ComplianceLogEntry['status'] =
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

    const entry: ComplianceLogEntry = {
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

    entriesByPath.set(path, entry);
  }

  const rootEntries: ComplianceLogEntry[] = [];
  const childrenByParent = new Map<ActionPath, ComplianceLogEntry[]>();

  for (const [path, entry] of entriesByPath) {
    if (entry.depth === 0) {
      rootEntries.push(entry);
      continue;
    }

    const parentPath = path.substring(0, path.lastIndexOf('/')) as ActionPath;
    if (!childrenByParent.has(parentPath)) {
      childrenByParent.set(parentPath, []);
    }

    childrenByParent.get(parentPath)?.push(entry);
  }

  const assignChildren = (entry: ComplianceLogEntry): ComplianceLogEntry => {
    const children = childrenByParent.get(entry.id);
    if (!children || children.length === 0) {
      return entry;
    }

    const sortedChildren = [...children].sort((a, b) => compareActionPaths(a.id, b.id));
    const childrenWithGrandchildren = sortedChildren.map(assignChildren);

    return {
      ...entry,
      children: childrenWithGrandchildren,
    };
  };

  return rootEntries.sort((a, b) => compareActionPaths(a.id, b.id)).map(assignChildren);
}
