export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type EncodedBody = {
  body: BodyInit;
  headers?: Record<string, string>;
};

export type RequestContext = {
  method: HttpMethod;
  target: string;
};

export type RestApiConfig = {
  baseUrl?: string;
  credentials?: RequestCredentials;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  onUnauthorized?: (requestHeaders: Record<string, string>) => Promise<boolean>;
  encode?: (body: unknown, context: RequestContext) => Promise<EncodedBody>;
  decode?: (payload: unknown, response: Response) => Promise<unknown>;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function trimSlashes(value: string, side: "start" | "end"): string {
  let start = 0;
  let end = value.length;
  while (side === "start" && start < end && value.charCodeAt(start) === 47) start += 1;
  while (side === "end" && end > start && value.charCodeAt(end - 1) === 47) end -= 1;
  return value.slice(start, end);
}

export function joinUrl(base: string, path: string): string {
  if (isAbsoluteUrl(path) || !base) return path;
  if (!path) return base;
  return `${trimSlashes(base, "end")}/${trimSlashes(path, "start")}`;
}

export async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return (response.headers.get("content-type") ?? "").includes("application/json") ? null : text;
  }
}

function textOf(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function errorMessageOf(payload: unknown, status: number): string {
  const fallback = `HTTP ${status}`;
  if (typeof payload === "string") return textOf(payload) ?? fallback;
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  const detail = record.detail;
  const nested = detail && typeof detail === "object" ? (detail as Record<string, unknown>) : {};
  return (
    textOf(record.message) ??
    textOf(detail) ??
    textOf(nested.message) ??
    textOf(nested.error) ??
    textOf(record.error) ??
    fallback
  );
}

async function buildInit(
  config: RestApiConfig,
  method: HttpMethod,
  target: string,
  body: unknown,
  extraHeaders: Record<string, string>,
  baseHeaders: Record<string, string>,
): Promise<RequestInit> {
  const headers = new Headers(baseHeaders);
  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (config.encode) {
      const encoded = await config.encode(body, { method, target });
      payload = encoded.body;
      for (const [name, value] of Object.entries(encoded.headers ?? {})) headers.set(name, value);
    } else {
      headers.set("Content-Type", "application/json");
      payload = JSON.stringify(body);
    }
  }
  for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  return { method, headers, body: payload, credentials: config.credentials ?? "same-origin" };
}

export async function sendRequest(
  config: RestApiConfig,
  method: HttpMethod,
  target: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const url = joinUrl(config.baseUrl ?? "", target);
  const firstHeaders = config.getHeaders ? await config.getHeaders() : {};
  const response = await fetch(url, await buildInit(config, method, target, body, extraHeaders, firstHeaders));
  if (response.status !== 401 || !config.onUnauthorized || !(await config.onUnauthorized(firstHeaders))) return response;
  const retryHeaders = config.getHeaders ? await config.getHeaders() : {};
  return fetch(url, await buildInit(config, method, target, body, extraHeaders, retryHeaders));
}

export async function requestJson(
  config: RestApiConfig,
  method: HttpMethod,
  target: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<unknown> {
  const response = await sendRequest(config, method, target, body, extraHeaders);
  const raw = await readPayload(response);
  const payload = config.decode ? await config.decode(raw, response) : raw;
  if (!response.ok) throw new ApiError(errorMessageOf(payload, response.status), response.status, payload);
  return payload;
}
