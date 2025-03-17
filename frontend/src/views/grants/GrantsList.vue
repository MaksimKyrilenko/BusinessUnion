<template>
  <div class="grants-list">
    <div class="header">
      <h1>Гранты</h1>
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Поиск грантов..."
          >
        </div>
        
        <div class="filter-group">
          <select v-model="filters.type">
            <option value="">Все типы</option>
            <option value="startup">Стартапы</option>
            <option value="research">Исследования</option>
            <option value="social">Социальные проекты</option>
          </select>
          
          <select v-model="filters.status">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="upcoming">Скоро начнутся</option>
            <option value="ended">Завершенные</option>
          </select>
          
          <select v-model="filters.amount">
            <option value="">Любая сумма</option>
            <option value="small">До 100 000 ₽</option>
            <option value="medium">100 000 - 500 000 ₽</option>
            <option value="large">Более 500 000 ₽</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grants-grid">
      <div v-for="grant in filteredGrants" 
           :key="grant.id" 
           class="grant-card"
      >
        <div class="grant-header">
          <div class="grant-type" :class="grant.type">
            {{ getGrantTypeLabel(grant.type) }}
          </div>
          <div class="grant-status" :class="grant.status">
            {{ getGrantStatusLabel(grant.status) }}
          </div>
        </div>
        
        <h3>{{ grant.title }}</h3>
        <p class="description">{{ grant.description }}</p>
        
        <div class="grant-details">
          <div class="detail-item">
            <span class="label">Сумма:</span>
            <span class="value">{{ formatMoney(grant.amount) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="label">Срок подачи:</span>
            <span class="value">{{ formatDate(grant.deadline) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="label">Требования:</span>
            <span class="value">{{ grant.requirements }}</span>
          </div>
        </div>
        
        <div class="grant-tags">
          <div v-for="tag in grant.tags" 
               :key="tag" 
               class="tag"
          >
            {{ tag }}
          </div>
        </div>
        
        <div class="grant-actions">
          <BaseButton 
            variant="primary"
            @click="viewGrantDetails(grant)"
          >
            Подробнее
          </BaseButton>
          <BaseButton 
            variant="secondary"
            @click="applyForGrant(grant)"
            :disabled="!canApply(grant)"
          >
            Подать заявку
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Модальное окно с деталями гранта -->
    <div v-if="selectedGrant" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedGrant.title }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="grant-info">
            <div class="info-section">
              <h3>Описание</h3>
              <p>{{ selectedGrant.description }}</p>
            </div>
            
            <div class="info-section">
              <h3>Требования</h3>
              <p>{{ selectedGrant.requirements }}</p>
            </div>
            
            <div class="info-section">
              <h3>Условия</h3>
              <ul>
                <li v-for="(condition, index) in selectedGrant.conditions" 
                    :key="index"
                >
                  {{ condition }}
                </li>
              </ul>
            </div>
            
            <div class="info-section">
              <h3>Документы</h3>
              <ul>
                <li v-for="(doc, index) in selectedGrant.documents" 
                    :key="index"
                >
                  {{ doc }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="grant-actions">
            <BaseButton 
              variant="primary"
              @click="applyForGrant(selectedGrant)"
              :disabled="!canApply(selectedGrant)"
            >
              Подать заявку
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/axios'

export default {
  name: 'GrantsList',
  components: {
    BaseButton
  },
  data() {
    return {
      grants: [],
      searchQuery: '',
      filters: {
        type: '',
        status: '',
        amount: ''
      },
      selectedGrant: null
    }
  },
  computed: {
    filteredGrants() {
      return this.grants.filter(grant => {
        // Поиск по названию и описанию
        const matchesSearch = !this.searchQuery || 
          grant.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          grant.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        // Фильтры
        const matchesType = !this.filters.type || grant.type === this.filters.type
        const matchesStatus = !this.filters.status || grant.status === this.filters.status
        const matchesAmount = !this.filters.amount || this.matchesAmountRange(grant.amount, this.filters.amount)
        
        return matchesSearch && matchesType && matchesStatus && matchesAmount
      })
    }
  },
  methods: {
    async loadGrants() {
      try {
        const response = await api.get('/grants')
        this.grants = response.data
      } catch (error) {
        console.error('Ошибка при загрузке грантов:', error)
      }
    },
    getGrantTypeLabel(type) {
      const labels = {
        startup: 'Стартапы',
        research: 'Исследования',
        social: 'Социальные проекты'
      }
      return labels[type] || type
    },
    getGrantStatusLabel(status) {
      const labels = {
        active: 'Активный',
        upcoming: 'Скоро начнется',
        ended: 'Завершен'
      }
      return labels[status] || status
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU')
    },
    matchesAmountRange(amount, range) {
      const ranges = {
        small: amount <= 100000,
        medium: amount > 100000 && amount <= 500000,
        large: amount > 500000
      }
      return ranges[range]
    },
    viewGrantDetails(grant) {
      this.selectedGrant = grant
    },
    closeModal() {
      this.selectedGrant = null
    },
    canApply(grant) {
      return grant.status === 'active' && new Date(grant.deadline) > new Date()
    },
    async applyForGrant(grant) {
      try {
        await api.post(`/grants/${grant.id}/apply`)
        this.$router.push(`/grants/${grant.id}/application`)
      } catch (error) {
        console.error('Ошибка при подаче заявки:', error)
      }
    }
  },
  mounted() {
    this.loadGrants()
  }
}
</script>

<style scoped>
.grants-list {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.filters {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.grants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.grant-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.grant-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.grant-type,
.grant-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.grant-type {
  background: #e3f2fd;
  color: #1976d2;
}

.grant-type.startup {
  background: #e8f5e9;
  color: #2e7d32;
}

.grant-type.research {
  background: #fff3e0;
  color: #f57c00;
}

.grant-type.social {
  background: #fce4ec;
  color: #c2185b;
}

.grant-status {
  background: #f5f5f5;
  color: #666;
}

.grant-status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.grant-status.upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.grant-status.ended {
  background: #ffebee;
  color: #c62828;
}

.grant-card h3 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.grant-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  font-weight: 500;
}

.grant-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
}

.grant-actions {
  display: flex;
  gap: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h3 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.info-section p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.info-section ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.info-section li {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-group select {
    width: 100%;
  }
  
  .grant-actions {
    flex-direction: column;
  }
  
  .grant-actions button {
    width: 100%;
  }
}
</style> 