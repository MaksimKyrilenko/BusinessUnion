/**
 * Утилиты для форматирования сообщений и данных мессенджера
 */

/**
 * Форматирование времени сообщения
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

/**
 * Форматирование даты для разделителей сообщений
 */
export const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10))
  const date = new Date(year, month - 1, day)
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  
  if (date.getTime() === today.getTime()) {
    return 'Сегодня'
  } else if (date.getTime() === yesterdayDate.getTime()) {
    return 'Вчера'
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
}

/**
 * Полное форматирование даты и времени
 */
export const formatFullDateTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Форматирование текста сообщения (markdown-подобное)
 */
export const formatMessageText = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Байт'
  
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Получение иконки файла по расширению
 */
export const getFileIcon = (fileName) => {
  if (!fileName) return 'fa-file'
  
  const extension = fileName.split('.').pop().toLowerCase()
  
  const iconMap = {
    pdf: 'fa-file-pdf',
    doc: 'fa-file-word',
    docx: 'fa-file-word',
    xls: 'fa-file-excel',
    xlsx: 'fa-file-excel',
    ppt: 'fa-file-powerpoint',
    pptx: 'fa-file-powerpoint',
    zip: 'fa-file-archive',
    rar: 'fa-file-archive',
    '7z': 'fa-file-archive',
    txt: 'fa-file-alt',
    jpg: 'fa-file-image',
    jpeg: 'fa-file-image',
    png: 'fa-file-image',
    gif: 'fa-file-image',
    bmp: 'fa-file-image',
    webp: 'fa-file-image',
    mp3: 'fa-file-audio',
    wav: 'fa-file-audio',
    ogg: 'fa-file-audio',
    mp4: 'fa-file-video',
    avi: 'fa-file-video',
    mov: 'fa-file-video',
    wmv: 'fa-file-video',
    js: 'fa-file-code',
    ts: 'fa-file-code',
    html: 'fa-file-code',
    css: 'fa-file-code',
    php: 'fa-file-code',
    py: 'fa-file-code',
    java: 'fa-file-code',
    c: 'fa-file-code',
    cpp: 'fa-file-code'
  }
  
  return iconMap[extension] || 'fa-file'
}

/**
 * Получение иконки статуса сообщения
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'sent': return 'fa-check'
    case 'delivered': return 'fa-check-double'
    case 'read': return 'fa-check-double text-primary'
    default: return 'fa-clock'
  }
}

/**
 * Получение полного имени пользователя
 */
export const getUserFullName = (user) => {
  if (!user) return 'Пользователь'
  
  if (user.senderId && !user.id) {
    user = { ...user, id: user.senderId }
  }
  
  if (user.firstName || user.lastName) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    if (fullName) return fullName
  }
  
  if (user.name) return user.name
  
  if (user.profile) {
    const profileName = [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')
    if (profileName) return profileName
  }
  
  if (user.email) return user.email.split('@')[0]
  
  const userId = user.id || user.senderId || 'неизвестен'
  return `Пользователь ${userId}`
}

/**
 * Получение короткого имени пользователя
 */
export const getUserName = (user) => {
  if (!user) return 'Пользователь'
  
  if (user.name) return user.name
  
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Пользователь'
  }
  
  return user.id ? `Пользователь ${user.id}` : 'Пользователь'
}

/**
 * Получение аватара пользователя
 */
export const getUserAvatar = (user) => {
  const defaultAvatar = '/assets/images/default-avatar.svg'
  
  if (!user) return defaultAvatar
  
  if (user.avatar && user.avatar.startsWith('http')) return user.avatar
  if (user.avatar) return user.avatar
  if (user.profile && user.profile.avatar) return user.profile.avatar
  
  return defaultAvatar
}

/**
 * Получение текстового представления роли участника
 */
export const getMemberRoleText = (role) => {
  switch(role) {
    case 'owner': return 'Создатель'
    case 'admin': return 'Администратор'
    case 'member': return 'Участник'
    default: return 'Участник'
  }
}

/**
 * Получение времени последнего сообщения в чате
 */
export const getLastMessageTime = (chat) => {
  if (!chat) return 0
  
  if (chat.messages && chat.messages.length > 0) {
    const lastMessage = chat.messages[chat.messages.length - 1]
    return new Date(lastMessage.createdAt || lastMessage.timestamp || 0).getTime()
  }
  
  if (chat.lastMessageTime) return new Date(chat.lastMessageTime).getTime()
  if (chat.updatedAt) return new Date(chat.updatedAt).getTime()
  
  return chat.createdAt ? new Date(chat.createdAt).getTime() : 0
}
