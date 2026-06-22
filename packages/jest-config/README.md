# @fixspace/jest-config

Shared Jest configurations for the FIX Space monorepo.

## Available configs

### `nestConfig` — NestJS unit tests

For `*.spec.ts` files inside `apps/api/src/`.

### `nextConfig` — Next.js component tests

For React component and hook tests in `apps/web/`.

### `domainConfig` — Domain package tests

For `*.spec.ts` files inside `packages/domain/src/`.

## Usage

### API (`apps/api/jest.config.ts`)

```ts
import { nestConfig } from "@fixspace/jest-config";
export default nestConfig;
```

### Web (`apps/web/jest.config.cjs`)

```js
const { nextConfig } = require("@fixspace/jest-config");
module.exports = nextConfig;
```

### Domain (`packages/domain/jest.config.ts`)

```ts
import { domainConfig } from "@fixspace/jest-config/domain";
export default domainConfig;
```
