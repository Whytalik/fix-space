# Release Checklist

Чеклист виконується перед кожним merge до `develop` та перед фінальним релізом. Базується на Definition of Done проекту.

---

## Code & Quality

- [ ] `turbo lint` — 0 errors, 0 warnings
- [ ] `turbo build` — збірка всіх пакетів успішна
- [ ] `pnpm --filter @fixspace/api test` — 0 failed
- [ ] `pnpm --filter @fixspace/api test -- --coverage` — statement coverage ≥ 70%
- [ ] `pnpm --filter @fixspace/web test` — 0 failed
- [ ] Нові файли не містять `console.log` (лише `AppLogger`)
- [ ] Немає закоментованого коду

## API

- [ ] Всі нові ендпоінти перевірені в Postman (200 / 201 на happy path)
- [ ] Помилкові сценарії повертають коректні HTTP-статуси (400, 401, 403, 404)
- [ ] Запит без токена на захищений ендпоінт → 401
- [ ] Чужий ресурс → 403 (ResourceOwnerGuard)
- [ ] Postman-колекція (`docs/06-testing/postman/postman_collection.json`) оновлена

## Web UI

- [ ] Нові компоненти мають unit-тести (`*.test.tsx`)
- [ ] Тести перевіряють рендер, props та інтерактивність
- [ ] Smoke-тест у браузері пройдено
- [ ] Адаптивність перевірена (mobile/tablet/desktop)

## Database

- [ ] `turbo db:migrate:dev` виконується без помилок
- [ ] Prisma Studio — нові поля/таблиці відображаються коректно
- [ ] Seed-скрипт не ламається після змін схеми

## Testing Artifacts

- [ ] `docs/06-testing/test-cases/` — нові тест-кейси додані у відповідний модуль
- [ ] `docs/06-testing/rtm.md` — нові US прив'язані до тест-кейсів

## Git

- [ ] Гілка відходить від актуального `develop`
- [ ] Коміти відповідають Conventional Commits (`feat`, `fix`, `chore`…)
- [ ] PR має title у форматі `feat(scope): description`
- [ ] Немає merge-конфліктів

## Pre-release (перед тегом версії)

- [ ] `turbo test` — всі unit-тести (API + Web) зелені
- [ ] `turbo test:e2e` — всі e2e-сценарії зелені
- [ ] Smoke test: `POST /auth/login` → 200, `GET /spaces` → 200
- [ ] `docs/06-testing/coverage-report-after-development.md` оновлено
- [ ] `git tag vX.X` створено після merge
