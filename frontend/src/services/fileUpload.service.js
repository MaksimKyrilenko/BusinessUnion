import axios from '../axios';

const API_URL = '/files';

/**
 * Сервис для загрузки файлов в MinIO
 */
const fileUploadService = {
  /**
   * Загрузить изображение
   * @param {File} file - файл изображения
   * @returns {Promise<{url: string, filename: string}>}
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Загрузить аватар
   * @param {File} file - файл аватара
   * @returns {Promise<{url: string, filename: string}>}
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axios.post(`${API_URL}/upload/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Загрузить файл проекта (бизнес-план, презентация)
   * @param {File} file - файл документа
   * @returns {Promise<{url: string, filename: string}>}
   */
  async uploadProjectFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/upload/project`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Загрузить обычный файл
   * @param {File} file - файл
   * @returns {Promise<{url: string, filename: string}>}
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Удалить файл
   * @param {string} bucket - имя bucket (images, files, avatars, projects)
   * @param {string} filename - имя файла
   */
  async deleteFile(bucket, filename) {
    await axios.delete(`${API_URL}/${bucket}/${filename}`);
  },
};

export default fileUploadService;
