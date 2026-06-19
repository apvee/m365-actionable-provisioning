import { z } from "zod";

import { ActionDefinition, defaultActionResultSchema, type ActionRuntimeContext } from "../src/core/action";
import { ProvisioningEngine } from "../src/core/engine";
import { createLogger, createMultiSink, type LogEvent } from "../src/core/logger";
import { createProvisioningPlanSchema, type BaseProvisioningPlan } from "../src/core/provisioning-plan";
import type { PermissionCheckResult } from "../src/core/permissions";
import {
  CreateSPListViewAction as RootCreateSPListViewAction,
  CreateSPNavigationNodeAction as RootCreateSPNavigationNodeAction,
  DeleteSPListViewAction as RootDeleteSPListViewAction,
  DeleteSPNavigationNodeAction as RootDeleteSPNavigationNodeAction,
  ModifySPListViewAction as RootModifySPListViewAction,
  ModifySPNavigationNodeAction as RootModifySPNavigationNodeAction,
  createSPListViewSchema as rootCreateSPListViewSchema,
  createSPNavigationNodeSchema as rootCreateSPNavigationNodeSchema,
  deleteSPListViewSchema as rootDeleteSPListViewSchema,
  deleteSPNavigationNodeSchema as rootDeleteSPNavigationNodeSchema,
  modifySPListViewSchema as rootModifySPListViewSchema,
  modifySPNavigationNodeSchema as rootModifySPNavigationNodeSchema,
} from "../src";
import {
  CreateSPListViewAction as PublicCreateSPListViewAction,
  CreateSPNavigationNodeAction as PublicCreateSPNavigationNodeAction,
  DeleteSPListViewAction as PublicDeleteSPListViewAction,
  DeleteSPNavigationNodeAction as PublicDeleteSPNavigationNodeAction,
  ModifySPListViewAction as PublicModifySPListViewAction,
  ModifySPNavigationNodeAction as PublicModifySPNavigationNodeAction,
  createSPListViewSchema as publicCreateSPListViewSchema,
  createSPNavigationNodeSchema as publicCreateSPNavigationNodeSchema,
  deleteSPListViewSchema as publicDeleteSPListViewSchema,
  deleteSPNavigationNodeSchema as publicDeleteSPNavigationNodeSchema,
  modifySPListViewSchema as publicModifySPListViewSchema,
  modifySPNavigationNodeSchema as publicModifySPNavigationNodeSchema,
  sharePointActionDefinitions,
  sharePointActionsSchema,
} from "../src/actions/sharepoint";
import { sharePointActionModules } from "../src/actions/sharepoint/action-modules";
import { contentTypeSubactionSchema } from "../src/actions/sharepoint/_composition/content-type-subactions-schema";
import { listSubactionSchema } from "../src/actions/sharepoint/_composition/list-subactions-schema";
import { siteSubactionSchema } from "../src/actions/sharepoint/_composition/site-subactions-schema";
import { CreateSPListViewAction, createSPListViewActionModule } from "../src/actions/sharepoint/views/create-sp-list-view";
import { DeleteSPListViewAction, deleteSPListViewActionModule } from "../src/actions/sharepoint/views/delete-sp-list-view";
import { ModifySPListViewAction, modifySPListViewActionModule } from "../src/actions/sharepoint/views/modify-sp-list-view";
import { CreateSPNavigationNodeAction, createSPNavigationNodeActionModule } from "../src/actions/sharepoint/navigation/create-sp-navigation-node";
import { DeleteSPNavigationNodeAction, deleteSPNavigationNodeActionModule } from "../src/actions/sharepoint/navigation/delete-sp-navigation-node";
import { ModifySPNavigationNodeAction, modifySPNavigationNodeActionModule } from "../src/actions/sharepoint/navigation/modify-sp-navigation-node";
import {
  createSPNavigationNodeSchema,
  deleteSPNavigationNodeSchema,
  modifySPNavigationNodeSchema,
} from "../src/actions/sharepoint/navigation";
import {
  BreakSPListRoleInheritanceAction,
  BreakSPSiteRoleInheritanceAction,
  GrantSPListRoleAssignmentAction,
  GrantSPSiteRoleAssignmentAction,
  RemoveSPListRoleAssignmentAction,
  RemoveSPSiteRoleAssignmentAction,
  ResetSPListRoleInheritanceAction,
  ResetSPSiteRoleInheritanceAction,
  breakSPListRoleInheritanceActionModule,
  breakSPListRoleInheritanceSchema,
  breakSPSiteRoleInheritanceActionModule,
  breakSPSiteRoleInheritanceSchema,
  grantSPListRoleAssignmentActionModule,
  grantSPListRoleAssignmentSchema,
  grantSPSiteRoleAssignmentActionModule,
  grantSPSiteRoleAssignmentSchema,
  removeSPListRoleAssignmentActionModule,
  removeSPListRoleAssignmentSchema,
  removeSPSiteRoleAssignmentActionModule,
  removeSPSiteRoleAssignmentSchema,
  resetSPListRoleInheritanceActionModule,
  resetSPListRoleInheritanceSchema,
  resetSPSiteRoleInheritanceActionModule,
  resetSPSiteRoleInheritanceSchema,
} from "../src/actions/sharepoint/permissions";
import { CreateSPSiteColumnAction } from "../src/actions/sharepoint/fields/create-sp-site-column";
import { resolveFieldReferenceFromScope } from "../src/actions/sharepoint/domains/content-types";
import { checkFieldStructuralCompatibility } from "../src/actions/sharepoint/domains/fields/field-structural-compatibility";
import { checkListStructuralCompatibility } from "../src/actions/sharepoint/domains/lists/list-structural-compatibility";
import {
  buildEntraGroupClaim,
  buildM365GroupClaim,
  getRoleTypeKind,
  getSecurableHasUniqueRoleAssignments,
  hasRoleAssignmentBinding,
  isPermissionResolutionError,
  resolvePrincipalId,
  resolveRoleDefinitionId,
} from "../src/actions/sharepoint/domains/permissions";
import { getPublicListViewInfoByTitle, resolveViewFieldInternalNames, type ListViewInfo } from "../src/actions/sharepoint/domains/views";
import { areNavigationNodeUrlsEquivalent } from "../src/actions/sharepoint/domains/navigation";
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

type SmokeFieldInfo = { Id: string; InternalName: string; Title: string };

function fieldLookupFrom(fields: Record<string, SmokeFieldInfo> | readonly SmokeFieldInfo[]) {
  const fieldsByReference = Array.isArray(fields)
    ? Object.fromEntries(fields.flatMap((field) => [[field.InternalName, field], [field.Title, field]]))
    : fields;

  return {
    getByInternalNameOrTitle: (fieldRef: string) => ({
      select: () => async () => {
        const field = fieldsByReference[fieldRef];
        if (!field) throw new Error("not found");
        return field;
      },
    }),
  };
}

function publicViewFilterFrom(
  resultsOrFactory: readonly ListViewInfo[] | ((filter: string) => readonly ListViewInfo[]),
  options: {
    onFilter?: (filter: string) => void;
    onTop?: (top: number) => void;
    onSelect?: (fields: readonly string[]) => void;
  } = {}
) {
  return (filter: string) => {
    options.onFilter?.(filter);
    let requestedTop: number | undefined;
    const query = {
      top: (top: number) => {
        requestedTop = top;
        options.onTop?.(top);
        return query;
      },
      select: (...fields: string[]) => async () => {
        options.onSelect?.(fields);
        if (requestedTop !== 1) throw new Error("List view lookup should limit filtered title queries with top(1)");
        const results = typeof resultsOrFactory === "function" ? resultsOrFactory(filter) : resultsOrFactory;
        return [...results];
      },
    };
    return query;
  };
}

function roleDefinitionsFrom(roles: readonly { Id: number; Name: string; RoleTypeKind: number }[]) {
  return {
    getById: (id: number) => async () => {
      const role = roles.find((item) => item.Id === id);
      if (!role) throw Object.assign(new Error("role not found"), { status: 404 });
      return role;
    },
    getByType: (kind: number) => async () => {
      const role = roles.find((item) => item.RoleTypeKind === kind);
      if (!role) throw Object.assign(new Error("role not found"), { status: 404 });
      return role;
    },
    filter: (filter: string) => ({
      top: (top: number) => ({
        select: (...fields: string[]) => async () => {
          assert(top === 2, "Role name lookup should request top(2) to detect ambiguity");
          assertStringArrayEqual(fields, ["Id", "Name", "RoleTypeKind"], "Role lookup should select stable role fields");
          const match = filter.match(/^Name eq '(.+)'$/);
          if (!match) throw new Error(`Unexpected role filter: ${filter}`);
          const expectedName = match[1].replace(/''/g, "'");
          return roles.filter((item) => item.Name === expectedName);
        },
      }),
    }),
  };
}

function graphGroupsFrom(groups: readonly {
  id: string;
  displayName?: string;
  mailNickname?: string;
  groupTypes?: readonly string[];
  securityEnabled?: boolean;
}[]) {
  return {
    groups: {
      filter: (filter: string) => ({
        top: (top: number) => ({
          select: (...fields: string[]) => async () => {
            assert(top === 2, "Graph group lookup should request top(2) to detect ambiguity");
            assertStringArrayEqual(fields, ["id", "displayName", "mailNickname", "groupTypes", "securityEnabled"], "Graph group lookup should select stable fields");
            const displayName = filter.match(/displayName eq '((?:''|[^'])*)'/)?.[1]?.replace(/''/g, "'");
            const mailNickname = filter.match(/mailNickname eq '((?:''|[^'])*)'/)?.[1]?.replace(/''/g, "'");
            const requireUnified = filter.includes("groupTypes/any");
            const requireSecurityEnabled = filter.includes("securityEnabled eq true");
            return groups.filter((group) => {
              const nameMatches = displayName === undefined || group.displayName === displayName;
              const nickMatches = mailNickname === undefined || group.mailNickname === mailNickname;
              const unifiedMatches = !requireUnified || group.groupTypes?.includes("Unified");
              const securityMatches = !requireSecurityEnabled || group.securityEnabled === true;
              return nameMatches && nickMatches && unifiedMatches && securityMatches;
            });
          },
        }),
      }),
    },
  };
}

function roleAssignmentsFrom(bindingsByPrincipal: Record<number, readonly number[]>) {
  return {
    getById: (principalId: number) => ({
      bindings: async () => {
        const bindings = bindingsByPrincipal[principalId];
        if (!bindings) throw Object.assign(new Error("role assignment not found"), { status: 404 });
        return bindings.map((Id) => ({ Id }));
      },
    }),
  };
}

function permissionTargetFrom(options: {
  unique: boolean;
  breakPersists?: boolean;
  breakPersistsAfterChecks?: number;
  bindingsByPrincipal?: Record<number, readonly number[]>;
  onBreak?: (copyRoleAssignments: boolean, clearSubscopes: boolean) => void;
  onReset?: () => void;
  onAdd?: (principalId: number, roleDefId: number) => void;
  onRemove?: (principalId: number, roleDefId: number) => void;
}) {
  let unique = options.unique;
  let breakCalled = false;
  let postBreakChecks = 0;
  const bindingsByPrincipal = options.bindingsByPrincipal ?? {};
  return {
    select: (...fields: string[]) => async () => {
      assertStringArrayEqual(fields, ["HasUniqueRoleAssignments"], "Permission action should read HasUniqueRoleAssignments");
      if (breakCalled && !unique && options.breakPersists !== false && options.breakPersistsAfterChecks !== undefined) {
        postBreakChecks++;
        if (postBreakChecks >= options.breakPersistsAfterChecks) unique = true;
      }
      return { HasUniqueRoleAssignments: unique };
    },
    breakRoleInheritance: async (copyRoleAssignments: boolean, clearSubscopes: boolean) => {
      options.onBreak?.(copyRoleAssignments, clearSubscopes);
      breakCalled = true;
      if (options.breakPersists !== false && options.breakPersistsAfterChecks === undefined) unique = true;
    },
    resetRoleInheritance: async () => {
      options.onReset?.();
      unique = false;
    },
    roleAssignments: {
      ...roleAssignmentsFrom(bindingsByPrincipal),
      add: async (principalId: number, roleDefId: number) => {
        options.onAdd?.(principalId, roleDefId);
      },
      remove: async (principalId: number, roleDefId: number) => {
        options.onRemove?.(principalId, roleDefId);
      },
    },
  };
}

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

function idleOut() {
  return { byAction: {}, trace: { status: "idle" as const, byPath: {}, order: [] } };
}

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function assertStringArrayEqual(actual: readonly string[], expected: readonly string[], message: string): void {
  const matches = actual.length === expected.length && actual.every((value, index) => value === expected[index]);
  if (!matches) {
    throw new Error(`${message}. Expected [${expected.join(", ")}], got [${actual.join(", ")}]`);
  }
}

async function assertRejectsWithMessage(
  action: () => Promise<unknown>,
  expectedMessagePart: string,
  message: string
): Promise<void> {
  let rejection: unknown;
  try {
    await action();
  } catch (error) {
    rejection = error;
  }

  assert(rejection instanceof Error, `${message}. Expected an Error rejection`);
  assert(
    rejection.message.includes(expectedMessagePart),
    `${message}. Expected rejection message to include "${expectedMessagePart}", got "${rejection.message}"`
  );
}

async function assertRejectsWithPermissionResolutionReason(
  action: () => Promise<unknown>,
  expectedReason: "not_found" | "ambiguous" | "missing_prerequisite",
  message: string
): Promise<void> {
  let rejection: unknown;
  try {
    await action();
  } catch (error) {
    rejection = error;
  }

  assert(isPermissionResolutionError(rejection), `${message}. Expected a PermissionResolutionError rejection`);
  assert(rejection.reason === expectedReason, `${message}. Expected reason '${expectedReason}', got '${rejection.reason}'`);
}

function assertSharePointCatalogComposition(): void {
  const moduleVerbs = sharePointActionModules.map((actionModule) => actionModule.verb);
  const definitionVerbs = sharePointActionDefinitions.map((definition) => definition.verb);

  assert(moduleVerbs.length === new Set(moduleVerbs).size, "SharePoint action modules should not contain duplicate verbs");
  assertStringArrayEqual(moduleVerbs, definitionVerbs, "SharePoint action definitions should be derived from action modules in the same order");

  const rootList = sharePointActionsSchema.safeParse([
    {
      verb: "createSPList",
      listName: "SmokeList",
      title: "Smoke List",
    },
  ]);
  assert(rootList.success, "SharePoint root schema should accept root list actions");

  const rootListWithViewSubaction = sharePointActionsSchema.safeParse([
    {
      verb: "createSPList",
      listName: "SmokeListWithView",
      title: "Smoke List With View",
      subactions: [
        {
          verb: "createSPListView",
          title: "Smoke View",
        },
      ],
    },
  ]);
  assert(rootListWithViewSubaction.success, "SharePoint root list actions should accept list view subactions");

  const rootModifyListWithViewSubaction = sharePointActionsSchema.safeParse([
    {
      verb: "modifySPList",
      listName: "SmokeListWithView",
      subactions: [
        {
          verb: "modifySPListView",
          title: "Smoke View",
          rowLimit: 50,
        },
      ],
    },
  ]);
  assert(rootModifyListWithViewSubaction.success, "SharePoint root modify list actions should accept list view subactions");

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
      {
        verb: "createSPListView",
        title: "Smoke Nested View",
        fields: ["Title", "SmokeText"],
      },
    ],
  });
  assert(nestedList.success, "SharePoint site subaction schema should accept list actions with field and view subactions");

  const nestedModifyList = siteSubactionSchema.safeParse({
    verb: "modifySPList",
    listName: "SmokeNestedList",
    subactions: [
      {
        verb: "modifySPListView",
        title: "Smoke Nested View",
        rowLimit: 50,
      },
    ],
  });
  assert(nestedModifyList.success, "SharePoint site subaction schema should accept modify list actions with view subactions");

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

  const siteCreatesNavigationNode = siteSubactionSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo/Lists/Orders/AllItems.aspx",
  });
  assert(siteCreatesNavigationNode.success, "SharePoint site subaction schema should accept createSPNavigationNode");

  const siteModifiesNavigationNode = siteSubactionSchema.safeParse({
    verb: "modifySPNavigationNode",
    location: "topNavigationBar",
    title: "Orders",
    newTitle: "Customer Orders",
    url: "/sites/demo/SitePages/Orders.aspx",
    isVisible: false,
  });
  assert(siteModifiesNavigationNode.success, "SharePoint site subaction schema should accept modifySPNavigationNode");

  const siteDeletesNavigationNode = siteSubactionSchema.safeParse({
    verb: "deleteSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
  });
  assert(siteDeletesNavigationNode.success, "SharePoint site subaction schema should accept deleteSPNavigationNode");

  assertStringArrayEqual(
    createSPNavigationNodeActionModule.placements,
    ["siteSubaction"],
    "createSPNavigationNode action module should be site-subaction only"
  );
  assertStringArrayEqual(
    modifySPNavigationNodeActionModule.placements,
    ["siteSubaction"],
    "modifySPNavigationNode action module should be site-subaction only"
  );
  assertStringArrayEqual(
    deleteSPNavigationNodeActionModule.placements,
    ["siteSubaction"],
    "deleteSPNavigationNode action module should be site-subaction only"
  );

  const rootCreatesNavigationNode = sharePointActionsSchema.safeParse([
    {
      verb: "createSPNavigationNode",
      location: "quicklaunch",
      title: "Orders",
      url: "/sites/demo/Lists/Orders/AllItems.aspx",
    },
  ]);
  assert(!rootCreatesNavigationNode.success, "SharePoint root schema should reject navigation node actions");

  const listCreatesNavigationNode = listSubactionSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo/Lists/Orders/AllItems.aspx",
  });
  assert(!listCreatesNavigationNode.success, "SharePoint list subaction schema should reject navigation node actions");

  const footerNavigationNode = createSPNavigationNodeSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "site-footer",
    title: "Footer",
    url: "/sites/demo",
  });
  assert(!footerNavigationNode.success, "SharePoint navigation schema should reject unsupported footer location");

  const nestedNavigationNode = createSPNavigationNodeSchema.safeParse({
    verb: "createSPNavigationNode",
    location: "quicklaunch",
    title: "Orders",
    url: "/sites/demo",
    subactions: [{ verb: "deleteSPList", name: "Orders" }],
  });
  assert(!nestedNavigationNode.success, "SharePoint navigation node actions should reject nested subactions");

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

  const listCreatesView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Smoke View",
    fields: ["Title", "SmokeText"],
    viewQuery: '<OrderBy><FieldRef Name="SmokeText" /></OrderBy>',
    rowLimit: 50,
    paged: true,
    defaultView: true,
  });
  assert(listCreatesView.success, "SharePoint list subaction schema should accept createSPListView");

  const listCreatesViewWithSpacedNames = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: " Customers by Code ",
    fields: ["Title", " Customer Email "],
    viewQuery: '  <OrderBy><FieldRef Name="CustomerEmail" /></OrderBy>  ',
  });
  assert(listCreatesViewWithSpacedNames.success, "SharePoint list view schema should accept names with internal spaces");
  if (listCreatesViewWithSpacedNames.success) {
    assert(listCreatesViewWithSpacedNames.data.title === "Customers by Code", "SharePoint list view schema should trim view titles");
    assertStringArrayEqual(
      listCreatesViewWithSpacedNames.data.fields ?? [],
      ["Title", "Customer Email"],
      "SharePoint list view schema should trim field references while preserving internal spaces"
    );
    assert(
      listCreatesViewWithSpacedNames.data.viewQuery === '<OrderBy><FieldRef Name="CustomerEmail" /></OrderBy>',
      "SharePoint list view schema should trim viewQuery fragments"
    );
  }

  const listModifiesView = listSubactionSchema.safeParse({
    verb: "modifySPListView",
    title: "Smoke View",
    fields: ["Title", "SmokeText"],
    viewQuery: '<Where><Eq><FieldRef Name="SmokeText" /><Value Type="Text">Active</Value></Eq></Where>',
    rowLimit: 100,
    paged: false,
    defaultView: true,
  });
  assert(listModifiesView.success, "SharePoint list subaction schema should accept modifySPListView");

  const listDeletesView = listSubactionSchema.safeParse({
    verb: "deleteSPListView",
    title: "Smoke View",
  });
  assert(listDeletesView.success, "SharePoint list subaction schema should accept deleteSPListView");
  assertStringArrayEqual(
    createSPListViewActionModule.placements,
    ["listSubaction"],
    "createSPListView action module should be list-subaction only"
  );
  assertStringArrayEqual(
    modifySPListViewActionModule.placements,
    ["listSubaction"],
    "modifySPListView action module should be list-subaction only"
  );
  assertStringArrayEqual(
    deleteSPListViewActionModule.placements,
    ["listSubaction"],
    "deleteSPListView action module should be list-subaction only"
  );

  const rootCreatesView = sharePointActionsSchema.safeParse([
    {
      verb: "createSPListView",
      title: "Root View",
    },
  ]);
  assert(!rootCreatesView.success, "SharePoint root schema should reject list view actions");

  const siteCreatesView = siteSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Site View",
  });
  assert(!siteCreatesView.success, "SharePoint site subaction schema should reject list view actions");

  const listCreatesDefaultFalseView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Default False View",
    defaultView: false,
  });
  assert(!listCreatesDefaultFalseView.success, "SharePoint list subaction schema should reject defaultView:false for list views");

  const listCreatesWrappedQueryView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Wrapped Query View",
    viewQuery: '<Query><OrderBy><FieldRef Name="SmokeText" /></OrderBy></Query>',
  });
  assert(!listCreatesWrappedQueryView.success, "SharePoint list subaction schema should reject <Query>-wrapped viewQuery");

  const listCreatesWrappedQueryViewWithWhitespace = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Wrapped Query View With Whitespace",
    viewQuery: '  <Query><OrderBy><FieldRef Name="SmokeText" /></OrderBy></Query>',
  });
  assert(!listCreatesWrappedQueryViewWithWhitespace.success, "SharePoint list subaction schema should reject trimmed <Query>-wrapped viewQuery");

  const listCreatesWrappedView = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Wrapped View",
    viewQuery: '<View><Query><OrderBy><FieldRef Name="SmokeText" /></OrderBy></Query></View>',
  });
  assert(!listCreatesWrappedView.success, "SharePoint list subaction schema should reject <View>-wrapped viewQuery");

  const listCreatesWrappedViewWithXmlDeclaration = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Wrapped View With Xml Declaration",
    viewQuery: '<?xml version="1.0"?><View><Query><OrderBy><FieldRef Name="SmokeText" /></OrderBy></Query></View>',
  });
  assert(!listCreatesWrappedViewWithXmlDeclaration.success, "SharePoint list subaction schema should reject XML-declared <View>-wrapped viewQuery");

  const listCreatesWrappedQueryWithComment = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Wrapped Query With Comment",
    viewQuery: '<!-- generated --><Query><OrderBy><FieldRef Name="SmokeText" /></OrderBy></Query>',
  });
  assert(!listCreatesWrappedQueryWithComment.success, "SharePoint list subaction schema should reject comment-prefixed <Query>-wrapped viewQuery");

  const listCreatesWrappedQueryWithXmlDeclarationAndComment = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Wrapped Query With Xml Declaration And Comment",
    viewQuery: '<?xml version="1.0"?><!-- generated --><QuErY><OrderBy><FieldRef Name="SmokeText" /></OrderBy></QuErY>',
  });
  assert(
    !listCreatesWrappedQueryWithXmlDeclarationAndComment.success,
    "SharePoint list subaction schema should reject XML-declared and comment-prefixed mixed-case <Query>-wrapped viewQuery"
  );

  const listCreatesFragmentWithComment = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Fragment With Comment",
    viewQuery: '<!-- generated --><OrderBy><FieldRef Name="SmokeText" /></OrderBy>',
  });
  assert(listCreatesFragmentWithComment.success, "SharePoint list subaction schema should accept comment-prefixed CAML fragments");

  const listCreatesEmptyQuery = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Empty Query",
    viewQuery: "   ",
  });
  assert(!listCreatesEmptyQuery.success, "SharePoint list view schema should reject empty viewQuery after trimming");

  const listCreatesDuplicateFields = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Duplicate Fields",
    fields: ["Title", " Title "],
  });
  assert(!listCreatesDuplicateFields.success, "SharePoint list view schema should reject duplicate raw field references after trimming");

  const listCreatesViewWithRootPayload = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Unexpected Root Payload",
    webUrl: "https://contoso.sharepoint.com/sites/smoke",
  });
  assert(!listCreatesViewWithRootPayload.success, "SharePoint list view schema should reject root-level payload fields");

  const listCreatesViewWithNestedSubaction = listSubactionSchema.safeParse({
    verb: "createSPListView",
    title: "Nested View",
    subactions: [
      {
        verb: "addSPField",
        fieldType: "Text",
        fieldName: "NestedText",
      },
    ],
  });
  assert(!listCreatesViewWithNestedSubaction.success, "SharePoint list view schema should reject nested subactions");
}

function assertSharePointPermissionsCatalogComposition(): void {
  const siteGrant = siteSubactionSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Owners",
    roleName: "Full Control",
    breakRoleInheritance: true,
    copyRoleAssignments: true,
    clearSubscopes: false,
  });
  assert(siteGrant.success, "SharePoint site subaction schema should accept grantSPSiteRoleAssignment");
  if (siteGrant.success) {
    assert(siteGrant.data.principal === "Project Owners", "Permission principal should be preserved after parsing");
    assert(siteGrant.data.roleName === "Full Control", "Permission roleName should be preserved after parsing");
  }

  const listGrant = listSubactionSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "m365GroupMailNickname",
    principal: " project-members ",
    roleType: "contribute",
  });
  assert(listGrant.success, "SharePoint list subaction schema should accept grantSPListRoleAssignment");
  if (listGrant.success) {
    assert(listGrant.data.principal === "project-members", "Permission principal should be trimmed");
  }

  const listRemove = listSubactionSchema.safeParse({
    verb: "removeSPListRoleAssignment",
    principalType: "loginName",
    principal: "i:0#.f|membership|user@contoso.com",
    roleId: 1073741827,
  });
  assert(listRemove.success, "SharePoint list subaction schema should accept removeSPListRoleAssignment");

  const siteBreak = siteSubactionSchema.safeParse({
    verb: "breakSPSiteRoleInheritance",
  });
  assert(siteBreak.success, "SharePoint site subaction schema should accept breakSPSiteRoleInheritance with defaults");

  const siteReset = siteSubactionSchema.safeParse({
    verb: "resetSPSiteRoleInheritance",
  });
  assert(siteReset.success, "SharePoint site subaction schema should accept resetSPSiteRoleInheritance");

  const siteRemove = siteSubactionSchema.safeParse({
    verb: "removeSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Owners",
    roleName: "Read",
  });
  assert(siteRemove.success, "SharePoint site subaction schema should accept removeSPSiteRoleAssignment with role reference");

  const listReset = listSubactionSchema.safeParse({
    verb: "resetSPListRoleInheritance",
  });
  assert(listReset.success, "SharePoint list subaction schema should accept resetSPListRoleInheritance");

  const listBreak = listSubactionSchema.safeParse({
    verb: "breakSPListRoleInheritance",
  });
  assert(listBreak.success, "SharePoint list subaction schema should accept breakSPListRoleInheritance with defaults");

  const rootBreakSite = sharePointActionsSchema.safeParse([
    {
      verb: "breakSPSiteRoleInheritance",
    },
  ]);
  assert(!rootBreakSite.success, "SharePoint root schema should reject breakSPSiteRoleInheritance");

  const rootResetSite = sharePointActionsSchema.safeParse([
    {
      verb: "resetSPSiteRoleInheritance",
    },
  ]);
  assert(!rootResetSite.success, "SharePoint root schema should reject resetSPSiteRoleInheritance");

  const rootGrantList = sharePointActionsSchema.safeParse([
    {
      verb: "grantSPListRoleAssignment",
      principalType: "m365GroupMailNickname",
      principal: "project-members",
      roleType: "contribute",
    },
  ]);
  assert(!rootGrantList.success, "SharePoint root schema should reject grantSPListRoleAssignment");

  const rootRemoveList = sharePointActionsSchema.safeParse([
    {
      verb: "removeSPListRoleAssignment",
      principalType: "spGroupName",
      principal: "Project Visitors",
      roleName: "Read",
    },
  ]);
  assert(!rootRemoveList.success, "SharePoint root schema should reject removeSPListRoleAssignment");

  const rootBreakList = sharePointActionsSchema.safeParse([
    {
      verb: "breakSPListRoleInheritance",
    },
  ]);
  assert(!rootBreakList.success, "SharePoint root schema should reject breakSPListRoleInheritance");

  const rootResetList = sharePointActionsSchema.safeParse([
    {
      verb: "resetSPListRoleInheritance",
    },
  ]);
  assert(!rootResetList.success, "SharePoint root schema should reject resetSPListRoleInheritance");

  const rootGrantSite = sharePointActionsSchema.safeParse([
    {
      verb: "grantSPSiteRoleAssignment",
      principalType: "spGroupName",
      principal: "Project Owners",
      roleName: "Full Control",
    },
  ]);
  assert(!rootGrantSite.success, "SharePoint root schema should reject grantSPSiteRoleAssignment");

  const rootRemoveSite = sharePointActionsSchema.safeParse([
    {
      verb: "removeSPSiteRoleAssignment",
      principalType: "spGroupName",
      principal: "Project Owners",
      roleName: "Read",
    },
  ]);
  assert(!rootRemoveSite.success, "SharePoint root schema should reject removeSPSiteRoleAssignment");

  const siteUsesListPermission = siteSubactionSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
  });
  assert(!siteUsesListPermission.success, "SharePoint site subaction schema should reject list permission actions directly");

  const siteUsesListBreak = siteSubactionSchema.safeParse({
    verb: "breakSPListRoleInheritance",
  });
  assert(!siteUsesListBreak.success, "SharePoint site subaction schema should reject breakSPListRoleInheritance");

  const siteUsesListReset = siteSubactionSchema.safeParse({
    verb: "resetSPListRoleInheritance",
  });
  assert(!siteUsesListReset.success, "SharePoint site subaction schema should reject resetSPListRoleInheritance");

  const siteUsesListRemove = siteSubactionSchema.safeParse({
    verb: "removeSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleName: "Read",
  });
  assert(!siteUsesListRemove.success, "SharePoint site subaction schema should reject removeSPListRoleAssignment");

  const listUsesSitePermission = listSubactionSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
  });
  assert(!listUsesSitePermission.success, "SharePoint list subaction schema should reject site permission actions");

  const listUsesSiteBreak = listSubactionSchema.safeParse({
    verb: "breakSPSiteRoleInheritance",
  });
  assert(!listUsesSiteBreak.success, "SharePoint list subaction schema should reject breakSPSiteRoleInheritance");

  const listUsesSiteReset = listSubactionSchema.safeParse({
    verb: "resetSPSiteRoleInheritance",
  });
  assert(!listUsesSiteReset.success, "SharePoint list subaction schema should reject resetSPSiteRoleInheritance");

  const listUsesSiteRemove = listSubactionSchema.safeParse({
    verb: "removeSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleName: "Read",
  });
  assert(!listUsesSiteRemove.success, "SharePoint list subaction schema should reject removeSPSiteRoleAssignment");

  const twoRoleRefs = grantSPListRoleAssignmentSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleName: "Contribute",
    roleType: "contribute",
  });
  assert(!twoRoleRefs.success, "Permission schema should reject multiple role references");

  const noRoleRef = grantSPListRoleAssignmentSchema.safeParse({
    verb: "grantSPListRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
  });
  assert(!noRoleRef.success, "Permission schema should reject missing role reference");

  const twoSiteRoleRefs = grantSPSiteRoleAssignmentSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleName: "Contribute",
    roleType: "contribute",
  });
  assert(!twoSiteRoleRefs.success, "Permission schema should reject multiple role references");

  const noSiteRoleRef = grantSPSiteRoleAssignmentSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
  });
  assert(!noSiteRoleRef.success, "Permission schema should reject missing role reference");

  const copyWithoutBreak = grantSPSiteRoleAssignmentSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
    copyRoleAssignments: true,
  });
  assert(!copyWithoutBreak.success, "Permission schema should reject copyRoleAssignments without breakRoleInheritance:true");

  const clearWithoutBreak = grantSPSiteRoleAssignmentSchema.safeParse({
    verb: "grantSPSiteRoleAssignment",
    principalType: "spGroupName",
    principal: "Project Members",
    roleType: "contribute",
    clearSubscopes: false,
  });
  assert(!clearWithoutBreak.success, "Permission schema should reject clearSubscopes without breakRoleInheritance:true");

  assertStringArrayEqual(
    breakSPSiteRoleInheritanceActionModule.placements,
    ["siteSubaction"],
    "breakSPSiteRoleInheritance action module should be site-subaction only"
  );
  assertStringArrayEqual(
    resetSPSiteRoleInheritanceActionModule.placements,
    ["siteSubaction"],
    "resetSPSiteRoleInheritance action module should be site-subaction only"
  );
  assertStringArrayEqual(
    grantSPSiteRoleAssignmentActionModule.placements,
    ["siteSubaction"],
    "grantSPSiteRoleAssignment action module should be site-subaction only"
  );
  assertStringArrayEqual(
    removeSPSiteRoleAssignmentActionModule.placements,
    ["siteSubaction"],
    "removeSPSiteRoleAssignment action module should be site-subaction only"
  );
  assertStringArrayEqual(
    breakSPListRoleInheritanceActionModule.placements,
    ["listSubaction"],
    "breakSPListRoleInheritance action module should be list-subaction only"
  );
  assertStringArrayEqual(
    resetSPListRoleInheritanceActionModule.placements,
    ["listSubaction"],
    "resetSPListRoleInheritance action module should be list-subaction only"
  );
  assertStringArrayEqual(
    grantSPListRoleAssignmentActionModule.placements,
    ["listSubaction"],
    "grantSPListRoleAssignment action module should be list-subaction only"
  );
  assertStringArrayEqual(
    removeSPListRoleAssignmentActionModule.placements,
    ["listSubaction"],
    "removeSPListRoleAssignment action module should be list-subaction only"
  );

  const permissionActions = [
    new BreakSPSiteRoleInheritanceAction(),
    new ResetSPSiteRoleInheritanceAction(),
    new GrantSPSiteRoleAssignmentAction(),
    new RemoveSPSiteRoleAssignmentAction(),
    new BreakSPListRoleInheritanceAction(),
    new ResetSPListRoleInheritanceAction(),
    new GrantSPListRoleAssignmentAction(),
    new RemoveSPListRoleAssignmentAction(),
  ];
  for (const action of permissionActions) {
    assertStringArrayEqual(
      action.requiredClients ?? [],
      ["spfi"],
      `${action.verb} should require only spfi at the action-definition level`
    );
  }

  assert(breakSPSiteRoleInheritanceSchema.safeParse({ verb: "breakSPSiteRoleInheritance" }).success, "Public breakSPSiteRoleInheritanceSchema should parse minimal payload");
  assert(resetSPSiteRoleInheritanceSchema.safeParse({ verb: "resetSPSiteRoleInheritance" }).success, "Public resetSPSiteRoleInheritanceSchema should parse minimal payload");
  assert(grantSPSiteRoleAssignmentSchema.safeParse({ verb: "grantSPSiteRoleAssignment", principalType: "loginName", principal: "i:0#.f|membership|user@contoso.com", roleType: "read" }).success, "Public grantSPSiteRoleAssignmentSchema should parse roleType payload");
  assert(removeSPSiteRoleAssignmentSchema.safeParse({ verb: "removeSPSiteRoleAssignment", principalType: "spGroupName", principal: "Visitors", roleName: "Read" }).success, "Public removeSPSiteRoleAssignmentSchema should parse roleName payload");
  assert(breakSPListRoleInheritanceSchema.safeParse({ verb: "breakSPListRoleInheritance" }).success, "Public breakSPListRoleInheritanceSchema should parse minimal payload");
  assert(resetSPListRoleInheritanceSchema.safeParse({ verb: "resetSPListRoleInheritance" }).success, "Public resetSPListRoleInheritanceSchema should parse minimal payload");
  assert(grantSPListRoleAssignmentSchema.safeParse({ verb: "grantSPListRoleAssignment", principalType: "m365GroupId", principal: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7", roleType: "edit" }).success, "Public grantSPListRoleAssignmentSchema should parse m365GroupId payload");
  assert(removeSPListRoleAssignmentSchema.safeParse({ verb: "removeSPListRoleAssignment", principalType: "entraGroupId", principal: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7", roleId: 1073741827 }).success, "Public removeSPListRoleAssignmentSchema should parse roleId payload");
}

function assertSharePointListViewPublicBarrelExports(): void {
  assert(new RootCreateSPListViewAction().verb === "createSPListView", "Package root should export CreateSPListViewAction");
  assert(new RootModifySPListViewAction().verb === "modifySPListView", "Package root should export ModifySPListViewAction");
  assert(new RootDeleteSPListViewAction().verb === "deleteSPListView", "Package root should export DeleteSPListViewAction");
  assert(
    rootCreateSPListViewSchema.safeParse({ verb: "createSPListView", title: "Root View" }).success,
    "Package root should export createSPListViewSchema"
  );
  assert(
    rootModifySPListViewSchema.safeParse({ verb: "modifySPListView", title: "Root View", rowLimit: 25 }).success,
    "Package root should export modifySPListViewSchema"
  );
  assert(
    rootDeleteSPListViewSchema.safeParse({ verb: "deleteSPListView", title: "Root View" }).success,
    "Package root should export deleteSPListViewSchema"
  );

  assert(new PublicCreateSPListViewAction().verb === "createSPListView", "Public SharePoint barrel should export CreateSPListViewAction");
  assert(new PublicModifySPListViewAction().verb === "modifySPListView", "Public SharePoint barrel should export ModifySPListViewAction");
  assert(new PublicDeleteSPListViewAction().verb === "deleteSPListView", "Public SharePoint barrel should export DeleteSPListViewAction");

  assert(
    publicCreateSPListViewSchema.safeParse({ verb: "createSPListView", title: "Public View" }).success,
    "Public SharePoint barrel should export createSPListViewSchema"
  );
  assert(
    publicModifySPListViewSchema.safeParse({ verb: "modifySPListView", title: "Public View", rowLimit: 25 }).success,
    "Public SharePoint barrel should export modifySPListViewSchema"
  );
  assert(
    publicDeleteSPListViewSchema.safeParse({ verb: "deleteSPListView", title: "Public View" }).success,
    "Public SharePoint barrel should export deleteSPListViewSchema"
  );
}

function assertSharePointNavigationPublicBarrelExports(): void {
  assert(new RootCreateSPNavigationNodeAction().verb === "createSPNavigationNode", "Package root should export CreateSPNavigationNodeAction");
  assert(new RootModifySPNavigationNodeAction().verb === "modifySPNavigationNode", "Package root should export ModifySPNavigationNodeAction");
  assert(new RootDeleteSPNavigationNodeAction().verb === "deleteSPNavigationNode", "Package root should export DeleteSPNavigationNodeAction");
  assert(
    rootCreateSPNavigationNodeSchema.safeParse({
      verb: "createSPNavigationNode",
      location: "quicklaunch",
      title: "Root Navigation",
      url: "/sites/demo",
    }).success,
    "Package root should export createSPNavigationNodeSchema"
  );
  assert(
    rootModifySPNavigationNodeSchema.safeParse({
      verb: "modifySPNavigationNode",
      location: "topNavigationBar",
      title: "Root Navigation",
      isVisible: false,
    }).success,
    "Package root should export modifySPNavigationNodeSchema"
  );
  assert(
    rootDeleteSPNavigationNodeSchema.safeParse({
      verb: "deleteSPNavigationNode",
      location: "quicklaunch",
      title: "Root Navigation",
    }).success,
    "Package root should export deleteSPNavigationNodeSchema"
  );

  assert(new PublicCreateSPNavigationNodeAction().verb === "createSPNavigationNode", "Public SharePoint barrel should export CreateSPNavigationNodeAction");
  assert(new PublicModifySPNavigationNodeAction().verb === "modifySPNavigationNode", "Public SharePoint barrel should export ModifySPNavigationNodeAction");
  assert(new PublicDeleteSPNavigationNodeAction().verb === "deleteSPNavigationNode", "Public SharePoint barrel should export DeleteSPNavigationNodeAction");

  assert(
    publicCreateSPNavigationNodeSchema.safeParse({
      verb: "createSPNavigationNode",
      location: "quicklaunch",
      title: "Public Navigation",
      url: "/sites/demo",
    }).success,
    "Public SharePoint barrel should export createSPNavigationNodeSchema"
  );
  assert(
    publicModifySPNavigationNodeSchema.safeParse({
      verb: "modifySPNavigationNode",
      location: "topNavigationBar",
      title: "Public Navigation",
      isVisible: false,
    }).success,
    "Public SharePoint barrel should export modifySPNavigationNodeSchema"
  );
  assert(
    publicDeleteSPNavigationNodeSchema.safeParse({
      verb: "deleteSPNavigationNode",
      location: "quicklaunch",
      title: "Public Navigation",
    }).success,
    "Public SharePoint barrel should export deleteSPNavigationNodeSchema"
  );
}

function navigationCollectionFrom(nodes: {
  items: Array<{ Id: number; Title: string; Url?: string; IsVisible?: boolean }>;
  onAdd?: (title: string, url: string, isVisible: boolean) => void;
  onUpdate?: (id: number, props: Record<string, unknown>) => void;
  onDelete?: (id: number) => void;
}) {
  const collection = Object.assign(
    async () => nodes.items,
    {
      add: async (title: string, url: string, isVisible = true) => {
        nodes.onAdd?.(title, url, isVisible);
        return { Id: 999, Title: title, Url: url, IsVisible: isVisible };
      },
      getById: (id: number) => ({
        update: async (props: Record<string, unknown>) => {
          nodes.onUpdate?.(id, props);
          return { data: props, node: {} };
        },
        delete: async () => {
          nodes.onDelete?.(id);
        },
      }),
    }
  );
  return collection;
}

function navigationWebFrom(options: {
  quicklaunch?: Array<{ Id: number; Title: string; Url?: string; IsVisible?: boolean }>;
  topNavigationBar?: Array<{ Id: number; Title: string; Url?: string; IsVisible?: boolean }>;
  onQuicklaunchAdd?: (title: string, url: string, isVisible: boolean) => void;
  onQuicklaunchUpdate?: (id: number, props: Record<string, unknown>) => void;
  onQuicklaunchDelete?: (id: number) => void;
  canManageWeb?: boolean;
}) {
  return {
    currentUserHasPermissions: async () => options.canManageWeb ?? true,
    navigation: {
      quicklaunch: navigationCollectionFrom({
        items: options.quicklaunch ?? [],
        onAdd: options.onQuicklaunchAdd,
        onUpdate: options.onQuicklaunchUpdate,
        onDelete: options.onQuicklaunchDelete,
      }),
      topNavigationBar: navigationCollectionFrom({
        items: options.topNavigationBar ?? [],
      }),
    },
  };
}

async function assertCreateSPNavigationNodeAddsMissingNode(): Promise<void> {
  let added: { title: string; url: string; isVisible: boolean } | undefined;
  const web = navigationWebFrom({
    quicklaunch: [],
    onQuicklaunchAdd: (title, url, isVisible) => {
      added = { title, url, isVisible };
    },
  });

  const result = await new CreateSPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
        isVisible: false,
      },
    },
  });

  assert(result.result?.outcome === "executed", "createSPNavigationNode should execute when missing");
  assert(added?.title === "Orders", "createSPNavigationNode should pass title to PnPjs add");
  assert(added?.url === "/sites/demo/orders", "createSPNavigationNode should pass url to PnPjs add");
  assert(added?.isVisible === false, "createSPNavigationNode should pass isVisible to PnPjs add");
}

async function assertCreateSPNavigationNodeSkipsExistingWithoutWrites(): Promise<void> {
  let addCalled = false;
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
    onQuicklaunchAdd: () => {
      addCalled = true;
    },
  });

  const result = await new CreateSPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  });

  assert(result.result?.outcome === "skipped", "createSPNavigationNode should skip existing nodes");
  assert(result.result?.outcome === "skipped" && result.result.reason === "already_exists", "createSPNavigationNode should report already_exists");
  assert(!addCalled, "createSPNavigationNode should not add when title already exists");
}

async function assertModifySPNavigationNodeUpdatesChangedNode(): Promise<void> {
  let updated: { id: number; props: Record<string, unknown> } | undefined;
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
    onQuicklaunchUpdate: (id, props) => {
      updated = { id, props };
    },
  });

  const result = await new ModifySPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        newTitle: "Customer Orders",
        url: "/sites/demo/customer-orders",
        isVisible: false,
      },
    },
  });

  assert(result.result?.outcome === "executed", "modifySPNavigationNode should execute when mutable state differs");
  assert(updated?.id === 7, "modifySPNavigationNode should update the matched node by Id");
  assert(JSON.stringify(updated?.props) === JSON.stringify({
    Title: "Customer Orders",
    Url: "/sites/demo/customer-orders",
    IsVisible: false,
  }), "modifySPNavigationNode should send expected PnPjs update props");
}

async function assertModifySPNavigationNodeSkipsWhenAlreadyCompliant(): Promise<void> {
  let updateCalled = false;
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
    onQuicklaunchUpdate: () => {
      updateCalled = true;
    },
  });

  const result = await new ModifySPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
        isVisible: true,
      },
    },
  });

  assert(result.result?.outcome === "skipped", "modifySPNavigationNode should skip already-compliant nodes");
  assert(result.result?.outcome === "skipped" && result.result.reason === "no_changes", "modifySPNavigationNode should report no_changes");
  assert(!updateCalled, "modifySPNavigationNode should not update when state already matches");
}

async function assertModifySPNavigationNodeSkipsEquivalentUrls(): Promise<void> {
  let updateCalled = false;
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/Lists/orders/AllItems.aspx", IsVisible: true }],
    onQuicklaunchUpdate: () => {
      updateCalled = true;
    },
  });

  const result = await new ModifySPNavigationNodeAction().handler({
    scopeIn: {
      web,
      webUrl: "https://contoso.sharepoint.com/sites/demo",
    } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "https://contoso.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
        isVisible: true,
      },
    },
  });

  assert(result.result?.outcome === "skipped", "modifySPNavigationNode should skip equivalent absolute/server-relative URLs");
  assert(result.result?.outcome === "skipped" && result.result.reason === "no_changes", "modifySPNavigationNode should report no_changes for equivalent URLs");
  assert(!updateCalled, "modifySPNavigationNode should not update when only URL representation differs");
}

async function assertDeleteSPNavigationNodeDeletesMatchedNode(): Promise<void> {
  let deletedId: number | undefined;
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/orders", IsVisible: true }],
    onQuicklaunchDelete: (id) => {
      deletedId = id;
    },
  });

  const result = await new DeleteSPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "deleteSPNavigationNode",
      payload: {
        verb: "deleteSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
      },
    },
  });

  assert(result.result?.outcome === "executed", "deleteSPNavigationNode should execute when one matching node exists");
  assert(deletedId === 7, "deleteSPNavigationNode should delete the matched node by Id");
}

async function assertNavigationHandlersSkipAmbiguousDuplicateTitles(): Promise<void> {
  const web = navigationWebFrom({
    quicklaunch: [
      { Id: 7, Title: "Orders", Url: "/sites/demo/orders-a", IsVisible: true },
      { Id: 8, Title: "Orders", Url: "/sites/demo/orders-b", IsVisible: true },
    ],
  });

  const createResult = await new CreateSPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  });

  const modifyResult = await new ModifySPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/2",
      verb: "modifySPNavigationNode",
      payload: {
        verb: "modifySPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        isVisible: false,
      },
    },
  });

  const deleteResult = await new DeleteSPNavigationNodeAction().handler({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    out: idleOut(),
    action: {
      path: "1/3",
      verb: "deleteSPNavigationNode",
      payload: {
        verb: "deleteSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
      },
    },
  });

  for (const result of [createResult, modifyResult, deleteResult]) {
    assert(result.result?.outcome === "skipped", "navigation action should skip ambiguous duplicate titles");
    assert(result.result?.outcome === "skipped" && result.result.reason === "unsupported", "navigation action should report unsupported for ambiguous duplicate titles");
    assert(
      result.result?.warnings?.[0]?.code === "NAVIGATION_NODE_AMBIGUOUS_TITLE",
      "navigation action should emit an ambiguous-title warning"
    );
  }
}

async function assertNavigationCompliancePrerequisites(): Promise<void> {
  const compliance = await new CreateSPNavigationNodeAction().checkCompliance({
    scopeIn: {},
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  });

  assert(compliance.outcome === "unverifiable", "navigation compliance should be unverifiable without web scope");
  assert(compliance.reason === "missing_prerequisite", "navigation compliance should report missing web prerequisite");
}

async function assertNavigationComplianceDetectsDrift(): Promise<void> {
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/old-orders", IsVisible: true }],
  });

  const compliance = await new CreateSPNavigationNodeAction().checkCompliance({
    scopeIn: { web } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "/sites/demo/orders",
      },
    },
  });

  assert(compliance.outcome === "non_compliant", "navigation compliance should detect drift");
  assert(compliance.reason === "drift", "navigation compliance should report drift when URL differs");
}

async function assertNavigationComplianceTreatsEquivalentUrlsAsCompliant(): Promise<void> {
  const web = navigationWebFrom({
    quicklaunch: [{ Id: 7, Title: "Orders", Url: "/sites/demo/Lists/orders/AllItems.aspx", IsVisible: true }],
  });

  const compliance = await new CreateSPNavigationNodeAction().checkCompliance({
    scopeIn: {
      web,
      webUrl: "https://contoso.sharepoint.com/sites/demo",
    } as unknown as M365Scope,
    clients: { spfi: { marker: "spfi" } } as unknown as M365Clients,
    logger: createLogger({ sinks: [] }),
    action: {
      path: "1/1",
      verb: "createSPNavigationNode",
      payload: {
        verb: "createSPNavigationNode",
        location: "quicklaunch",
        title: "Orders",
        url: "https://contoso.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
      },
    },
  });

  assert(compliance.outcome === "compliant", "navigation compliance should treat equivalent absolute and server-relative URLs as compliant");
}

function assertNavigationUrlEquivalencePreservesExternalOrigins(): void {
  assert(
    areNavigationNodeUrlsEquivalent(
      "https://contoso.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
      "/sites/demo/Lists/orders/AllItems.aspx",
      { webUrl: "https://contoso.sharepoint.com/sites/demo" }
    ),
    "navigation URL comparison should treat same-origin absolute and server-relative URLs as equivalent"
  );
  assert(
    areNavigationNodeUrlsEquivalent(
      "https://contoso.sharepoint.com/sites/other/Lists/orders/AllItems.aspx",
      "/sites/other/Lists/orders/AllItems.aspx",
      { webUrl: "https://contoso.sharepoint.com/sites/demo" }
    ),
    "navigation URL comparison should treat same-tenant cross-site absolute and server-relative URLs as equivalent"
  );
  assert(
    areNavigationNodeUrlsEquivalent(
      "Lists/orders/AllItems.aspx",
      "https://contoso.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
      { webUrl: "https://contoso.sharepoint.com/sites/demo" }
    ),
    "navigation URL comparison should resolve web-relative URLs against the current web"
  );
  assert(
    !areNavigationNodeUrlsEquivalent(
      "https://contoso.sharepoint.com/sites/other/Lists/orders/AllItems.aspx",
      "Lists/orders/AllItems.aspx",
      { webUrl: "https://contoso.sharepoint.com/sites/demo" }
    ),
    "navigation URL comparison should not confuse cross-site links with current-web relative links"
  );
  assert(
    !areNavigationNodeUrlsEquivalent(
      "https://contoso.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
      "/sites/demo/Lists/orders/AllItems.aspx"
    ),
    "navigation URL comparison should not equate absolute and server-relative URLs without a known webUrl"
  );
  assert(
    !areNavigationNodeUrlsEquivalent(
      "https://contoso.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
      "https://fabrikam.sharepoint.com/sites/demo/Lists/orders/AllItems.aspx",
      { webUrl: "https://contoso.sharepoint.com/sites/demo" }
    ),
    "navigation URL comparison should not treat different tenant origins as equivalent"
  );
  assert(
    !areNavigationNodeUrlsEquivalent(
      "https://docs.contoso.com/help?token=ABC",
      "https://docs.contoso.com/help?token=abc",
      { webUrl: "https://contoso.sharepoint.com/sites/demo" }
    ),
    "navigation URL comparison should preserve case-sensitive external query values"
  );
}

async function assertSharePointPermissionDomainHelpers(): Promise<void> {
  assert(getRoleTypeKind("read") === 2, "read roleType should map to RoleTypeKind.Reader");
  assert(getRoleTypeKind("contribute") === 3, "contribute roleType should map to RoleTypeKind.Contributor");
  assert(getRoleTypeKind("design") === 4, "design roleType should map to RoleTypeKind.WebDesigner");
  assert(getRoleTypeKind("fullControl") === 5, "fullControl roleType should map to RoleTypeKind.Administrator");
  assert(getRoleTypeKind("edit") === 6, "edit roleType should map to RoleTypeKind.Editor");

  const claim = buildEntraGroupClaim("7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7");
  assert(
    claim === "c:0t.c|tenant|7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7",
    "Entra group claim should use the SharePoint tenant security-group claim provider"
  );
  const m365Claim = buildM365GroupClaim("7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7");
  assert(
    m365Claim === "c:0o.c|federateddirectoryclaimprovider|7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7",
    "M365 group claim should use the SharePoint federated directory claim provider"
  );

  const uniqueTarget = {
    select: (...fields: string[]) => async () => {
      assertStringArrayEqual(fields, ["HasUniqueRoleAssignments"], "Inheritance check should select HasUniqueRoleAssignments");
      return { HasUniqueRoleAssignments: true };
    },
  };
  assert(await getSecurableHasUniqueRoleAssignments(uniqueTarget as never), "Inheritance check should read unique role assignment state");

  const ensureUserCalls: string[] = [];
  const siteUserCalls: string[] = [];
  const web = {
    roleDefinitions: roleDefinitionsFrom([
      { Id: 1073741826, Name: "Read", RoleTypeKind: 2 },
      { Id: 1073741827, Name: "Contribute", RoleTypeKind: 3 },
      { Id: 123, Name: "O'Brien Role", RoleTypeKind: 0 },
    ]),
    ensureUser: async (loginName: string) => {
      ensureUserCalls.push(loginName);
      return { Id: loginName.includes("missing") ? undefined : 42, LoginName: loginName };
    },
    siteUsers: {
      getByLoginName: (loginName: string) => async () => {
        siteUserCalls.push(loginName);
        if (loginName.includes("missing")) throw Object.assign(new Error("user not found"), { status: 404 });
        return { Id: loginName.includes("not-materialized") ? undefined : 84, LoginName: loginName };
      },
    },
    siteGroups: {
      getByName: (name: string) => async () => ({ Id: name === "Project Members" ? 77 : undefined, Title: name }),
    },
  };

  const roleByName = await resolveRoleDefinitionId(web as never, { roleName: "O'Brien Role" });
  assert(roleByName === 123, "Role name lookup should support apostrophes through escaped filter queries");
  const roleByType = await resolveRoleDefinitionId(web as never, { roleType: "contribute" });
  assert(roleByType === 1073741827, "Role type lookup should resolve to the SharePoint role definition id");

  const loginPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "loginName",
    principal: "i:0#.f|membership|user@contoso.com",
    allowEnsureUser: true,
  });
  assert(loginPrincipal === 42, "loginName principal resolution should use ensureUser");

  const spGroupPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "spGroupName",
    principal: "Project Members",
    allowEnsureUser: true,
  });
  assert(spGroupPrincipal === 77, "spGroupName principal resolution should use siteGroups.getByName");

  const entraGroupPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "entraGroupId",
    principal: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7",
    allowEnsureUser: true,
  });
  assert(entraGroupPrincipal === 42, "entraGroupId principal resolution should ensure the Entra security-group claim");

  const m365GroupByIdPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "m365GroupId",
    principal: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7",
    allowEnsureUser: true,
  });
  assert(m365GroupByIdPrincipal === 42, "m365GroupId principal resolution should ensure the Microsoft 365 group claim");
  assert(
    ensureUserCalls.includes("c:0t.c|tenant|7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7"),
    "entraGroupId principal resolution should pass the Entra security-group claim to ensureUser"
  );
  assert(
    ensureUserCalls.includes("c:0o.c|federateddirectoryclaimprovider|7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7"),
    "m365GroupId principal resolution should pass the M365 group claim to ensureUser"
  );

  const graphPrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: graphGroupsFrom([
      { id: "7f7d25e4-0f82-4e06-a8bb-1ed86a80c3d7", mailNickname: "project-members", groupTypes: ["Unified"] },
    ]) as never,
    principalType: "m365GroupMailNickname",
    principal: "project-members",
    allowEnsureUser: true,
  });
  assert(graphPrincipal === 42, "m365GroupMailNickname principal resolution should resolve Graph id then ensure the SharePoint claim");

  const entraGroupByNamePrincipal = await resolvePrincipalId({
    web: web as never,
    graphClient: graphGroupsFrom([
      { id: "security-group-id", displayName: "Project Security", securityEnabled: true },
      { id: "unified-group-id", displayName: "Project Security", groupTypes: ["Unified"], securityEnabled: false },
    ]) as never,
    principalType: "entraGroupName",
    principal: "Project Security",
    allowEnsureUser: true,
  });
  assert(entraGroupByNamePrincipal === 42, "entraGroupName principal resolution should constrain Graph lookup to security-enabled groups");
  assert(
    ensureUserCalls.includes("c:0t.c|tenant|security-group-id"),
    "entraGroupName principal resolution should materialize the Entra security-group claim"
  );

  const loginPrincipalWithoutEnsure = await resolvePrincipalId({
    web: web as never,
    graphClient: undefined,
    principalType: "loginName",
    principal: "i:0#.f|membership|existing@contoso.com",
    allowEnsureUser: false,
  });
  assert(loginPrincipalWithoutEnsure === 84, "allowEnsureUser:false should resolve principals through siteUsers.getByLoginName");
  assert(
    siteUserCalls.includes("i:0#.f|membership|existing@contoso.com"),
    "allowEnsureUser:false should use siteUsers.getByLoginName instead of ensureUser"
  );

  await assertRejectsWithPermissionResolutionReason(
    () => resolvePrincipalId({
      web: web as never,
      graphClient: undefined,
      principalType: "loginName",
      principal: "i:0#.f|membership|missing@contoso.com",
      allowEnsureUser: false,
    }),
    "not_found",
    "allowEnsureUser:false should normalize missing siteUsers lookups to PermissionResolutionError(not_found)"
  );

  await assertRejectsWithPermissionResolutionReason(
    () => resolvePrincipalId({
      web: web as never,
      graphClient: undefined,
      principalType: "loginName",
      principal: "i:0#.f|membership|not-materialized@contoso.com",
      allowEnsureUser: false,
    }),
    "not_found",
    "allowEnsureUser:false should treat non-materialized siteUsers lookups as PermissionResolutionError(not_found)"
  );

  await assertRejectsWithPermissionResolutionReason(
    () => resolvePrincipalId({
      web: web as never,
      graphClient: graphGroupsFrom([
        { id: "first", displayName: "Duplicate Security", securityEnabled: true },
        { id: "second", displayName: "Duplicate Security", securityEnabled: true },
      ]) as never,
      principalType: "entraGroupName",
      principal: "Duplicate Security",
      allowEnsureUser: true,
    }),
    "ambiguous",
    "entraGroupName principal resolution should surface ambiguous Graph matches"
  );

  await assertRejectsWithPermissionResolutionReason(
    () => resolvePrincipalId({
      web: web as never,
      graphClient: undefined,
      principalType: "m365GroupName",
      principal: "Project Team",
      allowEnsureUser: true,
    }),
    "missing_prerequisite",
    "Graph-backed group resolution should require GraphFI"
  );

  const hasBinding = await hasRoleAssignmentBinding(roleAssignmentsFrom({ 42: [1073741827] }) as never, 42, 1073741827);
  assert(hasBinding, "Role assignment binding check should detect existing binding");
  const missingBinding = await hasRoleAssignmentBinding(roleAssignmentsFrom({}) as never, 42, 1073741827);
  assert(!missingBinding, "Role assignment binding check should treat missing role assignment as absent");
}

async function assertSharePointPermissionActionRuntime(): Promise<void> {
  const web = {
    ...permissionTargetFrom({ unique: true }),
    roleDefinitions: roleDefinitionsFrom([
      { Id: 1073741827, Name: "Contribute", RoleTypeKind: 3 },
    ]),
    ensureUser: async () => ({ Id: 42 }),
    siteUsers: {
      getByLoginName: () => async () => ({ Id: 42 }),
    },
    siteGroups: {
      getByName: () => async () => ({ Id: 77 }),
    },
  } as unknown as NonNullable<M365Scope["web"]>;

  let breakArgs: readonly [boolean, boolean] | undefined;
  const inheritedList = permissionTargetFrom({
    unique: false,
    onBreak: (copyRoleAssignments, clearSubscopes) => {
      breakArgs = [copyRoleAssignments, clearSubscopes];
    },
    onAdd: (principalId, roleDefId) => {
      assert(principalId === 77, "grantSPListRoleAssignment should add the resolved principal id");
      assert(roleDefId === 1073741827, "grantSPListRoleAssignment should add the resolved role definition id");
    },
  }) as unknown as NonNullable<M365Scope["list"]>;

  const grantWithBreak = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: inheritedList, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
        breakRoleInheritance: true,
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);

  assert(grantWithBreak.result?.outcome === "executed", "grantSPListRoleAssignment should execute when it breaks inherited permissions explicitly");
  assertStringArrayEqual(
    (breakArgs ?? []).map(String),
    ["true", "false"],
    "grantSPListRoleAssignment should use safe breakRoleInheritance defaults"
  );

  let copiedBindingBreakCalled = false;
  let copiedBindingAddCalled = false;
  const inheritedListWithCopiedBinding = permissionTargetFrom({
    unique: false,
    bindingsByPrincipal: { 77: [1073741827] },
    onBreak: () => {
      copiedBindingBreakCalled = true;
    },
    onAdd: () => {
      copiedBindingAddCalled = true;
    },
  }) as unknown as NonNullable<M365Scope["list"]>;

  const grantWithBreakAndCopiedBinding = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: inheritedListWithCopiedBinding, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
        breakRoleInheritance: true,
        copyRoleAssignments: true,
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);
  assert(copiedBindingBreakCalled, "grantSPListRoleAssignment should break inheritance before treating copied bindings as satisfied");
  assert(!copiedBindingAddCalled, "grantSPListRoleAssignment should not add a binding already copied by breakRoleInheritance");
  assert(grantWithBreakAndCopiedBinding.result?.outcome === "executed", "grantSPListRoleAssignment should report executed when breakRoleInheritance changed the target even if the copied binding already exists");

  const delayedBreakResult = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: false, breakPersistsAfterChecks: 3 }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
        breakRoleInheritance: true,
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);
  assert(delayedBreakResult.result?.outcome === "executed", "grantSPListRoleAssignment should tolerate delayed HasUniqueRoleAssignments updates after breakRoleInheritance");

  await assertRejectsWithMessage(
    () => new GrantSPListRoleAssignmentAction().handler({
      scopeIn: {
        web,
        list: permissionTargetFrom({ unique: false, breakPersists: false }) as unknown as NonNullable<M365Scope["list"]>,
        listName: "documents",
      },
      clients: { spfi: {} },
      out: idleOut(),
      logger,
      action: {
        path: "1",
        verb: "grantSPListRoleAssignment",
        payload: {
          verb: "grantSPListRoleAssignment",
          principalType: "spGroupName",
          principal: "Project Members",
          roleType: "contribute",
          breakRoleInheritance: true,
        },
      },
    } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]),
    "still inherits permissions after breakRoleInheritance",
    "grantSPListRoleAssignment should fail clearly when breakRoleInheritance does not persist"
  );

  let skippedBreakCalled = false;
  const inheritedListForSkippedBreak = permissionTargetFrom({
    unique: false,
    onBreak: () => {
      skippedBreakCalled = true;
    },
  }) as unknown as NonNullable<M365Scope["list"]>;

  const grantWithBreakMissingGraph = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: inheritedListForSkippedBreak, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "m365GroupName",
        principal: "Project Team",
        roleType: "contribute",
        breakRoleInheritance: true,
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);
  assert(grantWithBreakMissingGraph.result?.outcome === "skipped", "grantSPListRoleAssignment should skip missing Graph before breaking inheritance");
  assert(grantWithBreakMissingGraph.result?.reason === "missing_prerequisite", "grantSPListRoleAssignment should report missing_prerequisite before break when Graph is unavailable");
  assert(!skippedBreakCalled, "grantSPListRoleAssignment should not break inheritance when principal resolution fails");

  const inheritedGrantSkip = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);
  assert(inheritedGrantSkip.result?.outcome === "skipped", "grantSPListRoleAssignment should skip inherited targets without explicit break");
  assert(inheritedGrantSkip.result?.reason === "missing_prerequisite", "grantSPListRoleAssignment should report missing_prerequisite for inherited targets without explicit break");

  const removeMissing = await new RemoveSPListRoleAssignmentAction().handler({
    scopeIn: { web, list: permissionTargetFrom({ unique: true }) as unknown as NonNullable<M365Scope["list"]>, listName: "documents" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "removeSPListRoleAssignment",
      payload: {
        verb: "removeSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPListRoleAssignmentAction["handler"]>[0]);
  assert(removeMissing.result?.outcome === "skipped", "removeSPListRoleAssignment should skip missing bindings");
  assert(removeMissing.result?.reason === "not_found", "removeSPListRoleAssignment should report not_found for missing bindings");
  assert(removeMissing.result?.resource === "Project Members -> contribute", "removeSPListRoleAssignment should report assignment-specific resources");

  const webWithoutContribute = {
    ...web,
    roleDefinitions: roleDefinitionsFrom([
      { Id: 1073741826, Name: "Read", RoleTypeKind: 2 },
    ]),
  } as unknown as NonNullable<M365Scope["web"]>;
  const removeMissingRole = await new RemoveSPListRoleAssignmentAction().handler({
    scopeIn: {
      web: webWithoutContribute,
      list: permissionTargetFrom({ unique: true }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "removeSPListRoleAssignment",
      payload: {
        verb: "removeSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPListRoleAssignmentAction["handler"]>[0]);
  assert(removeMissingRole.result?.outcome === "skipped", "removeSPListRoleAssignment should stay idempotent when the role cannot be resolved");
  assert(removeMissingRole.result?.reason === "not_found", "removeSPListRoleAssignment should treat missing role resolution as not_found");
  assert(removeMissingRole.result?.resource === "Project Members -> contribute", "removeSPListRoleAssignment should preserve assignment-specific resources on resolution skips");

  const removeLoginPrincipalCalls: string[] = [];
  const removeUniqueLoginName = await new RemoveSPListRoleAssignmentAction().handler({
    scopeIn: {
      web: {
        ...web,
        ensureUser: async () => {
          throw new Error("removeSPListRoleAssignment should not call ensureUser for loginName principals on unique targets");
        },
        siteUsers: {
          getByLoginName: (loginName: string) => async () => {
            removeLoginPrincipalCalls.push(loginName);
            return { Id: 42, LoginName: loginName };
          },
        },
      } as unknown as NonNullable<M365Scope["web"]>,
      list: permissionTargetFrom({ unique: true }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "removeSPListRoleAssignment",
      payload: {
        verb: "removeSPListRoleAssignment",
        principalType: "loginName",
        principal: "i:0#.f|membership|existing@contoso.com",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPListRoleAssignmentAction["handler"]>[0]);
  assert(removeUniqueLoginName.result?.outcome === "skipped", "removeSPListRoleAssignment should stay idempotent for absent loginName bindings");
  assert(removeUniqueLoginName.result?.reason === "not_found", "removeSPListRoleAssignment should report not_found for absent loginName bindings");
  assertStringArrayEqual(
    removeLoginPrincipalCalls,
    ["i:0#.f|membership|existing@contoso.com"],
    "removeSPListRoleAssignment should resolve loginName principals via siteUsers.getByLoginName on unique targets"
  );

  const removeInheritedSkip = await new RemoveSPListRoleAssignmentAction().handler({
    scopeIn: {
      web: {
        ...web,
        roleDefinitions: {
          getById: () => {
            throw new Error("removeSPListRoleAssignment should not resolve roles before inherited skip");
          },
          getByType: () => {
            throw new Error("removeSPListRoleAssignment should not resolve roles before inherited skip");
          },
          filter: () => {
            throw new Error("removeSPListRoleAssignment should not resolve roles before inherited skip");
          },
        },
        ensureUser: async () => {
          throw new Error("removeSPListRoleAssignment should not call ensureUser before inherited skip");
        },
        siteUsers: {
          getByLoginName: () => async () => {
            throw new Error("removeSPListRoleAssignment should not resolve site users before inherited skip");
          },
        },
        siteGroups: {
          getByName: () => async () => {
            throw new Error("removeSPListRoleAssignment should not resolve site groups before inherited skip");
          },
        },
      } as unknown as NonNullable<M365Scope["web"]>,
      list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "removeSPListRoleAssignment",
      payload: {
        verb: "removeSPListRoleAssignment",
        principalType: "loginName",
        principal: "i:0#.f|membership|existing@contoso.com",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPListRoleAssignmentAction["handler"]>[0]);
  assert(removeInheritedSkip.result?.outcome === "skipped", "removeSPListRoleAssignment should skip inherited targets before principal or role resolution");
  assert(removeInheritedSkip.result?.reason === "missing_prerequisite", "removeSPListRoleAssignment should report missing_prerequisite for inherited targets");
  assert(removeInheritedSkip.result?.resource === "i:0#.f|membership|existing@contoso.com -> contribute", "removeSPListRoleAssignment should preserve assignment-specific resources on inherited skips");

  const grantInheritedCompliance = await new GrantSPListRoleAssignmentAction().checkCompliance({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
        breakRoleInheritance: true,
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["checkCompliance"]>[0]);
  assert(grantInheritedCompliance.outcome === "non_compliant", "grantSPListRoleAssignment compliance should flag inherited targets when breakRoleInheritance is required");
  assert(grantInheritedCompliance.reason === "inherited_permissions", "grantSPListRoleAssignment compliance should use inherited_permissions for inherited targets");
  assert(grantInheritedCompliance.resource === "Project Members -> contribute", "grantSPListRoleAssignment compliance should report assignment-specific resources");

  const removeMissingRoleCompliance = await new RemoveSPListRoleAssignmentAction().checkCompliance({
    scopeIn: {
      web: webWithoutContribute,
      list: permissionTargetFrom({ unique: true }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "removeSPListRoleAssignment",
      payload: {
        verb: "removeSPListRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPListRoleAssignmentAction["checkCompliance"]>[0]);
  assert(removeMissingRoleCompliance.outcome === "compliant", "removeSPListRoleAssignment compliance should treat unresolved bindings as already absent");
  assert(removeMissingRoleCompliance.resource === "Project Members -> contribute", "removeSPListRoleAssignment compliance should report assignment-specific resources");

  const graphBackedPrincipalSkip = await new GrantSPListRoleAssignmentAction().handler({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: true }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "m365GroupName",
        principal: "Project Team",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["handler"]>[0]);
  assert(graphBackedPrincipalSkip.result?.outcome === "skipped", "grantSPListRoleAssignment should skip Graph-backed principals when Graph is unavailable");
  assert(graphBackedPrincipalSkip.result?.reason === "missing_prerequisite", "grantSPListRoleAssignment should report missing_prerequisite when Graph-backed principal resolution lacks Graph");
  assert(graphBackedPrincipalSkip.result?.resource === "Project Team -> contribute", "grantSPListRoleAssignment should keep assignment-specific resources on Graph prerequisite skips");

  let resetCalled = false;
  const resetResult = await new ResetSPSiteRoleInheritanceAction().handler({
    scopeIn: {
      web: {
        ...web,
        ...permissionTargetFrom({
          unique: true,
          onReset: () => {
            resetCalled = true;
          },
        }),
      } as unknown as NonNullable<M365Scope["web"]>,
      webUrl: "https://contoso.sharepoint.com/sites/project",
    },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "resetSPSiteRoleInheritance",
      payload: { verb: "resetSPSiteRoleInheritance" },
    },
  } as Parameters<ResetSPSiteRoleInheritanceAction["handler"]>[0]);
  assert(resetResult.result?.outcome === "executed", "resetSPSiteRoleInheritance should execute for unique permissions");
  assert(resetCalled, "resetSPSiteRoleInheritance should call resetRoleInheritance");
}

async function assertSharePointPermissionCompliance(): Promise<void> {
  const web = {
    ...permissionTargetFrom({ unique: true, bindingsByPrincipal: { 77: [1073741827] } }),
    roleDefinitions: roleDefinitionsFrom([
      { Id: 1073741826, Name: "Read", RoleTypeKind: 2 },
      { Id: 1073741827, Name: "Contribute", RoleTypeKind: 3 },
    ]),
    siteUsers: {
      getByLoginName: () => async () => ({ Id: 77 }),
    },
    ensureUser: async () => ({ Id: 77 }),
    siteGroups: {
      getByName: () => async () => ({ Id: 77 }),
    },
  } as unknown as NonNullable<M365Scope["web"]>;

  const loginWeb = {
    ...web,
    siteUsers: {
      getByLoginName: () => async () => {
        throw new Error("grantSPListRoleAssignment compliance should not use siteUsers.getByLoginName for loginName principals");
      },
    },
    ensureUser: async () => ({ Id: 77 }),
  } as unknown as NonNullable<M365Scope["web"]>;

  const grantCompliance = await new GrantSPSiteRoleAssignmentAction().checkCompliance({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/project" },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "grantSPSiteRoleAssignment",
      payload: {
        verb: "grantSPSiteRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPSiteRoleAssignmentAction["checkCompliance"]>[0]);
  assert(grantCompliance.outcome === "compliant", "grantSPSiteRoleAssignment compliance should be compliant when binding exists");
  assert(
    grantCompliance.resource === "Project Members -> contribute",
    "grantSPSiteRoleAssignment compliance should report assignment-specific resources"
  );

  const loginGrantCompliance = await new GrantSPListRoleAssignmentAction().checkCompliance({
    scopeIn: {
      web: loginWeb,
      list: permissionTargetFrom({ unique: true, bindingsByPrincipal: { 77: [1073741826] } }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "grantSPListRoleAssignment",
      payload: {
        verb: "grantSPListRoleAssignment",
        principalType: "loginName",
        principal: "fabio@apveelabs.onmicrosoft.com",
        roleType: "read",
      },
    },
  } as Parameters<GrantSPListRoleAssignmentAction["checkCompliance"]>[0]);
  assert(loginGrantCompliance.outcome === "compliant", "grantSPListRoleAssignment compliance should resolve loginName principals consistently with provisioning");

  const removeCompliance = await new RemoveSPSiteRoleAssignmentAction().checkCompliance({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/project" },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "removeSPSiteRoleAssignment",
      payload: {
        verb: "removeSPSiteRoleAssignment",
        principalType: "spGroupName",
        principal: "Project Members",
        roleType: "contribute",
      },
    },
  } as Parameters<RemoveSPSiteRoleAssignmentAction["checkCompliance"]>[0]);
  assert(removeCompliance.outcome === "non_compliant", "removeSPSiteRoleAssignment compliance should be non-compliant when binding exists");
  assert(removeCompliance.reason === "binding_present", "removeSPSiteRoleAssignment compliance should report binding_present");
  assert(
    removeCompliance.resource === "Project Members -> contribute",
    "removeSPSiteRoleAssignment compliance should report assignment-specific resources"
  );

  const missingGraphCompliance = await new GrantSPSiteRoleAssignmentAction().checkCompliance({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/project" },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "grantSPSiteRoleAssignment",
      payload: {
        verb: "grantSPSiteRoleAssignment",
        principalType: "m365GroupMailNickname",
        principal: "project-members",
        roleType: "contribute",
      },
    },
  } as Parameters<GrantSPSiteRoleAssignmentAction["checkCompliance"]>[0]);
  assert(missingGraphCompliance.outcome === "unverifiable", "Graph-backed principal compliance should be unverifiable without graphClient");
  assert(
    missingGraphCompliance.reason === "missing_prerequisite",
    "Graph-backed principal compliance should report missing_prerequisite without graphClient"
  );
  assert(
    missingGraphCompliance.resource === "project-members -> contribute",
    "Graph-backed principal compliance should report assignment-specific resources"
  );

  const breakCompliance = await new BreakSPListRoleInheritanceAction().checkCompliance({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "breakSPListRoleInheritance",
      payload: { verb: "breakSPListRoleInheritance" },
    },
  } as Parameters<BreakSPListRoleInheritanceAction["checkCompliance"]>[0]);
  assert(breakCompliance.outcome === "non_compliant", "breakSPListRoleInheritance compliance should be non-compliant when list inherits permissions");

  const resetCompliance = await new ResetSPListRoleInheritanceAction().checkCompliance({
    scopeIn: {
      web,
      list: permissionTargetFrom({ unique: false }) as unknown as NonNullable<M365Scope["list"]>,
      listName: "documents",
    },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "resetSPListRoleInheritance",
      payload: { verb: "resetSPListRoleInheritance" },
    },
  } as Parameters<ResetSPListRoleInheritanceAction["checkCompliance"]>[0]);
  assert(resetCompliance.outcome === "compliant", "resetSPListRoleInheritance compliance should be compliant when list inherits permissions");
}

async function assertListViewFieldResolutionGuards(): Promise<void> {
  const fields: readonly SmokeFieldInfo[] = [
    { Id: "1", InternalName: "Title", Title: "Title" },
    { Id: "2", InternalName: "CustomerEmail", Title: "Customer Email" },
  ];

  const list = {
    fields: fieldLookupFrom(fields),
  } as unknown as NonNullable<M365Scope["list"]>;

  const resolved = await resolveViewFieldInternalNames(list, ["Title", "Customer Email"]);
  assertStringArrayEqual(resolved, ["Title", "CustomerEmail"], "List view fields should resolve display titles to internal names");

  await assertRejectsWithMessage(
    () => resolveViewFieldInternalNames(list, ["Title", " Title "]),
    "duplicate references",
    "Duplicate raw list view field references should be rejected after trimming"
  );

  await assertRejectsWithMessage(
    () => resolveViewFieldInternalNames(list, ["CustomerEmail", "Customer Email"]),
    "duplicate internal names",
    "Duplicate resolved list view field references should be rejected"
  );
}

async function assertListViewLookupUsesFilteredTopOneQuery(): Promise<void> {
  let capturedFilter = "";
  let capturedTop: number | undefined;
  let capturedSelect: readonly string[] = [];
  const expectedInfo = {
    Id: "view-quote",
    Title: "Customer's View",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };

  const list = {
    views: {
      filter: publicViewFilterFrom([expectedInfo], {
        onFilter: (filter) => {
          capturedFilter = filter;
        },
        onTop: (top) => {
          capturedTop = top;
        },
        onSelect: (fields) => {
          capturedSelect = fields;
        },
      }),
      getByTitle: () => {
        throw new Error("List view lookup should not use getByTitle for titles with spaces or apostrophes");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const info = await getPublicListViewInfoByTitle(list, "Customer's View");
  assert(info?.Id === "view-quote", "List view lookup should return the matching filtered view");
  assert(
    capturedFilter === "Title eq 'Customer''s View' and PersonalView eq false",
    "List view lookup should escape apostrophes and restrict title filters to public views"
  );
  assert(capturedTop === 1, "List view lookup should request at most one title match");
  assertStringArrayEqual(
    capturedSelect,
    ["Id", "Title", "PersonalView", "DefaultView", "ViewQuery", "RowLimit", "Paged"],
    "List view lookup should select all fields needed by handlers and compliance"
  );

  const direct404List = {
    views: {
      filter: () => {
        throw Object.assign(new Error("not found"), { status: 404 });
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;
  const direct404Info = await getPublicListViewInfoByTitle(direct404List, "Missing View");
  assert(direct404Info === undefined, "List view lookup should treat direct 404 status errors as missing views");

  const response404List = {
    views: {
      filter: () => {
        throw Object.assign(new Error("not found"), { response: { status: 404 } });
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;
  const response404Info = await getPublicListViewInfoByTitle(response404List, "Missing View");
  assert(response404Info === undefined, "List view lookup should treat response.status 404 errors as missing views");
}

async function assertListViewPermissionChecks(): Promise<void> {
  const web = {
    currentUserHasPermissions: async () => true,
  } as unknown as NonNullable<M365Scope["web"]>;

  const createAction = new CreateSPListViewAction();
  const createMissingSpfi = await createAction.checkPermissions({
    scopeIn: { web },
    clients: {},
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: { verb: "createSPListView", title: "Smoke View" },
    },
  } as Parameters<CreateSPListViewAction["checkPermissions"]>[0]);
  assert(createMissingSpfi.decision === "deny", "createSPListView permission check should deny when SPFI is missing");

  const modifyAction = new ModifySPListViewAction();
  const modifyMissingWeb = await modifyAction.checkPermissions({
    scopeIn: {},
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: { verb: "modifySPListView", title: "Smoke View" },
    },
  } as Parameters<ModifySPListViewAction["checkPermissions"]>[0]);
  assert(modifyMissingWeb.decision === "unknown", "modifySPListView permission check should be unknown when web scope is missing");

  const deleteAction = new DeleteSPListViewAction();
  const deleteAllowed = await deleteAction.checkPermissions({
    scopeIn: { web, webUrl: "https://contoso.sharepoint.com/sites/smoke" },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Smoke View" },
    },
  } as Parameters<DeleteSPListViewAction["checkPermissions"]>[0]);
  assert(deleteAllowed.decision === "allow", "deleteSPListView permission check should allow when ManageLists probe passes");
}

async function assertListViewCompliancePrerequisiteGuards(): Promise<void> {
  const createMissingSpfi = await new CreateSPListViewAction().checkCompliance({
    scopeIn: {},
    clients: {},
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: { verb: "createSPListView", title: "Smoke View" },
    },
  } as Parameters<CreateSPListViewAction["checkCompliance"]>[0]);
  assert(createMissingSpfi.outcome === "unverifiable", "createSPListView compliance should be unverifiable when SPFI is missing");
  assert(createMissingSpfi.reason === "missing_prerequisite", "createSPListView compliance should report missing_prerequisite when SPFI is missing");
  assert(
    createMissingSpfi.message === "SPFI instance not available in scope",
    "createSPListView compliance should keep the missing SPFI prerequisite message"
  );

  const modifyMissingList = await new ModifySPListViewAction().checkCompliance({
    scopeIn: {},
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: { verb: "modifySPListView", title: "Smoke View", rowLimit: 25 },
    },
  } as Parameters<ModifySPListViewAction["checkCompliance"]>[0]);
  assert(modifyMissingList.outcome === "unverifiable", "modifySPListView compliance should be unverifiable when list scope is missing");
  assert(modifyMissingList.reason === "missing_prerequisite", "modifySPListView compliance should report missing_prerequisite when list scope is missing");
  assert(
    modifyMissingList.message === "SharePoint list scope not available",
    "modifySPListView compliance should keep the missing list prerequisite message"
  );

  const deleteMissingList = await new DeleteSPListViewAction().checkCompliance({
    scopeIn: {},
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Smoke View" },
    },
  } as Parameters<DeleteSPListViewAction["checkCompliance"]>[0]);
  assert(deleteMissingList.outcome === "unverifiable", "deleteSPListView compliance should be unverifiable when list scope is missing");
  assert(deleteMissingList.reason === "missing_prerequisite", "deleteSPListView compliance should report missing_prerequisite when list scope is missing");
  assert(
    deleteMissingList.message === "SharePoint list scope not available",
    "deleteSPListView compliance should keep the missing list prerequisite message"
  );
}

async function assertListViewHandlerPrerequisiteGuards(): Promise<void> {
  const createResult = await new CreateSPListViewAction().handler({
    scopeIn: {},
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: { verb: "createSPListView", title: "Smoke View" },
    },
  } as Parameters<CreateSPListViewAction["handler"]>[0]);

  const modifyResult = await new ModifySPListViewAction().handler({
    scopeIn: {},
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: { verb: "modifySPListView", title: "Smoke View" },
    },
  } as Parameters<ModifySPListViewAction["handler"]>[0]);

  const deleteResult = await new DeleteSPListViewAction().handler({
    scopeIn: {},
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Smoke View" },
    },
  } as Parameters<DeleteSPListViewAction["handler"]>[0]);

  assert(createResult.result?.outcome === "skipped", "createSPListView handler should skip when list scope is missing");
  assert(createResult.result?.reason === "missing_prerequisite", "createSPListView handler should report missing_prerequisite without list scope");
  assert(modifyResult.result?.outcome === "skipped", "modifySPListView handler should skip when list scope is missing");
  assert(modifyResult.result?.reason === "missing_prerequisite", "modifySPListView handler should report missing_prerequisite without list scope");
  assert(deleteResult.result?.outcome === "skipped", "deleteSPListView handler should skip when list scope is missing");
  assert(deleteResult.result?.reason === "missing_prerequisite", "deleteSPListView handler should report missing_prerequisite without list scope");
}

async function assertCreateSPListViewComplianceDetectsDrift(): Promise<void> {
  const existingInfo = {
    Id: "view-drift",
    Title: "Customers by Code",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: '<OrderBy><FieldRef Name="CustomerEmail" /></OrderBy>',
    RowLimit: 30,
    Paged: true,
  };

  const fields: readonly SmokeFieldInfo[] = [
    { Id: "1", InternalName: "Title", Title: "Title" },
    { Id: "2", InternalName: "CustomerCode", Title: "Customer Code" },
  ];

  const view = {
    fields: async () => ({ Items: ["Title", "CustomerEmail"] }),
  };

  const list = {
    fields: fieldLookupFrom(fields),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => view,
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new CreateSPListViewAction();
  const compliance = await action.checkCompliance({
    scopeIn: { list },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Customers by Code",
        fields: ["Title", "Customer Code"],
        viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
        rowLimit: 50,
        paged: false,
        defaultView: true,
      },
    },
  } as Parameters<CreateSPListViewAction["checkCompliance"]>[0]);

  assert(compliance.outcome === "non_compliant", "createSPListView compliance should detect drift on existing views");
  assert(compliance.reason === "drift", "createSPListView compliance should report drift when mutable view state differs");
}

async function assertListViewComplianceAvoidsFieldReadsWhenFieldsAreNotDeclared(): Promise<void> {
  const titleOnlyInfo: ListViewInfo = {
    Id: "view-title-only",
    Title: "Title Only",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const titleOnlyList = {
    views: {
      filter: publicViewFilterFrom([titleOnlyInfo]),
      getById: () => {
        throw new Error("createSPListView compliance should not resolve a view handle when fields are not declared");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const createCompliance = await new CreateSPListViewAction().checkCompliance({
    scopeIn: { list: titleOnlyList },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Title Only",
      },
    },
  } as Parameters<CreateSPListViewAction["checkCompliance"]>[0]);

  assert(createCompliance.outcome === "compliant", "createSPListView compliance should accept an existing title-only public view");

  const scalarOnlyInfo: ListViewInfo = {
    Id: "view-scalar-only-compliance",
    Title: "Scalar Only",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: '<OrderBy><FieldRef Name="Title" /></OrderBy>',
    RowLimit: 50,
    Paged: true,
  };
  const scalarOnlyList = {
    views: {
      filter: publicViewFilterFrom([scalarOnlyInfo]),
      getById: () => {
        throw new Error("modifySPListView compliance should not resolve a view handle when fields are not declared");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const modifyCompliance = await new ModifySPListViewAction().checkCompliance({
    scopeIn: { list: scalarOnlyList },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Scalar Only",
        viewQuery: '<OrderBy><FieldRef Name="Title" /></OrderBy>',
        rowLimit: 50,
        paged: true,
      },
    },
  } as Parameters<ModifySPListViewAction["checkCompliance"]>[0]);

  assert(modifyCompliance.outcome === "compliant", "modifySPListView compliance should compare scalar-only payloads without reading fields");
}

async function assertListViewComplianceHandlesMissingViewQueryValue(): Promise<void> {
  const existingInfo = {
    Id: "view-missing-query",
    Title: "Customers by Missing Query",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: undefined,
    RowLimit: 50,
    Paged: true,
  } as unknown as ListViewInfo;

  const list = {
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => ({
        fields: async () => ({ Items: ["Title"] }),
      }),
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const compliance = await new ModifySPListViewAction().checkCompliance({
    scopeIn: { list },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Customers by Missing Query",
        viewQuery: '<OrderBy><FieldRef Name="Title" /></OrderBy>',
      },
    },
  } as Parameters<ModifySPListViewAction["checkCompliance"]>[0]);

  assert(compliance.outcome === "non_compliant", "modifySPListView compliance should treat missing ViewQuery as drift");
  assert(compliance.reason === "drift", "modifySPListView compliance should not become unverifiable when ViewQuery is missing");
}

async function assertListViewComplianceReadsWrappedViewFieldItems(): Promise<void> {
  const existingInfo: ListViewInfo = {
    Id: "view-wrapped-fields",
    Title: "Wrapped Field Items",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };

  const list = {
    fields: fieldLookupFrom([
      { Id: "1", InternalName: "Title", Title: "Title" },
      { Id: "2", InternalName: "CustomerCode", Title: "Customer Code" },
    ]),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => ({
        fields: async () => ({ Items: { results: ["Title", "CustomerCode"] } }),
      }),
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const compliance = await new CreateSPListViewAction().checkCompliance({
    scopeIn: { list },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Wrapped Field Items",
        fields: ["Title", "Customer Code"],
      },
    },
  } as Parameters<CreateSPListViewAction["checkCompliance"]>[0]);

  assert(compliance.outcome === "compliant", "List view compliance should read wrapped Items.results field collections");
}

async function assertListViewComplianceReportsMissingFieldsAsDrift(): Promise<void> {
  const existingInfo: ListViewInfo = {
    Id: "view-missing-field",
    Title: "Customers by Missing Field",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };

  const list = {
    fields: fieldLookupFrom({
      Title: { Id: "1", InternalName: "Title", Title: "Title" },
    }),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => ({
        fields: async () => ({ Items: ["Title"] }),
      }),
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const createCompliance = await new CreateSPListViewAction().checkCompliance({
    scopeIn: { list },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Customers by Missing Field",
        fields: ["Title", "Missing Field"],
      },
    },
  } as Parameters<CreateSPListViewAction["checkCompliance"]>[0]);

  const modifyCompliance = await new ModifySPListViewAction().checkCompliance({
    scopeIn: { list },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Customers by Missing Field",
        fields: ["Title", "Missing Field"],
      },
    },
  } as Parameters<ModifySPListViewAction["checkCompliance"]>[0]);

  const createDetails = createCompliance.details as { mismatches?: readonly { reason?: string }[] } | undefined;
  const modifyDetails = modifyCompliance.details as { mismatches?: readonly { reason?: string }[] } | undefined;

  assert(createCompliance.outcome === "non_compliant", "createSPListView compliance should report missing requested view fields as non-compliant");
  assert(createCompliance.reason === "drift", "createSPListView compliance should report missing requested view fields as drift");
  assert(createDetails?.mismatches?.[0]?.reason === "missing_fields", "createSPListView compliance should identify missing view fields");

  assert(modifyCompliance.outcome === "non_compliant", "modifySPListView compliance should report missing requested view fields as non-compliant");
  assert(modifyCompliance.reason === "drift", "modifySPListView compliance should report missing requested view fields as drift");
  assert(modifyDetails?.mismatches?.[0]?.reason === "missing_fields", "modifySPListView compliance should identify missing view fields");
}

async function assertListViewHandlersValidateFieldsBeforeWrites(): Promise<void> {
  let createAddCalled = false;
  const createList = {
    fields: fieldLookupFrom({
      Title: { Id: "1", InternalName: "Title", Title: "Title" },
    }),
    views: {
      filter: publicViewFilterFrom([]),
      add: async () => {
        createAddCalled = true;
        throw new Error("createSPListView should not create a view when requested fields are missing");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  await assertRejectsWithMessage(
    () => new CreateSPListViewAction().handler({
      scopeIn: { list: createList },
      clients: { spfi: {} },
      out: idleOut(),
      logger,
      action: {
        path: "1",
        verb: "createSPListView",
        payload: {
          verb: "createSPListView",
          title: "Missing Field View",
          fields: ["Title", "Missing Field"],
        },
      },
    } as Parameters<CreateSPListViewAction["handler"]>[0]),
    "do not exist",
    "createSPListView should validate requested fields before creating a view"
  );
  assert(!createAddCalled, "createSPListView should not call views.add when requested fields are missing");

  let modifyRemoveAllCalled = false;
  let modifyUpdateCalled = false;
  const existingInfo: ListViewInfo = {
    Id: "view-missing-field-modify",
    Title: "Missing Field View",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const modifyList = {
    fields: fieldLookupFrom({
      Title: { Id: "1", InternalName: "Title", Title: "Title" },
    }),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => ({
        fields: Object.assign(
          async () => ({ Items: ["Title"] }),
          {
            removeAll: async () => {
              modifyRemoveAllCalled = true;
            },
            add: async () => undefined,
          }
        ),
        update: async () => {
          modifyUpdateCalled = true;
        },
      }),
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  await assertRejectsWithMessage(
    () => new ModifySPListViewAction().handler({
      scopeIn: { list: modifyList },
      clients: { spfi: {} },
      out: idleOut(),
      logger,
      action: {
        path: "1",
        verb: "modifySPListView",
        payload: {
          verb: "modifySPListView",
          title: "Missing Field View",
          fields: ["Title", "Missing Field"],
          rowLimit: 50,
        },
      },
    } as Parameters<ModifySPListViewAction["handler"]>[0]),
    "do not exist",
    "modifySPListView should validate requested fields before replacing fields"
  );
  assert(!modifyRemoveAllCalled, "modifySPListView should not remove existing fields when requested fields are missing");
  assert(!modifyUpdateCalled, "modifySPListView should not update scalar state when requested fields are missing");
}

async function assertCreateSPListViewHandlerAppliesFieldsBeforeScalars(): Promise<void> {
  const events: string[] = [];
  let addedTitle = "";
  let requestedViewId = "";
  let updatedProps: Record<string, unknown> | undefined;
  const fields: readonly SmokeFieldInfo[] = [
    { Id: "1", InternalName: "Title", Title: "Title" },
    { Id: "2", InternalName: "CustomerCode", Title: "Customer Code" },
  ];
  const addedFields: string[] = [];
  const viewFields = Object.assign(
    async () => ({ Items: ["Title"] }),
    {
      removeAll: async () => {
        events.push("fields.removeAll");
      },
      add: async (fieldName: string) => {
        events.push(`fields.add:${fieldName}`);
        addedFields.push(fieldName);
      },
    }
  );
  const view = {
    fields: viewFields,
    update: async (props: Record<string, unknown>) => {
      events.push("view.update");
      updatedProps = props;
      return props;
    },
  };
  const list = {
    fields: fieldLookupFrom(fields),
    views: {
      filter: publicViewFilterFrom([]),
      add: async (title: string, personalView: boolean, additionalSettings: Record<string, unknown>) => {
        events.push("views.add");
        addedTitle = title;
        assert(personalView === false, "createSPListView should create public list views in V1");
        assert(Object.keys(additionalSettings).length === 0, "createSPListView should create minimally before applying mutable state");
        return { Id: "view-created", Title: title };
      },
      getById: (id: string) => {
        requestedViewId = id;
        return view;
      },
      getByTitle: () => {
        throw new Error("createSPListView should use the created view Id, not getByTitle");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new CreateSPListViewAction();
  const result = await action.handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Customers by Code",
        fields: ["Title", "Customer Code"],
        viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
        rowLimit: 50,
        paged: false,
        defaultView: true,
      },
    },
  } as Parameters<CreateSPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "createSPListView should execute when the view does not exist");
  assert(addedTitle === "Customers by Code", "createSPListView should pass the requested title to PnPjs add");
  assert(requestedViewId === "view-created", "createSPListView should resolve the created view by returned Id");
  assertStringArrayEqual(addedFields, ["Title", "CustomerCode"], "createSPListView should add resolved internal names to the created view");
  assert(
    updatedProps?.ViewQuery === '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>' &&
      updatedProps.RowLimit === 50 &&
      updatedProps.Paged === false &&
      updatedProps.DefaultView === true,
    "createSPListView should apply scalar view properties through PnPjs update"
  );
  assert(
    events.indexOf("views.add") !== -1 &&
      events.indexOf("fields.removeAll") !== -1 &&
      events.indexOf("view.update") !== -1 &&
      events.indexOf("views.add") < events.indexOf("fields.removeAll") &&
      events.indexOf("fields.removeAll") < events.indexOf("view.update"),
    "createSPListView should create minimally, replace fields, then apply scalar updates"
  );
}

async function assertCreateSPListViewSkipsExistingViewWithoutWrites(): Promise<void> {
  let addCalled = false;
  let getByIdCalled = false;
  const existingInfo = {
    Id: "view-existing",
    Title: "Customers by Code",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const list = {
    fields: fieldLookupFrom({}),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      add: async () => {
        addCalled = true;
        throw new Error("createSPListView should not add when the view already exists");
      },
      getById: () => {
        getByIdCalled = true;
        throw new Error("createSPListView should not resolve a mutable view handle when skipping existing views");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new CreateSPListViewAction();
  const result = await action.handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Customers by Code",
        fields: ["Title", "Customer Code"],
        viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
        rowLimit: 50,
        paged: false,
        defaultView: true,
      },
    },
  } as Parameters<CreateSPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "skipped", "createSPListView should skip existing views");
  assert(result.result?.outcome === "skipped" && result.result.reason === "already_exists", "createSPListView should report already_exists for existing views");
  assert(result.scopeDelta?.list === list, "createSPListView should propagate the existing list scope when skipping existing views");
  assert(
    !Object.prototype.hasOwnProperty.call(result.scopeDelta ?? {}, "web") &&
      !Object.prototype.hasOwnProperty.call(result.scopeDelta ?? {}, "webUrl"),
    "createSPListView should not add undefined web scope keys when building list view scope deltas"
  );
  assert(!addCalled, "createSPListView should not call views.add when the view already exists");
  assert(!getByIdCalled, "createSPListView should not call getById when the view already exists");
}

async function assertCreateSPListViewIgnoresPersonalViewsWithSameTitle(): Promise<void> {
  let addCalled = false;
  let createdPersonalView: boolean | undefined;
  const personalViewInfo: ListViewInfo = {
    Id: "view-personal",
    Title: "Customers by Code",
    PersonalView: true,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const list = {
    views: {
      filter: publicViewFilterFrom((filter) =>
        filter === "Title eq 'Customers by Code' and PersonalView eq false" ? [] : [personalViewInfo]
      ),
      add: async (title: string, personalView: boolean, additionalSettings: Record<string, unknown>) => {
        addCalled = true;
        createdPersonalView = personalView;
        assert(title === "Customers by Code", "createSPListView should create the requested public title when only a personal view exists");
        assert(Object.keys(additionalSettings).length === 0, "createSPListView should still create minimally when ignoring personal views");
        return { Id: "view-created-public", Title: title };
      },
      getById: (id: string) => {
        assert(id === "view-created-public", "createSPListView should resolve the newly created public view by Id");
        return {};
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const result = await new CreateSPListViewAction().handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Customers by Code",
      },
    },
  } as Parameters<CreateSPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "createSPListView should create when only a same-title personal view exists");
  assert(addCalled, "createSPListView should not treat personal views as existing public views");
  assert(createdPersonalView === false, "createSPListView should create public views");
}

async function assertListViewFieldOnlyChangesDoNotSendEmptyScalarUpdates(): Promise<void> {
  const fields: readonly SmokeFieldInfo[] = [
    { Id: "1", InternalName: "Title", Title: "Title" },
    { Id: "2", InternalName: "CustomerCode", Title: "Customer Code" },
  ];

  let createUpdateCalled = false;
  const createAddedFields: string[] = [];
  const createViewFields = Object.assign(
    async () => ({ Items: ["Title"] }),
    {
      removeAll: async () => undefined,
      add: async (fieldName: string) => {
        createAddedFields.push(fieldName);
      },
    }
  );
  const createList = {
    fields: fieldLookupFrom(fields),
    views: {
      filter: publicViewFilterFrom([]),
      add: async (title: string) => ({ Id: "view-created-field-only", Title: title }),
      getById: () => ({
        fields: createViewFields,
        update: async () => {
          createUpdateCalled = true;
          throw new Error("createSPListView should not send empty scalar updates for field-only creates");
        },
      }),
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const createResult = await new CreateSPListViewAction().handler({
    scopeIn: { list: createList },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "createSPListView",
      payload: {
        verb: "createSPListView",
        title: "Field Only Create",
        fields: ["Title", "Customer Code"],
      },
    },
  } as Parameters<CreateSPListViewAction["handler"]>[0]);

  assert(createResult.result?.outcome === "executed", "createSPListView should execute field-only creates");
  assertStringArrayEqual(createAddedFields, ["Title", "CustomerCode"], "createSPListView should replace fields for field-only creates");
  assert(!createUpdateCalled, "createSPListView should not call view.update when only fields are declared");

  let modifyUpdateCalled = false;
  const modifyAddedFields: string[] = [];
  const existingInfo = {
    Id: "view-modify-field-only",
    Title: "Field Only Modify",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const modifyViewFields = Object.assign(
    async () => ({ Items: ["Title"] }),
    {
      removeAll: async () => undefined,
      add: async (fieldName: string) => {
        modifyAddedFields.push(fieldName);
      },
    }
  );
  const modifyList = {
    fields: fieldLookupFrom(fields),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => ({
        fields: modifyViewFields,
        update: async () => {
          modifyUpdateCalled = true;
          throw new Error("modifySPListView should not send empty scalar updates for field-only changes");
        },
      }),
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const modifyResult = await new ModifySPListViewAction().handler({
    scopeIn: { list: modifyList },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Field Only Modify",
        fields: ["Title", "Customer Code"],
      },
    },
  } as Parameters<ModifySPListViewAction["handler"]>[0]);

  assert(modifyResult.result?.outcome === "executed", "modifySPListView should execute field-only changes");
  assertStringArrayEqual(modifyAddedFields, ["Title", "CustomerCode"], "modifySPListView should replace fields for field-only changes");
  assert(!modifyUpdateCalled, "modifySPListView should not call view.update when only fields changed");
}

async function assertModifySPListViewAppliesFieldAndScalarChanges(): Promise<void> {
  const events: string[] = [];
  let requestedViewId = "";
  let updatedProps: Record<string, unknown> | undefined;
  const existingInfo = {
    Id: "view-modify",
    Title: "Customers by Code",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: '<OrderBy><FieldRef Name="CustomerEmail" /></OrderBy>',
    RowLimit: 30,
    Paged: true,
  };
  const fields: readonly SmokeFieldInfo[] = [
    { Id: "1", InternalName: "Title", Title: "Title" },
    { Id: "2", InternalName: "CustomerCode", Title: "Customer Code" },
  ];
  const addedFields: string[] = [];
  const viewFields = Object.assign(
    async () => ({ Items: ["Title", "CustomerEmail"] }),
    {
      removeAll: async () => {
        events.push("fields.removeAll");
      },
      add: async (fieldName: string) => {
        events.push(`fields.add:${fieldName}`);
        addedFields.push(fieldName);
      },
    }
  );
  const view = {
    fields: viewFields,
    update: async (props: Record<string, unknown>) => {
      events.push("view.update");
      updatedProps = props;
      return { ...existingInfo, ...props };
    },
  };
  const list = {
    fields: fieldLookupFrom(fields),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: (id: string) => {
        requestedViewId = id;
        return view;
      },
      getByTitle: () => {
        throw new Error("modifySPListView should use getById after title lookup, not getByTitle");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new ModifySPListViewAction();
  const result = await action.handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Customers by Code",
        fields: ["Title", "Customer Code"],
        viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
        rowLimit: 50,
        paged: false,
        defaultView: true,
      },
    },
  } as Parameters<ModifySPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "modifySPListView should execute when supported mutable state differs");
  assert(requestedViewId === "view-modify", "modifySPListView should resolve the mutable view by ID after title lookup");
  assertStringArrayEqual(addedFields, ["Title", "CustomerCode"], "modifySPListView should replace view fields with resolved internal names");
  assert(
    updatedProps?.ViewQuery === '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>' &&
      updatedProps.RowLimit === 50 &&
      updatedProps.Paged === false &&
      updatedProps.DefaultView === true,
    "modifySPListView should apply scalar view properties through PnPjs update"
  );
  assert(
    events.indexOf("fields.removeAll") !== -1 &&
      events.indexOf("view.update") !== -1 &&
      events.indexOf("fields.removeAll") < events.indexOf("view.update"),
    "modifySPListView should replace fields before applying scalar updates"
  );
}

async function assertModifySPListViewAppliesScalarChangesWithoutFieldWrites(): Promise<void> {
  let requestedViewId = "";
  let fieldsRead = false;
  let updatedProps: Record<string, unknown> | undefined;
  const existingInfo = {
    Id: "view-scalar-only",
    Title: "Customers by Code",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const view = {
    fields: Object.assign(
      async () => {
        fieldsRead = true;
        return { Items: ["Title"] };
      },
      {
        removeAll: async () => {
          throw new Error("modifySPListView should not remove fields for scalar-only changes");
        },
        add: async () => {
          throw new Error("modifySPListView should not add fields for scalar-only changes");
        },
      }
    ),
    update: async (props: Record<string, unknown>) => {
      updatedProps = props;
      return { ...existingInfo, ...props };
    },
  };
  const list = {
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: (id: string) => {
        requestedViewId = id;
        return view;
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const result = await new ModifySPListViewAction().handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Customers by Code",
        rowLimit: 50,
      },
    },
  } as Parameters<ModifySPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "modifySPListView should execute scalar-only changes");
  assert(requestedViewId === "view-scalar-only", "modifySPListView should resolve scalar-only target views by ID");
  assert(updatedProps?.RowLimit === 50, "modifySPListView should apply scalar-only rowLimit changes through PnPjs update");
  assert(!Object.prototype.hasOwnProperty.call(updatedProps ?? {}, "ViewQuery"), "modifySPListView should not send undefined ViewQuery in scalar-only updates");
  assert(!fieldsRead, "modifySPListView should not read view fields for scalar-only changes");
}

async function assertModifySPListViewSkipsWhenAlreadyCompliant(): Promise<void> {
  let removeAllCalled = false;
  let addCalled = false;
  let updateCalled = false;
  const existingInfo = {
    Id: "view-no-change",
    Title: "Customers by Code",
    PersonalView: false,
    DefaultView: true,
    ViewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
    RowLimit: 50,
    Paged: false,
  };
  const fields: readonly SmokeFieldInfo[] = [
    { Id: "1", InternalName: "Title", Title: "Title" },
    { Id: "2", InternalName: "CustomerCode", Title: "Customer Code" },
  ];
  const viewFields = Object.assign(
    async () => ({ Items: ["Title", "CustomerCode"] }),
    {
      removeAll: async () => {
        removeAllCalled = true;
      },
      add: async () => {
        addCalled = true;
      },
    }
  );
  const view = {
    fields: viewFields,
    update: async () => {
      updateCalled = true;
      return existingInfo;
    },
  };
  const list = {
    fields: fieldLookupFrom(fields),
    views: {
      filter: publicViewFilterFrom([existingInfo]),
      getById: () => view,
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new ModifySPListViewAction();
  const result = await action.handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Customers by Code",
        fields: ["Title", "Customer Code"],
        viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
        rowLimit: 50,
        paged: false,
        defaultView: true,
      },
    },
  } as Parameters<ModifySPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "skipped", "modifySPListView should skip already-compliant views");
  assert(result.result?.outcome === "skipped" && result.result.reason === "no_changes", "modifySPListView should report no_changes for already-compliant views");
  assert(!removeAllCalled, "modifySPListView should not remove fields when the requested order already matches");
  assert(!addCalled, "modifySPListView should not add fields when the requested order already matches");
  assert(!updateCalled, "modifySPListView should not update scalar state when it already matches");
}

async function assertModifyAndDeleteListViewSkipMissingViewsWithoutWrites(): Promise<void> {
  let modifyGetByIdCalled = false;
  const modifyList = {
    views: {
      filter: publicViewFilterFrom([]),
      getById: () => {
        modifyGetByIdCalled = true;
        throw new Error("modifySPListView should not resolve a view handle when the view is missing");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const modifyResult = await new ModifySPListViewAction().handler({
    scopeIn: { list: modifyList },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: {
        verb: "modifySPListView",
        title: "Missing View",
        rowLimit: 25,
      },
    },
  } as Parameters<ModifySPListViewAction["handler"]>[0]);

  assert(modifyResult.result?.outcome === "skipped", "modifySPListView should skip missing views");
  assert(modifyResult.result?.outcome === "skipped" && modifyResult.result.reason === "not_found", "modifySPListView should report not_found for missing views");
  assert(!modifyGetByIdCalled, "modifySPListView should not call getById when the view is missing");

  let deleteGetByIdCalled = false;
  const deleteList = {
    views: {
      filter: publicViewFilterFrom([]),
      getById: () => {
        deleteGetByIdCalled = true;
        throw new Error("deleteSPListView should not resolve a view handle when the view is missing");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const deleteResult = await new DeleteSPListViewAction().handler({
    scopeIn: { list: deleteList },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Missing View" },
    },
  } as Parameters<DeleteSPListViewAction["handler"]>[0]);

  assert(deleteResult.result?.outcome === "skipped", "deleteSPListView should skip missing views");
  assert(deleteResult.result?.outcome === "skipped" && deleteResult.result.reason === "not_found", "deleteSPListView should report not_found for missing views");
  assert(!deleteGetByIdCalled, "deleteSPListView should not call getById when the view is missing");
}

async function assertListViewComplianceHandlesMissingAndDeleteTargets(): Promise<void> {
  let missingGetByIdCalled = false;
  const missingList = {
    views: {
      filter: publicViewFilterFrom([]),
      getById: () => {
        missingGetByIdCalled = true;
        throw new Error("List view compliance should not resolve a mutable view handle when lookup misses");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const modifyMissing = await new ModifySPListViewAction().checkCompliance({
    scopeIn: { list: missingList },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "modifySPListView",
      payload: { verb: "modifySPListView", title: "Missing View", rowLimit: 25 },
    },
  } as Parameters<ModifySPListViewAction["checkCompliance"]>[0]);

  assert(modifyMissing.outcome === "non_compliant", "modifySPListView compliance should flag missing target views");
  assert(modifyMissing.reason === "not_found", "modifySPListView compliance should report not_found for missing target views");

  const deleteMissing = await new DeleteSPListViewAction().checkCompliance({
    scopeIn: { list: missingList },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Missing View" },
    },
  } as Parameters<DeleteSPListViewAction["checkCompliance"]>[0]);

  assert(deleteMissing.outcome === "compliant", "deleteSPListView compliance should treat already-missing views as compliant");
  assert(!missingGetByIdCalled, "List view compliance should not call getById when title lookup returns no public view");

  const existingViewInfo = {
    Id: "view-delete",
    Title: "Temporary View",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const existingList = {
    views: {
      filter: publicViewFilterFrom([existingViewInfo]),
      getById: () => {
        throw new Error("deleteSPListView compliance should not resolve a mutable view handle for existence checks");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const deleteExisting = await new DeleteSPListViewAction().checkCompliance({
    scopeIn: { list: existingList },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Temporary View" },
    },
  } as Parameters<DeleteSPListViewAction["checkCompliance"]>[0]);

  assert(deleteExisting.outcome === "non_compliant", "deleteSPListView compliance should flag existing non-default views");
  assert(deleteExisting.reason === "exists", "deleteSPListView compliance should report exists for non-default target views");
}

async function assertDeleteSPListViewDefaultViewGuard(): Promise<void> {
  let deleteCalled = false;
  let lastViewFilter = "";
  const defaultViewInfo = {
    Id: "view-1",
    Title: "Default View",
    PersonalView: false,
    DefaultView: true,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const view = {
    select: () => async () => defaultViewInfo,
    delete: async () => {
      deleteCalled = true;
    },
  };
  const list = {
    views: {
      filter: publicViewFilterFrom(
        (filter) => filter === "Title eq 'Default View' and PersonalView eq false" ? [defaultViewInfo] : [],
        {
          onFilter: (filter) => {
            lastViewFilter = filter;
          },
        }
      ),
      getById: () => view,
      getByTitle: () => {
        throw new Error("List view lookup should not use getByTitle for titles with spaces");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new DeleteSPListViewAction();
  const result = await action.handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Default View" },
    },
  } as Parameters<DeleteSPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "skipped", "deleteSPListView should skip current default view");
  assert(
    lastViewFilter === "Title eq 'Default View' and PersonalView eq false",
    "List view lookup should filter by raw title with spaces and public views"
  );
  assert(
    result.result?.outcome === "skipped" && result.result.reason === "unsupported",
    "deleteSPListView should report unsupported for current default view"
  );
  assert(
    result.result?.warnings?.[0]?.code === "LIST_VIEW_DEFAULT_DELETE_BLOCKED",
    "deleteSPListView should emit default-view delete warning"
  );
  assert(!deleteCalled, "deleteSPListView should not call delete for current default view");

  const compliance = await action.checkCompliance({
    scopeIn: { list },
    clients: { spfi: {} },
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Default View" },
    },
  } as Parameters<DeleteSPListViewAction["checkCompliance"]>[0]);

  assert(compliance.outcome === "non_compliant", "deleteSPListView compliance should flag existing default view");
  assert(compliance.reason === "default_view", "deleteSPListView compliance should report default_view reason");
}

async function assertDeleteSPListViewRemovesNonDefaultView(): Promise<void> {
  let requestedViewId = "";
  let deleteCalled = false;
  const viewInfo = {
    Id: "view-delete",
    Title: "Temporary View",
    PersonalView: false,
    DefaultView: false,
    ViewQuery: "",
    RowLimit: 30,
    Paged: true,
  };
  const list = {
    views: {
      filter: publicViewFilterFrom([viewInfo]),
      getById: (id: string) => {
        requestedViewId = id;
        return {
          delete: async () => {
            deleteCalled = true;
          },
        };
      },
      getByTitle: () => {
        throw new Error("deleteSPListView should use getById after title lookup, not getByTitle");
      },
    },
  } as unknown as NonNullable<M365Scope["list"]>;

  const action = new DeleteSPListViewAction();
  const result = await action.handler({
    scopeIn: { list },
    clients: { spfi: {} },
    out: idleOut(),
    logger,
    action: {
      path: "1",
      verb: "deleteSPListView",
      payload: { verb: "deleteSPListView", title: "Temporary View" },
    },
  } as Parameters<DeleteSPListViewAction["handler"]>[0]);

  assert(result.result?.outcome === "executed", "deleteSPListView should execute for non-default views");
  assert(requestedViewId === "view-delete", "deleteSPListView should resolve the mutable view by ID after title lookup");
  assert(deleteCalled, "deleteSPListView should call delete for non-default views");
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

  const detailedError = new Error("boom") as Error & { details?: unknown };
  detailedError.details = { target: "documents" };
  logger.error("structured error", {
    error: detailedError,
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
  assert((primaryEvents[1].error?.details as Record<string, unknown> | undefined)?.target === "documents", "Logger should preserve structured error details");
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
    out: idleOut(),
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
  assertSharePointPermissionsCatalogComposition();
  assertSharePointListViewPublicBarrelExports();
  assertSharePointNavigationPublicBarrelExports();
  assertContentTypeFieldReferenceScopeResolution();
  assertFieldStructuralCompatibility();
  assertListStructuralCompatibility();
  assertJsonResultContract();
  assertLoggerContract();
  await assertSharePointPermissionDomainHelpers();
  await assertCreateSPNavigationNodeAddsMissingNode();
  await assertCreateSPNavigationNodeSkipsExistingWithoutWrites();
  await assertModifySPNavigationNodeUpdatesChangedNode();
  await assertModifySPNavigationNodeSkipsWhenAlreadyCompliant();
  await assertModifySPNavigationNodeSkipsEquivalentUrls();
  await assertDeleteSPNavigationNodeDeletesMatchedNode();
  await assertNavigationHandlersSkipAmbiguousDuplicateTitles();
  await assertNavigationCompliancePrerequisites();
  await assertNavigationComplianceDetectsDrift();
  await assertNavigationComplianceTreatsEquivalentUrlsAsCompliant();
  assertNavigationUrlEquivalencePreservesExternalOrigins();
  await assertListViewFieldResolutionGuards();
  await assertListViewLookupUsesFilteredTopOneQuery();
  await assertListViewPermissionChecks();
  await assertListViewCompliancePrerequisiteGuards();
  await assertListViewHandlerPrerequisiteGuards();
  await assertCreateSPListViewComplianceDetectsDrift();
  await assertListViewComplianceAvoidsFieldReadsWhenFieldsAreNotDeclared();
  await assertListViewComplianceHandlesMissingViewQueryValue();
  await assertListViewComplianceReadsWrappedViewFieldItems();
  await assertListViewComplianceReportsMissingFieldsAsDrift();
  await assertListViewHandlersValidateFieldsBeforeWrites();
  await assertCreateSPListViewHandlerAppliesFieldsBeforeScalars();
  await assertCreateSPListViewSkipsExistingViewWithoutWrites();
  await assertCreateSPListViewIgnoresPersonalViewsWithSameTitle();
  await assertListViewFieldOnlyChangesDoNotSendEmptyScalarUpdates();
  await assertModifySPListViewAppliesFieldAndScalarChanges();
  await assertModifySPListViewAppliesScalarChangesWithoutFieldWrites();
  await assertModifySPListViewSkipsWhenAlreadyCompliant();
  await assertModifyAndDeleteListViewSkipMissingViewsWithoutWrites();
  await assertListViewComplianceHandlesMissingAndDeleteTargets();
  await assertDeleteSPListViewDefaultViewGuard();
  await assertDeleteSPListViewRemovesNonDefaultView();
  await assertComplianceCancelContract();
  await assertCreateSPSiteColumnIgnoresStaleListScope();
  await assertSharePointGraphClientPreflight();
  await assertSharePointPermissionActionRuntime();
  await assertSharePointPermissionCompliance();

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
