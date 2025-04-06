import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'http://localhost:8081/api'

class MessengerService {
  // Методы для работы с чатами
  getChats() {
    return axios.get(`${API_URL}/chats`, { headers: authHeader() })
      .then(response => {
        console.log('Получены чаты:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при получении чатов:', error)
        throw error
      })
  }

  createChat(chatData) {
    console.log('Создание чата с данными:', chatData)
    return axios.post(`${API_URL}/chats`, chatData, { headers: authHeader() })
      .then(response => {
        console.log('Чат успешно создан:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при создании чата:', error)
        throw error
      })
  }

  createPersonalChat(userId) {
    console.log('Создание личного чата с пользователем ID:', userId)
    return axios.post(`${API_URL}/chats/personal/${userId}`, {}, { headers: authHeader() })
      .then(response => {
        console.log('Личный чат успешно создан:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при создании личного чата:', error)
        throw error
      })
  }

  getChat(chatId) {
    return axios.get(`${API_URL}/chats/${chatId}`, { headers: authHeader() })
      .then(response => {
        console.log(`Получен чат ${chatId}:`, response.data)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при получении чата ${chatId}:`, error)
        throw error
      })
  }

  deleteChat(chatId) {
    return axios.delete(`${API_URL}/chats/${chatId}`, { headers: authHeader() })
      .then(response => {
        console.log(`Чат ${chatId} успешно удален`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при удалении чата ${chatId}:`, error)
        throw error
      })
  }

  markChatAsRead(chatId) {
    return axios.post(`${API_URL}/chats/${chatId}/read`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Чат ${chatId} отмечен как прочитанный`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при отметке чата ${chatId} как прочитанного:`, error)
        throw error
      })
  }

  togglePinChat(chatId) {
    return axios.post(`${API_URL}/chats/${chatId}/pin`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Статус закрепления чата ${chatId} изменен`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при изменении статуса закрепления чата ${chatId}:`, error)
        throw error
      })
  }

  toggleMuteChat(chatId) {
    return axios.post(`${API_URL}/chats/${chatId}/mute`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Статус отключения уведомлений чата ${chatId} изменен`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при изменении статуса отключения уведомлений чата ${chatId}:`, error)
        throw error
      })
  }

  leaveChat(chatId) {
    return axios.post(`${API_URL}/chats/${chatId}/leave`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Успешно покинут чат ${chatId}`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при выходе из чата ${chatId}:`, error)
        throw error
      })
  }

  // Методы для работы с сообщениями
  getMessages(chatId) {
    return axios.get(`${API_URL}/messages/chat/${chatId}`, { headers: authHeader() })
      .then(response => {
        console.log(`Получены сообщения для чата ${chatId}:`, response.data)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при получении сообщений для чата ${chatId}:`, error)
        throw error
      })
  }

  sendMessage(messageData) {
    // Проверяем наличие обязательных полей
    if (!messageData.chatId) {
      console.error('Ошибка: отсутствует chatId при отправке сообщения')
      return Promise.reject(new Error('Отсутствует ID чата'))
    }

    console.log('Отправка сообщения:', messageData)
    
    return axios.post(`${API_URL}/messages`, messageData, { headers: authHeader() })
      .then(response => {
        console.log('Сообщение успешно отправлено:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при отправке сообщения:', error)
        throw error
      })
  }

  // Новый метод для редактирования сообщения
  editMessage(messageId, newText) {
    if (!messageId || !newText) {
      console.error('Ошибка: отсутствует messageId или текст при редактировании сообщения')
      return Promise.reject(new Error('Отсутствует ID сообщения или новый текст'))
    }

    console.log(`Редактирование сообщения ${messageId} с новым текстом:`, newText)
    
    return axios.put(`${API_URL}/messages/${messageId}`, 
      { text: newText }, 
      { headers: authHeader() }
    )
      .then(response => {
        console.log('Сообщение успешно отредактировано:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при редактировании сообщения:', error)
        throw error
      })
  }

  // Метод для удаления сообщения
  deleteMessage(messageId) {
    if (!messageId) {
      console.error('Ошибка: отсутствует messageId при удалении сообщения')
      return Promise.reject(new Error('Отсутствует ID сообщения'))
    }

    console.log(`Удаление сообщения ${messageId}`)
    
    return axios.delete(`${API_URL}/messages/${messageId}`, { headers: authHeader() })
      .then(response => {
        console.log('Сообщение успешно удалено')
        return response
      })
      .catch(error => {
        console.error('Ошибка при удалении сообщения:', error)
        throw error
      })
  }

  // Метод для пересылки сообщения
  forwardMessage(messageId, targetChatId) {
    if (!messageId || !targetChatId) {
      console.error('Ошибка: отсутствует messageId или targetChatId при пересылке сообщения')
      return Promise.reject(new Error('Отсутствует ID сообщения или ID целевого чата'))
    }

    console.log(`Пересылка сообщения ${messageId} в чат ${targetChatId}`)
    
    return axios.post(`${API_URL}/messages/${messageId}/forward`, 
      { targetChatId }, 
      { headers: authHeader() }
    )
      .then(response => {
        console.log('Сообщение успешно переслано:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при пересылке сообщения:', error)
        throw error
      })
  }

  // Методы для загрузки файлов
  uploadFile(file, onProgress) {
    if (!file) {
      console.error('Ошибка: файл не выбран для загрузки')
      return Promise.reject(new Error('Файл не выбран'))
    }

    console.log(`Загрузка файла: ${file.name}, размер: ${file.size} байт`)
    
    const formData = new FormData()
    formData.append('file', file)
    
    return axios.post(`${API_URL}/files/upload`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Прогресс загрузки файла: ${progress}%`)
        if (onProgress && typeof onProgress === 'function') {
          onProgress(progress)
        }
      }
    })
      .then(response => {
        console.log('Файл успешно загружен:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при загрузке файла:', error)
        throw error
      })
  }

  // Метод для загрузки изображений (может иметь отдельную обработку)
  uploadImage(file, onProgress) {
    if (!file || !file.type.startsWith('image/')) {
      console.error('Ошибка: не выбрано изображение для загрузки')
      return Promise.reject(new Error('Изображение не выбрано или имеет неверный формат'))
    }

    console.log(`Загрузка изображения: ${file.name}, размер: ${file.size} байт`)
    
    const formData = new FormData()
    formData.append('image', file)
    
    return axios.post(`${API_URL}/files/upload/image`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Прогресс загрузки изображения: ${progress}%`)
        if (onProgress && typeof onProgress === 'function') {
          onProgress(progress)
        }
      }
    })
      .then(response => {
        console.log('Изображение успешно загружено:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при загрузке изображения:', error)
        throw error
      })
  }

  // Методы для работы с участниками чата
  getChatMembers(chatId) {
    if (!chatId) {
      console.error('Ошибка: отсутствует chatId при запросе участников чата')
      return Promise.reject(new Error('Отсутствует ID чата'))
    }
    
    console.log(`Запрос участников чата ${chatId}`)
    
    return axios.get(`${API_URL}/chats/${chatId}/members`, { headers: authHeader() })
      .then(response => {
        console.log(`Получены участники чата ${chatId}:`, response.data)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при получении участников чата ${chatId}:`, error)
        throw error
      })
  }

  addUserToChat(chatId, userId) {
    return axios.post(`${API_URL}/chats/${chatId}/members`, 
      { userId }, 
      { headers: authHeader() }
    )
      .then(response => {
        console.log(`Пользователь ${userId} успешно добавлен в чат ${chatId}`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при добавлении пользователя ${userId} в чат ${chatId}:`, error)
        throw error
      })
  }

  removeUserFromChat(chatId, userId) {
    return axios.delete(`${API_URL}/chats/${chatId}/members/${userId}`, { headers: authHeader() })
      .then(response => {
        console.log(`Пользователь ${userId} успешно удален из чата ${chatId}`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при удалении пользователя ${userId} из чата ${chatId}:`, error)
        throw error
      })
  }

  // Методы для поиска пользователей
  searchUsers(query) {
    console.log(`Отправка запроса поиска пользователей: ${query}`);
    
    // Используем правильное имя параметра и кодируем строку поиска
    const encodedQuery = encodeURIComponent(query);
    return axios.get(`${API_URL}/users/search?q=${encodedQuery}`, { headers: authHeader() })
      .then(response => {
        console.log(`Поиск пользователей по запросу '${query}':`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Ошибка при поиске пользователей по запросу '${query}':`, error);
        throw error;
      });
  }

  // Метод для получения статусов "прочитано"
  markMessageAsRead(messageId) {
    return axios.post(`${API_URL}/messages/${messageId}/read`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Сообщение ${messageId} отмечено как прочитанное`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при отметке сообщения ${messageId} как прочитанного:`, error)
        throw error
      })
  }

  // Метод для получения профиля пользователя
  getUserProfile(userId) {
    if (!userId) {
      console.error('Ошибка: отсутствует ID пользователя для получения профиля');
      return Promise.reject(new Error('Отсутствует ID пользователя'));
    }

    console.log(`Запрос профиля пользователя с ID: ${userId}`);
    
    return axios.get(`${API_URL}/users/${userId}/profile`, { headers: authHeader() })
      .then(response => {
        console.log(`Получен профиль пользователя ${userId}:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Ошибка при получении профиля пользователя ${userId}:`, error);
        throw error;
      });
  }
}

export default new MessengerService() 