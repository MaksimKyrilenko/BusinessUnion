/**
 * Функциональное тестирование API BusinessUnion
 * 
 * Этот скрипт проводит функциональное тестирование всех основных endpoints API.
 * Результаты сохраняются в файл functional-test-results.json
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Конфигурация
const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const RESULTS_FILE = path.join(__dirname, 'functional-test-results.json');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Результаты тестирования
const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
  tests: [],
  errors: [],
};

// Вспомогательные функции
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '') {
  const statusIcon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`  ${statusIcon} ${name}${message ? ': ' + message : ''}`, statusColor);
}

// Функция для выполнения HTTP запроса
async function makeRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true, // Не выбрасывать ошибки для любых статусов
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  const startTime = Date.now();
  try {
    const response = await axios(config);
    const duration = Date.now() - startTime;
    return {
      status: response.status,
      data: response.data,
      duration,
      headers: response.headers,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      status: error.response?.status || 0,
      data: error.response?.data || error.message,
      duration,
      error: error.message,
    };
  }
}

// Функция для записи теста
function recordTest(name, category, passed, details = {}) {
  const test = {
    name,
    category,
    passed,
    timestamp: new Date().toISOString(),
    ...details,
  };

  testResults.tests.push(test);
  testResults.summary.total++;
  if (passed) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
    if (details.error) {
      testResults.errors.push({
        test: name,
        error: details.error,
        details: details,
      });
    }
  }

  return test;
}

// ==================== ТЕСТЫ ====================

// 1. Тесты базовой функциональности
async function testBasicEndpoints() {
  log('\n📋 Тестирование базовых endpoints', 'cyan');

  // Тест 1: Проверка доступности API
  const healthCheck = await makeRequest('GET', '/hello');
  const healthTest = recordTest(
    'Health Check - /api/hello',
    'Basic',
    healthCheck.status === 200,
    {
      status: healthCheck.status,
      response: healthCheck.data,
      duration: healthCheck.duration,
    }
  );
  logTest(healthTest.name, healthTest.passed ? 'PASS' : 'FAIL', 
    healthTest.passed ? `Status: ${healthCheck.status}` : `Status: ${healthCheck.status}`);

  return { healthCheck };
}

// 2. Тесты аутентификации
async function testAuthentication() {
  log('\n🔐 Тестирование аутентификации', 'cyan');

  let authToken = null;
  let testUser = null;

  // Тест 2.1: Регистрация нового пользователя
  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';
  const registerData = {
    email: testEmail,
    password: testPassword,
    firstName: 'Test',
    lastName: 'User',
    userType: 'investor',
  };

  const registerResponse = await makeRequest('POST', '/auth/register', registerData);
  const registerTest = recordTest(
    'Регистрация пользователя',
    'Authentication',
    registerResponse.status === 201 || registerResponse.status === 200,
    {
      status: registerResponse.status,
      response: registerResponse.data,
      duration: registerResponse.duration,
      error: registerResponse.status >= 400 ? registerResponse.data : null,
    }
  );
  logTest(registerTest.name, registerTest.passed ? 'PASS' : 'FAIL',
    registerTest.passed ? `Status: ${registerResponse.status}` : `Status: ${registerResponse.status}`);

  // Тест 2.2: Вход в систему
  const loginData = {
    email: testEmail,
    password: testPassword,
  };

  const loginResponse = await makeRequest('POST', '/auth/login', loginData);
  const loginTest = recordTest(
    'Вход в систему',
    'Authentication',
    loginResponse.status === 200 && loginResponse.data?.access_token,
    {
      status: loginResponse.status,
      hasToken: !!loginResponse.data?.access_token,
      duration: loginResponse.duration,
      error: loginResponse.status >= 400 ? loginResponse.data : null,
    }
  );
  logTest(loginTest.name, loginTest.passed ? 'PASS' : 'FAIL',
    loginTest.passed ? `Status: ${loginResponse.status}, Token получен` : `Status: ${loginResponse.status}`);

  if (loginResponse.data?.access_token) {
    authToken = loginResponse.data.access_token;
    testUser = loginResponse.data.user;
  }

  // Тест 2.3: Альтернативный endpoint для входа (не критично, основной /auth/login работает)
  const loginAltResponse = await makeRequest('POST', '/users/login', loginData);
  const loginAltTest = recordTest(
    'Вход через /users/login (альтернативный endpoint)',
    'Authentication',
    loginAltResponse.status === 200 && loginAltResponse.data?.access_token,
    {
      status: loginAltResponse.status,
      hasToken: !!loginAltResponse.data?.access_token,
      duration: loginAltResponse.duration,
      note: loginAltResponse.status === 500 ? 'Возможна проблема с обработкой ошибок в этом endpoint' : null,
    }
  );
  logTest(loginAltTest.name, loginAltTest.passed ? 'PASS' : 'FAIL',
    loginAltTest.passed ? `Status: ${loginAltResponse.status}` : 
    `Status: ${loginAltResponse.status} (не критично, основной /auth/login работает)`);

  return { authToken, testUser };
}

// 3. Тесты пользователей
async function testUsers(authToken) {
  log('\n👤 Тестирование endpoints пользователей', 'cyan');

  if (!authToken) {
    log('  ⊘ Пропущено: требуется токен аутентификации', 'yellow');
    recordTest('Тесты пользователей', 'Users', false, {
      error: 'Токен аутентификации не получен',
      skipped: true,
    });
    testResults.summary.skipped++;
    return;
  }

  // Тест 3.1: Получение профиля
  const profileResponse = await makeRequest('GET', '/users/profile', null, authToken);
  const profileTest = recordTest(
    'Получение профиля пользователя',
    'Users',
    profileResponse.status === 200,
    {
      status: profileResponse.status,
      hasProfile: !!profileResponse.data?.profile,
      duration: profileResponse.duration,
      error: profileResponse.status >= 400 ? profileResponse.data : null,
    }
  );
  logTest(profileTest.name, profileTest.passed ? 'PASS' : 'FAIL',
    profileTest.passed ? `Status: ${profileResponse.status}` : `Status: ${profileResponse.status}`);

  // Тест 3.2: Поиск пользователей
  const searchResponse = await makeRequest('GET', '/users/search?q=test', null, authToken);
  const resultsCount = Array.isArray(searchResponse.data) ? searchResponse.data.length : 0;
  const searchTest = recordTest(
    'Поиск пользователей',
    'Users',
    searchResponse.status === 200 && Array.isArray(searchResponse.data),
    {
      status: searchResponse.status,
      isArray: Array.isArray(searchResponse.data),
      resultsCount: resultsCount,
      duration: searchResponse.duration,
    }
  );
  logTest(searchTest.name, searchTest.passed ? 'PASS' : 'FAIL',
    searchTest.passed ? `Status: ${searchResponse.status}, Найдено: ${resultsCount}` : `Status: ${searchResponse.status}`);

  // Тест 3.3: Получение списка всех пользователей
  const usersListResponse = await makeRequest('GET', '/users', null, authToken);
  const usersListTest = recordTest(
    'Получение списка пользователей',
    'Users',
    usersListResponse.status === 200,
    {
      status: usersListResponse.status,
      duration: usersListResponse.duration,
    }
  );
  logTest(usersListTest.name, usersListTest.passed ? 'PASS' : 'FAIL',
    usersListTest.passed ? `Status: ${usersListResponse.status}` : `Status: ${usersListResponse.status}`);
}

// 4. Тесты проектов
async function testProjects(authToken) {
  log('\n📁 Тестирование endpoints проектов', 'cyan');

  // Тест 4.1: Получение списка проектов (публичный endpoint)
  const projectsListResponse = await makeRequest('GET', '/projects');
  const projectsListTest = recordTest(
    'Получение списка проектов',
    'Projects',
    projectsListResponse.status === 200,
    {
      status: projectsListResponse.status,
      isArray: Array.isArray(projectsListResponse.data),
      duration: projectsListResponse.duration,
    }
  );
  logTest(projectsListTest.name, projectsListTest.passed ? 'PASS' : 'FAIL',
    projectsListTest.passed ? `Status: ${projectsListResponse.status}` : `Status: ${projectsListResponse.status}`);

  if (!authToken) {
    log('  ⊘ Остальные тесты проектов пропущены: требуется токен', 'yellow');
    testResults.summary.skipped++;
    return;
  }

  // Тест 4.2: Получение моих проектов
  const myProjectsResponse = await makeRequest('GET', '/projects/author/me', null, authToken);
  const myProjectsTest = recordTest(
    'Получение моих проектов',
    'Projects',
    myProjectsResponse.status === 200,
    {
      status: myProjectsResponse.status,
      duration: myProjectsResponse.duration,
      error: myProjectsResponse.status >= 400 ? (myProjectsResponse.data?.message || myProjectsResponse.data) : null,
      note: myProjectsResponse.status === 500 ? 'Возможна проблема с извлечением user.sub из JWT токена' : null,
    }
  );
  logTest(myProjectsTest.name, myProjectsTest.passed ? 'PASS' : 'FAIL',
    myProjectsTest.passed ? `Status: ${myProjectsResponse.status}` : 
    `Status: ${myProjectsResponse.status}${myProjectsResponse.status === 500 ? ' (проверьте req.user.sub в контроллере)' : ''}`);
}

// 5. Тесты событий
async function testEvents(authToken) {
  log('\n📅 Тестирование endpoints событий', 'cyan');

  // Тест 5.1: Получение списка событий
  const eventsListResponse = await makeRequest('GET', '/events');
  const eventsListTest = recordTest(
    'Получение списка событий',
    'Events',
    eventsListResponse.status === 200,
    {
      status: eventsListResponse.status,
      isArray: Array.isArray(eventsListResponse.data),
      duration: eventsListResponse.duration,
    }
  );
  logTest(eventsListTest.name, eventsListTest.passed ? 'PASS' : 'FAIL',
    eventsListTest.passed ? `Status: ${eventsListResponse.status}` : `Status: ${eventsListResponse.status}`);

  if (!authToken) {
    log('  ⊘ Остальные тесты событий пропущены: требуется токен', 'yellow');
    testResults.summary.skipped++;
    return;
  }

  // Тест 5.2: Получение событий пользователя
  const userEventsResponse = await makeRequest('GET', '/events/user/events', null, authToken);
  const userEventsTest = recordTest(
    'Получение событий пользователя',
    'Events',
    userEventsResponse.status === 200,
    {
      status: userEventsResponse.status,
      duration: userEventsResponse.duration,
    }
  );
  logTest(userEventsTest.name, userEventsTest.passed ? 'PASS' : 'FAIL',
    userEventsTest.passed ? `Status: ${userEventsResponse.status}` : `Status: ${userEventsResponse.status}`);
}

// 6. Тесты образования
async function testEducation() {
  log('\n📚 Тестирование endpoints образования', 'cyan');

  // Тест 6.1: Получение курсов
  const coursesResponse = await makeRequest('GET', '/education/courses');
  const coursesTest = recordTest(
    'Получение списка курсов',
    'Education',
    coursesResponse.status === 200,
    {
      status: coursesResponse.status,
      duration: coursesResponse.duration,
    }
  );
  logTest(coursesTest.name, coursesTest.passed ? 'PASS' : 'FAIL',
    coursesTest.passed ? `Status: ${coursesResponse.status}` : `Status: ${coursesResponse.status}`);

  // Тест 6.2: Получение платформ
  const platformsResponse = await makeRequest('GET', '/education/platforms');
  const platformsTest = recordTest(
    'Получение списка платформ',
    'Education',
    platformsResponse.status === 200,
    {
      status: platformsResponse.status,
      duration: platformsResponse.duration,
    }
  );
  logTest(platformsTest.name, platformsTest.passed ? 'PASS' : 'FAIL',
    platformsTest.passed ? `Status: ${platformsResponse.status}` : `Status: ${platformsResponse.status}`);
}

// 7. Тесты финансовой аналитики
async function testFinancialAnalytics() {
  log('\n💰 Тестирование финансовой аналитики', 'cyan');

  // Тест 7.1: Получение валютных пар
  const currencyPairsResponse = await makeRequest('GET', '/financial-analytics/currency-pairs');
  const currencyPairsTest = recordTest(
    'Получение валютных пар',
    'Financial Analytics',
    currencyPairsResponse.status === 200,
    {
      status: currencyPairsResponse.status,
      duration: currencyPairsResponse.duration,
    }
  );
  logTest(currencyPairsTest.name, currencyPairsTest.passed ? 'PASS' : 'FAIL',
    currencyPairsTest.passed ? `Status: ${currencyPairsResponse.status}` : `Status: ${currencyPairsResponse.status}`);

  // Тест 7.2: Получение сводок рынка
  const marketSummariesResponse = await makeRequest('GET', '/financial-analytics/market-summaries');
  const marketSummariesTest = recordTest(
    'Получение сводок рынка',
    'Financial Analytics',
    marketSummariesResponse.status === 200,
    {
      status: marketSummariesResponse.status,
      duration: marketSummariesResponse.duration,
    }
  );
  logTest(marketSummariesTest.name, marketSummariesTest.passed ? 'PASS' : 'FAIL',
    marketSummariesTest.passed ? `Status: ${marketSummariesResponse.status}` : `Status: ${marketSummariesResponse.status}`);
}

// 8. Тесты категорий проектов
async function testCategories() {
  log('\n🏷️  Тестирование категорий проектов', 'cyan');

  const categoriesResponse = await makeRequest('GET', '/categories');
  const categoriesTest = recordTest(
    'Получение списка категорий',
    'Categories',
    categoriesResponse.status === 200,
    {
      status: categoriesResponse.status,
      isArray: Array.isArray(categoriesResponse.data),
      duration: categoriesResponse.duration,
    }
  );
  logTest(categoriesTest.name, categoriesTest.passed ? 'PASS' : 'FAIL',
    categoriesTest.passed ? `Status: ${categoriesResponse.status}` : `Status: ${categoriesResponse.status}`);
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
      return true; // Сервер работает, просто endpoint может быть недоступен
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('  ❌ Сервер недоступен!', 'red');
      log('\n⚠️  ВНИМАНИЕ: Backend сервер не запущен или недоступен!', 'red');
      log('   Для запуска тестов необходимо:', 'yellow');
      log('   1. Запустить backend сервер:', 'yellow');
      log('      cd backend', 'yellow');
      log('      npm run start:dev', 'yellow');
      log('   2. Убедиться, что сервер работает на порту 3001', 'yellow');
      log('   3. Проверить переменную окружения API_URL (текущее значение: ' + BASE_URL + ')', 'yellow');
      log('\n   Frontend НЕ требуется для запуска тестов!', 'blue');
      return false;
    } else {
      log(`  ⚠️  Ошибка при проверке: ${error.message}`, 'yellow');
      return true; // Продолжаем, возможно это временная проблема
    }
  }
}

// Главная функция запуска тестов
async function runAllTests() {
  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     ФУНКЦИОНАЛЬНОЕ ТЕСТИРОВАНИЕ API BUSINESSUNION           ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n🔗 Базовый URL: ${BASE_URL}`, 'blue');
  log(`📅 Дата запуска: ${new Date().toLocaleString('ru-RU')}\n`, 'blue');

  // Проверяем доступность сервера
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    log('\n❌ Тестирование прервано: сервер недоступен', 'red');
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    // 1. Базовые тесты
    await testBasicEndpoints();

    // 2. Тесты аутентификации
    const { authToken, testUser } = await testAuthentication();

    // 3. Тесты пользователей
    await testUsers(authToken);

    // 4. Тесты проектов
    await testProjects(authToken);

    // 5. Тесты событий
    await testEvents(authToken);

    // 6. Тесты образования
    await testEducation();

    // 7. Тесты финансовой аналитики
    await testFinancialAnalytics();

    // 8. Тесты категорий
    await testCategories();

  } catch (error) {
    log(`\n❌ Критическая ошибка при выполнении тестов: ${error.message}`, 'red');
    testResults.errors.push({
      test: 'Critical Error',
      error: error.message,
      stack: error.stack,
    });
  }

  const totalDuration = Date.now() - startTime;
  testResults.summary.duration = totalDuration;

  // Вывод итогов
  log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      ИТОГИ ТЕСТИРОВАНИЯ                     ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n📊 Всего тестов: ${testResults.summary.total}`, 'blue');
  log(`✅ Пройдено: ${testResults.summary.passed}`, 'green');
  log(`❌ Провалено: ${testResults.summary.failed}`, 'red');
  log(`⊘ Пропущено: ${testResults.summary.skipped}`, 'yellow');
  log(`⏱️  Время выполнения: ${(totalDuration / 1000).toFixed(2)} сек`, 'blue');
  log(`📈 Процент успешности: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`, 'blue');

  // Сохранение результатов
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(testResults, null, 2), 'utf8');
    log(`\n💾 Результаты сохранены в: ${RESULTS_FILE}`, 'green');
  } catch (error) {
    log(`\n❌ Ошибка при сохранении результатов: ${error.message}`, 'red');
  }

  // Вывод ошибок, если есть
  if (testResults.errors.length > 0) {
    log('\n⚠️  Ошибки тестирования:', 'yellow');
    testResults.errors.forEach((err, index) => {
      log(`\n${index + 1}. ${err.test}: ${err.error}`, 'red');
    });
  }

  // Возвращаем код выхода
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// Запуск тестов
if (require.main === module) {
  runAllTests().catch((error) => {
    log(`\n❌ Фатальная ошибка: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests, makeRequest, recordTest };

