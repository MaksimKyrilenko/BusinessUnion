<template>
  <div class="notification-bell" @click="toggleDropdown">
    <button class="bell-button" :class="{ 'has-notifications': unreadCount > 0 }">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="notification-dropdown" @click.stop>
        <div class="dropdown-header">
          <h4>Уведомления</h4>
          <button v-if="notifications.length > 0" @click="markAllAsRead" class="mark-all-btn">
            Прочитать все
          </button>
        </div>
        
        <div class="notification-list" v-if="notifications.length > 0">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :class="notification.type">
              <i :class="getIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <p class="notification-title">{{ notification.title }}</p>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-notifications">
          <i class="fas fa-bell-slash"></i>
          <p>Нет уведомлений</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import websocketService from '@/services/websocket.service';

export default {
  name: 'NotificationBell',
  setup() {
    const isOpen = ref(false);
    const notifications = ref([]);
    const unreadCount = ref(0);

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const closeDropdown = (e) => {
      if (!e.target.closest('.notification-bell')) {
        isOpen.value = false;
      }
    };

    const handleNotification = (notification) => {
      notifications.value.unshift({
        ...notification,
        id: notification.id || Date.now(),
        read: false,
        createdAt: notification.createdAt || new Date(),
      });
      unreadCount.value++;
    };

    const markAsRead = (notification) => {
      if (!notification.read) {
        notification.read = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    };

    const markAllAsRead = () => {
      notifications.value.forEach(n => n.read = true);
      unreadCount.value = 0;
    };

    const handleNotificationClick = (notification) => {
      markAsRead(notification);
      
      // Навигация в зависимости от типа уведомления
      if (notification.link) {
        window.location.href = notification.link;
      }
    };

    const getIcon = (type) => {
      const icons = {
        message: 'fas fa-comment',
        project: 'fas fa-project-diagram',
        community: 'fas fa-users',
        event: 'fas fa-calendar',
        crypto: 'fas fa-coins',
        system: 'fas fa-info-circle',
      };
      return icons[type] || 'fas fa-bell';
    };

    const formatTime = (date) => {
      if (!date) return '';
      const now = new Date();
      const diff = Math.floor((now - new Date(date)) / 1000);
      
      if (diff < 60) return 'Только что';
      if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
      return `${Math.floor(diff / 86400)} дн назад`;
    };

    onMounted(() => {
      websocketService.on('notification', handleNotification);
      document.addEventListener('click', closeDropdown);
    });

    onUnmounted(() => {
      websocketService.off('notification', handleNotification);
      document.removeEventListener('click', closeDropdown);
    });

    return {
      isOpen,
      notifications,
      unreadCount,
      toggleDropdown,
      markAsRead,
      markAllAsRead,
      handleNotificationClick,
      getIcon,
      formatTime,
    };
  },
};
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 1.25rem;
  color: #64748b;
  transition: color 0.2s;
}

.bell-button:hover {
  color: #2563eb;
}

.bell-button.has-notifications {
  color: #2563eb;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 360px;
  max-height: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.mark-all-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.8rem;
  cursor: pointer;
}

.mark-all-btn:hover {
  text-decoration: underline;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #eff6ff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.message {
  background: #dbeafe;
  color: #2563eb;
}

.notification-icon.project {
  background: #dcfce7;
  color: #16a34a;
}

.notification-icon.community {
  background: #fef3c7;
  color: #d97706;
}

.notification-icon.event {
  background: #fce7f3;
  color: #db2777;
}

.notification-icon.crypto {
  background: #f3e8ff;
  color: #9333ea;
}

.notification-icon.system {
  background: #e2e8f0;
  color: #64748b;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.notification-message {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.empty-notifications {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-notifications i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-notifications p {
  margin: 0;
  font-size: 0.9rem;
}

/* Анимация */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
