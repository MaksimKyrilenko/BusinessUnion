import axios from 'axios'
import authHeader from './auth-header'
import websocketService from './websocket.service'

// Используем относительный путь - nginx проксирует /api на backend
const API_URL = '/api'

class MessengerService {
  // Присоединиться к чату через WebSocket
  joinChat(chatId) {
    websocketService.joinChat(chatId)
  }

  // Покинуть чат через WebSocket
  leaveChat(chatId) {
    websocketService.leaveChat(chatId)
  }

  // Отправить статус "печатает"
  sendTyping(chatId, isTyping) {
    websocketService.sendTyping(chatId, isTyping)
  }

  // Подписаться на новые сообщения
  onNewMessage(callback) {
    return websocketService.on('chat:newMessage', callback)
  }

  // Подписаться на редактирование сообщений
  onMessageEdited(callback) {
    return websocketService.on('chat:messageEdited', callback)
  }

  // Подписаться на удаление сообщений
  onMessageDeleted(callback) {
    return websocketService.on('chat:messageDeleted', callback)
  }

  // Подписаться на статус "печатает"
  onTyping(callback) {
    return websocketService.on('chat:typing', callback)
  }

  // Подписаться на прочтение сообщений
  onMessageRead(callback) {
    return websocketService.on('chat:read', callback)
  }

  // Получить пользователей, которые печатают
  getTypingUsers(chatId) {
    return websocketService.getTypingUsers(chatId)
  }
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

  markChatAsUnread(chatId) {
    return axios.post(`${API_URL}/chats/${chatId}/unread`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Чат ${chatId} отмечен как непрочитанный`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при отметке чата ${chatId} как непрочитанного:`, error)
        throw error
      })
  }

  togglePinChat(chatId, isPinned) {
    console.log(`[togglePinChat] Запрос на изменение статуса закрепления чата ${chatId} на ${isPinned}`)
    return axios.post(`${API_URL}/chats/${chatId}/pin`, { isPinned }, { headers: authHeader() })
      .then(response => {
        console.log(`[togglePinChat] Статус закрепления чата ${chatId} успешно изменен:`, response.data)
        return response
      })
      .catch(error => {
        console.error(`[togglePinChat] Ошибка при изменении статуса закрепления чата ${chatId}:`, error)
        throw error
      })
  }

  toggleMuteChat(chatId) {
    console.log(`[toggleMuteChat] Запрос на изменение статуса уведомлений чата ${chatId}`)
    return axios.post(`${API_URL}/chats/${chatId}/mute`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`[toggleMuteChat] Статус уведомлений чата ${chatId} успешно изменен:`, response.data)
        return response
      })
      .catch(error => {
        console.error(`[toggleMuteChat] Ошибка при изменении статуса уведомлений чата ${chatId}:`, error)
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
    if (!chatId || !userId) {
      console.error('Ошибка: отсутствует chatId или userId при добавлении пользователя в чат')
      return Promise.reject(new Error('Отсутствует ID чата или ID пользователя'))
    }

    console.log(`Добавление пользователя ${userId} в чат ${chatId}`)
    
    return axios.post(`${API_URL}/chats/${chatId}/users/${userId}`, {}, { headers: authHeader() })
      .then(response => {
        console.log(`Пользователь ${userId} успешно добавлен в чат ${chatId}`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при добавлении пользователя ${userId} в чат ${chatId}:`, error)
        throw error
      })
  }

  addUsersToChat(chatId, userIds) {
    if (!chatId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.error('Ошибка: некорректные параметры при добавлении пользователей в чат')
      return Promise.reject(new Error('Некорректные параметры для добавления пользователей'))
    }

    console.log(`Добавление ${userIds.length} пользователей в чат ${chatId}`)
    
    // Создаем массив промисов для каждого пользователя
    const promises = userIds.map(userId => 
      this.addUserToChat(chatId, userId)
        .catch(error => {
          console.error(`Ошибка при добавлении пользователя ${userId} в чат ${chatId}:`, error)
          // Возвращаем объект ошибки, чтобы Promise.all не завершался ошибкой при частичной неудаче
          return { error, userId }
        })
    )
    
    // Ждем завершения всех запросов
    return Promise.all(promises)
      .then(results => {
        const successCount = results.filter(r => !r.error).length
        const failCount = results.length - successCount
        
        console.log(`Добавлено ${successCount} пользователей, ${failCount} ошибок`)
        
        // Если все запросы завершились ошибкой, выбрасываем исключение
        if (successCount === 0 && failCount > 0) {
          throw new Error('Не удалось добавить ни одного пользователя в чат')
        }
        
        return { 
          successCount,
          failCount,
          results
        }
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

  // Метод для обновления информации о группе
  updateGroupInfo(chatId, updateData) {
    if (!chatId) {
      console.error('Ошибка: отсутствует chatId при обновлении информации о группе')
      return Promise.reject(new Error('Отсутствует ID чата'))
    }
    
    // Преобразуем ID в число для гарантии
    const numericChatId = Number(chatId);
    if (isNaN(numericChatId)) {
      console.error(`Ошибка: некорректный формат ID чата: ${chatId}`)
      return Promise.reject(new Error('Некорректный формат ID чата'))
    }
    
    console.log(`Обновление информации о группе ${numericChatId}:`, updateData)
    
    // Получаем токен напрямую из localStorage
    const token = localStorage.getItem('token');
    console.log('Токен из localStorage:', token ? 'присутствует' : 'отсутствует');
    
    if (!token) {
      console.error('Ошибка: токен не найден в localStorage');
      return Promise.reject(new Error('Токен авторизации не найден'));
    }
    
    // Формируем заголовки с токеном
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Заголовки запроса:', {
      Authorization: headers.Authorization ? 'Bearer xx...' : 'отсутствует',
      ContentType: headers['Content-Type']
    });
    
    return axios.put(`${API_URL}/chats/${numericChatId}`, updateData, { headers })
      .then(response => {
        console.log('Информация о группе успешно обновлена:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при обновлении информации о группе:', error)
        console.error('Детали ошибки:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            hasAuth: !!error.config.headers?.Authorization
          } : 'Нет конфигурации'
        })
        throw error
      })
  }

  // Метод для загрузки аватара группы
  uploadGroupAvatar(chatId, formData) {
    if (!chatId || !formData) {
      console.error('Ошибка: отсутствует chatId или данные при загрузке аватара группы')
      return Promise.reject(new Error('Отсутствует ID чата или данные аватара'))
    }

    // Преобразуем ID в число для гарантии
    const numericChatId = Number(chatId);
    if (isNaN(numericChatId)) {
      console.error(`Ошибка: некорректный формат ID чата: ${chatId}`)
      return Promise.reject(new Error('Некорректный формат ID чата'))
    }

    console.log(`Загрузка аватара для группы ${numericChatId}`)
    
    // Получаем токен напрямую из localStorage
    const token = localStorage.getItem('token');
    console.log('Токен из localStorage:', token ? 'присутствует' : 'отсутствует');
    
    if (!token) {
      console.error('Ошибка: токен не найден в localStorage');
      return Promise.reject(new Error('Токен авторизации не найден'));
    }
    
    // Для multipart/form-data нельзя использовать Content-Type в заголовках
    // axios автоматически установит правильный Content-Type с boundary
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    console.log('Заголовки запроса для загрузки аватара:', {
      Authorization: headers.Authorization ? 'Bearer xx...' : 'отсутствует'
    });
    
    return axios.post(`${API_URL}/chats/${numericChatId}/avatar`, formData, { headers })
      .then(response => {
        console.log('Аватар группы успешно загружен:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при загрузке аватара группы:', error)
        console.error('Детали ошибки:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            hasAuth: !!error.config.headers?.Authorization
          } : 'Нет конфигурации'
        })
        throw error
      })
  }

  // Метод для удаления группы
  deleteGroup(chatId) {
    if (!chatId) {
      console.error('Ошибка: отсутствует chatId при удалении группы')
      return Promise.reject(new Error('Отсутствует ID чата'))
    }

    console.log(`Удаление группы ${chatId}`)
    
    return axios.delete(`${API_URL}/chats/${chatId}`, { headers: authHeader() })
      .then(response => {
        console.log(`Группа ${chatId} успешно удалена`)
        return response
      })
      .catch(error => {
        console.error(`Ошибка при удалении группы ${chatId}:`, error)
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

  // Метод для добавления реакции на сообщение
  addReaction(messageId, reaction) {
    if (!messageId || !reaction) {
      console.error('Ошибка: отсутствует messageId или reaction')
      return Promise.reject(new Error('Отсутствует ID сообщения или реакция'))
    }

    console.log(`Добавление реакции ${reaction} к сообщению ${messageId}`)
    
    return axios.post(`${API_URL}/messages/${messageId}/reaction`, 
      { reaction }, 
      { headers: authHeader() }
    )
      .then(response => {
        console.log('Реакция успешно добавлена:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при добавлении реакции:', error)
        throw error
      })
  }

  // Метод для удаления реакции с сообщения
  removeReaction(messageId, reaction) {
    if (!messageId || !reaction) {
      console.error('Ошибка: отсутствует messageId или reaction')
      return Promise.reject(new Error('Отсутствует ID сообщения или реакция'))
    }

    console.log(`Удаление реакции ${reaction} с сообщения ${messageId}`)
    
    return axios.delete(`${API_URL}/messages/${messageId}/reaction/${encodeURIComponent(reaction)}`, 
      { headers: authHeader() }
    )
      .then(response => {
        console.log('Реакция успешно удалена:', response.data)
        return response
      })
      .catch(error => {
        console.error('Ошибка при удалении реакции:', error)
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