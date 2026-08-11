import { webLightTheme } from '@fluentui/react-components';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import { describe, expect, it } from 'vitest';

import { createFluentV9ThemeFromSPFxTheme } from '../../src/internal/theme/createFluentV9ThemeFromSPFxTheme';

const themeVariant = Object.freeze({
  palette: Object.freeze({
    themePrimary: '#005a9e',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralPrimary: '#242424',
    neutralSecondary: '#616161',
    neutralSecondaryAlt: '#8a8886',
    neutralTertiary: '#a19f9d',
    neutralTertiaryAlt: '#c8c6c4',
    neutralQuaternary: '#d2d0ce',
    neutralLight: '#edebe9',
    neutralLighter: '#f3f2f1',
    neutralLighterAlt: '#faf9f8',
    white: '#ffffff',
    black: '#000000',
  }),
  semanticColors: Object.freeze({ bodyBackground: '#ffffff', bodyText: '#242424' }),
  fonts: Object.freeze({ medium: Object.freeze({ fontFamily: 'SPFx Test Sans', fontSize: '14px' }) }),
  isInverted: false,
} as unknown as IReadonlyTheme);

describe('createFluentV9ThemeFromSPFxTheme', () => {
  it('maps SPFx colors and fonts without mutating the source', () => {
    const before = JSON.stringify(themeVariant);
    const result = createFluentV9ThemeFromSPFxTheme(themeVariant);

    expect(result.colorNeutralForeground1).toBe('#242424');
    expect(result.fontFamilyBase).toContain('SPFx Test Sans');
    expect(JSON.stringify(themeVariant)).toBe(before);
  });

  it('returns the light theme for an absent theme', () => {
    expect(createFluentV9ThemeFromSPFxTheme(undefined)).toBe(webLightTheme);
  });

  it('returns the light theme when the SPFx theme cannot be read', () => {
    const invalidTheme = Object.defineProperty({}, 'palette', {
      get: () => {
        throw new Error('invalid theme');
      },
    }) as IReadonlyTheme;

    expect(createFluentV9ThemeFromSPFxTheme(invalidTheme)).toBe(webLightTheme);
  });
});
