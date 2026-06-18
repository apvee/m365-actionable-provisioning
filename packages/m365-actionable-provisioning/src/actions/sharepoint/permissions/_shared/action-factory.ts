import type { IRoleAssignments, SecurableQueryable } from "@pnp/sp/security";
import { PermissionKind } from "@pnp/sp/security";
import type { IWeb } from "@pnp/sp/webs";
import { z } from "zod";
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  addRoleAssignmentBinding,
  getSecurableHasUniqueRoleAssignments,
  hasRoleAssignmentBinding,
  isPermissionResolutionError,
  removeRoleAssignmentBinding,
  resolveListPermissionTarget,
  resolvePrincipalId,
  resolveRoleDefinitionId,
  resolveSitePermissionTarget,
  type PermissionSecurableTarget,
  type PermissionTargetKind,
  type PrincipalReference,
  type RoleReference,
} from "../../domains/permissions";

import "@pnp/sp/security/list";
import "@pnp/sp/security/web";

type SharePointPermissionOperation = "break" | "reset" | "grant" | "remove";

type SharePointPermissionActionOptions<
  Verb extends string,
  Schema extends z.ZodType<Record<string, unknown>>,
> = Readonly<{
  verb: Verb;
  schema: Schema;
  targetKind: PermissionTargetKind;
  operation: SharePointPermissionOperation;
}>;

type BreakRoleInheritancePayload = Readonly<{
  copyRoleAssignments?: boolean;
  clearSubscopes?: boolean;
}>;

type RoleAssignmentPayload = PrincipalReference & RoleReference & Readonly<{
  breakRoleInheritance?: boolean;
  copyRoleAssignments?: boolean;
  clearSubscopes?: boolean;
}>;

type PermissionProbeTarget = SecurableQueryable & Readonly<{
  currentUserHasPermissions(permissionKind: PermissionKind): Promise<boolean>;
}>;

type PermissionMutationTarget = SecurableQueryable & Readonly<{
  breakRoleInheritance(copyRoleAssignments: boolean, clearSubscopes: boolean): Promise<void>;
  resetRoleInheritance(): Promise<void>;
  roleAssignments: IRoleAssignments;
}>;

type ResolvedRoleAssignmentIds = Readonly<{
  principalId: number;
  roleDefId: number;
}>;

function getRoleReferenceResource(payload: RoleReference): string {
  if (payload.roleName !== undefined) return payload.roleName;
  if (payload.roleType !== undefined) return payload.roleType;
  if (payload.roleId !== undefined) return String(payload.roleId);
  return "role";
}

function getRoleAssignmentResource(payload: RoleAssignmentPayload): string {
  return `${payload.principal} -> ${getRoleReferenceResource(payload)}`;
}

function resolvePermissionTarget(scope: M365Scope, targetKind: PermissionTargetKind): PermissionSecurableTarget | undefined {
  return targetKind === "site" ? resolveSitePermissionTarget(scope) : resolveListPermissionTarget(scope);
}

function getMissingTargetMessage(targetKind: PermissionTargetKind): string {
  return `SharePoint ${targetKind} permission target not available in scope`;
}

function getFallbackResource(scope: M365Scope, targetKind: PermissionTargetKind): string {
  if (targetKind === "site") {
    return scope.webUrl ?? scope.siteUrl ?? "site";
  }

  return scope.listName ?? "list";
}

function getPermissionTarget(target: PermissionSecurableTarget): PermissionProbeTarget {
  return target.target as PermissionProbeTarget;
}

function getMutationTarget(target: PermissionSecurableTarget): PermissionMutationTarget {
  return target.target as PermissionMutationTarget;
}

async function resolveRoleAssignmentIds(
  web: IWeb,
  clients: M365Clients,
  payload: RoleAssignmentPayload,
  allowEnsureUser: boolean
): Promise<ResolvedRoleAssignmentIds> {
  const principalId = await resolvePrincipalId({
    web,
    graphClient: clients.graphClient,
    principalType: payload.principalType,
    principal: payload.principal,
    allowEnsureUser,
  });
  const roleDefId = await resolveRoleDefinitionId(web, {
    roleId: payload.roleId,
    roleName: payload.roleName,
    roleType: payload.roleType,
  });
  return { principalId, roleDefId };
}

export class SharePointPermissionAction<
  Verb extends string,
  Schema extends z.ZodType<Record<string, unknown>>,
> extends ActionDefinition<
  Verb,
  Schema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb: Verb;
  readonly actionSchema: Schema;
  readonly requiredClients = ["spfi"] as const;

  private readonly targetKind: PermissionTargetKind;
  private readonly operation: SharePointPermissionOperation;

  constructor(options: SharePointPermissionActionOptions<Verb, Schema>) {
    super();
    this.verb = options.verb;
    this.actionSchema = options.schema;
    this.targetKind = options.targetKind;
    this.operation = options.operation;
  }

  async checkPermissions(ctx: M365RuntimeContext<z.infer<Schema>>): Promise<PermissionCheckResult> {
    if (!ctx.clients.spfi) {
      return { decision: "deny", message: "SPFI instance not available in scope" };
    }

    const target = resolvePermissionTarget(ctx.scopeIn, this.targetKind);
    if (!target) {
      return { decision: "unknown", message: getMissingTargetMessage(this.targetKind) };
    }

    try {
      const canManagePermissions = await getPermissionTarget(target).currentUserHasPermissions(PermissionKind.ManagePermissions);
      return canManagePermissions
        ? {
          decision: "allow",
          message: `Permission probe passed (ManagePermissions). target=${target.resource}`,
        }
        : {
          decision: "deny",
          message: `Access denied: current user lacks Manage Permissions. target=${target.resource}`,
        };
    } catch (error) {
      return {
        decision: "unknown",
        message: `Permission probe could not be completed. target=${target.resource}. error=${String(error)}`,
      };
    }
  }

  async handler(ctx: M365RuntimeContext<z.infer<Schema>>): Promise<M365ActionResult> {
    const target = resolvePermissionTarget(ctx.scopeIn, this.targetKind);
    if (!target) {
      return actionSkipped(getFallbackResource(ctx.scopeIn, this.targetKind), "missing_prerequisite");
    }

    const runtimeTarget = getMutationTarget(target);

    switch (this.operation) {
      case "break": {
        const payload = ctx.action.payload as BreakRoleInheritancePayload;
        const hasUniqueRoleAssignments = await getSecurableHasUniqueRoleAssignments(target.target);
        if (hasUniqueRoleAssignments) {
          return actionSkipped(target.resource, "already_exists", target.scopeDelta);
        }

        await runtimeTarget.breakRoleInheritance(payload.copyRoleAssignments ?? true, payload.clearSubscopes ?? false);
        return actionExecuted(target.resource, target.scopeDelta);
      }

      case "reset": {
        const hasUniqueRoleAssignments = await getSecurableHasUniqueRoleAssignments(target.target);
        if (!hasUniqueRoleAssignments) {
          return actionSkipped(target.resource, "no_changes", target.scopeDelta);
        }

        await runtimeTarget.resetRoleInheritance();
        return actionExecuted(target.resource, target.scopeDelta);
      }

      case "grant":
      case "remove": {
        const payload = ctx.action.payload as RoleAssignmentPayload;
        const resource = getRoleAssignmentResource(payload);
        const hasUniqueRoleAssignments = await getSecurableHasUniqueRoleAssignments(target.target);
        if (!hasUniqueRoleAssignments) {
          if (this.operation !== "grant" || payload.breakRoleInheritance !== true) {
            return actionSkipped(resource, "missing_prerequisite", target.scopeDelta);
          }
        }

        let ids: ResolvedRoleAssignmentIds;

        try {
          ids = await resolveRoleAssignmentIds(target.web, ctx.clients, payload, this.operation === "grant");
        } catch (error) {
          if (isPermissionResolutionError(error)) {
            if (error.reason === "missing_prerequisite") {
              return actionSkipped(resource, "missing_prerequisite", target.scopeDelta);
            }

            if (this.operation === "remove" && error.reason === "not_found") {
              return actionSkipped(resource, "not_found", target.scopeDelta);
            }
          }
          throw error;
        }

        if (!hasUniqueRoleAssignments && this.operation === "grant" && payload.breakRoleInheritance === true) {
          await runtimeTarget.breakRoleInheritance(payload.copyRoleAssignments ?? true, payload.clearSubscopes ?? false);
        }

        const hasBinding = await hasRoleAssignmentBinding(runtimeTarget.roleAssignments, ids.principalId, ids.roleDefId);

        if (this.operation === "grant") {
          if (hasBinding) {
            return actionSkipped(resource, "already_exists", target.scopeDelta);
          }

          await addRoleAssignmentBinding(runtimeTarget.roleAssignments, ids.principalId, ids.roleDefId);
          return actionExecuted(resource, target.scopeDelta);
        }

        if (!hasBinding) {
          return actionSkipped(resource, "not_found", target.scopeDelta);
        }

        await removeRoleAssignmentBinding(runtimeTarget.roleAssignments, ids.principalId, ids.roleDefId);
        return actionExecuted(resource, target.scopeDelta);
      }
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, z.infer<Schema>, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const target = resolvePermissionTarget(ctx.scopeIn, this.targetKind);
    if (!target) {
      return unverifiable({
        resource: getFallbackResource(ctx.scopeIn, this.targetKind),
        reason: "missing_prerequisite",
        message: getMissingTargetMessage(this.targetKind),
      });
    }

    try {
      switch (this.operation) {
        case "break": {
          const hasUniqueRoleAssignments = await getSecurableHasUniqueRoleAssignments(target.target);
          return hasUniqueRoleAssignments
            ? compliant({ resource: target.resource, scopeDelta: target.scopeDelta })
            : nonCompliant({ resource: target.resource, reason: "inherited_permissions", scopeDelta: target.scopeDelta });
        }

        case "reset": {
          const hasUniqueRoleAssignments = await getSecurableHasUniqueRoleAssignments(target.target);
          return hasUniqueRoleAssignments
            ? nonCompliant({ resource: target.resource, reason: "unique_permissions", scopeDelta: target.scopeDelta })
            : compliant({ resource: target.resource, scopeDelta: target.scopeDelta });
        }

        case "grant":
        case "remove": {
          const payload = ctx.action.payload as RoleAssignmentPayload;
          const resource = getRoleAssignmentResource(payload);
          const hasUniqueRoleAssignments = await getSecurableHasUniqueRoleAssignments(target.target);
          if (!hasUniqueRoleAssignments) {
            if (this.operation === "grant" && payload.breakRoleInheritance === true) {
              return nonCompliant({ resource, reason: "inherited_permissions", scopeDelta: target.scopeDelta });
            }

            return unverifiable({
              resource,
              reason: "missing_prerequisite",
              message: `SharePoint ${this.targetKind} permission target inherits permissions.`,
              scopeDelta: target.scopeDelta,
            });
          }

          let ids: ResolvedRoleAssignmentIds;

          try {
            ids = await resolveRoleAssignmentIds(target.web, ctx.clients, payload, false);
          } catch (error) {
            if (isPermissionResolutionError(error)) {
              if (error.reason === "not_found") {
                return this.operation === "grant"
                  ? nonCompliant({ resource, reason: "not_found", scopeDelta: target.scopeDelta })
                  : compliant({ resource, scopeDelta: target.scopeDelta });
              }

              return unverifiable({
                resource,
                reason: error.reason,
                message: error.message,
                details: error.details,
                scopeDelta: target.scopeDelta,
              });
            }

            return unverifiableError(resource, error);
          }

          const hasBinding = await hasRoleAssignmentBinding(getMutationTarget(target).roleAssignments, ids.principalId, ids.roleDefId);

          if (this.operation === "grant") {
            return hasBinding
              ? compliant({ resource, scopeDelta: target.scopeDelta })
              : nonCompliant({ resource, reason: "missing_binding", scopeDelta: target.scopeDelta });
          }

          return hasBinding
            ? nonCompliant({ resource, reason: "binding_present", scopeDelta: target.scopeDelta })
            : compliant({ resource, scopeDelta: target.scopeDelta });
        }
      }
    } catch (error) {
      return unverifiableError(target.resource, error);
    }
  }
}
