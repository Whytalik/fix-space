# @fixspace/typescript-config

Shared TypeScript configurations for every app and package in the FIX Space monorepo.
All configs target **TypeScript 6** and use `ignoreDeprecations: "6.0"` to suppress
warnings from fields renamed between TS 5 and TS 6.

## Configs

### `base.json`

Foundation for all other configs. Sets strict, modern defaults suitable for any
TypeScript project in the monorepo.

| Option                     | Value      | Reason                                               |
| -------------------------- | ---------- | ---------------------------------------------------- |
| `target`                   | `ES2022`   | Modern JS features without transpiling down          |
| `module`                   | `NodeNext` | Correct ESM/CJS resolution for Node.js               |
| `moduleResolution`         | `NodeNext` | Matches `module: NodeNext`                           |
| `strict`                   | `true`     | Full strict mode — no escape hatches                 |
| `noUncheckedIndexedAccess` | `true`     | Array/object access always typed as `T \| undefined` |
| `isolatedModules`          | `true`     | Each file transpilable independently (SWC/esbuild)   |
| `declaration`              | `true`     | Emit `.d.ts` for all compiled packages               |
| `declarationMap`           | `true`     | Source maps for declaration files                    |
| `esModuleInterop`          | `true`     | Interop for CommonJS default imports                 |
| `resolveJsonModule`        | `true`     | Import `.json` files as typed modules                |

Not meant to be used directly in apps — always extend a more specific config.

---

### `nestjs.json`

For NestJS API apps and any package compiled with `tsc` targeting CommonJS.

Extends `base.json`. Key overrides:

| Option                         | Value      | Reason                                                |
| ------------------------------ | ---------- | ----------------------------------------------------- |
| `module`                       | `CommonJS` | NestJS runtime expects CJS modules                    |
| `moduleResolution`             | `Bundler`  | Flexible resolution compatible with CJS output        |
| `emitDecoratorMetadata`        | `true`     | Required for NestJS dependency injection              |
| `experimentalDecorators`       | `true`     | Required for NestJS decorators                        |
| `strictPropertyInitialization` | `false`    | DI injects class fields — constructors don't set them |
| `strictBindCallApply`          | `false`    | Relaxed for decorator-heavy code patterns             |
| `sourceMap`                    | `true`     | Source maps for runtime stack traces                  |
| `removeComments`               | `true`     | Smaller compiled output                               |

Used by: `apps/api`, `packages/domain`, `packages/database`, `packages/jest-config`

---

### `nextjs.json`

For the Next.js frontend. Next.js owns the compilation pipeline; TypeScript is
only used here for type-checking, not for emitting JS.

Extends `base.json`. Key overrides:

| Option             | Value      | Reason                                           |
| ------------------ | ---------- | ------------------------------------------------ |
| `module`           | `ESNext`   | Next.js bundler handles module format            |
| `moduleResolution` | `Bundler`  | Matches how Turbopack/webpack resolves imports   |
| `jsx`              | `preserve` | Next.js transforms JSX itself via SWC            |
| `noEmit`           | `true`     | tsc is for type-checking only — Next.js compiles |
| `allowJs`          | `true`     | Allows importing `.js` files alongside `.ts`     |

The `"next"` plugin is added via the `apps/web/tsconfig.json` `plugins` field,
not in this shared config.

Used by: `apps/web`

---

### `test.json`

For Jest test files inside NestJS packages. Test code is intentionally looser
than production code — mock objects rarely satisfy strict null or implicit any rules.

Extends `nestjs.json`. Relaxes:

| Option             | Changed to | Why                                                 |
| ------------------ | ---------- | --------------------------------------------------- |
| `noImplicitAny`    | `false`    | Mock objects and spy results often have loose types |
| `strictNullChecks` | `false`    | Test assertions don't need exhaustive null safety   |

Also includes `test/**/*.ts` and `**/*.spec.ts` in its `include` pattern.

Used by: `apps/api` (via `tsconfig.test.json` pointed to by `ts-jest`)

---

## Usage

```jsonc
// tsconfig.json in any app or package
{
  "extends": "@fixspace/typescript-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
  },
  "include": ["src/**/*"],
}
```

```jsonc
// apps/web/tsconfig.json
{
  "extends": "@fixspace/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
  },
}
```

## TypeScript 6 notes

This package targets TypeScript 6.0. The `ignoreDeprecations: "6.0"` flag suppresses
deprecation warnings for options renamed in TS 6 (e.g. `moduleResolution: "Bundler"`
was previously a TS 5-only value). All apps in the monorepo pin `typescript@6.0.2`.
