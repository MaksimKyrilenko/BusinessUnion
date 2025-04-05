<template>
  <div class="news-page">
    <div class="news-header">
      <h1>Новости и события</h1>
      <div class="news-filters">
        <div class="filter-group">
          <label>Категории</label>
          <select v-model="selectedCategory">
            <option value="">Все категории</option>
            <option value="business">Бизнес</option>
            <option value="startups">Стартапы</option>
            <option value="investments">Инвестиции</option>
            <option value="technology">Технологии</option>
            <option value="crypto">Криптовалюты</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Сортировка</label>
          <select v-model="sortBy">
            <option value="date">По дате</option>
            <option value="popularity">По популярности</option>
            <option value="relevance">По релевантности</option>
          </select>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- Новости -->
      <div class="news-section">
        <h2>Последние новости</h2>
        <div class="news-list" v-if="!loading.news">
          <div class="news-cards-grid">
            <article v-for="news in filteredNews" :key="news.id" class="news-card">
              <div class="news-image" v-if="news.image">
                <img :src="news.image" :alt="news.title">
                <span class="news-category">{{ news.category }}</span>
              </div>
              <div class="news-content">
                <div class="news-meta">
                  <span class="news-date">{{ formatDate(news.date) }}</span>
                  <span class="news-source">{{ news.source }}</span>
                </div>
                <h3>{{ news.title }}</h3>
                <p>{{ news.description }}</p>
                <div class="news-footer">
                  <a :href="news.url" target="_blank" class="read-more">Читать далее</a>
                  <div class="news-stats">
                    <span class="views"><i class="fas fa-eye"></i> {{ news.views }}</span>
                    <span class="comments"><i class="fas fa-comment"></i> {{ news.comments }}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
        <div v-else class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка новостей...</span>
        </div>
      </div>

      <!-- Ближайшие события -->
      <div class="upcoming-events-section">
        <h2>Ближайшие события</h2>
        <div class="upcoming-events-list" v-if="!loading.events">
          <div class="upcoming-events-grid">
            <div v-for="event in upcomingEvents" :key="event.id" class="event-card">
              <div class="event-date">
                <span class="event-day">{{ formatEventDay(event.date) }}</span>
                <span class="event-month">{{ formatEventMonth(event.date) }}</span>
              </div>
              <div class="event-info">
                <h4>{{ event.title }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div class="event-details">
                  <span class="event-time">
                    <i class="fas fa-clock"></i>
                    {{ formatEventTime(event.date) }}
                  </span>
                  <span class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ event.location }}
                  </span>
                </div>
                <div class="event-actions">
                  <button class="btn-register" @click="registerForEvent(event)">
                    Зарегистрироваться
                  </button>
                  <button class="btn-remind" @click="setReminder(event)">
                    <i class="fas fa-bell"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка событий...</span>
        </div>
      </div>

      <!-- Календарь и все события -->
      <div class="events-section">
        <div class="events-header">
          <h2>Предстоящие события</h2>
          <button class="add-event-btn" @click="showAddEventModal = true">
            <i class="fas fa-plus"></i>
            Добавить событие
          </button>
        </div>
        
        <div class="events-content">
          <div class="calendar-view">
            <div class="calendar-header">
              <button @click="previousMonth">
                <i class="fas fa-chevron-left"></i>
              </button>
              <h3>{{ currentMonthYear }}</h3>
              <button @click="nextMonth">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="calendar-grid">
              <div v-for="day in calendarDays" 
                   :key="day.date" 
                   :class="['calendar-day', { 
                     'has-events': day.events.length,
                     'current': isToday(day.date),
                     'different-month': !day.isCurrentMonth
                   }]">
                <span class="day-number">{{ day.dayNumber }}</span>
                <div class="day-events">
                  <div v-for="event in day.events.slice(0, 2)" 
                       :key="event.id"
                       class="event-indicator"
                       :style="{ backgroundColor: event.color }"
                       @click="showEventDetails(event)">
                    {{ event.title }}
                  </div>
                  <div v-if="day.events.length > 2" 
                       class="more-events"
                       @click="showAllDayEvents(day)">
                    +{{ day.events.length - 2 }} ещё
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday as _isToday } from 'date-fns'
import { ru } from 'date-fns/locale'

export default defineComponent({
  name: 'News',
  
  setup() {
    const loading = ref({
      news: true,
      events: true
    })
    const selectedCategory = ref('')
    const sortBy = ref('date')
    const currentMonth = ref(new Date())
    const news = ref([])
    const events = ref([])
    const showAddEventModal = ref(false)

    // Вычисляемые свойства
    const filteredNews = computed(() => {
      let filtered = [...news.value]
      
      if (selectedCategory.value) {
        filtered = filtered.filter(item => item.category === selectedCategory.value)
      }
      
      switch (sortBy.value) {
        case 'date':
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
          break
        case 'popularity':
          filtered.sort((a, b) => b.views - a.views)
          break
        case 'relevance':
          filtered.sort((a, b) => b.relevanceScore - a.relevanceScore)
          break
      }
      
      return filtered
    })

    const calendarDays = computed(() => {
      const start = startOfMonth(currentMonth.value)
      const end = endOfMonth(currentMonth.value)
      
      return eachDayOfInterval({ start, end }).map(date => ({
        date,
        dayNumber: format(date, 'd'),
        isCurrentMonth: true,
        events: events.value.filter(event => 
          format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      }))
    })

    const currentMonthYear = computed(() => {
      return format(currentMonth.value, 'LLLL yyyy', { locale: ru })
    })

    const upcomingEvents = computed(() => {
      const now = new Date()
      return events.value
        .filter(event => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
    })

    // Методы
    const loadNews = async () => {
      loading.value.news = true
      try {
        // Временные тестовые данные
        news.value = [
          {
            id: 1,
            title: 'Новый тренд в мире стартапов: AI-powered решения',
            description: 'Искусственный интеллект становится ключевым драйвером инноваций в стартап-индустрии. Инвесторы активно интересуются проектами в этой области.',
            date: new Date(),
            category: 'startups',
            image: 'https://picsum.photos/400/300',
            source: 'TechCrunch',
            views: 1250,
            comments: 45,
            url: '#'
          },
          {
            id: 2,
            title: 'Рекордные инвестиции в финтех-сектор',
            description: 'В первом квартале 2024 года объем инвестиций в финтех-проекты достиг исторического максимума. Аналитики прогнозируют дальнейший рост.',
            date: new Date(Date.now() - 86400000),
            category: 'investments',
            image: 'https://picsum.photos/400/301',
            source: 'Forbes',
            views: 980,
            comments: 32,
            url: '#'
          },
          {
            id: 3,
            title: 'Криптовалютный рынок: новая волна роста',
            description: 'Bitcoin и другие криптовалюты показывают устойчивый рост. Эксперты связывают это с увеличением институционального интереса.',
            date: new Date(Date.now() - 172800000),
            category: 'crypto',
            image: 'https://picsum.photos/400/302',
            source: 'CoinDesk',
            views: 2100,
            comments: 89,
            url: '#'
          }
        ]
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error)
      } finally {
        loading.value.news = false
      }
    }

    const loadEvents = async () => {
      loading.value.events = true
      try {
        // Временные тестовые данные
        events.value = [
          {
            id: 1,
            title: 'Startup Summit 2024',
            description: 'Крупнейшая конференция для стартапов и инвесторов в этом году',
            date: new Date(Date.now() + 604800000), // через неделю
            location: 'Москва, Технопарк "Сколково"',
            color: '#4CAF50'
          },
          {
            id: 2,
            title: 'Мастер-класс по привлечению инвестиций',
            description: 'Практические советы от успешных предпринимателей',
            date: new Date(Date.now() + 259200000), // через 3 дня
            location: 'Онлайн',
            color: '#2196F3'
          },
          {
            id: 3,
            title: 'Networking для предпринимателей',
            description: 'Неформальная встреча для обмена опытом и поиска партнеров',
            date: new Date(Date.now() + 432000000), // через 5 дней
            location: 'Москва, Бизнес-центр "Москва-Сити"',
            color: '#FF9800'
          }
        ]
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error)
      } finally {
        loading.value.events = false
      }
    }

    const previousMonth = () => {
      currentMonth.value = subMonths(currentMonth.value, 1)
    }

    const nextMonth = () => {
      currentMonth.value = addMonths(currentMonth.value, 1)
    }

    const isToday = (date) => {
      return _isToday(date)
    }

    const formatDate = (date) => {
      return format(new Date(date), 'd MMMM yyyy', { locale: ru })
    }

    const formatEventDay = (date) => {
      return format(new Date(date), 'd')
    }

    const formatEventMonth = (date) => {
      return format(new Date(date), 'MMM', { locale: ru })
    }

    const formatEventTime = (date) => {
      return format(new Date(date), 'HH:mm')
    }

    const showEventDetails = (event) => {
      // Реализация показа деталей события
    }

    const showAllDayEvents = (day) => {
      // Реализация показа всех событий дня
    }

    const registerForEvent = async (event) => {
      // Реализация регистрации на событие
    }

    const setReminder = async (event) => {
      // Реализация установки напоминания
    }

    onMounted(() => {
      loadNews()
      loadEvents()
    })

    return {
      loading,
      selectedCategory,
      sortBy,
      news,
      events,
      showAddEventModal,
      filteredNews,
      calendarDays,
      currentMonthYear,
      upcomingEvents,
      previousMonth,
      nextMonth,
      isToday,
      formatDate,
      formatEventDay,
      formatEventMonth,
      formatEventTime,
      showEventDetails,
      showAllDayEvents,
      registerForEvent,
      setReminder
    }
  }
})
</script>

<style scoped>
.news-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 60px;
}

.news-header {
  margin-bottom: 2rem;
}

.news-header h1 {
  font-size: 2.2rem;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.news-filters {
  display: flex;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #4a5568;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  min-width: 200px;
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.news-section,
.events-section,
.upcoming-events-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.news-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.news-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.news-image {
  position: relative;
  width: 100%;
  padding-top: 60%; /* Соотношение сторон 5:3 */
  overflow: hidden;
}

.news-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-category {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.news-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.news-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  line-height: 1.4;
}

.news-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  flex-grow: 1;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.read-more {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
}

.news-stats {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.875rem;
}

.news-stats i {
  margin-right: 0.25rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-event-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-event-btn:hover {
  background: #1976D2;
}

.events-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

.calendar-view {
  margin-bottom: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #4a5568;
}

.calendar-header h3 {
  font-size: 1.2rem;
  color: #2d3748;
  text-transform: capitalize;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

.calendar-day.current {
  background: #ebf8ff;
  border-color: #90cdf4;
}

.calendar-day.has-events {
  background: #f7fafc;
}

.calendar-day.different-month {
  opacity: 0.5;
}

.day-number {
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.day-events {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-indicator {
  font-size: 0.8rem;
  padding: 0.25rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #4CAF50;
}

.more-events {
  font-size: 0.8rem;
  color: #718096;
  cursor: pointer;
  text-align: center;
  margin-top: 0.25rem;
}

.upcoming-events-section {
  margin-top: 2rem;
}

.upcoming-events-list {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.upcoming-events-grid {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 0;
}

.event-card {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 8px;
}

.event-day {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
}

.event-month {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
}

.event-info {
  flex: 1;
}

.event-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.event-description {
  color: #4a5568;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.event-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #718096;
}

.event-details span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-register {
  padding: 0.5rem 1rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-remind {
  padding: 0.5rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #4a5568;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #718096;
}

@media (max-width: 1200px) {
  .events-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .news-cards-grid {
    grid-template-columns: 1fr;
  }

  .news-card {
    margin-bottom: 1rem;
  }

  .upcoming-events-grid {
    flex-wrap: wrap;
  }

  .event-card {
    flex: 1 1 100%;
  }
}
</style>