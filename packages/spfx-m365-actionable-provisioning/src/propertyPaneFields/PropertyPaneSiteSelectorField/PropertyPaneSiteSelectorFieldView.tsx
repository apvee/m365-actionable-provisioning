/**
 * Internal view component for PropertyPaneSiteSelectorField.
 *
 * @internal
 * @packageDocumentation
 */

import {
  Avatar,
  Card,
  Field,
  Label,
  Radio,
  RadioGroup,
  Spinner,
  Tag,
  TagPicker,
  TagPickerControl,
  TagPickerGroup,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  type TagPickerProps,
  Text,
} from '@fluentui/react-components';
import * as React from 'react';

import { normalizeUrl } from '../../utils/url';

import { useStyles } from './PropertyPaneSiteSelectorFieldView.styles';
import type {
  PropertyPaneSiteSelectorFieldViewProps,
  SiteSelectionMode,
  SiteSearchResult,
  SiteSelectorFieldStrings,
} from './PropertyPaneSiteSelectorFieldView.types';
import {
  CACHE_PERSIST_DELAY_MS,
  DEFAULT_STRINGS,
  SEARCH_DEBOUNCE_MS,
  computeAvailableOptions,
  computeMode,
  computeSelectedSite,
  fetchSiteTitle,
  loadTitleCache,
  mergeTitlesFromResults,
  persistTitleCache,
  resolveHub,
  searchSites,
} from './PropertyPaneSiteSelectorFieldView.utils';
import { useDebounce } from '../../hooks/useDebounce';
import { useSPInstance } from '../../hooks/useSPInstance';

export const PropertyPaneSiteSelectorFieldView: React.FC<PropertyPaneSiteSelectorFieldViewProps> = ({
  label,
  value,
  onChange,
  context,
  appearance = 'filled',
  disabled = false,
  strings,
}) => {
  const sp = useSPInstance(context, undefined);
  const styles = useStyles();

  const s: SiteSelectorFieldStrings = React.useMemo(() => {
    return {
      ...DEFAULT_STRINGS,
      ...(strings ?? {}),
    } satisfies SiteSelectorFieldStrings;
  }, [strings]);

  // Use explicit label or fall back to localized default
  const effectiveLabel = label ?? s.defaultLabel;

  const currentWebUrl = normalizeUrl(context.pageContext.web.absoluteUrl)!;
  const selectedSiteUrl = normalizeUrl(value);

  const [mode, setMode] = React.useState<SiteSelectionMode>(() =>
    computeMode(selectedSiteUrl, currentWebUrl, undefined)
  );

  const [hubUrl, setHubUrl] = React.useState<string | undefined>();
  const [hasHubSite, setHasHubSite] = React.useState(false);

  const [searchText, setSearchText] = React.useState('');
  const [results, setResults] = React.useState<ReadonlyArray<SiteSearchResult>>([]);
  const [loading, setLoading] = React.useState(false);

  const [titleCache, setTitleCache] = React.useState<Record<string, string>>(() => loadTitleCache());
  const persistTimer = React.useRef<number | undefined>();

  const debouncedSearchText = useDebounce(searchText, SEARCH_DEBOUNCE_MS);

  React.useEffect(() => {
    if (persistTimer.current) {
      window.clearTimeout(persistTimer.current);
    }

    persistTimer.current = window.setTimeout(() => {
      persistTitleCache(titleCache);
    }, CACHE_PERSIST_DELAY_MS);

    return () => {
      if (persistTimer.current) {
        window.clearTimeout(persistTimer.current);
        persistTimer.current = undefined;
      }
    };
  }, [titleCache]);

  React.useEffect(() => {
    (async () => {
      const hub = await resolveHub(sp);
      setHasHubSite(hub.hasHubSite);
      setHubUrl(hub.hubUrl);
    })().catch((): void => undefined);
  }, [sp]);

  React.useEffect(() => {
    const derived = computeMode(selectedSiteUrl, currentWebUrl, hubUrl);

    if (derived === 'hub' && mode !== 'hub') {
      setMode('hub');
      return;
    }

    if (derived === 'search' && mode !== 'search') {
      setMode('search');
      return;
    }

    // Don't override a manually selected "search" mode when the selection is still
    // the current/hub site (user may want to start searching without changing value).
    if (derived === 'current' && mode !== 'current' && mode !== 'search') {
      setMode('current');
    }
  }, [selectedSiteUrl, currentWebUrl, hubUrl, mode]);

  const selectedSite = React.useMemo(
    () =>
      computeSelectedSite(
        mode,
        selectedSiteUrl,
        currentWebUrl,
        hubUrl,
        results,
        titleCache
      ),
    [mode, selectedSiteUrl, currentWebUrl, hubUrl, results, titleCache]
  );

  React.useEffect(() => {
    if (mode !== 'search') return;

    const effectiveSelected = selectedSiteUrl;
    if (!effectiveSelected || effectiveSelected === currentWebUrl || effectiveSelected === hubUrl) return;

    const inResults = results.some((r) => normalizeUrl(r.url) === effectiveSelected);
    if (inResults || titleCache[effectiveSelected]) return;

    (async () => {
      const title = await fetchSiteTitle(sp, effectiveSelected);
      if (!title) return;

      setTitleCache((prev) => ({
        ...prev,
        [effectiveSelected]: title,
      }));
    })().catch((): void => undefined);
  }, [mode, selectedSiteUrl, currentWebUrl, hubUrl, sp, results, titleCache]);

  const handleModeChange = React.useCallback(
    async (newMode: SiteSelectionMode): Promise<void> => {
      setSearchText('');
      setResults([]);
      setLoading(false);
      setMode(newMode);

      if (newMode === 'current') {
        onChange(currentWebUrl);
        return;
      }

      if (newMode === 'hub' && hasHubSite && hubUrl) {
        onChange(hubUrl);
      }
    },
    [currentWebUrl, hasHubSite, hubUrl, onChange]
  );

  React.useEffect(() => {
    if (mode !== 'search') return;

    if (!debouncedSearchText.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const mapped = await searchSites(sp, debouncedSearchText);
        if (cancelled) return;

        setResults(mapped);
        setTitleCache((prev) => {
          const { next, changed } = mergeTitlesFromResults(prev, mapped);
          return changed ? next : prev;
        });
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })().catch((): void => undefined);

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchText, mode, sp]);

  const onOptionSelect: TagPickerProps['onOptionSelect'] = React.useCallback(
    (_event, data) => {
      if (disabled) return;
      if (data.value === '__none' || data.value === '__empty' || data.value === '__loading') return;

      const newSelection = data.selectedOptions[data.selectedOptions.length - 1];
      const normalized = normalizeUrl(newSelection);

      if (normalized) {
        onChange(normalized);
      } else {
        onChange(currentWebUrl);
      }

      setSearchText('');
    },
    [disabled, onChange, currentWebUrl]
  );

  const handleTagClick = React.useCallback((e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const availableOptions = React.useMemo(
    () => computeAvailableOptions(results, selectedSite),
    [results, selectedSite]
  );

  return (
    <Field label={<Label weight="regular">{effectiveLabel}</Label>}>
      <Card appearance={appearance} size="small">
        <RadioGroup
          value={mode}
          onChange={(_ev, data) => {
            if (disabled) return;
            handleModeChange(data.value as SiteSelectionMode).catch((): void => undefined);
          }}
          disabled={disabled}
        >
          <Radio value="current" label={s.currentSiteLabel} />
          <Radio value="hub" label={s.hubSiteLabel} disabled={!hasHubSite || disabled} />
          {!hasHubSite && mode === 'hub' && (
            <Text className={styles.hubNotAvailable} size={200}>
              {s.hubNotAvailableLabel}
            </Text>
          )}
          <Radio value="search" label={s.searchSiteLabel} />
        </RadioGroup>

        {mode === 'search' && (
          <div className={styles.searchContainer}>
            <TagPicker
              onOptionSelect={onOptionSelect}
              selectedOptions={selectedSite ? [selectedSite.url] : []}
            >
              <TagPickerControl>
                <TagPickerGroup aria-label={s.selectedSiteGroupAriaLabel}>
                  {selectedSite && (
                    <Tag
                      key={selectedSite.url}
                      shape="rounded"
                      media={<Avatar aria-hidden name={selectedSite.title} color="colorful" shape="square" />}
                      value={selectedSite.url}
                      title={selectedSite.title}
                      primaryText={{
                        className: styles.tagPrimaryText,
                      }}
                      onClick={(e: React.MouseEvent<HTMLElement>) =>
                        handleTagClick(e, selectedSite.url)
                      }
                      dismissible={false}
                      style={{ cursor: 'pointer' }}
                    >
                      {selectedSite.title}
                    </Tag>
                  )}
                </TagPickerGroup>
                <TagPickerInput
                  aria-label={s.searchSitesAriaLabel}
                  placeholder={selectedSite ? '' : s.searchPlaceholder}
                  value={searchText}
                  onChange={(e) => setSearchText((e.target as HTMLInputElement).value)}
                  disabled={disabled}
                />
              </TagPickerControl>
              <TagPickerList>
                {loading && (
                  <TagPickerOption value="__loading" text={s.searchingLabel}>
                    <Spinner size="tiny" /> {s.searchingLabel}
                  </TagPickerOption>
                )}
                {!loading && availableOptions.length === 0 && !searchText.trim() && (
                  <TagPickerOption value="__empty" text={s.emptySearchLabel}>
                    {s.emptySearchLabel}
                  </TagPickerOption>
                )}
                {!loading && availableOptions.length === 0 && searchText.trim() && (
                  <TagPickerOption value="__none" text={s.noResultsLabel}>
                    {s.noResultsLabel}
                  </TagPickerOption>
                )}
                {!loading &&
                  availableOptions.map((option) => (
                    <TagPickerOption
                      key={option.url}
                      value={option.url}
                      text={option.title}
                      title={option.url}
                      media={<Avatar shape="square" aria-hidden name={option.title} color="colorful" size={24} />}
                    >
                      <div className={styles.optionContent}>{option.title}</div>
                    </TagPickerOption>
                  ))}
              </TagPickerList>
            </TagPicker>
          </div>
        )}
      </Card>
    </Field>
  );
};
