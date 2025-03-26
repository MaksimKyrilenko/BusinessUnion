import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Это правильно, оставляем как есть
  headers: {
    'Content-Type': 'application/json',  // Стандартный тип содержимого для REST API
  },
});

// Добавляем интерцептор запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
