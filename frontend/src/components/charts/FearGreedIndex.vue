<template>
  <div class="fear-greed-index">
    <div class="meter-container">
      <div class="meter">
        <div class="meter-value" :style="{ left: `${value}%` }">
          <div class="value-label">{{ value }}</div>
          <div class="pointer"></div>
        </div>
        <div class="meter-scale">
          <div class="scale-segment extreme-fear">
            <span>Экстремальный страх</span>
          </div>
          <div class="scale-segment fear">
            <span>Страх</span>
          </div>
          <div class="scale-segment neutral">
            <span>Нейтрально</span>
          </div>
          <div class="scale-segment greed">
            <span>Жадность</span>
          </div>
          <div class="scale-segment extreme-greed">
            <span>Экстремальная жадность</span>
          </div>
        </div>
      </div>
    </div>
    <div class="index-info">
      <div class="current-state">
        {{ currentState }}
      </div>
      <div class="description">
        {{ description }}
      </div>
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
    }
  },
  setup(props) {
    const currentState = computed(() => {
      if (props.value <= 20) return 'Экстремальный страх'
      if (props.value <= 40) return 'Страх'
      if (props.value <= 60) return 'Нейтрально'
      if (props.value <= 80) return 'Жадность'
      return 'Экстремальная жадность'
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

    return {
      currentState,
      description
    }
  }
}
</script>

<style scoped>
.fear-greed-index {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.meter-container {
  margin-bottom: 1.5rem;
}

.meter {
  height: 40px;
  background: linear-gradient(
    to right,
    #dc3545 0%,
    #dc3545 20%,
    #ffc107 20%,
    #ffc107 40%,
    #6c757d 40%,
    #6c757d 60%,
    #28a745 60%,
    #28a745 80%,
    #198754 80%,
    #198754 100%
  );
  border-radius: 20px;
  position: relative;
  margin: 2rem 0;
}

.meter-value {
  position: absolute;
  transform: translateX(-50%);
}

.value-label {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  margin-bottom: 0.5rem;
  white-space: nowrap;
}

.pointer {
  width: 2px;
  height: 40px;
  background: #333;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: #333;
    border-radius: 50%;
  }
}

.meter-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0 10px;
}

.scale-segment {
  flex: 1;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  position: relative;
  
  span {
    display: block;
    transform: rotate(-30deg);
    transform-origin: top left;
    white-space: nowrap;
    position: absolute;
    top: 100%;
    left: 50%;
  }
}

.current-state {
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1rem;
}

.description {
  text-align: center;
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .scale-segment span {
    font-size: 0.75rem;
  }
}
</style> 