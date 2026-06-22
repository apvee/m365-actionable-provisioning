/**
 * Internal utilities for building hierarchical activity trees.
 *
 * @internal
 * @packageDocumentation
 */

export type ActivityTreeEntry<TId extends string> = Readonly<{
  id: TId;
  depth: number;
}>;

export type ActivityTreeOptions<TEntry> = Readonly<{
  sort?: (a: TEntry, b: TEntry) => number;
  withChildren: (entry: TEntry, children: ReadonlyArray<TEntry>) => TEntry;
}>;

export const isSubactionPath = (path: string): boolean => path.includes('/');

export const calculateDepth = (path: string): number => {
  return path.split('/').length - 1;
};

export const compareActionPaths = <TPath extends string>(a: TPath, b: TPath): number => {
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

export function buildActivityTree<TId extends string, TEntry extends ActivityTreeEntry<TId>>(
  entries: ReadonlyArray<TEntry>,
  options: ActivityTreeOptions<TEntry>
): ReadonlyArray<TEntry> {
  const rootEntries: TEntry[] = [];
  const childrenByParent = new Map<TId, TEntry[]>();

  for (const entry of entries) {
    if (entry.depth === 0) {
      rootEntries.push(entry);
      continue;
    }

    const parentPath = entry.id.substring(0, entry.id.lastIndexOf('/')) as TId;
    const siblings = childrenByParent.get(parentPath);
    if (siblings) {
      siblings.push(entry);
    } else {
      childrenByParent.set(parentPath, [entry]);
    }
  }

  const assignChildren = (entry: TEntry): TEntry => {
    const children = childrenByParent.get(entry.id);
    if (!children || children.length === 0) {
      return entry;
    }

    const orderedChildren = options.sort ? [...children].sort(options.sort) : children;
    const childrenWithGrandchildren = orderedChildren.map(assignChildren);

    return options.withChildren(entry, childrenWithGrandchildren);
  };

  const orderedRoots = options.sort ? [...rootEntries].sort(options.sort) : rootEntries;
  return orderedRoots.map(assignChildren);
}
