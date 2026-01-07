<template>
  <div class="news-page">
    <!-- Модальное окно для создания/редактирования события -->
    <div v-if="showEventModal" class="modal-overlay create-edit-modal" @click="closeEventModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ eventModalMode === 'create' ? 'Создать событие' : 'Редактировать событие' }}</h3>
          <button class="close-btn" @click="closeEventModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveEvent">
            <div class="form-group">
              <label for="event-title"><i class="fas fa-heading"></i> Название*</label>
              <input 
                type="text" 
                id="event-title" 
                v-model="selectedEvent.title" 
                placeholder="Введите название события"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="event-date"><i class="fas fa-calendar-alt"></i> Дата и время*</label>
              <input 
                type="datetime-local" 
                id="event-date" 
                v-model="selectedEvent.dateTime" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="event-location"><i class="fas fa-map-marker-alt"></i> Место проведения</label>
              <input 
                type="text" 
                id="event-location" 
                v-model="selectedEvent.location" 
                placeholder="Введите место проведения"
              />
            </div>
            
            <div class="form-group">
              <label for="event-description"><i class="fas fa-align-left"></i> Описание</label>
              <textarea 
                id="event-description" 
                v-model="selectedEvent.description" 
                placeholder="Введите описание события"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="event-color"><i class="fas fa-palette"></i> Цвет события</label>
              <div class="color-picker-container">
                <input 
                  type="color" 
                  id="event-color" 
                  v-model="selectedEvent.color" 
                />
                <span class="selected-color">{{ selectedEvent.color }}</span>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="submit" class="btn-primary">
                <i class="fas" :class="eventModalMode === 'create' ? 'fa-plus' : 'fa-save'"></i>
                {{ eventModalMode === 'create' ? 'Создать' : 'Сохранить' }}
              </button>
              <button type="button" class="btn-outline" @click="closeEventModal">
                <i class="fas fa-times"></i> Отмена
              </button>
              <button 
                v-if="eventModalMode === 'edit'" 
                type="button" 
                class="btn-danger" 
                @click="deleteEvent(selectedEvent.id)"
              >
                <i class="fas fa-trash-alt"></i> Удалить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для просмотра деталей события -->
    <div v-if="showEventDetailsModal && selectedEvent" class="modal-overlay event-details-modal" @click="closeEventDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedEvent.title }}</h3>
          <button class="close-btn" @click="closeEventDetailsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="event-details">
            <div class="event-detail">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatEventDateTime(selectedEvent.date) }}</span>
            </div>
            <div v-if="selectedEvent.location" class="event-detail">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ selectedEvent.location }}</span>
            </div>
            <div v-if="selectedEvent.description" class="event-description">
              <p>{{ selectedEvent.description }}</p>
            </div>
            
            <div class="event-participants">
              <h4><i class="fas fa-users"></i> Участники ({{ selectedEvent.participants ? selectedEvent.participants.length : 0 }})</h4>
              <div v-if="selectedEvent.participants && selectedEvent.participants.length > 0" class="participants-list">
                <div v-for="participantId in selectedEvent.participants" :key="participantId" class="participant-item">
                  <i class="fas fa-user"></i>
                  <span>{{ getUserNameSync(participantId) }}</span>
                </div>
              </div>
              <div v-else class="no-participants">
                <p>Пока никто не зарегистрировался</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              v-if="!isUserRegistered(selectedEvent)" 
              class="btn-primary" 
              @click="registerForEvent(selectedEvent)"
            >
              <i class="fas fa-user-plus"></i> Зарегистрироваться
            </button>
            <button 
              v-else 
              class="btn-outline" 
              @click="cancelRegistration(selectedEvent)"
            >
              <i class="fas fa-user-minus"></i> Отменить регистрацию
            </button>
            <button class="btn-outline" @click="setReminder(selectedEvent)">
              <i class="fas fa-bell"></i> Напомнить
            </button>
            <button 
              v-if="isCurrentUserOwner(selectedEvent)" 
              class="btn-outline" 
              @click="openEditEventModal(selectedEvent)"
            >
              <i class="fas fa-edit"></i> Редактировать
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для просмотра всех событий дня -->
    <div v-if="showDayEventsModal" class="modal-overlay day-events-modal" @click="closeDayEventsModal">
      <div class="modal-content" @click.stop>
                  <div class="modal-header">
            <h3>События на {{ formatDate(selectedDate) }}</h3>
            <div class="header-actions">
              <button class="close-btn" @click="closeDayEventsModal">&times;</button>
            </div>
          </div>
        <div class="modal-body">
          <div class="day-events-list">
            <div 
              v-for="event in selectedDayEvents" 
              :key="event.id" 
              class="day-event-item"
              @click="showEventDetails(event)"
            >
              <div class="event-color" :style="{ backgroundColor: event.color }"></div>
              <div class="event-info">
                <h4>{{ event.title }}</h4>
                <div class="event-meta">
                  <span><i class="fas fa-clock"></i> {{ formatEventTime(event.date) }}</span>
                  <span v-if="event.location"><i class="fas fa-map-marker-alt"></i> {{ event.location }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-primary" @click="openCreateEventModal(selectedDate)">
              <i class="fas fa-plus"></i> Создать событие
            </button>
            <button class="btn-outline" @click="closeDayEventsModal">
              <i class="fas fa-times"></i> Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-newspaper"></i>
          <span>Новости</span>
        </div>
        <h1 class="header-title">Новости и события</h1>
        <p class="header-subtitle">Будьте в курсе последних событий в мире бизнеса и технологий</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-rss"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ news.length }}</span>
            <span class="stat-label">Новостей</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ events.length }}</span>
            <span class="stat-label">Событий</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-tags"></i></div>
          <div class="stat-content">
            <span class="stat-number">5</span>
            <span class="stat-label">Категорий</span>
          </div>
        </div>
      </div>
    </div>

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
        <div class="search-group">
          <label>Поиск</label>
          <div class="search-input-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Поиск новостей..."
              @keyup.enter="searchNews"
            />
            <button class="search-button" @click="searchNews">
              <i class="fas fa-search"></i>
            </button>
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
                <img :src="news.image" :alt="news.title" @error="handleImageError($event, news)">
                <span class="news-category">{{ getCategoryName(news.category) }}</span>
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
          
          <!-- Кнопка "Показать еще" -->
          <div v-if="hasMoreNews" class="load-more-container">
            <button @click="loadMoreNews" class="load-more-button">
              Показать еще
              <i class="fas fa-chevron-down"></i>
            </button>
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
          <button class="add-event-btn" @click="openCreateEventModal()">
            <i class="fas fa-plus"></i>
            Добавить событие
          </button>
        </div>
        
        <div class="events-content">
          <div class="calendar-view">
            <div class="calendar-header">
              <div class="month-navigation">
                <button @click="previousMonth" class="month-nav-btn">
                <i class="fas fa-chevron-left"></i>
              </button>
              <h3>{{ currentMonthYear }}</h3>
                <button @click="nextMonth" class="month-nav-btn">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
              <div class="calendar-actions">
                <!-- Убрана дублирующая кнопка "Добавить" -->
              </div>
            </div>
            
            <div class="weekdays-header">
              <div class="weekday">Пн</div>
              <div class="weekday">Вт</div>
              <div class="weekday">Ср</div>
              <div class="weekday">Чт</div>
              <div class="weekday">Пт</div>
              <div class="weekday weekend">Сб</div>
              <div class="weekday weekend">Вс</div>
            </div>
            
            <div class="calendar-grid">
              <div v-for="day in calendarDays" 
                   :key="day.date" 
                   :class="['calendar-day', { 
                     'has-events': day.events.length,
                     'current': isToday(day.date),
                     'different-month': !day.isCurrentMonth,
                     'weekend': isWeekend(day.date)
                   }]"
                   @click="selectDay(day)">
                <div class="day-header">
                <span class="day-number">{{ day.dayNumber }}</span>
                </div>
                <div class="day-events">
                  <div v-for="event in day.events.slice(0, 2)" 
                       :key="event.id"
                       class="event-indicator"
                       :style="{ backgroundColor: event.color }"
                       @click.stop="showEventDetails(event)">
                    {{ event.title }}
                  </div>
                  <div v-if="day.events.length > 2" 
                       class="more-events"
                       @click.stop="showAllDayEvents(day)">
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday as _isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  getDay,
  isWeekend as _isWeekend,
  parseISO
} from 'date-fns'
import { ru } from 'date-fns/locale'
import newsApiService from '@/services/newsApi'
import eventsApiService from '@/services/eventsApi'
import api from '@/axios'
import usersApiService from '@/services/usersApi'

export default defineComponent({
  name: 'News',
  
  setup() {
    const loading = ref({
      news: true,
      events: true
    })
    const selectedCategory = ref('')
    const sortBy = ref('date')
    const searchQuery = ref('')

    // Ключи для сохранения состояния фильтров
    const NEWS_CATEGORY_KEY = 'news_selected_category'
    const NEWS_SORT_KEY = 'news_sort_by'

    // Функции для сохранения и загрузки фильтров
    const saveFilters = () => {
      if (selectedCategory.value) {
        sessionStorage.setItem(NEWS_CATEGORY_KEY, selectedCategory.value)
      } else {
        sessionStorage.removeItem(NEWS_CATEGORY_KEY)
      }
      sessionStorage.setItem(NEWS_SORT_KEY, sortBy.value)
    }

    const loadSavedFilters = () => {
      const savedCategory = sessionStorage.getItem(NEWS_CATEGORY_KEY)
      const savedSort = sessionStorage.getItem(NEWS_SORT_KEY)
      if (savedCategory) {
        selectedCategory.value = savedCategory
      }
      if (savedSort) {
        sortBy.value = savedSort
      }
    }

    // Следим за изменениями фильтров
    watch(selectedCategory, () => {
      saveFilters()
    })

    watch(sortBy, () => {
      saveFilters()
    })
    const currentMonth = ref(new Date())
    const news = ref([])
    const events = ref([])
    const showAddEventModal = ref(false)

    // Количество новостей для отображения
    const visibleNewsCount = ref(12); // По умолчанию показываем 12 новостей (4 ряда по 3)
    
    // Функция для загрузки дополнительных новостей
    const loadMoreNews = () => {
      visibleNewsCount.value += 6; // Добавляем еще 2 ряда (по 3 новости)
    }

    // Вычисляемые свойства
    const filteredNews = computed(() => {
      let filtered = [...news.value]
      
      if (selectedCategory.value) {
        // Если выбрана конкретная категория
        filtered = filtered.filter(item => item.category === selectedCategory.value)
        
        // Сортировка
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
        
        // Возвращаем только видимое количество новостей
        return filtered.slice(0, visibleNewsCount.value)
      } else {
        // Если выбраны все категории, показываем по 3 новости из каждой категории
        const categories = ['business', 'startups', 'investments', 'technology', 'crypto'];
        let result = [];
        
        // Сортируем весь массив новостей
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
      
        // Для каждой категории берем по 3 отсортированные новости
        categories.forEach(category => {
          const categoryNews = filtered
            .filter(item => item.category === category)
            .slice(0, 3);
          
          result = [...result, ...categoryNews];
        });
        
        return result;
      }
    })
    
    // Вычисляемое свойство для определения, можно ли загрузить еще новости
    const hasMoreNews = computed(() => {
      if (!selectedCategory.value) return false; // Для всех категорий кнопка не нужна
      
      // Для конкретной категории проверяем, есть ли еще новости
      const totalNewsInCategory = news.value.filter(
        item => item.category === selectedCategory.value
      ).length;
      
      return totalNewsInCategory > visibleNewsCount.value;
    })

    // Выбранный день в календаре
    const selectedDate = ref(new Date());
    
    // Модальное окно для создания/редактирования события
    const showEventModal = ref(false);
    const eventModalMode = ref('create'); // 'create' или 'edit'
    const selectedEvent = ref(null);
    
    // Модальное окно для просмотра событий дня
    const showDayEventsModal = ref(false);
    const selectedDayEvents = ref([]);
    
    // Модальное окно для просмотра деталей события
    const showEventDetailsModal = ref(false);

    const calendarDays = computed(() => {
      const monthStart = startOfMonth(currentMonth.value);
      const monthEnd = endOfMonth(currentMonth.value);
      
      // Получаем первый день недели (понедельник) для первой недели месяца
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      
      // Получаем последний день недели (воскресенье) для последней недели месяца
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      // Получаем все дни для отображения в календаре
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(date => ({
        date,
        dayNumber: format(date, 'd'),
        isCurrentMonth: isSameMonth(date, currentMonth.value),
        events: events.value.filter(event => 
          format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      }));
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

    // Кэш пользователей для избежания множественных запросов
    const usersCache = ref({});

    // Функция для получения информации о пользователе
    const getUserName = async (userId) => {
      // Если нет ID, возвращаем заглушку
      if (!userId) return 'Неизвестный пользователь';
      
      try {
        // Если пользователь уже есть в кэше, возвращаем его имя
        if (usersCache.value[userId]) {
          const user = usersCache.value[userId];
          return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Пользователь ${userId}`;
        }
        
        // Получаем данные пользователя через API
        const userData = await usersApiService.getUserById(userId);
        
        // Сохраняем в кэш Vue для реактивности
        usersCache.value[userId] = userData;
        
        // Возвращаем имя пользователя
        return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || `Пользователь ${userId}`;
      } catch (error) {
        console.error(`Ошибка при получении имени пользователя ${userId}:`, error);
        return `Пользователь ${userId}`;
      }
    };
    
    // Синхронная версия getUserName для использования в шаблоне
    const getUserNameSync = (userId) => {
      // Если нет ID, возвращаем заглушку
      if (!userId) return 'Неизвестный пользователь';
      
      // Если пользователь уже есть в кэше, возвращаем его имя
      if (usersCache.value[userId]) {
        const user = usersCache.value[userId];
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Пользователь ${userId}`;
      }
      
      // Запускаем асинхронную загрузку
      usersApiService.getUserById(userId).then(userData => {
        usersCache.value[userId] = userData;
      }).catch(error => {
        console.error(`Ошибка при получении имени пользователя ${userId}:`, error);
      });
      
      // Пока данные загружаются, возвращаем временную заглушку
      return 'Загрузка...';
    };

    // Методы
    const loadNews = async () => {
      loading.value.news = true
      try {
        // Получаем новости через News API
        const apiCategory = selectedCategory.value;
        const apiSortBy = sortBy.value === 'date' ? 'publishedAt' : 
                          sortBy.value === 'popularity' ? 'popularity' : 'relevancy';
        
        // Сбрасываем счетчик видимых новостей при смене категории
        visibleNewsCount.value = 12;
        
        let newsData;
        
        if (apiCategory) {
          // Если выбрана категория, используем поиск по теме
          newsData = await newsApiService.getNewsByTopic(apiCategory);
        } else {
          // Если категория не выбрана, получаем новости для всех категорий
          const categories = ['business', 'startups', 'investments', 'technology', 'crypto'];
          newsData = [];
          
          // Для каждой категории получаем новости
          for (const category of categories) {
            try {
              const categoryNews = await newsApiService.getNewsByTopic(category);
              newsData = [...newsData, ...categoryNews];
            } catch (error) {
              console.error(`Ошибка при загрузке новостей категории ${category}:`, error);
            }
          }
          
          // Если не удалось получить новости, используем основной API
          if (newsData.length === 0) {
            newsData = await newsApiService.getTopNews('', apiSortBy);
          }
        }
        
        news.value = newsData;
        
        // Если новостей нет или произошла ошибка, используем резервные данные
        if (!newsData || newsData.length === 0) {
          console.warn('Не удалось получить новости через API, используем резервные данные');
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
        }
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error)
        // В случае ошибки используем резервные данные
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
      } finally {
        loading.value.news = false
      }
    }

    const loadEvents = async () => {
      loading.value.events = true
      try {
        // Получаем события из API
        const eventsData = await eventsApiService.getEvents();
        
        // Если нет событий, создаем тестовые данные
        if (!eventsData || eventsData.length === 0) {
          const testEvents = [
          {
            id: 1,
            title: 'Startup Summit 2024',
            description: 'Крупнейшая конференция для стартапов и инвесторов в этом году',
            date: new Date(Date.now() + 604800000), // через неделю
            location: 'Москва, Технопарк "Сколково"',
              color: '#4CAF50',
              createdBy: localStorage.getItem('userId'),
              participants: []
          },
          {
            id: 2,
            title: 'Мастер-класс по привлечению инвестиций',
            description: 'Практические советы от успешных предпринимателей',
            date: new Date(Date.now() + 259200000), // через 3 дня
            location: 'Онлайн',
              color: '#2196F3',
              createdBy: localStorage.getItem('userId'),
              participants: []
          },
          {
            id: 3,
            title: 'Networking для предпринимателей',
            description: 'Неформальная встреча для обмена опытом и поиска партнеров',
            date: new Date(Date.now() + 432000000), // через 5 дней
            location: 'Москва, Бизнес-центр "Москва-Сити"',
              color: '#FF9800',
              createdBy: localStorage.getItem('userId'),
              participants: []
          }
          ];
          
          // Сохраняем тестовые события
          for (const event of testEvents) {
            await eventsApiService.createEvent(event);
          }
          
          // Получаем обновленные события
          events.value = await eventsApiService.getEvents();
        } else {
          // Преобразуем строковые даты в объекты Date
          events.value = eventsData.map(event => ({
            ...event,
            date: event.date instanceof Date ? event.date : new Date(event.date)
          }));
        }
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
        events.value = [];
      } finally {
        loading.value.events = false;
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
    
    const isWeekend = (date) => {
      return _isWeekend(date)
    }
    
    const goToToday = () => {
      currentMonth.value = new Date()
      selectedDate.value = new Date()
    }
    
    const selectDay = (day) => {
      selectedDate.value = day.date
      
      // Если есть события в этот день, показываем их
      if (day.events.length > 0) {
        selectedDayEvents.value = day.events
        showDayEventsModal.value = true
      } else {
        // Если событий нет, открываем модальное окно для создания события
        openCreateEventModal(day.date)
      }
    }
    
    const openCreateEventModal = (date = selectedDate.value) => {
      eventModalMode.value = 'create'
      
      // Форматируем дату для input type="datetime-local"
      const dateTimeLocal = format(date, "yyyy-MM-dd'T'HH:mm")
      
      selectedEvent.value = {
        title: '',
        description: '',
        date: date,
        dateTime: dateTimeLocal, // Для input type="datetime-local"
        location: '',
        color: '#4CAF50'
      }
      showEventModal.value = true
    }
    
    const openEditEventModal = (event) => {
      eventModalMode.value = 'edit'
      
      // Форматируем дату для input type="datetime-local"
      const dateTimeLocal = format(new Date(event.date), "yyyy-MM-dd'T'HH:mm")
      
      selectedEvent.value = { 
        ...event,
        dateTime: dateTimeLocal // Для input type="datetime-local"
      }
      showEventModal.value = true
    }
    
    const closeEventModal = () => {
      showEventModal.value = false
      selectedEvent.value = null
    }
    
    const saveEvent = async () => {
      try {
        if (!selectedEvent.value.title) {
          alert('Название события обязательно')
          return
        }
        
        if (eventModalMode.value === 'create') {
          // Создаем новое событие
          await createEvent(selectedEvent.value)
        } else {
          // Обновляем существующее событие
          await updateEvent(selectedEvent.value)
        }
        
        closeEventModal()
        // Не нужно перезагружать события, так как мы уже обновили состояние
        // в функциях createEvent и updateEvent
      } catch (error) {
        console.error('Ошибка при сохранении события:', error)
        alert('Не удалось сохранить событие. Пожалуйста, попробуйте позже.')
      }
    }
    
    const createEvent = async (eventData) => {
      try {
        // Преобразуем dateTime в объект Date
        if (eventData.dateTime) {
          eventData.date = new Date(eventData.dateTime);
          delete eventData.dateTime; // Удаляем вспомогательное поле
        }
        
        // Создаем событие через API
        const newEvent = await eventsApiService.createEvent(eventData);
        
        // Добавляем новое событие в список без перезагрузки
        events.value.push(newEvent);
        
        return newEvent;
      } catch (error) {
        console.error('Ошибка при создании события:', error);
        throw error;
      }
    }
    
    const updateEvent = async (eventData) => {
      try {
        // Преобразуем dateTime в объект Date
        if (eventData.dateTime) {
          eventData.date = new Date(eventData.dateTime);
          delete eventData.dateTime; // Удаляем вспомогательное поле
        }
        
        // Обновляем событие через API
        const updatedEvent = await eventsApiService.updateEvent(eventData.id, eventData);
        
        // Обновляем событие в списке без перезагрузки
        const index = events.value.findIndex(event => event.id === updatedEvent.id);
        if (index !== -1) {
          events.value[index] = updatedEvent;
        }
        
        // Обновляем выбранные события дня, если модальное окно открыто
        if (showDayEventsModal.value) {
          const dayEventIndex = selectedDayEvents.value.findIndex(event => event.id === updatedEvent.id);
          if (dayEventIndex !== -1) {
            selectedDayEvents.value[dayEventIndex] = updatedEvent;
          }
        }
        
        return updatedEvent;
      } catch (error) {
        console.error('Ошибка при обновлении события:', error);
        throw error;
      }
    }
    
    const deleteEvent = async (eventId) => {
      try {
        // Удаляем событие через API
        await eventsApiService.deleteEvent(eventId);
        
        // Обновляем состояние после удаления
        events.value = events.value.filter(event => event.id !== eventId);
        
        // Обновляем выбранные события дня, если модальное окно открыто
        if (showDayEventsModal.value) {
          selectedDayEvents.value = selectedDayEvents.value.filter(event => event.id !== eventId);
        }
        
        closeEventModal();
        closeEventDetailsModal();
      } catch (error) {
        console.error('Ошибка при удалении события:', error);
        alert('Не удалось удалить событие. Пожалуйста, попробуйте позже.');
      }
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
    
    // Форматирование даты для отображения в деталях события
    const formatEventDateTime = (date) => {
      return format(new Date(date), 'd MMMM yyyy, HH:mm', { locale: ru })
    }

    const showEventDetails = (event) => {
      selectedEvent.value = event
      openEventDetailsModal()
    }

    const showAllDayEvents = (day) => {
      selectedDayEvents.value = day.events
      showDayEventsModal.value = true
    }
    
    const openEventDetailsModal = () => {
      // Открываем модальное окно с деталями события
      showEventDetailsModal.value = true
    }
    
    const closeEventDetailsModal = () => {
      showEventDetailsModal.value = false
      selectedEvent.value = null
    }
    
    const closeDayEventsModal = () => {
      showDayEventsModal.value = false
      selectedDayEvents.value = []
    }

    const registerForEvent = async (event) => {
      try {
        // Вызываем API для регистрации на событие
        const updatedEvent = await eventsApiService.registerForEvent(event.id);
        
        // Обновляем событие в списке без перезагрузки
        const index = events.value.findIndex(e => e.id === event.id);
        if (index !== -1) {
          events.value[index] = updatedEvent;
        }
        
        // Обновляем выбранное событие в модальном окне
        if (selectedEvent.value && selectedEvent.value.id === event.id) {
          selectedEvent.value = updatedEvent;
        }
        
        // Обновляем выбранные события дня, если модальное окно открыто
        if (showDayEventsModal.value) {
          const dayEventIndex = selectedDayEvents.value.findIndex(e => e.id === event.id);
          if (dayEventIndex !== -1) {
            selectedDayEvents.value[dayEventIndex] = updatedEvent;
          }
        }
        
        // Показываем сообщение об успешной регистрации
        alert(`Вы успешно зарегистрировались на событие: ${event.title}`);
      } catch (error) {
        console.error('Ошибка при регистрации на событие:', error);
        alert('Не удалось зарегистрироваться на событие. Пожалуйста, попробуйте позже.');
      }
    }

    const cancelRegistration = async (event) => {
      try {
        // Вызываем API для отмены регистрации на событие
        const updatedEvent = await eventsApiService.cancelRegistration(event.id);
        
        // Обновляем событие в списке без перезагрузки
        const index = events.value.findIndex(e => e.id === event.id);
        if (index !== -1) {
          events.value[index] = updatedEvent;
        }
        
        // Обновляем выбранное событие в модальном окне
        if (selectedEvent.value && selectedEvent.value.id === event.id) {
          selectedEvent.value = updatedEvent;
        }
        
        // Обновляем выбранные события дня, если модальное окно открыто
        if (showDayEventsModal.value) {
          const dayEventIndex = selectedDayEvents.value.findIndex(e => e.id === event.id);
          if (dayEventIndex !== -1) {
            selectedDayEvents.value[dayEventIndex] = updatedEvent;
          }
        }
        
        // Показываем сообщение об отмене регистрации
        alert(`Вы отменили регистрацию на событие: ${event.title}`);
      } catch (error) {
        console.error('Ошибка при отмене регистрации на событие:', error);
        alert('Не удалось отменить регистрацию на событие. Пожалуйста, попробуйте позже.');
      }
    }

    const setReminder = async (event) => {
      // Реализация установки напоминания
      alert(`Напоминание о событии "${event.title}" будет отправлено за 1 час до начала`)
    }
    
    const isUserRegistered = (event) => {
      // Проверяем, зарегистрирован ли текущий пользователь на событие
      if (!event.participants) return false
      
      const userId = localStorage.getItem('userId')
      return userId && event.participants.includes(userId)
    }
    
    const isCurrentUserOwner = (event) => {
      // Проверяем, является ли текущий пользователь создателем события
      if (!event.createdBy) return false
      
      const userId = localStorage.getItem('userId')
      return userId && event.createdBy === userId
    }
    
    const searchNews = async () => {
      if (!searchQuery.value.trim()) {
        // Если поле поиска пустое, загружаем обычные новости
        loadNews();
        return;
      }
      
      loading.value.news = true;
      try {
        const newsData = await newsApiService.searchNews(searchQuery.value);
        news.value = newsData;
      } catch (error) {
        console.error('Ошибка при поиске новостей:', error);
      } finally {
        loading.value.news = false;
      }
    }
    
    const handleImageError = (event, newsItem) => {
      // Заменяем битое изображение на заглушку
      event.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(newsItem.source)}`;
    }
    
    const getCategoryName = (category) => {
      const categoryNames = {
        'business': 'Бизнес',
        'startups': 'Стартапы',
        'investments': 'Инвестиции',
        'technology': 'Технологии',
        'crypto': 'Крипто'
      };
      
      return categoryNames[category] || category;
    }

    // Следим за изменениями фильтров и обновляем новости
    watch([selectedCategory, sortBy], () => {
      loadNews()
    })

    onMounted(() => {
      loadSavedFilters()
      loadNews()
      loadEvents()
    })

    return {
      loading,
      selectedCategory,
      sortBy,
      searchQuery,
      news,
      events,
      showAddEventModal,
      filteredNews,
      calendarDays,
      currentMonthYear,
      upcomingEvents,
      selectedDate,
      showEventModal,
      eventModalMode,
      selectedEvent,
      showDayEventsModal,
      selectedDayEvents,
      showEventDetailsModal,
      previousMonth,
      nextMonth,
      isToday,
      isWeekend,
      goToToday,
      selectDay,
      formatDate,
      formatEventDay,
      formatEventMonth,
      formatEventTime,
      formatEventDateTime,
      showEventDetails,
      showAllDayEvents,
      registerForEvent,
      cancelRegistration,
      setReminder,
      searchNews,
      handleImageError,
      getCategoryName,
      openCreateEventModal,
      openEditEventModal,
      closeEventModal,
      saveEvent,
      deleteEvent,
      openEventDetailsModal,
      closeEventDetailsModal,
      closeDayEventsModal,
      isUserRegistered,
      isCurrentUserOwner,
      visibleNewsCount,
      loadMoreNews,
      hasMoreNews,
      getUserName,
      getUserNameSync
    }
  }
})
</script>

<style scoped>
.news-page {
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
  position: relative;
  box-sizing: border-box;
  overflow-x: hidden;
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

.page-header-blue .header-left {
  flex: 1;
}

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
  color: #fff !important;
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

.page-header-blue .stat-content {
  display: flex;
  flex-direction: column;
}

.page-header-blue .stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  color: #fff !important;
}

.page-header-blue .stat-label {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 0.15rem;
  color: #fff !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.news-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

.news-page::after {
  display: none;
}

.news-header,
.content-grid,
.news-section,
.events-section,
.upcoming-events-section {
  position: relative;
  z-index: 1;
}

/* Responsive for blue header */
@media (max-width: 900px) {
  .page-header-blue {
    flex-direction: column;
    gap: 1.25rem;
  }
  .page-header-blue .header-stats {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .page-header-blue {
    padding: 1rem 1.25rem;
  }
  .page-header-blue .header-title {
    font-size: 1.35rem;
  }
  .page-header-blue .header-stats {
    flex-wrap: wrap;
  }
  .page-header-blue .stat-card {
    flex: 1;
    min-width: 90px;
    padding: 0.6rem 0.75rem;
  }
}

.news-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-group label {
  font-weight: 600;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.filter-group select {
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  min-width: 160px;
  font-size: 0.9rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex-grow: 1;
}

.search-group label {
  font-weight: 600;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.search-input-container {
  display: flex;
  position: relative;
}

.search-input-container input {
  flex-grow: 1;
  padding: 0.625rem 2.5rem 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  color: #1e293b;
  min-width: 200px;
}

.search-input-container input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input-container input::placeholder {
  color: #94a3b8;
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.search-button:hover {
  color: #1d4ed8;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 400px);
  gap: 1rem;
}

.news-section {
  grid-column: span 2;
}

.news-section,
.events-section,
.upcoming-events-section {
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.events-section {
  min-width: 0; /* Позволяет сжиматься в grid */
}

.news-section h2,
.events-section h2,
.upcoming-events-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.news-section h2::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 2px;
}

.news-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.news-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.25s ease;
}

.news-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.news-image {
  position: relative;
  width: 100%;
  padding-top: 56%;
  overflow: hidden;
}

.news-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.05);
}

.news-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.news-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.news-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.news-source {
  color: #2563eb;
  font-weight: 500;
}

.news-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  color: #1e293b;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.read-more {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.8rem;
  transition: color 0.2s;
}

.read-more:hover {
  color: #1d4ed8;
}

.news-stats {
  display: flex;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.75rem;
}

.news-stats span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.news-stats i {
  font-size: 0.7rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.events-header h2 {
  margin: 0 !important;
}

.add-event-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.add-event-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.events-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.calendar-view {
  margin-bottom: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.month-nav-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.month-nav-btn:hover {
  background-color: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.calendar-header h3 {
  font-size: 1rem;
  color: #1e293b;
  text-transform: capitalize;
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}

.today-btn {
  padding: 0.5rem 1rem;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #4a5568;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
}

.calendar-actions {
  display: flex;
  gap: 0.75rem;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.25rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.5rem 0;
  text-transform: uppercase;
}

.weekday.weekend {
  color: #ef4444;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.calendar-day {
  min-height: 65px;
  padding: 0.25rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background-color: #eff6ff;
}

.calendar-day.current {
  background: #dbeafe;
}

.calendar-day.current .day-number {
  background-color: #2563eb;
  color: white;
}

.calendar-day.has-events {
  background: #f8fafc;
}

.calendar-day.different-month {
  background-color: #f8fafc;
}

.calendar-day.different-month .day-number {
  opacity: 0.4;
}

.calendar-day.weekend {
  background-color: #fefce8;
}

.day-header {
  display: flex;
  justify-content: center;
  padding: 0.15rem 0;
}

.day-number {
  font-size: 0.8rem;
  color: #1e293b;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
}

.calendar-day.weekend .day-number {
  color: #ef4444;
}

.day-events {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.15rem 0;
}

.event-indicator {
  font-size: 0.65rem;
  padding: 0.1rem 0.25rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #2563eb;
  margin: 0 2px;
}

.more-events {
  font-size: 0.65rem;
  color: #2563eb;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
}

.upcoming-events-section {
  margin-top: 0;
  min-width: 0; /* Позволяет сжиматься в grid */
}

.upcoming-events-list {
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin: 0 -0.5rem;
  padding: 0.5rem;
}

.upcoming-events-grid {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.event-card {
  flex: 0 0 260px;
  min-width: 220px;
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #fff;
  transition: all 0.25s ease;
}

.event-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 10px;
  min-width: 60px;
}

.event-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
  line-height: 1;
}

.event-month {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 0.25rem;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-info h4 {
  margin: 0 0 0.35rem 0;
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-description {
  color: #64748b;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.event-details span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-details i {
  color: #2563eb;
  font-size: 0.7rem;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-register {
  padding: 0.4rem 0.75rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-register:hover {
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-remind {
  padding: 0.4rem 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-remind:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #2563eb;
  font-size: 0.9rem;
}

.loading-state i {
  font-size: 1.5rem;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.load-more-button {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-button:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

/* Стили для модальных окон */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Устанавливаем разные z-index для разных типов модальных окон */
.modal-overlay.event-details-modal {
  z-index: 1200;
}

.modal-overlay.day-events-modal {
  z-index: 1100;
}

.modal-overlay.create-edit-modal {
  z-index: 1300;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  animation: modal-appear 0.2s ease-out;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f8fafc;
}

/* Стилизация скроллбара для WebKit (Chrome, Safari) */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 10px;
  border: 2px solid transparent;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc, #fff);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group label i {
  color: #2563eb;
  width: 18px;
  text-align: center;
}

.form-group input, 
.form-group textarea {
  width: 100%;
  padding: 0.7rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-group input:focus, 
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Анимация появления модального окна */
@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #4a5568;
  padding: 0.5rem 0;
}

.event-detail i {
  color: #2563eb;
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.event-description {
  margin-top: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.event-description p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-line;
}

.event-participants {
  margin-top: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.event-participants h4 {
  margin: 0 0 0.75rem 0;
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #eff6ff;
  border-radius: 8px;
  border-left: 3px solid #2563eb;
}

.event-participants h4 i {
  color: #2563eb;
  margin-right: 0.25rem;
}

.participants-list {
  display: flex;
  flex-direction: column;
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem;
  border-radius: 8px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f8fafc;
}

.participants-list::-webkit-scrollbar {
  width: 6px;
}

.participants-list::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

.participants-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 10px;
}

.participants-list::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4a5568;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
}

.participant-item:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.participant-item i {
  color: #2563eb;
  font-size: 0.8rem;
  background-color: #dbeafe;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-participants {
  color: #718096;
  font-style: italic;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  text-align: center;
  border: 1px dashed #cbd5e0;
  margin: 0.5rem 0;
}

.no-participants p {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.no-participants p:before {
  content: '\f068';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #a0aec0;
}

.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.day-event-item {
  display: flex;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.day-event-item:hover {
  background-color: #f7fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.event-color {
  width: 4px;
  border-radius: 2px;
  margin-right: 1rem;
  align-self: stretch;
}

.event-info {
  flex: 1;
}

.event-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-weight: 600;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #718096;
  font-size: 0.875rem;
}

.event-meta i {
  color: #2563eb;
  margin-right: 0.25rem;
}

/* Стили для кнопок */
.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.btn-outline {
  background: #fff;
  color: #1e293b;
  padding: 0.7rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Responsive для широких экранов */
@media (min-width: 1400px) {
  .content-grid {
    grid-template-columns: 1fr minmax(350px, 450px);
  }
}

/* Responsive для средних экранов */
@media (max-width: 1400px) {
  .content-grid {
    grid-template-columns: 1fr minmax(300px, 380px);
  }
  
  .event-card {
    flex: 0 0 250px;
  }
}

/* Responsive для экранов до 1200px */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .news-section {
    grid-column: span 1;
  }
  
  .upcoming-events-section {
    order: 1;
  }
  
  .events-section {
    order: 2;
  }
}

/* Responsive для планшетов */
@media (max-width: 1024px) {
  .news-page {
    padding: 0.75rem;
  }
  
  .news-header {
    padding: 1rem;
  }
  
  .news-filters {
    padding: 0.75rem;
  }
  
  .calendar-day {
    min-height: 55px;
  }
  
  .event-card {
    flex: 0 0 260px;
  }
}

@media (max-width: 768px) {
  .news-page {
    padding: 0.75rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .news-header {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .news-header h1 {
    font-size: 1.25rem;
  }
  
  .news-filters {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-group select,
  .search-input-container input {
    width: 100%;
    min-width: auto;
    font-size: 16px;
  }
  
  .news-cards-grid {
    grid-template-columns: 1fr;
  }

  .upcoming-events-grid {
    flex-direction: column;
  }

  .event-card {
    flex: 1 1 100%;
  }
}

@media (max-width: 480px) {
  .news-page {
    padding: 0.5rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .events-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .add-event-btn {
    justify-content: center;
  }
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-picker-container input[type="color"] {
  width: 50px;
  height: 35px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-picker-container input[type="color"]:hover {
  transform: scale(1.05);
}

.color-picker-container input[type="color"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.selected-color {
  font-family: monospace;
  color: #4a5568;
  font-size: 0.9rem;
  background-color: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>