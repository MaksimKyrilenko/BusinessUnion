<template>
  <div class="startup-catalog">
    <h1>Каталог стартапов</h1>
    
    <div class="catalog-container">
      <!-- Поиск и фильтры -->
      <div class="filters-panel">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск стартапов..."
          >
        </div>
        
        <div class="filters">
          <div class="filter-group">
            <label>Стадия</label>
            <select v-model="filters.stage">
              <option value="">Все стадии</option>
              <option value="idea">Идея</option>
              <option value="mvp">MVP</option>
              <option value="growth">Рост</option>
              <option value="scaling">Масштабирование</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Сектор</label>
            <select v-model="filters.sector">
              <option value="">Все секторы</option>
              <option v-for="sector in sectors" 
                      :key="sector.id" 
                      :value="sector.id"
              >
                {{ sector.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Инвестиции</label>
            <div class="range-inputs">
              <input 
                type="number" 
                v-model="filters.minInvestment" 
                placeholder="От"
              >
              <span>-</span>
              <input 
                type="number" 
                v-model="filters.maxInvestment" 
                placeholder="До"
              >
            </div>
          </div>
        </div>
      </div>

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
      maxInvestment: ''
    })
    const sectors = ref([])
    const startups = ref([])
    const currentPage = ref(1)
    const itemsPerPage = ref(9)
    const showDetails = ref(false)
    const selectedStartup = ref(null)
    const loading = ref(false)

    // Вычисляемые свойства
    const filteredStartups = computed(() => {
      let filtered = [...startups.value]
      
      // Поиск по запросу
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(startup => {
          return (
            startup.title.toLowerCase().includes(query) ||
            startup.description.toLowerCase().includes(query) ||
            (startup.location && startup.location.toLowerCase().includes(query))
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
      getStageText
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

.catalog-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.filters-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  align-self: start;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.filter-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
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
  grid-column: 1 / -1;
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
  grid-column: 1 / -1;
  color: #6c757d;
}

/* Детали проекта */
.startup-details {
  max-width: 800px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.details-header {
  position: relative;
}

.details-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.details-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  padding: 20px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.details-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.details-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.details-meta span {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.details-content {
  padding: 24px;
}

.details-section {
  margin-bottom: 24px;
}

.details-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #343a40;
}

.details-section p {
  line-height: 1.6;
  color: #495057;
}

.metrics-grid, .info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.metric-item, .info-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-label, .info-label {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 4px;
}

.metric-value, .info-value {
  font-size: 16px;
  font-weight: 500;
}

.documents-list {
  display: flex;
  gap: 16px;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f3f5;
  border-radius: 4px;
  text-decoration: none;
  color: #495057;
  font-size: 14px;
  transition: background 0.2s;
}

.document-link:hover {
  background: #e9ecef;
}

.author-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.author-email {
  font-size: 14px;
  color: #6c757d;
}

.details-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .catalog-container {
    grid-template-columns: 1fr;
  }
  
  .startups-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid, .info-grid {
    grid-template-columns: 1fr;
  }
  
  .documents-list {
    flex-direction: column;
  }
}
</style> 