# antd-kit

LangLink shared Ant Design pattern library. Exports are motion, table, pro-table, dashboard, form, navigation, s2, feedback and overlay.

## Commands

- `pnpm verify` — typecheck, tests, pack-after-build
- `pnpm test`
- `pnpm build`

## Working rules

- React, React DOM, and antd are peer dependencies provided by the host.
- Keep patterns policy-focused; do not add raw component re-export facades or KitProvider.
- ProTable and S2 must stay in isolated optional-peer entries.
- The fleet expansion contract and source inventory are in dotfiles/specs/antd-shared-component-library-2026-09/fleet-governance-wave-2-2026-09.md.
- Hosts keep root providers, locale, and theme persistence.
- Library entries are client modules. Built `dist/*.js` files must start with `"use client"`. Host Server Components may import them; do not add a whole-app client shell.
- Do not store tokens, credentials, or publish logs in the repository.

## Validation

Run `pnpm verify` before finishing. CI runs the same command. Publishing uses GitHub Packages; `NODE_AUTH_TOKEN` lives in the runtime only.
