import api from '@/axios';

// Локальное хранилище для событий (временное решение, пока API не будет полностью готов)
let localEvents = JSON.parse(localStorage.getItem('events') || '[]');

// Флаг для определения, использовать ли API или локальное хранилище
const useApi = false; // Установите в true, когда API будет полностью готов

const eventsApiService = {
  // Получение всех событий
  async getEvents() {
    try {
      if (useApi) {
        // Используем API
        const response = await api.get('/api/events');
        return response.data;
      } else {
        // Временное решение - используем локальное хранилище
        return localEvents;
      }
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
      throw error;
    }
  },
  
  // Получение событий текущего пользователя
  async getUserEvents() {
    try {
      if (useApi) {
        // Используем API
        const response = await api.get('/api/events/user/events');
        return response.data;
      } else {
        // Временное решение - фильтруем локальное хранилище
        const userId = localStorage.getItem('userId');
        return localEvents.filter(event => 
          event.createdBy === userId || 
          (event.participants && event.participants.includes(userId))
        );
      }
    } catch (error) {
      console.error('Ошибка при получении событий пользователя:', error);
      throw error;
    }
  },
  
  // Создание нового события
  async createEvent(eventData) {
    try {
      if (useApi) {
        // Используем API
        const response = await api.post('/api/events', eventData);
        return response.data;
      } else {
        // Временное решение - добавляем в локальное хранилище
        const userId = localStorage.getItem('userId');
        const newEvent = {
          ...eventData,
          id: Date.now(),
          createdBy: userId,
          participants: []
        };
        
        localEvents.push(newEvent);
        localStorage.setItem('events', JSON.stringify(localEvents));
        
        return newEvent;
      }
    } catch (error) {
      console.error('Ошибка при создании события:', error);
      throw error;
    }
  },
  
  // Обновление события
  async updateEvent(eventId, eventData) {
    try {
      if (useApi) {
        // Используем API
        const response = await api.patch(`/api/events/${eventId}`, eventData);
        return response.data;
      } else {
        // Временное решение - обновляем в локальном хранилище
        const index = localEvents.findIndex(event => event.id === eventId);
        
        if (index !== -1) {
          localEvents[index] = { ...localEvents[index], ...eventData };
          localStorage.setItem('events', JSON.stringify(localEvents));
          return localEvents[index];
        }
        
        throw new Error('Событие не найдено');
      }
    } catch (error) {
      console.error('Ошибка при обновлении события:', error);
      throw error;
    }
  },
  
  // Удаление события
  async deleteEvent(eventId) {
    try {
      if (useApi) {
        // Используем API
        await api.delete(`/api/events/${eventId}`);
      } else {
        // Временное решение - удаляем из локального хранилища
        localEvents = localEvents.filter(event => event.id !== eventId);
        localStorage.setItem('events', JSON.stringify(localEvents));
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении события:', error);
      throw error;
    }
  },
  
  // Регистрация на событие
  async registerForEvent(eventId) {
    try {
      if (useApi) {
        // Используем API
        const response = await api.post(`/api/events/${eventId}/register`);
        return response.data;
      } else {
        // Временное решение - обновляем в локальном хранилище
        const userId = localStorage.getItem('userId');
        const index = localEvents.findIndex(event => event.id === eventId);
        
        if (index !== -1 && userId) {
          if (!localEvents[index].participants) {
            localEvents[index].participants = [];
          }
          
          if (!localEvents[index].participants.includes(userId)) {
            localEvents[index].participants.push(userId);
            localStorage.setItem('events', JSON.stringify(localEvents));
          }
          
          return localEvents[index];
        }
        
        throw new Error('Событие не найдено или пользователь не авторизован');
      }
    } catch (error) {
      console.error('Ошибка при регистрации на событие:', error);
      throw error;
    }
  },
  
  // Отмена регистрации на событие
  async cancelRegistration(eventId) {
    try {
      if (useApi) {
        // Используем API
        const response = await api.delete(`/api/events/${eventId}/register`);
        return response.data;
      } else {
        // Временное решение - обновляем в локальном хранилище
        const userId = localStorage.getItem('userId');
        const index = localEvents.findIndex(event => event.id === eventId);
        
        if (index !== -1 && userId && localEvents[index].participants) {
          localEvents[index].participants = localEvents[index].participants.filter(id => id !== userId);
          localStorage.setItem('events', JSON.stringify(localEvents));
          return localEvents[index];
        }
        
        throw new Error('Событие не найдено или пользователь не авторизован');
      }
    } catch (error) {
      console.error('Ошибка при отмене регистрации на событие:', error);
      throw error;
    }
  }
};

export default eventsApiService; 