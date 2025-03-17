<template>
  <div id="app">
    <Navigation v-if="isAuthenticated" />
    <main class="main-content">
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
      await userStore.loadUser()
      
      // Если пользователь не аутентифицирован и находится на защищенном маршруте
      if (!isAuthenticated.value && router.currentRoute.value.meta.requiresAuth) {
        router.push('/login')
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.initial-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
}

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Глобальные стили */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--background-color);
}
</style>