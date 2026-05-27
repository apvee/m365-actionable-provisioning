/**
 * SharePoint provisioning result types.
 *
 * @packageDocumentation
 */

import type { ActionResult } from "../../core/action";
import type { SPScope } from "./sp-scope";

/**
 * High-level outcome for audit/result payloads.
 *
 * @remarks
 * This intentionally overlaps with trace status, but remains useful to express
 * semantic outcomes such as "skipped" without relying on trace interpretation.
 * 
 * @public
 */
export type ProvisioningOutcome = "executed" | "skipped";

/**
 * Standardized skip reasons for audit/result payloads.
 *
 * @remarks
 * Kept as a string-union (like {@link ProvisioningOutcome}) to avoid runtime enums.
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
 * @remarks
 * - `resource` is the human-friendly artifact name (e.g., listName, field internalName)
 * - `reason` is required when `outcome` is "skipped"
 * 
 * @public
 */
export type ProvisioningResultLight = Readonly<
  | { outcome: "executed"; resource: string }
  | { outcome: "skipped"; resource: string; reason: SkipReason }
>;

/**
 * Standard action result type for SharePoint provisioning handlers.
 * 
 * @public
 */
export type SPActionResult = ActionResult<SPScope, ProvisioningResultLight>;
