import { Empty, Table, type TableProps } from "antd";
import type { ReactNode, Ref } from "react";
import type { TableRef } from "antd/es/table/index.js";

/** A read-only/result table with explicit loading, failure and empty semantics.
 * Host owns keys, paging, sort/filter state and row selection. */
export type DataTableProps<T extends object> = TableProps<T> & {
  ref?: Ref<TableRef>;
  emptyState?: { description: ReactNode; action?: ReactNode; error?: boolean };
};

export function DataTable<T extends object>({ emptyState, locale, loading, ...props }: DataTableProps<T>) {
  const isLoading = typeof loading === "object" ? loading.spinning !== false : loading === true;
  const emptyText = isLoading ? null : emptyState ? (
    emptyState.error ? <div role="status">{emptyState.description}{emptyState.action}</div>
      : <Empty description={emptyState.description}>{emptyState.action}</Empty>
  ) : locale?.emptyText;
  return <Table<T> showSorterTooltip={{ target: "sorter-icon" }} {...props} loading={loading}
    locale={{ ...locale, ...(emptyText !== undefined ? { emptyText } : {}) }} />;
}
