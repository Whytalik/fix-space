# Manual API Tests: Record content

### [ ] TC-CONT-018: Додавання графіка (CHART)

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-058                   |
| **Issue**    | #84                      |
| **TS**       | —                        |
| **Метод**    | Manual (Postman)         |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P2                       |

**Кроки:**

1. Додати CHART блок з `chartType: "entry"`, `asset: "XAUUSD"`, `timeframe: "H1"`
2. Перевірити що метадані збережені

**Очікуваний результат:**

- Статус: `201 Created`
- CHART з коректними метаданими
