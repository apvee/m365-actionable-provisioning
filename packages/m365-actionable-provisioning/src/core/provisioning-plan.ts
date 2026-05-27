/**
 * Provisioning plan model, Zod schemas, and template utilities.
 *
 * @remarks
 * A ProvisioningPlan is the root document passed to the engine.
 * It wraps the root-level actions array with metadata and parameters.
 *
 * **Template Expansion:**
 * Supported syntax:
 * - `{parameter:Key}` inside any string value (standalone or embedded)
 *
 * Resolution is applied recursively across arrays and plain JSON objects.
 *
 * @packageDocumentation
 */

import { z } from "zod";
import type { ActionNode } from "./action";
import { isPlainObject } from "./utils";

// =============================================================================
// TEMPLATE TYPES AND ERROR
// =============================================================================

/**
 * Map of parameter keys to their resolved values.
 *
 * @public
 */
export type ProvisioningPlanParameterMap = Readonly<Record<string, string>>;

/**
 * Error thrown when template expansion fails.
 *
 * @remarks
 * Indicates missing or duplicate parameter keys during template resolution.
 *
 * @public
 */
export class ProvisioningPlanTemplateError extends Error {
  override readonly name = "ProvisioningPlanTemplateError";

  constructor(
    message: string,
    readonly details?: Readonly<{ key?: string; path?: string }>
  ) {
    super(message);
  }
}

/**
 * Builds a parameter map from an array of parameter definitions.
 *
 * @param parameters - Array of parameter key-value pairs
 * @returns Lookup map for parameter resolution
 * @throws ProvisioningPlanTemplateError if duplicate keys are found
 *
 * @internal
 */
export const buildProvisioningPlanParameterMap = (
  parameters?: ReadonlyArray<ProvisioningPlanParameter>
): ProvisioningPlanParameterMap => {
  if (!parameters?.length) return {};

  const map: Record<string, string> = {};
  for (const p of parameters) {
    if (map[p.key] !== undefined) {
      throw new ProvisioningPlanTemplateError(`Duplicate parameter key "${p.key}"`, { key: p.key });
    }
    map[p.key] = p.value;
  }
  return map;
};

const PLACEHOLDER_RE = /\{parameter:([A-Za-z][A-Za-z0-9_-]*)\}/g;

/**
 * Resolves template placeholders in a value tree.
 *
 * @template T - The type of the value to resolve
 * @param value - The value containing placeholders to resolve
 * @param paramMap - Map of parameter names to values
 * @param path - Current path for error messages (internal)
 * @returns The value with all placeholders resolved
 * @throws ProvisioningPlanTemplateError if a parameter is missing
 *
 * @remarks
 * Recursively walks the value tree and replaces `{parameter:Key}` patterns
 * with their resolved values. The `verb` property is never template-expanded
 * as it must remain literal for schema matching.
 *
 * @internal
 */
export const resolveProvisioningPlanPlaceholders = <T>(
  value: T,
  paramMap: ProvisioningPlanParameterMap,
  path: string = ""
): T => {
  const walk = (v: unknown, p: string): unknown => {
    if (typeof v === "string") {
      if (!v.includes("{parameter:")) return v;

      return v.replace(PLACEHOLDER_RE, (_match, key: string) => {
        const replacement = paramMap[key];
        if (replacement === undefined) {
          const where = p ? ` at ${p}` : "";
          throw new ProvisioningPlanTemplateError(`Missing parameter "${key}"${where}`, {
            key,
            path: p || undefined,
          });
        }
        return replacement;
      });
    }

    if (Array.isArray(v)) {
      return v.map((item, i) => walk(item, `${p}[${i}]`));
    }

    if (isPlainObject(v)) {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(v)) {
        const nextPath = p ? `${p}.${k}` : k;
        // Never template-expand action discriminators.
        // `verb` decides schema matching and definition lookup, so it must remain literal.
        if (k === "verb") out[k] = v[k];
        else out[k] = walk(v[k], nextPath);
      }
      return out;
    }

    return v;
  };

  return walk(value, path) as T;
};

// =============================================================================
// PLAN TYPES AND SCHEMAS
// =============================================================================

/**
 * A single parameter definition for template substitution.
 * 
 * @public
 */
export type ProvisioningPlanParameter = Readonly<{
  key: string;
  value: string;
}>;

/**
 * Root provisioning plan document structure (base type).
 *
 * @remarks
 * Generic base type without catalog-specific fields like `schemaVersion`.
 * Used internally by engine infrastructure and as a constraint for generics.
 * Consumers should use the catalog-specific `ProvisioningPlan` type from the
 * provisioning module for complete plan validation.
 *
 * @public
 */
export type BaseProvisioningPlan<TAction extends { verb: string } = ActionNode> = Readonly<{
  /** Human-friendly title for the plan. */
  title?: string;

  /** Human-friendly description for the plan. */
  description?: string;

  /** Plan format/version identifier (e.g. "1.0.0"). */
  version: string;

  /** Optional parameter bag (to be resolved later by template expansion). */
  parameters?: ReadonlyArray<ProvisioningPlanParameter>;

  /** Root-level actions to execute. */
  actions: ReadonlyArray<TAction>;
}>;

/**
 * Zod schema for validating a single provisioning plan parameter.
 * 
 * @internal
 */
export const provisioningPlanParameterSchema: z.ZodType<ProvisioningPlanParameter> = z
  .object({
    key: z.string().min(1).regex(/^[A-Za-z][A-Za-z0-9_-]*$/),
    value: z.string(),
  })
  .strict() as z.ZodType<ProvisioningPlanParameter>;

/**
 * Zod schema for validating the parameters array with duplicate key checking.
 *
 * @internal
 */
export const provisioningPlanParametersSchema = z
  .array(provisioningPlanParameterSchema)
  .superRefine((items, ctx) => {
    const seen = new Set<string>();
    for (const [index, p] of items.entries()) {
      if (seen.has(p.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate parameter key "${p.key}"`,
          path: [index, "key"],
        });
      }
      seen.add(p.key);
    }
  });

/**
 * Creates a Zod schema for validating a complete provisioning plan.
 *
 * @param actionsSchema - Schema for the actions array
 * @returns Complete provisioning plan schema
 *
 * @public
 */
export function createProvisioningPlanSchema<TAction extends { verb: string }>(
  actionsSchema: z.ZodType<ReadonlyArray<TAction>>
): z.ZodType<BaseProvisioningPlan<TAction>> {
  return z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      version: z.string().min(1),
      parameters: provisioningPlanParametersSchema.optional(),
      actions: actionsSchema,
    })
    .strict() as z.ZodType<BaseProvisioningPlan<TAction>>;
}
