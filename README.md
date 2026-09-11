# @langlink-tech/antd-kit

Private LangLink shared Ant Design patterns. First published export is `/motion`.

## Install

GitHub Packages, restricted:

```ini
@langlink-tech:registry=https://npm.pkg.github.com
```

```sh
pnpm add @langlink-tech/antd-kit@0.1.0
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
