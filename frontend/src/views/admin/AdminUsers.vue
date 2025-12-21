<template>
  <div class="admin-users">
    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="search" 
          placeholder="Поиск по имени или email..."
          @input="debouncedSearch"
        >
      </div>
      
      <select v-model="filterType" @change="loadUsers">
        <option value="">Все типы</option>
        <option value="startup_founder">Стартаперы</option>
        <option value="investor">Инвесторы</option>
        <option value="businessman">Бизнесмены</option>
        <option value="crypto_trader">Крипто-трейдеры</option>
        <option value="admin">Администраторы</option>
      </select>
    </div>
    
    <!-- Users Table -->
    <div class="table-card">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Загрузка...
      </div>
      
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Тип</th>
            <th>Дата регистрации</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <div class="user-cell">
                <div class="user-avatar" :style="getAvatarStyle(user)">
                  {{ getInitials(user) }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                </div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.userType">
                {{ getUserTypeName(user.userType) }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn-icon" @click="viewUser(user)" title="Просмотр">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" @click="editRole(user)" title="Изменить роль">
                  <i class="fas fa-user-tag"></i>
                </button>
                <button 
                  class="btn-icon danger" 
                  @click="confirmDelete(user)" 
                  title="Удалить"
                  :disabled="user.userType === 'admin'"
                >
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
    
    <!-- User Detail Modal -->
    <div class="modal-overlay" v-if="selectedUser" @click.self="selectedUser = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Информация о пользователе</h3>
          <button class="close-btn" @click="selectedUser = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="label">ID:</span>
            <span class="value">{{ selectedUser.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Имя:</span>
            <span class="value">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">{{ selectedUser.email }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Тип:</span>
            <span class="value">{{ getUserTypeName(selectedUser.userType) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Регистрация:</span>
            <span class="value">{{ formatDate(selectedUser.createdAt) }}</span>
          </div>
          <div class="detail-row" v-if="selectedUser.profile">
            <span class="label">Компания:</span>
            <span class="value">{{ selectedUser.profile.company || '—' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Role Edit Modal -->
    <div class="modal-overlay" v-if="editingUser" @click.self="editingUser = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Изменить роль пользователя</h3>
          <button class="close-btn" @click="editingUser = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Пользователь: <strong>{{ editingUser.firstName }} {{ editingUser.lastName }}</strong></p>
          <div class="form-group">
            <label>Новая роль:</label>
            <select v-model="newRole">
              <option value="startup_founder">Стартапер</option>
              <option value="investor">Инвестор</option>
              <option value="businessman">Бизнесмен</option>
              <option value="crypto_trader">Крипто-трейдер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="editingUser = null">Отмена</button>
          <button class="btn primary" @click="saveRole">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      loading: true,
      search: '',
      filterType: '',
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      selectedUser: null,
      editingUser: null,
      newRole: '',
      searchTimeout: null
    };
  },
  async mounted() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          page: this.pagination.page,
          limit: this.pagination.limit
        });
        
        if (this.search) params.append('search', this.search);
        if (this.filterType) params.append('userType', this.filterType);
        
        const response = await api.get(`/admin/users?${params}`);
        this.users = response.data.users;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      } finally {
        this.loading = false;
      }
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.loadUsers();
      }, 300);
    },
    changePage(page) {
      this.pagination.page = page;
      this.loadUsers();
    },
    async viewUser(user) {
      try {
        const response = await api.get(`/admin/users/${user.id}`);
        this.selectedUser = response.data;
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      }
    },
    editRole(user) {
      this.editingUser = user;
      this.newRole = user.userType;
    },
    async saveRole() {
      try {
        await api.patch(`/admin/users/${this.editingUser.id}/role`, {
          userType: this.newRole
        });
        this.editingUser = null;
        await this.loadUsers();
      } catch (error) {
        console.error('Ошибка изменения роли:', error);
        alert('Не удалось изменить роль');
      }
    },
    async confirmDelete(user) {
      if (user.userType === 'admin') {
        alert('Нельзя удалить администратора');
        return;
      }
      
      if (confirm(`Удалить пользователя ${user.firstName} ${user.lastName}?`)) {
        try {
          await api.delete(`/admin/users/${user.id}`);
          await this.loadUsers();
        } catch (error) {
          console.error('Ошибка удаления:', error);
          alert('Не удалось удалить пользователя');
        }
      }
    },
    getUserTypeName(type) {
      const names = {
        startup_founder: 'Стартапер',
        investor: 'Инвестор',
        businessman: 'Бизнесмен',
        crypto_trader: 'Крипто-трейдер',
        admin: 'Админ'
      };
      return names[type] || type;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    },
    getInitials(user) {
      return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    },
    getAvatarStyle(user) {
      if (user.profile?.avatar) {
        return { backgroundImage: `url(${user.profile.avatar})`, backgroundSize: 'cover' };
      }
      return {};
    }
  }
}
</script>

<style scoped>
.admin-users {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F8FFF, #1E6BFF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-name {
  font-weight: 500;
  color: #1a1a2e;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.startup_founder { background: #EFF6FF; color: #3B82F6; }
.badge.investor { background: #D1FAE5; color: #059669; }
.badge.businessman { background: #FEF3C7; color: #D97706; }
.badge.crypto_trader { background: #F3E8FF; color: #7C3AED; }
.badge.admin { background: #FEE2E2; color: #DC2626; }

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

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f1f5f9;
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

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row .label {
  width: 120px;
  color: #64748b;
  font-size: 0.875rem;
}

.detail-row .value {
  flex: 1;
  font-weight: 500;
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
  transition: all 0.2s;
}

.btn.primary {
  background: #4F8FFF;
  color: white;
}

.btn.primary:hover {
  background: #1E6BFF;
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn.secondary:hover {
  background: #e2e8f0;
}
</style>
