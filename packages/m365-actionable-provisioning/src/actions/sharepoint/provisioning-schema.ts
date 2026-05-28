/**
 * SharePoint root action schema definitions.
 *
 * @remarks
 * Defines the Zod schemas for root-level SharePoint actions. The full
 * provisioning plan schema is owned by the M365 catalog.
 *
 * **Key Exports:**
 * - `sharePointActionsSchema` - Schema for root-level SharePoint actions array
 *
 * @packageDocumentation
 */

import { z } from "zod";
import type { ActionNode } from "../../core/action";

import {
  createSPListActionModule,
  deleteSPListActionModule,
  modifySPListActionModule,
} from "./lists";
import {
  createSPSiteActionModule,
  deleteSPSiteActionModule,
  modifySPSiteActionModule,
} from "./sites";

/* ========================================
   ROOT ACTION SCHEMAS
   ======================================== */

/**
 * Root-level SharePoint actions schema array.
 *
 * @remarks
 * Defines which actions are allowed at the root level of provisioning plans.
 *
 * Root-level actions:
 * - Site operations can contain list subactions
 * - List operations can be standalone (root-level) or subactions
 *
 * @internal
 */
export const sharePointRootActionSchemas = [
  createSPSiteActionModule.schema,
  modifySPSiteActionModule.schema,
  deleteSPSiteActionModule.schema,
  createSPListActionModule.schema,
  modifySPListActionModule.schema,
  deleteSPListActionModule.schema,
] as const;

/**
 * Discriminated union of all root-level action schemas.
 *
 * @internal
 */
export const sharePointRootActionSchema = z.discriminatedUnion("verb", sharePointRootActionSchemas);

/**
 * Schema for the root-level actions array in a provisioning plan.
 *
 * @remarks
 * Validates that all actions in the `actions` array are valid root-level actions.
 *
 * @public
 */
export const sharePointActionsSchema = z.array(sharePointRootActionSchema) satisfies z.ZodType<ReadonlyArray<ActionNode>>;
