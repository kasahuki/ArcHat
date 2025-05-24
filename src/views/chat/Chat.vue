<template>
  <div class="chat-container">
    <!-- 顶部用户信息 -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar 
          :size="40" 
          class="user-avatar"
          @click="(e) => handleViewUser({
            id: '1',
            name: 'Amazon',
            avatar: '',
            level: 3,
            status: '在线',
            registerTime: '2024-01-01',
            signature: '热爱生活，热爱编程',
            isFriend: true
          }, e)"
        ></el-avatar>
        <div class="user-details">
          <div class="user-name">
            Amazon <span class="user-subtitle">| James M.</span>
          </div>
          <div class="user-status">
            <span class="status-dot"></span>
            Online
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天显示信息框（可滚动） -->
    <div class="chat-message-list">
      <template v-if="messages.length > 0">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['chat-message-item', msg.side]"
        >
          <el-avatar 
            v-if="msg.side === 'left'" 
            :size="32" 
            class="user-avatar"
            @click="(e) => handleViewUser({
              id: '2',
              name: 'James M.',
              avatar: '',
              level: 2,
              status: '在线',
              registerTime: '2024-01-01',
              signature: '热爱生活，热爱编程',
              isFriend: true
            }, e)"
          />
          <div class="chat-bubble">{{ msg.text }}</div>
          <el-avatar 
            v-if="msg.side === 'right'" 
            :size="32" 
            class="user-avatar"
            @click="(e) => handleViewUser({
              id: '1',
              name: 'Amazon',
              avatar: '',
              level: 3,
              status: '在线',
              registerTime: '2024-01-01',
              signature: '热爱生活，热爱编程',
              isFriend: true
            }, e)"
          />
        </div>
      </template>
      <template v-else>
        <div class="no-message-tip">没有聊天记录</div>
      </template>
    </div>

    <!-- 底部输入区 -->
    <div class="message-input-container">
      <el-button class="input-icon-btn" circle>
        <el-icon><Paperclip /></el-icon>
      </el-button>
      <el-button class="input-icon-btn" circle @click="showEmojiPicker = true">
        <el-icon><ChatRound /></el-icon>
      </el-button>
      <div class="message-input">
        <input type="text" v-model="inputValue" placeholder="Type a message..." />
      </div>
      <el-button class="send-button">
        <el-icon><Position /></el-icon>
      </el-button>
    </div>

    <!-- Emoji 选择器抽屉 -->
    <el-drawer
      v-model="showEmojiPicker"
      title="选择表情"
      direction="btt"
      size="400px"
      :with-header="true"
      class="emoji-drawer"
    >
      <emoji-picker
        @emoji-click="onEmojiSelect"
        :native="true"
        :show-preview="true"
        :show-skin-tones="true"
        :show-search="true"
        :show-categories="true"
        :show-recent="true"
        :recent="recentEmojis"
        :theme="isDarkMode ? 'dark' : 'light'"
      />
    </el-drawer>

    <!-- 添加用户详情弹窗组件 -->
    <user-detail-popup
      v-model:visible="showUserDetail"
      :user="selectedUser"
      :position="userDetailPosition"
      @add-friend="handleAddFriend"
      @start-chat="handleStartChat"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Microphone, 
  ChatRound 
} from '@element-plus/icons-vue';
import 'emoji-picker-element';
import { useDark } from '@vueuse/core';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const inputValue = ref('');
const messages = ref([
  {
    side: 'left',
    text: 'Hi James, how can I help you today?',
    time: '10:30 AM',
    user: {
      id: '2',
      name: 'James M.',
      avatar: '',
      level: 2,
      status: '在线',
      registerTime: '2024-01-01',
      signature: '热爱生活，热爱编程',
      isFriend: true
    }
  },
  {
    side: 'right',
    text: 'Hello! I have a question about my recent order #12345',
    time: '10:31 AM',
    user: {
      id: '1',
      name: 'Amazon',
      avatar: '',
      level: 3,
      status: '在线',
      registerTime: '2024-01-01',
      signature: '热爱生活，热爱编程',
      isFriend: true
    }
  },
  {
    side: 'left',
    text: 'Of course! I\'d be happy to help you with your order. Could you please provide the order number?',
    time: '10:32 AM'
  },
  {
    side: 'right',
    text: 'Yes, it\'s #12345. I ordered it 3 days ago but haven\'t received any shipping confirmation yet.',
    time: '10:33 AM'
  },
  {
    side: 'left',
    text: 'Let me check the status of your order for you. One moment please...',
    time: '10:34 AM'
  },
  {
    side: 'left',
    text: 'I can see that your order is currently being processed in our warehouse. It should be shipped within the next 24 hours.',
    time: '10:35 AM'
  },
  {
    side: 'right',
    text: 'That\'s great! Will I receive a tracking number once it\'s shipped?',
    time: '10:36 AM'
  },
  {
    side: 'left',
    text: 'Yes, absolutely! You\'ll receive an email with the tracking number as soon as your order ships. Is there anything else I can help you with?',
    time: '10:37 AM'
  },
  {
    side: 'right',
    text: 'No, that\'s all I needed to know. Thank you for your help!',
    time: '10:38 AM'
  },
  {
    side: 'left',
    text: 'You\'re welcome! If you have any other questions, feel free to ask. Have a great day!',
    time: '10:39 AM'
  }
]);
const showEmojiPicker = ref(false);
const recentEmojis = ref([]);
const isDarkMode = useDark();
const router = useRouter();

// 用户详情相关
const showUserDetail = ref(false);
const selectedUser = ref({
  id: '',
  name: '',
  avatar: '',
  level: 1,
  status: '离线',
  registerTime: '',
  signature: '',
  isFriend: false
});
const userDetailPosition = ref({ x: 0, y: 0 });

// 修改当前用户数据
const currentUser = ref({
  id: '1',
  name: 'Amazon',
  avatar: '',
  level: 3,
  status: '在线',
  registerTime: '2024-01-01',
  signature: '热爱生活，热爱编程',
  isFriend: true
});

const onEmojiSelect = (event) => {
  const emoji = event.detail.unicode;
  inputValue.value += emoji;
  
  // 更新最近使用的表情
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value = [emoji, ...recentEmojis.value].slice(0, 20);
  }
};

// 查看用户详情
const handleViewUser = (user, event) => {
  if (!user) {
    console.error('User data is undefined');
    return;
  }
  
  console.log('handleViewUser called', user, event);
  const rect = event.target.getBoundingClientRect();
  userDetailPosition.value = {
    x: rect.right + 10,
    y: rect.top - 10
  };
  
  selectedUser.value = {
    ...user,
    registerTime: user.registerTime || '2024-01-01',
    signature: user.signature || '这个人很懒，什么都没写~',
    isFriend: user.isFriend || false
  };
  
  showUserDetail.value = true;
  console.log('showUserDetail set to true', showUserDetail.value);
};

// 添加好友
const handleAddFriend = async (user) => {
  try {
    // 这里添加发送好友请求的逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟请求
    ElMessage.success('好友请求已发送');
    selectedUser.value.isFriend = true;
  } catch (error) {
    ElMessage.error('发送请求失败');
  }
};

// 开始聊天
const handleStartChat = (user) => {
  router.push(`/chat?friendId=${user.id}`);
  showUserDetail.value = false;
};
</script>

<style scoped>
:root {
  /* 日间模式变量 */
  --chat-bg: #f5f7fa;
  --chat-header-bg: #ffffff;
  --chat-header-border: #e7e7e7;
  --chat-text: #303133;
  --chat-text-secondary: #606266;
  --chat-bubble-left: #409EFF;
  --chat-bubble-right: #f2f6fc;
  --chat-bubble-text: #ffffff;
  --chat-bubble-right-text: #303133;
  --chat-input-bg: #ffffff;
  --chat-input-border: #dcdfe6;
  --chat-input-text: #303133;
  --chat-input-placeholder: #909399;
  --chat-icon-color: #909399;
  --chat-status-color: #67c23a;
}

.dark-mode {
  /* 夜间模式变量 */
  --chat-bg: #1a1d2d;
  --chat-header-bg: #141824;
  --chat-header-border: #2b2d3a;
  --chat-text: #e5eaf3;
  --chat-text-secondary: #a3a6ad;
  --chat-bubble-left: #409EFF;
  --chat-bubble-right: #2b2d3a;
  --chat-bubble-text: #ffffff;
  --chat-bubble-right-text: #e5eaf3;
  --chat-input-bg: #2b2d3a;
  --chat-input-border: #414243;
  --chat-input-text: #e5eaf3;
  --chat-input-placeholder: #a3a6ad;
  --chat-icon-color: #a3a6ad;
  --chat-status-color: #67c23a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
  background-color: var(--chat-bg);

  color: var(--chat-text);
}

/* 顶部用户信息 */
.user-header {
  padding: 16px;
  background-color: var(--chat-header-bg);
  border-bottom: 1px solid var(--chat-header-border);

}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--chat-text);
}

.user-subtitle {
  font-weight: normal;
  color: var(--chat-text-secondary);
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--chat-status-color);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--chat-status-color);
  border-radius: 50%;
  margin-right: 6px;
}

/* 聊天消息列表 */
.chat-message-list {
  flex: 1;
  min-height: 200px;
  max-height: none;
  overflow-y: auto;
  padding: 24px 32px 12px 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  background-color: var(--chat-bg);
  background-image: url("/src/assets/image/login.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  margin: 18px 32px 0 32px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 暗色模式背景图 */
.dark-mode .chat-message-list {
  background-image: url("/src/assets/image/login-dark.jpg");
}

/* 自定义滚动条样式 */
.chat-message-list::-webkit-scrollbar {
  width: 2px;
}

.chat-message-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-message-list::-webkit-scrollbar-thumb {
  background-color: rgba(64, 158, 255, 0.3);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.chat-message-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(64, 158, 255, 0.5);
}

.chat-message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
}

.chat-message-item.left {
  align-self: flex-start;
  margin-right: auto;
}

.chat-message-item.right {
  align-self: flex-end;
  margin-left: auto;
  flex-direction: row;
}

.chat-message-item.right .user-avatar {
  order: 2;
}

.chat-message-item.right .chat-bubble {
  order: 1;
  margin-right: 12px;
}

.chat-bubble {
  padding: 12px 20px;
  border-radius: 16px;
  max-width: 100%;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.3px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.chat-message-item.left .chat-bubble {
  background-color: var(--chat-bubble-left);
  color: var(--chat-bubble-text);
  font-weight: 400;
  border-top-left-radius: 4px;
}

.chat-message-item.left .chat-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  border: 8px solid transparent;
  border-right-color: var(--chat-bubble-left);
  border-top-color: var(--chat-bubble-left);
}

.chat-message-item.right .chat-bubble {
  background-color: var(--chat-bubble-right);
  color: var(--chat-bubble-right-text);
  font-weight: 400;
  border-top-right-radius: 4px;
}

.chat-message-item.right .chat-bubble::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 0;
  border: 8px solid transparent;
  border-left-color: var(--chat-bubble-right);
  border-top-color: var(--chat-bubble-right);
}

/* 暗色模式适配 */
.dark-mode .chat-message-item.left .chat-bubble {
  background-color: var(--chat-bubble-left);
  box-shadow: 0 4px 12px rgba(157, 195, 233, 0.3),
              0 2px 6px rgba(0, 0, 0, 0.4);
}

.dark-mode .chat-message-item.right .chat-bubble {
  background-color: var(--chat-bubble-right);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4),
              0 2px 6px rgba(0, 0, 0, 0.3);
}

.dark-mode .chat-message-item.left .chat-bubble::before {
  border-right-color: var(--chat-bubble-left);
  border-top-color: var(--chat-bubble-left);
  filter: drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.2));
}

.dark-mode .chat-message-item.right .chat-bubble::before {
  border-left-color: var(--chat-bubble-right);
  border-top-color: var(--chat-bubble-right);
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.2));
}

.no-message-tip {
  text-align: center;
  color: var(--chat-text-secondary);
  margin: auto;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.3px;
}

/* 底部输入区 */
.message-input-container {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--chat-header-bg);
  border-top: 1px solid var(--chat-header-border);
}

.input-icon-btn {
  background: transparent;
  border: none;
  color: var(--chat-icon-color);
  font-size: 20px;
  margin-right: 4px;
}

.message-input {
  flex: 1;
  margin: 0 10px;
}

.message-input input {
  width: 100%;
  height: 40px;
  background-color: var(--chat-input-bg);
  border: 1px solid var(--chat-input-border);
  border-radius: 20px;
  padding: 0 16px;
  color: var(--chat-input-text);
  font-size: 14px;
  transition: all 0.3s ease;
}

.message-input input::placeholder {
  color: var(--chat-input-placeholder);
}

.message-input input:focus {
  outline: none;
  border-color: var(--chat-bubble-left);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.send-button {
  background: transparent;
  border: none;
  color: var(--chat-icon-color);
  font-size: 20px;
  transition: color 0.3s ease;
}

.send-button:hover {
  color: var(--chat-bubble-left);
}

/* 添加 emoji 选择器样式 */
.emoji-drawer {
  --el-drawer-bg-color: var(--chat-bg);
  --el-drawer-padding-primary: 0;
}

.emoji-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px;
  border-bottom: 1px solid var(--chat-header-border);
  color: var(--chat-text);
}

.emoji-drawer :deep(.el-drawer__body) {
  padding: 0;
}

emoji-picker {
  width: 100%;
  height: 100%;
  --background: var(--chat-bg);
  --border-color: var(--chat-header-border);
  --button-active-background: var(--chat-bubble-left);
  --category-emoji-padding: 0.5rem;
  --category-emoji-size: 1.5rem;
  --category-font-color: var(--chat-text);
  --category-font-size: 0.8rem;
  --category-emoji-padding: 0.5rem;
  --category-emoji-size: 1.5rem;
  --category-font-color: var(--chat-text);
  --category-font-size: 0.8rem;
  --indicator-color: var(--chat-bubble-left);
  --num-columns: 8;
  --outline-color: var(--chat-header-border);
  --outline-size: 1px;
  --padding: 0.5rem;
  --preview-background: var(--chat-bg);
  --preview-font-color: var(--chat-text);
  --preview-font-size: 1rem;
  --preview-padding: 0.5rem;
  --search-background: var(--chat-input-bg);
  --search-border-color: var(--chat-input-border);
  --search-font-color: var(--chat-text);
  --search-font-size: 1rem;
  --search-padding: 0.5rem;
  --search-placeholder-color: var(--chat-input-placeholder);
  --search-results-background: var(--chat-bg);
  --search-results-font-color: var(--chat-text);
  --search-results-font-size: 1rem;
  --search-results-padding: 0.5rem;
  --skin-tone-picker-background: var(--chat-bg);
  --skin-tone-picker-border-color: var(--chat-header-border);
  --skin-tone-picker-font-color: var(--chat-text);
  --skin-tone-picker-font-size: 1rem;
  --skin-tone-picker-padding: 0.5rem;
  --skin-tone-picker-width: 100%;
}

/* 确保弹窗样式正确 */
:deep(.user-detail-popup) {
  z-index: 9999;
}
</style>