<template>
  <div v-if="visible" class="user-detail-popup" :style="popupStyle" ref="popupRef">
    <div class="user-detail-content">
      <!-- Mac窗口控制按钮 -->
      <mac-window-controls @close="handleClose" />

      <!-- 用户基本信息 -->
      <div class="user-header">
        <el-avatar :size="60" :src="user.avatar" />
        <div class="user-info">
          <div class="user-name-level">
            <h3>{{ user.name }}</h3>
            <div class="level-badge" :class="levelClass" :style="levelStyle">
              Lv.{{ user.level }}
            </div>
          </div>
          <p class="user-status">{{ user.status }}</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="user-actions" v-if="!user.hideAddFriend">
        <el-button 
          v-if="!user.isFriend" 
          type="primary" 
          @click="handleAddFriend"
          :loading="addingFriend"
          class="action-button"
        >
          <el-icon><Plus /></el-icon>
          添加好友
        </el-button>
        <el-button 
          v-else 
          type="primary" 
          @click="handleStartChat"
          class="action-button"
        >
          <el-icon><ChatDotRound /></el-icon>
          发送消息
        </el-button>
      </div>

      <!-- 用户详细信息 -->
      <div class="user-details">
        <div class="detail-item">
          <span class="label">注册时间</span>
          <span class="value">{{ user.registerTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Plus, ChatDotRound } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getLevelClass, getLevelStyle } from '@/utils/level';
import MacWindowControls from './MacWindowControls.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      avatar: '',
      level: 1,
      status: '离线',
      registerTime: '',
      isFriend: false,
      hideAddFriend: false
    })
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
});

const emit = defineEmits(['update:visible', 'add-friend', 'start-chat']);

const router = useRouter();
const addingFriend = ref(false);
const popupRef = ref(null);

// 计算弹窗位置
const popupStyle = computed(() => ({
  top: `${props.position.y}px`,
  left: `${props.position.x}px`
}));

// 获取等级对应的样式类
const levelClass = computed(() => getLevelClass(props.user.level));
const levelStyle = computed(() => getLevelStyle(props.user.level));

// 添加好友
const handleAddFriend = async () => {
  addingFriend.value = true;
  try {
    emit('add-friend', props.user);
  } finally {
    addingFriend.value = false;
  }
};

// 开始聊天
const handleStartChat = () => {
  emit('start-chat', props.user);
  emit('update:visible', false);
};

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};

// 添加点击外部关闭功能
const handleClickOutside = (event) => {
  if (!props.visible || !popupRef.value) return;
  if (!popupRef.value.contains(event.target)) {
    emit('update:visible', false);
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
.user-detail-popup {
  position: fixed;
  z-index: 9999;
  background: var(--light-sidebar-bg);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 320px;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  border: 1px solid var(--light-border);
  transition: all 0.3s ease;
}

.user-detail-content {
  padding: 20px;
  padding-top: 32px;
  background: var(--light-sidebar-bg);
  transition: all 0.3s ease;
}

.user-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.user-info {
  flex: 1;
}

.user-name-level {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user-name-level h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--light-text);
  transition: all 0.3s ease;
}

.user-status {
  margin: 0;
  font-size: 14px;
  color: var(--light-secondary-text);
  transition: all 0.3s ease;
}

.user-actions {
  margin-bottom: 20px;
}

.action-button {
  width: 100%;
  justify-content: center;
  gap: 8px;
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.action-button:hover {
  background: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
}

.user-details {
  border-top: 1px solid var(--light-border);
  padding-top: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  color: var(--light-secondary-text);
  font-size: 14px;
  transition: all 0.3s ease;
}

.detail-item .value {
  color: var(--light-text);
  font-size: 14px;
  max-width: 200px;
  text-align: right;
  word-break: break-all;
  transition: all 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色模式适配 */
:deep(.dark-mode) .user-detail-popup {
  background: var(--dark-sidebar-bg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--dark-border);
}

:deep(.dark-mode) .user-detail-content {
  background: var(--dark-sidebar-bg);
}

:deep(.dark-mode) .user-name-level h3 {
  color: var(--dark-text);
}

:deep(.dark-mode) .user-status {
  color: var(--dark-secondary-text);
}

:deep(.dark-mode) .user-details {
  border-top-color: var(--dark-border);
}

:deep(.dark-mode) .detail-item .label {
  color: var(--dark-secondary-text);
}

:deep(.dark-mode) .detail-item .value {
  color: var(--dark-text);
}

:deep(.dark-mode) .action-button {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.dark-mode) .action-button:hover {
  background: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
}

.level-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

:deep(.dark-mode) .level-badge {
  opacity: 0.9;
}
</style> 