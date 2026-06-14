# Unit Tests: Notifications

### [x] TC-NOTIF-U-001: NotificationService.findAll — повертає mapped DTOs для користувача

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-072             |
| **Issue**    | #102               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок: `notifRepo.findAllByUserId` повертає масив з одним сповіщенням.
2. Викликати `service.findAll("u-1")`.
3. Перевірити результат.

**Очікуваний результат:**

- Повертається масив з одним `NotificationResponseDto`.
- `findAllByUserId` викликається з правильним `userId`.

---

### [x] TC-NOTIF-U-002: NotificationService.findAll — порожній масив коли нема сповіщень

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-072             |
| **Issue**    | #102               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. `notifRepo.findAllByUserId` повертає `[]`.
2. Викликати `service.findAll("u-1")`.

**Очікуваний результат:**

- Повертається порожній масив.

---

### [x] TC-NOTIF-U-003: NotificationService.getUnreadCount — повертає кількість непрочитаних

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-073             |
| **Issue**    | #103               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `notifRepo.countUnreadByUserId` повертає `7`.
2. Викликати `service.getUnreadCount("u-1")`.

**Очікуваний результат:**

- `result.count === 7`.

---

### [x] TC-NOTIF-U-004: NotificationService.markAsRead — NotFoundException коли сповіщення не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-094          |
| **Issue**    | #125            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `notifRepo.findByIdAndUserId` повертає `null`.
2. Викликати `service.markAsRead("u-1", "n-999")`.

**Очікуваний результат:**

- Викидається `NotFoundException`.
- `notifRepo.markAsRead` не викликається.

---

### [x] TC-NOTIF-U-005: NotificationService.markAsRead — позначає сповіщення прочитаним

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-094             |
| **Issue**    | #125               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `findByIdAndUserId` повертає сповіщення, `markAsRead` повертає оновлений запис з `isRead: true`.
2. Викликати `service.markAsRead("u-1", "n-1")`.

**Очікуваний результат:**

- `result.isRead === true`.
- `notifRepo.markAsRead` викликається з правильними аргументами.

---

### [x] TC-NOTIF-U-006: NotificationService.markAllAsRead — делегує в репозиторій

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-094             |
| **Issue**    | #125               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Викликати `service.markAllAsRead("u-1")`.

**Очікуваний результат:**

- `notifRepo.markAllAsRead("u-1")` викликається.

---

### [x] TC-NOTIF-U-007: NotificationService.deleteAll — делегує в репозиторій

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-072             |
| **Issue**    | #102               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Викликати `service.deleteAll("u-1")`.

**Очікуваний результат:**

- `notifRepo.deleteAllByUserId("u-1")` викликається.

---

### [x] TC-NOTIF-U-008: NotificationService.create — створює без прунінгу коли менше ліміту

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-072         |
| **Issue**    | #102           |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P2             |

**Кроки:**

1. `countByUserId` повертає `10`.
2. Викликати `service.create("u-1", NotificationType.INFO, "hello")`.

**Очікуваний результат:**

- `deleteOldest` не викликається.
- `create` викликається і повертає DTO.

---

### [x] TC-NOTIF-U-009: NotificationService.create — видаляє найстаріші коли досягнуто ліміт 50

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-072         |
| **Issue**    | #102           |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. `countByUserId` повертає `50`.
2. Викликати `service.create("u-1", NotificationType.INFO, "hello")`.

**Очікуваний результат:**

- `deleteOldest("u-1", 1)` викликається перед створенням.

---

### [x] TC-NOTIF-U-010: NotificationService.create — передає необов'язковий link в репозиторій

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-074             |
| **Issue**    | #103               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. `countByUserId` повертає `0`.
2. Викликати `service.create("u-1", NotificationType.AUTOMATION, "text", "/some-link")`.

**Очікуваний результат:**

- `notifRepo.create` викликається з четвертим аргументом `"/some-link"`.
