import * as React from 'react';

type ErrorBoundaryProps = Readonly<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
}>;

type ErrorBoundaryState = Readonly<{
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
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: undefined };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log error for debugging - uses console as Logger may not be available here
        console.error('ErrorBoundary caught error:', error, errorInfo);
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
                    <strong>Something went wrong</strong>
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
