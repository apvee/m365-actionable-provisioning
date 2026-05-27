/**
 * SharePoint action registry with lazy handler instantiation.
 *
 * @remarks
 * Provides a registry for SharePoint action handlers with factory-based
 * lazy instantiation and singleton caching per verb.
 *
 * **Key Features:**
 * - Factory-based registration (handlers not instantiated at import)
 * - Lazy instantiation on first `get(verb)` call
 * - Singleton caching (each handler instantiated only once)
 * - Engine-compatible `definitions` getter
 *
 * **Key Exports:**
 * - `ActionRegistry` - Registry class for action handlers
 * - `actionRegistry` - Pre-configured singleton instance
 *
 * @packageDocumentation
 */

import type { AnyActionDefinition } from "../../core/action";
import type { SPScope } from "../types";

/* ========================================
   TYPE DEFINITIONS
   ======================================== */

/**
 * Factory function that creates an action definition instance.
 *
 * @typeParam TDefinition - The action definition type
 * @returns A new action definition instance
 *
 * @public
 */
export type ActionFactory<TDefinition> = () => TDefinition;

/**
 * SharePoint-specific action definition type.
 *
 * @public
 */
export type SPActionDefinition = AnyActionDefinition<SPScope>;

/* ========================================
   ACTION REGISTRY CLASS
   ======================================== */

/**
 * Registry for SharePoint action handlers with lazy instantiation.
 *
 * @remarks
 * This class manages the registration and retrieval of action handlers.
 * Handlers are registered as factory functions and only instantiated
 * when first requested via `get(verb)`.
 *
 * **Lazy Loading Benefits:**
 * - Reduced initial import memory footprint
 * - Faster module loading
 * - Handlers only created when actually needed
 *
 * **Singleton Pattern:**
 * Each handler is instantiated only once and cached for subsequent requests.
 *
 * @example
 * ```typescript
 * // Registration (at module load time - no instantiation yet)
 * registry.register("createSPSite", () => new CreateSPSiteAction());
 *
 * // First access (triggers instantiation)
 * const handler = registry.get("createSPSite");
 *
 * // Subsequent access (returns cached instance)
 * const sameHandler = registry.get("createSPSite"); // handler === sameHandler
 * ```
 *
 * @internal - Use `actionRegistry` singleton instead of creating instances
 */
export class ActionRegistry {
  /**
   * Map of verb -> factory function.
   * Factories are called lazily on first `get()` call.
   */
  private readonly factories = new Map<string, ActionFactory<SPActionDefinition>>();

  /**
   * Cache of instantiated handlers.
   * Once a handler is created, it's stored here for subsequent requests.
   */
  private readonly instances = new Map<string, SPActionDefinition>();

  /**
   * Registers an action factory for a given verb.
   *
   * @param verb - The action verb (e.g., "createSPSite")
   * @param factory - Factory function that creates the handler instance
   * @throws Error if verb is already registered
   *
   * @internal
   */
  register(verb: string, factory: ActionFactory<SPActionDefinition>): void {
    if (this.factories.has(verb)) {
      throw new Error(`Action verb "${verb}" is already registered`);
    }
    this.factories.set(verb, factory);
  }

  /**
   * Gets an action handler by verb.
   *
   * @remarks
   * On first call for a given verb, the factory is invoked to create
   * the handler instance, which is then cached. Subsequent calls
   * return the cached instance.
   *
   * @param verb - The action verb to look up
   * @returns The action definition instance
   * @throws Error if verb is not registered or factory fails
   *
   * @public
   */
  get(verb: string): SPActionDefinition {
    // Return cached instance if available
    const cached = this.instances.get(verb);
    if (cached !== undefined) {
      return cached;
    }

    // Get factory and validate
    const factory = this.factories.get(verb);
    if (factory === undefined) {
      throw new Error(
        `Unknown action verb "${verb}". Available verbs: ${[...this.factories.keys()].join(", ")}`
      );
    }

    // Instantiate with error handling
    let instance: SPActionDefinition;
    try {
      instance = factory();
    } catch (cause) {
      throw new Error(
        `Failed to instantiate handler for verb "${verb}": ${cause instanceof Error ? cause.message : String(cause)}`
      );
    }

    // Cache and return
    this.instances.set(verb, instance);
    return instance;
  }

  /**
   * Checks if a verb is registered.
   *
   * @param verb - The action verb to check
   * @returns True if the verb is registered
   *
   * @public
   */
  has(verb: string): boolean {
    return this.factories.has(verb);
  }

  /**
   * Gets all registered verb names.
   *
   * @returns A read-only set of all registered verbs
   *
   * @public
   */
  get verbs(): ReadonlySet<string> {
    return new Set(this.factories.keys());
  }

  /**
   * Gets all action definitions as an array.
   *
   * @remarks
   * This getter instantiates ALL handlers on first access.
   * Use for engine compatibility with the existing `definitions` array pattern.
   *
   * **Note:** Individual `get(verb)` calls still benefit from lazy loading
   * if `definitions` is never accessed.
   *
   * @returns Read-only array of all action definitions
   *
   * @public
   */
  get definitions(): ReadonlyArray<SPActionDefinition> {
    // Ensure all handlers are instantiated
    for (const verb of this.factories.keys()) {
      if (!this.instances.has(verb)) {
        this.get(verb); // Triggers instantiation
      }
    }
    return [...this.instances.values()];
  }
}

/* ========================================
   SINGLETON INSTANCE
   ======================================== */

// Import action handlers for registration
import {
  CreateSPSiteAction,
  ModifySPSiteAction,
  DeleteSPSiteAction,
} from "./actions/sites";

import {
  CreateSPListAction,
  ModifySPListAction,
  DeleteSPListAction,
  EnableSPListRatingAction,
} from "./actions/lists";

import {
  AddSPFieldAction,
  CreateSPSiteColumnAction,
  ModifySPFieldAction,
  DeleteSPFieldAction,
} from "./actions/fields";

/**
 * Creates and configures the singleton action registry.
 *
 * @returns Configured ActionRegistry instance
 *
 * @internal
 */
function createActionRegistry(): ActionRegistry {
  const registry = new ActionRegistry();

  // Register site actions
  registry.register("createSPSite", () => new CreateSPSiteAction());
  registry.register("modifySPSite", () => new ModifySPSiteAction());
  registry.register("deleteSPSite", () => new DeleteSPSiteAction());

  // Register list actions
  registry.register("createSPList", () => new CreateSPListAction());
  registry.register("modifySPList", () => new ModifySPListAction());
  registry.register("deleteSPList", () => new DeleteSPListAction());
  registry.register("enableSPListRating", () => new EnableSPListRatingAction());

  // Register field actions - NEW ALIGNED VERBS
  registry.register("addSPField", () => new AddSPFieldAction());
  registry.register("createSPSiteColumn", () => new CreateSPSiteColumnAction());
  registry.register("modifySPField", () => new ModifySPFieldAction());
  registry.register("deleteSPField", () => new DeleteSPFieldAction());

  return registry;
}

/**
 * Singleton SharePoint action registry.
 *
 * @remarks
 * Pre-configured registry with all SharePoint action handlers.
 * Handlers are registered as factories and instantiated lazily.
 *
 * **Usage:**
 * ```typescript
 * import { actionRegistry } from "./catalogs";
 *
 * // Check if verb exists
 * if (actionRegistry.has("createSPList")) {
 *   const handler = actionRegistry.get("createSPList");
 * }
 *
 * // Get all definitions (for engine)
 * const definitions = actionRegistry.definitions;
 * ```
 *
 * @public
 */
export const actionRegistry = createActionRegistry();
