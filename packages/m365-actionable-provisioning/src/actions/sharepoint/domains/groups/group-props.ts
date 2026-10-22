import type { ISiteGroupInfo } from "@pnp/sp/site-groups";
import { compareProperties, type ComplianceMismatch } from "../../_shared/compliance-compare";
import { pickDefined } from "../../utils/object-utils";
import type { SPGroupInfo } from "./group-lookup";

type SPGroupProperties = { title?: string; description?: string };

export function buildSPGroupUpdateProps(payload: SPGroupProperties): Partial<Pick<ISiteGroupInfo, "Title" | "Description">> {
  return pickDefined({ Title: payload.title, Description: payload.description });
}

export function getSPGroupMismatches(expected: SPGroupProperties, actual: SPGroupInfo): readonly ComplianceMismatch[] {
  return compareProperties(buildSPGroupUpdateProps(expected), {
    Title: actual.Title,
    Description: actual.Description ?? "",
  });
}
