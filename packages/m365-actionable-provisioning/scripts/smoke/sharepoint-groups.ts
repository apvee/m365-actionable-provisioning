import assert from "node:assert/strict";
import { deleteSPSiteSchema } from "../../src/actions/sharepoint/sites/delete-sp-site/schema";
import { createGroupFixture } from "./sharepoint-group-fixtures";

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

export async function runSharePointGroupSmoke(): Promise<void> {
  await assertSPGroupSchemas();
  await assertSPGroupLookup();
  await assertSPGroupPropertyComparison();
}
