import { normalizeError } from "../../../../core";
import type { ComplianceActionCheckResult } from "../../../../core/action";
import type { M365ActionResult, M365Scope, SkipReason } from "../../../../m365";

type ComplianceResultArgs = Readonly<{
  resource?: string;
  reason?: string;
  message?: string;
  details?: unknown;
  scopeDelta?: Partial<M365Scope>;
}>;

function withScopeDelta(
  result: M365ActionResult["result"],
  scopeDelta?: Partial<M365Scope>
): M365ActionResult {
  return scopeDelta ? { result, scopeDelta } : { result };
}

function complianceResult(
  outcome: ComplianceActionCheckResult<M365Scope>["outcome"],
  args: ComplianceResultArgs = {}
): ComplianceActionCheckResult<M365Scope> {
  return {
    outcome,
    ...(args.resource !== undefined ? { resource: args.resource } : {}),
    ...(args.reason !== undefined ? { reason: args.reason } : {}),
    ...(args.message !== undefined ? { message: args.message } : {}),
    ...(args.details !== undefined ? { details: args.details } : {}),
    ...(args.scopeDelta !== undefined ? { scopeDelta: args.scopeDelta } : {}),
  };
}

export function actionExecuted(resource: string, scopeDelta?: Partial<M365Scope>): M365ActionResult {
  return withScopeDelta({ outcome: "executed", resource }, scopeDelta);
}

export function actionSkipped(
  resource: string,
  reason: SkipReason,
  scopeDelta?: Partial<M365Scope>
): M365ActionResult {
  return withScopeDelta({ outcome: "skipped", resource, reason }, scopeDelta);
}

export function compliant(args: ComplianceResultArgs = {}): ComplianceActionCheckResult<M365Scope> {
  return complianceResult("compliant", args);
}

export function nonCompliant(args: ComplianceResultArgs): ComplianceActionCheckResult<M365Scope> {
  return complianceResult("non_compliant", args);
}

export function unverifiable(args: ComplianceResultArgs): ComplianceActionCheckResult<M365Scope> {
  return complianceResult("unverifiable", args);
}

export function unverifiableError(resource: string | undefined, error: unknown): ComplianceActionCheckResult<M365Scope> {
  return unverifiable({
    resource,
    reason: "error",
    message: normalizeError(error).message,
  });
}
