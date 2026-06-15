# csv-select-options.util.ts

```typescript
import { PropertyType } from "@fixspace/domain";

interface SelectCategory {
  options: Array<{ value: string }>;
}

interface StatusCategory {
  options: Array<{ name: string }>;
}

export function extractAllowedValues(
  type: PropertyType,
  config: unknown,
): string[] {
  if (!config || typeof config !== "object") return [];

  if (type === PropertyType.SELECT) {
    const categories =
      (config as { categories?: SelectCategory[] }).categories ?? [];
    return categories.flatMap(
      (cat) => cat.options?.map((option) => option.value) ?? [],
    );
  }

  if (type === PropertyType.STATUS) {
    const categories =
      (config as { categories?: StatusCategory[] }).categories ?? [];
    return categories.flatMap(
      (cat) => cat.options?.map((option) => option.name) ?? [],
    );
  }

  return [];
}
```

## Пояснення

**Рядок 1 — імпорт `PropertyType`**  
Enum з `@fixspace/domain`, що визначає всі можливі типи властивостей (TEXT, NUMBER, SELECT, STATUS тощо).

**Рядки 3–5 — інтерфейс `SelectCategory`**  
Описує категорію для SELECT-типу: масив `options`, де кожен елемент має поле `value` (рядок).

**Рядки 7–9 — інтерфейс `StatusCategory`**  
Описує категорію для STATUS-типу: масив `options`, де кожен елемент має поле `name` (рядок).

**Рядок 11 — `extractAllowedValues`**  
Експортована функція, що приймає тип властивості та її конфігурацію (`unknown`). Повертає масив рядків — список дозволених значень.

**Рядок 12 — перевірка конфігу**  
Якщо `config` null/undefined/не об'єкт — повертаємо порожній масив.

**Рядки 14–16 — обробка SELECT**

- Перевіряємо, чи тип === `PropertyType.SELECT`
- Зчитуємо `categories` з конфігу (з дефолтним порожнім масивом)
- `flatMap` розгортає вкладені масиви `options`, витягуючи `value` з кожного

**Рядки 19–21 — обробка STATUS**  
Аналогічно SELECT, але витягуємо поле `name` замість `value`.

**Рядок 24 — заглушка для інших типів**  
Для TEXT, NUMBER, DATE тощо — повертаємо порожній масив (у них немає фіксованого набору значень).

## Де використовується

- `validate-import.usecase.ts` — визначення невідомих SELECT/STATUS-опцій при валідації CSV
- `execute-import.usecase.ts` — розширення конфігу SELECT/STATUS новими значеннями під час імпорту
