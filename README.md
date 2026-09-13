# @langlink-tech/antd-kit

LangLink shared Ant Design patterns. Shared patterns for tables, dashboards, forms, navigation, analysis, state surfaces and overlay shells.

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

## Governed component patterns (0.4)

The entries are additive patterns, not renamed upstream exports. Host
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
| `/feedback` | `EmptyState`, `ContentLoading`, `PageResult` | [Empty](https://ant.design/components/empty/), [Skeleton](https://ant.design/components/skeleton/), [Spin](https://ant.design/components/spin/), [Result](https://ant.design/components/result/) |
| `/overlay` | `FormDrawer`, `PreviewDialog`, `ConfirmAction`, `useAppConfirm` | [Form in Drawer](https://ant.design/components/form/), [Modal](https://ant.design/components/modal/), [Popconfirm](https://ant.design/components/popconfirm/), [App](https://ant.design/components/app/) |

Library entries are client modules. Packed `dist/*.js` files keep a `"use client"`
directive so a Next.js Server Component can import `EmptyState` without turning
the whole page into a client shell. Optional Pro/S2 peers stay out of core
entries.

### Wrapper value

| Export | Decision | Shared behavior | Native allowed |
| --- | --- | --- | --- |
| `EmptyState` | keep | required `description`, optional `action` | native Empty only when there is no next-action contract |
| `PageResult` | keep | page-level Result; `extra` stays host-owned | native Result or Alert for inline recovery |
| `ConfirmAction` | keep | in-place Popconfirm; shared inflight promise (success closes, async reject and sync throw stay open and clear pending) | `useAppConfirm()` for high-risk/irreversible |
| `MetricCard` | keep | Statistic in a Card plus optional `trend` | native `Statistic` when Card chrome is wrong |

Do not remove these exports in 0.4. Return the `onConfirm` promise so rejection
stays a rejection. `void onConfirm()` at a call site drops that signal.

#### Consumer props map (read-only; this PR does not edit hosts)

| Export | Host path | Props actually passed |
| --- | --- | --- |
| `EmptyState` | `ll-lqa-test/src/pages/admin/AdminTestsPage.tsx` | `description`, `action` (create button) |
| `EmptyState` | `ll-lqa-test/src/pages/admin/AdminPeoplePage.tsx` | `description` only on no-matches |
| `EmptyState` | `secure-files-cloudflare/src/frontend/App.tsx` | `description`; table `emptyText` slot |
| `EmptyState` | `langlink-tech-portal/frontend/src/pages/ToolsPage.tsx` | empty/filter empty copy |
| `PageResult` | `ll-lqa-test/src/pages/NotFoundPage.tsx` | `status="404"`, `title`, `subTitle`, `extra` (back button) |
| `PageResult` | `langlink-tech-portal/frontend/src/App.tsx` | `status="404"`, `title`, `subTitle`, `extra` |
| `PageResult` | `antd-pro-clone/src/pages/exception/404/index.tsx` | imported as `Result`; `status`, `title`, `subTitle`, `extra` |
| `ConfirmAction` | `ll-lqa-test/src/pages/admin/AdminTestsPage.tsx` | `title`, `description`, `okText`, `cancelText`, `okButtonProps.danger`, `onConfirm` |
| `ConfirmAction` | `secure-files-cloudflare/src/frontend/App.tsx` | `title` (JSX), `onConfirm` wrapping delete |
| `ConfirmAction` | `secure-files-cloudflare/src/frontend/operations/OperationsPanel.tsx` | `title`, `onConfirm` retry/replay |
| `MetricCard` | `ll-lqa-test/src/pages/admin/AdminDashboardPage.tsx` | `statistic={{ title, value }}` |
| `MetricCard` | `langlink-tech-portal/frontend/src/pages/HomePage.tsx` | `variant="borderless"`, `styles.body.padding: 0`, `statistic` |
| `MetricCard` | `antd-pro-clone/src/pages/dashboard/workplace/index.tsx` | same borderless/zero-padding Statistic chrome |
| `MetricCard` | `plunet-chrome-plugin/src/sidepanel/components/OrderHealthPanel.tsx` | borderless Statistic counts |

Hosts that pass `variant="borderless"` and zero padding are the documented
Statistic carve-out: they may keep MetricCard or switch to native Statistic
without a library removal.

```tsx
import { DataTable } from '@langlink-tech/antd-kit/table';
import { MetricCard, DashboardPanel } from '@langlink-tech/antd-kit/dashboard';
import { FormActions } from '@langlink-tech/antd-kit/form';
import { NavigationMenu } from '@langlink-tech/antd-kit/navigation';
import { EmptyState, PageResult } from '@langlink-tech/antd-kit/feedback';

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
<EmptyState description={emptyDescription} action={retryAction} />
<PageResult status="404" title={missingTitle} extra={homeAction} />
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

Until this PR is merged and 0.4.0 is published, test consumers against the exact
`pnpm pack` tarball from the reviewed source commit. Record its SHA-256 in each
consumer PR and commit the lockfile. Do not claim registry publication for a
candidate. Roll back package artifact, lockfile and adopted callers together to
the prior known-good revision.

Node 22 and Node 24 are verified host runtimes. Navigation `landmarkProps` preserves host landmark layout attributes while the menu props remain separate.

## Package access and release boundaries

Package access is an explicit onboarding operation by a package administrator,
using **Package settings → Manage Actions access → Add repository → Read**.
See [GitHub package access documentation](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility#ensuring-workflow-access-to-your-package).
The release workflow does not mutate organization or consumer permissions.
The previous `grant-package-access` job failed at package lookup with the release
repository's token; a publisher token is not proof of consumer access.

Every new consumer must pass its own cold-store consume smoke with its own
`GITHUB_TOKEN` and `packages: read` before adoption. A library-side smoke cannot
satisfy this gate. Existing consumer smoke workflows remain the access gate;
this separation neither grants broader permissions nor ignores an install failure.
Write registry credentials only to a trusted user npm config in the ephemeral
runner; project config contains only the scope registry route. Never print tokens.

`consume-smoke` verifies published ESM import and clean uninstall. Uninstall is
not a rollback test. Product rollback restores the previous known-good dependency,
lockfile and adapter code, then runs that product's checks and rebuilds. Record
that evidence in the [initiative ledger](https://github.com/langlink-localization/dotfiles/blob/master/specs/antd-shared-component-library-2026-09/initiative-ledger.yaml)
before accepting the rollout. Keep older artifacts available; never overwrite a
published version. This CI repair does not change package source or require a new
package version.

## Versioned releases

Use `pnpm changeset` for releasable changes. In a release PR, run
`pnpm version:packages`, refresh the lockfile, and review the generated version
and changelog. Breaking changes require the affected-consumer list and migration
instructions in that PR. Documentation and CI-only fixes need no package bump.

`pnpm verify` checks Changesets configuration, source behavior and the built pack.
After the reviewed release PR merges, CI builds and publishes the exact manifest
version, confirms registry metadata, then installs it in a cold store. The existing
publish step never overwrites a published version. If the version is already on
the registry, CI compares a stable exports/types/provenance fingerprint and
fails when the contents differ; identical content may rerun. No automation
creates commits or merges release PRs. See the [Changesets guide](https://changesets.dev/guide/getting-started).

Dependency resolution enforces a seven-day minimum release age. Changesets 3.0.2
was published on 2026-09-04 and met that gate before adoption on 2026-09-12.
