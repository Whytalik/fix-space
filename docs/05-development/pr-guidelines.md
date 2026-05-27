# Pull Request Guidelines

Правила написання PR для FIX Space. Читати разом із [`git-workflow.md`](git-workflow.md).

---

## Назва PR

Формат збігається з Conventional Commits:

```
type(scope): short description
```

| Що                      | Приклад назви                                              |
| ----------------------- | ---------------------------------------------------------- |
| Нова фіча               | `feat(auth): add email verification flow`                  |
| Багфікс                 | `fix(record): prevent duplicate property values on create` |
| Рефакторинг             | `refactor(property): extract handler registry pattern`     |
| Технічний борг / конфіг | `chore(deps): upgrade NestJS to v11 and Prisma to v7`      |
| Документація            | `docs: add API contract for record endpoints`              |
| Кілька scope-ів         | `feat(api,web): add dark mode toggle`                      |

**Правила назви:**

- Нижній регістр після `:`
- Без крапки в кінці
- До 72 символів
- Конкретно: не `fix: bug`, а `fix(auth): prevent refresh loop on 401`

---

## Опис PR

Структура (відповідає `.github/pull_request_template.md`):

### Summary — обов'язково

- Одне речення: _що_ змінилось і _чому_
- Якщо є кілька логічних блоків — коротко перелічи (`**Commits:**`)
- Посилання на issue якщо є: `Closes #42`

```markdown
## Summary

Migrates the web app from a flat `/app/` directory to Next.js App Router
with `[locale]/` routing for next-intl support. Removes the old block-editor
components that were replaced by the record modal in the previous sprint.

Closes #78
```

### Type of change — тільки релевантні

Постав ✓ лише там, де дійсно є зміни. Не треба ставити всі.

### Testing — чесно

Якщо щось не зроблено — залиш пустим і напиши чому в коментарі:

```markdown
- [ ] Tests: `turbo test` — unit tests for this module removed in this PR; e2e added in #84
```

### Documentation — що оновлено

Якщо оновлено docs, README або Postman — вкажи явно. Якщо ні — видали секцію.

---

## Розмір PR

| Розмір          | Файлів (орієнтовно) | Коли OK                                            |
| --------------- | ------------------- | -------------------------------------------------- |
| **Small**       | 1–10                | Звичайний фікс, одна фіча                          |
| **Medium**      | 10–50               | Нова фіча + тести + docs                           |
| **Large**       | 50–150              | Міграція, рефакторинг кількох модулів              |
| **XL (уникай)** | 150+                | Тільки для cleanup/migration — розбий якщо можливо |

Якщо PR великий — у `Summary` обов'язково поясни чому він монолітний і що перевіряти в першу чергу.

---

## Чеклист перед відкриттям PR

```
[ ] git pull origin develop && git rebase develop  ← нема конфліктів
[ ] turbo lint                                      ← 0 errors
[ ] pnpm --filter @fixspace/web check-types         ← 0 errors
[ ] Назва PR відповідає Conventional Commits
[ ] Summary написано (не порожній placeholder)
[ ] Type of change відмічено
[ ] Postman collection up to date (якщо змінювались ендпоінти)
```

---

## Мерж

Завжди **Squash and merge** — всі коміти фічі стають одним в `develop`. Видали гілку після мержу.

Якщо треба зберегти окремі коміти (наприклад, migration + seed) — використовуй **Merge commit** і вкажи причину в Summary.
