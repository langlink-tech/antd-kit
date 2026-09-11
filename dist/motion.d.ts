import { type PropsWithChildren } from "react";
export declare const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export declare const ReducedMotionContext: import("react").Context<boolean>;
export declare function getReducedMotionSnapshot(): boolean;
export declare function getServerReducedMotionSnapshot(): boolean;
export declare function subscribeReducedMotion(onChange: () => void): () => void;
export declare function usePrefersReducedMotion(): boolean;
export declare function ReducedMotionProvider({ children, reduceMotion, }: PropsWithChildren<{
    reduceMotion: boolean;
}>): import("react").JSX.Element;
export declare function useReducedMotion(): boolean;
