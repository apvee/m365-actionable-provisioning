import {
  FluentProvider,
  IdPrefixProvider,
} from '@fluentui/react-components';
import type {
  BaseComponentContext,
  IReadonlyTheme,
  ThemeChangedEventArgs,
} from '@microsoft/sp-component-base';
import type { ISPEventObserver } from '@microsoft/sp-core-library';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

const reactDomMocks = vi.hoisted(() => ({
  render: vi.fn(() => null),
  unmountComponentAtNode: vi.fn(() => true),
}));

vi.mock('react-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-dom')>(),
  ...reactDomMocks,
}));

vi.mock('@microsoft/sp-component-base', () => ({
  ThemeProvider: { serviceKey: Symbol('ThemeProvider') },
}));

vi.mock('@microsoft/sp-property-pane', () => ({
  PropertyPaneFieldType: { Custom: 1 },
}));

vi.mock(
  '../../src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningFieldView',
  () => ({ PropertyPaneProvisioningFieldView: () => null }),
);

vi.mock(
  '../../src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorFieldView',
  () => ({ PropertyPaneSiteSelectorFieldView: () => null }),
);

import { PropertyPaneProvisioningField } from '../../src/propertyPaneFields/PropertyPaneProvisioningField/PropertyPaneProvisioningField';
import { PropertyPaneSiteSelectorField } from '../../src/propertyPaneFields/PropertyPaneSiteSelectorField/PropertyPaneSiteSelectorField';

const themeVariant = {
  palette: {
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
  },
  semanticColors: { bodyBackground: '#ffffff', bodyText: '#242424' },
  fonts: { medium: { fontFamily: 'SPFx Property Pane Sans', fontSize: '14px' } },
  isInverted: false,
} as unknown as IReadonlyTheme;

const createContext = () => {
  const add = vi.fn((
    _observer: ISPEventObserver,
    _handler: (args: ThemeChangedEventArgs) => void,
  ) => undefined);
  const remove = vi.fn((
    _observer: ISPEventObserver,
    _handler: (args: ThemeChangedEventArgs) => void,
  ) => undefined);
  const provider = {
    tryGetTheme: vi.fn(() => themeVariant),
    themeChangedEvent: { add, remove },
  };
  const context = {
    instanceId: 'property-pane-instance',
    manifest: { id: 'property-pane-manifest' },
    pageContext: { web: { absoluteUrl: 'https://contoso.sharepoint.com/sites/test' } },
    serviceScope: { consume: vi.fn(() => provider) },
  } as unknown as BaseComponentContext;

  return { add, context, remove };
};

const expectAutonomousFluentRoot = (element: React.ReactElement): void => {
  expect(element.type).toBe(IdPrefixProvider);

  const fluentProvider = React.Children.only(element.props.children) as React.ReactElement;
  expect(fluentProvider.type).toBe(FluentProvider);
  expect(fluentProvider.props.applyStylesToPortals).toBe(true);
  expect(fluentProvider.props.theme.colorNeutralForeground1).toBe('#242424');
  expect(fluentProvider.props.theme.fontFamilyBase).toBe('SPFx Property Pane Sans');
};

describe('property pane Fluent roots', () => {
  it('keeps PropertyPaneProvisioningField themed and disposable', () => {
    const { add, context, remove } = createContext();
    const field = PropertyPaneProvisioningField('provisioningState', {
      context,
      provisioningActionPlan: {} as never,
    });
    const element = document.createElement('div');

    field.properties.onRender(element);

    expectAutonomousFluentRoot(reactDomMocks.render.mock.calls[0][0] as React.ReactElement);
    const [observer, callback] = add.mock.calls[0];

    field.properties.onDispose(element);

    expect(remove).toHaveBeenCalledWith(observer, callback);
    expect(reactDomMocks.unmountComponentAtNode).toHaveBeenCalledWith(element);
  });

  it('keeps PropertyPaneSiteSelectorField themed and disposable', () => {
    const { add, context, remove } = createContext();
    const field = PropertyPaneSiteSelectorField('siteUrl', {
      context,
      label: 'Site',
      value: 'https://contoso.sharepoint.com/sites/test',
    });
    const element = document.createElement('div');

    field.properties.onRender(element);

    expectAutonomousFluentRoot(reactDomMocks.render.mock.calls[0][0] as React.ReactElement);
    const [observer, callback] = add.mock.calls[0];

    field.properties.onDispose(element);

    expect(remove).toHaveBeenCalledWith(observer, callback);
    expect(reactDomMocks.unmountComponentAtNode).toHaveBeenCalledWith(element);
  });
});
