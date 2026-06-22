/**
 * Type definitions for PropertyPaneSiteSelectorField.
 *
 * @packageDocumentation
 */

import type { BaseComponentContext } from '@microsoft/sp-component-base';

/**
 * Selection mode for site picker.
 * @public
 */
export type SiteSelectionMode = 'current' | 'hub' | 'search';

/**
 * Site search result entry.
 * @public
 */
export type SiteSearchResult = Readonly<{
  title: string;
  url: string;
}>;

/**
 * Localized strings for the site selector field.
 * @public
 */
export type SiteSelectorFieldStrings = Readonly<{
  /** Default label for the site selector field when no label is provided */
  defaultLabel: string;

  currentSiteLabel: string;
  hubSiteLabel: string;
  hubNotAvailableLabel: string;
  searchSiteLabel: string;

  selectedSiteGroupAriaLabel: string;
  searchSitesAriaLabel: string;
  searchPlaceholder: string;

  searchingLabel: string;
  emptySearchLabel: string;
  noResultsLabel: string;
}>;

/**
 * View props for internal site selector component.
 * @internal
 */
export type PropertyPaneSiteSelectorFieldViewProps = Readonly<{
  /** Field label. Optional - defaults to localized "Target Site" if not provided. */
  label?: string;
  context: BaseComponentContext;

  /**
   * Selected site URL.
   * - `undefined` (or empty): treated as current site
   */
  value?: string;

  /** Called when selection changes. */
  onChange: (siteUrl?: string) => void;

  /** Card appearance style. */
  appearance?: 'subtle' | 'filled' | 'outline' | 'filled-alternative';

  /** Disable all controls (e.g., while provisioning is running). */
  disabled?: boolean;

  /** Optional localized strings overrides. */
  strings?: Partial<SiteSelectorFieldStrings>;
}>;
