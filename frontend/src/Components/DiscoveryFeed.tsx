import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { dismissDiscovery, fetchDiscoveries } from "../api/discoveries";
import DiscoveryScrollControl from "./DiscoveryScroll";
import TokenCard from "./TokenCard";

const DISMISS_ANIMATION_DURATION_MS = 260;
const CARD_REFLOW_DURATION_MS = 320;
const REPLACEMENT_ANIMATION_DURATION_MS = 420;
const DISCOVERY_SCROLL_POSITION_KEY = "termemeal.discovery-scroll-left";


export default function DiscoveryFeed() {
  const feedRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [dismissingTokenId, setDismissingTokenId] = useState<number | null>(
    null,
  );
  const [enteringTokenIds, setEnteringTokenIds] = useState<Set<number>>(
    new Set(),
  );
  const [isReflowing, setIsReflowing] = useState(false);
  const [refreshAnimationId, setRefreshAnimationId] = useState(0);

  const dismissalTimerRef = useRef<number | null>(null);
  const enteringTimerRef = useRef<number | null>(null);
  const reflowFrameRef = useRef<number | null>(null);
  const reflowCleanupTimerRef = useRef<number | null>(null);
  const slotRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const replacementStartPositionsRef = useRef<Map<number, number> | null>(
    null,
  );
  const previousTokenIdsRef = useRef<Set<number> | null>(null);
  const animateReplacementRef = useRef(false);
  const dismissalWasAtNewestRef = useRef(false);
  const wasFetchingRef = useRef(false);
  const hasLoadedDiscoveriesRef = useRef(false);

  // Remembers whether the user is currently following the newest discoveries.
  const isAtNewestRef = useRef(true);
  const hasRestoredScrollRef = useRef(false);

  // Lets us distinguish a new token being added from a normal query refetch.
  const previousTokenCountRef = useRef(0);

  const {
    data: tokens = [],
    isPending,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["discoveries"],
    queryFn: ({ signal }) => fetchDiscoveries(signal),
    refetchInterval: 5000,
  });

  const dismissMutation = useMutation({
    mutationFn: dismissDiscovery,
    onSuccess: () => {
      animateReplacementRef.current = true;

      dismissalTimerRef.current = window.setTimeout(() => {
        replacementStartPositionsRef.current = new Map(
          [...slotRefs.current.entries()].map(([tokenId, slot]) => [
            tokenId,
            slot.querySelector<HTMLElement>(".discovery-card")
              ?.getBoundingClientRect().left ??
              slot.getBoundingClientRect().left,
          ]),
        );

        void queryClient.invalidateQueries({
          queryKey: ["discoveries"],
        });
        dismissalTimerRef.current = null;
      }, DISMISS_ANIMATION_DURATION_MS);
    },
    onError: () => {
      animateReplacementRef.current = false;
      dismissalWasAtNewestRef.current = false;
      setDismissingTokenId(null);
    },
  });

  function handleDismiss(tokenId: number) {
    if (
      dismissingTokenId !== null ||
      isReflowing ||
      enteringTokenIds.size > 0
    ) {
      return;
    }

    setDismissingTokenId(tokenId);
    dismissalWasAtNewestRef.current = isAtNewestRef.current;
    dismissMutation.mutate(tokenId);
  }


  function handleFeedScroll() {
    const feed = feedRef.current;

    if (!feed) {
      return;
    }

    const distanceFromRight =
      feed.scrollWidth -
      feed.clientWidth -
      feed.scrollLeft;

    // Small tolerance avoids issues caused by fractional pixel positions.
    isAtNewestRef.current = distanceFromRight <= 8;

    window.localStorage.setItem(
      DISCOVERY_SCROLL_POSITION_KEY,
      String(feed.scrollLeft),
    );
  }


  useEffect(() => {
    if (
      isFetching &&
      !wasFetchingRef.current &&
      hasLoadedDiscoveriesRef.current
    ) {
      setRefreshAnimationId((animationId) => animationId + 1);
    }

    wasFetchingRef.current = isFetching;

    if (!isPending) {
      hasLoadedDiscoveriesRef.current = true;
    }
  }, [isFetching, isPending]);

  useEffect(() => {
    const previousCount = previousTokenCountRef.current;
    const hasNewToken = tokens.length > previousCount;

    if (!hasRestoredScrollRef.current && tokens.length > 0) {
      hasRestoredScrollRef.current = true;
      previousTokenCountRef.current = tokens.length;

      requestAnimationFrame(() => {
        const feed = feedRef.current;

        if (!feed) {
          return;
        }

        const savedScrollLeft = Number.parseFloat(
          window.localStorage.getItem(DISCOVERY_SCROLL_POSITION_KEY) ?? "",
        );
        const maxScrollLeft = feed.scrollWidth - feed.clientWidth;

        if (Number.isFinite(savedScrollLeft)) {
          const restoredScrollLeft = Math.min(
            Math.max(0, savedScrollLeft),
            maxScrollLeft,
          );

          feed.scrollTo({
            left: restoredScrollLeft,
            behavior: "auto",
          });

          isAtNewestRef.current =
            maxScrollLeft - restoredScrollLeft <= 8;
          return;
        }

        feed.scrollTo({
          left: feed.scrollWidth,
          behavior: "smooth",
        });
        isAtNewestRef.current = true;
      });

      return;
    }

    if (
      hasNewToken &&
      isAtNewestRef.current &&
      !animateReplacementRef.current
    ) {
      requestAnimationFrame(() => {
        const feed = feedRef.current;

        if (!feed) {
          return;
        }

        feed.scrollTo({
          left: feed.scrollWidth,
          behavior: "smooth",
        });
      });
    }

    previousTokenCountRef.current = tokens.length;
  }, [tokens.length]);

  useLayoutEffect(() => {
    const startPositions = replacementStartPositionsRef.current;

    if (!startPositions) {
      return;
    }

    replacementStartPositionsRef.current = null;
    const shouldAutoscroll = dismissalWasAtNewestRef.current;

    const movedCards: HTMLElement[] = [];

    for (const [tokenId, startLeft] of startPositions) {
      const slot = slotRefs.current.get(tokenId);
      const card = slot?.querySelector<HTMLElement>(".discovery-card");

      if (!card) {
        continue;
      }

      const offset = card.getBoundingClientRect().left - startLeft;

      if (Math.abs(offset) < 1) {
        continue;
      }

      card.style.transition = "none";
      card.style.transform = `translateX(${-offset}px)`;
      movedCards.push(card);
    }

    if (movedCards.length > 0) {
      setIsReflowing(true);
      reflowFrameRef.current = requestAnimationFrame(() => {
        for (const card of movedCards) {
          card.style.transition = `transform ${CARD_REFLOW_DURATION_MS}ms ease`;
          card.style.transform = "translateX(0)";
        }

        reflowFrameRef.current = null;
        reflowCleanupTimerRef.current = window.setTimeout(() => {
          for (const card of movedCards) {
            card.style.removeProperty("transition");
            card.style.removeProperty("transform");
          }

          if (shouldAutoscroll) {
            const feed = feedRef.current;

            if (feed) {
              feed.scrollTo({
                left: feed.scrollWidth,
                behavior: "smooth",
              });
            }
          }

          setIsReflowing(false);
          reflowCleanupTimerRef.current = null;
        }, CARD_REFLOW_DURATION_MS);
      });
    } else if (shouldAutoscroll) {
      requestAnimationFrame(() => {
        const feed = feedRef.current;

        if (feed) {
          feed.scrollTo({
            left: feed.scrollWidth,
            behavior: "smooth",
          });
        }
      });
    }
  }, [tokens]);

  useEffect(() => {
    const currentTokenIds = new Set(tokens.map((token) => token.id));
    const previousTokenIds = previousTokenIdsRef.current;

    if (previousTokenIds && animateReplacementRef.current) {
      const addedTokenIds = [...currentTokenIds].filter(
        (tokenId) => !previousTokenIds.has(tokenId),
      );

      if (addedTokenIds.length > 0) {
        setEnteringTokenIds(new Set(addedTokenIds));
        animateReplacementRef.current = false;

        if (enteringTimerRef.current !== null) {
          window.clearTimeout(enteringTimerRef.current);
        }

        enteringTimerRef.current = window.setTimeout(() => {
          setEnteringTokenIds(new Set());
          enteringTimerRef.current = null;
        }, CARD_REFLOW_DURATION_MS + REPLACEMENT_ANIMATION_DURATION_MS);
      } else if (
        dismissingTokenId !== null &&
        !currentTokenIds.has(dismissingTokenId)
      ) {
        // There was no older token available to replace the dismissal.
        animateReplacementRef.current = false;
      }
    }

    previousTokenIdsRef.current = currentTokenIds;

    if (
      dismissingTokenId !== null &&
      !currentTokenIds.has(dismissingTokenId)
    ) {
      dismissalWasAtNewestRef.current = false;
      setDismissingTokenId(null);
    }
  }, [dismissingTokenId, tokens]);

  useEffect(() => {
    return () => {
      if (dismissalTimerRef.current !== null) {
        window.clearTimeout(dismissalTimerRef.current);
      }

      if (enteringTimerRef.current !== null) {
        window.clearTimeout(enteringTimerRef.current);
      }

      if (reflowFrameRef.current !== null) {
        cancelAnimationFrame(reflowFrameRef.current);
      }

      if (reflowCleanupTimerRef.current !== null) {
        window.clearTimeout(reflowCleanupTimerRef.current);
      }

    };
  }, []);


  return (
    <section className="discovery-feed">
      <div className="discovery-feed-header">
        <div>
          <div className="discovery-feed-label">
            Live Discovery
          </div>

          <h2 className="discovery-feed-title">
          </h2>
        </div>

        {!isPending && refreshAnimationId > 0 && (
          <span
            className="discovery-feed-refresh"
            key={refreshAnimationId}
            aria-hidden="true"
            title="Refreshing discoveries"
          >
            ↻
          </span>
        )}
      </div>

      {dismissMutation.isError && (
        <div className="alert alert-danger mb-3">
          {dismissMutation.error instanceof Error
            ? dismissMutation.error.message
            : "Failed to dismiss token."}
        </div>
      )}


      {isPending && (
        <div className="text-body-secondary">
          Loading discoveries...
        </div>
      )}


      {isError && (
        <div className="alert alert-danger mb-0">
          {error instanceof Error
            ? error.message
            : "Failed to load discoveries."}
        </div>
      )}


      {!isPending && !isError && tokens.length === 0 && (
        <div className="text-body-secondary">
          Waiting for token discoveries...
        </div>
      )}


      {!isPending && !isError && tokens.length > 0 && (
        <>
          <div className="discovery-feed-viewport">
            <div
              ref={feedRef}
              className="discovery-feed-content"
              onScroll={handleFeedScroll}
            >
              {[...tokens].reverse().map((token) => (
                <div
                  key={token.id}
                  ref={(slot) => {
                    if (slot) {
                      slotRefs.current.set(token.id, slot);
                    } else {
                      slotRefs.current.delete(token.id);
                    }
                  }}
                  className="discovery-card-slot"
                >
                  <TokenCard
                    token={token}
                    onDismiss={() => handleDismiss(token.id)}
                    isDismissing={dismissingTokenId === token.id}
                    isDismissDisabled={
                      isReflowing || enteringTokenIds.size > 0
                    }
                    isEntering={enteringTokenIds.has(token.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {tokens.length > 1 && (
            <DiscoveryScrollControl
              scrollContainerRef={feedRef}
            />
          )}
        </>
      )}
    </section>
  );
}
