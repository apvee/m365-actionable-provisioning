/**
 * SPFI validation guards for SharePoint provisioning actions.
 *
 * @remarks
 * Provides consistent SPFI extraction and validation patterns for action handlers.
 * Eliminates duplicated null checks across action implementations.
 *
 * @module provisioning/shared/spfi-guard
 * @internal
 */

import type { SPFI } from "@pnp/sp";
import type { ComplianceActionCheckResult } from "../../core/action";
import type { SPScope } from "../types";

/**
 * Error thrown when SPFI is not available in scope.
 */
export class SpfiNotAvailableError extends Error {
  constructor(message = "SPFI instance not available in scope") {
    super(message);
    this.name = "SpfiNotAvailableError";
  }
}

/**
 * Extracts SPFI from scope or throws an error.
 *
 * @remarks
 * Use in `handler()` methods where missing SPFI is a fatal error.
 *
 * @param scope - The SPScope containing the optional SPFI instance
 * @returns The SPFI instance
 * @throws SpfiNotAvailableError if SPFI is not available in scope
 *
 * @example
 * ```typescript
 * async handler(ctx: SPRuntimeContext<Payload>) {
 *   const spfi = requireSpfi(ctx.scopeIn);
 *   // spfi is guaranteed to be defined here
 *   await spfi.web.lists.add(title);
 * }
 * ```
 */
export function requireSpfi(scope: SPScope): SPFI {
  const spfi = scope.spfi;
  if (!spfi) {
    throw new SpfiNotAvailableError();
  }
  return spfi;
}

/**
 * Union type for SPFI extraction with unverifiable fallback.
 */
export type SpfiOrUnverifiable = SPFI | ComplianceActionCheckResult<SPScope>;

/**
 * Extracts SPFI from scope or returns an unverifiable compliance result.
 *
 * @remarks
 * Use in `checkCompliance()` methods where missing SPFI should return
 * an unverifiable result rather than throwing.
 *
 * @param scope - The SPScope containing the optional SPFI instance
 * @returns The SPFI instance, or an unverifiable compliance result
 *
 * @example
 * ```typescript
 * async checkCompliance(ctx: ComplianceRuntimeContext<SPScope, Payload>) {
 *   const spfiResult = getSpfiOrUnverifiable(ctx.scopeIn);
 *   if (isUnverifiableResult(spfiResult)) {
 *     return spfiResult;
 *   }
 *   const spfi = spfiResult;
 *   // Continue with compliance check...
 * }
 * ```
 */
export function getSpfiOrUnverifiable(scope: SPScope): SpfiOrUnverifiable {
  const spfi = scope.spfi;
  if (!spfi) {
    return {
      outcome: "unverifiable",
      reason: "missing_prerequisite",
      message: "SPFI instance not available in scope",
    };
  }
  return spfi;
}

/**
 * Type guard to check if a value is an unverifiable compliance result.
 *
 * @param value - The value returned from getSpfiOrUnverifiable
 * @returns True if the value is a compliance result (not SPFI)
 *
 * @example
 * ```typescript
 * const spfiResult = getSpfiOrUnverifiable(ctx.scopeIn);
 * if (isUnverifiableResult(spfiResult)) {
 *   return spfiResult; // Early return with unverifiable
 * }
 * // spfiResult is now narrowed to SPFI
 * ```
 */
export function isUnverifiableResult(
  value: SpfiOrUnverifiable
): value is ComplianceActionCheckResult<SPScope> {
  return (
    typeof value === "object" &&
    value !== null &&
    "outcome" in value &&
    (value as ComplianceActionCheckResult<SPScope>).outcome === "unverifiable"
  );
}

/**
 * Checks if SPFI is available and returns a permission deny result if not.
 *
 * @remarks
 * Use in `checkPermissions()` methods.
 *
 * @param scope - The SPScope containing the optional SPFI instance
 * @returns The SPFI instance, or undefined if not available
 */
export function getSpfiForPermissionCheck(scope: SPScope): SPFI | undefined {
  return scope.spfi;
}
