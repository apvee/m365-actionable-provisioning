import * as React from 'react';
import { MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';

import type { ProvisioningDialogUiError } from '../ProvisioningDialogSession.state';

export type DialogErrorMessageProps = Readonly<{
    error: ProvisioningDialogUiError | undefined;
}>;

export const DialogErrorMessage: React.FC<DialogErrorMessageProps> = ({ error }): React.ReactElement | null => {
    if (!error) {
        return null;
    }

    return (
        <MessageBar intent="error">
            <MessageBarBody>
                <MessageBarTitle>{error.title}</MessageBarTitle>
                {error.message}
            </MessageBarBody>
        </MessageBar>
    );
};

DialogErrorMessage.displayName = 'DialogErrorMessage';
