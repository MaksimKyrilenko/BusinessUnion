<template>
  <nav class="navigation">
    <div class="nav-brand">
      <router-link to="/dashboard">Business Union</router-link>
    </div>
    
    <div class="nav-links" v-if="isAuthenticated">
      <!-- Общие ссылки для всех пользователей -->
      <router-link to="/dashboard" class="nav-item">
        <i class="fas fa-home"></i>
        <span>Главная</span>
      </router-link>
      <router-link to="/messenger" class="nav-item">
        <i class="fas fa-comments"></i>
        <span>Мессенджер</span>
      </router-link>
      <router-link to="/people" class="nav-item">
        <i class="fas fa-users"></i>
        <span>Люди</span>
      </router-link>
      <router-link to="/financial-analytics" class="nav-item">
        <i class="fas fa-chart-line"></i>
        <span>Финансовая аналитика</span>
      </router-link>

      <!-- Новые общие ссылки -->
      <router-link to="/news" class="nav-item">
        <i class="fas fa-newspaper"></i>
        <span>Новости и события</span>
      </router-link>
      <router-link to="/education" class="nav-item">
        <i class="fas fa-graduation-cap"></i>
        <span>Образование</span>
      </router-link>
      <router-link to="/community" class="nav-item">
        <i class="fas fa-users-rectangle"></i>
        <span>Сообщество</span>
      </router-link>
      <router-link to="/market-analytics" class="nav-item">
        <i class="fas fa-chart-pie"></i>
        <span>Аналитика рынка</span>
      </router-link>
      <router-link to="/projects" class="nav-item">
        <i class="fas fa-folder-open"></i>
        <span>Проекты</span>
      </router-link>

      <!-- Ссылки для стартаперов -->
      <template v-if="userRole === 'startup_founder'">
        <div class="nav-divider"></div>
        <router-link to="/startup/create" class="nav-item">
          <i class="fas fa-rocket"></i>
          <span>Создание стартапа</span>
        </router-link>
        <router-link to="/startup/my-startups" class="nav-item">
          <i class="fas fa-project-diagram"></i>
          <span>Мои стартапы</span>
        </router-link>
        <router-link to="/startup/grants" class="nav-item">
          <i class="fas fa-hand-holding-usd"></i>
          <span>Гранты и субсидии</span>
        </router-link>
      </template>

      <!-- Ссылки для инвесторов -->
      <template v-if="userRole === 'investor'">
        <div class="nav-divider"></div>
        <router-link to="/investor/catalog" class="nav-item">
          <i class="fas fa-list"></i>
          <span>Каталог стартапов</span>
        </router-link>
        <router-link to="/investor/analysis" class="nav-item">
          <i class="fas fa-search-dollar"></i>
          <span>Анализ стартапа</span>
        </router-link>
      </template>

      <!-- Ссылки для бизнесменов -->
      <template v-if="userRole === 'businessman'">
        <div class="nav-divider"></div>
        <router-link to="/businessman/analytics" class="nav-item">
          <i class="fas fa-chart-bar"></i>
          <span>Аналитика рынка</span>
        </router-link>
      </template>

      <!-- Ссылки для крипто-трейдеров -->
      <template v-if="userRole === 'crypto_trader'">
        <div class="nav-divider"></div>
        <router-link to="/crypto/tracker" class="nav-item">
          <i class="fas fa-coins"></i>
          <span>Крипто трекер</span>
        </router-link>
      </template>
    </div>
    
    <!-- Профиль и выход -->
    <div class="nav-profile" v-if="isAuthenticated">
      <router-link to="/profile" class="nav-item">
        <i class="fas fa-user"></i>
        <span>Профиль</span>
      </router-link>
      <a href="#" @click.prevent="logout" class="nav-item">
        <i class="fas fa-sign-out-alt"></i>
        <span>Выйти</span>
      </a>
    </div>
    
    <div class="nav-links" v-else>
      <router-link to="/login" class="nav-item">
        <i class="fas fa-sign-in-alt"></i>
        <span>Войти</span>
      </router-link>
      <router-link to="/register" class="nav-item">
        <i class="fas fa-user-plus"></i>
        <span>Регистрация</span>
      </router-link>
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
  flex-direction: column;
  width: 280px;
  height: 100vh;
  background-color: #fff;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: 1rem 0;
}

.nav-brand {
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196F3;
  text-decoration: none;
}

.nav-links {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item i {
  width: 24px;
  font-size: 1.1rem;
  text-align: center;
}

.nav-item:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.nav-item.router-link-active {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border-right: 3px solid #2196F3;
}

.nav-divider {
  height: 1px;
  background-color: #eee;
  margin: 0.5rem 1.5rem;
}

.nav-profile {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* Стили для скроллбара */
.nav-links::-webkit-scrollbar {
  width: 4px;
}

.nav-links::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.nav-links::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.nav-links::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 768px) {
  .navigation {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .navigation.active {
    transform: translateX(0);
  }
}
</style> 