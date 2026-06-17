/**
 * Specification for a single KPI badge.
 */
export type KpiBadgeSpec = Readonly<{
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
 * Props for the KpiSummaryBar component.
 * Renders status badge and metric badges in a horizontal card layout.
 */
export type KpiSummaryBarProps = Readonly<{
    /** Primary status badge (e.g., "Running", "Succeeded", "Failed") */
    statusBadge?: KpiBadgeSpec;
    /** Array of metric badges (e.g., success/fail counts) */
    metricBadges?: ReadonlyArray<KpiBadgeSpec>;
    /** Optional additional CSS class */
    className?: string;
}>;
