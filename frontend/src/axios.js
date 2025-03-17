import axios from 'axios';
import router from './router'; // Импортируем роутер напрямую

const api = axios.create({
  baseURL: '/api',  // Это правильно, оставляем как есть
  headers: {
    'Content-Type': 'application/json',  // Стандартный тип содержимого для REST API
  },
});

// Проверка валидности токена
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Добавляем интерцептор запросов для автоматической подстановки токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
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
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
