export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestContext = {
  method: HttpMethod;
  target: string;
  body?: unknown;
};

export type ResponseReader = (payload: unknown, response: Response) => Promise<unknown>;

export type PreparedRequest = {
  body?: BodyInit;
  headers?: Record<string, string>;
  readResponse?: ResponseReader;
};

export type RestApiConfig = {
  baseUrl?: string;
  credentials?: RequestCredentials;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  onUnauthorized?: (requestHeaders: Record<string, string>) => Promise<boolean>;
  prepare?: (request: RequestContext) => Promise<PreparedRequest | undefined>;
};

export type SentRequest = {
  response: Response;
  readResponse?: ResponseReader;
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

type BuiltRequest = {
  init: RequestInit;
  readResponse?: ResponseReader;
};

async function buildRequest(
  config: RestApiConfig,
  context: RequestContext,
  extraHeaders: Record<string, string>,
  baseHeaders: Record<string, string>,
): Promise<BuiltRequest> {
  const headers = new Headers(baseHeaders);
  const prepared = config.prepare ? await config.prepare(context) : undefined;
  let payload: BodyInit | undefined = prepared?.body;
  if (payload === undefined && context.body !== undefined && context.body !== null) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(context.body);
  }
  for (const [name, value] of Object.entries(prepared?.headers ?? {})) headers.set(name, value);
  for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  return {
    init: { method: context.method, headers, body: payload, credentials: config.credentials ?? "same-origin" },
    readResponse: prepared?.readResponse,
  };
}

export async function sendRequest(
  config: RestApiConfig,
  method: HttpMethod,
  target: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<SentRequest> {
  const url = joinUrl(config.baseUrl ?? "", target);
  const context: RequestContext = { method, target, body };
  const firstHeaders = config.getHeaders ? await config.getHeaders() : {};
  const first = await buildRequest(config, context, extraHeaders, firstHeaders);
  const response = await fetch(url, first.init);
  if (response.status !== 401 || !config.onUnauthorized || !(await config.onUnauthorized(firstHeaders))) {
    return { response, readResponse: first.readResponse };
  }
  const retryHeaders = config.getHeaders ? await config.getHeaders() : {};
  const retry = await buildRequest(config, context, extraHeaders, retryHeaders);
  return { response: await fetch(url, retry.init), readResponse: retry.readResponse };
}

export async function readResult({ response, readResponse }: SentRequest): Promise<unknown> {
  const raw = await readPayload(response);
  const payload = readResponse ? await readResponse(raw, response) : raw;
  if (!response.ok) throw new ApiError(errorMessageOf(payload, response.status), response.status, payload);
  return payload;
}

export async function requestJson(
  config: RestApiConfig,
  method: HttpMethod,
  target: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<unknown> {
  return readResult(await sendRequest(config, method, target, body, extraHeaders));
}
