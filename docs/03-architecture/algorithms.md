# Ключові алгоритми — FIX Space

Документ описує алгоритми та механізми обробки даних, реалізовані в системі. Кожен розділ охоплює логіку роботи, структури даних та мотивацію архітектурних рішень.

---

## 1. Система формул

Формула — це властивість бази даних, значення якої обчислюється автоматично. Ключовий принцип: **користувач не пише синтаксис** — він обирає готовий сценарій і заповнює пропуски через дропдауни. Весь вираз генерується системою за лаштунками.

### 1.1 Конфігурація (user-facing)

При додаванні FORMULA-властивості відкривається **галерея named calculations** — 10 пресетів у двох категоріях:

**Загальні обчислення:**

| Пресет                | Що обчислює                                                             | Вихідний тип              |
| --------------------- | ----------------------------------------------------------------------- | ------------------------- |
| Умовний текст         | Одна з двох міток залежно від умови                                     | `TEXT`                    |
| Різниця між датами    | Тривалість між двома DATE-полями                                        | `DURATION`                |
| Відсоток              | Поле A / Поле B × 100                                                   | `NUMBER`                  |
| По пов'язаних записах | Агрегат значень через RELATION (COUNT / SUM / AVG / MIN / MAX / Список) | `NUMBER` · `DATE` · масив |
| Середній бал          | Арифметичне середнє 2–5 числових або RATING-полів                       | `RATING`                  |
| Категорія за порогом  | Текстова мітка залежно від числового діапазону (до 3 порогів)           | `TEXT`                    |

**Обчислення для трейдерів:**

| Пресет              | Що обчислює                                  | Вихідний тип |
| ------------------- | -------------------------------------------- | ------------ |
| R-Multiple          | P&L / Ризик                                  | `NUMBER`     |
| Запланований RR     | (Ціль − Вхід) / (Вхід − Стоп)                | `NUMBER`     |
| Ризик % від балансу | Ризик / Баланс × 100                         | `NUMBER`     |
| Дотримання правил   | Частка відмічених CHECKBOX-полів від обраних | `PROGRESS`   |

Або «**Свій розрахунок**» → 2-рівневий конструктор:

```
Level 1:  [поле A]  [операція]  [поле B]
Level 2 (умовне):  ЯКЩО [умова] → [текст1], ІНАКШЕ → [текст2]
```

Підтримувані операції конструктора: `+`, `−`, `×`, `÷`, порівняння, різниця дат, об'єднання тексту.

**Fill-in-the-blanks:** усі параметри заповнюються виключно дропдаунами. Доступні тільки властивості сумісного типу. FORMULA-властивості виключені зі списків вибору — цикли неможливі на рівні UI.

**Попередній перегляд:** панель відображає обчислене значення для першого реального запису (або тестове значення при порожній базі). Оновлюється миттєво при зміні будь-якого параметру.

### 1.2 Внутрішнє обчислення (pipeline)

Після збереження конфігурації система генерує рядок `expression` і зберігає у `Property.config.expression`. Користувач його не бачить. Обчислення запускається автоматично після кожного збереження запису.

```
expression (string)
        ↓
   [Lexer] → Token[]
        ↓
   [Parser] → AST (рекурсивний спуск)
        ↓
   [Evaluator] → результат
        ↓
   PropertyValue (read-only)
```

**Лексер — типи токенів:**

| Токен               | Опис                                    | Приклади                                |
| ------------------- | --------------------------------------- | --------------------------------------- |
| `NUMBER`            | Ціле або дробове число                  | `100`, `3.14`                           |
| `STRING`            | Рядок у лапках                          | `"Win"`, `"Loss"`                       |
| `BOOLEAN`           | Булеве значення                         | `true`, `false`                         |
| `IDENTIFIER`        | Ідентифікатор функції або ключове слово | `IF`, `SUM`, `AVG`, `COUNT`             |
| `PROP_REF`          | Посилання на поле запису                | системний ідентифікатор властивості     |
| `OPERATOR`          | Арифметичний або порівняльний оператор  | `+`, `-`, `*`, `/`, `>`, `<`, `=`, `!=` |
| `LPAREN` / `RPAREN` | Дужки                                   | `(` / `)`                               |
| `COMMA`             | Роздільник аргументів                   | `,`                                     |
| `EOF`               | Кінець виразу                           | —                                       |

**Вузли AST:**

```
BinaryExpression  { operator, left: ASTNode, right: ASTNode }
UnaryExpression   { operator, operand: ASTNode }
FunctionCall      { name: string, args: ASTNode[] }
PropertyRef       { propertyId: string }
Literal           { value: number | string | boolean }
```

**Evaluator (рекурсивний обхід AST):**

| Вузол              | Дія                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `Literal`          | Повертає значення безпосередньо                                                             |
| `PropertyRef`      | Шукає `propertyId` у `record.propertyValues`, повертає значення                             |
| `BinaryExpression` | Обчислює обидві гілки, застосовує оператор                                                  |
| `UnaryExpression`  | Обчислює операнд, застосовує унарний оператор (напр. `-`)                                   |
| `FunctionCall`     | Обчислює аргументи, передає у вбудовану функцію (`SUM`, `AVG`, `IF`, `COUNT`, `MIN`, `MAX`) |

---

## 2. Property Type Registry (Strategy Pattern)

Система підтримує 12 типів властивостей: TEXT, NUMBER, DATE, CHECKBOX, DURATION, SELECT, STATUS, RELATION, FORMULA, RATING, PROGRESS, BUTTON. Кожен тип має власну логіку валідації, значень за замовчуванням та побічних ефектів.

**Реєстр:**

```
PropertyTypeRegistry = Map<PropertyType, IPropertyTypeHandler>
```

**Інтерфейс обробника:**

```
IPropertyTypeHandler {
  validateConfig(config)        → ValidationResult
  validateValue(value, config)  → ValidationResult
  getDefaultValue(config)       → PropertyValue

  onCreate(property, tx)        → void   // ефекти при створенні властивості
  onUpdate(prev, next, tx)      → void   // ефекти при зміні конфігурації
  onDelete(property, tx)        → void   // очищення при видаленні
}
```

**Алгоритм dispatch:**

```
request з type → PropertyService
    → registry.get(type) → Handler
    → handler.validateValue(value, config)
    → handler.onCreate(property, tx)
    ...
```

`PropertyService` не знає деталей жодного типу — тільки викликає через інтерфейс. Це дозволяє додавати новий тип без змін в існуючому коді: новий файл → реєстрація у Map.

---

## 3. Фільтрація записів

Записи фільтруються за значеннями властивостей з підтримкою AND / OR між умовами (SRS 3.9). Іменовані конфігурації фільтрів зберігаються на сервері у рамках подання (View).

### Структури даних

```
FilterRule = {
  field: PropertyId | 'createdAt' | 'updatedAt'
  operator: Operator
  value: any
}

FilterGroup = {
  logic: 'AND' | 'OR'
  rules: FilterRule[]
}

FilterSet = {
  logic: 'AND' | 'OR'
  groups: FilterGroup[]
}
```

### Алгоритм

```
FUNCTION matchesFilterSet(record, filterSet):
  groupResults = []

  FOR EACH group IN filterSet.groups:
    ruleResults = []

    FOR EACH rule IN group.rules:
      fieldValue = getFieldValue(record, rule.field)
      ruleResults.push( applyOperator(fieldValue, rule.operator, rule.value) )

    IF group.logic = 'AND':
      groupResults.push( ALL ruleResults are true )
    ELSE:
      groupResults.push( ANY ruleResult is true )

  IF filterSet.logic = 'AND':
    RETURN ALL groupResults are true
  ELSE:
    RETURN ANY groupResult is true
```

`getFieldValue`: мета-поля (`createdAt`, `updatedAt`) — беруться з об'єкту запису напряму; інші — пошук в `record.propertyValues` за `propertyId`.

Записи з ненульовим `deletedAt` виключаються **до** фільтрації (soft-delete).

### Оператори по типах

| Тип                                   | Оператори                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| TEXT                                  | `equals`, `not_equals`, `contains`, `not_contains`, `starts_with`, `ends_with`, `is_empty`, `is_not_empty` |
| NUMBER / RATING / PROGRESS / DURATION | `equals`, `not_equals`, `greater_than`, `less_than`, `gte`, `lte`, `is_empty`, `is_not_empty`              |
| DATE                                  | `equals`, `not_equals`, `before`, `after`, `on_or_before`, `on_or_after`, `is_empty`, `is_not_empty`       |
| CHECKBOX                              | `is_checked`, `is_unchecked`                                                                               |
| SELECT                                | `equals`, `not_equals`, `contains`, `not_contains`, `in`, `not_in`, `is_empty`, `is_not_empty`             |
| STATUS                                | `equals`, `not_equals`, `in`, `not_in`, `is_empty`, `is_not_empty`                                         |
| RELATION                              | `contains`, `not_contains`, `in`, `not_in`, `is_empty`, `is_not_empty`                                     |
| FORMULA                               | залежить від `outputType` — оператори відповідного типу результату                                         |

---

## 4. Ініціалізація простору (4-прохідний алгоритм)

Запускається одразу після реєстрації. Виконується транзакційно. Результат — повністю готовий простір з 9 базами, властивостями та шаблонами.

### 9 попередньо налаштованих баз

| База               | Секція   |
| ------------------ | -------- |
| Trading Journal    | Routine  |
| Daily Routine      | Routine  |
| Routine Library    | Routine  |
| Mistakes           | Insight  |
| Notes              | Insight  |
| Accounts           | Settings |
| Operations         | Settings |
| Trading System     | Settings |
| Performance Review | Settings |

### Алгоритм

```
PASS 1 — Sections (паралельно):
  CREATE Section: Routine
  CREATE Section: Insight
  CREATE Section: Settings
  → map: sectionType → sectionId

PASS 2 — Databases (паралельно):
  FOR EACH database IN initConfig:
    CREATE Database (sectionId з Pass 1)
  → map: databaseType → databaseId

PASS 3 — Properties + RELATION resolution:
  FOR EACH database:
    FOR EACH property IN database.properties:
      IF property.type = RELATION:
        resolve { relatedEntityType: 'accounts' }
              → databaseId з map Pass 2
      CREATE Property з розрезолвленим config

PASS 4a — Templates (паралельно):
  FOR EACH database:
    CREATE Template (isDefault=true)  ← системний з pre-filled values
    CREATE Template (isDefault=false) ← альтернативний

PASS 4b — Sample records:
  CREATE Records через шаблони
  Resolve RELATION values: пошук запису за назвою у межах Space
```

**Ключова складність Pass 3:** RELATION-властивості посилаються на бази, щойно створені у Pass 2. Символьні посилання (`relatedEntityType: 'accounts'`) резолвляться через map `databaseType → databaseId` з Pass 2. Без двопрохідного підходу взаємозалежні бази не можна створити в одній транзакції.

---

## 5. Пошук записів

Пошук відбувається на двох рівнях: в межах поточної бази та глобально по всьому простору.

### In-database search

```
query = input.toLowerCase().trim()
IF query.length < 2: RETURN []

FOR EACH record IN currentDatabase WHERE deletedAt IS NULL:
  match = false
  IF record.name.toLowerCase().includes(query): match = true
  FOR EACH value IN record.propertyValues (TEXT / SELECT / STATUS):
    IF value.toLowerCase().includes(query): match = true
  IF match: ADD record to results

Результати оновлюються real-time при кожному введеному символі
```

### Global search (Ctrl+K / Cmd+K)

```
query = input.toLowerCase().trim()
IF query.length < 2: SHOW recent searches; RETURN

FOR EACH database IN currentSpace:
  FOR EACH record IN database WHERE deletedAt IS NULL:
    check record.name
    check TEXT / SELECT / STATUS / NUMBER property values
    check RecordContent.content (DFS обхід JSON-дерева блоків — витягуємо текстові вузли)
    IF match: ADD to results[database]

LIMIT: 5 результатів на базу → посилання «показати всі в [Database]»
GROUP: по базах даних (секція + назва бази)
HIGHLIGHT: знайдений фрагмент у рядку результату
```

Записи в Trash виключені з обох рівнів пошуку.

---

## 6. Система автоматизацій

Автоматизація — правило «КОЛИ → ТО», яке виконується на сервері без участі користувача. Максимум 10 правил на базу.

### Конфігурація

Користувач обирає шаблон із галереї або починає з нуля — в обох випадках через fill-in-the-blanks (дропдауни, без технічних термінів).

**Блок КОЛИ (1 тригер на автоматизацію):**

| Тригер          | Деталі                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Поле змінюється | Конкретна властивість + умова (конкретне значення / «заповнюється» / «очищується»). FORMULA-поля виключені |
| Запис створено  | Будь-який новий запис у базі                                                                               |
| За розкладом    | Щодня / щотижня / щомісяця; мінімальний інтервал — 1 день                                                  |

**Блок ТО (до 5 дій, виконуються послідовно):**

| Дія                      | Що робить                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Встановити значення поля | Одне поле = статичне значення / TODAY() / значення іншого поля поточного запису                                             |
| Створити запис           | Новий запис у цій або іншій базі з маппінгом полів                                                                          |
| Зв'язати записи          | Пошук записів за фільтрами → `append` або `replace` у RELATION-полі; фільтри підтримують посилання на поля поточного запису |

### Алгоритм виконання

```
ON event → evaluate automation:
  IF automation.isActive = false: SKIP

  FOR EACH action IN automation.actions:  // послідовно
    EXECUTE action
    IF action.failed:
      LOG { error description }
      BREAK  // наступні дії не виконуються

    IF action changes the trigger field:
      SKIP re-trigger  // захист від рекурсії рівень 1

  LOG { date, recordName, result | error }
```

### Захист від рекурсії

**Рівень 1 — в межах бази:** якщо дія змінює поле, що є тригером цієї ж автоматизації → новий тригер не спрацьовує.

**Рівень 2 — між базами:** якщо дія у DB-A створює запис у DB-B → автоматизації DB-B не спрацьовують для цього запису. Виключає каскадні цикли A → B → A між різними базами.

### Тестування та журнал

- **Тестовий запуск:** виконується без збереження; показує результат у людській мові («поле X було б встановлено в Y»)
- **Журнал:** останні 50 запусків на автоматизацію; помилка одного запуску не блокує наступні

---

## 7. JWT Auth Flow

Автентифікація побудована на двох токенах: короткоживучий access + довгоживучий refresh із ротацією.

### Потік

```
POST /auth/register
  validate DTO (email, password ≥ 8 chars)
  passwordHash = bcrypt.hash(password, saltRounds)
  CREATE User { isVerified: false, passwordHash }
  CREATE EmailVerificationToken { expiresAt: now + 24h }
  sendEmail(verificationLink)
  → 201 Created

POST /auth/verify?token=<token>
  find EmailVerificationToken WHERE !isUsed AND expiresAt > now
  User.isVerified = true
  token.isUsed = true
  → 200 OK

POST /auth/login
  find User by email
  IF !isVerified → 403 Forbidden
  bcrypt.compare(password, user.passwordHash)
  IF mismatch → 401 (throttled: 5 req / 60s)
  accessToken = JWT.sign({ sub: userId }, secret, { expiresIn: '15m' })
  rawRefresh = crypto.randomBytes(32)
  tokenHash = bcrypt.hash(rawRefresh)
  CREATE RefreshToken { tokenHash, expiresAt: now + 30d }
  SET HTTP-only cookies: access_token, refresh_token
  → 200 + UserResponseDto

POST /auth/refresh
  rawRefresh = cookie('refresh_token')
  find RefreshToken WHERE bcrypt.compare(rawRefresh, tokenHash) matches
  IF not found OR revokedAt IS NOT NULL OR expiresAt < now → 401
  OLD token: revokedAt = now
  NEW accessToken + NEW RefreshToken { expiresAt: now + 30d }  // продовжується
  SET cookies
  → 200

POST /auth/logout
  RefreshToken.revokedAt = now
  CLEAR cookies
  → 200

На зміну пароля:
  UPDATE RefreshToken SET revokedAt = now WHERE userId = this
  // всі активні сесії крім поточної анулюються
```

### Чому саме так

| Рішення                              | Причина                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Access token 15 хв                   | Мінімальне вікно компрометації при витоку                              |
| Refresh token в HTTP-only cookie     | Недоступний для JS → захист від XSS                                    |
| `tokenHash` в БД, не сам токен       | При витоку БД — токени безсилі без оригінального значення              |
| Ротація на кожен `/auth/refresh`     | Replay attack виявляється миттєво: старий токен відхиляється           |
| `revokedAt` замість видалення        | Явне анулювання зі збереженням аудит-сліду                             |
| Throttler 5 req/60s на `/auth/login` | Brute-force захист                                                     |
| Google OAuth 2.0                     | Стандартний Authorization Code Flow; FIX Space не бачить пароль Google |

---

## 8. Name Pattern Token Substitution

При створенні запису з шаблону система замінює токени у полі `namePattern` на актуальні значення. Виконується **синхронно** до збереження запису в БД.

### Алгоритм

```
FUNCTION substituteNamePattern(template, database, now):
  IF template.namePattern is empty:
    RETURN ""  // поле Name залишається порожнім

  pattern = template.namePattern

  // Прості токени
  simpleTokens = {
    "{{today}}"     → format(now, "DD.MM.YYYY")
    "{{month}}"     → monthName(now)          // "January" ... "December"
    "{{month_num}}" → zeroPad(month(now), 2)  // "01" ... "12"
    "{{year}}"      → year(now)               // "2026"
    "{{quarter}}"   → quarter(now)            // "1" ... "4"
    "{{count}}"     → countActive(database) + 1
  }

  FOR EACH [token, value] IN simpleTokens:
    pattern = pattern.replace(token, value)

  // Умовний count: {{count:PropertyName=value}}
  FOR EACH match IN pattern.matchAll(/\{\{count:(.+?)=(.+?)\}\}/):
    [_, propertyName, filterValue] = match
    n = countActiveWhere(database, propertyName, filterValue)
    pattern = pattern.replace(match[0], n + 1)

  RETURN pattern
```

**`countActive`** рахує лише записи де `deletedAt IS NULL` (Trash не враховується).

**Підтримувані токени:**

| Токен                          | Результат                                              |
| ------------------------------ | ------------------------------------------------------ |
| `{{today}}`                    | `23.05.2026`                                           |
| `{{month}}`                    | `May`                                                  |
| `{{month_num}}`                | `05`                                                   |
| `{{year}}`                     | `2026`                                                 |
| `{{quarter}}`                  | `2`                                                    |
| `{{count}}`                    | Порядковий номер запису в базі (активні + 1)           |
| `{{count:Period Type=Weekly}}` | Порядковий номер серед записів де Period Type = Weekly |

**Приклад:** шаблон `"Trade {{count}} — {{today}}"` → `"Trade 47 — 23.05.2026"`

Нерозпізнаний токен залишається у рядку як є.
