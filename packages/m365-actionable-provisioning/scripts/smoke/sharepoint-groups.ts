import assert from "node:assert/strict";
import { deleteSPSiteSchema } from "../../src/actions/sharepoint/sites/delete-sp-site/schema";

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

export async function runSharePointGroupSmoke(): Promise<void> {
  await assertSPGroupSchemas();
}
