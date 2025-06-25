<template>
  <div class="education-page">
    <div class="page-header">
      <h1>Образовательные курсы</h1>
      <p class="subtitle">Развивайте свои навыки с нашими специализированными курсами</p>
    </div>

    <div class="search-container">
      <div class="search-wrapper">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Поиск курсов..."
          class="search-input"
        >
      </div>
    </div>

    <div class="filters">
      <div class="filter-buttons">
        <button 
          v-for="category in categories" 
          :key="category.value"
          :class="['filter-btn', { active: selectedCategory === category.value }]"
          @click="selectedCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <div class="courses-grid">
      <div 
        v-for="course in filteredCourses" 
        :key="course.id" 
        class="course-card"
        :class="{ 'animate__animated animate__fadeIn': true }"
      >
        <div class="course-image" :style="{ backgroundColor: course.color }">
          <i :class="course.icon"></i>
        </div>
        <div class="course-content">
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
          <div class="course-meta">
            <span class="duration">
              <i class="fas fa-clock"></i> {{ course.duration }}
            </span>
            <span class="level">
              <i class="fas fa-signal"></i> {{ course.level }}
            </span>
          </div>
          <div class="course-footer">
            <span class="price">{{ formatMoney(course.price) }}</span>
            <BaseButton @click="enrollCourse(course)">Записаться</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'Education',
  components: {
    BaseButton
  },
  setup() {
    const searchQuery = ref('')

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const selectedCategory = ref('all')
    
    const categories = [
      { value: 'all', label: 'Все курсы' },
      { value: 'startup_founder', label: 'Для стартаперов' },
      { value: 'investor', label: 'Для инвесторов' },
      { value: 'businessman', label: 'Для бизнесменов' },
      { value: 'crypto_trader', label: 'Для крипто-трейдеров' }
    ]

    const courses = [
      {
        id: 1,
        title: 'Основы создания стартапа',
        description: 'Узнайте как создать успешный стартап с нуля',
        category: 'startup_founder',
        duration: '8 недель',
        level: 'Начальный',
        price: 29900,
        icon: 'fas fa-rocket',
        color: '#E3F2FD'
      },
      {
        id: 2,
        title: 'Инвестиционный анализ',
        description: 'Научитесь оценивать инвестиционные возможности',
        category: 'investor',
        duration: '6 недель',
        level: 'Продвинутый',
        price: 34900,
        icon: 'fas fa-chart-line',
        color: '#F3E5F5'
      },
      {
        id: 3,
        title: 'Управление бизнесом',
        description: 'Стратегии эффективного управления компанией',
        category: 'businessman',
        duration: '10 недель',
        level: 'Средний',
        price: 39900,
        icon: 'fas fa-briefcase',
        color: '#E8F5E9'
      },
      {
        id: 4,
        title: 'Криптовалютный трейдинг',
        description: 'Основы торговли на криптовалютном рынке',
        category: 'crypto_trader',
        duration: '4 недели',
        level: 'Начальный',
        price: 24900,
        icon: 'fas fa-coins',
        color: '#FFF3E0'
      },
      {
        id: 5,
        title: 'Питчинг для стартапов',
        description: 'Как презентовать свой проект инвесторам',
        category: 'startup_founder',
        duration: '3 недели',
        level: 'Средний',
        price: 19900,
        icon: 'fas fa-presentation',
        color: '#E1F5FE'
      },
      {
        id: 6,
        title: 'Риск-менеджмент',
        description: 'Управление рисками в инвестициях',
        category: 'investor',
        duration: '5 недель',
        level: 'Продвинутый',
        price: 29900,
        icon: 'fas fa-shield-alt',
        color: '#F3E5F5'
      },
      {
        id: 7,
        title: 'Маркетинг для бизнеса',
        description: 'Современные стратегии продвижения',
        category: 'businessman',
        duration: '8 недель',
        level: 'Средний',
        price: 34900,
        icon: 'fas fa-bullhorn',
        color: '#E8F5E9'
      },
      {
        id: 8,
        title: 'Технический анализ крипторынка',
        description: 'Продвинутые техники анализа графиков',
        category: 'crypto_trader',
        duration: '6 недель',
        level: 'Продвинутый',
        price: 39900,
        icon: 'fas fa-chart-bar',
        color: '#FFF3E0'
      }
    ]

    const filteredCourses = computed(() => {
      let filtered = courses
      
      // Фильтрация по категории
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(course => course.category === selectedCategory.value)
      }
      
      // Фильтрация по поисковому запросу
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })

    const enrollCourse = (course) => {
      // TODO: Реализовать запись на курс
      console.log('Записаться на курс:', course.title)
    }

    return {
      categories,
      selectedCategory,
      searchQuery,
      filteredCourses,
      enrollCourse,
      formatMoney
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

.education-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 16px;
  color: #2d3748;
  background: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

.filters {
  margin-bottom: 2rem;
}

.filter-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary-color);
  border-radius: 30px;
  background: transparent;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: var(--primary-color);
  color: white;
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.course-image {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-image i {
  font-size: 3rem;
  color: var(--primary-color);
}

.course-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100% - 160px);
}

.course-content h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.course-content p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
  flex: 1;
  min-height: 0;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.course-meta i {
  margin-right: 0.5rem;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  margin-top: auto;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.course-footer :deep(.base-button) {
  width: auto;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  margin-left: 1rem;
}

@media (max-width: 768px) {
  .education-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }
}
</style> 