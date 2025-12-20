<template>
  <div class="startup-catalog">
    <div class="catalog-header">
      <h1>Каталог стартапов</h1>
      <div class="filters">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Поиск по названию или описанию"
          />
        </div>
        <div class="filter-controls">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">Все категории</option>
            <option value="tech">Технологии</option>
            <option value="finance">Финансы</option>
            <option value="health">Здравоохранение</option>
            <option value="education">Образование</option>
            <option value="retail">Ритейл</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="roi">По ROI</option>
            <option value="investment">По сумме инвестиций</option>
            <option value="date">По дате</option>
          </select>
        </div>
      </div>
    </div>

    <div class="startups-grid">
      <div v-for="startup in filteredStartups" :key="startup.id" class="startup-card">
        <div class="startup-header">
          <div class="startup-category" :class="startup.category">
            {{ getCategoryName(startup.category) }}
          </div>
          <div class="startup-date">
            {{ formatDate(startup.createdAt) }}
          </div>
        </div>
        
        <h2 class="startup-title">{{ startup.title }}</h2>
        <p class="startup-description">{{ startup.description }}</p>
        
        <div class="startup-metrics">
          <div class="metric">
            <div class="metric-label">Требуемые инвестиции</div>
            <div class="metric-value">{{ formatMoney(startup.investmentNeeded) }}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Мин. инвестиция</div>
            <div class="metric-value">{{ formatMoney(startup.minInvestment) }}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Ожидаемый ROI</div>
            <div class="metric-value highlight">{{ startup.expectedRoi }}%</div>
          </div>
        </div>

        <div class="startup-progress">
          <div class="progress-info">
            <span>Собрано: {{ formatMoney(startup.investmentCollected) }}</span>
            <span>{{ Math.round((startup.investmentCollected / startup.investmentNeeded) * 100) }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress" 
              :style="{ width: `${(startup.investmentCollected / startup.investmentNeeded) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="startup-footer">
          <button class="btn-details" @click="viewDetails(startup.id)">
            <i class="fas fa-info-circle"></i>
            Подробнее
          </button>
          <button class="btn-invest" @click="invest(startup.id)">
            <i class="fas fa-hand-holding-usd"></i>
            Инвестировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'StartupCatalog',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const sortBy = ref('roi')

    // Статические данные для демонстрации
    const startups = ref([
      {
        id: 1,
        title: 'Умная система автоматизации производства',
        description: 'Инновационная система, использующая ИИ для оптимизации производственных процессов и снижения затрат на 40%',
        category: 'tech',
        investmentNeeded: 5000000,
        minInvestment: 500000,
        investmentCollected: 2000000,
        expectedRoi: 25,
        createdAt: '2024-03-20'
      },
      {
        id: 2,
        title: 'Платформа телемедицины нового поколения',
        description: 'Революционная платформа для удаленных медицинских консультаций с использованием VR технологий',
        category: 'health',
        investmentNeeded: 8000000,
        minInvestment: 1000000,
        investmentCollected: 3500000,
        expectedRoi: 35,
        createdAt: '2024-03-18'
      },
      {
        id: 3,
        title: 'Образовательная экосистема на базе AR',
        description: 'Интерактивная система обучения с использованием дополненной реальности для школ и университетов',
        category: 'education',
        investmentNeeded: 3000000,
        minInvestment: 300000,
        investmentCollected: 900000,
        expectedRoi: 20,
        createdAt: '2024-03-15'
      },
      {
        id: 4,
        title: 'Финтех-платформа для малого бизнеса',
        description: 'Комплексное решение для управления финансами, бухгалтерией и инвестициями малого бизнеса',
        category: 'finance',
        investmentNeeded: 10000000,
        minInvestment: 1000000,
        investmentCollected: 7000000,
        expectedRoi: 40,
        createdAt: '2024-03-10'
      },
      {
        id: 5,
        title: 'Умная система управления складом',
        description: 'Автоматизированная система управления складскими запасами с использованием роботов и ИИ',
        category: 'retail',
        investmentNeeded: 6000000,
        minInvestment: 500000,
        investmentCollected: 1500000,
        expectedRoi: 30,
        createdAt: '2024-03-05'
      }
    ])

    const filteredStartups = computed(() => {
      let filtered = startups.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(startup => 
          startup.title.toLowerCase().includes(query) ||
          startup.description.toLowerCase().includes(query)
        )
      }

      if (selectedCategory.value) {
        filtered = filtered.filter(startup => 
          startup.category === selectedCategory.value
        )
      }

      switch (sortBy.value) {
        case 'roi':
          filtered = filtered.sort((a, b) => b.expectedRoi - a.expectedRoi)
          break
        case 'investment':
          filtered = filtered.sort((a, b) => b.investmentNeeded - a.investmentNeeded)
          break
        case 'date':
          filtered = filtered.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )
          break
      }

      return filtered
    })

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (date) => {
      return format(new Date(date), 'd MMMM yyyy', { locale: ru })
    }

    const getCategoryName = (category) => {
      const categories = {
        tech: 'Технологии',
        finance: 'Финансы',
        health: 'Здравоохранение',
        education: 'Образование',
        retail: 'Ритейл'
      }
      return categories[category] || category
    }

    const viewDetails = (id) => {
      router.push(`/startup/${id}`)
    }

    const invest = (id) => {
      router.push(`/startup/${id}/invest`)
    }

    return {
      searchQuery,
      selectedCategory,
      sortBy,
      filteredStartups,
      formatMoney,
      formatDate,
      getCategoryName,
      viewDetails,
      invest
    }
  }
}
</script>

<style scoped>
.startup-catalog {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.catalog-header {
  margin-bottom: 2rem;
}

.catalog-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 14px;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-bar input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-bar input::placeholder {
  color: #a0aec0;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 150px;
  background: white;
  cursor: pointer;
}

.startups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.startup-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.startup-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.startup-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.startup-category {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.startup-category.tech { background: #E3F2FD; color: #1976D2; }
.startup-category.finance { background: #E8F5E9; color: #2E7D32; }
.startup-category.health { background: #F3E5F5; color: #7B1FA2; }
.startup-category.education { background: #FFF3E0; color: #E65100; }
.startup-category.retail { background: #E1F5FE; color: #0288D1; }

.startup-date {
  font-size: 0.875rem;
  color: #666;
}

.startup-title {
  padding: 0 1.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.startup-description {
  padding: 0 1.5rem;
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.startup-metrics {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background: #f8f9fa;
  margin-top: auto;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-weight: 600;
  color: #2c3e50;
}

.metric-value.highlight {
  color: #7C4DFF;
}

.startup-progress {
  padding: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #7C4DFF;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.startup-footer {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn-details,
.btn-invest {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-details {
  background: #f8f9fa;
  color: #2c3e50;
}

.btn-details:hover {
  background: #e9ecef;
}

.btn-invest {
  background: #7C4DFF;
  color: white;
}

.btn-invest:hover {
  background: #6B3FFF;
}

@media (max-width: 768px) {
  .startup-catalog {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .filter-controls {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .startups-grid {
    grid-template-columns: 1fr;
  }
}
</style> 