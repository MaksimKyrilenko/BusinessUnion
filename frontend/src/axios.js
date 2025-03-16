import axios from 'axios';
import router from './router'; // Импортируем роутер напрямую

const api = axios.create({
  baseURL: '/api',  // Это правильно, оставляем как есть
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
    if (response.data.user) {
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userType', response.data.user.userType);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
