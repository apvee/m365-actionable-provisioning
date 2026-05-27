/**
 * PropertyPaneSiteSelectorField - SPFx property pane field for site URL selection.
 * 
 * @packageDocumentation
 */

import {
  type BaseComponentContext,
} from '@microsoft/sp-component-base';
import {
  type IPropertyPaneField,
  PropertyPaneFieldType,
} from '@microsoft/sp-property-pane';
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  FluentProvider,
  IdPrefixProvider,
} from '@fluentui/react-components';

import {
  PropertyPaneSiteSelectorFieldView,
} from './PropertyPaneSiteSelectorFieldView';
import type {
  SiteSelectorFieldStrings,
} from './PropertyPaneSiteSelectorFieldView.types';

import { normalizeUrl } from '../../utils/url';
import { createPropertyPaneThemeController } from '../shared/PropertyPaneTheme';

export type PropertyPaneSiteSelectorFieldProps = Readonly<{
  /** Field label. */
  label: string;

  /** SPFx context used by the underlying PnPjs instance and page context. */
  context: BaseComponentContext;

  /**
   * Selected site URL.
    * - `undefined` (or empty) is treated as "current site"
   */
  value?: string;

  /** Optional callback invoked when selection changes. */
  onChange?: (siteUrl?: string) => void;

  /** Card appearance style. */
  appearance?: "subtle" | "filled" | "outline" | "filled-alternative";

  /** Disable all controls. */
  disabled?: boolean;

  /** Optional localized strings overrides. */
  strings?: Partial<SiteSelectorFieldStrings>;
}>;

interface PropertyPaneSiteSelectorFieldInternalProps extends PropertyPaneSiteSelectorFieldProps {
  key: string;
  onRender: (
    elem: HTMLElement,
    context?: unknown,
    changeCallback?: (targetProperty?: string, newValue?: unknown) => void
  ) => void;
  onDispose: (elem: HTMLElement) => void;
}

export function PropertyPaneSiteSelectorField(
  targetProperty: string,
  props: PropertyPaneSiteSelectorFieldProps
): IPropertyPaneField<PropertyPaneSiteSelectorFieldInternalProps> {
  let changeCallbackRef: ((targetProperty?: string, newValue?: unknown) => void) | undefined;
  let currentValue: string | undefined = props.value;
  let didAutoPersistDefault = false;
  let lastElem: HTMLElement | undefined;

  const themeController = createPropertyPaneThemeController(props.context, () => {
    if (lastElem) {
      renderTo(lastElem);
    }
  });

  const getCurrentWebUrl = (): string | undefined => {
    return normalizeUrl(props.context.pageContext.web.absoluteUrl);
  };

  const getEffectiveValue = (): string | undefined => {
    return normalizeUrl(currentValue) ?? getCurrentWebUrl();
  };

  const handleChange = (siteUrl?: string): void => {
    const effective = normalizeUrl(siteUrl) ?? getCurrentWebUrl();

    currentValue = effective;
    props.onChange?.(effective);
    changeCallbackRef?.(targetProperty, effective);
  };

  function renderTo(elem: HTMLElement): void {
    const v9Theme = themeController.getFluentV9Theme();
    const idPrefix = `pnpjs-provisioning-pp-${targetProperty}-`;

    const inner = React.createElement(PropertyPaneSiteSelectorFieldView, {
      label: props.label,
      context: props.context,
      value: getEffectiveValue(),
      onChange: handleChange,
      appearance: props.appearance,
      disabled: props.disabled,
      strings: props.strings,
    });

    const wrapped = React.createElement(
      IdPrefixProvider,
      { value: idPrefix },
      React.createElement(FluentProvider, { theme: v9Theme }, inner)
    );

    ReactDom.render(wrapped, elem);
  }

  return {
    type: PropertyPaneFieldType.Custom,
    targetProperty,
    properties: {
      key: targetProperty,
      ...props,
      onRender: (elem: HTMLElement, _ctx?: unknown, changeCallback?: (targetProperty?: string, newValue?: unknown) => void): void => {
        changeCallbackRef = changeCallback;

        lastElem = elem;

        themeController.ensureInitialized();

        // Auto-persist the default selection ("current site") on first render
        // when the bound property is empty. This keeps the stored value aligned
        // with the UI default without requiring a user click.
        if (!didAutoPersistDefault && !props.disabled) {
          const isEmpty = currentValue === undefined || currentValue === null || String(currentValue).trim() === '';
          if (isEmpty) {
            didAutoPersistDefault = true;
            handleChange(undefined);
          }
        }

        renderTo(elem);
      },
      onDispose: (elem: HTMLElement): void => {
        themeController.dispose();
        ReactDom.unmountComponentAtNode(elem);
        changeCallbackRef = undefined;
        lastElem = undefined;
      },
    },
  };
}
