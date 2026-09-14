import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ContentLoading, EmptyState, PageResult } from "../src/feedback.js";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
afterEach(cleanup);

describe("empty and loading surfaces", () => {
  it("keeps the next action with the empty description", () => {
    const retry = vi.fn();
    render(<EmptyState description="No rows" action={<button onClick={retry}>Create</button>} />);
    expect(screen.getByText("No rows")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("uses a skeleton on first load and keeps later content under spin", () => {
    const view = render(<ContentLoading loading firstLoad>Hidden</ContentLoading>);
    expect(screen.queryByText("Hidden")).toBeNull();
    view.rerender(<ContentLoading loading>Stale rows</ContentLoading>);
    expect(screen.getByText("Stale rows")).toBeTruthy();
    view.rerender(<ContentLoading>Ready</ContentLoading>);
    expect(screen.getByText("Ready")).toBeTruthy();
  });
});

it("renders a page-level result and keeps host extra actions", () => {
  render(<PageResult status="404" title="Missing" extra={<a href="/">Home</a>} />);
  expect(screen.getByText("Missing")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
});
