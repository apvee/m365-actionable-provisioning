import assert from "node:assert/strict";
import { deleteSPSiteSchema } from "../../src/actions/sharepoint/sites/delete-sp-site/schema";
import { createGroupFixture, groupContext } from "./sharepoint-group-fixtures";
import { PermissionKind } from "@pnp/sp/security";
import { z } from "zod";
import { ProvisioningEngine } from "../../src/core/engine";
import { createProvisioningPlanSchema } from "../../src/core/provisioning-plan";

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
  for (const extra of [{ groupId: 1 }, { owner: "owner@example.com" }, { members: [] }, { grantRoles: [] }, { typo: true }]) {
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
    await assert.rejects(resolveSPGroup(fixture.web, { groupId: 42 }), (actual) => actual === error);
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

export async function runSharePointGroupSmoke(): Promise<void> {
  await assertSPGroupSchemas();
  await assertSPGroupLookup();
  await assertSPGroupPropertyComparison();
  await assertSPGroupPermissions();
  await assertCreateSPGroupRuntimeAndCompliance();
  await assertModifySPGroupRuntimeAndCompliance();
  await assertSPGroupRenameIdentity();
  await assertDeleteSPGroupRuntimeAndCompliance();
}
