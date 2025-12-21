<template>
  <div class="admin-communities">
    <div class="filters-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" v-model="search" placeholder="Поиск сообществ..." @input="debouncedSearch">
      </div>
    </div>
    
    <div class="table-card">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Загрузка...
      </div>
      
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Создатель</th>
            <th>Участников</th>
            <th>Тип</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="community in communities" :key="community.id">
            <td>{{ community.id }}</td>
            <td>
              <div class="community-cell">
                <span class="community-name">{{ community.name }}</span>
                <span class="community-desc">{{ truncate(community.description, 50) }}</span>
              </div>
            </td>
            <td>
              <span v-if="community.creator">
                {{ community.creator.firstName }} {{ community.creator.lastName }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>{{ community.membersCount || 0 }}</td>
            <td>
              <span class="type-badge" :class="{ private: community.isPrivate }">
                {{ community.isPrivate ? 'Закрытое' : 'Открытое' }}
              </span>
            </td>
            <td>{{ formatDate(community.createdAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn-icon danger" @click="confirmDelete(community)" title="Удалить">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button class="page-btn" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">Страница {{ pagination.page }} из {{ pagination.totalPages }}</span>
        <button class="page-btn" :disabled="pagination.page === pagination.totalPages" @click="changePage(pagination.page + 1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AdminCommunities',
  data() {
    return {
      communities: [],
      loading: true,
      search: '',
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      searchTimeout: null
    };
  },
  async mounted() {
    await this.loadCommunities();
  },
  methods: {
    async loadCommunities() {
      this.loading = true;
      try {
        const params = new URLSearchParams({ page: this.pagination.page, limit: this.pagination.limit });
        if (this.search) params.append('search', this.search);
        const response = await api.get(`/admin/communities?${params}`);
        this.communities = response.data.communities;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('Ошибка загрузки сообществ:', error);
      } finally {
        this.loading = false;
      }
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => { this.pagination.page = 1; this.loadCommunities(); }, 300);
    },
    changePage(page) {
      this.pagination.page = page;
      this.loadCommunities();
    },
    async confirmDelete(community) {
      if (confirm(`Удалить сообщество "${community.name}"?`)) {
        try {
          await api.delete(`/admin/communities/${community.id}`);
          await this.loadCommunities();
        } catch (error) {
          console.error('Ошибка удаления:', error);
          alert('Не удалось удалить сообщество');
        }
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    },
    truncate(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    }
  }
}
</script>

<style scoped>
.admin-communities { max-width: 1400px; }
.filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.search-box { flex: 1; max-width: 400px; position: relative; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; }
.table-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.loading { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 3rem; color: #64748b; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #64748b; font-size: 0.75rem; text-transform: uppercase; }
.community-cell { display: flex; flex-direction: column; gap: 0.25rem; }
.community-name { font-weight: 500; color: #1a1a2e; }
.community-desc { font-size: 0.75rem; color: #64748b; }
.text-muted { color: #94a3b8; }
.type-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500; background: #D1FAE5; color: #059669; }
.type-badge.private { background: #FEF3C7; color: #D97706; }
.actions { display: flex; gap: 0.5rem; }
.btn-icon { width: 32px; height: 32px; border: none; border-radius: 8px; background: #f1f5f9; color: #64748b; cursor: pointer; }
.btn-icon.danger:hover { background: #FEE2E2; color: #DC2626; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.page-btn { width: 36px; height: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 0.875rem; color: #64748b; }
</style>
