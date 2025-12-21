<template>
  <div
    :id="'message-' + message.id"
    :class="['message', { 
      'message-own': isOwn,
      'message-replied': message.replyTo
    }]"
  >
    <!-- Avatar for other users (left side) -->
    <div v-if="!isOwn" class="message-avatar">
      <img :src="getUserAvatar(message.sender)" :alt="getUserFullName(message.sender)">
    </div>
    
    <div class="message-content">
      <!-- Превью ответа на сообщение -->
      <div v-if="message.replyTo" class="message-reply-preview" @click="$emit('scrollToReply', message.replyTo.id)">
        <div class="reply-line"></div>
        <div class="reply-content">
          <span class="reply-author">{{ getUserFullName(message.replyTo.sender) }}</span>
          <p class="reply-text">{{ truncateText(message.replyTo.text, 100) || 'Сообщение' }}</p>
        </div>
      </div>
      
      <div class="message-row">
        <div class="message-bubble">
          <div class="message-author">
            {{ getUserFullName(message.sender) }}
          </div>
          <div v-if="message.type === 'text' || !message.type" class="message-text" v-html="formatMessageText(message.text)"></div>
          <div v-else-if="message.type === 'image'" class="message-image">
            <img :src="message.fileUrl || message.url" @click="$emit('showImagePreview')">
            <div class="image-overlay">
              <button class="image-action-btn" @click.stop="$emit('downloadImage')">
                <i class="fas fa-download"></i>
              </button>
              <button class="image-action-btn" @click.stop="$emit('showImagePreview')">
                <i class="fas fa-search-plus"></i>
              </button>
            </div>
          </div>
          <div v-else-if="message.type === 'file'" class="message-file">
            <div class="file-info">
              <i class="fas" :class="getFileIcon(message.fileName || 'file.txt')"></i>
              <div class="file-details">
                <span class="file-name">{{ message.fileName }}</span>
                <span class="file-size">{{ formatFileSize(message.fileSize || message.size || 0) }}</span>
              </div>
            </div>
            <button @click="$emit('downloadFile')" class="download-btn">
              <i class="fas fa-download"></i>
            </button>
          </div>
          <!-- Метка редактирования -->
          <span v-if="message.isEdited" class="edited-label">изменено</span>
          <!-- Reactions inside bubble -->
          <div v-if="message.reactions && Object.keys(message.reactions).length > 0" class="message-reactions">
            <div 
              v-for="(users, reaction) in message.reactions" 
              :key="reaction"
              :class="['reaction-badge', { 'reaction-own': hasMyReaction(reaction) }]"
              @click="$emit('toggleReaction', reaction)"
              :title="getReactionTooltip(users)"
            >
              {{ reaction }} {{ Array.isArray(users) ? users.length : users }}
            </div>
          </div>
        </div>
        
        <span class="message-time" :title="formatFullDateTime(message.createdAt || message.timestamp)">
          {{ formatTime(message.createdAt || message.timestamp) }}
        </span>
      </div>
      
      <div class="message-actions-row">
        <div class="message-actions">
          <div class="reaction-picker-wrapper">
            <button class="action-btn" @click="toggleReactionPicker">
              <i class="far fa-smile"></i>
            </button>
            <div v-if="showReactionPicker" class="reaction-picker">
              <button 
                v-for="emoji in quickReactions" 
                :key="emoji" 
                class="reaction-emoji"
                @click="addReaction(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          <button class="action-btn" @click="$emit('reply')" title="Ответить">
            <i class="fas fa-reply"></i>
          </button>
          <button v-if="isOwn" class="action-btn" @click="$emit('edit')" title="Редактировать">
            <i class="fas fa-edit"></i>
          </button>
          <button v-if="isOwn" class="action-btn action-btn-danger" @click="$emit('delete')" title="Удалить">
            <i class="fas fa-trash"></i>
          </button>
          <button class="action-btn" @click="copyMessage" title="Копировать">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <span v-if="isOwn" class="message-status">
          <i :class="['fas', getStatusIcon(message.status)]"></i>
        </span>
      </div>
    </div>
    
    <!-- Avatar for own messages (right side) -->
    <div v-if="isOwn" class="message-avatar">
      <img :src="getUserAvatar(message.sender)" :alt="getUserFullName(message.sender)">
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { 
  formatTime, 
  formatFullDateTime, 
  formatMessageText, 
  formatFileSize,
  getFileIcon, 
  getStatusIcon, 
  getUserFullName, 
  getUserAvatar 
} from '@/utils/messageFormatters'

export default {
  name: 'MessageItem',
  props: {
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false }
  },
  emits: [
    'reply',
    'edit',
    'delete',
    'addReaction',
    'toggleReaction',
    'scrollToReply',
    'downloadFile',
    'downloadImage',
    'showImagePreview'
  ],
  setup(props, { emit }) {
    const showReactionPicker = ref(false)
    const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉']

    const toggleReactionPicker = () => {
      showReactionPicker.value = !showReactionPicker.value
    }

    const addReaction = (emoji) => {
      emit('addReaction', emoji)
      showReactionPicker.value = false
    }

    const copyMessage = () => {
      if (props.message.text) {
        navigator.clipboard.writeText(props.message.text)
          .then(() => {
            // Можно добавить toast уведомление
            console.log('Сообщение скопировано')
          })
          .catch(err => console.error('Ошибка копирования:', err))
      }
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    // Проверка, поставил ли текущий пользователь эту реакцию
    const hasMyReaction = (reaction) => {
      const myUserId = Number(localStorage.getItem('userId'))
      const users = props.message.reactions?.[reaction]
      if (Array.isArray(users)) {
        return users.includes(myUserId)
      }
      return false
    }

    // Получить tooltip для реакции
    const getReactionTooltip = (users) => {
      if (Array.isArray(users)) {
        return `${users.length} реакций`
      }
      return ''
    }

    return {
      formatTime,
      formatFullDateTime,
      formatMessageText,
      formatFileSize,
      getFileIcon,
      getStatusIcon,
      getUserFullName,
      getUserAvatar,
      showReactionPicker,
      quickReactions,
      toggleReactionPicker,
      addReaction,
      copyMessage,
      truncateText,
      hasMyReaction,
      getReactionTooltip
    }
  }
}
</script>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 75%;
  align-self: flex-start;
}

.message-own {
  align-self: flex-end;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-own .message-content {
  align-items: flex-end;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.message-own .message-row {
  flex-direction: row-reverse;
}

.message-bubble {
  background: #f1f5f9;
  padding: 12px 16px;
  border-radius: 18px;
  display: inline-block;
  max-width: 100%;
}

.message-own .message-bubble {
  background: #2196F3;
  color: #fff;
}

.message-author {
  font-size: 14px;
  font-weight: 600;
  color: #2196F3;
  margin-bottom: 4px;
}

.message-own .message-author {
  color: rgba(255, 255, 255, 0.9);
}

.message-text {
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.message-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 0 4px;
}

.message-own .message-actions-row {
  justify-content: flex-end;
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message:hover .message-actions {
  opacity: 1;
}

.message-actions .action-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.message-actions .action-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.message-status {
  font-size: 12px;
  color: #94a3b8;
}

/* Reply preview */
.message-reply-preview {
  display: flex;
  align-items: stretch;
  background: rgba(33, 150, 243, 0.08);
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
  overflow: hidden;
}

.message-reply-preview:hover {
  background: rgba(33, 150, 243, 0.15);
}

.reply-line {
  width: 3px;
  background: #2196F3;
  flex-shrink: 0;
}

.reply-content {
  padding: 8px 12px;
  min-width: 0;
  flex: 1;
}

.reply-content .reply-author {
  font-size: 13px;
  font-weight: 600;
  color: #2196F3;
  display: block;
  margin-bottom: 2px;
}

.reply-content .reply-text {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Reactions */
.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.reaction-badge {
  background: rgba(0, 0, 0, 0.06);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.message-own .reaction-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.reaction-badge:hover {
  background: rgba(0, 0, 0, 0.1);
}

.message-own .reaction-badge:hover {
  background: rgba(255, 255, 255, 0.35);
}

.reaction-badge.reaction-own {
  background: #dbeafe;
}

.message-own .reaction-badge.reaction-own {
  background: rgba(255, 255, 255, 0.35);
}

/* Links */
.message-text :deep(a.message-link) {
  color: #1976D2;
  text-decoration: underline;
  word-break: break-all;
}

.message-own .message-text :deep(a.message-link) {
  color: #fff;
}

/* Image */
.message-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.message-image img {
  max-width: 300px;
  max-height: 300px;
  display: block;
  cursor: pointer;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-image:hover .image-overlay {
  opacity: 1;
}

.image-action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* File */
.message-file {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.message-own .message-file {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.file-info i {
  font-size: 24px;
  color: #2196F3;
}

.message-own .file-info i {
  color: #fff;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.message-own .file-name {
  color: #fff;
}

.file-size {
  font-size: 11px;
  color: #94a3b8;
}

.message-own .file-size {
  color: rgba(255, 255, 255, 0.7);
}

.download-btn {
  background: #2196F3;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.message-own .download-btn {
  background: rgba(255, 255, 255, 0.2);
}

/* Edited label */
.edited-label {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
  margin-left: 8px;
}

.message-own .edited-label {
  color: rgba(255, 255, 255, 0.7);
}

/* Reaction picker */
.reaction-picker-wrapper {
  position: relative;
}

.reaction-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 6px 8px;
  display: flex;
  gap: 4px;
  z-index: 9999;
  margin-bottom: 8px;
  white-space: nowrap;
}

.message-own .reaction-picker {
  left: auto;
  right: 0;
}

.reaction-emoji {
  background: none;
  border: none;
  font-size: 20px;
  padding: 4px 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.reaction-emoji:hover {
  background: #f1f5f9;
  transform: scale(1.2);
}

/* Delete button */
.action-btn-danger:hover {
  color: #ef4444 !important;
  background: #fef2f2 !important;
}

/* Highlight animation */
:global(.highlighted-message) {
  animation: highlight 2s ease;
}

@keyframes highlight {
  0%, 100% { background: transparent; }
  50% { background: rgba(33, 150, 243, 0.2); }
}
</style>
