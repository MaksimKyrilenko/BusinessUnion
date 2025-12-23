<template>
  <nav class="navigation">
    <div class="nav-brand">
      <router-link to="/dashboard" class="brand-link">
        <img src="@/assets/icon.png" alt="Logo" class="brand-icon" />
        <span class="brand-text">BusinessUnion</span>
      </router-link>
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
        <span v-if="unreadMessagesCount > 0" class="unread-badge">{{ unreadMessagesCount > 99 ? '99+' : unreadMessagesCount }}</span>
      </router-link>
      <router-link to="/people" class="nav-item">
        <i class="fas fa-users"></i>
        <span>Поиск партнеров</span>
      </router-link>
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
        <span>Сообщества</span>
      </router-link>
      <router-link to="/market-analytics" class="nav-item">
        <i class="fas fa-chart-pie"></i>
        <span>Аналитика рынка</span>
      </router-link>
      
      <!-- Остальные ссылки -->
      <router-link v-if="userType === 'startup_founder'" to="/startup/my-startups" class="nav-item">
        <i class="fas fa-project-diagram"></i>
        <span>Мои стартапы</span>
      </router-link>
      <router-link to="/startups" class="nav-item">
        <i class="fas fa-list"></i>
        <span>Каталог стартапов</span>
      </router-link>
      <router-link to="/investor/analysis" class="nav-item">
        <i class="fas fa-search-dollar"></i>
        <span>Анализ стартапа</span>
      </router-link>
      <router-link to="/businessman/analytics" class="nav-item">
        <i class="fas fa-chart-bar"></i>
        <span>Бизнес аналитика</span>
      </router-link>
      <router-link to="/crypto/tracker" class="nav-item">
        <i class="fas fa-coins"></i>
        <span>Крипто трекер</span>
      </router-link>
      
      <!-- Админ-панель (только для админов) -->
      <router-link v-if="userType === 'admin'" to="/admin" class="nav-item admin-link">
        <i class="fas fa-shield-halved"></i>
        <span>Админ-панель</span>
      </router-link>
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
import { defineComponent, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessengerStore } from '@/stores/messenger'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'Navigation',
  setup() {
    const userStore = useUserStore()
    const messengerStore = useMessengerStore()
    const { isAuthenticated } = storeToRefs(userStore)
    const { totalUnreadCount } = storeToRefs(messengerStore)
    
    // Используем computed для реактивного получения типа пользователя
    const userType = computed(() => userStore.user?.userType || localStorage.getItem('userType'))
    
    // Количество непрочитанных сообщений
    const unreadMessagesCount = computed(() => totalUnreadCount.value)
    
    // Загружаем количество непрочитанных при монтировании
    onMounted(() => {
      if (userStore.isAuthenticated) {
        messengerStore.loadUnreadCount()
      }
    })
    
    const logout = async () => {
      // Добавляем подтверждение выхода
      if (confirm('Вы действительно хотите выйти из системы?')) {
        console.log('Подтвержден выход из системы');
        
        try {
          // Сначала отключаем реактивные обновления, чтобы избежать проблем с Vue
          const result = await userStore.logout();
          console.log('Результат выхода:', result);
          
          // Сразу останавливаем дальнейшее выполнение JavaScript после начала выхода
          // Это поможет предотвратить ошибки рендеринга во Vue
          return;
        } catch (error) {
          console.error('Ошибка при выходе из системы:', error);
          alert('Произошла ошибка при выходе из системы');
        }
      } else {
        console.log('Выход отменен пользователем');
      }
    }

    return {
      isAuthenticated,
      userType,
      unreadMessagesCount,
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

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.nav-brand .brand-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.nav-brand .brand-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196F3;
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

/* Badge для непрочитанных сообщений */
.unread-badge {
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  margin-left: auto;
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

/* Стиль для ссылки админ-панели */
.nav-item.admin-link {
  color: #9c27b0;
  background: rgba(156, 39, 176, 0.05);
  border-left: 3px solid #9c27b0;
}

.nav-item.admin-link:hover {
  background: rgba(156, 39, 176, 0.15);
  color: #7b1fa2;
}

.nav-item.admin-link.router-link-active {
  background: rgba(156, 39, 176, 0.15);
  color: #7b1fa2;
  border-right: 3px solid #9c27b0;
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