import { type ReactNode } from "react";
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
export declare function AnalysisSheet({ dataCfg, options, label, accessibleFallback, loading, themeCfg, configure, resolveOptions, onError }: AnalysisSheetProps): import("react").JSX.Element;
