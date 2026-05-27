/**
 * Microsoft 365 runtime client types.
 *
 * @packageDocumentation
 */

import type { GraphFI } from "@pnp/graph";
import type { SPFI } from "@pnp/sp";

/**
 * PnPjs clients injected into the provisioning engine.
 *
 * @public
 */
export type M365Clients = {
  /** PnPjs SharePoint client. Required by SharePoint actions. */
  spfi?: SPFI;

  /** PnPjs Microsoft Graph client. Required by Graph actions. */
  graphClient?: GraphFI;
};
