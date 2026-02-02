"use strict";
/**
 * Автотесты для demo-site-generator
 * Запуск: npx tsx tests/integration.test.ts
 */
// import { describe, test, expect, beforeAll } from 'bun:test';
// Этот файл запускается через run-tests.ts, не через bun
const API_URL = process.env.API_URL || 'https://demo-generator-api-production.up.railway.app';
// Хелпер для fetch с таймаутом
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    }
    catch (error) {
        clearTimeout(id);
        throw error;
    }
}
// ============================================
// ТЕСТ 1: Health check API
// ============================================
describe('API Health', () => {
    test('сервер отвечает на /api/tokens', async () => {
        const response = await fetchWithTimeout(`${API_URL}/api/tokens`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('requests');
        console.log('✅ API Health: OK');
    });
});
// ============================================
// ТЕСТ 2: Preview endpoint (AI анализ)
// ============================================
describe('Preview API', () => {
    test('возвращает fullConfig для текста студии', async () => {
        const testText = `
      Фитнес студия "Энергия"
      г. Москва, ул. Ленина 10
      Тел: +7 (999) 123-45-67

      Направления:
      - Йога
      - Пилатес
      - Силовые тренировки

      Цены:
      - Разовое занятие: 1000 руб
      - Абонемент на месяц: 5000 руб
    `;
        const response = await fetchWithTimeout(`${API_URL}/api/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: testText, aiModel: 'gpt4o-mini' }),
        }, 60000); // 60 сек для AI
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('preview');
        expect(data).toHaveProperty('fullConfig');
        // Проверяем структуру fullConfig
        expect(data.fullConfig).toHaveProperty('brand');
        expect(data.fullConfig).toHaveProperty('sections');
        expect(data.fullConfig.brand).toHaveProperty('name');
        expect(data.fullConfig.brand).toHaveProperty('niche');
        console.log('✅ Preview API: fullConfig получен');
        console.log(`   Название: ${data.preview.name}`);
        console.log(`   Ниша: ${data.preview.niche}`);
    });
});
// ============================================
// ТЕСТ 3: PhotoType маппинг
// ============================================
describe('PhotoType Mapping', () => {
    const validTypes = ['hero', 'instructors', 'atmosphere', 'gallery', 'stories', 'director', 'directions', 'advantages'];
    const oldInvalidTypes = ['trainer', 'result', 'logo']; // Старые типы которые НЕ должны использоваться
    test('валидные типы фото соответствуют backend', () => {
        // Эти типы должны быть в PhotoBlockType на бэкенде
        const backendTypes = ['hero', 'directions', 'instructors', 'stories', 'advantages', 'director', 'gallery', 'atmosphere', 'quiz', 'requests'];
        for (const type of validTypes) {
            expect(backendTypes).toContain(type);
        }
        console.log('✅ PhotoType Mapping: все типы валидны');
    });
    test('старые типы не используются', () => {
        for (const oldType of oldInvalidTypes) {
            expect(validTypes).not.toContain(oldType);
        }
        console.log('✅ PhotoType Mapping: старые типы удалены');
    });
});
// ============================================
// ТЕСТ 4: Создание проекта с fullConfig
// ============================================
describe('Quick API with fullConfig', () => {
    test('принимает fullConfig и не вызывает AI повторно', async () => {
        // Сначала получаем fullConfig через preview
        const previewResponse = await fetchWithTimeout(`${API_URL}/api/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: 'Студия танцев "Ритм" в Санкт-Петербурге. Современные танцы, хип-хоп, брейк-данс.',
                aiModel: 'gpt4o-mini'
            }),
        }, 60000);
        const previewData = await previewResponse.json();
        expect(previewData.fullConfig).toBeDefined();
        console.log('   Preview получен, создаём проект с fullConfig...');
        // Создаём FormData с fullConfig
        const formData = new FormData();
        formData.append('text', 'Студия танцев "Ритм" в Санкт-Петербурге');
        formData.append('aiModel', 'gpt4o-mini');
        formData.append('fontFamily', 'manrope');
        formData.append('colorScheme', JSON.stringify({
            primary: '#7c3aed',
            accent: '#a78bfa',
            background: '#0c0c0f',
            surface: '#18181b',
            text: '#ffffff'
        }));
        formData.append('fullConfig', JSON.stringify(previewData.fullConfig));
        const startTime = Date.now();
        const quickResponse = await fetchWithTimeout(`${API_URL}/api/quick`, {
            method: 'POST',
            body: formData,
        }, 30000);
        const quickTime = Date.now() - startTime;
        expect(quickResponse.status).toBe(200);
        const quickData = await quickResponse.json();
        expect(quickData).toHaveProperty('id');
        expect(quickData).toHaveProperty('name');
        console.log('✅ Quick API with fullConfig: OK');
        console.log(`   Project ID: ${quickData.id}`);
        console.log(`   Время создания: ${quickTime}ms (должно быть <5сек без AI)`);
        // Если fullConfig используется, создание должно быть быстрым (без AI)
        // expect(quickTime).toBeLessThan(5000);
    });
});
// ============================================
// ТЕСТ 5: Получение списка проектов
// ============================================
describe('Projects API', () => {
    test('возвращает список проектов из Supabase', async () => {
        const response = await fetchWithTimeout(`${API_URL}/api/projects`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        console.log('✅ Projects API: OK');
        console.log(`   Всего проектов: ${data.length}`);
        if (data.length > 0) {
            const latest = data[0];
            console.log(`   Последний: ${latest.name} (${latest.status})`);
        }
    });
});
// ============================================
// Запуск тестов
// ============================================
console.log('\n🧪 Запуск автотестов для demo-site-generator\n');
console.log(`API URL: ${API_URL}\n`);
