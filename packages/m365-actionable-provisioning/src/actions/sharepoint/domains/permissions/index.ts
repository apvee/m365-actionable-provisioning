export {
  PermissionResolutionError,
  getErrorStatus,
  isNotFoundError,
  isPermissionResolutionError,
  type PermissionResolutionReason,
} from "./errors";
export {
  countRoleReferences,
  createBreakRoleInheritanceSchema,
  createGrantRoleAssignmentSchema,
  createRemoveRoleAssignmentSchema,
  createResetRoleInheritanceSchema,
  permissionPrincipalTypes,
  permissionRoleTypes,
  roleTypeKindByPermissionRoleType,
  type PermissionPrincipalType,
  type PermissionRoleType,
} from "./schema";
export {
  getSecurableHasUniqueRoleAssignments,
  resolveListPermissionTarget,
  resolveSitePermissionTarget,
  type PermissionSecurableTarget,
  type PermissionTargetKind,
} from "./securable-target";
export {
  buildEntraGroupClaim,
  buildM365GroupClaim,
  resolvePrincipalId,
  type PrincipalReference,
  type ResolvePrincipalArgs,
} from "./principal-resolution";
export {
  getRoleTypeKind,
  resolveRoleDefinitionId,
  type RoleReference,
} from "./role-resolution";
export {
  addRoleAssignmentBinding,
  hasRoleAssignmentBinding,
  removeRoleAssignmentBinding,
} from "./role-assignments";
