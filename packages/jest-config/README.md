# @fixspace/jest-config

Shared Jest configurations for the FIX Space monorepo. All configs are written in
TypeScript, compiled to `dist/` via `tsc`, and consumed by apps via the package's
`exports` map.

## Available configs

### `base` — Foundation

Internal base layer that all other configs extend from. Not exported directly.

Defaults:

- `testEnvironment: "node"` — Node.js environment
- `coverageProvider: "v8"` — faster, more accurate than Babel coverage
- `collectCoverage: false` — off by default; enable per-run with `--coverage`
- `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }` — resolves `@/` path alias

---

### `nest` — NestJS unit tests

For `*.spec.ts` files inside `apps/api/src/`. Uses `ts-jest` for TypeScript
transformation and targets the relaxed `tsconfig.test.json` (which disables
`noImplicitAny` and `strictNullChecks`), making mocks and spy types less painful
to write.

| Option              | Value                               |
| ------------------- | ----------------------------------- |
| `testEnvironment`   | `"node"`                            |
| `testRegex`         | `".*\\.spec\\.ts$"`                 |
| `rootDir`           | `"src"`                             |
| `transform`         | `ts-jest` → `../tsconfig.test.json` |
| `coverageDirectory` | `"../coverage"`                     |

Used by: `apps/api/jest.config.ts`

---

### `next` — Next.js component tests

For React component and hook tests in `apps/web/`. Wraps the config with
`next/jest`'s `createJestConfig`, which automatically sets up SWC transformation,
CSS and image mocking, and `.env` file loading — removing the need for manual
transform configuration.

| Option                 | Value                                |
| ---------------------- | ------------------------------------ |
| `testEnvironment`      | `"jsdom"`                            |
| `coverageProvider`     | `"v8"`                               |
| `moduleFileExtensions` | `["js", "ts", "json", "jsx", "tsx"]` |
| `moduleNameMapper`     | `"^@/(.*)$"` → `"<rootDir>/src/$1"`  |
| `setupFilesAfterEnv`   | `["<rootDir>/jest.setup.ts"]`        |

The `setupFilesAfterEnv` path resolves to the consuming app's own `jest.setup.ts`,
which is expected to import `@testing-library/jest-dom` matchers.

Used by: `apps/web/jest.config.ts`

---

### `e2e` — E2E API tests

For end-to-end tests with Supertest in `apps/api/test/`. Coverage is always
disabled here — e2e tests exist to verify integration paths, not coverage numbers.

| Option            | Value             |
| ----------------- | ----------------- |
| `testEnvironment` | `"node"`          |
| `testRegex`       | `".e2e-spec.ts$"` |
| `collectCoverage` | `false`           |

Used by: `apps/api/test/jest-e2e.json`

---

### `domain` — Domain package tests

For `*.spec.ts` files inside `packages/domain/src/`. Currently no tests exist,
but the config is in place for future DTO validation tests.

| Option              | Value               |
| ------------------- | ------------------- |
| `testEnvironment`   | `"node"`            |
| `testRegex`         | `".*\\.spec\\.ts$"` |
| `rootDir`           | `"src"`             |
| `coverageDirectory` | `"../coverage"`     |

Used by: `packages/domain/jest.config.ts` (when tests are added)

---

## Usage

```ts
// apps/api/jest.config.ts
import { nestConfig } from "@fixspace/jest-config/nest";
export default nestConfig;
```

```ts
// apps/web/jest.config.ts
import nextConfig from "@fixspace/jest-config/next";
export default nextConfig;
```

The `next` config is a default export because `createJestConfig` from `next/jest`
returns a function result, not a plain object — it can't be destructured as a
named export.

## Running tests

```bash
# Unit tests (API)
pnpm --filter @fixspace/api test

# Unit tests in watch mode
pnpm --filter @fixspace/api test:watch

# With coverage report
pnpm --filter @fixspace/api test -- --coverage

# E2E tests
pnpm --filter @fixspace/api test:e2e

# Web component tests
pnpm --filter @fixspace/web test
```

## Writing component tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/primitives/button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```
