/**
 * SharePoint action definitions.
 *
 * @packageDocumentation
 */

import { sharePointActionModules } from "./action-modules";
import type { SharePointActionDefinition } from "./action-module";

/**
 * Built-in SharePoint action definitions.
 *
 * @public
 */
export const sharePointActionDefinitions = sharePointActionModules.map(
  (actionModule) => actionModule.definition
) as readonly SharePointActionDefinition[];

export type { SharePointActionDefinition };
