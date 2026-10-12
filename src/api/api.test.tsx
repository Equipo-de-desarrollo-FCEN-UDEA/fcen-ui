import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ApiError, errorMessageOf, joinUrl, readPayload, requestJson, type RestApiConfig } from "./http";
import { RestApiProvider } from "./RestApiProvider";
import { useRestApi } from "./useRestApi";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function wrapperFor(config: RestApiConfig) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <RestApiProvider config={config}>{children}</RestApiProvider>;
  };
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("http helpers", () => {
  it("joins base and path without doubling slashes", () => {
    expect(joinUrl("https://api.test/", "/rooms")).toBe("https://api.test/rooms");
    expect(joinUrl("https://api.test", "rooms")).toBe("https://api.test/rooms");
    expect(joinUrl("", "/rooms")).toBe("/rooms");
    expect(joinUrl("https://api.test", "")).toBe("https://api.test");
    expect(joinUrl("https://api.test", "https://other.test/x")).toBe("https://other.test/x");
  });

  it("reads json, text, empty and broken payloads", async () => {
    expect(await readPayload(json({ ok: true }))).toEqual({ ok: true });
    expect(await readPayload(new Response(null, { status: 204 }))).toBeNull();
    expect(await readPayload(new Response(""))).toBeNull();
    expect(await readPayload(new Response("plain text"))).toBe("plain text");
    expect(await readPayload(new Response("{oops", { headers: { "content-type": "application/json" } }))).toBeNull();
  });

  it("finds the most useful error message", () => {
    expect(errorMessageOf(null, 500)).toBe("HTTP 500");
    expect(errorMessageOf(42, 500)).toBe("HTTP 500");
    expect(errorMessageOf("Falla", 500)).toBe("Falla");
    expect(errorMessageOf("  ", 500)).toBe("HTTP 500");
    expect(errorMessageOf({ message: "Mensaje" }, 400)).toBe("Mensaje");
    expect(errorMessageOf({ detail: "Sin permisos para crear aulas." }, 403)).toBe("Sin permisos para crear aulas.");
    expect(errorMessageOf({ detail: { message: "Anidado" } }, 422)).toBe("Anidado");
    expect(errorMessageOf({ detail: { error: "Código" } }, 422)).toBe("Código");
    expect(errorMessageOf({ error: "Error plano" }, 400)).toBe("Error plano");
    expect(errorMessageOf({ detail: [] }, 422)).toBe("HTTP 422");
  });

  it("throws an ApiError with status and detail", async () => {
    fetchMock.mockImplementation(async () => json({ detail: "No encontrada" }, 404));

    const failure = requestJson({ baseUrl: "https://api.test" }, "GET", "/rooms/1");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(requestJson({}, "GET", "/rooms/1")).rejects.toMatchObject({ status: 404, detail: { detail: "No encontrada" } });
  });

  it("sends json with the session headers and same-origin credentials", async () => {
    fetchMock.mockResolvedValue(json({ id: 1 }, 201));

    const result = await requestJson(
      { baseUrl: "https://api.test", getHeaders: () => ({ Authorization: "Bearer a" }) },
      "POST",
      "/rooms",
      { name: "6-321" },
      { "X-Device-Token": "device" },
    );

    expect(result).toEqual({ id: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(url).toBe("https://api.test/rooms");
    expect(init?.body).toBe(JSON.stringify({ name: "6-321" }));
    expect(init?.credentials).toBe("same-origin");
    expect(headers.get("Authorization")).toBe("Bearer a");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("X-Device-Token")).toBe("device");
  });

  it("lets each request prepare its own body, headers and response reader", async () => {
    fetchMock.mockImplementation(async () => json({ sealed: "abc" }, 401));
    const readResponse = vi.fn().mockResolvedValue({ detail: "Credenciales inválidas" });
    const prepare = vi.fn().mockResolvedValue({
      body: "cipher",
      headers: { "Content-Type": "text/plain", "X-Encrypted-Key": "wrapped" },
      readResponse,
    });

    const failure = requestJson({ prepare, credentials: "include" }, "POST", "/auth/login", { login: "x" });

    await expect(failure).rejects.toMatchObject({ status: 401, message: "Credenciales inválidas" });
    expect(prepare).toHaveBeenCalledWith({ method: "POST", target: "/auth/login", body: { login: "x" } });
    expect(readResponse).toHaveBeenCalledWith({ sealed: "abc" }, expect.any(Response));
    const init = fetchMock.mock.calls[0][1];
    expect(init?.body).toBe("cipher");
    expect((init?.headers as Headers).get("X-Encrypted-Key")).toBe("wrapped");
    expect((init?.headers as Headers).get("Content-Type")).toBe("text/plain");
    expect(init?.credentials).toBe("include");
  });

  it("keeps the json body when prepare only adds headers", async () => {
    fetchMock.mockImplementation(async () => json({ ok: true }));
    const prepare = vi.fn().mockResolvedValue({ headers: { "X-Encrypted-Key": "wrapped" } });

    await requestJson({ prepare }, "GET", "/auth/me");
    await requestJson({ prepare: async () => undefined }, "POST", "/rooms", { name: "a" });

    expect((fetchMock.mock.calls[0][1]?.headers as Headers).get("X-Encrypted-Key")).toBe("wrapped");
    expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined();
    expect(fetchMock.mock.calls[1][1]?.body).toBe(JSON.stringify({ name: "a" }));
  });

  it("prepares the retry again after a refresh", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ sealed: "second" }));
    let call = 0;
    const prepare = vi.fn(async () => {
      call += 1;
      const current = call;
      return { headers: { "X-Encrypted-Key": `key-${current}` }, readResponse: async () => ({ key: current }) };
    });

    const result = await requestJson({ prepare, onUnauthorized: async () => true }, "GET", "/auth/me");

    expect(result).toEqual({ key: 2 });
    expect((fetchMock.mock.calls[1][1]?.headers as Headers).get("X-Encrypted-Key")).toBe("key-2");
  });

  it("retries once after a successful refresh with the new headers", async () => {
    let token = "old";
    fetchMock.mockResolvedValueOnce(json({ detail: "Sesión vencida" }, 401)).mockResolvedValueOnce(json([1]));
    const onUnauthorized = vi.fn(async () => {
      token = "new";
      return true;
    });

    const result = await requestJson(
      { getHeaders: async () => ({ Authorization: `Bearer ${token}` }), onUnauthorized },
      "GET",
      "/rooms",
    );

    expect(result).toEqual([1]);
    expect(onUnauthorized).toHaveBeenCalledWith({ Authorization: "Bearer old" });
    expect((fetchMock.mock.calls[1][1]?.headers as Headers).get("Authorization")).toBe("Bearer new");
  });

  it("does not retry when the refresh fails or there is no refresh", async () => {
    fetchMock.mockImplementation(async () => json({ detail: "Sesión vencida" }, 401));

    await expect(requestJson({ onUnauthorized: async () => false }, "GET", "/rooms")).rejects.toMatchObject({ status: 401 });
    await expect(requestJson({}, "GET", "/rooms")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("useRestApi", () => {
  const wrapper = wrapperFor({ baseUrl: "https://api.test" });

  it("loads on mount and exposes the data", async () => {
    fetchMock.mockResolvedValue(json([{ id: "1" }]));

    const { result } = renderHook(() => useRestApi<{ id: string }[]>("/rooms"), { wrapper });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: "1" }]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/rooms");
  });

  it("keeps the error message when the load fails", async () => {
    fetchMock.mockResolvedValue(json({ detail: "Sin permisos para ver aulas." }, 403));

    const { result } = renderHook(() => useRestApi("/rooms"), { wrapper });

    await waitFor(() => expect(result.current.error).toBe("Sin permisos para ver aulas."));
    expect(result.current.data).toBeNull();
  });

  it("ignores a stale response when a newer refetch finished", async () => {
    let resolveFirst: (value: Response) => void = () => undefined;
    fetchMock
      .mockImplementationOnce(() => new Promise<Response>((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce(json("new"));
    const { result } = renderHook(() => useRestApi<string>("/rooms"), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });
    await act(async () => {
      resolveFirst(json("old"));
    });

    expect(result.current.data).toBe("new");
  });

  it("does not load in manual mode and runs every verb on the right path", async () => {
    fetchMock.mockImplementation(async () => json({ ok: true }));
    const { result } = renderHook(() => useRestApi("/rooms", { manual: true }), { wrapper });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.doGet();
      await result.current.doGet("/rooms/summary", { headers: { "X-Trace": "1" } });
      await result.current.doPost({ name: "a" }, "create");
      await result.current.doPostPath("/rooms/import", { rows: [] });
      await result.current.doPut("7", { name: "b" });
      await result.current.doPutData({ all: true });
      await result.current.doPatch("7", { name: "c" });
      await result.current.doPatchBatch([{ id: "7" }]);
      await result.current.doDelete("7");
      await result.current.doDeletePath("/rooms/archived");
      await result.current.doDeleteData({ ids: ["7"] });
    });

    const calls = fetchMock.mock.calls.map(([url, init]) => `${init?.method} ${url}`);
    expect(calls).toEqual([
      "GET https://api.test/rooms",
      "GET https://api.test/rooms/summary",
      "POST https://api.test/rooms",
      "POST https://api.test/rooms/import",
      "PUT https://api.test/rooms/7",
      "PUT https://api.test/rooms",
      "PATCH https://api.test/rooms/7",
      "PATCH https://api.test/rooms",
      "DELETE https://api.test/rooms/7",
      "DELETE https://api.test/rooms/archived",
      "DELETE https://api.test/rooms",
    ]);
    expect(result.current.succeededRequests).toHaveLength(11);
    expect(result.current.succeededRequests[2]).toMatchObject({ annotation: "create", requestMethod: "POST", requestBody: { name: "a" } });
    expect(result.current.loadingRequests).toBe(false);

    act(() => result.current.clearSucceededRequests());
    expect(result.current.succeededRequests).toHaveLength(0);
  });

  it("records failed requests, keeps the last fifty and clears them", async () => {
    fetchMock.mockImplementation(async () => json({ detail: "Aula repetida" }, 409));
    const { result } = renderHook(() => useRestApi("/rooms", { manual: true }), { wrapper });

    await act(async () => {
      for (let index = 0; index < 52; index += 1) {
        await result.current.doPost({ index }).catch(() => null);
      }
    });

    expect(result.current.error).toBe("Aula repetida");
    expect(result.current.failedRequests).toHaveLength(50);
    expect(result.current.failedRequests[0].requestBody).toEqual({ index: 2 });

    act(() => result.current.clearFailedRequests());
    expect(result.current.failedRequests).toHaveLength(0);
  });

  it("reloads after a mutation when not manual", async () => {
    fetchMock.mockImplementation(async () => json([]));
    const { result } = renderHook(() => useRestApi("/rooms"), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.doPost({ name: "a" });
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it("downloads a file and reports a failed download", async () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:file");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    fetchMock.mockResolvedValueOnce(new Response("a,b")).mockResolvedValueOnce(json({ detail: "Expiró" }, 410));
    const { result } = renderHook(() => useRestApi("/reports", { manual: true }), { wrapper });

    await act(async () => {
      await result.current.doDownload("/reports/1/file", "reporte.csv");
    });
    vi.runAllTimers();

    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:file");
    await expect(result.current.doDownload("/reports/2/file", "otro.csv")).rejects.toMatchObject({ status: 410 });
    vi.useRealTimers();
  });

  it("works without a provider", async () => {
    fetchMock.mockResolvedValue(json({ ok: true }));

    const { result } = renderHook(() => useRestApi("/health"));

    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(fetchMock.mock.calls[0][0]).toBe("/health");
  });

  it("reports a non Error rejection with a generic message", async () => {
    fetchMock.mockRejectedValue("offline");
    const { result } = renderHook(() => useRestApi("/rooms", { manual: true }), { wrapper });

    await act(async () => {
      await result.current.doPost({}).catch(() => null);
    });

    expect(result.current.error).toBe("Error");
  });
});
