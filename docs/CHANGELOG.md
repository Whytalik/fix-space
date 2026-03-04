# Changelog

> Auto-generated from git history. Last updated: 2026-03-05 17:07

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
- feat(web): add api client with bearer token support and typed error handling [`9f3439c`](https://github.com/Whytalik/nucleus/commit/9f3439c044c2ad5304616b6dde5b4c4ed146b667)
- feat(auth): add dev-only endpoints for e2e test setup [`1e87287`](https://github.com/Whytalik/nucleus/commit/1e87287ce916b41e03aafccfa9b57e2426c5a729)
- feat(auth): expose access token in response body and support bearer auth in jwt strategy [`a6a299a`](https://github.com/Whytalik/nucleus/commit/a6a299ac464c4ffe1c973384296ea0a03207f340)
- feat(auth): add email verification token flow with expiration and revocation [`51a10e5`](https://github.com/Whytalik/nucleus/commit/51a10e5cfd6d766bd7910fc463f3543ca0c0defe)
- feat(ui): initialize shared ui package with button, card, and logo components [`991a295`](https://github.com/Whytalik/nucleus/commit/991a295ffe1320cd34eabead557cdbd88c3dae3c)

### Bug Fixes

- fix(web): remove unused @nucleus/database dependency to fix vercel build [`fb3d428`](https://github.com/Whytalik/nucleus/commit/fb3d428daa62e0183f82a06df79a6594f61254f1)
- fix(deploy): build domain before web via turbo filter and simplify database page [`af05c79`](https://github.com/Whytalik/nucleus/commit/af05c79285fbf78ed45cde3ce5dcb7ce874f5127)
- fix(web): annotate section type in database page flatMap [`40d67c5`](https://github.com/Whytalik/nucleus/commit/40d67c58a820b008de34e1590ea3a97f07f5ae06)
- fix(config): update domain build script and add ui transpilation in next.js [`d8c66de`](https://github.com/Whytalik/nucleus/commit/d8c66de46ca10bf712b13e68113c094a1dc396cb)
- fix(deploy): track vercel.json and fix Next.js output directory [`511389d`](https://github.com/Whytalik/nucleus/commit/511389dd369f6dd09d4740587b14e2986459e38b)
- fix(deploy): enable experimentalDecorators for domain DTOs in web [`45a40b9`](https://github.com/Whytalik/nucleus/commit/45a40b92e33bf122640a1a532a7e54de3033c305)
- fix(deploy): disable strictPropertyInitialization for domain DTOs in web [`d833c99`](https://github.com/Whytalik/nucleus/commit/d833c99f41c159c67da7974f7866d4a556341141)
- fix(deploy): transpile @nucleus/domain in Next.js and export TypeScript source [`75df6c7`](https://github.com/Whytalik/nucleus/commit/75df6c7a5ce37fe5d47ede5bf48ca2f7fd6f9359)
- fix(deploy): update pnpm-lock.yaml after ui package dependency cleanup [`99705ec`](https://github.com/Whytalik/nucleus/commit/99705ec7d55001571ce79f11f7bf74daa3d77dfc)
- fix(deploy): add .npmrc for pnpm on Vercel and transpile @nucleus/ui in Next.js [`108d846`](https://github.com/Whytalik/nucleus/commit/108d8461ee6c93ce958343e3659141bf028e1966)

### Refactoring

- refactor(web): reorganize components into layout and home directories [`12b8556`](https://github.com/Whytalik/nucleus/commit/12b85568842dc52456df0f1a88be5b94be68c822)

### Chores

- chore: update lockfile after removing @nucleus/database from web deps [`bf03661`](https://github.com/Whytalik/nucleus/commit/bf036613656e93c3c3a884fcd3d2029f06ff01a1)
- chore: standardize quotes to double quotes across monorepo [`9792f08`](https://github.com/Whytalik/nucleus/commit/9792f08348d6a8f44a0a072701f0b5c2843da74b)
- chore: apply prettier formatting across all packages [`ad04345`](https://github.com/Whytalik/nucleus/commit/ad04345ebee7a7488000d93908f8ad8be99e3317)

## 2026-02-24

### Features

- feat(api): initialize property values for existing records on property creation [`15071ba`](https://github.com/Whytalik/nucleus/commit/15071ba1c4ed86029bb31d2724ae286534c4055c)
- feat(api): support Bearer token auth and expose access token in response [`afe2126`](https://github.com/Whytalik/nucleus/commit/afe2126923868061f2535084250d80793e97414c)
- feat(api): add dev-only endpoints for e2e test setup [`7ff2cea`](https://github.com/Whytalik/nucleus/commit/7ff2ceacff9907b2b9f83f6bcb64768f00b4dea0)

### Refactoring

- refactor(api): extract userId directly from CurrentUser decorator in settings [`55455ce`](https://github.com/Whytalik/nucleus/commit/55455ce8deaff25543a94e142ff58f5b466de3c7)

## 2026-02-23

### Features

- feat(api): add tests for all current modules [`4318db8`](https://github.com/Whytalik/nucleus/commit/4318db8ba19e9c9298df55f3d4e67f83189c439e)
- feat(api): add record config [`2414ac1`](https://github.com/Whytalik/nucleus/commit/2414ac1718433af0fc8cf42b05985ea768212984)
- feat(api): implement property value processing for records [`ff0b15b`](https://github.com/Whytalik/nucleus/commit/ff0b15b1d43ee36393e6805a64c4d990bf94a216)
- feat(api): add new handlers for proprty types [`690bdb0`](https://github.com/Whytalik/nucleus/commit/690bdb0a49e56e22f9e31387c3f97d22f22bd070)

### Refactoring

- refactor(api): clean up imports and enforce code style [`eb8d97d`](https://github.com/Whytalik/nucleus/commit/eb8d97dbd5895f62113b63891b5559cd2992de25)
- refactor(api): add verification of the ownership of resources for a specific user [`b337330`](https://github.com/Whytalik/nucleus/commit/b337330f7fc5ee239415dc9303e3fe5981267508)

## 2026-02-21

### Features

- feat(domain): add property type configs for all property types [`7c115b8`](https://github.com/Whytalik/nucleus/commit/7c115b889b53b0c25a04ffa5ca3aa912e122d996)
- feat(database): use property type registry for default property config [`254dde7`](https://github.com/Whytalik/nucleus/commit/254dde7cfa2b496e28dba0fbb01dc5a186a2ebe9)
- feat(property): register handlers in module and integrate registry into service [`8653907`](https://github.com/Whytalik/nucleus/commit/86539078801bcea6f63ef6b12210fb24017eb555)
- feat(property): implement strategy + registry pattern for property type handlers [`7d71bbb`](https://github.com/Whytalik/nucleus/commit/7d71bbb23b6df47097144b94a3f8bc46d8707e90)
- feat(domain): add property type interfaces and config field to DTO [`b9b2e9e`](https://github.com/Whytalik/nucleus/commit/b9b2e9e05518667811f2b3f918f61ead0bcd3f92)

### Bug Fixes

- fix(build): add .prettierignore and fix database format script [`b191be0`](https://github.com/Whytalik/nucleus/commit/b191be011ac5c4538c02b7bf2cb67011fec330c2)

### Refactoring

- refactor(property): use domain type constants in handlers and remove local configs [`c5f2334`](https://github.com/Whytalik/nucleus/commit/c5f23341fbe873240f413bb0a8f8a1e158219f7d)

### Documentation

- docs: update README [`40e305d`](https://github.com/Whytalik/nucleus/commit/40e305da429adb434db68618218b43e394ca17b3)

### Style

- style: apply prettier formatting across codebase [`b586b7a`](https://github.com/Whytalik/nucleus/commit/b586b7a6c9998bc55e5b0d41c426c59874b7fdc5)

### Other

- Add environment variables for GitLab mirror job [`a9372b3`](https://github.com/Whytalik/nucleus/commit/a9372b386be60516b4c5c305f1ca3609f27aba97)
- Add debug step for GitLab repository secrets [`93336dc`](https://github.com/Whytalik/nucleus/commit/93336dc0878e543d5e2d509c419693b0fe8e59bb)
- Add GitHub Actions workflow to mirror to GitLab [`aa5b719`](https://github.com/Whytalik/nucleus/commit/aa5b7193967bfd1d20fb44621f37afee88e9020d)

## 2026-02-18

### Features

- feat(settings): generic settings service with category-based CRUD [`103c552`](https://github.com/Whytalik/nucleus/commit/103c552732f1d20ee8bc000c75d05d5deed958f5)

### Refactoring

- refactor(space): extract SectionService, add DuplicateSpaceUseCase [`11f78ed`](https://github.com/Whytalik/nucleus/commit/11f78ed0977d7af93b6da36672a2fed0dc6e4abd)
- refactor(domain, api): typed ResponseDto wrappers and relaxed config types [`45a1465`](https://github.com/Whytalik/nucleus/commit/45a146530fe54442d786701b55f9c94f5cddaaf5)

## 2026-02-17

### Features

- feat(domain): add space settings interface and defaults [`a5e0e93`](https://github.com/Whytalik/nucleus/commit/a5e0e934d6ce0a265aada4dad5636ab480b69a7b)
- feat(api): add empty settings module [`f2400cc`](https://github.com/Whytalik/nucleus/commit/f2400cc9d498a61e39fe71f55f43df2265a831e0)
- feat(domain): add dto's and entity for settings [`edb5a42`](https://github.com/Whytalik/nucleus/commit/edb5a42768aa9dab3ba28d494fec1e09be10cb8e)

### Tests

- test(api): add unit tests for auth, password and token utilities [`279c1a3`](https://github.com/Whytalik/nucleus/commit/279c1a371799e92509d4e83ccffc2e6ca01910d0)

## 2026-02-16

### Features

- feat(auth): add auth controller and update module wiring [`ae707a8`](https://github.com/Whytalik/nucleus/commit/ae707a8d8fbb5efbca7a49b9b68d09d92082ef0e)
- feat(auth): rewrite auth service and register usecase [`0c75f50`](https://github.com/Whytalik/nucleus/commit/0c75f50ebfaaa90722e244b1e9f04851bff5e25b)
- feat(auth): add token service for refresh and verification tokens [`47adba9`](https://github.com/Whytalik/nucleus/commit/47adba97052d018792f317edaa30f51a71f8e3cd)
- feat(api): switch JWT to cookie-based extraction [`bac3b6d`](https://github.com/Whytalik/nucleus/commit/bac3b6d90fa8872eaef8bf559895707073cfc5d1)
- feat(api): add mail service with Ethereal dev support [`7855db9`](https://github.com/Whytalik/nucleus/commit/7855db98a90a6286dd032bf87e52f4eea5b5c1f1)
- feat(api): add cookie and token utilities [`bea7e98`](https://github.com/Whytalik/nucleus/commit/bea7e9822efd9722e47eeb550f256c60ebeed909)

### Bug Fixes

- fix(api): resolve TypeScript errors in auth implementation [`e44bc38`](https://github.com/Whytalik/nucleus/commit/e44bc38dcdaaae62a7b6cdb43626c3f5cb49a8e0)

### Refactoring

- refactor(auth): use interceptor instead of Express Response [`61fa0dd`](https://github.com/Whytalik/nucleus/commit/61fa0ddb2b3cbe64cd5573b82fb83cb72cbc6155)

### Chores

- chore: update env files with new auth variables [`54ff41b`](https://github.com/Whytalik/nucleus/commit/54ff41bf7faa748db6ff4b8a9158f85b4ddfdd32)

## 2026-02-15

### Chores

- chore(db): add auth token models and isVerified field [`d87ef29`](https://github.com/Whytalik/nucleus/commit/d87ef2951e394de26e32ca74b831c8583e30564e)

## 2026-02-14

### Chores

- chore: update docker-compose and environment config [`0cb0e59`](https://github.com/Whytalik/nucleus/commit/0cb0e596cc012fe4d3f011b2cc125c5c289f452a)

## 2026-02-15

### Features

- feat(api): add extensible property type system [`5181865`](https://github.com/Whytalik/nucleus/commit/51818655168eac619292d5cab1cf433793dd8a09)
- feat(api): enhance services with validation and structured logging [`f5287fd`](https://github.com/Whytalik/nucleus/commit/f5287fd0694592029d5ea310525c3184fca5f6b3)

### Refactoring

- refactor(api): inline section management into space module [`f469abc`](https://github.com/Whytalik/nucleus/commit/f469abc6f7fd2c4f3264f8ef6979bb625cbdca4c)
- refactor(api): relocate config schemas to respective modules [`557a6a1`](https://github.com/Whytalik/nucleus/commit/557a6a171a8830f87f4055ff29ca5ead7e6617fd)

## 2026-02-14

### Features

- feat(api): add resource ownership decorator and guard [`0b4de25`](https://github.com/Whytalik/nucleus/commit/0b4de25fd57240e0bc3cf066f441f02958645a10)
- feat(api): add global exception filter with Prisma error mapping [`dadf2a0`](https://github.com/Whytalik/nucleus/commit/dadf2a08647675709f7d607e7e1d3df80e4e60ec)
- feat(api): add structured application logger [`edd6d0a`](https://github.com/Whytalik/nucleus/commit/edd6d0afe59d6894f07aeff9cf9aac5a32498166)
- feat(api): add request context with AsyncLocalStorage [`37f8430`](https://github.com/Whytalik/nucleus/commit/37f8430a4205434936147863d7d386ca25a6f498)

### Refactoring

- refactor(api): enhance auth service with structured logging [`4ee7963`](https://github.com/Whytalik/nucleus/commit/4ee79633acf6a4085c8bd81bdbc058d957777e85)
- refactor(api): move auth decorators from common to auth module [`28558f4`](https://github.com/Whytalik/nucleus/commit/28558f413c7f1a0a2c5151375beb462110b42929)
- refactor(api): register infrastructure in app bootstrap [`0c6169d`](https://github.com/Whytalik/nucleus/commit/0c6169d0865cffa039fe0b77027a5d2513f98e2b)
- refactor(api): enhance logging interceptor with request context [`17c70c2`](https://github.com/Whytalik/nucleus/commit/17c70c2008bb5d689c88dc920a7b06e6859514b8)

### Chores

- chore(database): remove outdated migrations [`4d813f0`](https://github.com/Whytalik/nucleus/commit/4d813f0c3972e45160638ad619510bba6f9ea3da)
- chore: remove unused UI package [`2667c2b`](https://github.com/Whytalik/nucleus/commit/2667c2b51aef0bb0e3f461c275e05f9ed20cd6cf)

## 2026-02-08

### Features

- feat(api): enhance services with validation, error handling, and new fields [`4a6f6bb`](https://github.com/Whytalik/nucleus/commit/4a6f6bb98f32580b24779b3e72d12118d68bf5ff)
- feat(domain): add icons, colors, and metadata to all domain entities and DTOs [`ffef797`](https://github.com/Whytalik/nucleus/commit/ffef79741821ddd01d503f990764bc77af9c0f55)
- feat(database): enhance Prisma schema with icons, metadata, and indexes [`fa93dae`](https://github.com/Whytalik/nucleus/commit/fa93daef5280aa5d64b85da1210f6935b6b42277)
- feat(config): add type-safe configuration schemas for domain entities [`d7e1947`](https://github.com/Whytalik/nucleus/commit/d7e1947962d88fde4b690f891bb5c5cd2ab9d1dc)
- feat(config): implement environment configuration with Zod validation [`1dc4c75`](https://github.com/Whytalik/nucleus/commit/1dc4c75ff8a08dcb81deb7f1148d0ad376f6a001)

## 2026-02-01

### Features

- feat(api): implement record-content module with CRUD [`60d5e06`](https://github.com/Whytalik/nucleus/commit/60d5e06c5c58a919e0e50ccf7ad8a100cda8adcc)
- feat(api): implement property-value module with CRUD [`a2ed7f1`](https://github.com/Whytalik/nucleus/commit/a2ed7f1a78cdd83a41e87a3405399a609c2bf9eb)
- feat(api): implement record module with CRUD [`9b5521d`](https://github.com/Whytalik/nucleus/commit/9b5521d564e044ac373f8be90103e07479225205)
- feat(packages/database): update prisma schema [`47527ac`](https://github.com/Whytalik/nucleus/commit/47527ac0fdd9db2931c65ed9d402b1dc692ec2ee)

### Refactoring

- refactor(packages/domain): remove config fields from domain entities and services [`b70b034`](https://github.com/Whytalik/nucleus/commit/b70b03462adde7732813d57e495fe770e022ddf0)
- refactor(packages/domain): restructure exports with barrel pattern [`09c8654`](https://github.com/Whytalik/nucleus/commit/09c865496b6da78c4d53de7c5d92ec7731414962)

## 2026-01-31

### Features

- feat(api): implement property module with CRUD and default initialization [`8083f61`](https://github.com/Whytalik/nucleus/commit/8083f6165c14cb3e9649dd8eba63558e5cc4d5d5)
- feat(domain): add property DTOs, entity and update schema [`e19c164`](https://github.com/Whytalik/nucleus/commit/e19c164def0049087b91563c0b16dd090dcf61d9)
- feat(api): add database initialization on user registration [`879cd0c`](https://github.com/Whytalik/nucleus/commit/879cd0ccb6523cd8a2e518b9745f104b71e593ac)
- feat(domain): remove ownerId from CreateSpaceDto [`95611cf`](https://github.com/Whytalik/nucleus/commit/95611cf7b90cb8bec41552ac3c945f8160d094e8)
- feat(api): add full CRUD for user module [`6137a9c`](https://github.com/Whytalik/nucleus/commit/6137a9cc5402c5bd2e5861f5badc753b1e03f5b0)
- feat(api): add nested routes for sections and databases [`eb33167`](https://github.com/Whytalik/nucleus/commit/eb331676f337e76b63667ddb6cd9513c693a8dbd)
- feat(api): add HTTP logging interceptor [`f462bde`](https://github.com/Whytalik/nucleus/commit/f462bde2bbfabe0412d569fd6eff6797f863cbaf)
- feat(api): add CurrentUser decorator and global JWT auth guard [`453fa9a`](https://github.com/Whytalik/nucleus/commit/453fa9abaf042a9aeef8bf77f61e4d19a28d2ed0)
- feat(api): seed default databases on space initialization [`6b417d0`](https://github.com/Whytalik/nucleus/commit/6b417d0c6c40dbe4fb66d19d1b80b504a5d94d0e)
- feat(api): add database module with CRUD operations [`547e1a7`](https://github.com/Whytalik/nucleus/commit/547e1a7d4fabe656d0f94e1fc2669c4297ab8a0c)
- feat(packages/domain): refine database DTO contracts [`e7f3c4b`](https://github.com/Whytalik/nucleus/commit/e7f3c4b715a096c07a0d92505ecf9f69e3ded699)
- feat(api): add sections module with basic CRUD [`3228bea`](https://github.com/Whytalik/nucleus/commit/3228bea6b20ff986696840a15edd9faa3ec0448d)
- feat(api): add user config initialization on first login [`e91a10a`](https://github.com/Whytalik/nucleus/commit/e91a10a14aba96a12ac53c7af4e1bb3624747b08)

### Refactoring

- refactor(api): restructure auth - rename to sessions and move registration to users [`85c59a1`](https://github.com/Whytalik/nucleus/commit/85c59a1453ee2e7c11aa8624de6f231f8a213e7c)
- refactor(api): rename API routes to RESTful plural conventions [`8f10f01`](https://github.com/Whytalik/nucleus/commit/8f10f012676789d3c04271abd61b027b41d6149e)
- refactor(api): remove system user and use JWT auth [`cb86de4`](https://github.com/Whytalik/nucleus/commit/cb86de41b5cee4d53f4eb502e6c56651acebd56b)
- refactor(api): align controllers and services structure [`23508da`](https://github.com/Whytalik/nucleus/commit/23508daf3ef47701615fdf57d67a683f8b37716a)

### Chores

- chore: update domain DTOs and schema [`dd62a39`](https://github.com/Whytalik/nucleus/commit/dd62a3933657150188bf50ce8168e949b390b879)

## 2026-01-30

### Features

- feat(api): implement space module [`cb19ce7`](https://github.com/Whytalik/nucleus/commit/cb19ce78f9e7cc6242e476a43d9d79952a1835bb)
- feat(web): display username on main screen [`c953f8a`](https://github.com/Whytalik/nucleus/commit/c953f8af3d71a8f0c9e936d507176d273651eef5)
- feat(api): add auth scaffolding (modules, decorators, jwt, utils) [`d8fd5b5`](https://github.com/Whytalik/nucleus/commit/d8fd5b56533201138789fe6fe99bed0ef37b3ea8)
- feat(api): add basic user module [`61eb528`](https://github.com/Whytalik/nucleus/commit/61eb528ed88984c300c5246846be0c82ede54e5e)
- feat(packages): update inter-package dependencies [`5cf0c29`](https://github.com/Whytalik/nucleus/commit/5cf0c29d2416364a4287576b7afb8eee799281a0)
- feat(database): add prisma schema and migration [`64e3467`](https://github.com/Whytalik/nucleus/commit/64e34675f94f6d75397f51fb237bf0ae13f4ad7b)
- feat: introduce user domain layer (entities, dtos) [`36330c9`](https://github.com/Whytalik/nucleus/commit/36330c94aeba8be28cffe4512cc8da40d5e8b18a)

### Refactoring

- refactor(packages): improve shared packages [`783c31b`](https://github.com/Whytalik/nucleus/commit/783c31bb992fac5ce42ca56c16ee7b743e64c46a)
- refactor(api): improve user module [`6b7dcae`](https://github.com/Whytalik/nucleus/commit/6b7dcaec49e7a497fcba31bc9dbbe1f911cff5f1)

## 2026-01-29

### Features

- feat: project initialization with monorepo structure [`77b317a`](https://github.com/Whytalik/nucleus/commit/77b317a6b4e9423f999d3047b1679f15e44ef2b2)

### Documentation

- docs: enhance README with emojis and better formatting [`129840e`](https://github.com/Whytalik/nucleus/commit/129840e6b66ea09715740f0e54b469c030b04e3e)

### Chores

- chore: clean up and consolidate .gitignore [`5edda3f`](https://github.com/Whytalik/nucleus/commit/5edda3f2eca513d8794de7796bd3247a2bb0685a)
- chore: remove .vscode from git tracking [`31a0d01`](https://github.com/Whytalik/nucleus/commit/31a0d01c28de4010bb1a944a08af9dc636944be5)

