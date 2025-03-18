<template>
  <nav class="navigation">
    <div class="nav-brand">
      <router-link to="/dashboard">Business Union</router-link>
    </div>
    
    <div class="nav-links" v-if="isAuthenticated">
      <!-- Общие ссылки для всех пользователей -->
      <router-link to="/dashboard" class="nav-item">
        <i class="fas fa-home"></i>
        Главная
      </router-link>
      <router-link to="/messenger" class="nav-item">
        <i class="fas fa-comments"></i>
        Мессенджер
      </router-link>
      <router-link to="/people" class="nav-item">
        <i class="fas fa-users"></i>
        Люди
      </router-link>
      <router-link to="/financial-analytics" class="nav-item">
        <i class="fas fa-chart-line"></i>
        Финансовая аналитика
      </router-link>

      <!-- Ссылки для стартаперов -->
      <template v-if="userRole === 'startup_founder'">
        <router-link to="/startup/create" class="nav-item">
          <i class="fas fa-rocket"></i>
          Создание стартапа
        </router-link>
        <router-link to="/startup/my-startups" class="nav-item">
          <i class="fas fa-project-diagram"></i>
          Мои стартапы
        </router-link>
        <router-link to="/startup/grants" class="nav-item">
          <i class="fas fa-hand-holding-usd"></i>
          Гранты и субсидии
        </router-link>
      </template>

      <!-- Ссылки для инвесторов -->
      <template v-if="userRole === 'investor'">
        <router-link to="/investor/catalog" class="nav-item">
          <i class="fas fa-list"></i>
          Каталог стартапов
        </router-link>
        <router-link to="/investor/analysis" class="nav-item">
          <i class="fas fa-search-dollar"></i>
          Анализ стартапа
        </router-link>
      </template>

      <!-- Ссылки для бизнесменов -->
      <template v-if="userRole === 'businessman'">
        <router-link to="/businessman/analytics" class="nav-item">
          <i class="fas fa-chart-bar"></i>
          Аналитика рынка
        </router-link>
      </template>

      <!-- Ссылки для крипто-трейдеров -->
      <template v-if="userRole === 'crypto_trader'">
        <router-link to="/crypto/tracker" class="nav-item">
          <i class="fas fa-coins"></i>
          Крипто трекер
        </router-link>
      </template>

      <!-- Профиль и выход -->
      <div class="nav-profile">
        <router-link to="/profile" class="nav-item">
          <i class="fas fa-user"></i>
          Профиль
        </router-link>
        <a href="#" @click.prevent="logout" class="nav-item">
          <i class="fas fa-sign-out-alt"></i>
          Выйти
        </a>
      </div>
    </div>
    
    <div class="nav-links" v-else>
      <router-link to="/login">Войти</router-link>
      <router-link to="/register">Регистрация</router-link>
    </div>
  </nav>
</template>

<script>
import { defineComponent } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'Navigation',
  setup() {
    const userStore = useUserStore()
    const { isAuthenticated, userRole } = storeToRefs(userStore)
    
    const logout = async () => {
      await userStore.logout()
    }

    return {
      isAuthenticated,
      userRole,
      logout
    }
  }
})
</script>

<style scoped>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196F3;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.nav-item i {
  font-size: 1.1rem;
}

.nav-item:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.nav-item.router-link-active {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.nav-profile {
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 1200px) {
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    padding: 0.5rem;
  }
  
  .nav-item i {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .navigation {
    padding: 0.5rem 1rem;
  }
  
  .nav-links {
    display: none;
  }
}
</style> 