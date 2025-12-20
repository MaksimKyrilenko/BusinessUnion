<template>
  <div class="message-input-container">
    <!-- Reply bar -->
    <div v-if="replyingTo" class="reply-bar">
      <div class="reply-preview">
        <div class="reply-line"></div>
        <div class="reply-content">
          <span class="reply-author">{{ getReplyAuthorName(replyingTo) }}</span>
          <p>{{ replyingTo.text || 'Сообщение' }}</p>
        </div>
        <button class="close-reply" @click="$emit('cancelReply')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="message-input">
      <div class="attach-btn-container">
        <button class="attach-btn" @click="$emit('toggleAttachMenu')">
          <i class="fas fa-paperclip"></i>
        </button>
        <div v-if="showAttachMenu" class="attach-menu" @click.stop>
          <div class="attach-options">
            <button @click="$emit('attachImage')">
              <i class="fas fa-image"></i>
              <span>Изображение</span>
            </button>
            <button @click="$emit('attachFile')">
              <i class="fas fa-file"></i>
              <span>Файл</span>
            </button>
          </div>
        </div>
      </div>
      <div class="input-wrapper">
        <textarea
          ref="inputRef"
          :value="modelValue"
          @input="handleInput"
          placeholder="Введите сообщение..."
          @keydown.enter.prevent="$emit('send')"
          rows="1"
        ></textarea>
        <div class="format-toolbar" v-if="showFormatting">
          <button @click="$emit('formatText', 'bold')" title="Жирный">B</button>
          <button @click="$emit('formatText', 'italic')" title="Курсив">I</button>
          <button @click="$emit('formatText', 'code')" title="Код">{}</button>
        </div>
        <button class="emoji-btn" @click="$emit('toggleEmojiPicker')">
          <i class="far fa-smile"></i>
        </button>
      </div>
      <button 
        class="send-btn" 
        @click.prevent.stop="$emit('send')" 
        :class="{'enabled': canSend}"
        type="button"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>

    <!-- Emoji picker -->
    <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
      <div class="emoji-picker-arrow"></div>
      <div class="emoji-categories">
        <button
          v-for="category in emojiCategories" 
          :key="category.name"
          @click="$emit('selectEmojiCategory', category)"
          :class="{'active': currentEmojiCategory === category.name}"
          :title="category.title"
        >
          {{ category.icon }}
        </button>
      </div>
      <div class="emoji-category-title">
        {{ emojiCategories.find(c => c.name === currentEmojiCategory)?.title || 'Эмодзи' }}
      </div>
      <div class="emoji-list">
        <button 
          v-for="emoji in currentCategoryEmojis" 
          :key="emoji"
          @click="$emit('insertEmoji', emoji)"
          class="emoji-btn-item"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MessageInput',
  props: {
    modelValue: { type: String, default: '' },
    replyingTo: { type: Object, default: null },
    showAttachMenu: { type: Boolean, default: false },
    showEmojiPicker: { type: Boolean, default: false },
    showFormatting: { type: Boolean, default: false },
    canSend: { type: Boolean, default: false },
    emojiCategories: { type: Array, default: () => [] },
    currentEmojiCategory: { type: String, default: 'smileys' },
    currentCategoryEmojis: { type: Array, default: () => [] }
  },
  emits: [
    'update:modelValue',
    'send',
    'cancelReply',
    'toggleAttachMenu',
    'attachImage',
    'attachFile',
    'toggleEmojiPicker',
    'selectEmojiCategory',
    'insertEmoji',
    'formatText',
    'typing'
  ],
  setup(props, { emit }) {
    const inputRef = ref(null)

    const handleInput = (event) => {
      const textarea = event.target
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
      
      emit('update:modelValue', event.target.value)
      emit('typing')
    }

    const focus = () => {
      inputRef.value?.focus()
    }

    // Получение имени автора для превью ответа
    const getReplyAuthorName = (message) => {
      if (!message) return 'Пользователь'
      
      const sender = message.sender
      if (!sender) return 'Пользователь'
      
      // Пробуем разные варианты получения имени
      if (sender.firstName || sender.lastName) {
        return [sender.firstName, sender.lastName].filter(Boolean).join(' ')
      }
      if (sender.name) return sender.name
      if (sender.profile) {
        const profileName = [sender.profile.firstName, sender.profile.lastName].filter(Boolean).join(' ')
        if (profileName) return profileName
      }
      
      return 'Пользователь'
    }

    return {
      inputRef,
      handleInput,
      focus,
      getReplyAuthorName
    }
  }
}
</script>

<style scoped>
.message-input-container {
  position: relative;
  flex-shrink: 0; /* Не сжимаем поле ввода */
  background: #fff;
}

.reply-bar {
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.reply-preview {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.reply-line {
  width: 3px;
  background: #2196F3;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
}

.reply-author {
  font-size: 12px;
  font-weight: 600;
  color: #2196F3;
  display: block;
}

.reply-content p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-reply {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-reply:hover {
  color: #ef4444;
  background: #fef2f2;
}

.message-input {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
}

.attach-btn-container {
  position: relative;
}

.attach-btn {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  color: #64748b;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.attach-btn:hover {
  background: #f1f5f9;
  color: #2196F3;
}

.attach-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  margin-bottom: 8px;
  z-index: 100;
}

.attach-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attach-options button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  color: #334155;
  font-size: 14px;
  transition: background 0.2s ease;
  white-space: nowrap;
}

.attach-options button:hover {
  background: #f1f5f9;
}

.attach-options button i {
  color: #2196F3;
  width: 20px;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  background: #f1f5f9;
  border-radius: 24px;
  padding: 4px 12px;
}

.input-wrapper textarea {
  flex: 1;
  border: none;
  background: none;
  padding: 10px 8px;
  font-size: 14px;
  resize: none;
  max-height: 120px;
  line-height: 1.4;
  color: #334155;
}

.input-wrapper textarea:focus {
  outline: none;
}

.input-wrapper textarea::placeholder {
  color: #94a3b8;
}

.format-toolbar {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-right: 1px solid #e2e8f0;
  margin-right: 8px;
}

.format-toolbar button {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.format-toolbar button:hover {
  background: #e2e8f0;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.emoji-btn:hover {
  color: #2196F3;
}

.send-btn {
  background: #e2e8f0;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn.enabled {
  background: #2196F3;
  color: #fff;
}

.send-btn.enabled:hover {
  background: #1976D2;
}

/* Emoji picker */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-height: 400px;
  margin-bottom: 8px;
  z-index: 100;
  overflow: hidden;
}

.emoji-picker-arrow {
  position: absolute;
  bottom: -8px;
  right: 30px;
  width: 16px;
  height: 16px;
  background: #fff;
  transform: rotate(45deg);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.emoji-categories {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  gap: 4px;
}

.emoji-categories button {
  flex: 1;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 18px;
  transition: background 0.2s ease;
}

.emoji-categories button:hover {
  background: #f1f5f9;
}

.emoji-categories button.active {
  background: #eff6ff;
}

.emoji-category-title {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 8px;
  max-height: 280px;
  overflow-y: auto;
}

.emoji-btn-item {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 20px;
  transition: background 0.2s ease;
}

.emoji-btn-item:hover {
  background: #f1f5f9;
}
</style>
