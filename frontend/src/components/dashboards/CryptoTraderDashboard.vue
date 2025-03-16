<template>
  <div class="dashboard-content">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Портфель криптовалют</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatMoney(stats.portfolioValue) }}</span>
            <span class="stat-label">Общая стоимость</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" :class="stats.dailyChange >= 0 ? 'positive' : 'negative'">
              {{ stats.dailyChange > 0 ? '+' : '' }}{{ stats.dailyChange }}%
            </span>
            <span class="stat-label">Изменение за 24ч</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Активные позиции</h3>
        <div class="positions-list">
          <div v-for="position in activePositions" 
               :key="position.id" 
               class="position-item"
          >
            <div class="position-info">
              <div class="crypto-info">
                <img :src="position.icon" :alt="position.symbol" class="crypto-icon">
                <div>
                  <h4>{{ position.name }}</h4>
                  <span class="symbol">{{ position.symbol }}</span>
                </div>
              </div>
              <div class="position-details">
                <div class="amount">{{ position.amount }} {{ position.symbol }}</div>
                <div class="value">≈ {{ formatMoney(position.value) }}</div>
                <div :class="['change', position.change >= 0 ? 'positive' : 'negative']">
                  {{ position.change > 0 ? '+' : '' }}{{ position.change }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Последние транзакции</h3>
        <div class="transactions-list">
          <div v-for="tx in recentTransactions" 
               :key="tx.id" 
               class="transaction-item"
          >
            <div class="transaction-icon" :class="tx.type">
              {{ getTransactionIcon(tx.type) }}
            </div>
            <div class="transaction-details">
              <div class="transaction-header">
                <h4>{{ tx.type === 'buy' ? 'Покупка' : 'Продажа' }} {{ tx.symbol }}</h4>
                <span :class="['amount', tx.type]">
                  {{ tx.type === 'buy' ? '-' : '+' }}{{ formatMoney(tx.value) }}
                </span>
              </div>
              <p>{{ tx.amount }} {{ tx.symbol }} @ {{ formatMoney(tx.price) }}</p>
              <span class="transaction-time">{{ formatTime(tx.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="market-overview">
      <h3>Обзор рынка</h3>
      <div class="market-grid">
        <div v-for="coin in marketOverview" 
             :key="coin.symbol" 
             class="market-item"
        >
          <div class="coin-info">
            <img :src="coin.icon" :alt="coin.symbol" class="coin-icon">
            <div>
              <h4>{{ coin.name }}</h4>
              <span class="symbol">{{ coin.symbol }}</span>
            </div>
          </div>
          <div class="coin-price">
            <div class="current-price">{{ formatMoney(coin.price) }}</div>
            <div :class="['price-change', coin.change >= 0 ? 'positive' : 'negative']">
              {{ coin.change > 0 ? '+' : '' }}{{ coin.change }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/axios'

export default {
  name: 'CryptoTraderDashboard',
  components: {
    BaseButton
  },
  data() {
    return {
      stats: {
        portfolioValue: 0,
        dailyChange: 0
      },
      activePositions: [],
      recentTransactions: [],
      marketOverview: []
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    formatTime(time) {
      return format(new Date(time), 'dd MMM, HH:mm', { locale: ru })
    },
    getTransactionIcon(type) {
      return type === 'buy' ? '📥' : '📤'
    },
    async loadDashboardData() {
      try {
        const [statsResponse, positionsResponse, transactionsResponse, marketResponse] = 
          await Promise.all([
            api.get('/dashboard/crypto/stats'),
            api.get('/dashboard/crypto/positions'),
            api.get('/dashboard/crypto/transactions'),
            api.get('/dashboard/crypto/market')
          ])
        
        this.stats = statsResponse.data
        this.activePositions = positionsResponse.data
        this.recentTransactions = transactionsResponse.data
        this.marketOverview = marketResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке данных дашборда:', error)
      }
    }
  },
  created() {
    this.loadDashboardData()
  }
}
</script>

<style scoped>
/* Базовые стили от BusinessmanDashboard */

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

.crypto-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.crypto-icon, .coin-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.symbol {
  color: #666;
  font-size: 0.9em;
}

.position-details {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.market-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.coin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coin-price {
  text-align: right;
}

.current-price {
  font-weight: bold;
  color: #2c3e50;
}

.price-change {
  font-size: 0.9em;
}
</style> 