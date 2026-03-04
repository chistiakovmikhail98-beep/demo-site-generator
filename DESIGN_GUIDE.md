# Дизайн-гайд: Лендинги для танцевальных студий

## Исследование основано на:
- 50+ премиальных сайтов танцевальных/фитнес студий (Millennium, 1MILLION, Pineapple, CLI Studios)
- Awwwards-победители 2024-2025 (Fitonist, Fuoripista, Malta Personal Trainers)
- Material Design 2 Dark Theme guidelines
- WCAG 2.1 стандарты контраста
- Color theory для dark UI (60-30-10 rule)
- Conversion rate optimization research (CTA, forms, social proof)

---

## 1. Цветовая система

### Правило: НИКОГДА не использовать чистый чёрный (#000) и чистый белый (#FFF)
- Чёрный вызывает halation (текст "светится" и расплывается)
- Белый на чёрном = контраст 21:1 (слишком резко, глаза устают)
- Тени на чистом чёрном невидимы → нет глубины

### Базовые фоны (60% площади)

| Токен | Hex | Tailwind | Использование |
|-------|-----|----------|---------------|
| `background` | `#09090b` | `zinc-950` | Основной фон страницы |
| `surface` | `#18181b` | `zinc-900` | Карточки, секции |
| `surface-raised` | `#27272a` | `zinc-800` | Поднятые карточки, модалки |
| `border` | `#3f3f46` | `zinc-700` | Тонкие границы |

### Иерархия текста (30% площади)

| Роль | Hex | Tailwind | Контраст vs zinc-950 |
|------|-----|----------|---------------------|
| **Заголовки H1-H2** | `#f4f4f5` | `zinc-100` | 18:1 (AAA) |
| **Основной текст** | `#d4d4d8` | `zinc-300` | 13:1 (AAA) |
| **Подписи, вторичный** | `#a1a1aa` | `zinc-400` | 7.5:1 (AAA) |
| **Мелкий / disabled** | `#71717a` | `zinc-500` | 4.6:1 (AA) |

### Акцент (10% площади)

Один основной акцент + его оттенки для состояний:

| Состояние | Tailwind shade | Использование |
|-----------|---------------|---------------|
| **Muted** | 300 | Тонкие подсветки, бейджи |
| **Hover** | 400 | Состояние наведения |
| **Default** | 500 | Кнопки, ссылки, иконки |
| **Pressed** | 600 | Нажатие, active |

### Glow-эффект (ТОЛЬКО для primary CTA)

```css
box-shadow: 0 0 20px rgba(accent, 0.3), 0 0 60px rgba(accent, 0.1);
```

---

## 2. Пять цветовых пресетов

### Preset 1: "Neon Rose" (танцы, pole dance, растяжка)
- Primary: `#f43f5e` (rose-500)
- Accent: `#fb7185` (rose-400)
- Glow: `rgba(244, 63, 94, 0.3)`
- Ассоциации: энергия, страсть, женственность

### Preset 2: "Electric Violet" (contemporary, хип-хоп, модерн)
- Primary: `#8b5cf6` (violet-500)
- Accent: `#a78bfa` (violet-400)
- Glow: `rgba(139, 92, 246, 0.3)`
- Ассоциации: креативность, артистизм, ночная жизнь

### Preset 3: "Gold Luxe" (бальные танцы, студия-премиум)
- Primary: `#f59e0b` (amber-500)
- Accent: `#fbbf24` (amber-400)
- Glow: `rgba(245, 158, 11, 0.3)`
- Ассоциации: роскошь, элитность, классика

### Preset 4: "Cyber Cyan" (фитнес-танцы, zumba, tech)
- Primary: `#06b6d4` (cyan-500)
- Accent: `#22d3ee` (cyan-400)
- Glow: `rgba(6, 182, 212, 0.3)`
- Ассоциации: современность, технологичность, свежесть

### Preset 5: "Emerald Flow" (йога-танцы, wellness, stretching)
- Primary: `#10b981` (emerald-500)
- Accent: `#34d399` (emerald-400)
- Glow: `rgba(16, 185, 129, 0.3)`
- Ассоциации: здоровье, гармония, баланс

---

## 3. Hero-секция

### Паттерн (60% премиальных dance-сайтов):
- **Fullscreen** (100vh) фото/видео фон
- **Градиентный скрим** поверх (НЕ однотонный overlay):
  ```css
  background: linear-gradient(
    to bottom,
    rgba(9,9,11, 0.85) 0%,
    rgba(9,9,11, 0.5) 40%,
    rgba(9,9,11, 0.7) 70%,
    rgba(9,9,11, 0.95) 100%
  );
  ```
- **Заголовок**: 48-80px (fluid clamp), font-weight 800-900, uppercase или title case
- **Подзаголовок**: zinc-200 (НЕ zinc-400!), 18-20px, max-width 600px
- **CTA кнопки**: primary (glow) + outline (ghost), gap-4
- **Статистика**: 3 блока внизу hero (число + подпись), разделитель "|"
- **Advantage pills**: `bg-primary/15 border border-primary/30 text-white` (НЕ bg-white/5)
- **Scroll indicator**: анимированная стрелка вниз

### Текст над фото — ОБЯЗАТЕЛЬНО:
1. Gradient scrim (минимум 0.7 opacity в зоне текста)
2. Text-shadow: `0 2px 8px rgba(0,0,0,0.5)` на заголовках
3. Backdrop-blur на подложке текста (опционально)

---

## 4. Карточки

### Elevation system (Material Design adapted):
```
zinc-950 → zinc-900 → zinc-800 → zinc-700
  base       cards     raised    borders
```

### Hover-эффекты:
```css
hover:-translate-y-1        /* Подъём */
hover:shadow-xl              /* Тень глубже */
hover:shadow-primary/10      /* Цветная тень */
hover:border-zinc-600        /* Граница ярче */
transition-all duration-300  /* Плавно */
```

### Структура карточки:
- Фон: `bg-zinc-900` (НЕ bg-white/[0.03]!)
- Граница: `border border-zinc-700/50`
- Скругление: `rounded-2xl` (16px)
- Паддинг: `p-6 sm:p-8`
- Тень: `shadow-lg shadow-black/20`

### "Популярный" / Featured вариант:
- Фон: `bg-gradient-to-br from-primary to-accent`
- Текст: `text-white` или `text-zinc-900` (если акцент светлый)
- Бейдж: `bg-white/20 text-white` или `bg-white text-zinc-900`
- Scale: `scale-[1.02]` для выделения
- Glow shadow: `shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.4)]`

---

## 5. Кнопки (CTA)

### Primary (конверсия — main action):
```
bg-primary text-white font-bold
shadow-[0_4px_20px_-4px_rgba(accent,0.5)]
hover:shadow-[0_8px_30px_-4px_rgba(accent,0.7)]
hover:scale-[1.03] hover:-translate-y-0.5
active:scale-95
rounded-xl (НЕ rounded-full — 12px, не pill)
min-h-[48px] px-8
uppercase tracking-wide
```

### Secondary:
```
bg-zinc-100 text-zinc-900
hover:bg-white hover:scale-[1.02]
shadow-md
```

### Outline:
```
border border-zinc-600 text-zinc-200
hover:border-primary/60 hover:text-white hover:bg-white/5
```

### Размеры:
- sm: h-10 px-5 text-sm
- md: h-12 px-6 text-base
- lg: h-14 px-8 text-lg

### Текст CTA (конверсия):
- "Записаться на пробное" (best)
- "Забронировать место" (scarcity)
- "Выбрать абонемент" (pricing)
- НЕ "Отправить", "Submit" (generic = низкая конверсия)

---

## 6. Секции и анимации

### Вертикальные отступы:
```
py-16 md:py-24 lg:py-32  (64px → 96px → 128px)
```

### Scroll-reveal (IntersectionObserver):
```css
.section-hidden {
  opacity: 0;
  transform: translateY(24px);
}
.section-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}
```

### Stagger-анимация для grid:
```css
.stagger-1 { transition-delay: 0.1s; }
.stagger-2 { transition-delay: 0.2s; }
.stagger-3 { transition-delay: 0.3s; }
```

### Декоративные элементы:
- **Glow orbs**: `bg-primary/20 blur-[80px]` — 1-2 на секцию max
- **Gradient separators**: `linear-gradient(to right, transparent, primary/20, transparent)`
- **НЕ параллакс** (JS overhead, плохо на мобиле)

---

## 7. Типографика

### Рекомендуемые пары:
1. **Oswald 700 (заголовки) + Inter 400 (текст)** — сильный + читаемый
2. **Montserrat 800 (заголовки) + Montserrat 400 (текст)** — единый стиль

### Fluid типографика:
```css
h1: clamp(2rem, 5vw + 1rem, 4.5rem)    /* 32px → 72px */
h2: clamp(1.5rem, 3vw + 0.5rem, 3rem)  /* 24px → 48px */
body: clamp(1rem, 1vw + 0.5rem, 1.125rem) /* 16px → 18px */
```

### Правила:
- letter-spacing: tight (-0.025em) для заголовков
- line-height: 1.1 для H1, 1.2 для H2, 1.6-1.7 для body
- uppercase ТОЛЬКО для мелких лейблов (бейджи, навигация)
- Акцентный цвет в тексте — ТОЛЬКО для коротких фраз, НЕ для абзацев

---

## 8. Конверсия

### Формула страницы (сверху вниз):
1. **Hero** — WOW + CTA "Пробное занятие"
2. **Social proof bar** — "4.9 ★ · 500+ учеников · 10 лет"
3. **Directions** — что преподаём
4. **Advantages** — почему мы
5. **Instructors** — кто преподаёт (доверие)
6. **Pricing** — сколько стоит
7. **Reviews** — что говорят
8. **Gallery/Atmosphere** — как у нас
9. **Quiz** — найди свой стиль (лид-магнит)
10. **FAQ** — снимаем возражения
11. **Footer** — последний CTA + контакты + карта

### Количество CTA: 3-5 на страницу
- Hero, после Advantages, после Reviews, Quiz, Footer

### Quiz-воронка: 5-20x выше конверсия чем статичные формы

---

## 9. Мобильная версия

### Обязательно:
- min-h-[44px] для всех кнопок и ссылок (Apple HIG)
- Hamburger menu (не горизонтальный nav)
- Single column layout до sm: (640px)
- Font-size не менее 14px для body
- Отступы: px-4 (16px) по бокам
- Sticky CTA button внизу экрана (опционально)

---

## 10. Антипаттерны (НЕ ДЕЛАТЬ)

| ❌ Ошибка | ✅ Правильно |
|-----------|-------------|
| text-zinc-500 для body text | text-zinc-300 минимум |
| bg-white/[0.03] для карточек | bg-zinc-900 с border |
| Чистый чёрный фон #000 | zinc-950 (#09090b) |
| Чистый белый текст #fff | zinc-100 (#f4f4f5) |
| Плоские кнопки без shadow | Glow shadow на primary CTA |
| Текст на фото без overlay | Gradient scrim 70%+ |
| Одинаковые карточки без featured | Gradient bg + scale для popular |
| Слишком много accent цвета | 10% max (60-30-10 rule) |
| border-zinc-800 (невидимо) | border-zinc-700/50 |
| Pill кнопки (rounded-full) | rounded-xl (12px) — профессиональнее |
