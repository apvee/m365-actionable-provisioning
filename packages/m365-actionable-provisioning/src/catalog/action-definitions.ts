/**
 * Built-in Microsoft 365 action catalog.
 *
 * @packageDocumentation
 */

import { sharePointActionDefinitions } from "../actions/sharepoint/action-definitions";

/**
 * Unified M365 action definitions.
 *
 * @remarks
 * The catalog currently contains SharePoint actions. Graph support is wired
 * through the same engine/client infrastructure and covered by smoke tests until
 * public Graph actions are introduced.
 *
 * @public
 */
export const m365ActionDefinitions = [
  ...sharePointActionDefinitions,
] as const;
