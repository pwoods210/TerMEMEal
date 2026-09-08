import { useState } from "react";

import type {
  DiscoveredToken,
} from "../Common/types";

interface TokenCardProps {
  token: DiscoveredToken;
  onDismiss?: () => void;
  isDismissing?: boolean;
  isDismissDisabled?: boolean;
  isEntering?: boolean;
}

type CardBadgeStatus = "new" | "watching" | "seen";

const badgeStatusClasses: Record<CardBadgeStatus, string> = {
  new: "text-bg-success",
  watching: "text-bg-warning",
  seen: "text-bg-primary",
};

const nextBadgeStatus: Record<CardBadgeStatus, CardBadgeStatus> = {
  new: "watching",
  watching: "seen",
  seen: "new",
};

function shortenAddress(address: string) {
  return `${address.slice(0, 7)}...${address.slice(-7)}`;
}

function getTokenImageUrl(token: DiscoveredToken) {
  const profileIcon = token.tokenProfile.icon?.trim();

  if (profileIcon) {
    return profileIcon;
  }

  return token.pairs.find((pair) => pair.info?.imageUrl)?.info?.imageUrl;
}

function getFiveMinuteChange(token: DiscoveredToken) {
  const pair =
    token.pairs.find((candidate) =>
      candidate.pairAddress === token.pairAddress,
    ) ?? token.pairs[0];

  return pair?.priceChange?.m5;
}

function formatPercentage(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function TokenCard({
  token,
  onDismiss,
  isDismissing = false,
  isDismissDisabled = false,
  isEntering = false,
}: TokenCardProps) {
  const imageUrl = getTokenImageUrl(token);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [badgeStatus, setBadgeStatus] = useState<CardBadgeStatus>("new");
  const imageSrc = imageUrl && imageUrl !== failedImageUrl ? imageUrl : null;
  const dexName = token.exchange ?? token.source;
  const fiveMinuteChange = getFiveMinuteChange(token);
  const fiveMinuteChangeClass =
    fiveMinuteChange === undefined || !Number.isFinite(fiveMinuteChange)
      ? "token-price-change--neutral"
      : fiveMinuteChange > 0
        ? "token-price-change--positive"
        : fiveMinuteChange < 0
          ? "token-price-change--negative"
          : "token-price-change--neutral";
  const discoveredTime = new Date(token.discoveredAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article
      className={`discovery-card${
        isDismissing ? " discovery-card--dismissing" : ""
      }${isEntering ? " discovery-card--entering" : ""}`}
    >
      <div className="discovery-card-header">
        <div className="token-identity">
          <div className="token-icon" aria-hidden={imageSrc ? undefined : true}>
            {imageSrc ? (
              <img
                className="token-icon-image"
                src={imageSrc}
                alt={`${token.name} icon`}
                onError={() => setFailedImageUrl(imageSrc)}
              />
            ) : (
              token.symbol.slice(0, 1)
            )}
          </div>
          <div className="token-copy">
            <div className="token-name">{token.name}</div>
            <div className="token-symbol">${token.symbol}</div>
          </div>
        </div>
        <div className="token-card-actions">
          <button
            type="button"
            className={`badge rounded-pill token-status-button ${
              badgeStatusClasses[badgeStatus]
            }${badgeStatus === "watching" ? " token-status-button--watching" : ""}`}
            aria-label={`Mark ${token.name} as ${
              nextBadgeStatus[badgeStatus]
            }`}
            title={`Mark as ${nextBadgeStatus[badgeStatus]}`}
            onClick={() => setBadgeStatus(nextBadgeStatus[badgeStatus])}
          >
            {badgeStatus}
          </button>
          {onDismiss ? (
            <button
              type="button"
              className="token-dismiss-button"
              aria-label={`Dismiss ${token.name}`}
              onClick={onDismiss}
              disabled={isDismissing || isDismissDisabled}
            >
              {isDismissing ? "…" : "×"}
            </button>
          ) : null}
        </div>
      </div>
      <div className="token-address-row">
        <span className="token-detail-label">Token address</span>
        <code title={token.tokenAddress}>
          {shortenAddress(token.tokenAddress)}
        </code>
      </div>
      <div className="discovery-card-details">
        <div>
          <span className="token-detail-label">DEX</span>
          <span>{dexName}</span>
        </div>
        <div>
          <span className="token-detail-label">Discovered</span>
          <span>{discoveredTime}</span>
        </div>
        <div>
          <span className="token-detail-label">5m</span>
          <span className={`token-price-change ${fiveMinuteChangeClass}`}>
            {formatPercentage(fiveMinuteChange)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default TokenCard;
