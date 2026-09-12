import { type TableProps } from "antd";
import type { ReactNode, Ref } from "react";
import type { TableRef } from "antd/es/table/index.js";
/** A read-only/result table with explicit loading, failure and empty semantics.
 * Host owns keys, paging, sort/filter state and row selection. */
export type DataTableProps<T extends object> = TableProps<T> & {
    ref?: Ref<TableRef>;
    emptyState?: {
        description: ReactNode;
        action?: ReactNode;
        error?: boolean;
    };
};
export declare function DataTable<T extends object>({ emptyState, locale, loading, ...props }: DataTableProps<T>): import("react").JSX.Element;
