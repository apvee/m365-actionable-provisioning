import type { IList } from "@pnp/sp/lists";
import type { SecurableQueryable } from "@pnp/sp/security";
import type { IWeb } from "@pnp/sp/webs";
import type { M365Scope } from "../../../../runtime";

import "@pnp/sp/security/web";
import "@pnp/sp/security/list";

export type PermissionTargetKind = "site" | "list";

export type PermissionSecurableTarget = Readonly<{
  kind: PermissionTargetKind;
  resource: string;
  web: IWeb;
  target: SecurableQueryable;
  scopeDelta: Partial<M365Scope>;
}>;

type UniqueRoleAssignmentsInfo = Readonly<{ HasUniqueRoleAssignments?: boolean }>;

export function resolveSitePermissionTarget(scope: M365Scope): PermissionSecurableTarget | undefined {
  if (!scope.web) return undefined;

  return {
    kind: "site",
    resource: scope.webUrl ?? scope.siteUrl ?? "site",
    web: scope.web,
    target: scope.web as IWeb & SecurableQueryable,
    scopeDelta: {
      web: scope.web,
      siteUrl: scope.siteUrl,
      webUrl: scope.webUrl,
    },
  };
}

export function resolveListPermissionTarget(scope: M365Scope): PermissionSecurableTarget | undefined {
  if (!scope.web || !scope.list) return undefined;

  return {
    kind: "list",
    resource: scope.listName ?? "list",
    web: scope.web,
    target: scope.list as IList & SecurableQueryable,
    scopeDelta: {
      web: scope.web,
      list: scope.list,
      webUrl: scope.webUrl,
      listName: scope.listName,
    },
  };
}

export async function getSecurableHasUniqueRoleAssignments(target: SecurableQueryable): Promise<boolean> {
  const info = await target.select("HasUniqueRoleAssignments")<UniqueRoleAssignmentsInfo>();
  return info.HasUniqueRoleAssignments === true;
}
