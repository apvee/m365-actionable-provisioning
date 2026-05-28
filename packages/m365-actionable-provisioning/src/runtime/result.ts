/**
 * Microsoft 365 provisioning result types.
 *
 * @packageDocumentation
 */

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
 * Minimal, audit-friendly action result shape.
 *
 * @public
 */
export type ProvisioningResultLight = Readonly<
  | { outcome: "executed"; resource: string }
  | { outcome: "skipped"; resource: string; reason: SkipReason }
>;
