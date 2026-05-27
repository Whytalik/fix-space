# Git Workflow: GitHub Flow + Personal Kanban

FIX Space використовує **GitHub Flow** — легкий, branch-based workflow, адаптований під solo development з Personal Kanban.

---

## Дослідження та обґрунтування вибору

### Що досліджували

Порівняно три основні Git-воркфлоу:

| Воркфлоу                                        | Джерело                                                                        | Рік  |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | ---- |
| **Git Flow** (A successful Git branching model) | [nvie.com](https://nvie.com/posts/a-successful-git-branching-model/)           | 2010 |
| **GitHub Flow**                                 | [GitHub Docs](https://docs.github.com/en/get-started/using-github/github-flow) | 2024 |
| **Trunk-Based Development**                     | [Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows)       | 2024 |

Також враховано:

- **Conventional Commits** — специфікація форматів комітів ([conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/))
- **commitlint + husky** — індустріальний стандарт валідації комітів (18.5k зірок на GitHub)
- **GitHub Projects** — канбан-дошка з полями Priority, Status, Assignee
- Методологія проекту: **Hybrid PMBoK 7** (Predictive Planning + Personal Kanban, WIP=1)

### Чому не Git Flow (стара методологія)

Git Flow був популярним стандартом, але має фундаментальні проблеми для нашого контексту:

| Проблема                          | Пояснення                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Створений не для веб-додатків** | Git Flow писався для versioned software (десктоп, мобілки), де треба підтримувати v1.0, v1.1, v2.0 одночасно. FIX Space — веб-додаток з continuous delivery |
| **Автор сам відмовився**          | Vincent Driessen у 2020 додав примітку: _"If your team is doing continuous delivery, adopt a much simpler workflow like GitHub flow"_                       |
| **5 типів гілок замість 2**       | `master` + `develop` + `feature/*` + `release/*` + `hotfix/*` — для solo dev це занадто без користі                                                         |
| **Release-гілки — зайві**         | У Git Flow кожен реліз = окрема гілка з bugfix-ами. У нас — milestone + тег на `main`                                                                       |
| **Подвійні merge**                | Кожен release/hotfix merge-иться в `master` І в `develop` — більше конфліктів, більше ручної роботи                                                         |
| **Не сумісний з Kanban**          | Git Flow передбачає "release cycles". Personal Kanban — потік задач без циклів                                                                              |

### Чому обрали GitHub Flow

| Перевага                       | Чому це важливо для FIX Space                                    |
| ------------------------------ | ---------------------------------------------------------------- |
| **Одна гілка `main`**          | Завжди робочий стан, ніяких "develop vs master" плутанин         |
| **Кожна задача = своя гілка**  | Ізольована робота, чиста історія через squash merge              |
| **PR = code review + DoD**     | Чеклист тестування автоматично підставляється                    |
| **Auto-labels**                | GitHub сам вішає лейбли по змінених файлах                       |
| **Conventional Commits**       | commitlint блокує неправильні коміти — історія завжди читабельна |
| **Сумісний з Personal Kanban** | Backlog → In Progress → Done = feature branch → PR → merge       |
| **Теги замість release-гілок** | `git tag v0.1` коли milestone готовий — ніяких додаткових гілок  |

### Висновок

GitHub Flow + Conventional Commits + Personal Kanban = **мінімум процесу, максимум контролю**. Ідеально для solo dev, який працює ітеративно з чіткими milestone.

---

> **Чому не Git Flow?** Git Flow створений для versioned software (десктоп, мобілки) з підтримкою кількох версій. FIX Space — веб-додаток з continuous delivery. Автор Git Flow сам рекомендує GitHub Flow для таких випадків ([nvie.com, 2020](https://nvie.com/posts/a-successful-git-branching-model/#note-of-reflection-march-5-2020)).

---

## Структура гілок

```
develop ──────────────────────────────────────────────── (завжди робочий)
  │
  ├── feature/auth-registration                         ← Issue #1
  ├── feature/auth-email-verify                         ← Issue #2
  ├── feature/workspace-init                            ← Issue #6
  └── fix/auth-token-expiry                             ← Issue #42
```

**Правила:**

- `develop` — єдина довгострокова гілка, завжди в робочому стані
- `feature/<name>` — нова гілка для кожної задачі з Backlog
- `fix/<name>` — гілка для багфіксів
- Гілки видаляються після merge

---

## Флоу: від Backlog до Done

### Крок 1 — Взяти задачу з Backlog

Перемісти картку з **Backlog** → **In Progress** на канбан-дошці.

### Крок 2 — Створити гілку

```bash
git checkout develop
git pull origin develop
git checkout -b feature/auth-registration
```

Назва гілки = slug з назви issue:
| Issue Title | Branch Name |
|---|---|
| User registration with email and password | `feature/auth-registration` |
| Table view: filter records by property values | `feature/view-filter-records` |
| Fix silent token refresh | `fix/auth-token-refresh` |

### Крок 3 — Робота + коміти

Кожен коміт — атомарна зміна. Формат: **Conventional Commits**.

```bash
git commit -m "feat(auth): add registration endpoint with DTO validation"
git commit -m "feat(auth): add email verification flow"
git commit -m "test(auth): add unit tests for auth service"
```

**Типи комітів:**

| Тип        | Коли                                | Приклад                                    |
| ---------- | ----------------------------------- | ------------------------------------------ |
| `feat`     | нова функціональність               | `feat(auth): add JWT refresh tokens`       |
| `fix`      | багфікс                             | `fix(auth): handle expired refresh token`  |
| `refactor` | зміна структури без зміни поведінки | `refactor(auth): extract token validation` |
| `chore`    | технічний борг, конфіг, deps        | `chore(deps): update @nestjs/core`         |
| `docs`     | документація                        | `docs: add API endpoints to README`        |
| `test`     | тести                               | `test(auth): add e2e tests for login`      |
| `ci`       | CI/CD                               | `ci: add GitHub Actions workflow`          |
| `style`    | форматування, не впливає на логіку  | `style: fix prettier formatting`           |
| `perf`     | оптимізація продуктивності          | `perf: add index on user.email`            |
| `revert`   | скасування попереднього коміту      | `revert: feat(auth): remove broken OAuth`  |

**Скоупи:**

`auth` · `workspace` · `database` · `property` · `record` · `view` · `template` · `content` · `formula` · `automation` · `statistics` · `settings` · `onboarding` · `notification` · `search` · `import-export` · `integration` · `section` · `api` · `web` · `deps`

**Commitlint** автоматично перевіряє формат. Неправильний коміт блокується:

```bash
git commit -m "fixed stuff"
# ✖ subject may not be empty [subject-empty]
# ✖ type may not be empty [type-empty]
```

### Крок 4 — Push + Pull Request

```bash
git push -u origin feature/auth-registration
gh pr create --title "feat(auth): user registration" --body "See PR template" --assignee "@me"
```

PR автоматично отримає:

- **Шаблон** з чеклистом тестування (`.github/pull_request_template.md`)
- **Лейбли** залежно від змінених файлів (`.github/labeler.yml`)
  - `apps/api/**/*` → `layer:api`
  - `apps/web/**/*` → `layer:web`
  - `packages/database/**/*` → `layer:db`

### Крок 5 — Definition of Done

Перевір чеклист у PR:

- [ ] Код написаний
- [ ] `turbo test` — 0 failed
- [ ] `turbo lint` — 0 errors
- [ ] Postman: ендпоінти працюють
- [ ] Postman-колекція оновлена
- [ ] `test-cases/<module>.md` оновлено

### Крок 6 — Merge + Cleanup

```bash
gh pr merge --squash --delete-branch
git checkout develop
git pull origin develop
```

**Squash merge** — всі коміти фічі стають одним комітом в `develop`. Історія `develop` залишається чистою.

Перемісти картку в **Done**. Закрий Issue.

---

## Milestones → Tags

Коли всі задачі milestone в **Done** — створюємо тег:

```bash
git tag -a v0.1 -m "MVP Core: Auth + Workspace + Property + Record + View + Content"
git push origin v0.1
```

| Milestone               | Tag    | Що включає                                                                     |
| ----------------------- | ------ | ------------------------------------------------------------------------------ |
| v0.1 — MVP Core         | `v0.1` | Auth, Workspace, Property (12 типів), Record, View, Template, Content, Formula |
| v0.2 — Feature Complete | `v0.2` | Custom DB, Settings, Statistics, Search, CSV, Automation, Button               |
| v0.3 — Polished         | `v0.3` | Settings, Onboarding, Notification, Duplicate, Content blocks                  |
| v1.0 — Full Release     | `v1.0` | Integrations, Advanced blocks, Formula in view                                 |

---

## Шпаргалка: повний цикл однієї фічі

```bash
# 1. Взяти задачу → In Progress

# 2. Гілка
git checkout develop && git pull
git checkout -b feature/auth-registration

# 3. Робота
# ... пишемо код ...
git add .
git commit -m "feat(auth): add registration endpoint"
git commit -m "test(auth): add unit tests"

# 4. Push + PR
git push -u origin feature/auth-registration
gh pr create --title "feat(auth): user registration" --label "feature,mod:auth,layer:api,layer:web" --milestone "MVP Core"

# 5. DoD check → Merge
gh pr merge --squash --delete-branch

# 6. Cleanup
git checkout develop && git pull
# Issue → Done, картка → Done
```

---

## Branch Protection (рекомендовано)

Для `main`:

- [ ] Require pull request before merging
- [ ] Require status checks to pass (`turbo test`, `turbo lint`)
- [ ] Require conversation resolution before merging
- [ ] Include administrators
- [ ] Allow squash merging only

Це запобігає прямому push в `develop` — тільки через PR.

---

## Порівняння з Git Flow

|               | Git Flow                                                            | GitHub Flow (наш)             |
| ------------- | ------------------------------------------------------------------- | ----------------------------- |
| Гілок         | 5 типів (`master`, `develop`, `feature/*`, `release/*`, `hotfix/*`) | 2 (`main`, `feature/*`)       |
| Реліз         | release-гілка + merge в `master` + `develop`                        | тег на `develop`              |
| Hotfix        | `hotfix/*` з `master` → merge в обидві                              | `fix/*` з `develop` → PR      |
| Складність    | Висока (10+ кроків на реліз)                                        | Низька (4 кроки)              |
| Підходить для | Versioned software, multi-version support                           | Continuous delivery, web apps |
| Solo dev      | Overhead                                                            | Ідеально                      |

---

## CI/CD Pipeline та гілкова стратегія

Пайплайн (`.github/workflows/ci.yml`) безпосередньо пов'язаний з гілковою стратегією — різні джоби запускаються залежно від того, звідки прийшла зміна.

### Умови запуску (GitHub Actions `if:` vs GitLab `rules:`)

У GitLab CI/CD умови запуску описуються через `rules:`:

```yaml
# GitLab CI/CD
deploy_job:
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"' # тільки для main
      when: always
```

У GitHub Actions еквівалент — умова `if:` на рівні джобу або тригери `on:`:

```yaml
# GitHub Actions
deploy:
  if: github.ref == 'refs/heads/develop' # тільки для develop
```

### Що запускається і коли

| Джоб       | `push` до `develop` | PR до `develop` | `feature/*` гілка |
| ---------- | :-----------------: | :-------------: | :---------------: |
| `lint`     |          ✓          |        ✓        |         ✗         |
| `test`     |          ✓          |        ✓        |         ✗         |
| `security` |          ✓          |        ✓        |         ✗         |
| `build`    |          ✓          |        ✓        |         ✗         |
| `docker`   |          ✓          |        ✓        |         ✗         |
| `deploy`   |          ✓          |        ✗        |         ✗         |

`deploy` виконується **тільки** при прямому push до `develop` (тобто після merge PR). На самому PR він не запускається — це запобігає випадковому деплою незавершених змін.

### Зв'язок з флоу розробки

```
feature/my-task
      │
      │  git push → PR до develop
      │
      ▼
  [PR відкрито]
      │  ← CI запускає: lint, test, security, build, docker
      │  ← Всі мають бути зеленими (Branch Protection)
      │
      ▼
  [PR merged до develop]
      │  ← CI запускає: lint, test, security, build, docker, deploy
      │
      ▼
  staging deployment manifest створено
```

### Чому `feature/*` гілки не мають CI

Тригери `on: push: branches: [develop]` і `on: pull_request: branches: [develop]` означають що пайплайн не запускається при push безпосередньо у `feature/*` гілку — тільки коли відкривається PR до `develop`. Це свідомий вибір: перевірка відбувається саме в момент інтеграції, а не при кожному проміжному коміті в процесі роботи.
