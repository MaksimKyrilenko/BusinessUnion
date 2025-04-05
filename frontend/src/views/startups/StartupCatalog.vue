<template>
  <div class="startup-catalog">
    <h1>Каталог стартапов</h1>
    
    <div class="catalog-grid">
      <!-- Поиск и фильтры -->
      <div class="filters-card">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск стартапов..."
            @input="filterStartups"
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

      <!-- Список стартапов -->
      <div class="startups-grid">
        <div v-for="startup in filteredStartups" 
             :key="startup.id" 
             class="startup-card"
        >
          <div class="startup-image">
            <img :src="startup.image" :alt="startup.name">
            <div class="startup-stage">{{ startup.stage }}</div>
          </div>
          
          <div class="startup-content">
            <div class="startup-header">
              <img :src="startup.logo" :alt="startup.name" class="startup-logo">
              <div class="startup-info">
                <h3>{{ startup.name }}</h3>
                <div class="startup-meta">
                  <span class="sector">{{ startup.sector }}</span>
                  <span class="location">{{ startup.location }}</span>
                </div>
              </div>
            </div>
            
            <div class="startup-description">
              {{ startup.description }}
            </div>
            
            <div class="startup-metrics">
              <div class="metric">
                <div class="metric-label">Инвестиции</div>
                <div class="metric-value">{{ formatMoney(startup.investment) }}</div>
              </div>
              <div class="metric">
                <div class="metric-label">ROI</div>
                <div class="metric-value">{{ startup.roi }}%</div>
              </div>
            </div>
            
            <div class="startup-technologies">
              <div v-for="tech in startup.technologies.slice(0, 3)" 
                   :key="tech.id" 
                   class="tech-badge"
              >
                {{ tech.name }}
              </div>
              <div v-if="startup.technologies.length > 3" class="tech-more">
                +{{ startup.technologies.length - 3 }}
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
    <div class="pagination">
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
      <div class="startup-details">
        <div class="details-header">
          <img :src="selectedStartup.image" :alt="selectedStartup.name" class="details-image">
          <div class="details-info">
            <div class="details-logo">
              <img :src="selectedStartup.logo" :alt="selectedStartup.name">
            </div>
            <div>
              <h2>{{ selectedStartup.name }}</h2>
              <div class="details-meta">
                <span class="stage">{{ selectedStartup.stage }}</span>
                <span class="sector">{{ selectedStartup.sector }}</span>
                <span class="location">{{ selectedStartup.location }}</span>
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
                <div class="metric-label">Инвестиции</div>
                <div class="metric-value">{{ formatMoney(selectedStartup.investment) }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">ROI</div>
                <div class="metric-value">{{ selectedStartup.roi }}%</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Риск</div>
                <div class="metric-value">{{ selectedStartup.risk }}%</div>
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h3>Технологии</h3>
            <div class="tech-list">
              <div v-for="tech in selectedStartup.technologies" 
                   :key="tech.id" 
                   class="tech-item"
              >
                {{ tech.name }}
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h3>Команда</h3>
            <div class="team-list">
              <div v-for="member in selectedStartup.team" 
                   :key="member.id" 
                   class="team-member"
              >
                <img :src="member.avatar" :alt="member.name" class="member-avatar">
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-role">{{ member.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/axios'

export default {
  name: 'StartupCatalog',
  components: {
    BaseButton,
    Modal
  },
  data() {
    return {
      searchQuery: '',
      filters: {
        stage: '',
        sector: '',
        minInvestment: null,
        maxInvestment: null
      },
      sectors: [],
      startups: [],
      selectedStartup: null,
      showDetails: false,
      currentPage: 1,
      itemsPerPage: 12
    }
  },
  computed: {
    filteredStartups() {
      let filtered = [...this.startups]
      
      // Фильтр по поиску
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(startup => 
          startup.name.toLowerCase().includes(query) ||
          startup.description.toLowerCase().includes(query)
        )
      }
      
      // Фильтр по стадии
      if (this.filters.stage) {
        filtered = filtered.filter(startup => startup.stage === this.filters.stage)
      }
      
      // Фильтр по сектору
      if (this.filters.sector) {
        filtered = filtered.filter(startup => startup.sector === this.filters.sector)
      }
      
      // Фильтр по инвестициям
      if (this.filters.minInvestment) {
        filtered = filtered.filter(startup => startup.investment >= this.filters.minInvestment)
      }
      if (this.filters.maxInvestment) {
        filtered = filtered.filter(startup => startup.investment <= this.filters.maxInvestment)
      }
      
      return filtered
    },
    totalPages() {
      return Math.ceil(this.filteredStartups.length / this.itemsPerPage)
    },
    paginatedStartups() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredStartups.slice(start, end)
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    async loadData() {
      try {
        const [sectorsResponse, startupsResponse] = await Promise.all([
          api.get('/startups/sectors'),
          api.get('/startups/list')
        ])
        
        this.sectors = sectorsResponse.data
        this.startups = startupsResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },
    async viewDetails(startupId) {
      try {
        const response = await api.get(`/startups/${startupId}`)
        this.selectedStartup = response.data
        this.showDetails = true
      } catch (error) {
        console.error('Ошибка при загрузке деталей:', error)
      }
    },
    closeDetails() {
      this.showDetails = false
      this.selectedStartup = null
    },
    async contactStartup(startupId) {
      try {
        await api.post(`/startups/${startupId}/contact`)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error)
      }
    },
    changePage(page) {
      this.currentPage = page
      window.scrollTo(0, 0)
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.startup-catalog {
  padding: 20px;
}

.catalog-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  margin-top: 20px;
}

.filters-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-inputs input {
  width: 100px;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.startup-image {
  position: relative;
  height: 160px;
}

.startup-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.startup-stage {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  background: rgba(0,0,0,0.7);
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.startup-content {
  padding: 20px;
}

.startup-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.startup-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.startup-meta {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.startup-description {
  margin-bottom: 15px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.startup-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.metric {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-weight: 500;
}

.startup-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tech-badge {
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 12px;
}

.tech-more {
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.startup-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  background: #f8f9fa;
}

.page-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.startup-details {
  padding: 20px;
}

.details-header {
  margin-bottom: 20px;
}

.details-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.details-info {
  display: flex;
  gap: 20px;
}

.details-logo {
  width: 64px;
  height: 64px;
  border-radius: 8px;
}

.details-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-meta {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.details-content {
  display: grid;
  gap: 20px;
}

.details-section {
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-item {
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 16px;
  font-size: 14px;
}

.team-list {
  display: grid;
  gap: 15px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 15px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
}

.member-role {
  font-size: 0.9em;
  color: #666;
}

@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
  
  .startups-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .details-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .details-meta {
    justify-content: center;
  }
}
</style> 