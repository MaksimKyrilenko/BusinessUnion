<template>
  <div class="admin-analytics">
    <div class="period-selector">
      <button :class="{ active: period === 7 }" @click="setPeriod(7)">7 дней</button>
      <button :class="{ active: period === 30 }" @click="setPeriod(30)">30 дней</button>
      <button :class="{ active: period === 90 }" @click="setPeriod(90)">90 дней</button>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Загрузка...
    </div>
    
    <template v-else>
      <div class="charts-grid">
        <div class="chart-card">
          <h3><i class="fas fa-user-plus"></i> Регистрации пользователей</h3>
          <div class="chart-container">
            <div class="simple-chart">
              <div 
                v-for="(item, index) in registrationStats" 
                :key="index" 
                class="chart-bar"
                :style="{ height: getBarHeight(item.count, maxRegistrations) + '%' }"
                :title="`${item.date}: ${item.count}`"
              ></div>
            </div>
            <div class="chart-labels">
              <span>{{ formatShortDate(registrationStats[0]?.date) }}</span>
              <span>{{ formatShortDate(registrationStats[registrationStats.length - 1]?.date) }}</span>
            </div>
          </div>
          <div class="chart-summary">
            <span class="total">Всего: {{ totalRegistrations }}</span>
          </div>
        </div>
        
        <div class="chart-card">
          <h3><i class="fas fa-project-diagram"></i> Новые проекты</h3>
          <div class="chart-container">
            <div class="simple-chart">
              <div 
                v-for="(item, index) in projectStats" 
                :key="index" 
                class="chart-bar projects"
                :style="{ height: getBarHeight(item.count, maxProjects) + '%' }"
                :title="`${item.date}: ${item.count}`"
              ></div>
            </div>
            <div class="chart-labels">
              <span>{{ formatShortDate(projectStats[0]?.date) }}</span>
              <span>{{ formatShortDate(projectStats[projectStats.length - 1]?.date) }}</span>
            </div>
          </div>
          <div class="chart-summary">
            <span class="total">Всего: {{ totalProjects }}</span>
          </div>
        </div>
        
        <div class="chart-card full-width">
          <h3><i class="fas fa-hand-holding-usd"></i> Инвестиции</h3>
          <div class="chart-container">
            <div class="simple-chart wide">
              <div 
                v-for="(item, index) in investmentStats" 
                :key="index" 
                class="chart-bar investments"
                :style="{ height: getBarHeight(item.amount, maxInvestment) + '%' }"
                :title="`${item.date}: ${formatMoney(item.amount)}`"
              ></div>
            </div>
            <div class="chart-labels">
              <span>{{ formatShortDate(investmentStats[0]?.date) }}</span>
              <span>{{ formatShortDate(investmentStats[investmentStats.length - 1]?.date) }}</span>
            </div>
          </div>
          <div class="chart-summary">
            <span class="total">Всего: {{ formatMoney(totalInvestments) }}</span>
            <span class="count">{{ totalInvestmentCount }} сделок</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AdminAnalytics',
  data() {
    return {
      loading: true,
      period: 30,
      registrationStats: [],
      projectStats: [],
      investmentStats: []
    };
  },
  computed: {
    maxRegistrations() {
      return Math.max(...this.registrationStats.map(i => parseInt(i.count) || 0), 1);
    },
    maxProjects() {
      return Math.max(...this.projectStats.map(i => parseInt(i.count) || 0), 1);
    },
    maxInvestment() {
      return Math.max(...this.investmentStats.map(i => parseFloat(i.amount) || 0), 1);
    },
    totalRegistrations() {
      return this.registrationStats.reduce((sum, i) => sum + parseInt(i.count || 0), 0);
    },
    totalProjects() {
      return this.projectStats.reduce((sum, i) => sum + parseInt(i.count || 0), 0);
    },
    totalInvestments() {
      return this.investmentStats.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    },
    totalInvestmentCount() {
      return this.investmentStats.reduce((sum, i) => sum + parseInt(i.count || 0), 0);
    }
  },
  async mounted() {
    await this.loadStats();
  },
  methods: {
    async loadStats() {
      this.loading = true;
      try {
        const [reg, proj, inv] = await Promise.all([
          api.get(`/admin/analytics/registrations?days=${this.period}`),
          api.get(`/admin/analytics/projects?days=${this.period}`),
          api.get(`/admin/analytics/investments?days=${this.period}`)
        ]);
        this.registrationStats = reg.data;
        this.projectStats = proj.data;
        this.investmentStats = inv.data;
      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error);
      } finally {
        this.loading = false;
      }
    },
    setPeriod(days) {
      this.period = days;
      this.loadStats();
    },
    getBarHeight(value, max) {
      return Math.max(5, (value / max) * 100);
    },
    formatShortDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount || 0);
    }
  }
}
</script>

<style scoped>
.admin-analytics { max-width: 1400px; }

.period-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.period-selector button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.period-selector button.active {
  background: #4F8FFF;
  color: white;
  border-color: #4F8FFF;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #64748b;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-card h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 1.5rem 0;
}

.chart-card h3 i {
  color: #4F8FFF;
}

.chart-container {
  margin-bottom: 1rem;
}

.simple-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  padding: 0 0.5rem;
}

.simple-chart.wide {
  height: 150px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #4F8FFF, #1E6BFF);
  border-radius: 4px 4px 0 0;
  min-height: 5px;
  transition: height 0.3s ease;
}

.chart-bar.projects {
  background: linear-gradient(180deg, #10B981, #059669);
}

.chart-bar.investments {
  background: linear-gradient(180deg, #F59E0B, #D97706);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.5rem;
  padding: 0 0.5rem;
}

.chart-summary {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.chart-summary .total {
  font-weight: 600;
  color: #1a1a2e;
}

.chart-summary .count {
  color: #64748b;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
