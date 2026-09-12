import { type ReactNode } from "react";
import type { PivotSheet, S2DataConfig, S2Options, ThemeCfg } from "@antv/s2";
export interface AnalysisSheetProps {
    dataCfg: S2DataConfig;
    options: S2Options;
    label: string;
    /** Canvas cannot expose table semantics; always provide an equivalent accessible view. */
    accessibleFallback: ReactNode;
    themeCfg?: ThemeCfg;
    configure?: (sheet: PivotSheet) => void;
    onError?: (error: unknown) => void;
}
/** Official PivotSheet lifecycle, dynamically loaded and cleaned up on every update. */
export declare function AnalysisSheet({ dataCfg, options, label, accessibleFallback, themeCfg, configure, onError }: AnalysisSheetProps): import("react").JSX.Element;
