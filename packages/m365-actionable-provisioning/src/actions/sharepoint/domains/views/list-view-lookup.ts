import type { IList } from "@pnp/sp/lists";
import type { IViewInfo } from "@pnp/sp/views";

import { escapeODataStringLiteral } from "../lists/list-lookup";

import "@pnp/sp/views";

export type ListViewInfo = Pick<IViewInfo, "Id" | "Title" | "PersonalView" | "DefaultView" | "ViewQuery" | "RowLimit" | "Paged">;

const listViewSelectKeys = [
  "Id",
  "Title",
  "PersonalView",
  "DefaultView",
  "ViewQuery",
  "RowLimit",
  "Paged",
] as const satisfies readonly (keyof ListViewInfo)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  if (typeof error.status === "number") return error.status;

  const response = error.response;
  if (isRecord(response) && typeof response.status === "number") return response.status;

  return undefined;
}

function isSharePointNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export async function getPublicListViewInfoByTitle(list: IList, title: string): Promise<ListViewInfo | undefined> {
  try {
    const safeTitle = escapeODataStringLiteral(title);
    const results = await list.views
      .filter(`Title eq '${safeTitle}' and PersonalView eq false`)
      .top(1)
      .select(...listViewSelectKeys)<ListViewInfo[]>();

    return results[0];
  } catch (error) {
    if (isSharePointNotFoundError(error)) return undefined;
    throw error;
  }
}
