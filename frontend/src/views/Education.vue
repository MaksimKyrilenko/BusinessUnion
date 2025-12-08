<template>
  <div class="education-page">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-graduation-cap"></i>
          <span>Образование</span>
        </div>
        <h1 class="header-title">Образовательные курсы</h1>
        <p class="header-subtitle">Лучшие курсы от ведущих платформ для развития ваших навыков</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-book"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ courses ? courses.length : 0 }}</span>
            <span class="stat-label">Курсов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-folder"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ categories ? categories.length - 1 : 0 }}</span>
            <span class="stat-label">Категорий</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-globe"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ platforms && platforms.length ? platforms.length : 0 }}</span>
            <span class="stat-label">Платформ</span>
          </div>
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
      
      // Дедупликация курсов по title + platform для предотвращения дублирования
      const uniqueCoursesMap = new Map();
      for (const course of courses.value) {
        const key = `${course.title?.toLowerCase() || ''}_${course.platform || ''}`;
        if (key && !uniqueCoursesMap.has(key)) {
          uniqueCoursesMap.set(key, course);
        }
      }
      const uniqueCourses = Array.from(uniqueCoursesMap.values());
      console.log(`After deduplication: ${uniqueCourses.length} unique courses (from ${courses.value.length} total)`);
      
      let filtered = [...uniqueCourses]; // Создаем копию массива
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
          course.title?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.platform?.toLowerCase().includes(query)
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
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
  position: relative;
}

.education-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

.education-page::after {
  display: none;
}

.page-header,
.search-container,
.filters,
.courses-grid,
.loading-container,
.no-courses {
  position: relative;
  z-index: 1;
}

/* Blue Header */
.page-header-blue {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  color: #fff;
  box-shadow: 0 8px 30px rgba(37,99,235,0.2);
  position: relative;
  z-index: 1;
}

.page-header-blue .header-left { flex: 1; }

.page-header-blue .header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.page-header-blue .header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.page-header-blue .header-subtitle {
  font-size: 0.95rem;
  opacity: 0.85;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.page-header-blue .header-stats {
  display: flex;
  gap: 0.875rem;
  flex-shrink: 0;
}

.page-header-blue .stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.page-header-blue .stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.page-header-blue .stat-content { display: flex; flex-direction: column; }
.page-header-blue .stat-number { font-size: 1.25rem; font-weight: 700; line-height: 1; color: #fff !important; margin-bottom: 0; }
.page-header-blue .stat-label { font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; color: #fff !important; text-transform: none !important; letter-spacing: normal !important; }

.stats-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.search-container {
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.filters {
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.filter-btn.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: #2563eb;
  color: white;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.course-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.course-image {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.course-image i {
  font-size: 2.5rem;
  color: #2563eb;
}

.course-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.course-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.platform-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
}

.platform-badge.coursera {
  background: #dbeafe;
  color: #1d4ed8;
}

.platform-badge.udemy {
  background: #f3e8ff;
  color: #7c3aed;
}

.platform-badge.skillbox {
  background: #ffedd5;
  color: #c2410c;
}

.platform-badge.netology {
  background: #fed7aa;
  color: #c2410c;
}

.platform-badge.geekbrains {
  background: #d1fae5;
  color: #047857;
}

.platform-badge.yandex {
  background: #fee2e2;
  color: #dc2626;
}

.course-content p {
  color: #64748b;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  font-size: 0.85rem;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.course-meta i {
  font-size: 0.75rem;
  color: #2563eb;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
  margin-top: auto;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2563eb;
}

.old-price {
  font-size: 0.85rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
}

.course-actions :deep(.base-button) {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 8px;
}

.details-btn {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #1e293b !important;
}

.details-btn:hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.enroll-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: none !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.enroll-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35) !important;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
  font-weight: 600;
}

.rating i {
  color: #f59e0b;
  font-size: 0.75rem;
}

.no-courses {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  padding: 2rem;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.no-courses-content {
  text-align: center;
  color: #64748b;
}

.no-courses-content i {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.no-courses-content h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.no-courses-content p {
  font-size: 0.9rem;
  line-height: 1.5;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  padding: 2rem;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.loading-spinner {
  text-align: center;
  color: #64748b;
}

.loading-spinner i {
  font-size: 2rem;
  color: #2563eb;
  margin-bottom: 0.75rem;
}

.loading-spinner p {
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .education-page {
    padding: 0.75rem;
  }

  .page-header-blue {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
  }

  .page-header-blue .header-title {
    font-size: 1.35rem;
  }

  .page-header-blue .header-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .page-header-blue .stat-card {
    flex: 1;
    min-width: 90px;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    gap: 0.35rem;
  }

  .filter-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .course-actions {
    flex-direction: column;
  }

  .course-actions :deep(.base-button) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .education-page {
    padding: 0.5rem;
  }

  .stats-container {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .stat-number {
    order: 2;
  }

  .stat-label {
    order: 1;
  }
}
</style> 