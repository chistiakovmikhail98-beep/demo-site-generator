"use strict";
/**
 * Тесты динамического контента - проверка что всё меняется для разных студий
 * Запуск: npx tsx tests/dynamic-content.test.ts
 */
const API_URL = process.env.API_URL || 'https://demo-generator-api-production.up.railway.app';
const results = [];
// 3 РАНДОМНЫЕ СТУДИИ ДЛЯ ТЕСТИРОВАНИЯ
const TEST_STUDIOS = [
    {
        name: 'Танцевальная школа',
        text: `Школа танцев "Street Vibes" Москва.
      Хип-хоп для детей и взрослых, брейк-данс, contemporary, джаз-фанк.
      Телефон: +7 (916) 123-45-67.
      Цены: разовое занятие 800 руб, абонемент 8 занятий 5000 руб.
      Адрес: ул. Тверская, 12, 3 этаж.
      Занятия ведут призёры чемпионатов по уличным танцам.`,
        expectedNiche: 'dance',
        expectedKeywords: ['танц', 'хип-хоп', 'брейк']
    },
    {
        name: 'Йога-студия',
        text: `Студия йоги "Шанти" СПб.
      Хатха-йога, аштанга, йога для начинающих, медитации.
      Телефон: +7 (812) 999-88-77.
      Цены от 700 руб за занятие.
      Мы помогаем обрести гармонию души и тела.
      Опытные инструкторы с международными сертификатами.`,
        expectedNiche: 'yoga',
        expectedKeywords: ['йог', 'медитаци', 'гармони']
    },
    {
        name: 'Фитнес-клуб',
        text: `Фитнес-клуб "Титан" Казань.
      Силовые тренировки, кроссфит, функциональный тренинг, TRX.
      Профессиональные тренеры-чемпионы.
      Тел: +7 (843) 555-44-33.
      Абонемент безлимит 4000 руб/мес.
      Работаем 24/7. Современное оборудование.`,
        expectedNiche: 'fitness',
        expectedKeywords: ['фитнес', 'силов', 'тренировк']
    }
];
async function fetchWithTimeout(url, options = {}, timeout = 180000) {
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
async function runTest(name, fn) {
    const start = Date.now();
    try {
        await fn();
        results.push({ name, passed: true, duration: Date.now() - start });
        console.log(`✅ ${name}`);
    }
    catch (error) {
        results.push({ name, passed: false, error: String(error), duration: Date.now() - start });
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error}`);
    }
}
// ============================================
// ТЕСТ 1: Танцевальная студия - должны быть танцевальные этапы
// ============================================
async function test1_DanceStudio() {
    const studio = TEST_STUDIOS[0];
    console.log(`\n   📤 Отправляем: "${studio.name}"`);
    const response = await fetchWithTimeout(`${API_URL}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: studio.text, aiModel: 'gpt4o-mini' }),
    }, 180000);
    if (response.status !== 200)
        throw new Error(`Status ${response.status}`);
    const data = await response.json();
    // Проверяем название
    console.log(`   📝 Распознано: "${data.preview.name}" (${data.preview.niche})`);
    if (!data.preview.name)
        throw new Error('Нет названия студии');
    // Проверяем нишу
    if (data.preview.niche !== studio.expectedNiche) {
        console.log(`   ⚠️ Ниша: ${data.preview.niche} (ожидали ${studio.expectedNiche})`);
    }
    // Проверяем CALCULATOR_STAGES
    const stages = data.fullConfig.calculatorStages;
    if (!stages || stages.length === 0) {
        throw new Error('CALCULATOR_STAGES пустой!');
    }
    console.log(`   🎯 CALCULATOR_STAGES: ${stages.length} этапов`);
    stages.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.status}: ${s.description.substring(0, 50)}...`);
    });
    // Проверяем что этапы содержат танцевальную тематику
    const stagesText = stages.map(s => s.status + ' ' + s.description + ' ' + s.tags.join(' ')).join(' ').toLowerCase();
    const hasDanceKeywords = studio.expectedKeywords.some(kw => stagesText.includes(kw.toLowerCase()));
    if (!hasDanceKeywords) {
        console.log(`   ⚠️ Этапы не содержат ключевых слов для танцев`);
    }
    else {
        console.log(`   ✓ Этапы содержат танцевальную тематику`);
    }
    // Проверяем directions
    const directions = data.fullConfig.directions;
    if (directions && directions.length > 0) {
        console.log(`   📚 Направления: ${directions.length} шт`);
        console.log(`      Примеры: ${directions.slice(0, 3).map(d => d.title).join(', ')}`);
    }
}
// ============================================
// ТЕСТ 2: Йога-студия - должны быть йога-этапы
// ============================================
async function test2_YogaStudio() {
    const studio = TEST_STUDIOS[1];
    console.log(`\n   📤 Отправляем: "${studio.name}"`);
    const response = await fetchWithTimeout(`${API_URL}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: studio.text, aiModel: 'gpt4o-mini' }),
    }, 180000);
    if (response.status !== 200)
        throw new Error(`Status ${response.status}`);
    const data = await response.json();
    console.log(`   📝 Распознано: "${data.preview.name}" (${data.preview.niche})`);
    const stages = data.fullConfig.calculatorStages;
    if (!stages || stages.length === 0) {
        throw new Error('CALCULATOR_STAGES пустой!');
    }
    console.log(`   🎯 CALCULATOR_STAGES: ${stages.length} этапов`);
    stages.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.status}: ${s.description.substring(0, 50)}...`);
    });
    // Проверяем что этапы содержат йога-тематику
    const stagesText = stages.map(s => s.status + ' ' + s.description + ' ' + s.tags.join(' ')).join(' ').toLowerCase();
    const hasYogaKeywords = studio.expectedKeywords.some(kw => stagesText.includes(kw.toLowerCase()));
    if (!hasYogaKeywords) {
        console.log(`   ⚠️ Этапы не содержат ключевых слов для йоги`);
    }
    else {
        console.log(`   ✓ Этапы содержат йога-тематику`);
    }
    // Проверяем sectionTitles
    const sectionTitles = data.fullConfig.sectionTitles;
    if (sectionTitles?.calculator) {
        console.log(`   📋 SECTION_TITLES.calculator:`);
        console.log(`      title: "${sectionTitles.calculator.title}"`);
        console.log(`      subtitle: "${sectionTitles.calculator.subtitle}"`);
    }
}
// ============================================
// ТЕСТ 3: Фитнес-клуб - должны быть фитнес-этапы
// ============================================
async function test3_FitnessClub() {
    const studio = TEST_STUDIOS[2];
    console.log(`\n   📤 Отправляем: "${studio.name}"`);
    const response = await fetchWithTimeout(`${API_URL}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: studio.text, aiModel: 'gpt4o-mini' }),
    }, 180000);
    if (response.status !== 200)
        throw new Error(`Status ${response.status}`);
    const data = await response.json();
    console.log(`   📝 Распознано: "${data.preview.name}" (${data.preview.niche})`);
    const stages = data.fullConfig.calculatorStages;
    if (!stages || stages.length === 0) {
        throw new Error('CALCULATOR_STAGES пустой!');
    }
    console.log(`   🎯 CALCULATOR_STAGES: ${stages.length} этапов`);
    stages.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.status}: ${s.description.substring(0, 50)}...`);
    });
    // Проверяем что этапы содержат фитнес-тематику
    const stagesText = stages.map(s => s.status + ' ' + s.description + ' ' + s.tags.join(' ')).join(' ').toLowerCase();
    const hasFitnessKeywords = studio.expectedKeywords.some(kw => stagesText.includes(kw.toLowerCase()));
    if (!hasFitnessKeywords) {
        console.log(`   ⚠️ Этапы не содержат ключевых слов для фитнеса`);
    }
    else {
        console.log(`   ✓ Этапы содержат фитнес-тематику`);
    }
}
// ============================================
// ТЕСТ 4: Сравнение - все 3 студии должны иметь РАЗНЫЕ этапы
// ============================================
async function test4_AllDifferent() {
    console.log(`\n   🔄 Загружаем все 3 студии для сравнения...`);
    const allStages = [];
    for (const studio of TEST_STUDIOS) {
        const response = await fetchWithTimeout(`${API_URL}/api/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: studio.text, aiModel: 'gpt4o-mini' }),
        }, 180000);
        const data = await response.json();
        const stages = data.fullConfig.calculatorStages || [];
        allStages.push(stages.map(s => s.status));
    }
    console.log(`\n   📊 Сравнение этапов:`);
    console.log(`   🎭 Танцы:  ${allStages[0].join(' → ')}`);
    console.log(`   🧘 Йога:   ${allStages[1].join(' → ')}`);
    console.log(`   💪 Фитнес: ${allStages[2].join(' → ')}`);
    // Проверяем что хотя бы один этап отличается между студиями
    const stage1 = allStages[0].join('|');
    const stage2 = allStages[1].join('|');
    const stage3 = allStages[2].join('|');
    if (stage1 === stage2 && stage2 === stage3) {
        throw new Error('ВСЕ ЭТАПЫ ОДИНАКОВЫЕ! AI не генерирует уникальный контент.');
    }
    const uniqueCount = new Set([stage1, stage2, stage3]).size;
    console.log(`\n   ✅ Уникальных наборов этапов: ${uniqueCount}/3`);
    if (uniqueCount < 2) {
        throw new Error('Слишком мало различий между студиями');
    }
}
// ============================================
// MAIN
// ============================================
async function main() {
    console.log('\n🧪 Тесты ДИНАМИЧЕСКОГО КОНТЕНТА\n');
    console.log(`API: ${API_URL}\n`);
    console.log('─'.repeat(60));
    console.log('Проверяем что AI генерирует РАЗНЫЙ контент для разных студий');
    console.log('─'.repeat(60));
    await runTest('1. Танцевальная студия (CALCULATOR_STAGES)', test1_DanceStudio);
    await runTest('2. Йога-студия (CALCULATOR_STAGES)', test2_YogaStudio);
    await runTest('3. Фитнес-клуб (CALCULATOR_STAGES)', test3_FitnessClub);
    await runTest('4. Все студии РАЗНЫЕ (сравнение)', test4_AllDifferent);
    console.log('\n' + '─'.repeat(60));
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\n📊 Результаты: ${passed}/${results.length} тестов`);
    console.log(`⏱️  Общее время: ${(totalTime / 1000).toFixed(1)}s`);
    if (failed > 0) {
        console.log('\n❌ Провалены:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`   - ${r.name}: ${r.error}`);
        });
        process.exit(1);
    }
    else {
        console.log('\n✅ Все тесты пройдены! Контент генерируется динамически.\n');
    }
}
main().catch(console.error);
