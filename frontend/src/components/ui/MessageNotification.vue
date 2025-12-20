<template>
  <Teleport to="body">
    <Transition name="island">
      <div v-if="notifications.length > 0" class="dynamic-island" @click="handleClick">
        <div class="island-content">
          <div class="island-avatar">
            <i class="fas fa-comment-dots"></i>
          </div>
          <div class="island-info">
            <div class="island-sender">{{ currentNotification?.senderName }}</div>
            <div v-if="currentNotification?.chatName" class="island-chat">{{ currentNotification.chatName }}</div>
            <div class="island-text">{{ truncateText(currentNotification?.text, 50) }}</div>
          </div>
          <button class="island-close" @click.stop="closeNotification">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="notifications.length > 1" class="island-counter">
          +{{ notifications.length - 1 }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { computed } from 'vue'
import { useMessengerStore } from '@/stores/messenger'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

export default {
  name: 'MessageNotification',
  setup() {
    const messengerStore = useMessengerStore()
    const router = useRouter()
    const { notificationQueue: notifications } = storeToRefs(messengerStore)
    
    const currentNotification = computed(() => {
      return notifications.value[0] || null
    })
    
    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
    
    const closeNotification = () => {
      if (currentNotification.value) {
        messengerStore.removeNotification(currentNotification.value.id)
      }
    }
    
    const handleClick = () => {
      if (currentNotification.value) {
        // Переходим в мессенджер к нужному чату
        router.push({
          name: 'Messenger',
          query: { chatId: currentNotification.value.chatId }
        })
        messengerStore.clearNotifications()
      }
    }
    
    return {
      notifications,
      currentNotification,
      truncateText,
      closeNotification,
      handleClick
    }
  }
}
</script>

<style scoped>
.dynamic-island {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 28px;
  padding: 12px 16px;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dynamic-island:hover {
  transform: translateX(-50%) scale(1.02);
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.island-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.island-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.island-avatar i {
  color: #fff;
  font-size: 18px;
}

.island-info {
  flex: 1;
  min-width: 0;
  color: #fff;
}

.island-sender {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.island-chat {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.island-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.island-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.island-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.island-close i {
  font-size: 12px;
}

.island-counter {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* Анимация появления/исчезновения */
.island-enter-active {
  animation: island-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.island-leave-active {
  animation: island-out 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes island-in {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes island-out {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.8);
  }
}

/* Адаптив для мобильных */
@media (max-width: 480px) {
  .dynamic-island {
    min-width: calc(100% - 40px);
    max-width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    transform: none;
  }
  
  .dynamic-island:hover {
    transform: scale(1.02);
  }
  
  .island-enter-active {
    animation: island-in-mobile 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .island-leave-active {
    animation: island-out-mobile 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
  
  @keyframes island-in-mobile {
    0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.8);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes island-out-mobile {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px) scale(0.8);
    }
  }
}
</style>
