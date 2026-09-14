"use client";

import { usePrefersReducedMotion } from "./motion.js";
import { Alert, Card, Empty, Skeleton, Statistic, type CardProps, type StatisticProps, theme } from "antd";
import type { ReactNode } from "react";

export interface MetricCardProps extends Omit<CardProps, "children"> {
  statistic: StatisticProps;
  /** Accessible supplementary trend/comparison content supplied by the host. */
  trend?: ReactNode;
}

/** Official dashboard pattern: statistic in a card, optional trend and footer. */
export function MetricCard({ statistic, trend, ...props }: MetricCardProps) {
  return <Card {...props}><Statistic {...statistic} />{trend}</Card>;
}

export interface DashboardPanelProps extends Omit<CardProps, "loading"> {
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  emptyDescription?: ReactNode;
  recovery?: ReactNode;
}

export function DashboardPanel({ loading, error, empty, emptyDescription, recovery, children, ...props }: DashboardPanelProps) {
  const reduceMotion = usePrefersReducedMotion();
  const { token } = theme.useToken();
  return <Card {...props}>{loading ? <Skeleton active={!reduceMotion && token.motion !== false} /> : error ?
    <Alert type="error" title={error} action={recovery} /> : empty ?
      <Empty description={emptyDescription}>{recovery}</Empty> : children}</Card>;
}
