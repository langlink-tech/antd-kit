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
publish step never overwrites a published version. No automation creates commits
or merges release PRs. See the [Changesets guide](https://changesets.dev/guide/getting-started).

Dependency resolution enforces a seven-day minimum release age. Changesets 3.0.2
was published on 2026-09-04 and met that gate before adoption on 2026-09-12.
