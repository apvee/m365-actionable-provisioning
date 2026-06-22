import type { IRoleAssignments } from "@pnp/sp/security";
import { isNotFoundError } from "./errors";

import "@pnp/sp/security";

type RoleBindingInfo = Readonly<{ Id?: number }>;

export async function hasRoleAssignmentBinding(
  roleAssignments: IRoleAssignments,
  principalId: number,
  roleDefId: number
): Promise<boolean> {
  try {
    const bindings = await roleAssignments.getById(principalId).bindings<RoleBindingInfo[]>();
    return bindings.some((binding) => binding.Id === roleDefId);
  } catch (error) {
    if (isNotFoundError(error)) return false;
    throw error;
  }
}

export async function addRoleAssignmentBinding(roleAssignments: IRoleAssignments, principalId: number, roleDefId: number): Promise<void> {
  await roleAssignments.add(principalId, roleDefId);
}

export async function removeRoleAssignmentBinding(roleAssignments: IRoleAssignments, principalId: number, roleDefId: number): Promise<void> {
  await roleAssignments.remove(principalId, roleDefId);
}
