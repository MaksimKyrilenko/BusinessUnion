<template>
  <div class="mobile-nav" :class="{ 'is-open': isOpen }">
    <button class="menu-toggle" @click="toggleMenu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <div class="mobile-menu">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        @click="closeMenu"
      >
        {{ item.name }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileNav',
  data() {
    return {
      isOpen: false,
      menuItems: [
        { name: 'Главная', path: '/dashboard' },
        { name: 'Проекты', path: '/projects' },
        { name: 'Сообщения', path: '/messages' },
        { name: 'Профиль', path: '/profile' }
      ]
    }
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen
      document.body.style.overflow = this.isOpen ? 'hidden' : ''
    },
    closeMenu() {
      this.isOpen = false
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.mobile-nav {
  display: none;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--text-color);
  transition: 0.3s;
}

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--card-background);
  padding: 20px;
  transform: translateX(-100%);
  transition: 0.3s;
}

.is-open .mobile-menu {
  transform: translateX(0);
}

.mobile-menu a {
  display: block;
  padding: 15px;
  color: var(--text-color);
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .mobile-nav {
    display: block;
  }
}
</style> 