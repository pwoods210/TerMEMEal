import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FaceGate from "./FaceGate";

describe("FaceGate", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
      callback();
      return 1;
    });
  });

  it("shows the disclaimer and focuses the entry button", () => {
    render(<FaceGate />);

    expect(
      screen.getByText(
        "Some token names and pictures may be inappropriate. Use with caution.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter TerMEMEal" })).toHaveFocus();
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });

  it("starts the dissolve and notifies the app when entered", () => {
    const onEnter = vi.fn();

    render(<FaceGate onEnter={onEnter} />);

    const gate = document.querySelector(".face-gate");
    fireEvent.click(screen.getByRole("button", { name: "Enter TerMEMEal" }));

    expect(onEnter).toHaveBeenCalledOnce();
    expect(gate).toHaveClass("face-gate--leaving");
    expect(gate).toHaveAttribute("aria-hidden", "true");
  });
});
