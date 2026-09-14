"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, Spin } from "antd";
import type { PivotSheet, S2DataConfig, S2Options, ThemeCfg } from "@antv/s2";

export interface AnalysisSheetProps {
  dataCfg: S2DataConfig;
  options: S2Options;
  label: string;
  loading?: boolean;
  /** Canvas cannot expose table semantics; always provide an equivalent accessible view. */
  accessibleFallback: ReactNode;
  themeCfg?: ThemeCfg;
  /** Resolve official engine constants without forcing an eager S2 import in the host. */
  resolveOptions?: (engine: typeof import("@antv/s2")) => Omit<Partial<S2Options>, "width" | "height">;
  configure?: (sheet: PivotSheet, engine: typeof import("@antv/s2")) => void;
  onError?: (error: unknown) => void;
}

/** Official PivotSheet lifecycle, dynamically loaded and cleaned up on every update. */
export function AnalysisSheet({ dataCfg, options, label, accessibleFallback, loading, themeCfg, configure, resolveOptions, onError }: AnalysisSheetProps) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    let sheet: PivotSheet | undefined;
    let observer: ResizeObserver | undefined;
    let rendering = false;
    let pendingWidth: number | undefined;
    const report = (reason: unknown) => {
      if (cancelled) return;
      setError(reason instanceof Error ? reason.message : String(reason));
      onError?.(reason);
    };
    async function resize(width: number) {
      pendingWidth = width;
      if (rendering) return;
      rendering = true;
      try {
        while (!cancelled && sheet && !sheet.destroyed && pendingWidth !== undefined) {
          const nextWidth = pendingWidth;
          pendingWidth = undefined;
          sheet.changeSheetSize(nextWidth, options.height);
          await sheet.render();
        }
      } catch (reason) { report(reason); }
      finally { rendering = false; }
    }
    setError(undefined);
    void import("@antv/s2").then(async (engine) => {
      const { PivotSheet: Sheet } = engine;
      if (cancelled || !host.current) return;
      sheet = new Sheet(host.current, dataCfg, { ...options, ...resolveOptions?.(engine), height: options.height, width: host.current.clientWidth || options.width });
      if (themeCfg) sheet.setThemeCfg(themeCfg);
      configure?.(sheet, engine);
      await sheet.render();
      if (cancelled || !host.current) return;
      observer = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect.width;
        if (width && width > 0) void resize(width);
      });
      observer.observe(host.current);
    }).catch(report);
    return () => { cancelled = true; observer?.disconnect(); sheet?.destroy(); };
  }, [dataCfg, options, themeCfg, configure, resolveOptions, onError]);
  return <section aria-label={label}>
    {error ? <Alert type="error" title={error} /> : null}
    <Spin spinning={loading ?? false} aria-label={label}><div ref={host} role="img" aria-label={label} style={{ height: options.height }} /></Spin>
    {accessibleFallback}
  </section>;
}
