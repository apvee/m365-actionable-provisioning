import type { ComplianceLogEntry, ProvisioningLogEntry } from '../../models';

export const prunePendingEntries = (
  entries: ReadonlyArray<ProvisioningLogEntry>
): ReadonlyArray<ProvisioningLogEntry> => {
  const pruned: ProvisioningLogEntry[] = [];

  for (const entry of entries) {
    const prunedChildren = entry.children ? prunePendingEntries(entry.children) : undefined;

    // Hide pending entries. If a pending entry ever has visible descendants
    // (unlikely with DFS execution order), promote them.
    if (entry.status === 'pending') {
      if (prunedChildren && prunedChildren.length > 0) {
        pruned.push(...prunedChildren);
      }
      continue;
    }

    if (entry.children && prunedChildren !== entry.children) {
      pruned.push({ ...entry, children: prunedChildren });
      continue;
    }

    pruned.push(entry);
  }

  return pruned;
};

export const prunePendingComplianceEntries = (
  entries: ReadonlyArray<ComplianceLogEntry>
): ReadonlyArray<ComplianceLogEntry> => {
  const pruned: ComplianceLogEntry[] = [];

  for (const entry of entries) {
    const prunedChildren = entry.children ? prunePendingComplianceEntries(entry.children) : undefined;

    // Hide pending entries. If a pending entry ever has visible descendants
    // (unlikely with DFS traversal order), promote them.
    if (entry.status === 'pending') {
      if (prunedChildren && prunedChildren.length > 0) {
        pruned.push(...prunedChildren);
      }
      continue;
    }

    if (entry.children && prunedChildren !== entry.children) {
      pruned.push({ ...entry, children: prunedChildren });
      continue;
    }

    pruned.push(entry);
  }

  return pruned;
};
