# antd-kit

LangLink shared Ant Design pattern library. First ship is `@langlink-tech/antd-kit/motion` only.

## Commands

- `pnpm verify` — typecheck, tests, pack-after-build
- `pnpm test`
- `pnpm build`

## Working rules

- React, React DOM, and antd are peer dependencies provided by the host.
- Do not export `/shell`, `/pro`, KitProvider, or official antd re-exports until three-repo evidence exists.
- Hosts keep root providers, locale, and theme persistence.
- Do not store tokens, credentials, or publish logs in the repository.

## Validation

Run `pnpm verify` before finishing. CI runs the same command. Publishing uses GitHub Packages; `NODE_AUTH_TOKEN` lives in the runtime only.
