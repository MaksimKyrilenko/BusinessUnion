import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: '/api',  // Это правильно, оставляем как есть
  headers: {
    'Content-Type': 'application/json',  // Стандартный тип содержимого для REST API
  },
});

// Добавляем интерцептор запросов
api.interceptors.request.use(
  (config) => {
    // Получаем свежий токен из localStorage при каждом запросе
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    // Логируем информацию о запросе для отладки
    console.log(`API Запрос: ${config.method.toUpperCase()} ${config.url}`, {
      token: token ? 'Присутствует' : 'Отсутствует',
      userId: userId || 'Отсутствует',
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

// Добавляем интерцептор ответов
api.interceptors.response.use(
  (response) => {
    console.log(`API Ответ: ${response.status} от ${response.config.url}`);
    return response;
  },
  (error) => {
    // Логируем подробную информацию об ошибке
    console.error('API Ошибка:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers ? {
        Authorization: error.config.headers.Authorization ? 'Bearer xx...' : 'Отсутствует'
      } : 'Нет заголовков'
    });
    
    // Обрабатываем ошибки авторизации
    if (error.response && error.response.status === 401) {
      console.log('Сессия истекла или токен недействителен, выполняем выход');
      
      // Проверяем, не находимся ли мы уже на странице логина
      if (window.location.pathname !== '/login') {
        console.log('Перенаправляем на страницу входа...');
        
        // Очищаем данные авторизации
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        
        // Используем простое перенаправление, а не router
        // Это более надежно в контексте интерцептора
        window.location.href = '/login';
      } else {
        console.log('Уже находимся на странице входа, пропускаем перенаправление');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
