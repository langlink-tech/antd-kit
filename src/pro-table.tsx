import { ProTable, type ProTableProps } from "@ant-design/pro-components";

/** Management query-table policy; request, filters, selection and exports stay local. */
export type QueryTableProps<T extends Record<string, unknown>, U extends Record<string, unknown>> =
  ProTableProps<T, U> & { rowKey: NonNullable<ProTableProps<T, U>["rowKey"]> };

export function QueryTable<T extends Record<string, unknown>, U extends Record<string, unknown>>({
  pagination, rowSelection, ...props
}: QueryTableProps<T, U>) {
  return <ProTable<T, U> {...props}
    pagination={pagination === false ? false : { defaultPageSize: 25, ...pagination }}
    rowSelection={rowSelection === false ? false : rowSelection ? { preserveSelectedRowKeys: true, ...rowSelection } : undefined}
  />;
}
