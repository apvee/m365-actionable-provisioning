import type { WebPartContext } from '@microsoft/sp-webpart-base';

import type { TemplateAppliedState } from '../../../provisioning-ui';

export interface ITestProvisioningProps {
  description: string;

  provisioningSiteUrl?: string;
  lastProvisioningState?: TemplateAppliedState;
  propertyPaneLastProvisioningState?: TemplateAppliedState;

  isEditMode: boolean;
  onLastProvisioningStateChange: (next: TemplateAppliedState) => void;
  onPropertyPaneLastProvisioningStateChange?: (next: TemplateAppliedState) => void;

  context: WebPartContext;
}
