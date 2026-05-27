/**
 * SharePoint runtime context type.
 *
 * @packageDocumentation
 */

import type { ActionRuntimeContext } from "../../core/action";
import type { SPScope } from "./sp-scope";

/**
 * Runtime context for SharePoint actions.
 *
 * @template TPayload - The action payload type (inferred from Zod schema)
 *
 * @remarks
 * Extends base ActionRuntimeContext with SPScope that includes SPFI.
 *
 * SPFI is stored in `scopeIn.spfi` and should be accessed directly.
 * Actions reuse `scopeIn.web` / `scopeIn.list` handles when provided by parents.
 *
 * @example
 * ```typescript
 * async handler(ctx: SPRuntimeContext<CreateSPListPayload>) {
 *   // Access SPFI from scope with null guard
 *   const spfi = ctx.scopeIn.spfi;
 *   if (!spfi) {
 *     throw new Error("SPFI instance not available in scope");
 *   }
 *
 *   // Use the Web handle from scope (set by a parent) when available
 *   const web = ctx.scopeIn.web ?? Web([spfi.web, ctx.action.payload.webUrl]);
 *
 *   // Use PnPjs API
 *   await web.lists.add(ctx.action.payload.title);
 * }
 * ```
 *
 * @public
 */
export type SPRuntimeContext<TPayload extends Record<string, unknown> = Record<string, unknown>> =
  ActionRuntimeContext<SPScope, TPayload>;
