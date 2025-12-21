<template>
  <div class="admin-investments">
    <div class="table-card">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Загрузка...
      </div>
      
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Инвестор</th>
            <th>Проект</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="investment in investments" :key="investment.id">
            <td>{{ investment.id }}</td>
            <td>
              <span v-if="investment.investor">
                {{ investment.investor.firstName }} {{ investment.investor.lastName }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <span v-if="investment.project">{{ investment.project.title }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="amount">{{ formatMoney(investment.amount) }}</td>
            <td>
              <span class="status-badge" :class="investment.status">
                {{ getStatusName(investment.status) }}
              </span>
            </td>
            <td>{{ formatDate(investment.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
      
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
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AdminInvestments',
  data() {
    return {
      investments: [],
      loading: true,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  },
  async mounted() {
    await this.loadInvestments();
  },
  methods: {
    async loadInvestments() {
      this.loading = true;
      try {
        const response = await api.get(`/admin/investments?page=${this.pagination.page}&limit=${this.pagination.limit}`);
        this.investments = response.data.investments;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('Ошибка загрузки инвестиций:', error);
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      this.pagination.page = page;
      this.loadInvestments();
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount || 0);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    },
    getStatusName(status) {
      const names = { pending: 'Ожидает', confirmed: 'Подтверждена', cancelled: 'Отменена' };
      return names[status] || status;
    }
  }
}
</script>

<style scoped>
.admin-investments { max-width: 1400px; }
.table-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.loading { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 3rem; color: #64748b; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #64748b; font-size: 0.75rem; text-transform: uppercase; }
.text-muted { color: #94a3b8; }
.amount { font-weight: 600; color: #10B981; }
.status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.status-badge.pending { background: #FEF3C7; color: #D97706; }
.status-badge.confirmed { background: #D1FAE5; color: #059669; }
.status-badge.cancelled { background: #FEE2E2; color: #DC2626; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.page-btn { width: 36px; height: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 0.875rem; color: #64748b; }
</style>
