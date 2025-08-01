<template>
  <router-view v-if="!route.params.id"></router-view>
  <div v-else class="chat-container">
    <!-- #region 连接状态提示 -->
    <!-- WebSocket 连接状态提示 -->
    <div v-if="connectionStatus === 'disconnected'" class="connection-status-bar">
      <el-alert title="WebSocket 连接已断开" type="warning" :closable="false" show-icon>
        <template #default>
          <span style="color:#409EFF; font-weight:600;">消息可能无法正常发送，请点击重新连接</span>
          <danger-button type="success" size="small" @click="handleManualReconnect"
            :loading="connectionStatus === 'connecting'" style="margin-left: 10px;">
            {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
          </danger-button>
        </template>
      </el-alert>
    </div>
    <!-- #endregion -->

    <!-- #region 顶部用户信息 -->
    <!-- 顶部用户信息（仅私聊） -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="40" class="user-avatar" :src="currentChat.avatar"
          @click="(e) => handleViewUser(e)"></el-avatar>
        <div class="user-details">
          <div class="user-name">
            {{ currentChat.name }}
          </div>
          <div class="user-status" :class="{ offline: !currentChatStatus }">
            <span class="status-dot" :class="{ offline: !currentChatStatus }"></span>
            {{ currentChatStatus ? '在线' : '离线' }}
          </div>
        </div>
      </div>

    </div>
    <!-- #endregion -->

    <!-- #region 聊天消息列表 -->
    <!-- 聊天显示信息框（可滚动） -->
    <div class="chat-message-list" ref="messagesContainer">

      <template v-if="messages.length > 0">
        <div v-for="(msg, idx) in messages" :key="idx" class="message-wrapper" v-show="!isLoading">
          <!-- 时间显示 -->
          <div v-if="shouldShowTime(msg, idx)" class="message-time-group">
            <span class="time-divider">{{ formatMessageDate(new Date(msg.time)) }}</span>
          </div>
          <div :class="['chat-message-item', msg.side]" @mouseenter="hoverIdx = idx" @mouseleave="hoverIdx = null">
            <!-- 撤回icon，仅自己消息可见，同行右侧 -->
            <span v-if="msg.side === 'right'" class="recall-inline-icon" v-show="hoverIdx === idx"
              @click="onRecallMessage(msg)">
              <el-icon style="color:#f5222d;font-size:15px;vertical-align:middle;">
                <Close />
              </el-icon>
              <span class="recall-text">撤回</span>
            </span>
            <el-avatar v-if="msg.side === 'left'" :size="32" class="user-avatar" :src="currentChat.avatar"
              @click="(e) => handleViewUser(e)" />
            <div class="chat-bubble" v-html="linkify(msg.text)"></div>
            <el-avatar v-if="msg.side === 'right'" :size="32" class="user-avatar" :src="userStore.userInfo.avatar" />

          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-message-tip" v-show="!isLoading">没有聊天记录</div>
      </template>

      <!-- 加载动画 -->
      <div v-if="isLoading" class="loading-wrapper">
        <Loading />
      </div>
    </div>
    <!-- #endregion -->

    <!-- #region 底部输入区 -->
    <!-- 底部输入区 -->
    <div class="message-input-container" ref="inputContainer">
      <el-button class="input-icon-btn link-icon" circle>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="30"
            viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
            <path fill="currentColor"
              d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" />
          </svg>
        </span>
      </el-button>
      <el-button ref="emojiButton" class="input-icon-btn" circle @click.stop="showEmojiPicker=!showEmojiPicker">
        <svg xmlns="http://www.w3.org/2000/svg" width="30"
          viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt -->
          <mask id="lineMdEmojiGrinFilled0">
            <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path fill="#fff" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64"
                d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9">
                <animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.5s" values="0;1" />
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0" />
              </path>
              <path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M9 9v1">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.2s" dur="0.2s" values="2;0" />
              </path>
              <path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M15 9v1">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.4s" dur="0.2s" values="2;0" />
              </path>
              <path fill="#000" stroke="none"
                d="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z">
                <animate fill="freeze" attributeName="d" begin="1.6s" dur="0.2s"
                  values="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z;M12 14c-2.5 0 -3.25 -1 -4 -1c-0.55 0 -1 0.45 -1 1c0 0.75 1.5 4 5 4c3.5 0 5 -3.25 5 -4c0 -0.55 -0.45 -1 -1 -1c-0.75 0 -1.5 1 -4 1Z" />
              </path>
            </g>
          </mask>
          <rect width="24" height="24" fill="currentColor" mask="url(#lineMdEmojiGrinFilled0)" />
        </svg>
      </el-button>
      <div class="message-input">
        <input type="text" v-model="currentInputValue" placeholder="Type a message..." @keyup.enter="sendMessage"
          ref="messageInput" />
      </div>
      <el-button class="send-button" @click="sendMessage">
        <el-icon>
          <Position />
        </el-icon>
      </el-button>
    </div>
    <!-- #endregion -->

    <!-- #region Emoji 选择器 -->
    <!-- Emoji 选择器抽屉 -->
    <div
      v-if="showEmojiPicker"
      ref="emojiPanel"
      class="emoji-drawer-container"
      direction="btt"
      style="height: 400px !important;"
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
    </div>



    <!-- #endregion -->

    <!-- #region 用户详情弹窗 -->
    <!-- 用户详情弹窗 -->
    <user-detail-popup v-model:visible="showUserDetail" :user="currentChat" :position="userDetailPosition"
      :hide-start-chat="true" :hide-add-friend="true" />
    <!-- #endregion -->

    <!-- 遮罩和加载动画 -->
    <div v-if="isReconnecting" class="ws-reconnect-mask">
      <WaitConnLoading />
    </div>
  </div>
</template>

<script setup>
// #region 导入依赖
import { ref, onMounted, watch, onUnmounted, computed, nextTick, h } from 'vue';
import {
  Microphone,
  ChatRound,
  Link,
  Position,
  Close
} from '@element-plus/icons-vue';
import 'emoji-picker-element';
import { useDark } from '@vueuse/core';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import { ElMessage, ElNotification } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { checkFriend } from '@/api/friend';
import { addPrivateRoom, checkPrivateRoom } from '@/api/room';
import ChatWebSocket from '@/api/chat.js';
import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';
import { calculateLevel, linkify } from '@/utils/exp';
import { getFriendMessageList } from '@/api/chatService';
import emitter from '@/utils/eventBus';
import Loading from '@/components/loading.vue';
import clickSound from '@/assets/sounds/click.m4a'
import dangerButton from '@/components/dangerButton.vue';
import WaitConnLoading from '@/components/WaitConnLoading.vue';
import { onBeforeUnmount } from 'vue';
// #endregion

// #region 基础状态与引用
const route = useRoute();
const router = useRouter();
const userStore = useUserInfoStore();
const contactStore = useContactStore();

// const inputValue = ref('');
const inputValueMap = ref({});
const currentInputValue = computed({
  get() {
    return inputValueMap.value[currentChat.value.roomId] || '';
  },
  set(val) {
    inputValueMap.value[currentChat.value.roomId] = val;
  }
});
const messages = ref([]);
const showEmojiPicker = ref(false);
const recentEmojis = ref([]);
const isDarkMode = useDark();
const hoverIdx = ref(null);
const isReconnecting = ref(false);
const emojiPanel = ref(null);
const emojiButton = ref(null);
const inputContainer = ref(null);
function onRecallMessage(msg) {
  // TODO: 撤回逻辑
  ElMessage.info('撤回功能开发中');
}
// #endregion

// #region 用户详情相关
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
// #endregion

const handleClickOutside = (e) => {
  // 如果 emoji 面板不存在，直接返回
  if (!showEmojiPicker.value) return;
  
  // 检查点击目标是否在 emoji 面板内
  if (emojiPanel.value && emojiPanel.value.contains(e.target)) {
    return;
  }
  
  // 检查点击目标是否在底部输入控制栏内（包括所有按钮和输入框）
  if (inputContainer.value && inputContainer.value.contains(e.target)) {
    return;
  }
  
  // 如果点击在面板和输入控制栏之外，关闭 emoji 选择器
  showEmojiPicker.value = false;
}

// #region 当前聊天对象信息
const currentChat = ref({
  id: '',
  name: '',
  roomId: '',
  avatar: '',
  status: '',
  level: '',
  createTime: ''
});
// #endregion

// #region 消息相关
const message = ref('');
const messagesContainer = ref(null);
const messageInput = ref(null);
// #endregion

// #region WebSocket 相关
const chatWS = computed(() => userStore.chatWS);
const connectionStatus = ref('connected');

// #endregion

// #region 加载与音频相关
const isLoading = ref(false);
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let messageSound = null;

const initAudio = async () => {
  try {
    await audioContext.resume();
    messageSound = new Audio();
    messageSound.src = clickSound;
    messageSound.volume = 1.0;
    messageSound.preload = 'auto';
    await new Promise((resolve, reject) => {
      messageSound.addEventListener('canplaythrough', resolve, { once: true });
      messageSound.addEventListener('error', (e) => {
        console.error('音频加载错误:', e);
        console.error('音频URL:', messageSound.src);
        reject(e);
      }, { once: true });
      messageSound.load();
    });
    console.log('音频初始化成功');
  } catch (error) {
    console.error('音频初始化失败:', error);
  }
};
// #endregion

// #region 工具函数
const checkWebSocketConnection = () => {
  return chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected();
};

const scrollToBottom = () => {
  nextTick(() => {
    const messageList = document.querySelector('.chat-message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
};
// #endregion

// #region 聊天初始化与历史消息
const checkAndHandleChat = async (userId) => {
  try {
    const friendRes = await checkFriend(userId);
    if (friendRes.code !== 200 || friendRes.data === false) {
      router.push('/404');
      return;
    }
    const roomRes = await checkPrivateRoom(userId);
    if (roomRes.code === 200 && roomRes.data === true) {
      return;
    } else {
      const createRes = await addPrivateRoom({ uid: userId });
      if (createRes.code === 200) {
        emitter.emit('refresh-friend-contact-list');
        await new Promise(resolve => setTimeout(resolve, 1000));
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

const getHistoryMessages = async (roomId) => {
  try {
    isLoading.value = true;
    const res = await getFriendMessageList({ roomId });
    if (res.code === 200) {
      const historyMessages = res.data.map(msg => ({
        side: msg.fromUid === userStore.userInfo.uid ? 'right' : 'left',
        text: msg.content,
        time: msg.createTime,
        id: msg.id,
        status: msg.status,
        type: msg.type
      }));
      messages.value = historyMessages;
      scrollToBottom();
    } else {
      ElMessage.error(res.msg || '获取历史消息失败');
    }
  } catch (error) {
    console.error('获取历史消息错误:', error);
    ElMessage.error('获取历史消息失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};
// #endregion

// #region 路由监听与会话切换
watch(
  () => route.params.id,
  async (newId) => {
    if (route.path.startsWith('/chat/')) {
      newId = Number(newId);
      isLoading.value = true;

      await checkAndHandleChat(newId);
      try {
        let chatUser = contactStore.getContactById(newId);

        if (!chatUser) {
          isReconnecting.value = true;
          await new Promise(resolve => setTimeout(resolve, 1000));
          chatUser = contactStore.getContactById(newId);
        }
        contactStore.setCurrentChat(newId);
        currentChat.value = {
          id: chatUser.id,
          roomId: chatUser.roomId,
          name: chatUser.username,
          avatar: chatUser.avatar,
          status: chatUser.status,
          level: chatUser.exep ? calculateLevel(chatUser.exep) : '',
          createTime: chatUser.createTime
        };
        if (chatUser.roomId) {
          await getHistoryMessages(chatUser.roomId);
        }
        scrollToBottom();
      } catch (error) {
        router.push('/chat');
      } finally {
        isLoading.value = false;
        isReconnecting.value = false;
      }
    }
  },
  {
    immediate: true,
    deep: true,
    flush: 'post'
  }
);

const currentChatStatus = computed(() => {
  if (!currentChat.value.id) return false;
  const friend = contactStore.getContactById(currentChat.value.id);
  return friend ? friend.status : false;
});
// #endregion




// #region 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  emitter.on('websocket-reconnect', () => {
    console.log('Chat收到WebSocket重连事件，显示重连弹窗');
    connectionStatus.value = 'disconnected';
  });
  emitter.on('websocket-connected', () => {
    console.log('Chat收到WebSocket连接成功事件，关闭重连弹窗');
    isReconnecting.value = false;
    connectionStatus.value = 'connected';
  });

  emitter.on('chat-message', (messageData) => {
    console.log('Chat 组件收到聊天消息:', messageData);
    const isInCurrentChat = currentChat.value && currentChat.value.id === messageData.fromUid;
    console.log('当前聊天状态:', {
      currentChatId: currentChat.value?.id,
      messageFromUid: messageData.fromUid,
      isInCurrentChat
    });
    if (!isInCurrentChat) {
      const sender = contactStore.getContactById(messageData.fromUid);
      if (sender) {
        const playSound = async () => {
          try {
            if (!messageSound) {
              await initAudio();
            }
            await audioContext.resume();
            messageSound.volume = 1.0;
            messageSound.currentTime = 0;
            await messageSound.play();
          } catch (error) {
            console.error('播放提示音失败:', error);
            messageSound = null;
          }
        };
        playSound();
        const notification = ElNotification({
          title: '新消息',
          message: `${sender.username} 给您发送了一条消息`,
          type: 'info',
          duration: 3000,
          position: 'top-right',
          customClass: 'apple-notification',
          onClick: () => {
            contactStore.setCurrentChat(sender.id);
            router.push(`/chat/${sender.id}`);
            emitter.emit('refresh-mail-data');
            notification.close();
          }
        });
      }
    } else {
      messages.value.push({
        side: messageData.fromUid === userStore.userInfo.uid ? 'right' : 'left',
        text: messageData.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      nextTick(() => {
        scrollToBottom();
      });
    }
  });
  watch(messages, () => {
    scrollToBottom();
  }, { deep: true });
  const handleUserInteraction = async () => {
    await initAudio();
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('touchstart', handleUserInteraction);
  };
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);
});

onUnmounted(() => {
  emitter.off('chat-message');
  emitter.off('websocket-reconnect');
  emitter.off('websocket-connected');
  document.removeEventListener('click', handleClickOutside)

});
// #endregion

// #region 发送消息
const sendMessage = async () => {
  if (!currentInputValue.value.trim()) return;
  if (!checkWebSocketConnection()) {
    // 不显示警告消息，让连接状态弹窗显示重连按钮
    // 连接状态弹窗会在connectionStatus为'disconnected'时自动显示
    return;
  }
  try {
    const msg = {
      type: 4,
      data: {
        type: 1,
        targetUid: currentChat.value.id, // 使用好友的ID
        roomId: currentChat.value.roomId,
        content: currentInputValue.value
      }
    };
    console.log('发送消息:', msg);
    chatWS.value.send(msg);
    messages.value.push({
      side: 'right',
      text: currentInputValue.value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    inputValueMap.value[currentChat.value.roomId] = '';
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.focus();
      }
      scrollToBottom();
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败，请检查网络连接');
  }
};
// #endregion

// #region Emoji 选择
const onEmojiSelect = (event) => {
  const emoji = event.detail.unicode;
  currentInputValue.value += emoji;
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value = [emoji, ...recentEmojis.value].slice(0, 20);
  }
};
// #endregion

// #region 用户详情弹窗
const handleViewUser = (event) => {
  const rect = event.target.getBoundingClientRect();
  userDetailPosition.value = {
    x: rect.right + 10,
    y: rect.top - 10
  };
  showUserDetail.value = true;
};
// #endregion

// #region 消息分组与时间显示
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

const shouldShowTime = (currentMsg, index) => {
  if (index === 0) return true;
  const currentTime = new Date(currentMsg.time);
  const prevTime = new Date(messages.value[index - 1].time);
  const timeDiff = Math.abs(currentTime - prevTime);
  return timeDiff > 5 * 60 * 1000;
};

const formatMessageDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
// #endregion

// #region 手动重连
const handleManualReconnect = async () => {
  try {
    isReconnecting.value = true; // 显示加载动画
    connectionStatus.value = 'connecting'; // 显示重连按钮文字为连接中...
    setTimeout(async () => {
      await userStore.manualReconnect();
    }, 1500);
  } catch (error) {
    isReconnecting.value = false;
    ElMessage.error('手动重连失败');
  }
};
// #endregion
watch(connectionStatus, (val) => {
  console.log('Chat.vue 观察到 connectionStatus:', val);
  if (val === 'disconnected') {
    ElMessage.warning('WebSocket 连接已断开，请刷新或者点击重连');
  }
});
</script>

<style scoped src="@/assets/styles/chat.css"></style>
<style scoped>
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67C23A;
  margin-right: 4px;
  vertical-align: middle;
  transition: background 0.2s;
}

.status-dot.offline {
  background: #f5222d;
}

.user-status {
  color: #67C23A;
  font-size: 13px;
  font-weight: 500;
}

.user-status.offline {
  color: #f5222d;
}

.recall-inline-icon {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2px 10px;
  transform: translateX(8px);
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
}

.recall-inline-icon:hover {
  background: rgba(44, 4, 4, 0.8);
}

.chat-message-item:hover .recall-inline-icon {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.recall-text {
  color: #f1101b;
  font-size: 13px;
  margin-left: 2px;
}

.ws-reconnect-mask {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

body.dark-theme .ws-reconnect-mask {
  background: rgba(30, 30, 30, 0.6);
}

:deep(.el-drawer.btt) {
  position: fixed !important;


}
</style>