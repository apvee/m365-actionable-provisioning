import * as React from 'react';
import type { Logger } from '@apvee/m365-actionable-provisioning';

type ProvisioningDialogErrorBoundaryProps = Readonly<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    fallbackTitle: string;
    logger?: Logger;
}>;

type ProvisioningDialogErrorBoundaryState = Readonly<{
    hasError: boolean;
    error: Error | undefined;
}>;

/**
 * Error boundary component that catches rendering errors in children
 * and displays a fallback UI.
 *
 * Note: Error boundaries must be class components per React requirements.
 * This is the only class component in the refactored architecture.
 */
export class ProvisioningDialogErrorBoundary extends React.Component<ProvisioningDialogErrorBoundaryProps, ProvisioningDialogErrorBoundaryState> {
    constructor(props: ProvisioningDialogErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: undefined };
    }

    static getDerivedStateFromError(error: Error): ProvisioningDialogErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.props.logger?.error('Provisioning dialog render failed', {
            error,
            data: { componentStack: errorInfo.componentStack },
        });
    }

    override render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback !== undefined) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div
                    style={{
                        padding: '16px',
                        backgroundColor: 'var(--colorNeutralBackground3)',
                        borderRadius: '4px',
                        color: 'var(--colorNeutralForeground1)',
                    }}
                >
                    <strong>{this.props.fallbackTitle}</strong>
                    {this.state.error?.message && (
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--colorNeutralForeground2)' }}>
                            {this.state.error.message}
                        </p>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
