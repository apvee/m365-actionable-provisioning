import { normalizeError } from "../../../../core";
import type { PermissionCheckResult } from "../../../../core/permissions";

export type GraphPermissionErrorInfo = Readonly<{
  code: "GRAPH_AUTHENTICATION_FAILED" | "GRAPH_PERMISSION_DENIED" | "GRAPH_ERROR";
  message: string;
  status?: number;
}>;

export function getGraphContentTypeErrorStatus(error: unknown): number | undefined {
  if (typeof (error as { status?: unknown })?.status === "number") {
    return (error as { status: number }).status;
  }

  if (typeof (error as { response?: { status?: unknown } })?.response?.status === "number") {
    return (error as { response: { status: number } }).response.status;
  }

  return undefined;
}

export function normalizeGraphContentTypeError(error: unknown, operation: string): GraphPermissionErrorInfo {
  const normalized = normalizeError(error);
  const status = getGraphContentTypeErrorStatus(error);

  if (status === 401) {
    return {
      code: "GRAPH_AUTHENTICATION_FAILED",
      status,
      message: `Microsoft Graph authentication failed during ${operation}. Ensure the Graph client is authenticated and has Sites.Manage.All or Sites.FullControl.All.`,
    };
  }

  if (status === 403) {
    return {
      code: "GRAPH_PERMISSION_DENIED",
      status,
      message: `Microsoft Graph permission denied during ${operation}. Required permission: Sites.Manage.All or Sites.FullControl.All.`,
    };
  }

  return {
    code: "GRAPH_ERROR",
    status,
    message: normalized.message,
  };
}

export function isGraphContentTypeNotFoundError(error: unknown): boolean {
  return getGraphContentTypeErrorStatus(error) === 404;
}

export function graphContentTypePermissionCheck(): PermissionCheckResult {
  return {
    decision: "unknown",
    message: "Microsoft Graph content type actions require Sites.Manage.All or Sites.FullControl.All. Permissions are validated by Microsoft Graph during execution.",
  };
}

export function getGraphContentTypeComplianceReason(error: unknown, operation: string): { reason: string; message: string } {
  const normalized = normalizeGraphContentTypeError(error, operation);
  return {
    reason: normalized.code.toLowerCase(),
    message: normalized.message,
  };
}
