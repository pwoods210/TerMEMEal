import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DiscoveredToken } from "../Common/types";
import TokenCard from "./TokenCard";

const token: DiscoveredToken = {
  id: 1,
  name: "Example Token",
  symbol: "EXAMPLE",
  tokenAddress: "1234567890abcdefghijklmnopqrstuvwxyz",
  pairAddress: "pair-123",
  source: "DexScreener",
  exchange: "pumpswap",
  discoveredAt: "2026-08-31T12:34:00Z",
  status: "watching",
  graduatedAt: null,
  tokenProfile: {
    chainId: "solana",
    tokenAddress: "1234567890abcdefghijklmnopqrstuvwxyz",
  },
  pairs: [],
};

describe("TokenCard", () => {
  it("renders token identity, address, source, time, and status", () => {
    render(<TokenCard token={token} />);

    expect(screen.getByText("Example Token")).toBeInTheDocument();
    expect(screen.getByText("$EXAMPLE")).toBeInTheDocument();
    expect(screen.getByTitle(token.tokenAddress)).toHaveTextContent(
      "1234567...tuvwxyz",
    );
    expect(screen.getByText("pumpswap")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark Example Token as watching" }))
      .toHaveTextContent("new");
    expect(screen.getByText("5m")).toBeInTheDocument();
  });

  it("uses the first symbol letter as the token emblem", () => {
    render(<TokenCard token={token} />);

    const emblem = document.querySelector(".token-icon");

    expect(emblem).toHaveTextContent("E");
  });

  it("uses the profile icon when one is available", () => {
    render(
      <TokenCard
        token={{
          ...token,
          tokenProfile: {
            ...token.tokenProfile,
            icon: "https://example.com/profile-icon.png",
          },
        }}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/profile-icon.png",
    );
    expect(document.querySelector(".token-icon")).not.toHaveTextContent("E");
  });

  it("uses a pair image when the profile has no icon", () => {
    render(
      <TokenCard
        token={{
          ...token,
          pairs: [
            {
              info: {
                imageUrl: "https://example.com/pair-icon.png",
              },
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/pair-icon.png",
    );
  });

  it("falls back to the symbol letter when the image fails", () => {
    render(
      <TokenCard
        token={{
          ...token,
          tokenProfile: {
            ...token.tokenProfile,
            icon: "https://example.com/missing-icon.png",
          },
        }}
      />,
    );

    fireEvent.error(screen.getByRole("img"));

    expect(document.querySelector(".token-icon")).toHaveTextContent("E");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("cycles the badge from new to watching to seen", () => {
    render(<TokenCard token={token} />);

    const badge = screen.getByRole("button", {
      name: "Mark Example Token as watching",
    });

    fireEvent.click(badge);
    expect(badge).toHaveTextContent("watching");
    expect(badge).toHaveClass("token-status-button--watching");

    fireEvent.click(badge);
    expect(badge).toHaveTextContent("seen");
    expect(badge).not.toHaveClass("token-status-button--watching");
  });

  it("shows the positive five-minute price change in green", () => {
    render(
      <TokenCard
        token={{
          ...token,
          pairs: [
            {
              pairAddress: "pair-123",
              priceChange: { m5: 12.345 },
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("+12.35%")).toHaveClass(
      "token-price-change--positive",
    );
  });

  it("shows the negative five-minute price change in red", () => {
    render(
      <TokenCard
        token={{
          ...token,
          pairs: [
            {
              pairAddress: "pair-123",
              priceChange: { m5: -4.5 },
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("-4.50%")).toHaveClass(
      "token-price-change--negative",
    );
  });
});
