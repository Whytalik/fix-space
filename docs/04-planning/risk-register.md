# Реєстр ризиків (FIX Space)

Цей документ фіксує ідентифіковані ризики проекту, їх оцінку та стратегію мітигації. Охоплює технічні, планові ризики та зовнішні залежності. Оновлюється при зміні статусу ризику або появі нових загроз.

Суміжні документи: [`milestone-estimates.md`](./milestone-estimates.md) — оцінки часу, [`../03-architecture/algorithms.md`](../03-architecture/algorithms.md) — складні алгоритми, [`../06-testing/strategy.md`](../06-testing/strategy.md) — тест-стратегія.

---

## 1. Модель оцінки

Risk Level = Probability × Impact:

| Імовірність \ Вплив | Низький  | Середній | Високий   |
| ------------------- | -------- | -------- | --------- |
| **Низька**          | Низький  | Низький  | Середній  |
| **Середня**         | Низький  | Середній | Високий   |
| **Висока**          | Середній | Високий  | Критичний |

---

## 2. Технічні ризики

| #   | Ризик                                                                                                                                                                                                 | Імовірність | Вплив     | Рівень        | Мітигація                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | **Покриття тестами нижче цілі** — поточне 53%, ціль ≥70% ([`strategy.md §4`](../06-testing/strategy.md)). Відсутні тести: formula edge cases, error handlers, property type validation                | Висока      | Середній  | **Високий**   | Додаткові unit-тести для `formula.handler`, типів властивостей, pipeline помилок; `turbo test --coverage` перед M5                                                         |
| T2  | **Цикл у формулах не виявляється під час виконання** — cycle detection відбувається тільки при збереженні конфігурації Property, не при eval ([`algorithms.md §3`](../03-architecture/algorithms.md)) | Низька      | Високий   | **Середній**  | Розширити cycle detection на час виконання; тест з круговою залежністю A→B→A                                                                                               |
| T3  | **Рекурсія в Automations** — field-change action може тригерити ланцюг із 10 правил, якщо recursion guard не спрацює ([`algorithms.md §6`](../03-architecture/algorithms.md))                         | Низька      | Високий   | **Середній**  | `isProcessing` flag per record у сервісі; тест сценарію "automation triggers automation"                                                                                   |
| T4  | **4-pass Space initialization** — помилка у Pass 3 (RELATION resolve) залишає частково ініціалізований простір без rollback ([`algorithms.md §4`](../03-architecture/algorithms.md))                  | Середня     | Критичний | **Критичний** | `prisma.$transaction()` з повним rollback при будь-якій помилці; інтеграційний тест з навмисним fail у Pass 3                                                              |
| T5  | **Frontend UI без E2E тестів** — Next.js інтерфейс не покрито browser-рівневими тестами ([`strategy.md §3.3`](../06-testing/strategy.md))                                                             | Висока      | Середній  | **Високий**   | Мануальне тестування golden path перед кожним milestone; Postman покриває API рівень; smoke test у браузері                                                                |
| T6  | **Next.js 16 + React 19 — cutting edge** — minor версії можуть мати breaking changes у Server Components та App Router                                                                                | Середня     | Середній  | **Середній**  | Зафіксувати точні версії в pnpm lockfile; не оновлювати без тестування                                                                                                     |
| T7  | **JWT access token не відкликається** — при компрометації токен діє до 15 хв; тільки refresh rotation детектує replay attack                                                                          | Низька      | Середній  | **Низький**   | Прийнятий ризик; 15 хв вікно мінімізує збитки; `RefreshToken.revokedAt` детектує повторне використання                                                                     |
| T8  | **PropertyValue.value (JSONB) не зашифрований на рівні застосунку** — при компрометації БД всі торгові дані читаємі                                                                                   | Низька      | Середній  | **Низький**   | Прийнятий ризик; encryption at-rest на рівні Railway infrastructure; Prisma не підтримує transparent field encryption ([`security.md §8`](../03-architecture/security.md)) |

---

## 3. Часові / Планові ризики

| #   | Ризик                                                                                                                                                                                    | Імовірність | Вплив     | Рівень        | Мітигація                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------- | ------------- | ------------------------------------------------------------------------------------------------ |
| S1  | **M1 = критичний шлях** (38 дн з буфером) — будь-яка затримка блокує M2–M4; без готового API неможливо розпочати Feature Complete ([`milestone-estimates.md`](./milestone-estimates.md)) | Середня     | Критичний | **Критичний** | Щотижневий progress review; при затримці — скорочувати scope M1 (перенести Automation в M2)      |
| S2  | **Trading integrations складніші за оцінку** — реєстрація додатку в Spotware (cTrader) потребує схвалення 2–4 тижні; MetaTrader 5 інтеграція через сторонній SDK                         | Висока      | Середній  | **Високий**   | Подати заявку на cTrader API access на початку M3, не чекати M4; fallback — CSV-import позицій   |
| S3  | **Formula engine + Automation одночасно в M1** — обидва модулі мають складний AST/рекурсивний стек; недооцінка → зсув критичного шляху                                                   | Середня     | Високий   | **Високий**   | TDD: спочатку тести на presets і рекурсію, потім реалізація; декомпозиція на subtasks ≤2 дн      |
| S4  | **Solo розробник** — хвороба або форс-мажор зупиняє весь проект; паралельна розробка неможлива                                                                                           | Середня     | Середній  | **Середній**  | 20–30% buffer у кожному milestone; M5 (документація) стартує паралельно з M3                     |
| S5  | **Академічний графік** — сесія, здача звітів, підготовка до захисту перетинаються з M4/M5                                                                                                | Середня     | Середній  | **Середній**  | Запланувати buffer у "тижні сесії"; не починати складні фічі за 2 тижні до академічного дедлайну |

---

## 4. Зовнішні залежності

| #   | Залежність                                 | Ризик                                                                                                 | Рівень       | Мітигація                                                                                      |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| D1  | **Docker Desktop** (`postgres:16`)         | Недоступний Docker → локальна розробка зупиняється; конфлікт версій образу                            | **Середній** | Зафіксувати image tag `postgres:16`; fallback — Supabase free tier для dev                     |
| D2  | **SMTP-провайдер** (Nodemailer)            | Без SMTP email-верифікація не надсилається → auth flow зламаний у dev                                 | **Середній** | Mailtrap.io для dev; `SMTP_HOST` порожній у `.env.test` — тести мокають відправку              |
| D3  | **Binance / Bybit / OKX REST API**         | API key policies та rate limits можуть змінитись; sandbox середовище відрізняється від production     | **Середній** | Read-only API keys для тестування; документувати rate limits у тест-кейсах                     |
| D4  | **MetaTrader 5** (Investor Password)       | Desktop-орієнтована платформа; інтеграція потребує broker-specific SDK або MetaApi (сторонній сервіс) | **Високий**  | Підтвердити MetaApi SDK сумісність до початку M4; fallback — manual CSV import                 |
| D5  | **cTrader OAuth 2.0** (Spotware)           | Реєстрація додатку + схвалення від Spotware займає 2–4 тижні; без creds — integration не тестується   | **Високий**  | Подати заявку до початку M3; cTrader FIX API як резервний варіант                              |
| D6  | **Finnhub API** (Economic Calendar widget) | Free tier: 60 req/min; при перевищенні — 429; виджет недоступний                                      | **Низький**  | Server-side кеш з TTL 1h знижує запити до ~24/день; fallback — повідомлення "дані оновлюються" |
| D7  | **Vercel + Railway**                       | Platform outage → система недоступна під час демо або захисту                                         | **Низький**  | Локальний dev build для fallback демонстрації; Railway має автоматичний restart                |

---

## 5. Залишкові ризики (свідомо прийняті в v1.0)

| Ризик                                      | Причина прийняття                                                         | Пом'якшення                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------- |
| Немає 2FA                                  | Поза scope v1.0; single-user platform знижує ймовірність цільової атаки   | Мінімум 8 символів + bcrypt 10 rounds         |
| Немає security audit log                   | AutomationLog фіксує дії автоматизацій; security audit — scope v2.0       | JWT `sub` (userId) дозволяє посмертний аналіз |
| Frontend без браузерних E2E тестів         | Cypress/Playwright — окремий scope; Postman покриває API контракт         | Мануальний smoke test перед кожним milestone  |
| JWT access token не відкликається до 15 хв | Індустріальний стандарт для stateless auth; 15 хв window мінімізує збиток | Refresh token rotation детектує replay        |

Детально — [`security.md §10`](../03-architecture/security.md).

---

## 6. Зведена таблиця пріоритетів

| Рівень        | Ризики                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Критичний** | T4 — 4-pass initialization без гарантованого rollback · S1 — M1 є критичним шляхом                                                                                        |
| **Високий**   | T1 — coverage 53% vs ціль 70% · T5 — frontend без E2E · S2 — cTrader/MT5 реєстрація · S3 — formula+automation в M1 · D4 — MetaTrader 5 SDK · D5 — cTrader OAuth схвалення |
| **Середній**  | T2 — formula cycle at runtime · T3 — automation recursion · T6 — Next.js cutting edge · S4 — solo developer · S5 — академічний графік · D1 — Docker · D2 — SMTP           |
| **Низький**   | T7 — JWT revocation · T8 — JSONB unencrypted · D3 — trading API rate limits · D6 — Finnhub · D7 — Vercel+Railway                                                          |

---

## 7. Перехресні посилання

| Документ                                                                | Що покриває                                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`algorithms.md §3–§6`](../03-architecture/algorithms.md)               | Formula engine, Property Type Registry, Space initialization, Automation recursion |
| [`security.md`](../03-architecture/security.md)                         | JWT, bcrypt, CORS, rate limiting, залишкові ризики безпеки                         |
| [`../06-testing/strategy.md`](../06-testing/strategy.md)                | Coverage 53% vs 70%, E2E coverage gaps, exit criteria                              |
| [`milestone-estimates.md`](./milestone-estimates.md)                    | M1 critical path, 119 дн загальна тривалість, 20-30% buffer                        |
| [`tech-stack-decisions.md`](../03-architecture/tech-stack-decisions.md) | Вибір bcryptjs vs argon2, Vercel+Railway, Prisma vs TypeORM                        |
