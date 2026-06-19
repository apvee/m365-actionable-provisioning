import * as React from 'react';
import { Button, Card, CardHeader, Text, Title3, makeStyles, tokens } from '@fluentui/react-components';

import type { ITestProvisioningProps } from './ITestProvisioningProps';

import { createLogger, consoleSink, type M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';
import { ProvisioningDialog, SPFxFluentProvider } from '@apvee/spfx-m365-actionable-provisioning';
import type { ProvisioningCompletedEvent } from '@apvee/spfx-m365-actionable-provisioning';
import { createExamplePlan } from '../test-plans/complete-plan';

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
});

const TestProvisioning: React.FC<ITestProvisioningProps> = (props) => {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [complianceOpen, setComplianceOpen] = React.useState(false);

  const logger = React.useMemo(() => {
    return createLogger({ level: 'debug', sink: consoleSink });
  }, []);

  const planTemplate = React.useMemo<M365ProvisioningPlan>(() => {
    const currentUserLoginName = props.context.pageContext.user.loginName || props.context.pageContext.user.email;

    return createExamplePlan(currentUserLoginName);
  }, [props.context.pageContext.user.email, props.context.pageContext.user.loginName]);

  const handleProvisioningCompleted = React.useCallback(
    (ev: ProvisioningCompletedEvent) => {
      props.onLastProvisioningStateChange(ev.outcome === 'succeeded' ? 'applied' : 'unknown');
    },
    [props]
  );

  return (
    <SPFxFluentProvider context={props.context} idPrefix="pnpjs-provisioning-">
      <Card>
        <CardHeader
          header={<Title3>SharePoint Provisioning</Title3>}
          description={props.description}
        />

        <div className={styles.stack}>
          <Text>
            <b>provisioningSiteUrl:</b> {props.provisioningSiteUrl || '-'}
            <br />
            <b>lastProvisioningResult:</b> {props.lastProvisioningState || '-'}
            <br />
            <b>propertyPaneLastProvisioningResult:</b> {props.propertyPaneLastProvisioningState || '-'}
          </Text>
          <Button
            appearance="primary"
            onClick={() => setOpen(true)}
            disabled={!props.isEditMode}
          >
            Open Provisioning Dialog
          </Button>
          <Button
            appearance="secondary"
            onClick={() => setComplianceOpen(true)}
            disabled={!props.isEditMode || !props.provisioningSiteUrl}
          >
            Open Compliance Dialog
          </Button>

          <ProvisioningDialog
            open={open}
            onClose={() => setOpen(false)}
            onProvisioningCompleted={handleProvisioningCompleted}
            context={props.context}
            planTemplate={planTemplate}
            logger={logger}
            targetSiteUrl={props.provisioningSiteUrl}
            enableComplianceCheck={true}
          />

          <ProvisioningDialog
            open={complianceOpen}
            onClose={() => setComplianceOpen(false)}
            context={props.context}
            planTemplate={planTemplate}
            logger={logger}
            initialMode="compliance"
            complianceAutoRunOnOpen={true}
            targetSiteUrl={props.provisioningSiteUrl}
          />
        </div>
      </Card>
    </SPFxFluentProvider>
  );
};

export default TestProvisioning;
