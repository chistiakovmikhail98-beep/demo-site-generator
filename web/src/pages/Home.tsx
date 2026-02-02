import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Sparkles, Plus, ExternalLink, CheckCircle, DollarSign, Layers, Loader2, Clock, AlertCircle, Trash2, Clipboard, FileUp, Link2, Eye, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface QueuedSite {
  id: string;
  name: string;
  niche: string;
  status: 'pending' | 'processing' | 'building' | 'deploying' | 'completed' | 'failed';
  deployedUrl?: string;
  error?: string;
  createdAt: number;
}

// Типы фото для AI (должны совпадать с PhotoBlockType на бэкенде)
type PhotoType = 'hero' | 'instructors' | 'atmosphere' | 'gallery' | 'stories' | 'director' | 'directions' | 'advantages';

const PHOTO_TYPES: Array<{ value: PhotoType; label: string; description: string }> = [
  { value: 'hero', label: 'Главная', description: 'Для шапки сайта' },
  { value: 'instructors', label: 'Тренер', description: 'Фото тренера/инструктора' },
  { value: 'atmosphere', label: 'Атмосфера', description: 'Интерьер, зал' },
  { value: 'gallery', label: 'Галерея', description: 'Общие фото' },
  { value: 'stories', label: 'До/После', description: 'Результаты, трансформация' },
  { value: 'director', label: 'Директор', description: 'Основатель/руководитель' },
  { value: 'directions', label: 'Направления', description: 'Фото занятий' },
  { value: 'advantages', label: 'Преимущества', description: 'Особенности студии' },
];

// Фото с подписью
interface LabeledPhoto {
  file?: File; // Для загруженных файлов
  url?: string; // Для VK фото (URL напрямую)
  type: PhotoType;
  label: string;
  preview: string;
}

// Фото из VK
interface VKPhoto {
  id: number;
  url: string;
  width: number;
  height: number;
  text?: string;
}

// Типы ниш
type Niche = 'auto' | 'dance' | 'fitness' | 'stretching' | 'yoga' | 'wellness';

const NICHE_OPTIONS: Array<{ value: Niche; label: string }> = [
  { value: 'auto', label: 'Авто-определение' },
  { value: 'dance', label: 'Танцы' },
  { value: 'fitness', label: 'Фитнес' },
  { value: 'stretching', label: 'Растяжка' },
  { value: 'yoga', label: 'Йога' },
  { value: 'wellness', label: 'Wellness/SPA' },
];

// Контакт администратора (из ВК)
interface AdminContact {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  vkUrl?: string;
}

// Направление (для превью)
interface DirectionPreview {
  title: string;
  description?: string;
  tags?: string[];
}

// Тариф (для превью)
interface PricingPreview {
  name: string;
  price: string;
  period?: string;
}

// FAQ (для превью)
interface FaqPreview {
  question: string;
  answer: string;
}

// Этап калькулятора (для превью)
interface CalculatorStagePreview {
  status: string;
  description: string;
  tags: string[];
}

// Отзыв (для превью)
interface ReviewPreview {
  name: string;
  text: string;
  source?: string;
}

// Инструктор (для превью)
interface InstructorPreview {
  name: string;
  specialties?: string[];
  experience?: string;
}

// Контакты (для превью)
interface ContactsPreview {
  phone?: string;
  email?: string;
  address?: string;
  vk?: string;
  telegram?: string;
}

// Превью от AI (полная структура)
interface PreviewData {
  name: string;
  niche: string;
  nicheLabel: string;
  city?: string;
  tagline?: string;
  description: string;
  // Детали для просмотра
  directions?: DirectionPreview[];
  pricing?: PricingPreview[];
  faq?: FaqPreview[];
  calculatorStages?: CalculatorStagePreview[];
  reviews?: ReviewPreview[];
  instructors?: InstructorPreview[];
  contacts?: ContactsPreview;
  heroTitle?: string;
  heroDescription?: string;
}

// Запись для батч-режима с индивидуальными настройками
interface BatchEntry {
  id: string;
  text: string;
  niche: Niche;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: FontFamily;
  aiModel: AIModel;
  photos: LabeledPhoto[];
  expanded: boolean;
  submitted: boolean;
  projectId?: string;
  // Превью
  preview?: PreviewData;
  previewLoading?: boolean;
  previewConfirmed?: boolean;
  previewCollapsed?: boolean;
  // Полный конфиг от AI (для создания без повторного вызова)
  fullConfig?: unknown;
  // Контакты админов (из ВК)
  admins?: AdminContact[];
  // Ссылка на сообщество ВК (для CRM)
  vkGroupUrl?: string;
  // URL аватарки группы (для логотипа)
  avatarUrl?: string;
}

type ColorSchemeKey = 'red' | 'purple' | 'blue' | 'green' | 'orange' | 'pink';

const COLOR_SCHEMES: Array<{ value: ColorSchemeKey; label: string; primary: string; accent: string }> = [
  { value: 'red', label: 'Красный', primary: '#ba000f', accent: '#ff4444' },
  { value: 'purple', label: 'Фиолетовый', primary: '#7c3aed', accent: '#a78bfa' },
  { value: 'blue', label: 'Синий', primary: '#2563eb', accent: '#60a5fa' },
  { value: 'green', label: 'Зелёный', primary: '#059669', accent: '#34d399' },
  { value: 'orange', label: 'Оранжевый', primary: '#ea580c', accent: '#fb923c' },
  { value: 'pink', label: 'Розовый', primary: '#db2777', accent: '#f472b6' },
];

type AIModel = 'deepseek' | 'gpt4o-mini' | 'sonnet';

const AI_MODELS: Array<{ value: AIModel; label: string; price: string; description: string }> = [
  { value: 'gpt4o-mini', label: 'GPT-4o Mini', price: '~$0.01', description: 'Быстро и дёшево' },
  { value: 'deepseek', label: 'DeepSeek V3', price: '~$0.005', description: 'Самый дешёвый' },
  { value: 'sonnet', label: 'Claude 3.5 Sonnet', price: '~$0.05', description: 'Макс. качество' },
];

type FontFamily = 'manrope' | 'inter' | 'montserrat' | 'roboto' | 'playfair';

const FONT_OPTIONS: Array<{ value: FontFamily; label: string; style: string }> = [
  { value: 'manrope', label: 'Manrope', style: 'Современный' },
  { value: 'inter', label: 'Inter', style: 'Минималистичный' },
  { value: 'montserrat', label: 'Montserrat', style: 'Элегантный' },
  { value: 'roboto', label: 'Roboto', style: 'Классический' },
  { value: 'playfair', label: 'Playfair Display', style: 'Премиальный' },
];

const STORAGE_KEY = 'demo-generator-sites';
const BATCH_STORAGE_KEY = 'demo-generator-batch';

// API URL - Railway в продакшене, локальный для разработки
const API_URL = import.meta.env.VITE_API_URL || '';

// Простой генератор ID
const generateId = () => Math.random().toString(36).substring(2, 10);

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Batch mode — отдельные карточки для каждой студии с индивидуальными настройками
  const [batchEntries, setBatchEntries] = useState<BatchEntry[]>(() => {
    try {
      const saved = localStorage.getItem(BATCH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((e: BatchEntry) => ({ ...e, photos: [] }));
      }
    } catch { /* ignore */ }
    return [{
      id: generateId(),
      text: '',
      niche: 'auto' as Niche,
      primaryColor: '#7c3aed',
      accentColor: '#a78bfa',
      backgroundColor: '#0c0c0f',
      fontFamily: 'manrope',
      aiModel: 'gpt4o-mini',
      photos: [],
      expanded: true,
      submitted: false,
    }];
  });
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Сохранение batch entries в localStorage (без photos)
  useEffect(() => {
    const toSave = batchEntries.map(e => ({ ...e, photos: [] }));
    localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(toSave));
  }, [batchEntries]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Массовый импорт ВК ссылок
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [bulkImportProgress, setBulkImportProgress] = useState({ current: 0, total: 0 });

  // Очередь добавленных сайтов (с localStorage)
  const [queuedSites, setQueuedSites] = useState<QueuedSite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queuedSites));
  }, [queuedSites]);

  // Polling статусов для всех сайтов (кроме completed)
  useEffect(() => {
    const sitesToPoll = queuedSites.filter(s => s.status !== 'completed');
    if (sitesToPoll.length === 0) return;

    const pollStatuses = async () => {
      for (const site of sitesToPoll) {
        try {
          const response = await fetch(`${API_URL}/api/status/${site.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status !== site.status || data.deployedUrl !== site.deployedUrl) {
              setQueuedSites(prev => prev.map(s =>
                s.id === site.id
                  ? { ...s, status: data.status, deployedUrl: data.deployedUrl, error: data.error }
                  : s
              ));
            }
          } else if (response.status === 404) {
            setQueuedSites(prev => prev.filter(s => s.id !== site.id));
            setBatchEntries(prev => prev.map(e =>
              e.projectId === site.id ? { ...e, submitted: false, projectId: undefined } : e
            ));
          }
        } catch {
          // Ignore polling errors
        }
      }
    };

    pollStatuses();
    const interval = setInterval(pollStatuses, 3000);
    return () => clearInterval(interval);
  }, [queuedSites.filter(s => s.status !== 'completed').length]);

  // Статистика токенов
  const [tokenStats, setTokenStats] = useState<{
    total: { estimatedCost: number; totalTokens: number };
    requests: number;
  } | null>(null);

  // Загрузка статистики токенов
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tokens`);
        const data = await response.json();
        setTokenStats(data);
      } catch (error) {
        console.error('Ошибка загрузки токенов:', error);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 10000);
    return () => clearInterval(interval);
  }, []);

  // Добавить новую карточку студии
  const addBatchEntry = () => {
    setBatchEntries(prev => [...prev, {
      id: generateId(),
      text: '',
      niche: 'auto' as Niche,
      primaryColor: '#7c3aed',
      accentColor: '#a78bfa',
      backgroundColor: '#0c0c0f',
      fontFamily: 'manrope',
      aiModel: 'gpt4o-mini',
      photos: [],
      expanded: true,
      submitted: false,
    }]);
  };

  // Удалить карточку студии
  const removeBatchEntry = (index: number) => {
    batchEntries[index].photos.forEach(p => URL.revokeObjectURL(p.preview));
    setBatchEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Массовый импорт ВК ссылок
  const handleBulkImport = async () => {
    const lines = bulkImportText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.includes('vk.com') || line.includes('vk.ru')));

    if (lines.length === 0) {
      alert('Не найдено ссылок на ВК. Вставьте ссылки, каждую на новой строке.');
      return;
    }

    setBulkImportLoading(true);
    setBulkImportProgress({ current: 0, total: lines.length });

    const newEntries: BatchEntry[] = [];
    const colors = ['#7c3aed', '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#db2777'];

    for (let i = 0; i < lines.length; i++) {
      const vkUrl = lines[i];
      setBulkImportProgress({ current: i + 1, total: lines.length });

      try {
        const response = await fetch(`${API_URL}/api/parse-vk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: vkUrl }),
        });

        const data = await response.json();

        if (data.error) {
          console.error(`Ошибка парсинга ${vkUrl}:`, data.error);
          // Добавляем пустую карточку с ссылкой
          newEntries.push({
            id: generateId(),
            text: `Ошибка: ${vkUrl}\n${data.error}`,
            niche: 'auto' as Niche,
            primaryColor: colors[i % colors.length],
            accentColor: '#a78bfa',
            backgroundColor: '#0c0c0f',
            fontFamily: 'manrope',
            aiModel: 'gpt4o-mini',
            photos: [],
            expanded: false,
            submitted: false,
            vkGroupUrl: vkUrl,
          });
          continue;
        }

        // Извлекаем цвета из аватарки
        let extractedColors: { primary: string; accent: string } | null = null;
        if (data.avatarUrl) {
          extractedColors = await extractColorsFromImage(data.avatarUrl);
        }

        newEntries.push({
          id: generateId(),
          text: data.rawText,
          niche: 'auto' as Niche,
          primaryColor: extractedColors?.primary || colors[i % colors.length],
          accentColor: extractedColors?.accent || '#a78bfa',
          backgroundColor: '#0c0c0f',
          fontFamily: 'manrope',
          aiModel: 'gpt4o-mini',
          photos: [],
          expanded: false,
          submitted: false,
          admins: data.admins || [],
          vkGroupUrl: vkUrl,
          avatarUrl: data.avatarUrl,
        });
      } catch (error) {
        console.error(`Сетевая ошибка для ${vkUrl}:`, error);
        newEntries.push({
          id: generateId(),
          text: `Сетевая ошибка: ${vkUrl}`,
          niche: 'auto' as Niche,
          primaryColor: colors[i % colors.length],
          accentColor: '#a78bfa',
          backgroundColor: '#0c0c0f',
          fontFamily: 'manrope',
          aiModel: 'gpt4o-mini',
          photos: [],
          expanded: false,
          submitted: false,
          vkGroupUrl: vkUrl,
        });
      }
    }

    // Добавляем все новые карточки (удаляем пустые существующие)
    setBatchEntries(prev => {
      const nonEmpty = prev.filter(e => e.text.trim().length > 0 || e.submitted);
      return [...nonEmpty, ...newEntries];
    });

    setBulkImportLoading(false);
    setShowBulkImport(false);
    setBulkImportText('');
    alert(`Загружено ${newEntries.length} студий из ${lines.length} ссылок!`);
  };

  // Обновить поле карточки
  const updateBatchEntry = (index: number, field: keyof BatchEntry, value: unknown) => {
    setBatchEntries(prev => prev.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  // Переключить развёрнутость настроек
  const toggleBatchExpanded = (index: number) => {
    setBatchEntries(prev => prev.map((entry, i) =>
      i === index ? { ...entry, expanded: !entry.expanded } : entry
    ));
  };

  // Добавить фото к карточке
  const addPhotoToBatch = (index: number, files: FileList) => {
    const newPhotos: LabeledPhoto[] = Array.from(files).map(file => ({
      file,
      type: 'gallery' as PhotoType,
      label: '',
      preview: URL.createObjectURL(file),
    }));

    setBatchEntries(prev => prev.map((entry, i) =>
      i === index ? { ...entry, photos: [...entry.photos, ...newPhotos] } : entry
    ));
  };

  // Обновить фото в карточке
  const updateBatchPhoto = (entryIndex: number, photoIndex: number, field: keyof LabeledPhoto, value: string) => {
    setBatchEntries(prev => prev.map((entry, i) => {
      if (i !== entryIndex) return entry;
      const newPhotos = [...entry.photos];
      newPhotos[photoIndex] = { ...newPhotos[photoIndex], [field]: value };
      return { ...entry, photos: newPhotos };
    }));
  };

  // Удалить фото из карточки
  const removeBatchPhoto = (entryIndex: number, photoIndex: number) => {
    setBatchEntries(prev => prev.map((entry, i) => {
      if (i !== entryIndex) return entry;
      URL.revokeObjectURL(entry.photos[photoIndex].preview);
      return { ...entry, photos: entry.photos.filter((_, pi) => pi !== photoIndex) };
    }));
  };

  // Извлечение цветов из изображения через backend API (избегает CORS)
  const extractColorsFromImage = async (imageUrl: string): Promise<{ primary: string; accent: string } | null> => {
    try {
      console.log(`🎨 Извлечение цветов через API: ${imageUrl}`);
      const response = await fetch(`${API_URL}/api/extract-colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        console.error('🎨 API ошибка:', response.status);
        return null;
      }

      const data = await response.json();
      if (data.primary && data.accent) {
        console.log(`🎨 ИЗВЛЕЧЕНЫ ЦВЕТА: primary=${data.primary}, accent=${data.accent}`);
        return { primary: data.primary, accent: data.accent };
      }
      return null;
    } catch (error) {
      console.error('🎨 Ошибка извлечения цветов:', error);
      return null;
    }
  };

  const handlePasteForBatch = (entryIndex: number, e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      const newPhotos: LabeledPhoto[] = imageFiles.map(file => ({
        file,
        type: 'gallery' as PhotoType,
        label: '',
        preview: URL.createObjectURL(file),
      }));

      setBatchEntries(prev => prev.map((entry, i) =>
        i === entryIndex ? { ...entry, photos: [...entry.photos, ...newPhotos] } : entry
      ));
    }
  };

  // Быстрая вставка из буфера для конкретной карточки
  const handleQuickPaste = async (entryIndex: number) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        const newPhotos: LabeledPhoto[] = imageFiles.map(file => ({
          file,
          type: 'gallery' as PhotoType,
          label: '',
          preview: URL.createObjectURL(file),
        }));

        setBatchEntries(prev => prev.map((entry, i) =>
          i === entryIndex ? { ...entry, photos: [...entry.photos, ...newPhotos] } : entry
        ));
      } else {
        alert('В буфере нет изображений');
      }
    } catch (error) {
      console.error('Ошибка доступа к буферу:', error);
      alert('Не удалось получить доступ к буферу обмена');
    }
  };

  // Импорт JSON файла с данными студий
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Поддерживаем разные форматы: массив строк, массив объектов, или объект с полем studios
      let studios: Array<{ text: string; primaryColor?: string; accentColor?: string }> = [];

      if (Array.isArray(data)) {
        studios = data.map(item =>
          typeof item === 'string' ? { text: item } : item
        );
      } else if (data.studios && Array.isArray(data.studios)) {
        studios = data.studios;
      }

      if (studios.length === 0) {
        alert('Файл не содержит данных студий');
        return;
      }

      const newEntries: BatchEntry[] = studios.map(studio => ({
        id: generateId(),
        text: studio.text || '',
        niche: 'auto' as Niche,
        primaryColor: studio.primaryColor || '#7c3aed',
        accentColor: studio.accentColor || '#a78bfa',
        backgroundColor: '#0c0c0f',
        fontFamily: 'manrope' as FontFamily,
        aiModel: 'gpt4o-mini' as AIModel,
        photos: [],
        expanded: false,
        submitted: false,
      }));

      setBatchEntries(prev => [...prev, ...newEntries]);
      alert(`Импортировано ${newEntries.length} студий`);
    } catch (error) {
      console.error('Ошибка импорта:', error);
      alert('Ошибка чтения файла. Проверьте формат JSON.');
    }

    // Сбрасываем input
    e.target.value = '';
  };

  // Парсинг группы ВКонтакте
  const [vkLoading, setVkLoading] = useState<number | null>(null); // index карточки
  const [vkUrl, setVkUrl] = useState('');
  const [showVkInput, setShowVkInput] = useState<number | null>(null);

  // VK фото пикер - теперь с сохранением выбора по категориям
  const [vkPhotosModal, setVkPhotosModal] = useState<{ entryIndex: number; photos: VKPhoto[] } | null>(null);
  const [vkPhotosLoading, setVkPhotosLoading] = useState(false);
  // Выбор фото по категориям: { hero: Set([1,2]), gallery: Set([3,4,5]), ... }
  const [vkPhotosByCategory, setVkPhotosByCategory] = useState<Record<PhotoType, Set<number>>>({
    hero: new Set(),
    instructors: new Set(),
    atmosphere: new Set(),
    gallery: new Set(),
    stories: new Set(),
    director: new Set(),
    directions: new Set(),
    advantages: new Set(),
  });
  const [vkPhotoType, setVkPhotoType] = useState<PhotoType>('hero'); // Начинаем с "Главная"

  const handleParseVK = async (entryIndex: number) => {
    if (!vkUrl.trim()) {
      alert('Введите ссылку на группу ВК');
      return;
    }

    setVkLoading(entryIndex);

    try {
      const response = await fetch(`${API_URL}/api/parse-vk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: vkUrl }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Извлекаем цвета из аватарки (асинхронно)
      let extractedColors: { primary: string; accent: string } | null = null;
      if (data.avatarUrl) {
        extractedColors = await extractColorsFromImage(data.avatarUrl);
      }

      // Вставляем полученный текст, админов и ссылку на группу в карточку
      setBatchEntries(prev => prev.map((e, i) =>
        i === entryIndex ? {
          ...e,
          text: data.rawText,
          admins: data.admins || [],
          vkGroupUrl: vkUrl, // Сохраняем ссылку на сообщество для CRM
          avatarUrl: data.avatarUrl, // URL аватарки для логотипа
          // Применяем извлечённые цвета если есть
          ...(extractedColors ? {
            primaryColor: extractedColors.primary,
            accentColor: extractedColors.accent,
          } : {}),
        } : e
      ));
      setShowVkInput(null);
      setVkUrl('');
      // Автоматически запускаем превью
      handleGetPreview(entryIndex, data.rawText);
    } catch (error) {
      console.error('Ошибка парсинга ВК:', error);
      alert('Не удалось получить данные из ВК');
    } finally {
      setVkLoading(null);
    }
  };

  // Загрузить фото из ВК группы
  const handleLoadVkPhotos = async (entryIndex: number) => {
    const entry = batchEntries[entryIndex];
    const vkGroupUrl = entry.vkGroupUrl;

    if (!vkGroupUrl) {
      alert('Сначала загрузите данные из ВК группы');
      return;
    }

    setVkPhotosLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/parse-vk-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: vkGroupUrl, limit: 50 }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.photos.length === 0) {
        alert('Фото не найдены в этой группе');
        return;
      }

      setVkPhotosModal({ entryIndex, photos: data.photos });
      // Сбрасываем выбор по всем категориям
      setVkPhotosByCategory({
        hero: new Set(),
        instructors: new Set(),
        atmosphere: new Set(),
        gallery: new Set(),
        stories: new Set(),
        director: new Set(),
        directions: new Set(),
        advantages: new Set(),
      });
      setVkPhotoType('hero'); // Начинаем с "Главная"
    } catch (error) {
      console.error('Ошибка загрузки фото ВК:', error);
      alert('Не удалось загрузить фото из ВК');
    } finally {
      setVkPhotosLoading(false);
    }
  };

  // Добавить ВСЕ выбранные VK фото (из всех категорий) в карточку
  const handleAddVkPhotos = () => {
    if (!vkPhotosModal) return;

    const { entryIndex, photos } = vkPhotosModal;

    // Собираем фото из всех категорий
    const newPhotos: LabeledPhoto[] = [];
    for (const [category, photoIds] of Object.entries(vkPhotosByCategory)) {
      const categoryPhotos = photos.filter(p => photoIds.has(p.id));
      for (const photo of categoryPhotos) {
        newPhotos.push({
          url: photo.url,
          type: category as PhotoType,
          label: photo.text || '',
          preview: photo.url,
        });
      }
    }

    if (newPhotos.length === 0) {
      alert('Выберите хотя бы одно фото');
      return;
    }

    setBatchEntries(prev => prev.map((entry, i) =>
      i === entryIndex ? { ...entry, photos: [...entry.photos, ...newPhotos] } : entry
    ));

    setVkPhotosModal(null);
  };

  // Переключить выбор VK фото в текущей категории
  const toggleVkPhotoSelection = (photoId: number) => {
    setVkPhotosByCategory(prev => {
      const currentSet = new Set(prev[vkPhotoType]);
      if (currentSet.has(photoId)) {
        currentSet.delete(photoId);
      } else {
        currentSet.add(photoId);
      }
      return { ...prev, [vkPhotoType]: currentSet };
    });
  };

  // Получить общее кол-во выбранных фото по всем категориям
  const getTotalSelectedVkPhotos = () => {
    return Object.values(vkPhotosByCategory).reduce((sum, set) => sum + set.size, 0);
  };

  // Проверить, выбрано ли фото в какой-либо категории
  const getPhotoCategory = (photoId: number): PhotoType | null => {
    for (const [category, photoIds] of Object.entries(vkPhotosByCategory)) {
      if (photoIds.has(photoId)) {
        return category as PhotoType;
      }
    }
    return null;
  };

  // Получить превью от AI (что он понял из текста)
  const handleGetPreview = async (entryIndex: number, text?: string) => {
    const entry = batchEntries[entryIndex];
    const textToAnalyze = text || entry.text;

    if (textToAnalyze.trim().length < 20) {
      alert('Минимум 20 символов для анализа');
      return;
    }

    setBatchEntries(prev => prev.map((e, i) =>
      i === entryIndex ? { ...e, previewLoading: true, preview: undefined } : e
    ));

    try {
      const response = await fetch(`${API_URL}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze, aiModel: entry.aiModel }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setBatchEntries(prev => prev.map((e, i) =>
        i === entryIndex ? {
          ...e,
          preview: data.preview,
          fullConfig: data.fullConfig, // Сохраняем полный конфиг для создания
          previewLoading: false,
          // Автоматически устанавливаем нишу из превью
          niche: data.preview.niche as Niche
        } : e
      ));
    } catch (error) {
      console.error('Ошибка превью:', error);
      alert('Не удалось получить превью');
      setBatchEntries(prev => prev.map((e, i) =>
        i === entryIndex ? { ...e, previewLoading: false } : e
      ));
    }
  };

  // Обновить данные превью (редактирование)
  const updatePreviewData = (entryIndex: number, field: string, value: unknown) => {
    setBatchEntries(prev => prev.map((e, i) => {
      if (i !== entryIndex || !e.preview) return e;

      // Обновляем preview
      const updatedPreview = { ...e.preview, [field]: value };

      // Также обновляем fullConfig если он есть
      let updatedFullConfig = e.fullConfig;
      if (e.fullConfig && typeof e.fullConfig === 'object') {
        const fc = e.fullConfig as Record<string, unknown>;
        // Обновляем соответствующую секцию в fullConfig
        if (field === 'name' || field === 'tagline' || field === 'city') {
          updatedFullConfig = {
            ...fc,
            brand: { ...(fc.brand as Record<string, unknown> || {}), [field]: value }
          };
        } else if (['directions', 'pricing', 'faq', 'calculatorStages', 'reviews', 'instructors', 'contacts'].includes(field)) {
          updatedFullConfig = {
            ...fc,
            sections: { ...(fc.sections as Record<string, unknown> || {}), [field]: value }
          };
        }
      }

      return { ...e, preview: updatedPreview, fullConfig: updatedFullConfig };
    }));
  };

  // Обновить элемент в массиве превью (directions, pricing, etc.)
  const updatePreviewArrayItem = (
    entryIndex: number,
    field: string,
    itemIndex: number,
    itemField: string,
    value: unknown
  ) => {
    setBatchEntries(prev => prev.map((e, i) => {
      if (i !== entryIndex || !e.preview) return e;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preview = e.preview as any;
      const arr = preview[field] as Array<Record<string, unknown>> | undefined;
      if (!arr) return e;
      const newArr = arr.map((item, idx) =>
        idx === itemIndex ? { ...item, [itemField]: value } : item
      );
      const updatedPreview = { ...e.preview, [field]: newArr };
      // Обновляем fullConfig
      let updatedFullConfig = e.fullConfig;
      if (e.fullConfig && typeof e.fullConfig === 'object') {
        const fc = e.fullConfig as Record<string, unknown>;
        updatedFullConfig = {
          ...fc,
          sections: { ...(fc.sections as Record<string, unknown> || {}), [field]: newArr }
        };
      }
      return { ...e, preview: updatedPreview, fullConfig: updatedFullConfig };
    }));
  };

  // Удалить элемент из массива превью
  const removePreviewArrayItem = (entryIndex: number, field: string, itemIndex: number) => {
    setBatchEntries(prev => prev.map((e, i) => {
      if (i !== entryIndex || !e.preview) return e;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preview = e.preview as any;
      const arr = preview[field] as Array<Record<string, unknown>> | undefined;
      if (!arr) return e;
      const newArr = arr.filter((_, idx) => idx !== itemIndex);
      const updatedPreview = { ...e.preview, [field]: newArr };
      // Обновляем fullConfig
      let updatedFullConfig = e.fullConfig;
      if (e.fullConfig && typeof e.fullConfig === 'object') {
        const fc = e.fullConfig as Record<string, unknown>;
        updatedFullConfig = {
          ...fc,
          sections: { ...(fc.sections as Record<string, unknown> || {}), [field]: newArr }
        };
      }
      return { ...e, preview: updatedPreview, fullConfig: updatedFullConfig };
    }));
  };

  // Добавить элемент в массив превью
  const addPreviewArrayItem = (entryIndex: number, field: string, newItem: Record<string, unknown>) => {
    setBatchEntries(prev => prev.map((e, i) => {
      if (i !== entryIndex || !e.preview) return e;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preview = e.preview as any;
      const arr = (preview[field] as Array<Record<string, unknown>>) || [];
      const newArr = [...arr, newItem];
      const updatedPreview = { ...e.preview, [field]: newArr };
      // Обновляем fullConfig
      let updatedFullConfig = e.fullConfig;
      if (e.fullConfig && typeof e.fullConfig === 'object') {
        const fc = e.fullConfig as Record<string, unknown>;
        updatedFullConfig = {
          ...fc,
          sections: { ...(fc.sections as Record<string, unknown> || {}), [field]: newArr }
        };
      }
      return { ...e, preview: updatedPreview, fullConfig: updatedFullConfig };
    }));
  };

  // Подтвердить превью и разрешить генерацию
  const handleConfirmPreview = (entryIndex: number) => {
    setBatchEntries(prev => prev.map((e, i) =>
      i === entryIndex ? { ...e, previewConfirmed: true } : e
    ));
  };

  // Сбросить превью
  const handleResetPreview = (entryIndex: number) => {
    setBatchEntries(prev => prev.map((e, i) =>
      i === entryIndex ? { ...e, preview: undefined, previewConfirmed: false } : e
    ));
  };

  // Массовая генерация
  const handleBatchSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    // Генерируем только подтверждённые записи
    const validEntries = batchEntries.filter(entry =>
      !entry.submitted &&
      entry.text.trim().length > 20 &&
      entry.previewConfirmed // Требуем подтверждение превью!
    );

    if (validEntries.length === 0) {
      // Проверяем, есть ли неподтверждённые
      const unconfirmed = batchEntries.filter(e => !e.submitted && e.text.trim().length > 20 && !e.previewConfirmed);
      if (unconfirmed.length > 0) {
        alert(`Сначала нажмите "Анализировать" и подтвердите ${unconfirmed.length} студий.`);
      } else {
        alert('Нет студий для генерации.');
      }
      return;
    }

    setIsSubmitting(true);
    setBatchProgress({ current: 0, total: validEntries.length });

    for (let i = 0; i < validEntries.length; i++) {
      const entry = validEntries[i];
      setBatchProgress({ current: i + 1, total: validEntries.length });

      try {
        const formData = new FormData();
        formData.append('text', entry.text);
        formData.append('aiModel', entry.aiModel);
        formData.append('fontFamily', entry.fontFamily);
        // Если ниша выбрана вручную — передаём её
        if (entry.niche !== 'auto') {
          formData.append('niche', entry.niche);
        }

        formData.append('colorScheme', JSON.stringify({
          primary: entry.primaryColor,
          accent: entry.accentColor,
          background: entry.backgroundColor,
          surface: '#18181b',
          text: '#ffffff'
        }));

        // Передаём fullConfig из превью чтобы избежать повторного вызова AI
        if (entry.fullConfig) {
          // Если есть аватарка ВК — используем как логотип!
          const configToSend = entry.avatarUrl
            ? {
                ...entry.fullConfig as Record<string, unknown>,
                brand: {
                  ...(entry.fullConfig as Record<string, unknown>).brand as Record<string, unknown>,
                  logo: entry.avatarUrl
                }
              }
            : entry.fullConfig;
          formData.append('fullConfig', JSON.stringify(configToSend));
        }

        if (entry.photos.length > 0) {
          // Разделяем фото на файлы и URL (из ВК)
          const filePhotos = entry.photos.filter(p => p.file);
          const urlPhotos = entry.photos.filter(p => p.url && !p.file);

          const photoMeta = entry.photos.map(p => ({
            type: p.type,
            label: p.label,
            url: p.url, // Для VK фото
          }));
          formData.append('photoMeta', JSON.stringify(photoMeta));

          // Добавляем только файлы
          filePhotos.forEach(photo => {
            if (photo.file) {
              formData.append('files', photo.file);
            }
          });

          // URL фото передаём отдельно
          if (urlPhotos.length > 0) {
            formData.append('photoUrls', JSON.stringify(urlPhotos.map(p => ({
              url: p.url,
              type: p.type,
              label: p.label,
            }))));
          }
        }

        const response = await fetch(`${API_URL}/api/quick`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.id) {
          setQueuedSites(prev => [...prev, {
            id: data.id,
            name: data.name,
            niche: data.niche,
            status: 'pending',
            createdAt: Date.now(),
          }]);

          // Сохраняем данные в CRM localStorage (админы + ссылка на сообщество)
          if (entry.admins?.length || entry.vkGroupUrl) {
            try {
              const crmKey = 'demo_sites_crm';
              const existingCrm = JSON.parse(localStorage.getItem(crmKey) || '{}');
              existingCrm[data.id] = {
                contact: '',
                customLink: '',
                mailingDone: false,
                notes: '',
                admins: entry.admins || [],
                vkGroupUrl: entry.vkGroupUrl || '', // Ссылка на сообщество ВК
              };
              localStorage.setItem(crmKey, JSON.stringify(existingCrm));
              console.log(`📋 CRM: ${entry.admins?.length || 0} админов, группа: ${entry.vkGroupUrl || 'нет'}`);
            } catch (e) {
              console.error('Ошибка сохранения в CRM:', e);
            }
          }

          setBatchEntries(prev => prev.map(e =>
            e.id === entry.id
              ? { ...e, submitted: true, projectId: data.id, expanded: false }
              : e
          ));

          entry.photos.forEach(p => URL.revokeObjectURL(p.preview));
        }
      } catch (error) {
        console.error(`Ошибка для записи ${i + 1}:`, error);
      }
    }

    setIsSubmitting(false);
    setBatchProgress({ current: 0, total: 0 });
  };

  // Удалить сайт из списка
  const handleRemoveSite = (id: string) => {
    setQueuedSites(prev => prev.filter(s => s.id !== id));
  };

  // Очистить завершённые
  const handleClearCompleted = () => {
    setQueuedSites(prev => prev.filter(s => s.status !== 'completed' && s.status !== 'failed'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-генератор сайтов
            </div>
            <button
              onClick={() => navigate('/sites')}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
              <Layers className="w-4 h-4" />
              Мои сайты
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Демо-сайт за минуты
          </h1>
          <p className="text-gray-600 text-lg">
            Вставь инфу о студии — получи готовый лендинг
          </p>
        </div>

        {/* Sticky Submit Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  {batchEntries.filter(e => e.submitted).length}
                </span>
                <span className="text-gray-400 text-sm">отправлено</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {batchEntries.filter(e => !e.submitted && e.previewConfirmed).length}
                </span>
                <span className="text-gray-400 text-sm">к отправке</span>
              </div>
              {batchEntries.filter(e => !e.submitted).reduce((sum, e) => sum + e.photos.length, 0) > 0 && (
                <>
                  <div className="text-gray-300">|</div>
                  <span className="text-sm text-gray-500">
                    {batchEntries.filter(e => !e.submitted).reduce((sum, e) => sum + e.photos.length, 0)} фото
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleBatchSubmit}
              disabled={isSubmitting || batchEntries.filter(e => !e.submitted && e.previewConfirmed).length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {batchProgress.current}/{batchProgress.total}
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  Отправить ({batchEntries.filter(e => !e.submitted && e.previewConfirmed).length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Таблица всех сайтов */}
        {queuedSites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                Сайтов: {queuedSites.length}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({queuedSites.filter(s => s.status === 'completed').length} готово)
                </span>
              </h3>
              <div className="flex items-center gap-3">
                {queuedSites.some(s => s.status === 'completed' || s.status === 'failed') && (
                  <button
                    onClick={handleClearCompleted}
                    className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Очистить
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {queuedSites.slice().reverse().map((site) => (
                <div
                  key={site.id}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    site.status === 'completed' ? 'bg-green-50' :
                    site.status === 'failed' ? 'bg-red-50' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {site.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    ) : site.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-800 block truncate">{site.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{site.niche}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          site.status === 'completed' ? 'bg-green-100 text-green-700' :
                          site.status === 'failed' ? 'bg-red-100 text-red-700' :
                          site.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {site.status === 'pending' ? 'в очереди' :
                           site.status === 'processing' ? 'AI анализ' :
                           site.status === 'building' ? 'сборка' :
                           site.status === 'deploying' ? 'деплой' :
                           site.status === 'completed' ? 'готово' :
                           'ошибка'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {site.status === 'completed' && site.deployedUrl && (
                      <a
                        href={site.deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Открыть <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/status/${site.id}`)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveSite(site.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Batch Mode */}
        <form onSubmit={handleBatchSubmit} className="space-y-4">
          {/* Кнопки импорта */}
          <div className="flex gap-2 justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              <FileUp className="w-4 h-4" />
              Импорт JSON
            </button>
            <button
              type="button"
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition font-medium"
            >
              <Layers className="w-4 h-4" />
              Массовая вставка ВК
            </button>
          </div>

          {/* Модальное окно массовой вставки */}
          {showBulkImport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Layers className="w-6 h-6" />
                    Массовая вставка ВК ссылок
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    Вставьте ссылки на группы ВК, каждую на новой строке (до 50 штук)
                  </p>
                </div>

                <div className="p-6">
                  <textarea
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    placeholder={`https://vk.com/studio1\nhttps://vk.com/studio2\nhttps://vk.com/studio3\n...`}
                    className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-mono text-sm"
                    disabled={bulkImportLoading}
                  />

                  {bulkImportLoading && (
                    <div className="mt-4 bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span className="font-medium text-indigo-800">
                          Загрузка {bulkImportProgress.current} из {bulkImportProgress.total}...
                        </span>
                      </div>
                      <div className="mt-2 bg-indigo-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${(bulkImportProgress.current / bulkImportProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 mt-3">
                    💡 Поддерживаются: vk.com и vk.ru (groupname, public123, club123)
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkImport(false);
                      setBulkImportText('');
                    }}
                    disabled={bulkImportLoading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    disabled={bulkImportLoading || !bulkImportText.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {bulkImportLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Загрузить студии
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Карточки студий с индивидуальными настройками */}
          <div className="space-y-4">
            {batchEntries.map((entry, index) => {
              const projectStatus = entry.projectId
                ? queuedSites.find(s => s.id === entry.projectId)
                : null;

              return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  entry.submitted ? 'opacity-80' : ''
                }`}
              >
                {/* Заголовок карточки */}
                <div className={`flex items-center justify-between p-4 border-b ${
                  entry.submitted
                    ? projectStatus?.status === 'completed'
                      ? 'bg-green-50'
                      : projectStatus?.status === 'failed'
                      ? 'bg-red-50'
                      : 'bg-gray-100'
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {entry.submitted ? (
                      projectStatus?.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : projectStatus?.status === 'failed' ? (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      ) : projectStatus ? (
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-gray-400" />
                      )
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: `linear-gradient(135deg, ${entry.primaryColor}, ${entry.accentColor})` }}
                      >
                        {index + 1}
                      </div>
                    )}
                    <div>
                      <span className={`font-bold ${entry.submitted ? 'text-gray-600' : 'text-gray-800'}`}>
                        {projectStatus?.name || `Студия #${index + 1}`}
                      </span>
                      {entry.submitted && projectStatus && (
                        <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                          projectStatus.status === 'completed' ? 'bg-green-100 text-green-700' :
                          projectStatus.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {projectStatus.status === 'pending' ? 'в очереди' :
                           projectStatus.status === 'processing' ? 'AI анализ' :
                           projectStatus.status === 'building' ? 'сборка' :
                           projectStatus.status === 'deploying' ? 'деплой' :
                           projectStatus.status === 'completed' ? 'готово' :
                           'ошибка'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.submitted && projectStatus?.status === 'completed' && projectStatus.deployedUrl && (
                      <a
                        href={projectStatus.deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                      >
                        Открыть <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {/* Кнопка сворачивания убрана - настройки всегда открыты */}
                    {batchEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBatchEntry(index)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* ПРЕВЬЮ СВЕРХУ — если есть */}
                  {entry.preview && !entry.submitted && (
                    <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-lg">
                          {/* КНОПКА СОЗДАТЬ — СВЕРХУ STICKY */}
                          <div className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 flex items-center justify-between">
                            {/* Кнопка свернуть/развернуть */}
                            <button
                              type="button"
                              onClick={() => updateBatchEntry(index, 'previewCollapsed', !entry.previewCollapsed)}
                              className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg mr-2"
                              title={entry.previewCollapsed ? 'Развернуть' : 'Свернуть'}
                            >
                              {entry.previewCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </button>
                            {!entry.previewConfirmed ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmPreview(index)}
                                className="flex-1 py-2 bg-white text-green-600 rounded-xl text-sm font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
                              >
                                <Check className="w-5 h-5" />
                                Всё верно — создать сайт
                              </button>
                            ) : (
                              <div className="flex-1 flex items-center gap-2 text-white text-sm font-medium justify-center">
                                <Check className="w-5 h-5" />
                                Подтверждено — готово к генерации
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleResetPreview(index)}
                              className="ml-3 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg"
                              title="Перегенерировать"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Контент превью — сворачиваемый */}
                          {!entry.previewCollapsed && (
                          <>
                          {/* Шапка с названием — РЕДАКТИРУЕМАЯ */}
                          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
                            <input
                              type="text"
                              value={entry.preview.name}
                              onChange={(e) => updatePreviewData(index, 'name', e.target.value)}
                              className="font-bold text-xl bg-transparent border-b border-white/30 focus:border-white outline-none w-full"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                                {entry.preview.nicheLabel}
                              </span>
                              <input
                                type="text"
                                value={entry.preview.city || ''}
                                onChange={(e) => updatePreviewData(index, 'city', e.target.value)}
                                placeholder="Город"
                                className="text-xs bg-transparent border-b border-white/30 focus:border-white outline-none opacity-80 w-24"
                              />
                            </div>
                            <input
                              type="text"
                              value={entry.preview.tagline || ''}
                              onChange={(e) => updatePreviewData(index, 'tagline', e.target.value)}
                              placeholder="Слоган"
                              className="text-sm bg-transparent border-b border-white/30 focus:border-white outline-none opacity-90 mt-2 italic w-full"
                            />
                          </div>

                          <div className="p-5 space-y-5">
                            {/* НАПРАВЛЕНИЯ — редактируемые */}
                            {entry.preview.directions && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">📚</span>
                                    Направления ({entry.preview.directions.length})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addPreviewArrayItem(index, 'directions', { title: 'Новое направление', description: '' })}
                                    className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-200"
                                  >
                                    + Добавить
                                  </button>
                                </h5>
                                <div className="grid gap-2">
                                  {entry.preview.directions.map((dir, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative group">
                                      <button
                                        type="button"
                                        onClick={() => removePreviewArrayItem(index, 'directions', i)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Удалить"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                      <input
                                        type="text"
                                        value={dir.title}
                                        onChange={(e) => updatePreviewArrayItem(index, 'directions', i, 'title', e.target.value)}
                                        className="font-semibold text-gray-900 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none w-full pr-6"
                                      />
                                      <input
                                        type="text"
                                        value={dir.description || ''}
                                        onChange={(e) => updatePreviewArrayItem(index, 'directions', i, 'description', e.target.value)}
                                        placeholder="Описание..."
                                        className="text-xs text-gray-600 mt-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none w-full"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ТАРИФЫ — редактируемые */}
                            {entry.preview.pricing && entry.preview.pricing.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">💰</span>
                                  Тарифы ({entry.preview.pricing.length})
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                  {entry.preview.pricing.map((price, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                      <input
                                        type="text"
                                        value={price.name}
                                        onChange={(e) => updatePreviewArrayItem(index, 'pricing', i, 'name', e.target.value)}
                                        className="font-semibold text-gray-900 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 outline-none w-full"
                                      />
                                      <input
                                        type="text"
                                        value={price.price}
                                        onChange={(e) => updatePreviewArrayItem(index, 'pricing', i, 'price', e.target.value)}
                                        className="text-lg font-bold text-green-600 mt-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 outline-none w-full"
                                      />
                                      <input
                                        type="text"
                                        value={price.period || ''}
                                        onChange={(e) => updatePreviewArrayItem(index, 'pricing', i, 'period', e.target.value)}
                                        placeholder="за занятие / в месяц"
                                        className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 outline-none w-full"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ЭТАПЫ ПРОГРЕССА — редактируемые */}
                            {entry.preview.calculatorStages && entry.preview.calculatorStages.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">📈</span>
                                  Этапы трансформации
                                </h5>
                                <div className="space-y-2">
                                  {entry.preview.calculatorStages.map((stage, i) => (
                                    <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {i + 1}
                                        </span>
                                        <input
                                          type="text"
                                          value={stage.status}
                                          onChange={(e) => updatePreviewArrayItem(index, 'calculatorStages', i, 'status', e.target.value)}
                                          className="font-semibold text-gray-900 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 outline-none flex-1"
                                        />
                                      </div>
                                      <input
                                        type="text"
                                        value={stage.description}
                                        onChange={(e) => updatePreviewArrayItem(index, 'calculatorStages', i, 'description', e.target.value)}
                                        className="text-xs text-gray-600 mt-2 ml-8 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 outline-none w-[calc(100%-2rem)]"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* FAQ — редактируемые */}
                            {entry.preview.faq && entry.preview.faq.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">❓</span>
                                  FAQ ({entry.preview.faq.length})
                                </h5>
                                <div className="space-y-2">
                                  {entry.preview.faq.map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                      <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => updatePreviewArrayItem(index, 'faq', i, 'question', e.target.value)}
                                        className="font-semibold text-gray-900 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-amber-500 outline-none w-full"
                                      />
                                      <input
                                        type="text"
                                        value={item.answer}
                                        onChange={(e) => updatePreviewArrayItem(index, 'faq', i, 'answer', e.target.value)}
                                        className="text-xs text-gray-600 mt-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-amber-500 outline-none w-full"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ОТЗЫВЫ — редактируемые */}
                            {entry.preview.reviews && entry.preview.reviews.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs">💬</span>
                                  Отзывы ({entry.preview.reviews.length})
                                </h5>
                                <div className="space-y-2">
                                  {entry.preview.reviews.map((review, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={review.name}
                                          onChange={(e) => updatePreviewArrayItem(index, 'reviews', i, 'name', e.target.value)}
                                          className="font-semibold text-gray-900 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-500 outline-none"
                                        />
                                        <span className="text-xs text-gray-400">•</span>
                                        <input
                                          type="text"
                                          value={review.source || ''}
                                          onChange={(e) => updatePreviewArrayItem(index, 'reviews', i, 'source', e.target.value)}
                                          placeholder="Источник"
                                          className="text-xs text-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-500 outline-none w-20"
                                        />
                                      </div>
                                      <textarea
                                        value={review.text}
                                        onChange={(e) => updatePreviewArrayItem(index, 'reviews', i, 'text', e.target.value)}
                                        rows={2}
                                        className="text-xs text-gray-600 mt-1 bg-transparent border border-transparent hover:border-gray-300 focus:border-pink-500 outline-none w-full resize-none rounded"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ИНСТРУКТОРЫ — редактируемые */}
                            {entry.preview.instructors && entry.preview.instructors.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">👤</span>
                                  Тренеры ({entry.preview.instructors.length})
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                  {entry.preview.instructors.map((inst, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                      <input
                                        type="text"
                                        value={inst.name}
                                        onChange={(e) => updatePreviewArrayItem(index, 'instructors', i, 'name', e.target.value)}
                                        className="font-semibold text-gray-900 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full"
                                      />
                                      <input
                                        type="text"
                                        value={inst.experience || ''}
                                        onChange={(e) => updatePreviewArrayItem(index, 'instructors', i, 'experience', e.target.value)}
                                        placeholder="Опыт работы"
                                        className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* КОНТАКТЫ — редактируемые */}
                            {entry.preview.contacts && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs">📞</span>
                                  Контакты
                                </h5>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 w-16">Телефон:</span>
                                    <input
                                      type="text"
                                      value={entry.preview.contacts.phone || ''}
                                      onChange={(e) => updatePreviewData(index, 'contacts', { ...entry.preview?.contacts, phone: e.target.value })}
                                      placeholder="+7 (XXX) XXX-XX-XX"
                                      className="text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none flex-1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 w-16">Адрес:</span>
                                    <input
                                      type="text"
                                      value={entry.preview.contacts.address || ''}
                                      onChange={(e) => updatePreviewData(index, 'contacts', { ...entry.preview?.contacts, address: e.target.value })}
                                      placeholder="Город, улица, дом"
                                      className="text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none flex-1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 w-16">VK:</span>
                                    <input
                                      type="text"
                                      value={entry.preview.contacts.vk || ''}
                                      onChange={(e) => updatePreviewData(index, 'contacts', { ...entry.preview?.contacts, vk: e.target.value })}
                                      placeholder="vk.com/group"
                                      className="text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none flex-1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 w-16">Telegram:</span>
                                    <input
                                      type="text"
                                      value={entry.preview.contacts.telegram || ''}
                                      onChange={(e) => updatePreviewData(index, 'contacts', { ...entry.preview?.contacts, telegram: e.target.value })}
                                      placeholder="@username"
                                      className="text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none flex-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ЧЕГО НЕ ХВАТАЕТ */}
                            {(() => {
                              const missing: string[] = [];
                              if (entry.photos.length === 0) missing.push('Фото студии/залов');
                              if (!entry.preview.contacts?.phone || entry.preview.contacts.phone.includes('XXX')) missing.push('Реальный телефон');
                              if (!entry.preview.contacts?.address || entry.preview.contacts.address.includes('placeholder')) missing.push('Точный адрес');
                              if (!entry.preview.instructors || entry.preview.instructors.length === 0 || entry.preview.instructors[0]?.name === 'Имя Фамилия') missing.push('Имена тренеров');

                              return missing.length > 0 ? (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                  <h5 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Рекомендуем добавить:
                                  </h5>
                                  <ul className="space-y-1">
                                    {missing.map((item, i) => (
                                      <li key={i} className="text-xs text-amber-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="text-xs text-amber-600 mt-2 opacity-75">
                                    Без этих данных будут использованы заглушки
                                  </p>
                                </div>
                              ) : null;
                            })()}
                          </div>
                          </>
                          )}

                        </div>
                  )}

                  {/* ФОРМА ВВОДА — показываем только если нет превью */}
                  {!entry.preview && !entry.submitted && (
                    <div className="space-y-3">
                      {/* Текст описания */}
                      <textarea
                        value={entry.text}
                        onChange={e => updateBatchEntry(index, 'text', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none text-sm"
                        placeholder="Вставь инфу о студии: название, описание, услуги, цены, контакты..."
                      />
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${entry.text.trim().length >= 20 ? 'text-green-500' : 'text-gray-400'}`}>
                          {entry.text.trim().length >= 20 ? '✓ Готово' : `${entry.text.trim().length}/20 символов`}
                        </span>
                        {/* VK парсинг */}
                        {showVkInput === index ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={vkUrl}
                              onChange={e => setVkUrl(e.target.value)}
                              placeholder="vk.com/group"
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-32"
                            />
                            <button
                              type="button"
                              onClick={() => handleParseVK(index)}
                              disabled={vkLoading === index}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                              {vkLoading === index ? '...' : 'OK'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowVkInput(null); setVkUrl(''); }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowVkInput(index)}
                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                          >
                            <Link2 className="w-3 h-3" />
                            Из ВК
                          </button>
                        )}
                      </div>

                      {/* Загрузка превью */}
                      {entry.previewLoading && (
                        <div className="py-4 text-center text-gray-500 text-sm">
                          <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          AI анализирует текст...
                        </div>
                      )}

                      {/* Кнопка анализа */}
                      {entry.text.trim().length >= 20 && !entry.previewLoading && (
                        <button
                          type="button"
                          onClick={() => handleGetPreview(index)}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Анализировать и показать превью
                        </button>
                      )}
                    </div>
                  )}

                  {/* Настройки (всегда открыты) */}
                  {!entry.submitted && (
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      {/* Цвета */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Цвета сайта</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Основной:</span>
                            <input
                              type="color"
                              value={entry.primaryColor}
                              onChange={e => updateBatchEntry(index, 'primaryColor', e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Акцент:</span>
                            <input
                              type="color"
                              value={entry.accentColor}
                              onChange={e => updateBatchEntry(index, 'accentColor', e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Фон:</span>
                            <input
                              type="color"
                              value={entry.backgroundColor}
                              onChange={e => updateBatchEntry(index, 'backgroundColor', e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                            />
                          </div>
                          <div
                            className="flex-1 h-10 rounded-lg min-w-[60px]"
                            style={{ background: entry.backgroundColor, border: '1px solid #e5e7eb' }}
                          />
                        </div>
                        {/* Быстрые пресеты */}
                        <div className="flex gap-2 mt-2">
                          {COLOR_SCHEMES.map(scheme => (
                            <button
                              key={scheme.value}
                              type="button"
                              onClick={() => {
                                updateBatchEntry(index, 'primaryColor', scheme.primary);
                                updateBatchEntry(index, 'accentColor', scheme.accent);
                              }}
                              className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition"
                              style={{ background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.accent})` }}
                              title={scheme.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Ниша, AI модель и шрифт */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Ниша</label>
                          <select
                            value={entry.niche}
                            onChange={e => updateBatchEntry(index, 'niche', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                          >
                            {NICHE_OPTIONS.map(niche => (
                              <option key={niche.value} value={niche.value}>
                                {niche.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">AI модель</label>
                          <select
                            value={entry.aiModel}
                            onChange={e => updateBatchEntry(index, 'aiModel', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                          >
                            {AI_MODELS.map(model => (
                              <option key={model.value} value={model.value}>
                                {model.label} ({model.price})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Шрифт</label>
                          <select
                            value={entry.fontFamily}
                            onChange={e => updateBatchEntry(index, 'fontFamily', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                          >
                            {FONT_OPTIONS.map(font => (
                              <option key={font.value} value={font.value}>
                                {font.label} — {font.style}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Фото с подписями */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Фото студии
                          <span className="text-gray-400 font-normal ml-1">(с подписями для AI)</span>
                        </label>

                        {/* Загруженные фото */}
                        {entry.photos.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {entry.photos.map((photo, photoIndex) => (
                              <div key={photoIndex} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                <img
                                  src={photo.preview}
                                  alt=""
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 space-y-2">
                                  <select
                                    value={photo.type}
                                    onChange={e => updateBatchPhoto(index, photoIndex, 'type', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                                  >
                                    {PHOTO_TYPES.map(type => (
                                      <option key={type.value} value={type.value}>
                                        {type.label} — {type.description}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={photo.label}
                                    onChange={e => updateBatchPhoto(index, photoIndex, 'label', e.target.value)}
                                    placeholder="Подпись (например: Анна Иванова, тренер)"
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeBatchPhoto(index, photoIndex)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Кнопки добавления фото */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickPaste(index)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Clipboard className="w-4 h-4" />
                            Вставить (Ctrl+V)
                          </button>
                          <div
                            tabIndex={0}
                            onPaste={e => handlePasteForBatch(index, e)}
                            className="flex-1 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition cursor-pointer outline-none"
                          >
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={e => e.target.files && addPhotoToBatch(index, e.target.files)}
                              className="hidden"
                              id={`batch-photo-${index}`}
                            />
                            <label htmlFor={`batch-photo-${index}`} className="cursor-pointer flex items-center justify-center gap-2 py-3">
                              <Upload className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 text-sm">Загрузить</span>
                            </label>
                          </div>
                          {/* Кнопка загрузки фото из ВК */}
                          {entry.vkGroupUrl && (
                            <button
                              type="button"
                              onClick={() => handleLoadVkPhotos(index)}
                              disabled={vkPhotosLoading}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                            >
                              {vkPhotosLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Link2 className="w-4 h-4" />
                              )}
                              Фото из ВК
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>

          {/* Кнопка добавить ещё */}
          <button
            type="button"
            onClick={addBatchEntry}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Добавить ещё студию
          </button>

          {/* Прогресс загрузки */}
          {batchProgress.total > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-700">
                  Загрузка: {batchProgress.current} / {batchProgress.total}
                </span>
                <span className="text-xs text-indigo-500">
                  {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

        </form>

        {/* Token Stats Card */}
        {tokenStats && (
          <div className="bg-white rounded-xl shadow-md p-4 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Потрачено на AI</p>
                <p className="text-lg font-bold text-gray-900">
                  ${tokenStats.total.estimatedCost.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Запросов: {tokenStats.requests}</p>
              <p className="text-xs text-gray-400">
                {(tokenStats.total.totalTokens / 1000).toFixed(1)}K токенов
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-4">
          Powered by OpenRouter AI
        </p>
      </div>

      {/* VK Photos Modal */}
      {vkPhotosModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Фото из ВК</h3>
                <p className="text-sm text-gray-500">
                  Выбрано: {getTotalSelectedVkPhotos()} из {vkPhotosModal.photos.length}
                </p>
              </div>
              <button
                onClick={() => setVkPhotosModal(null)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Type Selector */}
            <div className="p-4 border-b bg-gray-50">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Категория для выбранных фото:
              </label>
              <div className="flex flex-wrap gap-2">
                {PHOTO_TYPES.map(type => {
                  const count = vkPhotosByCategory[type.value].size;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setVkPhotoType(type.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                        vkPhotoType === type.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border'
                      }`}
                    >
                      {type.label}
                      {count > 0 && (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                          vkPhotoType === type.value
                            ? 'bg-white/20 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {vkPhotosModal.photos.map(photo => {
                  const photoCategory = getPhotoCategory(photo.id);
                  const isSelectedInCurrentCategory = vkPhotosByCategory[vkPhotoType].has(photo.id);
                  const isSelectedInOtherCategory = photoCategory && photoCategory !== vkPhotoType;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => !isSelectedInOtherCategory && toggleVkPhotoSelection(photo.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                        isSelectedInCurrentCategory
                          ? 'border-indigo-600 ring-2 ring-indigo-200'
                          : isSelectedInOtherCategory
                          ? 'border-green-500 ring-2 ring-green-200 opacity-60'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelectedInCurrentCategory && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      {isSelectedInOtherCategory && (
                        <div className="absolute inset-0 bg-green-600/30 flex items-center justify-center">
                          <div className="px-2 py-1 bg-green-600 rounded text-white text-[10px] font-bold">
                            {PHOTO_TYPES.find(t => t.value === photoCategory)?.label}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-indigo-600">{vkPhotosByCategory[vkPhotoType].size}</span> в этой категории
                {getTotalSelectedVkPhotos() > 0 && (
                  <span className="ml-2 text-green-600">
                    • <span className="font-medium">{getTotalSelectedVkPhotos()}</span> всего
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setVkPhotosModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddVkPhotos}
                  disabled={getTotalSelectedVkPhotos() === 0}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Добавить ({getTotalSelectedVkPhotos()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
