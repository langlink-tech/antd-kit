import { type EmptyProps, type ResultProps } from "antd";
import type { ReactNode } from "react";
export interface EmptyStateProps extends Omit<EmptyProps, "description"> {
    /** Required empty copy. Loading failure is not an empty state. */
    description: ReactNode;
    /** Host-owned next action: create the first row, clear filters, or retry. */
    action?: ReactNode;
}
/** Empty with a required description and an optional next action. Loading failure is not an empty state. */
export declare function EmptyState({ description, action, ...props }: EmptyStateProps): import("react").JSX.Element;
export interface ContentLoadingProps {
    loading?: boolean;
    /** True only for the first paint of a known layout. Later refresh uses Spin. */
    firstLoad?: boolean;
    children?: ReactNode;
    label?: ReactNode;
}
/** Skeleton on first load, Spin on later refresh. Host keeps stale content when firstLoad is false. */
export declare function ContentLoading({ loading, firstLoad, children, label }: ContentLoadingProps): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
export type PageResultProps = ResultProps;
/** Page-level Result. Recoverable inline errors stay in the original container, not here. Extra should stay at most two actions. */
export declare function PageResult(props: PageResultProps): import("react").JSX.Element;
