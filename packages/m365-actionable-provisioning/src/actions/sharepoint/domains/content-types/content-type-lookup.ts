import type { ContentType as GraphContentType } from "@microsoft/microsoft-graph-types";
import type { GraphFI } from "@pnp/graph";
import type { IContentType } from "@pnp/graph/content-types";
import type { ProvisioningWarning } from "../../../../runtime";
import { isGraphContentTypeNotFoundError } from "./content-type-errors";
import { buildContentTypeNameMismatchWarning, type ContentTypeReference } from "./content-type-reference";

import "@pnp/graph/sites";
import "@pnp/graph/lists";
import "@pnp/graph/content-types";

export type ResolvedContentType = Readonly<{
  handle: IContentType;
  info: GraphContentType;
  warnings: readonly ProvisioningWarning[];
}>;

function buildMismatchWarnings(reference: ContentTypeReference, info: GraphContentType): readonly ProvisioningWarning[] {
  return reference.contentTypeId && reference.contentTypeName && info.name && info.name !== reference.contentTypeName
    ? [buildContentTypeNameMismatchWarning(reference.contentTypeName, info.name, reference.contentTypeId)]
    : [];
}

export async function resolveSiteContentType(
  graphClient: GraphFI,
  graphSiteId: string,
  reference: ContentTypeReference
): Promise<ResolvedContentType | undefined> {
  const collection = graphClient.sites.getById(graphSiteId).contentTypes;

  if (reference.contentTypeId) {
    const handle = collection.getById(reference.contentTypeId);
    try {
      const info = await handle();
      return { handle, info, warnings: buildMismatchWarnings(reference, info) };
    } catch (error) {
      if (isGraphContentTypeNotFoundError(error)) return undefined;
      throw error;
    }
  }

  if (!reference.contentTypeName) return undefined;

  const all = await collection();
  const matches = all.filter((contentType) => contentType.name === reference.contentTypeName);
  if (matches.length > 1) {
    throw new Error(`Ambiguous content type reference '${reference.contentTypeName}' matched ${matches.length} content types.`);
  }

  const match = matches[0];
  if (!match?.id) return undefined;

  return { handle: collection.getById(match.id), info: match, warnings: [] };
}

export async function resolveListContentType(
  graphClient: GraphFI,
  graphSiteId: string,
  graphListId: string,
  reference: ContentTypeReference
): Promise<ResolvedContentType | undefined> {
  const collection = graphClient.sites.getById(graphSiteId).lists.getById(graphListId).contentTypes;

  if (reference.contentTypeId) {
    const handle = collection.getById(reference.contentTypeId);
    try {
      const info = await handle();
      return { handle, info, warnings: buildMismatchWarnings(reference, info) };
    } catch (error) {
      if (isGraphContentTypeNotFoundError(error)) return undefined;
      throw error;
    }
  }

  if (!reference.contentTypeName) return undefined;

  const all = await collection();
  const matches = all.filter((contentType) => contentType.name === reference.contentTypeName);
  if (matches.length > 1) {
    throw new Error(`Ambiguous list content type reference '${reference.contentTypeName}' matched ${matches.length} content types.`);
  }

  const match = matches[0];
  if (!match?.id) return undefined;

  return { handle: collection.getById(match.id), info: match, warnings: [] };
}
