<template>
  <div class="crypto-tracker">
    <h1>Криптотрекер</h1>
    
    <div class="tracker-grid">
      <!-- Поиск и фильтры -->
      <div class="filters-card">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск криптовалют..."
            @input="filterCryptos"
          >
        </div>
        <div class="filters">
          <select v-model="sortBy">
            <option value="price">По цене</option>
            <option value="change">По изменению</option>
            <option value="volume">По объему</option>
          </select>
          <select v-model="timeRange">
            <option value="24h">24 часа</option>
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
          </select>
        </div>
      </div>

      <!-- Список криптовалют -->
      <div class="crypto-list">
        <div v-for="crypto in filteredCryptos" 
             :key="crypto.id" 
             class="crypto-item"
        >
          <div class="crypto-info">
            <img :src="crypto.icon" :alt="crypto.name" class="crypto-icon">
            <div>
              <h3>{{ crypto.name }}</h3>
              <span class="symbol">{{ crypto.symbol }}</span>
            </div>
          </div>
          <div class="crypto-price">
            <div class="current-price">{{ formatMoney(crypto.price) }}</div>
            <div :class="['price-change', crypto.change >= 0 ? 'positive' : 'negative']">
              {{ crypto.change > 0 ? '+' : '' }}{{ crypto.change }}%
            </div>
          </div>
          <div class="crypto-volume">
            <div class="volume-label">Объем 24ч</div>
            <div class="volume-value">{{ formatMoney(crypto.volume) }}</div>
          </div>
          <div class="crypto-actions">
            <BaseButton 
              variant="primary" 
              @click="viewDetails(crypto.id)"
            >
              Подробнее
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- График выбранной криптовалюты -->
      <div class="chart-card" v-if="selectedCrypto">
        <h3>{{ selectedCrypto.name }} ({{ selectedCrypto.symbol }})</h3>
        <div class="chart-container">
          <canvas ref="priceChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Модальное окно с деталями -->
    <Modal v-if="showDetails" @close="closeDetails">
      <div class="crypto-details">
        <div class="details-header">
          <img :src="selectedCrypto.icon" :alt="selectedCrypto.name" class="details-icon">
          <div>
            <h2>{{ selectedCrypto.name }}</h2>
            <span class="symbol">{{ selectedCrypto.symbol }}</span>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Текущая цена</span>
            <span class="value">{{ formatMoney(selectedCrypto.price) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Изменение 24ч</span>
            <span :class="['value', selectedCrypto.change >= 0 ? 'positive' : 'negative']">
              {{ selectedCrypto.change > 0 ? '+' : '' }}{{ selectedCrypto.change }}%
            </span>
          </div>
          <div class="detail-item">
            <span class="label">Объем 24ч</span>
            <span class="value">{{ formatMoney(selectedCrypto.volume) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Рыночная капитализация</span>
            <span class="value">{{ formatMoney(selectedCrypto.marketCap) }}</span>
          </div>
        </div>

        <div class="details-chart">
          <canvas ref="detailsChart"></canvas>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/axios'

export default {
  name: 'CryptoTracker',
  components: {
    BaseButton,
    Modal
  },
  data() {
    return {
      cryptos: [],
      searchQuery: '',
      sortBy: 'price',
      timeRange: '24h',
      selectedCrypto: null,
      showDetails: false,
      priceChart: null,
      detailsChart: null
    }
  },
  computed: {
    filteredCryptos() {
      let filtered = [...this.cryptos]
      
      // Фильтрация по поиску
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(crypto => 
          crypto.name.toLowerCase().includes(query) ||
          crypto.symbol.toLowerCase().includes(query)
        )
      }
      
      // Сортировка
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'price':
            return b.price - a.price
          case 'change':
            return b.change - a.change
          case 'volume':
            return b.volume - a.volume
          default:
            return 0
        }
      })
      
      return filtered
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    async loadCryptos() {
      try {
        const response = await api.get('/crypto/list')
        this.cryptos = response.data
      } catch (error) {
        console.error('Ошибка при загрузке криптовалют:', error)
      }
    },
    async viewDetails(cryptoId) {
      try {
        const response = await api.get(`/crypto/${cryptoId}`)
        this.selectedCrypto = response.data
        this.showDetails = true
        this.$nextTick(() => {
          this.createDetailsChart()
        })
      } catch (error) {
        console.error('Ошибка при загрузке деталей:', error)
      }
    },
    closeDetails() {
      this.showDetails = false
      this.selectedCrypto = null
    },
    createDetailsChart() {
      const ctx = this.$refs.detailsChart.getContext('2d')
      this.detailsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1ч', '4ч', '12ч', '24ч', '7д', '30д'],
          datasets: [{
            label: 'Цена',
            data: [100, 105, 102, 108, 115, 120],
            borderColor: '#28a745',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
  },
  mounted() {
    this.loadCryptos()
  }
}
</script>

<style scoped>
.crypto-tracker {
  padding: 20px;
}

.tracker-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 20px;
}

.filters-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.crypto-list {
  display: grid;
  gap: 15px;
}

.crypto-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.crypto-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.crypto-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.symbol {
  color: #666;
  font-size: 0.9em;
}

.crypto-price {
  text-align: right;
}

.current-price {
  font-weight: bold;
  color: #2c3e50;
}

.price-change {
  font-size: 0.9em;
}

.price-change.positive {
  color: #28a745;
}

.price-change.negative {
  color: #dc3545;
}

.crypto-volume {
  text-align: right;
}

.volume-label {
  font-size: 0.8em;
  color: #666;
}

.volume-value {
  font-weight: 500;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-container {
  height: 400px;
  margin-top: 15px;
}

.crypto-details {
  padding: 20px;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.details-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 0.9em;
  color: #666;
}

.value {
  font-weight: 500;
}

.details-chart {
  height: 300px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .filters-card {
    flex-direction: column;
  }
  
  .crypto-item {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .crypto-info {
    justify-content: center;
  }
  
  .crypto-price, .crypto-volume {
    text-align: center;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style> 