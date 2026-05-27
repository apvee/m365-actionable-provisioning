/**
 * PropertyPaneProvisioningField - SPFx property pane field for provisioning controls.
 * 
 * @packageDocumentation
 */

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

import { consoleSink, createLogger, type Logger } from '../../../core/logger';

import type { TemplateAppliedState } from '../../models';

import { PropertyPaneProvisioningFieldView } from './PropertyPaneProvisioningFieldView';
import type { PropertyPaneProvisioningFieldProps, PropertyPaneProvisioningFieldStrings } from './types';
import { createPropertyPaneThemeController } from '../shared/PropertyPaneTheme';

import * as locStrings from 'SPFxProvisioningUIStrings';

const DEFAULT_STRINGS: PropertyPaneProvisioningFieldStrings = {
  defaultLabel: locStrings.PropertyPaneProvisioningField.DefaultLabel,
  provisionLabel: locStrings.PropertyPaneProvisioningField.ProvisionLabel,
  deprovisionLabel: locStrings.PropertyPaneProvisioningField.DeprovisionLabel,
  checkLabel: locStrings.PropertyPaneProvisioningField.CheckLabel,

  stateAppliedLabel: locStrings.PropertyPaneProvisioningField.StateAppliedLabel,
  stateNotAppliedLabel: locStrings.PropertyPaneProvisioningField.StateNotAppliedLabel,
  stateUnknownLabel: locStrings.PropertyPaneProvisioningField.StateUnknownLabel,

  provisioningDialogTitle: locStrings.PropertyPaneProvisioningField.ProvisioningDialogTitle,
  provisioningDialogDescription: locStrings.PropertyPaneProvisioningField.ProvisioningDialogDescription,

  deprovisioningDialogTitle: locStrings.PropertyPaneProvisioningField.DeprovisioningDialogTitle,
  deprovisioningDialogDescription: locStrings.PropertyPaneProvisioningField.DeprovisioningDialogDescription,

  // Defaults used only when deprovision confirmation is enabled.
  // Kept here (instead of global ProvisioningDialog defaults) to be specific to the deprovision flow.
  deprovisioningDialogStrings: {
    confirmRunTitle: locStrings.PropertyPaneProvisioningField.DeprovisionConfirmRunTitle,
    confirmRunMessage: locStrings.PropertyPaneProvisioningField.DeprovisionConfirmRunMessage,
    confirmDialogStrings: {
      confirmLabel: locStrings.PropertyPaneProvisioningField.DeprovisionConfirmLabel,
      cancelLabel: locStrings.PropertyPaneProvisioningField.DeprovisionCancelLabel,
    },
  },
};

interface PropertyPaneProvisioningFieldInternalProps extends PropertyPaneProvisioningFieldProps {
  key: string;
  onRender: (
    elem: HTMLElement,
    context?: unknown,
    changeCallback?: (targetProperty?: string, newValue?: unknown) => void
  ) => void;
  onDispose: (elem: HTMLElement) => void;
}

export function PropertyPaneProvisioningField(
  targetProperty: string,
  props: PropertyPaneProvisioningFieldProps
): IPropertyPaneField<PropertyPaneProvisioningFieldInternalProps> {
  let changeCallbackRef: ((targetProperty?: string, newValue?: unknown) => void) | undefined;
  let currentValue: TemplateAppliedState | undefined = props.effectiveState ?? props.value;
  let lastElem: HTMLElement | undefined;

  const themeController = createPropertyPaneThemeController(props.context, () => {
    if (lastElem) {
      renderTo(lastElem);
    }
  });

  const getEffectiveValue = (): TemplateAppliedState | undefined => currentValue;

  const getLogger = (): Logger =>
    props.logger ??
    createLogger({
      level: 'silent',
      sink: consoleSink,
      scope: { component: 'PropertyPaneProvisioningField' },
    });

  const handleEffectiveStateChange = (next: TemplateAppliedState): void => {
    currentValue = next;
    changeCallbackRef?.(targetProperty, next);
  };

  function renderTo(elem: HTMLElement): void {
    const v9Theme = themeController.getFluentV9Theme();
    const idPrefix = `pnpjs-provisioning-pp-${targetProperty}-`;

    const enableComplianceCheck = props.enableComplianceCheck ?? true;
    const complianceAutoRunOnOpen = props.complianceAutoRunOnOpen ?? true;
    const confirmDeprovisionRun = props.confirmDeprovisionRun ?? false;
    const appearance = props.appearance ?? 'filled';

    const s: PropertyPaneProvisioningFieldStrings = {
      ...DEFAULT_STRINGS,
      ...(props.strings ?? {}),
    };

    // Use explicit label or fall back to localized default
    const effectiveLabel = props.label ?? s.defaultLabel;

    const inner = React.createElement(PropertyPaneProvisioningFieldView, {
      targetProperty,
      context: props.context,
      logger: getLogger(),
      label: effectiveLabel,
      targetSiteUrl: props.targetSiteUrl,
      getEffectiveState: getEffectiveValue,
      provisioningActionPlan: props.provisioningActionPlan,
      deprovisioningActionPlan: props.deprovisioningActionPlan,
      enableComplianceCheck,
      complianceAutoRunOnOpen,
      confirmDeprovisionRun,
      strings: s,
      appearance,
      onEffectiveStateChange: handleEffectiveStateChange,
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
      onRender: (
        elem: HTMLElement,
        _ctx?: unknown,
        changeCallback?: (targetProperty?: string, newValue?: unknown) => void
      ): void => {
        changeCallbackRef = changeCallback;
        lastElem = elem;

        themeController.ensureInitialized();

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
