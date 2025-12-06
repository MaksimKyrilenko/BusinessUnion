<template>
  <div id="app">
    <Navigation v-if="isAuthenticated" />
    <main class="main-content" :class="{ 'with-nav': isAuthenticated }">
      <router-view />
    </main>
    
    <!-- Уведомления -->
    <div class="notifications-container">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :type="notification.type"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, watch } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import { useUserStore } from '@/stores/user'
import { useNotification } from '@/utils/notification'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    Navigation
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()
    const { isAuthenticated } = storeToRefs(userStore)
    const { notifications, remove: removeNotification } = useNotification()

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
    
    // Вызываем проверку при загрузке
    onMounted(() => {
      checkAuth()
    })
    
    // Следим за изменениями авторизации
    watch(isAuthenticated, (newValue) => {
      if (newValue && route.meta.guest) {
        console.log('Пользователь авторизован, перенаправление с гостевой страницы на дашборд')
        router.replace('/dashboard')
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
</style>