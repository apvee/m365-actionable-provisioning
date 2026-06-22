/**
 * Microsoft 365 provisioning result types.
 *
 * @packageDocumentation
 */

import type { JsonValue } from "../core/json";

/**
 * High-level outcome for audit/result payloads.
 *
 * @public
 */
export type ProvisioningOutcome = "executed" | "skipped";

/**
 * Standardized skip reasons for audit/result payloads.
 *
 * @public
 */
export type SkipReason =
  | "not_found"
  | "already_exists"
  | "no_changes"
  | "missing_prerequisite"
  | "unsupported";

/**
 * Non-blocking warning emitted by a provisioning action.
 *
 * @remarks
 * Warnings describe best-effort work or structural concerns that did not make
 * the action throw. They are audit data; action outcome still remains either
 * `executed` or `skipped`.
 *
 * @public
 */
export type ProvisioningWarning = Readonly<{
  code: string;
  message: string;
  details?: JsonValue;
}>;

type ProvisioningResultBase = Readonly<{
  resource: string;
  warnings?: readonly ProvisioningWarning[];
}>;

/**
 * Minimal, audit-friendly action result shape.
 *
 * @public
 */
export type ProvisioningResultLight = Readonly<
  | (ProvisioningResultBase & { outcome: "executed" })
  | (ProvisioningResultBase & { outcome: "skipped"; reason: SkipReason })
>;
