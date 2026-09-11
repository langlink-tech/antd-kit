import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  getReducedMotionSnapshot,
  getServerReducedMotionSnapshot,
  REDUCED_MOTION_QUERY,
  ReducedMotionProvider,
  subscribeReducedMotion,
  useReducedMotion,
} from "../src/motion.js";

function createMediaQuery(matches: boolean, mode: "modern" | "legacy" = "modern") {
  let changeListener: (() => void) | undefined;
  const query = {
    matches,
    addEventListener: vi.fn((_type: string, listener: () => void) => {
      changeListener = listener;
    }),
    removeEventListener: vi.fn((_type: string, listener: () => void) => {
      if (changeListener === listener) {
        changeListener = undefined;
      }
    }),
    addListener: vi.fn((listener: () => void) => {
      changeListener = listener;
    }),
    removeListener: vi.fn((listener: () => void) => {
      if (changeListener === listener) {
        changeListener = undefined;
      }
    }),
  } as unknown as MediaQueryList;

  if (mode === "legacy") {
    (query as { addEventListener?: unknown }).addEventListener = undefined;
    (query as { removeEventListener?: unknown }).removeEventListener = undefined;
  }

  return { query, notify: () => changeListener?.() };
}

function Probe() {
  const reduceMotion = useReducedMotion();
  return <span>{reduceMotion ? "reduced" : "full"}</span>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("motion", () => {
  it("uses a conservative snapshot when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(getServerReducedMotionSnapshot()).toBe(true);
    expect(getReducedMotionSnapshot()).toBe(true);
  });

  it("reads the system reduced-motion preference", () => {
    const media = createMediaQuery(false);
    const matchMedia = vi.fn(() => media.query);
    vi.stubGlobal("matchMedia", matchMedia);
    expect(getReducedMotionSnapshot()).toBe(false);
    expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
  });

  it("subscribes with addEventListener and removes the listener", () => {
    const media = createMediaQuery(true);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => media.query),
    );
    const onChange = vi.fn();
    const unsubscribe = subscribeReducedMotion(onChange);
    media.notify();
    unsubscribe();
    media.notify();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(media.query.addEventListener).toHaveBeenCalledWith("change", onChange);
    expect(media.query.removeEventListener).toHaveBeenCalledWith("change", onChange);
  });

  it("falls back to addListener when addEventListener is missing", () => {
    const media = createMediaQuery(true, "legacy");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => media.query),
    );
    const onChange = vi.fn();
    const unsubscribe = subscribeReducedMotion(onChange);
    media.notify();
    unsubscribe();
    media.notify();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(media.query.addListener).toHaveBeenCalledWith(onChange);
    expect(media.query.removeListener).toHaveBeenCalledWith(onChange);
  });

  it("exposes host override through ReducedMotionProvider", () => {
    render(
      <ReducedMotionProvider reduceMotion>
        <Probe />
      </ReducedMotionProvider>,
    );
    expect(screen.getByText("reduced")).toBeTruthy();
    render(
      <ReducedMotionProvider reduceMotion={false}>
        <Probe />
      </ReducedMotionProvider>,
    );
    expect(screen.getByText("full")).toBeTruthy();
  });
});
