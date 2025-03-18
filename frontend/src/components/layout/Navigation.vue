<template>
  <nav class="navigation">
    <div class="nav-brand">
      <router-link to="/">Business Union</router-link>
    </div>
    
    <div class="nav-links" v-if="isAuthenticated">
      <router-link to="/dashboard">Главная</router-link>
      <router-link to="/projects">Проекты</router-link>
      <router-link to="/messages">Сообщения</router-link>
      <router-link to="/profile">Профиль</router-link>
      <a href="#" @click.prevent="logout">Выйти</a>
    </div>
    
    <div class="nav-links" v-else>
      <router-link to="/login">Войти</router-link>
      <router-link to="/register">Регистрация</router-link>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

export default {
  name: 'Navigation',
  setup() {
    const userStore = useUserStore()
    const { isAuthenticated } = storeToRefs(userStore)
    
    const logout = async () => {
      await userStore.logout()
    }

    return {
      isAuthenticated,
      logout
    }
  }
}
</script>

<style scoped>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
  text-decoration: none;
}

.nav-links a {
  margin-left: 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  color: #28a745;
}

.nav-links a.router-link-active {
  color: #28a745;
}
</style> 