# Requirements Traceability Matrix (RTM)

> **Мета:** Забезпечити повне покриття вимог тестами. Кожен User Story прив'язаний до GitHub Issue та одного або кількох Test Case ID.
>
> **Легенда:**
>
> - **TC** — Test Case ID (деталі кроків у `test-cases/<module>.md`)
> - **TS** — Test Scenario ID (високий рівень, `strategy.md` §7)
> - **P** — Priority (P1 Must / P2 Should / P3 Could)
>
> **Файли тест-кейсів:** `test-cases/01-authentication.md` … `test-cases/21-customization.md`

---

## 1. Authentication (US-001 — US-009)

| US-ID  | GitHub Issue |                                                                                                        | Test Scenario | Priority |
| ------ | ------------ | ------------------------------------------------------------------------------------------------------ | ------------- | -------- |
| US-001 | #1           | TC-AUTH-001, TC-AUTH-002, TC-AUTH-003, TC-AUTH-033, TC-AUTH-034                                        | TS-AUTH-01    | P1       |
| US-002 | #2           | TC-AUTH-004, TC-AUTH-005, TC-AUTH-006, TC-AUTH-029, TC-AUTH-030, TC-AUTH-031, TC-AUTH-032, TC-AUTH-037 | TS-AUTH-02    | P1       |
| US-003 | #3           | TC-AUTH-007, TC-AUTH-008, TC-AUTH-009, TC-AUTH-010, TC-AUTH-028, TC-AUTH-033, TC-AUTH-035, TC-AUTH-036 | TS-AUTH-03    | P1       |
| US-004 | #5           | TC-AUTH-011, TC-AUTH-012, TC-AUTH-013, TC-AUTH-014                                                     | TS-AUTH-06    | P1       |
| US-005 | #4           | TC-AUTH-015, TC-AUTH-016, TC-AUTH-017, TC-AUTH-036                                                     | TS-AUTH-04    | P1       |
| US-006 | #71          | TC-AUTH-018, TC-AUTH-019, TC-AUTH-020                                                                  | TS-AUTH-03    | P2       |
| US-007 | #72          | TC-AUTH-021, TC-AUTH-022                                                                               | —             | P2       |
| US-008 | #98          | TC-AUTH-023, TC-AUTH-024                                                                               | —             | P2       |
| US-009 | #99          | TC-AUTH-025, TC-AUTH-026, TC-AUTH-027                                                                  | —             | P2       |

## 2. Workspace (US-010 — US-017)

| US-ID  | GitHub Issue |                                            | Test Scenario | Priority |
| ------ | ------------ | ------------------------------------------ | ------------- | -------- |
| US-010 | #6           | TC-WS-001, TC-WS-002, TC-WS-003            | TS-AUTH-01    | P1       |
| US-011 | #35          | TC-WS-004, TC-WS-005, TC-WS-006, TC-WS-022 | TS-SPACE-01   | P1       |
| US-012 | #36          | TC-WS-007, TC-WS-008, TC-WS-022, TC-WS-023 | TS-SPACE-01   | P1       |
| US-013 | #37          | TC-WS-009, TC-WS-010, TC-WS-011            | TS-SPACE-01   | P1       |
| US-014 | #90          | TC-WS-012, TC-WS-013                       | —             | P2       |
| US-015 | #91          | TC-WS-014, TC-WS-015                       | —             | P2       |
| US-016 | #92          | TC-WS-016, TC-WS-017, TC-WS-018            | TS-SPACE-02   | P2       |
| US-017 | #55          | TC-WS-019, TC-WS-020, TC-WS-021            | —             | P2       |

## 3. Sections (US-018 — US-023)

| US-ID  | GitHub Issue |                                                | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------- | ------------- | -------- |
| US-018 | #38          | TC-SEC-001, TC-SEC-002, TC-SEC-003, TC-SEC-015 | TS-SPACE-01   | P1       |
| US-019 | #39          | TC-SEC-004, TC-SEC-005, TC-SEC-016             | TS-SPACE-01   | P1       |
| US-020 | #40          | TC-SEC-006, TC-SEC-007, TC-SEC-008             | TS-SPACE-01   | P1       |
| US-021 | #41          | TC-SEC-009, TC-SEC-010                         | TS-SPACE-01   | P1       |
| US-022 | #74          | TC-SEC-011, TC-SEC-012                         | —             | P2       |
| US-023 | #75          | TC-SEC-013, TC-SEC-014                         | —             | P2       |

## 4. Databases (US-024 — US-031)

| US-ID  | GitHub Issue |                                            | Test Scenario | Priority |
| ------ | ------------ | ------------------------------------------ | ------------- | -------- |
| US-024 | #6           | TC-DB-001, TC-DB-002                       | TS-AUTH-01    | P1       |
| US-025 | #32          | TC-DB-003, TC-DB-004, TC-DB-005, TC-DB-022 | TS-DB-01      | P1       |
| US-026 | #33          | TC-DB-006, TC-DB-007, TC-DB-023            | TS-DB-01      | P1       |
| US-027 | #34          | TC-DB-008, TC-DB-009, TC-DB-010            | TS-DB-01      | P1       |
| US-028 | #56          | TC-DB-011, TC-DB-012, TC-DB-013            | —             | P2       |
| US-029 | #76          | TC-DB-014, TC-DB-015, TC-DB-016            | TS-DB-02      | P2       |
| US-030 | #57          | TC-DB-017, TC-DB-018, TC-DB-019            | —             | P2       |
| US-031 | #120         | TC-DB-020, TC-DB-021                       | —             | P3       |

## 5. Properties (US-032 — US-041)

| US-ID  | GitHub Issue |                                                    | Test Scenario | Priority |
| ------ | ------------ | -------------------------------------------------- | ------------- | -------- |
| US-032 | #9           | TC-PROP-001, TC-PROP-002, TC-PROP-003, TC-PROP-026 | TS-PROP-01    | P1       |
| US-033 | #10          | TC-PROP-004, TC-PROP-005, TC-PROP-006              | TS-PROP-01    | P1       |
| US-034 | #30          | TC-PROP-007, TC-PROP-008, TC-PROP-009, TC-PROP-027 | TS-PROP-01    | P1       |
| US-035 | #31          | TC-PROP-010, TC-PROP-011                           | TS-PROP-01    | P1       |
| US-036 | #7, #8, #19  | TC-PROP-012, TC-PROP-013, TC-PROP-014              | TS-PROP-01    | P1       |
| US-037 | #77          | TC-PROP-015, TC-PROP-016, TC-PROP-017              | —             | P2       |
| US-038 | #78          | TC-PROP-018, TC-PROP-019                           | —             | P2       |
| US-039 | #79          | TC-PROP-020, TC-PROP-021                           | —             | P2       |
| US-040 | #80          | TC-PROP-022, TC-PROP-023                           | —             | P2       |
| US-041 | #119         | TC-PROP-024, TC-PROP-025                           | —             | P3       |

## 6. Records (US-042 — US-052)

| US-ID  | GitHub Issue |                                                              | Test Scenario | Priority |
| ------ | ------------ | ------------------------------------------------------------ | ------------- | -------- |
| US-042 | #22          | TC-REC-001, TC-REC-002, TC-REC-003                           | TS-REC-01     | P1       |
| US-043 | #11          | TC-REC-004, TC-REC-005, TC-REC-029                           | TS-REC-01     | P1       |
| US-044 | #13          | TC-REC-006, TC-REC-007                                       | TS-REC-01     | P1       |
| US-045 | #12          | TC-REC-008, TC-REC-009, TC-REC-010                           | TS-REC-01     | P1       |
| US-046 | #28, #190    | TC-REC-011, TC-REC-012, TC-REC-013, TC-REC-030, TC-TRASH-006 | TS-REC-04     | P1       |
| US-047 | #81          | TC-REC-014, TC-REC-015                                       | —             | P2       |
| US-048 | #51          | TC-REC-016, TC-REC-017                                       | TS-REC-04     | P2       |
| US-049 | #52          | TC-REC-018, TC-REC-019                                       | TS-REC-04     | P2       |
| US-050 | #53          | TC-REC-020, TC-REC-021, TC-REC-031                           | —             | P2       |
| US-051 | #54          | TC-REC-023, TC-REC-024                                       | —             | P2       |
| US-052 | #82          | TC-REC-022, TC-REC-025                                       | —             | P2       |

## 7. Record Content (US-053 — US-065)

| US-ID  | GitHub Issue |                                                    | Test Scenario | Priority |
| ------ | ------------ | -------------------------------------------------- | ------------- | -------- |
| US-053 | #23          | TC-CONT-001, TC-CONT-002, TC-CONT-003, TC-CONT-033 | —             | P1       |
| US-054 | #24          | TC-CONT-004, TC-CONT-005, TC-CONT-006, TC-CONT-032 | —             | P1       |
| US-055 | #25          | TC-CONT-007, TC-CONT-008, TC-CONT-009, TC-CONT-032 | —             | P1       |
| US-056 | #27          | TC-CONT-010, TC-CONT-011, TC-CONT-012              | —             | P1       |
| US-057 | #26          | TC-CONT-013, TC-CONT-014, TC-CONT-015              | —             | P1       |
| US-058 | #83          | TC-CONT-016, TC-CONT-017                           | —             | P2       |
| US-059 | #84          | TC-CONT-018, TC-CONT-019                           | —             | P2       |
| US-060 | #85          | TC-CONT-020, TC-CONT-021                           | —             | P2       |
| US-061 | #86          | TC-CONT-022, TC-CONT-023                           | —             | P2       |
| US-062 | #112         | TC-CONT-024, TC-CONT-025                           | —             | P3       |
| US-063 | #113         | TC-CONT-026, TC-CONT-027                           | —             | P3       |
| US-064 | #114         | TC-CONT-028, TC-CONT-029                           | —             | P3       |
| US-065 | #115         | TC-CONT-030, TC-CONT-031                           | —             | P3       |

## 8. Templates (US-066 — US-071)

| US-ID  | GitHub Issue |                                                    | Test Scenario | Priority |
| ------ | ------------ | -------------------------------------------------- | ------------- | -------- |
| US-066 | #20          | TC-TMPL-001, TC-TMPL-002, TC-TMPL-003              | TS-TMPL-01    | P1       |
| US-067 | #21          | TC-TMPL-004, TC-TMPL-005, TC-TMPL-006              | TS-TMPL-01    | P1       |
| US-068 | #87          | TC-TMPL-007, TC-TMPL-008, TC-TMPL-016, TC-TMPL-017 | TS-TMPL-01    | P2       |
| US-069 | #88          | TC-TMPL-009, TC-TMPL-010, TC-TMPL-011              | TS-TMPL-01    | P2       |
| US-070 | #89          | TC-TMPL-012, TC-TMPL-013                           | TS-TMPL-01    | P2       |
| US-071 | #121         | TC-TMPL-014, TC-TMPL-015                           | —             | P3       |

## 9. Views (US-072 — US-084)

| US-ID  | GitHub Issue |                                                                | Test Scenario | Priority |
| ------ | ------------ | -------------------------------------------------------------- | ------------- | -------- |
| US-072 | #14          | TC-VIEW-001, TC-VIEW-002, TC-VIEW-029                          | TS-REC-01     | P1       |
| US-073 | #17          | TC-VIEW-003, TC-VIEW-004                                       | TS-REC-01     | P1       |
| US-074 | #29          | TC-VIEW-005, TC-VIEW-006                                       | TS-REC-01     | P1       |
| US-075 | #18          | TC-REC-026, TC-VIEW-007, TC-VIEW-008, TC-VIEW-009, TC-VIEW-030 | TS-REC-02     | P1       |
| US-076 | #15          | TC-VIEW-010, TC-VIEW-011, TC-VIEW-012                          | TS-REC-02     | P1       |
| US-077 | #16          | TC-VIEW-013, TC-VIEW-014                                       | TS-REC-01     | P1       |
| US-078 | #63          | TC-VIEW-015, TC-VIEW-016                                       | TS-REC-03     | P2       |
| US-079 | #64          | TC-VIEW-017, TC-VIEW-018                                       | —             | P2       |
| US-080 | #65          | TC-VIEW-019, TC-VIEW-020                                       | —             | P2       |
| US-081 | #66          | TC-VIEW-021, TC-VIEW-022                                       | —             | P2       |
| US-082 | #67          | TC-VIEW-023, TC-VIEW-024, TC-VIEW-029                          | —             | P2       |
| US-083 | #68          | TC-VIEW-025, TC-VIEW-026                                       | —             | P2       |
| US-084 | #69          | TC-VIEW-027, TC-VIEW-028                                       | —             | P2       |

## 10. Global Search (US-085 — US-086)

| US-ID  | GitHub Issue |                                                                                          | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------------------------------------------------- | ------------- | -------- |
| US-085 | #47          | TC-SEARCH-001, TC-SEARCH-002, TC-SEARCH-003, TC-SEARCH-004, TC-SEARCH-006, TC-SEARCH-007 | —             | P2       |
| US-086 | #47          | TC-SEARCH-005, TC-SEARCH-006                                                             | —             | P2       |

## 11. Import & Export (US-087 — US-090)

| US-ID  | GitHub Issue |                                                | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------- | ------------- | -------- |
| US-087 | #49          | TC-IMP-001, TC-IMP-002, TC-IMP-003             | —             | P2       |
| US-088 | #49          | TC-IMP-004, TC-IMP-005                         | —             | P2       |
| US-089 | #50          | TC-IMP-006, TC-IMP-007, TC-IMP-008, TC-IMP-011 | —             | P2       |
| US-090 | #104         | TC-IMP-009, TC-IMP-010, TC-IMP-012             | —             | P3       |

## 12. Formulas (US-098 — US-101)

| US-ID  | GitHub Issue |                                                                 | Test Scenario | Priority |
| ------ | ------------ | --------------------------------------------------------------- | ------------- | -------- |
| US-098 | #19          | TC-FORM-001, TC-FORM-002, TC-FORM-003, TC-FORM-011, TC-FORM-012 | —             | P1       |
| US-099 | #58          | TC-FORM-004, TC-FORM-005, TC-FORM-006                           | —             | P2       |
| US-100 | #58          | TC-FORM-007, TC-FORM-008                                        | —             | P2       |
| US-101 | #111         | TC-FORM-009, TC-FORM-010                                        | —             | P3       |

## 13. Automations (US-102 — US-107)

| US-ID  | GitHub Issue |                                                                 | Test Scenario | Priority |
| ------ | ------------ | --------------------------------------------------------------- | ------------- | -------- |
| US-102 | #59          | TC-AUTO-001, TC-AUTO-002, TC-AUTO-014                           | —             | P2       |
| US-103 | #59          | TC-AUTO-003, TC-AUTO-004, TC-AUTO-005, TC-AUTO-009, TC-AUTO-014 | —             | P2       |
| US-104 | #59          | TC-AUTO-006, TC-AUTO-007                                        | —             | P2       |
| US-105 | #60          | TC-AUTO-008, TC-AUTO-015                                        | —             | P2       |
| US-106 | #60          | TC-AUTO-010, TC-AUTO-011                                        | —             | P2       |
| US-107 | #117         | TC-AUTO-012, TC-AUTO-013                                        | —             | P3       |

## 14. Buttons (US-108 — US-111)

| US-ID  | GitHub Issue |                                                | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------- | ------------- | -------- |
| US-108 | #61          | TC-BTN-001, TC-BTN-002, TC-BTN-009, TC-BTN-010 | —             | P2       |
| US-109 | #61          | TC-BTN-003, TC-BTN-004                         | —             | P2       |
| US-110 | #62          | TC-BTN-005, TC-BTN-006                         | —             | P2       |
| US-111 | #118         | TC-BTN-007, TC-BTN-008, TC-BTN-009             | —             | P3       |

## 15. Statistics (US-112 — US-116)

| US-ID  | GitHub Issue |                                                                 | Test Scenario | Priority |
| ------ | ------------ | --------------------------------------------------------------- | ------------- | -------- |
| US-112 | #45          | TC-STAT-001, TC-STAT-002, TC-STAT-003, TC-STAT-012, TC-STAT-013 | —             | P2       |
| US-113 | #45          | TC-STAT-004, TC-STAT-005                                        | —             | P2       |
| US-114 | #46          | TC-STAT-006, TC-STAT-007                                        | —             | P2       |
| US-115 | #46          | TC-STAT-008, TC-STAT-009                                        | —             | P2       |
| US-116 | #110         | TC-STAT-010, TC-STAT-011, TC-STAT-012                           | —             | P3       |

## 16. Settings (US-117 — US-124)

| US-ID  | GitHub Issue |                                    | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------- | ------------- | -------- |
| US-117 | #42          | TC-SET-001, TC-SET-002, TC-SET-020 | TS-USER-01    | P1       |
| US-118 | #43          | TC-SET-003, TC-SET-004, TC-SET-005 | TS-USER-01    | P1       |
| US-119 | #44          | TC-SET-006, TC-SET-007, TC-SET-008 | TS-USER-03    | P1       |
| US-120 | #93          | TC-SET-009, TC-SET-010, TC-SET-019 | —             | P2       |
| US-121 | #94          | TC-SET-011, TC-SET-012             | —             | P2       |
| US-122 | #95          | TC-SET-013, TC-SET-014             | —             | P2       |
| US-123 | #96          | TC-SET-015, TC-SET-016             | —             | P2       |
| US-124 | #97          | TC-SET-017, TC-SET-018             | TS-USER-01    | P2       |

## 17. Onboarding (US-125 — US-129)

| US-ID  | GitHub Issue |                                                | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------- | ------------- | -------- |
| US-125 | #73          | TC-ONB-001, TC-ONB-002, TC-ONB-003, TC-ONB-013 | —             | P2       |
| US-126 | #100         | TC-ONB-004, TC-ONB-005, TC-ONB-012             | —             | P2       |
| US-127 | #101         | TC-ONB-006, TC-ONB-007                         | —             | P2       |
| US-128 | #123         | TC-ONB-008, TC-ONB-009                         | —             | P3       |
| US-129 | #124         | TC-ONB-010, TC-ONB-011                         | —             | P3       |

## 18. Notifications (US-130 — US-133)

| US-ID  | GitHub Issue |                                                                      | Test Scenario | Priority |
| ------ | ------------ | -------------------------------------------------------------------- | ------------- | -------- |
| US-130 | #102         | TC-NOTIF-001, TC-NOTIF-002, TC-NOTIF-003, TC-NOTIF-010, TC-NOTIF-011 | —             | P2       |
| US-131 | #103         | TC-NOTIF-004, TC-NOTIF-005, TC-NOTIF-010                             | —             | P2       |
| US-132 | #103         | TC-NOTIF-006, TC-NOTIF-007                                           | —             | P2       |
| US-133 | #125         | TC-NOTIF-008, TC-NOTIF-009                                           | —             | P3       |

## 19. Integrations (US-091 — US-097)

| US-ID  | GitHub Issue |                                                | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------- | ------------- | -------- |
| US-091 | #105         | TC-INT-001, TC-INT-002, TC-INT-015, TC-INT-016 | —             | P3       |
| US-092 | #105         | TC-INT-003, TC-INT-004                         | —             | P3       |
| US-093 | #105         | TC-INT-005, TC-INT-006                         | —             | P3       |
| US-094 | #106         | TC-INT-007, TC-INT-008                         | —             | P3       |
| US-095 | #107         | TC-INT-009, TC-INT-010                         | —             | P3       |
| US-096 | #108         | TC-INT-011                                     | —             | P3       |
| US-097 | #109         | TC-INT-012, TC-INT-013, TC-INT-014, TC-INT-015 | —             | P3       |

## 20. Trash (US-134 — US-135)

| US-ID  | GitHub Issue |                                                                                    | Test Scenario | Priority |
| ------ | ------------ | ---------------------------------------------------------------------------------- | ------------- | -------- |
| US-134 | #48          | TC-TRASH-001, TC-TRASH-002, TC-TRASH-003, TC-TRASH-004, TC-TRASH-005, TC-TRASH-007 | —             | P2       |
| US-135 | #70          | TC-TRASH-008                                                                       | —             | P2       |

## 21. Customization (US-136 — US-137)

| US-ID  | GitHub Issue |                                                    | Test Scenario | Priority |
| ------ | ------------ | -------------------------------------------------- | ------------- | -------- |
| US-136 | #116         | TC-CUST-001, TC-CUST-002, TC-CUST-005, TC-CUST-006 | —             | P3       |
| US-137 | #122         | TC-CUST-003, TC-CUST-004, TC-CUST-005              | —             | P3       |

## 22. Views — Meta-fields (US-138)

| US-ID  | GitHub Issue |                        | Test Scenario | Priority |
| ------ | ------------ | ---------------------- | ------------- | -------- |
| US-138 | #189         | TC-REC-027, TC-REC-028 | —             | P2       |

---

## Зведена статистика покриття

| Пріоритет     | User Stories | Test Cases | Покриття |
| ------------- | ------------ | ---------- | -------- |
| **P1 Must**   | 44           | 150        | ✅ 100%  |
| **P2 Should** | 70           | 178        | ✅ 100%  |
| **P3 Could**  | 24           | 55         | ✅ 100%  |
| **Разом**     | **138**      | **380**    | ✅ 100%  |

## Покриття по модулях

| Модуль              | US  | TC  | TS прив'язка             |
| ------------------- | --- | --- | ------------------------ |
| Authentication      | 9   | 37  | TS-AUTH-01 — TS-AUTH-06  |
| Workspace           | 8   | 23  | TS-SPACE-01, TS-SPACE-02 |
| Sections            | 6   | 16  | TS-SPACE-01              |
| Databases           | 8   | 23  | TS-DB-01, TS-DB-02       |
| Properties          | 10  | 27  | TS-PROP-01               |
| Records             | 11  | 29  | TS-REC-01, TS-REC-04     |
| Record Content      | 13  | 33  | —                        |
| Templates           | 6   | 17  | TS-TMPL-01               |
| Views               | 13  | 31  | TS-REC-01 — TS-REC-03    |
| Global Search       | 2   | 7   | —                        |
| Import & Export     | 4   | 12  | —                        |
| Formulas            | 4   | 12  | —                        |
| Automations         | 6   | 15  | —                        |
| Buttons             | 4   | 10  | —                        |
| Statistics          | 5   | 13  | —                        |
| Settings            | 8   | 20  | TS-USER-01, TS-USER-03   |
| Onboarding          | 5   | 13  | —                        |
| Notifications       | 4   | 11  | —                        |
| Integrations        | 7   | 16  | —                        |
| Trash               | 2   | 7   | —                        |
| Customization       | 2   | 6   | —                        |
| Views — Meta-fields | 1   | 2   | —                        |
