// AntD ActionButton re-rejects onConfirm errors. Account for those in an isolated
// process, never with a suite-wide Vitest filter. Identity and count must match.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
for (const name of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "ShadowRoot", "SVGElement", "MutationObserver"]) {
  Object.defineProperty(globalThis, name, { configurable: true, value: name === "window" ? dom.window : dom.window[name] });
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
const React = await import("react");
const { render, screen, fireEvent, waitFor, cleanup } = await import("@testing-library/react");
const { ConfirmAction } = await import(pathToFileURL(process.argv[2]).href);
const observed = [];
const onRejection = (reason) => observed.push(reason);
process.on("unhandledRejection", onRejection);
const settle = () => new Promise(resolve => setTimeout(resolve, 50));
try {
  for (const mode of ["sync", "async"]) {
    const expected = new Error(`expected ${mode} confirmation failure`);
    let calls = 0;
    const changes = [];
    render(React.createElement(ConfirmAction, {
      title: "Delete row?",
      onOpenChange: open => changes.push(open),
      onConfirm: () => {
        calls++;
        if (calls !== 1) return Promise.resolve();
        if (mode === "sync") throw expected;
        return Promise.reject(expected);
      },
    }, React.createElement("button", null, "Delete")));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: /^OK$/ }));
    await waitFor(() => assert.equal(observed.length, 1));
    await settle();
    assert.equal(observed.length, 1, "extra cleanup rejection");
    assert.equal(observed[0], expected, "unexpected rejection identity");
    assert.equal(calls, 1);
    assert.equal(changes.includes(false), false, "failure closed confirmation");
    fireEvent.click(screen.getByRole("button", { name: /^OK$/ }));
    await waitFor(() => assert.equal(calls, 2));
    await waitFor(() => assert.equal(changes.includes(false), true));
    await settle();
    assert.equal(observed.length, 1, "unexpected rejection after retry");
    observed.length = 0;
    cleanup();
  }
  if (process.argv.includes("--unexpected")) {
    void Promise.reject(new Error("injected unexpected failure"));
    await settle();
  }
  assert.equal(observed.length, 0, "unexpected rejection");
  console.log("sync and async rejection: exact accounting passed");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  cleanup();
  dom.window.close();
  process.removeListener("unhandledRejection", onRejection);
}
