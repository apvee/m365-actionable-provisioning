import { strict as assert } from "assert";
import { deleteSPSiteSchema } from "../../src/actions/sharepoint/sites/delete-sp-site/schema";
import { createGroupFixture, groupContext } from "./sharepoint-group-fixtures";
import { PermissionKind } from "@pnp/sp/security";
import { z } from "zod";
import { ProvisioningEngine } from "../../src/core/engine";
import { createProvisioningPlanSchema } from "../../src/core/provisioning-plan";
import type { ActionNode } from "../../src/core/action";
import type { M365Scope } from "../../src/runtime";
import type { CreateSPGroupPayload, ModifySPGroupPayload, DeleteSPGroupPayload } from "../../src";

async function assertSPGroupSchemas(): Promise<void> {
  const site = { verb: "deleteSPSite", siteUrl: "https://contoso.sharepoint.com/sites/groups" };
  assert.equal(deleteSPSiteSchema.safeParse({ ...site, subactions: [{ verb: "createSPGroup", title: "Reviewers" }] }).success, false);
  assert.equal(deleteSPSiteSchema.safeParse(site).success, true);
  assert.equal(deleteSPSiteSchema.safeParse({ ...site, subactions: [] }).success, true);

  const { createSPGroupSchema } = await import("../../src/actions/sharepoint/groups/create-sp-group/schema");
  const { modifySPGroupSchema } = await import("../../src/actions/sharepoint/groups/modify-sp-group/schema");
  const { deleteSPGroupSchema } = await import("../../src/actions/sharepoint/groups/delete-sp-group/schema");
  assert.deepEqual(createSPGroupSchema.parse({ verb: "createSPGroup", title: "  Révisori  東京  ", description: " " }), {
    verb: "createSPGroup", title: "Révisori  東京", description: " ",
  });
  assert.equal(createSPGroupSchema.safeParse({ verb: "createSPGroup", title: " " }).success, false);
  for (const extra of [{ groupId: 1 }, { owner: "owner@example.com" }, { members: [] as string[] }, { grantRoles: [] as unknown[] }, { typo: true }]) {
    assert.equal(createSPGroupSchema.safeParse({ verb: "createSPGroup", title: "Reviewers", ...extra }).success, false);
  }
  for (const [verb, schema] of [["modifySPGroup", modifySPGroupSchema], ["deleteSPGroup", deleteSPGroupSchema]] as const) {
    for (const invalid of [{}, { groupId: 1, groupName: "Reviewers" }, { groupName: " " },
      { groupId: "1" }, { groupId: 0 }, { groupId: -1 }, { groupId: 1.5 }]) {
      assert.equal(schema.safeParse({ verb, ...invalid }).success, false, JSON.stringify(invalid));
    }
    assert.equal(schema.parse({ verb, groupName: " Reviewers " }).groupName, "Reviewers");
    assert.equal(schema.safeParse({ verb, groupId: 42, subactions: [] }).success, true);
    assert.equal(schema.safeParse({ verb, groupId: 42, subactions: [{ verb: "deleteSPGroup", groupId: 1 }] }).success, false);
    assert.equal(schema.safeParse({ verb, groupId: 42, grantRoles: [] }).success, false);
  }
  assert.equal(modifySPGroupSchema.safeParse({ verb: "modifySPGroup", groupId: 42 }).success, true);
  assert.equal(modifySPGroupSchema.safeParse({ verb: "modifySPGroup", groupId: 42, title: " " }).success, false);
  assert.equal(modifySPGroupSchema.parse({ verb: "modifySPGroup", groupId: 42, description: "" }).description, "");
  assert.equal(deleteSPGroupSchema.safeParse({ verb: "deleteSPGroup", groupId: 42, title: "Unexpected" }).success, false);
  assert.equal(createSPGroupSchema.safeParse({ verb: "createSPGroup", title: "Reviewers", subactions: [] }).success, true);
  assert.equal(createSPGroupSchema.safeParse({ verb: "createSPGroup", title: "Reviewers", subactions: [{ verb: "deleteSPGroup", groupId: 1 }] }).success, false);
}

async function assertSPGroupLookup(): Promise<void> {
  const { resolveSPGroup } = await import("../../src/actions/sharepoint/domains/groups");
  const fixture = createGroupFixture([{ Id: 42, Title: "O'Brien & Revisori #1", Description: null }]);
  assert.equal((await resolveSPGroup(fixture.web, { groupName: "O'Brien & Revisori #1" }))?.Id, 42);
  assert.deepEqual(fixture.queries[0], { filter: "Title eq 'O''Brien & Revisori #1'", fields: ["Id", "Title", "Description"], limit: 2 });
  assert.equal((await resolveSPGroup(fixture.web, { groupId: 42 }))?.Title, "O'Brien & Revisori #1");
  assert.equal(fixture.queries[1].filter, "Id eq 42");
  assert.equal(await resolveSPGroup(fixture.web, { groupId: 7 }), undefined);
  assert.equal(await resolveSPGroup(fixture.web, { groupName: "Missing" }), undefined);
  for (const ref of [{}, { groupId: 1, groupName: "Both" }, { groupId: -1 }, { groupId: 1.5 }, { groupName: " " }]) {
    await assert.rejects(resolveSPGroup(fixture.web, ref));
  }
  fixture.settings.overrideResponse = true;
  for (const response of [null, undefined, {}, [null], [{}], [{ Id: 0, Title: "Wrong" }],
    [{ Id: 1.5, Title: "Wrong" }], [{ Id: 1, Title: " " }], [{ Id: 1, Title: "Wrong", Description: false }],
    [{ Id: 1, Title: "Duplicate" }, { Id: 2, Title: "Duplicate" }]]) {
    fixture.settings.response = response;
    await assert.rejects(resolveSPGroup(fixture.web, { groupId: 42 }), undefined, JSON.stringify(response));
  }
  fixture.settings.overrideResponse = false;
  for (const status of [401, 403, 404, 429, 500, undefined]) {
    const error = Object.assign(new Error("Read failed"), { status });
    fixture.settings.readError = error;
    await assert.rejects(resolveSPGroup(fixture.web, { groupId: 42 }), (actual: unknown) => actual === error);
  }
  assert.deepEqual(fixture.writes, []);
}

async function assertSPGroupPropertyComparison(): Promise<void> {
  const { buildSPGroupUpdateProps, getSPGroupMismatches } = await import("../../src/actions/sharepoint/domains/groups");
  assert.deepEqual(buildSPGroupUpdateProps({}), {});
  assert.deepEqual(buildSPGroupUpdateProps({ description: "" }), { Description: "" });
  assert.deepEqual(buildSPGroupUpdateProps({ title: "Reviewers" }), { Title: "Reviewers" });
  for (const Description of [null, undefined, ""]) {
    assert.deepEqual(getSPGroupMismatches({ description: "" }, { Id: 42, Title: "Reviewers", Description }), []);
  }
  assert.deepEqual(getSPGroupMismatches({}, { Id: 42, Title: "Reviewers", Description: "Actual" }), []);
  assert.deepEqual(getSPGroupMismatches({ title: "reviewers" }, { Id: 42, Title: "Reviewers" }), [
    { key: "Title", expected: "reviewers", actual: "Reviewers" },
  ]);
}

async function assertSPGroupPermissions(): Promise<void> {
  const { checkSPGroupPermissions } = await import("../../src/actions/sharepoint/groups/_shared/scope");
  const fixture = createGroupFixture();
  const ctx = groupContext({ verb: "createSPGroup", title: "Reviewers" }, fixture, "1/1");
  assert.equal((await checkSPGroupPermissions({ ...ctx, clients: {} }, "create")).decision, "deny");
  assert.equal((await checkSPGroupPermissions(ctx, "create")).decision, "unknown");
  assert.deepEqual(fixture.probes, []);
  ctx.out.byAction["1"] = { result: { outcome: "skipped", resource: "site", reason: "no_changes" } };
  assert.equal((await checkSPGroupPermissions(ctx, "create")).decision, "allow");
  assert.deepEqual(fixture.probes, [PermissionKind.CreateGroups]);
  fixture.settings.createAllowed = false;
  assert.equal((await checkSPGroupPermissions(ctx, "create")).decision, "deny");
  for (const operation of ["modify", "delete"] as const) {
    assert.equal((await checkSPGroupPermissions(ctx, operation)).decision, "allow");
    fixture.settings.manageAllowed = false;
    assert.equal((await checkSPGroupPermissions(ctx, operation)).decision, "unknown");
    fixture.settings.manageAllowed = true;
  }
  fixture.settings.probeError = new Error("App-only probe unavailable");
  assert.equal((await checkSPGroupPermissions(ctx, "create")).decision, "unknown");
  fixture.settings.probeError = undefined;
  assert.equal((await checkSPGroupPermissions({ ...ctx, scopeIn: {} }, "create")).decision, "unknown");
  assert.equal((await checkSPGroupPermissions(groupContext(ctx.action.payload, fixture), "create")).decision, "deny");
}

async function assertCreateSPGroupRuntimeAndCompliance(): Promise<void> {
  const { CreateSPGroupAction } = await import("../../src/actions/sharepoint/groups/create-sp-group");
  const action = new CreateSPGroupAction();
  const fixture = createGroupFixture();
  const ctx = groupContext({ verb: "createSPGroup" as const, title: "Reviewers", description: "Document reviewers" }, fixture);
  assert.equal((await action.checkCompliance(ctx)).outcome, "non_compliant");
  assert.equal((await action.handler(ctx)).result?.outcome, "executed");
  assert.deepEqual(fixture.writes, [{ operation: "add", id: 1, props: { Title: "Reviewers", Description: "Document reviewers" } }]);
  fixture.writes.length = 0;
  fixture.settings.forbidWrites = true;
  const drift = { ...ctx, action: { ...ctx.action, payload: { ...ctx.action.payload, description: "Different" } } };
  assert.deepEqual((await action.handler(drift)).result, { outcome: "skipped", reason: "already_exists", resource: "Reviewers" });
  assert.equal((await action.checkCompliance(drift)).outcome, "compliant");
  assert.deepEqual(fixture.writes, []);
  const bare = createGroupFixture();
  await action.handler(groupContext({ verb: "createSPGroup", title: "Bare" }, bare));
  assert.deepEqual(bare.writes[0].props, { Title: "Bare" });
  assert.equal((await action.handler({ ...ctx, scopeIn: {} })).result?.outcome, "skipped");
  assert.equal((await action.checkCompliance({ ...ctx, scopeIn: {} })).reason, "missing_prerequisite");
  assert.equal((await action.checkCompliance({ ...ctx, clients: {} })).outcome, "unverifiable");
  for (const status of [401, 403, 404, 429, 500, undefined]) {
    fixture.settings.readError = Object.assign(new Error("Read failed"), { status });
    await assert.rejects(action.handler(ctx), /Read failed/);
    assert.equal((await action.checkCompliance(ctx)).outcome, "unverifiable");
  }
  fixture.settings.readError = undefined;
  fixture.settings.overrideResponse = true;
  fixture.settings.response = {};
  await assert.rejects(action.handler(ctx), /Invalid/);
  assert.equal((await action.checkCompliance(ctx)).outcome, "unverifiable");
  const denied = createGroupFixture();
  denied.settings.createAllowed = false;
  const deniedCtx = groupContext({ verb: "createSPGroup" as const, title: "Forbidden" }, denied);
  const engine = new ProvisioningEngine({
    definitions: [action],
    provisioningSchema: createProvisioningPlanSchema(z.array(action.actionSchema)),
    clients: deniedCtx.clients,
    initialScope: deniedCtx.scopeIn,
    planTemplate: { actions: [deniedCtx.action.payload] },
    logger: deniedCtx.logger,
  });
  assert.equal((await engine.run()).status, "failed");
  assert.deepEqual(denied.writes, []);
}

async function assertModifySPGroupRuntimeAndCompliance(): Promise<void> {
  const { ModifySPGroupAction } = await import("../../src/actions/sharepoint/groups/modify-sp-group");
  const action = new ModifySPGroupAction();
  const fixture = createGroupFixture([{ Id: 42, Title: "O'Brien", Description: "Old" }]);
  const ctx = groupContext({ verb: "modifySPGroup" as const, groupName: "O'Brien", description: "" }, fixture);
  fixture.settings.forbidWrites = true;
  assert.deepEqual(await action.checkCompliance(ctx), {
    outcome: "non_compliant", resource: "O'Brien", reason: "drift",
    details: { mismatches: [{ key: "Description", expected: "", actual: "Old" }] },
  });
  fixture.settings.forbidWrites = false;
  assert.equal((await action.handler(ctx)).result?.outcome, "executed");
  assert.deepEqual(fixture.writes, [{ operation: "update", id: 42, props: { Description: "" } }]);
  assert.equal(fixture.groups.get(42)?.Description, "");
  assert.equal(fixture.groups.get(42)?.Title, "O'Brien");
  fixture.settings.forbidWrites = true;
  assert.equal((await action.checkCompliance(ctx)).outcome, "compliant");
  assert.equal((await action.handler(ctx)).result?.outcome, "skipped");
  const idCtx = groupContext({ verb: "modifySPGroup" as const, groupId: 42 }, fixture);
  assert.deepEqual((await action.handler(idCtx)).result, { outcome: "skipped", resource: "42", reason: "no_changes" });
  const missing = groupContext({ verb: "modifySPGroup" as const, groupName: "Missing", title: "O'Brien" }, fixture);
  assert.equal((await action.handler(missing)).result?.outcome, "skipped");
  assert.equal((await action.checkCompliance(missing)).reason, "not_found");
  assert.equal((await action.handler({ ...ctx, scopeIn: {} })).result?.outcome, "skipped");
  for (const change of [{ scopeIn: {} }, { clients: {} }]) {
    assert.equal((await action.checkCompliance({ ...ctx, ...change })).outcome, "unverifiable");
  }
  for (const status of [401, 403, 404, 429, 500, undefined]) {
    fixture.settings.readError = Object.assign(new Error("Read failed"), { status });
    await assert.rejects(action.handler(ctx), /Read failed/);
    assert.equal((await action.checkCompliance(ctx)).outcome, "unverifiable");
  }
  fixture.settings.readError = undefined;
  fixture.settings.forbidWrites = false;
  fixture.settings.writeError = new Error("Update failed");
  await assert.rejects(action.handler({ ...ctx, action: { ...ctx.action, payload: { ...ctx.action.payload, description: "Changed" } } }), /Update failed/);
  fixture.settings.overrideResponse = true;
  fixture.settings.response = {};
  await assert.rejects(action.handler(ctx), /Invalid/);
  assert.equal((await action.checkCompliance(ctx)).outcome, "unverifiable");
}

async function assertSPGroupRenameIdentity(): Promise<void> {
  const { ModifySPGroupAction } = await import("../../src/actions/sharepoint/groups/modify-sp-group");
  const action = new ModifySPGroupAction();
  const fixture = createGroupFixture([{ Id: 42, Title: "Reviewers", Description: "Keep" }, { Id: 77, Title: "Occupied" }]);
  const ctx = groupContext({ verb: "modifySPGroup" as const, groupId: 42, title: "Approvers" }, fixture);
  assert.equal((await action.handler(ctx)).result?.outcome, "executed");
  assert.equal(fixture.groups.get(42)?.Title, "Approvers");
  assert.equal(fixture.groups.get(42)?.Description, "Keep");
  assert.deepEqual((await action.handler(ctx)).result, { outcome: "skipped", reason: "no_changes", resource: "42" });
  assert.equal((await action.checkCompliance(ctx)).outcome, "compliant");
  const nameCtx = groupContext({ verb: "modifySPGroup" as const, groupName: "Approvers", title: "Renamed" }, fixture);
  await action.handler(nameCtx);
  assert.deepEqual((await action.handler(nameCtx)).result, { outcome: "skipped", reason: "not_found", resource: "Approvers" });
  assert.equal((await action.checkCompliance(nameCtx)).reason, "not_found");
  await assert.rejects(action.handler(groupContext({ verb: "modifySPGroup", groupId: 42, title: "Occupied" }, fixture)), /already exists/);
  assert.equal(fixture.groups.get(77)?.Title, "Occupied");
  assert.equal(fixture.groups.get(42)?.Title, "Renamed");
}

async function assertDeleteSPGroupRuntimeAndCompliance(): Promise<void> {
  const { DeleteSPGroupAction } = await import("../../src/actions/sharepoint/groups/delete-sp-group");
  const action = new DeleteSPGroupAction();
  for (const reference of [{ groupId: 42 }, { groupName: "O'Brien" }]) {
    const fixture = createGroupFixture([{ Id: 42, Title: "O'Brien" }, { Id: 77, Title: "Keep" }]);
    const ctx = groupContext({ verb: "deleteSPGroup" as const, ...reference }, fixture);
    fixture.settings.forbidWrites = true;
    assert.equal((await action.checkCompliance(ctx)).reason, "exists");
    assert.deepEqual(fixture.writes, []);
    fixture.settings.forbidWrites = false;
    assert.equal((await action.handler(ctx)).result?.outcome, "executed");
    assert.deepEqual(fixture.writes, [{ operation: "remove", id: 42 }]);
    assert.equal(fixture.groups.has(42), false);
    assert.equal(fixture.groups.has(77), true);
    fixture.settings.forbidWrites = true;
    assert.equal((await action.checkCompliance(ctx)).outcome, "compliant");
    assert.equal((await action.handler(ctx)).result?.outcome, "skipped");
    assert.equal(fixture.writes.length, 1);
    assert.equal((await action.handler({ ...ctx, scopeIn: {} })).result?.outcome, "skipped");
    for (const change of [{ scopeIn: {} }, { clients: {} }]) {
      assert.equal((await action.checkCompliance({ ...ctx, ...change })).outcome, "unverifiable");
    }
    for (const status of [401, 403, 404, 429, 500, undefined]) {
      fixture.settings.readError = Object.assign(new Error("Read failed"), { status });
      await assert.rejects(action.handler(ctx), /Read failed/);
      assert.equal((await action.checkCompliance(ctx)).outcome, "unverifiable");
    }
    fixture.settings.readError = undefined;
    fixture.settings.overrideResponse = true;
    for (const response of [{}, [{ Id: 42, Title: "A" }, { Id: 77, Title: "B" }]]) {
      fixture.settings.response = response;
      await assert.rejects(action.handler(ctx));
      assert.equal((await action.checkCompliance(ctx)).outcome, "unverifiable");
    }
  }
  const fixture = createGroupFixture([{ Id: 42, Title: "Keep" }]);
  fixture.settings.writeError = new Error("Removal failed");
  await assert.rejects(action.handler(groupContext({ verb: "deleteSPGroup", groupId: 42 }, fixture)), /Removal failed/);
  assert.equal(fixture.groups.has(42), true);
}

async function assertSPGroupCatalogAndPlacement(): Promise<void> {
  const sp = await import("../../src/actions/sharepoint");
  const root = await import("../../src");
  const { sharePointActionModules } = await import("../../src/actions/sharepoint/action-modules");
  const actions: [CreateSPGroupPayload, ModifySPGroupPayload, DeleteSPGroupPayload] = [
    { verb: "createSPGroup", title: "Reviewers" },
    { verb: "modifySPGroup", groupId: 42, description: "New" },
    { verb: "deleteSPGroup", groupName: "Obsolete" },
  ];
  const parents = [
    { verb: "createSPSite", siteType: "CommunicationSite", title: "Groups", url: "https://contoso.sharepoint.com/sites/groups" },
    { verb: "createSPSite", siteType: "TeamSite", displayName: "Groups", alias: "groups", url: "https://contoso.sharepoint.com/sites/groups" },
    { verb: "modifySPSite", siteUrl: "https://contoso.sharepoint.com/sites/groups" },
  ];
  for (const parent of parents) {
    const parsed = root.m365ProvisioningPlanSchema.safeParse({ actions: [{ ...parent, subactions: actions }] });
    assert.equal(parsed.success, true, JSON.stringify(parsed.error));
  }
  for (const action of actions) {
    assert.equal(sp.sharePointActionsSchema.safeParse([action]).success, false);
    for (const parent of [
      { verb: "createSPList", listName: "groups", title: "Groups" },
      { verb: "modifySPList", listName: "groups" },
      { verb: "createSPContentType", name: "Group document", parentId: "0x0101" },
      { verb: "modifySPContentType", contentTypeName: "Group document" },
      { verb: "deleteSPSite", siteUrl: "https://contoso.sharepoint.com/sites/groups" },
    ]) {
      assert.equal(root.m365ProvisioningPlanSchema.safeParse({ actions: [{ ...parent, subactions: [action] }] }).success, false);
    }
    const modules = sharePointActionModules.filter((module) => module.verb === action.verb);
    assert.equal(modules.length, 1);
    assert.deepEqual(modules[0].placements, ["siteSubaction"]);
    assert.deepEqual(modules[0].definition.requiredClients, ["spfi"]);
    for (const reference of [{}, { groupName: "A", groupId: 42 }]) {
      if (action.verb === "createSPGroup") continue;
      assert.equal(sp.siteSubactionSchema.safeParse({ verb: action.verb, ...reference }).success, false);
    }
  }
  const family = await import("../../src/actions/sharepoint/groups");
  for (const key of ["CreateSPGroupAction", "ModifySPGroupAction", "DeleteSPGroupAction", "createSPGroupSchema", "modifySPGroupSchema", "deleteSPGroupSchema"] as const) {
    assert.equal(sp[key], family[key]);
    assert.equal(root[key], family[key]);
  }
}

async function groupSiteEngine(
  fixture: ReturnType<typeof createGroupFixture>,
  subactions: readonly ActionNode[],
  options: { initialScope?: M365Scope; kind?: "createSPSite" | "modifySPSite"; skipped?: boolean; missing?: boolean } = {}
) {
  const root = await import("../../src");
  const parent = options.kind === "createSPSite" ? new root.CreateSPSiteAction() : new root.ModifySPSiteAction();
  const scopeDelta = { web: fixture.web, webUrl: "https://contoso.sharepoint.com/sites/target", siteUrl: "https://contoso.sharepoint.com/sites/target" };
  parent.checkPermissions = async () => ({ decision: "allow" as const });
  parent.handler = async () => ({
    result: options.skipped
      ? { outcome: "skipped" as const, resource: "site", reason: "no_changes" as const }
      : { outcome: "executed" as const, resource: "site" },
    scopeDelta,
  });
  parent.checkCompliance = async () => options.missing
    ? { outcome: "non_compliant" as const, reason: "not_found" }
    : { outcome: "compliant" as const, scopeDelta };
  const payload: ActionNode = parent.verb === "createSPSite"
    ? { verb: parent.verb, siteType: "CommunicationSite", title: "Target", url: scopeDelta.siteUrl, subactions }
    : { verb: parent.verb, siteUrl: scopeDelta.siteUrl, subactions };
  return root.createM365ProvisioningEngine({
    definitions: root.sharePointActionDefinitions.map((definition) => definition.verb === parent.verb ? parent : definition),
    clients: groupContext({}).clients,
    initialScope: options.initialScope ?? {},
    planTemplate: { actions: [payload] },
    logger: groupContext({}).logger,
  });
}

async function assertSPGroupEngineSequences(): Promise<void> {
  const subactions: ActionNode[] = [
    { verb: "createSPGroup", title: "Reviewers" },
    { verb: "grantSPSiteRoleAssignment", principalType: "spGroupName", principal: "Reviewers", roleType: "read" },
  ];
  for (const existing of [false, true]) {
    for (const skipped of [false, true]) {
      const fixture = createGroupFixture(existing ? [{ Id: 42, Title: "Reviewers" }] : []);
      const initial = createGroupFixture();
      initial.settings.createAllowed = false;
      const initialScope = { web: initial.web, groupId: "m365-uuid", list: { stale: true } } as unknown as M365Scope;
      const before = { ...initialScope };
      const engine = await groupSiteEngine(fixture, subactions, { initialScope, skipped, kind: skipped ? "modifySPSite" : "createSPSite" });
      const first = await engine.run();
      assert.equal(first.status, "completed", JSON.stringify(first.out.trace));
      assert.equal(first.out.byAction["1/1"]?.result?.outcome, existing ? "skipped" : "executed");
      assert.equal(first.out.byAction["1/2"]?.result?.outcome, "executed");
      assert.equal(initial.probes.includes(PermissionKind.CreateGroups), false);
      assert.equal(fixture.probes.includes(PermissionKind.CreateGroups), true);
      assert.deepEqual(initialScope, before);
      const id = [...fixture.groups.keys()][0];
      assert.deepEqual([...fixture.bindings.get(id)!], [1073741826]);
      const second = await engine.run();
      assert.equal(second.status, "completed");
      assert.equal(second.out.byAction["1/1"]?.result?.outcome, "skipped");
      assert.equal(second.out.byAction["1/2"]?.result?.outcome, "skipped");
      assert.equal(fixture.writes.filter((write) => write.operation === "grant").length, 1);
    }
  }
  const renamed = createGroupFixture([{ Id: 42, Title: "Reviewers" }]);
  const renameEngine = await groupSiteEngine(renamed, [
    { verb: "modifySPGroup", groupId: 42, title: "Approvers" },
    { verb: "grantSPSiteRoleAssignment", principalType: "spGroupName", principal: "Approvers", roleType: "read" },
  ]);
  assert.equal((await renameEngine.run()).status, "completed");
  assert.deepEqual([...renamed.bindings.get(42)!], [1073741826]);
  const denied = createGroupFixture();
  denied.settings.createAllowed = false;
  const deniedEngine = await groupSiteEngine(denied, [{ verb: "createSPGroup", title: "Forbidden" }]);
  const deniedSnapshot = await deniedEngine.run();
  assert.equal(deniedSnapshot.out.trace.byPath["1/1"].status, "fail");
  assert.deepEqual(denied.writes, []);
}

async function assertSPGroupEngineCompliance(): Promise<void> {
  const fixture = createGroupFixture([{ Id: 42, Title: "Reviewers", Description: "Old" }]);
  fixture.settings.forbidWrites = true;
  const engine = await groupSiteEngine(fixture, [
    { verb: "createSPGroup", title: "Reviewers", description: "Ignored drift" },
    { verb: "modifySPGroup", groupId: 42, description: "New" },
    { verb: "deleteSPGroup", groupName: "Missing" },
  ]);
  const report = await engine.checkCompliance();
  assert.deepEqual(["1", "1/1", "1/2", "1/3"].map((path) => report.byPath[path].outcome), ["compliant", "compliant", "non_compliant", "compliant"]);
  fixture.settings.readError = Object.assign(new Error("Forbidden"), { status: 403 });
  const errorReport = await engine.checkCompliance();
  assert.deepEqual(["1/1", "1/2", "1/3"].map((path) => errorReport.byPath[path].outcome), ["unverifiable", "unverifiable", "unverifiable"]);
  fixture.queries.length = 0;
  const missing = await groupSiteEngine(fixture, [{ verb: "createSPGroup", title: "Reviewers" }], { missing: true });
  const missingReport = await missing.checkCompliance();
  assert.equal(missingReport.byPath["1/1"].blockedBy, "1");
  assert.equal(fixture.queries.length, 0);
  assert.deepEqual(fixture.writes, []);
}

export async function runSharePointGroupSmoke(): Promise<void> {
  await assertSPGroupSchemas();
  await assertSPGroupLookup();
  await assertSPGroupPropertyComparison();
  await assertSPGroupPermissions();
  await assertCreateSPGroupRuntimeAndCompliance();
  await assertModifySPGroupRuntimeAndCompliance();
  await assertSPGroupRenameIdentity();
  await assertDeleteSPGroupRuntimeAndCompliance();
  await assertSPGroupCatalogAndPlacement();
  await assertSPGroupEngineSequences();
  await assertSPGroupEngineCompliance();
}
