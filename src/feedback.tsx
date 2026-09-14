"use client";

import { Empty, Result, Skeleton, Spin, type EmptyProps, type ResultProps } from "antd";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "./motion.js";

export interface EmptyStateProps extends Omit<EmptyProps, "description"> {
  /** Required empty copy. Loading failure is not an empty state. */
  description: ReactNode;
  /** Host-owned next action: create the first row, clear filters, or retry. */
  action?: ReactNode;
}

/** Empty with a required description and an optional next action. Loading failure is not an empty state. */
export function EmptyState({ description, action, ...props }: EmptyStateProps) {
  return <Empty description={description} {...props}>{action}</Empty>;
}

export interface ContentLoadingProps {
  loading?: boolean;
  /** True only for the first paint of a known layout. Later refresh uses Spin. */
  firstLoad?: boolean;
  children?: ReactNode;
  label?: ReactNode;
}

/** Skeleton on first load, Spin on later refresh. Host keeps stale content when firstLoad is false. */
export function ContentLoading({ loading, firstLoad, children, label }: ContentLoadingProps) {
  const reduceMotion = usePrefersReducedMotion();
  if (!loading) return children;
  if (firstLoad) return <Skeleton active={!reduceMotion} title paragraph={{ rows: 3 }} />;
  return <Spin spinning aria-label={typeof label === "string" ? label : undefined}>{children ?? label}</Spin>;
}

export type PageResultProps = ResultProps;

/** Page-level Result. Recoverable inline errors stay in the original container, not here. Extra should stay at most two actions. */
export function PageResult(props: PageResultProps) {
  return <Result {...props} />;
}
