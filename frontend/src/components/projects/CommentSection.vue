<template>
  <div class="comment-section">
    <div class="comment-form">
      <h3>Добавить комментарий</h3>
      <form @submit.prevent="submitComment">
        <textarea 
          v-model="newComment"
          rows="3"
          placeholder="Напишите ваш комментарий..."
          required
        ></textarea>
        <BaseButton type="submit">Отправить</BaseButton>
      </form>
    </div>

    <div class="comments-list">
      <div v-for="comment in sortedComments" 
           :key="comment.id"
           class="comment-item"
      >
        <div class="comment-header">
          <div class="comment-author">
            <img :src="comment.author.avatar" :alt="comment.author.name" class="author-avatar">
            <div class="author-info">
              <span class="author-name">{{ comment.author.name }}</span>
              <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            </div>
          </div>
          <div class="comment-actions" v-if="canManageComment(comment)">
            <button 
              class="action-button"
              @click="editComment(comment)"
            >
              ✏️
            </button>
            <button 
              class="action-button"
              @click="deleteComment(comment.id)"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="comment-content" v-if="editingCommentId !== comment.id">
          {{ comment.text }}
        </div>
        <div class="comment-edit" v-else>
          <textarea 
            v-model="editedCommentText"
            rows="3"
          ></textarea>
          <div class="edit-actions">
            <BaseButton 
              @click="updateComment(comment.id)"
              size="small"
            >
              Сохранить
            </BaseButton>
            <BaseButton 
              @click="cancelEdit"
              variant="secondary"
              size="small"
            >
              Отмена
            </BaseButton>
          </div>
        </div>

        <div class="comment-footer">
          <button 
            class="reaction-button"
            @click="toggleReaction(comment.id, 'like')"
          >
            👍 {{ comment.reactions.likes }}
          </button>
          <button 
            class="reaction-button"
            @click="toggleReaction(comment.id, 'dislike')"
          >
            👎 {{ comment.reactions.dislikes }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/axios'

export default {
  name: 'CommentSection',
  components: {
    BaseButton
  },
  props: {
    projectId: {
      type: [Number, String],
      required: true
    },
    comments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      newComment: '',
      editingCommentId: null,
      editedCommentText: ''
    }
  },
  computed: {
    sortedComments() {
      return [...this.comments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    },
    currentUserId() {
      return localStorage.getItem('userId')
    }
  },
  methods: {
    formatTime(time) {
      return format(new Date(time), 'dd MMM yyyy, HH:mm', { locale: ru })
    },
    canManageComment(comment) {
      return comment.author.id === this.currentUserId
    },
    async submitComment() {
      if (!this.newComment.trim()) return

      try {
        await api.post(`/projects/${this.projectId}/comments`, {
          text: this.newComment
        })
        this.newComment = ''
        this.$emit('add-comment')
      } catch (error) {
        console.error('Ошибка при добавлении комментария:', error)
      }
    },
    editComment(comment) {
      this.editingCommentId = comment.id
      this.editedCommentText = comment.text
    },
    async updateComment(commentId) {
      try {
        await api.put(`/projects/${this.projectId}/comments/${commentId}`, {
          text: this.editedCommentText
        })
        this.cancelEdit()
        this.$emit('add-comment')
      } catch (error) {
        console.error('Ошибка при обновлении комментария:', error)
      }
    },
    async deleteComment(commentId) {
      if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return

      try {
        await api.delete(`/projects/${this.projectId}/comments/${commentId}`)
        this.$emit('add-comment')
      } catch (error) {
        console.error('Ошибка при удалении комментария:', error)
      }
    },
    cancelEdit() {
      this.editingCommentId = null
      this.editedCommentText = ''
    },
    async toggleReaction(commentId, type) {
      try {
        await api.post(`/projects/${this.projectId}/comments/${commentId}/reactions`, {
          type
        })
        this.$emit('add-comment')
      } catch (error) {
        console.error('Ошибка при добавлении реакции:', error)
      }
    }
  }
}
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
}

.comment-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  resize: vertical;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  color: #2c3e50;
}

.comment-time {
  font-size: 0.8em;
  color: #666;
}

.comment-actions {
  display: flex;
  gap: 5px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 1.2em;
}

.comment-content {
  margin: 10px 0;
  line-height: 1.5;
}

.comment-edit {
  margin: 10px 0;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.comment-footer {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.reaction-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 15px;
  transition: background-color 0.2s;
}

.reaction-button:hover {
  background: #f8f9fa;
}
</style> 