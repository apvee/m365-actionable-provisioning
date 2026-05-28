/**
 * Microsoft 365 provisioning plan schema definitions.
 *
 * @packageDocumentation
 */

import { z } from "zod";
import type { ActionNode } from "../core/action";
import { provisioningPlanParametersSchema } from "../core/provisioning-plan";
import { sharePointRootActionSchemas } from "../actions/sharepoint/provisioning-schema";

/**
 * Current default schema version.
 *
 * @public
 */
export const DEFAULT_SCHEMA_VERSION = "1.0" as const;

/**
 * Supported M365 provisioning schema versions.
 *
 * @public
 */
export const SUPPORTED_SCHEMA_VERSIONS = ["1.0"] as const;

/**
 * Supported M365 provisioning schema version literal.
 *
 * @public
 */
export type SupportedSchemaVersion = (typeof SUPPORTED_SCHEMA_VERSIONS)[number];

/**
 * Root-level action schemas available in M365 provisioning plans.
 *
 * @public
 */
export const m365RootActionSchemas = [
  ...sharePointRootActionSchemas,
] as const;

/**
 * Root-level action discriminated union for M365 provisioning plans.
 *
 * @public
 */
export const m365RootActionSchema = z.discriminatedUnion("verb", m365RootActionSchemas);

/**
 * Root-level actions array schema for M365 provisioning plans.
 *
 * @public
 */
export const m365ActionsSchema = z.array(m365RootActionSchema) satisfies z.ZodType<ReadonlyArray<ActionNode>>;

function validateSchemaVersion(schemaVersion: string): boolean {
  return (SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(schemaVersion);
}

/**
 * M365 provisioning plan schema.
 *
 * @public
 */
export const m365ProvisioningPlanSchema = z
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
    parameters: provisioningPlanParametersSchema.optional(),
    actions: m365ActionsSchema,
  })
  .strict();

/**
 * Validated M365 provisioning plan.
 *
 * @public
 */
export type M365ProvisioningPlan = z.infer<typeof m365ProvisioningPlanSchema>;
