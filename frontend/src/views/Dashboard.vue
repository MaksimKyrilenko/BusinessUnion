<template>
  <div class="dashboard">
    <!-- Общая информация -->
    <div class="dashboard-header">
      <h1>Добро пожаловать, {{ userStore.userName }}!</h1>
      <p class="last-update">Последнее обновление: {{ new Date().toLocaleString() }}</p>
    </div>

    <div class="dashboard-grid">
      <!-- Курсы валют -->
      <div class="dashboard-card exchange-rates">
        <div class="card-header">
          <h2>Курсы валют</h2>
          <div class="currency-selector">
            <button @click="isSelectOpen = !isSelectOpen" class="select-trigger">
              Выбрать валюты
              <span class="arrow" :class="{ 'open': isSelectOpen }">▼</span>
            </button>
            <div class="select-dropdown" :class="{ 'open': isSelectOpen }">
              <div class="select-search">
                <input type="text" 
                       v-model="currencySearch" 
                       placeholder="Поиск валюты..."
                       @input="filterCurrencies">
              </div>
              <div class="select-options">
                <label v-for="currency in filteredCurrencies" 
                       :key="currency.code" 
                       class="select-option">
                  <input type="checkbox" 
                         :value="currency.code"
                         v-model="selectedCurrencies">
                  <span class="option-text">
                    {{ currency.name }} ({{ currency.code }})
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="card-content" :class="{ 'is-loading': loading.rates }">
          <div v-if="!loading.rates" class="rates-grid">
            <div v-for="currency in selectedCurrencies" 
                 :key="currency" 
                 class="rate-item">
              <div class="rate-header">
                <span class="currency-code">{{ currency }}</span>
                <span class="currency-name">
                  {{ availableCurrencies.find(c => c.code === currency)?.name }}
                </span>
              </div>
              <div class="rate-value">
                <span class="current-rate">
                  {{ exchangeRates[currency]?.rate || '—' }}
                </span>
                <span class="rate-change" 
                      :class="{ 
                        'positive': exchangeRates[currency]?.change > 0,
                        'negative': exchangeRates[currency]?.change < 0 
                      }">
                  {{ exchangeRates[currency]?.change > 0 ? '+' : '' }}
                  {{ exchangeRates[currency]?.change }}%
                </span>
              </div>
            </div>
          </div>
          <div v-else class="loader">Загрузка курсов валют...</div>
        </div>
      </div>

      <!-- Сообщения -->
      <div class="dashboard-card messages">
        <div class="card-header">
          <h2>Сообщения</h2>
          <router-link to="/messenger" class="view-all">Все сообщения</router-link>
        </div>
        <div class="card-content" :class="{ 'is-loading': loading.messages }">
          <div v-if="!loading.messages" class="messages-summary">
            <div class="message-category">
              <div class="category-header">
                <span class="category-icon">👥</span>
                <span class="category-title">Личные сообщения</span>
              </div>
              <div class="category-count">
                <span class="count-number">{{ messageStats.personal }}</span>
                <span class="count-label">непрочитанных</span>
              </div>
            </div>
            <div class="message-category">
              <div class="category-header">
                <span class="category-icon">👥</span>
                <span class="category-title">Групповые чаты</span>
              </div>
              <div class="category-count">
                <span class="count-number">{{ messageStats.group }}</span>
                <span class="count-label">непрочитанных</span>
              </div>
            </div>
            <div class="message-category">
              <div class="category-header">
                <span class="category-icon">📢</span>
                <span class="category-title">Уведомления</span>
              </div>
              <div class="category-count">
                <span class="count-number">{{ messageStats.notifications }}</span>
                <span class="count-label">непрочитанных</span>
              </div>
            </div>
          </div>
          <div v-else class="loader">Загрузка сообщений...</div>
        </div>
      </div>

      <!-- Сообщество -->
      <div class="dashboard-card community">
        <div class="card-header">
          <h2>Сообщество</h2>
          <router-link to="/community" class="view-all">Перейти в сообщество</router-link>
        </div>
        <div class="card-content" :class="{ 'is-loading': loading.community }">
          <div v-if="!loading.community" class="community-stats">
            <div class="stat-item">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <span class="stat-value">{{ communityStats.totalMembers }}</span>
                <span class="stat-label">Участников</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">💬</div>
              <div class="stat-info">
                <span class="stat-value">{{ communityStats.activeDiscussions }}</span>
                <span class="stat-label">Активных обсуждений</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-value">{{ communityStats.yourContributions }}</span>
                <span class="stat-label">Ваших публикаций</span>
              </div>
            </div>
          </div>
          <div v-else class="loader">Загрузка данных сообщества...</div>
        </div>
      </div>

      <!-- Образование -->
      <div class="dashboard-card education">
        <div class="card-header">
          <h2>Образование</h2>
          <router-link to="/education" class="view-all">Все курсы</router-link>
        </div>
        <div class="card-content" :class="{ 'is-loading': loading.education }">
          <div v-if="!loading.education" class="education-content">
            <div class="section">
              <h3>Рекомендуемые курсы</h3>
              <div class="courses-list">
                <div v-for="course in recommendedCourses" :key="course.id" class="course-item">
                  <div class="course-icon">{{ course.icon }}</div>
                  <div class="course-info">
                    <h4>{{ course.title }}</h4>
                    <p>{{ course.description }}</p>
                    <div class="course-meta">
                      <span class="duration">{{ course.duration }}</span>
                      <span class="level">{{ course.level }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="loader">Загрузка курсов...</div>
        </div>
      </div>

      <!-- Аналитика рынка -->
      <div class="dashboard-card market-analytics">
        <div class="card-header">
          <h2>Аналитика рынка</h2>
          <router-link to="/market-analytics" class="view-all">Подробная аналитика</router-link>
        </div>
        <div class="card-content" :class="{ 'is-loading': loading.analytics }">
          <div v-if="!loading.analytics" class="analytics-content">
            <div class="section">
              <h3>Тренды рынка</h3>
              <div class="market-trends">
                <div v-for="trend in marketTrends" :key="trend.id" class="trend-item">
                  <div class="trend-header">
                    <span class="trend-category">{{ trend.category }}</span>
                    <span class="trend-value" :class="trend.change >= 0 ? 'positive' : 'negative'">
                      {{ trend.change > 0 ? '+' : '' }}{{ trend.change }}%
                    </span>
                  </div>
                  <h4>{{ trend.title }}</h4>
                  <p>{{ trend.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="loader">Загрузка трендов...</div>
        </div>
      </div>
    </div>

    <!-- Специфичные дашборды для разных типов пользователей -->
    <BusinessmanDashboard v-if="userRole === 'businessman'" />
    <StartupFounderDashboard v-if="userRole === 'startup_founder'" />
    <InvestorDashboard v-if="userRole === 'investor'" />
    <CryptoTraderDashboard v-if="userRole === 'crypto_trader'" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import BusinessmanDashboard from '@/components/dashboards/BusinessmanDashboard.vue'
import StartupFounderDashboard from '@/components/dashboards/StartupFounderDashboard.vue'
import InvestorDashboard from '@/components/dashboards/InvestorDashboard.vue'
import CryptoTraderDashboard from '@/components/dashboards/CryptoTraderDashboard.vue'

export default defineComponent({
  name: 'Dashboard',
  components: {
    BusinessmanDashboard,
    StartupFounderDashboard,
    InvestorDashboard,
    CryptoTraderDashboard
  },
  setup() {
    const userStore = useUserStore()
    const userRole = ref('')
    const isSelectOpen = ref(false)
    const currencySearch = ref('')
    const selectedCurrencies = ref(['USD', 'EUR', 'RUB', 'GBP', 'CNY'])
    const availableCurrencies = ref([
      { code: 'USD', name: 'Доллар США' },
      { code: 'EUR', name: 'Евро' },
      { code: 'RUB', name: 'Российский рубль' },
      { code: 'GBP', name: 'Британский фунт' },
      { code: 'CNY', name: 'Китайский юань' },
      { code: 'JPY', name: 'Японская иена' },
      { code: 'CHF', name: 'Швейцарский франк' },
      { code: 'AUD', name: 'Австралийский доллар' }
    ])

    const filteredCurrencies = computed(() => {
      const search = currencySearch.value.toLowerCase()
      return availableCurrencies.value.filter(currency => 
        currency.name.toLowerCase().includes(search) || 
        currency.code.toLowerCase().includes(search)
      )
    })

    const exchangeRates = ref({})
    const messageStats = ref({
      personal: 0,
      group: 0,
      notifications: 0
    })
    const communityStats = ref({
      totalMembers: 0,
      activeDiscussions: 0,
      yourContributions: 0
    })
    const recommendedCourses = ref([])
    const marketTrends = ref([])
    const loading = ref({
      rates: false,
      messages: false,
      community: false,
      education: false,
      analytics: false
    })

    const fetchExchangeRates = async () => {
      loading.value.rates = true
      try {
        const response = await fetch('/api/dashboard/exchange-rates')
        const data = await response.json()
        exchangeRates.value = data
      } catch (error) {
        console.error('Ошибка при загрузке курсов валют:', error)
      } finally {
        loading.value.rates = false
      }
    }

    const fetchMessageStats = async () => {
      loading.value.messages = true
      try {
        const response = await fetch('/api/dashboard/message-stats')
        const data = await response.json()
        messageStats.value = data
      } catch (error) {
        console.error('Ошибка при загрузке статистики сообщений:', error)
      } finally {
        loading.value.messages = false
      }
    }

    const fetchCommunityStats = async () => {
      loading.value.community = true
      try {
        const response = await fetch('/api/dashboard/community-stats')
        const data = await response.json()
        communityStats.value = data
      } catch (error) {
        console.error('Ошибка при загрузке статистики сообщества:', error)
      } finally {
        loading.value.community = false
      }
    }

    const fetchEducationData = async () => {
      loading.value.education = true
      try {
        const [coursesResponse, trendsResponse] = await Promise.all([
          fetch('/api/dashboard/recommended-courses'),
          fetch('/api/dashboard/market-trends')
        ])
        const coursesData = await coursesResponse.json()
        const trendsData = await trendsResponse.json()
        recommendedCourses.value = coursesData
        marketTrends.value = trendsData
      } catch (error) {
        console.error('Ошибка при загрузке образовательных данных:', error)
      } finally {
        loading.value.education = false
      }
    }

    const fetchAnalytics = async () => {
      loading.value.analytics = true
      try {
        const response = await fetch('/api/dashboard/analytics')
        const data = await response.json()
        // Обработка данных аналитики
    } catch (error) {
        console.error('Ошибка при загрузке аналитики:', error)
      } finally {
        loading.value.analytics = false
      }
    }

    const refreshAnalytics = () => {
      fetchAnalytics()
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU')
    }

    onMounted(async () => {
      userRole.value = userStore.user?.role || ''
      await Promise.all([
        fetchExchangeRates(),
        fetchMessageStats(),
        fetchCommunityStats(),
        fetchEducationData(),
        fetchAnalytics()
      ])
    })

    return {
      userRole,
      userStore,
      isSelectOpen,
      currencySearch,
      selectedCurrencies,
      availableCurrencies,
      filteredCurrencies,
      exchangeRates,
      messageStats,
      communityStats,
      recommendedCourses,
      marketTrends,
      loading,
      refreshAnalytics,
      formatDate
    }
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.15);
}

.dashboard-header h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 600;
}

.last-update {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.last-update::before {
  content: '🔄';
  font-size: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header h2::before {
  font-size: 1.4rem;
}

/* Иконки для заголовков */
.exchange-rates .card-header h2::before {
  content: '💱';
}

.messages .card-header h2::before {
  content: '💬';
}

.community .card-header h2::before {
  content: '👥';
}

.currency-selector {
  position: relative;
}

.select-trigger {
  padding: 0.75rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.select-trigger:hover {
  border-color: #1976d2;
  background: #f8fafc;
}

.arrow {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-10px);
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
  border: 1px solid #e2e8f0;
}

.select-dropdown.open {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

.select-search {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.select-search input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.select-search input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.select-options {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.select-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.select-option:hover {
  background: #f8fafc;
}

.select-option input[type="checkbox"] {
  margin-right: 0.75rem;
}

.option-text {
  color: #1e293b;
  font-size: 0.95rem;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.rate-item {
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rate-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.rate-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.currency-code {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.currency-name {
  font-size: 0.9rem;
  color: #64748b;
}

.rate-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.current-rate {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
}

.rate-change {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  min-width: 80px;
  text-align: center;
}

.rate-change.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.rate-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.messages-summary {
  display: grid;
  gap: 1rem;
}

.message-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  font-size: 1.25rem;
}

.category-title {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
}

.category-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.count-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1976d2;
}

.count-label {
  font-size: 0.85rem;
  color: #64748b;
}

.community-stats {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

.education .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.courses-list {
  display: grid;
  gap: 1rem;
}

.course-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.course-item:hover {
  transform: translateX(4px);
}

.course-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 8px;
  color: #1976d2;
}

.course-info {
  flex: 1;
}

.course-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1e293b;
}

.course-info p {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.course-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
}

.market-trends {
  display: grid;
  gap: 1rem;
}

.trend-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.trend-category {
  font-size: 0.85rem;
  color: #64748b;
  background: #e3f2fd;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  color: #1976d2;
}

.trend-value {
  font-weight: 500;
}

.trend-value.positive {
  color: #28a745;
}

.trend-value.negative {
  color: #dc3545;
}

.trend-item h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1e293b;
}

.trend-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 1.8rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .select-dropdown {
    width: 100%;
    max-width: 300px;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
  }

  .select-dropdown.open {
    transform: translateX(-50%) translateY(0);
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .course-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .course-icon {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .task-item {
    flex-direction: column;
  }

  .task-date {
    width: 100%;
    height: auto;
    flex-direction: row;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .btn-register, .btn-remind {
    width: 100%;
    justify-content: center;
  }
}

/* Стили для блока аналитики */
.analytics .card-header h2::before {
  content: '📊';
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(25, 118, 210, 0.1);
}

.refresh-icon {
  font-size: 1.2rem;
  display: block;
  transition: transform 0.3s ease;
}

.refresh-btn:hover .refresh-icon {
  transform: rotate(180deg);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.metric-item:hover {
  transform: translateY(-2px);
}

.metric-icon {
  font-size: 1.5rem;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.9rem;
  color: #64748b;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.trends-section, .predictions-section {
  margin-top: 2rem;
}

.trends-section h3, .predictions-section h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
}

.industry-trends {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trend-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.trend-name {
  font-size: 0.95rem;
  color: #1e293b;
}

.trend-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1976d2;
}

.trend-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.trend-progress {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #1565c0);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.predictions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prediction-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.prediction-item:hover {
  transform: translateX(4px);
}

.prediction-icon {
  font-size: 1.25rem;
}

.prediction-content {
  flex: 1;
}

.prediction-text {
  color: #1e293b;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.prediction-source {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* Стили для блока сообщений */
.messages .card-header h2::before {
  content: '💬';
}

.view-all {
  color: #1976d2;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.view-all:hover {
  background: rgba(25, 118, 210, 0.1);
}

/* Стили для блока сообщества */
.community .card-header h2::before {
  content: '👥';
}
</style> 