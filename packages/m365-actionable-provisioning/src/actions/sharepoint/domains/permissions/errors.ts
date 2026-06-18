export type PermissionResolutionReason = "not_found" | "ambiguous" | "missing_prerequisite";

export class PermissionResolutionError extends Error {
  readonly reason: PermissionResolutionReason;
  readonly details?: unknown;

  constructor(reason: PermissionResolutionReason, message: string, details?: unknown) {
    super(message);
    this.name = "PermissionResolutionError";
    this.reason = reason;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;
  if (typeof error.status === "number") return error.status;
  const response = error.response;
  if (isRecord(response) && typeof response.status === "number") return response.status;
  return undefined;
}

export function isNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export function isPermissionResolutionError(error: unknown): error is PermissionResolutionError {
  return error instanceof PermissionResolutionError;
}
