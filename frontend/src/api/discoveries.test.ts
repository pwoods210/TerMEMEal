import { afterEach, describe, expect, it, vi } from "vitest";

import { dismissDiscovery, fetchDiscoveries } from "./discoveries";

const token = {
  id: 1,
  name: "Example Token",
  symbol: "EXAMPLE",
  tokenAddress: "token-123",
  pairAddress: "pair-123",
  source: "DexScreener",
  exchange: "pumpswap",
  discoveredAt: "2026-08-31T00:00:00Z",
  status: "new" as const,
  graduatedAt: null,
  tokenProfile: {
    chainId: "solana",
    tokenAddress: "token-123",
  },
  pairs: [],
};

describe("fetchDiscoveries", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns discoveries from a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [token],
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchDiscoveries()).resolves.toEqual([token]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/discoveries",
      { signal: undefined },
    );
  });

  it("throws when the discovery response is not successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(fetchDiscoveries()).rejects.toThrow(
      "Discovery request failed with status 503",
    );
  });

  it("dismisses a discovery", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(dismissDiscovery(42)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/discoveries/42/dismiss",
      { method: "POST" },
    );
  });

  it("throws when dismissing a discovery fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(dismissDiscovery(42)).rejects.toThrow(
      "Dismiss request failed with status 404",
    );
  });
});
