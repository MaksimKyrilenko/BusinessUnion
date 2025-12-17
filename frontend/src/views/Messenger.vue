<template>
  <div class="messenger-page">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-comments"></i>
          <span>Мессенджер</span>
        </div>
        <h1 class="header-title">Сообщения</h1>
        <p class="header-subtitle">Общайтесь с партнёрами и командой</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-user"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ personalChatsCount }}</span>
            <span class="stat-label">Личных</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ groupChatsCount }}</span>
            <span class="stat-label">Групповых</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-bell"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ unreadCount }}</span>
            <span class="stat-label">Непрочит.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="messenger">
      <!-- Sidebar -->
      <ChatSidebar
        :chats="chats"
        :filteredChats="filteredChats"
        :selectedChat="selectedChat"
        :activeTab="activeTab"
        :searchQuery="searchQuery"
        :loading="loading"
        :currentUserId="currentUserId"
        :onlineUsers="onlineUsers"
        @update:activeTab="activeTab = $event"
        @update:searchQuery="searchQuery = $event"
        @selectChat="handleSelectChat"
        @createGroup="showCreateGroupModal = true"
        @toggleChatMenu="toggleChatMenu"
        @pinChat="pinChat"
        @markAsUnread="markAsUnread"
        @muteChat="muteChat"
        @leaveGroup="leaveGroup"
      />

      <!-- Main chat area -->
      <div class="messenger-main" v-if="selectedChat">
        <ChatHeader
          :chat="selectedChat"
          :currentUserId="currentUserId"
          :membersCount="groupMembers.length"
          :isTyping="typingInCurrentChat"
          :onlineUsers="onlineUsers"
          @showGroupInfo="showGroupInfoModal = true"
          @showSettings="showChatSettings = true"
        />

        <MessageList
          ref="messageListRef"
          :groupedMessages="groupedMessages"
          :isOwnMessage="isOwnMessage"
          @reply="replyToMessage"
          @edit="startEditMessage"
          @delete="deleteMessage"
          @addReaction="addReaction"
          @toggleReaction="toggleReaction"
          @scrollToMessage="scrollToMessage"
          @downloadFile="downloadFile"
          @downloadImage="downloadImage"
          @showImagePreview="handleShowImagePreview"
        />

        <MessageInput
          v-model="newMessage"
          :replyingTo="replyingTo"
          :showAttachMenu="showAttachMenu"
          :showEmojiPicker="showEmojiPicker"
          :showFormatting="showFormatting"
          :canSend="canSendMessage"
          :emojiCategories="emojiCategories"
          :currentEmojiCategory="currentEmojiCategory"
          :currentCategoryEmojis="currentCategoryEmojis"
          @send="sendMessage"
          @cancelReply="cancelReply"
          @toggleAttachMenu="toggleAttachMenu"
          @attachImage="attachImage"
          @attachFile="attachFile"
          @toggleEmojiPicker="toggleEmojiPicker"
          @selectEmojiCategory="selectEmojiCategory"
          @insertEmoji="insertEmoji"
          @formatText="formatText"
          @typing="handleTyping"
        />
      </div>

      <!-- Placeholder -->
      <div class="messenger-placeholder" v-else>
        <div class="placeholder-content">
          <i class="fas fa-comments"></i>
          <h2>Выберите чат для начала общения</h2>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateGroupModal
      :show="showCreateGroupModal"
      :group="newGroup"
      :userSearch="userSearch"
      :searchResults="searchResults"
      @close="showCreateGroupModal = false"
      @create="handleCreateGroup"
      @update:name="newGroup.name = $event"
      @update:description="newGroup.description = $event"
      @addUser="addUser"
      @removeUser="removeUser"
      @searchUsers="handleSearchUsers"
    />

    <GroupInfoModal
      :show="showGroupInfoModal"
      :chat="selectedChat"
      :members="groupMembers"
      :filteredMembers="filteredGroupMembers"
      :activeTab="groupInfoActiveTab"
      :memberSearch="memberSearchQuery"
      :notifications="groupNotifications"
      :isAdmin="isCurrentUserAdmin"
      @close="showGroupInfoModal = false"
      @update:activeTab="groupInfoActiveTab = $event"
      @update:memberSearch="memberSearchQuery = $event"
      @update:notifications="groupNotifications = $event"
      @editGroup="handleEditGroup"
      @addMembers="handleAddMembers"
      @leaveGroup="leaveGroup(selectedChat)"
      @deleteGroup="confirmDeleteGroup"
      @changeAvatar="changeGroupAvatar"
      @removeMember="removeMember"
    />

    <FileUploadModal
      :show="showFileUploadModal"
      :isImage="isImageUpload"
      :selectedFile="selectedFile"
      :previewUrl="filePreviewUrl"
      :progress="uploadProgress"
      :uploading="uploadInProgress"
      :isDragOver="dragOver"
      @cancel="cancelFileUpload"
      @upload="uploadSelectedFile"
      @select="handleFileSelect"
      @remove="removeSelectedFile"
      @drop="handleFileDrop"
      @dragOver="dragOver = $event"
    />

    <ImagePreviewModal
      :show="showImagePreviewModal"
      :message="previewMessage"
      @close="showImagePreviewModal = false"
      @download="downloadImage(previewMessage)"
    />

    <AddMemberModal
      :show="showAddMembersModal"
      :userSearch="userSearch"
      :searchResults="searchResults"
      :selectedUsers="selectedUsers"
      @close="showAddMembersModal = false"
      @search="handleSearchUsers"
      @selectUser="selectUserToAdd"
      @removeUser="removeSelectedUser"
      @add="addMembersToGroup"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import websocketService from '@/services/websocket.service'

// Components
import ChatSidebar from '@/components/messenger/ChatSidebar.vue'
import ChatHeader from '@/components/messenger/ChatHeader.vue'
import MessageList from '@/components/messenger/MessageList.vue'
import MessageInput from '@/components/messenger/MessageInput.vue'

// Modals
import CreateGroupModal from '@/components/messenger/modals/CreateGroupModal.vue'
import GroupInfoModal from '@/components/messenger/modals/GroupInfoModal.vue'
import FileUploadModal from '@/components/messenger/modals/FileUploadModal.vue'
import ImagePreviewModal from '@/components/messenger/modals/ImagePreviewModal.vue'
import AddMemberModal from '@/components/messenger/modals/AddMemberModal.vue'

// Composables
import { useChats } from '@/composables/messenger/useChats'
import { useMessages } from '@/composables/messenger/useMessages'
import { useFileUpload } from '@/composables/messenger/useFileUpload'
import { useGroupManagement } from '@/composables/messenger/useGroupManagement'

export default {
  name: 'Messenger',
  components: {
    ChatSidebar,
    ChatHeader,
    MessageList,
    MessageInput,
    CreateGroupModal,
    GroupInfoModal,
    FileUploadModal,
    ImagePreviewModal,
    AddMemberModal
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const currentUserId = ref(userStore.userId)
    const wsUnsubscribers = []
    const onlineUsers = ref([]) // Список онлайн пользователей
    
    // Chats composable
    const {
      chats,
      selectedChat,
      activeTab,
      searchQuery,
      loading,
      personalChatsCount,
      groupChatsCount,
      unreadCount,
      filteredChats,
      loadChats,
      selectChat,
      updateLastMessage,
      toggleChatMenu,
      pinChat,
      markAsUnread,
      muteChat,
      leaveGroup
    } = useChats()

    // Messages composable
    const {
      messagesContainer,
      replyingTo,
      groupedMessages,
      isOwnMessage,
      loadMessages,
      scrollToBottom,
      scrollToMessage,
      replyToMessage,
      cancelReply,
      editMessage,
      showReactions,
      toggleReaction,
      downloadFile,
      downloadImage,
      addProcessedMessageId,
      isMessageProcessed
    } = useMessages(selectedChat, currentUserId)

    // File upload composable
    const {
      showFileUploadModal,
      selectedFile,
      filePreviewUrl,
      uploadProgress,
      uploadInProgress,
      isImageUpload,
      dragOver,
      showAttachMenu,
      toggleAttachMenu,
      attachImage,
      attachFile,
      handleFileSelect,
      handleFileDrop,
      removeSelectedFile,
      uploadSelectedFile,
      cancelFileUpload
    } = useFileUpload(selectedChat, loadMessages)

    // Group management composable
    const {
      showCreateGroupModal,
      showGroupInfoModal,
      showEditGroupModal,
      showAddMembersModal,
      groupMembers,
      groupInfoActiveTab,
      memberSearchQuery,
      groupNotifications,
      newGroup,
      editingGroup,
      userSearch,
      searchResults,
      selectedUsers,
      isCurrentUserAdmin,
      isCurrentUserOwner,
      filteredGroupMembers,
      isMemberOwner,
      loadGroupMembers,
      searchUsers,
      addUser,
      removeUser,
      createGroup,
      handleEditGroup,
      handleAddMembers,
      saveGroupChanges,
      selectUserToAdd,
      removeSelectedUser,
      addMembersToGroup,
      removeMember,
      changeMemberRole,
      changeGroupAvatar,
      confirmDeleteGroup,
      deleteGroup
    } = useGroupManagement(selectedChat, chats, currentUserId)

    // Local state
    const newMessage = ref('')
    const showEmojiPicker = ref(false)
    const showFormatting = ref(false)
    const showChatSettings = ref(false)
    const showImagePreviewModal = ref(false)
    const previewMessage = ref(null)
    const messageListRef = ref(null)
    const isTyping = ref(false)
    const currentEmojiCategory = ref('smileys')
    const typingUsers = ref({}) // { chatId: [userId1, userId2] }
    
    // Computed для проверки печатает ли кто-то в текущем чате
    const typingInCurrentChat = computed(() => {
      if (!selectedChat.value) return false
      const users = typingUsers.value[selectedChat.value.id]
      return users && users.length > 0
    })

    // Emoji categories
    const emojiCategories = ref([
      { name: 'smileys', icon: '😊', title: 'Смайлики и эмоции' },
      { name: 'gestures', icon: '👋', title: 'Жесты и люди' },
      { name: 'objects', icon: '💡', title: 'Предметы' },
      { name: 'symbols', icon: '❤️', title: 'Символы' },
      { name: 'nature', icon: '🌿', title: 'Природа' },
      { name: 'food', icon: '🍔', title: 'Еда и напитки' },
      { name: 'travel', icon: '✈️', title: 'Путешествия' },
      { name: 'flags', icon: '🏳️', title: 'Флаги' }
    ])

    const emojiMap = {
      smileys: ['😊', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😇', '😉', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝'],
      gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💅', '🤝'],
      objects: ['💡', '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '🔋', '🔌', '📦', '📝', '📊', '📈', '📉', '📆', '📅', '📇', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗑️'],
      symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️'],
      nature: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌾', '🌺', '🌻', '🌼', '🌷', '🌹', '🌸', '💐', '🏵️', '🌱', '🎋', '🎍'],
      food: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒'],
      travel: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖'],
      flags: ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈', '🇦🇷', '🇦🇺', '🇧🇷', '🇨🇦', '🇨🇳', '🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵', '🇰🇷', '🇷🇺', '🇪🇸', '🇬🇧', '🇺🇸']
    }

    const currentCategoryEmojis = computed(() => emojiMap[currentEmojiCategory.value] || [])
    const canSendMessage = computed(() => selectedChat.value && newMessage.value.trim().length > 0)

    // Methods
    const handleSelectChat = async (chatId) => {
      await selectChat(chatId, loadMessages, loadGroupMembers)
    }

    const handleCreateGroup = () => {
      createGroup(handleSelectChat)
    }

    const handleSearchUsers = (query) => {
      userSearch.value = query
      searchUsers()
    }

    const handleShowImagePreview = (message) => {
      previewMessage.value = message
      showImagePreviewModal.value = true
    }

    const sendMessage = async () => {
      if (!newMessage.value?.trim() || !selectedChat.value) return

      try {
        const userId = localStorage.getItem('userId')
        if (!userId) return

        const messageData = {
          chatId: Number(selectedChat.value.id),
          text: newMessage.value.trim(),
          type: 'text'
        }

        if (replyingTo.value) {
          messageData.replyToId = replyingTo.value.id
        }

        // Генерируем уникальный временный ID
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const tempMessage = {
          id: tempId,
          text: newMessage.value.trim(),
          senderId: Number(userId),
          chatId: Number(selectedChat.value.id),
          status: 'sending',
          createdAt: new Date().toISOString(),
          sender: { id: Number(userId), firstName: 'Вы', lastName: '' },
          _isTemp: true // Маркер временного сообщения
        }

        // Сохраняем текст и очищаем поле ввода ДО отправки
        const messageText = newMessage.value.trim()
        newMessage.value = ''
        replyingTo.value = null

        // Добавляем временное сообщение
        if (!selectedChat.value.messages) {
          selectedChat.value.messages = []
        }
        selectedChat.value.messages.push(tempMessage)
        scrollToBottom()

        const messengerService = (await import('@/services/messenger.service')).default
        const response = await messengerService.sendMessage(messageData)

        if (response?.data) {
          // ВАЖНО: Добавляем ID в обработанные СРАЗУ после получения ответа
          // чтобы WebSocket не добавил дубликат
          addProcessedMessageId(response.data.id)
          
          // Заменяем временное сообщение на реальное
          const index = selectedChat.value.messages.findIndex(msg => msg.id === tempId)
          if (index !== -1) {
            selectedChat.value.messages[index] = response.data
          } else {
            // Если временное сообщение не найдено (маловероятно), проверяем нет ли уже реального
            const existsReal = selectedChat.value.messages.some(msg => msg.id === response.data.id)
            if (!existsReal) {
              selectedChat.value.messages.push(response.data)
            }
          }
        }

        scrollToBottom()
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
        // Помечаем временное сообщение как ошибочное
        if (selectedChat.value?.messages) {
          const tempMsg = selectedChat.value.messages.find(msg => msg._isTemp && msg.status === 'sending')
          if (tempMsg) {
            tempMsg.status = 'error'
          }
        }
      }
    }

    const handleTyping = () => {
      if (!isTyping.value && selectedChat.value) {
        isTyping.value = true
        websocketService.sendTyping(selectedChat.value.id, true)
        setTimeout(() => {
          isTyping.value = false
          websocketService.sendTyping(selectedChat.value.id, false)
        }, 2000)
      }
    }

    // Редактирование сообщения
    const editingMessageId = ref(null)
    const editingMessageText = ref('')

    const startEditMessage = (message) => {
      editingMessageId.value = message.id
      editingMessageText.value = message.text
      // Показываем prompt для редактирования (простой вариант)
      const newText = prompt('Редактировать сообщение:', message.text)
      if (newText !== null && newText.trim() !== '' && newText !== message.text) {
        saveEditedMessage(message.id, newText.trim())
      }
      editingMessageId.value = null
    }

    const saveEditedMessage = async (messageId, newText) => {
      try {
        const messengerService = (await import('@/services/messenger.service')).default
        await messengerService.editMessage(messageId, newText)
        
        // Обновляем сообщение локально
        if (selectedChat.value?.messages) {
          const msgIndex = selectedChat.value.messages.findIndex(m => m.id === messageId)
          if (msgIndex !== -1) {
            selectedChat.value.messages[msgIndex].text = newText
            selectedChat.value.messages[msgIndex].isEdited = true
          }
        }
      } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error)
        alert('Не удалось отредактировать сообщение')
      }
    }

    // Удаление сообщения
    const deleteMessage = async (message) => {
      if (!confirm('Удалить это сообщение?')) return
      
      try {
        const messengerService = (await import('@/services/messenger.service')).default
        await messengerService.deleteMessage(message.id)
        
        // Удаляем сообщение локально
        if (selectedChat.value?.messages) {
          const msgIndex = selectedChat.value.messages.findIndex(m => m.id === message.id)
          if (msgIndex !== -1) {
            selectedChat.value.messages.splice(msgIndex, 1)
          }
        }
      } catch (error) {
        console.error('Ошибка при удалении сообщения:', error)
        alert('Не удалось удалить сообщение')
      }
    }

    // Добавление реакции
    const addReaction = async (message, emoji) => {
      try {
        const messengerService = (await import('@/services/messenger.service')).default
        // Проверяем есть ли метод addReaction в сервисе
        if (typeof messengerService.addReaction === 'function') {
          await messengerService.addReaction(message.id, emoji)
        }
        
        // Обновляем локально
        if (selectedChat.value?.messages) {
          const msgIndex = selectedChat.value.messages.findIndex(m => m.id === message.id)
          if (msgIndex !== -1) {
            const msg = selectedChat.value.messages[msgIndex]
            if (!msg.reactions) msg.reactions = {}
            msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1
          }
        }
      } catch (error) {
        console.error('Ошибка при добавлении реакции:', error)
      }
    }

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
      if (showAttachMenu.value) showAttachMenu.value = false
    }

    const selectEmojiCategory = (category) => {
      currentEmojiCategory.value = category.name
    }

    const insertEmoji = (emoji) => {
      newMessage.value += emoji
      showEmojiPicker.value = false
    }

    const formatText = (type) => {
      // Text formatting logic
    }

    // WebSocket handlers
    const setupWebSocketHandlers = () => {
      // Обработчик онлайн пользователей
      const unsubUserOnline = websocketService.on('user:online', (data) => {
        if (data.userId && !onlineUsers.value.includes(data.userId)) {
          onlineUsers.value.push(data.userId)
        }
      })
      wsUnsubscribers.push(unsubUserOnline)

      const unsubUserOffline = websocketService.on('user:offline', (data) => {
        onlineUsers.value = onlineUsers.value.filter(id => id !== data.userId)
      })
      wsUnsubscribers.push(unsubUserOffline)

      const unsubNewMessage = websocketService.on('chat:newMessage', (message) => {
        console.log('[WS Handler] Получено сообщение:', message.id, 'chatId:', message.chatId)
        
        // Проверка на дубликат по ID
        if (isMessageProcessed(message.id)) {
          console.log('[WS Handler] Сообщение уже обработано, пропускаем:', message.id)
          return
        }
        
        // Проверяем, не является ли это наше собственное сообщение
        const myUserId = localStorage.getItem('userId')
        const senderId = message.senderId || message.sender?.id
        const isOwnMsg = String(senderId) === String(myUserId)
        
        // Добавляем в обработанные
        addProcessedMessageId(message.id)

        if (selectedChat.value && message.chatId === selectedChat.value.id) {
          if (!selectedChat.value.messages) selectedChat.value.messages = []
          
          // Проверяем существование по ID
          const existsById = selectedChat.value.messages.some(m => m.id === message.id)
          
          // Проверяем, нет ли временного сообщения с таким же текстом от того же отправителя
          // (на случай если ответ API пришёл раньше WebSocket)
          const existsTemp = isOwnMsg && selectedChat.value.messages.some(m => 
            m._isTemp && 
            m.text === message.text && 
            String(m.senderId) === String(senderId)
          )
          
          if (existsById) {
            console.log('[WS Handler] Сообщение уже существует в чате:', message.id)
            return
          }
          
          if (existsTemp) {
            // Заменяем временное сообщение на реальное
            const tempIndex = selectedChat.value.messages.findIndex(m => 
              m._isTemp && 
              m.text === message.text && 
              String(m.senderId) === String(senderId)
            )
            if (tempIndex !== -1) {
              console.log('[WS Handler] Заменяем временное сообщение на реальное')
              selectedChat.value.messages[tempIndex] = message
              return
            }
          }
          
          // Добавляем новое сообщение
          console.log('[WS Handler] Добавляем новое сообщение в чат')
          selectedChat.value.messages.push(message)
          nextTick(() => scrollToBottom())
        }

        // Обновляем список чатов
        const chatIndex = chats.value.findIndex(c => c.id === message.chatId)
        if (chatIndex !== -1) {
          const chat = chats.value[chatIndex]
          
          // Обновляем lastMessage для отображения в списке
          chat.lastMessage = message
          
          // Увеличиваем счётчик непрочитанных только если это не текущий чат и не наше сообщение
          if ((!selectedChat.value || selectedChat.value.id !== message.chatId) && !isOwnMsg) {
            chat.unreadCount = (chat.unreadCount || 0) + 1
          }
        }
      })
      wsUnsubscribers.push(unsubNewMessage)

      const unsubTyping = websocketService.on('chat:typing', (data) => {
        const chatId = data.chatId
        const userId = data.userId
        const myUserId = localStorage.getItem('userId')
        
        // Игнорируем свои собственные события печати
        if (String(userId) === String(myUserId)) return
        
        if (!typingUsers.value[chatId]) {
          typingUsers.value[chatId] = []
        }
        
        if (data.isTyping) {
          // Добавляем пользователя в список печатающих
          if (!typingUsers.value[chatId].includes(userId)) {
            typingUsers.value[chatId].push(userId)
          }
          
          // Автоматически убираем через 3 секунды (на случай если событие "перестал печатать" не пришло)
          setTimeout(() => {
            if (typingUsers.value[chatId]) {
              typingUsers.value[chatId] = typingUsers.value[chatId].filter(id => id !== userId)
            }
          }, 3000)
        } else {
          // Убираем пользователя из списка печатающих
          typingUsers.value[chatId] = typingUsers.value[chatId].filter(id => id !== userId)
        }
      })
      wsUnsubscribers.push(unsubTyping)
      
      // Обработчик редактирования сообщений
      const unsubMessageEdited = websocketService.on('chat:messageEdited', (message) => {
        if (selectedChat.value && message.chatId === selectedChat.value.id) {
          const msgIndex = selectedChat.value.messages?.findIndex(m => m.id === message.id)
          if (msgIndex !== -1) {
            selectedChat.value.messages[msgIndex] = message
          }
        }
      })
      wsUnsubscribers.push(unsubMessageEdited)
      
      // Обработчик удаления сообщений
      const unsubMessageDeleted = websocketService.on('chat:messageDeleted', (data) => {
        if (selectedChat.value && data.chatId === selectedChat.value.id) {
          const msgIndex = selectedChat.value.messages?.findIndex(m => m.id === data.messageId)
          if (msgIndex !== -1) {
            selectedChat.value.messages.splice(msgIndex, 1)
          }
        }
      })
      wsUnsubscribers.push(unsubMessageDeleted)
    }

    onMounted(async () => {
      setupWebSocketHandlers()

      if (!websocketService.isAuthenticated.value) {
        websocketService.connect()
        await websocketService.waitForConnection(10000)
      }
      
      // Получаем начальный список онлайн пользователей
      onlineUsers.value = websocketService.onlineUsers.value || []

      const chatId = await loadChats(currentUserId)
      if (chatId) handleSelectChat(chatId)
    })

    onUnmounted(() => {
      if (selectedChat.value) {
        websocketService.leaveChat(selectedChat.value.id)
      }
      wsUnsubscribers.forEach(unsub => {
        if (typeof unsub === 'function') unsub()
      })
    })

    return {
      // State
      currentUserId,
      chats,
      selectedChat,
      activeTab,
      searchQuery,
      loading,
      newMessage,
      showEmojiPicker,
      showFormatting,
      showChatSettings,
      showImagePreviewModal,
      previewMessage,
      messageListRef,
      onlineUsers,
      
      // Computed
      personalChatsCount,
      groupChatsCount,
      unreadCount,
      filteredChats,
      groupedMessages,
      canSendMessage,
      currentCategoryEmojis,
      typingInCurrentChat,
      
      // Messages
      replyingTo,
      isOwnMessage,
      scrollToMessage,
      replyToMessage,
      cancelReply,
      startEditMessage,
      deleteMessage,
      addReaction,
      toggleReaction,
      downloadFile,
      downloadImage,
      
      // File upload
      showFileUploadModal,
      selectedFile,
      filePreviewUrl,
      uploadProgress,
      uploadInProgress,
      isImageUpload,
      dragOver,
      showAttachMenu,
      toggleAttachMenu,
      attachImage,
      attachFile,
      handleFileSelect,
      handleFileDrop,
      removeSelectedFile,
      uploadSelectedFile,
      cancelFileUpload,
      
      // Group management
      showCreateGroupModal,
      showGroupInfoModal,
      showAddMembersModal,
      groupMembers,
      groupInfoActiveTab,
      memberSearchQuery,
      groupNotifications,
      newGroup,
      userSearch,
      searchResults,
      selectedUsers,
      isCurrentUserAdmin,
      filteredGroupMembers,
      addUser,
      removeUser,
      selectUserToAdd,
      removeSelectedUser,
      addMembersToGroup,
      removeMember,
      changeGroupAvatar,
      confirmDeleteGroup,
      handleEditGroup,
      handleAddMembers,
      
      // Chat actions
      handleSelectChat,
      handleCreateGroup,
      handleSearchUsers,
      handleShowImagePreview,
      toggleChatMenu,
      pinChat,
      markAsUnread,
      muteChat,
      leaveGroup,
      
      // Message input
      sendMessage,
      handleTyping,
      toggleEmojiPicker,
      selectEmojiCategory,
      insertEmoji,
      formatText,
      emojiCategories,
      currentEmojiCategory
    }
  }
}
</script>

<style scoped>
.messenger-page {
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

/* Blue Header */
.page-header-blue {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  color: #fff;
  box-shadow: 0 8px 30px rgba(37,99,235,0.2);
  flex-shrink: 0;
}

.page-header-blue .header-left { flex: 1; }

.page-header-blue .header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.page-header-blue .header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.page-header-blue .header-subtitle {
  font-size: 0.95rem;
  opacity: 0.85;
  margin: 0;
}

.page-header-blue .header-stats {
  display: flex;
  gap: 0.875rem;
  flex-shrink: 0;
}

.page-header-blue .stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.page-header-blue .stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header-blue .stat-content {
  display: flex;
  flex-direction: column;
}

.page-header-blue .stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.page-header-blue .stat-label {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 0.15rem;
}

.messenger {
  display: flex;
  flex: 1;
  background: #ffffff;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.messenger-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.messenger-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #94a3b8;
}

.placeholder-content i {
  font-size: 64px;
  margin-bottom: 16px;
}

.placeholder-content h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
</style>
