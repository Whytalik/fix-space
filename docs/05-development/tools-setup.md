# Інструменти та налаштування

Усі інструменти безкоштовні та інтегровані з GitHub-репозиторієм.

---

## 1. GitHub Issues — Backlog

### Теорія

**Issue tracker** — це система обліку задач. У контексті Personal Kanban кожен Issue є одиницею роботи в backlog.

Класичний підхід до управління задачами (Agile, PMBoK) виділяє три атрибути кожної задачі:

- **Що зробити** — назва і опис
- **Навіщо** — прив'язка до вимоги або User Story
- **Коли** — пріоритет і milestone

GitHub Issues реалізує всі три через: Title + Description, Labels, Milestone. Це мінімально достатній набір для solo-проекту без зайвого overhead.

**Labels** — це категоризація задач за типом. Вони дозволяють фільтрувати backlog і бачити скільки фіч, багів і технічних задач у кожному milestone. У великих командах labels замінюють окремі дошки (Bug Board, Feature Board тощо).

Labels походять з концепції **таксономії задач** в проектному менеджменті — поділу роботи на типи для розуміння структури backlog. У PMBoK це частина процесу декомпозиції робіт (Work Breakdown Structure): перед тим як оцінити обсяг, задачі класифікують за характером. У Agile labels виконують ту саму функцію легше — без формальної WBS-документації.

Практична цінність labels для solo-розробника: фільтрація `label:bug` показує тільки дефекти, `label:test` — що ще не покрито тестами. Це замінює окремий bug tracker і test tracker одним інструментом.

### Як створити Issue

1. Відкрий репозиторій на GitHub
2. Вкладка **Issues** → **New issue**
3. Заповни:

```
Title:     feat(space): create space endpoint
Labels:    feature
Milestone: v0.1 MVP
```

### Labels для проекту

| Label     | Колір  | Коли використовувати               |
| --------- | ------ | ---------------------------------- |
| `feature` | blue   | Нова функціональність              |
| `bug`     | red    | Дефект поведінки                   |
| `test`    | yellow | Написання тестів, coverage         |
| `docs`    | green  | Документація                       |
| `chore`   | grey   | Технічні задачі (CI, deps, config) |

### Як створити labels

GitHub → Issues → Labels → New label → введи назву і колір.

---

## 2. GitHub Milestones — версії

### Теорія

**Milestone** (контрольна точка) — поняття з класичного проектного менеджменту (PMBoK). Це момент або стан проекту, коли завершено певний набір задач і можна зафіксувати результат.

У водоспадних проектах milestone = завершення фази (Design Complete, Testing Complete). У ітераційних — milestone = робоча версія продукту (v0.1, v0.2, v1.0).

Milestone відповідає на запитання: _"Що вміє система після цього кроку?"_ — на відміну від окремої задачі, яка відповідає на _"Що я зараз роблю?"_

GitHub Milestones автоматично рахує % завершення на основі закритих Issues — це дає миттєвий progress indicator без ручного оновлення.

### Як створити Milestone

1. GitHub → Issues → **Milestones** → **New milestone**
2. Заповни:

```
Title:       v0.1 MVP
Description: Auth + Space + Database — базова структура
Due date:    (опціонально)
```

### Milestones для FIX Space

| Milestone  | Що входить                                          |
| ---------- | --------------------------------------------------- |
| `v0.1 MVP` | Auth, User, Space, Section, Database                |
| `v0.2`     | Property, Record, RecordContent, PropertyValue      |
| `v0.3`     | Template, TemplatePropertyValue, View               |
| `v1.0`     | Settings, Notification, Search, тести, документація |

### Як прив'язати Issue до Milestone

При створенні Issue → права панель → **Milestone** → обираєш потрібний.

---

## 3. GitHub Projects — Kanban-дошка

### Теорія

**Kanban** (з японської — "сигнальна картка") — методологія управління потоком роботи, розроблена Toyota у 1950-х для виробництва і адаптована для розробки ПЗ (David Anderson, 2010).

Ключові принципи Kanban:

- **Візуалізація роботи** — всі задачі видні на одній дошці, нічого не тримається "в голові"
- **Обмеження WIP** — задачі в колонці "In Progress" обмежені числом (для solo: 1). Це запобігає розпорошенню уваги
- **Управління потоком** — мета не "зайнятись", а довести задачу до Done

**Personal Kanban** (Jim Benson, 2011) — спрощена версія для індивідуального використання. Мінімальна дошка: `Backlog → In Progress → Done`.

Різниця між Kanban і Scrum: Scrum працює у фіксованих часових ітераціях (спринти 1–2 тижні) і вимагає командних церемоній. Kanban — continuous flow без фіксованих ітерацій, підходить для solo-розробки.

### Як створити проект

1. Відкрий репозиторій → вкладка **Projects** → **New project**
2. Обери шаблон **Board**
3. Назви: `FIX Space Development`

### Налаштування колонок

За замовчуванням: Todo / In Progress / Done — це саме те що потрібно.

### Як прив'язати Issues до дошки

1. Відкрий проект → **+ Add item** → введи `#` → обери Issue зі списку
2. Або при створенні Issue → права панель → **Projects** → обираєш дошку

### Як використовувати

- **Todo** — всі відкриті Issues (backlog)
- **In Progress** — поточна задача (максимум 1, WIP limit)
- **Done** — закриті Issues

При закритті Issue через `Closes #123` у PR — картка автоматично переміщується в Done.

---

## 4. PR Template — Definition of Done

### Теорія

**Pull Request (PR)** — запит на злиття гілки з кодом у основну гілку (develop/main). У Git-флоу кожна фіча розробляється у власній гілці і мержиться через PR після перевірки.

**Definition of Done (DoD)** — поняття з Agile/Scrum. Це заздалегідь узгоджений чеклист умов, при яких задача вважається справді завершеною, а не "майже готовою". Без DoD одна людина вважає задачу готовою, коли код написаний; інша — тільки після тестів; третя — після документації. Для solo-розробника DoD дисциплінує власний процес.

PR Template у GitHub — це markdown-файл, який автоматично підставляється у поле опису кожного нового PR. Це гарантує, що DoD-чеклист не забудеться.

### Як налаштувати

Створи файл `.github/pull_request_template.md` у корені репозиторію:

```markdown
## Що зроблено

<!-- Короткий опис змін -->

## Definition of Done

- [ ] Unit-тести зелені (`turbo test`)
- [ ] E2E тести зелені (`turbo test:e2e`) — якщо зачіпає auth flow
- [ ] Перевірено в Postman
- [ ] Postman-колекція оновлена (`docs/06-testing/postman/postman_collection.json`)
- [ ] `docs/06-testing/test-cases/<module>.md` оновлено

## Closes

Closes #<!-- номер Issue -->
```

---

## 5. Commit → Issue зв'язок

### Теорія

GitHub підтримує **автозакриття Issues** через ключові слова у commit message або PR description. При мержі PR у гілку за замовчуванням (develop/main) — Issue закривається автоматично.

Це забезпечує трасабельність: по кожному Issue видно який PR його закрив, і навпаки — по кожному PR видно яку задачу він вирішив. У PMBoK це називається **Requirements Traceability** — можливість відстежити вимогу від постановки до реалізації.

### Синтаксис

```bash
git commit -m "feat(space): add create space endpoint

Closes #23"
```

Ключові слова: `Closes`, `Fixes`, `Resolves` — всі працюють однаково.

---

## Загальний флоу з інструментами

```
1. Створити Issue (GitHub Issues)
   → прив'язати до Milestone і Project

2. Перемістити картку в "In Progress" (GitHub Projects)

3. Розробляти по шарах: DTO → DB → Service → Controller → UI (детально: `docs/05-development/workflow.md`)

4. Створити PR з DoD чеклістом
   → вказати "Closes #N"

5. Перевірити DoD чеклист
   → замержити PR

6. Issue закривається автоматично
   → картка переїжджає в Done

7. Коли всі Issues Milestone закриті
   → git tag vX.X
   → turbo test && turbo test:e2e
```
