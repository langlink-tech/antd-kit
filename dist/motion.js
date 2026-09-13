"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useSyncExternalStore, } from "react";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const ReducedMotionContext = createContext(true);
function getReducedMotionQuery() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return null;
    }
    return window.matchMedia(REDUCED_MOTION_QUERY);
}
export function getReducedMotionSnapshot() {
    return getReducedMotionQuery()?.matches ?? true;
}
export function getServerReducedMotionSnapshot() {
    return true;
}
export function subscribeReducedMotion(onChange) {
    const query = getReducedMotionQuery();
    if (!query) {
        return () => undefined;
    }
    if (typeof query.addEventListener === "function") {
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }
    query.addListener(onChange);
    return () => query.removeListener(onChange);
}
export function usePrefersReducedMotion() {
    return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getServerReducedMotionSnapshot);
}
export function ReducedMotionProvider({ children, reduceMotion, }) {
    return (_jsx(ReducedMotionContext.Provider, { value: reduceMotion, children: children }));
}
export function useReducedMotion() {
    return useContext(ReducedMotionContext);
}
