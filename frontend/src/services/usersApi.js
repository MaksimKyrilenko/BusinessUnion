import api from '@/axios';

// Временный кэш для хранения данных пользователей
let usersCache = {};

const usersApiService = {
  // Получение данных пользователя по ID
  async getUserById(userId) {
    try {
      // Проверяем кэш
      if (usersCache[userId]) {
        return usersCache[userId];
      }
      
      // Запрос к API
      const response = await api.get(`/users/${userId}`);
      const userData = response.data;
      
      // Сохраняем в кэш
      usersCache[userId] = userData;
      
      return userData;
    } catch (error) {
      console.error(`Ошибка при получении данных пользователя ID ${userId}:`, error);
      
      // Временное решение для демонстрации без рабочего бэкенда
      // Возвращаем заглушку с ID и случайно сгенерированным именем
      if (!usersCache[userId]) {
        const firstNames = ['Александр', 'Елена', 'Иван', 'Ольга', 'Сергей', 'Мария', 'Дмитрий', 'Анна'];
        const lastNames = ['Иванов', 'Смирнова', 'Петров', 'Кузнецова', 'Соколов', 'Попова', 'Лебедев', 'Новикова'];
        
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const fallbackUser = {
          id: userId,
          firstName: randomFirstName,
          lastName: randomLastName,
          email: `user${userId}@example.com`
        };
        
        usersCache[userId] = fallbackUser;
        return fallbackUser;
      }
      
      return usersCache[userId];
    }
  },
  
  // Получение всех пользователей
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка пользователей:', error);
      return [];
    }
  },
  
  // Поиск пользователей
  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
      return [];
    }
  },
  
  // Очистка кэша (например, при выходе из системы)
  clearCache() {
    usersCache = {};
  }
};

export default usersApiService; 