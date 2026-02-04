/**
 * Простые API тесты для demo-site-generator
 * Запуск: npx tsx tests/api.test.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMsg, duration: Date.now() - start });
    console.log(`❌ ${name}: ${errorMsg}`);
  }
}

async function runTests() {
  console.log(`\n🧪 Запуск тестов на ${API_URL}\n`);

  // Test 1: API health check
  await test('API доступен (health check)', async () => {
    const response = await fetch(`${API_URL}/api/queue`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!('queue' in data)) throw new Error('Неверный формат ответа');
  });

  // Test 2: Projects list
  await test('Получение списка проектов', async () => {
    const response = await fetch(`${API_URL}/api/projects`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Ожидался массив проектов');
  });

  // Test 3: Queue status
  await test('Статус очереди batch-vk', async () => {
    const response = await fetch(`${API_URL}/api/batch-vk/status`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!('isRunning' in data)) throw new Error('Неверный формат ответа');
    if (!('stats' in data)) throw new Error('Нет статистики очереди');
  });

  // Test 4: Failed items endpoint
  await test('Получение failed элементов', async () => {
    const response = await fetch(`${API_URL}/api/batch-vk/failed`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('success !== true');
    if (!Array.isArray(data.items)) throw new Error('items не массив');
  });

  // Test 5: AI costs
  await test('AI costs статистика', async () => {
    const response = await fetch(`${API_URL}/api/ai-costs`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('success !== true');
    if (!data.summary) throw new Error('Нет summary');
  });

  // Test 6: VK parsing (dry run - only check endpoint exists)
  await test('VK parsing endpoint существует', async () => {
    const response = await fetch(`${API_URL}/api/parse-vk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' }), // Empty URL should return error but endpoint works
    });
    // We expect 400 or similar, but not 404
    if (response.status === 404) throw new Error('Endpoint не найден');
  });

  // Summary
  console.log('\n📊 Результаты:');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`   ✅ Успешно: ${passed}`);
  console.log(`   ❌ Ошибок: ${failed}`);
  console.log(`   ⏱️ Время: ${results.reduce((sum, r) => sum + r.duration, 0)}ms\n`);

  if (failed > 0) {
    console.log('Детали ошибок:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Критическая ошибка тестов:', err);
  process.exit(1);
});
