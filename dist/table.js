import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Empty, Table } from "antd";
export function DataTable({ emptyState, locale, loading, ...props }) {
    const isLoading = typeof loading === "object" ? loading.spinning !== false : loading === true;
    const emptyText = emptyState ? isLoading ? null : (emptyState.error ? _jsxs("div", { role: "status", children: [emptyState.description, emptyState.action] })
        : _jsx(Empty, { description: emptyState.description, children: emptyState.action })) : locale?.emptyText;
    return _jsx(Table, { showSorterTooltip: { target: "sorter-icon" }, ...props, loading: loading, locale: { ...locale, ...(emptyText !== undefined ? { emptyText } : {}) } });
}
