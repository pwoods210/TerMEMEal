import { useEffect, useRef, useState } from "react";

import logo from "../assets/turmemeal_icon.svg";

interface FaceGateProps {
  onEnter?: () => void;
}

function FaceGate({ onEnter }: FaceGateProps) {
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const scrollPageToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    };

    scrollPageToTop();
    const frameId = requestAnimationFrame(scrollPageToTop);
    enterButtonRef.current?.focus();

    return () => cancelAnimationFrame(frameId);
  }, []);

  function handleEnter() {
    // This click is the future user-gesture boundary for notification audio.
    enterButtonRef.current?.blur();
    onEnter?.();
    setIsLeaving(true);
  }

  return (
    <div
      className={`face-gate${isLeaving ? " face-gate--leaving" : ""}`}
      aria-hidden={isLeaving}
    >
      <div className="face-gate-panel">
        <img
          className="face-gate-logo"
          src={logo}
          alt=""
          aria-hidden="true"
        />
        <div className="face-gate-kicker">Welcome to TerMEMEal</div>
        <p className="face-gate-disclaimer">
          Some token names and pictures may be inappropriate. Use with
          caution.
        </p>
        <button
          ref={enterButtonRef}
          type="button"
          className="face-gate-enter"
          onClick={handleEnter}
          disabled={isLeaving}
        >
          Enter TerMEMEal
        </button>
      </div>
    </div>
  );
}

export default FaceGate;
