import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Alert } from "antd";
/** Official PivotSheet lifecycle, dynamically loaded and cleaned up on every update. */
export function AnalysisSheet({ dataCfg, options, label, accessibleFallback, themeCfg, configure, onError }) {
    const host = useRef(null);
    const [error, setError] = useState();
    useEffect(() => {
        let cancelled = false;
        let sheet;
        let observer;
        let rendering = false;
        let pendingWidth;
        const report = (reason) => {
            if (cancelled)
                return;
            setError(reason instanceof Error ? reason.message : String(reason));
            onError?.(reason);
        };
        async function resize(width) {
            pendingWidth = width;
            if (rendering)
                return;
            rendering = true;
            try {
                while (!cancelled && sheet && !sheet.destroyed && pendingWidth !== undefined) {
                    const nextWidth = pendingWidth;
                    pendingWidth = undefined;
                    sheet.changeSheetSize(nextWidth, options.height);
                    await sheet.render();
                }
            }
            catch (reason) {
                report(reason);
            }
            finally {
                rendering = false;
            }
        }
        setError(undefined);
        void import("@antv/s2").then(async ({ PivotSheet: Sheet }) => {
            if (cancelled || !host.current)
                return;
            sheet = new Sheet(host.current, dataCfg, { ...options, width: host.current.clientWidth || options.width });
            if (themeCfg)
                sheet.setThemeCfg(themeCfg);
            configure?.(sheet);
            await sheet.render();
            if (cancelled || !host.current)
                return;
            observer = new ResizeObserver(entries => {
                const width = entries[0]?.contentRect.width;
                if (width && width > 0)
                    void resize(width);
            });
            observer.observe(host.current);
        }).catch(report);
        return () => { cancelled = true; observer?.disconnect(); sheet?.destroy(); };
    }, [dataCfg, options, themeCfg, configure, onError]);
    return _jsxs("section", { "aria-label": label, children: [error ? _jsx(Alert, { type: "error", title: error }) : null, _jsx("div", { ref: host, role: "img", "aria-label": label, style: { height: options.height } }), accessibleFallback] });
}
