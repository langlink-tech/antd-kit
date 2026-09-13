"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Empty, Result, Skeleton, Spin } from "antd";
import { usePrefersReducedMotion } from "./motion.js";
/** Empty with a required description and an optional next action. Loading failure is not an empty state. */
export function EmptyState({ description, action, ...props }) {
    return _jsx(Empty, { description: description, ...props, children: action });
}
/** Skeleton on first load, Spin on later refresh. Host keeps stale content when firstLoad is false. */
export function ContentLoading({ loading, firstLoad, children, label }) {
    const reduceMotion = usePrefersReducedMotion();
    if (!loading)
        return children;
    if (firstLoad)
        return _jsx(Skeleton, { active: !reduceMotion, title: true, paragraph: { rows: 3 } });
    return _jsx(Spin, { spinning: true, "aria-label": typeof label === "string" ? label : undefined, children: children ?? label });
}
/** Page-level Result. Recoverable inline errors stay in the original container, not here. Extra should stay at most two actions. */
export function PageResult(props) {
    return _jsx(Result, { ...props });
}
