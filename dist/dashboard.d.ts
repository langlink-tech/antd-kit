import { type CardProps, type StatisticProps } from "antd";
import type { ReactNode } from "react";
export interface MetricCardProps extends Omit<CardProps, "children"> {
    statistic: StatisticProps;
    /** Accessible supplementary trend/comparison content supplied by the host. */
    trend?: ReactNode;
}
/** Official dashboard pattern: statistic in a card, optional trend and footer. */
export declare function MetricCard({ statistic, trend, ...props }: MetricCardProps): import("react").JSX.Element;
export interface DashboardPanelProps extends Omit<CardProps, "loading"> {
    loading?: boolean;
    error?: ReactNode;
    empty?: boolean;
    emptyDescription?: ReactNode;
    recovery?: ReactNode;
}
export declare function DashboardPanel({ loading, error, empty, emptyDescription, recovery, children, ...props }: DashboardPanelProps): import("react").JSX.Element;
