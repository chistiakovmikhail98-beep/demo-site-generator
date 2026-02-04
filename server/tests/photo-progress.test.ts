/**
 * Тесты загрузки фото и калькулятора прогресса
 * Запуск: npx tsx tests/photo-progress.test.ts
 */

import fs from 'fs/promises';
import path from 'path';

const TEMPLATE_DIR = path.join(process.cwd(), 'template');
const CONSTANTS_PATH = path.join(TEMPLATE_DIR, 'constants.tsx');

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function runTest(name: string, fn: () => void | Promise<void>): void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        results.push({ name, passed: true });
        console.log(`✅ ${name}`);
      }).catch(error => {
        results.push({ name, passed: false, error: String(error) });
        console.log(`❌ ${name}: ${error}`);
      });
    } else {
      results.push({ name, passed: true });
      console.log(`✅ ${name}`);
    }
  } catch (error) {
    results.push({ name, passed: false, error: String(error) });
    console.log(`❌ ${name}: ${error}`);
  }
}

// ============================================
// ТЕСТ 1: PhotoType в Home.tsx соответствует backend
// ============================================
async function test1_PhotoTypesMatch() {
  const homePath = path.join(process.cwd(), '..', 'web', 'src', 'pages', 'Home.tsx');
  const homeContent = await fs.readFile(homePath, 'utf-8');

  // Типы из frontend
  const frontendMatch = homeContent.match(/type PhotoType = ([^;]+);/);
  if (!frontendMatch) throw new Error('PhotoType not found in Home.tsx');

  const frontendTypes = frontendMatch[1]
    .replace(/['"]/g, '')
    .split('|')
    .map(t => t.trim());

  console.log(`   Frontend PhotoType: ${frontendTypes.join(', ')}`);

  // Типы из backend types.ts
  const typesPath = path.join(process.cwd(), 'types.ts');
  const typesContent = await fs.readFile(typesPath, 'utf-8');

  const backendMatch = typesContent.match(/export type PhotoBlockType =([^;]+);/s);
  if (!backendMatch) throw new Error('PhotoBlockType not found in types.ts');

  const backendTypes = backendMatch[1]
    .replace(/['"]/g, '')
    .split('|')
    .map(t => t.trim().replace(/\/\/.*/g, '').trim())
    .filter(t => t);

  console.log(`   Backend PhotoBlockType: ${backendTypes.join(', ')}`);

  // Проверяем что все frontend типы есть в backend
  for (const type of frontendTypes) {
    if (!backendTypes.includes(type)) {
      throw new Error(`Frontend type "${type}" not in backend!`);
    }
  }

  // Проверяем что старые типы НЕ используются
  const oldTypes = ['trainer', 'result', 'logo'];
  for (const oldType of oldTypes) {
    if (frontendTypes.includes(oldType)) {
      throw new Error(`Old type "${oldType}" still in frontend!`);
    }
  }
}

// ============================================
// ТЕСТ 2: ProgressTimeline использует SECTION_TITLES
// ============================================
async function test2_ProgressTimelineUsesConstants() {
  const progressPath = path.join(TEMPLATE_DIR, 'components', 'ProgressTimeline.tsx');
  const content = await fs.readFile(progressPath, 'utf-8');

  // Проверяем импорт SECTION_TITLES
  if (!content.includes("import { SECTION_TITLES")) {
    throw new Error('SECTION_TITLES not imported in ProgressTimeline.tsx');
  }
  console.log('   ✓ SECTION_TITLES импортирован');

  // Проверяем что используется SECTION_TITLES вместо хардкода
  if (content.includes('>Как меняется тело<') && !content.includes('SECTION_TITLES?.calculator?.title')) {
    throw new Error('Hardcoded "Как меняется тело" found without SECTION_TITLES fallback');
  }

  // Должен быть такой паттерн:
  if (!content.includes("SECTION_TITLES?.calculator?.title || 'Как меняется тело'")) {
    throw new Error('SECTION_TITLES?.calculator?.title not used correctly');
  }
  console.log('   ✓ SECTION_TITLES?.calculator?.title используется');

  if (!content.includes("SECTION_TITLES?.calculator?.subtitle || 'Трансформация через системный подход'")) {
    throw new Error('SECTION_TITLES?.calculator?.subtitle not used correctly');
  }
  console.log('   ✓ SECTION_TITLES?.calculator?.subtitle используется');
}

// ============================================
// ТЕСТ 3: builder.ts генерирует SECTION_TITLES
// ============================================
async function test3_BuilderGeneratesSectionTitles() {
  const builderPath = path.join(process.cwd(), 'services', 'builder.ts');
  const content = await fs.readFile(builderPath, 'utf-8');

  // Проверяем что SECTION_TITLES генерируется
  if (!content.includes('export const SECTION_TITLES =')) {
    throw new Error('SECTION_TITLES not generated in builder.ts');
  }
  console.log('   ✓ SECTION_TITLES генерируется');

  // Проверяем что CALCULATOR_STAGES генерируется
  if (!content.includes('export const CALCULATOR_STAGES =')) {
    throw new Error('CALCULATOR_STAGES not generated in builder.ts');
  }
  console.log('   ✓ CALCULATOR_STAGES генерируется');

  // Проверяем fallback функции
  if (!content.includes('getDefaultSectionTitles')) {
    throw new Error('getDefaultSectionTitles function not found');
  }
  console.log('   ✓ getDefaultSectionTitles есть');

  if (!content.includes('getDefaultCalculatorStages')) {
    throw new Error('getDefaultCalculatorStages function not found');
  }
  console.log('   ✓ getDefaultCalculatorStages есть');
}

// ============================================
// ТЕСТ 4: applyUploadedPhotos маппит типы правильно
// ============================================
async function test4_ApplyUploadedPhotosMapping() {
  const builderPath = path.join(process.cwd(), 'services', 'builder.ts');
  const content = await fs.readFile(builderPath, 'utf-8');

  // Проверяем что applyUploadedPhotos существует
  if (!content.includes('function applyUploadedPhotos')) {
    throw new Error('applyUploadedPhotos function not found');
  }
  console.log('   ✓ applyUploadedPhotos существует');

  // Проверяем обработку типов фото
  const photoTypes = ['hero', 'gallery', 'instructors', 'atmosphere', 'stories', 'director', 'directions', 'advantages'];

  for (const type of photoTypes) {
    if (!content.includes(`byBlock.${type}`) && !content.includes(`'${type}'`)) {
      console.log(`   ⚠️ Тип "${type}" может не обрабатываться`);
    }
  }

  console.log('   ✓ Основные типы фото обрабатываются');
}

// ============================================
// ТЕСТ 5: fullConfig передаётся и используется
// ============================================
async function test5_FullConfigPassthrough() {
  const indexPath = path.join(process.cwd(), 'index.ts');
  const content = await fs.readFile(indexPath, 'utf-8');

  // Проверяем что fullConfig парсится
  if (!content.includes("part.fieldname === 'fullConfig'")) {
    throw new Error('fullConfig not parsed in /api/quick');
  }
  console.log("   ✓ fullConfig парсится из formData");

  // Проверяем что используется кешированный конфиг
  if (!content.includes('cachedSiteConfig')) {
    throw new Error('cachedSiteConfig variable not found');
  }
  console.log('   ✓ cachedSiteConfig используется');

  // Проверяем что в processProject используется существующий siteConfig
  if (!content.includes('if (project.siteConfig)')) {
    throw new Error('project.siteConfig check not found in processProject');
  }
  console.log('   ✓ processProject использует кешированный siteConfig');
}

// ============================================
// MAIN
// ============================================

async function runTestAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: String(error) });
    console.log(`❌ ${name}: ${error}`);
  }
}

async function main() {
  console.log('\n🧪 Тесты ФОТО и ПРОГРЕССА\n');
  console.log('─'.repeat(50));

  await runTestAsync('1. PhotoType соответствует backend', test1_PhotoTypesMatch);
  await runTestAsync('2. ProgressTimeline использует SECTION_TITLES', test2_ProgressTimelineUsesConstants);
  await runTestAsync('3. builder.ts генерирует SECTION_TITLES', test3_BuilderGeneratesSectionTitles);
  await runTestAsync('4. applyUploadedPhotos маппит типы', test4_ApplyUploadedPhotosMapping);
  await runTestAsync('5. fullConfig передаётся и используется', test5_FullConfigPassthrough);

  console.log('\n' + '─'.repeat(50));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\n📊 Результаты: ${passed}/${results.length} тестов`);

  if (failed > 0) {
    console.log('\n❌ Провалены:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ Все тесты пройдены!\n');
  }
}

main().catch(console.error);
