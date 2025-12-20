<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <i class="fas fa-shield-alt"></i>
          <span>Админ-панель</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          <i class="fas fa-chart-line"></i>
          <span>Дашборд</span>
        </router-link>
        
        <router-link to="/admin/users" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>Пользователи</span>
        </router-link>
        
        <router-link to="/admin/projects" class="nav-item" active-class="active">
          <i class="fas fa-project-diagram"></i>
          <span>Проекты</span>
        </router-link>
        
        <router-link to="/admin/investments" class="nav-item" active-class="active">
          <i class="fas fa-hand-holding-usd"></i>
          <span>Инвестиции</span>
        </router-link>
        
        <router-link to="/admin/communities" class="nav-item" active-class="active">
          <i class="fas fa-users-cog"></i>
          <span>Сообщества</span>
        </router-link>
        
        <router-link to="/admin/analytics" class="nav-item" active-class="active">
          <i class="fas fa-chart-bar"></i>
          <span>Аналитика</span>
        </router-link>
      </nav>
      
    </aside>
    
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-title">
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="header-actions">
          <div class="admin-user">
            <span>{{ userName }}</span>
            <i class="fas fa-user-shield"></i>
          </div>
        </div>
      </header>
      
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  computed: {
    pageTitle() {
      const titles = {
        '/admin': 'Дашборд',
        '/admin/users': 'Пользователи',
        '/admin/projects': 'Проекты',
        '/admin/investments': 'Инвестиции',
        '/admin/communities': 'Сообщества',
        '/admin/analytics': 'Аналитика',
      };
      return titles[this.$route.path] || 'Админ-панель';
    },
    userName() {
      const firstName = localStorage.getItem('firstName') || 'Админ';
      return firstName;
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

.admin-sidebar {
  width: 280px;
  background: #ffffff;
  color: #1a1a2e;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
  border-right: 1px solid #e5e7eb;
}

.sidebar-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
}

.logo i {
  font-size: 1.5rem;
  color: #4F8FFF;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f8fafc;
  color: #1a1a2e;
}

.nav-item.active {
  background: rgba(79, 143, 255, 0.1);
  color: #4F8FFF;
  border-left-color: #4F8FFF;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.admin-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: white;
  padding: 1rem 2rem;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid #e5e7eb;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.admin-user i {
  color: #4F8FFF;
}

.admin-content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    width: 70px;
  }
  
  .sidebar-header span,
  .nav-item span {
    display: none;
  }
  
  .admin-main {
    margin-left: 70px;
  }
  
  .nav-item {
    justify-content: center;
    padding: 1rem;
  }
  
  .nav-item i {
    font-size: 1.25rem;
  }
}
</style>
