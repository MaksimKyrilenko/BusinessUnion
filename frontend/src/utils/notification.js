import { ref } from 'vue'

export const useNotification = () => {
  const notifications = ref([])

  const success = (message) => {
    notifications.value.push({
      id: Date.now(),
      type: 'success',
      message
    })
  }

  const error = (message) => {
    notifications.value.push({
      id: Date.now(),
      type: 'error',
      message
    })
  }

  return {
    notifications,
    success,
    error
  }
} 