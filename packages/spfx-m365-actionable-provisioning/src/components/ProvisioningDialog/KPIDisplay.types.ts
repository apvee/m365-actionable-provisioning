/**
 * Specification for a single KPI badge.
 */
export type KPIBadgeSpec = Readonly<{
    /** Unique key for React rendering */
    key: string;
    /** Badge display text */
    text: string;
    /** Badge color theme */
    color: 'success' | 'danger' | 'warning' | 'brand' | 'subtle';
    /** Badge appearance style */
    appearance: 'filled' | 'tint';
}>;

/**
 * Props for the KPIDisplay component.
 * Renders status badge and metric badges in a horizontal card layout.
 */
export type KPIDisplayProps = Readonly<{
    /** Primary status badge (e.g., "Running", "Succeeded", "Failed") */
    statusBadge?: KPIBadgeSpec;
    /** Array of metric badges (e.g., success/fail counts) */
    metricBadges?: ReadonlyArray<KPIBadgeSpec>;
    /** Optional additional CSS class */
    className?: string;
}>;
