import { strict as assert } from "assert";
import { spfi, SPBrowser } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { getSecurableHasUniqueRoleAssignments } from "../../src/actions/sharepoint/domains/permissions";

/** Exercise real PnP request initialization while simulating a stale HTTP cache. */
export async function assertPermissionInheritanceReadsAreFresh(): Promise<void> {
  const web = spfi("https://contoso.sharepoint.com/sites/demo").using(SPBrowser()).web;
  const targets = [web, web.lists.getById("11111111-1111-4111-8111-111111111111")];

  for (const target of targets) {
    let serverUnique = true;
    // A security change need not change the list's ETag. Revalidation can
    // therefore reuse the pre-break response, even with PnP's no-cache default.
    const cachedUnique = false;
    target.on.send.replace(async (_url, init) => new Response(JSON.stringify({
      HasUniqueRoleAssignments: init.cache === "no-store" ? serverUnique : cachedUnique,
    }), { headers: { "Content-Type": "application/json" } }));

    assert.equal(await getSecurableHasUniqueRoleAssignments(target), true,
      "Inheritance checks must see a completed break rather than a stale inherited response");

    serverUnique = false;
    assert.equal(await getSecurableHasUniqueRoleAssignments(target), false,
      "Inheritance checks must also see a subsequent reset");
  }
}
