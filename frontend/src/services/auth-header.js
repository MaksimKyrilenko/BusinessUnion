/**
 * Функция для формирования авторизационных заголовков HTTP-запросов
 * Используется сервисами для добавления токена JWT в запросы к API
 * 
 * @returns {Object} Объект с заголовками авторизации или пустой объект, если токен не найден
 */
export default function authHeader() {
  // Получаем токен из localStorage
  const token = localStorage.getItem('token');
  
  // Возвращаем заголовок с токеном, если он есть
  if (token) {
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    // Возвращаем только заголовок Content-Type, если токен отсутствует
    return { 
      'Content-Type': 'application/json' 
    };
  }
} 