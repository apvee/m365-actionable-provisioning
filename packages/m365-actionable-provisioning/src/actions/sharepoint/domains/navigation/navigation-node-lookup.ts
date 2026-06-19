import type { IWeb } from "@pnp/sp/webs/types";
import type { SPNavigationLocation } from "../../navigation/_shared/schema";
import "@pnp/sp/navigation";

export type NavigationNodeInfo = {
  Id: number;
  Title: string;
  Url?: string;
  IsVisible?: boolean;
};

export type NavigationNodeLookupResult =
  | { kind: "missing" }
  | { kind: "found"; node: NavigationNodeInfo }
  | { kind: "ambiguous"; matches: readonly NavigationNodeInfo[] };

export function getNavigationCollection(web: IWeb, location: SPNavigationLocation) {
  return location === "quicklaunch"
    ? web.navigation.quicklaunch
    : web.navigation.topNavigationBar;
}

export async function getNavigationNodeInfoByTitle(
  web: IWeb,
  location: SPNavigationLocation,
  title: string
): Promise<NavigationNodeLookupResult> {
  const nodes = await getNavigationCollection(web, location)();
  const matches = nodes
    .filter((node) => node.Title === title)
    .map((node) => ({
      Id: node.Id,
      Title: node.Title,
      Url: node.Url,
      IsVisible: node.IsVisible,
    }));

  if (matches.length === 0) return { kind: "missing" };
  if (matches.length > 1) return { kind: "ambiguous", matches };
  return { kind: "found", node: matches[0] };
}
