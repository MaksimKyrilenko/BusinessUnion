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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

:root {
  --primary-color: #7C4DFF;
  --primary-hover: #651FFF;
  --text-primary: #ffffff;
  --text-secondary: #B3B3B3;
  --background: #000000;
  --card-background: rgba(45, 45, 45, 0.5);
  --card-hover: rgba(51, 51, 51, 0.7);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background: var(--background);
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.02em;
}

#app {
  width: 100%;
  min-height: 100vh;
  background: var(--background);
  margin: 0;
  padding: 0;
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