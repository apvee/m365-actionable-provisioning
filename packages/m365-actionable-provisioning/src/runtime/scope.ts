/**
 * Microsoft 365 provisioning scope type.
 *
 * @packageDocumentation
 */

import type { IList } from "@pnp/sp/lists";
import type { ISite } from "@pnp/sp/sites";
import type { IWeb } from "@pnp/sp/webs";

/**
 * Runtime scope propagated through action execution.
 *
 * @remarks
 * SDK clients are intentionally not stored here. Use `ctx.clients` for SPFI and
 * GraphFI, and reserve scope for state produced by parent actions.
 *
 * @public
 */
export type M365Scope = {
  /** PnPjs Site handle. */
  site?: ISite;

  /** PnPjs Web handle. */
  web?: IWeb;

  /** PnPjs List handle. */
  list?: IList;

  /** Microsoft 365 group id propagated by Graph-capable actions. */
  groupId?: string;

  /** Microsoft Teams team id propagated by Graph-capable actions. */
  teamId?: string;

  /** User id propagated by Graph-capable actions. */
  userId?: string;

  /** Drive id propagated by Graph-capable actions. */
  driveId?: string;

  /** Extension point for action-specific state. */
  [key: string]: unknown;
};
