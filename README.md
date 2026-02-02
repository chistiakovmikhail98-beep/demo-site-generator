# Demo Site Generator

Автоматический генератор демо-сайтов для фитнес-студий, танцевальных студий и студий растяжки.

## Как это работает

1. Загружаешь скриншоты сайта/группы ВК студии + описание
2. AI (OpenRouter) анализирует данные и генерирует контент
3. Собирается статический сайт на базе шаблона
4. Автоматически публикуется на Vercel

## Быстрый старт

### 1. Установи зависимости

```bash
cd demo-site-generator

# Установка зависимостей сервера
cd server && npm install && cd ..

# Установка зависимостей веб-интерфейса
cd web && npm install && cd ..
```

### 2. Настрой переменные окружения

Создай файл `server/.env`:

```bash
# OpenRouter API Key (обязательно)
# Получить: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-...

# Vercel API Token (для автодеплоя)
# Получить: https://vercel.com/account/tokens
VERCEL_TOKEN=...

# Порт сервера
PORT=3001
```

### 3. Запусти сервер

```bash
# В одном терминале - сервер
cd server && npm run dev

# В другом терминале - веб-интерфейс
cd web && npm run dev
```

### 4. Открой в браузере

```
http://localhost:3000
```

## Использование

1. Введи название студии
2. Выбери нишу (растяжка, танцы, фитнес, йога)
3. Загрузи скриншоты (PNG/JPG):
   - Главная страница сайта студии
   - Посты из ВКонтакте/Instagram
   - Прайс-листы
4. Добавь описание (услуги, цены, контакты)
5. Нажми "Создать демо-сайт"
6. Дождись генерации и получи ссылку!

## Структура проекта

```
demo-site-generator/
├── server/              # Backend API
│   ├── index.ts         # Fastify сервер
│   ├── types.ts         # TypeScript типы
│   └── services/
│       ├── ai.ts        # OpenRouter интеграция
│       ├── builder.ts   # Сборка сайта
│       └── deployer.ts  # Vercel деплой
│
├── web/                 # React Frontend
│   └── src/
│       └── pages/
│           ├── Home.tsx   # Форма загрузки
│           └── Status.tsx # Статус генерации
│
└── template/            # Базовый шаблон (../основной сайт)
```

## API

### POST /api/generate

Создать и запустить генерацию сайта.

**Body (multipart/form-data):**
- `name` - Название студии (обязательно)
- `niche` - Ниша: `fitness`, `dance`, `stretching`, `yoga`, `wellness`
- `description` - Описание (опционально)
- `files` - Изображения PNG/JPG

**Response:**
```json
{ "id": "abc123xyz", "status": "pending" }
```

### GET /api/status/:id

Получить статус генерации.

**Response:**
```json
{
  "id": "abc123xyz",
  "status": "completed",
  "deployedUrl": "https://demo-studio.vercel.app"
}
```

### GET /api/projects

Список всех проектов.

## Настройка OpenRouter

1. Зарегистрируйся на [openrouter.ai](https://openrouter.ai)
2. Создай API ключ в разделе [Keys](https://openrouter.ai/keys)
3. Добавь ключ в `.env`

По умолчанию используется модель `anthropic/claude-3.5-sonnet`.
Можно изменить в `server/services/ai.ts`.

## Настройка Vercel

1. Создай аккаунт на [vercel.com](https://vercel.com)
2. Создай токен в [Account Settings → Tokens](https://vercel.com/account/tokens)
3. Добавь токен в `.env`

Сайты будут публиковаться на субдоменах вида `demo-{slug}.vercel.app`.

## Разработка

### Добавить новую нишу

1. Добавь тип в `server/types.ts`:
```typescript
export type Niche = 'fitness' | 'dance' | 'stretching' | 'yoga' | 'wellness' | 'новая_ниша';
```

2. Обнови промпт в `server/services/ai.ts`:
```typescript
function getNicheDescription(niche: Niche): string {
  const descriptions: Record<Niche, string> = {
    // ...
    'новая_ниша': 'Описание для AI',
  };
}
```

3. Добавь в UI `web/src/pages/Home.tsx`:
```typescript
const NICHE_OPTIONS = [
  // ...
  { value: 'новая_ниша', label: 'Новая ниша', emoji: '🆕' },
];
```

## Troubleshooting

### Ошибка "OPENROUTER_API_KEY не установлен"
Проверь что файл `.env` создан в папке `server/` и содержит ключ.

### Сборка падает на npm install
Убедись что Node.js версии 18+ установлен.

### Vercel деплой не работает
Без `VERCEL_TOKEN` сайт сохраняется локально в `server/builds/{id}/dist/`.
