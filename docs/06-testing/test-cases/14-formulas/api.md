# Manual API Tests: Formulas

### [ ] TC-FORM-009: FORMULA — фільтрація за значенням

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-083                   |
| **Issue**    | #111                     |
| **TS**       | —                        |
| **Метод**    | Manual (Postman)         |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P3                       |

**Кроки:**

1. FORMULA-властивість існує
2. `GET /records?databaseId=<db-id>&filter=formulaProp,greater_than,50`
3. Перевірити результати

**Очікуваний результат:**

- Фільтр по FORMULA працює коректно

---

### [ ] TC-FORM-010: FORMULA — сортування за значенням

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-083                   |
| **Issue**    | #111                     |
| **TS**       | —                        |
| **Метод**    | Manual (Postman)         |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P3                       |

**Кроки:**

1. `GET /records?databaseId=<db-id>&sort=formulaProp&order=desc`
2. Перевірити порядок записів

**Очікуваний результат:**

- Записи відсортовані по FORMULA-значенню
