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

      <!-- Новости -->
      <div class="dashboard-card news">
        <h2>Новости</h2>
        <div class="card-content" :class="{ 'is-loading': loading.news }">
          <div v-if="!loading.news" class="news-list">
            <article v-for="item in news" :key="item.id" class="news-item">
              <div class="news-meta">
                <span class="news-category">{{ item.category }}</span>
                <span class="news-date">{{ new Date(item.date).toLocaleDateString() }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <a :href="item.url" target="_blank" class="read-more">Читать далее</a>
            </article>
          </div>
          <div v-else class="loader">Загрузка новостей...</div>
        </div>
      </div>

      <!-- События -->
      <div class="dashboard-card events">
        <h2>Предстоящие события</h2>
        <div class="card-content" :class="{ 'is-loading': loading.events }">
          <div v-if="!loading.events" class="events-list">
            <article v-for="event in events" :key="event.id" class="event-item">
              <div class="event-date">
                <span class="day">{{ new Date(event.date).getDate() }}</span>
                <span class="month">{{ new Date(event.date).toLocaleString('ru', { month: 'short' }) }}</span>
              </div>
              <div class="event-details">
                <h3>{{ event.title }}</h3>
                <p class="event-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ event.location }}
                </p>
                <p>{{ event.description }}</p>
                <div class="event-actions">
                  <button class="btn-register">Зарегистрироваться</button>
                  <button class="btn-remind">Напомнить</button>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="loader">Загрузка событий...</div>
        </div>
      </div>

      <!-- Аналитика и тренды -->
      <div class="dashboard-card analytics">
        <div class="card-header">
          <h2>Аналитика и тренды</h2>
          <button @click="refreshAnalytics" class="refresh-btn">
            <span class="refresh-icon">🔄</span>
          </button>
        </div>
        <div class="card-content" :class="{ 'is-loading': loading.analytics }">
          <div v-if="!loading.analytics" class="analytics-content">
            <!-- Основные метрики -->
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-icon">📈</span>
                <div class="metric-info">
                  <span class="metric-label">Рост инвестиций</span>
                  <span class="metric-value">+24.5%</span>
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-icon">🎯</span>
                <div class="metric-info">
                  <span class="metric-label">Успешные сделки</span>
                  <span class="metric-value">89%</span>
                </div>
              </div>
            </div>

            <!-- Популярные отрасли -->
            <div class="trends-section">
              <h3>Популярные отрасли</h3>
              <div class="industry-trends">
                <div class="trend-item">
                  <div class="trend-header">
                    <span class="trend-name">IT и технологии</span>
                    <span class="trend-value">32%</span>
                  </div>
                  <div class="trend-bar">
                    <div class="trend-progress" style="width: 32%"></div>
                  </div>
                </div>
                <div class="trend-item">
                  <div class="trend-header">
                    <span class="trend-name">Финтех</span>
                    <span class="trend-value">28%</span>
                  </div>
                  <div class="trend-bar">
                    <div class="trend-progress" style="width: 28%"></div>
                  </div>
                </div>
                <div class="trend-item">
                  <div class="trend-header">
                    <span class="trend-name">Экология</span>
                    <span class="trend-value">24%</span>
                  </div>
                  <div class="trend-bar">
                    <div class="trend-progress" style="width: 24%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Прогнозы -->
            <div class="predictions-section">
              <h3>Прогнозы аналитиков</h3>
              <div class="predictions-list">
                <div class="prediction-item">
                  <span class="prediction-icon">⭐</span>
                  <div class="prediction-content">
                    <p class="prediction-text">Ожидается рост инвестиций в AI-стартапы на 40% к концу года</p>
                    <span class="prediction-source">Forbes</span>
                  </div>
                </div>
                <div class="prediction-item">
                  <span class="prediction-icon">📊</span>
                  <div class="prediction-content">
                    <p class="prediction-text">Тренд на устойчивое развитие продолжит усиливаться</p>
                    <span class="prediction-source">Bloomberg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="loader">Загрузка аналитики...</div>
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
    const news = ref([])
    const events = ref([])
    const loading = ref({
      rates: false,
      news: false,
      events: false,
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

    const fetchNews = async () => {
      loading.value.news = true
      try {
        const response = await fetch('/api/dashboard/news')
        const data = await response.json()
        news.value = data
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error)
      } finally {
        loading.value.news = false
      }
    }

    const fetchEvents = async () => {
      loading.value.events = true
      try {
        const response = await fetch('/api/dashboard/events')
        const data = await response.json()
        events.value = data
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error)
      } finally {
        loading.value.events = false
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

    onMounted(async () => {
      userRole.value = userStore.user?.role || ''
      await Promise.all([
        fetchExchangeRates(),
        fetchNews(),
        fetchEvents(),
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
      news,
      events,
      loading,
      refreshAnalytics
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

.news .card-header h2::before {
  content: '📰';
}

.events .card-header h2::before {
  content: '📅';
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

.news-list, .events-list {
  display: grid;
  gap: 1.25rem;
}

.news-item, .event-item {
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: transform 0.2s ease;
  background: #f8fafc;
}

.news-item:hover, .event-item:hover {
  transform: translateX(4px);
}

.news-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.news-category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.news-date {
  color: #64748b;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.news-date::before {
  content: '🕒';
  margin-right: 0.4rem;
}

.news-item h3 {
  margin: 0.75rem 0;
  font-size: 1.15rem;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.4;
}

.news-item p {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.read-more {
  color: #1976d2;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.read-more:hover {
  color: #1565c0;
}

.read-more::after {
  content: '→';
  font-size: 1.1rem;
}

.event-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  overflow: hidden;
}

.event-date {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.15);
}

.event-date .day {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.event-date .month {
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-top: 0.25rem;
  opacity: 0.9;
}

.event-details {
  flex: 1;
  min-width: 0;
}

.event-details h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.event-details p {
  color: #475569;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.event-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-register, .btn-remind {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-register {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.15);
}

.btn-register::before {
  content: '✍️';
}

.btn-remind {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-remind::before {
  content: '🔔';
}

.btn-register:hover {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.2);
}

.btn-remind:hover {
  background: #bbdefb;
  transform: translateY(-2px);
}

.loader {
  text-align: center;
  color: #64748b;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loader::before {
  content: '⏳';
  font-size: 2rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.is-loading {
  opacity: 0.7;
  pointer-events: none;
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

  .event-item {
    flex-direction: row;
    align-items: flex-start;
  }

  .event-date {
    width: 60px;
    height: 60px;
  }

  .event-actions {
    flex-direction: row;
  }
}

@media (max-width: 480px) {
  .event-item {
    flex-direction: column;
  }

  .event-date {
    width: 100%;
    height: auto;
    flex-direction: row;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .event-actions {
    flex-direction: column;
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
</style> 