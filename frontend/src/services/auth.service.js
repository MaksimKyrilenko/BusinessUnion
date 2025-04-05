import axios from 'axios';

const API_URL = '/api';

export default {
  async login(email, password, userType) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
      userType
    });
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userType', response.data.user.userType);
    }
    return response.data;
  },

  async register(userData) {
    try {
      console.log('Отправляемые данные:', userData);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Ответ сервера:', response.data);
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userType', response.data.user.userType);
      }
      return response.data;
    } catch (error) {
      console.error('Детали ошибки регистрации:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        stack: error.stack
      });
      
      // Добавляем проверку на наличие ответа от сервера
      if (error.response) {
        console.error('Ответ сервера с ошибкой:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Запрос был сделан, но ответ не получен:', error.request);
      } else {
        console.error('Ошибка при настройке запроса:', error.message);
      }
      
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
}; 