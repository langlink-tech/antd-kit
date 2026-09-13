import { describe, expect, it, vi } from "vitest";
import { interpretViewResult, RegistryLookupError, runPublishGate } from "../scripts/assert-publish.mjs";

const version = "0.4.0";
const localFingerprint = "abc";

describe("interpretViewResult", () => {
  it("treats a matching version as published", () => {
    expect(interpretViewResult({ status: 0, stdout: "0.4.0\n", version })).toEqual({ state: "published" });
  });

  it("treats E404 as unpublished", () => {
    expect(
      interpretViewResult({ status: 1, stderr: "npm ERR! code E404\nNo matching version found", version }),
    ).toEqual({ state: "unpublished" });
  });

  it("fails closed on 401", () => {
    expect(() => interpretViewResult({ status: 1, stderr: "npm ERR! code E401\n401 Unauthorized", version })).toThrow(
      RegistryLookupError,
    );
  });

  it("fails closed on network errors", () => {
    expect(() => interpretViewResult({ status: 1, stderr: "ETIMEDOUT registry.npmjs.org", version })).toThrow(
      /unavailable/,
    );
  });
});

describe("runPublishGate", () => {
  it("skips publish when the published fingerprint matches", () => {
    const publish = vi.fn();
    const result = runPublishGate({
      version,
      localFingerprint,
      checkOnly: false,
      view: () => ({ status: 0, stdout: version }),
      fetchFingerprint: () => localFingerprint,
      publish,
    });
    expect(result).toEqual({ action: "skip", reason: "matching-fingerprint" });
    expect(publish).not.toHaveBeenCalled();
  });

  it("fails when the published fingerprint differs", () => {
    const publish = vi.fn();
    expect(() =>
      runPublishGate({
        version,
        localFingerprint,
        checkOnly: false,
        view: () => ({ status: 0, stdout: version }),
        fetchFingerprint: () => "other",
        publish,
      }),
    ).toThrow(/different exports\/types\/provenance/);
    expect(publish).not.toHaveBeenCalled();
  });

  it("reports unpublished for check-only when the version is missing", () => {
    const publish = vi.fn();
    const result = runPublishGate({
      version,
      localFingerprint,
      checkOnly: true,
      view: () => ({ status: 1, stderr: "npm ERR! code E404" }),
      fetchFingerprint: vi.fn(),
      publish,
    });
    expect(result).toEqual({ action: "unpublished" });
    expect(publish).not.toHaveBeenCalled();
  });

  it("publishes then verifies the packed fingerprint", () => {
    const publish = vi.fn();
    let published = false;
    const result = runPublishGate({
      version,
      localFingerprint,
      checkOnly: false,
      view: () =>
        published ? { status: 0, stdout: version } : { status: 1, stderr: "npm ERR! code E404" },
      fetchFingerprint: () => localFingerprint,
      publish: () => {
        published = true;
        publish();
      },
    });
    expect(result).toEqual({ action: "published" });
    expect(publish).toHaveBeenCalledOnce();
  });

  it("does not publish on 401", () => {
    const publish = vi.fn();
    expect(() =>
      runPublishGate({
        version,
        localFingerprint,
        checkOnly: true,
        view: () => ({ status: 1, stderr: "npm ERR! code E401\n401 Unauthorized" }),
        fetchFingerprint: vi.fn(),
        publish,
      }),
    ).toThrow(/auth failed/);
    expect(publish).not.toHaveBeenCalled();
  });

  it("does not publish on network failure", () => {
    const publish = vi.fn();
    expect(() =>
      runPublishGate({
        version,
        localFingerprint,
        checkOnly: false,
        view: () => ({ status: 1, stderr: "ECONNRESET 502 Bad Gateway" }),
        fetchFingerprint: vi.fn(),
        publish,
      }),
    ).toThrow(/unavailable/);
    expect(publish).not.toHaveBeenCalled();
  });
});
