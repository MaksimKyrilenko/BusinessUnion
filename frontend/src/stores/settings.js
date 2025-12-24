import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // Тема
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  // Уведомления
  const notifications = ref({
    messages: localStorage.getItem('notif_messages') !== 'false',
    sounds: localStorage.getItem('notif_sounds') !== 'false',
    email: localStorage.getItem('notif_email') !== 'false',
    desktop: localStorage.getItem('notif_desktop') !== 'false'
  })
  
  // Приватность
  const privacy = ref({
    showOnline: localStorage.getItem('privacy_online') !== 'false',
    showLastSeen: localStorage.getItem('privacy_lastseen') !== 'false',
    showProfile: localStorage.getItem('privacy_profile') || 'all'
  })
  
  // Язык
  const language = ref(localStorage.getItem('language') || 'ru')
  
  // Размер шрифта
  const fontSize = ref(localStorage.getItem('fontSize') || 'medium')
  
  // Применение темы
  const applyTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark-theme')
      document.documentElement.classList.add('light-theme')
    } else {
      // auto - по системным настройкам
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark-theme')
        document.documentElement.classList.remove('light-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
        document.documentElement.classList.add('light-theme')
      }
    }
  }
  
  // Сохранение настроек уведомлений
  const saveNotifications = (settings) => {
    notifications.value = { ...notifications.value, ...settings }
    localStorage.setItem('notif_messages', settings.messages)
    localStorage.setItem('notif_sounds', settings.sounds)
    localStorage.setItem('notif_email', settings.email)
    localStorage.setItem('notif_desktop', settings.desktop)
  }
  
  // Сохранение настроек приватности
  const savePrivacy = (settings) => {
    privacy.value = { ...privacy.value, ...settings }
    localStorage.setItem('privacy_online', settings.showOnline)
    localStorage.setItem('privacy_lastseen', settings.showLastSeen)
    localStorage.setItem('privacy_profile', settings.showProfile)
  }
  
  // Сохранение языка
  const saveLanguage = (lang) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }
  
  // Сохранение размера шрифта
  const saveFontSize = (size) => {
    fontSize.value = size
    localStorage.setItem('fontSize', size)
    document.documentElement.setAttribute('data-font-size', size)
  }
  
  // Инициализация при загрузке
  const init = () => {
    applyTheme(theme.value)
    document.documentElement.setAttribute('data-font-size', fontSize.value)
    
    // Слушаем изменения системной темы
    if (theme.value === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (theme.value === 'auto') {
          applyTheme('auto')
        }
      })
    }
  }
  
  return {
    theme,
    notifications,
    privacy,
    language,
    fontSize,
    applyTheme,
    saveNotifications,
    savePrivacy,
    saveLanguage,
    saveFontSize,
    init
  }
})
