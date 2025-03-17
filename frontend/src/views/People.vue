<template>
  <div class="people">
    <div class="people-container">
      <!-- Фильтры -->
      <div class="filters">
        <div class="filters-header">
          <h2>Фильтры</h2>
          <button class="btn btn-text" @click="resetFilters">
            Сбросить
          </button>
        </div>

        <div class="filter-section">
          <h3>Тип пользователя</h3>
          <div class="filter-options">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="filters.userTypes"
                value="startup_founder"
              >
              Создатели стартапов
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="filters.userTypes"
                value="investor"
              >
              Инвесторы
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="filters.userTypes"
                value="businessman"
              >
              Бизнесмены
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="filters.userTypes"
                value="crypto_trader"
              >
              Криптотрейдеры
            </label>
          </div>
        </div>

        <div class="filter-section">
          <h3>Интересы</h3>
          <div class="filter-options">
            <label
              v-for="interest in availableInterests"
              :key="interest"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                v-model="filters.interests"
                :value="interest"
              >
              {{ interest }}
            </label>
          </div>
        </div>

        <div class="filter-section">
          <h3>Опыт</h3>
          <div class="range-input">
            <input
              type="range"
              v-model="filters.experience"
              min="0"
              max="20"
              step="1"
            >
            <div class="range-values">
              <span>{{ filters.experience }} лет</span>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <h3>Локация</h3>
          <input
            type="text"
            v-model="filters.location"
            placeholder="Введите город или страну"
            class="text-input"
          >
        </div>
      </div>

      <!-- Список пользователей -->
      <div class="users-list">
        <div class="users-header">
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск по имени или компании..."
              class="search-input"
            >
            <button class="btn btn-icon" @click="searchUsers">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div class="view-options">
            <button
              class="btn btn-icon"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button
              class="btn btn-icon"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>

        <div
          class="users-grid"
          :class="{ 'list-view': viewMode === 'list' }"
        >
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-card"
            @click="openUserProfile(user)"
          >
            <div class="user-avatar">
              {{ user.name[0] }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-role">{{ formatUserType(user.type) }}</div>
              <div class="user-company" v-if="user.company">
                {{ user.company }}
              </div>
              <div class="user-location" v-if="user.location">
                <i class="fas fa-map-marker-alt"></i>
                {{ user.location }}
              </div>
              <div class="user-interests">
                <span
                  v-for="interest in user.interests.slice(0, 3)"
                  :key="interest"
                  class="interest-tag"
                >
                  {{ interest }}
                </span>
              </div>
            </div>
            <div class="user-actions">
              <button
                class="btn btn-icon"
                @click.stop="startChat(user)"
              >
                <i class="fas fa-comments"></i>
              </button>
              <button
                class="btn btn-icon"
                @click.stop="connectWithUser(user)"
              >
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div class="pagination">
          <button
            class="btn btn-icon"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">
            Страница {{ currentPage }} из {{ totalPages }}
          </span>
          <button
            class="btn btn-icon"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно профиля -->
    <div class="modal" v-if="selectedUser">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Профиль пользователя</h2>
          <button class="btn btn-icon" @click="selectedUser = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="profile-info">
            <div class="profile-avatar">
              {{ selectedUser.name[0] }}
            </div>
            <div class="profile-details">
              <h3>{{ selectedUser.name }}</h3>
              <p class="profile-role">{{ formatUserType(selectedUser.type) }}</p>
              <p class="profile-company" v-if="selectedUser.company">
                {{ selectedUser.company }}
              </p>
              <p class="profile-location" v-if="selectedUser.location">
                <i class="fas fa-map-marker-alt"></i>
                {{ selectedUser.location }}
              </p>
            </div>
          </div>

          <div class="profile-section">
            <h4>О себе</h4>
            <p>{{ selectedUser.bio || 'Нет описания' }}</p>
          </div>

          <div class="profile-section">
            <h4>Интересы</h4>
            <div class="interests-list">
              <span
                v-for="interest in selectedUser.interests"
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
              </span>
            </div>
          </div>

          <div class="profile-section">
            <h4>Опыт</h4>
            <p>{{ selectedUser.experience }} лет</p>
          </div>

          <div class="profile-actions">
            <button class="btn btn-primary" @click="startChat(selectedUser)">
              Начать чат
            </button>
            <button class="btn btn-outline" @click="connectWithUser(selectedUser)">
              Добавить в контакты
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'People',
  data() {
    return {
      filters: {
        userTypes: [],
        interests: [],
        experience: 0,
        location: ''
      },
      searchQuery: '',
      viewMode: 'grid',
      users: [],
      selectedUser: null,
      currentPage: 1,
      totalPages: 1,
      availableInterests: [
        'Технологии',
        'Финансы',
        'Маркетинг',
        'Блокчейн',
        'AI/ML',
        'Криптовалюты',
        'Инвестиции',
        'Стартапы'
      ]
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        // Фильтрация по типу пользователя
        if (this.filters.userTypes.length && !this.filters.userTypes.includes(user.type)) {
          return false;
        }

        // Фильтрация по интересам
        if (this.filters.interests.length) {
          const hasMatchingInterests = this.filters.interests.some(interest =>
            user.interests.includes(interest)
          );
          if (!hasMatchingInterests) return false;
        }

        // Фильтрация по опыту
        if (user.experience < this.filters.experience) {
          return false;
        }

        // Фильтрация по локации
        if (this.filters.location && !user.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
          return false;
        }

        // Фильтрация по поисковому запросу
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          return (
            user.name.toLowerCase().includes(query) ||
            (user.company && user.company.toLowerCase().includes(query))
          );
        }

        return true;
      });
    }
  },
  async created() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        const response = await api.get('/users', {
          params: {
            page: this.currentPage,
            limit: 12
          }
        });
        this.users = response.data.users;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    },
    resetFilters() {
      this.filters = {
        userTypes: [],
        interests: [],
        experience: 0,
        location: ''
      };
      this.loadUsers();
    },
    formatUserType(type) {
      const types = {
        startup_founder: 'Создатель стартапа',
        investor: 'Инвестор',
        businessman: 'Бизнесмен',
        crypto_trader: 'Криптотрейдер'
      };
      return types[type] || type;
    },
    async searchUsers() {
      this.currentPage = 1;
      await this.loadUsers();
    },
    async changePage(page) {
      this.currentPage = page;
      await this.loadUsers();
    },
    openUserProfile(user) {
      this.selectedUser = user;
    },
    async startChat(user) {
      try {
        const response = await api.post('/chats', {
          userId: user.id
        });
        this.$router.push({
          name: 'Messenger',
          query: { chatId: response.data.id }
        });
      } catch (error) {
        console.error('Ошибка при создании чата:', error);
      }
    },
    async connectWithUser(user) {
      try {
        await api.post(`/users/${user.id}/connect`);
        // Здесь можно добавить уведомление об успешном подключении
      } catch (error) {
        console.error('Ошибка при подключении к пользователю:', error);
      }
    }
  }
}
</script>

<style scoped>
.people {
  padding: 2rem;
}

.people-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.filters {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.range-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-values {
  display: flex;
  justify-content: space-between;
  color: #666;
}

.text-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.users-list {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  max-width: 500px;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.users-grid.list-view {
  grid-template-columns: 1fr;
}

.user-card {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.user-role {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.user-company {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.user-location {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.user-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.interest-tag {
  background-color: #e8f5e9;
  color: #28a745;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-info {
  color: #666;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
}

.profile-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
}

.profile-details h3 {
  margin-bottom: 0.5rem;
}

.profile-role {
  color: #666;
  margin-bottom: 0.5rem;
}

.profile-company {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.profile-location {
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-section h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-outline {
  background: none;
  border: 1px solid #28a745;
  color: #28a745;
}

.btn-text {
  background: none;
  border: none;
  color: #666;
}

.btn-icon {
  background: none;
  border: none;
  color: #666;
  padding: 0.5rem;
}

.btn-icon.active {
  color: #28a745;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .people {
    padding: 1rem;
  }

  .people-container {
    grid-template-columns: 1fr;
  }

  .filters {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .filters.active {
    transform: translateX(0);
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-actions {
    flex-direction: column;
  }
}
</style> 