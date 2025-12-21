<template>
  <div class="admin-projects">
    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="search" 
          placeholder="Поиск по названию..."
          @input="debouncedSearch"
        >
      </div>
      
      <select v-model="filterStatus" @change="loadProjects">
        <option value="">Все статусы</option>
        <option value="pending">На модерации</option>
        <option value="active">Активные</option>
        <option value="completed">Завершённые</option>
        <option value="cancelled">Отменённые</option>
      </select>
    </div>
    
    <!-- Projects Table -->
    <div class="table-card">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Загрузка...
      </div>
      
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Проект</th>
            <th>Автор</th>
            <th>Инвестиции</th>
            <th>Статус</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>{{ project.id }}</td>
            <td>
              <div class="project-cell">
                <span class="project-title">{{ project.title }}</span>
                <span class="project-stage">{{ getStageName(project.stage) }}</span>
              </div>
            </td>
            <td>
              <span v-if="project.author">
                {{ project.author.firstName }} {{ project.author.lastName }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <div class="investment-info">
                <span class="collected">{{ formatMoney(project.investmentCollected) }}</span>
                <span class="needed">из {{ formatMoney(project.investmentNeeded) }}</span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="project.status">
                {{ getStatusName(project.status) }}
              </span>
            </td>
            <td>{{ formatDate(project.createdAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn-icon" @click="viewProject(project)" title="Просмотр">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" @click="editStatus(project)" title="Изменить статус">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" @click="confirmDelete(project)" title="Удалить">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="pagination.page === 1"
          @click="changePage(pagination.page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">
          Страница {{ pagination.page }} из {{ pagination.totalPages }}
        </span>
        
        <button 
          class="page-btn" 
          :disabled="pagination.page === pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <!-- Project Detail Modal -->
    <div class="modal-overlay" v-if="selectedProject" @click.self="selectedProject = null">
      <div class="modal large">
        <div class="modal-header">
          <h3>{{ selectedProject.title }}</h3>
          <button class="close-btn" @click="selectedProject = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Основная информация</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Статус</span>
                <span class="status-badge" :class="selectedProject.status">
                  {{ getStatusName(selectedProject.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Стадия</span>
                <span class="value">{{ getStageName(selectedProject.stage) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Локация</span>
                <span class="value">{{ selectedProject.location || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">ROI</span>
                <span class="value">{{ selectedProject.expectedRoi }}%</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Описание</h4>
            <p class="description">{{ selectedProject.description }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Инвестиции</h4>
            <div class="investment-bar">
              <div class="bar-fill" :style="{ width: getInvestmentPercent(selectedProject) + '%' }"></div>
            </div>
            <div class="investment-stats">
              <span>Собрано: {{ formatMoney(selectedProject.investmentCollected) }}</span>
              <span>Цель: {{ formatMoney(selectedProject.investmentNeeded) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Status Edit Modal -->
    <div class="modal-overlay" v-if="editingProject" @click.self="editingProject = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Изменить статус проекта</h3>
          <button class="close-btn" @click="editingProject = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Проект: <strong>{{ editingProject.title }}</strong></p>
          <div class="form-group">
            <label>Новый статус:</label>
            <select v-model="newStatus">
              <option value="pending">На модерации</option>
              <option value="active">Активный</option>
              <option value="completed">Завершён</option>
              <option value="cancelled">Отменён</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="editingProject = null">Отмена</button>
          <button class="btn primary" @click="saveStatus">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AdminProjects',
  data() {
    return {
      projects: [],
      loading: true,
      search: '',
      filterStatus: '',
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      selectedProject: null,
      editingProject: null,
      newStatus: '',
      searchTimeout: null
    };
  },
  async mounted() {
    await this.loadProjects();
  },
  methods: {
    async loadProjects() {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          page: this.pagination.page,
          limit: this.pagination.limit
        });
        
        if (this.search) params.append('search', this.search);
        if (this.filterStatus) params.append('status', this.filterStatus);
        
        const response = await api.get(`/admin/projects?${params}`);
        this.projects = response.data.projects;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        this.loading = false;
      }
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.loadProjects();
      }, 300);
    },
    changePage(page) {
      this.pagination.page = page;
      this.loadProjects();
    },
    async viewProject(project) {
      try {
        const response = await api.get(`/admin/projects/${project.id}`);
        this.selectedProject = response.data;
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    },
    editStatus(project) {
      this.editingProject = project;
      this.newStatus = project.status;
    },
    async saveStatus() {
      try {
        await api.patch(`/admin/projects/${this.editingProject.id}/status`, {
          status: this.newStatus
        });
        this.editingProject = null;
        await this.loadProjects();
      } catch (error) {
        console.error('Ошибка изменения статуса:', error);
        alert('Не удалось изменить статус');
      }
    },
    async confirmDelete(project) {
      if (confirm(`Удалить проект "${project.title}"?`)) {
        try {
          await api.delete(`/admin/projects/${project.id}`);
          await this.loadProjects();
        } catch (error) {
          console.error('Ошибка удаления:', error);
          alert('Не удалось удалить проект');
        }
      }
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount || 0);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    },
    getStatusName(status) {
      const names = {
        pending: 'На модерации',
        active: 'Активный',
        completed: 'Завершён',
        cancelled: 'Отменён'
      };
      return names[status] || status;
    },
    getStageName(stage) {
      const names = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      };
      return names[stage] || stage;
    },
    getInvestmentPercent(project) {
      if (!project.investmentNeeded) return 0;
      return Math.min(100, (project.investmentCollected / project.investmentNeeded) * 100);
    }
  }
}
</script>

<style scoped>
.admin-projects {
  max-width: 1400px;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
}

.filters-bar select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  background: white;
  min-width: 180px;
}

.table-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #64748b;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.data-table th {
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-title {
  font-weight: 500;
  color: #1a1a2e;
}

.project-stage {
  font-size: 0.75rem;
  color: #64748b;
}

.text-muted {
  color: #94a3b8;
}

.investment-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.investment-info .collected {
  font-weight: 600;
  color: #10B981;
}

.investment-info .needed {
  font-size: 0.75rem;
  color: #64748b;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending { background: #FEF3C7; color: #D97706; }
.status-badge.active { background: #D1FAE5; color: #059669; }
.status-badge.completed { background: #DBEAFE; color: #2563EB; }
.status-badge.cancelled { background: #FEE2E2; color: #DC2626; }

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

.btn-icon.danger:hover {
  background: #FEE2E2;
  color: #DC2626;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

/* Modal styles */
.modal-overlay {
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

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal.large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.detail-item .value {
  font-weight: 500;
}

.description {
  color: #475569;
  line-height: 1.6;
}

.investment-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #059669);
  border-radius: 4px;
}

.investment-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
}

.form-group {
  margin-top: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn.primary {
  background: #4F8FFF;
  color: white;
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}
</style>
