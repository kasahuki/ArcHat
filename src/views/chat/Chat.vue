<template>
  <router-view v-if="!route.params.id"></router-view>
  <div v-else class="chat-container">
    <!-- WebSocket 连接状态提示 -->
    <div v-if="connectionStatus === 'disconnected'" class="connection-status-bar">
      <el-alert
        title="WebSocket 连接已断开"
        type="warning"
        :closable="false"
        show-icon

      >
        <template #default>
          <span style="color:#409EFF; font-weight:600;">消息可能无法正常发送，请点击重新连接</span>
          <danger-button
            type="success"
            size="small"
            @click="handleManualReconnect"
            :loading="connectionStatus === 'connecting'"
            style="margin-left: 10px;"
          >
            {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
          </danger-button>
        </template>
      </el-alert>
    </div>

    <!-- 顶部用户信息（仅私聊） -->
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
        <div v-for="(msg, idx) in messages" :key="idx" class="message-wrapper" v-show="!isLoading">
          <!-- 时间显示 -->
          <div v-if="shouldShowTime(msg, idx)" class="message-time-group">
            <span class="time-divider">{{ formatMessageDate(new Date(msg.time)) }}</span>
          </div>
          <div :class="['chat-message-item', msg.side]">
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
        <input type="text" v-model="inputValue" placeholder="Type a message..." 
          @keyup.enter="sendMessage"
          ref="messageInput" />
      </div>
      <el-button class="send-button" @click="sendMessage">
        <el-icon>
          <Position />
        </el-icon>
      </el-button>
    </div>

    <!-- Emoji 选择器抽屉 -->
    <el-drawer v-model="showEmojiPicker" title="选择表情" direction="btt" size="400px" :with-header="false"
      class="emoji-drawer">
      <emoji-picker @emoji-click="onEmojiSelect" :native="true" :show-preview="true" :show-skin-tones="true"
        :show-search="true" :show-categories="true" :show-recent="true" :recent="recentEmojis"
        :theme="isDarkMode ? 'dark' : 'light'" />
    </el-drawer>

    <!-- 用户详情弹窗 -->
    <user-detail-popup v-model:visible="showUserDetail" :user="currentChat" :position="userDetailPosition"
      :hide-start-chat="true" :hide-add-friend="true" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed, nextTick, h } from 'vue';
import {
  Microphone,
  ChatRound,
  Link,
  Position
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
import { getMessageList } from '@/api/chatService';
import emitter from '@/utils/eventBus';
import Loading from '@/components/loading.vue';
import clickSound from '@/assets/sounds/click.m4a'
import dangerButton from '@/components/dangerButton.vue';

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

// 连接状态
const connectionStatus = computed(() => userStore.connectionStatus);

// 添加加载状态
const isLoading = ref(false);

// 在 script setup 顶部添加
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let messageSound = null;

// 添加音频初始化函数
const initAudio = async () => {
  try {
    await audioContext.resume();
    // 创建新的音频实例
    messageSound = new Audio();
    // 使用导入的音频文件
    messageSound.src = clickSound;
    messageSound.volume = 1.0;
    messageSound.preload = 'auto';
    
    // 等待音频加载完成
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

// 检查 WebSocket 连接状态
const checkWebSocketConnection = () => {
  return chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected();
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
        emitter.emit('refresh-contact-list');
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
    isLoading.value = true;
    const res = await getMessageList({ roomId });
    if (res.code === 200) {
      // 将历史消息转换为前端显示格式
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

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    if (route.path.startsWith('/chat/') && newId) {
      isLoading.value = true;
      await checkAndHandleChat(newId);
      try {
        // 从 contactStore 中获取当前聊天的联系人信息
        const chatUser = contactStore.getContactById(newId);
        console.log('chatUser', chatUser);
        // 设置当前聊天对象
        contactStore.setCurrentChat(newId);

        // 私聊数据模型
        currentChat.value = {
          id: chatUser.id,
          roomId: chatUser.roomId,
          name: chatUser.username,
          avatar: chatUser.avatar,
          status: chatUser.status,
          level: chatUser.exep ? calculateLevel(chatUser.exep) : '',
          createTime: chatUser.createTime
        };

        // 获取历史消息
        if (chatUser.roomId) {
          await getHistoryMessages(chatUser.roomId);
        }
        scrollToBottom();
      } catch (error) {
        console.error('切换会话错误:', error);
        ElMessage.error('切换会话失败，请稍后重试');
      } finally {
        isLoading.value = false;
      }
    }
  },
  {
    immediate: true,
    deep: true,
    flush: 'post'
  }
);

// 组件挂载时初始化
onMounted(() => {
  console.log('Chat 组件挂载，设置消息监听');

  emitter.on('chat-message', (messageData) => {
    console.log('Chat 组件收到聊天消息:', messageData);
    
    // 检查是否在当前聊天界面
    const isInCurrentChat = currentChat.value && currentChat.value.id === messageData.fromUid;
    console.log('当前聊天状态:', {
      currentChatId: currentChat.value?.id,
      messageFromUid: messageData.fromUid,
      isInCurrentChat
    });
    
    // 如果不在当前聊天界面，显示通知
    if (!isInCurrentChat) {
      // 从联系人列表中获取发送者信息
      const sender = contactStore.getContactById(messageData.fromUid);
      if (sender) {
        // 播放提示音
        const playSound = async () => {
          try {
            if (!messageSound) {
              await initAudio();
            }
            
            // 确保音频上下文已恢复
            await audioContext.resume();
            // 确保音量最大
            messageSound.volume = 1.0;
            // 重置音频到开始位置
            messageSound.currentTime = 0;
            // 播放音频
            await messageSound.play();
          } catch (error) {
            console.error('播放提示音失败:', error);
            // 如果播放失败，尝试重新初始化
            messageSound = null;
          }
        };

        // 调用播放函数
        playSound();
        
        // 使用 ElNotification 显示通知
        const notification = ElNotification({
          title: '新消息',
          message: `${sender.username} 给您发送了一条消息`,
          type: 'info',
          duration: 3000,
          position: 'top-right',
          customClass: 'apple-notification',
          onClick: () => {
            // 设置当前聊天对象
            contactStore.setCurrentChat(sender.id);
            // 使用发送者的ID进行跳转
            router.push(`/chat/${sender.id}`);
            // 触发刷新 mail 数据的事件
            emitter.emit('refresh-mail-data');
            notification.close();
          }
        });
      }
    } else {
      // 在当前聊天界面时添加消息
      console.log('添加消息到当前聊天:', messageData);
      messages.value.push({
        side: messageData.fromUid === userStore.userInfo.uid ? 'right' : 'left',
        text: messageData.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      
      // 强制触发响应式更新并滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
    }
  });

  // 监听消息列表变化
  watch(messages, () => {
    scrollToBottom();
  }, { deep: true });

  // 在组件挂载时初始化音频
  const handleUserInteraction = async () => {
    await initAudio();
    // 移除事件监听
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('touchstart', handleUserInteraction);
  };

  // 添加事件监听
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  console.log('Chat 组件卸载，移除消息监听');
  emitter.off('chat-message');
});

// 发送消息
const sendMessage = async () => {
  if (!inputValue.value.trim()) return;  
  
  // 检查 WebSocket 连接状态
  if (!checkWebSocketConnection()) {
    ElMessage.warning('WebSocket 未连接，请点击重新连接按钮');
    return;
  }

  try {
    // 构造消息体
    const msg = {
      type: 4,
      data: {
        type: 1,
        targetUid: currentChat.value.id, // 使用好友的ID
        roomId: currentChat.value.roomId,
        content: inputValue.value
      }
    };
    console.log('发送消息:', msg);

    // 通过 WebSocket 发送
    chatWS.value.send(msg);

    // 本地显示消息
    messages.value.push({
      side: 'right',
      text: inputValue.value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    inputValue.value = '';

    // 发送后让输入框获得焦点
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

// 手动重连
const handleManualReconnect = async () => {
  try {
    userStore.manualReconnect();
  } catch (error) {
    console.error('手动重连失败:', error);
    ElMessage.error('重连失败，请稍后重试');
  }
};
</script>

<style scoped src="@/assets/styles/chat.css"></style>