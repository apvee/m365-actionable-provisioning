/**
 * Internal URL utilities for provisioning UI.
 *
 * @internal
 * @packageDocumentation
 */

export const normalizeUrl = (url: string | undefined): string | undefined => {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};
