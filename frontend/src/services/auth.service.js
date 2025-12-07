import axios from 'axios';

const API_URL = '/api';

export default {
  async login(email, password, userType) {
    try {
      console.log('Отправка запроса на вход с email:', email);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        userType
      });
      
      console.log('Ответ сервера при входе:', response.data);
      
      // Поддержка обоих форматов токена
      const token = response.data.access_token || response.data.token;
      
      if (token && response.data.user) {
        console.log('Успешный вход, сохраняем данные пользователя');
        
        localStorage.setItem('token', token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userType', response.data.user.userType);
        
        // Преобразуем формат ответа для сохранения совместимости
        return {
          token: token,
          user: response.data.user
        };
      } else {
        console.error('Неверный формат ответа от сервера:', response.data);
        throw new Error('Сервер вернул неверный формат данных');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('Отправляемые данные:', userData);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Ответ сервера:', response.data);
      
      // Проверяем наличие токена в обоих возможных форматах (token или access_token)
      const token = response.data.access_token || response.data.token;
      
      if (token && response.data.user) {
        console.log('Обработка успешного ответа сервера при регистрации:', {
          hasToken: !!token,
          tokenField: response.data.access_token ? 'access_token' : 'token',
          userId: response.data.user.id,
          userType: response.data.user.userType
        });
        
        localStorage.setItem('token', token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userType', response.data.user.userType);
        
        // Преобразуем ответ сервера в единый формат для клиента
        return {
          token: token, // Клиент ожидает поле token
          user: response.data.user
        };
      } else {
        console.error('Неверный формат ответа сервера:', response.data);
        throw new Error('Сервер вернул неверный формат данных');
      }
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