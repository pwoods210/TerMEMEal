import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscoveredToken } from "../Common/types";
import { dismissDiscovery, fetchDiscoveries } from "../api/discoveries";
import DiscoveryFeed from "./DiscoveryFeed";

vi.mock("../api/discoveries", () => ({
  dismissDiscovery: vi.fn(),
  fetchDiscoveries: vi.fn(),
}));

const mockedFetchDiscoveries = vi.mocked(fetchDiscoveries);
const mockedDismissDiscovery = vi.mocked(dismissDiscovery);

const token: DiscoveredToken = {
  id: 1,
  name: "Example Token",
  symbol: "EXAMPLE",
  tokenAddress: "token-123",
  pairAddress: "pair-123",
  source: "DexScreener",
  exchange: "pumpswap",
  discoveredAt: "2026-08-31T12:34:00Z",
  status: "new",
  graduatedAt: null,
  tokenProfile: {
    chainId: "solana",
    tokenAddress: "token-123",
  },
  pairs: [],
};

function renderFeed() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DiscoveryFeed />
    </QueryClientProvider>,
  );
}

describe("DiscoveryFeed", () => {
  beforeEach(() => {
    mockedFetchDiscoveries.mockReset();
    mockedDismissDiscovery.mockReset();
  });

  it("shows a loading state while discoveries are pending", () => {
    mockedFetchDiscoveries.mockReturnValue(new Promise(() => {}));

    renderFeed();

    expect(screen.getByText("Loading discoveries...")).toBeInTheDocument();
  });

  it("shows an error when discovery loading fails", async () => {
    mockedFetchDiscoveries.mockRejectedValue(new Error("Network failure"));

    renderFeed();

    expect(await screen.findByText("Network failure")).toBeInTheDocument();
  });

  it("shows the empty state when there are no discoveries", async () => {
    mockedFetchDiscoveries.mockResolvedValue([]);

    renderFeed();

    expect(
      await screen.findByText("Waiting for token discoveries..."),
    ).toBeInTheDocument();
  });

  it("renders cards when discoveries are returned", async () => {
    mockedFetchDiscoveries.mockResolvedValue([token]);

    renderFeed();

    expect(await screen.findByText("Example Token")).toBeInTheDocument();
    expect(screen.getByText("$EXAMPLE")).toBeInTheDocument();
  });

  it("dismisses a token and invalidates the discovery query", async () => {
    mockedFetchDiscoveries
      .mockResolvedValueOnce([token])
      .mockResolvedValueOnce([
        {
          ...token,
          id: 2,
          name: "Older Token",
        },
      ]);
    mockedDismissDiscovery.mockResolvedValue();

    renderFeed();

    await screen.findByText("Example Token");
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss Example Token" }),
    );

    expect(
      document.querySelector(".discovery-card--dismissing"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedDismissDiscovery).toHaveBeenCalled();
    });
    expect(mockedDismissDiscovery.mock.calls[0][0]).toBe(1);
    await waitFor(() => {
      expect(screen.getByText("Older Token")).toBeInTheDocument();
    });
    expect(
      document.querySelector(".discovery-card--entering"),
    ).toBeInTheDocument();
  });
});
