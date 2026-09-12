import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Card, Empty, Skeleton, Statistic } from "antd";
/** Official dashboard pattern: statistic in a card, optional trend and footer. */
export function MetricCard({ statistic, trend, ...props }) {
    return _jsxs(Card, { ...props, children: [_jsx(Statistic, { ...statistic }), trend] });
}
export function DashboardPanel({ loading, error, empty, emptyDescription, recovery, children, ...props }) {
    return _jsx(Card, { ...props, children: loading ? _jsx(Skeleton, { active: true }) : error ?
            _jsx(Alert, { type: "error", title: error, action: recovery }) : empty ?
            _jsx(Empty, { description: emptyDescription, children: recovery }) : children });
}
