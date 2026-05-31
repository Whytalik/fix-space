# SEO-інфраструктура FIX Space

## Для чого це потрібно

FIX Space — SaaS-платформа з публічним лендінгом і закритим дашбордом. Пошуковий трафік потрібний тільки на лендінгу: трейдер шукає «trading journal» або «торговий журнал» → потрапляє на лендінг → реєструється. Після входу в систему він вже всередині застосунку — там пошукова індексація не потрібна і навіть шкідлива (сторінки вимагають авторизації, пошуковик не зможе їх обійти).

Ключова вимога: **індексувати тільки лендінг, закривати від індексації весь дашборд.**

Додатковий фактор — два мовні варіанти (`en`, `uk`). Без явних `hreflang`-тегів Google може показувати неправильну мову в результатах пошуку або дублювати сторінки.

---

## Межа між публічним і закритим

```
/                      → лендінг (публічно, індексується)
/en                    → англійська версія лендінгу
/uk                    → українська версія лендінгу

/en/dashboard/...      → дашборд (закритий, noindex)
/uk/dashboard/...      → дашборд (закритий, noindex)
```

---

## Що реалізовано і навіщо

### 1. Локалізовані метадані — `generateMetadata()`

**Файл:** `apps/web/src/app/[locale]/layout.tsx`

Кореневий layout експортує `generateMetadata()` замість статичного `metadata`. Функція зчитує параметр `locale` та повертає:

- `title` і `description` відповідною мовою
- Open Graph теги (заголовок, опис, зображення) — для коректного відображення при шеренні посилання у Telegram, Twitter, LinkedIn
- `hreflang` (`en` / `uk`) — щоб Google знав, яку мову показати конкретному користувачу і не вважав сторінки дублікатами

```
/en → title: "FIX Space — CFD Trader's Workspace"
/uk → title: "FIX Space — Простір CFD трейдера"
```

### 2. robots.txt

**Файл:** `apps/web/src/app/robots.ts`

Генерується автоматично за `/robots.txt`. Дозволяє індексацію `/` (лендінг) і явно забороняє `/*/dashboard/`, `/*/profile/`, `/*/statistics/`. Без цього файлу Google намагатиметься обійти захищені сторінки, отримуватиме 401 і знижуватиме рейтинг сайту.

### 3. sitemap.xml

**Файл:** `apps/web/src/app/sitemap.ts`

Генерується автоматично за `/sitemap.xml`. Містить URL для кожної локалі з `hreflang`-альтернативами — це пряма підказка Google, які сторінки існують і як вони пов'язані між собою. Без sitemap пошуковик знаходить сторінки повільніше і може проігнорувати мовні варіанти.

### 4. Open Graph зображення

**Файл:** `apps/web/src/app/opengraph-image.tsx`

Генерується під час збірки через `ImageResponse` (Edge runtime, `next/og`). Розмір 1200×630 px — стандарт для превʼю у соцмережах. Без власного OG-зображення соцмережі генерують порожній або випадковий превʼю, що значно знижує клікабельність посилання.

### 5. JSON-LD структуровані дані

**Файл:** `apps/web/src/app/[locale]/_components/landing/landing-json-ld.tsx`

Вставляє `<script type="application/ld+json">` зі схемою `SoftwareApplication` (стандарт schema.org). Це машиночитабельний опис продукту: назва, категорія, ОС, ціна. Google може використовувати ці дані для розширених результатів пошуку (rich results). Компонент рендериться тільки для неавторизованих відвідувачів — у дашборді його немає.

### 6. Dashboard noindex

**Файл:** `apps/web/src/app/[locale]/(dashboard)/layout.tsx`

```ts
export const metadata = { robots: { index: false, follow: false } };
```

Один рядок у layout групи маршрутів `(dashboard)` — і всі вкладені сторінки автоматично отримують `<meta name="robots" content="noindex,nofollow">`. Без цього Google намагатиметься індексувати сторінки дашборду, натикатиметься на редирект на `/login` і псуватиме репутацію домену.

---

## Змінна оточення

`NEXT_PUBLIC_APP_URL` — базовий URL сайту. Використовується в `robots.ts`, `sitemap.ts`, `opengraph-image.tsx` та `generateMetadata()`.

| Середовище  | Значення                |
| ----------- | ----------------------- |
| Development | `http://localhost:3001` |
| Production  | `https://fixspace.app`  |

---

## Перевірка

```bash
turbo dev --filter=@fixspace/web

curl http://localhost:3001/robots.txt
curl http://localhost:3001/sitemap.xml
```

У браузері — переглянути `view-source:http://localhost:3001/en` та перевірити:

- `<title>` відповідає локалі
- `<meta name="description">` локалізовано
- `<link rel="canonical">` присутній
- `<link rel="alternate" hreflang="en">` і `hreflang="uk"` є
- `<script type="application/ld+json">` присутній

На `/en/dashboard` має бути `<meta name="robots" content="noindex,nofollow">`.
