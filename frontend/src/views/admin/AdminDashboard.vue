<template>
  <div class="admin-dashboard">
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Загрузка...
    </div>
    
    <template v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview?.totalUsers || 0 }}</span>
            <span class="stat-label">Пользователей</span>
            <span class="stat-change positive">
              +{{ stats.overview?.recentUsers || 0 }} за 30 дней
            </span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon projects">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview?.totalProjects || 0 }}</span>
            <span class="stat-label">Проектов</span>
            <span class="stat-change positive">
              +{{ stats.overview?.recentProjects || 0 }} за 30 дней
            </span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon investments">
            <i class="fas fa-hand-holding-usd"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ formatMoney(stats.investmentStats?.totalAmount || 0) }}</span>
            <span class="stat-label">Инвестиций</span>
            <span class="stat-change">
              {{ stats.investmentStats?.count || 0 }} сделок
            </span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon communities">
            <i class="fas fa-users-cog"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview?.totalCommunities || 0 }}</span>
            <span class="stat-label">Сообществ</span>
          </div>
        </div>
      </div>
      
      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>Пользователи по типам</h3>
          <div class="user-types">
            <div v-for="item in stats.usersByType" :key="item.type" class="type-item">
              <div class="type-bar">
                <div 
                  class="type-fill" 
                  :style="{ width: getUserTypePercent(item.count) + '%', background: getUserTypeColor(item.type) }"
                ></div>
              </div>
              <div class="type-info">
                <span class="type-name">{{ getUserTypeName(item.type) }}</span>
                <span class="type-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-card">
          <h3>Проекты по статусам</h3>
          <div class="status-grid">
            <div v-for="item in stats.projectsByStatus" :key="item.status" class="status-item">
              <div class="status-icon" :class="item.status">
                <i :class="getStatusIcon(item.status)"></i>
              </div>
              <div class="status-info">
                <span class="status-count">{{ item.count }}</span>
                <span class="status-name">{{ getStatusName(item.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Быстрые действия</h3>
        <div class="actions-grid">
          <router-link to="/admin/users" class="action-card">
            <i class="fas fa-user-plus"></i>
            <span>Управление пользователями</span>
          </router-link>
          <router-link to="/admin/projects" class="action-card">
            <i class="fas fa-tasks"></i>
            <span>Модерация проектов</span>
          </router-link>
          <router-link to="/admin/analytics" class="action-card">
            <i class="fas fa-chart-pie"></i>
            <span>Подробная аналитика</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: true,
      stats: {}
    };
  },
  async mounted() {
    await this.loadStats();
  },
  methods: {
    async loadStats() {
      try {
        const response = await api.get('/admin/dashboard');
        this.stats = response.data;
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        this.loading = false;
      }
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount);
    },
    getUserTypePercent(count) {
      const total = this.stats.usersByType?.reduce((sum, item) => sum + parseInt(item.count), 0) || 1;
      return (count / total) * 100;
    },
    getUserTypeColor(type) {
      const colors = {
        startup_founder: '#4F8FFF',
        investor: '#10B981',
        businessman: '#F59E0B',
        crypto_trader: '#8B5CF6',
        admin: '#EF4444'
      };
      return colors[type] || '#64748B';
    },
    getUserTypeName(type) {
      const names = {
        startup_founder: 'Стартаперы',
        investor: 'Инвесторы',
        businessman: 'Бизнесмены',
        crypto_trader: 'Крипто-трейдеры',
        admin: 'Администраторы'
      };
      return names[type] || type;
    },
    getStatusIcon(status) {
      const icons = {
        pending: 'fas fa-clock',
        active: 'fas fa-check-circle',
        completed: 'fas fa-flag-checkered',
        cancelled: 'fas fa-times-circle'
      };
      return icons[status] || 'fas fa-question';
    },
    getStatusName(status) {
      const names = {
        pending: 'На модерации',
        active: 'Активные',
        completed: 'Завершённые',
        cancelled: 'Отменённые'
      };
      return names[status] || status;
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.users { background: #EFF6FF; color: #3B82F6; }
.stat-icon.projects { background: #F0FDF4; color: #22C55E; }
.stat-icon.investments { background: #FEF3C7; color: #F59E0B; }
.stat-icon.communities { background: #F3E8FF; color: #A855F7; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.stat-change {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.stat-change.positive {
  color: #22C55E;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.chart-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 1.5rem 0;
}

.user-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.type-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.type-name {
  color: #64748b;
}

.type-count {
  font-weight: 600;
  color: #1a1a2e;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.pending { background: #FEF3C7; color: #F59E0B; }
.status-icon.active { background: #D1FAE5; color: #10B981; }
.status-icon.completed { background: #DBEAFE; color: #3B82F6; }
.status-icon.cancelled { background: #FEE2E2; color: #EF4444; }

.status-info {
  display: flex;
  flex-direction: column;
}

.status-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
}

.status-name {
  font-size: 0.75rem;
  color: #64748b;
}

.quick-actions {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.quick-actions h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 1rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  text-decoration: none;
  color: #1a1a2e;
  transition: all 0.2s;
}

.action-card:hover {
  background: #4F8FFF;
  color: white;
}

.action-card i {
  font-size: 1.25rem;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
