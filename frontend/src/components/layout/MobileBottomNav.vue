<template>
  <nav class="mobile-bottom-nav" v-if="isAuthenticated">
    <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
      <i class="fas fa-home"></i>
      <span>Главная</span>
    </router-link>
    
    <router-link to="/messenger" class="nav-item" :class="{ active: isActive('/messenger') }">
      <i class="fas fa-comments"></i>
      <span>Чаты</span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </router-link>
    
    <router-link to="/startups" class="nav-item" :class="{ active: isActive('/startups') }">
      <i class="fas fa-rocket"></i>
      <span>Стартапы</span>
    </router-link>
    
    <router-link to="/community" class="nav-item" :class="{ active: isActive('/community') }">
      <i class="fas fa-users"></i>
      <span>Сообщества</span>
    </router-link>
    
    <button class="nav-item" @click="showMoreMenu = !showMoreMenu">
      <i class="fas fa-ellipsis-h"></i>
      <span>Ещё</span>
    </button>
    
    <!-- More menu overlay -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="showMoreMenu" class="more-menu-overlay" @click="showMoreMenu = false">
          <div class="more-menu" @click.stop>
            <div class="more-menu-header">
              <span>Меню</span>
              <button class="close-btn" @click="showMoreMenu = false">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="more-menu-items">
              <router-link to="/people" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-user-friends"></i>
                <span>Люди</span>
              </router-link>
              
              <router-link to="/news" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-newspaper"></i>
                <span>Новости</span>
              </router-link>
              
              <router-link to="/education" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-graduation-cap"></i>
                <span>Образование</span>
              </router-link>
              
              <router-link to="/market-analytics" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-chart-pie"></i>
                <span>Аналитика</span>
              </router-link>
              
              <router-link to="/crypto/tracker" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-coins"></i>
                <span>Крипто</span>
              </router-link>
              
              <router-link v-if="userType === 'startup_founder'" to="/startup/my-startups" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-project-diagram"></i>
                <span>Мои стартапы</span>
              </router-link>
              
              <router-link to="/businessman/analytics" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-chart-bar"></i>
                <span>Бизнес аналитика</span>
              </router-link>
              
              <router-link v-if="userType === 'admin'" to="/admin" class="menu-item admin" @click="showMoreMenu = false">
                <i class="fas fa-shield-halved"></i>
                <span>Админ-панель</span>
              </router-link>
              
              <div class="menu-divider"></div>
              
              <router-link to="/profile" class="menu-item" @click="showMoreMenu = false">
                <i class="fas fa-user"></i>
                <span>Профиль</span>
              </router-link>
              
              <button class="menu-item logout" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessengerStore } from '@/stores/messenger'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'MobileBottomNav',
  setup() {
    const route = useRoute()
    const userStore = useUserStore()
    const messengerStore = useMessengerStore()
    const { isAuthenticated } = storeToRefs(userStore)
    const { totalUnreadCount } = storeToRefs(messengerStore)
    
    const showMoreMenu = ref(false)
    
    const userType = computed(() => userStore.user?.userType || localStorage.getItem('userType'))
    const unreadCount = computed(() => totalUnreadCount.value)
    
    const isActive = (path) => {
      return route.path === path || route.path.startsWith(path + '/')
    }
    
    const handleLogout = async () => {
      showMoreMenu.value = false
      if (confirm('Вы действительно хотите выйти?')) {
        await userStore.logout()
      }
    }
    
    return {
      isAuthenticated,
      showMoreMenu,
      userType,
      unreadCount,
      isActive,
      handleLogout
    }
  }
})
</script>

<style scoped>
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: #64748b;
  text-decoration: none;
  font-size: 0.65rem;
  gap: 0.2rem;
  transition: color 0.2s;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.nav-item.active,
.nav-item.router-link-active {
  color: #2563eb;
}

.nav-item .badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 18px);
  background: #ef4444;
  color: #fff;
  font-size: 0.55rem;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  font-weight: 600;
}

/* More menu overlay */
.more-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.more-menu {
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.more-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
}

.more-menu-header span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.more-menu-items {
  padding: 12px 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  color: #1e293b;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.menu-item:active {
  background: #f1f5f9;
}

.menu-item i {
  width: 24px;
  font-size: 1.1rem;
  color: #64748b;
  text-align: center;
}

.menu-item.admin {
  color: #9333ea;
}

.menu-item.admin i {
  color: #9333ea;
}

.menu-item.logout {
  color: #ef4444;
}

.menu-item.logout i {
  color: #ef4444;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 20px;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-active .more-menu,
.slide-up-leave-active .more-menu {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .more-menu,
.slide-up-leave-to .more-menu {
  transform: translateY(100%);
}

/* Dark mode */
[data-theme="dark"] .mobile-bottom-nav {
  background: #1e293b;
  border-top-color: #334155;
}

[data-theme="dark"] .nav-item {
  color: #94a3b8;
}

[data-theme="dark"] .nav-item.active {
  color: #60a5fa;
}

[data-theme="dark"] .more-menu {
  background: #1e293b;
}

[data-theme="dark"] .more-menu-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

[data-theme="dark"] .more-menu-header span {
  color: #f1f5f9;
}

[data-theme="dark"] .menu-item {
  color: #f1f5f9;
}

[data-theme="dark"] .close-btn {
  background: #334155;
  color: #94a3b8;
}
</style>
