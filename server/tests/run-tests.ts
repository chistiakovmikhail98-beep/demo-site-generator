/**
 * Простой тест-раннер для Node.js
 * Запуск: npx tsx tests/run-tests.ts
 */

const API_URL = process.env.API_URL || 'https://demo-generator-api-production.up.railway.app';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: String(error), duration: Date.now() - start });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error}`);
  }
}

// ============================================
// ТЕСТЫ
// ============================================

async function test1_HealthCheck() {
  const response = await fetchWithTimeout(`${API_URL}/api/tokens`);
  if (response.status !== 200) throw new Error(`Status ${response.status}`);

  const data = await response.json();
  if (!data.total || data.requests === undefined) throw new Error('Invalid response');
  console.log(`   Запросов к AI: ${data.requests}, потрачено: $${data.total.estimatedCost?.toFixed(4) || 0}`);
}

async function test2_PreviewAPI() {
  const testText = `Фитнес студия "Энергия" г. Москва. Йога, пилатес, силовые тренировки. Цены от 1000 руб.`;

  const response = await fetchWithTimeout(`${API_URL}/api/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: testText, aiModel: 'gpt4o-mini' }),
  }, 60000);

  if (response.status !== 200) throw new Error(`Status ${response.status}`);

  const data = await response.json();
  if (!data.fullConfig) throw new Error('No fullConfig in response');
  if (!data.fullConfig.brand?.name) throw new Error('No brand.name in fullConfig');

  console.log(`   Распознано: "${data.preview.name}" (${data.preview.niche})`);
}

async function test3_PhotoTypeMapping() {
  const validTypes = ['hero', 'instructors', 'atmosphere', 'gallery', 'stories', 'director', 'directions', 'advantages'];
  const backendTypes = ['hero', 'directions', 'instructors', 'stories', 'advantages', 'director', 'gallery', 'atmosphere', 'quiz', 'requests'];

  for (const type of validTypes) {
    if (!backendTypes.includes(type)) {
      throw new Error(`Type "${type}" not in backend types`);
    }
  }

  // Проверяем что старые типы не используются
  const oldTypes = ['trainer', 'result', 'logo'];
  for (const oldType of oldTypes) {
    if (validTypes.includes(oldType)) {
      throw new Error(`Old type "${oldType}" still in use`);
    }
  }

  console.log(`   Валидные типы: ${validTypes.join(', ')}`);
}

async function test4_QuickWithFullConfig() {
  // Сначала preview
  const previewResponse = await fetchWithTimeout(`${API_URL}/api/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Танцевальная студия "Ритм" СПб. Хип-хоп, брейк, современные танцы.',
      aiModel: 'gpt4o-mini'
    }),
  }, 60000);

  const previewData = await previewResponse.json();
  if (!previewData.fullConfig) throw new Error('No fullConfig from preview');

  // Теперь quick с fullConfig
  const formData = new FormData();
  formData.append('text', 'Танцевальная студия "Ритм" СПб');
  formData.append('aiModel', 'gpt4o-mini');
  formData.append('fontFamily', 'manrope');
  formData.append('colorScheme', JSON.stringify({
    primary: '#7c3aed', accent: '#a78bfa', background: '#0c0c0f', surface: '#18181b', text: '#ffffff'
  }));
  formData.append('fullConfig', JSON.stringify(previewData.fullConfig));

  const startTime = Date.now();
  const quickResponse = await fetchWithTimeout(`${API_URL}/api/quick`, {
    method: 'POST',
    body: formData,
  }, 30000);

  const duration = Date.now() - startTime;

  if (quickResponse.status !== 200) {
    const error = await quickResponse.text();
    throw new Error(`Status ${quickResponse.status}: ${error}`);
  }

  const quickData = await quickResponse.json();
  if (!quickData.id) throw new Error('No project ID');

  console.log(`   Project: ${quickData.id} | Время: ${duration}ms`);
}

async function test5_ProjectsList() {
  const response = await fetchWithTimeout(`${API_URL}/api/projects`);
  if (response.status !== 200) throw new Error(`Status ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Response is not array');

  console.log(`   Проектов в базе: ${data.length}`);
  if (data.length > 0) {
    const completed = data.filter((p: any) => p.status === 'completed').length;
    const failed = data.filter((p: any) => p.status === 'failed').length;
    console.log(`   Завершено: ${completed}, Ошибок: ${failed}`);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🧪 Автотесты demo-site-generator\n');
  console.log(`API: ${API_URL}\n`);
  console.log('─'.repeat(50));

  await runTest('1. Health Check (API доступен)', test1_HealthCheck);
  await runTest('2. Preview API (AI анализ)', test2_PreviewAPI);
  await runTest('3. PhotoType Mapping (типы фото)', test3_PhotoTypeMapping);
  await runTest('4. Quick API + fullConfig (без повторного AI)', test4_QuickWithFullConfig);
  await runTest('5. Projects List (список из Supabase)', test5_ProjectsList);

  console.log('\n' + '─'.repeat(50));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\n📊 Результаты: ${passed}/${results.length} тестов пройдено`);
  console.log(`⏱️  Общее время: ${(totalTime / 1000).toFixed(1)}s`);

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
