<template>
  <div class="chat-container">
    <!-- 遮罩和加载动画 -->
    <div v-if="isReconnecting" class="ws-reconnect-mask">
      <WaitConnLoading />
    </div>
    <!-- 顶部群聊信息 -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="40" class="user-avatar" :src="currentGroup.avatar" @click="showGroupDetailPopupHandler"
          style="cursor:pointer;" />
        <div class="user-details">
          <div class="user-name">{{ currentGroup.name }}</div>
          <div class="user-subtitle">
            <span class="online-dot"></span><span class="online-count-label">在线人数:{{ onlineCount }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 群聊详情弹窗 -->
    <GroupDetailPopup v-if="showGroupDetailPopup" :visible="showGroupDetailPopup" :group="currentGroup"
      :position="groupDetailPopupPosition" @update:visible="showGroupDetailPopup = false" ref="groupDetailPopupRef" />
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
            <el-avatar v-if="msg.side === 'left'" :size="48" class="user-avatar"
              :src="msg.avatar && msg.avatar.trim() ? msg.avatar : undefined" :alt="msg.username"
              @click="(e) => handleAvatarClick(e, msg)" style="cursor:pointer;">
              <template v-if="!msg.avatar || !msg.avatar.trim()">
                {{ msg.username ? msg.username.charAt(0) : '' }}
              </template>
            </el-avatar>
            <div class="msg-main">
              <!-- 新增：左侧消息显示用户名 -->
              <div v-if="msg.side === 'left'"
                   class="msg-username"
                   :class="{'owner-name': msg.role === 1, 'admin-name': msg.role === 2}">
                {{ msg.username }}
              </div>
              <!-- 文件消息 -->
              <template v-if="msg.type === 4 && msg.text && msg.text.url">
                <div :class="['file-msg', getFileTypeClass(msg.text.fileName)]">
                  <a :href="msg.text.url" :download="msg.text.fileName" target="_blank">
                    <span class="file-msg-icon" v-html="getFileSvg(msg.text.fileName.split('.').pop().toLowerCase())"></span>
                    <span class="file-msg-name">{{ msg.text.fileName }}</span>
                    <span class="file-msg-size">({{ formatFileSize(msg.text.size) }})</span>
                  </a>
                </div>
              </template>
              <!-- 图片消息 -->
              <template v-else-if="msg.type === 3 && msg.text && msg.text.url">
                <el-image :src="msg.text.url" :preview-src-list="[msg.text.url]" class="img-shadow"
                  style="max-width:280px;max-height:580px;border-radius:8px;" />
              </template>
              <!-- 普通文本消息 -->
              <template v-else>
                <div class="chat-bubble" v-html="msg.text"></div>
              </template>
            </div>
            <el-avatar v-if="msg.side === 'right'" :size="48" class="user-avatar" :src="userStore.userInfo.avatar" />
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
        <el-button type="primary" icon="UserFilled" @click="showMemberDrawer = true"
          class="member-btn-semicircle">群成员</el-button>
      </div>
      <!-- 群成员自定义抽屉，仅覆盖聊天区 -->
      <transition name="drawer-slide">
        <div v-if="showMemberDrawer" class="custom-member-drawer">
          <div class="drawer-header">
            <MacWindowControls @close="showMemberDrawer = false" style="margin-right: 8px; top: 2px" />
          </div>
          <div class="member-list">
            <div v-for="member in currentGroup.members" :key="member.id" class="member-item">
              <div class="member-avatar-wrapper">
                <el-avatar :size="32" :src="member.avatar"
                  :class="[member.role === 1 ? 'avatar-owner' : member.role === 2 ? 'avatar-admin' : '']"
                  @click="(e) => handleMemberClick(e, member)" style="cursor:pointer;" />
                <span class="member-status-dot"
                  :class="{ online: member.status === 1, offline: member.status !== 1 }"></span>
              </div>
              <span>{{ member.name }}</span>
            </div>
          </div>
        </div>
      </transition>
      <!-- 用户详情弹窗 -->
      <UserDetailPopup v-if="showUserDetailPopup" :visible="showUserDetailPopup" :user="userDetail"
        :position="userDetailPopupPosition" @update:visible="showUserDetailPopup = false" @start-chat="handleStartChat"
        @add-friend="handleAddFriend">
        <template #footer>
          <template v-if="userDetail.id !== userStore.userInfo.uid">
            <DangerButton v-if="isFriend(userDetail.id)" type="primary" @click="handleStartChat">开始聊天</DangerButton>
            <DangerButton v-else type="warning" @click="handleAddFriend">添加好友</DangerButton>
          </template>
        </template>
      </UserDetailPopup>
    </div>
    <!-- 底部输入区 -->
    <div class="message-input-container" style="position: relative;">
      <!-- 多图预览区，悬浮在输入框上方 -->
      <div v-if="imagePreviewUrls.length" class="image-preview-floating">
        <div v-for="(url, idx) in imagePreviewUrls" :key="url" class="image-preview-item">
          <img :src="url" class="image-preview-thumb" />
          <el-button class="image-preview-close" circle
            @click="() => { imagePreviewUrls.splice(idx, 1); selectedImages.splice(idx, 1); }">
            <el-icon>
              <Close style="color: #f56c6c; scale: 1.2;" />
            </el-icon>
          </el-button>
        </div>

      </div>
      <!-- 文件和图片预览区，居中显示，超出横向滚动 -->
      <div v-if="imagePreviewUrls.length || filePreviewList.length"
        class="file-image-preview-bar file-image-preview-center">

        <!-- 文件预览 -->
        <div v-for="(preview, idx) in filePreviewList" :key="preview.previewKey" class="preview-card"
          :title="preview.fileName">
          <div class="preview-card-inner">
            <span :class="['file-icon-large', preview.fileTypeClass]">{{ preview.fileIcon }}</span>
            <div class="file-info-block">
              <div class="file-name-block">{{ preview.fileName }}</div>
              <div class="file-size-block">{{ formatFileSize(preview.file.size) }}</div>
            </div>
            <button class="remove-btn-card" @click="removePreviewFile(idx)">×</button>
          </div>
        </div>
      </div>
      <el-button class="input-icon-btn" circle @click="showEmojiPicker = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><mask id="lineMdEmojiGrinFilled0"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="#fff" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9"><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.5s" values="0;1"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M9 9v1"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.2s" dur="0.2s" values="2;0"/></path><path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M15 9v1"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.4s" dur="0.2s" values="2;0"/></path><path fill="#000" stroke="none" d="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z"><animate fill="freeze" attributeName="d" begin="1.6s" dur="0.2s" values="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z;M12 14c-2.5 0 -3.25 -1 -4 -1c-0.55 0 -1 0.45 -1 1c0 0.75 1.5 4 5 4c3.5 0 5 -3.25 5 -4c0 -0.55 -0.45 -1 -1 -1c-0.75 0 -1.5 1 -4 1Z"/></path></g></mask><rect width="24" height="24" fill="currentColor" mask="url(#lineMdEmojiGrinFilled0)"/></svg>
      </el-button>
      <el-button class="input-icon-btn" circle @click="triggerImageInput">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm1-4h12l-3.75-5l-3 4L9 13z"/></svg>
      </el-button>
      <el-button class="input-icon-btn" circle @click="triggerFileInput">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="currentColor" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64" d="M12 7h8c0.55 0 1 0.45 1 1v10c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-11Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.5s" values="0;1"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path d="M12 7h-9v0c0 0 0.45 0 1 0h6z" opacity="0"><animate fill="freeze" attributeName="d" begin="0.6s" dur="0.2s" values="M12 7h-9v0c0 0 0.45 0 1 0h6z;M12 7h-9v-1c0 -0.55 0.45 -1 1 -1h6z"/><set fill="freeze" attributeName="opacity" begin="0.6s" to="1"/></path></g></svg>
      </el-button>
      <input type="file" ref="imageInput" accept="image/*" multiple style="display:none" @change="onImageSelected" />
      <input type="file" ref="fileInput" multiple style="display:none" @change="onFileSelected"
        accept=".pdf,.doc,.docx,.md,.txt,.zip,.rar,.7z,.xlsx,.xls,.ppt,.pptx,.csv,.json,.xml,.html,.js,.ts,.vue,.mp3,.wav,.aac,.ogg" />

      <div class="message-input">
        <input type="text" v-model="inputValue" placeholder="Type a message..." @keyup.enter="sendMessage"
          ref="messageInput" />
      </div>
      <el-button class="send-button" @click="imagePreviewUrls.length ? sendImageMessage() : sendMessage()">
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
    <!-- 群聊专属功能区 -->
    <!-- WebSocket 连接状态提示（群聊） -->
    <div v-if="connectionStatus === 'disconnected'" class="connection-status-bar">
      <el-alert title="WebSocket 连接已断开" type="warning" :closable="false" show-icon
        style="--el-alert-title-color: #f56c6c; --el-alert-text-color: #409EFF;">
        <template #default>
          <span style="color:#409EFF; font-weight:600;">消息可能无法正常发送，请点击重新连接</span>
          <danger-button type="success" size="small" @click="handleManualReconnect"
            :loading="connectionStatus === 'connecting'" style="margin-left: 10px;">
            {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
          </danger-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import { ChatRound, Link, Position, UserFilled, Close, Picture, UploadFilled } from '@element-plus/icons-vue';
import 'emoji-picker-element';
import { useDark } from '@vueuse/core';
import { useRoute } from 'vue-router';
import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';
import { getGroupDetail, listGroupMember } from '@/api/room';
import { getGroupMessageList } from '@/api/chatService';
import Loading from '@/components/loading.vue';
import MacWindowControls from '@/components/MacWindowControls.vue';
import GroupDetailPopup from '@/components/GroupDetailPopup.vue';
import { formatDateTime } from '@/utils/time';
import dangerButton from '@/components/dangerButton.vue';
import emitter from '@/utils/eventBus';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import { useRouter } from 'vue-router';
import { searchFriends } from '@/api/friend';
import { calculateLevel } from '@/utils/exp';
import { addFriend } from '@/api/friend';
import { sendMsg } from '@/api/chatService';
import { onUnmounted } from 'vue';
import WaitConnLoading from '@/components/WaitConnLoading.vue';
import { uploadImageFile } from '@/utils/fileHandler';
import { ElMessage } from 'element-plus';
import { getFileSvg } from '@/utils/filesIcons';
const isReconnecting = ref(false);
const route = useRoute();
const userStore = useUserInfoStore();
const contactStore = useContactStore();
const inputValue = ref('');
const messages = ref([]);
const page = ref(1);
const pageSize = 100;
const hasMore = ref(true);
const showEmojiPicker = ref(false);
const recentEmojis = ref([]);
const isDarkMode = useDark();
const messagesContainer = ref(null);
const messageInput = ref(null);
const isLoading = ref(false);
const showMemberDrawer = ref(false);
const memberMap = ref({}); // 群成员id->member对象映射

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

// 新增：在线人数计算属性
const onlineCount = computed(() => {
  return (currentGroup.value.members || []).filter(member => member.status === 1).length;
});

// 群聊详情弹窗相关
const showGroupDetailPopup = ref(false);
const groupDetailPopupPosition = ref({ x: 0, y: 0 });
const groupDetailPopupRef = ref(null);

const router = useRouter();

// 用户详情弹窗相关
const showUserDetailPopup = ref(false);
const userDetailPopupPosition = ref({ x: 0, y: 0 });
const userDetail = ref({});
const userDetailLoading = ref(false);

// 从父组件props获取好友列表
const props = defineProps({
  friendList: {
    type: Array,
    default: () => []
  }
});

const connectionStatus = ref('connected');

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

function resetAndFetch() {
  messages.value = [];
  currentGroup.value = { members: [] };
  // 拉取新数据...
}

onMounted(resetAndFetch);

watch(
  () => route.params.id,
  () => {
    resetAndFetch();
  }
);

onMounted(() => {
  resetAndFetch();
  document.addEventListener('mousedown', handleClickOutside);
  emitter.on('group-message', handleGroupMessage);
  // 监听WebSocket连接成功事件，关闭loading动画
  emitter.on('websocket-connected', () => {
    console.log('GroupChat收到WebSocket连接成功事件，关闭loading动画');
    isReconnecting.value = false;
    connectionStatus.value = 'connected';
  });
  emitter.on('websocket-reconnect', () => {
    console.log('GroupChat收到WebSocket重连事件，显示重连弹窗');
    connectionStatus.value = 'disconnected';
  });
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
onUnmounted(() => {
  emitter.off('group-message');
  emitter.off('websocket-connected');
  emitter.off('websocket-reconnect');
});

// 连接成功后动画未及时关闭的问题
const handleManualReconnect = async () => {
  try {
    isReconnecting.value = true;
    connectionStatus.value = 'connecting';
    setTimeout(async () => {
      await userStore.manualReconnect();
    }, 1500);
  } catch (error) {
    isReconnecting.value = false;
    ElMessage.error('手动重连失败');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const messageList = document.querySelector('.chat-message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
};
function isFriend(uid) {
  return props.friendList.some(f => f.id === uid);
}

function handleStartChat() {
  // 跳转到私聊
  router.push(`/chat/${userDetail.value.id}`);
  showUserDetailPopup.value = false;
}
// 加载群聊消息（分页）
const loadGroupMessages = async (reset = false) => {
  if (!currentGroup.value.roomId || !hasMore.value) return;
  isLoading.value = true;
  try {
    const params = {
      roomId: currentGroup.value.roomId,
      basePageReq: {
        page: page.value,
        pageSize
      }
    };
    const res = await getGroupMessageList(params);
    // 适配后端分页结构
    const records = res?.data?.records || [];
    if (res.code === 200 && Array.isArray(records)) {
      const historyMessages = records.map(msg => {
        const fromUid = msg.fromUser?.uid;
        const message = msg.message || {};
        // 通过memberMap查找群成员信息
        const member = memberMap.value[fromUid] || {};
        return {
          id: message.id,
          roomId: message.roomId,
          time: message.sendTime,
          type: message.type,
          text: getMessageText(message),
          fromUid,
          side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
          avatar: member.avatar || msg.fromUser?.avatar || '',
          username: member.name || msg.fromUser?.username || '群成员',
          role: member.role,
          status: member.status
        };
      });
      if (reset) {
        messages.value = historyMessages;
      } else {
        messages.value = [...historyMessages, ...messages.value];
      }
      hasMore.value = records.length === pageSize;
    } else {
      hasMore.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

// 监听路由变化，首次加载最新100条
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
          // 建立id->member映射
          memberMap.value = Object.fromEntries(members.map(m => [m.id, m]));
          currentGroup.value.memberCount = memberRes.data.total || 0;
        } else {
          currentGroup.value.members = [];
          memberMap.value = {};
          currentGroup.value.memberCount = 0;
        }
        if (currentGroup.value.roomId) {
          page.value = 1;
          hasMore.value = true;
          await loadGroupMessages(true);
          nextTick(() => scrollToBottom());
        }
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

// 滚动到顶部加载更多
const handleScroll = async () => {
  const container = messagesContainer.value;
  if (!container || isLoading.value || !hasMore.value) return;
  if (container.scrollTop === 0) {
    page.value += 1;
    const oldHeight = container.scrollHeight;
    await loadGroupMessages();
    nextTick(() => {
      // 保持滚动位置
      container.scrollTop = container.scrollHeight - oldHeight;
    });
  }
};

onMounted(() => {


  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll);
  }
  emitter.on('user-status', (data) => {
    if (!data || !Array.isArray(data.changeList)) return;
    currentGroup.value.members.forEach(member => {
      const change = data.changeList.find(c => c.uid === member.id);
      if (change) {
        member.status = change.activeStatus;
      }
    });
  });
});
onBeforeUnmount(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll);
  }
});
onBeforeUnmount(() => {
  emitter.off('start-chat');
  emitter.off('user-status');
  emitter.off('add-friend');

});
// 修改getMessageText逻辑 消息返回对象
const getMessageText = (message) => {
  if (!message) return '';
  switch (message.type) {
    case 1: // TEXT
      if (typeof message.body === 'string') return message.body;
      if (typeof message.body === 'object' && message.body !== null) {
        // 优先取 content 字段
        return message.body.content || message.body.text || JSON.stringify(message.body);
      }
    case 2: // RECALL
      return '[消息已撤回]';
    case 3: // IMG
      // body.url, body.width, body.height
      return message.body && message.body.url
        ? { url: message.body.url, width: message.body.width, height: message.body.height }
        : { url: '', width: 0, height: 0 };
    case 4: // FILE
      // 返回结构体
      return message.body && message.body.url
        ? { url: message.body.url, fileName: message.body.name || message.body.fileName, size: message.body.size }
        : null;
    case 5: // SOUND
      // 假设 body.url 为音频地址
      return message.body && message.body.url ? `<audio controls src="${message.body.url}" class="chat-audio-msg"></audio>` : '[语音]';
    case 6: // VIDEO
      // 假设 body.url 为视频地址
      return message.body && message.body.url ? `<video controls src="${message.body.url}" class="chat-video-msg"></video>` : '[视频]';
    case 7: // EMOJI
      // 假设 body.url 为表情图片
      return message.body && message.body.url ? `<img src="${message.body.url}" class="chat-emoji-msg" />` : '[表情]';
    default:
      return '[未知消息类型]';
  }
};

const sendMessage = async () => {
  if (!inputValue.value.trim() && !filePreviewList.value.length) return;
  // 1. 先发送文本消息（如有）
  if (inputValue.value.trim()) {
    const params = {
      roomId: currentGroup.value.roomId,
      msgType: 1, // 文本
      body: { content: inputValue.value }
    };
    try {
      const res = await sendMsg(params);
      if (res.code === 200 && res.data) {
        // 解析返回的消息结构
        const msg = res.data;
        const fromUid = msg.fromUser?.uid;
        const message = msg.message || {};
        // 通过memberMap查找群成员信息
        const member = memberMap.value[fromUid] || {};
        const newMsg = {
          id: message.id,
          roomId: message.roomId,
          time: message.sendTime,
          type: message.type,
          text: getMessageText(message),
          fromUid,
          side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
          avatar: member.avatar || msg.fromUser?.avatar || '',
          username: member.name || msg.fromUser?.username || '群成员',
          role: member.role,
          status: member.status
        };
        messages.value.push(newMsg);
        inputValue.value = '';
        nextTick(scrollToBottom);
      }
    } catch (e) {
      // 错误处理
    }
  }
  // 2. 再上传并发送所有待发送文件
  if (filePreviewList.value.length) {
    await sendFileMessages();
  }
}

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


function handleAvatarClick(event, msg) {
  if (msg.side !== 'left') return;
  // 计算弹窗位置
  const rect = event.target.getBoundingClientRect();
  userDetailPopupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 8
  };
  userDetailLoading.value = true;
  // 搜索好友
  searchFriends({ keyword: msg.username, page: 1, pageSize: 1 })
    .then(res => {
      if (
        res.code === 200 &&
        res.data &&
        Array.isArray(res.data.records) &&
        res.data.records.length > 0
      ) {
        const u = res.data.records[0];
        // 判断是否为好友
        const isFriend = props.friendList.some(f => f.id === u.id);
        userDetail.value = {
          id: u.id,
          name: u.username,
          avatar: u.avatar,
          level: calculateLevel(u.exep),
          createTime: u.createTime,
          status: u.status,
          isFriend
        };
        showUserDetailPopup.value = true;
      } else {
        userDetail.value = { name: msg.username, avatar: msg.avatar, isFriend: false };
        showUserDetailPopup.value = true;
      }
    })
    .catch(() => {
      userDetail.value = { name: msg.username, avatar: msg.avatar, isFriend: false };
      showUserDetailPopup.value = true;
    })
    .finally(() => {
      userDetailLoading.value = false;
    });
}

function handleMemberClick(event, member) {
  // 判断是否为自己
  if (String(member.id) === String(userStore.userInfo.uid)) {
    router.push('/userhub');
    return;
  }
  // 计算弹窗位置（左侧）
  const rect = event.target.getBoundingClientRect();
  userDetailPopupPosition.value = {
    x: rect.left - 220, // 偏移到左侧
    y: rect.top
  };
  userDetailLoading.value = true;
  searchFriends({ keyword: member.name, page: 1, pageSize: 1 })
    .then(res => {
      if (
        res.code === 200 &&
        res.data &&
        Array.isArray(res.data.records) &&
        res.data.records.length > 0
      ) {
        const u = res.data.records[0];
        const isFriend = props.friendList.some(f => f.id === u.id);
        userDetail.value = {
          id: u.id,
          name: u.username,
          avatar: u.avatar,
          level: calculateLevel(u.exep),
          createTime: u.createTime,
          status: u.status,
          isFriend
        };
        showUserDetailPopup.value = true;
      } else {
        userDetail.value = { id: member.id, name: member.name, avatar: member.avatar, isFriend: false };
        showUserDetailPopup.value = true;
      }
    })
    .catch(() => {
      userDetail.value = { id: member.id, name: member.name, avatar: member.avatar, isFriend: false };
      showUserDetailPopup.value = true;
    })
    .finally(() => {
      userDetailLoading.value = false;
    });
}



function handleGroupMessage(data) {
  if (!data || !data.message) return;
  // 只处理当前群聊的消息
  if (String(data.message.roomId) !== String(currentGroup.value.roomId)) return;

  const fromUid = data.fromUser?.uid;
  const message = data.message;
  const member = memberMap.value[fromUid] || {};

  // 检查是否已存在相同id的消息
  if (messages.value.some(m => m.id === message.id)) return;

  const newMsg = {
    id: message.id,
    roomId: message.roomId,
    time: message.sendTime,
    type: message.type,
    text: getMessageText(message),
    fromUid,
    side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
    avatar: member.avatar || data.fromUser?.avatar || '',
    username: member.name || data.fromUser?.username || '群成员',
    role: member.role,
    status: member.status
  };

  messages.value.push(newMsg);
  nextTick(scrollToBottom);
}

const imageInput = ref(null);
const selectedImages = ref([]); // 多图文件数组
const imagePreviewUrls = ref([]); // 多图本地url数组

function triggerImageInput() {
  imageInput.value && imageInput.value.click();
}

function onImageSelected(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    imagePreviewUrls.value.push(URL.createObjectURL(file));
    selectedImages.value.push(file);
  }
  e.target.value = '';
}

// 发送多张图片消息逻辑
async function sendImageMessage() {
  if (!selectedImages.value.length) return;
  for (let i = 0; i < selectedImages.value.length; i++) {
    const file = selectedImages.value[i];
    const url = imagePreviewUrls.value[i];
    // 获取图片宽高
    const img = new window.Image();
    img.src = url;
    await new Promise(resolve => { img.onload = resolve; });
    const width = img.width;
    const height = img.height;
    // 上传
    try {
      const uploadRes = await uploadImageFile(file);
      if (!uploadRes || !uploadRes.url) {
        ElMessage.error('图片上传失败');
        continue;
      }
      // 发送
      const params = {
        roomId: currentGroup.value.roomId,
        msgType: 3,
        body: {
          url: uploadRes.url,
          size: file.size,
          width,
          height
        }
      };
      await sendMsg(params);
    } catch (e) {
      ElMessage.error('图片上传失败');
      continue;
    }
  }
  // 清空
  imagePreviewUrls.value = [];
  selectedImages.value = [];
}

// 处理各种文件消息
const fileInput = ref(null);
const filePreviewList = ref([]); // { file, url, isImage, fileName, fileTypeClass, fileIcon, previewKey }

function triggerFileInput() {
  fileInput.value && fileInput.value.click();
}

function onFileSelected(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase();
    // 只允许非图片/非视频文件
    if (
      [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpg', 'mpeg', '3gp', 'rmvb', 'rm', 'asf', 'ts', 'm4v'
      ].includes(ext)
    ) {
      continue;
    }
    filePreviewList.value.push({
      file,
      url: '',
      isImage: false,
      fileName: file.name,
      fileTypeClass: getFileTypeClass(ext),
      fileIcon: getFileTypeIcon(ext),
      previewKey: file.name + '-' + file.size + '-' + Date.now()
    });
  }
  e.target.value = '';
}

function removePreviewFile(idx) {
  filePreviewList.value.splice(idx, 1);
}
// 预览显示的icon
function getFileTypeClass(ext) {
  if (['pdf'].includes(ext)) return 'file-pdf';
  if (['doc', 'docx'].includes(ext)) return 'file-doc';
  if (['md'].includes(ext)) return 'file-md';
  if (['xls', 'xlsx'].includes(ext)) return 'file-xls';
  if (['ppt', 'pptx'].includes(ext)) return 'file-ppt';
  if (['zip', 'rar', '7z'].includes(ext)) return 'file-zip';
  return 'file-other';
}
function getFileTypeIcon(ext) {
  if (['pdf'].includes(ext)) return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['md'].includes(ext)) return '🗒️';
  if (['xls', 'xlsx'].includes(ext)) return '📊';
  if (['ppt', 'pptx'].includes(ext)) return '📈';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
  return '📁';
}
function formatFileSize(size) {
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
}

async function sendFileMessages() {
  for (const preview of filePreviewList.value) {
    // 1. 上传文件
    const uploadRes = await uploadImageFile(preview.file);
    if (!uploadRes || !uploadRes.url) {
      ElMessage.error('文件上传失败');
      continue;
    }
    // 2. 构造消息体
    const params = {
      roomId: currentGroup.value.roomId,
      msgType: 4, // 文件
      body: {
        url: uploadRes.url,
        size: preview.file.size,
        fileName: preview.file.name
      }
    };
    await sendMsg(params);
  }
  filePreviewList.value = [];
}

</script>

<style scoped src="@/assets/styles/chat.css"></style>
<style scoped>
.file-preview-icon {
  display: flex;
  align-items: center;
  font-size: 22px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f5f5;
  margin-right: 8px;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.file-pdf {
  color: #e53935;
  background: #fff3f3;
}

.file-doc {
  color: #1976d2;
  background: #f3f7ff;
}

.file-md {
  color: #43a047;
  background: #f3fff3;
}

.file-xls {
  color: #388e3c;
  background: #f3fff3;
}

.file-ppt {
  color: #fbc02d;
  background: #fffbe3;
}

.file-zip {
  color: #8d6e63;
  background: #f7f3f0;
}

.file-other {
  color: #616161;
  background: #f5f5f5;
}

.file-preview-name {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  word-break: break-all;
}

.member-drawer-btn-wrapper {
  position: fixed;
  top: 10%;
  right: 0;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;

}

.member-drawer-btn-wrapper .el-button {
  pointer-events: auto;
  width: 80px;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
}

.custom-member-drawer {
  padding-top: 10px;
  position: fixed;
  top: 0%;
  right: 0%;
  width: 180px;
  background: var(--drawer-bg, #90eb9f80);
  /* 半透明 */
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.12);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  color: var(--drawer-text, #222);
  overflow-x: hidden;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
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

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}



.drawer-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.01);
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
  background: rgb(231, 229, 229);
  /* 半透明蓝色 */
  color: red;
  font-weight: 800;
  border: none;
  transition: background 0.2s;
  backdrop-filter: blur(19px);
  /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px);
  /* 让内容更清晰 */
  outline: none;
}

.dark-mode .member-btn-semicircle {
  background: rgb(95, 95, 95);
  /* 半透明蓝色 */

}

.member-btn-semicircle:hover {
  background: rgba(51, 126, 204, 0.35);
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
  background: #54ee36;
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

.msg-left-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.user-avatar {
  flex-shrink: 0;
  margin: 0 4px ;
}

.msg-left-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 1 0%;
  min-width: 0;
}

.msg-username {
  font-size: 15px;
  color: #4f5353;
  margin-bottom: 2px;
  font-weight: 500;
  line-height: 1;
}

.dark-mode .msg-username {
  color: #ece7e7;
}

.owner-name {
  /* 动态金色渐变文字，兼容日夜模式 */
  background: linear-gradient(90deg, #c5870c, #FFB300, #e6df1b, #6e6219, #6d5512, #c49c25);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  animation: gold-gradient-move 2.5s linear infinite;
  font-weight: bold;
  filter: drop-shadow(0 0 2px #fff8dc88);
}

.admin-name {
  /* 渐变色毛玻璃反光效果 */
  background: linear-gradient(90deg, #43e97b 0%, #16bea0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  position: relative;
  font-weight: bold;
  filter: drop-shadow(0 0 4px #b8ffe6aa);

  /* 毛玻璃反光伪元素 */
}

.chat-bubble-left {
  margin-top: 0;
  /* 保证气泡和用户名紧凑 */
}

.chat-bubble,
.chat-bubble-left {
  max-width: min(400px, 38vw);
  word-break: break-all;
  white-space: pre-wrap;
  font-size: 16px;
  border-radius: 18px;
  line-height: 1.5;
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

.image-preview-wrapper {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.image-preview-floating {
  position: absolute;
  left: 3%;
  bottom: 100%;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
}

.image-preview-item {
  display: flex;
  align-items: flex-end;
  margin-right: 8px;
  position: relative;
}

.image-preview-thumb {
  max-width: 160px;
  max-height: 160px;
  border-radius: 6px;
  margin-right: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background: #222;
}

.image-preview-close {
  position: absolute;
  top: -1px;
  right: -1px;
  border: none !important;
  box-shadow: none !important;
  color: #fff !important;
  z-index: 2;

  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  background: rgba(40, 40, 40, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 50%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.img-shadow {
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.18), 0 1.5px 8px 0 rgba(0, 0, 0, 0.10);
  transition: box-shadow 0.2s;
}

.img-shadow:hover {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.28), 0 2px 12px 0 rgba(0, 0, 0, 0.18);
}

/* 添加更宽的滚动条样式 */
:deep(.chat-message-list::-webkit-scrollbar) {
  width: 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.file-preview-floating {
  position: absolute;
  left: 3%;
  bottom: 100%;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
}

.file-preview-item {
  display: flex;
  align-items: flex-end;
  margin-right: 8px;
  position: relative;
}

.file-preview-thumb {
  max-width: 160px;
  max-height: 160px;
  border-radius: 6px;
  margin-right: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background: #222;
}

.file-preview-close {
  position: absolute;
  top: -1px;
  right: -1px;
  border: none !important;
  box-shadow: none !important;
  color: #fff !important;
  z-index: 2;

  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  background: rgba(40, 40, 40, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 50%;
}

.file-preview-icon {
  display: flex;
  align-items: center;
  font-size: 22px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f5f5;
  margin-right: 8px;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}


.file-preview-name {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  word-break: break-all;
}

.file-msg {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  padding: 10px 22px 10px 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.55);
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.10);
  border: 1.5px solid rgba(180,200,255,0.18);
  margin-right: 8px;
  min-width: 140px;
  max-width: 340px;
  transition: box-shadow 0.18s, border 0.18s, background 0.18s;
  position: relative;
  overflow: hidden;
}
.dark-mode .file-msg {
  background: linear-gradient(120deg, rgba(24,36,64,0.72) 60%, rgba(60,80,120,0.38) 100%);
  border: 1.5px solid rgba(80,120,200,0.22);
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.22), 0 1.5px 8px 0 rgba(0,0,0,0.18);
}
.file-msg:hover {
  box-shadow: 0 8px 32px 0 rgba(60,60,120,0.18), 0 2px 12px 0 rgba(0,0,0,0.18);
  border-color: #409eff;
  background: rgba(255,255,255,0.82);
}
.dark-mode .file-msg:hover {
  background: linear-gradient(120deg, rgba(40,60,120,0.92) 60%, rgba(80,120,200,0.38) 100%);
  border-color: #90c4ff;
}
.file-msg a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  width: 100%;
}
.file-msg-icon {
  font-size: 32px;
  margin-right: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}
.file-msg-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a !important;
  margin-right: 10px;
  max-width: 140px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.dark-mode .file-msg-name {
  color: #eaf6ff !important;
}
.file-msg-size {
  font-size: 13px;
  color: #6a7a8c;
  font-weight: 500;
  margin-left: 0;
  flex-shrink: 0;
}

.file-image-preview-bar {
  position: absolute;
  left: 3%;
  bottom: 100%;
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 15px;
  min-height: 100px;
  max-width: 94%;
  overflow-x: auto;
}

.file-preview-bar {
  /* 文件区比图片区再往下偏移一行 */
  margin-bottom: -48px;
}

.preview-card {
  position: relative;
  min-width: 90px;
  max-width: 140px;
  height: 48px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(60, 60, 60, 0.10);
  display: flex;
  align-items: center;
  transition: box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
  padding: 0;
}



.preview-card-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 8px 0 6px;
  position: relative;
}

.preview-card-inner.is-image {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.file-icon-large {
  display: inline-block;
  width: 24px;
  height: 24px;
  font-size: 18px;
  margin-right: 6px;
  background-size: contain;
  background-repeat: no-repeat;
  flex-shrink: 0;
  text-align: center;
  line-height: 24px;
}

.file-info-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  min-width: 0;
  margin-left: 0;
}

.file-name-block {
  font-size: 12px;
  color: #222;
  font-weight: 500;
  line-height: 1.2;
  max-width: 80px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.file-size-block {
  font-size: 10px;
  color: #888;
  margin-top: 1px;
}

.remove-btn-card {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  cursor: pointer;
  line-height: 14px;
  text-align: center;
  z-index: 2;
  opacity: 0.85;
  transition: background 0.18s;
}

.remove-btn-card:hover {
  background: #e74c3c;
  opacity: 1;
}

.file-image-preview-bar.file-image-preview-center {
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
  max-width: 520px;
  /* 固定最大宽度 */
  width: 100%;
  overflow-x: auto;
  justify-content: center;
}
</style>