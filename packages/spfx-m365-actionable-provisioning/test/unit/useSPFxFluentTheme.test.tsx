import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Theme } from '@fluentui/react-components';
import type {
  BaseComponentContext,
  IReadonlyTheme,
  ThemeChangedEventArgs,
} from '@microsoft/sp-component-base';
import type { ISPEventObserver } from '@microsoft/sp-core-library';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@microsoft/sp-component-base', () => ({
  ThemeProvider: { serviceKey: Symbol('ThemeProvider') },
}));

import { useSPFxFluentTheme } from '../../src/hooks/useSPFxFluentTheme/useSPFxFluentTheme';

const createThemeVariant = (neutralPrimary: string): IReadonlyTheme => ({
  palette: {
    themePrimary: '#005a9e',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralPrimary,
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
  },
  semanticColors: { bodyBackground: '#ffffff', bodyText: neutralPrimary },
  fonts: { medium: { fontFamily: 'SPFx Test Sans', fontSize: '14px' } },
  isInverted: false,
} as unknown as IReadonlyTheme);

const createThemeProviderMock = (initialTheme: IReadonlyTheme | undefined) => {
  let currentTheme = initialTheme;
  const listeners = new Set<(args: ThemeChangedEventArgs) => void>();

  return {
    tryGetTheme: vi.fn(() => currentTheme),
    themeChangedEvent: {
      add: vi.fn((
        _observer: ISPEventObserver,
        handler: (args: ThemeChangedEventArgs) => void,
      ) => listeners.add(handler)),
      remove: vi.fn((
        _observer: ISPEventObserver,
        handler: (args: ThemeChangedEventArgs) => void,
      ) => listeners.delete(handler)),
    },
    emit(theme: IReadonlyTheme | undefined) {
      currentTheme = theme;
      listeners.forEach((handler) => handler({ theme } as ThemeChangedEventArgs));
    },
  };
};

type ThemeProviderMock = ReturnType<typeof createThemeProviderMock>;

const createContext = (provider: ThemeProviderMock, instanceId: string): BaseComponentContext => ({
  instanceId,
  manifest: { id: `manifest-${instanceId}` },
  serviceScope: { consume: vi.fn(() => provider) },
} as unknown as BaseComponentContext);

const ThemeHarness: React.FC<{
  context: BaseComponentContext;
  onTheme: (theme: Theme) => void;
}> = ({ context, onTheme }) => {
  onTheme(useSPFxFluentTheme(context));
  return null;
};

describe('useSPFxFluentTheme', () => {
  it('reads the initial theme synchronously and refreshes it while subscribing', () => {
    const initialTheme = createThemeVariant('#111111');
    const refreshedTheme = createThemeVariant('#222222');
    const provider = createThemeProviderMock(initialTheme);
    provider.tryGetTheme
      .mockReturnValueOnce(initialTheme)
      .mockReturnValue(refreshedTheme);
    const onTheme = vi.fn();
    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(
        <ThemeHarness context={createContext(provider, 'first')} onTheme={onTheme} />,
        container,
      );
    });

    expect(onTheme.mock.calls[0][0].colorNeutralForeground1).toBe('#111111');
    expect(onTheme.mock.lastCall?.[0].colorNeutralForeground1).toBe('#222222');
    expect(provider.themeChangedEvent.add).toHaveBeenCalledOnce();

    act(() => ReactDOM.unmountComponentAtNode(container));
  });

  it('updates from events and removes the exact observer and callback on unmount', () => {
    const provider = createThemeProviderMock(createThemeVariant('#111111'));
    const onTheme = vi.fn();
    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(
        <ThemeHarness context={createContext(provider, 'events')} onTheme={onTheme} />,
        container,
      );
    });

    const [observer, callback] = provider.themeChangedEvent.add.mock.calls[0];
    act(() => provider.emit(createThemeVariant('#333333')));
    expect(onTheme.mock.lastCall?.[0].colorNeutralForeground1).toBe('#333333');

    act(() => ReactDOM.unmountComponentAtNode(container));
    expect(provider.themeChangedEvent.remove).toHaveBeenCalledWith(observer, callback);
    expect(observer.isDisposed).toBe(true);

    const renderCount = onTheme.mock.calls.length;
    act(() => callback({ theme: createThemeVariant('#444444') } as ThemeChangedEventArgs));
    expect(onTheme).toHaveBeenCalledTimes(renderCount);
  });

  it('unsubscribes from the old context before subscribing to its replacement', () => {
    const firstProvider = createThemeProviderMock(createThemeVariant('#111111'));
    const secondProvider = createThemeProviderMock(createThemeVariant('#555555'));
    const firstContext = createContext(firstProvider, 'first');
    const secondContext = createContext(secondProvider, 'second');
    const onTheme = vi.fn();
    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(<ThemeHarness context={firstContext} onTheme={onTheme} />, container);
      ReactDOM.render(<ThemeHarness context={secondContext} onTheme={onTheme} />, container);
    });

    const [oldObserver, oldCallback] = firstProvider.themeChangedEvent.add.mock.calls[0];
    expect(firstProvider.themeChangedEvent.remove).toHaveBeenCalledWith(oldObserver, oldCallback);
    expect(oldObserver.isDisposed).toBe(true);
    expect(secondProvider.themeChangedEvent.add).toHaveBeenCalledOnce();
    expect(onTheme.mock.lastCall?.[0].colorNeutralForeground1).toBe('#555555');

    act(() => ReactDOM.unmountComponentAtNode(container));
  });

  it('does not own Fluent provider or portal boundaries', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/hooks/useSPFxFluentTheme/useSPFxFluentTheme.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/FluentProvider|IdPrefixProvider|mountNode/);
  });
});
