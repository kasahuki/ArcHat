<template>
  <router-view v-if="!route.params.id"></router-view>
  <div v-else class="chat-container">
    <!-- 顶部用户信息 -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="40" class="user-avatar" :src="currentChat.avatar"
          @click="(e) => handleViewUser(e)"></el-avatar>
        <div class="user-details">
          <div class="user-name">
            {{ currentChat.name }}
          </div>
          <div class="user-status">
            <span class="status-dot" :class="{ 'online': currentChat.status }"></span>
            {{ currentChat.status ? '在线' : '离线' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天显示信息框（可滚动） -->
    <div class="chat-message-list" ref="messagesContainer">
      <template v-if="messages.length > 0">
        <div v-for="(msg, idx) in messages" :key="idx" class="message-wrapper">
          <!-- 时间显示 -->
          <div v-if="shouldShowTime(msg, idx)" class="message-time-group">
            <span class="time-divider">{{ formatMessageDate(new Date(msg.time)) }}</span>
          </div>
          <div :class="['chat-message-item', msg.side]">
            <el-avatar v-if="msg.side === 'left'" :size="32" class="user-avatar" :src=currentChat.avatar
              @click="(e) => handleViewUser(e)" />
            <div class="chat-bubble">{{ msg.text }}</div>
            <el-avatar v-if="msg.side === 'right'" :size="32" class="user-avatar" :src="userStore.userInfo.avatar" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-message-tip">没有聊天记录</div>
      </template>
    </div>

    <!-- 底部输入区 -->
    <div class="message-input-container">
      <el-button class="input-icon-btn link-icon" circle>
        <el-icon>
          <Link />
        </el-icon>
      </el-button>
      <el-button class="input-icon-btn" circle @click="showEmojiPicker = true">
        <el-icon>
          <ChatRound />
        </el-icon>
      </el-button>
      <div class="message-input">
        <input type="text" v-model="inputValue" placeholder="Type a message..." @keyup.enter.ctrl="sendMessage"
          ref="messageInput" />
      </div>
      <el-button class="send-button" @click="sendMessage">
        <el-icon>
          <Position />
        </el-icon>
      </el-button>
    </div>

    <!-- Emoji 选择器抽屉 -->
    <el-drawer v-model="showEmojiPicker" title="选择表情" direction="btt" size="400px" :with-header="true"
      class="emoji-drawer">
      <emoji-picker @emoji-click="onEmojiSelect" :native="true" :show-preview="true" :show-skin-tones="true"
        :show-search="true" :show-categories="true" :show-recent="true" :recent="recentEmojis"
        :theme="isDarkMode ? 'dark' : 'light'" />
    </el-drawer>

    <!-- 添加用户详情弹窗组件 -->
    <user-detail-popup v-model:visible="showUserDetail" :user="currentChat" :position="userDetailPosition"
      :hide-start-chat="true" :hide-add-friend="true" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue';
import {
  Microphone,
  ChatRound,
  Link,
  Position
} from '@element-plus/icons-vue';
import 'emoji-picker-element';
import { useDark } from '@vueuse/core';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { checkFriend } from '@/api/friend';
import { addPrivateRoom, checkPrivateRoom } from '@/api/room';
import ChatWebSocket from '@/api/chat.js';
import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';
import { calculateLevel } from '@/utils/exp';
import { getMessageList } from '@/api/chatService';

const route = useRoute();
const router = useRouter();
const userStore = useUserInfoStore();
const contactStore = useContactStore();

const inputValue = ref('');
const messages = ref([]);
const showEmojiPicker = ref(false);
const recentEmojis = ref([]);
const isDarkMode = useDark();

// 用户详情相关
const showUserDetail = ref(false);
const selectedUser = ref({
  id: '',
  name: '',
  avatar: '',
  level: '',
  status: '',
  createTime: '',
});
const userDetailPosition = ref({ x: 0, y: 0 });

// 当前聊天对象信息
const currentChat = ref({
  id: '',
  name: '',
  roomId:'',
  avatar: '',
  status: '',
  level:'',
  createTime:''
});

// 消息相关
const message = ref('');
const messagesContainer = ref(null);

// 添加输入框引用
const messageInput = ref(null);

// 使用 store 中的 WebSocket 实例
const chatWS = computed(() => userStore.chatWS);

// 检查 WebSocket 连接状态并尝试重连
const checkAndReconnectWebSocket = () => {
  if (!chatWS.value || !chatWS.value.ws || chatWS.value.ws.readyState !== WebSocket.OPEN) {
    console.log('WebSocket 未连接，尝试重连...');
    if (chatWS.value) {
      chatWS.value.connect();
    }
  }
};

// 滚动到底部的函数
const scrollToBottom = () => {
  nextTick(() => {
    const messageList = document.querySelector('.chat-message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
};

// 监听 WebSocket 消息
watch(chatWS, (newWS) => {
  if (newWS && newWS.ws) {
    // 设置消息处理函数
    newWS.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('收到消息:', data);

        // 根据消息类型处理
        switch (data.type) {
          case 1000: // 聊天消息
            if (data.data) {
              const messageData = data.data
              // 添加到消息列表
              messages.value.push({
                side: 'left',
                text: messageData,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
              // 滚动到底部
              scrollToBottom();
            }
            break;
          case 2: // 心跳包
            console.log('收到心跳包');
            break;
          default:
            console.log('未知消息类型:', data.type);
        }
      } catch (error) {
        console.error('处理消息失败:', error);
      }
    };
  }
}, { immediate: true });

// 监听消息列表变化
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// 检查并处理聊天
const checkAndHandleChat = async (userId) => {
  try {
    // 1. 检查是否是好友
    const friendRes = await checkFriend(userId);
    if (friendRes.code !== 200 || friendRes.data === false) {
      router.push('/404');
      return;
    }

    // 2. 检查状态为正常的私聊房间是否存在
    const roomRes = await checkPrivateRoom(userId);
    if (roomRes.code === 200 && roomRes.data === true) {
      // 如果房间已存在，直接跳转到该房间
      return;
    } else {
      // 创建私聊房间
      const createRes = await addPrivateRoom({ uid: userId });
      if (createRes.code === 200) {
        return;
      } else {
        router.push('/404');
      }
    }
  } catch (error) {
    console.error('处理聊天错误:', error);
    router.push('/404');
  }
};

// 获取历史消息
const getHistoryMessages = async (roomId) => {
  try {
    const res = await getMessageList({ roomId });
    if (res.code === 200) {
      // 将历史消息转换为前端显示格式
      const historyMessages = res.data.map(msg => ({
        side: msg.fromUid === userStore.userInfo.uid ? 'right' : 'left',
        text: msg.content,
        time: msg.createTime, // 直接使用后端返回的时间
        id: msg.id,
        status: msg.status,
        type: msg.type
      }));
      messages.value = historyMessages;
      // 滚动到底部
      scrollToBottom();
    } else {
      ElMessage.error(res.msg || '获取历史消息失败');
    }
  } catch (error) {
    console.error('获取历史消息错误:', error);
    ElMessage.error('获取历史消息失败，请稍后重试');
  }
};

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await checkAndHandleChat(newId);
      // 设置当前聊天对象
      contactStore.setCurrentChat(newId);
      // 获取当前聊天对象信息
      const chatUser = contactStore.getContactById(newId);
      console.log(chatUser)
      if (chatUser) {
        currentChat.value = {
          id: chatUser.id,
          roomId: chatUser.roomId,
          name: chatUser.username,
          avatar: chatUser.avatar,
          status: chatUser.status,
          level: calculateLevel(chatUser.exep),
          createTime:chatUser.createTime
        };
        // 获取历史消息
        if (chatUser.roomId) {
          await getHistoryMessages(chatUser.roomId);
        }
      }
      scrollToBottom();
    }
  },
  {
    immediate: true,
    deep: true,
    flush: 'post'
  }
);

const onEmojiSelect = (event) => {
  const emoji = event.detail.unicode;
  inputValue.value += emoji;

  // 更新最近使用的表情
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value = [emoji, ...recentEmojis.value].slice(0, 20);
  }
};

// 查看用户详情
const handleViewUser = ( event) => {
  const rect = event.target.getBoundingClientRect();
  userDetailPosition.value = {
    x: rect.right + 10,
    y: rect.top - 10
  };


  showUserDetail.value = true;
};

// 发送消息
const sendMessage = () => {
  if (!inputValue.value.trim()) return;
  console.log(route.params.id)
  try {
    // 检查并尝试重连 WebSocket
    checkAndReconnectWebSocket();

    if (!chatWS.value || !chatWS.value.ws || chatWS.value.ws.readyState !== WebSocket.OPEN) {
      ElMessage.error('WebSocket 连接未建立，正在尝试重连...');
      return;
    }

    // 构造消息体
    const msg = {
      type: 4,
      data: {
        type: 1,
        targetUid: route.params.id,
        roomId: currentChat.value.roomId,
        content: inputValue.value
      }
    };
    console.log('发送消息:', msg);

    // 通过 WebSocket 发送
    chatWS.value.ws.send(JSON.stringify(msg));

    // 本地显示消息
    messages.value.push({
      side: 'right',
      text: inputValue.value,
      time: new Date().toISOString(), // 使用 ISO 格式的时间戳
      user: currentChat.value
    });

    inputValue.value = '';

    // 发送后让输入框获得焦点
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.focus();
      }
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  }
};

// 组件挂载时检查 WebSocket 连接
onMounted(() => {
  scrollToBottom();
  checkAndReconnectWebSocket();
});

// 组件卸载时关闭 WebSocket 连接
onUnmounted(() => {
  // 不要在这里关闭连接，因为其他组件可能还在使用
  // 只在用户登出时才关闭连接
});

// 消息分组计算属性
const groupedMessages = computed(() => {
  const groups = [];
  let currentGroup = null;

  messages.value.forEach(msg => {
    const msgDate = new Date(msg.time);
    const dateStr = formatMessageDate(msgDate);

    if (!currentGroup || currentGroup.time !== dateStr) {
      currentGroup = {
        time: dateStr,
        messages: []
      };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });

  return groups;
});

// 判断是否显示时间
const shouldShowTime = (currentMsg, index) => {
  if (index === 0) return true; // 第一条消息显示时间
  
  const currentTime = new Date(currentMsg.time);
  const prevTime = new Date(messages.value[index - 1].time);
  
  // 计算时间差（毫秒）
  const timeDiff = Math.abs(currentTime - prevTime);
  // 5分钟 = 5 * 60 * 1000 毫秒
  return timeDiff > 5 * 60 * 1000;
};

// 格式化消息日期
const formatMessageDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all var(--transition-duration) ease;
  position: relative;
}

/* 顶部用户信息 */
.user-header {
  padding: 16px 24px;
  background-color: transparent;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-duration) ease;
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
  color: var(--text-color);
  transition: color var(--transition-duration) ease;
}

.user-subtitle {
  font-weight: normal;
  color: var(--text-color-secondary);
  transition: color var(--transition-duration) ease;
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--success-color);
  transition: color var(--transition-duration) ease;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--success-color);
  border-radius: 50%;
  margin-right: 6px;
  transition: background-color var(--transition-duration) ease;
}

.status.online {
  color: var(--success-color);
}

/* 聊天消息列表 */
.chat-message-list {
  flex: 1;
  min-height: 200px;
  max-height: none;
  overflow-y: auto;
  padding: 24px 24px 10px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  background-color: transparent;
  background-image: url("/src/assets/image/login.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  margin: 18px 10px 0 24px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  transition: all var(--transition-duration) ease;
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

.message-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message-time-group {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 8px 0;
  position: relative;
  z-index: 1;
}

.time-divider {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--text-color-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.dark-mode .time-divider {
  background-color: rgba(255, 255, 255, 0.1);
}

.chat-message-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin: 4px 0;
  padding: 0 16px;
}

.chat-message-item.left {
  justify-content: flex-start;
}

.chat-message-item.right {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
  margin: 0 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chat-bubble::before {
  content: '';
  position: absolute;
  top: 12px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.chat-message-item.left .chat-bubble {
  background-color: #e1f3ff;
  color: #333;
  border-top-left-radius: 4px;
}

.chat-message-item.left .chat-bubble::before {
  left: -12px;
  border-right-color: #e1f3ff;
}

.chat-message-item.right .chat-bubble {
  background-color: #95ec69;
  color: #333;
  border-top-right-radius: 4px;
}

.chat-message-item.right .chat-bubble::before {
  right: -12px;
  border-left-color: #95ec69;
}

.dark-mode .chat-message-item.left .chat-bubble {
  background-color: #1a3a4a;
  color: #fff;
}

.dark-mode .chat-message-item.left .chat-bubble::before {
  border-right-color: #1a3a4a;
}

.dark-mode .chat-message-item.right .chat-bubble {
  background-color: #1a6e3d;
  color: #fff;
}

.dark-mode .chat-message-item.right .chat-bubble::before {
  border-left-color: #1a6e3d;
}

.user-avatar {
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.user-avatar:hover {
  border-color: var(--primary-color);
}

.no-message-tip {
  text-align: center;
  color: var(--text-color-secondary);
  margin: auto;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.3px;
  transition: color var(--transition-duration) ease;
}

/* 底部输入区 */
.message-input-container {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: transparent;
  border-top: none;
  transition: all var(--transition-duration) ease;
  gap: 0px;
  margin-top: auto;
  position: relative;
  max-width: 100%;
}

.input-icon-btn {
  background: transparent;
  border: none;
  color: var(--text-color-secondary);
  font-size: 20px;
  padding: 8px;
  border-radius: 50%;
  transition: all var(--transition-duration) ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.input-icon-btn:hover {
  color: var(--primary-color);
  background: none;
}

.message-input {
  flex: 1;
  position: relative;
  margin: 0 8px;
}

.message-input input {
  width: 100%;
  height: 44px;
  background-color: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 22px;
  padding: 0 20px;
  color: var(--text-color);
  font-size: 14px;
  transition: all var(--transition-duration) ease;
}

.message-input input::placeholder {
  color: var(--text-color-secondary);
}

.message-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.send-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-color-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-duration) ease;
  cursor: pointer;
  flex-shrink: 0;
  z-index: 1;
}

.send-button:hover {
  color: var(--primary-color);
  background: none;
  transform: translateY(-50%) scale(1.1);
}

.send-button:active {
  transform: translateY(-50%) scale(0.95);
}

/* 添加 emoji 选择器样式 */
.emoji-drawer {
  --el-drawer-bg-color: var(--bg-color);
  --el-drawer-padding-primary: 0;
}

.emoji-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.emoji-drawer :deep(.el-drawer__body) {
  padding: 0;
}

emoji-picker {
  width: 100%;
  height: 100%;
  --background: var(--bg-color);
  --border-color: var(--border-color);
  --button-active-background: var(--primary-color);
  --category-emoji-padding: 0.5rem;
  --category-emoji-size: 1.5rem;
  --category-font-color: var(--text-color);
  --category-font-size: 0.8rem;
  --indicator-color: var(--primary-color);
  --num-columns: 8;
  --outline-color: var(--border-color);
  --outline-size: 1px;
  --padding: 0.5rem;
  --preview-background: var(--bg-color);
  --preview-font-color: var(--text-color);
  --preview-font-size: 1rem;
  --preview-padding: 0.5rem;
  --search-background: var(--sidebar-bg);
  --search-border-color: var(--border-color);
  --search-font-color: var(--text-color);
  --search-font-size: 1rem;
  --search-padding: 0.5rem;
  --search-placeholder-color: var(--text-color-secondary);
  --search-results-background: var(--bg-color);
  --search-results-font-color: var(--text-color);
  --search-results-font-size: 1rem;
  --search-results-padding: 0.5rem;
  --skin-tone-picker-background: var(--bg-color);
  --skin-tone-picker-border-color: var(--border-color);
  --skin-tone-picker-font-color: var(--text-color);
  --skin-tone-picker-font-size: 1rem;
  --skin-tone-picker-padding: 0.5rem;
  --skin-tone-picker-width: 100%;
  transition: all var(--transition-duration) ease;
}

/* 确保弹窗样式正确 */
:deep(.user-detail-popup) {
  z-index: 9999;
}
</style>