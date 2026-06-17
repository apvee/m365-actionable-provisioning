import type { GraphFI } from "@pnp/graph";
import type { M365Scope } from "../../../../runtime";

import "@pnp/graph/sites";
import "@pnp/graph/lists";

export type GraphSharePointTarget = Readonly<{
  graphSiteId: string;
  graphListId?: string;
}>;

function parseSharePointUrl(url: string): { hostname: string; serverRelativeUrl: string } {
  const parsed = new URL(url);
  return {
    hostname: parsed.hostname,
    serverRelativeUrl: parsed.pathname || "/",
  };
}

type GraphResolutionPayload = Readonly<Record<string, unknown> & {
  siteUrl?: string;
  webUrl?: string;
  listName?: string;
}>;

export async function resolveGraphSiteTarget(
  graphClient: GraphFI,
  scope: M365Scope,
  payload: GraphResolutionPayload
): Promise<GraphSharePointTarget> {
  if (typeof scope.graphSiteId === "string") {
    return { graphSiteId: scope.graphSiteId };
  }

  const url =
    payload.webUrl ??
    payload.siteUrl ??
    (typeof scope.webUrl === "string" ? scope.webUrl : undefined) ??
    (typeof scope.siteUrl === "string" ? scope.siteUrl : undefined);
  if (!url) {
    throw new Error("Graph site resolution failed: provide siteUrl/webUrl or propagate graphSiteId in scope.");
  }

  const { hostname, serverRelativeUrl } = parseSharePointUrl(url);
  const site = await graphClient.sites.getByUrl(hostname, serverRelativeUrl);
  const siteInfo = await site.select("id")();
  if (!siteInfo.id) {
    throw new Error(`Graph site resolution failed: Microsoft Graph did not return a site id for ${url}.`);
  }

  return { graphSiteId: siteInfo.id };
}

export async function resolveGraphListTarget(
  graphClient: GraphFI,
  scope: M365Scope,
  payload: GraphResolutionPayload
): Promise<Required<GraphSharePointTarget>> {
  const siteTarget = await resolveGraphSiteTarget(graphClient, scope, payload);
  if (typeof scope.graphListId === "string") {
    return { graphSiteId: siteTarget.graphSiteId, graphListId: scope.graphListId };
  }

  const listName = payload.listName ?? (typeof scope.listName === "string" ? scope.listName : undefined);
  if (!listName) {
    throw new Error("Graph list resolution failed: provide listName or propagate graphListId in scope.");
  }

  const lists = await graphClient.sites.getById(siteTarget.graphSiteId).lists.select("id", "name", "displayName")();
  const matches = Array.isArray(lists) ? lists.filter((list) => list.name === listName) : [];
  if (matches.length > 1) {
    throw new Error(`Graph list resolution failed: listName '${listName}' matched multiple lists by Graph name.`);
  }

  const match = matches[0];
  if (!match?.id) {
    throw new Error(`Graph list resolution failed: list '${listName}' was not found.`);
  }

  return { graphSiteId: siteTarget.graphSiteId, graphListId: match.id };
}
