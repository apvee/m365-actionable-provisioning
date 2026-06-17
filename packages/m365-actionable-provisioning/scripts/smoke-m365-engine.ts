import { z } from "zod";

import { ActionDefinition, defaultActionResultSchema, type ActionRuntimeContext } from "../src/core/action";
import { ProvisioningEngine } from "../src/core/engine";
import { createLogger, createMultiSink, type LogEvent } from "../src/core/logger";
import { createProvisioningPlanSchema, type BaseProvisioningPlan } from "../src/core/provisioning-plan";
import type { PermissionCheckResult } from "../src/core/permissions";
import { sharePointActionDefinitions, sharePointActionsSchema } from "../src/actions/sharepoint";
import { sharePointActionModules } from "../src/actions/sharepoint/action-modules";
import { contentTypeSubactionSchema } from "../src/actions/sharepoint/_composition/content-type-subactions-schema";
import { listSubactionSchema } from "../src/actions/sharepoint/_composition/list-subactions-schema";
import { siteSubactionSchema } from "../src/actions/sharepoint/_composition/site-subactions-schema";
import { CreateSPSiteColumnAction } from "../src/actions/sharepoint/fields/create-sp-site-column";
import { resolveFieldReferenceFromScope } from "../src/actions/sharepoint/domains/content-types";
import { checkFieldStructuralCompatibility } from "../src/actions/sharepoint/domains/fields/field-structural-compatibility";
import { checkListStructuralCompatibility } from "../src/actions/sharepoint/domains/lists/list-structural-compatibility";
import type { M365Clients, M365Scope, ProvisioningResultLight } from "../src/runtime";

type SmokeScope = {
  parentReady?: boolean;
};

type SmokeClients = {
  spfi?: { marker: "spfi" };
  graphClient?: { marker: "graph" };
};

type SmokeWarningDetails = null | boolean | number | string | readonly SmokeWarningDetails[] | {
  readonly [key: string]: SmokeWarningDetails;
};

type SmokeWarning = {
  code: string;
  message: string;
  details?: SmokeWarningDetails;
};

type SmokeResult =
  | { outcome: "executed"; resource: string; warnings?: readonly SmokeWarning[] }
  | { outcome: "skipped"; resource: string; reason: string; warnings?: readonly SmokeWarning[] };

const graphSmokeSchema = z.object({
  verb: z.literal("graphSmoke"),
  resource: z.string(),
  subactions: z.array(z.never()).optional(),
});

const spSmokeSchema = z.object({
  verb: z.literal("spSmoke"),
  resource: z.string(),
  subactions: z.array(z.never()).optional(),
});

const failSmokeSchema = z.object({
  verb: z.literal("failSmoke"),
  resource: z.string(),
  subactions: z.array(z.never()).optional(),
});

const permissionSmokeSchema = z.object({
  verb: z.literal("permissionSmoke"),
  resource: z.string(),
  subactions: z.array(z.never()).optional(),
});

const successSmokeSchema = z.object({
  verb: z.literal("successSmoke"),
  resource: z.string(),
  subactions: z.array(z.never()).optional(),
});

const complianceSmokeSchema = z.object({
  verb: z.literal("complianceSmoke"),
  resource: z.string(),
  subactions: z.array(z.never()).optional(),
});

const smokeActionSchema = z.discriminatedUnion("verb", [
  graphSmokeSchema,
  spSmokeSchema,
  failSmokeSchema,
  permissionSmokeSchema,
  successSmokeSchema,
  complianceSmokeSchema,
]);

const smokeProvisioningSchema = createProvisioningPlanSchema(z.array(smokeActionSchema));

class GraphSmokeAction extends ActionDefinition<
  "graphSmoke",
  typeof graphSmokeSchema,
  SmokeScope,
  SmokeResult,
  SmokeClients
> {
  readonly verb = "graphSmoke";
  readonly actionSchema = graphSmokeSchema;
  readonly requiredClients = ["graphClient"] as const;

  override async handler(ctx: ActionRuntimeContext<SmokeScope, z.infer<typeof graphSmokeSchema>, SmokeResult, SmokeClients>) {
    if (!ctx.clients.graphClient) throw new Error("Graph client was not passed to handler");
    return { result: { outcome: "executed" as const, resource: ctx.action.payload.resource } };
  }
}

class SpSmokeAction extends ActionDefinition<
  "spSmoke",
  typeof spSmokeSchema,
  SmokeScope,
  SmokeResult,
  SmokeClients
> {
  readonly verb = "spSmoke";
  readonly actionSchema = spSmokeSchema;
  readonly requiredClients = ["spfi"] as const;

  override async handler(ctx: ActionRuntimeContext<SmokeScope, z.infer<typeof spSmokeSchema>, SmokeResult, SmokeClients>) {
    if (!ctx.clients.spfi) throw new Error("SPFI client was not passed to handler");
    return { result: { outcome: "executed" as const, resource: ctx.action.payload.resource } };
  }
}

class FailSmokeAction extends ActionDefinition<
  "failSmoke",
  typeof failSmokeSchema,
  SmokeScope,
  SmokeResult,
  SmokeClients
> {
  readonly verb = "failSmoke";
  readonly actionSchema = failSmokeSchema;

  override async handler() {
    throw new Error("intentional smoke failure");
  }
}

class PermissionSmokeAction extends ActionDefinition<
  "permissionSmoke",
  typeof permissionSmokeSchema,
  SmokeScope,
  SmokeResult,
  SmokeClients
> {
  readonly verb = "permissionSmoke";
  readonly actionSchema = permissionSmokeSchema;
  readonly requiredClients = ["spfi"] as const;

  constructor(private readonly onPermissionCheck: () => void) {
    super();
  }

  override async checkPermissions(): Promise<PermissionCheckResult> {
    this.onPermissionCheck();
    return { decision: "allow", message: "smoke permission allowed" };
  }

  override async handler(ctx: ActionRuntimeContext<SmokeScope, z.infer<typeof permissionSmokeSchema>, SmokeResult, SmokeClients>) {
    return { result: { outcome: "executed" as const, resource: ctx.action.payload.resource } };
  }
}

class SuccessSmokeAction extends ActionDefinition<
  "successSmoke",
  typeof successSmokeSchema,
  SmokeScope,
  SmokeResult,
  SmokeClients
> {
  readonly verb = "successSmoke";
  readonly actionSchema = successSmokeSchema;

  override async handler(ctx: ActionRuntimeContext<SmokeScope, z.infer<typeof successSmokeSchema>, SmokeResult, SmokeClients>) {
    return { result: { outcome: "executed" as const, resource: ctx.action.payload.resource } };
  }
}

class ComplianceSmokeAction extends ActionDefinition<
  "complianceSmoke",
  typeof complianceSmokeSchema,
  SmokeScope,
  SmokeResult,
  SmokeClients
> {
  readonly verb = "complianceSmoke";
  readonly actionSchema = complianceSmokeSchema;

  constructor(private readonly waitForRelease?: () => Promise<void>) {
    super();
  }

  override async checkCompliance() {
    await this.waitForRelease?.();
    return {
      outcome: "compliant" as const,
      resource: "smoke-compliance",
    };
  }
}

const logger = createLogger({
  level: "silent",
  sink: { write: () => undefined },
});

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function assertSharePointCatalogComposition(): void {
  const moduleVerbs = sharePointActionModules.map((actionModule) => actionModule.verb);
  const definitionVerbs = sharePointActionDefinitions.map((definition) => definition.verb);

  assert(moduleVerbs.length === new Set(moduleVerbs).size, "SharePoint action modules should not contain duplicate verbs");
  assert(
    JSON.stringify(moduleVerbs) === JSON.stringify(definitionVerbs),
    "SharePoint action definitions should be derived from action modules in the same order"
  );

  const rootList = sharePointActionsSchema.safeParse([
    {
      verb: "createSPList",
      listName: "SmokeList",
      title: "Smoke List",
    },
  ]);
  assert(rootList.success, "SharePoint root schema should accept root list actions");

  const rootField = sharePointActionsSchema.safeParse([
    {
      verb: "addSPField",
      fieldType: "Text",
      fieldName: "SmokeText",
      displayName: "Smoke Text",
    },
  ]);
  assert(!rootField.success, "SharePoint root schema should reject list-only field actions");

  const rootContentType = sharePointActionsSchema.safeParse([
    {
      verb: "createSPContentType",
      name: "Smoke Document",
      parentId: "0x0101",
    },
  ]);
  assert(rootContentType.success, "SharePoint root schema should accept createSPContentType");

  const contentTypeField = contentTypeSubactionSchema.safeParse({
    verb: "addSPFieldToContentType",
    fieldName: "SmokeText",
  });
  assert(contentTypeField.success, "Content type subaction schema should accept addSPFieldToContentType");

  const contentTypeFieldById = contentTypeSubactionSchema.safeParse({
    verb: "addSPFieldToContentType",
    fieldId: "5f5b251f-4b80-47f3-a847-0f2f8f9d6b01",
  });
  assert(contentTypeFieldById.success, "Content type subaction schema should accept addSPFieldToContentType by fieldId");

  const listField = listSubactionSchema.safeParse({
    verb: "addSPField",
    fieldType: "Text",
    fieldName: "SmokeText",
    displayName: "Smoke Text",
  });
  assert(listField.success, "SharePoint list subaction schema should accept addSPField");

  const lookupField = listSubactionSchema.safeParse({
    verb: "addSPField",
    fieldType: "Lookup",
    fieldName: "SmokeLookup",
    displayName: "Smoke Lookup",
    lookupListName: "SmokeCategories",
    showField: "Title",
  });
  assert(lookupField.success, "SharePoint list subaction schema should accept documented lookup field shape");

  const staleLookupField = listSubactionSchema.safeParse({
    verb: "addSPField",
    fieldType: "Lookup",
    fieldName: "SmokeLookup",
    displayName: "Smoke Lookup",
    lookupList: "SmokeCategories",
    lookupField: "Title",
  });
  assert(!staleLookupField.success, "SharePoint list subaction schema should reject stale lookupList/lookupField names");

  const nestedList = siteSubactionSchema.safeParse({
    verb: "createSPList",
    listName: "SmokeNestedList",
    title: "Smoke Nested List",
    subactions: [
      {
        verb: "addSPField",
        fieldType: "Text",
        fieldName: "SmokeText",
        displayName: "Smoke Text",
      },
    ],
  });
  assert(nestedList.success, "SharePoint site subaction schema should accept list actions with field subactions");

  const nestedContentType = siteSubactionSchema.safeParse({
    verb: "createSPContentType",
    name: "Smoke Nested Document",
    parentId: "0x0101",
    subactions: [
      {
        verb: "addSPFieldToContentType",
        fieldId: "5f5b251f-4b80-47f3-a847-0f2f8f9d6b01",
      },
    ],
  });
  assert(nestedContentType.success, "SharePoint site subaction schema should accept content type actions with field subactions");

  const listContentTypeBinding = listSubactionSchema.safeParse({
    verb: "addSPContentTypeToList",
    contentTypeName: "Smoke Document",
  });
  assert(listContentTypeBinding.success, "SharePoint list subaction schema should accept content type binding");

  const defaultContentType = listSubactionSchema.safeParse({
    verb: "setSPListDefaultContentType",
    contentTypeName: "Smoke Document",
  });
  assert(!defaultContentType.success, "SharePoint list subaction schema should not expose setSPListDefaultContentType until its spike passes");

  const listCreatesList = listSubactionSchema.safeParse({
    verb: "createSPList",
    listName: "InvalidNestedList",
    title: "Invalid Nested List",
  });
  assert(!listCreatesList.success, "SharePoint list subaction schema should reject nested list creation");
}

function assertContentTypeFieldReferenceScopeResolution(): void {
  const resolved = resolveFieldReferenceFromScope(
    { siteColumnIdsByFieldName: { SmokeText: "5f5b251f-4b80-47f3-a847-0f2f8f9d6b01" } },
    { fieldName: "SmokeText" }
  );

  assert(
    resolved.fieldId === "5f5b251f-4b80-47f3-a847-0f2f8f9d6b01",
    "Content type field references should use propagated site column ids when available"
  );
}

function assertFieldStructuralCompatibility(): void {
  const compatibleText = checkFieldStructuralCompatibility("Text", {
    Id: "1",
    InternalName: "SmokeText",
    Title: "Smoke Text",
    TypeAsString: "Text",
  });
  assert(compatibleText.compatible, "Text create compliance should accept SharePoint Text fields");

  const incompatibleText = checkFieldStructuralCompatibility("Text", {
    Id: "2",
    InternalName: "SmokeText",
    Title: "Smoke Text",
    TypeAsString: "Lookup",
  });
  assert(!incompatibleText.compatible, "Text create compliance should reject SharePoint Lookup fields");
  assert(
    "reason" in incompatibleText && incompatibleText.reason === "field_type_mismatch",
    "Wrong SharePoint field type should be reported as field_type_mismatch"
  );

  const userMulti = checkFieldStructuralCompatibility("User", {
    Id: "3",
    InternalName: "SmokeUser",
    Title: "Smoke User",
    TypeAsString: "UserMulti",
  });
  assert(userMulti.compatible, "User create compliance should accept UserMulti as structurally compatible");

  const unverifiable = checkFieldStructuralCompatibility("Text", {
    Id: "4",
    InternalName: "SmokeUnknown",
    Title: "Smoke Unknown",
  });
  assert(!unverifiable.compatible, "Missing TypeAsString should be treated as structurally unverifiable");
  assert(
    "reason" in unverifiable && unverifiable.reason === "field_type_unverifiable",
    "Missing TypeAsString should be reported as field_type_unverifiable"
  );
}

function assertListStructuralCompatibility(): void {
  const compatible = checkListStructuralCompatibility(100, { BaseTemplate: 100 });
  assert(compatible.compatible, "List create compatibility should accept matching BaseTemplate");

  const mismatch = checkListStructuralCompatibility(100, { BaseTemplate: 101 });
  assert(!mismatch.compatible, "List create compatibility should reject mismatched BaseTemplate");
  assert(
    "reason" in mismatch && mismatch.reason === "list_template_mismatch",
    "Mismatched BaseTemplate should be reported as list_template_mismatch"
  );

  const unverifiable = checkListStructuralCompatibility(100, {});
  assert(!unverifiable.compatible, "Missing BaseTemplate should be treated as structurally unverifiable");
  assert(
    "reason" in unverifiable && unverifiable.reason === "list_template_unverifiable",
    "Missing BaseTemplate should be reported as list_template_unverifiable"
  );
}

function assertJsonResultContract(): void {
  assert(
    defaultActionResultSchema.safeParse({ result: { ok: true, values: ["a", 1, null] } }).success,
    "Default action result schema should accept JSON-safe output"
  );

  assert(
    defaultActionResultSchema.safeParse({ scopeDelta: { runtimeObject: { execute: () => undefined } } }).success,
    "Default action result schema should allow runtime values in scopeDelta"
  );

  assert(
    !defaultActionResultSchema.safeParse({ result: { execute: () => undefined } }).success,
    "Default action result schema should reject non-JSON output"
  );

  assert(
    !defaultActionResultSchema.safeParse({ result: undefined }).success,
    "Default action result schema should reject explicit undefined output"
  );

  assert(
    defaultActionResultSchema.safeParse({
      result: {
        outcome: "executed",
        resource: "warning-smoke",
        warnings: [
          {
            code: "SMOKE_WARNING",
            message: "Smoke warning",
            details: { key: "value" },
          },
        ],
      },
    }).success,
    "Default action result schema should accept JSON-safe provisioning warnings"
  );
}

function assertLoggerContract(): void {
  const primaryEvents: LogEvent[] = [];
  const secondaryEvents: LogEvent[] = [];
  const cyclic: Record<string, unknown> = { name: "root" };
  cyclic.self = cyclic;

  const logger = createLogger({
    level: "debug",
    sink: createMultiSink(
      { write: (event) => primaryEvents.push(event) },
      { write: (event) => secondaryEvents.push(event) }
    ),
    scope: { requestId: "smoke" },
  });

  logger.info("structured payload", {
    cyclic,
    fn: function smokeFunction() {
      return undefined;
    },
    notANumber: Number.NaN,
    omitted: undefined,
  });

  logger.error("structured error", {
    error: new Error("boom"),
    data: { status: 500 },
  });

  assert(primaryEvents.length === 2, "Logger should emit both events to primary sink");
  assert(secondaryEvents.length === 2, "Logger should emit both events to secondary sink");
  assert(primaryEvents[0].scope?.requestId === "smoke", "Logger should preserve scoped metadata");

  const payload = primaryEvents[0].data as Record<string, unknown>;
  assert((payload.fn as string).startsWith("[Function"), "Logger should sanitize functions in data");
  assert(payload.notANumber === "NaN", "Logger should sanitize non-finite numbers in data");
  assert(!Object.prototype.hasOwnProperty.call(payload, "omitted"), "Logger should omit undefined object fields");

  const cyclicPayload = payload.cyclic as Record<string, unknown>;
  assert(cyclicPayload.self === "[Circular]", "Logger should sanitize circular references");
  assert(primaryEvents[1].error?.message === "boom", "Logger should normalize error context");
  assert((primaryEvents[1].data as Record<string, unknown>).status === 500, "Logger should keep JSON-safe error data");
}

async function runSmoke(
  args: Partial<ConstructorParameters<typeof ProvisioningEngine<SmokeScope, SmokeResult, SmokeClients>>[0]> & {
    planTemplate: BaseProvisioningPlan;
    definitions?: ConstructorParameters<typeof ProvisioningEngine<SmokeScope, SmokeResult, SmokeClients>>[0]["definitions"];
  }
) {
  const engine = new ProvisioningEngine<SmokeScope, SmokeResult, SmokeClients>({
    clients: args.clients ?? {},
    initialScope: args.initialScope ?? {},
    planTemplate: args.planTemplate,
    logger,
    options: args.options,
    definitions: args.definitions ?? [
      new GraphSmokeAction(),
      new SpSmokeAction(),
      new FailSmokeAction(),
      new SuccessSmokeAction(),
    ],
    provisioningSchema: smokeProvisioningSchema,
  });

  return engine.run();
}

async function assertComplianceCancelContract(): Promise<void> {
  const completedEngine = new ProvisioningEngine<SmokeScope, SmokeResult, SmokeClients>({
    clients: {},
    initialScope: {},
    planTemplate: { actions: [{ verb: "complianceSmoke", resource: "completed" }] },
    logger,
    definitions: [new ComplianceSmokeAction()],
    provisioningSchema: smokeProvisioningSchema,
  });

  await completedEngine.checkCompliance();
  assert(
    completedEngine.snapshot().compliance?.status === "completed",
    "Compliance smoke should complete before testing late cancellation"
  );

  completedEngine.cancel();
  assert(
    completedEngine.snapshot().compliance?.status === "completed",
    "cancel() after completed compliance should preserve completed compliance status"
  );

  let releaseCompliance!: () => void;
  const releasePromise = new Promise<void>((resolve) => {
    releaseCompliance = resolve;
  });
  const runningEngine = new ProvisioningEngine<SmokeScope, SmokeResult, SmokeClients>({
    clients: {},
    initialScope: {},
    planTemplate: { actions: [{ verb: "complianceSmoke", resource: "running" }] },
    logger,
    definitions: [new ComplianceSmokeAction(() => releasePromise)],
    provisioningSchema: smokeProvisioningSchema,
  });

  const runningCheck = runningEngine.checkCompliance();
  await Promise.resolve();
  assert(
    runningEngine.snapshot().compliance?.status === "running",
    "Compliance smoke should be running before active cancellation"
  );

  runningEngine.cancel();
  assert(
    runningEngine.snapshot().compliance?.status === "cancelled",
    "cancel() during running compliance should mark compliance as cancelled"
  );

  releaseCompliance();
  await runningCheck;
  assert(
    runningEngine.snapshot().compliance?.status === "cancelled",
    "Cancelled running compliance should remain cancelled after the pending checker resolves"
  );
}

async function assertSharePointGraphClientPreflight(): Promise<void> {
  const engine = new ProvisioningEngine<M365Scope, ProvisioningResultLight, M365Clients>({
    clients: {},
    initialScope: { siteUrl: "https://contoso.sharepoint.com/sites/smoke" },
    planTemplate: {
      actions: [
        {
          verb: "createSPContentType",
          name: "Smoke Document",
          parentId: "0x0101",
        },
      ],
    },
    logger,
    definitions: sharePointActionDefinitions,
    provisioningSchema: createProvisioningPlanSchema(sharePointActionsSchema),
  });

  const snapshot = await engine.run();
  assert(snapshot.status === "failed", "Missing graphClient should fail content type actions during preflight");
  assert(
    snapshot.out.trace.byPath["1"]?.error?.code === "MISSING_CLIENT",
    "Missing graphClient for content type action should be reported as MISSING_CLIENT"
  );
}

async function assertCreateSPSiteColumnIgnoresStaleListScope(): Promise<void> {
  const fieldId = "5f5b251f-4b80-47f3-a847-0f2f8f9d6b01";
  let webAddTextCalled = false;

  const missingFieldAccessor = {
    select: () => async () => {
      throw new Error("not found");
    },
  };

  const web = {
    fields: {
      getByInternalNameOrTitle: () => missingFieldAccessor,
      addText: async () => {
        webAddTextCalled = true;
        return { Id: fieldId };
      },
    },
  };

  const list = {
    fields: {
      getByInternalNameOrTitle: () => missingFieldAccessor,
      addText: async () => {
        throw new Error("createSPSiteColumn should not target list.fields when web is available");
      },
    },
  };

  const action = new CreateSPSiteColumnAction();
  const result = await action.handler({
    scopeIn: { web, list } as unknown as M365Scope,
    clients: {},
    out: { byAction: {}, trace: { status: "idle", byPath: {}, order: [] } },
    logger,
    action: {
      path: "1",
      verb: "createSPSiteColumn",
      payload: {
        verb: "createSPSiteColumn",
        fieldType: "Text",
        fieldName: "SmokeSiteColumn",
        displayName: "SmokeSiteColumn",
      },
    },
  });

  assert(webAddTextCalled, "createSPSiteColumn should target web.fields even when stale list scope exists");
  assert(
    result.scopeDelta?.siteColumnIdsByFieldName?.SmokeSiteColumn === fieldId,
    "createSPSiteColumn should propagate the created site column id"
  );
}

async function main(): Promise<void> {
  assertSharePointCatalogComposition();
  assertContentTypeFieldReferenceScopeResolution();
  assertFieldStructuralCompatibility();
  assertListStructuralCompatibility();
  assertJsonResultContract();
  assertLoggerContract();
  await assertComplianceCancelContract();
  await assertCreateSPSiteColumnIgnoresStaleListScope();
  await assertSharePointGraphClientPreflight();

  const spOnly = await runSmoke({
    clients: { spfi: { marker: "spfi" } },
    planTemplate: { actions: [{ verb: "spSmoke", resource: "sp" }] },
  });
  assert(spOnly.status === "completed", "SPFI smoke action should complete");
  assert(spOnly.out.byAction["1"]?.result?.resource === "sp", "SPFI smoke action should write output");

  const graphOnly = await runSmoke({
    clients: { graphClient: { marker: "graph" } },
    planTemplate: { actions: [{ verb: "graphSmoke", resource: "graph" }] },
  });
  assert(graphOnly.status === "completed", "Graph smoke action should complete");
  assert(graphOnly.out.byAction["1"]?.result?.resource === "graph", "Graph smoke action should write output");

  const missingGraph = await runSmoke({
    clients: {},
    planTemplate: { actions: [{ verb: "graphSmoke", resource: "graph" }] },
  });
  assert(missingGraph.status === "failed", "Missing graphClient should fail");
  assert(
    missingGraph.out.trace.byPath["1"]?.error?.code === "MISSING_CLIENT",
    "Missing graphClient should be reported as MISSING_CLIENT"
  );

  const failFastFalse = await runSmoke({
    options: { failFast: false },
    planTemplate: {
      actions: [
        { verb: "failSmoke", resource: "broken" },
        { verb: "successSmoke", resource: "next" },
      ],
    },
  });
  assert(failFastFalse.status === "failed", "failFast:false should preserve failed final status");
  assert(failFastFalse.out.trace.byPath["1"]?.status === "fail", "failed action should be marked failed");
  assert(failFastFalse.out.byAction["2"]?.result?.resource === "next", "failFast:false should continue to sibling action");

  let permissionChecks = 0;
  const preflightJit = await runSmoke({
    clients: { spfi: { marker: "spfi" } },
    definitions: [
      new PermissionSmokeAction(() => {
        permissionChecks += 1;
      }),
    ],
    planTemplate: { actions: [{ verb: "permissionSmoke", resource: "jit" }] },
  });
  assert(preflightJit.status === "completed", "Permission smoke action should complete");
  assert(permissionChecks === 2, "requiredClients action should run both preflight and JIT permission checks");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
