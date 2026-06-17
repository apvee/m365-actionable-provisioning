import type { IList } from "@pnp/sp/lists";
import type { IView, IViewInfo } from "@pnp/sp/views";

import "@pnp/sp/views";

export const listViewSelectKeys = [
  "Id",
  "Title",
  "DefaultView",
  "ViewQuery",
  "RowLimit",
  "Paged",
  "TabularView",
  "Scope",
] as const;

export type ListViewInfo = Pick<
  IViewInfo,
  "Id" | "Title" | "DefaultView" | "ViewQuery" | "RowLimit" | "Paged" | "TabularView" | "Scope"
>;

function getErrorStatus(error: unknown): number | undefined {
  if (typeof (error as { status?: unknown })?.status === "number") return (error as { status: number }).status;
  if (typeof (error as { response?: { status?: unknown } })?.response?.status === "number") {
    return (error as { response: { status: number } }).response.status;
  }
  return undefined;
}

export function isSharePointNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export function getListViewByTitle(list: IList, title: string): IView {
  return list.views.getByTitle(title);
}

export async function getListViewInfoByTitle(list: IList, title: string): Promise<ListViewInfo | undefined> {
  try {
    return await getListViewByTitle(list, title).select(...listViewSelectKeys)<ListViewInfo>();
  } catch (error) {
    if (isSharePointNotFoundError(error)) return undefined;
    throw error;
  }
}
