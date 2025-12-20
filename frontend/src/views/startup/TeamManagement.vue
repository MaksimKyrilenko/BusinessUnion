<template>
  <div class="team-management">
    <div v-if="startups.length === 0" class="empty-state">
      <p>У вас пока нет созданных стартапов</p>
    </div>

    <div v-else class="team-management-content">
      <!-- Информация о проекте -->
      <div v-if="selectedProjectId" class="project-info-section">
        <div v-if="loadingProject" class="loading-project">
          <div class="spinner"></div>
          <p>Загрузка информации о проекте...</p>
        </div>
        <div v-else-if="currentProject" class="project-info-content">
          <div class="project-info-card">
            <div class="project-info-header">
              <div class="project-info-main">
                <div class="project-image-container">
                  <img 
                    :src="getProjectImageSrc(currentProject.image)" 
                    :alt="currentProject.title"
                    class="project-info-image"
                    @error="handleProjectImageError"
                  >
                </div>
                <div class="project-info-details">
                  <div class="project-title-section">
                    <h1>{{ currentProject.title }}</h1>
                    <span class="project-stage-badge">{{ getStageText(currentProject.stage) }}</span>
                  </div>
                  <p class="project-description">{{ currentProject.description }}</p>
                  
                  <div class="project-stats-grid">
                    <div class="stat-card">
                      <div class="stat-icon">
                        <i class="fas fa-ruble-sign"></i>
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">Требуемые инвестиции</span>
                        <span class="stat-value">{{ formatCurrency(currentProject.investmentNeeded) }}</span>
                      </div>
                    </div>
                    
                    <div class="stat-card">
                      <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">Ожидаемая ROI</span>
                        <span class="stat-value">{{ currentProject.expectedRoi }}%</span>
                      </div>
                    </div>
                    
                    <div class="stat-card" v-if="currentProject.investmentCollected">
                      <div class="stat-icon">
                        <i class="fas fa-wallet"></i>
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">Собрано</span>
                        <span class="stat-value">{{ formatCurrency(currentProject.investmentCollected) }}</span>
                      </div>
                    </div>
                    
                    <div class="stat-card" v-if="currentProject.location">
                      <div class="stat-icon">
                        <i class="fas fa-map-marker-alt"></i>
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">Местоположение</span>
                        <span class="stat-value">{{ currentProject.location }}</span>
                      </div>
                    </div>
                    
                    <div class="stat-card" v-if="currentProject.category">
                      <div class="stat-icon">
                        <i class="fas fa-folder"></i>
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">Категория</span>
                        <span class="stat-value">{{ currentProject.category.name }}</span>
                      </div>
                    </div>
                    
                    <div class="stat-card">
                      <div class="stat-icon">
                        <i class="fas fa-calendar"></i>
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">Создан</span>
                        <span class="stat-value">{{ formatDate(currentProject.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button @click="showEditModal = true" class="btn btn-primary edit-btn">
                <i class="fas fa-edit"></i>
                Редактировать
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedProjectId && currentProject" class="main-content-wrapper">
        <!-- Задачи проекта -->
        <div class="tasks-section">
          <div class="section-header">
            <h2>Задачи проекта</h2>
            <button 
              v-if="canAddMembers || canManageTasks" 
              @click="showCreateTaskModal = true" 
              class="btn btn-primary"
            >
              <i class="fas fa-plus"></i>
              Создать задачу
            </button>
          </div>

          <div v-if="loadingTasks" class="loading-container">
            <div class="spinner"></div>
            <p>Загрузка задач...</p>
          </div>

          <div v-else-if="tasks.length === 0" class="empty-state">
            <p>Задач пока нет</p>
          </div>

          <div v-else class="tasks-container">
            <!-- Не готово -->
            <div class="task-column">
              <div class="task-column-header not-started">
                <h3>Не готово</h3>
                <span class="task-count">{{ getTasksByStatus('not_started').length }}</span>
              </div>
              <div class="task-list">
                <div 
                  v-for="task in getTasksByStatus('not_started')" 
                  :key="task.id"
                  class="task-card"
                  @click="editTask(task)"
                >
                  <div class="task-header">
                    <h4>{{ task.title }}</h4>
                    <div class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</div>
                  </div>
                  <p v-if="task.description" class="task-description">{{ task.description }}</p>
                  <div class="task-footer">
                    <div class="task-assignee" v-if="task.assignedTo">
                      <i class="fas fa-user"></i>
                      <span>{{ getAssigneeName(task.assignedTo) }}</span>
                    </div>
                    <div class="task-due-date" v-if="task.dueDate">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(task.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- В процессе -->
            <div class="task-column">
              <div class="task-column-header in-progress">
                <h3>В процессе</h3>
                <span class="task-count">{{ getTasksByStatus('in_progress').length }}</span>
              </div>
              <div class="task-list">
                <div 
                  v-for="task in getTasksByStatus('in_progress')" 
                  :key="task.id"
                  class="task-card"
                  @click="editTask(task)"
                >
                  <div class="task-header">
                    <h4>{{ task.title }}</h4>
                    <div class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</div>
                  </div>
                  <p v-if="task.description" class="task-description">{{ task.description }}</p>
                  <div class="task-footer">
                    <div class="task-assignee" v-if="task.assignedTo">
                      <i class="fas fa-user"></i>
                      <span>{{ getAssigneeName(task.assignedTo) }}</span>
                    </div>
                    <div class="task-due-date" v-if="task.dueDate">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(task.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Выполнено -->
            <div class="task-column">
              <div class="task-column-header completed">
                <h3>Выполнено</h3>
                <span class="task-count">{{ getTasksByStatus('completed').length }}</span>
              </div>
              <div class="task-list">
                <div 
                  v-for="task in getTasksByStatus('completed')" 
                  :key="task.id"
                  class="task-card completed"
                  @click="editTask(task)"
                >
                  <div class="task-header">
                    <h4>{{ task.title }}</h4>
                    <div class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</div>
                  </div>
                  <p v-if="task.description" class="task-description">{{ task.description }}</p>
                  <div class="task-footer">
                    <div class="task-assignee" v-if="task.assignedTo">
                      <i class="fas fa-user"></i>
                      <span>{{ getAssigneeName(task.assignedTo) }}</span>
                    </div>
                    <div class="task-due-date" v-if="task.dueDate">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(task.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Управление командой -->
        <div class="team-content">
        <div class="team-section">
          <div class="section-header">
            <h2>Участники команды</h2>
            <button 
              v-if="canAddMembers" 
              @click="showAddMemberModal = true" 
              class="btn btn-primary"
            >
              <i class="fas fa-user-plus"></i>
              Добавить участника
            </button>
          </div>

          <div v-if="loadingTeam" class="loading-container">
            <div class="spinner"></div>
            <p>Загрузка команды...</p>
          </div>

          <div v-else-if="teamMembers.length === 0" class="empty-state">
            <p>В команде пока нет участников</p>
          </div>

          <div v-else class="team-members-list">
            <div 
              v-for="member in teamMembers" 
              :key="member.id" 
              class="team-member-card"
            >
              <div class="member-info">
                <img 
                  :src="member.avatar || '/assets/images/default-avatar.svg'" 
                  :alt="getMemberName(member)"
                  class="member-avatar"
                >
                <div class="member-details">
                  <h3>{{ getMemberName(member) }}</h3>
                  <p class="member-email">{{ member.email }}</p>
                  <span class="member-role-badge" :class="member.role">
                    {{ getRoleText(member.role) }}
                  </span>
                </div>
              </div>
              <div class="member-actions" v-if="canManageMember(member)">
                <select 
                  v-if="canChangeRole(member)" 
                  :value="member.role" 
                  @change="updateMemberRole(member.userId, $event.target.value)"
                  class="role-select"
                >
                  <option value="team_lead">Тимлид</option>
                  <option value="admin">Администратор</option>
                  <option value="member">Участник</option>
                </select>
                <button 
                  v-if="canRemoveMember(member)" 
                  @click="removeMember(member.userId)" 
                  class="btn btn-danger btn-sm"
                >
                  <i class="fas fa-user-minus"></i>
                  Исключить
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Командный чат -->
        <div class="chat-section">
          <EmbeddedGroupChat
            v-if="teamChat"
            :chat-id="teamChat.id"
            :title="'Командный чат'"
            :members-count="teamMembers.length"
          />
          <div v-else-if="loadingChat" class="loading-container">
            <div class="spinner"></div>
            <p>Загрузка чата...</p>
          </div>
          <div v-else class="empty-state">
            <p>Чат команды не найден</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования задачи -->
    <Modal :show="showCreateTaskModal || !!editingTask" @close="closeTaskModal">
      <div class="modal-inner">
        <div class="modal-header">
          <h2>{{ editingTask ? 'Редактирование задачи' : 'Создание задачи' }}</h2>
        </div>
        <div class="task-form">
          <div class="form-group">
            <label>Название задачи *</label>
            <input 
              v-model="taskForm.title" 
              type="text" 
              placeholder="Введите название задачи"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="taskForm.description" 
              placeholder="Введите описание задачи"
              class="form-input"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Статус</label>
              <select v-model="taskForm.status" class="form-input">
                <option value="not_started">Не готово</option>
                <option value="in_progress">В процессе</option>
                <option value="completed">Выполнено</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Приоритет</label>
              <select v-model="taskForm.priority" class="form-input">
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Исполнитель</label>
              <select v-model="taskForm.assignedToId" class="form-input">
                <option :value="null">Не назначен</option>
                <option v-for="member in teamMembers" :key="member.userId" :value="member.userId">
                  {{ getMemberName(member) }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Срок выполнения</label>
              <input 
                v-model="taskForm.dueDate" 
                type="date" 
                class="form-input"
              >
            </div>
          </div>
          
          <div class="form-actions">
            <button @click="closeTaskModal" class="btn btn-secondary">Отмена</button>
            <button @click="saveTask" class="btn btn-primary">
              {{ editingTask ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Модальное окно редактирования проекта -->
    <Modal :show="showEditModal" @close="showEditModal = false">
      <template #header>
        <h2>Редактирование стартапа</h2>
      </template>
      <template #default>
        <CreateStartupForm 
          :project-id="selectedProjectId"
          @success="handleStartupUpdated" 
          @cancel="showEditModal = false" 
        />
      </template>
    </Modal>

    <!-- Модальное окно добавления участника -->
    <Modal :show="showAddMemberModal" @close="showAddMemberModal = false">
      <template #header>
        <h2>Добавить участника в команду</h2>
      </template>
      <template #default>
        <div class="add-member-form">
          <div class="form-group">
            <label>Поиск пользователя:</label>
            <input 
              v-model="userSearchQuery" 
              @input="searchUsers"
              placeholder="Введите email или имя..."
              class="form-input"
            >
          </div>
          <div v-if="searchingUsers" class="loading-container">
            <div class="spinner"></div>
          </div>
          <div v-else-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="user in searchResults" 
              :key="user.id"
              class="user-result-item"
              @click="addMember(user.id)"
            >
              <img 
                :src="user.avatar || '/assets/images/default-avatar.svg'" 
                :alt="getUserName(user)"
                class="user-avatar"
              >
              <div class="user-info">
                <h4>{{ getUserName(user) }}</h4>
                <p>{{ user.email }}</p>
              </div>
              <button class="btn btn-primary btn-sm">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <div v-else-if="userSearchQuery && !searchingUsers" class="empty-state">
            <p>Пользователи не найдены</p>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { projectsService } from '@/services/projects.service';
import messengerService from '@/services/messenger.service';
import Modal from '@/components/ui/Modal.vue';
import CreateStartupForm from './CreateStartupForm.vue';
import EmbeddedGroupChat from '@/components/messenger/EmbeddedGroupChat.vue';

export default {
  name: 'TeamManagement',
  components: {
    Modal,
    CreateStartupForm,
    EmbeddedGroupChat
  },
  props: {
    startups: {
      type: Array,
      required: true
    },
    initialProjectId: {
      type: Number,
      default: null
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const selectedProjectId = ref(null);
    const teamMembers = ref([]);
    const loadingTeam = ref(false);
    const showAddMemberModal = ref(false);
    const userSearchQuery = ref('');
    const searchResults = ref([]);
    const searchingUsers = ref(false);
    const currentUserId = ref(parseInt(localStorage.getItem('userId')));
    const chatMessages = ref([]);
    const loadingChat = ref(false);
    const newMessage = ref('');
    const teamChat = ref(null);
    const currentProject = ref(null);
    const loadingProject = ref(false);
    const showEditModal = ref(false);
    const tasks = ref([]);
    const loadingTasks = ref(false);
    const showCreateTaskModal = ref(false);
    const editingTask = ref(null);
    const taskForm = ref({
      title: '',
      description: '',
      status: 'not_started',
      priority: 'medium',
      assignedToId: null,
      dueDate: ''
    });

    const currentUserRole = computed(() => {
      if (!selectedProjectId.value) return null;
      const member = teamMembers.value.find(m => m.userId === currentUserId.value);
      return member ? member.role : null;
    });

    const canAddMembers = computed(() => {
      const role = currentUserRole.value;
      return role === 'team_lead' || role === 'admin';
    });

    const canChangeRole = (member) => {
      const role = currentUserRole.value;
      if (role !== 'team_lead') return false;
      if (member.role === 'team_lead' && member.userId === currentUserId.value) return true;
      return member.role !== 'team_lead';
    };

    const canRemoveMember = (member) => {
      const role = currentUserRole.value;
      if (role !== 'team_lead') return false;
      return member.role !== 'team_lead';
    };

    const canManageMember = (member) => {
      return canChangeRole(member) || canRemoveMember(member);
    };

    const loadTeamData = async () => {
      if (!selectedProjectId.value) return;
      await Promise.all([loadProjectInfo(), loadTeamMembers(), loadTeamChat(), loadTasks()]);
    };

    const loadTasks = async () => {
      if (!selectedProjectId.value) return;
      loadingTasks.value = true;
      try {
        const response = await projectsService.getProjectTasks(selectedProjectId.value);
        tasks.value = response || [];
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
        tasks.value = [];
      } finally {
        loadingTasks.value = false;
      }
    };

    const loadProjectInfo = async () => {
      if (!selectedProjectId.value) return;
      loadingProject.value = true;
      try {
        const project = await projectsService.getProjectById(selectedProjectId.value);
        currentProject.value = project;
      } catch (error) {
        console.error('Ошибка при загрузке информации о проекте:', error);
        currentProject.value = null;
      } finally {
        loadingProject.value = false;
      }
    };

    const loadTeamMembers = async () => {
      if (!selectedProjectId.value) return;
      loadingTeam.value = true;
      try {
        console.log(`[TeamManagement] Загрузка участников команды для проекта ${selectedProjectId.value}`);
        const members = await projectsService.getTeamMembers(selectedProjectId.value);
        console.log(`[TeamManagement] Получено участников:`, members);
        console.log(`[TeamManagement] Количество участников: ${members.length}`);
        teamMembers.value = members;
      } catch (error) {
        console.error('Ошибка при загрузке команды:', error);
        alert('Ошибка при загрузке команды');
      } finally {
        loadingTeam.value = false;
      }
    };

    const loadTeamChat = async () => {
      if (!selectedProjectId.value) return;
      loadingChat.value = true;
      try {
        const chat = await projectsService.getTeamChat(selectedProjectId.value);
        teamChat.value = chat;
        chatMessages.value = chat.messages || [];
      } catch (error) {
        console.error('Ошибка при загрузке чата:', error);
        chatMessages.value = [];
      } finally {
        loadingChat.value = false;
      }
    };

    const searchUsers = async () => {
      if (!userSearchQuery.value || userSearchQuery.value.length < 2) {
        searchResults.value = [];
        return;
      }
      searchingUsers.value = true;
      try {
        const response = await messengerService.searchUsers(userSearchQuery.value);
        const results = response.data || [];
        // Исключаем уже добавленных участников
        const memberIds = teamMembers.value.map(m => m.userId);
        searchResults.value = results.filter(u => !memberIds.includes(u.id));
      } catch (error) {
        console.error('Ошибка при поиске пользователей:', error);
        searchResults.value = [];
      } finally {
        searchingUsers.value = false;
      }
    };

    const addMember = async (userId) => {
      try {
        await projectsService.addTeamMember(selectedProjectId.value, userId);
        await loadTeamMembers();
        showAddMemberModal.value = false;
        userSearchQuery.value = '';
        searchResults.value = [];
      } catch (error) {
        console.error('Ошибка при добавлении участника:', error);
        alert(error.response?.data?.message || 'Ошибка при добавлении участника');
      }
    };

    const updateMemberRole = async (userId, newRole) => {
      try {
        await projectsService.updateTeamMemberRole(selectedProjectId.value, userId, newRole);
        await loadTeamMembers();
      } catch (error) {
        console.error('Ошибка при обновлении роли:', error);
        alert(error.response?.data?.message || 'Ошибка при обновлении роли');
      }
    };

    const removeMember = async (userId) => {
      if (!confirm('Вы уверены, что хотите исключить этого участника из команды?')) {
        return;
      }
      try {
        await projectsService.removeTeamMember(selectedProjectId.value, userId);
        await loadTeamMembers();
      } catch (error) {
        console.error('Ошибка при удалении участника:', error);
        alert(error.response?.data?.message || 'Ошибка при удалении участника');
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !teamChat.value) return;
      try {
        const response = await messengerService.sendMessage({
          chatId: teamChat.value.id,
          text: newMessage.value
        });
        newMessage.value = '';
        await loadTeamChat();
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Ошибка при отправке сообщения');
      }
    };

    const getRoleText = (role) => {
      const roles = {
        team_lead: 'Тимлид',
        admin: 'Администратор',
        member: 'Участник'
      };
      return roles[role] || role;
    };

    const getMemberName = (member) => {
      return `${member.firstName || ''} ${member.lastName || ''}`.trim() || `Пользователь ${member.userId}`;
    };

    const getUserName = (user) => {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Пользователь ${user.id}`;
    };

    const getMessageSenderName = (message) => {
      if (message.sender) {
        return `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || `Пользователь ${message.sender.id}`;
      }
      return 'Неизвестный';
    };

    const getMessageSenderAvatar = (message) => {
      if (!message || !message.sender) {
        return '/assets/images/default-avatar.svg';
      }
      
      const avatar = message.sender.profile?.avatar || message.sender.avatar;
      
      if (!avatar) {
        return '/assets/images/default-avatar.svg';
      }
      
      // Если это base64, возвращаем как есть
      if (avatar.startsWith('data:image')) {
        return avatar;
      }
      
      // Если это URL, возвращаем как есть
      if (avatar.startsWith('http')) {
        return avatar;
      }
      
      // Относительный путь
      return avatar.startsWith('/') ? avatar : `/${avatar}`;
    };

    const isOwnMessage = (message) => {
      return message.sender?.id === currentUserId.value;
    };

    const formatTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    const handleAvatarError = (event) => {
      // Устанавливаем placeholder при ошибке загрузки аватарки
      event.target.src = '/assets/images/default-avatar.svg';
    };

    const selectProject = (projectId) => {
      selectedProjectId.value = projectId;
      loadTeamData();
    };

    const getProjectImageSrc = (image) => {
      if (!image) return getPlaceholderImage();
      if (image.startsWith('data:image')) return image;
      if (image.startsWith('http')) return image;
      return image.startsWith('/') ? image : `/${image}`;
    };

    const getPlaceholderImage = () => {
      const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#e0e0e0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">Нет изображения</text>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    const handleProjectImageError = (event) => {
      event.target.src = getPlaceholderImage();
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount);
    };

    const getStageText = (stage) => {
      const stageMap = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      };
      return stageMap[stage] || stage;
    };

    const handleStartupUpdated = () => {
      showEditModal.value = false;
      loadProjectInfo();
      emit('refresh');
    };

    const getTasksByStatus = (status) => {
      return tasks.value.filter(task => task.status === status);
    };

    const getPriorityText = (priority) => {
      const priorityMap = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий'
      };
      return priorityMap[priority] || priority;
    };

    const getAssigneeName = (user) => {
      if (!user) return 'Не назначен';
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Пользователь ${user.id}`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const canManageTasks = computed(() => {
      const role = currentUserRole.value;
      return role === 'team_lead' || role === 'admin' || role === 'member';
    });

    const editTask = (task) => {
      editingTask.value = task;
      taskForm.value = {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'not_started',
        priority: task.priority || 'medium',
        assignedToId: task.assignedToId || null,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      };
    };

    const closeTaskModal = () => {
      showCreateTaskModal.value = false;
      editingTask.value = null;
      taskForm.value = {
        title: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        assignedToId: null,
        dueDate: ''
      };
    };

    const saveTask = async () => {
      if (!taskForm.value.title.trim()) {
        alert('Введите название задачи');
        return;
      }

      try {
        const taskData = {
          ...taskForm.value,
          assignedToId: taskForm.value.assignedToId || null
        };

        if (editingTask.value) {
          await projectsService.updateProjectTask(selectedProjectId.value, editingTask.value.id, taskData);
        } else {
          await projectsService.createProjectTask(selectedProjectId.value, taskData);
        }

        await loadTasks();
        closeTaskModal();
      } catch (error) {
        console.error('Ошибка при сохранении задачи:', error);
        alert(error.response?.data?.message || 'Ошибка при сохранении задачи');
      }
    };

    // Отслеживаем изменения initialProjectId из родительского компонента
    watch(() => props.initialProjectId, (newId) => {
      if (newId && selectedProjectId.value !== newId) {
        selectedProjectId.value = newId;
        loadTeamData();
      }
    }, { immediate: true });

    return {
      selectedProjectId,
      teamMembers,
      loadingTeam,
      showAddMemberModal,
      userSearchQuery,
      searchResults,
      searchingUsers,
      currentUserId,
      chatMessages,
      loadingChat,
      newMessage,
      teamChat,
      currentUserRole,
      canAddMembers,
      canChangeRole,
      canRemoveMember,
      canManageMember,
      loadTeamData,
      searchUsers,
      addMember,
      updateMemberRole,
      removeMember,
      sendMessage,
      getRoleText,
      getMemberName,
      getUserName,
      getMessageSenderName,
      getMessageSenderAvatar,
      isOwnMessage,
      formatTime,
      handleAvatarError,
      selectProject,
      currentProject,
      loadingProject,
      showEditModal,
      getProjectImageSrc,
      getPlaceholderImage,
      handleProjectImageError,
      formatCurrency,
      getStageText,
      formatDate,
      handleStartupUpdated,
      tasks,
      loadingTasks,
      showCreateTaskModal,
      editingTask,
      taskForm,
      getTasksByStatus,
      getPriorityText,
      getAssigneeName,
      canManageTasks,
      editTask,
      closeTaskModal,
      saveTask,
      loadTasks
    };
  }
};
</script>

<style scoped>
.team-management {
  padding: 1rem;
}

.project-selector {
  margin-bottom: 2rem;
}

.project-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.project-selector select {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.main-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.team-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.team-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-section {
  background: transparent;
  padding: 0;
  box-shadow: none;
  overflow: hidden;
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.team-members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.member-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.member-email {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.875rem;
}

.member-role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.member-role-badge.team_lead {
  background: #ffd700;
  color: #856404;
}

.member-role-badge.admin {
  background: #007bff;
  color: white;
}

.member-role-badge.member {
  background: #6c757d;
  color: white;
}

.member-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.role-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.message-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  flex: 1;
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.875rem;
}

.message-time {
  font-size: 0.75rem;
  color: #666;
}

.message-text {
  color: #333;
}

.chat-input-container {
  display: flex;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.add-member-form {
  min-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.user-result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.user-result-item:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-info h4 {
  margin: 0 0 0.25rem 0;
}

.user-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976D2;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.loading-container {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.project-info-section {
  margin-bottom: 2rem;
}

.project-info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.project-info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.loading-project {
  text-align: center;
  padding: 2rem;
}

.project-info-content {
  display: flex;
  flex-direction: column;
}

.project-info-main {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.project-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.project-title-section h1 {
  margin: 0;
}

.project-stage-badge {
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-image-container {
  flex-shrink: 0;
}

.project-info-image {
  width: 220px;
  height: 165px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.project-info-image:hover {
  transform: scale(1.02);
}

.project-info-details {
  flex: 1;
}

.project-info-details h1 {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  color: #333;
}

.project-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.project-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.edit-btn {
  flex-shrink: 0;
  height: fit-content;
}

.tasks-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tasks-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.task-column {
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  min-height: 400px;
}

.task-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 600;
  color: white;
}

.task-column-header.not-started {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.task-column-header.in-progress {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.task-column-header.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.task-column-header h3 {
  margin: 0;
  font-size: 1rem;
}

.task-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.task-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: 600px;
}

.task-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-card.completed {
  opacity: 0.8;
  background: #f0fdf4;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.task-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.task-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.task-priority.low {
  background: #e0f2fe;
  color: #0369a1;
}

.task-priority.medium {
  background: #fef3c7;
  color: #92400e;
}

.task-priority.high {
  background: #fee2e2;
  color: #991b1b;
}

.task-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.5rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #64748b;
}

.task-assignee,
.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.task-assignee i,
.task-due-date i {
  font-size: 0.75rem;
}

.modal-inner {
  padding: 1.5rem;
}

.modal-header h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background: #1976D2;
}

@media (max-width: 1200px) {
  .tasks-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .team-content {
    grid-template-columns: 1fr;
  }
  
  .project-info-header {
    flex-direction: column;
  }
  
  .project-info-main {
    flex-direction: column;
  }
  
  .project-info-image {
    width: 100%;
    max-width: 300px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

