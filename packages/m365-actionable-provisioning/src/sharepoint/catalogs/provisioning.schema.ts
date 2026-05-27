/**
 * SharePoint provisioning plan schema definitions with versioning support.
 *
 * @remarks
 * Defines the Zod schemas for validating SharePoint provisioning plans.
 * Supports schema versioning for backward compatibility and future evolution.
 *
 * **Key Exports:**
 * - `provisioningPlanSchema` - Complete plan schema with version validation
 * - `actionsSchema` - Schema for root-level actions array
 * - `ProvisioningPlan` - TypeScript type for SharePoint provisioning plans
 *
 * @packageDocumentation
 */

import { z } from "zod";
import type { ActionNode } from "../../core/action";
import { provisioningPlanParametersSchema } from "../../core/provisioning-plan";

import {
  createSPSiteSchema,
  modifySPSiteSchema,
  deleteSPSiteSchema,
  createSPListSchema,
  modifySPListSchema,
  deleteSPListSchema,
} from "./schemas";

/* ========================================
   VERSION CONSTANTS
   ======================================== */

/**
 * Current default schema version.
 *
 * @remarks
 * Used when no schemaVersion is specified in a provisioning plan.
 * Ensures backward compatibility with existing plans.
 *
 * @public
 */
export const DEFAULT_SCHEMA_VERSION = "1.0" as const;

/**
 * Array of all supported schema versions.
 *
 * @remarks
 * Extend this array when introducing new schema versions.
 * The first element should always be the default version.
 *
 * @public
 */
export const SUPPORTED_SCHEMA_VERSIONS = ["1.0"] as const;

/**
 * Type representing all supported schema version literals.
 *
 * @public
 */
export type SupportedSchemaVersion = (typeof SUPPORTED_SCHEMA_VERSIONS)[number];

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
const rootActionSchemas = [
  createSPSiteSchema,
  modifySPSiteSchema,
  deleteSPSiteSchema,
  createSPListSchema,
  modifySPListSchema,
  deleteSPListSchema,
] as const;

/**
 * Discriminated union of all root-level action schemas.
 *
 * @internal
 */
const rootActionSchema = z.discriminatedUnion("verb", rootActionSchemas);

/**
 * Schema for the root-level actions array in a provisioning plan.
 *
 * @remarks
 * Validates that all actions in the `actions` array are valid root-level actions.
 *
 * @public
 */
export const actionsSchema = z.array(rootActionSchema) satisfies z.ZodType<ReadonlyArray<ActionNode>>;

/* ========================================
   SCHEMA VERSION VALIDATION
   ======================================== */

/**
 * Custom refinement to provide clear error messages for unsupported versions.
 *
 * @remarks
 * This refinement catches versions that don't match the enum and provides
 * a user-friendly error message listing supported versions.
 *
 * @internal
 */
function validateSchemaVersion(version: string): boolean {
  return (SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(version);
}

/* ========================================
   PROVISIONING PLAN SCHEMA
   ======================================== */

/**
 * SharePoint provisioning plan schema with version validation.
 *
 * @remarks
 * This schema validates SharePoint provisioning plans with:
 * - `schemaVersion` field that defaults to "1.0"
 * - Validation that rejects unsupported versions
 * - Standard plan fields (title, description, version, parameters, actions)
 *
 * **Backward Compatibility:**
 * Plans without a `schemaVersion` field automatically default to "1.0".
 *
 * **Version Format:**
 * Versions use major.minor format (e.g., "1.0", "2.0").
 *
 * @example
 * ```typescript
 * // Plan with explicit schema version
 * const plan = {
 *   schemaVersion: "1.0",
 *   version: "1.0.0",
 *   actions: [{ verb: "createSPSite", ... }]
 * };
 *
 * // Plan without schema version (defaults to "1.0")
 * const legacyPlan = {
 *   version: "1.0.0",
 *   actions: [{ verb: "createSPSite", ... }]
 * };
 * ```
 *
 * @public
 */
export const provisioningPlanSchema = z
  .object({
    schemaVersion: z
      .string()
      .optional()
      .transform((val) => val ?? DEFAULT_SCHEMA_VERSION)
      .refine(validateSchemaVersion, {
        message: `Unsupported schema version. Supported versions: ${SUPPORTED_SCHEMA_VERSIONS.join(", ")}`,
      }),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    version: z.string().min(1),
    parameters: provisioningPlanParametersSchema.optional(),
    actions: actionsSchema,
  })
  .strict();

/**
 * TypeScript type for a validated SharePoint provisioning plan.
 *
 * @remarks
 * Inferred from `provisioningPlanSchema` using `z.infer`. This is the canonical type
 * for SharePoint provisioning plans, where `schemaVersion` is guaranteed to be a string
 * (defaults applied).
 *
 * This type extends the core `BaseProvisioningPlan` with SharePoint-specific `schemaVersion` field.
 *
 * Use this type for:
 * - Defining plan templates with explicit `schemaVersion`
 * - Handling validated plans within the SharePoint engine
 * - Type-safe provisioning plan construction
 *
 * @example
 * ```typescript
 * const plan: ProvisioningPlan = {
 *   schemaVersion: "1.0",
 *   version: "1.0.0",
 *   actions: [{ verb: "createSPSite", ... }]
 * };
 * ```
 *
 * @public
 */
export type ProvisioningPlan = z.infer<typeof provisioningPlanSchema>;
