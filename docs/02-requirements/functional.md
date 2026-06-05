# Функціональні вимоги

Структурований перелік функцій системи, організований за доменами.

## 3. Функціональні вимоги

---

### 📋 Загальні вимоги

- [3.1 Автентифікація та акаунт](./functional/3.1-auth-account.md)
- [3.2 Робочий простір](./functional/3.2-workspace.md)
- [3.3 Секції](./functional/3.3-sections.md)
- [3.4 Бази даних](./functional/3.4-databases.md)
- [3.5 Властивості](./functional/3.5-properties.md)
- [3.6 Записи](./functional/3.6-records.md)
- [3.7 Контентна область запису](./functional/3.7-content-area.md)
- [3.8 Шаблони](./functional/3.8-templates.md)
- [3.9 Подання (Views)](./functional/3.9-views.md)
- [3.10 Пошук](./functional/3.10-search.md)
- [3.11 Імпорт та Експорт](./functional/3.11-import-export.md)
- [3.12 Інтеграція із зовнішніми сервісами](./functional/3.12-integrations.md)
- [3.13 Формули](./functional/3.13-formulas.md)
- [3.14 Автоматизації](./functional/3.14-automations.md)
- [3.15 Кнопка](./functional/3.15-button.md)
- [3.16 Статистика](./functional/3.16-statistics.md)
- [3.17 Налаштування](./functional/3.17-settings.md)
- [3.18 Онбординг](./functional/3.18-onboarding.md)
- [3.19 Сповіщення](./functional/3.19-notifications.md)

### ⚙️ Типи властивостей

| Тип      | Опис                                                                             | Специфікація                                         |
| -------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| TEXT     | Текстове значення: простий рядок або форматований текст (rich text)              | [3.20](./functional/property-types/3.20-text.md)     |
| NUMBER   | Числове значення з гнучким форматуванням (integer, float, currency, percentage)  | [3.21](./functional/property-types/3.21-number.md)   |
| DATE     | Дата або дата з часом у форматі ISO 8601                                         | [3.22](./functional/property-types/3.22-date.md)     |
| CHECKBOX | Булеве значення: відмічено / не відмічено                                        | [3.23](./functional/property-types/3.23-checkbox.md) |
| DURATION | Тривалість як ціле число секунд                                                  | [3.24](./functional/property-types/3.24-duration.md) |
| SELECT   | Один або кілька варіантів зі згрупованого списку                                 | [3.25](./functional/property-types/3.25-select.md)   |
| STATUS   | Статус виконання з трьома семантичними категоріями (todo, in_progress, complete) | [3.26](./functional/property-types/3.26-status.md)   |
| RELATION | Посилання на записи іншої бази даних                                             | [3.27](./functional/property-types/3.27-relation.md) |
| RATING   | Числова оцінка у форматі зірок                                                   | [3.28](./functional/property-types/3.28-rating.md)   |
| PROGRESS | Числовий прогрес у діапазоні, відображається як бар                              | [3.29](./functional/property-types/3.29-progress.md) |
| FORMULA  | Автоматично обчислюване поле лише для читання                                    | [3.13](./functional/3.13-formulas.md)                |
| BUTTON   | Тип дії без збереження значення; запускає операції над записом                   | [3.15](./functional/3.15-button.md)                  |
