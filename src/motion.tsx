import {
  createContext,
  useContext,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const ReducedMotionContext = createContext(true);

function getReducedMotionQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

export function getReducedMotionSnapshot(): boolean {
  return getReducedMotionQuery()?.matches ?? true;
}

export function getServerReducedMotionSnapshot(): boolean {
  return true;
}

export function subscribeReducedMotion(onChange: () => void): () => void {
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

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

export function ReducedMotionProvider({
  children,
  reduceMotion,
}: PropsWithChildren<{ reduceMotion: boolean }>) {
  return (
    <ReducedMotionContext.Provider value={reduceMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
