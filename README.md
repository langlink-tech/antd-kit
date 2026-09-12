# @langlink-tech/antd-kit

LangLink shared Ant Design patterns. React, React DOM and AntD are host peers.

## Exports (0.2.0)

- `/motion`: existing reduced-motion subscription and host override.
- `/table`: `DataTable` preserves host rows, keys, refs, sorting, selection and paging; adds loading/empty/error recovery semantics.
- `/dashboard`: `MetricCard` composes Card + Statistic + a host trend; `DashboardPanel` handles loading/error/empty/content states.
- `/form`: `FormDialog` validates a host form before submit; `FormErrorSummary` focuses nested invalid fields; `FormActions` disables repeat submission while pending.
- `/navigation`: `NavigationMenu` gives controlled Menu a required named navigation landmark; routing and permissions stay with the host.

Official references: [Table](https://ant.design/components/table/), [Form in Modal and scroll to error](https://ant.design/components/form/), [Menu](https://ant.design/components/menu/), [Pro analysis dashboard](https://github.com/ant-design/ant-design-pro/tree/master/src/pages/dashboard/analysis).

```tsx
import { DataTable } from '@langlink-tech/antd-kit/table';
import { MetricCard } from '@langlink-tech/antd-kit/dashboard';
import { FormActions } from '@langlink-tech/antd-kit/form';
import { NavigationMenu } from '@langlink-tech/antd-kit/navigation';

<DataTable rowKey="id" columns={columns} dataSource={rows} loading={loading}
  emptyState={{ description: emptyDescription, action: retryAction }} />
<MetricCard statistic={{ title: metricTitle, value: metricValue }} trend={trend} />
<FormActions submitLabel={saveLabel} submitting={saving} secondary={cancelAction} />
<NavigationMenu label={navigationLabel} items={items} selectedKeys={selectedKeys} onClick={navigate} />
```

The caller controls form visibility, pending state, reset-on-open policy and application errors. Root providers, locale, theme persistence and business drafts remain local. No raw re-export facade or second theme provider is introduced.

## Installation and validation

GitHub Packages is restricted; existing consuming hosts use immutable vendored tarballs where package access is not available. Before publication, consume the exact reviewed `pnpm pack` candidate and record its source commit and SHA-256. Do not claim a candidate version is published. Roll back artifact, lockfile and callers together.

`pnpm verify` runs typecheck, meaningful behavior tests, build and packed export checks. The package is verified with React 19 / AntD 6.6.2. AntD 5 / React 18 hosts must migrate and validate first.

ProTable and S2 are the next PR in this stack, with isolated optional peers; they are not exported by this layer.
