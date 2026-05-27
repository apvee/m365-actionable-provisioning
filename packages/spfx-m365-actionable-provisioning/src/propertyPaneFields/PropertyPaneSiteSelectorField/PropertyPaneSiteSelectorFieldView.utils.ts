/**
 * Internal utilities for PropertyPaneSiteSelectorField view.
 *
 * @internal
 * @packageDocumentation
 */

import type { SPFI } from '@pnp/sp';

import '@pnp/sp/search';
import '@pnp/sp/sites';
import '@pnp/sp/webs';
import '@pnp/sp/hubsites';
import { Web } from '@pnp/sp/webs';

import { normalizeUrl } from '../../utils/url';

import type {
  SiteSearchResult,
  SiteSelectionMode,
  SiteSelectorFieldStrings,
} from './PropertyPaneSiteSelectorFieldView.types';

import * as locStrings from 'SPFxProvisioningUIStrings';

export const SEARCH_DEBOUNCE_MS = 300;
export const CACHE_PERSIST_DELAY_MS = 1000;
export const MAX_CACHE_ENTRIES = 100;
export const MAX_SEARCH_RESULTS = 15;

export const STORAGE_KEY = 'pnpjs-provisioning:siteSelectorTitles:v1';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

export const DEFAULT_STRINGS: SiteSelectorFieldStrings = {
  defaultLabel: locStrings.SiteSelectorField.DefaultLabel,
  currentSiteLabel: locStrings.SiteSelectorField.CurrentSiteLabel,
  hubSiteLabel: locStrings.SiteSelectorField.HubSiteLabel,
  hubNotAvailableLabel: locStrings.SiteSelectorField.HubNotAvailableLabel,
  searchSiteLabel: locStrings.SiteSelectorField.SearchSiteLabel,

  selectedSiteGroupAriaLabel: locStrings.SiteSelectorField.SelectedSiteGroupAriaLabel,
  searchSitesAriaLabel: locStrings.SiteSelectorField.SearchSitesAriaLabel,
  searchPlaceholder: locStrings.SiteSelectorField.SearchPlaceholder,

  searchingLabel: locStrings.SiteSelectorField.SearchingLabel,
  emptySearchLabel: locStrings.SiteSelectorField.EmptySearchLabel,
  noResultsLabel: locStrings.SiteSelectorField.NoResultsLabel,
};

export function loadTitleCache(): Record<string, string> {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function trimTitleCache(input: Record<string, string>): Record<string, string> {
  const entries = Object.entries(input);
  if (entries.length <= MAX_CACHE_ENTRIES) return input;

  const limited: Record<string, string> = {};
  entries.slice(-MAX_CACHE_ENTRIES).forEach(([k, v]) => {
    limited[k] = v;
  });
  return limited;
}

export function persistTitleCache(input: Record<string, string>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimTitleCache(input)));
  } catch {
    // ignore
  }
}

export function mergeTitlesFromResults(
  prev: Record<string, string>,
  results: ReadonlyArray<SiteSearchResult>
): { next: Record<string, string>; changed: boolean } {
  if (results.length === 0) return { next: prev, changed: false };

  const updated = { ...prev };
  let changed = false;

  for (const site of results) {
    const key = normalizeUrl(site.url);
    if (!key) continue;

    if (!updated[key] || updated[key] !== site.title) {
      updated[key] = site.title;
      changed = true;
    }
  }

  return { next: changed ? updated : prev, changed };
}

export function computeMode(
  selectedSiteUrl: string | undefined,
  currentWebUrl: string,
  hubUrl: string | undefined
): SiteSelectionMode {
  const effectiveSelected = selectedSiteUrl ?? currentWebUrl;

  if (!effectiveSelected) return 'current';
  if (effectiveSelected === currentWebUrl) return 'current';
  if (hubUrl && effectiveSelected === hubUrl) return 'hub';
  return 'search';
}

export function computeSelectedSite(
  mode: SiteSelectionMode,
  selectedSiteUrl: string | undefined,
  currentWebUrl: string,
  hubUrl: string | undefined,
  results: ReadonlyArray<SiteSearchResult>,
  titleCache: Record<string, string>
): SiteSearchResult | undefined {
  if (mode !== 'search') return undefined;

  if (!selectedSiteUrl || selectedSiteUrl === currentWebUrl || selectedSiteUrl === hubUrl) {
    return undefined;
  }

  const siteInResults = results.find((r) => normalizeUrl(r.url) === selectedSiteUrl);
  if (siteInResults) return siteInResults;

  const cachedTitle = titleCache[selectedSiteUrl];
  return {
    url: selectedSiteUrl,
    title: cachedTitle || selectedSiteUrl,
  };
}

export function computeAvailableOptions(
  results: ReadonlyArray<SiteSearchResult>,
  selectedSite?: SiteSearchResult
): ReadonlyArray<SiteSearchResult> {
  if (!selectedSite) return results;
  const selectedNormalized = normalizeUrl(selectedSite.url);
  return results.filter((o) => normalizeUrl(o.url) !== selectedNormalized);
}

export async function resolveHub(sp: SPFI): Promise<{ hasHubSite: boolean; hubUrl?: string }> {
  try {
    const site = await sp.site();
    const hubId = (site as { HubSiteId?: string }).HubSiteId;

    const hasHub = Boolean(hubId && hubId !== EMPTY_GUID);
    if (!hasHub || !hubId) return { hasHubSite: false, hubUrl: undefined };

    const hubInfo = await sp.hubSites.getById(hubId)();
    const hubUrl = normalizeUrl((hubInfo as { SiteUrl?: string }).SiteUrl);
    return { hasHubSite: true, hubUrl };
  } catch {
    return { hasHubSite: false, hubUrl: undefined };
  }
}

export async function fetchSiteTitle(sp: SPFI, siteUrl: string): Promise<string | undefined> {
  const normalized = normalizeUrl(siteUrl);
  if (!normalized) return undefined;

  const web = Web([sp.web, normalized]);
  const info = await web();
  return (info as { Title?: string }).Title;
}

export async function searchSites(sp: SPFI, queryText: string): Promise<SiteSearchResult[]> {
  const searchResults = await sp.search({
    Querytext: `'${queryText}' contentclass:STS_Site`,
    RowLimit: MAX_SEARCH_RESULTS,
    SelectProperties: ['Title', 'Path'],
  });

  return (searchResults.PrimarySearchResults ?? []).reduce<SiteSearchResult[]>((acc, r) => {
    const url = normalizeUrl((r as { Path?: string }).Path);
    if (!url) return acc;

    const title = (r as { Title?: string }).Title ?? url;
    acc.push({ title, url });
    return acc;
  }, []);
}
