# `@nucleus/jest-config`

Shared Jest configurations for the Nucleus monorepo. All configs are compiled from TypeScript and exported as JavaScript.

## Available configs

### `base` — Base shared rules

Foundation config that all others extend from. Provides:

- `testEnvironment: "node"` — Node.js environment (not jsdom)
- `coverageProvider: "v8"` — Modern coverage engine (faster, more accurate than babel)
- `collectCoverage: false` — Coverage is off by default; enable with `-- --coverage`
- `moduleNameMapper` — Resolves `@/*` imports to `<rootDir>/src/*` (matches tsconfig `paths`)
- `moduleFileExtensions: ["js", "ts", "json"]`

Not meant to be used directly — always extended by a more specific config.

### `nest` — NestJS backend

For NestJS unit tests in `apps/api`. Extends `base` with:

- `testEnvironment: "node"` (explicit override)
- `transform` — `ts-jest` with `<rootDir>/../tsconfig.test.json` (relaxed strictness for tests)
- `testRegex: ".*\\.spec\\.ts$"` — Matches only `.spec.ts` files
- `collectCoverageFrom: ["**/*.(t|j)s"]` — Collects from all TS/JS files
- `coverageDirectory: "../coverage"` — Outputs to `apps/api/coverage/`
- `rootDir: "src"` — Test root is the `src/` directory

Used by: `apps/api/jest.config.ts`

### `e2e` — E2E integration tests

For end-to-end API tests with Supertest. Extends `base` with:

- `testEnvironment: "node"`
- `transform` — `ts-jest` (no custom tsconfig, uses default)
- `testRegex: ".e2e-spec.ts$"` — Matches only `.e2e-spec.ts` files
- `collectCoverage: false` — E2E tests never collect coverage
- `moduleFileExtensions: ["js", "json", "ts"]`

Used by: `apps/api/test/jest-e2e.json`

### `domain` — Domain package (DTO tests)

For `@nucleus/domain` package unit tests. Extends `base` with:

- `testEnvironment: "node"`
- `transform` — `ts-jest` with `<rootDir>/../tsconfig.json`
- `testRegex: ".*\\.spec\\.ts$"` — Matches only `.spec.ts` files
- `collectCoverageFrom: ["**/*.ts"]` — Collects from all TS files
- `coverageDirectory: "../coverage"` — Outputs to `packages/domain/coverage/`
- `rootDir: "src"` — Test root is the `src/` directory
- `moduleFileExtensions: ["ts", "js", "json"]`

Used by: `packages/domain` (future — no tests yet)

### `next` — Next.js frontend

For Next.js React component tests. Wraps config with `next/jest`:

- `next/jest` integration — SWC transform, CSS/image mocking, `.env` loading
- `testEnvironment: "jsdom"` — Browser-like environment for React components
- `moduleFileExtensions` — adds `jsx`, `tsx` to base extensions
- `setupFilesAfterEnv` — loads `jest.setup.ts` for `@testing-library/jest-dom` matchers
- `@/*` path alias support via `moduleNameMapper`

Used by: `apps/web/jest.config.ts`

## Path alias support

All configs resolve `@/*` imports to `<rootDir>/src/*` via `moduleNameMapper`. This matches the `paths` config in `tsconfig.json` files:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Usage

### API / NestJS unit tests

```ts
// apps/api/jest.config.ts
import { nestConfig } from "@nucleus/jest-config";

export default nestConfig;
```

### E2E tests

```json
// apps/api/test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverage": false
}
```

### Domain package (DTO tests)

```ts
// packages/domain/jest.config.ts
import { domainConfig } from "@nucleus/jest-config";

export default domainConfig;
```

### Running with coverage

Coverage is off by default for faster test execution. Enable it explicitly:

```bash
pnpm --filter @nucleus/api test -- --coverage
```

### Writing component tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/primitives/button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```
