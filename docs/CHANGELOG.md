# Changelog

## 2026-03-14

### Features

- feat(api): wire template system into initialization, record creation, and AppModule [`f6b75a4`](https://github.com/Whytalik/nucleus/commit/f6b75a4f0b944fe2c41c53a094a39ca297d7b686)
- feat(template): add Template and TemplatePropertyValue CRUD modules with service, controller, and tests [`c39c787`](https://github.com/Whytalik/nucleus/commit/c39c7871825bd74fd9e097defcbcc11c6b1636a1)

## 2026-03-13

### Features

- feat(domain): add Template and TemplatePropertyValue DTOs, entities, and exports [`042ee54`](https://github.com/Whytalik/nucleus/commit/042ee54aa4084b7efa4e443402c0f48a3873967b)
- feat(database): add Template and TemplatePropertyValue schema models [`8a6abcb`](https://github.com/Whytalik/nucleus/commit/8a6abcbc4815254c1cf10f9fe298c27855facd22)

### Tests

- test: fix spec coverage for property, record, and space; add settings service and project docs [`42939cf`](https://github.com/Whytalik/nucleus/commit/42939cfeb42de292f12da6a098367603f0ea4fd2)

### Documentation

- docs: update architecture and API overview for template system [`fa42601`](https://github.com/Whytalik/nucleus/commit/fa426012864487d1a961a9326177024f568104f9)

## 2026-03-12

### Features

- feat(api): implement record limit, pagination, settings, and workspace initialization [`b74bdc9`](https://github.com/Whytalik/nucleus/commit/b74bdc921d6809a21549b382a9d9515e62dda312)
- feat(domain): extend DTOs with recordLimit, property config, and settings interfaces [`064673a`](https://github.com/Whytalik/nucleus/commit/064673a64572266659f58d6dc8bd367acdbd8e80)

### Chores

- chore: update DB schema, tighten TypeScript config, and bump dependencies [`feebaa5`](https://github.com/Whytalik/nucleus/commit/feebaa5ac5339a243e43e9b4f3849d3081faafdd)

## 2026-03-10

### Documentation

- docs: update architecture guide, CHANGELOG, and Postman collection [`f7adb10`](https://github.com/Whytalik/nucleus/commit/f7adb1018698f612b2810e9a93b0ed97a847524e)
- docs: rewrite README with current tech stack, features, and setup instructions [`d09eb98`](https://github.com/Whytalik/nucleus/commit/d09eb98ce331ca926559983042b8224bd27df9c1)

### Chores

- chore: fix pre-push hook to skip missing docs files [`1b0ab91`](https://github.com/Whytalik/nucleus/commit/1b0ab91c7184c11752b36454c8218052f29ad0e9)
- chore: update .gitignore (add *.tmp.* pattern) and turbo.json pipeline [`d48078a`](https://github.com/Whytalik/nucleus/commit/d48078ae1523e173a1ac8ad0bf497090ed15e063)

## 2026-03-09

### Features

- feat(web): update root layout, database pages, and auth pages with new shell components [`d80ceed`](https://github.com/Whytalik/nucleus/commit/d80ceedd571c9b2d80c87889907198aaec87b1cb)
- feat(web): add reset-password page and custom 404 page [`3f8876e`](https://github.com/Whytalik/nucleus/commit/3f8876e676245dfd17c9ee1239a9cb33a8da0702)
- feat(web): add profile page and settings shell with profile tab [`6414d4d`](https://github.com/Whytalik/nucleus/commit/6414d4d0d1bd8d997fbe6ecf46a23030026c989d)
- feat(web): add full-page record view with inline edit mode [`3e796a4`](https://github.com/Whytalik/nucleus/commit/3e796a44f78e3e042055a0b8cb3f4505caaf9317)
- feat(web): update database table with CellValue renderer and record navigation link [`2fdd161`](https://github.com/Whytalik/nucleus/commit/2fdd161fadd08c4845db980fbb1641d708588190)
- feat(web): add property display components (icon, hint, input, relation input) [`b0f583d`](https://github.com/Whytalik/nucleus/commit/b0f583dc2975de7d4b237bc0c71dd9e0c5cafdd5)

## 2026-03-08

### Features

- feat(web): add space switcher and page header with database actions [`9ba4206`](https://github.com/Whytalik/nucleus/commit/9ba42062511aefcd8a5bb766c1ac5a5993243b90)
- feat(web): add collapsible sidebar with drag-and-drop section/database reordering [`97ab9f7`](https://github.com/Whytalik/nucleus/commit/97ab9f7b886c52f6929181b625274ae39a2586ef)
- feat(web): add UI primitive components (button, badge, avatar, card, overlays, icons, form, color-picker) [`66cb910`](https://github.com/Whytalik/nucleus/commit/66cb91079f162359ed42414994a005cafd87fa33)
- feat(web): add custom hooks for modal, mutation, and space/database state management [`f9a53e9`](https://github.com/Whytalik/nucleus/commit/f9a53e9f8b8e4a471cb9529e161b30700e697c81)
- feat(web): add UIContext for global error and settings panel state [`b395ac5`](https://github.com/Whytalik/nucleus/commit/b395ac52893c7a9ed3a2344c7331ab232e0e3848)
- feat(web): add auth middleware for route protection and redirects [`1868925`](https://github.com/Whytalik/nucleus/commit/1868925ac88ce199de4ae714d13c211346bc68ec)
- feat(web): add storage abstraction, API clients for property/record, and utility helpers [`9dc454f`](https://github.com/Whytalik/nucleus/commit/9dc454f7a26f1387b6d50b3684cb51bf1bbcbf63)
- feat(web): add CSS design token system (tokens, base, components, utilities) [`8b176b4`](https://github.com/Whytalik/nucleus/commit/8b176b4f2d1e261631dfb9bfda66b38739503602)

## 2026-03-07

### Features

- feat(database): add POST /:id/duplicate endpoint to DatabaseController [`2c5d417`](https://github.com/Whytalik/nucleus/commit/2c5d417e1521e9d64c7f124ded3327d46182fd4b)
- feat(database): implement DuplicateDatabaseUseCase with atomic property and record copy [`b5d8fcf`](https://github.com/Whytalik/nucleus/commit/b5d8fcfe834a9714dccba0f13015d01356a37fc5)

### Tests

- test(api): update space, record, settings, user, and e2e specs [`a43c6f1`](https://github.com/Whytalik/nucleus/commit/a43c6f14c66d80e3562a145b824955f96fb6d0af)
- test(config,jwt,database): add initialization config, JWT strategy, and duplicate usecase specs [`13f0187`](https://github.com/Whytalik/nucleus/commit/13f01873b4a8489e1af3ca6b64a579a57280dd20)
- test(common): add specs for filters, interceptors, and cookie helper [`af54e94`](https://github.com/Whytalik/nucleus/commit/af54e94a2b9583797a69c89d6ff1c6be2b1c0d63)
- test(auth): add controller, guard, and usecase specs [`5709c52`](https://github.com/Whytalik/nucleus/commit/5709c524b51bb5f8a72adcdf549135a2f657e407)
- test(property): add unit specs for all eight property type handlers [`287d711`](https://github.com/Whytalik/nucleus/commit/287d7115a8fad791e0233b53350fbe98160b290d)

## 2026-03-06

### Features

- feat(auth): implement forgot-password and reset-password flow [`907cf3f`](https://github.com/Whytalik/nucleus/commit/907cf3fb5807e3120dd343b28e7c9c0abae414a9)
- feat(domain): add ForgotPasswordDto, ResetPasswordDto, and ChangePasswordDto [`becf2df`](https://github.com/Whytalik/nucleus/commit/becf2df011771ee1118b25f8e801877ef9d7cd8b)
- feat(db): add PasswordResetToken model to Prisma schema [`255ed6b`](https://github.com/Whytalik/nucleus/commit/255ed6bb139e3f6ebcaceb901ed30ed8e5af1ccc)
- feat(auth): add dev-only test utility endpoints and update common infrastructure [`3403dac`](https://github.com/Whytalik/nucleus/commit/3403dacdf3be0ca2082b2c56395a7769baaa79d2)
- feat(auth): add ResourceOwnerGuard and @RequireOwnership() decorator [`8a43846`](https://github.com/Whytalik/nucleus/commit/8a4384648b32ee4e29c0755c5aec10f3ba7ff40f)
- feat(auth): add DevOnlyGuard and @DevOnly() composite decorator [`2585062`](https://github.com/Whytalik/nucleus/commit/258506285c36946162395b45f29d5f438bc03220)
- feat(domain): add group, color, hint fields to PropertyResponseDto [`739d558`](https://github.com/Whytalik/nucleus/commit/739d558c7a9438379d83bf98afc1ddfbf8e85ae8)

### Refactoring

- refactor(auth): move RegisterUserUseCase into providers/ subdirectory [`ae32b89`](https://github.com/Whytalik/nucleus/commit/ae32b89b0d6f5ef739e2bb1765a5aaecc5836e51)
- refactor(property): update select, status, relation, formula handlers to dual interface [`864ecdb`](https://github.com/Whytalik/nucleus/commit/864ecdbdf21d75d72df5549afc1c7f03755b8def)
- refactor(property): update text, number, checkbox, date handlers to dual interface [`625a04b`](https://github.com/Whytalik/nucleus/commit/625a04babf0e6dac3a133a824cf4a229c234181e)
- refactor(property): split IPropertyHandler into PropertyConfigHandler and PropertyValueHandler [`8c426c5`](https://github.com/Whytalik/nucleus/commit/8c426c5ed448cd97f4522a0d57d50abb1413bf45)
- refactor(api): remove record-content module and simplify record service [`9fe0195`](https://github.com/Whytalik/nucleus/commit/9fe01951a2abf6ca1132458076f272d9d764f977)

## 2026-03-05

### Bug Fixes

- fix(web): remove @nucleus/ui package, inline styles and migrate components to local [`9ba0af2`](https://github.com/Whytalik/nucleus/commit/9ba0af28c042e02cce96f2e0bb198951b0a726c9)

### Refactoring

- refactor(space): extract sectionsInclude constant for DRY Prisma queries [`345a647`](https://github.com/Whytalik/nucleus/commit/345a6479ec789f9e8d65421f234ad745187cbe66)
- refactor(domain): remove record-content types and clean domain entry barrel [`8ac601f`](https://github.com/Whytalik/nucleus/commit/8ac601fe3c703111eb05e2859efa60fa82112a28)
- refactor(config): rename ConfigModule to InitializationConfigModule [`913e2bd`](https://github.com/Whytalik/nucleus/commit/913e2bda9cdcfce283d18f626db97b4160de1893)

### Chores

- chore(api): remove default AppController and AppService scaffolding [`1187b66`](https://github.com/Whytalik/nucleus/commit/1187b664d6def84d07fe758e5a92fb1faf58d84a)

## 2026-03-04

### Documentation

- docs: replace stale app readmes with centralized project documentation [`5352f43`](https://github.com/Whytalik/nucleus/commit/5352f43903ee8346f1ef3f6e42d414e32fbe0816)

### Chores

- chore: update pnpm lockfile [`133f122`](https://github.com/Whytalik/nucleus/commit/133f1225cf71cb3d46a2b622b21649ad611ff657)
- chore: add pre-push hook for automated changelog and stats [`414b86a`](https://github.com/Whytalik/nucleus/commit/414b86a02855a392d0e7e833397633b8ae215611)
- chore: update monorepo config and remove legacy files [`ae6afe5`](https://github.com/Whytalik/nucleus/commit/ae6afe5a4d59b1caa8011a127908683ba71bf489)

## 2026-03-02

### Features

- feat(web): use IconDisplay in sidebar and database item [`d310407`](https://github.com/Whytalik/nucleus/commit/d3104075e9e19d8715ec97e5c36815c2a3362288)
- feat(web): add database view components [`e3c4f7d`](https://github.com/Whytalik/nucleus/commit/e3c4f7dbdd0f2b7a4a65666418f991f858e9e009)
- feat(web): add IconPicker and IconDisplay UI components [`359f6d9`](https://github.com/Whytalik/nucleus/commit/359f6d9a689cb5ad4eabee63856e8ae8c74bc959)
- feat(web): add database route layout with auth guard and update page [`6aa99ee`](https://github.com/Whytalik/nucleus/commit/6aa99ee29e5cdc292f2521e96d2c93afce216114)
- feat(web): add DatabaseContext for per-database state [`069c878`](https://github.com/Whytalik/nucleus/commit/069c878606cdde4b411d5915f779eba66a028b50)
- feat(web): add updateDatabaseInSpace to AppContext [`b35d592`](https://github.com/Whytalik/nucleus/commit/b35d59202c8de08a04510b7b8e5263330117ce13)
- feat(web): add database API module [`a8d1ba4`](https://github.com/Whytalik/nucleus/commit/a8d1ba48b4e580ec1c8ca62370f624503d3d8f2b)
- feat(web): implement token refresh and redirect in API client [`0d3c3eb`](https://github.com/Whytalik/nucleus/commit/0d3c3eb1c2f8df2587710396c563f0bc4a8f361d)
- feat(api): expand initialization config with full property definitions [`db35928`](https://github.com/Whytalik/nucleus/commit/db359284eaaac06329fbe2ba7273485dbdcd2ea6)
- feat(api): implement 3-pass space initialization with property seeding [`cb5b5ec`](https://github.com/Whytalik/nucleus/commit/cb5b5ec7932969b5b7eae02bebc5269d76067502)
- feat(api): use explicit property list in DatabaseService.create [`bc8c26d`](https://github.com/Whytalik/nucleus/commit/bc8c26d0baffac9f1bf3107863a00083889d56e4)
- feat(domain): add payouts database type and type CreateDatabaseDto properties [`5044da5`](https://github.com/Whytalik/nucleus/commit/5044da53cf220d0a4afdbaafbdde1b9f1d366bd8)

### Bug Fixes

- fix(web): correct autocomplete attribute and placeholder on register form [`2d757f9`](https://github.com/Whytalik/nucleus/commit/2d757f9896e1c3a4007614a64f1a132576b3c52d)
- fix(web): update header components to use DatabaseContext and IconDisplay [`295b425`](https://github.com/Whytalik/nucleus/commit/295b42592122bc7d45b893bd57575cd19966b38f)

### Refactoring

- refactor(api): move ThrottlerModule registration to global app module [`3440823`](https://github.com/Whytalik/nucleus/commit/344082361b8987c8fc7ecf7d790cc34813758da8)
- refactor(domain): replace select options array with category groups [`33e7d0a`](https://github.com/Whytalik/nucleus/commit/33e7d0a5cfd66352f47a0d850a1cc953f5f6138c)

### Chores

- chore(web): add emoji-mart dependencies [`c2ef20e`](https://github.com/Whytalik/nucleus/commit/c2ef20e1162ec09897290b5dc905f7347d820c43)

## 2026-02-28

### Features

- feat(web): add settings modal with tabbed navigation and settings page [`24f2dcb`](https://github.com/Whytalik/nucleus/commit/24f2dcbed2895fd9794ebeccf2ce4c73226b5c0f)
- feat(web): add settings API client for space, database, and section [`e475bc0`](https://github.com/Whytalik/nucleus/commit/e475bc0aff3ab131ead421f9192172dbe8dcbfcb)
- feat(web): add database detail page route [`f508983`](https://github.com/Whytalik/nucleus/commit/f508983aaedc2282988c90321d271834bc85dcac)
- feat(web): update sidebar and database-item with active states and routing [`2b22771`](https://github.com/Whytalik/nucleus/commit/2b227712ba491ebc6630415b96f03e06624de419)
- feat(web): update header with user actions and database info display [`2a48694`](https://github.com/Whytalik/nucleus/commit/2a486942c5e3b274c809b2cbb187fdf25aae8c36)
- feat(web): update app context with caching and session management [`8030c06`](https://github.com/Whytalik/nucleus/commit/8030c06d4cb02a0faffefa2918ef6579e87d128c)
- feat(web): update home page and root layout with app provider and sidebar [`a3e36a0`](https://github.com/Whytalik/nucleus/commit/a3e36a025cd90c818eb8637823d46e95d48ccc00)
- feat(domain): add optional sectionKey and properties fields to CreateDatabaseDto [`8f6f2ed`](https://github.com/Whytalik/nucleus/commit/8f6f2ed99f0877d27228ad122f7f9ad500b73fda)
- feat(web): add space api client and cache utilities [`98fd9ae`](https://github.com/Whytalik/nucleus/commit/98fd9aee7aa7ef237077dc18287047b5bfe82d41)
- feat(web): add app context provider for auth and workspace state [`18ce881`](https://github.com/Whytalik/nucleus/commit/18ce881b8b185ce58afafef0911d28b5011fea20)
- feat(web): update root layout and home page to use shared ui components [`90e8abc`](https://github.com/Whytalik/nucleus/commit/90e8abc07511e298e90736cdb4ad90d0f8b16309)
- feat(web): add header with auth-aware navigation and footer [`082b287`](https://github.com/Whytalik/nucleus/commit/082b2873660e23ca3bb7f65c791434f714ba48c9)
- feat(web): add register page with email verification flow [`9b442cb`](https://github.com/Whytalik/nucleus/commit/9b442cb89b4fa28d5dabf4223385b982d71a8d40)
- feat(web): add login page with form and error handling [`333e934`](https://github.com/Whytalik/nucleus/commit/333e934fdf0af991262d621f23cc6e1d09919f46)
- feat(web): add api client with bearer token support and typed error handling [`5c520ca`](https://github.com/Whytalik/nucleus/commit/5c520caab43670741697b9b7e6e93f9ea450e9d2)
- feat(auth): add dev-only endpoints for e2e test setup [`7f1aba5`](https://github.com/Whytalik/nucleus/commit/7f1aba5fa89815f3a9f283e3562270a49a3b420e)
- feat(auth): expose access token in response body and support bearer auth in jwt strategy [`f843e9e`](https://github.com/Whytalik/nucleus/commit/f843e9ee7f1321b93285a2f1e6b6a02a7e1aa711)
- feat(auth): add email verification token flow with expiration and revocation [`13f8a0d`](https://github.com/Whytalik/nucleus/commit/13f8a0d8d1e4e48012f6a96f2637296d3a65cf72)
- feat(ui): initialize shared ui package with button, card, and logo components [`2f46620`](https://github.com/Whytalik/nucleus/commit/2f46620dade74108359b09653fe3f9308cd3df50)

### Bug Fixes

- fix(web): remove unused @nucleus/database dependency to fix vercel build [`3a59ccb`](https://github.com/Whytalik/nucleus/commit/3a59ccb651fdb07ce44144cca9415e88673f9f80)
- fix(deploy): build domain before web via turbo filter and simplify database page [`8b6f083`](https://github.com/Whytalik/nucleus/commit/8b6f0834a51b927ff4807d0ccb9dc35b2c89e049)
- fix(web): annotate section type in database page flatMap [`14b5f4a`](https://github.com/Whytalik/nucleus/commit/14b5f4a9326bdb270bdc0e12d16b69dcf948427e)
- fix(config): update domain build script and add ui transpilation in next.js [`24b0fce`](https://github.com/Whytalik/nucleus/commit/24b0fcef4c48eed5126792c4c4cea6322dd88d1a)
- fix(deploy): track vercel.json and fix Next.js output directory [`82c3033`](https://github.com/Whytalik/nucleus/commit/82c3033f7f856a76c3d724d8f46e3f71bbf0b11d)
- fix(deploy): enable experimentalDecorators for domain DTOs in web [`4bbfc7f`](https://github.com/Whytalik/nucleus/commit/4bbfc7f650c2b1974dea5db71f2fd92993424b89)
- fix(deploy): disable strictPropertyInitialization for domain DTOs in web [`0cd8c1d`](https://github.com/Whytalik/nucleus/commit/0cd8c1d4355b7c79afaa6b05788086c61e1e90a6)
- fix(deploy): transpile @nucleus/domain in Next.js and export TypeScript source [`44c0cab`](https://github.com/Whytalik/nucleus/commit/44c0cab7d19ec26a296a145c88a8c7431ea2b63d)
- fix(deploy): update pnpm-lock.yaml after ui package dependency cleanup [`27ac519`](https://github.com/Whytalik/nucleus/commit/27ac519493aad30e023c3d561a0f487e7171797a)
- fix(deploy): add .npmrc for pnpm on Vercel and transpile @nucleus/ui in Next.js [`2a582b7`](https://github.com/Whytalik/nucleus/commit/2a582b72ef145d322a8499ffd668537385250dec)

### Refactoring

- refactor(web): reorganize components into layout and home directories [`32a137b`](https://github.com/Whytalik/nucleus/commit/32a137b72d6a6d1cacf183f7cdea094b603a8c74)

### Chores

- chore: update lockfile after removing @nucleus/database from web deps [`98c39be`](https://github.com/Whytalik/nucleus/commit/98c39be1395391cf35880cd153b289b1390e097c)
- chore: standardize quotes to double quotes across monorepo [`05e3526`](https://github.com/Whytalik/nucleus/commit/05e352647dbf8b9b2339dc71dbc55100cca34bfc)
- chore: apply prettier formatting across all packages [`ce8be3c`](https://github.com/Whytalik/nucleus/commit/ce8be3c7e86137aa4e5d8cca3386ab1d9d3636b3)

## 2026-02-24

### Features

- feat(api): initialize property values for existing records on property creation [`a26c6f1`](https://github.com/Whytalik/nucleus/commit/a26c6f1474cd68970a1ec59d4a60701412f16e3d)
- feat(api): support Bearer token auth and expose access token in response [`051e948`](https://github.com/Whytalik/nucleus/commit/051e948bc85dcdb21089ad3ba599144174cf8f2d)
- feat(api): add dev-only endpoints for e2e test setup [`98ebcb7`](https://github.com/Whytalik/nucleus/commit/98ebcb78fcb76a4947738b408f27c30982f46f47)

### Refactoring

- refactor(api): extract userId directly from CurrentUser decorator in settings [`4f2a7d1`](https://github.com/Whytalik/nucleus/commit/4f2a7d1c613c2a94d6b2e95d736816e217dcd60a)

## 2026-02-23

### Features

- feat(api): add tests for all current modules [`ac61552`](https://github.com/Whytalik/nucleus/commit/ac61552ec912d355bba3d608944668eff1edeb5f)
- feat(api): add record config [`afa586c`](https://github.com/Whytalik/nucleus/commit/afa586cb14e517292c3c7d8c4fc848b7821220da)
- feat(api): implement property value processing for records [`88a1ae6`](https://github.com/Whytalik/nucleus/commit/88a1ae63208880ace2ba5ff71373dad5216dfefe)
- feat(api): add new handlers for proprty types [`4a1e521`](https://github.com/Whytalik/nucleus/commit/4a1e52182914f888a7e18446322af9c9f25f6014)

### Refactoring

- refactor(api): clean up imports and enforce code style [`d2df705`](https://github.com/Whytalik/nucleus/commit/d2df7050858cddc952d0bc522469e6aed1242670)
- refactor(api): add verification of the ownership of resources for a specific user [`9d29a9b`](https://github.com/Whytalik/nucleus/commit/9d29a9b1f49316a3df8673ab752661bb0d741f1b)

## 2026-02-21

### Features

- feat(domain): add property type configs for all property types [`7efd576`](https://github.com/Whytalik/nucleus/commit/7efd5761813b8b8556f9c90efe488789f3a83a7a)
- feat(database): use property type registry for default property config [`98b26fa`](https://github.com/Whytalik/nucleus/commit/98b26faac22e0ec2943ae8eb2963f587015cbaf2)
- feat(property): register handlers in module and integrate registry into service [`55fc43b`](https://github.com/Whytalik/nucleus/commit/55fc43bf0f2558d9d9cc9dbfc144f4c9dea6b636)
- feat(property): implement strategy + registry pattern for property type handlers [`0e4e74b`](https://github.com/Whytalik/nucleus/commit/0e4e74b7f34a64af4e52d3a3d1f4c74ab6207d5a)
- feat(domain): add property type interfaces and config field to DTO [`704333a`](https://github.com/Whytalik/nucleus/commit/704333a3683a96e3557011a388f2cec8f0a5e20a)

### Bug Fixes

- fix(build): add .prettierignore and fix database format script [`7e689e8`](https://github.com/Whytalik/nucleus/commit/7e689e88677ccb633fd63094ee658121ebde0ce3)

### Refactoring

- refactor(property): use domain type constants in handlers and remove local configs [`fb2fb40`](https://github.com/Whytalik/nucleus/commit/fb2fb4046ce55fdb1753226748ce1b6b3b07d233)

### Documentation

- docs: update README [`e090426`](https://github.com/Whytalik/nucleus/commit/e090426d44d7b7996aa521fb72589eba88e04040)

### Chores

- Add environment variables for GitLab mirror job [`83b8a24`](https://github.com/Whytalik/nucleus/commit/83b8a24deeac5d4634d23333c523179f9ec3e2f6)
- Add debug step for GitLab repository secrets [`3b3dfd9`](https://github.com/Whytalik/nucleus/commit/3b3dfd9b517a7ebaf64745d465dc7f975fc7fe3f)
- Add GitHub Actions workflow to mirror to GitLab [`d11f547`](https://github.com/Whytalik/nucleus/commit/d11f5471e5925a866c94a3cee1f1d545e63e64d7)

### Style

- style: apply prettier formatting across codebase [`da4bad4`](https://github.com/Whytalik/nucleus/commit/da4bad430c101d9cdad8ce5d20d3cc5c0f3d1084)

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

### Features

- feat(api): add extensible property type system [`5181865`](https://github.com/Whytalik/nucleus/commit/51818655168eac619292d5cab1cf433793dd8a09)
- feat(api): enhance services with validation and structured logging [`f5287fd`](https://github.com/Whytalik/nucleus/commit/f5287fd0694592029d5ea310525c3184fca5f6b3)

### Refactoring

- refactor(api): inline section management into space module [`f469abc`](https://github.com/Whytalik/nucleus/commit/f469abc6f7fd2c4f3264f8ef6979bb625cbdca4c)
- refactor(api): relocate config schemas to respective modules [`557a6a1`](https://github.com/Whytalik/nucleus/commit/557a6a171a8830f87f4055ff29ca5ead7e6617fd)

### Chores

- chore(db): add auth token models and isVerified field [`d87ef29`](https://github.com/Whytalik/nucleus/commit/d87ef2951e394de26e32ca74b831c8583e30564e)

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

- chore: update docker-compose and environment config [`0cb0e59`](https://github.com/Whytalik/nucleus/commit/0cb0e596cc012fe4d3f011b2cc125c5c289f452a)
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

