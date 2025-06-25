<template>
  <div class="community-page">
    <div class="header">
      <h1>Сообщества</h1>
    </div>

    <div class="filters">
      <div class="search-container">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск сообществ..."
            @input="filterCommunities"
            class="search-input"
          >
        </div>
        <BaseButton @click="showCreateModal = true" class="create-button">
          <i class="fas fa-plus"></i> Создать сообщество
        </BaseButton>
      </div>
      
      <div class="filter-tags">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['filter-tag', { active: selectedCategories.includes(category.id) }]"
          @click="toggleCategory(category.id)"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="communities-grid">
      <div 
        v-for="community in filteredCommunities" 
        :key="community.id"
        class="community-card"
        v-animate
        @click="showCommunityDetails(community)"
      >
        <div class="community-image">
          <img :src="community.image" :alt="community.name">
          <div class="community-category">
            <i :class="getCategoryIcon(community.categoryId)"></i>
          </div>
        </div>
        <div class="community-content">
          <h3>{{ community.name }}</h3>
          <p>{{ community.description }}</p>
          <div class="community-stats">
            <div class="stat">
              <i class="fas fa-users"></i>
              {{ community.membersCount }} участников
            </div>
            <div class="stat">
              <i class="fas fa-comments"></i>
              {{ community.postsCount }} постов
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания сообщества -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h2>Создание сообщества</h2>
      </template>
      
      <template #default>
        <form @submit.prevent="createCommunity" class="create-form">
          <div class="form-group">
            <label>Название сообщества</label>
            <input 
              v-model="newCommunity.name" 
              type="text" 
              required
              placeholder="Введите название"
            >
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="newCommunity.description" 
              required
              placeholder="Опишите ваше сообщество"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Категория</label>
            <select v-model="newCommunity.categoryId" required>
              <option value="">Выберите категорию</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Изображение сообщества</label>
            <input type="file" @change="handleImageUpload" accept="image/*">
          </div>
        </form>
      </template>

      <template #footer>
        <BaseButton @click="showCreateModal = false" variant="secondary">
          Отмена
        </BaseButton>
        <BaseButton @click="createCommunity">
          Создать
        </BaseButton>
      </template>
    </Modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'

export default defineComponent({
  name: 'Community',
  components: {
    BaseButton,
    Modal
  },
  setup() {
    const categories = ref([
      { id: 1, name: 'Стартапы', icon: 'fas fa-rocket' },
      { id: 2, name: 'Инвесторы', icon: 'fas fa-chart-line' },
      { id: 3, name: 'Бизнес', icon: 'fas fa-briefcase' },
      { id: 4, name: 'Крипто', icon: 'fas fa-coins' }
    ])

    const communities = ref([
      {
        id: 1,
        name: 'Стартап-инкубатор',
        description: 'Сообщество для обсуждения и развития стартап-проектов',
        categoryId: 1,
        image: 'https://picsum.photos/400/300',
        membersCount: 1200,
        postsCount: 450
      },
      {
        id: 2,
        name: 'Инвестиционный клуб',
        description: 'Обсуждение инвестиционных стратегий и возможностей',
        categoryId: 2,
        image: 'https://picsum.photos/400/301',
        membersCount: 850,
        postsCount: 320
      },
      {
        id: 3,
        name: 'Бизнес-нетворкинг',
        description: 'Площадка для нетворкинга и обмена опытом',
        categoryId: 3,
        image: 'https://picsum.photos/400/302',
        membersCount: 1500,
        postsCount: 680
      },
      {
        id: 4,
        name: 'Крипто-трейдеры',
        description: 'Обсуждение криптовалют и трейдинга',
        categoryId: 4,
        image: 'https://picsum.photos/400/303',
        membersCount: 950,
        postsCount: 410
      },
      {
        id: 5,
        name: 'Tech Founders',
        description: 'Сообщество технологических предпринимателей',
        categoryId: 1,
        image: 'https://picsum.photos/400/304',
        membersCount: 750,
        postsCount: 280
      },
      {
        id: 6,
        name: 'Angel Investors',
        description: 'Клуб бизнес-ангелов и частных инвесторов',
        categoryId: 2,
        image: 'https://picsum.photos/400/305',
        membersCount: 320,
        postsCount: 150
      }
    ])

    const searchQuery = ref('')
    const selectedCategories = ref([])
    const showCreateModal = ref(false)
    const newCommunity = ref({
      name: '',
      description: '',
      categoryId: '',
      image: null
    })

    const filteredCommunities = computed(() => {
      let filtered = communities.value

      // Фильтрация по поиску
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(community => 
          community.name.toLowerCase().includes(query) ||
          community.description.toLowerCase().includes(query)
        )
      }

      // Фильтрация по категориям
      if (selectedCategories.value.length > 0) {
        filtered = filtered.filter(community =>
          selectedCategories.value.includes(community.categoryId)
        )
      }

      return filtered
    })

    const toggleCategory = (categoryId) => {
      const index = selectedCategories.value.indexOf(categoryId)
      if (index === -1) {
        selectedCategories.value.push(categoryId)
      } else {
        selectedCategories.value.splice(index, 1)
      }
    }

    const getCategoryIcon = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      return category ? category.icon : 'fas fa-users'
    }

    const createCommunity = () => {
      // Здесь будет логика создания сообщества
      showCreateModal.value = false
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        newCommunity.value.image = URL.createObjectURL(file)
      }
    }

    const showCommunityDetails = (community) => {
      // Здесь будет логика показа деталей сообщества
      console.log('Show details for:', community.name)
    }

    return {
      categories,
      communities,
      searchQuery,
      selectedCategories,
      filteredCommunities,
      showCreateModal,
      newCommunity,
      toggleCategory,
      getCategoryIcon,
      createCommunity,
      handleImageUpload,
      showCommunityDetails
    }
  }
})
</script>

<style scoped>
.community-page {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.75rem;
}

.filters {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-lg);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 14px;
}

.search-input {
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

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

.create-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 48px;
  width: auto;
  min-width: 200px;
}

.create-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 77, 255, 0.2);
}

.create-button i {
  font-size: 0.9rem;
}

.filter-tags {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  background: var(--card-hover);
}

.filter-tag.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.community-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
}

.community-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.community-image {
  position: relative;
  height: 200px;
}

.community-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.community-category {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.community-content {
  padding: 1.5rem;
}

.community-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.community-content p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.community-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
  background: white;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group input[type="file"] {
  padding: 0.5rem;
  background: white;
  border: 2px dashed var(--border-color);
  cursor: pointer;
  text-align: center;
}

.form-group input[type="file"]:hover {
  border-color: var(--primary-color);
  background: #f8fafc;
}

/* Стили для футера модального окна */
:deep(.modal-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

:deep(.modal-footer .base-button) {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

:deep(.modal-footer .base-button:last-child) {
  background: var(--primary-gradient);
  color: white;
  border: none;
}

:deep(.modal-footer .base-button:last-child:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

:deep(.modal-footer .base-button[variant="secondary"]) {
  background: #f1f5f9;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

:deep(.modal-footer .base-button[variant="secondary"]:hover) {
  background: #e2e8f0;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.community-card {
  animation: fadeIn 0.5s ease forwards;
}

.community-card:nth-child(2) { animation-delay: 0.1s; }
.community-card:nth-child(3) { animation-delay: 0.2s; }
.community-card:nth-child(4) { animation-delay: 0.3s; }
.community-card:nth-child(5) { animation-delay: 0.4s; }
.community-card:nth-child(6) { animation-delay: 0.5s; }
</style> 