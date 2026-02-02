import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: dance 1

export const NAV_ITEMS: NavItem[] = [
  { label: 'Направления', href: '#directions' },
  { label: 'О студии', href: '#director' },
  { label: 'Результаты', href: '#progress-timeline' },
  { label: 'Цены', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#footer' },
];

export const HERO_ADVANTAGES = [
  'Первое занятие бесплатно',
  'Опытные сертифицированные тренеры',
  'Результат уже через 8 занятий'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'stretching',
    title: 'Стретчинг',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
    description: 'Комплексная растяжка всего тела. Развитие гибкости, подвижности суставов и улучшение осанки.',
    tags: ['Гибкость', 'Растяжка', 'Осанка'],
    level: 'Любой',
    duration: '55 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'split',
    title: 'Шпагат с нуля',
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800',
    description: 'Специальная программа для освоения продольного и поперечного шпагата. Безопасные техники растяжки.',
    tags: ['Шпагат', 'Гибкость', 'Начальный'],
    level: 'Начинающий',
    duration: '60 мин',
    category: 'beginner',
    complexity: 3,
    buttonText: 'Хочу на занятие'
  },
  {
    id: 'yoga',
    title: 'Йога-стретч',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    description: 'Сочетание йоги и стретчинга. Развитие гибкости через осознанную практику и дыхательные техники.',
    tags: ['Йога', 'Растяжка', 'Дыхание'],
    level: 'Любой',
    duration: '75 мин',
    category: 'wellness',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'individual',
    title: 'Персональные занятия',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    description: 'Индивидуальный подход с учетом ваших целей и особенностей тела. Максимально безопасная и эффективная растяжка.',
    tags: ['Индивидуально', 'Результат', 'Безопасность'],
    level: 'Любой',
    duration: '60 мин',
    category: 'body',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'back',
    title: 'Здоровая спина',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    description: 'Программа для улучшения осанки и избавления от болей в спине. Сочетание растяжки и укрепляющих упражнений.',
    tags: ['Осанка', 'Спина', 'Здоровье'],
    level: 'Любой',
    duration: '55 мин',
    category: 'special',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'online',
    title: 'Онлайн-стретчинг',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    description: 'Занятия растяжкой в удобное время из любой точки мира. Живые тренировки с обратной связью от тренера.',
    tags: ['Онлайн', 'Гибкость', 'Дома'],
    level: 'Любой',
    duration: '45 мин',
    category: 'online',
    complexity: 2,
    buttonText: 'Начать заниматься'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Анна Светлова',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
    specialties: ['Стретчинг', 'Йога'],
    experience: '7 лет',
    style: 'Мягкий подход с глубокой проработкой'
  },
  {
    id: 2,
    name: 'Мария Волкова',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400',
    specialties: ['Шпагат с нуля', 'Здоровая спина'],
    experience: '5 лет',
    style: 'Техничный подход с вниманием к деталям'
  },
  {
    id: 3,
    name: 'Елена Соколова',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    specialties: ['Стретчинг', 'Реабилитация'],
    experience: '8 лет',
    style: 'Индивидуальный подход к каждому'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    afterImg: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400',
    title: 'История успеха: Ирина, 35 лет',
    description: 'За 3 месяца села на шпагат и избавилась от болей в спине'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начинать заниматься?',
    answer: 'Заниматься можно в любом возрасте. Наши программы адаптируются под возраст и уровень подготовки.'
  },
  {
    question: 'Как часто нужно заниматься для достижения результата?',
    answer: 'Оптимально заниматься 2-3 раза в неделю. При регулярных занятиях первые результаты видны уже через 8-10 тренировок.'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Специальная подготовка не требуется. Мы работаем с людьми любого уровня подготовки.'
  },
  {
    question: 'Какая одежда нужна для занятий?',
    answer: 'Удобная облегающая одежда, не стесняющая движений. Заниматься лучше в носках или специальных чешках.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Сесть на шпагат' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100', text: 'Улучшить осанку' },
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Избавиться от болей в спине' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100', text: 'Стать гибче' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Восстановиться после травмы' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100', text: 'Подготовиться к соревнованиям' },
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Увеличить подвижность' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100', text: 'Снять мышечное напряжение' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Улучшить координацию' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100', text: 'Повысить выносливость' },
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Укрепить мышцы' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100', text: 'Похудеть' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "Я слишком взрослый для растяжки",
    answer: "Возраст – не помеха. Наши программы адаптированы под разный возраст и уровень подготовки. Многие клиенты старше 50 лет достигают отличных результатов."
  },
  {
    myth: "Растяжка – это больно",
    answer: "При правильном подходе растяжка не должна причинять боль. Мы используем безопасные техники и внимательно следим за ощущениями каждого ученика."
  },
  {
    myth: "У меня нет природной гибкости",
    answer: "Гибкость – это навык, который можно развить. При регулярных занятиях каждый может значительно улучшить свою подвижность."
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Безопасность",
    text: "Сертифицированные тренеры и проверенные методики растяжки",
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600'
  },
  {
    title: "Индивидуальный подход",
    text: "Программы тренировок с учетом ваших целей и особенностей",
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'
  },
  {
    title: "Комфортная атмосфера",
    text: "Уютная студия и дружелюбный коллектив",
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600'
  },
  {
    title: "Гарантия результата",
    text: "Видимый прогресс уже после 8 занятий",
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'
  }
];
