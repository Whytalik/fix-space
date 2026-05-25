# FIX Space

[![CI](https://github.com/Whytalik/fix-space/actions/workflows/ci.yml/badge.svg)](https://github.com/Whytalik/fix-space/actions/workflows/ci.yml)

> Персоналізована веб-платформа для професійної організації діяльності CFD-трейдера.

Приватний трейдер розподіляє інформацію між 4–7 незалежними сервісами — Excel, Notion, TradingView, брокерські виписки, паперові нотатки. Це призводить до інформаційної фрагментації: втрата до 40% продуктивності через переключення контексту, неможливість ретроспективного аналізу, приховані поведінкові патерни.

FIX Space вирішує це — єдине централізоване середовище, де кожен аспект діяльності трейдера пов'язаний в єдину модель даних.

---

## Можливості

- **Журнал угод** — повна фіксація параметрів (PnL, RR, MAE/MFE, комісії) з автоматичним розрахунком Net PnL та відхилення від плану
- **Аналіз рутин** — бази `Daily Routine` та `Routine Library` для передсесійної підготовки та пост-сесійного огляду
- **Трекер помилок** — база `Mistakes` з алгоритмом автоматичного визначення Severity на основі частоти та фінансового впливу
- **Динамічна структура** — власні типи властивостей, формули та автоматизації без написання коду
- **Контентна область** — редактор для розборів угод з вбудованими графіками, скріншотами та калькуляторами ризику

---

## Стек

| Шар        | Технологія                                                                                  |
| :--------- | :------------------------------------------------------------------------------------------ |
| Frontend   | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) · App Router · Turbopack |
| Backend    | [NestJS 11](https://nestjs.com/) · Modular Monolith                                         |
| Database   | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma 7](https://www.prisma.io/)           |
| Auth       | JWT Access/Refresh rotation + bcryptjs                                                      |
| UI         | Tailwind CSS 4 + Lucide Icons · Aesthetic: _Void Terminal_                                  |
| Monorepo   | [Turborepo 2.8](https://turbo.build/) + [pnpm 9.15](https://pnpm.io/)                       |
| Deployment | [Vercel](https://vercel.com/) (Web) · [Railway](https://railway.app/) (API · Docker)        |

---

## Структура

```
.
├── apps/
│   ├── api/          NestJS REST API (port 3000, OpenAPI/Swagger)
│   └── web/          Next.js Frontend (port 3001)
├── packages/
│   ├── domain/       @nucleus/domain — shared DTOs & entities
│   ├── database/     @nucleus/database — Prisma schema & migrations
│   ├── eslint-config/
│   ├── jest-config/
│   └── typescript-config/
└── docs/             архітектура, тестування, розгортання
```

---

## Швидкий старт

> [!WARNING]
> Для локального запуску потрібен Docker Desktop — він використовується для PostgreSQL контейнера.

```bash
# 1. Встановлення
git clone <repository-url>
pnpm install

# 2. Середовище
cp .env.example .env.development
# заповніть змінні у .env.development

# 3. База даних
docker-compose up -d
turbo db:generate
turbo db:migrate:dev

# 4. Розробка
turbo dev
```

---

## CI/CD Pipeline

Запускається автоматично при кожному PR та push до `develop`.

| Етап | Джоб       | Що робить                                         |
| :--: | :--------- | :------------------------------------------------ |
|  1   | `lint`     | ESLint по всіх пакетах монорепо                   |
|  2   | `test`     | Юніт-тести · 682 кейси · збереження coverage      |
|  2   | `security` | `pnpm audit` — вразливості залежностей            |
|  3   | `build`    | Збірка API `dist/` та Web `.next/`                |
|  4   | `docker`   | Збірка Docker-образу API                          |
|  5   | `deploy`   | Розгортання на staging (тільки push до `develop`) |

Детальний опис: [`docs/08-deployment/ci-cd.md`](docs/08-deployment/ci-cd.md)

---

## Документація

| Документ                                                         | Опис                                 |
| :--------------------------------------------------------------- | :----------------------------------- |
| [Алгоритми та бізнес-логіка](docs/03-architecture/algorithms.md) | Ключові алгоритми системи            |
| [Проєктування бази даних](docs/03-architecture/database.md)      | Схема та модель даних                |
| [Модель безпеки](docs/03-architecture/security.md)               | Auth, JWT, захист ресурсів           |
| [Архітектура фронтенду](docs/03-architecture/frontend-state.md)  | State management, компоненти         |
| [План тестування](docs/06-testing/strategy.md)                   | Стратегія, типи, coverage            |
| [Посібник користувача](docs/07-user-guide/index.md)              | Інструкція для кінцевого користувача |

---

> [!NOTE]
> Проєкт у активній розробці. Деплой: API → Railway · Web → Vercel.

_Дипломна робота · Спеціальність 121 · Житомирська політехніка · 2026_
