import { defineStore } from 'pinia'
import api from '@/axios'
import router from '@/router'
import websocketService from '@/services/websocket.service'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    userRole: (state) => state.user?.role || '',
    userName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    userAvatar: (state) => state.user?.avatar || '',
    userId: (state) => state.user?.id || null
  },

  actions: {
    hasRole(role) {
      return this.user?.userType === role;
    },

    async loadUser() {
      if (this.loading) return false;
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.clearUserData();
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        console.log('Загрузка профиля пользователя из API...');
        const response = await api.get('/users/profile');
        
        if (!response.data || !response.data.id) {
          console.error('Ответ API не содержит данных пользователя или ID отсутствует:', response.data);
          this.clearUserData();
          return false;
        }
        
        // Преобразуем ID в число для уверенности
        let userId;
        try {
          userId = parseInt(String(response.data.id).trim(), 10);
          if (isNaN(userId)) {
            console.error(`Некорректный ID пользователя в ответе API: ${response.data.id}`);
            this.clearUserData();
            return false;
          }
          // Обновляем ID в объекте пользователя
          response.data.id = userId;
          console.log(`ID пользователя преобразован в число: ${userId}`);
        } catch (error) {
          console.error('Ошибка при обработке ID пользователя:', error);
          this.clearUserData();
          return false;
        }
        
        this.user = response.data;
        this.isAuthenticated = true;
        
        // Обновляем данные в localStorage
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('userType', this.user.userType);
        
        console.log('Профиль пользователя успешно загружен:', {
          id: userId,
          userType: this.user.userType,
          name: `${this.user.firstName} ${this.user.lastName}`
        });
        
        return true;
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        // В случае ошибки очищаем данные пользователя
        this.clearUserData();
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      try {
        console.log('Вход пользователя с email:', email);
        
        // Сначала очищаем данные предыдущей сессии
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        
        // Отправляем запрос без указания типа пользователя
        const response = await api.post('/auth/login', { email, password });
        console.log('Получен ответ от сервера:', {
          status: response.status,
          hasToken: !!response.data.access_token,
          hasUserId: !!response.data.user?.id
        });
        
        if (response.data.access_token && response.data.user && response.data.user.id) {
          const token = response.data.access_token;
          const userId = response.data.user.id.toString();
          const userType = response.data.user.userType;
          
          // Сохраняем в localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);
          localStorage.setItem('userType', userType);
          
          console.log('Сохранены данные пользователя:', {
            userId: userId,
            userType: userType,
            tokenExists: !!token
          });
          
          // Подключаем WebSocket сразу после успешного логина
          console.log('Инициализация WebSocket после логина...');
          websocketService.connect();
          
          router.push('/dashboard');
          return { success: true };
        } else {
          console.error('Не получены необходимые данные пользователя от сервера');
          return { success: false, message: 'Не удалось получить данные пользователя' };
        }
      } catch (error) {
        console.error('Ошибка при входе:', error.response?.data || error.message);
        let message = 'Ошибка при входе';
        
        if (error.response) {
          message = error.response.data.message || message;
        }
        
        return { success: false, message: message };
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/register', userData);
        const { token, user } = response.data;

        // Сначала очищаем предыдущие данные
        this.clearUserData();
        
        // Затем устанавливаем новые
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('userType', user.userType);
        
        this.user = user;
        this.isAuthenticated = true;
        
        // Подключаем WebSocket после успешной регистрации
        console.log('Инициализация WebSocket после регистрации...');
        websocketService.connect();

        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при регистрации';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(profileData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put('/users/profile', profileData);
        this.user = response.data;
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении профиля';
        return false;
      } finally {
        this.loading = false;
      }
    },

    clearUserData() {
      console.log('Очистка данных пользователя...');
      
      // Очищаем данные в store
      this.user = null;
      this.isAuthenticated = false;
      
      // Очищаем localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      
      console.log('Данные пользователя полностью очищены');
    },

    async logout() {
      try {
        console.log('Выполняем выход из системы...');
        
        // Отключаем WebSocket при выходе
        websocketService.disconnect();
        
        // Запоминаем состояние до выхода
        const wasAuthenticated = this.isAuthenticated;
        
        // Используем существующий метод для очистки данных
        this.clearUserData();
        
        // Проверяем, нужно ли перенаправлять
        if (wasAuthenticated) {
          console.log('Выполняем перенаправление на страницу входа...');
          
          // Используем короткий таймаут перед перенаправлением
          // чтобы дать Vue время обработать изменения состояния
          setTimeout(() => {
            // Используем жесткое перенаправление через window.location 
            // вместо router.push для полного перезапуска приложения
            window.location.href = '/';
          }, 0);
        }
        
        return { success: true };
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
        
        // В случае ошибки всё равно выполняем перенаправление
        window.location.href = '/login';
        return { success: false, message: 'Произошла ошибка при выходе' };
      }
    }
  }
}) 