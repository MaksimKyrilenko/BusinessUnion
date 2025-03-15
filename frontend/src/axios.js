import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Базовый URL для всех запросов
  headers: {
    'Content-Type': 'application/json',  // Стандартный тип содержимого для REST API
  },
});

// Добавляем интерцептор запросов для автоматической подстановки токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Подстановка токена в заголовки
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);  // Обработка ошибок запроса
  }
);

// Добавляем интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response;  // Успешные ответы просто возвращаем
  },
  (error) => {
    // Можно добавить глобальную обработку ошибок, например:
    if (error.response && error.response.status === 401) {
      // 401 - Ошибка авторизации (например, если токен истек)
      console.error('Токен недействителен или истек. Пожалуйста, войдите снова.');
    }
    return Promise.reject(error);  // Передаем ошибку дальше
  }
);

export default api;
