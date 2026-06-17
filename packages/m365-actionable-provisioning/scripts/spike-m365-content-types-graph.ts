import "@pnp/graph/sites";
import "@pnp/graph/lists";
import "@pnp/graph/content-types";
import "@pnp/graph/columns";

type SpikeResult = Readonly<{
  capability: string;
  status: "confirmed_locally" | "requires_tenant";
  evidence: string;
}>;

const results: SpikeResult[] = [
  {
    capability: "site.contentTypes.add(contentType)",
    status: "confirmed_locally",
    evidence: "@pnp/graph/content-types/sites.d.ts augments _ContentTypes with add(contentType)",
  },
  {
    capability: "contentType update/delete",
    status: "confirmed_locally",
    evidence: "@pnp/graph/content-types/types.d.ts makes IContentType updateable and deleteable",
  },
  {
    capability: "contentType.columns.addRef(siteColumn)",
    status: "confirmed_locally",
    evidence: "@pnp/graph/columns/content-types.d.ts augments IContentType with columns.addRef",
  },
  {
    capability: "list.contentTypes.addCopy(siteContentType)",
    status: "confirmed_locally",
    evidence: "@pnp/graph/content-types/lists.d.ts augments list contentTypes with addCopy",
  },
  {
    capability: "set default list content type",
    status: "requires_tenant",
    evidence: "No reliable PnPjs Graph wrapper confirmed; keep setSPListDefaultContentType unregistered in V1",
  },
];

for (const result of results) {
  console.log(`${result.status}: ${result.capability} - ${result.evidence}`);
}
