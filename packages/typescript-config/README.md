# @nucleus/typescript-config

Shared TypeScript configurations for all apps and packages in the monorepo.

## Configs

### `base.json`

Foundation for all other configs. Sets the strictest and most modern defaults:

- `target: ES2022` — use modern JS features
- `module: NodeNext` + `moduleResolution: NodeNext` — correct resolution for modern Node.js ESM/CJS
- `strict: true` — full strict mode
- `noUncheckedIndexedAccess: true` — array/object access is always `T | undefined`
- `isolatedModules: true` — each file is transpilable independently (required by esbuild/SWC)

### `nestjs.json`

For NestJS API apps (`apps/api`) and shared packages compiled with tsc.

Overrides from base:

- `module: commonjs` — NestJS runtime expects CJS
- `moduleResolution: Node10` — matches CJS resolution
- `emitDecoratorMetadata: true` + `experimentalDecorators: true` — required for NestJS dependency injection
- `incremental: true` — faster rebuilds
- `strictPropertyInitialization: false` — NestJS injects properties via DI, not constructors

Used by: `apps/api`, `packages/domain`, `packages/database`, `packages/jest-config`

### `nextjs.json`

For the Next.js frontend (`apps/web`).

Overrides from base:

- `module: ESNext` + `moduleResolution: Bundler` — Next.js uses its own bundler (webpack/Turbopack)
- `noEmit: true` — Next.js handles compilation, tsc is for type-checking only
- `jsx: preserve` — Next.js transforms JSX itself

Used by: `apps/web`

### `test.json`

For Jest test files inside NestJS packages.

Extends `nestjs.json` and relaxes strict rules that are impractical in tests:

- `noImplicitAny: false` — mock objects often have loose types
- `strictNullChecks: false` — test assertions don't need null safety

Used by: `apps/api/tsconfig.test.json`

## Usage

```jsonc
// tsconfig.json in any app or package
{
  "extends": "@nucleus/typescript-config/nestjs.json",
}
```
