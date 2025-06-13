<template>
  <div class="startup-catalog">
    <h1>Каталог стартапов</h1>
    
    <!-- Поиск и фильтры (горизонтально) -->
    <div class="filters-horizontal">
      <div class="search-box">
        <div class="search-input-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по имени, компании или специализации..."
            class="search-input"
          >
        </div>
      </div>
      
      <div class="filters-row">
        <div class="filter-item">
          <select v-model="filters.stage" class="filter-select">
            <option value="">Все типы</option>
            <option value="idea">Идея</option>
            <option value="mvp">MVP</option>
            <option value="growth">Рост</option>
            <option value="scaling">Масштабирование</option>
          </select>
        </div>
        
        <div class="filter-item">
          <select v-model="filters.sector" class="filter-select">
            <option value="">Все отрасли</option>
            <option v-for="sector in sectors" 
                    :key="sector.id" 
                    :value="sector.id"
            >
              {{ sector.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <select v-model="filters.location" class="filter-select">
            <option value="">Все локации</option>
            <option v-for="location in uniqueLocations" 
                    :key="location" 
                    :value="location"
            >
              {{ location }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="catalog-container">
      <!-- Индикатор загрузки -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Загрузка стартапов...</p>
      </div>

      <!-- Список стартапов -->
      <div v-else-if="filteredStartups.length === 0" class="no-results">
        <p>По вашему запросу ничего не найдено</p>
      </div>

      <div v-else class="startups-grid">
        <div v-for="startup in paginatedStartups" 
             :key="startup.id" 
             class="startup-card"
        >
          <div class="startup-image">
            <img :src="startup.image || '/assets/images/placeholder-project.jpg'" :alt="startup.title">
            <div class="startup-stage">{{ getStageText(startup.stage) }}</div>
          </div>
          
          <div class="startup-content">
            <div class="startup-header">
              <div class="startup-info">
                <h3>{{ startup.title }}</h3>
                <div class="startup-meta">
                  <span v-if="startup.category" class="sector">{{ startup.category.name }}</span>
                  <span v-if="startup.location" class="location">{{ startup.location }}</span>
                </div>
              </div>
            </div>
            
            <div class="startup-description">
              {{ startup.description.length > 150 ? startup.description.substring(0, 150) + '...' : startup.description }}
            </div>
            
            <div class="startup-metrics">
              <div class="metric">
                <div class="metric-label">Инвестиции</div>
                <div class="metric-value">{{ formatMoney(startup.investmentNeeded) }}</div>
              </div>
              <div class="metric">
                <div class="metric-label">ROI</div>
                <div class="metric-value">{{ startup.expectedRoi }}%</div>
              </div>
            </div>
            
            <div class="startup-actions">
              <BaseButton 
                variant="primary" 
                @click="viewDetails(startup.id)"
              >
                Подробнее
              </BaseButton>
              <BaseButton 
                variant="secondary" 
                @click="contactStartup(startup.id)"
              >
                Связаться
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="filteredStartups.length > itemsPerPage" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        Назад
      </button>
      <div class="page-numbers">
        <button 
          v-for="page in totalPages" 
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Вперед
      </button>
    </div>

    <!-- Модальное окно с деталями -->
    <Modal v-if="showDetails" @close="closeDetails">
      <div class="startup-details" v-if="selectedStartup">
        <div class="details-header">
          <img :src="selectedStartup.image || '/assets/images/placeholder-project.jpg'" :alt="selectedStartup.title" class="details-image">
          <div class="details-info">
            <div>
              <h2>{{ selectedStartup.title }}</h2>
              <div class="details-meta">
                <span class="stage">{{ getStageText(selectedStartup.stage) }}</span>
                <span v-if="selectedStartup.category" class="sector">{{ selectedStartup.category.name }}</span>
                <span v-if="selectedStartup.location" class="location">{{ selectedStartup.location }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="details-content">
          <div class="details-section">
            <h3>О проекте</h3>
            <p>{{ selectedStartup.description }}</p>
          </div>
          
          <div class="details-section">
            <h3>Метрики</h3>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Требуемые инвестиции</div>
                <div class="metric-value">{{ formatMoney(selectedStartup.investmentNeeded) }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Минимальная инвестиция</div>
                <div class="metric-value">{{ formatMoney(selectedStartup.minInvestment || 0) }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Ожидаемая ROI</div>
                <div class="metric-value">{{ selectedStartup.expectedRoi }}%</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Статус</div>
                <div class="metric-value">{{ getStatusText(selectedStartup.status) }}</div>
              </div>
            </div>
          </div>
          
          <div class="details-section" v-if="selectedStartup.additionalInfo">
            <h3>Дополнительная информация</h3>
            <div class="info-grid">
              <div class="info-item" v-if="selectedStartup.additionalInfo.hasTeam">
                <div class="info-label">Команда</div>
                <div class="info-value">Имеется</div>
              </div>
              <div class="info-item" v-if="selectedStartup.additionalInfo.teamSize">
                <div class="info-label">Размер команды</div>
                <div class="info-value">{{ selectedStartup.additionalInfo.teamSize }} чел.</div>
              </div>
              <div class="info-item" v-if="selectedStartup.additionalInfo.hasMVP">
                <div class="info-label">MVP</div>
                <div class="info-value">Имеется</div>
              </div>
              <div class="info-item" v-if="selectedStartup.additionalInfo.foundedAt">
                <div class="info-label">Основан</div>
                <div class="info-value">{{ selectedStartup.additionalInfo.foundedAt }}</div>
              </div>
            </div>
          </div>
          
          <div class="details-section" v-if="selectedStartup.businessPlanUrl || selectedStartup.presentationUrl">
            <h3>Документы</h3>
            <div class="documents-list">
              <a v-if="selectedStartup.businessPlanUrl" :href="selectedStartup.businessPlanUrl" target="_blank" class="document-link">
                <i class="fas fa-file-pdf"></i>
                Бизнес-план
              </a>
              <a v-if="selectedStartup.presentationUrl" :href="selectedStartup.presentationUrl" target="_blank" class="document-link">
                <i class="fas fa-file-powerpoint"></i>
                Презентация
              </a>
            </div>
          </div>
          
          <div class="details-section" v-if="selectedStartup.author">
            <h3>Автор проекта</h3>
            <div class="author-info">
              <div class="author-name">{{ selectedStartup.author.firstName }} {{ selectedStartup.author.lastName }}</div>
              <div class="author-email">{{ selectedStartup.author.email }}</div>
            </div>
          </div>
          
          <div class="details-actions">
            <BaseButton 
              variant="primary" 
              @click="contactStartup(selectedStartup.id)"
            >
              Связаться с автором
            </BaseButton>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'
import { projectsService } from '@/services/projects.service'
import { chatService } from '@/services/chat.service'

export default {
  name: 'StartupCatalog',
  components: {
    BaseButton,
    Modal
  },
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const filters = ref({
      stage: '',
      sector: '',
      minInvestment: '',
      maxInvestment: '',
      location: ''
    })
    const sectors = ref([])
    const startups = ref([])
    const currentPage = ref(1)
    const itemsPerPage = ref(9)
    const showDetails = ref(false)
    const selectedStartup = ref(null)
    const loading = ref(false)

    // Вычисляемые свойства
    const uniqueLocations = computed(() => {
      const locations = startups.value
        .map(startup => startup.location)
        .filter(location => location && location.trim() !== '')
      
      return [...new Set(locations)].sort()
    })
    
    const filteredStartups = computed(() => {
      let filtered = [...startups.value]
      
      // Поиск по запросу
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(startup => {
          return (
            startup.title.toLowerCase().includes(query) ||
            startup.description.toLowerCase().includes(query) ||
            (startup.location && startup.location.toLowerCase().includes(query)) ||
            (startup.category && startup.category.name.toLowerCase().includes(query))
          )
        })
      }
      
      // Фильтрация по стадии
      if (filters.value.stage) {
        filtered = filtered.filter(startup => startup.stage === filters.value.stage)
      }
      
      // Фильтрация по сектору
      if (filters.value.sector) {
        filtered = filtered.filter(startup => 
          startup.category && startup.category.id === parseInt(filters.value.sector)
        )
      }
      
      // Фильтрация по минимальным инвестициям
      if (filters.value.minInvestment) {
        const min = parseInt(filters.value.minInvestment)
        filtered = filtered.filter(startup => startup.investmentNeeded >= min)
      }
      
      // Фильтрация по максимальным инвестициям
      if (filters.value.maxInvestment) {
        const max = parseInt(filters.value.maxInvestment)
        filtered = filtered.filter(startup => startup.investmentNeeded <= max)
      }
      
      // Фильтрация по местоположению
      if (filters.value.location) {
        filtered = filtered.filter(startup => 
          startup.location === filters.value.location
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredStartups.value.length / itemsPerPage.value)
    })
    
    const paginatedStartups = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredStartups.value.slice(start, end)
    })

    // Методы
    const fetchStartups = async () => {
      loading.value = true
      try {
        const response = await projectsService.getAllProjects()
        console.log('Получены стартапы:', response)
        startups.value = response
      } catch (error) {
        console.error('Ошибка при загрузке стартапов:', error)
      } finally {
        loading.value = false
      }
    }
    
    const fetchCategories = async () => {
      try {
        const response = await projectsService.getAllCategories()
        console.log('Получены категории:', response)
        sectors.value = response
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
      }
    }
    
    const applyFilters = () => {
      currentPage.value = 1
    }
    
    const resetFilters = () => {
      filters.value = {
        stage: '',
        sector: '',
        minInvestment: '',
        maxInvestment: '',
        location: ''
      }
      searchQuery.value = ''
      currentPage.value = 1
    }
    
    const viewDetails = (id) => {
      router.push(`/startups/${id}`)
    }
    
    const contactStartup = async (id) => {
      try {
        const startup = startups.value.find(s => s.id === id)
        if (startup && startup.author) {
          const chatResponse = await chatService.createOrGetDirectChat(startup.author.id)
          router.push({
            name: 'Messenger',
            params: { chatId: chatResponse.id }
          })
        }
      } catch (error) {
        console.error('Ошибка при создании чата:', error)
      }
    }
    
    const changePage = (page) => {
      currentPage.value = page
    }
    
    const closeDetails = () => {
      showDetails.value = false
    }
    
    const formatMoney = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount)
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        pending: 'На рассмотрении',
        active: 'Активный',
        completed: 'Завершен',
        cancelled: 'Отменен'
      }
      return statusMap[status] || status
    }
    
    const getStageText = (stage) => {
      const stageMap = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      }
      return stageMap[stage] || stage
    }

    // Наблюдение за изменениями фильтров
    watch(searchQuery, () => {
      currentPage.value = 1
    })
    
    watch(filters, () => {
      currentPage.value = 1
    }, { deep: true })

    // При создании компонента
    onMounted(() => {
      fetchStartups()
      fetchCategories()
    })

    return {
      searchQuery,
      filters,
      sectors,
      startups,
      uniqueLocations,
      filteredStartups,
      currentPage,
      itemsPerPage,
      showDetails,
      selectedStartup,
      loading,
      totalPages,
      paginatedStartups,
      fetchStartups,
      fetchCategories,
      viewDetails,
      contactStartup,
      changePage,
      closeDetails,
      formatMoney,
      getStatusText,
      getStageText,
      applyFilters,
      resetFilters
    }
  }
}
</script>

<style scoped>
.startup-catalog {
  padding: 20px;
}

.startup-catalog h1 {
  margin-bottom: 24px;
  font-size: 32px;
}

/* Стили для горизонтальных фильтров */
.filters-horizontal {
  background: transparent;
  border-radius: 0;
  padding: 20px 0;
  box-shadow: none;
  margin-bottom: 24px;
}

.search-box {
  margin-bottom: 16px;
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fff;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  outline: none;
}

.filters-row {
  display: flex;
  gap: 16px;
}

.filter-item {
  flex: 1;
}

.filter-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: white;
  font-size: 15px;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236c757d' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.filter-select:focus {
  border-color: #007bff;
  outline: none;
}

.catalog-container {
  margin-bottom: 30px;
}

.startups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.startup-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.startup-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.startup-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.startup-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.startup-stage {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.startup-content {
  padding: 20px;
}

.startup-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.startup-info {
  flex: 1;
}

.startup-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.startup-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6c757d;
}

.startup-description {
  margin-bottom: 16px;
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}

.startup-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.metric {
  flex: 1;
}

.metric-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 500;
}

.startup-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .startups-grid {
    grid-template-columns: 1fr;
  }
}
</style> 