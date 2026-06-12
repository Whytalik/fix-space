# Специфікація фічі: Модуль статистики (Statistics Module)

Цей документ визначає вимоги, дизайн та технічний план реалізації модуля статистики для платформи **FIX Space**.

---

## 📌 Загальна інформація

- **GitHub Issues:**
  - [#45](https://github.com/Whytalik/fix-space/issues/45) — Розрахунок ключових торгових метрик та фільтрація
  - [#46](https://github.com/Whytalik/fix-space/issues/46) — Автоматична розбивка за SELECT/STATUS властивостями
  - [#110](https://github.com/Whytalik/fix-space/issues/110) — Власні звіти (Custom Reports) для кастомних баз
- **Гілка:** `feature/statistics` (базова гілка: `develop`)
- **Milestone:** M2 — v0.2 Feature Complete
- **Пріоритет:** High

---

## 👥 Користувацькі історії (User Stories) та критерії приймання

### [US-026] Торгова статистика

> **Як** приватний трейдер,  
> **я хочу** переглядати ключові торгові метрики на дашборді з фільтрацією, порівнянням періодів та розбивкою за властивостями,  
> **щоб** аналізувати ефективність торгівлі та виявляти закономірності.

- **AC 1: Розрахунок метрик.** Всі метрики розраховуються автоматично на основі закритих угод у базі даних `Trading Journal`.
  - _Тест-кейс: [TC-STAT-U-001](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-001-statisticsservice--розрахунок-ключових-торгових-метрик-win-rate-profit-factor-expectancy)_
  - _Тест-кейс: [TC-STAT-001](../../06-testing/test-cases/11-statistics/integration.md#tc-stat-001-дашборд--ключові-метрики-розраховуються)_
- **AC 2: Фільтрація по даті.** Користувач може фільтрувати метрики за діапазоном дат (тиждень, місяць, квартал, рік, весь час, кастомний діапазон).
  - _Тест-кейс: [TC-STAT-U-005](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-005-statisticsservice--фільтрація-записів-за-часовим-діапазоном)_
- **AC 3: Режим порівняння.** Користувач може увімкнути режим порівняння двох часових діапазонів (наприклад, поточний місяць vs минулий місяць). Метрики відображаються поруч із відсотковим відхиленням.
- **AC 4: Схема-орієнтовані breakdowns.** Для кожної `SELECT` та `STATUS` властивості у Trading Journal система автоматично генерує статистичну розбивку (Win Rate, P&L, кількість угод).
  - _Тест-кейс: [TC-STAT-U-003](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-003-statisticsservice--розбивка-за-select-та-status-властивостями-breakdown)_
  - _Тест-кейс: [TC-STAT-008](../../06-testing/test-cases/11-statistics/integration.md#tc-stat-008-розбивка-за-select-властивістю)_

### [US-082] Власні звіти для кастомних баз

> **Як** авторизований користувач,  
> **я хочу** бачити автоматично генеровані візуалізації для моїх кастомних баз даних (розподіл SELECT/STATUS, динаміка NUMBER по часу),  
> **щоб** аналізувати нетипові дані без ручної побудови графіків.

- **AC 1: Підключення до статистики.** Базу можна підключити/відключити через перемикач `enableStats` в налаштуваннях бази даних.
- **AC 2: Візуалізація схеми.** Для кожної підключеної бази автоматично генеруються:
  - Розподіл (Pie/Donut/Bar) по кожній `SELECT` та `STATUS` властивості.
  - Динаміка (Area/Line) у часі для кожної `NUMBER` властивості (з використанням першої знайденої `DATE` властивості як осі X).
  - _Тест-кейс: [TC-STAT-U-004](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-004-statisticsservice--генерація-аналітики-для-власних-звітів-кастомних-баз)_

---

## 🧠 Ключові бізнес-правила та архітектурні рішення

1. **Schema-driven on-demand аналітика (Ніяких збережених конфігурацій метрик):**
   - Всі аналітичні дані обчислюються "на льоту" на основі поточної структури бази даних.
   - Якщо властивість (наприклад, `Setup` або `Emotion`) видаляється з бази даних, при наступному рендері статистики графік по цьому полю просто не генерується. Система захищена від broken states.
2. **Аналіз виключно закритих угод:**
   - Торгові метрики (Win Rate, Profit Factor, Equity Curve) обчислюються тільки по записах, що мають статус `Closed` (або завершену дату `Exit Date`).
   - Запис вважається закритим, якщо властивість зі статусом або вибором, що має `integrationKey: "status"` (або ім'я `Status`), дорівнює `"Closed"`, або якщо заповнена властивість `"Exit Date"`.
3. **Естетика Void Terminal (Термінал Порожнечі):**
   - UI реалізується в глибоких темних тонах (Canvas: `#0f0f11`, Surface: `#18181d`, Elevated: `#222228`).
   - Числа та грошові суми (`Net P&L`, `Profit Factor`, `Actual R`) обов'язково відображаються моноширинним шрифтом (`font-mono tabular-nums`).
   - Кольорове кодування P&L: позитивний прибуток маркується зеленим (`text-success` / `#57f287`), збиток — червоним (`text-error` / `#ed4245`). Явний префікс `+` для прибутків.
4. **Збереження кастомізації чартів без зміни схеми БД:**
   - Користувач може приховати певні графіки, змінити їхній тип (напр. Bar ↔ Horizontal Bar), перейменувати або перевизначити колір.
   - Ці налаштування зберігаються у вбудованій таблиці `Settings` (Prisma model `Settings`) у JSON-форматі з категорією `"statistics"` та ключем `chart-settings`. Це запобігає необхідності створювати нові таблиці в БД та виконувати міграції.

---

## 📐 Математичні формули метрик

- **Total Trades ($N$):** Кількість закритих угод у діапазоні дат.
- **Winning Trades ($N_W$):** Кількість closed-угод, де $\text{Net P&L} > 0$.
- **Losing Trades ($N_L$):** Кількість closed-угод, де $\text{Net P&L} < 0$.
- **Win Rate (WR):**
  $$\text{WR} = \frac{N_W}{N} \times 100\%$$
- **Gross Profit (GP):**
  $$\text{GP} = \sum_{i \in \text{Wins}} \text{Net P\&L}_i$$
- **Gross Loss (GL):**
  $$\text{GL} = \sum_{j \in \text{Losses}} |\text{Net P\&L}_j|$$
- **Profit Factor (PF):**
  $$\text{PF} = \begin{cases} \frac{\text{GP}}{\text{GL}}, & \text{якщо } \text{GL} > 0 \\ \text{GP}, & \text{якщо } \text{GL} = 0 \end{cases}$$
- **Expectancy ($E_\$$):** Середній P&L на угоду (в валюті):
  $$E_\$ = \frac{\sum_{i=1}^{N} \text{Net P\&L}_i}{N}$$
- **Expectancy ($E_R$):** Середній P&L в одиницях ризику (якщо є `Actual R`):
  $$E_R = \frac{\sum_{i=1}^{N} \text{Actual R}_i}{N}$$
- **Drawdown ($DD_t$):** Просадка в точці $t$ на кривій капіталу:
  $$\text{Peak}_t = \max_{1 \le i \le t} (\text{Equity}_i)$$
  $$DD_t = \text{Peak}_t - \text{Equity}_t$$
  $$DD_{\%t} = \frac{\text{Peak}_t - \text{Equity}_t}{\text{Peak}_t} \times 100\% \quad (\text{при } \text{Peak}_t > 0)$$
- **Max Drawdown (Max DD):**
  $$\text{Max DD} = \max_{1 \le t \le N} (DD_t)$$
- **Rolling Win Rate (30 trades):** Розрахунок Win Rate для останніх 30 закритих угод на кожен крок у часі.

---

## 🔗 REST API Контракт

### 1. Отримання торгової статистики

- **Запит:** `GET /api/statistics/trading`
- **Query параметри:**
  - `spaceId` (String, обов'язковий) — ID активного простору.
  - `dateFrom` (String, ISO-8601, опціональний)
  - `dateTo` (String, ISO-8601, опціональний)
  - `compareDateFrom` (String, ISO-8601, опціональний)
  - `compareDateTo` (String, ISO-8601, опціональний)
- **Відповідь (`200 OK`):**

```json
{
  "primary": {
    "summary": {
      "totalTrades": 42,
      "winRate": 57.14,
      "profitFactor": 1.84,
      "expectancyUsd": 85.5,
      "expectancyR": 0.45,
      "maxDrawdownUsd": 450.0,
      "maxDrawdownPercent": 4.5,
      "avgWin": 250.0,
      "avgLoss": -150.0,
      "bestTradeUsd": 1200.0,
      "worstTradeUsd": -300.0,
      "consecutiveWins": 6,
      "consecutiveLosses": 3,
      "grossProfit": 6000.0,
      "grossLoss": 3260.0,
      "totalFees": 150.0,
      "netPnL": 2590.0
    },
    "charts": {
      "equityCurve": [
        {
          "date": "2026-06-01T10:00:00Z",
          "netPnL": 200,
          "cumulativePnL": 200,
          "actualR": 1.0,
          "cumulativeR": 1.0
        },
        {
          "date": "2026-06-02T12:00:00Z",
          "netPnL": -100,
          "cumulativePnL": 100,
          "actualR": -0.5,
          "cumulativeR": 0.5
        }
      ],
      "drawdownCurve": [
        {
          "date": "2026-06-01T10:00:00Z",
          "drawdownUsd": 0,
          "drawdownPercent": 0
        },
        {
          "date": "2026-06-02T12:00:00Z",
          "drawdownUsd": 100,
          "drawdownPercent": 1.0
        }
      ],
      "rollingWinRate": [{ "date": "2026-06-02T12:00:00Z", "winRate": 50.0 }],
      "heatmap": [
        { "date": "2026-06-01", "count": 1, "netPnL": 200 },
        { "date": "2026-06-02", "count": 1, "netPnL": -100 }
      ],
      "pnlByDayOfWeek": {
        "Monday": 540.0,
        "Tuesday": -120.0,
        "Wednesday": 890.0,
        "Thursday": 1100.0,
        "Friday": 180.0
      }
    }
  },
  "compare": null,
  "breakdowns": {
    "field_direction_id": {
      "propertyName": "Direction",
      "type": "SELECT",
      "data": [
        {
          "option": "Long",
          "tradeCount": 25,
          "winRate": 60.0,
          "netPnL": 1800.0,
          "avgPnL": 72.0
        },
        {
          "option": "Short",
          "tradeCount": 17,
          "winRate": 52.9,
          "netPnL": 790.0,
          "avgPnL": 46.4
        }
      ]
    },
    "field_setup_id": {
      "propertyName": "Entry Model",
      "type": "SELECT",
      "data": [
        {
          "option": "Breakout",
          "tradeCount": 12,
          "winRate": 66.6,
          "netPnL": 1200.0,
          "avgPnL": 100.0
        },
        {
          "option": "Retest",
          "tradeCount": 10,
          "winRate": 50.0,
          "netPnL": 300.0,
          "avgPnL": 30.0
        }
      ]
    }
  }
}
```

### 2. Отримання власних звітів для кастомних баз

- **Запит:** `GET /api/statistics/custom/:databaseId`
- **Query параметри:**
  - `dateFrom` (String, ISO-8601, опціональний)
  - `dateTo` (String, ISO-8601, опціональний)
- **Відповідь (`200 OK`):**

```json
{
  "databaseId": "db-uuid",
  "databaseName": "Weekly Watchlist",
  "totalRecords": 24,
  "breakdowns": {
    "field_category_id": {
      "propertyName": "Category",
      "type": "SELECT",
      "data": [
        { "option": "Crypto", "count": 15, "percentage": 62.5 },
        { "option": "Forex", "count": 9, "percentage": 37.5 }
      ]
    }
  },
  "timeSeries": {
    "field_amount_id": {
      "propertyName": "Amount",
      "type": "NUMBER",
      "data": [
        { "date": "2026-06-01", "value": 5000.0 },
        { "date": "2026-06-03", "value": 5500.0 }
      ]
    }
  }
}
```

---

## 🛠️ Чеклист технічної реалізації за шарами

### Шаг 1 — Спільна доменна модель (Domain/DTO)

- [ ] Створити DTO для запитів торгових метрик: [GetTradingStatsDto](file:///Users/vitalii/Desktop/Diploma/fix-space/packages/domain/src/statistics/dto/get-trading-stats.dto.ts) (валідація `spaceId`, дат та порівняльних дат).
- [ ] Створити DTO для запитів кастомних звітів: [GetCustomStatsDto](file:///Users/vitalii/Desktop/Diploma/fix-space/packages/domain/src/statistics/dto/get-custom-stats.dto.ts) (валідація дат).
- [ ] Визначити структури відповідей у вигляді DTO класів: `TradingStatsResponseDto`, `CustomStatsResponseDto`.
- [ ] Експортувати створені DTO в точці входу пакета `@fixspace/domain` та скомпілювати: `pnpm --filter @fixspace/domain build`.

### Шаг 2 — База даних (Database)

- [ ] Переконатися, що прапорець `enableStats` є у Prisma схемі (вже присутній).
- [ ] Створити репозиторій [StatisticsRepository](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/api/src/modules/statistics/repositories/statistics.repository.ts) для оптимізованого витягування записів і їхніх значень.
  - _Замість завантаження всіх зв'язків, завантажити тільки `Record` + `PropertyValue` (з лімітом по `spaceId` та `databaseId`)._

### Шаг 3a — Сервіси та Контролери API (NestJS)

- [ ] Створити [StatisticsService](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/api/src/modules/statistics/statistics.service.ts).
  - [ ] Метод `getTradingStats(userId, dto)`:
    - Знайти базу `trading-journal` для користувача.
    - Завантажити записи за основний період.
    - Обчислити: Win Rate, Profit Factor, Expectancy, Drawdowns, Equity.
    - Згрупувати по всіх SELECT/STATUS властивостях (breakdowns).
    - Якщо вказано порівняльний період — завантажити порівняльні записи та прогнати ті самі обчислення.
  - [ ] Метод `getCustomStats(userId, databaseId, dto)`:
    - Перевірити права доступу користувача до бази.
    - Завантажити записи.
    - Для кожного SELECT/STATUS побудувати розподіл.
    - Для кожного NUMBER знайти перше DATE поле та побудувати лінійний графік.
- [ ] Створити [StatisticsController](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/api/src/modules/statistics/statistics.controller.ts) з декораторами авторизації (`@UseGuards(JwtAuthGuard)`), Swagger анотаціями та обробкою query параметрів.
- [ ] Зареєструвати все у [StatisticsModule](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/api/src/modules/statistics/statistics.module.ts) та підключити його в [AppModule](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/api/src/app.module.ts).

### Шаг 3b — Автотести бекенду (Unit & Integration Tests)

- [ ] [TC-STAT-U-001](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-001-statisticsservice--розрахунок-ключових-торгових-метрик-win-rate-profit-factor-expectancy) — Тестування розрахунку Win Rate, Profit Factor, Expectancy.
- [ ] [TC-STAT-U-002](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-002-statisticsservice--розрахунок-drawdown-та-drawdown-кривої) — Тестування розрахунку Drawdown.
- [ ] [TC-STAT-U-003](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-003-statisticsservice--розбивка-за-select-та-status-властивостями-breakdown) — Тестування групування по SELECT/STATUS.
- [ ] [TC-STAT-U-004](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-004-statisticsservice--генерація-аналітики-для-власних-звітів-кастомних-баз) — Тестування генерації кастомних звітів.
- [ ] [TC-STAT-U-005](../../06-testing/test-cases/11-statistics/unit.md#tc-stat-u-005-statisticsservice--фільтрація-записів-за-часовим-діапазоном) — Тестування фільтрації дат.
- [ ] [TC-STAT-001](../../06-testing/test-cases/11-statistics/integration.md#tc-stat-001-дашборд--ключові-метрики-розраховуються) — Інтеграційний тест для `GET /api/statistics/trading`.
- [ ] [TC-STAT-008](../../06-testing/test-cases/11-statistics/integration.md#tc-stat-008-розбивка-за-select-властивістю) — Інтеграційний тест для розбивки `Direction`.

### Шаг 4 — Клієнтська інтеграція (Web Client API)

- [ ] Створити API методи в [apps/web/src/lib/api/statistics.ts](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/web/src/lib/api/statistics.ts):
  - `getTradingStats(spaceId, filters)`
  - `getCustomStats(databaseId, filters)`
  - `updateChartSettings(settings)` (через загальний API налаштувань користувача).
- [ ] Створити TanStack Query хуки: `useTradingStatsQuery`, `useCustomStatsQuery`.

### Шаг 5 — Сторінки та Маршрутизація (Web Pages)

- [ ] Створити сторінку статистики: [page.tsx](<file:///Users/vitalii/Desktop/Diploma/fix-space/apps/web/src/app/[locale]/(dashboard)/statistics/page.tsx>).
- [ ] Додати посилання "Статистика" в бічне меню [sidebar.tsx](file:///Users/vitalii/Desktop/Diploma/fix-space/apps/web/src/components/layout/sidebar/sidebar.tsx) з іконкою `BarChart2`.
- [ ] Реалізувати стан завантаження в `loading.tsx` з скелетонами графіків.

### Шаг 6 — UI Компоненти статистики (Web Components)

- [ ] **Глобальний DateRangePicker та Toggle порівняння:**
  - Розміщується у верхній панелі. Швидкі пресети (Today, This Week, This Month, YTD, All Time).
  - Toggle "Порівняти" (активує вибір другого DateRange).
- [ ] **Метрики у форматі карток (Metric Cards):**
  - Світлові картки P&L, Win Rate, Profit Factor, Expectancy, Max Drawdown.
  - Порівняльні показники під основним значенням (наприклад, `57.1% ▲ +2.4%` зеленим кольором або `−4.5% ▼ -1.2%` червоним).
  - Використання `font-mono tabular-nums` для чисел.
- [ ] **Equity & Drawdown Chart Component:**
  - Recharts `AreaChart` та `LineChart` в естетиці Void Terminal: плавний градієнт під лінією еквіті (синє/зелене світіння), червоне світіння для просадки.
  - Tooltip з детальним відображенням дати, Net P&L, cumulative R.
- [ ] **Adaptive Breakdown Grid:**
  - Сітка карток, де кожен чарт відображає breakdown SELECT/STATUS поля.
  - Кнопки швидкого перемикання виду: Horizontal Bar (краще для багатьох опцій) ↔ Vertical Bar ↔ Donut Chart (для кругових часток).
- [ ] **Календарна теплокарта (Calendar Heatmap):**
  - Сітка днів року (12 стовпців або стрічка тижнів), де колір клітинки кодує прибуток/збиток (від темно-червоного через сірий до яскраво-зеленого).
- [ ] **Власні звіти (Custom Reports View):**
  - Вкладка зі списком підключених баз.
  - Динамічний рендер діаграм розподілу для SELECT властивостей та часових графіків для NUMBER властивостей.
- [ ] **Панель кастомізації графіків (Chart Customization Menu):**
  - Іконка шестірні на кожному графіку: приховати, перейменувати, змінити тип відображення, вибрати колір.
  - Збереження конфігурації в Context або в User Settings.

---

## ✅ Definition of Done (Критерії готовності)

- [ ] Спільні DTO створені, імпортовані та скомпільовані у `@fixspace/domain`.
- [ ] Бекенд сервіси та контролери повністю покриті юніт-тестами (покриття коду >80% для бізнес-логіки обчислень).
- [ ] Інтеграційні тести (Supertest) проходять успішно для всіх звітів.
- [ ] Всі графіки адаптивно підлаштовуються под зміни розмірів екрану (Responsive Grid).
- [ ] Усі числові поля відображаються моноширинним шрифтом Geist Mono згідно з дизайн-системою.
- [ ] Жодних хардкод-кольорів у `.tsx` файлах (використовуються змінні з `globals.css` або Tailwind класи Void Terminal).
- [ ] Код проходить перевірку лінтером (`turbo lint`) та типізацію (`pnpm check-types`).
- [ ] Створено документацію в Development Journal для гілки `feature/statistics`.
