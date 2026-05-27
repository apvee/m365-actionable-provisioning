/**
 * Microsoft 365 runtime action types.
 *
 * @packageDocumentation
 */

import type { ActionResult, ActionRuntimeContext } from "../core/action";
import type { M365Clients } from "./clients";
import type { ProvisioningResultLight } from "./result";
import type { M365Scope } from "./scope";

/**
 * Runtime context for built-in M365 actions.
 *
 * @public
 */
export type M365RuntimeContext<TPayload extends Record<string, unknown> = Record<string, unknown>> =
  ActionRuntimeContext<M365Scope, TPayload, ProvisioningResultLight, M365Clients>;

/**
 * Standard action result type for built-in M365 actions.
 *
 * @public
 */
export type M365ActionResult = ActionResult<M365Scope, ProvisioningResultLight>;
