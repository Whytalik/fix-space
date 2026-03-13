# Changelog

> Auto-generated from git history. Last updated: 2026-03-07

## 2026-03-13

### Features

- feat(property): add config support and auto-create null values for existing records on property add
- feat(record): enforce database record limit; add optional page/limit pagination
- feat(settings): add settings service with per-category defaults and upsert logic (space, database, section, record)
- feat(space): update space, section, and duplicate services for new data model

### Tests

- test: add spec coverage for property controller, property service, record service, and space duplication

### Documentation

- docs: add Ukrainian project description for diploma

## 2026-03-12

### Features

- feat(auth): extract JWT from cookies with bearer token fallback
- feat(space): define full trading workspace initialization config and seed data (7 databases, 4-pass init)
- feat(domain): extend DTOs with recordLimit, property config, and settings interfaces
- feat(database): enforce recordLimit in service and update duplicate use-case

### Chores

- chore(db): add recordLimit column to Database table (migration 20260312173750)
- chore(config): add separate tsconfig and jest config for tests

## 2026-03-05

### Bug Fixes

- fix(web): remove @nucleus/ui package, inline styles and migrate components to local [`7961e17`](https://github.com/Whytalik/nucleus/commit/7961e176fc43c308751e03c51d7fec322110e0e7)

### Chores

- chore: update changelog and stats [`034007b`](https://github.com/Whytalik/nucleus/commit/034007be3e8c16b0731a515a914e1d8b8be73ae9)

## 2026-03-04

### Documentation

- docs: replace stale app readmes with centralized project documentation [`87f450f`](https://github.com/Whytalik/nucleus/commit/87f450fff48d9b14b15413adab4691830f264e60)

### Chores

- chore: update pnpm lockfile [`b0ca5ee`](https://github.com/Whytalik/nucleus/commit/b0ca5ee1a6484ed7f2cc4b715469ab73b7412393)
- chore: add pre-push hook for automated changelog and stats [`8870287`](https://github.com/Whytalik/nucleus/commit/88702871b9e7b5bd42ec0683e5599416acb8cb16)
- chore: update monorepo config and remove legacy files [`aebdfb3`](https://github.com/Whytalik/nucleus/commit/aebdfb3dc817aaba4c609aacb47bc40ea46cca21)

## 2026-03-02

### Features

- feat(web): use IconDisplay in sidebar and database item [`ae44e46`](https://github.com/Whytalik/nucleus/commit/ae44e4651d31997f11119bbee3f0b8d047ac06cd)
- feat(web): add database view components [`5fd3e75`](https://github.com/Whytalik/nucleus/commit/5fd3e755f47141e6c575403da51078c5c2bad0b3)
- feat(web): add IconPicker and IconDisplay UI components [`25cfd69`](https://github.com/Whytalik/nucleus/commit/25cfd6972f2d981eb5bd253387ffac721412e6c8)
- feat(web): add database route layout with auth guard and update page [`e801127`](https://github.com/Whytalik/nucleus/commit/e801127843c0f286d48667cfda075799c688bbc0)
- feat(web): add DatabaseContext for per-database state [`dd4eb74`](https://github.com/Whytalik/nucleus/commit/dd4eb7487e51e21f14ee9abb656e4cbb1fbc804b)
- feat(web): add updateDatabaseInSpace to AppContext [`e8f0ae4`](https://github.com/Whytalik/nucleus/commit/e8f0ae4096fc771009da520ca27645ee61f270f4)
- feat(web): add database API module [`3c62a76`](https://github.com/Whytalik/nucleus/commit/3c62a76b8c96a9c1c98637016596d10bd382340c)
- feat(web): implement token refresh and redirect in API client [`3f01d9a`](https://github.com/Whytalik/nucleus/commit/3f01d9a2dccb59e61d99ec4c0cb28400c4d5e968)
- feat(api): expand initialization config with full property definitions [`f709360`](https://github.com/Whytalik/nucleus/commit/f709360c275e37f5ba9539c2d98b1603fce13658)
- feat(api): implement 3-pass space initialization with property seeding [`97af46a`](https://github.com/Whytalik/nucleus/commit/97af46ab61f08e8ca12d321c9d8e4c858839769c)
- feat(api): use explicit property list in DatabaseService.create [`7c81dfd`](https://github.com/Whytalik/nucleus/commit/7c81dfdaa4aaf7861fef2dce6895bcd5a9c1030a)
- feat(domain): add payouts database type and type CreateDatabaseDto properties [`a4b6ca8`](https://github.com/Whytalik/nucleus/commit/a4b6ca87d1ccbfce29198167c50902cd101205c2)

### Bug Fixes

- fix(web): correct autocomplete attribute and placeholder on register form [`4e6d473`](https://github.com/Whytalik/nucleus/commit/4e6d473414f1123216e7bdf46adda4b84b8e89eb)
- fix(web): update header components to use DatabaseContext and IconDisplay [`59ef0a4`](https://github.com/Whytalik/nucleus/commit/59ef0a483a2677addf083e0770a852965d7f64cc)

### Refactoring

- refactor(api): move ThrottlerModule registration to global app module [`5c389c6`](https://github.com/Whytalik/nucleus/commit/5c389c66a5e6df8e3d8b5dbefec4e7b0f5523a48)
- refactor(domain): replace select options array with category groups [`e1c7920`](https://github.com/Whytalik/nucleus/commit/e1c7920efe7943f15da29be9382518968e9ae692)

### Chores

- chore(web): add emoji-mart dependencies [`f92574d`](https://github.com/Whytalik/nucleus/commit/f92574de8035e206b229b5e16e6f7c3420b7fba8)

## 2026-02-28

### Features

- feat(web): add settings modal with tabbed navigation and settings page [`62ef244`](https://github.com/Whytalik/nucleus/commit/62ef2448544b805cc3a9d90484c9891df29972c6)
- feat(web): add settings API client for space, database, and section [`0b79c50`](https://github.com/Whytalik/nucleus/commit/0b79c50afa3c1f8e51f8d7d9b38b9cf77f71999f)
- feat(web): add database detail page route [`d29217b`](https://github.com/Whytalik/nucleus/commit/d29217bcf2b9457953cdc8819a20552efb033cce)
- feat(web): update sidebar and database-item with active states and routing [`353a232`](https://github.com/Whytalik/nucleus/commit/353a232b6d2b2d21388cfaef72f6dc6373a0b340)
- feat(web): update header with user actions and database info display [`c6ffb3b`](https://github.com/Whytalik/nucleus/commit/c6ffb3b0881a8f9847e936c9e2c15e7462782472)
- feat(web): update app context with caching and session management [`2daadd2`](https://github.com/Whytalik/nucleus/commit/2daadd26d713f4fe8bb94c295f46d83d1beef314)
- feat(web): update home page and root layout with app provider and sidebar [`579a153`](https://github.com/Whytalik/nucleus/commit/579a1534b03556697beaf1745a3d8d96454e6072)
- feat(domain): add optional sectionKey and properties fields to CreateDatabaseDto [`e21ac8a`](https://github.com/Whytalik/nucleus/commit/e21ac8a0909ddc4eeca58cda5fd069c61ee0d05f)
- feat(web): add space api client and cache utilities [`89ef264`](https://github.com/Whytalik/nucleus/commit/89ef264e7a9d51c4e516965c995803f1df558cf6)
- feat(web): add app context provider for auth and workspace state [`6c0d482`](https://github.com/Whytalik/nucleus/commit/6c0d48226e4be157c675dedf2a488410a2fce844)
- feat(web): update root layout and home page to use shared ui components [`20efca9`](https://github.com/Whytalik/nucleus/commit/20efca913ef7175cfa0357744e96cb9321e9cab2)
- feat(web): add header with auth-aware navigation and footer [`f205667`](https://github.com/Whytalik/nucleus/commit/f2056674df56adb0f50a8e9783925113f3da0fe4)
- feat(web): add register page with email verification flow [`38f26dc`](https://github.com/Whytalik/nucleus/commit/38f26dca6b3da3098294edf27f64c0a9515d6d47)
- feat(web): add login page with form and error handling [`01f69f2`](https://github.com/Whytalik/nucleus/commit/01f69f2f533a6cb3481f564e1454a8a091600d5e)
