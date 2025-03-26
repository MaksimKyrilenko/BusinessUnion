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
import { defineComponent, onMounted } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import { useUserStore } from '@/stores/user'
import { useNotification } from '@/utils/notification'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    Navigation
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const { isAuthenticated } = storeToRefs(userStore)
    const { notifications, remove: removeNotification } = useNotification()

    onMounted(async () => {
      const token = localStorage.getItem('token')
      if (token && !userStore.isAuthenticated) {
        try {
          const success = await userStore.loadUser()
          if (!success && router.currentRoute.value.meta.requiresAuth) {
            router.push('/login')
          }
        } catch (error) {
          console.error('Ошибка при загрузке пользователя:', error)
          if (router.currentRoute.value.meta.requiresAuth) {
            router.push('/login')
          }
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
</style>