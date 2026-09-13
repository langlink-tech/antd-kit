"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { ProTable } from "@ant-design/pro-components";
export function QueryTable({ pagination, rowSelection, ...props }) {
    return _jsx(ProTable, { ...props, pagination: pagination === false ? false : { defaultPageSize: 25, ...pagination }, rowSelection: rowSelection === false ? false : rowSelection ? { preserveSelectedRowKeys: true, ...rowSelection } : undefined });
}
