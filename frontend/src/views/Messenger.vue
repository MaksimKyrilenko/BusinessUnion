<template>
  <div class="messenger">
    <div class="messenger-sidebar">
      <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск чатов..."
          @input="searchChats"
        >
        </div>

      <div class="chat-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'personal' }]"
          @click="activeTab = 'personal'"
        >
          Личные
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'group' }]"
          @click="activeTab = 'group'"
        >
          Групповые
        </button>
      </div>

      <div class="chat-list">
        <div v-if="loading" class="chat-loading-indicator">
          <span>Загрузка чатов...</span>
        </div>
        <div v-else-if="filteredChats.length === 0" class="empty-chat-list">
          <div class="empty-state">
            <i class="fas fa-comments"></i>
            <p v-if="chats.length === 0">У вас пока нет чатов</p>
            <p v-else>Нет чатов в выбранной категории</p>
            <button v-if="activeTab === 'group'" class="create-group-btn" @click="showCreateGroupModal = true">
              Создать группу
            </button>
          </div>
        </div>
        <template v-else>
          <div
            v-for="chat in filteredChats"
            :key="chat.id"
            :class="['chat-item', { active: selectedChat?.id === chat.id }]"
            @click="selectChat(chat.id)"
          >
            <div class="chat-avatar">
              <img :src="chat && chat.type === 'group' ? (chat.avatar || '/assets/images/default-avatar.svg') : 
                           (chat.participants && chat.participants.length ? 
                             getUserAvatar(chat.participants.find(p => String(p.id) !== String(currentUserId.value))) : 
                             '/assets/images/default-avatar.svg')" 
                   :alt="chat.name || 'Чат'">
              <span class="status-indicator" :class="chat.status || 'offline'"></span>
            </div>
            <div class="chat-info">
              <div class="chat-header">
                <div class="chat-title">
                  <h3>{{ chat.name || 'Без названия' }}</h3>
                  <span v-if="chat.isPinned" class="pin-indicator" title="Закреплённый чат">📌</span>
                </div>
                <span class="chat-time">{{ formatTime(chat.lastMessage?.timestamp) }}</span>
              </div>
              <p class="chat-preview">
                <span v-if="chat.lastMessage?.type === 'image'" class="message-type-indicator">📷 Фото</span>
                <span v-else-if="chat.lastMessage?.type === 'file'" class="message-type-indicator">📎 Файл</span>
                <span v-else-if="chat.messages && chat.messages.length > 0">
                  {{ chat.messages[chat.messages.length - 1].text || 'Сообщение' }}
                </span>
                <span v-else>{{ chat.lastMessage?.text || 'Нет сообщений' }}</span>
              </p>
              <div class="chat-meta">
                <span v-if="chat.typing" class="typing-indicator">печатает...</span>
                <span v-if="chat.unreadCount" class="unread-badge">{{ chat.unreadCount }}</span>
              </div>
            </div>
            <div class="chat-actions-menu">
              <button class="action-btn" @click.stop="toggleChatMenu(chat)">⋮</button>
              <div v-if="chat.showMenu" class="chat-menu">
                <button @click.stop="pinChat(chat)">
                  {{ chat.isPinned ? 'Открепить' : 'Закрепить' }}
                </button>
                <button @click.stop="markAsUnread(chat)">
                  Отметить как непрочитанное
                </button>
                <button @click.stop="muteChat(chat)">
                  {{ chat.isMuted ? 'Включить уведомления' : 'Отключить уведомления' }}
                </button>
                <button v-if="chat.type === 'group'" @click.stop="leaveGroup(chat)" class="danger">
                  Покинуть группу
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="create-group" v-if="activeTab === 'group'">
        <button class="create-group-btn" @click="showCreateGroupModal = true">
          <i class="fas fa-plus"></i> Создать группу
        </button>
      </div>
    </div>

    <div class="messenger-main" v-if="selectedChat">
      <div class="main-chat-header">
        <div class="chat-info">
          <img :src="selectedChat && selectedChat.type === 'personal' && selectedChat.participants && selectedChat.participants.length ? 
                    getUserAvatar(selectedChat.participants.find(p => String(p.id) !== String(currentUserId))) : 
                    (selectedChat && selectedChat.avatar ? selectedChat.avatar : '/assets/images/default-avatar.svg')" 
                :alt="selectedChat ? selectedChat.name : 'Чат'">
          <div>
            <h2>{{ selectedChat && selectedChat.type === 'personal' && selectedChat.participants && selectedChat.participants.length ? 
                  getUserFullName(selectedChat.participants.find(p => String(p.id) !== String(currentUserId))) : 
                  (selectedChat ? selectedChat.name : 'Чат') }}</h2>
            <span class="status">{{ selectedChat && selectedChat.status === 'online' ? 'В сети' : 'Не в сети' }}</span>
          </div>
        </div>
        <div class="chat-actions">
          <button v-if="selectedChat && selectedChat.type === 'group'" @click="showGroupInfoModal = true">
            <i class="fas fa-info-circle"></i>
          </button>
          <button @click="showChatSettings = true">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div class="date-separator" v-for="(group, date) in groupedMessages" :key="date">
          <span class="date-label">{{ formatDate(date) }}</span>
          <div
            v-for="message in group" 
            :key="message.id"
            :id="'message-' + message.id"
            :class="['message', { 
              'message-own': isOwnMessage(message),
              'message-replied': message.replyTo
            }]"
          >
            <div v-if="!isOwnMessage(message)" class="message-avatar">
              <img :src="getUserAvatar(message.sender)" :alt="getUserFullName(message.sender)">
            </div>
            <div class="message-content">
              <div v-if="message.replyTo" class="message-reply-preview" @click="scrollToMessage(message.replyTo.id)">
                <div class="reply-content">
                  <span class="reply-author">{{ getUserFullName(message.replyTo.sender) }}</span>
                  <p>{{ message.replyTo.text || '' }}</p>
                </div>
              </div>
              <div class="message-bubble">
                <div v-if="!isOwnMessage(message)" class="message-author">
                  {{ getUserFullName(message.sender) }}
                </div>
                <div v-if="message.type === 'text'" class="message-text" v-html="formatMessageText(message.text)"></div>
                <div v-else-if="message.type === 'image'" class="message-image">
                  <img :src="message.url" @click="showImagePreview(message)">
                </div>
                <div v-else-if="message.type === 'file'" class="message-file">
                  <div class="file-info">
                    <i class="fas fa-file"></i>
                    <div class="file-details">
                      <span class="file-name">{{ message.fileName }}</span>
                      <span class="file-size">{{ formatFileSize(message.size) }}</span>
                    </div>
                  </div>
                  <button @click="downloadFile(message)" class="download-btn">
                    <i class="fas fa-download"></i>
                  </button>
                </div>
              </div>
              <div class="message-meta">
                <span class="message-time" :title="formatFullDateTime(message.createdAt || message.timestamp)">
                  {{ formatTime(message.createdAt || message.timestamp) }}
                </span>
                <div class="message-actions">
                  <button class="action-btn" @click="showReactions(message)">
                    <i class="far fa-smile"></i>
                  </button>
                  <button class="action-btn" @click="replyToMessage(message)">
                    <i class="fas fa-reply"></i>
                  </button>
                  <button v-if="isOwnMessage(message)" class="action-btn" @click="editMessage(message)">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
                <div v-if="message.reactions" class="message-reactions">
                  <div 
                    v-for="(count, reaction) in message.reactions" 
                    :key="reaction"
                    class="reaction-badge"
                    @click="toggleReaction(message, reaction)"
                  >
                    {{ reaction }} {{ count }}
                  </div>
                </div>
                <span v-if="isOwnMessage(message)" class="message-status">
                  <i :class="['fas', getStatusIcon(message.status)]"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="replyingTo" class="reply-bar">
        <div class="reply-preview">
          <div class="reply-content">
            <span class="reply-author">{{ replyingTo.sender && replyingTo.sender.name ? replyingTo.sender.name : 'Пользователь' }}</span>
            <p>{{ replyingTo.text || '' }}</p>
          </div>
          <button class="close-reply" @click="cancelReply">×</button>
        </div>
      </div>

      <div class="message-input">
        <button class="attach-btn" @click="showAttachMenu = true">
          <i class="fas fa-paperclip"></i>
        </button>
        <div class="input-wrapper">
          <textarea
            v-model="newMessage"
            placeholder="Введите сообщение..."
            @keydown.enter.prevent="sendMessage"
            @input="handleInput"
            rows="1"
            ref="messageInput"
          ></textarea>
          <div class="format-toolbar" v-if="showFormatting">
            <button @click="formatText('bold')" title="Жирный">B</button>
            <button @click="formatText('italic')" title="Курсив">I</button>
            <button @click="formatText('code')" title="Код">{}</button>
          </div>
          <button class="emoji-btn" @click="showEmojiPicker = true">
            <i class="far fa-smile"></i>
          </button>
        </div>
        <button class="send-btn" @click="sendMessage" :disabled="!canSendMessage">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>

      <div v-if="showAttachMenu" class="attach-menu">
        <div class="attach-options">
          <button @click="attachImage">
            <i class="fas fa-image"></i>
            <span>Изображение</span>
          </button>
          <button @click="attachFile">
            <i class="fas fa-file"></i>
            <span>Файл</span>
          </button>
        </div>
      </div>

      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-categories">
          <button
            v-for="category in emojiCategories" 
            :key="category.name"
            @click="selectEmojiCategory(category)"
          >
            {{ category.icon }}
          </button>
        </div>
        <div class="emoji-list">
          <button 
            v-for="emoji in currentCategoryEmojis" 
            :key="emoji"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>

    <div class="messenger-placeholder" v-else>
      <div class="placeholder-content">
        <i class="fas fa-comments"></i>
        <h2>Выберите чат для начала общения</h2>
      </div>
    </div>

    <!-- Модальные окна -->
    <modal v-if="showCreateGroupModal" @close="showCreateGroupModal = false">
      <div class="create-group-modal">
        <div class="modal-header">
          <h3>Создание группы</h3>
        </div>
        <form @submit.prevent="createGroup" class="create-group-form">
          <div class="form-group">
            <label>Название группы</label>
            <div class="input-wrapper">
              <i class="fas fa-users"></i>
              <input 
                v-model="newGroup.name" 
                type="text" 
                placeholder="Введите название группы"
                required
              >
            </div>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <div class="input-wrapper">
              <i class="fas fa-info-circle"></i>
              <textarea 
                v-model="newGroup.description"
                placeholder="Добавьте описание группы"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="form-group">
            <label>Участники</label>
            <div class="selected-users-container">
              <div class="selected-users" v-if="newGroup.users.length">
                <div v-for="user in newGroup.users" :key="user.id" class="selected-user">
                  <img :src="getUserAvatar(user)" :alt="getUserName(user)">
                  <span>{{ getUserName(user) }}</span>
                  <button @click="removeUser(user)" class="remove-user">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div v-else class="no-users-selected">
                <i class="fas fa-users"></i>
                Выберите участников группы
              </div>
            </div>
            <div class="search-users-container">
              <div class="input-wrapper">
                <i class="fas fa-search"></i>
                <input 
                  type="text" 
                  v-model="userSearch" 
                  @input="searchUsers" 
                  placeholder="Поиск пользователей..."
                >
              </div>
              <div v-if="searchResults.length" class="search-results">
                <div 
                  v-for="user in searchResults" 
                  :key="user.id"
                  class="search-result"
                  @click="addUser(user)"
                >
                  <img :src="getUserAvatar(user)" :alt="getUserName(user)">
                  <div class="user-info">
                    <span class="user-name">{{ getUserName(user) }}</span>
                    <span class="user-role">{{ user && user.role ? user.role : '' }}</span>
                  </div>
                  <button class="add-user">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div v-else-if="userSearch && !searchResults.length" class="no-results">
                <i class="fas fa-search"></i>
                Пользователи не найдены
              </div>
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateGroupModal = false">
            <i class="fas fa-times"></i>
            Отмена
          </button>
          <button 
            class="btn-primary create-btn" 
            @click="createGroup"
            :disabled="!newGroup.name || newGroup.users.length < 2"
          >
            <i class="fas fa-check"></i>
            Создать
          </button>
        </div>
      </div>
    </modal>

    <!-- Модальное окно информации о группе -->
    <modal v-if="showGroupInfoModal" @close="showGroupInfoModal = false">
      <div class="group-info-modal">
        <div class="modal-header">
          <h3>Информация о группе</h3>
        </div>
        <div class="group-info-content">
          <div class="group-header">
            <div class="group-avatar">
              <img :src="selectedChat && selectedChat.avatar ? selectedChat.avatar : '/assets/images/default-avatar.svg'" alt="Аватар группы">
            </div>
            <div class="group-details">
              <h2>{{ selectedChat ? selectedChat.name : 'Название группы' }}</h2>
              <p>{{ selectedChat ? selectedChat.description || 'Нет описания' : 'Описание группы' }}</p>
              <p class="members-count">{{ groupMembers && groupMembers.length > 0 ? `${groupMembers.length} участников` : 'Загрузка участников...' }}</p>
            </div>
          </div>
          
          <div class="group-members">
            <h4>Участники группы</h4>
            <div v-if="groupMembers && groupMembers.length > 0" class="members-list">
              <div v-for="member in groupMembers" :key="member.id" class="member-item">
                <div class="member-avatar">
                  <img :src="getUserAvatar(member)" :alt="getUserFullName(member)">
                  <span class="online-status" :class="{ online: member.isOnline }"></span>
                </div>
                <div class="member-info">
                  <div class="member-name">{{ getUserFullName(member) }}</div>
                  <div class="member-role">{{ getMemberRoleText(member.role) }}</div>
                </div>
                <div class="member-actions" v-if="isCurrentUserAdmin && !isMemberOwner(member)">
                  <button @click="removeMember(member)" title="Удалить из группы">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="no-members">
              <p>Участники не найдены</p>
            </div>
          </div>

          <div class="group-actions">
            <button v-if="isCurrentUserAdmin" class="btn-primary" @click="showAddMembersModal = true">
              <i class="fas fa-user-plus"></i> Добавить участников
            </button>
            <button class="btn-danger" @click="leaveGroup(selectedChat)">
              <i class="fas fa-sign-out-alt"></i> Покинуть группу
            </button>
          </div>
        </div>
      </div>
    </modal>

    <!-- Модальное окно редактирования сообщения -->
    <modal v-if="showEditMessageModal" @close="cancelEditMessage">
      <div class="edit-message-modal">
        <div class="modal-header">
          <h3>Редактирование сообщения</h3>
        </div>
        <div class="edit-message-content">
          <textarea
            v-model="editedMessageText"
            placeholder="Введите новый текст сообщения"
            rows="4"
            class="edit-message-textarea"
            autofocus
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelEditMessage">Отмена</button>
          <button class="btn-primary" @click="saveEditedMessage" :disabled="!editedMessageText.trim()">Сохранить</button>
        </div>
      </div>
    </modal>

    <!-- Модальное окно пересылки сообщения -->
    <modal v-if="showForwardMessageModal" @close="cancelForwardMessage">
      <div class="forward-message-modal">
        <div class="modal-header">
          <h3>Переслать сообщение</h3>
        </div>
        <div class="forward-message-content">
          <div class="forward-message-preview">
            <h4>Сообщение для пересылки:</h4>
            <div class="message-preview">
              <div class="sender">{{ forwardingMessage?.sender ? getUserFullName(forwardingMessage.sender) : 'Пользователь' }}:</div>
              <div class="text">{{ forwardingMessage?.text }}</div>
            </div>
          </div>
          
          <div class="select-chat">
            <h4>Выберите чат:</h4>
            <div class="chats-list">
              <div
                v-for="chat in chats"
                :key="chat.id"
                class="chat-select-item"
                @click="selectChatForForward(chat)"
                :class="{ active: selectedForwardChatId === chat.id }"
              >
                <div class="chat-avatar">
                  <img v-if="chat.type === 'personal' && chat.participants && chat.participants.length" 
                      :src="getUserAvatar(chat.participants.find(p => p.id !== currentUserId))" 
                      :alt="getUserFullName(chat.participants.find(p => p.id !== currentUserId))">
                  <img v-else :src="chat.avatar || '/default-avatar.png'" :alt="chat.name">
                  <span class="status-dot" :class="{ online: chat.status === 'online' }"></span>
                </div>
                <div class="chat-name">
                  <span>{{ chat.type === 'personal' && chat.participants && chat.participants.length ? 
                         getUserFullName(chat.participants.find(p => p.id !== currentUserId)) : chat.name }}</span>
                  <span v-if="chat.isPinned" class="pinned-icon"><i class="fas fa-thumbtack"></i></span>
                </div>
                <div class="chat-meta">
                  <span v-if="chat.typing" class="typing-indicator">печатает...</span>
                  <span v-if="chat.unreadCount" class="unread-badge">{{ chat.unreadCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelForwardMessage">Отмена</button>
          <button class="btn-primary" @click="confirmForwardMessage" :disabled="!selectedForwardChatId">Переслать</button>
        </div>
      </div>
    </modal>

    <!-- Модальное окно для загрузки файлов -->
    <modal v-if="showFileUploadModal" @close="cancelFileUpload">
      <div class="file-upload-modal">
        <div class="modal-header">
          <h3>{{ isImageUpload ? 'Загрузка изображения' : 'Загрузка файла' }}</h3>
        </div>
        <div class="file-upload-content">
          <div class="file-drop-zone" 
               @dragover.prevent="dragOver = true" 
               @dragleave.prevent="dragOver = false" 
               @drop.prevent="handleFileDrop"
               :class="{ active: dragOver }">
            <div v-if="!selectedFile">
              <i class="fas" :class="isImageUpload ? 'fa-image' : 'fa-file'"></i>
              <p>Перетащите {{ isImageUpload ? 'изображение' : 'файл' }} сюда или нажмите для выбора</p>
              <input type="file" ref="fileInput" @change="handleFileSelect" :accept="isImageUpload ? 'image/*' : '*'" style="display: none;">
              <button class="select-file-btn" @click="$refs.fileInput.click()">Выбрать {{ isImageUpload ? 'изображение' : 'файл' }}</button>
            </div>
            <div v-else class="selected-file-preview">
              <div v-if="isImageUpload && filePreviewUrl" class="image-preview">
                <img :src="filePreviewUrl" alt="Предпросмотр">
              </div>
              <div v-else class="file-info">
                <i class="fas fa-file"></i>
                <span>{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <button class="remove-file-btn" @click="removeSelectedFile">
                <i class="fas fa-times"></i> Удалить
              </button>
            </div>
          </div>
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
            <div class="progress-text">{{ uploadProgress }}%</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelFileUpload">Отмена</button>
          <button 
            class="btn-primary" 
            @click="uploadSelectedFile" 
            :disabled="!selectedFile || uploadInProgress"
          >
            {{ uploadInProgress ? 'Загрузка...' : 'Отправить' }}
          </button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import Modal from '@/components/ui/Modal.vue'
import messengerService from '@/services/messenger.service'

export default {
  name: 'Messenger',
  components: {
    Modal
  },
  setup() {
    const userStore = useUserStore()
    const currentUserId = ref(userStore.userId)
    
    const activeTab = ref('personal')
    const searchQuery = ref('')
    const chats = ref([])
    const selectedChat = ref(null)
    const newMessage = ref('')
    const showCreateGroupModal = ref(false)
    const showAttachMenu = ref(false)
    const showEmojiPicker = ref(false)
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    const isTyping = ref(false)
    const attachments = ref([])
    const loading = ref(false)
    const chatLoading = ref(false)
    
    // Новые переменные состояния для дополнительных функций
    const showGroupInfoModal = ref(false)
    const showEditMessageModal = ref(false)
    const showForwardMessageModal = ref(false)
    const showFileUploadModal = ref(false)
    const showAddMembersModal = ref(false)
    
    const groupMembers = ref([])
    const editingMessage = ref(null)
    const editedMessageText = ref('')
    const forwardingMessage = ref(null)
    const selectedForwardChatId = ref(null)
    
    // Переменные для загрузки файлов
    const selectedFile = ref(null)
    const filePreviewUrl = ref('')
    const uploadProgress = ref(0)
    const uploadInProgress = ref(false)
    const isImageUpload = ref(false)
    const dragOver = ref(false)
    const fileInput = ref(null)
    
    const newGroup = ref({
      name: '',
      description: '',
      users: []
    })
    
    const userSearch = ref('')
    const searchResults = ref([])

    const replyingTo = ref(null)
    const showFormatting = ref(false)
    const emojiCategories = ref([
      { name: 'smileys', icon: '😊' },
      { name: 'gestures', icon: '👋' },
      { name: 'objects', icon: '💡' },
      { name: 'symbols', icon: '❤️' },
      { name: 'nature', icon: '🌿' },
      { name: 'food', icon: '🍔' },
      { name: 'travel', icon: '✈️' },
      { name: 'flags', icon: '🏳️' }
    ])
    const currentEmojiCategory = ref('smileys')
    const currentCategoryEmojis = computed(() => {
      // Расширенный список эмодзи по категориям
      const emojis = {
        smileys: ['😊', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😇', '😉', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥴'],
        gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💅', '🤝', '👂', '👃', '🧠', '🦴', '🦷', '👀', '👁️', '👅', '👄', '💋', '🩸'],
        objects: ['💡', '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '🔋', '🔌', '📦', '📝', '📊', '📈', '📉', '📆', '📅', '📇', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗑️', '🔒', '🔓', '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🪃', '🏹', '🛡️', '🪚', '🔧', '🪛', '🔩', '⚙️', '🗜️', '⚖️', '🦯'],
        symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
        nature: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌾', '🌺', '🌻', '🌼', '🌷', '🌹', '🌸', '💐', '🏵️', '🌱', '🎋', '🎍', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄'],
        food: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊'],
        travel: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢'],
        flags: ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇷', '🇦🇺', '🇦🇹', '🇧🇪', '🇧🇷', '🇨🇦', '🇨🇳', '🇨🇿', '🇩🇰', '🇫🇮', '🇫🇷', '🇩🇪', '🇬🇷', '🇭🇺', '🇮🇳', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇹', '🇯🇵', '🇰🇷', '🇲🇽', '🇳🇱', '🇳🇿', '🇳🇴', '🇵🇱', '🇵🇹', '🇷🇺', '🇸🇦', '🇸🇬', '🇿🇦', '🇪🇸', '🇸🇪', '🇨🇭', '🇹🇷', '🇺🇦', '🇦🇪', '🇬🇧', '🇺🇸']
      }
      return emojis[currentEmojiCategory.value] || []
    })

    // Вычисляемые свойства для работы с информацией о группе
    const isCurrentUserAdmin = computed(() => {
      if (!selectedChat.value || selectedChat.value.type !== 'group') return false;
      
      const currentUserMember = groupMembers.value.find(member => 
        member.id === currentUserId.value
      );
      
      return currentUserMember && 
             (currentUserMember.role === 'admin' || currentUserMember.role === 'owner');
    });
    
    const isCurrentUserOwner = computed(() => {
      if (!selectedChat.value || selectedChat.value.type !== 'group') return false;
      
      const currentUserMember = groupMembers.value.find(member => 
        member.id === currentUserId.value
      );
      
      return currentUserMember && currentUserMember.role === 'owner';
    });
    
    // Когда выбран чат, загружаем информацию о его участниках
    watch(selectedChat, async (newChat) => {
      if (newChat && newChat.type === 'group') {
        try {
          const response = await messengerService.getChatMembers(newChat.id);
          groupMembers.value = response.data || [];
        } catch (error) {
          console.error('Ошибка при загрузке участников группы:', error);
          groupMembers.value = [];
        }
      }
    });

    const filteredChats = computed(() => {
      return chats.value
        .filter(chat => 
          (activeTab.value === 'personal' ? chat.type === 'personal' : chat.type === 'group') &&
          chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .sort((a, b) => {
          // Сначала закрепленные чаты
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          
          // Затем по времени последнего сообщения
          const timeA = getLastMessageTime(a)
          const timeB = getLastMessageTime(b)
          return timeB - timeA
        })
    })

    // Функция для получения полного имени пользователя
    const getUserFullName = (user) => {
      if (!user) {
        console.warn('Пустой объект пользователя при получении имени');
        return 'Пользователь';
      }
      
      console.log('Получение полного имени для пользователя:', user);
      
      // Проверяем данные о пользователе в консоли
      console.log('Структура объекта пользователя:', Object.keys(user).join(', '));
      
      // Если есть senderId вместо user.id, преобразуем данные в стандартный формат
      if (user.senderId && !user.id) {
        console.log(`Преобразование данных: senderId ${user.senderId} в id`);
        user = { ...user, id: user.senderId };
      }
      
      // Проверяем firstName и lastName напрямую
      if (user.firstName || user.lastName) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        if (fullName) {
          console.log(`Собрано полное имя из firstName и lastName: ${fullName}`);
          return fullName;
        }
      }
      
      // Проверяем наличие имени в user.name
      if (user.name) {
        console.log(`Найдено имя в свойстве name: ${user.name}`);
        return user.name;
      }
      
      // Проверяем данные из профиля
      if (user.profile) {
        console.log('Найден профиль пользователя:', user.profile);
        const profileName = [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ');
        if (profileName) {
          console.log(`Использование имени из профиля: ${profileName}`);
          return profileName;
        }
      }
      
      // Проверяем наличие email как запасной вариант
      if (user.email) {
        console.log(`Использование email вместо имени: ${user.email}`);
        return user.email.split('@')[0]; // Берем часть до @
      }
      
      // В крайнем случае возвращаем ID с явным указанием
      const userId = user.id || user.senderId || 'неизвестен';
      console.log(`Не найдено имени, используем ID: ${userId}`);
      return `Пользователь ${userId}`;
    }
    
    // Функция получения текстового представления роли
    const getMemberRoleText = (role) => {
      switch(role) {
        case 'owner': return 'Создатель';
        case 'admin': return 'Администратор';
        case 'member': return 'Участник';
        default: return 'Участник';
      }
    }
    
    // Проверяет, является ли участник создателем группы
    const isMemberOwner = (member) => {
      return member.role === 'owner';
    }
    
    // Редактирование сообщений
    const editMessage = (message) => {
      editingMessage.value = message;
      editedMessageText.value = message.text;
      showEditMessageModal.value = true;
    }
    
    const cancelEditMessage = () => {
      editingMessage.value = null;
      editedMessageText.value = '';
      showEditMessageModal.value = false;
    }
    
    const saveEditedMessage = async () => {
      if (!editingMessage.value || !editedMessageText.value.trim()) return;
      
      try {
        await messengerService.editMessage(editingMessage.value.id, editedMessageText.value.trim());
        
        // Обновляем сообщение в локальном массиве
        if (selectedChat.value && selectedChat.value.messages) {
          const messageIndex = selectedChat.value.messages.findIndex(
            msg => msg.id === editingMessage.value.id
          );
          
          if (messageIndex !== -1) {
            selectedChat.value.messages[messageIndex].text = editedMessageText.value.trim();
            selectedChat.value.messages[messageIndex].isEdited = true;
          }
        }
        
        cancelEditMessage();
      } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
      }
    }
    
    // Пересылка сообщений
    const forwardMessage = (message) => {
      forwardingMessage.value = message;
      selectedForwardChatId.value = null;
      showForwardMessageModal.value = true;
    }
    
    const selectChatForForward = (chat) => {
      selectedForwardChatId.value = chat.id;
    }
    
    const cancelForwardMessage = () => {
      forwardingMessage.value = null;
      selectedForwardChatId.value = null;
      showForwardMessageModal.value = false;
    }
    
    const confirmForwardMessage = async () => {
      if (!forwardingMessage.value || !selectedForwardChatId.value) return;
      
      try {
        await messengerService.forwardMessage(
          forwardingMessage.value.id, 
          selectedForwardChatId.value
        );
        
        cancelForwardMessage();
        
        // Если переслали в текущий чат, обновим его
        if (selectedChat.value && selectedChat.value.id === selectedForwardChatId.value) {
          await loadMessages(selectedChat.value.id);
        }
      } catch (error) {
        console.error('Ошибка при пересылке сообщения:', error);
      }
    }
    
    // Управление загрузкой файлов
    const showFileUploader = (isImage = false) => {
      isImageUpload.value = isImage;
      showFileUploadModal.value = true;
      showAttachMenu.value = false;
    }
    
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      selectedFile.value = file;
      
      // Создаем URL для предпросмотра, если это изображение
      if (isImageUpload.value && file.type.startsWith('image/')) {
        filePreviewUrl.value = URL.createObjectURL(file);
      } else {
        filePreviewUrl.value = '';
      }
    }
    
    const handleFileDrop = (event) => {
      dragOver.value = false;
      
      const file = event.dataTransfer.files[0];
      if (!file) return;
      
      // Проверяем, соответствует ли тип файла ожидаемому
      if (isImageUpload.value && !file.type.startsWith('image/')) {
        alert('Пожалуйста, загрузите изображение');
        return;
      }
      
      selectedFile.value = file;
      
      // Создаем URL для предпросмотра, если это изображение
      if (isImageUpload.value && file.type.startsWith('image/')) {
        filePreviewUrl.value = URL.createObjectURL(file);
      } else {
        filePreviewUrl.value = '';
      }
    }
    
    const removeSelectedFile = () => {
      if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value);
      }
      
      selectedFile.value = null;
      filePreviewUrl.value = '';
    }
    
    const formatFileSize = (bytes) => {
      if (!bytes) return '0 Байт';
      
      const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      
      return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    const uploadSelectedFile = async () => {
      if (!selectedFile.value || !selectedChat.value) return;
      
      try {
        uploadInProgress.value = true;
        
        // Используем соответствующий метод загрузки
        const uploadMethod = isImageUpload.value 
          ? messengerService.uploadImage
          : messengerService.uploadFile;
        
        const response = await uploadMethod(selectedFile.value, (progress) => {
          uploadProgress.value = progress;
        });
        
        // Получаем URL загруженного файла
        const fileUrl = response.data.url;
        
        // Отправляем сообщение с файлом
        const messageData = {
          chatId: selectedChat.value.id,
          text: isImageUpload.value ? 'Изображение' : selectedFile.value.name,
          type: isImageUpload.value ? 'image' : 'file',
          fileUrl: fileUrl,
          fileName: selectedFile.value.name,
          fileSize: selectedFile.value.size
        };
        
        await messengerService.sendMessage(messageData);
        
        // Закрываем модальное окно и сбрасываем состояние
        cancelFileUpload();
        
        // Обновляем сообщения в чате
        await loadMessages(selectedChat.value.id);
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
      } finally {
        uploadInProgress.value = false;
        uploadProgress.value = 0;
      }
    }
    
    const cancelFileUpload = () => {
      if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value);
      }
      
      selectedFile.value = null;
      filePreviewUrl.value = '';
      uploadProgress.value = 0;
      showFileUploadModal.value = false;
    }
    
    // Вспомогательные методы для работы с группами
    const showGroupInfo = async () => {
      if (!selectedChat.value || selectedChat.value.type !== 'group') {
        console.warn('Попытка показать информацию о группе, но выбранный чат не является группой');
        return;
      }
      
      console.log(`Показ информации о группе ${selectedChat.value.id}: ${selectedChat.value.name}`);
      
      // Загружаем участников группы перед показом модального окна
      await loadGroupMembers(selectedChat.value.id);
      
      // Показываем модальное окно
      showGroupInfoModal.value = true;
    }
    
    const removeMember = async (member) => {
      if (!isCurrentUserAdmin.value || isMemberOwner(member)) return;
      
      try {
        await messengerService.removeUserFromChat(selectedChat.value.id, member.id);
        
        // Обновляем локальный список участников
        groupMembers.value = groupMembers.value.filter(m => m.id !== member.id);
      } catch (error) {
        console.error(`Ошибка при удалении пользователя ${member.id} из группы:`, error);
      }
    }
    
    const deleteGroup = async () => {
      if (!isCurrentUserOwner.value) return;
      
      if (!confirm('Вы уверены, что хотите удалить эту группу? Это действие нельзя отменить.')) {
        return;
      }
      
      try {
        await messengerService.deleteChat(selectedChat.value.id);
        
        // Удаляем чат из локального списка
        chats.value = chats.value.filter(chat => chat.id !== selectedChat.value.id);
        selectedChat.value = null;
        showGroupInfoModal.value = false;
      } catch (error) {
        console.error('Ошибка при удалении группы:', error);
      }
    }

    // Дополняем существующие методы для поддержки новой функциональности
    const attachImage = () => {
      showFileUploader(true);
    }
    
    const attachFile = () => {
      showFileUploader(false);
    }

    const loadChats = async () => {
      try {
        // Устанавливаем ID текущего пользователя из localStorage
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          console.log(`Установка ID текущего пользователя из localStorage: ${storedUserId}`);
          currentUserId.value = storedUserId;
        } else {
          console.warn('ID пользователя не найден в localStorage');
        }
        
        loading.value = true;
        const response = await messengerService.getChats();
        chats.value = response.data || [];
        
        // Если есть чаты, выберем первый непрочитанный или первый в списке
        if (chats.value.length > 0) {
          const unreadChat = chats.value.find(chat => chat.unreadCount > 0);
          if (unreadChat) {
            selectChat(unreadChat.id);
          } else {
            selectChat(chats.value[0].id);
          }
        } else {
          // Если чатов нет, сбросим выбранный чат
          selectedChat.value = null;
        }
      } catch (error) {
        console.error('Ошибка при загрузке чатов:', error);
        chats.value = [];
      } finally {
        loading.value = false;
      }
    }

    const selectChat = async (chatId) => {
      if (selectedChat.value?.id === chatId) return;
      
      try {
        console.log(`Выбор чата: ${chatId}`);
        selectedChat.value = chats.value.find(chat => chat.id === chatId);
        
        // Загружаем актуальные данные чата
        const response = await messengerService.getChat(chatId);
        if (response.data) {
          console.log('Получены данные чата:', response.data);
          
          // Обновим выбранный чат полученными данными
          const chatIndex = chats.value.findIndex(c => c.id === chatId);
          if (chatIndex !== -1) {
            chats.value[chatIndex] = response.data;
            selectedChat.value = response.data;
          } else {
            selectedChat.value = response.data;
          }
        }
        
        // Отдельно загружаем сообщения для чата
        await loadMessages(chatId);
        
        // Если выбранный чат является группой, загружаем информацию о ее участниках
        if (selectedChat.value && selectedChat.value.type === 'group') {
          loadGroupMembers(chatId);
        }
        
        // Если в чате есть непрочитанные сообщения, отметим их как прочитанные
        if (selectedChat.value?.unreadCount > 0) {
          try {
            await messengerService.markChatAsRead(chatId);
            // Обновим счетчик непрочитанных сообщений
            const chatIndex = chats.value.findIndex(c => c.id === chatId);
            if (chatIndex !== -1) {
              chats.value[chatIndex].unreadCount = 0;
            }
            if (selectedChat.value) {
              selectedChat.value.unreadCount = 0;
            }
          } catch (error) {
            console.error('Ошибка при отметке чата как прочитанного:', error);
          }
        }
        
        // Обновляем последнее сообщение в чате для корректного отображения в списке
        updateLastMessage(chatId);
        
      } catch (error) {
        console.error(`Ошибка при выборе чата ${chatId}:`, error);
      }
    }

    // Обновление последнего сообщения в списке чатов
    const updateLastMessage = (chatId) => {
      const chatIndex = chats.value.findIndex(c => c.id === chatId);
      if (chatIndex !== -1 && selectedChat.value && selectedChat.value.messages && selectedChat.value.messages.length > 0) {
        const lastMessage = selectedChat.value.messages[selectedChat.value.messages.length - 1];
        chats.value[chatIndex].lastMessage = lastMessage;
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim()) {
        console.log('Пустое сообщение, прерываем отправку');
        return;
      }

      if (!selectedChat.value) {
        console.error('Не выбран чат для отправки сообщения');
        // Можно добавить уведомление для пользователя
        return;
      }

      try {
        console.log(`Отправка сообщения в чат ${selectedChat.value.id}: "${newMessage.value}"`);
        
        // Получаем ID пользователя из localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('ID пользователя не найден в localStorage');
          // Можно добавить перенаправление на страницу входа
          return;
        }
        
        // Проверяем наличие ID чата
        if (!selectedChat.value.id) {
          console.error('ID чата отсутствует или некорректен:', selectedChat.value);
          return;
        }
        
        // Подготавливаем данные сообщения
        const messageData = {
          chatId: Number(selectedChat.value.id),
          text: newMessage.value.trim(),
          type: 'text'
        };
        
        // Если есть ID сообщения для ответа, добавляем его
        if (replyingTo.value) {
          messageData.replyToId = replyingTo.value.id;
        }
        
        // Добавляем сообщение в локальный массив сообщений для быстрого отображения
        const tempMessage = {
          id: `temp-${Date.now()}`,
          text: newMessage.value.trim(),
          senderId: Number(userId),
          chatId: Number(selectedChat.value.id),
          status: 'sending',
          createdAt: new Date().toISOString(),
          sender: {
            id: Number(userId),
            firstName: 'Вы',
            lastName: ''
          }
        };
        
        // Добавляем временное сообщение в список
        selectedChat.value.messages.push(tempMessage);
        
        // Отправляем реальное сообщение на сервер
        const response = await messengerService.sendMessage(messageData);
        console.log('Ответ от сервера при отправке сообщения:', response);
        
        // Заменяем временное сообщение на реальное, если получен ответ
        if (response && response.data) {
          const index = selectedChat.value.messages.findIndex(msg => msg.id === tempMessage.id);
          if (index !== -1) {
            selectedChat.value.messages[index] = response.data;
          } else {
            // Если временное сообщение не найдено, добавляем реальное в конец списка
            selectedChat.value.messages.push(response.data);
          }
        }
        
        // Очищаем поле ввода
        newMessage.value = '';
        replyingTo.value = null;
        
        // Прокручиваем к последнему сообщению
        scrollToBottom();
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        
        // Помечаем временное сообщение как не отправленное
        const tempMessage = selectedChat.value.messages.find(msg => msg.id.toString().startsWith('temp-'));
        if (tempMessage) {
          tempMessage.status = 'error';
          tempMessage.error = error.message || 'Ошибка при отправке';
        }
        
        // Можно добавить уведомление для пользователя
        // showNotification('Не удалось отправить сообщение', 'error');
      }
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      if (isToday) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }
      
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }

    const formatDate = (dateString) => {
      // Превращаем строку вида "2023-4-15" в объект Date
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      const date = new Date(year, month - 1, day); // месяцы в JS начинаются с 0
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      if (date.getTime() === today.getTime()) {
        return 'Сегодня';
      } else if (date.getTime() === yesterdayDate.getTime()) {
        return 'Вчера';
      } else {
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }

    const groupedMessages = computed(() => {
      if (!selectedChat.value?.messages) return {}
      
      // Сначала сортируем сообщения по времени создания
      const sortedMessages = [...(selectedChat.value.messages || [])].sort((a, b) => {
        // Используем createdAt для сортировки, если доступно
        const dateA = a.createdAt ? new Date(a.createdAt) : a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : b.timestamp ? new Date(b.timestamp) : new Date(0);
        
        console.log(`Сортировка сообщений: ${dateA.toISOString()} vs ${dateB.toISOString()}`);
        return dateA.getTime() - dateB.getTime(); // Сортировка от старых к новым
      });
      
      console.log(`Сообщения отсортированы: ${sortedMessages.length} сообщений`);
      
      // Затем группируем по датам
      const grouped = sortedMessages.reduce((groups, message) => {
        // Получаем дату сообщения
        const messageDate = message.createdAt || message.timestamp;
        if (!messageDate) return groups;
        
        // Преобразуем в локальную дату без времени для группировки
        const date = new Date(messageDate);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        
        if (!groups[dateString]) {
          groups[dateString] = [];
        }
        groups[dateString].push(message);
        return groups;
      }, {});
      
      // Сортируем ключи (даты) для отображения в хронологическом порядке
      const sortedGroups = {};
      Object.keys(grouped).sort().forEach(date => {
        sortedGroups[date] = grouped[date];
      });
      
      console.log(`Группировка сообщений: ${Object.keys(sortedGroups).length} дней`);
      return sortedGroups;
    });

    const formatMessageText = (text) => {
      if (!text) return ''
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    }

    const isOwnMessage = (message) => {
      if (!message) {
        console.warn('Пустой объект сообщения при определении собственного сообщения');
        return false;
      }
      
      // Извлекаем ID отправителя из сообщения
      let senderId = null;
      
      if (message.senderId) {
        senderId = String(message.senderId).trim();
      } else if (message.sender && message.sender.id) {
        senderId = String(message.sender.id).trim();
      }
      
      if (!senderId) {
        console.warn('Не удалось определить ID отправителя сообщения', message);
        return false;
      }
      
      // Получаем ID текущего пользователя
      const myId = String(currentUserId.value).trim();
      
      // Получаем ID из localStorage как запасной вариант
      const localStorageId = localStorage.getItem('userId');
      const fallbackId = localStorageId ? String(localStorageId).trim() : null;
      
      console.log(`Сравнение ID: сообщение от ${senderId}, текущий ${myId}, localStorage ${fallbackId}`);
      
      // Проверяем совпадение с обоими вариантами ID
      const isOwn = senderId === myId || (fallbackId && senderId === fallbackId);
      console.log(`Результат сравнения - собственное сообщение: ${isOwn}`);
      
      return isOwn;
    }

    const getUserName = (user) => {
      if (!user) return 'Пользователь'
      
      // Если есть свойство name, используем его
      if (user.name) return user.name
      
      // Если нет name, но есть firstName и lastName, объединяем их
      if (user.firstName || user.lastName) {
        return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Пользователь'
      }
      
      // В крайнем случае возвращаем ID или просто "Пользователь"
      return user.id ? `Пользователь ${user.id}` : 'Пользователь'
    }

    // Функция для скачивания файлов из сообщений
    const downloadFile = (message) => {
      if (!message || !message.fileUrl) {
        console.error('Файл для скачивания отсутствует');
        return;
      }
      
      console.log(`Скачивание файла: ${message.fileName || 'файл'} из URL: ${message.fileUrl}`);
      
      // Открываем файл в новой вкладке или скачиваем его
      window.open(message.fileUrl, '_blank');
    }

    // Функция для прокрутки к определенному сообщению по его ID
    const scrollToMessage = (messageId) => {
      if (!messageId || !messagesContainer.value) {
        return;
      }
      
      console.log(`Прокрутка к сообщению с ID: ${messageId}`);
      
      // Находим элемент сообщения по ID
      const messageElement = document.getElementById(`message-${messageId}`);
      
      if (messageElement) {
        // Прокручиваем к элементу с плавной анимацией
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Добавляем временное выделение для лучшей видимости
        messageElement.classList.add('highlighted-message');
        setTimeout(() => {
          messageElement.classList.remove('highlighted-message');
        }, 2000);
      } else {
        console.warn(`Элемент с ID message-${messageId} не найден`);
      }
    }

    // Функция для обработки результатов поиска пользователей
    const processSearchResults = (users) => {
      console.log('Исходные данные пользователей для обработки:', users);
      
      if (!users) {
        console.error('Результаты поиска отсутствуют (null/undefined)');
        return [];
      }
      
      if (!Array.isArray(users)) {
        console.error('Результаты поиска не являются массивом:', typeof users, users);
        // Пытаемся преобразовать в массив, если это объект
        if (users && typeof users === 'object') {
          if (Array.isArray(users.users)) {
            console.log('Найден массив users в объекте результата');
            users = users.users;
          } else if (Array.isArray(users.data)) {
            console.log('Найден массив data в объекте результата');
            users = users.data;
          } else {
            // Преобразуем объект в массив
            try {
              const usersArray = Object.values(users).filter(item => item && typeof item === 'object');
              console.log('Преобразовали объект в массив:', usersArray.length);
              users = usersArray;
            } catch (e) {
              console.error('Ошибка при преобразовании объекта в массив:', e);
              return [];
            }
          }
        } else {
          return [];
        }
      }
      
      console.log(`Обработка ${users.length} пользователей`);
      
      return users.map(user => {
        if (!user) {
          console.log('Пропущен пустой пользователь');
          return null;
        }
        
        console.log('Обработка пользователя:', user);
        
        // Создаем безопасную копию пользователя
        const processedUser = {
          id: user.id,
          name: getUserName(user),
          email: user.email || '',
          avatar: getUserAvatar(user),
          role: user.userType || user.role || ''
        };
        
        console.log('Преобразованный пользователь:', processedUser);
        return processedUser;
      }).filter(Boolean); // Убираем null элементы
    }

    // Добавляем переменную для хранения таймера
    const searchTimer = ref(null);

    // Улучшаем функцию searchUsers
    const searchUsers = async () => {
      // Отменяем предыдущий таймер при каждом вводе
      if (searchTimer.value) {
        clearTimeout(searchTimer.value);
      }

      // Сбрасываем результаты, если запрос пустой
      if (!userSearch.value || !userSearch.value.trim()) {
        console.log('Пустой поисковый запрос, очищаем результаты');
        searchResults.value = [];
        return;
      }
      
      // Проверяем минимальную длину запроса
      if (userSearch.value.trim().length < 2) {
        console.log('Слишком короткий запрос для поиска (менее 2 символов)');
        searchResults.value = [];
        return;
      }

      // Устанавливаем задержку в 500 мс перед отправкой запроса
      searchTimer.value = setTimeout(async () => {
        try {
          console.log(`Выполняется поиск пользователей по запросу: "${userSearch.value}"`);
          
          // Делаем запрос к API
          const response = await messengerService.searchUsers(userSearch.value.trim());
          
          // Проверяем ответ
          if (!response) {
            console.error('API вернул пустой ответ');
            searchResults.value = [];
            return;
          }
          
          console.log('Ответ от API:', response);
          
          if (!response.data) {
            console.error('API вернул ответ без данных:', response);
            searchResults.value = [];
            return;
          }
          
          console.log('Данные ответа API:', response.data);
          
          // Обрабатываем результаты поиска
          const processedResults = processSearchResults(response.data);
          console.log(`Обработано ${processedResults.length} результатов поиска`);
          
          if (processedResults.length === 0) {
            console.log('После обработки результатов не найдено пользователей');
            searchResults.value = [];
            return;
          }
          
          // Защитная проверка currentUserId
          let safeCurrentUserId = null;
          if (currentUserId.value) {
            // Преобразуем ID в строку для безопасного сравнения
            safeCurrentUserId = String(currentUserId.value).trim();
            console.log(`Текущий ID пользователя: ${safeCurrentUserId}`);
          } else {
            console.warn('currentUserId отсутствует или null');
          }
          
          // Фильтруем пользователей, исключая уже добавленных в группу и текущего пользователя
          searchResults.value = processedResults.filter(user => {
            // Проверяем наличие ID пользователя
            if (!user || !user.id) {
              console.warn('Найден пользователь без ID в результатах поиска');
              return false;
            }
            
            // Получаем ID пользователя в виде строки
            const userId = String(user.id).trim();
            console.log(`Проверка пользователя ID: ${userId}, имя: ${user.name}`);
            
            // Проверяем, добавлен ли пользователь уже в группу
            const isAlreadyAdded = newGroup.value.users.some(selected => {
              if (!selected || !selected.id) return false;
              const selectedId = String(selected.id).trim();
              const match = selectedId === userId;
              if (match) console.log(`Пользователь ${user.name} (${userId}) уже добавлен в группу`);
              return match;
            });
            
            // Проверяем, является ли пользователь текущим
            const isCurrentUser = safeCurrentUserId !== null && userId === safeCurrentUserId;
            if (isCurrentUser) console.log(`Пользователь ${user.name} (${userId}) является текущим пользователем`);
            
            const shouldInclude = !isAlreadyAdded && !isCurrentUser;
            console.log(`Результат фильтрации для ${user.name}: ${shouldInclude ? 'включен' : 'исключен'}`);
            
            return shouldInclude;
          });
          
          console.log(`После фильтрации найдено ${searchResults.value.length} пользователей`);
        } catch (error) {
          console.error('Ошибка при поиске пользователей:', error);
          if (error.response) {
            console.error('Ответ сервера:', error.response.data);
            console.error('Статус ошибки:', error.response.status);
          }
          searchResults.value = [];
        }
      }, 500); // Задержка в 500 мс
    }

    const addUser = (user) => {
      console.log('Добавление пользователя в группу:', user)
      newGroup.value.users.push(user)
      searchResults.value = searchResults.value.filter(u => u.id !== user.id)
      userSearch.value = ''
      console.log(`В группе теперь ${newGroup.value.users.length} пользователей:`, 
                 newGroup.value.users.map(u => u.name))
    }

    const removeUser = (user) => {
      console.log('Удаление пользователя из группы:', user)
      newGroup.value.users = newGroup.value.users.filter(u => u.id !== user.id)
      console.log(`В группе осталось ${newGroup.value.users.length} пользователей`)
    }

    const createGroup = async () => {
      if (!newGroup.value.name.trim() || newGroup.value.users.length < 2) {
        console.warn('Невозможно создать группу: не заполнено название или выбрано меньше 2 участников');
        alert('Для создания группы необходимо указать название и добавить как минимум 2 участников');
        return;
      }

      try {
        console.log('Создание группового чата с параметрами:', {
          name: newGroup.value.name,
          usersCount: newGroup.value.users.length
        });
        
        // Получаем ID текущего пользователя
        const currentUser = localStorage.getItem('userId');
        if (!currentUser) {
          console.error('Не найден ID текущего пользователя для создания группы');
          alert('Ошибка авторизации. Пожалуйста, войдите снова.');
          return;
        }
        
        // Проверка и преобразование ID пользователей
        const userIds = newGroup.value.users
          .map(user => {
            if (!user.id) {
              console.warn(`Пользователь ${user.name} не имеет ID`);
              return null;
            }
            
            // Безопасное преобразование ID в число
            const userId = parseInt(String(user.id).trim(), 10);
            if (isNaN(userId)) {
              console.warn(`Пользователь ${user.name} имеет некорректный ID: ${user.id}`);
              return null;
            }
            
            console.log(`Преобразованный ID для пользователя ${user.name}: ${userId} (исходный: ${user.id})`);
            return userId;
          })
          .filter(id => id !== null);
        
        // Добавляем текущего пользователя в список участников, если его там нет
        const currentUserId = parseInt(currentUser, 10);
        if (!userIds.includes(currentUserId)) {
          console.log(`Добавляем текущего пользователя (ID: ${currentUserId}) в список участников группы`);
          userIds.push(currentUserId);
        }
        
        if (userIds.length < 2) {
          console.error('Недостаточно валидных пользователей для создания группы');
          alert('Не удалось создать группу. Выберите как минимум 2 пользователей.');
          return;
        }
        
        console.log(`Итоговый список ID пользователей для группы: ${userIds.join(', ')}`);
        
        const groupData = {
          name: newGroup.value.name,
          description: newGroup.value.description,
          type: 'group',
          userIds: userIds
        };
        
        console.log('Отправка данных для создания группы:', groupData);
        
        const response = await messengerService.createChat(groupData);
        
        if (!response || !response.data) {
          console.error('Сервер вернул пустой ответ при создании группы');
          alert('Не удалось создать группу. Пожалуйста, попробуйте еще раз.');
          return;
        }
        
        console.log('Группа успешно создана:', response.data);
        
        // Убедимся, что у группы есть аватар
        if (response.data && !response.data.avatar) {
          response.data.avatar = '/assets/images/default-avatar.svg';
        }
        
        // Добавляем чат в список
        chats.value.unshift(response.data);
        showCreateGroupModal.value = false;
        
        // Сбрасываем форму
        newGroup.value.name = '';
        newGroup.value.description = '';
        newGroup.value.users = [];
        
        // Выбираем созданный чат
        if (response.data && response.data.id) {
          console.log(`Выбираем новый чат с ID: ${response.data.id}`);
          selectChat(response.data.id);
        } else {
          console.warn('Созданный чат не содержит ID, невозможно его выбрать');
        }
      } catch (error) {
        console.error('Ошибка при создании группы:', error.response?.data || error);
        alert('Не удалось создать группу. Ошибка: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'));
      }
    }

    const handleInput = (event) => {
      const textarea = event.target
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
      
      // Отправка события печатания
      if (!isTyping.value && selectedChat.value) {
        isTyping.value = true
        sendTypingStatus(true)
        setTimeout(() => {
          isTyping.value = false
          sendTypingStatus(false)
        }, 2000)
      }
    }

    const sendTypingStatus = async (isTyping) => {
      if (!selectedChat.value) return
      
      try {
        await messengerService.sendTypingStatus(selectedChat.value.id, isTyping)
      } catch (error) {
        console.error('Ошибка при отправке статуса печатания:', error)
      }
    }

    const formatText = (type) => {
      if (!messageInput.value) return
      
      const textarea = messageInput.value
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = newMessage.value
      
      let prefix, suffix
      switch (type) {
        case 'bold':
          prefix = '**'
          suffix = '**'
          break
        case 'italic':
          prefix = '_'
          suffix = '_'
          break
        case 'code':
          prefix = '`'
          suffix = '`'
          break
      }
      
      newMessage.value = text.substring(0, start) + prefix + 
        text.substring(start, end) + suffix + 
        text.substring(end)
    }

    const replyToMessage = (message) => {
      replyingTo.value = message
      messageInput.value?.focus()
    }

    const cancelReply = () => {
      replyingTo.value = null
    }

    const toggleChatMenu = (chat) => {
      chat.showMenu = !chat.showMenu
    }

    const pinChat = async (chat) => {
      try {
        await messengerService.togglePinChat(chat.id, !chat.isPinned)
        chat.isPinned = !chat.isPinned
        chat.showMenu = false
      } catch (error) {
        console.error('Ошибка при закреплении чата:', error)
      }
    }

    const markAsUnread = async (chat) => {
      try {
        await messengerService.markChatAsUnread(chat.id)
        chat.unreadCount = 1
        chat.showMenu = false
      } catch (error) {
        console.error('Ошибка при отметке чата как непрочитанного:', error)
      }
    }

    const muteChat = async (chat) => {
      try {
        await messengerService.toggleMuteChat(chat.id)
        chat.isMuted = !chat.isMuted
        chat.showMenu = false
      } catch (error) {
        console.error('Ошибка при отключении уведомлений:', error)
      }
    }

    const leaveGroup = async (chat) => {
      try {
        await messengerService.leaveChat(chat.id)
        chats.value = chats.value.filter(c => c.id !== chat.id)
        selectedChat.value = null
      } catch (error) {
        console.error('Ошибка при покидании группы:', error)
      }
    }

    const showImagePreview = (message) => {
      // Реализация предпросмотра изображения
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'sent': return 'fa-check'
        case 'delivered': return 'fa-check-double'
        case 'read': return 'fa-check-double text-primary'
        default: return 'fa-clock'
      }
    }

    const showReactions = (message) => {
      // Реализация показа реакций
    }

    const toggleReaction = async (message, reaction) => {
      try {
        // Если пользователь уже поставил эту реакцию, то убираем её
        await messengerService.removeReaction(message.id, reaction)
        
        // Обновляем локальные данные
        const updatedMessages = selectedChat.value.messages.map(m => 
          m.id === message.id 
            ? { ...m, reactions: { ...m.reactions, [reaction]: Math.max(0, m.reactions[reaction] - 1) } }
            : m
        )
        selectedChat.value.messages = updatedMessages
      } catch (error) {
        console.error('Ошибка при управлении реакцией:', error)
      }
    }

    const selectEmojiCategory = (category) => {
      currentEmojiCategory.value = category.name
    }

    const insertEmoji = (emoji) => {
      newMessage.value += emoji
      showEmojiPicker.value = false
    }

    const chatItem = ({
      id,
      name,
      avatar,
      lastMessage,
      unreadCount,
      isPinned,
      status,
      typing
    }) => {
      return {
        id,
        name: name || 'Без названия',
        avatar: avatar || '/default-avatar.png',
        lastMessage,
        unreadCount: unreadCount || 0,
        isPinned: isPinned || false,
        status: status || 'offline',
        typing: typing || false
      }
    }

    // Функция для получения аватара пользователя
    const getUserAvatar = (user) => {
      const defaultAvatar = '/assets/images/default-avatar.svg'; // Обновленный путь к дефолтному аватару
      
      if (!user) {
        console.log('Отсутствует пользователь для получения аватара');
        return defaultAvatar;
      }
      
      console.log('Получение аватара для пользователя:', user);
      
      // Проверяем различные возможные расположения аватара
      if (user.avatar && user.avatar.startsWith('http')) {
        console.log('Найден прямой URL аватара:', user.avatar);
        return user.avatar;
      }
      
      if (user.avatar) {
        console.log('Найден локальный путь к аватару:', user.avatar);
        return user.avatar;
      }
      
      if (user.profile && user.profile.avatar) {
        console.log('Найден аватар в профиле:', user.profile.avatar);
        return user.profile.avatar;
      }
      
      // Если аватара нет, возвращаем дефолтный
      console.log('Аватар не найден, используем дефолтный');
      return defaultAvatar;
    }

    onMounted(() => {
      loadChats()
    })

    // Функция для полного форматирования даты и времени для всплывающей подсказки
    const formatFullDateTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    // Функция для получения времени последнего сообщения в чате
    const getLastMessageTime = (chat) => {
      if (!chat) return 0;
      
      // Если у чата есть сообщения, берем время последнего
      if (chat.messages && chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return new Date(lastMessage.createdAt || lastMessage.timestamp || 0).getTime();
      }
      
      // Если есть lastMessageTime, используем его
      if (chat.lastMessageTime) {
        return new Date(chat.lastMessageTime).getTime();
      }
      
      // Если есть updatedAt, используем его
      if (chat.updatedAt) {
        return new Date(chat.updatedAt).getTime();
      }
      
      // В крайнем случае используем createdAt или возвращаем 0
      return chat.createdAt ? new Date(chat.createdAt).getTime() : 0;
    }

    // Добавляем метод для загрузки участников группы
    const loadGroupMembers = async (chatId) => {
      if (!chatId) {
        console.error('Не указан ID чата для загрузки участников');
        return;
      }
      
      console.log(`Загрузка участников группы с ID: ${chatId}`);
      
      try {
        // Сбрасываем список участников перед загрузкой
        groupMembers.value = [];
        
        // Запрашиваем участников группы
        const response = await messengerService.getChatMembers(chatId);
        
        if (response && response.data) {
          console.log(`Получено ${response.data.length} участников группы:`, response.data);
          
          // Обрабатываем полученные данные
          const members = response.data;
          
          // Проверяем, что members содержит массив участников
          if (Array.isArray(members)) {
            // Устанавливаем список участников
            groupMembers.value = members;
            
            console.log('Обработанный список участников:', groupMembers.value);
          } else {
            console.error('Данные участников не являются массивом:', members);
            groupMembers.value = [];
          }
        } else {
          console.warn(`Не получены данные участников для группы ${chatId}`);
          groupMembers.value = [];
        }
      } catch (error) {
        console.error(`Ошибка при загрузке участников группы ${chatId}:`, error);
        if (error.response) {
          console.error('Ответ сервера:', error.response.data);
          console.error('Статус ошибки:', error.response.status);
        }
        groupMembers.value = [];
      }
    }

    // Функция для загрузки сообщений
    const loadMessages = async (chatId) => {
      try {
        console.log(`Загрузка сообщений для чата ${chatId}`);
        const response = await messengerService.getMessages(chatId);
        
        if (response && response.data) {
          console.log(`Получено ${response.data.length} сообщений`, response.data);
          
          // Отладочная информация о первом сообщении и его отправителе
          if (response.data.length > 0) {
            const firstMsg = response.data[0];
            console.log('Первое сообщение:', firstMsg);
            console.log('Отправитель первого сообщения:', firstMsg.sender);
            if (firstMsg.sender) {
              console.log('Имя отправителя:', getUserFullName(firstMsg.sender));
            }
          }
          
          // Проверяем наличие выбранного чата
          if (selectedChat.value && selectedChat.value.id === chatId) {
            selectedChat.value.messages = response.data;
            
            // Прокручиваем к последнему сообщению
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      } catch (error) {
        console.error(`Ошибка при загрузке сообщений для чата ${chatId}:`, error);
      }
    }

    return {
      activeTab,
      searchQuery,
      chats,
      selectedChat,
      newMessage,
      showCreateGroupModal,
      showAttachMenu,
      showEmojiPicker,
      messagesContainer,
      messageInput,
      newGroup,
      userSearch,
      searchResults,
      filteredChats,
      currentUserId,
      selectChat,
      sendMessage,
      formatTime,
      formatDate,
      searchUsers,
      addUser,
      removeUser,
      createGroup,
      replyingTo,
      showFormatting,
      emojiCategories,
      currentEmojiCategory,
      currentCategoryEmojis,
      groupedMessages,
      handleInput,
      formatText,
      formatMessageText,
      isOwnMessage,
      replyToMessage,
      cancelReply,
      toggleChatMenu,
      pinChat,
      markAsUnread,
      muteChat,
      leaveGroup,
      attachImage,
      attachFile,
      downloadFile,
      showImagePreview,
      getStatusIcon,
      showReactions,
      toggleReaction,
      editMessage,
      scrollToMessage,
      selectEmojiCategory,
      insertEmoji,
      chatItem,
      showGroupInfoModal,
      showEditMessageModal,
      showForwardMessageModal,
      showFileUploadModal,
      showAddMembersModal,
      groupMembers,
      editedMessageText,
      forwardingMessage,
      selectedForwardChatId,
      selectedFile,
      filePreviewUrl,
      uploadProgress,
      uploadInProgress,
      isImageUpload,
      dragOver,
      fileInput,
      getUserFullName,
      getUserName,
      getMemberRoleText,
      isMemberOwner,
      removeMember,
      deleteGroup,
      showFileUploader,
      handleFileSelect,
      handleFileDrop,
      removeSelectedFile,
      formatFileSize,
      uploadSelectedFile,
      cancelFileUpload,
      showGroupInfo,
      forwardMessage,
      selectChatForForward,
      cancelForwardMessage,
      confirmForwardMessage,
      saveEditedMessage,
      cancelEditMessage,
      scrollToBottom,
      getUserAvatar,
      formatFullDateTime,
      loadMessages,
      updateLastMessage
    }
  }
}
</script>

<style scoped>
.messenger {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

.messenger-sidebar {
  width: 350px;
  border-right: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.search-bar input {
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

.search-bar input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-bar input::placeholder {
  color: #a0aec0;
}

.chat-tabs {
  display: flex;
  padding: 8px;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #2196F3;
  color: #fff;
}

.tab-btn:hover:not(.active) {
  background: #f1f5f9;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-list::-webkit-scrollbar {
  width: 4px;
}

.chat-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.chat-item {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  position: relative;
}

.chat-item:hover {
  background: #f5f5f5;
}

.chat-item.active {
  background: #e3f2fd;
}

.chat-avatar {
  position: relative;
  width: 50px;
  height: 50px;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background: #4caf50;
}

.status-indicator.offline {
  background: #9e9e9e;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-item .chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.chat-item .chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.chat-item .chat-header .chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-item .chat-header .pin-indicator {
  font-size: 0.9rem;
}

.chat-item .chat-header .chat-time {
  font-size: 0.8rem;
  color: #666;
}

.chat-item .chat-preview {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item .chat-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.chat-item .unread-badge {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  background: #2196F3;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.chat-item .typing-indicator {
  font-size: 0.8rem;
  color: #2196F3;
  font-style: italic;
}

.chat-item .chat-actions-menu {
  position: relative;
}

.chat-item .chat-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 200px;
}

.chat-item .chat-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.chat-item .chat-menu button:hover {
  background: #f5f5f5;
}

.chat-item .chat-menu button.danger {
  color: #f44336;
}

.messenger-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.main-chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.main-chat-header .chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-chat-header img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.main-chat-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.main-chat-header .status {
  font-size: 0.9rem;
  color: #666;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.chat-actions button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.chat-actions button:hover {
  background: #f5f5f5;
  color: #2196F3;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1rem;
}

.message-own {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-text {
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-bottom-left-radius: 0;
  color: #2c3e50;
}

.message-own .message-text {
  background: #2196F3;
  color: white;
  border-radius: 1rem;
  border-bottom-right-radius: 0;
}

.message-image img {
  max-width: 100%;
  border-radius: 0.5rem;
  cursor: pointer;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}

.message-own .message-meta {
  flex-direction: row-reverse;
}

.message-status i {
  font-size: 0.9rem;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  border-radius: 1rem;
  padding: 0.5rem;
}

.input-wrapper textarea {
  width: 100%;
  border: none;
  background: none;
  resize: none;
  padding: 0.5rem 2.5rem 0.5rem 0.5rem;
  font-size: 0.95rem;
  max-height: 150px;
}

.attach-btn,
.emoji-btn,
.send-btn {
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.emoji-btn {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.5rem;
}

.send-btn {
  color: #2196F3;
}

.send-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.messenger-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.placeholder-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #2196F3;
}

.create-group {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.create-group-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #2196F3;
  color: #fff;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-group-btn:hover {
  background: #1e88e5;
}

.create-group-btn i {
  font-size: 16px;
}

.create-group-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #2d3748;
  background: #fff;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-group textarea {
  resize: none;
  height: 100px;
}

.participants-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-footer button {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-footer .cancel-btn {
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.modal-footer .cancel-btn:hover {
  background: #e2e8f0;
}

.modal-footer .create-btn {
  background: #2196F3;
  color: #fff;
  border: none;
}

.modal-footer .create-btn:hover {
  background: #1e88e5;
}

.date-separator {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.date-label {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.date-separator::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e0e0e0;
  z-index: 0;
}

.message-avatar {
  width: 32px;
  height: 32px;
  margin-right: 0.5rem;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble {
  position: relative;
}

.message-author {
  font-size: 0.85rem;
  color: #2196F3;
  margin-bottom: 0.25rem;
}

.message-reply-preview {
  background: rgba(0, 0, 0, 0.05);
  border-left: 3px solid #2196F3;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.reply-content {
  font-size: 0.9rem;
}

.reply-author {
  color: #2196F3;
  font-weight: 500;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2196F3;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.reaction-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reaction-badge:hover {
  background: rgba(0, 0, 0, 0.1);
}

.reply-bar {
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.reply-preview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.close-reply {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.format-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.format-toolbar button {
  padding: 0.25rem 0.5rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-toolbar button:hover {
  background: #f5f5f5;
  border-color: #2196F3;
  color: #2196F3;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.emoji-categories {
  display: flex;
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.emoji-categories button {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s ease;
}

.emoji-categories button:hover {
  background: #f5f5f5;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  padding: 0.5rem;
  overflow-y: auto;
}

.emoji-list button {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: transform 0.2s ease;
}

.emoji-list button:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .messenger {
    flex-direction: column;
  }

  .messenger-sidebar {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 60px;
    left: 0;
    z-index: 10;
    background: white;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .messenger-sidebar.active {
    transform: translateX(0);
  }

  .messenger-main {
    margin-left: 0;
  }

  .message-actions {
    opacity: 1;
  }
  
  .emoji-picker {
    width: 100%;
    left: 0;
  }
  
  .emoji-list {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Стили для модального окна создания группы */
.modal-overlay .create-group-modal {
  width: 560px !important;
  max-width: 560px !important;
  padding: 0 !important;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.create-group-modal .modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 20px 20px 0 0;
}

.create-group-modal .modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
}

.create-group-modal .create-group-form {
  padding: 24px;
}

.create-group-modal .form-group {
  margin-bottom: 20px;
}

.create-group-modal .form-group:last-child {
  margin-bottom: 0;
}

.create-group-modal .form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
}

.create-group-modal .form-group input,
.create-group-modal .form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #2d3748;
  background: #fff;
  transition: all 0.3s ease;
}

.create-group-modal .form-group input:focus,
.create-group-modal .form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.create-group-modal .form-group textarea {
  resize: none;
  height: 80px;
  padding-top: 16px;
}

.create-group-modal .selected-users-container {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  height: 120px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.create-group-modal .selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.create-group-modal .search-results {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  height: 160px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.create-group-modal .search-result {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #e2e8f0;
}

.create-group-modal .search-result:hover {
  background: #f8fafc;
}

.create-group-modal .search-result:last-child {
  border-bottom: none;
}

.create-group-modal .search-result img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.create-group-modal .user-info {
  flex: 1;
}

.create-group-modal .user-name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
  display: block;
}

.create-group-modal .user-role {
  font-size: 12px;
  color: #718096;
}

.create-group-modal .modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 20px 20px;
}

.create-group-modal .btn-secondary {
  padding: 10px 20px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.create-group-modal .btn-secondary:hover {
  background: #e2e8f0;
}

.create-group-modal .btn-primary,
.create-group-modal .create-btn {
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #2196F3 !important;
  color: white !important;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-group-modal .btn-primary:hover,
.create-group-modal .create-btn:hover {
  background-color: #1976D2 !important;
}

.create-group-modal .btn-primary:disabled,
.create-group-modal .create-btn:disabled {
  background-color: #2196F3 !important;
  opacity: 0.7;
  cursor: not-allowed;
}

/* Стили для скроллбара */
.create-group-modal .search-results::-webkit-scrollbar,
.create-group-modal .selected-users-container::-webkit-scrollbar {
  width: 4px;
}

.create-group-modal .search-results::-webkit-scrollbar-track,
.create-group-modal .selected-users-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.create-group-modal .search-results::-webkit-scrollbar-thumb,
.create-group-modal .selected-users-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.create-group-modal .search-results::-webkit-scrollbar-thumb:hover,
.create-group-modal .selected-users-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.chat-loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #888;
}

.empty-chat-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.empty-state {
  text-align: center;
  padding: 20px;
}

.empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 15px;
  display: block;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.empty-state .create-group-btn {
  background: #2196F3;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.empty-state .create-group-btn:hover {
  background: #1e88e5;
}
</style> 