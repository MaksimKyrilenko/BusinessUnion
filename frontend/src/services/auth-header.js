/**
 * Функция для формирования авторизационных заголовков HTTP-запросов
 * Используется сервисами для добавления токена JWT в запросы к API
 * 
 * @returns {Object} Объект с заголовками авторизации или пустой объект, если токен не найден
 */
export default function authHeader() {
  // Получаем данные пользователя из localStorage
  const userStr = localStorage.getItem('user');
  let user = null;
  
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Ошибка при парсинге данных пользователя:', e);
    localStorage.removeItem('user');
    return { 'Content-Type': 'application/json' };
  }
  
  // Проверяем наличие токена из разных возможных источников
  if (user && user.accessToken) {
    return { 
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json'
    };
  } else if (localStorage.getItem('token')) {
    // Альтернативная проверка, если токен хранится отдельно
    return { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
  } else {
    return { 'Content-Type': 'application/json' };
  }
} 