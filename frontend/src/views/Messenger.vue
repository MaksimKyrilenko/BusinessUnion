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
        <div class="chat-info" @click="selectedChat && selectedChat.type === 'group' ? showGroupInfoModal = true : null" :class="{ 'clickable': selectedChat && selectedChat.type === 'group' }">
          <img :src="selectedChat && selectedChat.type === 'personal' && selectedChat.participants && selectedChat.participants.length ? 
                    getUserAvatar(selectedChat.participants.find(p => String(p.id) !== String(currentUserId))) : 
                    (selectedChat && selectedChat.avatar ? selectedChat.avatar : '/assets/images/default-avatar.svg')" 
                :alt="selectedChat ? selectedChat.name : 'Чат'">
          <div>
            <h2>{{ selectedChat && selectedChat.type === 'personal' && selectedChat.participants && selectedChat.participants.length ? 
                  getUserFullName(selectedChat.participants.find(p => String(p.id) !== String(currentUserId))) : 
                  (selectedChat ? selectedChat.name : 'Чат') }}</h2>
            <span v-if="selectedChat && selectedChat.type === 'personal'" class="status">{{ selectedChat && selectedChat.status === 'online' ? 'В сети' : 'Не в сети' }}</span>
          </div>
        </div>
        <div class="chat-actions" v-if="selectedChat && selectedChat.type === 'personal'">
          <button @click="showChatSettings = true">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <template v-for="(group, date) in groupedMessages" :key="date">
          <div class="date-separator">
          <span class="date-label">{{ formatDate(date) }}</span>
          </div>
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
                  <img :src="message.fileUrl || message.url" @click="showImagePreview(message)">
                  <div class="image-overlay">
                    <button class="image-action-btn" @click.stop="downloadImage(message)">
                      <i class="fas fa-download"></i>
                    </button>
                    <button class="image-action-btn" @click.stop="showImagePreview(message)">
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
        </template>
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
        <div class="attach-btn-container">
          <button class="attach-btn" @click="toggleAttachMenu">
          <i class="fas fa-paperclip"></i>
        </button>
          <div v-if="showAttachMenu" class="attach-menu" @click.stop>
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
        </div>
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
          <button class="emoji-btn" @click="toggleEmojiPicker">
            <i class="far fa-smile"></i>
          </button>
        </div>
        <button 
          class="send-btn" 
          @click.prevent.stop="sendMessage" 
          :class="{'enabled': canSendMessage}"
          type="button">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>

      <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
        <div class="emoji-picker-arrow"></div>
        <div class="emoji-categories">
          <button
            v-for="category in emojiCategories" 
            :key="category.name"
            @click="selectEmojiCategory(category)"
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
            @click="insertEmoji(emoji)"
            class="emoji-btn-item"
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
            <div class="input-wrapper no-border">
              <i class="fas fa-users"></i>
              <input 
                v-model="newGroup.name" 
                type="text" 
                placeholder="Введите название группы"
                required
                class="no-border"
              >
            </div>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <div class="input-wrapper no-border">
              <i class="fas fa-info-circle"></i>
              <textarea 
                v-model="newGroup.description"
                placeholder="Добавьте описание группы"
                rows="3"
                class="no-border"
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
                  <button @click="(event) => removeUser(user, event)" class="remove-user">
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
              <div class="input-wrapper no-border">
                <i class="fas fa-search"></i>
                <input 
                  type="text" 
                  v-model="userSearch" 
                  @input="searchUsers" 
                  placeholder="Поиск пользователей..."
                  class="no-border"
                >
              </div>
              <div v-if="searchResults.length" class="search-results">
                <div 
                  v-for="user in searchResults" 
                  :key="user.id"
                  class="search-result"
                  @click="(event) => addUser(user, event)"
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
                <span>Пользователи не найдены</span>
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
            :disabled="!newGroup.name"
          >
            <i class="fas fa-check"></i>
            Создать
          </button>
        </div>
      </div>
    </modal>

    <!-- Модальное окно информации о группе -->
    <modal v-if="showGroupInfoModal" @close="showGroupInfoModal = false" class="group-info-fullscreen-modal">
      <div class="group-info-modal">
        
        <div class="group-info-content">
          <div class="group-header">
            <div class="group-avatar">
              <img :src="selectedChat && selectedChat.avatar ? selectedChat.avatar : '/assets/images/default-avatar.svg'" alt="Аватар группы">
              <div class="edit-avatar" v-if="isCurrentUserAdmin" @click="changeGroupAvatar">
                <i class="fas fa-camera"></i>
              </div>
            </div>
            <div class="group-details">
              <div class="group-name-section">
                <h2>{{ selectedChat ? selectedChat.name : 'Название группы' }}</h2>
              </div>
              <div class="group-created">
                <i class="fas fa-calendar-alt"></i> 
                Создан: {{ selectedChat && selectedChat.createdAt ? formatDate(selectedChat.createdAt) : 'Нет данных' }}
              </div>
              <div class="description-section">
                <div class="description-header">
                  <h4 style="color: white;">Описание</h4>
                </div>
                <p class="group-description">{{ selectedChat ? selectedChat.description || 'Нет описания' : 'Описание группы' }}</p>
              </div>
              <div class="group-stats">
                <div class="stat-item">
                  <i class="fas fa-users"></i>
                  <span>{{ groupMembers && groupMembers.length > 0 ? `${groupMembers.length} участников` : 'Загрузка участников...' }}</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-comment-alt"></i>
                  <span>{{ selectedChat && selectedChat.messages ? selectedChat.messages.length : 0 }} сообщений</span>
                </div>
              </div>
              <!-- Добавляем кнопку редактирования группы -->
              <div class="group-action-buttons" v-if="isCurrentUserAdmin">
                <button class="group-edit-btn" @click="showEditGroupModal = true">
                  <i class="fas fa-edit"></i> Редактировать группу
                </button>
                <button class="group-add-members-btn" @click="showAddMembersModal = true">
                  <i class="fas fa-user-plus"></i> Добавить участников
                </button>
              </div>
            </div>
          </div>
          
          <div class="group-tabs">
            <button 
              :class="['tab-btn', { active: groupInfoActiveTab === 'members' }]"
              @click="groupInfoActiveTab = 'members'"
            >
              <i class="fas fa-users"></i> Участники
            </button>
            <button 
              :class="['tab-btn', { active: groupInfoActiveTab === 'media' }]"
              @click="groupInfoActiveTab = 'media'"
            >
              <i class="fas fa-photo-video"></i> Медиа
            </button>
            <button 
              :class="['tab-btn', { active: groupInfoActiveTab === 'files' }]"
              @click="groupInfoActiveTab = 'files'"
            >
              <i class="fas fa-file"></i> Файлы
            </button>
            <button 
              :class="['tab-btn', { active: groupInfoActiveTab === 'settings' }]"
              @click="groupInfoActiveTab = 'settings'"
              v-if="isCurrentUserAdmin || isCurrentUserCreator"
            >
              <i class="fas fa-cog"></i> Настройки
            </button>
          </div>
          
          <div class="tab-content">
            <!-- Добавляем кнопки в заметное место прямо под вкладками -->
            <div class="action-buttons-container" v-if="isCurrentUserAdmin">
              <button class="action-button edit-group-button" @click="showEditGroupModal = true">
                <i class="fas fa-edit"></i> Редактировать группу
              </button>
              <button class="action-button add-members-button" @click="showAddMembersModal = true">
                <i class="fas fa-user-plus"></i> Добавить участников
              </button>
            </div>
            
            <!-- Вкладка участников -->
            <div v-if="groupInfoActiveTab === 'members'" class="members-tab">
              <div class="members-header">
                <h4>Участники группы</h4>
              </div>
              
              <div class="members-search">
                <i class="fas fa-search"></i>
                <input type="text" v-model="memberSearchQuery" placeholder="Поиск по участникам...">
              </div>
              
              <div v-if="groupMembers && groupMembers.length > 0" class="members-list">
                <div v-for="member in filteredGroupMembers" :key="member.id" class="member-item">
                  <div class="member-avatar">
                    <img :src="getUserAvatar(member)" :alt="getUserFullName(member)">
                    <span class="online-status" :class="{ online: member.isOnline }"></span>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ getUserFullName(member) }}</div>
                    <div class="member-role">{{ getMemberRoleText(member.role) }}</div>
                  </div>
                  <div class="member-actions" v-if="isCurrentUserAdmin && !isMemberOwner(member)">
                    <button class="member-options-btn">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="member-options-menu">
                      <button @click="changeMemberRole(member)">
                        <i class="fas fa-user-shield"></i> Сделать администратором
                      </button>
                      <button @click="removeMember(member)" class="danger">
                        <i class="fas fa-user-times"></i> Удалить из группы
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-members">
                <div class="empty-state">
                  <i class="fas fa-users"></i>
                  <p>Участники не найдены</p>
                </div>
              </div>
            </div>
            
            <!-- Вкладка медиа -->
            <div v-else-if="groupInfoActiveTab === 'media'" class="media-tab">
              <div class="empty-state">
                <i class="fas fa-photo-video"></i>
                <p>Нет медиафайлов</p>
              </div>
            </div>
            
            <!-- Вкладка файлов -->
            <div v-else-if="groupInfoActiveTab === 'files'" class="files-tab">
              <div class="empty-state">
                <i class="fas fa-file"></i>
                <p>Нет файлов</p>
              </div>
            </div>
            
            <!-- Вкладка настроек -->
            <div v-else-if="groupInfoActiveTab === 'settings'" class="settings-tab">
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <i class="fas fa-bell"></i>
                    <div class="setting-text">
                      <div class="setting-title">Уведомления</div>
                      <div class="setting-desc">Получать уведомления о новых сообщениях</div>
                    </div>
                  </div>
                  <div class="setting-control">
                    <label class="switch">
                      <input type="checkbox" v-model="groupNotifications">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
                
                <div class="setting-item danger">
                  <div class="setting-info">
                    <i class="fas fa-trash"></i>
                    <div class="setting-text">
                      <div class="setting-title">Удалить группу</div>
                      <div class="setting-desc">Удалить группу для всех участников</div>
                    </div>
                  </div>
                  <div class="setting-control">
                    <button class="btn-danger" @click="confirmDeleteGroup">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- КНОПКИ В ОДНОМ РЯДУ -->
        <div class="group-action-buttons">
          <button class="action-button edit-button" @click="handleEditGroup">
            <i class="fas fa-edit"></i> ИЗМЕНИТЬ
          </button>
          <button class="action-button add-button" @click="handleAddMembers">
            <i class="fas fa-user-plus"></i> ДОБАВИТЬ
          </button>
          <button class="action-button leave-button" @click="leaveGroup(selectedChat)">
            <i class="fas fa-sign-out-alt"></i> ВЫЙТИ
          </button>
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
              <i class="fas" :class="isImageUpload ? 'fa-image' : 'fa-file-alt'"></i>
              <p>Перетащите {{ isImageUpload ? 'изображение' : 'файл' }} сюда или нажмите для выбора</p>
              <div class="drag-hint">
                <i class="fas fa-hand-point-up"></i>
                Поддерживается перетаскивание (drag & drop)
              </div>
              <input type="file" ref="fileInput" @change="handleFileSelect" :accept="isImageUpload ? 'image/*' : '*'" style="display: none;">
              <button class="select-file-btn" @click="$refs.fileInput.click()">
                <i class="fas" :class="isImageUpload ? 'fa-image' : 'fa-file-upload'"></i>
                Выбрать {{ isImageUpload ? 'изображение' : 'файл' }}
              </button>
            </div>
            <div v-else class="selected-file-preview">
              <div v-if="isImageUpload && filePreviewUrl" class="image-preview">
                <img :src="filePreviewUrl" alt="Предпросмотр">
              </div>
              <div v-else class="file-info">
                <i class="fas" :class="getFileIcon(selectedFile.name)"></i>
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <button class="remove-file-btn" @click="removeSelectedFile">
                <i class="fas fa-trash-alt"></i> Удалить
              </button>
            </div>
          </div>
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
            <div class="progress-text">
              <i class="fas fa-sync-alt"></i>
              Загрузка {{ uploadProgress }}%
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelFileUpload">
            <i class="fas fa-times"></i>
            Отмена
          </button>
          <button 
            class="btn-primary" 
            @click="uploadSelectedFile" 
            :disabled="!selectedFile || uploadInProgress"
          >
            <i class="fas" :class="uploadInProgress ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
            {{ uploadInProgress ? 'Загрузка...' : 'Отправить' }}
          </button>
        </div>
      </div>
    </modal>

    <modal v-if="showChatInfo" @close="showChatInfo = false" :class="'info-modal'">
      <div class="chat-info-container" v-if="selectedChat">
        <div class="blue-background">
          <div class="group-avatar-container">
            <img
              :src="selectedChat.avatar || '/assets/images/default-avatar.svg'"
              alt="Group Avatar"
              class="group-avatar"
            />
            <div class="group-title">
              <h2>{{ selectedChat ? selectedChat.name : 'Название группы' }}</h2>
              <button class="edit-group-btn" @click="showEditGroupModal = true" v-if="isChatAdmin">
                <i class="fas fa-edit"></i> Редактировать группу
              </button>
            </div>
          </div>
        </div>
        
        <div class="tabs-container">
          <div
            class="tab-item"
            v-for="(tab, index) in tabs"
            :key="index"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </div>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'members'" class="members-tab">
            <div class="members-header">
              <h3>Участники ({{ selectedChat.users ? selectedChat.users.length : 0 }})</h3>
            </div>
            
            <div class="members-list">
              <div
                v-for="user in selectedChat.users"
                :key="user.id"
                class="member-item"
              >
                <div class="avatar-container">
                  <img
                    :src="user.profile && user.profile.avatar ? user.profile.avatar : '/assets/images/default-avatar.svg'"
                    alt="Avatar"
                    class="avatar"
                  />
                  <div
                    :class="['status-indicator', isUserOnline(user.id) ? 'online' : 'offline']"
                  ></div>
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email }}
                  </div>
                  <div class="member-role">
                    {{ getChatUserRole(user.id) }}
                  </div>
                </div>
                <div class="member-actions">
                  <button
                    v-if="isChatAdmin && user.id !== currentUser.id"
                    class="action-button remove-btn"
                    @click="removeMember(user.id)"
                  >
                    <i class="fas fa-user-minus"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="member-actions-container" v-if="isChatAdmin">
              <button class="action-button add-members-btn" @click="showAddMembersModal = true">
                <i class="fas fa-user-plus"></i> Добавить участников
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'media'" class="media-tab">
            <h3>Медиа файлы</h3>
            <div class="media-placeholder">
              <i class="fas fa-image placeholder-icon"></i>
              <p>Медиа файлы отсутствуют</p>
            </div>
          </div>

          <div v-if="activeTab === 'files'" class="files-tab">
            <h3>Документы</h3>
            <div class="files-placeholder">
              <i class="fas fa-file placeholder-icon"></i>
              <p>Документы отсутствуют</p>
            </div>
          </div>

          <div v-if="activeTab === 'settings'" class="settings-tab">
            <div class="settings-section">
              <h3>Настройки группы</h3>
              
              <div class="group-details">
                  <div class="group-created">
                    <i class="fas fa-calendar-alt"></i> 
                    Создан: {{ selectedChat && selectedChat.createdAt ? formatDate(selectedChat.createdAt) : 'Нет данных' }}
                  </div>
                  <div class="description-section">
                  <div class="description-header">
                    <h4>Описание</h4>
                  </div>
                  <p class="group-description">{{ selectedChat ? selectedChat.description || 'Нет описания' : 'Описание группы' }}</p>
                </div>
              </div>
              
              <div class="danger-zone" v-if="isChatAdmin">
                <h4>Опасная зона</h4>
                <button class="danger-button" @click="leaveChat">
                  <i class="fas fa-sign-out-alt"></i> Покинуть группу
                </button>
                <button class="danger-button delete-btn" @click="deleteChat">
                  <i class="fas fa-trash"></i> Удалить группу
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </modal>
    
    <!-- Модальное окно редактирования группы -->
    <modal v-if="showEditGroupModal" @close="showEditGroupModal = false">
      <div class="edit-group-modal">
        <div class="modal-header">
          <h3>Редактирование группы</h3>
        </div>
        <div class="edit-group-content">
          <div class="form-group">
            <label>Аватар группы</label>
            <div class="avatar-upload">
              <img 
                :src="editingGroup.avatar || '/assets/images/default-avatar.svg'" 
                alt="Аватар группы" 
                class="preview-avatar"
              />
              <button class="change-avatar-btn" @click="triggerAvatarUpload">
                <i class="fas fa-camera"></i> Изменить
              </button>
              <input 
                type="file" 
                :ref="el => { avatarInput = el }" 
                @change="handleAvatarChange" 
                accept="image/*" 
                style="display: none"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Название группы</label>
            <input 
              type="text" 
              v-model="editingGroup.name" 
              placeholder="Введите название группы"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="editingGroup.description" 
              placeholder="Введите описание группы"
              class="form-control"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditGroupModal = false">Отмена</button>
          <button class="btn-primary" @click="saveGroupChanges" :disabled="!editingGroup.name">Сохранить</button>
        </div>
      </div>
    </modal>
    
    <!-- Модальное окно добавления участников -->
    <modal v-if="showAddMembersModal" @close="showAddMembersModal = false">
      <div class="add-members-modal" @click.stop="">
        <div class="modal-header">
          <h3>Добавление участников</h3>
        </div>
        <div class="add-members-content">
          <div class="search-section">
            <div class="input-wrapper">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="userSearch" 
                @input="searchUsers" 
                placeholder="Поиск пользователей..."
                class="search-input"
              >
            </div>
          </div>
          
          <div v-if="selectedUsers.length > 0" class="selected-users-section">
            <h4>Выбранные пользователи</h4>
            <div class="selected-users-list">
              <div 
                v-for="user in selectedUsers" 
                :key="user.id"
                class="selected-user-item"
              >
                <img :src="getUserAvatar(user)" :alt="getUserName(user)" class="user-avatar">
                <span class="user-name">{{ getUserName(user) }}</span>
                <button class="remove-user-btn" @click.stop="removeSelectedUser(user)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="search-results-section">
            <div v-if="searchResults.length > 0" class="search-results-list">
              <div 
                v-for="user in searchResults" 
                :key="user.id"
                class="search-result-item"
              >
                <img :src="getUserAvatar(user)" :alt="getUserName(user)" class="user-avatar">
                <div class="user-info">
                  <span class="user-name">{{ getUserName(user) }}</span>
                  <span v-if="user.email" class="user-email">{{ user.email }}</span>
                </div>
                <button class="add-user-btn" @click.stop="selectUserToAdd(user)">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div v-else-if="userSearch && !searchResults.length" class="no-results">
              <i class="fas fa-search"></i>
              <p>Пользователи не найдены</p>
            </div>
            <div v-else-if="!userSearch" class="search-prompt">
              <i class="fas fa-user-plus"></i>
              <p>Начните вводить имя пользователя для поиска</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click.stop="showAddMembersModal = false">Отмена</button>
          <button 
            class="btn-primary" 
            @click.stop="addMembersToGroup"
            :disabled="!selectedUsers.length"
          >
            Добавить участников
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
import { useRouter } from 'vue-router'

export default {
  name: 'Messenger',
  components: {
    Modal
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
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
    
    // Новые переменные для расширенной информации о группе
    const groupInfoActiveTab = ref('members')
    const memberSearchQuery = ref('')
    const groupNotifications = ref(true)
    
    // Отфильтрованные участники группы для поиска
    const filteredGroupMembers = computed(() => {
      if (!memberSearchQuery.value) return groupMembers.value;
      const query = memberSearchQuery.value.toLowerCase();
      return groupMembers.value.filter(member => {
        const fullName = getUserFullName(member).toLowerCase();
        return fullName.includes(query);
      });
    })
    
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
    
    // showAddMembersModal уже объявлена выше
    const replyingTo = ref(null)
    const showFormatting = ref(false)
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
    
    // Вычисляемое свойство для проверки возможности отправки сообщения
    const canSendMessage = computed(() => {
      return selectedChat.value && newMessage.value.trim().length > 0;
    });
    
    // Функции для редактирования группы и добавления участников
    const editGroup = () => {
      console.log("Редактирование группы");
      if (selectedChat.value && selectedChat.value.type === 'group') {
        // Инициализируем данные редактирования
        editingGroup.value = {
          id: selectedChat.value.id,
          name: selectedChat.value.name || '',
          description: selectedChat.value.description || '',
          avatar: selectedChat.value.avatar || null
        };
        showEditGroupModal.value = true;
      }
    };
    
    const addMembers = () => {
      console.log("Добавление участников");
      if (selectedChat.value && selectedChat.value.type === 'group') {
        // Сбрасываем список выбранных пользователей
        selectedUsers.value = [];
        // Отображаем модальное окно добавления участников
        showAddMembersModal.value = true;
      }
    };
    
    // Обертки для оригинальных функций, чтобы обеспечить их работу через кнопки
    const handleEditGroup = () => {
      console.log('Вызов редактирования группы');
      editGroup();
    };
    
    const handleAddMembers = () => {
      console.log('Вызов добавления участников');
      addMembers();
    };
    
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
    
    // Функция для изменения роли участника
    const changeMemberRole = (member) => {
      // Логика изменения роли участника
      console.log(`Изменение роли участника ${getUserFullName(member)}`);
    };
    
    // Функция для редактирования названия группы
    const editGroupName = () => {
      const newName = prompt('Введите новое название группы:', selectedChat.value.name);
      if (newName && newName.trim() && newName !== selectedChat.value.name) {
        // Здесь будет API-запрос на обновление названия группы
        messengerService.updateGroupInfo(selectedChat.value.id, { name: newName })
          .then(() => {
            selectedChat.value.name = newName;
          })
          .catch(error => {
            console.error('Ошибка при обновлении названия группы:', error);
          });
      }
    };
    
    // Функция для редактирования описания группы
    const editGroupDescription = () => {
      const newDescription = prompt('Введите новое описание группы:', selectedChat.value.description || '');
      if (newDescription !== null && newDescription !== selectedChat.value.description) {
        // Здесь будет API-запрос на обновление описания группы
        messengerService.updateGroupInfo(selectedChat.value.id, { description: newDescription })
          .then(() => {
            selectedChat.value.description = newDescription;
          })
          .catch(error => {
            console.error('Ошибка при обновлении описания группы:', error);
          });
      }
    };
    
    // Функция для изменения аватара группы
    const changeGroupAvatar = () => {
      // Здесь будет логика для загрузки и установки нового аватара
      console.log('Изменение аватара группы');
      // Можно открыть модальное окно для загрузки изображения или использовать input type="file"
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Здесь будет API-запрос на загрузку аватара
          const formData = new FormData();
          formData.append('avatar', file);
          
          messengerService.uploadGroupAvatar(selectedChat.value.id, formData)
            .then(response => {
              selectedChat.value.avatar = response.data.avatarUrl;
            })
            .catch(error => {
              console.error('Ошибка при загрузке аватара:', error);
            });
        }
      };
      fileInput.click();
    };
    
    // Функция подтверждения удаления группы
    const confirmDeleteGroup = () => {
      if (confirm('Вы уверены, что хотите удалить группу? Это действие нельзя отменить.')) {
        // Логика удаления группы
        messengerService.deleteGroup(selectedChat.value.id)
          .then(() => {
            showGroupInfoModal.value = false;
            const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id);
            if (chatIndex !== -1) {
              chats.value.splice(chatIndex, 1);
            }
            selectedChat.value = null;
          })
          .catch(error => {
            console.error('Ошибка при удалении группы:', error);
          });
      }
    };
    
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
    
    // Функция для переключения видимости меню прикрепления файлов
    const toggleAttachMenu = () => {
      showAttachMenu.value = !showAttachMenu.value;
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
    
    const getFileIcon = (fileName) => {
      if (!fileName) return 'fa-file';
      
      const extension = fileName.split('.').pop().toLowerCase();
      
      // Определяем иконку на основе расширения файла
      switch (extension) {
        case 'pdf':
          return 'fa-file-pdf';
        case 'doc':
        case 'docx':
          return 'fa-file-word';
        case 'xls':
        case 'xlsx':
          return 'fa-file-excel';
        case 'ppt':
        case 'pptx':
          return 'fa-file-powerpoint';
        case 'zip':
        case 'rar':
        case '7z':
          return 'fa-file-archive';
        case 'txt':
          return 'fa-file-alt';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          return 'fa-file-image';
        case 'mp3':
        case 'wav':
        case 'ogg':
          return 'fa-file-audio';
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
          return 'fa-file-video';
        case 'js':
        case 'ts':
        case 'html':
        case 'css':
        case 'php':
        case 'py':
        case 'java':
        case 'c':
        case 'cpp':
          return 'fa-file-code';
        default:
          return 'fa-file';
      }
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
      console.log('Попытка отправки сообщения', {
        messageText: newMessage.value,
        hasSelectedChat: !!selectedChat.value
      });
      
      // Проверяем наличие текста напрямую
      if (!newMessage.value || !newMessage.value.trim()) {
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
      if (!message || (!message.fileUrl && !message.url)) {
        console.error('Файл для скачивания отсутствует');
        return;
      }
      
      const fileUrl = message.fileUrl || message.url;
      console.log(`Скачивание файла: ${message.fileName || 'файл'} из URL: ${fileUrl}`);
      
      // Создаем ссылку для скачивания
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = message.fileName || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Функция для скачивания изображений
    const downloadImage = (message) => {
      if (!message || (!message.fileUrl && !message.url)) {
        console.error('Изображение для скачивания отсутствует');
        return;
      }
      
      const imageUrl = message.fileUrl || message.url;
      console.log(`Скачивание изображения из URL: ${imageUrl}`);
      
      // Создаем ссылку для скачивания
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = message.fileName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

    const addUser = (user, event) => {
      // Предотвращаем всплытие события, чтобы не закрывалось модальное окно
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      console.log('Добавление пользователя в группу:', user)
      newGroup.value.users.push(user)
      searchResults.value = searchResults.value.filter(u => u.id !== user.id)
      userSearch.value = ''
      console.log(`В группе теперь ${newGroup.value.users.length} пользователей:`, 
                 newGroup.value.users.map(u => u.name))
    }

    const removeUser = (user, event) => {
      // Предотвращаем всплытие события, чтобы не закрывалось модальное окно
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      console.log('Удаление пользователя из группы:', user)
      newGroup.value.users = newGroup.value.users.filter(u => u.id !== user.id)
      console.log(`В группе осталось ${newGroup.value.users.length} пользователей`)
    }

    const createGroup = async () => {
      if (!newGroup.value.name.trim()) {
        console.warn('Невозможно создать группу: не заполнено название');
        alert('Для создания группы необходимо указать название');
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
        
        // Группа может быть создана даже с одним пользователем (владельцем)
        
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

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
      if (showAttachMenu.value) showAttachMenu.value = false
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

    const showEditGroupModal = ref(false)
    // showAddMembersModal уже определен выше
    
    // Данные для редактирования группы
    const editingGroup = ref({
      name: '',
      description: '',
      avatar: ''
    })
    
    // Массив для выбранных пользователей при добавлении в группу
    const selectedUsers = ref([])
    
    // Методы для редактирования группы
    const avatarInput = ref(null);
    
    const triggerAvatarUpload = () => {
      if (avatarInput.value) {
        avatarInput.value.click();
      }
    }
    
    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // Временный URL для предпросмотра
      editingGroup.value.avatarFile = file
      editingGroup.value.avatar = URL.createObjectURL(file)
    }
    
    const showEditGroupDialog = () => {
      if (!selectedChat.value) return
      
      // Инициализируем форму текущими данными группы
      editingGroup.value = {
        name: selectedChat.value.name || '',
        description: selectedChat.value.description || '',
        avatar: selectedChat.value.avatar || ''
      }
      
      showEditGroupModal.value = true
    }
    
    const saveGroupChanges = async () => {
      try {
        console.log('Начало сохранения изменений группы:', editingGroup.value);
        
        if (!editingGroup.value.name) {
          alert('Название группы обязательно')
          return
        }
        
        if (!selectedChat.value || !selectedChat.value.id) {
          console.error('Ошибка: selectedChat или его ID не определены', selectedChat.value);
          alert('Ошибка: выбранный чат не определен')
          return
        }
        
        // Убедимся, что ID чата - это число
        const chatId = Number(selectedChat.value.id);
        if (isNaN(chatId)) {
          console.error('Ошибка: ID чата не является числом:', selectedChat.value.id);
          alert('Ошибка: некорректный ID чата')
          return
        }
        
        console.log('ID выбранного чата (после преобразования):', chatId);
        
        // Проверяем наличие токена напрямую
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        console.log('Проверка авторизации:', {
          token: token ? 'присутствует' : 'отсутствует',
          userId: userId || 'отсутствует'
        });
        
        if (!token) {
          console.error('Ошибка: токен не найден в localStorage');
          alert('Для продолжения необходимо выполнить вход в систему заново.');
          return;
        }
        
        // Сначала обновляем основную информацию
        const updateData = {
          name: editingGroup.value.name,
          description: editingGroup.value.description || '' // Убедимся, что описание не undefined
        }
        
        console.log('Отправка данных для обновления группы:', updateData);
        
        try {
          const response = await messengerService.updateGroupInfo(chatId, updateData);
          console.log('Ответ от сервера при обновлении группы:', response);
        } catch (updateError) {
          console.error('Ошибка при обновлении информации о группе:', updateError);
          
          // Проверяем, не связана ли ошибка с авторизацией
          if (updateError.response && updateError.response.status === 401) {
            alert('Срок действия вашей сессии истек. Пожалуйста, войдите снова.');
            // Перенаправляем на страницу входа
            router.push('/login');
            return;
          }
          
          throw updateError;
        }
        
        // Если есть новый аватар, отправляем его отдельно
        if (editingGroup.value.avatarFile) {
          console.log('Загрузка нового аватара группы:', editingGroup.value.avatarFile);
          
          const formData = new FormData()
          formData.append('avatar', editingGroup.value.avatarFile)
          
          try {
            const avatarResponse = await messengerService.uploadGroupAvatar(chatId, formData)
            console.log('Ответ от сервера при загрузке аватара:', avatarResponse);
            
            if (avatarResponse && avatarResponse.data && avatarResponse.data.avatarUrl) {
              selectedChat.value.avatar = avatarResponse.data.avatarUrl
            }
          } catch (avatarError) {
            console.error('Ошибка при загрузке аватара группы:', avatarError);
            // Продолжаем выполнение даже при ошибке загрузки аватара
          }
        }
        
        // Обновляем данные выбранного чата
        selectedChat.value.name = editingGroup.value.name
        selectedChat.value.description = editingGroup.value.description
        
        // Обновляем данные в списке чатов
        const chatIndex = chats.value.findIndex(chat => chat.id === chatId)
        if (chatIndex !== -1) {
          console.log('Обновление чата в списке, индекс:', chatIndex);
          chats.value[chatIndex].name = editingGroup.value.name
          if (editingGroup.value.avatar && !editingGroup.value.avatarFile) {
            chats.value[chatIndex].avatar = editingGroup.value.avatar
          }
        }
        
        console.log('Группа успешно обновлена');
        
        // Закрываем модальное окно
        showEditGroupModal.value = false
      } catch (error) {
        console.error('Ошибка при обновлении группы:', error);
        console.error('Детали ошибки:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        alert('Не удалось обновить информацию о группе. Пожалуйста, проверьте консоль для деталей.');
      }
    }
    
    // Методы для добавления участников
    const selectUserToAdd = (user) => {
      if (!selectedUsers.value.some(u => u.id === user.id)) {
        selectedUsers.value.push(user)
        searchResults.value = searchResults.value.filter(u => u.id !== user.id)
      }
    }
    
    const removeSelectedUser = (user) => {
      selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
    }
    
    const addMembersToGroup = async () => {
      if (!selectedChat.value || !selectedUsers.value.length) return
      
      try {
        const userIds = selectedUsers.value.map(user => user.id)
        
        await messengerService.addUsersToChat(selectedChat.value.id, userIds)
        
        // Обновляем список участников
        await loadGroupMembers(selectedChat.value.id)
        
        // Очищаем выбранных пользователей и закрываем модальное окно
        selectedUsers.value = []
        showAddMembersModal.value = false
        
        // Обновляем счетчики в интерфейсе
        if (selectedChat.value.users) {
          selectedChat.value.users = [...selectedChat.value.users, ...selectedUsers.value]
        }
      } catch (error) {
        console.error('Ошибка при добавлении участников:', error)
        alert('Не удалось добавить участников в группу')
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
      canSendMessage,
      selectChat,
      sendMessage,
      toggleAttachMenu,
      formatTime,
      formatDate,
      searchUsers,
      addUser,
      removeUser,
      createGroup,
      selectUserToAdd,
      addMembersToGroup,
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
      downloadImage,
      getFileIcon,
      showImagePreview,
      getStatusIcon,
      showReactions,
      toggleReaction,
      editMessage,
      scrollToMessage,
      selectEmojiCategory,
      insertEmoji,
      toggleEmojiPicker,
      chatItem,
      showGroupInfoModal,
      showEditMessageModal,
      showForwardMessageModal,
      showFileUploadModal,
      showAddMembersModal,
      showEditGroupModal,
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
      changeMemberRole,
      editGroupName,
      editGroupDescription,
      changeGroupAvatar,
      confirmDeleteGroup,
      isCurrentUserCreator: isCurrentUserOwner,
      removeMember,
      deleteGroup,
      handleEditGroup,
      handleAddMembers,
      groupInfoActiveTab,
      memberSearchQuery,
      filteredGroupMembers,
      groupNotifications,
      showFileUploader,
      handleFileSelect,
      handleFileDrop,
      removeSelectedFile,
      formatFileSize,
      getFileIcon,
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
      updateLastMessage,
      editingGroup,
      selectedUsers,
      avatarInput,
      triggerAvatarUpload,
      handleAvatarChange,
      showEditGroupDialog,
      saveGroupChanges
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
  background-color: #f9fbfd;
}

.date-separator {
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
}

.date-separator::before, 
.date-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(33, 150, 243, 0.2), transparent);
  margin: 0 15px;
}

.date-label {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2));
  color: #2196F3;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  display: inline-block;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 2;
  text-align: center;
  min-width: 100px;
}

.message {
  display: flex;
  margin-bottom: 0.8rem;
  position: relative;
  max-width: 80%;
  width: fit-content;
}

.message-own {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-content {
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.message-text {
  background: white;
  padding: 1rem 1.2rem;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  color: #2c3e50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
  font-size: 0.95rem;
  word-break: break-word;
}

.message-own .message-text {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border-radius: 18px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 10px rgba(33, 150, 243, 0.2);
}

.message-image {
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  background-color: white;
  padding: 3px;
}

.message-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  cursor: pointer;
  display: block;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.message-image:hover img {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.message-image:hover .image-overlay {
  opacity: 1;
}

.highlighted-message {
  animation: highlight-pulse 2s ease;
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
  100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
}

.image-action-btn {
  background: white;
  color: #2196F3;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.image-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.message-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  max-width: 350px;
  border-left: 3px solid #2196F3;
}

.message-file:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
}

.file-info i {
  font-size: 1.5rem;
  color: #2196F3;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  overflow: hidden;
}

.file-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.file-size {
  font-size: 0.8rem;
  color: #666;
}

.download-btn {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  transform: scale(1.1);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: #666;
  padding: 0 0.5rem;
}

.message-own .message-meta {
  flex-direction: row-reverse;
}

.message-time {
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 8px;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-status i {
  font-size: 0.9rem;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #f8f8f8;
  border-radius: 1.5rem;
  padding: 0.5rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e6e6;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #2196F3;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(33, 150, 243, 0.2);
  background: white;
}

.input-wrapper textarea {
  width: 100%;
  border: none;
  background: none;
  resize: none;
  padding: 0.5rem 3rem 0.5rem 0.8rem;
  font-size: 1rem;
  max-height: 150px;
  min-height: 25px;
  outline: none;
}

.attach-btn-container {
  position: relative;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-btn i,
.emoji-btn i,
.send-btn i {
  font-size: 1.5rem;
}

.attach-btn {
  padding: 0.75rem 1rem;
}

.emoji-btn {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.5rem;
}

.attach-btn:hover,
.emoji-btn:hover {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.send-btn {
  color: #ccc;
  padding: 0.75rem 1rem;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.send-btn.enabled {
  color: #2196F3;
  cursor: pointer;
}

.send-btn.enabled:hover {
  background-color: #2196F3;
  color: white;
  transform: translateY(-2px);
}

.send-btn:not(.enabled) {
  cursor: not-allowed;
  opacity: 0.7;
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
  width: 40px;
  height: 40px;
  margin-right: 0.8rem;
  position: relative;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
}

.message-bubble {
  position: relative;
}

.message-author {
  font-size: 0.85rem;
  color: #2196F3;
  margin-bottom: 0.4rem;
  font-weight: 500;
}

.message-reply-preview {
  background: rgba(33, 150, 243, 0.05);
  border-left: 3px solid #2196F3;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-reply-preview:hover {
  background: rgba(33, 150, 243, 0.08);
}

.reply-content {
  font-size: 0.9rem;
  line-height: 1.4;
}

.reply-author {
  color: #2196F3;
  font-weight: 600;
  margin-bottom: 0.2rem;
  display: block;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  position: absolute;
  right: 0;
  top: -20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-own .message-actions {
  left: 0;
  right: auto;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.3rem;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background: white;
  color: #2196F3;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.reaction-badge {
  background: white;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.reaction-badge:hover {
  background: #f0f8ff;
  transform: scale(1.05);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.reply-bar {
  padding: 1rem 1.2rem;
  background: rgba(33, 150, 243, 0.05);
  border-top: 1px solid rgba(33, 150, 243, 0.1);
  position: relative;
}

.reply-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2196F3;
}

.reply-preview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.close-reply {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.close-reply:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #f44336;
  transform: rotate(90deg);
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
  bottom: 65px;
  right: 80px;
  background: linear-gradient(145deg, #ffffff, #f3f5f7);
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding: 12px 10px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.emoji-picker-arrow {
  position: absolute;
  bottom: -10px;
  right: 30px;
  width: 20px;
  height: 10px;
  background: #f3f5f7;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

.emoji-categories {
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 10px;
  overflow-x: auto;
  flex-wrap: wrap;
  justify-content: center;
}

.emoji-categories button {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 18px;
  margin: 0 3px;
}

.emoji-categories button:hover {
  background: #f0f4f8;
  transform: translateY(-2px);
}

.emoji-categories button.active {
  background: linear-gradient(135deg, #e6f2ff, #c9e2ff);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.emoji-category-title {
  font-size: 14px;
  color: #5a6783;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
  padding: 0 10px;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  padding: 5px;
  overflow-y: auto;
  max-height: 280px;
}

.emoji-list button {
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 20px;
}

.emoji-list button:hover {
  background: #f0f4f8;
  transform: scale(1.2);
}

.emoji-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #5a6783;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease, transform 0.2s ease;
}

.emoji-btn:hover {
  color: #2196F3;
  transform: scale(1.1);
}

.emoji-btn-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  box-shadow: none;
  overflow: hidden;
}

.create-group-modal .modal-header {
  padding: 20px 24px;
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  background: #ffffff;
}

.create-group-modal .modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
}

.create-group-modal .create-group-form {
  padding: 24px;
  background: #ffffff;
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
  padding: 14px 16px;
  border: 1px solid black !important;
  border-radius: 12px;
  font-size: 15px;
  color: #2d3748;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.no-border {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  background-color: #ffffff !important;
}

.create-group-modal .form-group input:focus,
.create-group-modal .form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: none;
}

.create-group-modal .form-group textarea {
  resize: none;
  height: 80px;
  padding-top: 16px;
}

.create-group-modal .selected-users-container {
  margin-top: 12px;
  border: 1px solid black !important;
  border-radius: 16px;
  padding: 14px;
  height: 120px;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: none !important;
}

.create-group-modal .selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.create-group-modal .selected-user {
  display: flex;
  align-items: center;
  background-color: #eef2ff;
  border-radius: 30px;
  padding: 6px 12px;
  margin-bottom: 8px;
  box-shadow: none;
  border: 1px solid #e0e7ff;
}

.create-group-modal .selected-user img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.create-group-modal .selected-user span {
  font-size: 14px;
  color: #4f46e5;
  font-weight: 500;
  margin-right: 8px;
}

.create-group-modal .remove-user {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.create-group-modal .remove-user:hover {
  background-color: rgba(99, 102, 241, 0.1);
  color: #4338ca;
}

.create-group-modal .no-users-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 14px;
}

.create-group-modal .no-users-selected i {
  margin-right: 8px;
  font-size: 18px;
}

.create-group-modal .search-users-container {
  margin-top: 15px;
}

.create-group-modal .search-users-container .input-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.create-group-modal .search-users-container .input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
}

.create-group-modal .search-users-container input {
  padding-left: 42px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid black !important;
  box-shadow: none !important;
  outline: none !important;
}

.create-group-modal .search-results {
  margin-top: 12px;
   border: 1px solid black !important;
  border-radius: 16px;
  height: 160px;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: none;
}

.create-group-modal .search-result {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: none;
  position: relative;
  margin-bottom: 4px;
  border-radius: 12px;
}

.create-group-modal .search-result:hover {
  background: #f5f7ff;
}

.create-group-modal .search-result:last-child {
  margin-bottom: 0;
}

.create-group-modal .search-result img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.create-group-modal .add-user {
  background-color: #f0f4ff;
  border: 1px solid #e0e7ff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.create-group-modal .add-user:hover {
  background-color: #6366f1;
  color: white;
  transform: scale(1.1);
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
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 20px 20px;
  background: #ffffff;
}

.create-group-modal .btn-secondary {
  padding: 12px 22px;
  border-radius: 20px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: none;
}

.create-group-modal .btn-secondary:hover {
  background: #f9fafb;
  color: #475569;
  transform: translateY(-1px);
}

.create-group-modal .btn-primary,
.create-group-modal .create-btn {
  padding: 12px 24px;
  border-radius: 20px;
  background-color: #2196F3 !important;
  color: white !important;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(33, 150, 243, 0.3);
}

.create-group-modal .btn-primary:hover,
.create-group-modal .create-btn:hover {
  background-color: #1976D2 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.4);
}

.create-group-modal .btn-primary:disabled,
.create-group-modal .create-btn:disabled {
  background-color: #2196F3 !important;
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
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

.create-group-modal .add-user:hover {
  background-color: #4299e1;
  color: white;
  transform: scale(1.1);
}

.create-group-modal .no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #a0aec0;
  font-size: 14px;
  background-color: #f9fafb;
  border-radius: 12px;
  margin: 10px 0;
  padding: 20px;
  border: 1px dashed #e5e7eb;
}

.create-group-modal .no-results i {
  font-size: 24px;
  color: #cbd5e0;
  margin-bottom: 10px;
}

.create-group-modal .input-wrapper {
  position: relative;
}

.create-group-modal .input-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.create-group-modal .input-wrapper input,
.create-group-modal .input-wrapper textarea {
  padding-left: 40px;
}

.messenger-main .main-chat-header .chat-info.clickable {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.messenger-main .main-chat-header .chat-info.clickable:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

/* Стили для модального окна информации о группе */
.group-info-modal {
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.group-info-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.group-header {
  display: flex;
  padding: 30px;
  gap: 25px;
  background: linear-gradient(135deg, #3a8ffe, #0062e6);
  color: white;
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.group-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.group-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.group-avatar img:hover {
  transform: scale(1.05);
}

.edit-avatar {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 2;
  font-size: 16px;
  color: #3a8ffe;
}

.edit-avatar:hover {
  transform: scale(1.1);
}

.group-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-name-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-name-section h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-name-btn, .edit-desc-btn {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  font-size: 14px;
  gap: 5px;
  font-weight: 500;
}

.edit-name-btn:hover, .edit-desc-btn:hover {
  background: rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.group-created {
  font-size: 15px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  width: fit-content;
}

.description-section {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 10px 15px;
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

.description-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.description-header h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.group-description {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  opacity: 0.95;
  padding: 0 5px;
}

.group-stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 15px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.stat-item i {
  font-size: 18px;
}

.group-tabs {
  display: flex;
  padding: 0;
  gap: 0;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.group-tabs .tab-btn {
  padding: 16px 20px;
  border-radius: 0;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 3px solid transparent;
  color: #64748b;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.group-tabs .tab-btn:hover {
  background: #f1f5f9;
  color: #3a8ffe;
}

.group-tabs .tab-btn.active {
  border-bottom-color: #3a8ffe;
  color: #3a8ffe;
  background: #f1f5f9;
}

.tab-content {
  padding: 20px;
  background: #fff;
  min-height: 200px;
  flex: 1;
  overflow-y: visible;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.members-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.add-member-btn {
  background: #3a8ffe;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(33, 150, 243, 0.2);
}

.add-member-btn:hover {
  background: #1e88e5;
}

.members-search {
  position: relative;
  margin-bottom: 20px;
}

.members-search i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
}

.members-search input {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f8fafc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.members-search input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: none;
  overflow-y: visible;
  margin-top: 10px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 15px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  border: 1px solid transparent;
}

.member-item:hover {
  background: #f1f5f9;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.member-avatar {
  position: relative;
  width: 50px;
  height: 50px;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #9e9e9e;
  border: 2px solid white;
}

.online-status.online {
  background: #4caf50;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.member-role {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.member-role::before {
  content: "•";
  color: #3a8ffe;
  font-size: 18px;
}

.member-actions {
  position: relative;
}

.member-options-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.member-options-btn:hover {
  background: #e2e8f0;
  color: #2c3e50;
}

.member-options-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
  display: none;
}

.member-options-menu button {
  width: 100%;
  padding: 12px 15px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  color: #2c3e50;
}

.member-options-menu button:hover {
  background: #f8fafc;
}

.member-options-menu button.danger {
  color: #e53e3e;
}

.member-options-menu button.danger:hover {
  background: #fff5f5;
}

.member-item:hover .member-options-menu {
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  min-height: 250px;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.7;
  color: #3a8ffe;
  background: rgba(58, 143, 254, 0.1);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(58, 143, 254, 0.15);
}

.empty-state p {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  max-width: 250px;
  line-height: 1.5;
}

.group-actions {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e2e8f0;
}

.group-actions {
  padding: 25px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.leave-group-btn {
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
  letter-spacing: 0.3px;
}

.leave-group-btn:hover {
  background: #c53030;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(229, 62, 62, 0.3);
}

.leave-group-btn i {
  font-size: 18px;
}

.settings-tab .settings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.settings-tab .settings-list {
  margin-top: 10px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 14px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.setting-item:hover {
  background: #f1f5f9;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.setting-item.danger {
  background: #fff5f5;
  border-color: #fed7d7;
}

.setting-item.danger:hover {
  background: #fff0f0;
  box-shadow: 0 5px 15px rgba(229, 62, 62, 0.1);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.setting-info i {
  font-size: 20px;
  color: #2196F3;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-item.danger .setting-info i {
  color: #e53e3e;
}

.setting-text {
  display: flex;
  flex-direction: column;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 13px;
  color: #64748b;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Стили для вкладок медиа и файлов */
.media-tab, .files-tab {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Стиль для полноэкранного модального окна информации о группе */
:deep(.group-info-fullscreen-modal .modal-container) {
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  overflow: hidden;
}

:deep(.group-info-fullscreen-modal .modal-content) {
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  max-height: 90vh;
}

/* Улучшаем скроллбары во всем приложении */
:deep(.modal-content::-webkit-scrollbar),
:deep(.members-list::-webkit-scrollbar),
:deep(.tab-content::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.modal-content::-webkit-scrollbar-track),
:deep(.members-list::-webkit-scrollbar-track),
:deep(.tab-content::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.modal-content::-webkit-scrollbar-thumb),
:deep(.members-list::-webkit-scrollbar-thumb),
:deep(.tab-content::-webkit-scrollbar-thumb) {
  background: rgba(33, 150, 243, 0.3);
  border-radius: 6px;
}

:deep(.modal-content::-webkit-scrollbar-thumb:hover),
:deep(.members-list::-webkit-scrollbar-thumb:hover),
:deep(.tab-content::-webkit-scrollbar-thumb:hover) {
  background: rgba(33, 150, 243, 0.5);
}

.group-header {
  border-radius: 16px 16px 0 0;
}

/* Изменение стиля для кнопок при наведении */
.edit-name-btn:hover, .edit-desc-btn:hover {
  background: rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.add-member-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(33, 150, 243, 0.3);
}

.edit-avatar:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

/* Стили для новых кнопок действий */
.action-button {
  background: #3a8ffe;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 15px;
  width: 100%;
  text-align: center;
}

.action-button:hover {
  background: #0062e6;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.action-button i {
  font-size: 18px;
}

.edit-btn {
  background: #4a6fe3;
}

.add-btn {
  background: #4caf50;
}

.edit-buttons {
  margin-top: 10px;
  width: 100%;
}

.member-actions-container {
  margin: 20px 0;
  width: 100%;
  padding: 0 20px;
}

.description-section .action-button {
  margin-top: 15px;
  margin-bottom: 15px;
}

.edit-buttons {
  margin: 15px 0;
  padding: 0 20px;
}

/* Стили для нового модального окна редактирования группы */
.edit-group-modal {
  width: 500px;
  max-width: 95vw;
  padding: 0;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

.edit-group-modal .modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.edit-group-modal .modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
}

.edit-group-content {
  padding: 24px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.preview-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.change-avatar-btn {
  background: #3a8ffe;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

.edit-group-content .form-group {
  margin-bottom: 20px;
}

.edit-group-content .form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
}

.edit-group-content .form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #2d3748;
  transition: all 0.3s ease;
}

.edit-group-content .form-control:focus {
  outline: none;
  border-color: #3a8ffe;
  box-shadow: 0 0 0 3px rgba(58, 143, 254, 0.1);
}

.edit-group-content textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

/* Стили для модального окна добавления участников */
.add-members-modal {
  width: 500px;
  max-width: 95vw;
  padding: 0;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

.add-members-modal .modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.add-members-modal .modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
}

.add-members-content {
  padding: 24px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #2d3748;
  background: #ffffff;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3a8ffe;
  box-shadow: 0 0 0 3px rgba(58, 143, 254, 0.1);
}

.selected-users {
  margin-top: 20px;
}

.selected-users h4 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
}

.selected-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-user-item {
  display: flex;
  align-items: center;
  background: #edf2fd;
  border-radius: 20px;
  padding: 6px 12px;
  gap: 8px;
}

.selected-user-item img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.selected-user-item span {
  font-size: 14px;
  color: #3a8ffe;
}

.remove-user-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 2px;
  font-size: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-user-btn:hover {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.search-results {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.search-result {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result:last-child {
  border-bottom: none;
}

.search-result:hover {
  background: #f8fafc;
}

.search-result img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.search-result .user-info {
  flex: 1;
}

.search-result .user-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
}

.search-result .user-role {
  font-size: 13px;
  color: #718096;
}

.add-user-btn {
  background: #edf2fd;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3a8ffe;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-user-btn:hover {
  background: #3a8ffe;
  color: white;
}

.no-results, .search-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #a0aec0;
}

.no-results i, .search-prompt i {
  font-size: 24px;
  margin-bottom: 10px;
}

.big-button i {
  font-size: 20px;
}

.edit-button {
  background-color: #3a8ffe;
  color: white;
  box-shadow: 0 6px 12px rgba(58, 143, 254, 0.4);
}

.edit-button:hover {
  background-color: #1a6edc;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(58, 143, 254, 0.5);
}

.add-button {
  background-color: #10b981;
  color: white;
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
}

.add-button:hover {
  background-color: #0e9d6e;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.5);
}

.edit-group-button {
  background-color: #3a8ffe;
  color: white;
  box-shadow: 0 4px 10px rgba(58, 143, 254, 0.3);
}

.edit-group-button:hover {
  background-color: #2e71cc;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(58, 143, 254, 0.4);
}

.add-members-button {
  background-color: #10b981;
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.add-members-button:hover {
  background-color: #0d9668;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
}

/* Стили для БОЛЬШИХ ЗАМЕТНЫХ КНОПОК */
.big-buttons-wrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e1e8ed;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
}

.big-button {
  padding: 15px 30px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.big-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
}

.big-button:active {
  transform: scale(0.95);
}

.big-button:hover::before {
  left: 100%;
}

/* Обновленные стили для кнопок группового чата */
.group-action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8fafc;
  border-top: 1px solid #e1e8ed;
  width: 100%;
  margin-top: auto;
}

.action-button {
  flex: 1;
  padding: 8px 0;
  margin: 0 4px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.action-button i {
  font-size: 12px;
}

.edit-button {
  background-color: #3a8ffe;
  color: white;
}

.edit-button:hover {
  background-color: #1a6edc;
  transform: translateY(-2px);
}

.add-button {
  background-color: #10b981;
  color: white;
}

.add-button:hover {
  background-color: #0e9d6e;
  transform: translateY(-2px);
}

.leave-button {
  background-color: #ef4444;
  color: white;
}

.leave-button:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

/* Стили для кастомных скролл-баров */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(33, 150, 243, 0.3);
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(33, 150, 243, 0.5);
}

/* Стили для Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgb(255, 255, 255) transparent;
}

/* Стили для описания группы */
.group-description {
  color: white !important;
  margin: 10px 0;
  line-height: 1.5;
  font-size: 15px;
}

/* Стили для меню прикрепления файлов */
.attach-menu {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  padding: 15px;
  z-index: 1000;
  border: 1px solid #e0e0e0;
  animation: slideUp 0.3s ease;
  min-width: 280px;
}

.attach-menu::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

.attach-options {
  display: flex;
  gap: 15px;
}

.attach-options button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 120px;
}

.attach-options button:hover {
  background-color: #e3f2fd;
  transform: translateY(-3px);
}

.attach-options button i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #2196F3;
}

.attach-options button span {
  font-size: 14px;
  font-weight: 500;
}

/* Анимация для меню */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 