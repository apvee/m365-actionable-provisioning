import { z } from "zod";
import type { IWeb } from "@pnp/sp/webs";
import { spGroupReferenceFields, validateSPGroupReference } from "../../groups/_shared/schema";
import { escapeODataStringLiteral } from "../lists/list-lookup";
import "@pnp/sp/site-groups/web";

export type SPGroupReference = Readonly<{ groupId?: number; groupName?: string }>;
export type SPGroupInfo = Readonly<{ Id: number; Title: string; Description?: string | null }>;

const referenceSchema = z.object(spGroupReferenceFields).superRefine(validateSPGroupReference);
const infoSchema = z.object({
  Id: z.number().int().positive(),
  Title: z.string().refine((value) => value.trim().length > 0),
  Description: z.string().nullable().optional(),
});

/** Only an empty, successful collection response establishes group absence. */
export async function resolveSPGroup(web: IWeb, reference: SPGroupReference): Promise<SPGroupInfo | undefined> {
  const ref = referenceSchema.parse(reference);
  const filter = ref.groupId !== undefined
    ? `Id eq ${ref.groupId}`
    : `Title eq '${escapeODataStringLiteral(ref.groupName!)}'`;
  const groups: unknown = await web.siteGroups.filter(filter).select("Id", "Title", "Description").top(2)();
  if (!Array.isArray(groups)) throw new Error("Invalid SharePoint group collection response");
  if (groups.length > 1) throw new Error("Ambiguous SharePoint group reference: multiple groups matched");
  return groups.length === 0 ? undefined : infoSchema.parse(groups[0]);
}
