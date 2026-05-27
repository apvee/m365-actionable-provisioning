/**
 * Compliance (drift) checking types.
 *
 * @remarks
 * Compliance checks are read-only evaluations of whether the desired state implied by
 * a provisioning plan is currently satisfied.
 *
 * @packageDocumentation
 */

import type { ActionPath } from "./trace";

/**
 * The outcome of a compliance check for a single action.
 *
 * @remarks
 * - `compliant`: The current state matches the desired state
 * - `non_compliant`: The current state differs from the desired state
 * - `unverifiable`: Unable to determine compliance (e.g., missing API support)
 * - `ignored`: Action was explicitly ignored per policy
 *
 * @public
 */
export type ComplianceOutcome = "compliant" | "non_compliant" | "unverifiable" | "ignored";

/**
 * The overall compliance status for a plan.
 *
 * @remarks
 * - `compliant`: All checked actions are compliant
 * - `warning`: Some actions are unverifiable (per policy)
 * - `non_compliant`: At least one action is non-compliant
 *
 * @public
 */
export type ComplianceOverall = "compliant" | "warning" | "non_compliant";

/**
 * Policy settings for compliance evaluation.
 *
 * @public
 */
export type CompliancePolicy = Readonly<{
    /**
     * How to treat actions whose compliance cannot be verified.
     *
     * - "warning": report overall as "warning" if any action is unverifiable (default)
     * - "ignore": unverifiable actions do not affect overall
     */
    treatUnverifiableAs?: "warning" | "ignore";
}>;

/**
 * Compliance result for a single action.
 *
 * @public
 */
export type ComplianceItem = Readonly<{
    /** The action path */
    path: ActionPath;

    /** The action verb */
    verb: string;

    /**
     * True if the action itself was evaluated.
     * False means it was not evaluated (typically blocked by a non-compliant ancestor).
     */
    checked: boolean;

    /** If checked=false, the first ancestor path that blocked evaluation. */
    blockedBy?: ActionPath;

    /** Set only when checked=true. */
    outcome?: ComplianceOutcome;

    /** Optional resource identifier (e.g., listName, siteUrl, fieldName). */
    resource?: string;

    /** Optional structured reason (machine-oriented). */
    reason?: string;

    /** Optional human-oriented message. */
    message?: string;

    /** Optional structured details. */
    details?: unknown;
}>;

/**
 * Complete compliance report for a provisioning plan.
 *
 * @public
 */
export type ComplianceReport = Readonly<{
    /** ISO 8601 timestamp when the report was generated */
    checkedAt: string;

    /** Total number of actions in the plan */
    total: number;

    /** Number of actions that were checked */
    checked: number;

    /** Number of actions blocked by non-compliant ancestors */
    blocked: number;

    /** Count of actions by outcome */
    counts: Record<ComplianceOutcome, number>;

    /** Overall compliance status */
    overall: ComplianceOverall;

    /** Compliance results indexed by action path */
    byPath: Record<ActionPath, ComplianceItem>;

    /** Optional top-level error if the report could not be fully produced. */
    error?: { message: string; details?: unknown };
}>;

/**
 * Computes the overall compliance status from counts and policy.
 *
 * @param args - The counts and policy to evaluate
 * @returns The overall compliance status
 *
 * @internal
 */
export function computeComplianceOverall(args: {
    counts: Record<ComplianceOutcome, number>;
    policy: Required<CompliancePolicy>;
}): ComplianceOverall {
    if (args.counts.non_compliant > 0) return "non_compliant";
    if (args.policy.treatUnverifiableAs === "warning" && args.counts.unverifiable > 0) return "warning";
    return "compliant";
}
