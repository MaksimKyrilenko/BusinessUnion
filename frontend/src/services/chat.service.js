import axios from 'axios';
import authHeader from './auth-header';

// Используем относительный путь - nginx проксирует /api на backend
const API_URL = '/api';

class ChatService {
  /**
   * Получение списка чатов пользователя
   * @returns {Promise<Array>} Список чатов
   */
  async getUserChats() {
    const response = await axios.get(`${API_URL}/chats`, { headers: authHeader() });
    console.log('Получены чаты пользователя:', response.data);
    return response.data;
  }

  /**
   * Получение сообщений конкретного чата
   * @param {string} chatId ID чата
   * @returns {Promise<Array>} Список сообщений
   */
  async getChatMessages(chatId) {
    const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, { headers: authHeader() });
    console.log(`Получены сообщения чата ${chatId}:`, response.data);
    return response.data;
  }

  /**
   * Отправка сообщения
   * @param {Object} messageData Данные сообщения
   * @param {string} messageData.recipientId ID получателя
   * @param {string} messageData.content Текст сообщения
   * @param {string} [messageData.chatId] ID существующего чата (не обязательно)
   * @param {string} [messageData.projectId] ID проекта, с которым связано сообщение (не обязательно)
   * @returns {Promise<Object>} Отправленное сообщение
   */
  async sendMessage(messageData) {
    const response = await axios.post(`${API_URL}/messages`, messageData, { headers: authHeader() });
    console.log('Сообщение отправлено:', response.data);
    return response.data;
  }

  /**
   * Создание нового чата
   * @param {Object} chatData Данные чата
   * @param {string} chatData.recipientId ID получателя
   * @param {string} [chatData.projectId] ID проекта (не обязательно)
   * @returns {Promise<Object>} Созданный чат
   */
  async createChat(chatData) {
    const response = await axios.post(`${API_URL}/chats`, chatData, { headers: authHeader() });
    console.log('Чат создан:', response.data);
    return response.data;
  }

  /**
   * Отметка сообщений чата как прочитанных
   * @param {string} chatId ID чата
   * @returns {Promise<Object>} Результат операции
   */
  async markChatAsRead(chatId) {
    const response = await axios.patch(`${API_URL}/chats/${chatId}/read`, {}, { headers: authHeader() });
    console.log(`Чат ${chatId} отмечен как прочитанный:`, response.data);
    return response.data;
  }

  /**
   * Получение количества непрочитанных сообщений
   * @returns {Promise<number>} Количество непрочитанных сообщений
   */
  async getUnreadCount() {
    const response = await axios.get(`${API_URL}/messages/unread/count`, { headers: authHeader() });
    console.log('Получено количество непрочитанных сообщений:', response.data);
    return response.data.count;
  }

  /**
   * Создание или получение личного чата с пользователем
   * @param {number} userId ID пользователя
   * @returns {Promise<Object>} Чат (созданный или существующий)
   */
  async createOrGetDirectChat(userId) {
    const response = await axios.post(`${API_URL}/chats/personal/${userId}`, {}, { headers: authHeader() });
    console.log('Создан или получен личный чат:', response.data);
    return response.data;
  }
}

export const chatService = new ChatService(); 