import { ProTable, type ProTableProps, type ParamsType } from "@ant-design/pro-components";

/** Management query-table policy; request, filters, selection and exports stay local. */
export type QueryTableProps<T extends object, U extends ParamsType = ParamsType, ValueType = "text"> =
  ProTableProps<T, U, ValueType> & { rowKey: NonNullable<ProTableProps<T, U, ValueType>["rowKey"]> };

export function QueryTable<T extends object, U extends ParamsType = ParamsType, ValueType = "text">({
  pagination, rowSelection, ...props
}: QueryTableProps<T, U, ValueType>) {
  return <ProTable<T, U, ValueType> {...props}
    pagination={pagination === false ? false : { defaultPageSize: 25, ...pagination }}
    rowSelection={rowSelection === false ? false : rowSelection ? { preserveSelectedRowKeys: true, ...rowSelection } : undefined}
  />;
}
