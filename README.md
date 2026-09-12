# @langlink-tech/antd-kit

LangLink shared Ant Design patterns. First published export is `/motion`.

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
pnpm add @langlink-tech/antd-kit@0.1.1
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
