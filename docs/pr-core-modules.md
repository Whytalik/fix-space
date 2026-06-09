## Summary

Implements the full core module suite for FIX Space — views, property groups, record duplication, dashboard, and a complete web restructuring — building on the existing Google OAuth auth foundation.

### API Changes

1. **View module** — full CRUD for database views with a per-database limit enforced via `SettingsService`; default icon pulled from the new `VIEW` settings category. Duplicate-database now copies views.

2. **Property-group module** — create/update/delete property groups within a locked or unlocked database.

3. **Property enhancements** — `POST :id/duplicate`, database-lock enforcement (`DATABASE_STRUCTURE_LOCKED`), dependency checks against views (filter/sort/group), broken-relation detection, protected/Name-property guards. All type handlers refactored to use domain type-guards. `button` property type removed; `isRequired` field dropped across the entire codebase.

4. **Record enhancements** — `POST :id/duplicate`, `POST :id/apply-template/:templateId`, name-pattern generation from template tokens (`{date}`, `{count}`, `{filtered-count}`). Filter util extended to treat Duration/Rating/Progress as numeric; search util now indexes record `content` JSON.

5. **Database / Space / Template / User** — duplicate-database copies views, section duplication (`DuplicateSectionUseCase`), dashboard aggregation (`GetDashboardUseCase`), database ordering by position, template `namePattern` + `reset` endpoint, account deletion with password confirmation + avatar cleanup.

### Web Changes

1. **Auth** — old top-level `login/register/forgot-password/reset-password/verify` pages replaced with an `(auth)` route group; Google OAuth sign-in button added; `proxy.ts` auth logic simplified.

2. **Views UI** — view tabs, view-settings modal, property-visibility panel, summary cells, add-button per view.

3. **Record detail page** — full inline-editing page at `/record/[id]` with property list, template menu, and title mutation.

4. **Dashboard redesign** — `DailyWorkflow`, `MarketSessions`, `DatabaseTodayCard` components; old `session-indicator/today-card/today-section` removed.

5. **Web restructure** — `features/` → `components/<domain>/`; flat `hooks/use*.ts` → `hooks/{api,auth,ui,layout,format}/`; `utils/` → `utils/{db,record,property,format,ui}/`. New `date-picker`, `confirm-shell`, `duplication-modal`, `page-loader`, `toast-shell` primitives.

6. **Settings** — all settings panels migrated to `components/settings/`; new `view-settings`, `integration-settings`, `delete-account-modal`.

7. **Build** — `next.config.js` adds `/api/*` rewrite + Turbopack aliases; added `@tiptap/*`, `dayjs`, `recharts` deps.

## Type of change

- [ ] Bug fix
- [x] New feature
- [x] Refactor / cleanup
- [x] Chore (config, deps, docs)

## Testing

- [x] Runs locally (`turbo dev`)
- [x] API: endpoints match DTOs
- [ ] Web: UI works, responsive layout intact
- [x] Database: migrations apply (`turbo db:generate`)
- [x] Lint: `turbo lint` — no errors
- [x] Types: `pnpm --filter @fixspace/web check-types` — no errors
- [ ] Tests: `turbo test` — green

## Documentation

- [ ] `docs/05-development/features/<slug>.md` updated (new feature)
- [ ] `docs/06-testing/` updated (test cases changed)
- [ ] Postman collection is up to date (new endpoints)

## Related issues

<!-- Closes #123, Fixes #456 -->
