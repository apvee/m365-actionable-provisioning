/**
 * SharePoint provisioning scope type.
 *
 * @packageDocumentation
 */

import type { SPFI } from "@pnp/sp";
import type { ISite } from "@pnp/sp/sites";
import type { IWeb } from "@pnp/sp/webs";
import type { IList } from "@pnp/sp/lists";

/**
 * SharePoint provisioning scope.
 *
 * @remarks
 * Contains SharePoint-specific context properties that flow through action execution:
 * - SPFI context (spfi) - PnPjs root context for all SharePoint operations
 * - Site/Web/List handles (site/web/list) - PnPjs-bound instances reused across subactions
 *
 * Properties are propagated from parent to child actions via scopeDelta.
 *
 * **Important:** `spfi` is stored in scope but never propagated via scopeDelta
 * (it's immutable and set only at engine initialization).
 *
 * @example
 * ```typescript
 * // Parent action creates web/list handles once and passes them to subactions
 * const scopeDelta: Partial<SPScope> = {
 *   web: Web([spfi.web, "https://contoso.sharepoint.com/sites/project"]),
 *   list: Web([spfi.web, "https://contoso.sharepoint.com/sites/project"]).lists.getByTitle("Tasks")
 * };
 * ```
 *
 * @public
 */
export type SPScope = {
  /** PnPjs SPFI root instance for SharePoint operations */
  spfi?: SPFI;

  /** PnPjs Site handle (optional; depends on action needs) */
  site?: ISite;

  /** PnPjs Web handle (used by most actions and as root web for site subactions) */
  web?: IWeb;

  /** PnPjs List handle (present when executing list subactions) */
  list?: IList;
};
