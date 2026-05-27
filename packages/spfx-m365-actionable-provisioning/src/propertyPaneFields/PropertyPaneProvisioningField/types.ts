/**
 * Type definitions for PropertyPaneProvisioningField.
 *
 * @packageDocumentation
 */

import type { BaseComponentContext } from '@microsoft/sp-component-base';

import type { ProvisioningPlan } from "../../../provisioning/catalogs";
import type { Logger } from '../../../core/logger';
import type { ProvisioningDialogStrings } from '../../components';
import type { TemplateAppliedState } from '../../models';

/**
 * Configuration options for PropertyPaneProvisioningField.
 * @public
 */
export type PropertyPaneProvisioningFieldProps = Readonly<{
  /** SPFx context used by the underlying PnPjs instance and page context. */
  context: BaseComponentContext;

  /** Label rendered by the custom field. */
  label?: string;

  /** Action plan to provision the template. */
  provisioningActionPlan: ProvisioningPlan;
  /** Optional action plan to deprovision the template. */
  deprovisioningActionPlan?: ProvisioningPlan;

  /** Target site URL (undefined means current site). */
  targetSiteUrl?: string;

  /**
   * Effective template state for the current target site.
   *
   * @remarks
   * In the property pane this value is treated as the "effective" state of the target site
   * (and may be synchronized from compliance checks).
   */
  effectiveState?: TemplateAppliedState;

  /**
   * Template applied-state value.
   * @deprecated Use `effectiveState`.
   */
  value?: TemplateAppliedState;

  /** Enables the "Check compliance" button inside ProvisioningDialog (defaults to true). */
  enableComplianceCheck?: boolean;
  /** If true, compliance mode runs automatically when opened from ProvisioningDialog (defaults to true). */
  complianceAutoRunOnOpen?: boolean;

  /** If true, deprovision run requires confirmation (defaults to false). */
  confirmDeprovisionRun?: boolean;

  /** Optional logger (defaults to silent console logger). */
  logger?: Logger;

  /** Optional localized strings overrides for this property pane field. */
  strings?: Partial<PropertyPaneProvisioningFieldStrings>;

  /** Card appearance style. */
  appearance?: "subtle" | "filled" | "outline" | "filled-alternative";
}>;

/**
 * Localized strings for the provisioning field.
 * @public
 */
export type PropertyPaneProvisioningFieldStrings = Readonly<{
  /** Default label for the field when no label is provided */
  defaultLabel: string;

  provisionLabel: string;
  deprovisionLabel: string;
  checkLabel: string;

  stateAppliedLabel: string;
  stateNotAppliedLabel: string;
  stateUnknownLabel: string;

  provisioningDialogTitle: string;
  provisioningDialogDescription: string;
  provisioningDialogStrings?: Partial<ProvisioningDialogStrings>;

  deprovisioningDialogTitle: string;
  deprovisioningDialogDescription: string;
  deprovisioningDialogStrings?: Partial<ProvisioningDialogStrings>;
}>;

/**
 * View props for internal provisioning field component.
 * @internal
 */
export type PropertyPaneProvisioningFieldViewProps = Readonly<{
  targetProperty: string;
  context: BaseComponentContext;
  logger: Logger;

  label?: string;

  targetSiteUrl?: string;
  getEffectiveState: () => TemplateAppliedState | undefined;

  provisioningActionPlan: ProvisioningPlan;
  deprovisioningActionPlan?: ProvisioningPlan;

  enableComplianceCheck: boolean;
  complianceAutoRunOnOpen: boolean;

  confirmDeprovisionRun: boolean;

  strings: PropertyPaneProvisioningFieldStrings;

  appearance: "subtle" | "filled" | "outline" | "filled-alternative";

  onEffectiveStateChange: (next: TemplateAppliedState) => void;
}>;

