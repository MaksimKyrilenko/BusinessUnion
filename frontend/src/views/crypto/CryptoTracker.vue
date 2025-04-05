<template>
  <div class="crypto-tracker">
    <div class="market-overview">
      <h2>Обзор рынка</h2>
      <div class="market-grid">
        <div v-for="coin in topCoins" :key="coin.symbol" class="coin-card">
          <div class="coin-header">
            <img :src="coin.icon" :alt="coin.name" class="coin-icon">
            <div class="coin-info">
              <h3>{{ coin.name }}</h3>
              <span class="symbol">{{ coin.symbol }}</span>
            </div>
            <div class="coin-price">
              <div class="current-price">{{ formatMoney(coin.price) }}</div>
              <div :class="['price-change', coin.change >= 0 ? 'positive' : 'negative']">
                {{ coin.change > 0 ? '+' : '' }}{{ coin.change }}%
              </div>
            </div>
          </div>
          <div class="coin-stats">
            <div class="stat">
              <span class="label">Объем (24ч)</span>
              <span class="value">{{ formatMoney(coin.volume24h) }}</span>
            </div>
            <div class="stat">
              <span class="label">Капитализация</span>
              <span class="value">{{ formatMoney(coin.marketCap) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="market-metrics">
        <div class="metric-card">
          <h3>Индекс страха и жадности</h3>
          <FearGreedIndex :value="fearGreedIndex" />
        </div>
        <div class="metric-card">
          <h3>Доминирование BTC</h3>
          <div class="dominance-chart">
            <div class="dominance-value">{{ btcDominance }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-controls">
        <div class="symbol-selector">
          <BaseSelect
            v-model="selectedPair"
            :options="tradingPairs"
            placeholder="Выберите пару"
          />
        </div>
        <div class="timeframe-selector">
          <button
            v-for="tf in timeframes"
            :key="tf.value"
            :class="['timeframe-btn', { active: selectedTimeframe === tf.value }]"
            @click="selectedTimeframe = tf.value"
          >
            {{ tf.label }}
          </button>
        </div>
      </div>

      <div class="chart-container">
        <CandlestickChart
          v-if="candlestickData.length > 0"
          :data="candlestickData"
          :indicators="activeIndicators"
          :timeframe="selectedTimeframe"
        />
        <div v-else class="loading-state">
          <Loader v-if="isLoading" />
          <p v-else>Нет данных для отображения</p>
        </div>
      </div>

      <div class="indicators">
        <div class="indicator-controls">
          <BaseSelect
            v-model="selectedIndicator"
            :options="availableIndicators"
            placeholder="Добавить индикатор"
          />
          <button class="add-indicator" @click="addIndicator">
            Добавить
          </button>
        </div>
        <div class="active-indicators">
          <div
            v-for="indicator in activeIndicators"
            :key="indicator.id"
            class="indicator-tag"
          >
            {{ indicator.name }}
            <button class="remove-indicator" @click="removeIndicator(indicator.id)">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="analysis-section">
      <div class="grid-2">
        <div class="analysis-card">
          <h3>On-Chain Аналитика</h3>
          <div class="metrics-list">
            <div v-for="metric in onChainMetrics" :key="metric.name" class="metric-item">
              <div class="metric-header">
                <span class="metric-name">{{ metric.name }}</span>
                <span :class="['metric-change', metric.trend]">
                  {{ metric.change }}%
                </span>
              </div>
              <div class="metric-value">{{ metric.value }}</div>
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <h3>Ликвидации</h3>
          <LiquidationsChart :data="liquidationData" />
        </div>
      </div>

      <div class="grid-2">
        <div class="analysis-card">
          <h3>Сигналы</h3>
          <div class="signals-list">
            <div v-for="signal in tradingSignals" :key="signal.id" class="signal-item">
              <div :class="['signal-type', signal.type]">{{ signal.type }}</div>
              <div class="signal-info">
                <div class="signal-pair">{{ signal.pair }}</div>
                <div class="signal-price">{{ formatMoney(signal.price) }}</div>
              </div>
              <div class="signal-meta">
                <div class="signal-time">{{ formatDate(signal.time) }}</div>
                <div :class="['signal-strength', signal.strength]">
                  {{ signal.strength }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <h3>Фьючерсы</h3>
          <div class="futures-data">
            <div class="funding-rates">
              <h4>Funding Rate</h4>
              <div class="rates-list">
                <div v-for="rate in fundingRates" :key="rate.exchange" class="rate-item">
                  <span class="exchange">{{ rate.exchange }}</span>
                  <span :class="['rate-value', rate.value > 0 ? 'positive' : 'negative']">
                    {{ rate.value }}%
                  </span>
                </div>
              </div>
            </div>
            <div class="open-interest">
              <h4>Открытый интерес</h4>
              <div class="interest-value">
                {{ formatMoney(openInterest) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CandlestickChart from '@/components/charts/CandlestickChart.vue'
import FearGreedIndex from '@/components/charts/FearGreedIndex.vue'
import LiquidationsChart from '@/components/charts/LiquidationsChart.vue'
import Loader from '@/components/ui/Loader.vue'
import api from '@/axios'

export default {
  name: 'CryptoTracker',
  components: {
    BaseSelect,
    CandlestickChart,
    FearGreedIndex,
    LiquidationsChart,
    Loader
  },
  setup() {
    // Состояние компонента
    const selectedPair = ref('BTC/USDT')
    const selectedTimeframe = ref('1h')
    const selectedIndicator = ref(null)
    const activeIndicators = ref([])
    const fearGreedIndex = ref(65)
    const btcDominance = ref(42.5)
    const isLoading = ref(false)

    // Моковые данные
    const topCoins = ref([
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        price: 65432.10,
        change: 2.5,
        volume24h: 28000000000,
        marketCap: 1200000000000
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        price: 3456.78,
        change: -1.2,
        volume24h: 15000000000,
        marketCap: 450000000000
      },
      {
        name: 'Binance Coin',
        symbol: 'BNB',
        icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
        price: 456.78,
        change: 3.7,
        volume24h: 2000000000,
        marketCap: 75000000000
      }
    ])

    const tradingPairs = [
      { value: 'BTC/USDT', label: 'BTC/USDT' },
      { value: 'ETH/USDT', label: 'ETH/USDT' },
      { value: 'BNB/USDT', label: 'BNB/USDT' }
    ]

    const timeframes = [
      { value: '1m', label: '1M' },
      { value: '5m', label: '5M' },
      { value: '15m', label: '15M' },
      { value: '1h', label: '1H' },
      { value: '4h', label: '4H' },
      { value: '1d', label: 'D' }
    ]

    const availableIndicators = [
      { value: 'rsi', label: 'RSI' },
      { value: 'macd', label: 'MACD' },
      { value: 'bb', label: 'Bollinger Bands' }
    ]

    const onChainMetrics = ref([
      { name: 'Приток на биржи', value: '12,450 BTC', change: -2.5, trend: 'negative' },
      { name: 'Активные адреса', value: '1.2M', change: 5.8, trend: 'positive' },
      { name: 'Газ (Gwei)', value: '45', change: -15.3, trend: 'negative' }
    ])

    // Генерация моковых данных для свечного графика
    const generateCandlestickData = () => {
      const data = []
      let price = 65000
      const now = Date.now()
      
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now - (50 - i) * 3600000)
        const open = price + (Math.random() - 0.5) * 1000
        const high = open + Math.random() * 500
        const low = open - Math.random() * 500
        const close = (open + high + low) / 3
        
        data.push({
          timestamp,
          open,
          high,
          low,
          close
        })
        
        price = close
      }
      
      return data
    }

    const candlestickData = ref(generateCandlestickData())

    // Генерация моковых данных для ликвидаций
    const generateLiquidationData = () => {
      const data = []
      const now = Date.now()
      
      for (let i = 0; i < 24; i++) {
        data.push({
          timestamp: new Date(now - (24 - i) * 3600000),
          longAmount: Math.random() * 10000000,
          shortAmount: Math.random() * 8000000
        })
      }
      
      return data
    }

    const liquidationData = ref(generateLiquidationData())

    const tradingSignals = ref([
      {
        id: 1,
        type: 'BUY',
        pair: 'BTC/USDT',
        price: 65400,
        time: new Date(),
        strength: 'HIGH'
      },
      {
        id: 2,
        type: 'SELL',
        pair: 'ETH/USDT',
        price: 3450,
        time: new Date(),
        strength: 'MEDIUM'
      }
    ])

    const fundingRates = ref([
      { exchange: 'Binance', value: 0.01 },
      { exchange: 'Bybit', value: 0.008 },
      { exchange: 'OKX', value: -0.002 }
    ])

    const openInterest = ref(5200000000)

    // Методы
    const formatMoney = (value) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const addIndicator = () => {
      if (!selectedIndicator.value) return
      const indicator = availableIndicators.find(i => i.value === selectedIndicator.value)
      activeIndicators.value.push({
        id: Date.now(),
        name: indicator.label,
        type: indicator.value,
        data: generateIndicatorData()
      })
      selectedIndicator.value = null
    }

    const removeIndicator = (id) => {
      activeIndicators.value = activeIndicators.value.filter(i => i.id !== id)
    }

    const generateIndicatorData = () => {
      // Генерация моковых данных для индикатора
      return candlestickData.value.map(candle => ({
        x: candle.timestamp,
        y: Math.random() * 100
      }))
    }

    // Обновление данных каждую минуту
    const updateData = () => {
      try {
        if (!candlestickData.value || candlestickData.value.length === 0) {
          console.warn('Нет данных для обновления');
          return;
        }

        const lastCandle = candlestickData.value[candlestickData.value.length - 1];
        if (!lastCandle || !lastCandle.timestamp) {
          console.warn('Некорректные данные последней свечи');
          return;
        }

        const newTimestamp = new Date(lastCandle.timestamp.getTime() + 60000);
        const newPrice = lastCandle.close + (Math.random() - 0.5) * 100;
        
        candlestickData.value.push({
          timestamp: newTimestamp,
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newPrice) + Math.random() * 50,
          low: Math.min(lastCandle.close, newPrice) - Math.random() * 50,
          close: newPrice
        });
        
        if (candlestickData.value.length > 50) {
          candlestickData.value.shift();
        }

        // Обновляем ликвидации
        if (liquidationData.value && liquidationData.value.length > 0) {
          const newLiquidation = {
            timestamp: new Date(),
            longAmount: Math.random() * 10000000,
            shortAmount: Math.random() * 8000000
          };
          
          liquidationData.value.push(newLiquidation);
          if (liquidationData.value.length > 24) {
            liquidationData.value.shift();
          }
        }
      } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
      }
    };

    const fetchChartData = async (timeframe) => {
      isLoading.value = true;
      try {
        // Временно используем моковые данные, пока API не готов
        const mockData = generateCandlestickData();
        candlestickData.value = mockData.map(item => ({
          timestamp: new Date(item.timestamp),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }));
        
        // Когда API будет готов, раскомментируйте этот код:
        /*
        const response = await api.get(`/crypto/chart-data?timeframe=${timeframe}`);
        candlestickData.value = response.data.map(item => ({
          timestamp: new Date(item.timestamp),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }));
        */
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        candlestickData.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const changeTimeframe = (timeframe) => {
      selectedTimeframe.value = timeframe;
      fetchChartData(timeframe);
    };

    onMounted(() => {
      fetchChartData(selectedTimeframe.value);
      setInterval(updateData, 60000) // Обновляем данные каждую минуту
    })

    return {
      selectedPair,
      selectedTimeframe,
      selectedIndicator,
      activeIndicators,
      fearGreedIndex,
      btcDominance,
      topCoins,
      tradingPairs,
      timeframes,
      availableIndicators,
      onChainMetrics,
      liquidationData,
      tradingSignals,
      fundingRates,
      openInterest,
      candlestickData,
      formatMoney,
      formatDate,
      addIndicator,
      removeIndicator,
      isLoading,
      changeTimeframe
    }
  }
}
</script>

<style scoped>
.crypto-tracker {
  padding: 2rem;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.coin-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.coin-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.coin-icon {
  width: 32px;
  height: 32px;
  margin-right: 1rem;
}

.coin-info {
  flex: 1;
}

.coin-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.symbol {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.coin-price {
  text-align: right;
}

.current-price {
  font-weight: bold;
  font-size: 1.2rem;
}

.price-change {
  font-size: 0.9rem;
}

.positive { color: #28a745; }
.negative { color: #dc3545; }

.coin-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
}

.label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.market-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dominance-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.dominance-value {
  font-size: 2rem;
  font-weight: 500;
  color: var(--primary-color);
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.timeframe-selector {
  display: flex;
  gap: 0.5rem;
}

.timeframe-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.timeframe-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.chart-container {
  height: 400px;
  margin-bottom: 1rem;
}

.indicators {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.indicator-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-indicator {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.active-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.indicator-tag {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-indicator {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metrics-list {
  display: grid;
  gap: 1rem;
}

.metric-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 500;
}

.signals-list {
  display: grid;
  gap: 1rem;
}

.signal-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.signal-type {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  margin-right: 1rem;
}

.signal-type.BUY {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.signal-type.SELL {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.signal-info {
  flex: 1;
}

.signal-pair {
  font-weight: 500;
}

.signal-meta {
  text-align: right;
}

.signal-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.signal-strength {
  font-size: 0.85rem;
  font-weight: 500;
}

.signal-strength.HIGH { color: #28a745; }
.signal-strength.MEDIUM { color: #ffc107; }
.signal-strength.LOW { color: #dc3545; }

.futures-data {
  margin-top: 1rem;
}

.funding-rates {
  margin-bottom: 1.5rem;
}

.rates-list {
  display: grid;
  gap: 0.5rem;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.open-interest {
  text-align: center;
}

.interest-value {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary-color);
}

.loading-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .crypto-tracker {
    padding: 1rem;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }

  .chart-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .timeframe-selector {
    width: 100%;
    overflow-x: auto;
  }
}
</style> 