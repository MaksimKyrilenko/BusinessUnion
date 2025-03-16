<template>
  <div class="projects">
    <div class="projects-header">
      <h1>Проекты</h1>
      <div class="actions">
        <BaseButton @click="createProject" v-if="canCreateProject">
          Создать проект
        </BaseButton>
        <div class="filters">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск проектов..."
            class="search-input"
          >
          <select v-model="categoryFilter" class="filter-select">
            <option value="">Все категории</option>
            <option v-for="category in categories" 
                    :key="category.id" 
                    :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <select v-model="statusFilter" class="filter-select">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="pending">На рассмотрении</option>
            <option value="completed">Завершенные</option>
          </select>
        </div>
      </div>
    </div>

    <div class="projects-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @click="viewProject(project.id)"
        @edit="editProject(project.id)"
        @invest="investInProject(project.id)"
      />
    </div>

    <!-- Модальное окно создания/редактирования проекта -->
    <Modal v-if="showProjectModal" @close="closeProjectModal">
      <ProjectForm
        :project="currentProject"
        @submit="saveProject"
        @cancel="closeProjectModal"
      />
    </Modal>

    <!-- Модальное окно инвестирования -->
    <Modal v-if="showInvestModal" @close="closeInvestModal">
      <InvestmentForm
        :project="currentProject"
        @submit="submitInvestment"
        @cancel="closeInvestModal"
      />
    </Modal>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import Modal from '@/components/ui/Modal.vue'
import ProjectForm from '@/components/projects/ProjectForm.vue'
import InvestmentForm from '@/components/projects/InvestmentForm.vue'
import api from '@/axios'

export default {
  name: 'Projects',
  components: {
    BaseButton,
    ProjectCard,
    Modal,
    ProjectForm,
    InvestmentForm
  },
  data() {
    return {
      projects: [],
      categories: [],
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      showProjectModal: false,
      showInvestModal: false,
      currentProject: null,
      userType: ''
    }
  },
  computed: {
    canCreateProject() {
      return ['businessman', 'startup_founder'].includes(this.userType)
    },
    filteredProjects() {
      return this.projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            project.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.categoryFilter || project.categoryId === this.categoryFilter
        const matchesStatus = !this.statusFilter || project.status === this.statusFilter
        
        return matchesSearch && matchesCategory && matchesStatus
      })
    }
  },
  methods: {
    async loadProjects() {
      try {
        const [projectsResponse, categoriesResponse, userResponse] = await Promise.all([
          api.get('/projects'),
          api.get('/projects/categories'),
          api.get('/users/profile')
        ])
        
        this.projects = projectsResponse.data
        this.categories = categoriesResponse.data
        this.userType = userResponse.data.userType
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error)
      }
    },
    createProject() {
      this.currentProject = null
      this.showProjectModal = true
    },
    editProject(projectId) {
      this.currentProject = this.projects.find(p => p.id === projectId)
      this.showProjectModal = true
    },
    async saveProject(projectData) {
      try {
        if (projectData.id) {
          await api.put(`/projects/${projectData.id}`, projectData)
        } else {
          await api.post('/projects', projectData)
        }
        await this.loadProjects()
        this.closeProjectModal()
      } catch (error) {
        console.error('Ошибка при сохранении проекта:', error)
      }
    },
    viewProject(projectId) {
      this.$router.push(`/projects/${projectId}`)
    },
    investInProject(projectId) {
      this.currentProject = this.projects.find(p => p.id === projectId)
      this.showInvestModal = true
    },
    async submitInvestment(investmentData) {
      try {
        await api.post(`/projects/${this.currentProject.id}/invest`, investmentData)
        await this.loadProjects()
        this.closeInvestModal()
      } catch (error) {
        console.error('Ошибка при инвестировании:', error)
      }
    },
    closeProjectModal() {
      this.showProjectModal = false
      this.currentProject = null
    },
    closeInvestModal() {
      this.showInvestModal = false
      this.currentProject = null
    }
  },
  created() {
    this.loadProjects()
  }
}
</script>

<style scoped>
.projects {
  padding: 20px;
}

.projects-header {
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.filters {
  display: flex;
  gap: 15px;
}

.search-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  width: 250px;
}

.filter-select {
  min-width: 150px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style> 