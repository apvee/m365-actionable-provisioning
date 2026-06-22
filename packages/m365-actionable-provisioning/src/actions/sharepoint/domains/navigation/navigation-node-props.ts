import type { INavNodeInfo } from "@pnp/sp/navigation";
import { pickDefined } from "../../utils/object-utils";

export type NavigationNodeMutablePayload = {
  newTitle?: string;
  url?: string;
  isVisible?: boolean;
};

export type NavigationNodeUpdateProps = Partial<Pick<INavNodeInfo, "Title" | "Url" | "IsVisible">>;

export function buildNavigationNodeUpdateProps(payload: NavigationNodeMutablePayload): NavigationNodeUpdateProps {
  return pickDefined({
    Title: payload.newTitle,
    Url: payload.url,
    IsVisible: payload.isVisible,
  });
}

export type NavigationNodeMismatchOptions = {
  webUrl?: string;
};

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function safeDecodeUri(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function normalizePathname(pathname: string): string {
  const decoded = safeDecodeUri(pathname);
  const trimmed = decoded.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function normalizeRelativeUrl(value: string): string {
  return safeDecodeUri(value).replace(/\/+$/, "");
}

function hasAbsoluteUrlScheme(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(value);
}

function toCanonicalAbsoluteUrl(url: URL): string {
  if (url.protocol !== "http:" && url.protocol !== "https:") return url.href;
  return `${url.protocol.toLowerCase()}//${url.host.toLowerCase()}${normalizePathname(url.pathname)}${url.search}${url.hash}`;
}

function normalizeNavigationNodeUrl(value: string, webUrl?: string): string {
  const trimmed = value.trim();

  try {
    const base = webUrl ? new URL(ensureTrailingSlash(webUrl)) : undefined;
    if (base) return toCanonicalAbsoluteUrl(new URL(trimmed, base));
    if (hasAbsoluteUrlScheme(trimmed)) return toCanonicalAbsoluteUrl(new URL(trimmed));
  } catch {
    return normalizeRelativeUrl(trimmed);
  }

  return normalizeRelativeUrl(trimmed);
}

export function areNavigationNodeUrlsEquivalent(
  expected: string,
  actual: string | undefined,
  options: NavigationNodeMismatchOptions = {}
): boolean {
  if (actual === undefined) return false;
  return normalizeNavigationNodeUrl(expected, options.webUrl) === normalizeNavigationNodeUrl(actual, options.webUrl);
}

export function getNavigationNodeMismatches(
  expected: NavigationNodeMutablePayload,
  actual: { Title?: string; Url?: string; IsVisible?: boolean },
  options: NavigationNodeMismatchOptions = {}
): readonly { field: string; expected: unknown; actual: unknown }[] {
  const mismatches: { field: string; expected: unknown; actual: unknown }[] = [];
  if (expected.newTitle !== undefined && expected.newTitle !== actual.Title) {
    mismatches.push({ field: "Title", expected: expected.newTitle, actual: actual.Title });
  }
  if (expected.url !== undefined && !areNavigationNodeUrlsEquivalent(expected.url, actual.Url, options)) {
    mismatches.push({ field: "Url", expected: expected.url, actual: actual.Url });
  }
  if (expected.isVisible !== undefined && expected.isVisible !== actual.IsVisible) {
    mismatches.push({ field: "IsVisible", expected: expected.isVisible, actual: actual.IsVisible });
  }
  return mismatches;
}
