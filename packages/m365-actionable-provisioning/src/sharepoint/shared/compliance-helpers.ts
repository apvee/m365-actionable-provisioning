/**
 * Compliance check result helpers for SharePoint provisioning actions.
 *
 * @remarks
 * Provides factory functions for creating standardized compliance check results.
 * Eliminates duplicated return statement patterns across action implementations.
 *
 * @module provisioning/shared/compliance-helpers
 * @internal
 */

import type { ComplianceActionCheckResult } from "../../core/action";
import { normalizeError } from "../../core";
import type { SPScope } from "../types";

/**
 * Creates an unverifiable result for missing prerequisite.
 *
 * @param message - Optional custom message (defaults to standard SPFI message)
 * @returns ComplianceActionCheckResult with unverifiable outcome
 *
 * @example
 * ```typescript
 * if (!spfi) {
 *   return unverifiableMissingPrereq();
 * }
 * ```
 */
export function unverifiableMissingPrereq(
  message = "SPFI instance not available in scope"
): ComplianceActionCheckResult<SPScope> {
  return {
    outcome: "unverifiable",
    reason: "missing_prerequisite",
    message,
  };
}

/**
 * Creates an unverifiable result for a caught error.
 *
 * @param resource - The resource identifier (e.g., list name, site URL)
 * @param error - The caught error (will be normalized)
 * @returns ComplianceActionCheckResult with unverifiable outcome
 *
 * @example
 * ```typescript
 * try {
 *   const found = await getListInfo(web, listName);
 * } catch (e) {
 *   return unverifiableError(listName, e);
 * }
 * ```
 */
export function unverifiableError(
  resource: string,
  error: unknown
): ComplianceActionCheckResult<SPScope> {
  return {
    outcome: "unverifiable",
    resource,
    reason: "error",
    message: normalizeError(error).message,
  };
}

/**
 * Creates a compliant result with optional scope delta.
 *
 * @param resource - The resource identifier (e.g., list name, site URL)
 * @param scopeDelta - Optional partial scope to propagate to child actions
 * @returns ComplianceActionCheckResult with compliant outcome
 *
 * @example
 * ```typescript
 * if (listExists && propertiesMatch) {
 *   return compliant(listName, { list });
 * }
 * ```
 */
export function compliant<S extends SPScope = SPScope>(
  resource: string,
  scopeDelta?: Partial<S>
): ComplianceActionCheckResult<S> {
  const result: ComplianceActionCheckResult<S> = {
    outcome: "compliant",
    resource,
  };
  if (scopeDelta) {
    return { ...result, scopeDelta };
  }
  return result;
}

/**
 * Creates a non-compliant result.
 *
 * @param resource - The resource identifier (e.g., list name, site URL)
 * @param reason - The reason for non-compliance (e.g., "not_found", "still_exists", "property_mismatch")
 * @param details - Optional additional details about the non-compliance
 * @returns ComplianceActionCheckResult with non_compliant outcome
 *
 * @example
 * ```typescript
 * if (!listExists) {
 *   return nonCompliant(listName, "not_found");
 * }
 *
 * if (list.Title !== expectedTitle) {
 *   return nonCompliant(listName, "property_mismatch", { expected: expectedTitle, actual: list.Title });
 * }
 * ```
 */
export function nonCompliant(
  resource: string,
  reason: string,
  details?: Record<string, unknown>
): ComplianceActionCheckResult<SPScope> {
  const result: ComplianceActionCheckResult<SPScope> = {
    outcome: "non_compliant",
    resource,
    reason,
  };
  if (details) {
    return { ...result, details };
  }
  return result;
}
