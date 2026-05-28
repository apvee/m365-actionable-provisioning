/**
 * SharePoint action definitions.
 *
 * @packageDocumentation
 */

import { sharePointActionModules } from "./actions/action-modules";
import type { SharePointActionDefinition } from "./actions/action-module";

/**
 * Built-in SharePoint action definitions.
 *
 * @public
 */
export const sharePointActionDefinitions = sharePointActionModules.map(
  (actionModule) => actionModule.definition
) as readonly SharePointActionDefinition[];

export type { SharePointActionDefinition };
