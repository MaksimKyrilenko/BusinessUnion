<template>
  <div class="education-page">
    <div class="page-header">
      <h1>Образовательные курсы</h1>
      <p class="subtitle">Лучшие курсы от ведущих платформ для развития ваших навыков</p>
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-number">{{ courses ? courses.length : 0 }}</span>
          <span class="stat-label">Курсов</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ categories ? categories.length - 1 : 0 }}</span>
          <span class="stat-label">Категорий</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ platforms && platforms.length ? platforms.length : 0 }}</span>
          <span class="stat-label">Платформ</span>
        </div>
      </div>
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

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Загружаем курсы...</p>
      </div>
    </div>

    <div class="courses-grid" v-else-if="filteredCourses && filteredCourses.length > 0">
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
          <div class="course-header">
            <h3>{{ course.title }}</h3>
            <div class="platform-badge" :class="course.platform">
              <i :class="getPlatformIcon(course.platform)"></i>
              {{ getPlatformName(course.platform) }}
            </div>
          </div>
          <p>{{ course.description }}</p>
          <div class="course-meta">
            <span class="duration">
              <i class="fas fa-clock"></i> {{ course.duration }}
            </span>
            <span class="level">
              <i class="fas fa-signal"></i> {{ course.level }}
            </span>
            <span class="rating" v-if="course.rating">
              <i class="fas fa-star"></i> {{ course.rating }}
            </span>
          </div>
          <div class="course-info">
            <div class="price-info" v-if="course.price">
              <span class="price">{{ formatMoney(course.price) }}</span>
              <span class="old-price" v-if="course.oldPrice">{{ formatMoney(course.oldPrice) }}</span>
            </div>
            <div class="course-actions">
              <BaseButton 
                variant="outline" 
                size="small" 
                @click="viewCourseDetails(course)"
                class="details-btn"
              >
                Подробнее
              </BaseButton>
              <BaseButton 
                @click="goToCourse(course)"
                class="enroll-btn"
              >
                Перейти к курсу
                <i class="fas fa-external-link-alt"></i>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-courses">
      <div class="no-courses-content">
        <i class="fas fa-search"></i>
        <h3>Курсы не найдены</h3>
        <p>Попробуйте изменить поисковый запрос или выберите другую категорию</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import axios from '@/axios'

export default {
  name: 'Education',
  components: {
    BaseButton
  },
  setup() {
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const courses = ref([])
    const platforms = ref([])
    const loading = ref(false)

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const loadCourses = async () => {
      try {
        loading.value = true
        console.log('Loading courses from API...')
        const response = await axios.get('/education/courses')
        console.log('API response:', response.data)
        courses.value = response.data || []
        console.log('Courses loaded:', courses.value.length, 'items')
      } catch (error) {
        console.error('Error loading courses:', error)
        // Fallback to static courses
        console.log('Using fallback static courses')
        courses.value = getStaticCourses()
      } finally {
        loading.value = false
      }
    }

    const loadPlatforms = async () => {
      try {
        console.log('Loading platforms from API...')
        const response = await axios.get('/education/platforms')
        console.log('Platforms API response:', response.data)
        platforms.value = response.data || []
        console.log('Platforms loaded:', platforms.value.length, 'items')
      } catch (error) {
        console.error('Error loading platforms:', error)
        console.log('Using fallback static platforms')
        platforms.value = getStaticPlatforms()
      }
    }
    
    const categories = [
      { value: 'all', label: 'Все курсы' },
      { value: 'startup_founder', label: 'Для стартаперов' },
      { value: 'investor', label: 'Для инвесторов' },
      { value: 'businessman', label: 'Для бизнесменов' },
      { value: 'crypto_trader', label: 'Для крипто-трейдеров' }
    ]

    const getStaticPlatforms = () => [
      { id: 'coursera', name: 'Coursera', icon: 'fas fa-graduation-cap', color: '#0056d3' },
      { id: 'udemy', name: 'Udemy', icon: 'fas fa-play-circle', color: '#a435f0' },
      { id: 'skillbox', name: 'Skillbox', icon: 'fas fa-laptop-code', color: '#ff6900' },
      { id: 'netology', name: 'Нетология', icon: 'fas fa-book', color: '#ff6b35' },
      { id: 'geekbrains', name: 'GeekBrains', icon: 'fas fa-code', color: '#00d4aa' },
      { id: 'yandex', name: 'Яндекс.Практикум', icon: 'fas fa-search', color: '#fc3f1d' }
    ]

    const getStaticCourses = () => [
      {
        id: 1,
        title: 'Основы создания стартапа',
        description: 'Узнайте как создать успешный стартап с нуля. От идеи до первого клиента.',
        category: 'startup_founder',
        platform: 'coursera',
        duration: '8 недель',
        level: 'Начальный',
        price: 0,
        rating: 4.8,
        icon: 'fas fa-rocket',
        color: '#E3F2FD',
        url: 'https://www.coursera.org/learn/startup-basics',
        features: ['Сертификат', 'Практические задания', 'Менторство']
      },
      {
        id: 2,
        title: 'Инвестиционный анализ',
        description: 'Научитесь оценивать инвестиционные возможности и принимать правильные решения.',
        category: 'investor',
        platform: 'udemy',
        duration: '6 недель',
        level: 'Продвинутый',
        price: 12990,
        oldPrice: 25990,
        rating: 4.9,
        icon: 'fas fa-chart-line',
        color: '#F3E5F5',
        url: 'https://www.udemy.com/course/investment-analysis',
        features: ['Пожизненный доступ', 'Сертификат', 'Поддержка']
      },
      {
        id: 3,
        title: 'Управление бизнесом',
        description: 'Стратегии эффективного управления компанией и командой.',
        category: 'businessman',
        platform: 'skillbox',
        duration: '10 недель',
        level: 'Средний',
        price: 59900,
        rating: 4.7,
        icon: 'fas fa-briefcase',
        color: '#E8F5E9',
        url: 'https://skillbox.ru/course/business-management',
        features: ['Диплом', 'Портфолио', 'Трудоустройство']
      },
      {
        id: 4,
        title: 'Криптовалютный трейдинг',
        description: 'Основы торговли на криптовалютном рынке и технический анализ.',
        category: 'crypto_trader',
        platform: 'netology',
        duration: '4 недели',
        level: 'Начальный',
        price: 19900,
        rating: 4.6,
        icon: 'fas fa-coins',
        color: '#FFF3E0',
        url: 'https://netology.ru/courses/crypto-trading',
        features: ['Практика на симуляторе', 'Сертификат', 'Чат с экспертами']
      },
      {
        id: 5,
        title: 'Питчинг для стартапов',
        description: 'Как презентовать свой проект инвесторам и привлекать финансирование.',
        category: 'startup_founder',
        platform: 'geekbrains',
        duration: '3 недели',
        level: 'Средний',
        price: 0,
        rating: 4.5,
        icon: 'fas fa-presentation',
        color: '#E1F5FE',
        url: 'https://geekbrains.ru/courses/startup-pitching',
        features: ['Бесплатно', 'Практические кейсы', 'Обратная связь']
      },
      {
        id: 6,
        title: 'Риск-менеджмент в инвестициях',
        description: 'Управление рисками в инвестициях и портфельное планирование.',
        category: 'investor',
        platform: 'yandex',
        duration: '5 недель',
        level: 'Продвинутый',
        price: 0,
        rating: 4.8,
        icon: 'fas fa-shield-alt',
        color: '#F3E5F5',
        url: 'https://practicum.yandex.ru/risk-management',
        features: ['Бесплатно', 'Сертификат', 'Проектная работа']
      }
    ]

    const filteredCourses = computed(() => {
      console.log('Computing filtered courses...', {
        courses: courses.value,
        isArray: Array.isArray(courses.value),
        selectedCategory: selectedCategory.value,
        searchQuery: searchQuery.value
      });
      
      // Проверяем, что courses является массивом
      if (!courses.value || !Array.isArray(courses.value)) {
        console.warn('Courses is not an array:', courses.value);
        return [];
      }
      
      let filtered = [...courses.value]; // Создаем копию массива
      console.log('Initial filtered courses:', filtered.length);
      
      // Фильтрация по категории
      if (selectedCategory.value !== 'all') {
        console.log('Filtering by category:', selectedCategory.value);
        filtered = filtered.filter(course => course.category === selectedCategory.value)
        console.log('After category filter:', filtered.length);
      }
      
      // Фильтрация по поисковому запросу
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        console.log('Filtering by search query:', query);
        filtered = filtered.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.platform.toLowerCase().includes(query)
        )
        console.log('After search filter:', filtered.length);
      }
      
      console.log('Final filtered courses:', filtered.length);
      return filtered
    })

    const getPlatformIcon = (platform) => {
      if (!platforms.value || !Array.isArray(platforms.value)) {
        console.warn('Platforms is not an array:', platforms.value);
        return 'fas fa-external-link-alt';
      }
      const platformData = platforms.value.find(p => p.id === platform)
      return platformData ? platformData.icon : 'fas fa-external-link-alt'
    }

    const getPlatformName = (platform) => {
      if (!platforms.value || !Array.isArray(platforms.value)) {
        console.warn('Platforms is not an array:', platforms.value);
        return platform;
      }
      const platformData = platforms.value.find(p => p.id === platform)
      return platformData ? platformData.name : platform
    }

    const goToCourse = (course) => {
      // Открываем курс в новой вкладке
      window.open(course.url, '_blank')
    }

    const viewCourseDetails = (course) => {
      // Показываем детальную информацию о курсе
      const details = `
        Курс: ${course.title}
        Платформа: ${getPlatformName(course.platform)}
        Описание: ${course.description}
        Длительность: ${course.duration}
        Уровень: ${course.level}
        ${course.price > 0 ? `Цена: ${formatMoney(course.price)}` : 'Бесплатно'}
        ${course.oldPrice ? `Старая цена: ${formatMoney(course.oldPrice)}` : ''}
        ${course.rating ? `Рейтинг: ${course.rating}/5` : ''}
        
        Особенности:
        ${course.features.map(f => `• ${f}`).join('\n')}
        
        Ссылка: ${course.url}
      `
      
      alert(details)
    }

    // Загружаем данные при монтировании компонента
    onMounted(() => {
      loadCourses()
      loadPlatforms()
    })

    return {
      categories,
      platforms,
      selectedCategory,
      searchQuery,
      courses,
      loading,
      filteredCourses,
      goToCourse,
      viewCourseDetails,
      getPlatformIcon,
      getPlatformName,
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
  margin-bottom: 2rem;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.recommendations {
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  color: white;
}

.recommendations h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.recommended-courses {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recommended-course {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.recommended-course .course-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.recommended-course .course-image i {
  font-size: 1.5rem;
  color: white;
}

.recommended-course .course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommended-course .course-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: white;
}

.recommended-course .course-info p {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.recommended-course .course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.recommended-course .course-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.recommended-course .course-actions :deep(.base-button) {
  flex: 1;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
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

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.course-content h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.platform-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 1rem;
  flex-shrink: 0;
}

.platform-badge.coursera {
  background: #0056d3;
  color: white;
}

.platform-badge.udemy {
  background: #a435f0;
  color: white;
}

.platform-badge.skillbox {
  background: #ff6900;
  color: white;
}

.platform-badge.netology {
  background: #ff6b35;
  color: white;
}

.platform-badge.geekbrains {
  background: #00d4aa;
  color: white;
}

.platform-badge.yandex {
  background: #fc3f1d;
  color: white;
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

.course-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  margin-top: auto;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.old-price {
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.course-actions :deep(.base-button) {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.details-btn {
  background: transparent !important;
  border: 1px solid var(--primary-color) !important;
  color: var(--primary-color) !important;
}

.enroll-btn {
  background: var(--primary-color) !important;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.enroll-btn:hover {
  background: #1976d2 !important;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ffc107;
  font-weight: 500;
}

.rating i {
  color: #ffc107;
}

.no-courses {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
}

.no-courses-content {
  text-align: center;
  color: var(--text-secondary);
}

.no-courses-content i {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-courses-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.no-courses-content p {
  font-size: 1rem;
  line-height: 1.5;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
}

.loading-spinner {
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner i {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.loading-spinner p {
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .education-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .stats-container {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
  }

  .recommendations {
    padding: 1rem;
  }

  .recommended-courses {
    grid-template-columns: 1fr;
  }

  .recommended-course {
    flex-direction: column;
    text-align: center;
  }

  .recommended-course .course-image {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
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

  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .platform-badge {
    margin-left: 0;
    align-self: flex-start;
  }

  .course-actions {
    flex-direction: column;
  }

  .course-actions :deep(.base-button) {
    width: 100%;
  }
}
</style> 