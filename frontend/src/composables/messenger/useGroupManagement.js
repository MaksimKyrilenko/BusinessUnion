import { ref, computed, watch } from 'vue'
import messengerService from '@/services/messenger.service'
import { getUserFullName, getUserAvatar, getUserName } from '@/utils/messageFormatters'

/**
 * Composable для управления группами
 */
export function useGroupManagement(selectedChat, chats, currentUserId) {
  const showCreateGroupModal = ref(false)
  const showGroupInfoModal = ref(false)
  const showEditGroupModal = ref(false)
  const showAddMembersModal = ref(false)
  
  const groupMembers = ref([])
  const groupInfoActiveTab = ref('members')
  const memberSearchQuery = ref('')
  const groupNotifications = ref(true)
  
  const newGroup = ref({
    name: '',
    description: '',
    users: []
  })
  
  const editingGroup = ref({
    name: '',
    description: '',
    avatar: ''
  })
  
  const userSearch = ref('')
  const searchResults = ref([])
  const selectedUsers = ref([])
  const searchTimer = ref(null)
  const avatarInput = ref(null)

  /**
   * Проверка, является ли текущий пользователь админом
   */
  const isCurrentUserAdmin = computed(() => {
    if (!selectedChat.value || selectedChat.value.type !== 'group') return false
    
    const currentUserMember = groupMembers.value.find(member => 
      member.id === currentUserId.value
    )
    
    return currentUserMember && 
           (currentUserMember.role === 'admin' || currentUserMember.role === 'owner')
  })

  /**
   * Проверка, является ли текущий пользователь создателем
   */
  const isCurrentUserOwner = computed(() => {
    if (!selectedChat.value || selectedChat.value.type !== 'group') return false
    
    const currentUserMember = groupMembers.value.find(member => 
      member.id === currentUserId.value
    )
    
    return currentUserMember && currentUserMember.role === 'owner'
  })

  /**
   * Отфильтрованные участники группы
   */
  const filteredGroupMembers = computed(() => {
    if (!memberSearchQuery.value) return groupMembers.value
    const query = memberSearchQuery.value.toLowerCase()
    return groupMembers.value.filter(member => {
      const fullName = getUserFullName(member).toLowerCase()
      return fullName.includes(query)
    })
  })

  /**
   * Проверка, является ли участник создателем
   */
  const isMemberOwner = (member) => {
    return member.role === 'owner'
  }

  /**
   * Загрузка участников группы
   */
  const loadGroupMembers = async (chatId) => {
    if (!chatId) return
    
    try {
      groupMembers.value = []
      const response = await messengerService.getChatMembers(chatId)
      
      if (response && response.data && Array.isArray(response.data)) {
        groupMembers.value = response.data
      }
    } catch (error) {
      console.error(`Ошибка при загрузке участников группы ${chatId}:`, error)
      groupMembers.value = []
    }
  }

  // Автозагрузка участников при смене чата
  watch(selectedChat, async (newChat) => {
    if (newChat && newChat.type === 'group') {
      await loadGroupMembers(newChat.id)
    }
  })

  /**
   * Поиск пользователей
   */
  const searchUsers = async () => {
    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
    }

    if (!userSearch.value || !userSearch.value.trim() || userSearch.value.trim().length < 2) {
      searchResults.value = []
      return
    }

    searchTimer.value = setTimeout(async () => {
      try {
        const response = await messengerService.searchUsers(userSearch.value.trim())
        
        if (!response || !response.data) {
          searchResults.value = []
          return
        }
        
        const processedResults = processSearchResults(response.data)
        
        const safeCurrentUserId = currentUserId.value ? String(currentUserId.value).trim() : null
        
        searchResults.value = processedResults.filter(user => {
          if (!user || !user.id) return false
          
          const userId = String(user.id).trim()
          
          const isAlreadyAdded = newGroup.value.users.some(selected => {
            if (!selected || !selected.id) return false
            return String(selected.id).trim() === userId
          })
          
          const isCurrentUser = safeCurrentUserId !== null && userId === safeCurrentUserId
          
          return !isAlreadyAdded && !isCurrentUser
        })
      } catch (error) {
        console.error('Ошибка при поиске пользователей:', error)
        searchResults.value = []
      }
    }, 500)
  }

  /**
   * Обработка результатов поиска
   */
  const processSearchResults = (users) => {
    if (!users) return []
    
    if (!Array.isArray(users)) {
      if (users && typeof users === 'object') {
        if (Array.isArray(users.users)) users = users.users
        else if (Array.isArray(users.data)) users = users.data
        else {
          try {
            users = Object.values(users).filter(item => item && typeof item === 'object')
          } catch (e) {
            return []
          }
        }
      } else {
        return []
      }
    }
    
    return users.map(user => {
      if (!user) return null
      
      return {
        id: user.id,
        name: getUserName(user),
        email: user.email || '',
        avatar: getUserAvatar(user),
        role: user.userType || user.role || ''
      }
    }).filter(Boolean)
  }

  /**
   * Добавление пользователя в группу (при создании)
   */
  const addUser = (user, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    newGroup.value.users.push(user)
    searchResults.value = searchResults.value.filter(u => u.id !== user.id)
    userSearch.value = ''
  }

  /**
   * Удаление пользователя из группы (при создании)
   */
  const removeUser = (user, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    newGroup.value.users = newGroup.value.users.filter(u => u.id !== user.id)
  }

  /**
   * Создание группы
   */
  const createGroup = async (selectChatFn) => {
    if (!newGroup.value.name.trim()) {
      alert('Для создания группы необходимо указать название')
      return
    }

    try {
      const currentUser = localStorage.getItem('userId')
      if (!currentUser) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.')
        return
      }
      
      const userIds = newGroup.value.users
        .map(user => {
          if (!user.id) return null
          const userId = parseInt(String(user.id).trim(), 10)
          return isNaN(userId) ? null : userId
        })
        .filter(id => id !== null)
      
      const currentUserIdNum = parseInt(currentUser, 10)
      if (!userIds.includes(currentUserIdNum)) {
        userIds.push(currentUserIdNum)
      }
      
      const groupData = {
        name: newGroup.value.name,
        description: newGroup.value.description,
        type: 'group',
        userIds: userIds
      }
      
      const response = await messengerService.createChat(groupData)
      
      if (!response || !response.data) {
        alert('Не удалось создать группу. Пожалуйста, попробуйте еще раз.')
        return
      }
      
      if (response.data && !response.data.avatar) {
        response.data.avatar = '/assets/images/default-avatar.svg'
      }
      
      chats.value.unshift(response.data)
      showCreateGroupModal.value = false
      
      newGroup.value.name = ''
      newGroup.value.description = ''
      newGroup.value.users = []
      
      if (response.data && response.data.id && selectChatFn) {
        selectChatFn(response.data.id)
      }
    } catch (error) {
      console.error('Ошибка при создании группы:', error.response?.data || error)
      alert('Не удалось создать группу. Ошибка: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
  }

  /**
   * Показать информацию о группе
   */
  const showGroupInfo = async () => {
    if (!selectedChat.value || selectedChat.value.type !== 'group') return
    
    await loadGroupMembers(selectedChat.value.id)
    showGroupInfoModal.value = true
  }

  /**
   * Редактирование группы
   */
  const handleEditGroup = () => {
    if (selectedChat.value && selectedChat.value.type === 'group') {
      editingGroup.value = {
        id: selectedChat.value.id,
        name: selectedChat.value.name || '',
        description: selectedChat.value.description || '',
        avatar: selectedChat.value.avatar || null
      }
      showEditGroupModal.value = true
    }
  }

  /**
   * Добавление участников
   */
  const handleAddMembers = () => {
    if (selectedChat.value && selectedChat.value.type === 'group') {
      selectedUsers.value = []
      showAddMembersModal.value = true
    }
  }

  /**
   * Триггер загрузки аватара
   */
  const triggerAvatarUpload = () => {
    if (avatarInput.value) {
      avatarInput.value.click()
    }
  }

  /**
   * Обработка изменения аватара
   */
  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    editingGroup.value.avatarFile = file
    editingGroup.value.avatar = URL.createObjectURL(file)
  }

  /**
   * Сохранение изменений группы
   */
  const saveGroupChanges = async (router) => {
    try {
      if (!editingGroup.value.name) {
        alert('Название группы обязательно')
        return
      }
      
      if (!selectedChat.value || !selectedChat.value.id) {
        alert('Ошибка: выбранный чат не определен')
        return
      }
      
      const chatId = Number(selectedChat.value.id)
      if (isNaN(chatId)) {
        alert('Ошибка: некорректный ID чата')
        return
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Для продолжения необходимо выполнить вход в систему заново.')
        return
      }
      
      const updateData = {
        name: editingGroup.value.name,
        description: editingGroup.value.description || ''
      }
      
      try {
        await messengerService.updateGroupInfo(chatId, updateData)
      } catch (updateError) {
        if (updateError.response && updateError.response.status === 401) {
          alert('Срок действия вашей сессии истек. Пожалуйста, войдите снова.')
          if (router) router.push('/login')
          return
        }
        throw updateError
      }
      
      if (editingGroup.value.avatarFile) {
        const formData = new FormData()
        formData.append('avatar', editingGroup.value.avatarFile)
        
        try {
          const avatarResponse = await messengerService.uploadGroupAvatar(chatId, formData)
          if (avatarResponse && avatarResponse.data && avatarResponse.data.avatarUrl) {
            selectedChat.value.avatar = avatarResponse.data.avatarUrl
          }
        } catch (avatarError) {
          console.error('Ошибка при загрузке аватара группы:', avatarError)
        }
      }
      
      selectedChat.value.name = editingGroup.value.name
      selectedChat.value.description = editingGroup.value.description
      
      const chatIndex = chats.value.findIndex(chat => chat.id === chatId)
      if (chatIndex !== -1) {
        chats.value[chatIndex].name = editingGroup.value.name
        if (editingGroup.value.avatar && !editingGroup.value.avatarFile) {
          chats.value[chatIndex].avatar = editingGroup.value.avatar
        }
      }
      
      showEditGroupModal.value = false
    } catch (error) {
      console.error('Ошибка при обновлении группы:', error)
      alert('Не удалось обновить информацию о группе.')
    }
  }

  /**
   * Выбор пользователя для добавления
   */
  const selectUserToAdd = (user) => {
    if (!selectedUsers.value.some(u => u.id === user.id)) {
      selectedUsers.value.push(user)
      searchResults.value = searchResults.value.filter(u => u.id !== user.id)
    }
  }

  /**
   * Удаление выбранного пользователя
   */
  const removeSelectedUser = (user) => {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
  }

  /**
   * Добавление участников в группу
   */
  const addMembersToGroup = async () => {
    if (!selectedChat.value || !selectedUsers.value.length) return
    
    try {
      const userIds = selectedUsers.value.map(user => user.id)
      
      await messengerService.addUsersToChat(selectedChat.value.id, userIds)
      
      await loadGroupMembers(selectedChat.value.id)
      
      selectedUsers.value = []
      showAddMembersModal.value = false
      
      if (selectedChat.value.users) {
        selectedChat.value.users = [...selectedChat.value.users, ...selectedUsers.value]
      }
    } catch (error) {
      console.error('Ошибка при добавлении участников:', error)
      alert('Не удалось добавить участников в группу')
    }
  }

  /**
   * Удаление участника из группы
   */
  const removeMember = async (member) => {
    if (!isCurrentUserAdmin.value || isMemberOwner(member)) return
    
    try {
      await messengerService.removeUserFromChat(selectedChat.value.id, member.id)
      groupMembers.value = groupMembers.value.filter(m => m.id !== member.id)
    } catch (error) {
      console.error(`Ошибка при удалении пользователя ${member.id} из группы:`, error)
    }
  }

  /**
   * Изменение роли участника
   */
  const changeMemberRole = (member) => {
    console.log(`Изменение роли участника ${getUserFullName(member)}`)
  }

  /**
   * Изменение аватара группы
   */
  const changeGroupAvatar = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const formData = new FormData()
        formData.append('avatar', file)
        
        messengerService.uploadGroupAvatar(selectedChat.value.id, formData)
          .then(response => {
            selectedChat.value.avatar = response.data.avatarUrl
          })
          .catch(error => {
            console.error('Ошибка при загрузке аватара:', error)
          })
      }
    }
    fileInput.click()
  }

  /**
   * Подтверждение удаления группы
   */
  const confirmDeleteGroup = () => {
    if (confirm('Вы уверены, что хотите удалить группу? Это действие нельзя отменить.')) {
      messengerService.deleteGroup(selectedChat.value.id)
        .then(() => {
          showGroupInfoModal.value = false
          const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
          if (chatIndex !== -1) {
            chats.value.splice(chatIndex, 1)
          }
          selectedChat.value = null
        })
        .catch(error => {
          console.error('Ошибка при удалении группы:', error)
        })
    }
  }

  /**
   * Удаление группы
   */
  const deleteGroup = async () => {
    if (!isCurrentUserOwner.value) return
    
    if (!confirm('Вы уверены, что хотите удалить эту группу? Это действие нельзя отменить.')) {
      return
    }
    
    try {
      await messengerService.deleteChat(selectedChat.value.id)
      
      chats.value = chats.value.filter(chat => chat.id !== selectedChat.value.id)
      selectedChat.value = null
      showGroupInfoModal.value = false
    } catch (error) {
      console.error('Ошибка при удалении группы:', error)
    }
  }

  return {
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
    avatarInput,
    isCurrentUserAdmin,
    isCurrentUserOwner,
    filteredGroupMembers,
    isMemberOwner,
    loadGroupMembers,
    searchUsers,
    addUser,
    removeUser,
    createGroup,
    showGroupInfo,
    handleEditGroup,
    handleAddMembers,
    triggerAvatarUpload,
    handleAvatarChange,
    saveGroupChanges,
    selectUserToAdd,
    removeSelectedUser,
    addMembersToGroup,
    removeMember,
    changeMemberRole,
    changeGroupAvatar,
    confirmDeleteGroup,
    deleteGroup
  }
}
