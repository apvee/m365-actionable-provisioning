/**
 * Internal helpers for the provisioning engine.
 *
 * @remarks
 * This module contains implementation details extracted from `engine.ts` to reduce
 * complexity and improve maintainability. All exports are internal and should NOT
 * be used by consumers.
 *
 * @internal
 * @packageDocumentation
 */

import { z } from "zod";
import type { ActionPath } from "./trace";
import type { ActionNode, AnyActionDefinition } from "./action";
import type { PermissionCheckResult } from "./permissions";
import type { JsonValue } from "./json";

/* -------------------------------- Option Defaults -------------------------------- */

/**
 * Configuration options for engine behavior.
 *
 * @internal
 */
export type EngineOptionsInternal = Readonly<{
    /**
     * Whether to capture Zod validation issues in trace error details.
     * @defaultValue true
     */
    captureZodIssuesInTrace?: boolean;

    /**
     * Whether to stop execution immediately on first action failure.
     * @defaultValue true
     */
    failFast?: boolean;
}>;

/**
 * Merges user options with defaults.
 *
 * @param opts - Optional user configuration
 * @returns Complete options with all properties defined
 *
 * @internal
 */
export const defaultOptions = (opts?: EngineOptionsInternal): Required<EngineOptionsInternal> => ({
    captureZodIssuesInTrace: opts?.captureZodIssuesInTrace ?? true,
    failFast: opts?.failFast ?? true,
});

/* -------------------------------- Definition Map -------------------------------- */

/**
 * Builds a verb → definition lookup map from an array of action definitions.
 *
 * @param definitions - Array of action definitions
 * @returns Map of verb string to action definition
 * @throws Error if duplicate verbs are detected
 *
 * @internal
 */
export const buildDefinitionMap = <
    Scope extends Record<string, unknown>,
    TResult extends JsonValue = JsonValue
>(
    definitions: ReadonlyArray<AnyActionDefinition<Scope, TResult>>
): Record<string, AnyActionDefinition<Scope, TResult>> => {
    const defByVerb: Record<string, AnyActionDefinition<Scope, TResult>> = {};
    for (const d of definitions) {
        if (defByVerb[d.verb]) {
            throw new Error(`Duplicate definition for verb "${d.verb}".`);
        }
        defByVerb[d.verb] = d;
    }
    return defByVerb;
};

/* -------------------------------- Preorder Traversal -------------------------------- */

/**
 * Item in the preorder traversal of the action tree.
 *
 * @internal
 */
export interface PreorderItem {
    /** 1-based path like "1", "1/2", "1/2/1" */
    path: ActionPath;
    /** Verb string */
    verb: string;
    /** The action node */
    node: ActionNode;
}

/**
 * Collects all actions in depth-first preorder traversal.
 *
 * @param actions - Root-level actions array
 * @returns Flat array of path/verb/node tuples in preorder
 *
 * @remarks
 * Used by:
 * - `initializeOrThrow()` to build initial trace
 * - `checkCompliance()` to initialize compliance trace
 *
 * @internal
 */
export const collectPreorder = (actions: readonly ActionNode[]): PreorderItem[] => {
    const result: PreorderItem[] = [];

    const walk = (node: ActionNode, parent: ActionPath | null, index: number): void => {
        const path: ActionPath = parent ? `${parent}/${index + 1}` : `${index + 1}`;
        result.push({ path, verb: String(node.verb), node });
        (node.subactions ?? []).forEach((ch, i) => walk(ch, path, i));
    };

    actions.forEach((a, i) => walk(a, null, i));
    return result;
};

/**
 * Simplified preorder item without node reference.
 *
 * @internal
 */
export interface PreorderPathVerb {
    path: ActionPath;
    verb: string;
}

/**
 * Collects path and verb only (lighter version for trace building).
 *
 * @param actions - Root-level actions array
 * @returns Flat array of path/verb tuples in preorder
 *
 * @internal
 */
export const collectPreorderPathVerb = (actions: readonly ActionNode[]): PreorderPathVerb[] => {
    const result: PreorderPathVerb[] = [];

    const walk = (node: ActionNode, parent: ActionPath | null, index: number): void => {
        const path: ActionPath = parent ? `${parent}/${index + 1}` : `${index + 1}`;
        result.push({ path, verb: String(node.verb) });
        (node.subactions ?? []).forEach((ch, i) => walk(ch, path, i));
    };

    actions.forEach((a, i) => walk(a, null, i));
    return result;
};

/* -------------------------------- Permission Cache -------------------------------- */

/**
 * Cache entry for permission check results.
 *
 * @internal
 */
interface PermCacheEntry {
    result: PermissionCheckResult;
    expiresAt?: number;
}

/**
 * Permission cache manager.
 *
 * @remarks
 * Stores permission check results with optional TTL-based expiration.
 * Used to avoid redundant permission checks during preflight and execution.
 *
 * @internal
 */
export class PermissionCache {
    private cache = new Map<string, PermCacheEntry>();

    /**
     * Reads a permission check result from cache.
     *
     * @param key - The cache key
     * @returns The cached result if found and not expired, undefined otherwise
     */
    read(key: string): PermissionCheckResult | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.result;
    }

    /**
     * Writes a permission check result to cache.
     *
     * @param result - The permission check result (must include cache.key to be stored)
     */
    write(result: PermissionCheckResult): void {
        const key = result.cache?.key;
        if (!key) return;
        const ttlMs = result.cache?.ttlMs;
        const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
        this.cache.set(key, { result, expiresAt });
    }

    /**
     * Clears all cached entries.
     */
    clear(): void {
        this.cache.clear();
    }
}

/* -------------------------------- Error Extraction -------------------------------- */

/**
 * Extracts error details for trace recording.
 *
 * @param err - The caught error
 * @param captureZodIssues - Whether to include Zod issues in details
 * @returns Structured error information for trace
 *
 * @internal
 */
export const extractErrorDetails = (
    err: unknown,
    captureZodIssues: boolean
): {
    message: string;
    code: string;
    details?: { issues: z.ZodIssue[] };
} => {
    const zodError = err && typeof err === "object" && "issues" in err
        ? (err as z.ZodError)
        : undefined;

    const errWithCode = err as Error & { code?: string };
    const code = errWithCode.code === "FORBIDDEN"
        ? "FORBIDDEN"
        : zodError
            ? "ZOD"
            : "ACTION_FAIL";

    const message = err && typeof err === "object" && "message" in err
        ? (err as Error).message
        : String(err);

    const details = zodError && captureZodIssues
        ? { issues: zodError.issues }
        : undefined;

    return { message, code, details };
};

/* -------------------------------- Observer Type -------------------------------- */

/**
 * Observer callback function for engine state changes.
 *
 * @param snap - The current engine snapshot
 *
 * @internal
 */
export type EngineObserver<TResult extends JsonValue = JsonValue> = (
    snap: EngineSnapshotInternal<TResult>
) => void;

/**
 * Minimal engine snapshot shape for observers (avoids circular import).
 *
 * @internal
 */
export interface EngineSnapshotInternal<TResult extends JsonValue = JsonValue> {
    status: string;
    out: {
        byAction: Record<string, { result: TResult }>;
        trace: unknown;
    };
    cursor?: { path?: ActionPath; verb?: string };
    error?: { message: string; code?: string; details?: unknown };
    compliance?: unknown;
}
