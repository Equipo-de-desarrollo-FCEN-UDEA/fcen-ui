import { useCallback, useEffect, useRef, useState } from "react";
import { joinUrl, readResult, requestJson, sendRequest, type HttpMethod } from "./http";
import { useRestApiConfig } from "./RestApiProvider";

export type RequestRecord<TAnnotation = unknown> = {
  annotation?: TAnnotation;
  requestMethod: HttpMethod;
  requestBody?: unknown;
  target: string;
  response: unknown;
  error?: unknown;
};

export type RestApiOptions = {
  manual?: boolean;
};

export type RequestOptions = {
  headers?: Record<string, string>;
  annotation?: unknown;
};

export type UseRestApiResult<TResponse, TError = string> = {
  data: TResponse | null;
  error: TError | null;
  loading: boolean;
  loadingRequests: boolean;
  refetch: () => Promise<TResponse | null>;
  doGet: <T = unknown>(target?: string, options?: RequestOptions) => Promise<T>;
  doPost: <T = unknown>(body: unknown, annotation?: unknown) => Promise<T>;
  doPostPath: <T = unknown>(target: string, body: unknown, options?: RequestOptions) => Promise<T>;
  doPut: <T = unknown>(id: string, body: unknown, annotation?: unknown) => Promise<T>;
  doPutData: <T = unknown>(body: unknown, annotation?: unknown) => Promise<T>;
  doPatch: <T = unknown>(id: string, body: unknown, annotation?: unknown) => Promise<T>;
  doPatchBatch: <T = unknown>(body: unknown, annotation?: unknown) => Promise<T>;
  doDelete: <T = unknown>(id: string, annotation?: unknown) => Promise<T>;
  doDeletePath: <T = unknown>(target: string, annotation?: unknown) => Promise<T>;
  doDeleteData: <T = unknown>(body: unknown, annotation?: unknown) => Promise<T>;
  doDownload: (target: string, filename: string) => Promise<void>;
  succeededRequests: RequestRecord[];
  failedRequests: RequestRecord[];
  clearSucceededRequests: () => void;
  clearFailedRequests: () => void;
};

const HISTORY_LIMIT = 50;

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Error";
}

function appendRecord(records: RequestRecord[], record: RequestRecord): RequestRecord[] {
  return [...records, record].slice(-HISTORY_LIMIT);
}

export function useRestApi<TResponse = unknown, TError = string>(
  url: string,
  options: RestApiOptions = {},
): UseRestApiResult<TResponse, TError> {
  const config = useRestApiConfig();
  const manual = options.manual ?? false;
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<TError | null>(null);
  const [loading, setLoading] = useState(!manual);
  const [pending, setPending] = useState(0);
  const [succeededRequests, setSucceededRequests] = useState<RequestRecord[]>([]);
  const [failedRequests, setFailedRequests] = useState<RequestRecord[]>([]);
  const latestFetch = useRef(0);

  const refetch = useCallback(async (): Promise<TResponse | null> => {
    const fetchId = ++latestFetch.current;
    setLoading(true);
    setError(null);
    try {
      const payload = (await requestJson(config, "GET", url)) as TResponse;
      if (latestFetch.current === fetchId) setData(payload);
      return payload;
    } catch (reason) {
      if (latestFetch.current === fetchId) setError(messageOf(reason) as TError);
      throw reason;
    } finally {
      if (latestFetch.current === fetchId) setLoading(false);
    }
  }, [config, url]);

  useEffect(() => {
    if (!manual) refetch().catch(() => null);
  }, [manual, refetch]);

  const run = useCallback(
    async <T>(method: HttpMethod, target: string, body: unknown, requestOptions: RequestOptions = {}): Promise<T> => {
      const record = { annotation: requestOptions.annotation, requestMethod: method, requestBody: body, target };
      setPending((count) => count + 1);
      setError(null);
      try {
        const response = (await requestJson(config, method, target, body, requestOptions.headers)) as T;
        setSucceededRequests((records) => appendRecord(records, { ...record, response }));
        if (!manual && method !== "GET") refetch().catch(() => null);
        return response;
      } catch (reason) {
        setError(messageOf(reason) as TError);
        setFailedRequests((records) => appendRecord(records, { ...record, response: null, error: reason }));
        throw reason;
      } finally {
        setPending((count) => count - 1);
      }
    },
    [config, manual, refetch],
  );

  const doDownload = useCallback(
    async (target: string, filename: string) => {
      setPending((count) => count + 1);
      try {
        const sent = await sendRequest(config, "GET", target);
        const { response } = sent;
        if (!response.ok) await readResult(sent);
        const objectUrl = URL.createObjectURL(await response.blob());
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      } finally {
        setPending((count) => count - 1);
      }
    },
    [config],
  );

  const item = (id: string) => joinUrl(url, id);

  return {
    data,
    error,
    loading,
    loadingRequests: pending > 0,
    refetch,
    doGet: (target = url, requestOptions) => run("GET", target, undefined, requestOptions),
    doPost: (body, annotation) => run("POST", url, body, { annotation }),
    doPostPath: (target, body, requestOptions) => run("POST", target, body, requestOptions),
    doPut: (id, body, annotation) => run("PUT", item(id), body, { annotation }),
    doPutData: (body, annotation) => run("PUT", url, body, { annotation }),
    doPatch: (id, body, annotation) => run("PATCH", item(id), body, { annotation }),
    doPatchBatch: (body, annotation) => run("PATCH", url, body, { annotation }),
    doDelete: (id, annotation) => run("DELETE", item(id), undefined, { annotation }),
    doDeletePath: (target, annotation) => run("DELETE", target, undefined, { annotation }),
    doDeleteData: (body, annotation) => run("DELETE", url, body, { annotation }),
    doDownload,
    succeededRequests,
    failedRequests,
    clearSucceededRequests: () => setSucceededRequests([]),
    clearFailedRequests: () => setFailedRequests([]),
  };
}
