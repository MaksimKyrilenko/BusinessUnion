<template>
  <div class="fear-greed-index">
    <div class="fg-header">
      <h3 class="fg-title">Индекс страха и жадности</h3>
      <div v-if="trend !== null" :class="['trend-badge', trend >= 0 ? 'positive' : 'negative']">
        {{ trend > 0 ? '+' : '' }}{{ trend.toFixed(1) }} за 24ч
      </div>
    </div>

    <div class="fg-main">
      <div class="value-display">
        <div class="main-value">{{ value }}</div>
        <div class="state-badge" :class="stateClass">
          {{ currentState }}
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-bar" :style="{ width: value + '%' }" :class="stateClass"></div>
        <div class="progress-markers">
          <span class="marker" :class="{ active: value <= 20 }">0</span>
          <span class="marker" :class="{ active: value > 20 && value <= 40 }">25</span>
          <span class="marker" :class="{ active: value > 40 && value <= 60 }">50</span>
          <span class="marker" :class="{ active: value > 60 && value <= 80 }">75</span>
          <span class="marker" :class="{ active: value > 80 }">100</span>
        </div>
      </div>

      <div class="scale-labels">
        <div class="scale-item">
          <div class="scale-color extreme-fear"></div>
          <span>Экстремальный страх</span>
        </div>
        <div class="scale-item">
          <div class="scale-color fear"></div>
          <span>Страх</span>
        </div>
        <div class="scale-item">
          <div class="scale-color neutral"></div>
          <span>Нейтрально</span>
        </div>
        <div class="scale-item">
          <div class="scale-color greed"></div>
          <span>Жадность</span>
        </div>
        <div class="scale-item">
          <div class="scale-color extreme-greed"></div>
          <span>Экстремальная жадность</span>
        </div>
      </div>
    </div>

    <div class="history-section">
      <div class="history-card">
        <div class="history-label">Сегодня</div>
        <div class="history-value">{{ historyData.today }}</div>
      </div>
      <div class="history-card">
        <div class="history-label">Вчера</div>
        <div class="history-value">{{ historyData.yesterday }}</div>
      </div>
      <div class="history-card">
        <div class="history-label">Неделю назад</div>
        <div class="history-value">{{ historyData.lastWeek }}</div>
      </div>
    </div>

    <div class="advice-section">
      <div class="advice-title">{{ currentState }}</div>
      <div class="advice-text">{{ description }}</div>
      <div class="advice-recommendation">{{ recommendation }}</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'FearGreedIndex',
  props: {
    value: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100
    },
    history: {
      type: Object,
      default: () => ({
        today: 50,
        yesterday: 50,
        lastWeek: 50
      })
    }
  },
  setup(props) {
    const historyData = computed(() => ({
      today: props.history?.today ?? props.value,
      yesterday: props.history?.yesterday ?? props.value,
      lastWeek: props.history?.lastWeek ?? props.value
    }))

    const currentState = computed(() => {
      if (props.value <= 20) return 'Экстремальный страх'
      if (props.value <= 40) return 'Страх'
      if (props.value <= 60) return 'Нейтрально'
      if (props.value <= 80) return 'Жадность'
      return 'Экстремальная жадность'
    })

    const stateClass = computed(() => {
      if (props.value <= 20) return 'extreme-fear'
      if (props.value <= 40) return 'fear'
      if (props.value <= 60) return 'neutral'
      if (props.value <= 80) return 'greed'
      return 'extreme-greed'
    })

    const description = computed(() => {
      if (props.value <= 20) {
        return 'Инвесторы испытывают сильный страх. Возможно хорошее время для покупки.'
      }
      if (props.value <= 40) {
        return 'На рынке преобладает страх. Рассмотрите возможности для входа.'
      }
      if (props.value <= 60) {
        return 'Рынок находится в нейтральном состоянии.'
      }
      if (props.value <= 80) {
        return 'Инвесторы проявляют жадность. Будьте осторожны.'
      }
      return 'Экстремальная жадность на рынке. Возможно хорошее время для фиксации прибыли.'
    })

    const recommendation = computed(() => {
      const state = currentState.value
      if (state.includes('страх')) {
        return 'Рассмотрите постепенный набор позиции. Установите защитные ордера и следите за объемами.'
      }
      if (state.includes('нейтраль')) {
        return 'Можно держать текущие позиции и ждать подтверждения тренда.'
      }
      return 'Избыточная жадность — хорошее время для фиксации части прибыли и повышения дисциплины.'
    })

    const trend = computed(() => {
      if (historyData.value.yesterday === null || historyData.value.yesterday === undefined) return null
      return props.value - historyData.value.yesterday
    })

    return {
      currentState,
      description,
      historyData,
      recommendation,
      trend,
      stateClass
    }
  }
}
</script>

<style scoped>
.fear-greed-index {
  padding: 1.5rem;
}

.fg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.fg-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.trend-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.trend-badge.positive {
  background: #e8f5e9;
  color: #28a745;
}

.trend-badge.negative {
  background: #ffebee;
  color: #dc3545;
}

.fg-main {
  margin-bottom: 1.5rem;
}

.value-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.main-value {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary);
}

.state-badge {
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
}

.state-badge.extreme-fear {
  background: #ffebee;
  color: #c62828;
}

.state-badge.fear {
  background: #fff3e0;
  color: #e65100;
}

.state-badge.neutral {
  background: #f5f5f5;
  color: #616161;
}

.state-badge.greed {
  background: #e8f5e9;
  color: #2e7d32;
}

.state-badge.extreme-greed {
  background: #e1f5fe;
  color: #0277bd;
}

.progress-container {
  position: relative;
  width: 100%;
  height: 32px;
  background: #f5f5f5;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 100%;
  border-radius: 16px;
  transition: width 0.6s ease, background 0.3s ease;
  position: relative;
}

.progress-bar.extreme-fear {
  background: linear-gradient(90deg, #c62828 0%, #d32f2f 100%);
}

.progress-bar.fear {
  background: linear-gradient(90deg, #e65100 0%, #ff6f00 100%);
}

.progress-bar.neutral {
  background: linear-gradient(90deg, #757575 0%, #9e9e9e 100%);
}

.progress-bar.greed {
  background: linear-gradient(90deg, #2e7d32 0%, #4caf50 100%);
}

.progress-bar.extreme-greed {
  background: linear-gradient(90deg, #0277bd 0%, #03a9f4 100%);
}

.progress-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  pointer-events: none;
}

.marker {
  font-size: 0.7rem;
  color: #999;
  font-weight: 500;
  transition: color 0.3s ease;
}

.marker.active {
  color: #333;
  font-weight: 600;
}

.scale-labels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  font-size: 0.75rem;
}

.scale-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.scale-color {
  width: 100%;
  height: 4px;
  border-radius: 2px;
}

.scale-color.extreme-fear {
  background: #c62828;
}

.scale-color.fear {
  background: #e65100;
}

.scale-color.neutral {
  background: #757575;
}

.scale-color.greed {
  background: #2e7d32;
}

.scale-color.extreme-greed {
  background: #0277bd;
}

.scale-item span {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.7rem;
  line-height: 1.2;
}

.history-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.history-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}

.history-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.history-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.advice-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.25rem;
}

.advice-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.advice-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.advice-recommendation {
  color: var(--text-primary);
  line-height: 1.6;
  font-weight: 500;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .value-display {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .main-value {
    font-size: 2.5rem;
  }

  .history-section {
    grid-template-columns: 1fr;
  }

  .scale-labels {
    font-size: 0.65rem;
  }
}
</style>
