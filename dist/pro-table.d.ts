import { type ProTableProps } from "@ant-design/pro-components";
/** Management query-table policy; request, filters, selection and exports stay local. */
export type QueryTableProps<T extends Record<string, unknown>, U extends Record<string, unknown>> = ProTableProps<T, U> & {
    rowKey: NonNullable<ProTableProps<T, U>["rowKey"]>;
};
export declare function QueryTable<T extends Record<string, unknown>, U extends Record<string, unknown>>({ pagination, rowSelection, ...props }: QueryTableProps<T, U>): import("react").JSX.Element;
