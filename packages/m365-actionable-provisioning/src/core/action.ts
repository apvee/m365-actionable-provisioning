/**
 * Action model types and base definition class.
 * 
 * @remarks
 * Defines the core action model for the provisioning engine:
 * - Actions are identified by `verb` (not `kind` or `id`)
 * - Properties are root-level (not in a `params` wrapper)
 * - Actions can have nested `subactions` for hierarchical execution
 * - Each verb has a strongly-typed schema enforced via Zod
 * - Handlers are optional (for infrastructure-only mode)
 * 
 * @packageDocumentation
 */

import { z } from "zod";
import type { JsonValue, JsonObject } from "./json";
import type { Logger } from "./logger";
import type { PermissionCheckResult } from "./permissions";
import type { ActionPath, EngineOutput } from "./trace";
import type { ComplianceOutcome } from "./compliance";

/**
 * Base structure for all action nodes.
 * 
 * @remarks
 * All actions must have:
 * - `verb`: String identifying the action type
 * - `subactions`: Optional array of nested actions
 * 
 * Additional properties are verb-specific and defined in each ActionDefinition.
 * 
 * @public
 */
export type ActionNodeBase = Readonly<{
    /** The action type identifier (e.g., "createSPList", "addSPField") */
    verb: string;

    /** Optional nested actions to execute after this action */
    subactions?: ReadonlyArray<ActionNode>;
}>;

/**
 * Concrete action node type.
 * 
 * @remarks
 * After Zod parsing, it's guaranteed to match one of the allowed verb schemas
 * for the current position in the plan (root or subaction), as defined by the
 * engine's static `provisioningSchema`.
 * 
 * Contains both the base structure (verb, subactions) and verb-specific properties.
 * 
 * @public
 */
export type ActionNode = ActionNodeBase & Readonly<JsonObject>;



/**
 * Result returned by an action handler.
 * 
 * @remarks
 * Handlers can optionally return:
 * - `result`: Arbitrary JSON value to include in the audit output
 * - `scopeDelta`: Changes to merge into the scope for downstream actions
 * 
 * If no result or scopeDelta is needed, return an empty object `{}`.
 * 
 * @example
 * ```typescript
 * const result: ActionResult = {
 *   result: { listId: "abc-123", itemCount: 5 },
 *   scopeDelta: { createdListId: "abc-123" }
 * };
 * ```
 * 
 * @public
 */
export type ActionResult<
    Scope extends Record<string, unknown> = Record<string, unknown>,
    TResult extends JsonValue = JsonValue
> = Readonly<{
    /** Optional result value to include in audit output */
    result?: TResult;

    /** Optional scope changes to propagate to subactions */
    scopeDelta?: Partial<Scope>;
}>;

/**
 * Default Zod schema for validating ActionResult.
 * 
 * @remarks
 * Action definitions can override this with a more specific schema
 * by setting their `resultSchema` property.
 * 
 * @public
 */
export const defaultActionResultSchema: z.ZodType<ActionResult<Record<string, unknown>, JsonValue>> = z.object({
    result: z.unknown().optional(),
    scopeDelta: z.record(z.string(), z.unknown()).optional(),
}) as z.ZodType<ActionResult<Record<string, unknown>, JsonValue>>;

/**
 * Runtime context passed to action handlers and permission checkers.
 * 
 * @template Scope - The scope object type (extends JsonObject)
 * @template Payload - The action payload type (extends Record<string, unknown>)
 * 
 * @remarks
 * Provides everything an action needs to execute:
 * - `scopeIn`: Inherited scope from parent actions
 * - `out`: Current engine output (for accessing previous results)
 * - `logger`: Scoped logger for this action
 * - `action`: Metadata about the current action (path, verb, parsed payload)
 * 
 * @public
 */
export type ActionRuntimeContext<
    Scope extends Record<string, unknown>,
    Payload extends Record<string, unknown>,
    TResult extends JsonValue = JsonValue
> = Readonly<{
    /** Scope inherited from parent actions */
    scopeIn: Scope;

    /** Current engine output state */
    out: EngineOutput<TResult>;

    /** Logger instance scoped to this action */
    logger: Logger;

    /** Metadata about the current action */
    action: {
        /** Unique path identifier for this action */
        path: ActionPath;

        /** The verb of this action */
        verb: string;

        /** Parsed and validated action payload (excludes subactions) */
        payload: Payload;
    };
}>;

/**
 * Runtime context passed to action compliance checkers.
 *
 * @remarks
 * Similar to ActionRuntimeContext but intentionally read-only and does not expose
 * engine output. Compliance checks should not depend on prior execution results.
 * 
 * @public
 */
export type ComplianceRuntimeContext<
    Scope extends Record<string, unknown>,
    Payload extends Record<string, unknown>
> = Readonly<{
    scopeIn: Scope;
    logger: Logger;
    action: {
        path: ActionPath;
        verb: string;
        payload: Payload;
    };
}>;

/**
 * Result returned by an action compliance checker.
 * 
 * @public
 */
export type ComplianceActionCheckResult<Scope extends Record<string, unknown>> = Readonly<{
    outcome: ComplianceOutcome;
    resource?: string;
    reason?: string;
    message?: string;
    details?: unknown;
    scopeDelta?: Partial<Scope>;
}>;

/**
 * Base class for defining action behaviors and schemas.
 * 
 * @template Verb - String literal type for the verb name
 * @template ActionSchema - Complete Zod schema type (includes verb, properties, subactions)
 * @template Scope - The scope object type
 * 
 * @remarks
 * **Schema-First Approach:**
 * Each action has a complete Zod schema that defines:
 * - The verb (via `z.literal`)
 * - All action-specific properties
 * - The subactions governance (via nested schema unions)
 * 
 * The schema IS the single source of truth for:
 * - Validation (what properties are required/optional)
 * - Governance (which subactions are allowed)
 * - Type safety (full TypeScript inference)
 * 
 * ActionDefinition receives the complete schema and provides:
 * - `requiresScopeSchema` (optional): Scope requirements for execution
 * - `checkPermissions` (optional): Permission checking logic
 * - `handler` (optional): Action execution logic
 * 
 * **Breaking Change from v1:**
 * - `payloadSchema` is now the COMPLETE schema (including subactions)
 * - `allowedSubactionVerbs` is removed (governance is in the schema)
 * - Validation happens entirely through Zod, not runtime building
 * 
 * @example
 * ```typescript
 * // Define schemas statically
 * const addFieldSchema = z.object({
 *   verb: z.literal("addSPField"),
 *   internalName: z.string(),
 *   fieldType: z.string(),
 *   subactions: z.array(z.never()).optional() // no subactions allowed
 * });
 * 
 * const createListSchema = z.object({
 *   verb: z.literal("createSPList"),
 *   listName: z.string(),
 *   title: z.string(),
 *   subactions: z.array(z.union([
 *     addFieldSchema,
 *     addViewSchema
 *   ])).optional() // only these subactions allowed
 * });
 * 
 * // ActionDefinition just adds behavior
 * class CreateListAction extends ActionDefinition<
 *   "createSPList",
 *   typeof createListSchema,
 *   MyScopeType
 * > {
 *   readonly verb = "createSPList";
 *   readonly actionSchema = createListSchema;
 *   
 *   async handler(ctx) {
 *     // Implementation here
 *     return { result: { listId: "..." } };
 *   }
 * }
 * ```
 * 
 * @public
 */
export abstract class ActionDefinition<
    Verb extends string,
    ActionSchema extends z.ZodType<Record<string, unknown>>,
    Scope extends Record<string, unknown>,
    TResult extends JsonValue = JsonValue
> {
    /**
     * The unique verb identifier for this action type.
     * 
     * @remarks
     * Must match the `verb` literal in the actionSchema.
     * Used by the engine to build the verb → definition map.
     */
    public abstract readonly verb: Verb;

    /**
     * Complete Zod schema for this action (includes verb, properties, and subactions).
     * 
     * @remarks
     * **Schema Structure Requirements:**
     * - Must include `verb: z.literal("...")`
     * - Must include all action-specific properties
     * - Must include `subactions` property that defines governance:
     *   - `z.array(z.never()).optional()` - no subactions allowed
     *   - `z.array(specificSchema).optional()` - one subaction type allowed
     *   - `z.array(z.union([...schemas])).optional()` - multiple types allowed
     * 
     * **Governance via Schema:**
     * The subactions property enforces which actions can be nested.
     * Zod validates this at parse time, not at engine runtime.
     * 
     * **Type Inference:**
     * The engine uses `z.infer<ActionSchema>` to extract the payload type,
     * ensuring full type safety in handlers and permission checkers.
     */
    public abstract readonly actionSchema: ActionSchema;

    /**
     * Optional Zod schema for required scope properties.
     * 
     * @remarks
     * If defined, the engine validates the scope before executing the action.
     * If validation fails, the action fails with a ZOD error.
     * 
     * Also used for preflight permission checks: if the initial scope
     * doesn't satisfy this schema, preflight is skipped for this action.
     */
    public readonly requiresScopeSchema?: z.ZodType<Scope>;

    /**
     * Optional async function to check permissions before execution.
     * 
     * @param _ctx - The runtime context with params, scope, and action metadata
     * @returns A PermissionCheckResult describing the decision and findings
     * 
     * @remarks
     * The engine calls this at two possible times:
     * 1. **Preflight** (before execution starts): If `requiresScopeSchema` is
     *    satisfied by the initial scope, permissions are checked early
     * 2. **Just-in-time** (immediately before handler): If preflight didn't happen
     *    or didn't cover this action, permissions are checked right before execution
     * 
     * Results can be cached using the `cache.key` property in the result.
     * 
     * If the result decision is `"deny"`, the action fails with FORBIDDEN.
     */
    public async checkPermissions?(
        _ctx: ActionRuntimeContext<Scope, z.infer<ActionSchema>, TResult>
    ): Promise<PermissionCheckResult>;

    /**
     * Optional async function to execute the action.
     * 
     * @param _ctx - The runtime context with params, scope, and action metadata
     * @returns An ActionResult with optional result value and scope delta
     * 
     * @remarks
     * The handler is called after:
     * 1. Scope requirements are validated (if any)
     * 2. Permissions are checked and allowed (if defined)
     * 
     * The handler should:
     * - Perform the action (e.g., create a SharePoint list)
     * - Return `result` if the action produces a value for audit
     * - Return `scopeDelta` if the action produces data for subactions
     * 
     * If the handler throws, the action fails and the error is captured in trace.
     */
    public async handler?(
        _ctx: ActionRuntimeContext<Scope, z.infer<ActionSchema>, TResult>
    ): Promise<ActionResult<Scope, TResult>>;

    /**
     * Optional compliance (drift) check.
     *
     * @remarks
     * Compliance checks must be side-effect free and should only verify the subset of
     * properties implied by the action payload.
     */
    public async checkCompliance?(
        _ctx: ComplianceRuntimeContext<Scope, z.infer<ActionSchema>>
    ): Promise<ComplianceActionCheckResult<Scope>>;

    /**
     * Zod schema for validating handler return values.
     * 
     * @remarks
     * Override this if your action returns a more specific result shape.
     * The default schema allows any result and scopeDelta values.
     */
    public readonly resultSchema: z.ZodType<ActionResult<Scope, TResult>> =
        defaultActionResultSchema as z.ZodType<ActionResult<Scope, TResult>>;
}

/**
 * Type alias for heterogeneous action definition collections.
 * 
 * @template Scope - The scope object type (defaults to JsonObject)
 * 
 * @remarks
 * Used for the action registry to hold definitions with different verb
 * and schema types. The type parameter is specialized only for Scope
 * to maintain scope type consistency across the engine.
 * 
 * @public
 */
export type AnyActionDefinition<
    Scope extends Record<string, unknown> = Record<string, unknown>,
    TResult extends JsonValue = JsonValue
> = ActionDefinition<string, z.ZodType<Record<string, unknown>>, Scope, TResult>;
