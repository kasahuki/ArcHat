<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="background-overlay"></div>
    <el-container class="app-layout">
      
      <!-- 第一部分：图标栏 -->
      <el-aside width="64px" class="icon-bar">
        <!-- 折叠/展开按钮 -->
        <div 
          class="sidebar-toggle-btn"
          @click="isSidebarCollapse = !isSidebarCollapse"
          :class="{ 'collapsed': isSidebarCollapse }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
            <path fill="#2E7D32" d="M6 22h4v4H6zm0-8h4v4H6zm0 16h4v4H6zm0 32h4v4H6zm8-16h28v4H14zm0-8h28v4H14zm0 16h28v4H14zm0-24h28v4H14z"/>
          </svg>
        </div>
        
        <!-- 添加用户头像 -->
        <div class="user-avatar-container" @click="handleIconClick('user', '/UserHub')">
          <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        </div>
        
        <div class="sidebar-nav">
          <div 
            v-for="(menu, key) in MENU_CONFIG" 
            :key="key"
            class="nav-item" 
            :class="{ active: activeIcon === menu.icon }"
            @click="handleMenuClick(menu)"
          >
            <el-badge v-if="menu.badge" :value="menu.badge" class="nav-badge">
              <el-icon>
                <component :is="getIconComponent(menu.icon)" />
              </el-icon>
            </el-badge>
            <el-icon v-else>
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
          </div>
        </div>
      </el-aside>
      <!-- 第二部分：会话列表 -->
      <el-aside
        :class="['sidebar', { collapsed: isSidebarCollapse }]"
      >
        <div class="sidebar-header" v-if="!isSidebarCollapse">
          <h2 class="inbox-title"> <a href=""><img src="/src/assets/image/archat.png" alt="" width="50px"></a>ArcHat</h2>
          <el-button type="text" class="collapse-btn" @click="isSidebarCollapse = true">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>
        <div v-if="!isSidebarCollapse" class="search-container">
          <el-input
            placeholder="Find a conversation"
            v-model="searchQuery"
            clearable
            class="custom-search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-icon class="search-send-icon"><Position /></el-icon>
            </template>
          </el-input>
        </div>
        <div v-if="!isSidebarCollapse" class="switch-container">
          <div class="switch-bar">
            <button 
              class="switch-btn" 
              :class="{ active: currentView === 'friends' }"
              @click="currentView = 'friends'"
              data-tooltip="好友列表"
            >
              <el-icon><User /></el-icon>
            </button>
            <button 
              class="switch-btn" 
              :class="{ active: currentView === 'groups' }"
              @click="currentView = 'groups'"
              data-tooltip="群组列表"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="0 0 1200 1200"><!-- Icon from Elusive Icons by Team Redux - https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL --><path fill="currentColor" d="M596.847 188.488c-103.344 0-187.12 97.81-187.12 218.465c0 83.678 40.296 156.352 99.468 193.047l-68.617 31.801l-182.599 84.688c-17.64 8.821-26.444 23.778-26.444 44.947v201.102c1.451 25.143 16.537 48.577 40.996 48.974h649.62c27.924-2.428 42.05-24.92 42.325-48.974V761.436c0-21.169-8.804-36.126-26.443-44.947l-175.988-84.688l-73.138-34.65c56.744-37.521 95.061-108.624 95.061-190.197c-.001-120.656-83.778-218.466-187.121-218.466m-301.824 76.824c-44.473 1.689-79.719 20.933-106.497 51.596c-29.62 36.918-44.06 80.75-44.339 124.354c1.819 64.478 30.669 125.518 82.029 157.446L21.163 693.997C7.05 699.289 0 711.636 0 731.041v161.398c1.102 21.405 12.216 39.395 33.055 39.703h136.284V761.436c2.255-45.639 23.687-82.529 62.196-100.531l136.247-64.817c10.584-6.175 20.731-14.568 30.433-25.152c-56.176-86.676-63.977-190.491-27.773-281.801c-23.547-14.411-50.01-23.672-75.419-23.823m608.586 0c-29.083.609-55.96 11.319-78.039 26.444c35.217 92.137 25.503 196.016-26.482 276.52c11.467 13.23 23.404 23.377 35.753 30.434l130.965 62.195c39.897 21.881 60.47 59.098 60.866 100.532v170.707h140.235c23.063-1.991 32.893-20.387 33.093-39.704V731.042c0-17.641-7.05-29.987-21.163-37.045l-202.431-96.618c52.498-38.708 78.859-96.72 79.369-156.117c-1.396-47.012-15.757-90.664-44.339-124.354c-29.866-32.399-66.91-51.253-107.827-51.596"/></svg>
            </button>
          </div>
        </div>
        <div v-if="!isSidebarCollapse" class="conversation-list">
          <template v-if="currentView === 'friends'">
            <div
              class="scroll-wrapper"
              v-infinite-scroll="loadMore"
              :infinite-scroll-disabled="isLoading || noMoreData"
              :infinite-scroll-distance="20"
              style="height: 100%; overflow-y: auto;"
            >
              <template v-if="filteredContacts.length > 0">
                <div 
                  v-for="contact in filteredContacts" 
                  :key="contact.id" 
                  class="conversation-item"
                  :class="{ 'active': route.params.id === contact.id.toString() }"
                  @click="handleChat(contact)"
                >
                  <div class="conversation-avatar">
                    <el-avatar :size="40" :src="contact.avatar"></el-avatar>
                    <div class="online-status" :class="{ 'online': contact.status }">
                      <span class="status-dot"></span>
                    </div>
                  </div>
                  <div class="conversation-content">
                    <div class="conversation-header">
                      <span class="company-name">{{ contact.username }}</span>
                      <div v-if="contact.readTime && contact.activeTime && new Date(contact.activeTime) > new Date(contact.readTime)" class="message-time">
                        <span>{{ formatMessageTime(contact.activeTime) }}</span>
                      </div>
                    </div>
                    <div class="message-preview">
                      {{ contact.lastMsgId ? (messagePreviews.get(contact.id) || '加载中...') : '暂无消息' }}
                    </div>
                  </div>
                </div>
              </template>
              <div v-else-if="searchQuery" class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon"><Search /></el-icon>
                  <h3>未找到相关联系人</h3>
                  <p>换个关键词试试吧</p>
                </div>
              </div>
              <div v-else class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon"><ChatDotRound /></el-icon>
                  <h3>还没有聊天记录</h3>
                  <p>快去和好友聊天吧</p>
                </div>
              </div>
              <div v-if="isLoading" style="text-align:center;padding:8px;color:#999;">加载中...</div>
              <div v-if="noMoreData && filteredContacts.length > 0" style="text-align:center;padding:8px;color:#999;">没有更多了</div>
            </div>
          </template>
          <template v-else>
            <div
              class="scroll-wrapper"
              v-infinite-scroll="loadMoreGroups"
              :infinite-scroll-disabled="isLoadingGroups || noMoreGroups"
              :infinite-scroll-distance="20"
              style="height: 100%; overflow-y: auto;"
            >
              <template v-if="filteredGroups.length > 0">
                <div 
                  v-for="group in filteredGroups" 
                  :key="group.roomId" 
                  class="conversation-item"
                  :class="{ 'active': route.params.id === group.roomId?.toString() }"
                  @click="handleGroupChat(group)"
                >
                  <div class="conversation-avatar">
                    <el-avatar :size="40" :src="group.avatar"></el-avatar>
                  </div>
                  <div class="conversation-content">
                    <div class="conversation-header">
                      <span class="company-name">{{ group.name }}</span>
                      <span class="timestamp">{{ group.activeTime ? formatMessageTime(group.activeTime) : '' }}</span>
                    </div>
                    <div class="message-preview">{{ group.lastMsgId ? '有新消息' : '暂无消息' }}</div>
                  </div>
                </div>
              </template>
              <div v-else-if="searchQuery" class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon"><Search /></el-icon>
                  <h3>未找到相关群聊</h3>
                  <p>换个关键词试试吧</p>
                </div>
              </div>
              <div v-else class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon"><UserFilled /></el-icon>
                  <h3>还没有群聊</h3>
                  <p>创建或加入一个群聊吧</p>
                </div>
              </div>
              <div v-if="isLoadingGroups" style="text-align:center;padding:8px;color:#999;">加载中...</div>
              <div v-if="noMoreGroups && filteredGroups.length > 0" style="text-align:center;padding:8px;color:#999;">没有更多了</div>
            </div>
          </template>
        </div>
      </el-aside>

      <!-- 第三部分：主内容区（只保留默认内容） -->
      <el-main class="main-content" >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" :friend-list="friendList" :group-list="groupList"  />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
      <!-- 右上角主题切换按钮和添加按钮 -->
      <div class="theme-toggle-top">
    
        <el-dropdown trigger="click">
          <el-button circle class="apple-menu-btn">
            <div class="apple-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleShowSearchDialog('friend')">
                <el-icon><User /></el-icon>
                添加好友
              </el-dropdown-item>
              <el-dropdown-item @click="handleShowSearchDialog('group')">
                <el-icon><UserFilled /></el-icon>
                添加群聊
              </el-dropdown-item>
              <el-dropdown-item @click="handleShowCreateGroupDialog">
                <el-icon><Plus /></el-icon>
                创建群聊
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button circle class="theme-toggle-btn" @click="toggleTheme" data-tooltip="切换主题">
          <el-icon v-if="isDarkMode"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </el-button>

        <div class="mac-window-controls">
          <button class="mac-btn close" @click="handleLogout" data-tooltip="退出登录">
            <el-icon><Close /></el-icon>
          </button>
          <button class="mac-btn minimize" @click="handleMinimize" data-tooltip="切换会话列表">
            <el-icon><Minus /></el-icon>
          </button>
          <button class="mac-btn maximize" @click="handleMaximize" data-tooltip="切换导航选项">
            <el-icon><FullScreen /></el-icon>
          </button>
        </div>

        <!-- 日历签到按钮，放在详情按钮左边，适配日夜模式 -->
        <el-button
          circle
          class="calendar-btn"
          @click="handleShowSignInCalendar"
          data-tooltip="每日签到"
          :style="calendarBtnStyle"
        >
          <el-icon><Calendar style="color: #fff;" /></el-icon>
        </el-button>
      </div>
    </el-container>

    <!-- 添加全屏搜索弹窗 -->
    <SearchDialog
      v-model:visible="showSearchDialog"
      :initial-type="searchType"
    />

    <!-- 添加创建群聊弹窗 -->
    <FullScreenDialog
      v-model:visible="showCreateGroupDialog"
      title="创建群聊"
    >
      <div class="create-group-content">
        <el-form :model="groupForm" label-width="80px" class="create-group-form">
          <el-form-item label="群名称">
            <el-input 
              v-model="groupForm.name" 
              placeholder="请输入群名称" 
              class="custom-input"
              clearable
            >
              <template #suffix>
                <el-icon class="input-clear-icon" @click="groupForm.name = ''"><Close /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="群头像">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
            >
              <div class="avatar-wrapper">
                <img v-if="groupForm.avatar" :src="groupForm.avatar" class="avatar" />
                <div v-else class="avatar-placeholder">
                  <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                  <span class="upload-text">点击上传群头像</span>
                </div>
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="群公告">
            <el-input
              v-model="groupForm.announcement"
              type="textarea"
              rows="3"
              placeholder="请输入群公告"
              class="custom-textarea"
              clearable
            >
              <template #suffix>
                <el-icon class="input-clear-icon" @click="groupForm.announcement = ''"><Close /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="button-group">
            <el-button 
              type="primary" 
              class="create-btn"
              @click="handleCreateGroup"
            >
              <span style="color: white;" >创建</span>
            </el-button>
            <el-button 
              type="danger"
              class="reset-btn"
              @click="handleResetForm"
            >
            <span style="color: white;" >重置</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </FullScreenDialog>

    <!-- 添加消息通知组件 -->
    <message-notification
      ref="messageNotificationRef"
      :message="notificationMessage"
      @click="handleNotificationClick"
    />
    <FullScreenDialog v-model:visible="showSignInCalendar" title="每日签到">
      <div class="signin-calendar-topbar">
       
      </div>
      <div class="sign-calendar-wrapper">
      <SignInCalendar
        v-model="showSignInCalendar"
        :signed-dates="signedDates"
          :is-today-signed-in="isTodaySignedIn"
          :consecutive-days="consecutiveDays"
          :total-days="totalDays"
          @sign="handleSignInClick"
      />
      </div>
      <template #footer>
        <el-button @click="showSignInCalendar = false" class="sign-close-btn">关闭</el-button>
      </template>
    </FullScreenDialog>
    
    <!-- ExpDialog经验值弹窗 -->
    <ExpDialog 
      v-model:visible="showExpDialog" 
      :title="expDialogTitle"
      @close="showExpDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, h, defineComponent } from 'vue';
import { 
  ChatDotRound, Setting, Sunny, Moon, 
  ArrowLeft, Plus, User, UserFilled, Message,
  Close, Minus, FullScreen, Search, Position,
  Calendar, Folder
} from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import FullScreenDialog from '@/components/FullScreenDialog.vue';
import SearchDialog from '@/components/SearchDialog.vue';
import {  getFriendList } from '@/api/friend';
import { getContactList, getGroupList } from '@/api/contact';
import '@/assets/styles/home.css';
import { logoutService } from '@/api/user';
import { useUserInfoStore } from '@/stores/user';
import { formatMessageTime } from '@/utils/time';
import { useContactStore } from '@/stores/contact';
import { getMessageById } from '@/api/chatService';
import emitter from '@/utils/eventBus';
import MessageNotification from '@/components/MessageNotification.vue';
import SignInCalendar from '@/components/SignInCalendar.vue';
import ExpDialog from '@/components/ExpDialog.vue';
import { ElInfiniteScroll } from 'element-plus';
import { addGroupRoom } from '@/api/room';
import { handleSignIn, getSignInDetail, getSignedDates, checkTodaySignIn, getConsecutiveSignInDays, getTotalSignInDays } from '@/utils/signInHandler';

const userInfoStore = useUserInfoStore()
const contactStore = useContactStore();
const userInfo = computed(() => userInfoStore.userInfo);

// 菜单配置
const MENU_CONFIG = {
  chat: {
    icon: 'chat',
    path: '/chat',
    label: '聊天',
  },
  mail: {
    icon: 'mail',
    path: '/mail',
    label: '消息'
  },
  user: {
    icon: 'user',
    path: '/UserHub',
    label: '设置'
  },
  aichat: {
    icon: 'aichat',
    path: '/aichat',
    label: 'AI Chat'
  },
  archives: {
    icon: 'archives',
    path: '/archives',
    label: '档案馆'
  }
};

// 路由路径到菜单图标的映射
const PATH_TO_ICON = Object.entries(MENU_CONFIG).reduce((acc, [key, value]) => {
  acc[value.path] = key;
  return acc;
}, {});

const router = useRouter();
const route = useRoute();
const isDarkMode = ref(true);
const isSidebarCollapse = ref(false);

// 监听侧边栏状态变化
watch(isSidebarCollapse, (newVal) => {
  // 发出侧边栏状态变化事件
  emitter.emit('sidebar-toggle', newVal);
});
const searchQuery = ref('');
const currentView = ref('friends');

const friendList = ref([]);
const groupList = ref([]);
const contactList = ref([]);
const contactQuery = ref({
  page: 1,
  pageSize: 10
});

const activeIcon = ref('chat');

// 根据路由路径设置活动图标
const setActiveIconFromRoute = () => {
  const path = route.path;
  // 查找最长的匹配路径
  const matchedPath = Object.keys(PATH_TO_ICON)
    .filter(p => path.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  
  activeIcon.value = matchedPath ? PATH_TO_ICON[matchedPath] : 'chat';
};

const handleMenuUpdate = (event) => {
  activeIcon.value = event.detail.activeMenu;
};

// 监听路由变化
watch(() => route.path, () => {
  setActiveIconFromRoute();
});

// 添加加载状态
const isLoading = ref(false);
const isFriendListLoaded = ref(false);
const noMoreData = ref(false);

// 获取好友列表
const fetchFriendList = async () => {
  try {
    const res = await getFriendList(userInfo.value.uid);
    if (res.code === 200) {
      const friends = res.data.map(item => ({
        id: item.id,
        username: item.username,
        avatar: item.avatar || '',
        status: item.status,
        createTime: item.createTime,
        exep: item.exep
      }));
      friendList.value = friends;
      isFriendListLoaded.value = true;

    } else {
      ElMessage.error(res.msg || '获取好友列表失败');
    }
  } catch (error) {
    console.error('获取好友列表错误:', error);
    ElMessage.error('获取好友列表失败，请稍后重试');
  }
};

// 无限滚动加载更多
const loadMore = async () => {
  if (isLoading.value || noMoreData.value) return;
  isLoading.value = true;
  contactQuery.value.page++;
  try {
    const res = await getContactList(contactQuery.value);
    if (res.code === 200) {
      const contacts = res.data.records.map(contact => {
        const friendInfo = friendMap.value.get(contact.friendId) || {};
        return {
          id: contact.friendId,     // id 应该是好友的ID
          roomId: contact.roomId,   // roomId 用于聊天室标识
          friendId: contact.friendId,
          activeTime: contact.activeTime,
          lastMsgId: contact.lastMsgId,
          readTime: contact.readTime,
          username: friendInfo.username || '未知用户',
          avatar: friendInfo.avatar || '',
          status: friendInfo.status || false,
          createTime: friendInfo.createTime,
          exep: friendInfo.exep,
        };
      });
      if (contacts.length === 0) {
        noMoreData.value = true;
      } else {
        contactList.value = contactList.value.concat(contacts);
        // 获取每个新联系人的最新消息
        for (const contact of contacts) {
          if (contact.lastMsgId) {
            await getLatestMessage(contact);
          }
        }
        // 如果返回数量小于pageSize，说明没有更多了
        if (contacts.length < contactQuery.value.pageSize) {
          noMoreData.value = true;
        }
      }
    } else {
      ElMessage.error(res.msg || '获取会话列表失败');
      noMoreData.value = true;
    }
  } catch (error) {
    ElMessage.error('获取会话列表失败，请稍后重试');
    noMoreData.value = true;
  } finally {
    isLoading.value = false;
  }
};

// 初始加载第一页
const fetchContactList = async () => {
  contactQuery.value.page = 1;
  noMoreData.value = false;
  isLoading.value = true;
  try {
    if (!isFriendListLoaded.value) {
      await fetchFriendList();
    }
    const res = await getContactList(contactQuery.value);
    if (res.code === 200) {
      const contacts = res.data.records.map(contact => {
        const friendInfo = friendMap.value.get(contact.friendId) || {};
        return {
          id: contact.friendId,
          roomId: contact.roomId,
          friendId: contact.friendId,
          activeTime: contact.activeTime,
          lastMsgId: contact.lastMsgId,
          readTime: contact.readTime,
          username: friendInfo.username || '未知用户',
          avatar: friendInfo.avatar || '',
          status: friendInfo.status || false,
          createTime: friendInfo.createTime,
          exep: friendInfo.exep,
        };
      });
      contactList.value = contacts;
      for (const contact of contacts) {
        if (contact.lastMsgId) {
          await getLatestMessage(contact);
        }
      }
      // 如果第一页数量小于pageSize，说明没有更多
      noMoreData.value = contacts.length < contactQuery.value.pageSize;
      return contacts;
    } else {
      ElMessage.error(res.msg || '获取会话列表失败');
      contactList.value = [];
      noMoreData.value = true;
      return [];
    }
  } catch (error) {
    ElMessage.error('获取会话列表失败，请稍后重试');
    contactList.value = [];
    noMoreData.value = true;
    return [];
  } finally {
    isLoading.value = false;
  }
};

// 创建好友信息映射
const friendMap = computed(() => {
  return new Map(friendList.value.map(friend => [
    friend.id,
    {
      username: friend.username,
      avatar: friend.avatar,
      status: friend.status,
      createTime: friend.createTime,
      exep: friend.exep
    }
  ]));
});

// 在 script setup 中添加
const messagePreviews = ref(new Map());

// 获取最新消息内容
const getLatestMessage = async (contact) => {
  if (!contact.lastMsgId) return;
  
  try {
    const res = await getMessageById(contact.lastMsgId);
    if (res.code === 200) {
      messagePreviews.value.set(contact.id, res.data.content);
    }
  } catch (error) {
    console.error('获取最新消息失败:', error);
  }
};

// 获取群聊会话列表
const fetchGroupListRaw = async () => {
  try {
    const res = await getGroupList(groupQuery.value);
    if (res.code === 200) {
      const groups = res.data.records.map(group => ({
        id: group.roomId,
        roomId: group.roomId,
        name: group.name,
        avatar: group.avatar,
        activeTime: group.activeTime,
        lastMsgId: group.lastMsgId,
      }));
      groupList.value = groups;
      // 不再单独setContact，合并到统一管理
      return groups;
    } else {
      ElMessage.error(res.msg || '获取群聊会话列表失败');
      return [];
    }
  } catch (error) {
    ElMessage.error('获取群聊会话列表失败，请稍后重试');
    return [];
  }
};

// 统一管理所有会话
const fetchAllConversations = async () => {
  const [contacts, groups] = await Promise.all([
    fetchContactList(),
    fetchGroupListRaw()
  ]);
  // 分别存入私聊和群聊
  contactStore.setContacts(contacts);
  contactStore.setGroupChats(groups);
};

onMounted(() => {

  fetchAllConversations();
  if (isDarkMode.value) {
    document.body.classList.add('dark-theme');
  }
  
  // 初始化时设置活动图标
  setActiveIconFromRoute();
  
  window.addEventListener('update-active-menu', handleMenuUpdate);
  // 监听刷新会话列表事件
  emitter.on('refresh-contact-list', () => {
    console.log('收到 refresh-contact-list 事件');
    fetchAllConversations();
  });
  // 监听刷新好友列表事件
  emitter.on('refresh-friend-list', () => {
    console.log('收到 refresh-friend-list 事件');
    fetchFriendList();
  });

  console.log('Home 组件挂载，检查消息通知组件:', messageNotificationRef.value);
  
  // 监听好友申请消息事件
  emitter.on('friend-apply', (data) => {
    console.log('Home 组件收到好友申请消息:', data);
    if (data && data.fromUid) {
      notificationMessage.value = '有人向你发起了好友申请';
      if (messageNotificationRef.value) {
        messageNotificationRef.value.show();
      }
    }
  });
});

onUnmounted(() => {
  console.log('Home 组件卸载，移除事件监听');
  emitter.off('friend-apply');
  emitter.off('refresh-contact-list', fetchAllConversations);
  emitter.off('refresh-friend-list', fetchFriendList);
  window.removeEventListener('update-active-menu', handleMenuUpdate);
});

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
};

const handleMenuClick = (menu) => {
  if (menu.handler) {
    menu.handler();
  } else {
    router.push(menu.path);
  }
};

// 修改isActive函数
const isActive = (path) => {
  if (path === '/chat') {
    return route.path.startsWith('/chat');
  }
  return route.path === path;
};

// 删除原有的搜索相关变量和函数
const showSearchDialog = ref(false);
const searchType = ref('friend');

// 处理显示搜索弹窗
const handleShowSearchDialog = (type) => {
  searchType.value = type;
  showSearchDialog.value = true;
};

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  .then(async () => {
      try {
        const token = userInfo.value.token;
        const res = await logoutService(token);
        
        if (res.code === 200) {
          userInfoStore.removeUserInfo();
         router.push('/login');
          ElMessage.success('退出成功');
        } else {
          ElMessage.error(res.msg || '退出失败');
        }
      } catch (error) {
        console.error('退出错误:', error);
        ElMessage.error('退出失败，请稍后重试');
      }
    })
    .catch(() => {
      // 取消退出
  });
};

const handleMinimize = () => {
  // 切换第二部分（会话列表）的拉伸状态
  isSidebarCollapse.value = !isSidebarCollapse.value;
};

const handleMaximize = () => {
  // 切换第一部分（图标栏）的活动选项
  const currentIndex = Object.keys(MENU_CONFIG).indexOf(activeIcon.value);
  const nextIndex = (currentIndex + 1) % Object.keys(MENU_CONFIG).length;
  const nextIcon = Object.keys(MENU_CONFIG)[nextIndex];
  handleMenuClick(MENU_CONFIG[nextIcon]);
};

// 添加图标组件映射函数
const AnthropicIcon = defineComponent({
  name: 'AnthropicIcon',
  render() {
    return h(
      'svg',
      {
        fill: '#00000',
        fillRule: 'evenodd',
        style: 'flex:none;line-height:1',
        viewBox: '0 0 24 24',
        width: '1em',
        xmlns: 'http://www.w3.org/2000/svg'
      },
      [
        h('title', null, 'Anthropic'),
        h('path', {
          d: 'M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z'
        })
      ]
    );
  }
});

const getIconComponent = (icon) => {
  const iconMap = {
    chat: ChatDotRound,
    mail: Message,
    user: Setting,
    aichat: AnthropicIcon,
    archives: Folder
  };
  return iconMap[icon] || ChatDotRound;
};

// 添加新的响应式变量
const showCreateGroupDialog = ref(false);
const groupForm = ref({
  name: '',
  avatar: '',
  announcement: ''
});

// 处理显示创建群聊弹窗
const handleShowCreateGroupDialog = () => {
  showCreateGroupDialog.value = true;
};

// 处理创建群聊
const handleCreateGroup = async () => {
  try {
    const payload = {
      name: groupForm.value.name,
      avatar: groupForm.value.avatar,
      groupDesc: groupForm.value.announcement
    };
    const res = await addGroupRoom(payload);
    if (res.code === 200) {
      ElMessage.success('群聊创建成功');
      showCreateGroupDialog.value = false;
      handleResetForm();
      // 刷新群聊列表
      groupQuery.value.page = 1;
      noMoreGroups.value = false;
      await fetchGroupListRaw();
    } else {
      ElMessage.error(res.msg || '创建群聊失败');
    }
  } catch (error) {
    ElMessage.error('创建失败，请稍后重试');
  }
};

// 处理头像上传
const beforeAvatarUpload = (file) => {
  // TODO: 实现头像上传逻辑
  return false;
};

// 处理重置表单
const handleResetForm = () => {
  groupForm.value = {
    name: '',
    avatar: '',
    announcement: ''
  };
};

// 修改处理聊天点击事件
const handleChat = (contact) => {
  // 如果当前已经在聊天页面，且用户ID相同，则不进行跳转
  if (route.path === '/chat' && route.params.id === contact.id.toString()) {
    return;
  }
  // 设置当前聊天对象
  contactStore.setCurrentChat(contact.id);
  router.push(`/chat/${contact.id}`);
};

// 添加消息通知相关的响应式变量
const messageNotificationRef = ref(null);
const notificationMessage = ref('');

// 处理通知点击
const handleNotificationClick = () => {
  router.push('/mail');
};

const showSignInCalendar = ref(false);
const signedDates = ref([]);
const isTodaySignedIn = ref(false);
const consecutiveDays = ref(0);
const totalDays = ref(0);

// ExpDialog控制
const showExpDialog = ref(false);
const expDialogTitle = ref('获得100EX !');

const initSignInData = async () => {
  const detail = await getSignInDetail();
  signedDates.value = getSignedDates(detail);
  isTodaySignedIn.value = checkTodaySignIn(detail);
  consecutiveDays.value = getConsecutiveSignInDays(detail);
  totalDays.value = getTotalSignInDays(detail);
};

const handleShowSignInCalendar = async () => {
  await initSignInData();
  showSignInCalendar.value = true;
};

const handleSignInClick = async (date) => {
  const today = new Date();
  if (
    date.getFullYear() !== today.getFullYear() ||
    date.getMonth() !== today.getMonth() ||
    date.getDate() !== today.getDate()
  ) return;
  if (isTodaySignedIn.value) return;
  const success = await handleSignIn();
  if (success) {
    await initSignInData();
    // 显示经验值弹窗
    showExpDialog.value = true;
    setTimeout(() => {
      showExpDialog.value = false;
    }, 2000);
  }
};

const calendarBtnStyle = computed(() => ({
  background: isDarkMode.value ? '#2253a7' : '#409EFF',
  border: 'none',
  boxShadow: isDarkMode.value
    ? '0 2px 8px rgba(34,83,167,0.18)'
    : '0 2px 8px rgba(64, 158, 255, 0.18)',
  transition: 'background 0.3s',
}));


// 添加处理群聊点击事件
const handleGroupChat = (group) => {
  // 如果当前已经在该群聊页面，则不进行跳转
  if (route.path === '/groupchat' && route.params.id === group.roomId?.toString()) {
    return;
  }
  router.push(`/groupchat/${group.roomId}`);
};

const groupQuery = ref({
  page: 1,
  pageSize: 10 
});
const isLoadingGroups = ref(false);
const noMoreGroups = ref(false);

// 无限滚动加载更多群聊
const loadMoreGroups = async () => {
  if (isLoadingGroups.value || noMoreGroups.value) return;
  isLoadingGroups.value = true;
  groupQuery.value.page++;
  try {
    const res = await getGroupList(groupQuery.value);
    if (res.code === 200) {
      const groups = res.data.records.map(group => ({
        id: group.roomId,
        roomId: group.roomId,
        name: group.name,
        avatar: group.avatar,
        activeTime: group.activeTime,
        lastMsgId: group.lastMsgId,
      }));
      if (groups.length === 0) {
        noMoreGroups.value = true;
      } else {
        groupList.value = groupList.value.concat(groups);
        if (groups.length < groupQuery.value.pageSize) {
          noMoreGroups.value = true;
        }
      }
    } else {
      ElMessage.error(res.msg || '获取群聊会话列表失败');
      noMoreGroups.value = true;
    }
  } catch (error) {
    ElMessage.error('获取群聊会话列表失败，请稍后重试');
    noMoreGroups.value = true;
  } finally {
    isLoadingGroups.value = false;
  }
};

// 添加计算属性用于过滤联系人和群组
const filteredContacts = computed(() => {
  if (!searchQuery.value) return contactList.value;
  const query = searchQuery.value.toLowerCase();
  return contactList.value.filter(contact => 
    contact.username.toLowerCase().includes(query) ||
    String(contact.friendId).includes(query)
  );
});

const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupList.value;
  const query = searchQuery.value.toLowerCase();
  return groupList.value.filter(group => 
    group.name.toLowerCase().includes(query) ||
    String(group.roomId).includes(query)
  );
});

</script>


<style scoped>
/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 优化动画性能 */
* {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.member-count {
  font-size: 12px;
  color: var(--el-color-primary);
}

.no-results {
  padding: 40px 0;
}

/* 暗色模式适配 */
.dark-mode .result-item {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode .result-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.create-group-content {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.create-group-form {
  padding: 32px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.create-group-form:hover {
  transform: translateY(-2px);
}

.create-group-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.custom-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 0 20px;
  height: 52px;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-clear-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;
}

.input-clear-icon:hover {
  color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.1);
  transform: scale(1.1);
}

.input-clear-icon:active {
  transform: scale(0.95);
}

.custom-textarea :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  min-height: 120px;
  transition: all 0.3s ease;
}

.custom-textarea :deep(.el-textarea__inner:hover) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
}

.custom-textarea :deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.avatar-uploader {
  text-align: center;
}

.avatar-wrapper {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--el-border-color-light);
  margin: 0 auto;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  border-color: var(--el-color-primary);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
}

.avatar-uploader-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.button-group .el-button {
  width: 100px;
  height: 34px;
  font-size: 16px;
  border-radius: 10px;
  transition: all 0.5s ease;
}

.button-group .el-button--primary {
  background: linear-gradient(45deg, #2196F3, #00BCD4);
  border: none;
}

.button-group .el-button--primary:hover {
  background: linear-gradient(45deg, #1E88E5, #00ACC1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.button-group .el-button--danger {
  background: linear-gradient(45deg, #FF5252, #FF4081);
  border: none;
}

.button-group .el-button--danger:hover {
  background: linear-gradient(45deg, #F44336, #E91E63);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
}

.button-group .el-button:active {
  transform: translateY(0);
}

/* 暗色模式适配 */
.dark-mode .create-group-form {
  background: transparent;
}

.dark-mode .create-group-form:hover {
  transform: translateY(-2px);
}

.dark-mode .reset-btn:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.switch-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #909399; /* 默认颜色为灰色 */
}

.switch-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF; /* 悬停时变为蓝色 */
}

.switch-btn.active {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF; /* 激活状态为蓝色 */
}

.switch-btn svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.switch-btn:hover svg {
  transform: scale(1.1);
}

.conversation-list {
  padding: 12px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

/* 日间模式 */
.conversation-item {
  background: linear-gradient(to bottom, #f5f7fa, #e4e7ed);
  border: 1px solid #dcdfe6;
}

.conversation-item:hover {
  background: linear-gradient(to bottom, #e4e7ed, #dcdfe6);
  transform: translateY(1px);
}

.conversation-item.active {
  background: linear-gradient(45deg, #409EFF, #409EFF);
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.conversation-item.active .company-name,
.conversation-item.active .timestamp,
.conversation-item.active .message-preview {
  color: #ffffff;
}

/* 暗色模式 */
.dark-mode .conversation-item {
  background: linear-gradient(to bottom, #2b2b2b, #1f1f1f);
  border: 1px solid #363636;
}

.dark-mode .conversation-item:hover {
  background: linear-gradient(to bottom, #363636, #2b2b2b);
  transform: translateY(1px);
}

.dark-mode .conversation-item.active {
  background: linear-gradient(45deg, #409EFF, #409EFF);
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.dark-mode .conversation-item.active .company-name,
.dark-mode .conversation-item.active .timestamp,
.dark-mode .conversation-item.active .message-preview {
  color: #ffffff;
}

.dark-mode .company-name {
  color: #ffffff;
  font-weight: 600;
}

.dark-mode .timestamp {
  color: #a0a0a0;
}

.dark-mode .message-preview {
  color: #b0b0b0;
}

.dark-mode .unread-badge {
  background: var(--el-color-primary);
  color: #ffffff;
  font-weight: 600;
}

.conversation-avatar {
  position: relative;
  margin-right: 12px;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  transition: background-color 0.3s ease;
}

.online-status.online .status-dot {
  background-color: #67C23A;
}

.conversation-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.company-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 15px;
}

.timestamp {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.message-preview {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;
  
  margin-left: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}

.dark-mode .message-time {
  color: #a0a0a0;
}

.empty-conversation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 240px;
  padding: 20px;
}

.empty-content {
  text-align: center;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 32px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
  opacity: 0.8;
}

.empty-content h3 {
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--text-color);
}

.empty-content p {
  font-size: 13px;
  color: var(--text-color-secondary);
  opacity: 0.8;
}

/* 暗色模式适配 */
.dark-mode .empty-content {
  color: var(--text-color-secondary);
}

.start-chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.calendar-btn {
  margin-right: 8px;
  transition: background 0.3s;
}
.calendar-btn:hover {
  filter: brightness(1.1);
}
.sign-dialog {
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.sign-dialog .el-dialog__body {
  padding: 0 24px 24px 24px;
}
.sign-calendar-wrapper {
  padding: 12px 0 0 0;
}
.sign-calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}
.sign-calendar-title {
  letter-spacing: 2px;
}
.sign-cell {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  user-select: none;
}
:deep(.el-calendar__header) {
  display: none !important;
}
:deep(.el-calendar-table .signed-cell) {
  background: #67C23A !important;
  color: #fff !important;
}
:deep(.el-calendar-table .unsigned-cell) {
  background: #B71A1A !important;
  color: #fff !important;
}
:deep(.el-calendar-table .today-cell) {
  background: #409EFF !important;
  color: #fff !important;
}
.dark-mode :deep(.el-calendar-table .future-cell) {
  background: #23272e !important;
  color: #555 !important;
}
.sign-close-btn {
  border-radius: 8px;
  min-width: 80px;
  font-size: 15px;
}
.dark-mode .sign-dialog {
  background: #23272e;
  box-shadow: 0 8px 32px rgba(0,0,0,0.38);
}
.dark-mode .sign-calendar-header {
  color: #90caf9;
}


.scroll-wrapper::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.sidebar-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 12px auto;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle-btn:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar-toggle-btn.collapsed {
  background: rgba(46, 125, 50, 0.1);
  border-color: rgba(46, 125, 50, 0.3);
}

.sidebar-toggle-btn.collapsed:hover {
  background: rgba(46, 125, 50, 0.15);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

/* 暗色模式适配 */
.dark-mode .sidebar-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .sidebar-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dark-mode .sidebar-toggle-btn.collapsed {
  background: rgba(46, 125, 50, 0.08);
  border-color: rgba(46, 125, 50, 0.2);
}

.dark-mode .sidebar-toggle-btn.collapsed:hover {
  background: rgba(46, 125, 50, 0.12);
}

:deep(.el-calendar) {
  background: transparent !important;
  border: none !important;
}
:deep(.el-calendar-table) {
  background: transparent !important;
  border: none !important;
}
:deep(.el-calendar-table td) {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  height: 54px !important;
  transition: background 0.2s;
}
:deep(.el-calendar-table .sign-cell-text) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0 auto;
  font-size: 17px;
  font-weight: 700;
  border-radius: 50%;
  box-shadow: none;
  background: none;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s, color 0.2s;
  cursor: pointer;
  user-select: none;
}
:deep(.el-calendar-table .sign-cell-text:hover) {
  box-shadow: 0 4px 16px 0 rgba(64,158,255,0.10);
  transform: translateY(-2px) scale(1.08);
}
:deep(.el-calendar-table .signed-cell.sign-cell-text) {
  background: #1AAD19 !important;
  color: #fff !important;
}
:deep(.el-calendar-table .unsigned-cell.sign-cell-text) {
  background: #B71A1A !important;
  color: #fff !important;
}
:deep(.el-calendar-table .today-cell.sign-cell-text) {
  background: #409EFF !important;
  color: #fff !important;
}
.dark-mode :deep(.el-calendar-table .sign-cell-text) {
  color: #eee;
  background: none;
}
.dark-mode :deep(.el-calendar-table .signed-cell.sign-cell-text) {
  background: #1AAD19 !important;
  color: #fff !important;
}
.dark-mode :deep(.el-calendar-table .unsigned-cell.sign-cell-text) {
  background: #B71A1A !important;
  color: #fff !important;
}
.dark-mode :deep(.el-calendar-table .today-cell.sign-cell-text) {
  background: #409EFF !important;
  color: #fff !important;
}
.dark-mode :deep(.el-calendar-table .sign-cell-text[disabled]),
.dark-mode :deep(.el-calendar-table .sign-cell-text.disabled) {
  background: #23272e !important;
  color: #555 !important;
}
.dark-mode :deep(.el-calendar-table .prev-month .sign-cell-text),
.dark-mode :deep(.el-calendar-table .next-month .sign-cell-text) {
  background: none !important;
  color: #444 !important;
  font-weight: 400;
}

.signin-calendar-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 12px 32px;
  gap: 24px;
}
.calendar-ym {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: #222;
}
.calendar-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}
.stat-item {
  font-size: 0.98rem;
}
.stat-item b {
  font-size: 1.08rem;
}
.dark-mode .calendar-ym {
  color: #fff;
}
.dark-mode .calendar-stats .stat-item {
  color: #aaa;
}

</style>


