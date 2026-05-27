/**
 * Core provisioning engine implementation.
 *
 * @remarks
 * The ProvisioningEngineBase class orchestrates the complete lifecycle of
 * provisioning plan execution including:
 * - Template preprocessing with strict validation
 * - Schema-driven plan parsing and validation
 * - Automatic preflight permission checking
 * - Depth-first execution with scope propagation
 * - Real-time trace updates and observer notifications
 * - Permission caching for performance
 *
 * This is an abstract base class that must be extended with:
 * - Static `definitions` array of all action definitions
 * - Static `provisioningSchema` defining root-level plan validation
 *
 * @packageDocumentation
 */

import { z } from "zod";
import type { JsonValue } from "./json";
import type { Logger } from "./logger";
import type { PermissionCheckResult } from "./permissions";
import type { ActionPath, EngineOutput } from "./trace";
import { buildInitialTrace, markAction } from "./trace";
import type { ActionNode, ActionResult, AnyActionDefinition } from "./action";
import {
    buildProvisioningPlanParameterMap,
    resolveProvisioningPlanPlaceholders,
    type ProvisioningPlanTemplateError,
    type BaseProvisioningPlan,
} from "./provisioning-plan";
import { nowIso, deepMerge, normalizeError } from "./utils";
import type { CompliancePolicy, ComplianceReport } from "./compliance";
import { computeComplianceOverall } from "./compliance";
import type { EngineComplianceSnapshot } from "./trace";
import { buildInitialComplianceTrace, markCompliance } from "./trace";
import {
    defaultOptions,
    buildDefinitionMap,
    collectPreorderPathVerb,
    collectPreorder,
    PermissionCache,
    type EngineOptionsInternal,
} from "./engine-internals";

/**
 * Engine execution status.
 *
 * @remarks
 * Status progression:
 * `idle` → `preprocessing` → `preflightPermissions` → `idle` → `running` → `completed` or `failed` or `cancelled`
 *
 * - `idle`: Engine is initialized and ready to execute
 * - `preprocessing`: Expanding templates and parsing plan
 * - `preflightPermissions`: Checking permissions before execution
 * - `running`: Executing actions
 * - `completed`: All actions completed successfully
 * - `failed`: Execution stopped due to an error
 * - `cancelled`: Execution was cancelled by user
 * 
 * @public
 */
export type EngineStatus =
    | "idle"
    | "preprocessing"
    | "preflightPermissions"
    | "running"
    | "completed"
    | "failed"
    | "cancelled";

/**
 * Immutable snapshot of engine state at a point in time.
 * 
 * @remarks
 * Observers receive snapshots whenever the engine state changes.
 * Snapshots are immutable and can be safely retained or compared.
 * 
 * @public
 */
export type EngineSnapshot = Readonly<{
    /** Current execution status */
    status: EngineStatus;

    /** Current output (trace and results) */
    out: EngineOutput;

    /** Optional cursor indicating the currently executing action */
    cursor?: {
        /** Path of the current action */
        path?: ActionPath;

        /** Verb of the current action */
        verb?: string
    };

    /** Optional error details if status is "failed" */
    error?: {
        /** Error message */
        message: string;

        /** Optional error code */
        code?: string;

        /** Optional structured error details */
        details?: unknown
    };

    /** Optional realtime compliance snapshot while `checkCompliance()` runs. */
    compliance?: EngineComplianceSnapshot;
}>;

/**
 * Immutable snapshot of engine state with typed action results.
 *
 * @remarks
 * Use this when you want `out.byAction[*].result` to be strongly typed.
 * `EngineSnapshot` remains as a convenient default using `JsonValue`.
 *
 * @public
 */
export type EngineSnapshotTyped<TResult extends JsonValue> = Omit<EngineSnapshot, "out"> & {
    out: EngineOutput<TResult>;
};

/**
 * Observer callback function for engine state changes.
 *
 * @param snap - The current engine snapshot
 *
 * @internal
 */
type Observer<TResult extends JsonValue = JsonValue> = (snap: EngineSnapshotTyped<TResult>) => void;

/**
 * Configuration options for engine behavior.
 *
 * @remarks
 * All options have sensible defaults and are optional.
 *
 * @public
 */
export type EngineOptions = EngineOptionsInternal;

/**
 * Abstract base class for provisioning engines.
 *
 * @remarks
 * Orchestrates template preprocessing, schema validation, preflight permission checks,
 * and depth-first action execution with real-time trace updates.
 *
 * Subclasses must define:
 * - `static provisioningSchema` - Zod schema for root-level plan validation
 * - `static definitions` - Registry of all action definitions
 *
 * @example
 * ```typescript
 * class MyEngine extends ProvisioningEngineBase<MyScope> {
 *   protected static readonly provisioningSchema = z.array(z.union([createListSchema]));
 *   protected static readonly definitions = [new CreateListAction()];
 * }
 * const engine = new MyEngine({ initialScope, planTemplate, logger });
 * const result = await engine.run();
 * ```
 *
 * @public
 */
export abstract class ProvisioningEngineBase<
    Scope extends Record<string, unknown>,
    TResult extends JsonValue = JsonValue
> {
    /**
     * Static Zod schema defining the root-level plan structure.
     * @remarks
     * This schema defines which actions are allowed at the root level.
     * Typically a `z.array(z.union([...root action schemas]))`.
     * 
     * The engine uses this schema to parse and validate the plan after
     * parsing. Governance (subactions) is encoded within each
     * action's schema, not managed by the engine.
     * 
     * **Must be defined by subclasses.**
     */
    protected static readonly provisioningSchema: z.ZodType<BaseProvisioningPlan>;

    /**
     * Complete registry of action definitions.
     * 
     * @remarks
     * Must be defined by subclasses. Should contain one definition for every
     * verb that can appear in plans (both root and subactions).
     * 
     * Used by the engine to build the verb → definition map for handler/permission
     * lookup during execution.
     */
    protected static readonly definitions: ReadonlyArray<AnyActionDefinition>;

    private readonly initialScope: Scope;
    private readonly planTemplateRaw: BaseProvisioningPlan;
    private readonly logger: Logger;
    private readonly options: Required<EngineOptions>;

    private observers: Set<Observer<TResult>> = new Set();
    private cancelled = false;

    private compliance?: EngineComplianceSnapshot;
    private complianceCancel?: { cancelled: boolean };

    private status: EngineStatus = "idle";
    private out!: EngineOutput<TResult>;

    private plan!: BaseProvisioningPlan;
    private defByVerb!: Record<string, AnyActionDefinition<Scope, TResult>>;

    private readonly permCache = new PermissionCache();

    private readonly complianceDefaultPolicy: Required<CompliancePolicy> = {
        treatUnverifiableAs: "warning",
    };

    /**
     * Constructs a new engine instance.
     * 
     * @param args - Engine configuration
     * @param args.initialScope - Initial scope for root actions
        * @param args.planTemplate - Action plan (static JSON)
     * @param args.logger - Logger instance for recording execution
     * @param args.options - Optional configuration overrides
     * 
     * @remarks
     * The constructor does NOT start execution. Call `run()` to begin.
        * The plan is parsed and validated when `run()` is called.
     */
    protected constructor(args: {
        initialScope: Scope;
        planTemplate: BaseProvisioningPlan;
        logger: Logger;
        options?: EngineOptions
    }) {
        this.initialScope = args.initialScope;
        this.planTemplateRaw = args.planTemplate;
        this.logger = args.logger;
        this.options = defaultOptions(args.options);
    }

    /**
     * Optional engine-specific context validation.
     *
     * @remarks
     * Override in specialized engines to validate required context before the pipeline starts.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async validateEngineContextOrThrow(_scope: Scope): Promise<void> {
        // no-op by default
    }

    /**
     * Optional async error enrichment hook.
     * @remarks Override in specialized engines to extract structured details from known error types.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async enrichCaughtError(
        _err: unknown,
        _ctx: { phase: "preflight" | "execute"; path?: ActionPath; verb?: string }
    ): Promise<unknown | undefined> {
        return undefined;
    }

    /**
     * Subscribes to engine state changes.
     * @param fn - Observer callback function
     * @returns Subscription object with `unsubscribe` method
     * @example
     * ```typescript
     * const sub = engine.subscribe((snapshot) => {
     *   console.log(`Status changed to: ${snapshot.status}`);
     * });
     * sub.unsubscribe();
     * ```
     * @public
     */
    public subscribe(fn: Observer<TResult>): { unsubscribe: () => void } {
        this.observers.add(fn);
        fn(this.snapshot());
        return { unsubscribe: () => this.observers.delete(fn) };
    }

    /**
     * Cancels the current execution. Cooperative - actions currently running will complete.
     * @public
     */
    public cancel(): void {
        this.cancelled = true;
        if (this.complianceCancel) this.complianceCancel.cancelled = true;

        if (this.compliance) {
            const endedAt = nowIso();
            const prevTrace = this.compliance.trace;
            const nextByPath: typeof prevTrace.byPath = { ...prevTrace.byPath };

            for (const p of prevTrace.order) {
                const it = prevTrace.byPath[p];
                if (!it) continue;
                if (it.status !== "idle" && it.status !== "running") continue;

                const durationMs = it.startedAt ? Date.parse(endedAt) - Date.parse(it.startedAt) : undefined;
                nextByPath[p] = { ...it, status: "cancelled", endedAt, durationMs };
            }

            const nextCounts = {
                idle: 0,
                running: 0,
                cancelled: 0,
                blocked: 0,
                compliant: 0,
                non_compliant: 0,
                unverifiable: 0,
                ignored: 0,
            } as typeof prevTrace.counts;

            for (const p of prevTrace.order) {
                const s = nextByPath[p]?.status;
                if (!s) continue;
                nextCounts[s] = (nextCounts[s] ?? 0) + 1;
            }

            this.compliance = {
                ...this.compliance,
                status: "cancelled",
                trace: { ...prevTrace, byPath: nextByPath, counts: nextCounts },
            };

            this.emit();
        }

        if (this.status === "preprocessing" || this.status === "preflightPermissions" || this.status === "running") {
            this.status = "cancelled";
            this.emit();
        }
    }

    /**
     * Merges a scope delta into the current scope. Override to customize merge behavior.
     */
    protected mergeScope(base: Scope, delta: unknown): Scope {
        return deepMerge(base, delta);
    }

    /**
     * Runs the complete provisioning pipeline: initialize → preflight permissions → execute.
     * Idempotent - multiple calls have no effect after the first call completes.
     * @public
     */
    public async run(): Promise<EngineSnapshotTyped<TResult>> {
        if (this.status === "preprocessing" || this.status === "preflightPermissions" || this.status === "running") {
            return this.snapshot();
        }
        this.cancelled = false;

        try {
            await this.validateEngineContextOrThrow(this.initialScope);
            await this.initializeOrThrow();
            await this.preflightPermissions();
            if (this.status === "failed" || this.status === "cancelled") return this.snapshot();
            await this.execute();
            return this.snapshot();
        } catch (e) {
            const message = normalizeError(e).message;
            const enriched = await this.enrichCaughtError(e, { phase: "preflight" });

            this.status = "failed";
            this.emit({
                error: {
                    message,
                    code: "ENGINE_FAIL",
                    ...(enriched !== undefined ? { details: enriched } : {}),
                },
            });

            this.logger.error("Engine failed", e, enriched !== undefined ? { enriched } : undefined);
            return this.snapshot();
        }
    }

    /**
     * Checks the current environment for compliance with the desired state implied by the plan.
     *
     * @remarks
     * Side-effect free traversal that mirrors execution scope propagation.
     * Non-compliant actions block their descendants from evaluation.
     *
     * @param policy - Optional compliance policy overrides
     * @returns Compliance report with results for all actions
     */
    public async checkCompliance(policy?: CompliancePolicy): Promise<ComplianceReport> {
        const checkedAt = new Date().toISOString();
        const mergedPolicy: Required<CompliancePolicy> = { ...this.complianceDefaultPolicy, ...(policy ?? {}) };

        if (this.complianceCancel && !this.complianceCancel.cancelled) {
            throw new Error("Compliance check already running");
        }

        const cancel = { cancelled: false };
        this.complianceCancel = cancel;

        const isCancelled = (): boolean => cancel.cancelled;

        try {
            this.ensureRegistryAndPlanOrThrow();

            const plan = this.plan;
            const defByVerb = this.defByVerb;

            const preorder = collectPreorder(plan.actions);

            // Initialize realtime compliance trace (stable order) and emit initial snapshot.
            this.compliance = {
                status: "running",
                checkedAt,
                policy: mergedPolicy,
                trace: buildInitialComplianceTrace(preorder.map((p) => ({ path: p.path, verb: p.verb }))),
            };
            this.emit();

            const byPath: ComplianceReport["byPath"] = {};

            const setItem = (it: ComplianceReport["byPath"][string]): void => {
                byPath[it.path] = it;
            };

            const setComplianceTraceItem = (
                path: ActionPath,
                status: Parameters<typeof markCompliance>[2],
                extra?: Parameters<typeof markCompliance>[3]
            ): void => {
                if (!this.compliance) return;
                this.compliance = {
                    ...this.compliance,
                    trace: markCompliance(this.compliance.trace, path, status, extra),
                };
            };

            const markBlockedDeep = (node: ActionNode, path: ActionPath, blockedBy: ActionPath): void => {
                setItem({ path, verb: String(node.verb), checked: false, blockedBy });
                setComplianceTraceItem(path, "blocked", { blockedBy });
                for (let i = 0; i < (node.subactions ?? []).length; i++) {
                    markBlockedDeep(node.subactions![i], `${path}/${i + 1}`, blockedBy);
                }
            };

            const runCheck = async (node: ActionNode, path: ActionPath, scopeIn: Scope): Promise<Scope> => {
                if (isCancelled()) return scopeIn;

                const verb = String(node.verb);
                const def = defByVerb[verb];

                const log = this.logger.withScope({ phase: "compliance", path, verb });

                const startedAt = nowIso();
                setComplianceTraceItem(path, "running", { startedAt });
                this.emit({ cursor: { path, verb } });

                if (!def) {
                    setItem({
                        path,
                        verb,
                        checked: true,
                        outcome: "unverifiable",
                        reason: "unknown_verb",
                        message: `No action definition registered for verb="${verb}"`,
                    });

                    const endedAt = nowIso();
                    const durationMs = Date.parse(endedAt) - Date.parse(startedAt);
                    setComplianceTraceItem(path, "unverifiable", {
                        endedAt,
                        durationMs,
                        reason: "unknown_verb",
                        message: `No action definition registered for verb="${verb}"`,
                    });
                    this.emit();

                    let cur = scopeIn;
                    for (let i = 0; i < (node.subactions ?? []).length; i++) {
                        if (isCancelled()) return cur;
                        cur = await runCheck(node.subactions![i], `${path}/${i + 1}`, cur);
                    }
                    return cur;
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { subactions: _unused, ...rest } = node;
                const payload = rest as z.infer<typeof def.actionSchema>;

                if (def.requiresScopeSchema && !def.requiresScopeSchema.safeParse(scopeIn).success) {
                    setItem({
                        path,
                        verb,
                        checked: true,
                        outcome: "unverifiable",
                        reason: "missing_prerequisite",
                    });

                    const endedAt = nowIso();
                    const durationMs = Date.parse(endedAt) - Date.parse(startedAt);
                    setComplianceTraceItem(path, "unverifiable", {
                        endedAt,
                        durationMs,
                        reason: "missing_prerequisite",
                    });
                    this.emit();
                } else if (typeof def.checkCompliance !== "function") {
                    setItem({
                        path,
                        verb,
                        checked: true,
                        outcome: "unverifiable",
                        reason: "not_supported",
                    });

                    const endedAt = nowIso();
                    const durationMs = Date.parse(endedAt) - Date.parse(startedAt);
                    setComplianceTraceItem(path, "unverifiable", {
                        endedAt,
                        durationMs,
                        reason: "not_supported",
                    });
                    this.emit();
                } else {
                    try {
                        const res = await def.checkCompliance({
                            scopeIn,
                            logger: log,
                            action: { path, verb, payload },
                        });

                        if (isCancelled()) return scopeIn;

                        setItem({
                            path,
                            verb,
                            checked: true,
                            outcome: res.outcome,
                            resource: res.resource,
                            reason: res.reason,
                            message: res.message,
                            details: res.details,
                        });

                        const endedAt = nowIso();
                        const durationMs = Date.parse(endedAt) - Date.parse(startedAt);
                        setComplianceTraceItem(path, res.outcome, {
                            endedAt,
                            durationMs,
                            resource: res.resource,
                            reason: res.reason,
                            message: res.message,
                            details: res.details,
                        });
                        this.emit();

                        const scopeOut = this.mergeScope(scopeIn, res.scopeDelta);

                        if (res.outcome === "non_compliant") {
                            for (let i = 0; i < (node.subactions ?? []).length; i++) {
                                markBlockedDeep(node.subactions![i], `${path}/${i + 1}`, path);
                            }

                            // Emit once after marking the subtree as blocked.
                            this.emit();
                            return scopeOut;
                        }

                        let cur = scopeOut;
                        for (let i = 0; i < (node.subactions ?? []).length; i++) {
                            if (isCancelled()) return cur;
                            cur = await runCheck(node.subactions![i], `${path}/${i + 1}`, cur);
                        }
                        return cur;
                    } catch (e) {
                        const message = normalizeError(e).message;
                        const enriched = await this.enrichCaughtError(e, { phase: "preflight", path, verb });
                        setItem({
                            path,
                            verb,
                            checked: true,
                            outcome: "unverifiable",
                            reason: "error",
                            message,
                            ...(enriched !== undefined ? { details: enriched } : {}),
                        });

                        const endedAt = nowIso();
                        const durationMs = Date.parse(endedAt) - Date.parse(startedAt);
                        setComplianceTraceItem(path, "unverifiable", {
                            endedAt,
                            durationMs,
                            reason: "error",
                            message,
                            ...(enriched !== undefined ? ({ details: enriched } as const) : {}),
                        });
                        this.emit();
                    }
                }

                // Default recursion path when not returned earlier.
                let cur = scopeIn;
                for (let i = 0; i < (node.subactions ?? []).length; i++) {
                    if (isCancelled()) return cur;
                    cur = await runCheck(node.subactions![i], `${path}/${i + 1}`, cur);
                }
                return cur;
            };

            let scope0 = this.initialScope;
            for (let i = 0; i < plan.actions.length; i++) {
                if (isCancelled()) break;
                scope0 = await runCheck(plan.actions[i], `${i + 1}`, scope0);
            }

            const counts = {
                compliant: 0,
                non_compliant: 0,
                unverifiable: 0,
                ignored: 0,
            } as ComplianceReport["counts"];

            let checked = 0;
            let blocked = 0;
            for (const p of Object.keys(byPath)) {
                const it = byPath[p];
                if (it.checked) {
                    checked++;
                    if (it.outcome) counts[it.outcome]++;
                } else {
                    blocked++;
                }
            }

            const overall = computeComplianceOverall({ counts, policy: mergedPolicy });

            if (this.compliance) {
                this.compliance = {
                    ...this.compliance,
                    status: isCancelled() ? "cancelled" : "completed",
                };
                this.emit();
            }

            return {
                checkedAt,
                total: preorder.length,
                checked,
                blocked,
                counts,
                overall,
                byPath,
            };
        } catch (e) {
            const message = normalizeError(e).message;

            if (this.compliance) {
                this.compliance = {
                    ...this.compliance,
                    status: isCancelled() ? "cancelled" : "failed",
                    ...(isCancelled() ? {} : { error: { message } }),
                };
                this.emit();
            }

            return {
                checkedAt,
                total: 0,
                checked: 0,
                blocked: 0,
                counts: { compliant: 0, non_compliant: 0, unverifiable: 0, ignored: 0 },
                overall: "non_compliant",
                byPath: {},
                error: { message },
            };
        } finally {
            if (this.complianceCancel === cancel) {
                this.complianceCancel = undefined;
            }
        }
    }

    private ensureRegistryAndPlanOrThrow(): void {
        if (this.plan && this.defByVerb) return;

        const { definitions, provisioningSchema } = this.getEngineStaticsOrThrow();
        this.defByVerb = buildDefinitionMap(definitions);
        this.plan = this.parseResolvedPlanOrThrow(provisioningSchema);
    }

    /**
     * Initializes the engine by validating the registry and parsing the plan.
     * @internal
     */
    private async initializeOrThrow(): Promise<void> {
        const { definitions, provisioningSchema } = this.getEngineStaticsOrThrow();
        this.defByVerb = buildDefinitionMap(definitions);

        this.status = "preprocessing";
        this.emit();

        try {
            this.plan = this.parseResolvedPlanOrThrow(provisioningSchema);
        } catch (e) {
            this.status = "failed";

            const isZodError = e && typeof e === "object" && "issues" in e;
            const isTemplateError = e &&
                typeof e === "object" &&
                "name" in e &&
                (e as { name?: unknown }).name === "ProvisioningPlanTemplateError";

            const zodError = isZodError ? (e as z.ZodError) : undefined;
            const templateError = isTemplateError ? (e as ProvisioningPlanTemplateError) : undefined;

            const details = templateError
                ? templateError.details
                : (zodError && this.options.captureZodIssuesInTrace ? { issues: zodError.issues } : undefined);

            const message = e && typeof e === "object" && "message" in e
                ? String((e as { message?: unknown }).message)
                : String(e);

            const code = templateError ? "PLAN_TEMPLATE" : (zodError ? "PLAN_ZOD" : "PLAN_INIT");
            this.emit({ error: { message, code, details } });
            return;
        }

        const preorder = collectPreorderPathVerb(this.plan.actions);

        this.out = { byAction: {}, trace: buildInitialTrace(preorder) };
        this.status = "idle";
        this.emit();
    }

    private getEngineStaticsOrThrow(): Readonly<{
        definitions: ReadonlyArray<AnyActionDefinition<Scope, TResult>>;
        provisioningSchema: z.ZodType<BaseProvisioningPlan>;
    }> {
        const ctor = this.constructor as typeof ProvisioningEngineBase & {
            definitions: ReadonlyArray<AnyActionDefinition>;
            provisioningSchema: z.ZodType<BaseProvisioningPlan>;
        };

        const definitions = ctor.definitions as ReadonlyArray<AnyActionDefinition<Scope, TResult>>;
        const provisioningSchema = ctor.provisioningSchema;

        if (!definitions?.length) throw new Error(`Engine subclass must provide static "definitions" (complete registry).`);
        if (!provisioningSchema) throw new Error(`Engine subclass must provide static "provisioningSchema".`);

        return { definitions, provisioningSchema } as const;
    }

    private parseResolvedPlanOrThrow(provisioningSchema: z.ZodType<BaseProvisioningPlan>): BaseProvisioningPlan {
        const paramMap = buildProvisioningPlanParameterMap(this.planTemplateRaw.parameters);
        const resolvedTemplate = {
            ...this.planTemplateRaw,
            actions: resolveProvisioningPlanPlaceholders(this.planTemplateRaw.actions, paramMap, "actions"),
        } satisfies BaseProvisioningPlan;

        return provisioningSchema.parse(resolvedTemplate) as BaseProvisioningPlan;
    }

    /* -------------------------------- Snapshot/Emit -------------------------------- */

    /**
     * Creates an immutable snapshot of the current engine state.
     * 
     * @param extra - Optional additional properties to merge into the snapshot
     * @returns Complete engine snapshot
     * 
     * @internal
     */
    private snapshot(extra?: Partial<EngineSnapshotTyped<TResult>>): EngineSnapshotTyped<TResult> {
        const base: EngineSnapshotTyped<TResult> = {
            status: this.status,
            out: this.out,
            ...(this.compliance ? ({ compliance: this.compliance } as const) : {}),
        };

        return { ...base, ...(extra ?? {}) };
    }

    /**
     * Notifies all observers of a state change.
     * 
     * @param extra - Optional additional snapshot properties
     * 
     * @internal
     */
    private emit(extra?: Partial<EngineSnapshotTyped<TResult>>): void {
        const snap = this.snapshot(extra);
        for (const o of this.observers) o(snap);
    }

    /* -------------------------------- Trace transitions -------------------------------- */

    /**
     * Transitions an action to "success" status with timing info.
     * 
     * @param path - The action path
     * 
     * @internal
     */
    private transitionSuccess(path: ActionPath): void {
        const item = this.out.trace.byPath[path];
        const endedAt = nowIso();
        const durationMs = item.startedAt ? Date.parse(endedAt) - Date.parse(item.startedAt) : undefined;
        this.out = { ...this.out, trace: markAction(this.out.trace, path, "success", { endedAt, durationMs }) };
    }

    /**
     * Transitions an action to "fail" status with error details.
     * 
     * @param path - The action path
     * @param err - The error that caused the failure
     * 
     * @internal
     */
    private transitionFail(path: ActionPath, err: unknown): void {
        const item = this.out.trace.byPath[path];
        const endedAt = nowIso();
        const durationMs = item.startedAt ? Date.parse(endedAt) - Date.parse(item.startedAt) : undefined;

        const zodError = err && typeof err === 'object' && 'issues' in err ? err as z.ZodError : undefined;
        const details = zodError && this.options.captureZodIssuesInTrace ? { issues: zodError.issues } : undefined;
        const errWithCode = err as Error & { code?: string; details?: unknown };
        const code = errWithCode.code === "FORBIDDEN" ? "FORBIDDEN" : zodError ? "ZOD" : "ACTION_FAIL";
        const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : String(err);

        this.out = { ...this.out, trace: markAction(this.out.trace, path, "fail", { endedAt, durationMs, error: { message, code, details } }) };
    }

    /**
     * Updates an action's permission check result in the trace.
     * 
     * @param path - The action path
     * @param permissions - The permission check result
     * @param source - The source of the permission check (preflight, jit, or cache)
     * 
     * @internal
     */
    private setPermissions(path: ActionPath, permissions: PermissionCheckResult, source: "preflight" | "jit" | "cache"): void {
        const prev = this.out.trace.byPath[path];
        this.out = { ...this.out, trace: markAction(this.out.trace, path, prev.status, { permissions, permissionsSource: source }) };
    }

    /** @internal */
    private shouldStop(): boolean {
        return this.status === "failed" || this.status === "cancelled" || this.cancelled;
    }

    /**
     * Performs automatic preflight permission checks where scope requirements are met.
     * @internal
     */
    private async preflightPermissions(): Promise<void> {
        if (this.status !== "idle") return;

        this.status = "preflightPermissions";
        this.emit();

        // Preflight must not mutate the engine's shared initialScope.
        const scope0 = this.initialScope;

        const walk = async (node: ActionNode, path: ActionPath): Promise<void> => {
            if (this.cancelled || this.status === "failed") return;

            const def = this.defByVerb[String(node.verb)];
            if (typeof def.checkPermissions === "function") {
                const requiresOk = def.requiresScopeSchema ? def.requiresScopeSchema.safeParse(scope0).success : true;

                if (requiresOk) {
                    const log = this.logger.withScope({ phase: "preflight", path, verb: String(node.verb) });

                    const payload = node as z.infer<typeof def.actionSchema>;

                    // Use a per-action shallow clone to keep preflight side-effect free.
                    // Shallow is sufficient because our scope is flat (spfi/site/web/list are top-level refs).
                    const scopeForPerms = { ...scope0 } as Scope;

                    const ctx = {
                        scopeIn: scopeForPerms,
                        out: this.out,
                        logger: log,
                        action: { path, verb: String(node.verb), payload },
                    };

                    try {
                        log.info("checkPermissions started");
                        const perm = await def.checkPermissions(ctx);

                        const cached = perm.cache?.key ? this.permCache.read(perm.cache.key) : undefined;
                        if (cached) this.setPermissions(path, cached, "cache");
                        else {
                            this.permCache.write(perm);
                            this.setPermissions(path, perm, "preflight");
                        }
                        this.emit({ cursor: { path, verb: String(node.verb) } });

                        // Only explicit deny blocks execution. Unknown is allowed to proceed.
                        if (perm.decision === "deny") {
                            const denied = new Error(`Permissions denied at preflight for action "${path}" (${String(node.verb)})`) as Error & { code: string; details: unknown };
                            denied.code = "FORBIDDEN";
                            denied.details = perm;
                            this.transitionFail(path, denied);
                            this.status = "failed";
                            this.emit({ cursor: { path, verb: String(node.verb) }, error: { message: denied.message, code: "FORBIDDEN", details: perm } });
                            return;
                        }
                    } catch (e) {
                        this.transitionFail(path, e);
                        this.status = "failed";
                        const message = e && typeof e === 'object' && 'message' in e ? (e as Error).message : String(e);
                        const enriched = await this.enrichCaughtError(e, { phase: "preflight", path, verb: String(node.verb) });
                        this.emit({
                            cursor: { path, verb: String(node.verb) },
                            error: { message, code: "PREFLIGHT_PERMS", ...(enriched !== undefined ? { details: enriched } : {}) },
                        });
                        return;
                    }
                }
            }

            // recurse
            for (let i = 0; i < (node.subactions ?? []).length; i++) {
                if (this.shouldStop()) return;
                const childPath = `${path}/${i + 1}`;
                await walk(node.subactions![i], childPath);
            }
        };

        for (let i = 0; i < this.plan.actions.length; i++) {
            await walk(this.plan.actions[i], `${i + 1}`);
            if (this.shouldStop()) break;
        }

        if (!this.shouldStop()) {
            this.status = "idle";
            this.emit();
        }
    }

    /**
     * Executes the action plan with depth-first traversal.
     * @internal
     */
    private async execute(): Promise<void> {
        this.status = "running";
        this.emit();

        const runAction = async (node: ActionNode, path: ActionPath, scopeIn: Scope): Promise<Scope> => {
            if (this.cancelled) return scopeIn;

            const def = this.defByVerb[String(node.verb)];
            const log = this.logger.withScope({ path, verb: String(node.verb) });

            this.out = { ...this.out, trace: markAction(this.out.trace, path, "running", { startedAt: nowIso() }) };
            this.emit({ cursor: { path, verb: String(node.verb) } });
            log.info("Action started");

            try {
                if (def.requiresScopeSchema) def.requiresScopeSchema.parse(scopeIn);

                const payload = (() => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { subactions: _unused, ...rest } = node;
                    return rest;
                })() as z.infer<typeof def.actionSchema>;

                // JIT perms if not already preflight-allowed
                if (typeof def.checkPermissions === "function") {
                    const existing = this.out.trace.byPath[path]?.permissions;
                    const preflightAllowed = existing?.decision === "allow" && this.out.trace.byPath[path]?.permissionsSource === "preflight";

                    if (!preflightAllowed) {
                        // Permission checks must not mutate the real execution scope.
                        const scopeForPerms = { ...scopeIn } as Scope;

                        const ctx = {
                            scopeIn: scopeForPerms,
                            out: this.out,
                            logger: log.withScope({ phase: "jit" }),
                            action: { path, verb: String(node.verb), payload },
                        };

                        log.info("checkPermissions started");
                        const perm = await def.checkPermissions(ctx);

                        const cached = perm.cache?.key ? this.permCache.read(perm.cache.key) : undefined;
                        if (cached) this.setPermissions(path, cached, "cache");
                        else {
                            this.permCache.write(perm);
                            this.setPermissions(path, perm, "jit");
                        }
                        this.emit({ cursor: { path, verb: String(node.verb) } });

                        // Only explicit deny blocks execution. Unknown is allowed to proceed.
                        if (perm.decision === "deny") {
                            const denied = new Error(`Permissions denied for action "${path}" (${String(node.verb)})`) as Error & { code: string; details: unknown };
                            denied.code = "FORBIDDEN";
                            denied.details = perm;
                            throw denied;
                        }
                    }
                }

                // handler optional (we do NOT implement actions now, per your request)
                let actionResult: ActionResult<Scope, TResult> = {};
                if (def.handler) {
                    const ctx = {
                        scopeIn,
                        out: this.out,
                        logger: log,
                        action: { path, verb: String(node.verb), payload },
                    };
                    const raw = await def.handler(ctx);
                    actionResult = def.resultSchema.parse(raw);
                }

                const scopeOut = this.mergeScope(scopeIn, actionResult.scopeDelta);

                if (actionResult.result !== undefined) {
                    this.out = { ...this.out, byAction: { ...this.out.byAction, [path]: { result: actionResult.result } } };
                }

                // recurse
                let cur = scopeOut;
                for (let i = 0; i < (node.subactions ?? []).length; i++) {
                    cur = await runAction(node.subactions![i], `${path}/${i + 1}`, cur);
                    if (this.shouldStop()) break;
                }

                this.transitionSuccess(path);
                this.emit({ cursor: { path, verb: String(node.verb) } });
                log.info("Action succeeded");
                return cur;
            } catch (e) {
                this.transitionFail(path, e);

                const errWithCode = e as Error & { code?: string; details?: unknown };
                const zodError = e && typeof e === 'object' && 'issues' in e ? e as z.ZodError : undefined;
                const code =
                    errWithCode.code === "FORBIDDEN" ? "FORBIDDEN" :
                        zodError ? "ZOD" :
                            "ACTION_FAIL";

                const enriched = await this.enrichCaughtError(e, { phase: "execute", path, verb: String(node.verb) });
                const details =
                    errWithCode.details === undefined ? enriched :
                        enriched === undefined ? errWithCode.details :
                            { details: errWithCode.details, enriched };

                this.status = "failed";
                this.emit({
                    cursor: { path, verb: String(node.verb) },
                    error: {
                        message: e && typeof e === 'object' && 'message' in e ? (e as Error).message : String(e),
                        code,
                        ...(details !== undefined ? { details } : {}),
                    },
                });
                log.error("Action failed", e, enriched !== undefined ? { enriched } : undefined);
                if (this.options.failFast) return scopeIn;
                return scopeIn;
            }
        };

        let scope: Scope = this.initialScope;
        for (let i = 0; i < this.plan.actions.length; i++) {
            scope = await runAction(this.plan.actions[i], `${i + 1}`, scope);
            if (this.shouldStop()) break;
        }

        if (this.cancelled) this.status = "cancelled";
        else if ((this.status as EngineStatus) !== "failed") this.status = "completed";
        this.emit();
    }
}
