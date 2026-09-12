# @langlink-tech/antd-kit

LangLink shared Ant Design patterns. Shared patterns for tables, dashboards, forms, navigation and analysis.

The source repository is public so host CI can install a pinned git SHA without a
cross-repo token. GitHub Packages remains restricted (`publishConfig.access:
restricted`); switching consumers to the registry still needs `packages` scope
and Actions package access.

## Install

GitHub Packages, restricted:

```ini
@langlink-tech:registry=https://npm.pkg.github.com
```

```sh
pnpm add @langlink-tech/antd-kit@0.3.0
```

Actions consumers need `packages: read` and `NODE_AUTH_TOKEN` from the runtime. Do not assume same-organization packages are readable without that permission.

## Motion

```ts
import {
  ReducedMotionProvider,
  usePrefersReducedMotion,
  useReducedMotion,
} from "@langlink-tech/antd-kit/motion";

const reduceMotion = usePrefersReducedMotion();

<ReducedMotionProvider reduceMotion={reduceMotion}>
  {children}
</ReducedMotionProvider>
```

SSR initial value is `true`. The system hook listens to `prefers-reduced-motion` and cleans up. Hosts that need an override pass `reduceMotion` into `ReducedMotionProvider`.

`/shell` is not shipped. Product copies stay local until a third repo has a stable matching API.

## Governed component patterns (0.3)

The six new entries are additive patterns, not renamed upstream exports. Host
providers, data requests, validation, permissions, selection and routing remain
in the application. Import only the entry needed by a page. ProTable and S2 are
optional peers; importing the other entries does not load either engine.

| Entry | Exports | Official API / example reference |
| --- | --- | --- |
| `/table` | `DataTable` | [Table empty, loading and row selection](https://ant.design/components/table/) |
| `/pro-table` | `QueryTable` | [ProTable](https://procomponents.ant.design/components/table), Pro `list/table-list` |
| `/dashboard` | `MetricCard`, `DashboardPanel` | [Pro analysis dashboard](https://github.com/ant-design/ant-design-pro/tree/master/src/pages/dashboard/analysis) |
| `/form` | `FormDialog`, `FormErrorSummary`, `FormActions` | [Form in Modal, scroll to error](https://ant.design/components/form/) |
| `/navigation` | `NavigationMenu` | [Controlled Menu](https://ant.design/components/menu/), named navigation landmark |
| `/s2` | `AnalysisSheet` | [S2 pivot example](https://s2.antv.antgroup.com/examples/basic/pivot), render/destroy/resize lifecycle |

```tsx
import { DataTable } from '@langlink-tech/antd-kit/table';
import { MetricCard, DashboardPanel } from '@langlink-tech/antd-kit/dashboard';
import { FormActions } from '@langlink-tech/antd-kit/form';
import { NavigationMenu } from '@langlink-tech/antd-kit/navigation';

<DataTable rowKey="id" columns={columns} dataSource={rows}
  loading={loading} pagination={pagination} onChange={onChange}
  emptyState={{ description: emptyDescription, action: retryAction }} />
<MetricCard statistic={{ title: metricTitle, value: metricValue }} trend={trend} />
<DashboardPanel title={title} loading={loading} error={error}
  recovery={retryAction} empty={rows.length === 0} emptyDescription={emptyDescription}>
  {chart}
</DashboardPanel>
<NavigationMenu label={navigationLabel} items={items}
  selectedKeys={selectedKeys} onClick={navigate} />
<FormActions submitLabel={saveLabel} submitting={saving} secondary={cancelAction} />
```

`FormDialog` validates an optional host `FormInstance` before invoking `onOk`.
The caller controls `open`, pending state and error handling. Reopening a reused
form store still requires the host to set/reset its fields deliberately; the
shared dialog does not discard business drafts.

`QueryTable` retains the official generic API with a required stable `rowKey`.
It defaults to 25 rows and preserves selection keys across server pages when
selection is enabled. Explicit host pagination/selection options take priority.
Migrations must retain prior page-size and selection policy explicitly where it
differs; do not silently change the user's working context.

```tsx
import { QueryTable } from '@langlink-tech/antd-kit/pro-table';
import { AnalysisSheet } from '@langlink-tech/antd-kit/s2';

<QueryTable rowKey="id" columns={columns} request={request}
  pagination={pagination} rowSelection={rowSelection} />
<AnalysisSheet label={analysisLabel} dataCfg={dataCfg} options={options}
  themeCfg={themeCfg} configure={configureSheet} onError={handleError}
  accessibleFallback={accessibleDataTable} />
```

Memoize `dataCfg`, `options`, `themeCfg` and callbacks: changing them deliberately
recreates the sheet. `configure` connects host drill-down/selection events before
first render. Accessible equivalent content is required because canvas is not an
HTML data table. Resize work is serialized; unmount disconnects observers and
destroys the sheet. S2 never enters the other entry points.

Verified dependency contract: React 19, AntD 6.6.2, optional ProComponents
3.1.14-6 and S2 2.7.2 (existing fleet pins). An AntD 5 / React 18 host must migrate
and verify first; this release does not widen peer support by assumption.

## Candidate consumption and rollback

Until this PR is merged and 0.3.0 is published, test consumers against the exact
`pnpm pack` tarball from the reviewed source commit. Record its SHA-256 in each
consumer PR and commit the lockfile. Do not claim registry publication for a
candidate. Roll back package artifact, lockfile and adopted callers together to
the prior known-good revision.
