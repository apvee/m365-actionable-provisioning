import * as React from 'react';
import { Button, Card, CardHeader, FluentProvider, IdPrefixProvider, Text, Title3, makeStyles, tokens, webLightTheme } from '@fluentui/react-components';

import type { ITestProvisioningProps } from './ITestProvisioningProps';

import { createLogger, consoleSink } from '../../../core/logger';
import { ProvisioningDialog } from '../../../provisioning-ui';
import type { ProvisioningCompletedEvent } from '../../../provisioning-ui/components';
import examplePlan from '../test-plans/complete-plan';

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

  const handleProvisioningCompleted = React.useCallback(
    (ev: ProvisioningCompletedEvent) => {
      props.onLastProvisioningStateChange(ev.outcome === 'succeeded' ? 'applied' : 'unknown');
    },
    [props]
  );

  return (
    <IdPrefixProvider value="pnpjs-provisioning-">
      <FluentProvider theme={webLightTheme}>
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
              planTemplate={examplePlan}
              logger={logger}
              targetSiteUrl={props.provisioningSiteUrl}
              enableComplianceCheck={true}
            />

            <ProvisioningDialog
              open={complianceOpen}
              onClose={() => setComplianceOpen(false)}
              context={props.context}
              planTemplate={examplePlan}
              logger={logger}
              mode="compliance"
              complianceAutoRunOnOpen={true}
              targetSiteUrl={props.provisioningSiteUrl}
            />
          </div>
        </Card>
      </FluentProvider>
    </IdPrefixProvider>
  );
};

export default TestProvisioning;
