<template>
  <div id="app">
    <Navigation v-if="isAuthenticated" />
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
import MessageNotification from '@/components/ui/MessageNotification.vue'
import { useUserStore } from '@/stores/user'
import { useMessengerStore } from '@/stores/messenger'
import { useNotification } from '@/utils/notification'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import websocketService from '@/services/websocket.service'

export default defineComponent({
  name: 'App',
  components: {
    Navigation,
    MessageNotification
  },
  setup() {
    const userStore = useUserStore()
    const messengerStore = useMessengerStore()
    const router = useRouter()
    const route = useRoute()
    const { isAuthenticated } = storeToRefs(userStore)
    const { notifications, remove: removeNotification } = useNotification()
    
    let wsUnsubscriber = null

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
      
      // Загружаем список чатов для получения названий
      let chatsCache = []
      try {
        const messengerService = (await import('@/services/messenger.service')).default
        const response = await messengerService.getChats()
        if (response?.data) {
          chatsCache = response.data
        }
      } catch (e) {
        console.error('Ошибка загрузки чатов для уведомлений:', e)
      }
      
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
        
        // Получаем чат из кэша
        const chat = chatsCache.find(c => c.id === message.chatId)
        
        // Проверяем, не заглушен ли чат
        if (chat?.isMuted) {
          console.log('[App] Чат заглушен, уведомление не показываем')
          return
        }
        
        // Увеличиваем счётчик непрочитанных
        messengerStore.incrementUnread()
        
        // Получаем имя отправителя
        const senderName = message.sender 
          ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || 'Пользователь'
          : 'Пользователь'
        
        // Получаем название чата из кэша
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
</style>