/**
 * PnPjs HTTP error utilities.
 * 
 * @packageDocumentation
 */

import { HttpRequestError } from "@pnp/queryable";
import type { JsonValue } from "../../core/json";
import { isPlainObject } from "../../core/utils";

/**
 * Structured details extracted from a PnPjs HTTP error.
 * 
 * @public
 */
export type PnPjsHttpErrorDetails = {
  isHttpRequestError: true;
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  responseJson?: JsonValue;
  responseText?: string;
};

/**
 * Truncates a string to a maximum length.
 * @internal
 */
const truncate = (value: string, max = 20_000): string => {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…(truncated, ${value.length} chars)`;
};

/**
 * Safely converts a value to a string.
 * @internal
 */
const safeToString = (value: unknown): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Type guard that checks if an error is a PnPjs HTTP request error.
 * 
 * @public
 */
export const isPnPjsHttpRequestError = (err: unknown): err is HttpRequestError => {
  return isPlainObject(err) && "isHttpRequestError" in err && (err as Record<string, unknown>).isHttpRequestError === true;
};

/**
 * Extracts OData error message from response body.
 * @internal
 */
const extractODataMessage = (body: unknown): string | undefined => {
  if (!isPlainObject(body)) return undefined;

  // SharePoint classic OData shape
  const odataError = body["odata.error"];
  if (isPlainObject(odataError)) {
    const msg = odataError.message;
    if (isPlainObject(msg) && typeof msg.value === "string") return msg.value;
    if (typeof msg === "string") return msg;
    if (msg !== undefined) return safeToString(msg);
  }

  // Graph-like shape: { error: { message: "..." } }
  const graphError = body.error;
  if (isPlainObject(graphError) && "message" in graphError) {
    const m = (graphError as Record<string, unknown>).message;
    if (typeof m === "string") return m;
    return safeToString(m);
  }

  return undefined;
};

/**
 * Extracts detailed error information from a PnPjs HTTP request error.
 * 
 * @public
 */
export const extractPnPjsHttpErrorDetails = async (err: unknown): Promise<PnPjsHttpErrorDetails | undefined> => {
  if (!isPnPjsHttpRequestError(err)) return undefined;

  const status = typeof err.status === "number" ? err.status : undefined;
  const statusText = typeof err.statusText === "string" ? err.statusText : undefined;
  const url = typeof err.response?.url === "string" ? err.response.url : undefined;

  let responseJson: JsonValue | undefined;
  let responseText: string | undefined;

  try {
    // response is documented as "unread copy" but clone() keeps this safe across multiple consumers.
    const json = await err.response.clone().json();
    responseJson = json as JsonValue;
  } catch {
    try {
      const text = await err.response.clone().text();
      responseText = truncate(text);
    } catch {
      // ignore
    }
  }

  const bodyForMessage = responseJson ?? responseText;
  const extracted = extractODataMessage(responseJson);

  // Prefer extracted OData/Graph message, else fall back to normalized PnPjs message.
  const normalized = typeof err.message === "string" ? err.message : safeToString((err as { message?: unknown }).message);
  const message = extracted ?? (typeof bodyForMessage === "string" ? bodyForMessage : normalized);

  return {
    isHttpRequestError: true,
    message,
    status,
    statusText,
    url,
    ...(responseJson !== undefined ? { responseJson } : {}),
    ...(responseText !== undefined ? { responseText } : {}),
  };
};
