<template>
  <div class="chat-container">
    <!-- 顶部群聊信息 -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="40" class="user-avatar" :src="currentGroup.avatar" @click="showGroupDetailPopupHandler" style="cursor:pointer;" />
        <div class="user-details">
          <div class="user-name">{{ currentGroup.name }}</div>
          <div class="user-subtitle">
            <span class="online-dot"></span><span class="online-count-label">在线人数:{{currentGroup.onlineCount}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 群聊详情弹窗 -->
    <GroupDetailPopup
      v-if="showGroupDetailPopup"
      :visible="showGroupDetailPopup"
      :group="currentGroup"
      :position="groupDetailPopupPosition"
      @update:visible="showGroupDetailPopup = false"
      ref="groupDetailPopupRef"
    />
    <!-- 聊天消息区 -->
    <div class="chat-message-list" ref="messagesContainer" style="position: relative;">
      <!-- 遮罩层，点击关闭抽屉 -->
      <div v-if="showMemberDrawer" class="drawer-mask" @click="showMemberDrawer = false"></div>
      <template v-if="messages.length > 0">
        <div v-for="(msg, idx) in messages" :key="idx" class="message-wrapper" v-show="!isLoading">
          <div v-if="shouldShowTime(msg, idx)" class="message-time-group">
            <span class="time-divider">{{ formatMessageDate(new Date(msg.time)) }}</span>
          </div>
          <div :class="['chat-message-item', msg.side]">
            <el-avatar v-if="msg.side === 'left'" :size="32" class="user-avatar" :src="msg.avatar || currentGroup.avatar" />
            <div class="chat-bubble">{{ msg.text }}</div>
            <el-avatar v-if="msg.side === 'right'" :size="32" class="user-avatar" :src="userStore.userInfo.avatar" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-message-tip" v-show="!isLoading">没有聊天记录</div>
      </template>
      <div v-if="isLoading" class="loading-wrapper">
        <Loading />
      </div>
      <!-- 群成员抽屉按钮 -->
      <div class="member-drawer-btn-wrapper">
        <el-button type="primary" icon="UserFilled" @click="showMemberDrawer = true" class="member-btn-semicircle">群成员</el-button>
      </div>
      <!-- 群成员自定义抽屉，仅覆盖聊天区 -->
      <transition name="drawer-slide">
        <div v-if="showMemberDrawer" class="custom-member-drawer">
          <div class="drawer-header">
            <MacWindowControls @close="showMemberDrawer = false" style="margin-right: 8px;" />
          </div>
          <div class="member-list">
            <div v-for="member in currentGroup.members" :key="member.id" class="member-item">
              <div class="member-avatar-wrapper">
                <el-avatar :size="32" :src="member.avatar" :class="[member.role === 1 ? 'avatar-owner' : member.role === 2 ? 'avatar-admin' : '']" />
                <span class="member-status-dot" :class="{ online: member.status === 1, offline: member.status !== 1 }"></span>
              </div>
              <span>{{ member.name }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- 底部输入区 -->
    <div class="message-input-container">
      <el-button class="input-icon-btn link-icon" circle>
        <el-icon><Link /></el-icon>
      </el-button>
      <el-button class="input-icon-btn" circle @click="showEmojiPicker = true">
        <el-icon><ChatRound /></el-icon>
      </el-button>
      <div class="message-input">
        <input type="text" v-model="inputValue" placeholder="Type a message..." @keyup.enter="sendMessage" ref="messageInput" />
      </div>
      <el-button class="send-button" @click="sendMessage">
        <el-icon><Position /></el-icon>
      </el-button>
    </div>
    <!-- Emoji 选择器抽屉 -->
    <el-drawer v-model="showEmojiPicker" title="选择表情" direction="btt" size="400px" :with-header="false" class="emoji-drawer">
      <emoji-picker @emoji-click="onEmojiSelect" :native="true" :show-preview="true" :show-skin-tones="true" :show-search="true" :show-categories="true" :show-recent="true" :recent="recentEmojis" :theme="isDarkMode ? 'dark' : 'light'" />
    </el-drawer>
    <!-- 群聊专属功能区 -->
    <!-- WebSocket 连接状态提示（群聊） -->
    <div v-if="connectionStatus === 'disconnected'" class="connection-status-bar">
      <el-alert
        title="WebSocket 连接已断开"
        type="warning"
        :closable="false"
        show-icon
        style="--el-alert-title-color: #f56c6c; --el-alert-text-color: #409EFF;"
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
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import { ChatRound, Link, Position, UserFilled, Close } from '@element-plus/icons-vue';
import 'emoji-picker-element';
import { useDark } from '@vueuse/core';
import { useRoute } from 'vue-router';
import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';
import { getGroupDetail, listGroupMember } from '@/api/room';
import Loading from '@/components/loading.vue';
import MacWindowControls from '@/components/MacWindowControls.vue';
import GroupDetailPopup from '@/components/GroupDetailPopup.vue';
import { formatDateTime } from '@/utils/time';
import dangerButton from '@/components/dangerButton.vue';

const route = useRoute();
const userStore = useUserInfoStore();
const contactStore = useContactStore();
const inputValue = ref('');
const messages = ref([]);
const showEmojiPicker = ref(false);
const recentEmojis = ref([]);
const isDarkMode = useDark();
const messagesContainer = ref(null);
const messageInput = ref(null);
const isLoading = ref(false);
const showMemberDrawer = ref(false);

const currentGroup = ref({
  id: '',
  roomId: '',
  name: '',
  avatar: '',
  createTime: '',
  groupDesc: '',
  memberCount: '',
  members: [],
  onlineCount: 0
});

// 群聊详情弹窗相关
const showGroupDetailPopup = ref(false);
const groupDetailPopupPosition = ref({ x: 0, y: 0 });
const groupDetailPopupRef = ref(null);

const connectionStatus = computed(() => userStore.connectionStatus);

function showGroupDetailPopupHandler(event) {
  const rect = event.target.getBoundingClientRect();
  groupDetailPopupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 8
  };
  showGroupDetailPopup.value = true;
  nextTick(() => {
    // 聚焦弹窗，便于后续点击检测
    if (groupDetailPopupRef.value) {
      groupDetailPopupRef.value.focus && groupDetailPopupRef.value.focus();
    }
  });
}

function handleClickOutside(e) {
  if (!showGroupDetailPopup.value) return;
  // 检查点击是否在弹窗内
  const popupEl = groupDetailPopupRef.value?.$el || groupDetailPopupRef.value;
  if (popupEl && !popupEl.contains(e.target)) {
    showGroupDetailPopup.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// const getHistoryMessages = async (roomId) => {
//   try {
//     isLoading.value = true;
//     // const res = await getMessageList({ roomId });
//     if (res.code === 200) {
//       const historyMessages = res.data.map(msg => ({
//         side: msg.fromUid === userStore.userInfo.uid ? 'right' : 'left',
//         text: msg.content,
//         time: msg.createTime,
//         id: msg.id,
//         status: msg.status,
//         type: msg.type,
//         avatar: msg.avatar // 可选：消息发送者头像
//       }));
//       messages.value = historyMessages;
//       scrollToBottom();
//     }
//   } finally {
//     isLoading.value = false;
//   }
// };

const scrollToBottom = () => {
  nextTick(() => {
    const messageList = document.querySelector('.chat-message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
};

watch(
  () => route.params.id,
  async (newId) => {
    if (route.path.startsWith('/groupchat/') && newId) {
      isLoading.value = true;
      try {
        // 查询群聊详情
        const detailRes = await getGroupDetail(newId);
        if (detailRes.code === 200 && detailRes.data) {
          const detail = detailRes.data;
          currentGroup.value = {
            ...currentGroup.value,
            id: detail.roomId,
            roomId: detail.roomId,
            name: detail.name,
            avatar: detail.avatar,
            groupDesc: detail.groupDesc,
            createTime: detail.createTime
          };
        } else {
          const group = contactStore.getGroupChatById(newId);
          if (!group) return;
          currentGroup.value = { ...group };
        }
        // 查询群成员（分页，前7个）
        const memberRes = await listGroupMember(newId, { page: 1, pageSize: 7 });
        if (memberRes.code === 200 && memberRes.data && memberRes.data.records) {
          const members = memberRes.data.records.map(m => ({
            id: m.uid,
            name: m.username,
            avatar: m.avatar,
            role: m.role,
            status: m.status,
            joinGroupTime: m.joinGroupTime
          }));
          currentGroup.value.members = members;
          currentGroup.value.onlineCount = members.filter(m => m.status === 1).length;
          currentGroup.value.memberCount = memberRes.data.total || 0;
        } else {
          currentGroup.value.members = [];
          currentGroup.value.onlineCount = 0;
          currentGroup.value.memberCount = 0;
        }
        if (currentGroup.value.roomId) {
          await getHistoryMessages(currentGroup.value.roomId);
        }
        scrollToBottom();
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

const sendMessage = async () => {
  if (!inputValue.value.trim()) return;
  // TODO: 群聊消息发送逻辑
  inputValue.value = '';
  nextTick(() => {
    if (messageInput.value) messageInput.value.focus();
    scrollToBottom();
  });
};

const onEmojiSelect = (event) => {
  const emoji = event.detail.unicode;
  inputValue.value += emoji;
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value = [emoji, ...recentEmojis.value].slice(0, 20);
  }
};

const shouldShowTime = (currentMsg, index) => {
  if (index === 0) return true;
  const currentTime = new Date(currentMsg.time);
  const prevTime = new Date(messages.value[index - 1].time);
  return Math.abs(currentTime - prevTime) > 5 * 60 * 1000;
};

const formatMessageDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const handleManualReconnect = async () => {
  try {
    userStore.manualReconnect();
  } catch (error) {
    console.error('手动重连失败:', error);
  }
};
</script>

<style scoped src="@/assets/styles/chat.css"></style>
<style scoped>
.member-drawer-btn-wrapper {
  position: absolute;
  top: 10%;
  right: 0;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  width: 0;
}
.member-drawer-btn-wrapper .el-button {
  pointer-events: auto;
  width: 80px;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
}

.custom-member-drawer {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 150px;
  background: var(--drawer-bg, #fff);
  box-shadow: -2px 0 12px rgba(0,0,0,0.12);
  z-index: 100;
  display: flex;
  flex-direction: column;
  color: var(--drawer-text, #222);
  overflow-x: hidden;
}
/* 强制隐藏抽屉和消息区横向滚动条 */
.custom-member-drawer::-webkit-scrollbar {
  display: none !important;
}
.custom-member-drawer {
  scrollbar-width: none; /* Firefox */
}
.chat-message-list::-webkit-scrollbar {
  display: none !important;
}
.chat-message-list {
  scrollbar-width: none;
}
.drawer-header {
  padding: 16px 20px 8px 20px;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid var(--drawer-border, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--drawer-text, #222);
}
.member-list {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
  background: transparent;
}
.member-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--drawer-border, #f0f0f0);
  color: var(--drawer-text, #222);
}
.member-item span {
  font-size: 10px;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to {
  transform: translateX(100%);
}
.drawer-slide-enter-to, .drawer-slide-leave-from {
  transform: translateX(0);
}

/* 日夜间模式适配 */
:root {
  --drawer-bg: #fff;
  --drawer-text: #222;
  --drawer-border: #f0f0f0;
}
.dark-mode .custom-member-drawer {
  --drawer-bg: #23272e;
  --drawer-text: #e0e6ed;
  --drawer-border: #363636;
}
.drawer-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.01);
  z-index: 99;
}
.member-btn-semicircle {
  border-radius: 0 32px 0 32px;
  border-top-right-radius: 32px;
  border-bottom-right-radius: 32px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin: 0;
  padding: 10px 22px 10px 16px;
  min-width: 60px;
  min-height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.774);
  background: rgb(231, 229, 229); /* 半透明蓝色 */
  color:red;
  font-weight: 800;
  border: none;
  transition: background 0.2s;
  backdrop-filter: blur(19px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px);
  /* 让内容更清晰 */
  outline: none;
}
.dark-mode .member-btn-semicircle{
  background: rgb(95, 95, 95); /* 半透明蓝色 */
  
}
.member-btn-semicircle:hover {
  background: rgba(51,126,204,0.35);
}
.online-count-label {
  font-size: 11px;
  color: #999;
  margin-left: 0;
  margin-right: 0;
  font-weight: 400;
}
.online-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67C23A;
  margin-right: 4px;
  vertical-align: middle;
}
.member-avatar-wrapper {
  position: relative;
  display: inline-block;
}
.member-status-dot {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #bbb;
  z-index: 2;
}
.member-status-dot.online {
  background: #67C23A;
}
.member-status-dot.offline {
  background: #bbb;
}
.avatar-owner {
  box-shadow: 0 0 0 2px #FFD700, 0 0 8px #FFD700;
  border: 2px solid transparent !important;

  box-shadow: 0 0 0 2px #FFD700, 0 0 8px #FFD700;
  border: 1.3px solid #FFD700 !important;

  padding: 2px;

  position: relative;
}
.avatar-owner .el-avatar__inner {
  background: #fff;
  border-radius: 50%;
}
.avatar-admin {
  box-shadow: 0 0 0 2px #67C23A, 0 0 8px #67C23A;
  border: 1.3 solid #67C23A !important;
}
</style> 