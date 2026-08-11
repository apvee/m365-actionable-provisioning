import { describe, expect, it, vi } from 'vitest';

vi.mock('@microsoft/sp-component-base', () => ({
  ThemeProvider: { serviceKey: Symbol('ThemeProvider') },
}));

vi.mock('@microsoft/sp-property-pane', () => ({
  PropertyPaneFieldType: { Custom: 1 },
}));

import * as publicApi from '../../src';

describe('public Fluent integration API', () => {
  it('exports the hook but not provider ownership or the internal mapper', () => {
    expect(publicApi.useSPFxFluentTheme).toBeTypeOf('function');
    expect('SPFxFluentProvider' in publicApi).toBe(false);
    expect('createFluentV9ThemeFromSPFxTheme' in publicApi).toBe(false);
  });
});
