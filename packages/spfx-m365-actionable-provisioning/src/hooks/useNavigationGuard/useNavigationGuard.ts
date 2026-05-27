import * as React from 'react';

/**
 * Hook that prevents accidental page navigation during active operations.
 *
 * When active, registers a `beforeunload` event listener that triggers
 * the browser's native "Leave site?" confirmation dialog. This protects
 * users from accidentally closing, refreshing, or navigating away from
 * the page while a provisioning or compliance operation is in progress.
 *
 * @remarks
 * - Modern browsers (Chrome 51+, Firefox 44+, Safari 9+) ignore custom
 *   `returnValue` text and show a generic message for security reasons.
 * - The listener is automatically removed when `isActive` becomes false
 *   or when the component using this hook unmounts.
 * - Zero overhead when inactive - no event listener is registered.
 *
 * @param isActive - Whether the guard should be active (blocking navigation).
 *   Typically derived from operation state: `runInFlight || complianceIsChecking`
 *
 * @example
 * ```tsx
 * // In ProvisioningDialog component
 * const isOperationActive = state.runInFlight || state.complianceIsChecking;
 * useNavigationGuard(isOperationActive);
 * ```
 *
 * @public
 */
export const useNavigationGuard = (isActive: boolean): void => {
    React.useEffect(() => {
        if (!isActive) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent): string => {
            event.preventDefault();
            event.returnValue = ''; // Required for Chrome compatibility
            return ''; // Legacy browser support
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isActive]);
};
