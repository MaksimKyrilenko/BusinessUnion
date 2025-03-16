<template>
  <div class="project-details">
    <div class="project-header">
      <div class="header-content">
        <h1>{{ project.title }}</h1>
        <span :class="['status', project.status]">
          {{ getStatusText(project.status) }}
        </span>
      </div>
      <div class="header-actions">
        <BaseButton 
          v-if="canEdit"
          variant="secondary"
          @click="editProject"
        >
          Редактировать
        </BaseButton>
        <BaseButton 
          v-if="canInvest"
          @click="showInvestModal = true"
        >
          Инвестировать
        </BaseButton>
      </div>
    </div>

    <div class="project-content">
      <div class="main-info">
        <div v-if="project.image" class="project-image">
          <img :src="project.image" :alt="project.title">
        </div>

        <div class="project-stats">
          <div class="stat-item">
            <span class="stat-label">Требуемые инвестиции</span>
            <span class="stat-value">{{ formatMoney(project.investmentNeeded) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Собрано</span>
            <span class="stat-value">{{ formatMoney(project.investmentCollected) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ожидаемый ROI</span>
            <span class="stat-value">{{ project.expectedRoi }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Инвесторов</span>
            <span class="stat-value">{{ project.investorsCount }}</span>
          </div>
        </div>

        <div class="project-description">
          <h2>Описание проекта</h2>
          <p>{{ project.description }}</p>
        </div>

        <div class="project-features">
          <h2>Особенности проекта</h2>
          <div class="features-grid">
            <div class="feature-item" v-if="project.hasBusinessPlan">
              <span class="feature-icon">📋</span>
              <span>Есть бизнес-план</span>
            </div>
            <div class="feature-item" v-if="project.hasTeam">
              <span class="feature-icon">👥</span>
              <span>Есть команда</span>
            </div>
            <div class="feature-item" v-if="project.hasMVP">
              <span class="feature-icon">🚀</span>
              <span>Есть MVP</span>
            </div>
          </div>
        </div>
      </div>

      <div class="side-info">
        <div class="author-info">
          <h3>Автор проекта</h3>
          <div class="author-profile">
            <img :src="project.author.avatar" :alt="project.author.name" class="author-avatar">
            <div class="author-details">
              <h4>{{ project.author.name }}</h4>
              <p>{{ project.author.position }}</p>
              <p>{{ project.author.company }}</p>
            </div>
          </div>
          <BaseButton 
            variant="secondary"
            @click="contactAuthor"
          >
            Связаться с автором
          </BaseButton>
        </div>

        <div class="project-timeline">
          <h3>История проекта</h3>
          <div class="timeline">
            <div v-for="event in project.timeline" 
                 :key="event.id"
                 class="timeline-item"
            >
              <div class="timeline-date">{{ formatDate(event.date) }}</div>
              <div class="timeline-content">
                <h4>{{ event.title }}</h4>
                <p>{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="project-discussions">
      <h2>Обсуждения</h2>
      <CommentSection 
        :projectId="project.id"
        :comments="comments"
        @add-comment="addComment"
      />
    </div>

    <!-- Модальные окна -->
    <Modal v-if="showInvestModal" @close="showInvestModal = false">
      <InvestmentForm 
        :project="project"
        @submit="submitInvestment"
        @cancel="showInvestModal = false"
      />
    </Modal>

    <Modal v-if="showEditModal" @close="showEditModal = false">
      <ProjectForm 
        :project="project"
        @submit="updateProject"
        @cancel="showEditModal = false"
      />
    </Modal>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'
import InvestmentForm from '@/components/projects/InvestmentForm.vue'
import ProjectForm from '@/components/projects/ProjectForm.vue'
import CommentSection from '@/components/projects/CommentSection.vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/axios'

export default {
  name: 'ProjectDetails',
  components: {
    BaseButton,
    Modal,
    InvestmentForm,
    ProjectForm,
    CommentSection
  },
  data() {
    return {
      project: {
        title: '',
        status: '',
        description: '',
        investmentNeeded: 0,
        investmentCollected: 0,
        expectedRoi: 0,
        investorsCount: 0,
        author: {},
        timeline: []
      },
      comments: [],
      showInvestModal: false,
      showEditModal: false
    }
  },
  computed: {
    canEdit() {
      return this.project.author.id === this.currentUserId
    },
    canInvest() {
      return this.userType === 'investor' && 
             this.project.author.id !== this.currentUserId &&
             this.project.status === 'active'
    },
    currentUserId() {
      return localStorage.getItem('userId')
    },
    userType() {
      return localStorage.getItem('userType')
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    formatDate(date) {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
    },
    getStatusText(status) {
      const statuses = {
        active: 'Активный',
        pending: 'На рассмотрении',
        completed: 'Завершен'
      }
      return statuses[status] || status
    },
    async loadProjectData() {
      try {
        const projectId = this.$route.params.id
        const [projectResponse, commentsResponse] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/comments`)
        ])
        
        this.project = projectResponse.data
        this.comments = commentsResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке данных проекта:', error)
      }
    },
    editProject() {
      this.showEditModal = true
    },
    async updateProject(projectData) {
      try {
        await api.put(`/projects/${this.project.id}`, projectData)
        await this.loadProjectData()
        this.showEditModal = false
      } catch (error) {
        console.error('Ошибка при обновлении проекта:', error)
      }
    },
    async submitInvestment(investmentData) {
      try {
        await api.post(`/projects/${this.project.id}/invest`, investmentData)
        await this.loadProjectData()
        this.showInvestModal = false
      } catch (error) {
        console.error('Ошибка при инвестировании:', error)
      }
    },
    async addComment(commentData) {
      try {
        await api.post(`/projects/${this.project.id}/comments`, commentData)
        await this.loadProjectData()
      } catch (error) {
        console.error('Ошибка при добавлении комментария:', error)
      }
    },
    contactAuthor() {
      this.$router.push(`/messages/new/${this.project.author.id}`)
    }
  },
  created() {
    this.loadProjectData()
  }
}
</script>

<style scoped>
.project-details {
  padding: 20px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9em;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.project-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.project-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5em;
  font-weight: 500;
  color: #2c3e50;
}

.project-description {
  margin-bottom: 30px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 1.5em;
}

.side-info > div {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.author-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.timeline-item {
  margin-bottom: 20px;
  padding-left: 20px;
  border-left: 2px solid #28a745;
  position: relative;
}

.timeline-date {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.project-discussions {
  margin-top: 40px;
}
</style> 