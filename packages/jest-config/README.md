# `@nucleus/jest-config`

Shared Jest configurations for the Nucleus monorepo.

## Available configs

| Export   | Purpose                                                                | Used by                                  |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| `base`   | Base rules: v8 coverage, node test environment                         | Internal — extended by all other configs |
| `nest`   | NestJS backend: ts-jest with `tsconfig.test.json`, `*.spec.ts` pattern | `apps/api/jest.config.ts`                |
| `e2e`    | E2E tests: ts-jest, `*.e2e-spec.ts` pattern, no coverage collection    | `apps/api/test/jest-e2e.json`            |
| `domain` | Domain package: DTO validation tests, `*.spec.ts` pattern              | `packages/domain` (future)               |
| `next`   | Next.js frontend: `next/jest` wrapper, jsx/tsx support                 | Not yet used                             |

## Usage

### API / NestJS unit tests

```ts
// jest.config.ts
import { nestConfig } from "@nucleus/jest-config";

export default nestConfig;
```

### E2E tests

```json
// test/jest-e2e.json
{
  "preset": "@nucleus/jest-config/e2e"
}
```

Or programmatically:

```ts
// jest-e2e.config.ts
import { e2eConfig } from "@nucleus/jest-config";

export default e2eConfig;
```

### Domain package (DTO tests)

```ts
// jest.config.ts
import { domainConfig } from "@nucleus/jest-config";

export default domainConfig;
```
