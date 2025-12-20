import { ref } from 'vue'
import messengerService from '@/services/messenger.service'

/**
 * Composable для загрузки файлов
 */
export function useFileUpload(selectedChat, loadMessages) {
  const showFileUploadModal = ref(false)
  const selectedFile = ref(null)
  const filePreviewUrl = ref('')
  const uploadProgress = ref(0)
  const uploadInProgress = ref(false)
  const isImageUpload = ref(false)
  const dragOver = ref(false)
  const fileInput = ref(null)
  const showAttachMenu = ref(false)

  /**
   * Переключение меню прикрепления
   */
  const toggleAttachMenu = () => {
    showAttachMenu.value = !showAttachMenu.value
  }

  /**
   * Показать загрузчик файлов
   */
  const showFileUploader = (isImage = false) => {
    isImageUpload.value = isImage
    showFileUploadModal.value = true
    showAttachMenu.value = false
  }

  /**
   * Прикрепить изображение
   */
  const attachImage = () => {
    showFileUploader(true)
  }

  /**
   * Прикрепить файл
   */
  const attachFile = () => {
    showFileUploader(false)
  }

  /**
   * Обработка выбора файла
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    selectedFile.value = file
    
    if (isImageUpload.value && file.type.startsWith('image/')) {
      filePreviewUrl.value = URL.createObjectURL(file)
    } else {
      filePreviewUrl.value = ''
    }
  }

  /**
   * Обработка перетаскивания файла
   */
  const handleFileDrop = (event) => {
    dragOver.value = false
    
    const file = event.dataTransfer.files[0]
    if (!file) return
    
    if (isImageUpload.value && !file.type.startsWith('image/')) {
      alert('Пожалуйста, загрузите изображение')
      return
    }
    
    selectedFile.value = file
    
    if (isImageUpload.value && file.type.startsWith('image/')) {
      filePreviewUrl.value = URL.createObjectURL(file)
    } else {
      filePreviewUrl.value = ''
    }
  }

  /**
   * Удаление выбранного файла
   */
  const removeSelectedFile = () => {
    if (filePreviewUrl.value) {
      URL.revokeObjectURL(filePreviewUrl.value)
    }
    
    selectedFile.value = null
    filePreviewUrl.value = ''
  }

  /**
   * Загрузка выбранного файла
   */
  const uploadSelectedFile = async () => {
    if (!selectedFile.value || !selectedChat.value) return
    
    try {
      uploadInProgress.value = true
      
      const uploadMethod = isImageUpload.value 
        ? messengerService.uploadImage
        : messengerService.uploadFile
      
      const response = await uploadMethod(selectedFile.value, (progress) => {
        uploadProgress.value = progress
      })
      
      const fileUrl = response.data.url
      
      const messageData = {
        chatId: selectedChat.value.id,
        text: isImageUpload.value ? 'Изображение' : selectedFile.value.name,
        type: isImageUpload.value ? 'image' : 'file',
        fileUrl: fileUrl,
        fileName: selectedFile.value.name,
        fileSize: selectedFile.value.size
      }
      
      await messengerService.sendMessage(messageData)
      
      cancelFileUpload()
      
      if (loadMessages) {
        await loadMessages(selectedChat.value.id)
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error)
    } finally {
      uploadInProgress.value = false
      uploadProgress.value = 0
    }
  }

  /**
   * Отмена загрузки файла
   */
  const cancelFileUpload = () => {
    if (filePreviewUrl.value) {
      URL.revokeObjectURL(filePreviewUrl.value)
    }
    
    selectedFile.value = null
    filePreviewUrl.value = ''
    uploadProgress.value = 0
    showFileUploadModal.value = false
  }

  return {
    showFileUploadModal,
    selectedFile,
    filePreviewUrl,
    uploadProgress,
    uploadInProgress,
    isImageUpload,
    dragOver,
    fileInput,
    showAttachMenu,
    toggleAttachMenu,
    showFileUploader,
    attachImage,
    attachFile,
    handleFileSelect,
    handleFileDrop,
    removeSelectedFile,
    uploadSelectedFile,
    cancelFileUpload
  }
}
