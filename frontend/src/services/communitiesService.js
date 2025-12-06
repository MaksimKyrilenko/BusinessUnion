import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3001';

class CommunitiesService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/communities`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен авторизации к каждому запросу
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      console.log('CommunitiesService: Adding token to request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      });
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Добавляем обработку ошибок
    this.api.interceptors.response.use(
      (response) => {
        console.log('CommunitiesService: Response received:', {
          url: response.config.url,
          status: response.status,
          statusText: response.statusText
        });
        return response;
      },
      (error) => {
        console.log('CommunitiesService: Error response:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          console.log('CommunitiesService: 401 Unauthorized, redirecting to login');
          // Перенаправляем на страницу входа при ошибке авторизации
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Получить все сообщества
  async getCommunities() {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении сообществ:', error);
      throw error;
    }
  }

  // Получить сообщества пользователя
  async getUserCommunities() {
    try {
      const response = await this.api.get('/my');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении сообществ пользователя:', error);
      throw error;
    }
  }

  // Получить сообщество по ID
  async getCommunity(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении сообщества:', error);
      throw error;
    }
  }

  // Создать сообщество
  async createCommunity(communityData) {
    try {
      const response = await this.api.post('/', communityData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании сообщества:', error);
      throw error;
    }
  }

  // Обновить сообщество
  async updateCommunity(id, communityData) {
    try {
      const response = await this.api.patch(`/${id}`, communityData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении сообщества:', error);
      throw error;
    }
  }

  // Удалить сообщество
  async deleteCommunity(id) {
    try {
      const response = await this.api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении сообщества:', error);
      throw error;
    }
  }

  // Присоединиться к сообществу
  async joinCommunity(id) {
    try {
      const response = await this.api.post(`/${id}/join`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при присоединении к сообществу:', error);
      throw error;
    }
  }

  // Покинуть сообщество
  async leaveCommunity(id) {
    try {
      const response = await this.api.post(`/${id}/leave`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при выходе из сообщества:', error);
      throw error;
    }
  }

  // Получить посты сообщества
  async getCommunityPosts(id) {
    try {
      const response = await this.api.get(`/${id}/posts`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении постов сообщества:', error);
      throw error;
    }
  }

  // Загрузить изображение
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/files/upload/image`, formData, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw error;
    }
  }

  // Создать пост в сообществе
  async createPost(communityId, postData) {
    try {
      const response = await this.api.post(`/${communityId}/posts`, postData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      throw error;
    }
  }

  // Получить категории
  async getCategories() {
    try {
      const response = await this.api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      throw error;
    }
  }

  // Переключить реакцию на пост (лайк)
  async togglePostReaction(postId) {
    try {
      const response = await this.api.post(`/posts/${postId}/reaction`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при лайке поста:', error);
      throw error;
    }
  }

  // Увеличить счётчик просмотров поста
  async incrementPostViews(postId) {
    try {
      const response = await this.api.post(`/posts/${postId}/view`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при увеличении просмотров:', error);
      throw error;
    }
  }
}

export default new CommunitiesService();
