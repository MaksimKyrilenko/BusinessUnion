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
            <select v-model="selectedCurrencies" multiple>
              <option v-for="currency in availableCurrencies" 
                      :key="currency.code" 
                      :value="currency.code">
                {{ currency.name }} ({{ currency.code }})
              </option>
            </select>
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
    </div>

    <!-- Специфичные дашборды для разных типов пользователей -->
    <BusinessmanDashboard v-if="userRole === 'businessman'" />
    <StartupFounderDashboard v-if="userRole === 'startup_founder'" />
    <InvestorDashboard v-if="userRole === 'investor'" />
    <CryptoTraderDashboard v-if="userRole === 'crypto_trader'" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
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
    const exchangeRates = ref({})
    const news = ref([])
    const events = ref([])
    const loading = ref({
      rates: false,
      news: false,
      events: false
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

    onMounted(async () => {
      userRole.value = userStore.user?.role || ''
      await Promise.all([
        fetchExchangeRates(),
        fetchNews(),
        fetchEvents()
      ])
    })

    return {
      userRole,
      userStore,
      selectedCurrencies,
      availableCurrencies,
      exchangeRates,
      news,
      events,
      loading
    }
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.last-update {
  color: #666;
  font-size: 0.9rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.currency-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 200px;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.rate-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #f8f9fa;
}

.rate-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.currency-code {
  font-weight: bold;
  color: #2c3e50;
}

.currency-name {
  color: #666;
  font-size: 0.9rem;
}

.rate-value {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.current-rate {
  font-size: 1.2rem;
  font-weight: bold;
}

.rate-change {
  font-size: 0.9rem;
}

.rate-change.positive {
  color: #4caf50;
}

.rate-change.negative {
  color: #f44336;
}

.news-list, .events-list {
  display: grid;
  gap: 1rem;
}

.news-item, .event-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.news-item:last-child, .event-item:last-child {
  border-bottom: none;
}

.news-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.news-category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.news-date {
  color: #666;
  font-size: 0.8rem;
}

.news-item h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.read-more {
  color: #1976d2;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.event-item {
  display: flex;
  gap: 1rem;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0.5rem;
  background: #e3f2fd;
  border-radius: 8px;
  color: #1976d2;
}

.event-date .day {
  font-size: 1.5rem;
  font-weight: bold;
}

.event-date .month {
  font-size: 0.8rem;
  text-transform: uppercase;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.event-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.event-location i {
  margin-right: 0.5rem;
}

.event-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-register, .btn-remind {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-register {
  background: #1976d2;
  color: white;
}

.btn-remind {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-register:hover {
  background: #1565c0;
}

.btn-remind:hover {
  background: #bbdefb;
}

.loader {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .event-item {
    flex-direction: column;
  }

  .event-date {
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
}
</style> 