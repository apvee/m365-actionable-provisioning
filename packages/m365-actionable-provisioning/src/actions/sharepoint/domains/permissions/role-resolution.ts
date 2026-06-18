import type { IRoleDefinitionInfo } from "@pnp/sp/security";
import type { IWeb } from "@pnp/sp/webs";
import { escapeODataStringLiteral } from "../lists/list-lookup";
import { PermissionResolutionError, isNotFoundError } from "./errors";
import { roleTypeKindByPermissionRoleType, type PermissionRoleType } from "./schema";

import "@pnp/sp/security/web";

export type RoleReference = Readonly<{
  roleId?: number;
  roleName?: string;
  roleType?: PermissionRoleType;
}>;

type RoleDefinitionInfo = Readonly<Pick<IRoleDefinitionInfo, "Id" | "Name" | "RoleTypeKind">>;

export function getRoleTypeKind(roleType: PermissionRoleType): 2 | 3 | 4 | 5 | 6 {
  return roleTypeKindByPermissionRoleType[roleType];
}

export async function resolveRoleDefinitionId(web: IWeb, reference: RoleReference): Promise<number> {
  if (reference.roleId !== undefined) {
    try {
      const info = await web.roleDefinitions.getById(reference.roleId)();
      if (typeof info.Id === "number") return info.Id;
      throw new PermissionResolutionError("not_found", `SharePoint role definition ${reference.roleId} did not return an Id.`);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new PermissionResolutionError("not_found", `SharePoint role definition ${reference.roleId} was not found.`, error);
      }
      throw error;
    }
  }

  if (reference.roleType !== undefined) {
    try {
      const info = await web.roleDefinitions.getByType(getRoleTypeKind(reference.roleType))();
      if (typeof info.Id === "number") return info.Id;
      throw new PermissionResolutionError("not_found", `SharePoint role definition for roleType '${reference.roleType}' did not return an Id.`);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new PermissionResolutionError("not_found", `SharePoint role definition for roleType '${reference.roleType}' was not found.`, error);
      }
      throw error;
    }
  }

  if (!reference.roleName) {
    throw new PermissionResolutionError("missing_prerequisite", "SharePoint role definition resolution requires roleId, roleName, or roleType.");
  }

  const safeName = escapeODataStringLiteral(reference.roleName);
  const matches = await web.roleDefinitions
    .filter(`Name eq '${safeName}'`)
    .top(2)
    .select("Id", "Name", "RoleTypeKind")<RoleDefinitionInfo[]>();

  if (!Array.isArray(matches) || matches.length === 0) {
    throw new PermissionResolutionError("not_found", `SharePoint role definition '${reference.roleName}' was not found.`);
  }

  if (matches.length > 1) {
    throw new PermissionResolutionError("ambiguous", `SharePoint role definition '${reference.roleName}' matched multiple roles.`, matches);
  }

  const match = matches[0];
  if (typeof match?.Id !== "number") {
    throw new PermissionResolutionError("not_found", `SharePoint role definition '${reference.roleName}' did not return an Id.`, match);
  }

  return match.Id;
}
