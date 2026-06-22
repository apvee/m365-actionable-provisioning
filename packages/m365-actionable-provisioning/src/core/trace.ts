/**
 * Unified trace module for the provisioning engine.
 *
 * @remarks
 * This module provides real-time tracing for both action execution and compliance checking.
 * It consolidates execution and compliance trace types into a single cohesive module.
 *
 * **Execution Trace Features:**
 * - Status tracking for each action (idle, running, success, fail, skipped)
 * - Timing information (start, end, duration)
 * - Permission check results and sources
 * - Error details for failed actions
 * - Path-based indexing for tree navigation
 *
 * **Compliance Trace Features:**
 * - Compliance check status tracking
 * - Outcome tracking (compliant, non_compliant, unverifiable, ignored)
 * - Blocking relationship tracking between actions
 * - Resource and reason details for compliance findings
 *
 * @packageDocumentation
 */

import type { JsonValue } from "./json";
import type { PermissionCheckResult, PermissionSource } from "./permissions";
import type { ComplianceOutcome, CompliancePolicy } from "./compliance";

// =============================================================================
// SHARED INTERNAL HELPERS
// =============================================================================

/**
 * Updates status counts when transitioning an item from one status to another.
 *
 * @template K - String literal type for status keys
 * @param counts - Current status counts
 * @param from - Status to decrement
 * @param to - Status to increment
 * @returns New counts object with updated values
 *
 * @internal
 */
export const withCount = <K extends string>(
  counts: Record<K, number>,
  from: K,
  to: K
): Record<K, number> => {
  const next = { ...counts };
  next[from] = Math.max(0, (next[from] ?? 0) - 1);
  next[to] = (next[to] ?? 0) + 1;
  return next;
};

// =============================================================================
// EXECUTION TRACE TYPES
// =============================================================================

/**
 * Unique path identifier for actions in the execution tree.
 *
 * @remarks
 * Paths are computed from array indices in the plan structure (1-based):
 * - Root actions: `"1"`, `"2"`, `"3"`, ...
 * - Subactions: `"1/1"`, `"1/2"`, `"2/1/3"`, ...
 *
 * This 1-based index addressing provides user-friendly identifiers
 * while maintaining deterministic, collision-free paths.
 *
 * @example
 * ```typescript
 * const rootPath: ActionPath = "1";
 * const subactionPath: ActionPath = "1/4/2"; // 4th subaction of root[1], then 2nd sub-subaction
 * ```
 *
 * @public
 */
export type ActionPath = string;

/**
 * Execution status of an action.
 *
 * @remarks
 * Status progression typically follows:
 * `idle` → `running` → `success` or `fail`
 *
 * - `idle`: Action has not started yet
 * - `running`: Action is currently executing
 * - `success`: Action completed successfully
 * - `fail`: Action failed with an error
 * - `skipped`: Action was skipped (reserved for future use)
 *
 * @public
 */
export type ActionStatus = "idle" | "running" | "success" | "fail" | "skipped";

/**
 * Trace information for a single action execution.
 *
 * @remarks
 * Captures complete execution details including:
 * - Identity (path and verb)
 * - Status and timing
 * - Permission check results (if performed)
 * - Error details (if failed)
 *
 * Used for real-time monitoring, debugging, and audit trails.
 *
 * @public
 */
export type ActionTraceItem = {
  /** The unique path identifier for this action */
  path: ActionPath;

  /** The verb/type of this action (e.g., "createSPList") */
  verb: string;

  /** Current execution status */
  status: ActionStatus;

  /** ISO 8601 timestamp when execution started */
  startedAt?: string;

  /** ISO 8601 timestamp when execution ended */
  endedAt?: string;

  /** Duration in milliseconds (calculated from start to end) */
  durationMs?: number;

  /** Permission check result if permissions were checked */
  permissions?: PermissionCheckResult;

  /** Source of permission check (preflight, jit, or cache) */
  permissionsSource?: PermissionSource;

  /** Error details if the action failed */
  error?: {
    /** Error message */
    message: string;

    /** Optional error code (e.g., "FORBIDDEN", "ZOD", "ACTION_FAIL") */
    code?: string;

    /** Optional structured error details */
    details?: unknown;
  };
};

/**
 * Complete trace of all actions in the execution plan.
 *
 * @remarks
 * Provides both indexed and aggregated views of execution:
 * - Fast lookup by path via `byPath`
 * - Execution order via `order` array
 * - Status distribution via `counts`
 *
 * Updated in real-time as actions transition through states.
 *
 * @public
 */
export type EngineTrace = {
  /** Total number of actions in the plan */
  total: number;

  /** Array of action paths in depth-first execution order */
  order: ActionPath[];

  /** Map of action paths to their trace items for fast lookup */
  byPath: Record<ActionPath, ActionTraceItem>;

  /** Count of actions in each status */
  counts: Record<ActionStatus, number>;
};

/**
 * Output produced by the provisioning engine after execution.
 *
 * @remarks
 * Contains minimal audit information:
 * - `trace`: Full execution trace with timing and status for all actions
 * - `byAction`: Results produced by each action (if any)
 *
 * Scope deltas are not included in the audit to reduce noise.
 * Results are only included if an action explicitly returns a result value.
 *
 * @public
 */
export type EngineOutput<TResult extends JsonValue = JsonValue> = {
  /** Results keyed by action path (only if action returned a result) */
  byAction: Record<ActionPath, { result?: TResult }>;

  /** Complete execution trace */
  trace: EngineTrace;
};

/**
 * Builds the initial trace from a preorder traversal of the action plan.
 *
 * @param preorder - Array of action path and verb pairs in execution order
 * @returns Initial trace with all actions in "idle" status
 *
 * @remarks
 * Called during engine initialization to set up the trace structure
 * before any actions have executed. All actions start with:
 * - Status: `idle`
 * - No timing information
 * - No permission or error details
 *
 * @internal
 */
export const buildInitialTrace = (
  preorder: Array<{ path: ActionPath; verb: string }>
): EngineTrace => {
  const order = preorder.map((s) => s.path);
  const byPath: Record<ActionPath, ActionTraceItem> = {};
  for (const s of preorder) {
    byPath[s.path] = { path: s.path, verb: s.verb, status: "idle" };
  }
  return {
    total: order.length,
    order,
    byPath,
    counts: { idle: order.length, running: 0, success: 0, fail: 0, skipped: 0 },
  };
};

/**
 * Creates a new trace with an updated action item.
 *
 * @param trace - Current trace
 * @param path - Path of the action to update
 * @param status - New status for the action
 * @param extra - Additional properties to merge into the trace item
 * @returns New trace with updated action and counts
 *
 * @remarks
 * Performs an immutable update:
 * 1. Copies the trace item for the specified path
 * 2. Merges in extra properties (e.g., timing, permissions, error)
 * 3. Updates the status
 * 4. Adjusts status counts accordingly
 *
 * @internal
 */
export const markAction = (
  trace: EngineTrace,
  path: ActionPath,
  status: ActionStatus,
  extra?: Partial<ActionTraceItem>
): EngineTrace => {
  const prev = trace.byPath[path];
  const byPath = {
    ...trace.byPath,
    [path]: { ...prev, ...extra, status },
  };
  const counts = withCount(trace.counts, prev.status, status);
  return { ...trace, byPath, counts };
};

// =============================================================================
// COMPLIANCE TRACE TYPES
// =============================================================================

/**
 * Status for a compliance trace item.
 *
 * @remarks
 * Includes both process states and compliance outcomes:
 * - `idle`: Check has not started
 * - `running`: Check is in progress
 * - `cancelled`: Check was cancelled
 * - `blocked`: Check was blocked by a dependency
 * - `compliant`, `non_compliant`, `unverifiable`, `ignored`: Final outcomes
 *
 * @public
 */
export type ComplianceTraceStatus =
  | "idle"
  | "running"
  | "cancelled"
  | "blocked"
  | ComplianceOutcome;

/**
 * Trace information for a single compliance check.
 *
 * @remarks
 * Captures compliance check details including:
 * - Identity (path and verb)
 * - Status and timing
 * - Blocking relationships
 * - Compliance findings (resource, reason, message)
 *
 * @public
 */
export type ComplianceTraceItem = Readonly<{
  /** The unique path identifier for this action */
  path: ActionPath;

  /** The verb/type of this action */
  verb: string;

  /** Current compliance check status */
  status: ComplianceTraceStatus;

  /** ISO 8601 timestamp when check started */
  startedAt?: string;

  /** ISO 8601 timestamp when check ended */
  endedAt?: string;

  /** Duration in milliseconds */
  durationMs?: number;

  /** Path of the action that blocked this check */
  blockedBy?: ActionPath;

  /** Resource identifier for compliance finding */
  resource?: string;

  /** Short reason code for compliance outcome */
  reason?: string;

  /** Human-readable message */
  message?: string;

  /** Additional structured details */
  details?: unknown;
}>;

/**
 * Complete compliance trace for all actions in the plan.
 *
 * @remarks
 * Similar structure to EngineTrace but tracks compliance check status
 * instead of execution status.
 *
 * @public
 */
export type ComplianceTrace = Readonly<{
  /** Total number of actions to check */
  total: number;

  /** Array of action paths in check order */
  order: ActionPath[];

  /** Map of action paths to their compliance trace items */
  byPath: Record<ActionPath, ComplianceTraceItem>;

  /** Count of items in each status */
  counts: Record<ComplianceTraceStatus, number>;
}>;

/**
 * Overall status of the compliance check operation.
 *
 * @remarks
 * - `idle`: Check has not started
 * - `running`: Check is in progress
 * - `completed`: Check finished successfully
 * - `cancelled`: Check was cancelled by user
 * - `failed`: Check encountered a fatal error
 *
 * @public
 */
export type ComplianceCheckStatus =
  | "idle"
  | "running"
  | "completed"
  | "cancelled"
  | "failed";

/**
 * Snapshot of the engine's compliance check state.
 *
 * @remarks
 * Provides a complete view of compliance checking including:
 * - Overall status and timing
 * - The policy being applied
 * - Full trace of individual action checks
 * - Error details if the check failed
 *
 * @public
 */
export type EngineComplianceSnapshot = Readonly<{
  /** Overall compliance check status */
  status: ComplianceCheckStatus;

  /** ISO 8601 timestamp when check was performed */
  checkedAt: string;

  /** The compliance policy being applied */
  policy: Required<CompliancePolicy>;

  /** Full trace of compliance checks */
  trace: ComplianceTrace;

  /** Error details when status is "failed" */
  error?: { message: string; details?: unknown };
}>;

/**
 * Builds the initial compliance trace from a preorder traversal of the action plan.
 *
 * @param preorder - Array of action path and verb pairs in check order
 * @returns Initial compliance trace with all items in "idle" status
 *
 * @internal
 */
export const buildInitialComplianceTrace = (
  preorder: Array<{ path: ActionPath; verb: string }>
): ComplianceTrace => {
  const order = preorder.map((s) => s.path);
  const byPath: Record<ActionPath, ComplianceTraceItem> = {};
  for (const s of preorder) {
    byPath[s.path] = { path: s.path, verb: s.verb, status: "idle" };
  }

  return {
    total: order.length,
    order,
    byPath,
    counts: {
      idle: order.length,
      running: 0,
      cancelled: 0,
      blocked: 0,
      compliant: 0,
      non_compliant: 0,
      unverifiable: 0,
      ignored: 0,
    },
  };
};

/**
 * Creates a new compliance trace with an updated item.
 *
 * @param trace - Current compliance trace
 * @param path - Path of the action to update
 * @param status - New status for the compliance check
 * @param extra - Additional properties to merge into the trace item
 * @returns New trace with updated item and counts
 *
 * @internal
 */
export const markCompliance = (
  trace: ComplianceTrace,
  path: ActionPath,
  status: ComplianceTraceStatus,
  extra?: Partial<Omit<ComplianceTraceItem, "path" | "verb" | "status">>
): ComplianceTrace => {
  const prev = trace.byPath[path];
  const nextItem: ComplianceTraceItem = {
    ...prev,
    ...(extra ?? {}),
    status,
  };

  const nextByPath: Record<ActionPath, ComplianceTraceItem> = {
    ...trace.byPath,
    [path]: nextItem,
  };

  const nextCounts = withCount(trace.counts, prev.status, status);
  return { ...trace, byPath: nextByPath, counts: nextCounts };
};
