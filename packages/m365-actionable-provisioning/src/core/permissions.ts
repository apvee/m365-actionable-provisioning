/**
 * Permission checking types and results for the provisioning engine.
 * 
 * @remarks
 * Defines the structure for permission checks that can be performed
 * before (preflight) or just-in-time (JIT) during action execution.
 * Supports caching for performance optimization.
 * 
 * @packageDocumentation
 */

import type { JsonValue } from "./json";

/**
 * The decision outcome of a permission check.
 * 
 * @remarks
 * - `allow`: Permission explicitly granted
 * - `deny`: Permission explicitly denied
 * - `unknown`: Unable to determine (recorded for trace/UX, but does not block execution)
 * 
 * @public
 */
export type PermissionDecision = "allow" | "deny" | "unknown";

/**
 * A single finding from a permission check.
 * 
 * @remarks
 * Findings provide detailed information about why a permission check
 * resulted in a particular decision. Multiple findings can explain
 * different aspects of the permission evaluation.
 * 
 * @example
 * ```typescript
 * const finding: PermissionFinding = {
 *   code: "MISSING_ROLE",
 *   message: "User lacks 'Site Owner' role",
 *   details: { requiredRole: "Site Owner", userRoles: ["Member"] }
 * };
 * ```
 * 
 * @public
 */
export type PermissionFinding = {
    /** Machine-readable code identifying the finding type */
    code: string;

    /** Human-readable description of the finding */
    message: string;

    /** Optional structured details about the finding */
    details?: JsonValue
};

/**
 * Result of a permission check with optional detailed findings and caching metadata.
 * 
 * @remarks
 * This simplified result type provides essential information about permission evaluation:
 * - The final decision (allow/deny/unknown)
 * - Optional human-readable message summarizing the result
 * - Optional structured findings for detailed analysis
 * - Optional caching information for performance
 * 
 * @example
 * ```typescript
 * // Success case
 * const allowed: PermissionCheckResult = {
 *   decision: "allow",
 *   message: "User has ManageLists permissions",
 *   cache: { key: "site:managelists:xyz", ttlMs: 120000 }
 * };
 * 
 * // Failure case
 * const denied: PermissionCheckResult = {
 *   decision: "deny",
 *   message: "Insufficient permissions: ManageLists with DeleteListItems required",
 * };
 * ```
 * 
 * @public
 */
export type PermissionCheckResult = {
    /** The permission decision (allow/deny/unknown) */
    decision: PermissionDecision;

    /** Optional human-readable summary message */
    message?: string;

    /** Optional caching metadata for performance optimization */
    cache?: {
        /** Unique key for caching this permission result */
        key: string;

        /** Optional time-to-live in milliseconds */
        ttlMs?: number
    };
};

/**
 * The timing/source of when a permission check was performed.
 * 
 * @remarks
 * - `preflight`: Check performed before execution during the preflight phase
 * - `jit`: Just-in-time check performed immediately before action execution
 * - `cache`: Result retrieved from cache (original source may have been preflight or jit)
 * 
 * @public
 */
export type PermissionSource = "preflight" | "jit" | "cache";
