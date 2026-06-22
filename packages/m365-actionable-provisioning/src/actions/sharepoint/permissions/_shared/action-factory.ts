import type { IRoleAssignments, SecurableQueryable } from "@pnp/sp/security";
import { PermissionKind } from "@pnp/sp/security";
import type { IWeb } from "@pnp/sp/webs";
import { z } from "zod";
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { getListInfoByRootFolderName } from "../../domains/lists";
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
import "@pnp/sp/lists";

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

type PermissionTargetDiagnostics = Readonly<{
  kind: PermissionTargetKind;
  resource: string;
  webUrl?: string;
  listName?: string;
  targetUrl?: string;
  list?: Readonly<{
    Id?: string;
    Title?: string;
    HasUniqueRoleAssignments?: boolean;
    RootFolder?: Readonly<{
      Name?: string;
      ServerRelativeUrl?: string;
    }>;
  }>;
}>;

const BREAK_ROLE_INHERITANCE_VERIFY_ATTEMPTS = 8;
const BREAK_ROLE_INHERITANCE_VERIFY_DELAY_MS = 500;

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function waitForUniqueRoleAssignmentsAfterBreak(target: SecurableQueryable): Promise<boolean> {
  for (let attempt = 0; attempt < BREAK_ROLE_INHERITANCE_VERIFY_ATTEMPTS; attempt++) {
    if (attempt > 0) await delay(BREAK_ROLE_INHERITANCE_VERIFY_DELAY_MS);
    if (await getSecurableHasUniqueRoleAssignments(target)) return true;
  }

  return false;
}

function getQueryableUrl(target: SecurableQueryable): string | undefined {
  const queryable = target as unknown as { toUrl?: () => string };
  if (typeof queryable.toUrl !== "function") return undefined;

  try {
    return queryable.toUrl();
  } catch {
    return undefined;
  }
}

async function getPermissionTargetDiagnostics(target: PermissionSecurableTarget): Promise<PermissionTargetDiagnostics> {
  const diagnostics: PermissionTargetDiagnostics = {
    kind: target.kind,
    resource: target.resource,
    webUrl: typeof target.scopeDelta.webUrl === "string" ? target.scopeDelta.webUrl : undefined,
    listName: typeof target.scopeDelta.listName === "string" ? target.scopeDelta.listName : undefined,
    targetUrl: getQueryableUrl(target.target),
  };

  if (target.kind !== "list") return diagnostics;

  try {
    const list = await (target.target as unknown as {
      expand: (field: string) => {
        select: (...fields: string[]) => <T>() => Promise<T>;
      };
    })
      .expand("RootFolder")
      .select("Id", "Title", "HasUniqueRoleAssignments", "RootFolder/Name", "RootFolder/ServerRelativeUrl")<NonNullable<PermissionTargetDiagnostics["list"]>>();

    return { ...diagnostics, list };
  } catch (error) {
    return { ...diagnostics, list: { Title: `diagnostics_unavailable: ${String(error)}` } };
  }
}

async function getFreshPermissionMutationTarget(target: PermissionSecurableTarget): Promise<PermissionMutationTarget> {
  if (target.kind !== "list") return getMutationTarget(target);

  const listName = typeof target.scopeDelta.listName === "string" ? target.scopeDelta.listName : undefined;
  if (!listName) return getMutationTarget(target);

  const webWithLists = target.web as IWeb & { lists?: { getById?: (id: string) => unknown } };
  if (typeof webWithLists.lists?.getById !== "function") return getMutationTarget(target);

  const listInfo = await getListInfoByRootFolderName(target.web, listName);
  if (!listInfo?.Id) return getMutationTarget(target);

  return webWithLists.lists.getById(listInfo.Id) as PermissionMutationTarget;
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

        const didBreakRoleInheritance = !hasUniqueRoleAssignments && this.operation === "grant" && payload.breakRoleInheritance === true;
        let activeRuntimeTarget = runtimeTarget;
        if (didBreakRoleInheritance) {
          await runtimeTarget.breakRoleInheritance(payload.copyRoleAssignments ?? true, payload.clearSubscopes ?? false);
          activeRuntimeTarget = await getFreshPermissionMutationTarget(target);
          const hasUniqueRoleAssignmentsAfterBreak = await waitForUniqueRoleAssignmentsAfterBreak(activeRuntimeTarget);
          if (!hasUniqueRoleAssignmentsAfterBreak) {
            const diagnostics = await getPermissionTargetDiagnostics(target);
            const error = new Error(`SharePoint ${this.targetKind} permission target still inherits permissions after breakRoleInheritance. target=${target.resource}`) as Error & {
              details?: unknown;
            };
            error.details = {
              target: diagnostics,
              breakRoleInheritance: {
                copyRoleAssignments: payload.copyRoleAssignments ?? true,
                clearSubscopes: payload.clearSubscopes ?? false,
                verifyAttempts: BREAK_ROLE_INHERITANCE_VERIFY_ATTEMPTS,
                verifyDelayMs: BREAK_ROLE_INHERITANCE_VERIFY_DELAY_MS,
              },
              roleAssignment: {
                principalType: payload.principalType,
                principal: payload.principal,
                principalId: ids.principalId,
                role: getRoleReferenceResource(payload),
                roleDefId: ids.roleDefId,
              },
            };
            ctx.logger.warn("breakRoleInheritance did not persist on SharePoint permission target", error.details);
            throw error;
          }
        }

        const hasBinding = await hasRoleAssignmentBinding(activeRuntimeTarget.roleAssignments, ids.principalId, ids.roleDefId);

        if (this.operation === "grant") {
          if (hasBinding) {
            if (didBreakRoleInheritance) {
              return actionExecuted(resource, target.scopeDelta);
            }
            return actionSkipped(resource, "already_exists", target.scopeDelta);
          }

          await addRoleAssignmentBinding(activeRuntimeTarget.roleAssignments, ids.principalId, ids.roleDefId);
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
              return nonCompliant({
                resource,
                reason: "inherited_permissions",
                details: { target: await getPermissionTargetDiagnostics(target) },
                scopeDelta: target.scopeDelta,
              });
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
            ids = await resolveRoleAssignmentIds(target.web, ctx.clients, payload, this.operation === "grant");
          } catch (error) {
            if (isPermissionResolutionError(error)) {
              if (error.reason === "not_found") {
                return this.operation === "grant"
                  ? nonCompliant({ resource, reason: "not_found", details: { principalType: payload.principalType, principal: payload.principal }, scopeDelta: target.scopeDelta })
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
              : nonCompliant({
                resource,
                reason: "missing_binding",
                details: {
                  principalType: payload.principalType,
                  principal: payload.principal,
                  principalId: ids.principalId,
                  role: getRoleReferenceResource(payload),
                  roleDefId: ids.roleDefId,
                  target: await getPermissionTargetDiagnostics(target),
                },
                scopeDelta: target.scopeDelta,
              });
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
