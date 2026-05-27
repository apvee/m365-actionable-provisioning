/**
 * Internal view component for PropertyPaneProvisioningField.
 *
 * @internal
 * @packageDocumentation
 */

import * as React from 'react';

import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Label,
  Spinner,
} from '@fluentui/react-components';
import { Flex } from '@apvee/react-layout-kit';

import type { ProvisioningPlan } from "../../../provisioning/catalogs";
import type { ComplianceReport } from '../../../core/compliance';

import {
  ProvisioningDialog,
  type ProvisioningDialogProps,
  type ProvisioningDialogStrings,
} from '../../components';
import type { TemplateAppliedState } from '../../models';
import { normalizeUrl } from '../../utils/url';
import { useSPFxProvisioningEngine } from '../../hooks/useSPFxProvisioningEngine/useSPFxProvisioningEngine';

import type { PropertyPaneProvisioningFieldStrings, PropertyPaneProvisioningFieldViewProps } from './types';
import { useStyles } from './PropertyPaneProvisioningFieldView.styles';
import { getDialogPlanTemplate, type Mode } from './PropertyPaneProvisioningFieldView.utils';

const AppliedStateBadge: React.FC<{ state?: TemplateAppliedState; strings: PropertyPaneProvisioningFieldStrings }> = ({
  state,
  strings,
}) => {
  const effective: TemplateAppliedState = state ?? 'unknown';

  switch (effective) {
    case 'applied':
      return (
        <Badge size='medium' shape='rounded' appearance="tint" color="success">
          {strings.stateAppliedLabel}
        </Badge>
      );
    case 'notApplied':
      return (
        <Badge size='medium' shape='rounded' appearance="tint" color="danger">
          {strings.stateNotAppliedLabel}
        </Badge>
      );
    case 'unknown':
    default:
      return (
        <Badge size='medium' shape='rounded' appearance="tint" color="subtle">
          {strings.stateUnknownLabel}
        </Badge>
      );
  }
};

function mapComplianceReportToEffectiveState(report: ComplianceReport): TemplateAppliedState {
  if (report.error) return 'unknown';

  // If the desired state is fully satisfied, we can confidently say "applied".
  if (report.overall === 'compliant') return 'applied';

  // Strong evidence for "not applied": all non-compliant items are missing (reason="not_found").
  // Intentionally ignores blocked/unverifiable counts per the property pane semantics.
  const hasNonCompliant = (report.counts.non_compliant ?? 0) > 0;
  if (hasNonCompliant) {
    const items = Object.values(report.byPath);
    const allNonCompliantAreNotFound = items
      .filter((i) => i.outcome === 'non_compliant')
      .every((i) => i.reason === 'not_found');

    if (allNonCompliantAreNotFound) return 'notApplied';
  }

  // "warning" and "non_compliant" do not reliably distinguish between
  // "never applied" and "applied but drifted". Use unknown.
  return 'unknown';
}

export const PropertyPaneProvisioningFieldView: React.FC<PropertyPaneProvisioningFieldViewProps> = (props) => {
  const styles = useStyles();

  const rawTargetSiteUrl = props.targetSiteUrl;
  const targetSiteUrl = normalizeUrl(rawTargetSiteUrl);

  // Headless engine instance used for auto-compliance checks.
  const { checkCompliance } = useSPFxProvisioningEngine({
    context: props.context,
    targetSiteUrl,
    planTemplate: props.provisioningActionPlan,
    logger: props.logger,
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('provision');
  const [isCheckingEffectiveState, setIsCheckingEffectiveState] = React.useState(false);

  // When this custom field calls the SPFx `changeCallback`, SPFx may re-render (or re-mount)
  // the property pane, which would close the dialog. To keep the dialog open, we buffer
  // property updates while the dialog is open and flush them when the dialog closes.
  const dialogOpenRef = React.useRef(false);
  React.useEffect(() => {
    dialogOpenRef.current = dialogOpen;
  }, [dialogOpen]);

  const onAppliedStateChangeRef = React.useRef(props.onEffectiveStateChange);
  React.useEffect(() => {
    onAppliedStateChangeRef.current = props.onEffectiveStateChange;
  }, [props.onEffectiveStateChange]);

  const pendingAppliedStateRef = React.useRef<TemplateAppliedState | undefined>(undefined);

  const flushPendingPropertyUpdates = React.useCallback((): void => {
    if (pendingAppliedStateRef.current !== undefined) {
      onAppliedStateChangeRef.current(pendingAppliedStateRef.current);
      pendingAppliedStateRef.current = undefined;
    }
  }, []);

  const persistAppliedState = React.useCallback((next: TemplateAppliedState): void => {
    if (dialogOpenRef.current) {
      pendingAppliedStateRef.current = next;
      return;
    }
    onAppliedStateChangeRef.current(next);
  }, []);

  const effectiveState = props.getEffectiveState();
  const effectiveStateRef = React.useRef(effectiveState);
  React.useEffect(() => {
    effectiveStateRef.current = effectiveState;
  }, [effectiveState]);
  const canDeprovision =
    Boolean(props.deprovisioningActionPlan) &&
    Boolean(targetSiteUrl) &&
    effectiveState === 'applied';

  const canCheck =
    props.enableComplianceCheck === true &&
    Boolean(targetSiteUrl) &&
    effectiveState !== 'notApplied';

  // Auto-validate the effective state via compliance check when the control mounts
  // or when the target site URL changes.
  const checkRunIdRef = React.useRef(0);
  const lastAutoCheckTargetKeyRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (!props.enableComplianceCheck) return;

    // If the user is typing/editing a target URL and it is not yet valid, don't run checks.
    // This avoids running against the "current site" by accident and flipping state unexpectedly.
    if (rawTargetSiteUrl !== undefined && !targetSiteUrl) {
      setIsCheckingEffectiveState(false);
      return;
    }

    const targetKey = rawTargetSiteUrl === undefined ? '__CURRENT_SITE__' : targetSiteUrl;
    if (targetKey && lastAutoCheckTargetKeyRef.current === targetKey) return;
    lastAutoCheckTargetKeyRef.current = targetKey;

    const runId = ++checkRunIdRef.current;
    let disposed = false;

    setIsCheckingEffectiveState(true);

    (async () => {
      try {
        const report = await checkCompliance();
        if (disposed) return;
        if (runId !== checkRunIdRef.current) return;

        const next = mapComplianceReportToEffectiveState(report);
        if (next !== effectiveStateRef.current) persistAppliedState(next);
      } catch {
        if (disposed) return;
        if (runId !== checkRunIdRef.current) return;

        if (effectiveStateRef.current !== 'unknown') persistAppliedState('unknown');
      } finally {
        const shouldFinalize = !disposed && runId === checkRunIdRef.current;
        if (shouldFinalize) setIsCheckingEffectiveState(false);
      }
    })().catch(() => undefined);

    return () => {
      disposed = true;
    };
  }, [checkCompliance, persistAppliedState, props.enableComplianceCheck, rawTargetSiteUrl, targetSiteUrl]);

  const openProvisionDialog = (): void => {
    setMode('provision');
    setDialogOpen(true);
  };

  const openDeprovisionDialog = (): void => {
    setMode('deprovision');
    setDialogOpen(true);
  };

  const openComplianceDialog = (): void => {
    setMode('compliance');
    setDialogOpen(true);
  };

  const dialogTitle = mode === 'deprovision'
    ? props.strings.deprovisioningDialogTitle
    : props.strings.provisioningDialogTitle;
  const dialogDescription = mode === 'deprovision'
    ? props.strings.deprovisioningDialogDescription
    : props.strings.provisioningDialogDescription;

  const dialogStrings: Partial<ProvisioningDialogStrings> | undefined =
    mode === 'deprovision' ? props.strings.deprovisioningDialogStrings : props.strings.provisioningDialogStrings;

  const effectiveDialogStrings: Partial<ProvisioningDialogStrings> | undefined = React.useMemo(() => {
    const defaultProvisioningHelp =
      mode === 'provision'
        ? 'Use Run to apply the template to the target site. You can monitor progress and review logs as actions execute.'
        : 'Use Run to remove the template from the target site (deprovision). You can monitor progress and review logs as actions execute.';

    const defaultComplianceHelp =
      'Use Check to preview compliance issues before applying changes.';

    return {
      ...dialogStrings,
      initialHelpProvisioningText: dialogStrings?.initialHelpProvisioningText ?? defaultProvisioningHelp,
      initialHelpComplianceText: dialogStrings?.initialHelpComplianceText ?? defaultComplianceHelp,
    };
  }, [dialogStrings, mode]);

  const dialogPlanTemplate: ProvisioningPlan = getDialogPlanTemplate(mode, {
    provisioningActionPlan: props.provisioningActionPlan,
    deprovisioningActionPlan: props.deprovisioningActionPlan,
  });

  const handleProvisioningCompleted: ProvisioningDialogProps['onProvisioningCompleted'] = (ev) => {
    const next: TemplateAppliedState =
      ev.outcome === 'succeeded'
        ? (mode === 'deprovision' ? 'notApplied' : 'applied')
        : 'unknown';
    persistAppliedState(next);
  };

  const handleDialogClose = (): void => {
    // Close first, then flush pending updates.
    // If SPFx re-renders because of the flush, the dialog is already closed.
    setDialogOpen(false);
    flushPendingPropertyUpdates();
  };

  const card = (
    <Card
      appearance={props.appearance}
      size="small"
    >
      <CardHeader
        image={
          <Flex direction="row" align="center" gap="sm">
            <AppliedStateBadge state={effectiveState} strings={props.strings} />
            {props.enableComplianceCheck && isCheckingEffectiveState ? <Spinner size="extra-tiny" /> : null}
          </Flex>
        }
      />
      <Flex direction="row" align="center" gap="sm" wrap="wrap">
        <Button appearance="primary" size="small" onClick={openProvisionDialog} disabled={!targetSiteUrl}>
          {props.strings.provisionLabel}
        </Button>
        {canCheck ? (
          <Button appearance="secondary" size="small" onClick={openComplianceDialog} disabled={!targetSiteUrl}>
            {props.strings.checkLabel}
          </Button>
        ) : null}
        {canDeprovision ? (
          <Button appearance="secondary" size="small" onClick={openDeprovisionDialog} disabled={!targetSiteUrl}>
            {props.strings.deprovisionLabel}
          </Button>
        ) : null}
      </Flex>

      <ProvisioningDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onProvisioningCompleted={handleProvisioningCompleted}
        context={props.context}
        planTemplate={dialogPlanTemplate}
        logger={props.logger}
        title={dialogTitle}
        description={dialogDescription}
        targetSiteUrl={targetSiteUrl}
        mode={mode === 'compliance' ? 'compliance' : 'provisioning'}
        enableComplianceCheck={false}
        complianceAutoRunOnOpen={mode === 'compliance' ? true : (mode !== 'deprovision' && props.complianceAutoRunOnOpen)}
        confirmRun={mode === 'deprovision' && props.confirmDeprovisionRun}
        strings={effectiveDialogStrings}
      />
    </Card>
  );

  if (props.label) {
    return (
      <Field className={styles.field} label={<Label weight="regular">{props.label}</Label>}>
        {card}
      </Field>
    );
  }

  return card;
};
