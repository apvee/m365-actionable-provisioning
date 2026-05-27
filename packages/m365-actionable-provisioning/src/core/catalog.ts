/**
 * Action catalog type definition.
 * 
 * @remarks
 * An ActionCatalog aggregates all the components needed to define
 * a complete provisioning vocabulary:
 * - **definitions**: All action implementations (handlers + permission checkers)
 * 
 * This type is used to organize catalogs in separate files for better
 * modularity and maintainability. Engine subclasses reference these
 * catalogs via static properties.
 * 
 * @packageDocumentation
 */

import type { AnyActionDefinition } from "./action";

/**
 * Complete action catalog defining a provisioning vocabulary.
 * 
 * @template Scope - The scope object type (extends JsonObject)
 * 
 * @remarks
 * **Purpose:**
 * 
 * Catalogs organize related actions into cohesive groups (e.g., SharePoint actions,
 * Azure actions, custom business actions). Each catalog is self-contained and
 * defines the runtime behavior (handlers + permission/compliance checkers).
 * Validation and governance are provided separately via a Zod schema (e.g. an
 * `actionsSchema` composed into a `ProvisioningPlan` schema).
 * 
 * **Structure:**
 * 
 * ```typescript
 * const myCatalog: ActionCatalog<MyScope> = {
 *   // All action implementations (root + subactions)
 *   definitions: [
 *     new CreateListAction(),
 *     new AddFieldAction(),
 *     // ... all actions
 *   ]
 * };
 * ```
 * 
 * **Usage in Engine:**
 * 
 * ```typescript
 * class MyEngine extends ProvisioningEngineBase<MyScope> {
 *   protected static readonly definitions = myCatalog.definitions;
 * }
 * ```
 * 
 * **Organizing Catalogs:**
 * 
 * - **Single Domain**: One catalog per domain (e.g., sharepoint-catalog.ts)
 * - **Versioning**: Multiple catalogs for backward compatibility (v1, v2)
 * - **Composition**: Combine catalogs for multi-domain scenarios
 * 
 * @example
 * Complete catalog example:
 * ```typescript
 * // catalogs/sharepoint-catalog.ts
 * import { z } from "zod";
 * import type { ActionCatalog } from "../catalog";
 * import { ActionDefinition } from "../action";
 * 
 * // 1. Define schemas with governance
 * const addFieldSchema = z.object({
 *   verb: z.literal("addSPField"),
 *   internalName: z.string(),
 *   fieldType: z.string(),
 *   subactions: z.array(z.never()).optional()
 * });
 * 
 * const createListSchema = z.object({
 *   verb: z.literal("createSPList"),
 *   listName: z.string(),
 *   title: z.string(),
 *   subactions: z.array(z.union([
 *     addFieldSchema  // Only addField allowed as subaction
 *   ])).optional()
 * });
 *
 * // 2. Define root schema
 * // Root-level schema is defined separately (e.g., actionsSchema) and
 * // composed into a ProvisioningPlan schema via createProvisioningPlanSchema.
 *
 * // 3. Implement action definitions
 * class CreateListAction extends ActionDefinition<
 *   "createSPList",
 *   typeof createListSchema,
 *   SharePointScope
 * > {
 *   readonly verb = "createSPList";
 *   readonly actionSchema = createListSchema;
 *   
 *   async handler(ctx) {
 *     // Create SharePoint list
 *     return { 
 *       result: { listId: "abc-123" },
 *       scopeDelta: { lastCreatedListId: "abc-123" }
 *     };
 *   }
 * }
 * 
 * class AddFieldAction extends ActionDefinition<
 *   "addSPField",
 *   typeof addFieldSchema,
 *   SharePointScope
 * > {
 *   readonly verb = "addSPField";
 *   readonly actionSchema = addFieldSchema;
 *   
 *   async handler(ctx) {
 *     // Add field to list
 *     return { result: { fieldId: "xyz-789" } };
 *   }
 * }
 * 
 * // 4. Export catalog
 * export const sharepointCatalog: ActionCatalog<SharePointScope> = {
 *   definitions: [
 *     new CreateListAction(),
 *     new AddFieldAction()
 *   ]
 * };
 * ```
 * 
 * @public
 */
export type ActionCatalog<Scope extends Record<string, unknown>> = Readonly<{
    /**
     * Complete registry of all action definitions.
     * 
     * @remarks
     * Must include definitions for:
     * - All root-level actions (those referenced by the engine's actions schema)
     * - All subactions (those referenced in action schemas)
     * 
     * The engine uses this array to build a verb → definition map
     * for handler and permission checker lookup during execution.
     * 
     * **Order doesn't matter** - the engine indexes by verb.
     * 
     * **Duplicate verbs will cause initialization errors** - ensure
     * each verb appears only once across all definitions.
     */
    definitions: ReadonlyArray<AnyActionDefinition<Scope>>;
}>;
