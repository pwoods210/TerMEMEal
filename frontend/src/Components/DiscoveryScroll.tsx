import { useEffect, useRef } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

interface DiscoveryScrollControlProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

const MAX_SCROLL_SPEED = 3000;
const KEYBOARD_SCROLL_DISTANCE = 300;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function DiscoveryScrollControl({
  scrollContainerRef,
}: DiscoveryScrollControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  const pointerIdRef = useRef<number | null>(null);

  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  const offsetRef = useRef(0);
  const maxOffsetRef = useRef(0);

  const animationFrameRef = useRef<number | null>(null);
  const previousFrameTimeRef = useRef<number | null>(null);

  function updateMaxOffset() {
    const track = trackRef.current;
    const handle = handleRef.current;

    if (!track || !handle) {
      return;
    }

    const trackWidth = track.getBoundingClientRect().width;
    const handleWidth = handle.getBoundingClientRect().width;

    maxOffsetRef.current =
      Math.max(0, (trackWidth - handleWidth) / 2 - 4);
  }

  function setHandleOffset(offset: number) {
    offsetRef.current = offset;

    handleRef.current?.style.setProperty(
      "--lever-offset",
      `${offset}px`,
    );
  }

  function stopAnimation() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    previousFrameTimeRef.current = null;
  }

  function animateScroll(currentTime: number) {
    if (pointerIdRef.current === null) {
      stopAnimation();
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    const maxOffset = maxOffsetRef.current;

    if (scrollContainer && maxOffset > 0) {
      const previousTime =
        previousFrameTimeRef.current ?? currentTime;

      const deltaSeconds =
        (currentTime - previousTime) / 1000;

      previousFrameTimeRef.current = currentTime;

      const normalizedOffset =
        offsetRef.current / maxOffset;

      // Quadratic response:
      // small lever movement = precise slow scrolling
      // large lever movement = much faster scrolling
      const scrollStrength =
        Math.sign(normalizedOffset) *
        normalizedOffset *
        normalizedOffset;

      const scrollVelocity =
        scrollStrength * MAX_SCROLL_SPEED;

      scrollContainer.scrollLeft +=
        scrollVelocity * deltaSeconds;
    }

    animationFrameRef.current =
      requestAnimationFrame(animateScroll);
  }

  function startAnimation() {
    if (animationFrameRef.current === null) {
      animationFrameRef.current =
        requestAnimationFrame(animateScroll);
    }
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    updateMaxOffset();

    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;

    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");

    startAnimation();
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    const pointerDistance =
      event.clientX - dragStartXRef.current;

    const requestedOffset =
      dragStartOffsetRef.current + pointerDistance;

    const clampedOffset = clamp(
      requestedOffset,
      -maxOffsetRef.current,
      maxOffsetRef.current,
    );

    setHandleOffset(clampedOffset);
  }

  function stopDragging(
    event?: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (pointerIdRef.current === null) {
      return;
    }

    if (
      event &&
      event.currentTarget.hasPointerCapture(
        pointerIdRef.current,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        pointerIdRef.current,
      );
    }

    pointerIdRef.current = null;

    stopAnimation();

    // Remove this first so the CSS transition animates
    // the handle back to the center position.
    handleRef.current?.classList.remove("is-dragging");

    setHandleOffset(0);
  }

  function handleKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      scrollContainer.scrollBy({
        left: -KEYBOARD_SCROLL_DISTANCE,
        behavior: "smooth",
      });
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      scrollContainer.scrollBy({
        left: KEYBOARD_SCROLL_DISTANCE,
        behavior: "smooth",
      });
    }

    if (event.key === "Home") {
      event.preventDefault();

      scrollContainer.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }

    if (event.key === "End") {
      event.preventDefault();

      scrollContainer.scrollTo({
        left: scrollContainer.scrollWidth,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    updateMaxOffset();

    window.addEventListener("resize", updateMaxOffset);

    return () => {
      window.removeEventListener(
        "resize",
        updateMaxOffset,
      );

      stopAnimation();
    };
  }, []);

  return (
    <div className="discovery-scroll-control">
      <div
        ref={trackRef}
        className="discovery-scroll-track"
      >
        <span
          className="discovery-scroll-direction discovery-scroll-left"
          aria-hidden="true"
        >
          ‹
        </span>

        <button
          ref={handleRef}
          type="button"
          className="discovery-scroll-handle"
          aria-label="Drag left or right to scroll discoveries"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onLostPointerCapture={stopDragging}
          onKeyDown={handleKeyDown}
        />

        <span
          className="discovery-scroll-direction discovery-scroll-right"
          aria-hidden="true"
        >
          ›
        </span>
      </div>
    </div>
  );
}

export default DiscoveryScrollControl;
