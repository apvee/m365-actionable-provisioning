import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import TestProvisioning from './components/TestProvisioning';
import { ITestProvisioningProps } from './components/ITestProvisioningProps';
import { PropertyPaneProvisioningField, PropertyPaneSiteSelectorField } from '../../provisioning-ui/propertyPaneFields';
import type { TemplateAppliedState } from '../../provisioning-ui';
import { deprovisioningPlan, provisioningPlan } from './test-plans/demo-plans';

export interface ITestProvisioningWebPartProps {
  description: string;

  provisioningSiteUrl?: string;
  /** Persisted outcome of the last provisioning run (provisioning-only semantics). */
  lastProvisioningState?: TemplateAppliedState;
  /** Persisted outcome of the last provisioning run from the property pane field. */
  propertyPaneLastProvisioningState?: TemplateAppliedState;

  // Backward-compatibility (old property names).
  templateAppliedState?: TemplateAppliedState;
  propertyPaneTemplateAppliedState?: TemplateAppliedState;
}

export default class TestProvisioningWebPart extends BaseClientSideWebPart<ITestProvisioningWebPartProps> {

  private ensurePropertiesMigrated(): void {
    if (this.properties.lastProvisioningState === undefined && this.properties.templateAppliedState !== undefined) {
      this.properties.lastProvisioningState = this.properties.templateAppliedState;
    }

    if (
      this.properties.propertyPaneLastProvisioningState === undefined &&
      this.properties.propertyPaneTemplateAppliedState !== undefined
    ) {
      this.properties.propertyPaneLastProvisioningState = this.properties.propertyPaneTemplateAppliedState;
    }
  }

  public render(): void {
    this.ensurePropertiesMigrated();

    const element: React.ReactElement<ITestProvisioningProps> = React.createElement(
      TestProvisioning,
      {
        description: this.properties.description,
        provisioningSiteUrl: this.properties.provisioningSiteUrl,
        lastProvisioningState: this.properties.lastProvisioningState,
        propertyPaneLastProvisioningState: this.properties.propertyPaneLastProvisioningState,
        isEditMode: this.displayMode === DisplayMode.Edit,
        onLastProvisioningStateChange: (next) => {
          this.properties.lastProvisioningState = next;
          this.render();
        },
        onPropertyPaneLastProvisioningStateChange: (next) => {
          this.properties.propertyPaneLastProvisioningState = next;
          this.render();
        },
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected override onInit(): Promise<void> {
    this.ensurePropertiesMigrated();
    return Promise.resolve();
  }

  protected override onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }
  }

  protected override onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected override get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected override getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Settings for the Test Provisioning Web Part"
          },
          groups: [
            {
              groupName: "Settings",
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "Description"
                })
              ]
            },
            {
              groupName: "Provisioning",
              groupFields: [
                PropertyPaneSiteSelectorField('provisioningSiteUrl', {
                  label: "Provisioning Site URL",
                  context: this.context,
                  value: this.properties.provisioningSiteUrl,
                  appearance: 'filled'
                }),
                PropertyPaneProvisioningField('propertyPaneLastProvisioningState', {
                  context: this.context,
                  label: "Template Applied State",
                  provisioningActionPlan: provisioningPlan,
                  deprovisioningActionPlan: deprovisioningPlan,
                  targetSiteUrl: this.properties.provisioningSiteUrl,
                  value: this.properties.propertyPaneLastProvisioningState,
                  appearance: 'filled',
                  confirmDeprovisionRun: true
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
