<template>
  <div id="app">
    <Navigation v-if="isAuthenticated" />
    <MobileBottomNav v-if="isAuthenticated" />
    <main class="main-content" :class="{ 'with-nav': isAuthenticated }">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'page-fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- Уведомления системные -->
    <div class="notifications-container">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :type="notification.type"
        @close="removeNotification(notification.id)"
      />
    </div>
    
    <!-- Уведомления о сообщениях (Dynamic Island) -->
    <MessageNotification v-if="isAuthenticated" />
  </div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, watch } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'
import MessageNotification from '@/components/ui/MessageNotification.vue'
import { useUserStore } from '@/stores/user'
import { useMessengerStore } from '@/stores/messenger'
import { useSettingsStore } from '@/stores/settings'
import { useNotification } from '@/utils/notification'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import websocketService from '@/services/websocket.service'

export default defineComponent({
  name: 'App',
  components: {
    Navigation,
    MobileBottomNav,
    MessageNotification
  },
  setup() {
    const userStore = useUserStore()
    const messengerStore = useMessengerStore()
    const settingsStore = useSettingsStore()
    const router = useRouter()
    const route = useRoute()
    const { isAuthenticated } = storeToRefs(userStore)
    const { notifications, remove: removeNotification } = useNotification()
    
    let wsUnsubscriber = null
    
    // Инициализируем настройки темы
    settingsStore.init()

    // Проверяем авторизацию при загрузке приложения
    const checkAuth = async () => {
      try {
        console.log('Проверка состояния авторизации...', { currentPath: route.path })
        
        // Проверяем наличие токена
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('Токен отсутствует, пользователь не авторизован')
          // Очищаем данные только если пользователь не на гостевой странице
          if (!route.meta?.guest) {
            userStore.clearUserData()
          }
          return
        }
        
        // Если пользователь уже авторизован, не загружаем повторно
        if (userStore.isAuthenticated) {
          console.log('Пользователь уже авторизован, пропускаем загрузку')
          return
        }
        
        // Не загружаем пользователя здесь - это делает роутер
        // Просто проверяем, что если пользователь на главной странице и есть токен, перенаправляем
        if (route.path === '/' && !route.meta?.requiresAuth) {
          console.log('Токен найден, перенаправление на дашборд будет выполнено роутером')
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error)
        // Очищаем данные только если пользователь не на гостевой странице
        if (!route.meta?.guest) {
          userStore.clearUserData()
        }
      }
    }
    
    // Настройка глобального обработчика WebSocket для уведомлений
    const setupGlobalWebSocket = async () => {
      if (wsUnsubscriber) {
        wsUnsubscriber()
      }
      
      // Загружаем кэш чатов в store
      await messengerStore.loadUnreadCount()
      
      wsUnsubscriber = websocketService.on('chat:newMessage', (message) => {
        console.log('[App] Глобальный обработчик: новое сообщение', message.id)
        
        const myUserId = localStorage.getItem('userId')
        const senderId = message.senderId || message.sender?.id
        
        // Игнорируем свои сообщения
        if (String(senderId) === String(myUserId)) {
          return
        }
        
        // Проверяем, не находится ли пользователь в этом чате
        // Если да - не увеличиваем счётчик непрочитанных
        if (messengerStore.currentChatId === message.chatId) {
          console.log('[App] Пользователь в этом чате, счётчик не увеличиваем')
          return
        }
        
        // Проверяем, не заглушен ли чат (используем реактивный кэш из store)
        if (messengerStore.isChatMuted(message.chatId)) {
          console.log('[App] Чат заглушен, уведомление не показываем')
          return
        }
        
        // Увеличиваем счётчик непрочитанных
        messengerStore.incrementUnread()
        
        // Получаем имя отправителя
        const senderName = message.sender 
          ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || 'Пользователь'
          : 'Пользователь'
        
        // Получаем чат из кэша store
        const chat = messengerStore.chatsCache.find(c => c.id === message.chatId)
        
        // Получаем название чата
        let chatName = ''
        
        if (chat) {
          if (chat.type === 'group') {
            // Для группового чата показываем название группы
            chatName = chat.name || 'Группа'
          } else {
            // Для личного чата - не показываем название (только имя отправителя)
            chatName = ''
          }
        }
        
        // Добавляем уведомление
        messengerStore.addMessageNotification(message, chatName, senderName)
      })
    }
    
    // Вызываем проверку при загрузке
    onMounted(() => {
      checkAuth()
      
      // Если авторизован - настраиваем WebSocket
      if (userStore.isAuthenticated) {
        setupGlobalWebSocket()
        messengerStore.loadUnreadCount()
        
        // Подключаемся к WebSocket если ещё не подключены
        if (!websocketService.isAuthenticated.value) {
          websocketService.connect()
        }
      }
    })
    
    onUnmounted(() => {
      if (wsUnsubscriber) {
        wsUnsubscriber()
      }
    })
    
    // Следим за изменениями авторизации
    watch(isAuthenticated, (newValue) => {
      if (newValue) {
        if (route.meta.guest) {
          console.log('Пользователь авторизован, перенаправление с гостевой страницы на дашборд')
          router.replace('/dashboard')
        }
        
        // Настраиваем WebSocket при авторизации
        setupGlobalWebSocket()
        messengerStore.loadUnreadCount()
        
        if (!websocketService.isAuthenticated.value) {
          websocketService.connect()
        }
      } else {
        // Отписываемся при выходе
        if (wsUnsubscriber) {
          wsUnsubscriber()
          wsUnsubscriber = null
        }
      }
    })

    return {
      isAuthenticated,
      notifications,
      removeNotification
    }
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

:root {
  --primary-color: #7C4DFF;
  --primary-hover: #651FFF;
  --text-primary: #333333;
  --text-secondary: #666666;
  --background: #f5f5f5;
  --card-background: #ffffff;
  --card-hover: #fafafa;
  --sidebar-width: 280px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--background);
  color: var(--text-primary);
}

.main-content {
  min-height: 100vh;
  background-color: var(--background);
  transition: margin-left 0.3s ease;
}

.main-content.with-nav {
  margin-left: var(--sidebar-width);
}

@media (max-width: 768px) {
  .main-content.with-nav {
    margin-left: 0;
  }
}

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Slide transition for auth pages */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Dark Theme Variables */
.dark-theme {
  --primary-color: #60a5fa;
  --primary-hover: #3b82f6;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --background: #0f172a;
  --card-background: #1e293b;
  --card-hover: #334155;
  --border-color: #334155;
  --input-bg: #1e293b;
  --input-border: #334155;
  --shadow-color: rgba(0, 0, 0, 0.4);
}

/* Global Dark Theme */
.dark-theme,
.dark-theme body,
.dark-theme #app {
  background-color: var(--background) !important;
  color: var(--text-primary);
}

.dark-theme .main-content {
  background-color: var(--background) !important;
}

/* Navigation Dark */
.dark-theme .navigation {
  background-color: #1e293b !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
}

.dark-theme .nav-brand {
  border-bottom-color: #334155;
}

.dark-theme .nav-item {
  color: #e2e8f0;
}

.dark-theme .nav-item:hover {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.dark-theme .nav-item.router-link-active {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.dark-theme .nav-profile {
  border-top-color: #334155;
}

/* Cards & Containers Dark */
.dark-theme .page-header,
.dark-theme .profile-card,
.dark-theme .settings-card,
.dark-theme .settings-sidebar,
.dark-theme .card,
.dark-theme .dashboard-card,
.dark-theme .content-card,
.dark-theme .info-card,
.dark-theme .stat-card,
.dark-theme .feature-card {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

/* Headers & Titles Dark */
.dark-theme h1,
.dark-theme h2,
.dark-theme h3,
.dark-theme h4,
.dark-theme h5,
.dark-theme h6,
.dark-theme .header-left h1,
.dark-theme .card-header h3,
.dark-theme .section-header h2 {
  color: #f1f5f9 !important;
}

/* Text Dark */
.dark-theme p,
.dark-theme span,
.dark-theme .header-subtitle,
.dark-theme .info-label,
.dark-theme .setting-info p,
.dark-theme .section-header p {
  color: #94a3b8 !important;
}

.dark-theme .info-value,
.dark-theme .setting-info h4,
.dark-theme .theme-name,
.dark-theme .size-label,
.dark-theme .lang-name {
  color: #e2e8f0 !important;
}

/* Inputs & Forms Dark */
.dark-theme input,
.dark-theme textarea,
.dark-theme select,
.dark-theme .select-input,
.dark-theme .form-control {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #e2e8f0 !important;
}

.dark-theme input::placeholder,
.dark-theme textarea::placeholder {
  color: #64748b !important;
}

.dark-theme input:focus,
.dark-theme textarea:focus,
.dark-theme select:focus {
  border-color: #60a5fa !important;
  outline: none;
}

/* Buttons Dark */
.dark-theme .btn-secondary,
.dark-theme .btn-outline {
  background-color: #334155 !important;
  border-color: #475569 !important;
  color: #e2e8f0 !important;
}

.dark-theme .btn-secondary:hover,
.dark-theme .btn-outline:hover {
  background-color: #475569 !important;
}

/* Theme/Language Selectors Dark */
.dark-theme .theme-option,
.dark-theme .size-option,
.dark-theme .language-option {
  border-color: #334155 !important;
  background-color: transparent !important;
}

.dark-theme .theme-option:hover,
.dark-theme .size-option:hover,
.dark-theme .language-option:hover {
  border-color: #60a5fa !important;
}

.dark-theme .theme-option.active,
.dark-theme .size-option.active,
.dark-theme .language-option.active {
  border-color: #60a5fa !important;
  background-color: rgba(96, 165, 250, 0.1) !important;
}

/* Theme Preview Dark */
.dark-theme .theme-preview.light {
  background: #e2e8f0;
}

.dark-theme .theme-preview.light .preview-sidebar,
.dark-theme .theme-preview.light .preview-header,
.dark-theme .theme-preview.light .preview-card {
  background: #ffffff;
}

/* Settings Nav Dark */
.dark-theme .settings-nav .nav-item {
  color: #94a3b8 !important;
}

.dark-theme .settings-nav .nav-item:hover {
  background: rgba(96, 165, 250, 0.1) !important;
  color: #60a5fa !important;
}

.dark-theme .settings-nav .nav-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
  color: white !important;
}

/* Toggle Switch Dark */
.dark-theme .toggle-slider {
  background-color: #475569 !important;
}

.dark-theme .toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
}

/* Security Items Dark */
.dark-theme .security-item:hover {
  background: #334155 !important;
}

.dark-theme .security-icon {
  background: rgba(96, 165, 250, 0.15) !important;
  color: #60a5fa !important;
}

.dark-theme .security-info h4 {
  color: #f1f5f9 !important;
}

.dark-theme .security-info p {
  color: #94a3b8 !important;
}

/* About Links Dark */
.dark-theme .about-link {
  background: #334155 !important;
  color: #94a3b8 !important;
}

.dark-theme .about-link:hover {
  background: rgba(96, 165, 250, 0.15) !important;
  color: #60a5fa !important;
}

/* Borders & Dividers Dark */
.dark-theme .setting-row {
  border-bottom-color: #334155 !important;
}

.dark-theme .card-header {
  border-bottom-color: #334155 !important;
}

.dark-theme .menu-divider {
  background-color: #334155 !important;
}

/* Header Icon Dark */
.dark-theme .header-icon,
.dark-theme .section-header > i {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
}

.dark-theme .card-header i {
  background: rgba(96, 165, 250, 0.15) !important;
  color: #60a5fa !important;
}

/* Tags Dark */
.dark-theme .tag {
  background: rgba(96, 165, 250, 0.15) !important;
  color: #60a5fa !important;
}

/* Mobile Bottom Nav Dark */
.dark-theme .mobile-bottom-nav {
  background: #1e293b !important;
  border-top-color: #334155 !important;
}

.dark-theme .mobile-bottom-nav .nav-item {
  color: #94a3b8 !important;
}

.dark-theme .mobile-bottom-nav .nav-item.active,
.dark-theme .mobile-bottom-nav .nav-item.router-link-active {
  color: #60a5fa !important;
}

.dark-theme .more-menu {
  background: #1e293b !important;
}

.dark-theme .more-menu-header {
  background: #1e293b !important;
  border-bottom-color: #334155 !important;
}

.dark-theme .more-menu-header span {
  color: #f1f5f9 !important;
}

.dark-theme .menu-item {
  color: #e2e8f0 !important;
}

.dark-theme .menu-item:active {
  background: #334155 !important;
}

.dark-theme .close-btn {
  background: #334155 !important;
  color: #94a3b8 !important;
}

/* Scrollbar Dark */
.dark-theme ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dark-theme ::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark-theme ::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.dark-theme ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Messenger Dark */
.dark-theme .messenger-container,
.dark-theme .chat-sidebar,
.dark-theme .chat-list,
.dark-theme .message-list,
.dark-theme .chat-header,
.dark-theme .message-input-container {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.dark-theme .chat-item {
  border-bottom-color: #334155 !important;
}

.dark-theme .chat-item:hover {
  background-color: #334155 !important;
}

.dark-theme .chat-item.active {
  background-color: rgba(96, 165, 250, 0.15) !important;
}

.dark-theme .message-bubble {
  background-color: #334155 !important;
  color: #e2e8f0 !important;
}

.dark-theme .message-bubble.own {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
  color: white !important;
}

/* Modal Dark */
.dark-theme .modal-content,
.dark-theme .modal-body {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
}

.dark-theme .modal-header {
  border-bottom-color: #334155 !important;
}

.dark-theme .modal-footer {
  border-top-color: #334155 !important;
}

/* Tables Dark */
.dark-theme table,
.dark-theme th,
.dark-theme td {
  border-color: #334155 !important;
}

.dark-theme th {
  background-color: #334155 !important;
  color: #e2e8f0 !important;
}

.dark-theme tr:hover {
  background-color: #334155 !important;
}

/* Dropdown Dark */
.dark-theme .dropdown-menu {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.dark-theme .dropdown-item {
  color: #e2e8f0 !important;
}

.dark-theme .dropdown-item:hover {
  background-color: #334155 !important;
}

/* Alerts Dark */
.dark-theme .alert {
  background-color: #334155 !important;
  border-color: #475569 !important;
  color: #e2e8f0 !important;
}

/* Empty States Dark */
.dark-theme .empty-text,
.dark-theme .no-data {
  color: #64748b !important;
}

/* Loading Dark */
.dark-theme .loader,
.dark-theme .loading-spinner {
  border-color: #334155 !important;
  border-top-color: #60a5fa !important;
}

/* Font Size Variables */
[data-font-size="small"] {
  font-size: 14px;
}

[data-font-size="medium"] {
  font-size: 16px;
}

[data-font-size="large"] {
  font-size: 18px;
}
</style>