/**
 * Тестирование производительности API BusinessUnion
 * 
 * Этот скрипт проводит нагрузочное тестирование и тестирование производительности.
 * Результаты сохраняются в файл performance-test-results.json
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Конфигурация
const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const RESULTS_FILE = path.join(__dirname, 'performance-test-results.json');

// Параметры нагрузочного тестирования
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS || '10');
const REQUESTS_PER_ENDPOINT = parseInt(process.env.REQUESTS_PER_ENDPOINT || '50');
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '30000');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Результаты тестирования
const performanceResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  configuration: {
    concurrentRequests: CONCURRENT_REQUESTS,
    requestsPerEndpoint: REQUESTS_PER_ENDPOINT,
    timeout: TIMEOUT_MS,
  },
  summary: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDuration: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    requestsPerSecond: 0,
  },
  endpoints: [],
  errors: [],
};

// Вспомогательные функции
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Функция для выполнения HTTP запроса с измерением времени
async function makeRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: TIMEOUT_MS,
    validateStatus: () => true,
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  const startTime = process.hrtime.bigint();
  try {
    const response = await axios(config);
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Конвертируем в миллисекунды

    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      duration,
      dataSize: JSON.stringify(response.data).length,
    };
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000;

    return {
      success: false,
      status: error.response?.status || 0,
      duration,
      error: error.message,
    };
  }
}

// Функция для выполнения параллельных запросов
async function runConcurrentRequests(endpoint, method = 'GET', data = null, token = null, count = REQUESTS_PER_ENDPOINT) {
  const requests = [];
  const results = {
    successful: 0,
    failed: 0,
    durations: [],
    statusCodes: {},
    errors: [],
    dataSizes: [],
  };

  // Создаем массив промисов
  for (let i = 0; i < count; i++) {
    requests.push(makeRequest(method, endpoint, data, token));
  }

  // Выполняем запросы батчами для контроля нагрузки
  const batchSize = CONCURRENT_REQUESTS;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);

    batchResults.forEach((result) => {
      if (result.success) {
        results.successful++;
        results.durations.push(result.duration);
        results.dataSizes.push(result.dataSize || 0);
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(result.error);
        }
      }

      const statusCode = result.status || 'unknown';
      results.statusCodes[statusCode] = (results.statusCodes[statusCode] || 0) + 1;
    });
  }

  return results;
}

// Функция для расчета статистики
function calculateStatistics(durations) {
  if (durations.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      p95: 0,
      p99: 0,
    };
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);

  return {
    min: Math.min(...durations),
    max: Math.max(...durations),
    avg: sum / durations.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

// Тест производительности для одного endpoint
async function testEndpointPerformance(name, endpoint, method = 'GET', data = null, token = null) {
  log(`\n  🔄 Тестирование: ${name}`, 'cyan');
  log(`     Endpoint: ${method} ${endpoint}`, 'blue');

  const startTime = Date.now();
  const results = await runConcurrentRequests(endpoint, method, data, token);
  const totalDuration = Date.now() - startTime;

  const stats = calculateStatistics(results.durations);
  const avgDataSize = results.dataSizes.length > 0
    ? results.dataSizes.reduce((a, b) => a + b, 0) / results.dataSizes.length
    : 0;

  const endpointResult = {
    name,
    endpoint: `${method} ${endpoint}`,
    totalRequests: REQUESTS_PER_ENDPOINT,
    successfulRequests: results.successful,
    failedRequests: results.failed,
    successRate: (results.successful / REQUESTS_PER_ENDPOINT) * 100,
    totalDuration,
    requestsPerSecond: (REQUESTS_PER_ENDPOINT / (totalDuration / 1000)).toFixed(2),
    responseTime: stats,
    averageDataSize: Math.round(avgDataSize),
    statusCodes: results.statusCodes,
    errors: results.errors.slice(0, 5), // Сохраняем только первые 5 ошибок
  };

  performanceResults.endpoints.push(endpointResult);
  performanceResults.summary.totalRequests += REQUESTS_PER_ENDPOINT;
  performanceResults.summary.successfulRequests += results.successful;
  performanceResults.summary.failedRequests += results.failed;

  // Обновляем общую статистику времени ответа
  if (stats.min < performanceResults.summary.minResponseTime) {
    performanceResults.summary.minResponseTime = stats.min;
  }
  if (stats.max > performanceResults.summary.maxResponseTime) {
    performanceResults.summary.maxResponseTime = stats.max;
  }

  log(`     ✅ Успешно: ${results.successful}/${REQUESTS_PER_ENDPOINT} (${endpointResult.successRate.toFixed(2)}%)`, 
    results.successful === REQUESTS_PER_ENDPOINT ? 'green' : 'yellow');
  log(`     ⏱️  Среднее время ответа: ${stats.avg.toFixed(2)} мс`, 'blue');
  log(`     📊 P95: ${stats.p95.toFixed(2)} мс, P99: ${stats.p99.toFixed(2)} мс`, 'blue');
  log(`     🚀 Запросов в секунду: ${endpointResult.requestsPerSecond}`, 'magenta');

  if (results.failed > 0) {
    log(`     ⚠️  Ошибок: ${results.failed}`, 'yellow');
    performanceResults.errors.push({
      endpoint: name,
      errors: results.errors.slice(0, 10),
    });
  }

  return endpointResult;
}

// Получение токена для аутентифицированных запросов
async function getAuthToken() {
  log('\n🔐 Получение токена для тестирования...', 'cyan');
  
  // Пытаемся залогиниться с тестовыми данными
  // Если пользователя нет, пытаемся зарегистрировать
  const testEmail = `perf_test_${Date.now()}@test.com`;
  const testPassword = 'PerfTest123!';

  try {
    // Сначала пытаемся зарегистрироваться
    await makeRequest('POST', '/auth/register', {
      email: testEmail,
      password: testPassword,
      firstName: 'Performance',
      lastName: 'Test',
      userType: 'investor',
    });

    // Затем логинимся
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    }, {
      timeout: TIMEOUT_MS,
      validateStatus: () => true,
    });

    if (loginResponse.status === 200 && loginResponse.data?.access_token) {
      log('  ✅ Токен получен', 'green');
      return loginResponse.data.access_token;
    }
  } catch (error) {
    log(`  ⚠️  Не удалось получить токен: ${error.message}`, 'yellow');
  }

  return null;
}

// Проверка доступности сервера
async function checkServerAvailability() {
  log('\n🔍 Проверка доступности сервера...', 'cyan');
  
  try {
    const response = await axios.get(`${BASE_URL}/hello`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    
    if (response.status === 200) {
      log('  ✅ Сервер доступен и отвечает', 'green');
      return true;
    } else {
      log(`  ⚠️  Сервер отвечает, но со статусом: ${response.status}`, 'yellow');
      return true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('  ❌ Сервер недоступен!', 'red');
      log('\n⚠️  ВНИМАНИЕ: Backend сервер не запущен или недоступен!', 'red');
      log('   Для запуска тестов производительности необходимо:', 'yellow');
      log('   1. Запустить backend сервер:', 'yellow');
      log('      cd backend', 'yellow');
      log('      npm run start:dev', 'yellow');
      log('   2. Убедиться, что сервер работает на порту 3001', 'yellow');
      log('   3. Проверить переменную окружения API_URL (текущее значение: ' + BASE_URL + ')', 'yellow');
      log('\n   Frontend НЕ требуется для запуска тестов!', 'blue');
      return false;
    } else {
      log(`  ⚠️  Ошибка при проверке: ${error.message}`, 'yellow');
      return true;
    }
  }
}

// Основная функция тестирования производительности
async function runPerformanceTests() {
  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        ТЕСТИРОВАНИЕ ПРОИЗВОДИТЕЛЬНОСТИ API BUSINESSUNION     ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🔗 Базовый URL: ${BASE_URL}`, 'blue');
  log(`📅 Дата запуска: ${new Date().toLocaleString('ru-RU')}`, 'blue');
  log(`⚙️  Конфигурация:`, 'blue');
  log(`   - Параллельных запросов: ${CONCURRENT_REQUESTS}`, 'blue');
  log(`   - Запросов на endpoint: ${REQUESTS_PER_ENDPOINT}`, 'blue');
  log(`   - Таймаут: ${TIMEOUT_MS} мс\n`, 'blue');

  // Проверяем доступность сервера
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    log('\n❌ Тестирование прервано: сервер недоступен', 'red');
    process.exit(1);
  }

  const overallStartTime = Date.now();

  try {
    // Получаем токен для аутентифицированных запросов
    const authToken = await getAuthToken();

    // 1. Тестирование публичных endpoints
    log('\n📋 ГРУППА 1: Публичные endpoints', 'magenta');
    
    await testEndpointPerformance(
      'Health Check',
      '/hello',
      'GET'
    );

    await testEndpointPerformance(
      'Список проектов',
      '/projects',
      'GET'
    );

    await testEndpointPerformance(
      'Список событий',
      '/events',
      'GET'
    );

    await testEndpointPerformance(
      'Список курсов',
      '/education/courses',
      'GET'
    );

    await testEndpointPerformance(
      'Список платформ',
      '/education/platforms',
      'GET'
    );

    await testEndpointPerformance(
      'Валютные пары',
      '/financial-analytics/currency-pairs',
      'GET'
    );

    await testEndpointPerformance(
      'Сводки рынка',
      '/financial-analytics/market-summaries',
      'GET'
    );

    await testEndpointPerformance(
      'Список категорий',
      '/categories',
      'GET'
    );

    // 2. Тестирование аутентифицированных endpoints
    if (authToken) {
      log('\n📋 ГРУППА 2: Аутентифицированные endpoints', 'magenta');

      await testEndpointPerformance(
        'Профиль пользователя',
        '/users/profile',
        'GET',
        null,
        authToken
      );

      await testEndpointPerformance(
        'Поиск пользователей',
        '/users/search?q=test',
        'GET',
        null,
        authToken
      );

      await testEndpointPerformance(
        'Мои проекты',
        '/projects/author/me',
        'GET',
        null,
        authToken
      );

      await testEndpointPerformance(
        'События пользователя',
        '/events/user/events',
        'GET',
        null,
        authToken
      );
    } else {
      log('\n⚠️  ГРУППА 2 пропущена: не удалось получить токен аутентификации', 'yellow');
    }

    // 3. Тестирование POST endpoints (с ограниченным количеством запросов)
    log('\n📋 ГРУППА 3: POST endpoints (ограниченное тестирование)', 'magenta');
    
    const limitedRequests = Math.min(REQUESTS_PER_ENDPOINT, 10); // Ограничиваем для POST
    
    // Тест входа (без создания новых пользователей)
    if (authToken) {
      // Используем существующие данные для логина
      const loginData = {
        email: `perf_test_${Date.now()}@test.com`,
        password: 'Test123!',
      };

      // Выполняем меньше запросов для POST
      const loginResults = await runConcurrentRequests(
        '/auth/login',
        'POST',
        loginData,
        null,
        limitedRequests
      );

      const loginStats = calculateStatistics(loginResults.durations);
      log(`\n  🔄 Тестирование: Вход в систему`, 'cyan');
      log(`     ✅ Успешно: ${loginResults.successful}/${limitedRequests}`, 
        loginResults.successful === limitedRequests ? 'green' : 'yellow');
      log(`     ⏱️  Среднее время ответа: ${loginStats.avg.toFixed(2)} мс`, 'blue');
    }

  } catch (error) {
    log(`\n❌ Критическая ошибка при выполнении тестов: ${error.message}`, 'red');
    performanceResults.errors.push({
      type: 'Critical Error',
      error: error.message,
      stack: error.stack,
    });
  }

  const overallDuration = Date.now() - overallStartTime;
  performanceResults.summary.totalDuration = overallDuration;

  // Расчет общей статистики
  const allDurations = performanceResults.endpoints.flatMap(e => 
    Array(e.successfulRequests).fill(e.responseTime.avg)
  );

  if (allDurations.length > 0) {
    const totalAvg = allDurations.reduce((a, b) => a + b, 0) / allDurations.length;
    performanceResults.summary.averageResponseTime = totalAvg;
    performanceResults.summary.requestsPerSecond = 
      (performanceResults.summary.totalRequests / (overallDuration / 1000)).toFixed(2);
  }

  // Вывод итогов
  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    ИТОГИ ТЕСТИРОВАНИЯ                       ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n📊 Общая статистика:`, 'blue');
  log(`   Всего запросов: ${performanceResults.summary.totalRequests}`, 'blue');
  log(`   ✅ Успешных: ${performanceResults.summary.successfulRequests}`, 'green');
  log(`   ❌ Проваленных: ${performanceResults.summary.failedRequests}`, 'red');
  log(`   📈 Процент успешности: ${((performanceResults.summary.successfulRequests / performanceResults.summary.totalRequests) * 100).toFixed(2)}%`, 'blue');
  
  log(`\n⏱️  Производительность:`, 'blue');
  log(`   Среднее время ответа: ${performanceResults.summary.averageResponseTime.toFixed(2)} мс`, 'blue');
  log(`   Минимальное время: ${performanceResults.summary.minResponseTime.toFixed(2)} мс`, 'blue');
  log(`   Максимальное время: ${performanceResults.summary.maxResponseTime.toFixed(2)} мс`, 'blue');
  log(`   Запросов в секунду: ${performanceResults.summary.requestsPerSecond}`, 'magenta');
  log(`   Общее время тестирования: ${(overallDuration / 1000).toFixed(2)} сек`, 'blue');

  log(`\n📋 Протестировано endpoints: ${performanceResults.endpoints.length}`, 'blue');

  // Топ-5 самых быстрых endpoints
  const fastestEndpoints = [...performanceResults.endpoints]
    .sort((a, b) => a.responseTime.avg - b.responseTime.avg)
    .slice(0, 5);
  
  log(`\n🏆 Топ-5 самых быстрых endpoints:`, 'green');
  fastestEndpoints.forEach((endpoint, index) => {
    log(`   ${index + 1}. ${endpoint.name}: ${endpoint.responseTime.avg.toFixed(2)} мс`, 'green');
  });

  // Топ-5 самых медленных endpoints
  const slowestEndpoints = [...performanceResults.endpoints]
    .sort((a, b) => b.responseTime.avg - a.responseTime.avg)
    .slice(0, 5);
  
  log(`\n🐌 Топ-5 самых медленных endpoints:`, 'yellow');
  slowestEndpoints.forEach((endpoint, index) => {
    log(`   ${index + 1}. ${endpoint.name}: ${endpoint.responseTime.avg.toFixed(2)} мс`, 'yellow');
  });

  // Сохранение результатов
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(performanceResults, null, 2), 'utf8');
    log(`\n💾 Результаты сохранены в: ${RESULTS_FILE}`, 'green');
  } catch (error) {
    log(`\n❌ Ошибка при сохранении результатов: ${error.message}`, 'red');
  }

  // Вывод ошибок, если есть
  if (performanceResults.errors.length > 0) {
    log(`\n⚠️  Найдено ошибок: ${performanceResults.errors.length}`, 'yellow');
    performanceResults.errors.slice(0, 5).forEach((err, index) => {
      log(`\n${index + 1}. ${err.endpoint || err.type}:`, 'red');
      if (err.errors) {
        err.errors.forEach((error, i) => {
          log(`   ${i + 1}. ${error}`, 'red');
        });
      } else {
        log(`   ${err.error}`, 'red');
      }
    });
  }

  // Рекомендации
  log(`\n💡 Рекомендации:`, 'cyan');
  if (performanceResults.summary.averageResponseTime > 1000) {
    log(`   ⚠️  Среднее время ответа превышает 1 секунду. Рекомендуется оптимизация.`, 'yellow');
  }
  if (performanceResults.summary.failedRequests > performanceResults.summary.totalRequests * 0.1) {
    log(`   ⚠️  Процент ошибок превышает 10%. Рекомендуется проверка стабильности.`, 'yellow');
  }
  if (parseFloat(performanceResults.summary.requestsPerSecond) < 10) {
    log(`   ⚠️  Пропускная способность низкая. Рекомендуется оптимизация.`, 'yellow');
  }

  process.exit(performanceResults.summary.failedRequests > 0 ? 1 : 0);
}

// Запуск тестов
if (require.main === module) {
  runPerformanceTests().catch((error) => {
    log(`\n❌ Фатальная ошибка: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runPerformanceTests, testEndpointPerformance, makeRequest };

