# Типи властивостей FIX Space

Кожна властивість бази даних має **тип**, що визначає допустимий формат значення, параметри конфігурації, оператори фільтрації та формат відображення.

Реєстр типів реалізовано через `PropertyTypeRegistry`: кожен тип має власний handler, що імплементує `PropertyConfigHandler` та `PropertyValueHandler`.

---

## TEXT

Зберігає текстове значення. Підтримує два режими: простий рядок та форматований текст (rich text).

**Параметри конфігурації:**

| Параметр       | Тип     | Допустимі значення            | За замовчуванням |
| -------------- | ------- | ----------------------------- | ---------------- |
| `defaultValue` | string  | Будь-який рядок               | `""`             |
| `isRichText`   | boolean | true / false                  | `true`           |
| `urlHandling`  | enum    | `none` · `detect` · `preview` | `"detect"`       |

`urlHandling: none` — URL як звичайний текст; `detect` — автоматичне посилання; `preview` — вбудований попередній перегляд.

**Значення:** рядок або null (null → порожній рядок).

**Оператори фільтрації:** `equals`, `not_equals`, `contains`, `not_contains`, `starts_with`, `ends_with`, `is_empty`, `is_not_empty`

---

## NUMBER

Зберігає числове значення з можливістю форматування.

**Параметри конфігурації:**

| Параметр         | Тип    | Допустимі значення                              | За замовчуванням |
| ---------------- | ------ | ----------------------------------------------- | ---------------- |
| `defaultValue`   | number | Будь-яке число                                  | `0`              |
| `format`         | enum   | `integer` · `float` · `currency` · `percentage` | `"float"`        |
| `decimalPlaces`  | number | 0–10                                            | `2`              |
| `currencySymbol` | string | Будь-який рядок                                 | `""`             |
| `prefix`         | string | Будь-який рядок                                 | `""`             |
| `suffix`         | string | Будь-який рядок                                 | `""`             |

При форматі `integer` значення автоматично округлюється. `currencySymbol` використовується лише з форматом `currency`. `prefix`/`suffix` — лише відображення.

**Значення:** число або null (null → `0`).

**Оператори фільтрації:** `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`, `is_empty`, `is_not_empty`

---

## DATE

Зберігає дату або дату з часом у форматі ISO 8601 (UTC).

**Параметри конфігурації:**

| Параметр       | Тип            | Допустимі значення                         | За замовчуванням |
| -------------- | -------------- | ------------------------------------------ | ---------------- |
| `defaultValue` | string \| null | ISO-рядок · `"today"` · null               | `null`           |
| `format`       | enum           | `DD.MM.YYYY` · `MM/DD/YYYY` · `YYYY-MM-DD` | `"DD.MM.YYYY"`   |
| `includeTime`  | boolean        | true / false                               | `true`           |
| `timeFormat`   | enum           | `HH:mm` · `hh:mm A`                        | `"HH:mm"`        |

Спеціальне значення `"today"` замінюється поточною датою на момент створення запису.

**Значення:** рядок ISO 8601 або null.

**Оператори фільтрації:** `equals`, `not_equals`, `before`, `after`, `on_or_before`, `on_or_after`, `is_empty`, `is_not_empty`

---

## CHECKBOX

Зберігає булеве значення: відмічено (true) або не відмічено (false).

**Параметри конфігурації:**

| Параметр       | Тип     | Допустимі значення | За замовчуванням |
| -------------- | ------- | ------------------ | ---------------- |
| `defaultValue` | boolean | true / false       | `false`          |

**Значення:** true, false або null. null ≠ false — семантично "не заповнено".

**Оператори фільтрації:** `is_checked` (true), `is_unchecked` (false, не включає null), `is_empty` (null), `is_not_empty` (true або false)

---

## DURATION

Зберігає тривалість як ціле невід'ємне число секунд.

**Параметри конфігурації:**

| Параметр       | Тип            | Допустимі значення                                     | За замовчуванням |
| -------------- | -------------- | ------------------------------------------------------ | ---------------- |
| `defaultValue` | number \| null | Ціле число ≥ 0 або null                                | `null`           |
| `format`       | enum           | `HH:mm` · `HH:mm:ss` · `Xh Ym` · `minutes` · `seconds` | `"HH:mm"`        |

**Розпізнавання вводу:** `1:30` → 5400 с; `1:30:00` → 5400 с; `90` → 90 с.

**Значення:** ціле число секунд або null.

**Оператори фільтрації:** `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`, `is_empty`, `is_not_empty`

---

## SELECT

Один або кілька варіантів зі згрупованого списку.

**Параметри конфігурації:**

| Параметр        | Тип     | За замовчуванням |
| --------------- | ------- | ---------------- |
| `isMultiSelect` | boolean | `false`          |
| `categories`    | array   | `[]`             |

Структура категорії: `{ label: string, options: [{ value: string, color?: string, icon?: string }] }`.

**Значення:** рядок (single) або масив рядків (multi), або null.

**Оператори фільтрації:** `equals`, `not_equals`, `contains`, `not_contains`, `is_empty`, `is_not_empty`

---

## STATUS

Статус виконання з трьома семантичними категоріями: `todo`, `in_progress`, `complete`.

**Параметри конфігурації:**

| Параметр        | Тип    | За замовчуванням       |
| --------------- | ------ | ---------------------- |
| `defaultOption` | string | `"Not started"`        |
| `categories`    | array  | 3 стандартні категорії |

Структура: `{ category: "todo" | "in_progress" | "complete", label: string, defaultOption?: string, options: [{ name: string, color: string, icon?: string }] }`.

**Значення:** рядок (назва опції) або null.

**Оператори фільтрації:** `equals`, `not_equals`, `is_empty`, `is_not_empty`

---

## RELATION

Посилання на записи іншої бази даних в межах простору.

**Параметри конфігурації:**

| Параметр          | Тип           | За замовчуванням |
| ----------------- | ------------- | ---------------- |
| `relatedEntityId` | string (UUID) | —                |
| `multiple`        | boolean       | `false`          |

**Значення:** UUID або масив UUID, або null.

**Оператори фільтрації:** `equals`, `not_equals`, `is_empty`, `is_not_empty`

Якщо RELATION посилається на видалену базу — переходить у стан «broken»: нові значення неможливі, наявні відображаються як plain text.

---

## FORMULA

> Повна специфікація функціоналу: [3.13 Формули](functional/3.13-formulas.md)

Обчислювальне поле на основі виразу. Лише читання.

**Параметри конфігурації:**

| Параметр     | Тип                                |
| ------------ | ---------------------------------- |
| `expression` | string (генерується конструктором) |
| `outputType` | PropertyType                       |

Користувач не вводить синтаксис вручну — тільки дропдауни. Галерея пресетних обчислень: R-Multiple, Запланований RR, Ризик % від балансу, Дотримання правил, Умовний текст, Різниця між датами, Відсоток, Середній бал, Категорія за порогом, По пов'язаних записах.

FORMULA-поля не доступні як вхідні для інших FORMULA (захист від циклічних залежностей).

**Значення:** залежить від виразу (лише читання).

**Оператори фільтрації:** `equals`, `not_equals`, `greater_than`, `less_than`, `is_empty`, `is_not_empty`

---

## RATING

Числова оцінка у форматі зірок.

**Параметри конфігурації:**

| Параметр       | Тип            | Допустимі значення  | За замовчуванням |
| -------------- | -------------- | ------------------- | ---------------- |
| `defaultValue` | number \| null | 0–maxStars або null | `null`           |
| `maxStars`     | number         | 1–10                | `5`              |
| `allowHalf`    | boolean        | true / false        | `true`           |

**Значення:** число 0–maxStars або null.

**Оператори фільтрації:** `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`, `is_empty`, `is_not_empty`

---

## PROGRESS

Числовий прогрес у заданому діапазоні, відображається як бар.

**Параметри конфігурації:**

| Параметр       | Тип            | За замовчуванням |
| -------------- | -------------- | ---------------- |
| `defaultValue` | number \| null | `null`           |
| `min`          | number         | `0`              |
| `max`          | number         | `100`            |
| `step`         | number         | `1`              |
| `showLabel`    | boolean        | `true`           |
| `thresholds`   | array          | `[]`             |

Threshold: `{ upTo: number, color: string }`.

**Значення:** число в діапазоні [min, max] або null.

**Оператори фільтрації:** `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`, `is_empty`, `is_not_empty`

---

## BUTTON

> Повна специфікація функціоналу: [3.15 Кнопка](functional/3.15-button.md)

Дія без збереження значення; запускає налаштовані операції над записом.

**Параметри конфігурації:**

| Параметр  | Тип                                                   |
| --------- | ----------------------------------------------------- |
| `label`   | string                                                |
| `color`   | enum: `neutral` · `blue` · `green` · `red` · `accent` |
| `actions` | array (до 3 дій)                                      |

Доступні дії: встановити значення поля, встановити кілька полів, створити запис в базі, вставити блок у контент (лише для BUTTON-компонента).

**Значення:** не зберігається.

**Не доступний для:** сортування, фільтрації, групування, масового редагування, формул, автоматизацій.
