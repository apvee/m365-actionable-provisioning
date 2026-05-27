/**
 * List update helpers.
 *
 * @remarks
 * Shared mapping logic used by list actions to build SharePoint update payloads
 * and compliance expectations.
 *
 * @packageDocumentation
 */

import type { IListInfo } from "@pnp/sp/lists";

import { pickDefined } from "../../../utils/object-utils";
import type { ModifySPListPayload } from "../../schemas/lists/modify-sp-list.schema";

export type BuiltListUpdateProps = Readonly<{
  updateProps: Partial<IListInfo>;
  expected: Record<string, unknown>;
  selectKeys: string[];
}>;

export function buildModifyListUpdateProps(payload: ModifySPListPayload): BuiltListUpdateProps {
  const updateProps: Partial<IListInfo> = pickDefined({
    Hidden: payload.hidden,
    OnQuickLaunch: payload.onQuickLaunch,
    Description: payload.description,
    Title: payload.title,
    EnableAttachments: payload.enableAttachments,
    EnableModeration: payload.enableModeration,
    EnableVersioning: payload.enableVersioning,
    EnableMinorVersions: payload.enableMinorVersions,
    MajorVersionLimit: payload.majorVersionLimit,
    MajorWithMinorVersionsLimit: payload.majorWithMinorVersionsLimit,
    DraftVersionVisibility: payload.draftVersionVisibility,
    EnableFolderCreation: payload.enableFolderCreation,
    IrmEnabled: payload.irmEnabled,
    IrmExpire: payload.irmExpire,
    IrmReject: payload.irmReject,
  });

  const expected = updateProps as unknown as Record<string, unknown>;
  const selectKeys = Object.keys(expected);

  return { updateProps, expected, selectKeys };
}
