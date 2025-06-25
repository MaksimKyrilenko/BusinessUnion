<template>
  <div class="startup-analysis">
    <h1>Анализ стартапов</h1>
    
    <div class="analysis-grid">
      <!-- Фильтры -->
      <div class="filters-card">
        <h2>Фильтры</h2>
        <div class="filters-content">
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
            <label>Технологии</label>
            <div class="tech-tags">
              <div v-for="tech in technologies" 
                   :key="tech.id" 
                   class="tech-tag"
                   :class="{ active: filters.technologies.includes(tech.id) }"
                   @click="toggleTechnology(tech.id)"
              >
                {{ tech.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Список стартапов -->
      <div class="startups-list">
        <div v-for="startup in filteredStartups" 
             :key="startup.id" 
             class="startup-card"
        >
          <div class="startup-header">
            <img :src="startup.logo" :alt="startup.name" class="startup-logo">
            <div class="startup-info">
              <h3>{{ startup.name }}</h3>
              <div class="startup-meta">
                <span class="stage">{{ startup.stage }}</span>
                <span class="sector">{{ startup.sector }}</span>
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
            <div class="metric">
              <div class="metric-label">Риск</div>
              <div class="metric-value">{{ startup.risk }}%</div>
            </div>
          </div>
          
          <div class="startup-technologies">
            <div v-for="tech in startup.technologies" 
                 :key="tech.id" 
                 class="tech-badge"
            >
              {{ tech.name }}
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

    <!-- Модальное окно с деталями -->
    <Modal v-if="showDetails" @close="closeDetails">
      <div class="startup-details">
        <div class="details-header">
          <img :src="selectedStartup.logo" :alt="selectedStartup.name" class="details-logo">
          <div>
            <h2>{{ selectedStartup.name }}</h2>
            <div class="details-meta">
              <span class="stage">{{ selectedStartup.stage }}</span>
              <span class="sector">{{ selectedStartup.sector }}</span>
            </div>
          </div>
        </div>
        
        <div class="details-content">
          <div class="details-section">
            <h3>Описание</h3>
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
  name: 'StartupAnalysis',
  components: {
    BaseButton,
    Modal
  },
  data() {
    return {
      filters: {
        stage: '',
        minInvestment: null,
        maxInvestment: null,
        sector: '',
        technologies: []
      },
      sectors: [],
      technologies: [],
      startups: [],
      selectedStartup: null,
      showDetails: false
    }
  },
  computed: {
    filteredStartups() {
      return this.startups.filter(startup => {
        // Фильтр по стадии
        if (this.filters.stage && startup.stage !== this.filters.stage) {
          return false
        }
        
        // Фильтр по инвестициям
        if (this.filters.minInvestment && startup.investment < this.filters.minInvestment) {
          return false
        }
        if (this.filters.maxInvestment && startup.investment > this.filters.maxInvestment) {
          return false
        }
        
        // Фильтр по сектору
        if (this.filters.sector && startup.sector !== this.filters.sector) {
          return false
        }
        
        // Фильтр по технологиям
        if (this.filters.technologies.length > 0) {
          const startupTechs = startup.technologies.map(tech => tech.id)
          return this.filters.technologies.every(tech => startupTechs.includes(tech))
        }
        
        return true
      })
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    toggleTechnology(techId) {
      const index = this.filters.technologies.indexOf(techId)
      if (index === -1) {
        this.filters.technologies.push(techId)
      } else {
        this.filters.technologies.splice(index, 1)
      }
    },
    async loadData() {
      try {
        const [sectorsResponse, technologiesResponse, startupsResponse] = await Promise.all([
          api.get('/startups/sectors'),
          api.get('/startups/technologies'),
          api.get('/startups/list')
        ])
        
        this.sectors = sectorsResponse.data
        this.technologies = technologiesResponse.data
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
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.startup-analysis {
  padding: 20px;
}

.analysis-grid {
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

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tech-tag.active {
  background: #007bff;
  color: white;
}

.startups-list {
  display: grid;
  gap: 20px;
}

.startup-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
}

.startup-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.startup-actions {
  display: flex;
  gap: 10px;
}

.startup-details {
  padding: 20px;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.details-logo {
  width: 64px;
  height: 64px;
  border-radius: 8px;
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
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .startup-metrics {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style> 