import axios from 'axios';
import authHeader from './auth-header';

// Используем относительный путь - nginx проксирует /api на backend
const API_URL = '/api';

class ProjectsService {
  // Методы для работы с проектами
  async getAllProjects(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Добавляем фильтры в параметры запроса
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.category) params.append('categoryId', filters.category);
      if (filters.minInvestment) params.append('minInvestment', filters.minInvestment);
      if (filters.maxInvestment) params.append('maxInvestment', filters.maxInvestment);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(`${API_URL}/projects`, { 
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении проектов:', error.response || error);
      throw error;
    }
  }

  async getProjectById(id) {
    try {
      // Проверяем валидность ID
      if (!id || isNaN(Number(id))) {
        throw new Error('Недопустимый ID проекта');
      }
      
      const response = await axios.get(`${API_URL}/projects/${id}`, { 
        headers: authHeader() 
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении проекта:', error.response || error);
      throw error;
    }
  }

  async getMyProjects() {
    try {
      // Используем эндпоинт для получения проектов по ID автора
      const response = await axios.get(`${API_URL}/projects/author/me`, { 
        headers: authHeader() 
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении моих проектов:', error.response || error);
      throw error;
    }
  }

  async getProjectsWhereIAmMember() {
    try {
      const response = await axios.get(`${API_URL}/projects/team/me`, { 
        headers: authHeader() 
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении проектов, где я участник:', error.response || error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      const headers = authHeader();
      console.log('Отправка запроса с заголовками:', headers);
      console.log('Данные проекта:', projectData);
      
      // Преобразуем числовые поля и подготавливаем структуру данных
      const formattedData = {
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        stage: projectData.stage,
        investmentNeeded: Number(projectData.investmentNeeded),
        minInvestment: Number(projectData.minInvestment),
        expectedRoi: Number(projectData.expectedRoi),
        location: projectData.location,
        additionalInfo: projectData.additionalInfo
      };

      // Добавляем изображение (URL из MinIO)
      if (projectData.image) {
        formattedData.image = projectData.image;
        console.log('Добавлено изображение:', projectData.image);
      }

      // Добавляем URL файлов из MinIO, если они есть
      if (projectData.businessPlanUrl) {
        formattedData.businessPlanUrl = projectData.businessPlanUrl;
        console.log('Добавлен бизнес-план:', projectData.businessPlanUrl);
      }
      if (projectData.presentationUrl) {
        formattedData.presentationUrl = projectData.presentationUrl;
        console.log('Добавлена презентация:', projectData.presentationUrl);
      }

      console.log('Форматированные данные:', formattedData);
      
      const response = await axios.post(`${API_URL}/projects`, formattedData, {
        headers: headers
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании проекта:', error.response || error);
      throw error;
    }
  }

  async updateProject(id, projectData) {
    try {
      // Преобразуем числовые поля и подготавливаем структуру данных
      const formattedData = {
        ...projectData,
        investmentNeeded: Number(projectData.investmentNeeded),
        minInvestment: Number(projectData.minInvestment),
        expectedRoi: Number(projectData.expectedRoi)
      };
      
      // Убедимся, что category - объект с id
      if (typeof formattedData.category !== 'object') {
        formattedData.category = {
          id: Number(formattedData.category)
        };
      } else if (typeof formattedData.category.id !== 'number') {
        formattedData.category.id = Number(formattedData.category.id);
      }

      // Сохраняем изображение, если оно есть (может быть base64 или URL)
      if (projectData.image) {
        formattedData.image = projectData.image;
        console.log('Добавлено изображение для обновления, длина:', projectData.image.length);
      }

      // Добавляем URL файлов из MinIO, если они есть
      if (projectData.businessPlanUrl) {
        formattedData.businessPlanUrl = projectData.businessPlanUrl;
        console.log('Добавлен бизнес-план:', projectData.businessPlanUrl);
      }
      if (projectData.presentationUrl) {
        formattedData.presentationUrl = projectData.presentationUrl;
        console.log('Добавлена презентация:', projectData.presentationUrl);
      }
      
      console.log('Обновление проекта:', id, formattedData);
      
      const response = await axios.patch(`${API_URL}/projects/${id}`, formattedData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении проекта:', error.response || error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      const response = await axios.delete(`${API_URL}/projects/${id}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error.response || error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий:', error.response || error);
      throw error;
    }
  }

  async uploadProjectFiles(projectId, formData) {
    try {
      console.log(`Загрузка файлов для проекта ${projectId}:`, formData);
      
      // Проверяем содержимое FormData для отладки
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      // Для FormData необходимо удалить Content-Type, чтобы браузер мог установить правильный boundary
      const headers = { ...authHeader() };
      delete headers['Content-Type'];
      
      // Добавляем заголовок для multipart/form-data
      headers['Accept'] = 'application/json';
      
      const response = await axios.post(`${API_URL}/projects/${projectId}/files`, formData, {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error.response || error);
      // Если эндпоинт не существует или произошла ошибка сервера, просто логируем ошибку
      if (error.response && (error.response.status === 404 || error.response.status === 500)) {
        console.warn('Ошибка при загрузке файлов, пропускаем:', error.response.data);
        return { success: false, message: 'Загрузка файлов не удалась' };
      }
      throw error;
    }
  }

  // Методы для работы с командой проекта

  async getTeamMembers(projectId) {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}/team`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении участников команды:', error.response || error);
      throw error;
    }
  }

  async addTeamMember(projectId, userId) {
    try {
      const response = await axios.post(`${API_URL}/projects/${projectId}/team`, {
        userId: userId
      }, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при добавлении участника команды:', error.response || error);
      throw error;
    }
  }

  async updateTeamMemberRole(projectId, userId, role) {
    try {
      const response = await axios.patch(`${API_URL}/projects/${projectId}/team/${userId}/role`, {
        role: role
      }, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении роли участника:', error.response || error);
      throw error;
    }
  }

  async removeTeamMember(projectId, userId) {
    try {
      const response = await axios.delete(`${API_URL}/projects/${projectId}/team/${userId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении участника команды:', error.response || error);
      throw error;
    }
  }

  async getTeamChat(projectId) {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}/team/chat`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении командного чата:', error.response || error);
      throw error;
    }
  }

  async getProjectTasks(projectId) {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении задач проекта:', error.response || error);
      throw error;
    }
  }

  async createProjectTask(projectId, taskData) {
    try {
      const response = await axios.post(`${API_URL}/projects/${projectId}/tasks`, taskData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании задачи:', error.response || error);
      throw error;
    }
  }

  async updateProjectTask(projectId, taskId, taskData) {
    try {
      const response = await axios.patch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, taskData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error.response || error);
      throw error;
    }
  }

  async deleteProjectTask(projectId, taskId) {
    try {
      const response = await axios.delete(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error.response || error);
      throw error;
    }
  }

  async analyzeStartup(projectId) {
    try {
      const response = await axios.post(`${API_URL}/projects/${projectId}/analyze`, {}, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при анализе стартапа:', error.response || error);
      throw error;
    }
  }
}

export const projectsService = new ProjectsService();