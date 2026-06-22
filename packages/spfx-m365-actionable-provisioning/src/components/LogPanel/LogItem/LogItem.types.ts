export type LogItemStyles = {
  // Note: 'item' and 'metadata' layout styles removed - now using @apvee/react-layout-kit components
  iconContainer: string;
  content: string;
  error: string;
  message: string;
  childrenContainer: string;
  titleText: string;
  titleVerb: string;
  titleRest: string;
};

export type LogItemBadgeSpec = Readonly<{
  text: string;
  appearance: 'filled' | 'tint' | 'outline';
  color: 'success' | 'danger' | 'brand' | 'subtle' | undefined;
}>;

export type LogItemRenderers<TEntry> = Readonly<{
  getKey: (entry: TEntry) => import('react').Key;
  getChildren: (entry: TEntry) => ReadonlyArray<TEntry> | undefined;

  renderIcon: (entry: TEntry, styles: LogItemStyles) => import('react').ReactNode;
  renderTitle: (entry: TEntry, styles: LogItemStyles) => import('react').ReactNode;
  renderMetadata: (entry: TEntry, styles: LogItemStyles) => import('react').ReactNode;

  getInfo?: (entry: TEntry) => string | undefined;
  renderExtra?: (entry: TEntry, styles: LogItemStyles) => import('react').ReactNode;
}>;

export interface LogItemProps<TEntry> {
  entry: TEntry;
  renderers: LogItemRenderers<TEntry>;
}
