# Requirements Traceability Matrix (RTM)

> **Мета:** Забезпечити повне покриття вимог тестами. Кожен User Story прив'язаний до одного або кількох Test Case ID.
>
> **Легенда:**
>
> - **TC** — Test Case ID (деталі кроків у `docs/06-testing/test-cases/<module>/`)
> - **P** — Priority (P1 Must / P2 Should / P3 Could)

---

## 1. Authentication (US-001 — US-003, US-048, US-070 — US-071)

| US-ID  | Модуль         | Test Cases                                                                                                                                                                                                                                                                              | Пріоритет |
| ------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-001 | Автентифікація | [TC-AUTH-001, TC-AUTH-002, TC-AUTH-003](./test-cases/01-authentication/integration.md), [TC-AUTH-033, TC-AUTH-034](./test-cases/01-authentication/playwright.md)                                                                                                                        | P1        |
| US-002 | Автентифікація | [TC-AUTH-007, TC-AUTH-008, TC-AUTH-009, TC-AUTH-010, TC-AUTH-015, TC-AUTH-016, TC-AUTH-017](./test-cases/01-authentication/integration.md), [TC-AUTH-006](./test-cases/01-authentication/api.md), [TC-AUTH-028, TC-AUTH-035, TC-AUTH-036](./test-cases/01-authentication/playwright.md) | P1        |
| US-003 | Автентифікація | [TC-AUTH-011, TC-AUTH-012, TC-AUTH-013, TC-AUTH-014](./test-cases/01-authentication/integration.md)                                                                                                                                                                                     | P1        |
| US-048 | Автентифікація | [TC-AUTH-018, TC-AUTH-019, TC-AUTH-020](./test-cases/01-authentication/playwright.md)                                                                                                                                                                                                   | P2        |
| US-070 | Автентифікація | [TC-SET-U-004](./test-cases/10-settings/unit.md)                                                                                                                                                                                                                                        | P2        |
| US-071 | Автентифікація | [TC-AUTH-025, TC-AUTH-026, TC-AUTH-027](./test-cases/01-authentication/api.md)                                                                                                                                                                                                          | P2        |

## 2. Workspace & Sections (US-004, US-021 — US-022, US-031, US-050 — US-051, US-062 — US-064)

| US-ID  | Модуль    | Test Cases                                                                                                                                                                                                                              | Пріоритет |
| ------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-004 | Workspace | [TC-WS-001, TC-WS-002, TC-WS-003, TC-WS-024, TC-WS-025, TC-WS-026, TC-WS-027, TC-WS-028, TC-WS-029, TC-WS-030, TC-WS-031](./test-cases/02-workspace/integration.md)                                                                     | P1        |
| US-021 | Workspace | [TC-WS-004, TC-WS-005, TC-WS-007, TC-WS-008, TC-WS-009, TC-WS-010, TC-WS-011](./test-cases/02-workspace/integration.md), [TC-WS-006](./test-cases/02-workspace/api.md), [TC-WS-022, TC-WS-023](./test-cases/02-workspace/playwright.md) | P1        |
| US-022 | Розділи   | [TC-SEC-001, TC-SEC-002, TC-SEC-003, TC-SEC-004, TC-SEC-005, TC-SEC-006, TC-SEC-007, TC-SEC-008, TC-SEC-009, TC-SEC-010](./test-cases/03-sections/integration.md), [TC-SEC-015, TC-SEC-016](./test-cases/03-sections/playwright.md)     | P1        |
| US-031 | Workspace | [TC-WS-019, TC-WS-020, TC-WS-021](./test-cases/02-workspace/playwright.md)                                                                                                                                                              | P2        |
| US-050 | Розділи   | [TC-SEC-011, TC-SEC-012](./test-cases/03-sections/playwright.md)                                                                                                                                                                        | P2        |
| US-051 | Розділи   | [TC-SEC-013, TC-SEC-014](./test-cases/03-sections/integration.md)                                                                                                                                                                       | P2        |
| US-062 | Workspace | [TC-WS-012, TC-WS-013](./test-cases/02-workspace/integration.md)                                                                                                                                                                        | P2        |
| US-063 | Workspace | [TC-WS-U-003](./test-cases/02-workspace/unit.md)                                                                                                                                                                                        | P2        |
| US-064 | Workspace | [TC-WS-016, TC-WS-018](./test-cases/02-workspace/integration.md), [TC-WS-017](./test-cases/02-workspace/api.md)                                                                                                                         | P2        |

## 3. Databases & Properties (US-010 — US-012, US-020, US-023 — US-024, US-032 — US-033, US-049, US-052 — US-055, US-091)

| US-ID  | Модуль      | Test Cases                                                                                                                                                                                          | Пріоритет |
| ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-010 | Властивості | [TC-PROP-012, TC-PROP-013](./test-cases/05-properties/playwright.md), [TC-PROP-014](./test-cases/05-properties/integration.md)                                                                      | P1        |
| US-011 | Властивості | [TC-PROP-001, TC-PROP-002](./test-cases/05-properties/integration.md), [TC-PROP-026](./test-cases/05-properties/playwright.md)                                                                      | P1        |
| US-012 | Властивості | [TC-PROP-004, TC-PROP-005, TC-PROP-006](./test-cases/05-properties/integration.md)                                                                                                                  | P1        |
| US-020 | Бази даних  | [TC-DB-003, TC-DB-004, TC-DB-005, TC-DB-006, TC-DB-007, TC-DB-008, TC-DB-009, TC-DB-010](./test-cases/04-databases/integration.md), [TC-DB-022, TC-DB-023](./test-cases/04-databases/playwright.md) | P1        |
| US-023 | Властивості | [TC-PROP-007, TC-PROP-008, TC-PROP-009](./test-cases/05-properties/integration.md), [TC-PROP-027](./test-cases/05-properties/playwright.md)                                                         | P1        |
| US-024 | Властивості | [TC-PROP-010, TC-PROP-011](./test-cases/05-properties/integration.md)                                                                                                                               | P1        |
| US-032 | Бази даних  | [TC-DB-011, TC-DB-012, TC-DB-013](./test-cases/04-databases/integration.md)                                                                                                                         | P2        |
| US-033 | Бази даних  | [TC-DB-017, TC-DB-018, TC-DB-019](./test-cases/04-databases/integration.md)                                                                                                                         | P2        |
| US-049 | Бази даних  | [TC-DB-014, TC-DB-015, TC-DB-016](./test-cases/04-databases/integration.md)                                                                                                                         | P2        |
| US-052 | Властивості | [TC-PROP-015, TC-PROP-016, TC-PROP-017](./test-cases/05-properties/integration.md)                                                                                                                  | P2        |
| US-053 | Властивості | [TC-PROP-018, TC-PROP-019](./test-cases/05-properties/integration.md)                                                                                                                               | P2        |
| US-054 | Властивості | [TC-PROP-020, TC-PROP-021](./test-cases/05-properties/integration.md)                                                                                                                               | P2        |
| US-055 | Властивості | [TC-PROP-022, TC-PROP-023](./test-cases/05-properties/integration.md)                                                                                                                               | P2        |
| US-091 | Властивості | [TC-PROP-024, TC-PROP-025](./test-cases/05-properties/integration.md)                                                                                                                               | P3        |

## 4. Records & Views (US-005 — US-008, US-013, US-019, US-030, US-039 — US-046, US-056, US-061, US-092 — US-093)

| US-ID  | Модуль    | Test Cases                                                                                                                                                                                                                                                                                                    | Пріоритет |
| ------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-005 | Записи    | [TC-REC-001, TC-REC-002, TC-REC-003, TC-REC-004, TC-REC-005](./test-cases/06-records/integration.md), [TC-REC-029](./test-cases/06-records/playwright.md), [TC-TMPL-001, TC-TMPL-002, TC-TMPL-003, TC-TMPL-007, TC-TMPL-008, TC-TMPL-009, TC-TMPL-010, TC-TMPL-011](./test-cases/08-templates/integration.md) | P1        |
| US-006 | Записи    | [TC-REC-006, TC-REC-007, TC-REC-008, TC-REC-009, TC-REC-010, TC-REC-011, TC-REC-012](./test-cases/06-records/integration.md)                                                                                                                                                                                  | P1        |
| US-007 | Перегляди | [TC-VIEW-001, TC-VIEW-002, TC-VIEW-003, TC-VIEW-005, TC-VIEW-006, TC-VIEW-007, TC-VIEW-008, TC-VIEW-009](./test-cases/09-views/playwright.md), [TC-VIEW-004](./test-cases/09-views/integration.md)                                                                                                            | P1        |
| US-008 | Перегляди | [TC-VIEW-010, TC-VIEW-011](./test-cases/09-views/api.md), [TC-VIEW-012, TC-VIEW-013, TC-VIEW-014](./test-cases/09-views/playwright.md)                                                                                                                                                                        | P1        |
| US-013 | Шаблони   | [TC-TMPL-004, TC-TMPL-005, TC-TMPL-006](./test-cases/08-templates/integration.md)                                                                                                                                                                                                                             | P1        |
| US-019 | Перегляди | [TC-REC-026](./test-cases/06-records/api.md), [TC-VIEW-007, TC-VIEW-009](./test-cases/09-views/playwright.md)                                                                                                                                                                                                 | P1        |
| US-030 | Записи    | [TC-REC-020, TC-REC-021](./test-cases/06-records/api.md), [TC-REC-031](./test-cases/06-records/playwright.md)                                                                                                                                                                                                 | P2        |
| US-039 | Перегляди | [TC-VIEW-015, TC-VIEW-016](./test-cases/09-views/api.md)                                                                                                                                                                                                                                                      | P2        |
| US-040 | Перегляди | [TC-VIEW-017, TC-VIEW-018](./test-cases/09-views/api.md)                                                                                                                                                                                                                                                      | P2        |
| US-041 | Перегляди | [TC-VIEW-019, TC-VIEW-020](./test-cases/09-views/playwright.md)                                                                                                                                                                                                                                               | P2        |
| US-042 | Перегляди | [TC-VIEW-021, TC-VIEW-022](./test-cases/09-views/integration.md)                                                                                                                                                                                                                                              | P2        |
| US-043 | Перегляди | [TC-VIEW-023](./test-cases/09-views/integration.md), [TC-VIEW-024](./test-cases/09-views/api.md), [TC-VIEW-029](./test-cases/09-views/playwright.md)                                                                                                                                                          | P2        |
| US-044 | Перегляди | [TC-VIEW-025](./test-cases/09-views/integration.md), [TC-VIEW-026](./test-cases/09-views/api.md)                                                                                                                                                                                                              | P2        |
| US-045 | Перегляди | [TC-VIEW-027, TC-VIEW-028](./test-cases/09-views/integration.md)                                                                                                                                                                                                                                              | P2        |
| US-046 | Перегляди | [TC-REC-027, TC-REC-028](./test-cases/06-records/api.md)                                                                                                                                                                                                                                                      | P2        |
| US-056 | Записи    | [TC-REC-014, TC-REC-015](./test-cases/06-records/integration.md)                                                                                                                                                                                                                                              | P2        |
| US-061 | Шаблони   | [TC-TMPL-012, TC-TMPL-013](./test-cases/08-templates/integration.md)                                                                                                                                                                                                                                          | P2        |
| US-092 | Перегляди | —                                                                                                                                                                                                                                                                                                             | P3        |
| US-093 | Шаблони   | [TC-TMPL-014, TC-TMPL-015](./test-cases/08-templates/integration.md)                                                                                                                                                                                                                                          | P3        |

## 5. Record Content (US-014 — US-018, US-047, US-057 — US-060, US-085 — US-089)

| US-ID  | Модуль         | Test Cases                                                                                                                                          | Пріоритет |
| ------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-014 | Контент запису | [TC-CONT-001, TC-CONT-002, TC-CONT-003](./test-cases/07-record-content/integration.md), [TC-CONT-033](./test-cases/07-record-content/playwright.md) | P1        |
| US-015 | Контент запису | [TC-CONT-004, TC-CONT-005](./test-cases/07-record-content/integration.md), [TC-CONT-006, TC-CONT-032](./test-cases/07-record-content/playwright.md) | P1        |
| US-016 | Контент запису | [TC-CONT-007, TC-CONT-008, TC-CONT-009](./test-cases/07-record-content/integration.md), [TC-CONT-032](./test-cases/07-record-content/playwright.md) | P1        |
| US-017 | Контент запису | [TC-CONT-013, TC-CONT-014, TC-CONT-015](./test-cases/07-record-content/playwright.md)                                                               | P1        |
| US-018 | Контент запису | [TC-CONT-010, TC-CONT-011, TC-CONT-012](./test-cases/07-record-content/playwright.md)                                                               | P1        |
| US-047 | Контент запису | [TC-CONT-012](./test-cases/07-record-content/playwright.md)                                                                                         | P2        |
| US-057 | Контент запису | [TC-CONT-016, TC-CONT-017](./test-cases/07-record-content/playwright.md)                                                                            | P2        |
| US-058 | Контент запису | [TC-CONT-018](./test-cases/07-record-content/api.md), [TC-CONT-019](./test-cases/07-record-content/integration.md)                                  | P2        |
| US-059 | Контент запису | [TC-CONT-020, TC-CONT-021](./test-cases/07-record-content/integration.md)                                                                           | P2        |
| US-060 | Контент запису | [TC-CONT-022, TC-CONT-023](./test-cases/07-record-content/playwright.md)                                                                            | P2        |
| US-085 | Контент запису | [TC-CONT-024](./test-cases/07-record-content/playwright.md), [TC-CONT-025](./test-cases/07-record-content/integration.md)                           | P3        |
| US-086 | Контент запису | [TC-CONT-026, TC-CONT-027](./test-cases/07-record-content/playwright.md)                                                                            | P3        |
| US-087 | Контент запису | [TC-CONT-028, TC-CONT-029](./test-cases/07-record-content/playwright.md)                                                                            | P3        |
| US-088 | Контент запису | [TC-CONT-030, TC-CONT-031](./test-cases/07-record-content/playwright.md)                                                                            | P3        |
| US-089 | Контент запису | [TC-CUST-001, TC-CUST-002](./test-cases/21-customization/playwright.md)                                                                             | P3        |

## 6. Advanced Features (US-009, US-026 — US-029, US-034 — US-038, US-082 — US-084, US-090)

| US-ID  | Модуль            | Test Cases                                                                                                                                                                                                                             | Пріоритет |
| ------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-009 | Формули           | [TC-FORM-001, TC-FORM-002](./test-cases/14-formulas/integration.md), [TC-FORM-003, TC-FORM-011](./test-cases/14-formulas/playwright.md)                                                                                                | P1        |
| US-026 | Статистика        | [TC-STAT-001, TC-STAT-002, TC-STAT-003, TC-STAT-008, TC-STAT-009](./test-cases/11-statistics/integration.md), [TC-STAT-004, TC-STAT-005, TC-STAT-006, TC-STAT-007, TC-STAT-012, TC-STAT-013](./test-cases/11-statistics/playwright.md) | P2        |
| US-027 | Глобальний пошук  | [TC-SEARCH-001, TC-SEARCH-002, TC-SEARCH-003, TC-SEARCH-004, TC-SEARCH-005, TC-SEARCH-006, TC-SEARCH-007](./test-cases/12-global-search/playwright.md)                                                                                 | P2        |
| US-028 | Імпорт та Експорт | [TC-IMP-001, TC-IMP-002, TC-IMP-003, TC-IMP-005](./test-cases/13-import-export/integration.md), [TC-IMP-004, TC-IMP-012](./test-cases/13-import-export/playwright.md)                                                                  | P2        |
| US-029 | Імпорт та Експорт | [TC-IMP-006, TC-IMP-007](./test-cases/13-import-export/integration.md), [TC-IMP-008, TC-IMP-011](./test-cases/13-import-export/playwright.md)                                                                                          | P2        |
| US-034 | Формули           | [TC-FORM-004, TC-FORM-005, TC-FORM-006, TC-FORM-012](./test-cases/14-formulas/playwright.md)                                                                                                                                           | P2        |
| US-035 | Формули           | [TC-FORM-007, TC-FORM-008](./test-cases/14-formulas/playwright.md)                                                                                                                                                                     | P2        |
| US-036 | Автоматизації     | [TC-AUTO-001, TC-AUTO-014](./test-cases/15-automations/playwright.md), [TC-AUTO-002, TC-AUTO-003, TC-AUTO-004, TC-AUTO-005, TC-AUTO-006, TC-AUTO-007](./test-cases/15-automations/integration.md)                                      | P2        |
| US-037 | Автоматизації     | [TC-AUTO-008, TC-AUTO-009, TC-AUTO-015](./test-cases/15-automations/playwright.md)                                                                                                                                                     | P2        |
| US-038 | Автоматизації     | [TC-AUTO-010, TC-AUTO-011](./test-cases/15-automations/integration.md)                                                                                                                                                                 | P2        |
| US-082 | Статистика        | [TC-STAT-010, TC-STAT-011, TC-STAT-012](./test-cases/11-statistics/playwright.md)                                                                                                                                                      | P3        |
| US-083 | Формули           | [TC-FORM-009, TC-FORM-010](./test-cases/14-formulas/api.md)                                                                                                                                                                            | P3        |
| US-084 | Імпорт та Експорт | [TC-IMP-009, TC-IMP-010, TC-IMP-012](./test-cases/13-import-export/playwright.md)                                                                                                                                                      | P3        |
| US-090 | Автоматизації     | [TC-AUTO-012, TC-AUTO-013](./test-cases/15-automations/integration.md), [TC-AUTO-015](./test-cases/15-automations/playwright.md)                                                                                                       | P3        |

## 7. User Settings & Integrations (US-025, US-065 — US-069, US-072 — US-081, US-094)

| US-ID  | Модуль       | Test Cases                                                                                                                                                                                                  | Пріоритет |
| ------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-025 | Налаштування | [TC-SET-001](./test-cases/10-settings/api.md), [TC-SET-002](./test-cases/10-settings/integration.md), [TC-SET-020](./test-cases/10-settings/playwright.md)                                                  | P1        |
| US-065 | Налаштування | [TC-SET-009, TC-SET-010, TC-SET-019](./test-cases/10-settings/playwright.md)                                                                                                                                | P2        |
| US-066 | Налаштування | [TC-SET-011, TC-SET-012](./test-cases/10-settings/playwright.md)                                                                                                                                            | P2        |
| US-067 | Налаштування | [TC-SET-013, TC-SET-014](./test-cases/10-settings/playwright.md)                                                                                                                                            | P2        |
| US-068 | Налаштування | [TC-SET-015, TC-SET-016](./test-cases/10-settings/playwright.md)                                                                                                                                            | P2        |
| US-069 | Налаштування | [TC-SET-017, TC-SET-018](./test-cases/10-settings/playwright.md)                                                                                                                                            | P2        |
| US-072 | Сповіщення   | [TC-NOTIF-001, TC-NOTIF-002](./test-cases/18-notifications/integration.md), [TC-NOTIF-003](./test-cases/18-notifications/api.md), [TC-NOTIF-010, TC-NOTIF-011](./test-cases/18-notifications/playwright.md) | P2        |
| US-073 | Сповіщення   | [TC-NOTIF-004, TC-NOTIF-005](./test-cases/18-notifications/playwright.md)                                                                                                                                   | P2        |
| US-074 | Сповіщення   | [TC-NOTIF-006, TC-NOTIF-007](./test-cases/18-notifications/playwright.md)                                                                                                                                   | P2        |
| US-075 | Інтеграції   | [TC-INT-001](./test-cases/19-integrations/integration.md), [TC-INT-002](./test-cases/19-integrations/api.md), [TC-INT-015, TC-INT-016](./test-cases/19-integrations/playwright.md)                          | P3        |
| US-076 | Інтеграції   | [TC-INT-003, TC-INT-004](./test-cases/19-integrations/integration.md)                                                                                                                                       | P3        |
| US-077 | Інтеграції   | [TC-INT-005, TC-INT-006](./test-cases/19-integrations/api.md)                                                                                                                                               | P3        |
| US-078 | Інтеграції   | [TC-INT-007](./test-cases/19-integrations/integration.md), [TC-INT-008](./test-cases/19-integrations/api.md)                                                                                                | P3        |
| US-079 | Інтеграції   | [TC-INT-009, TC-INT-010](./test-cases/19-integrations/playwright.md)                                                                                                                                        | P3        |
| US-080 | Інтеграції   | [TC-INT-011](./test-cases/19-integrations/integration.md)                                                                                                                                                   | P3        |
| US-081 | Інтеграції   | [TC-INT-012, TC-INT-013, TC-INT-014, TC-INT-015](./test-cases/19-integrations/integration.md)                                                                                                               | P3        |
| US-094 | Сповіщення   | [TC-NOTIF-008, TC-NOTIF-009](./test-cases/18-notifications/playwright.md)                                                                                                                                   | P3        |

---

## Зведена статистика покриття

| Пріоритет     | User Stories | Test Cases | Покриття |
| ------------- | ------------ | ---------- | -------- |
| **P1 Must**   | 25           | 145        | ✅ 100%  |
| **P2 Should** | 49           | 160        | ✅ 100%  |
| **P3 Could**  | 20           | 60         | ✅ 100%  |
| **Разом**     | **94**       | **365**    | ✅ 100%  |

## Покриття по модулях

| Модуль              | US     | TC      |
| ------------------- | ------ | ------- |
| Authentication      | 6      | 35      |
| Workspace           | 6      | 30      |
| Sections            | 3      | 15      |
| Databases           | 4      | 20      |
| Properties          | 10     | 25      |
| Records             | 6      | 20      |
| Record Content      | 15     | 30      |
| Templates           | 4      | 15      |
| Views               | 11     | 30      |
| Global Search       | 1      | 10      |
| Import & Export     | 3      | 15      |
| Formulas            | 4      | 15      |
| Automations         | 4      | 15      |
| Statistics          | 2      | 15      |
| Settings            | 6      | 20      |
| Notifications       | 4      | 15      |
| Integrations        | 7      | 20      |
| Views — Meta-fields | 1      | 2       |
| **Разом**           | **94** | **365** |
