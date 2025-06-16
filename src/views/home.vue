<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="background-overlay"></div>
    <el-container class="app-layout">
      
      <!-- 第一部分：图标栏 -->
      <el-aside width="64px" class="icon-bar">
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
              <el-icon class="search-send-icon" @click="handleSearch"><Position /></el-icon>
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
            <template v-if="contactList.length > 0">
              <div 
                v-for="contact in contactList" 
                :key="contact.id" 
                class="conversation-item"
                :class="{ 'active': route.params.id === contact.friendId.toString() }"
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
                    {{ contact.lastMsgId ? (messagePreviews.get(contact.friendId) || '加载中...') : '暂无消息' }}
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-conversation">
              <div class="empty-content">
                <el-icon class="empty-icon"><ChatDotRound /></el-icon>
                <h3>还没有聊天记录</h3>
                <p>快去和好友聊天吧</p>
              </div>
            </div>
          </template>
          <template v-else>
            <template v-if="groupList.length > 0">
              <div 
                v-for="(group, index) in groupList" 
                :key="index" 
                class="conversation-item"
                :class="{ 'active': group.name === '开发群' }"
              >
                <div class="conversation-avatar">
                  <el-avatar :size="40" :src="group.avatar"></el-avatar>
                </div>
                <div class="conversation-content">
                  <div class="conversation-header">
                    <span class="company-name">{{ group.name }}</span>
                    <span class="timestamp">{{ group.time }}</span>
                  </div>
                  <div class="message-preview">{{ group.message }}</div>
                </div>
                <div v-if="group.unread" class="unread-badge">
                  <span>{{ group.unread }}</span>
                </div>
              </div>
            </template>
            <div v-else class="empty-conversation">
              <div class="empty-content">
                <el-icon class="empty-icon"><UserFilled /></el-icon>
                <h3>还没有群聊</h3>
                <p>创建或加入一个群聊吧</p>
              </div>
            </div>
          </template>
        </div>
      </el-aside>



      <!-- 折叠后显示展开按钮 -->
      <div
        v-if="isSidebarCollapse"
        class="sidebar-expand-btn"
        @click="isSidebarCollapse = false"
      >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 1024 1024"><path fill="currentColor" d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0"/></svg>
 
      </div>
      <!-- 第三部分：主内容区（只保留默认内容） -->
      <el-main class="main-content" >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" :friend-list="friendList" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { 
  ChatDotRound, Setting, Sunny, Moon, 
  ArrowLeft, Plus, User, UserFilled, Message,
  Close, Minus, FullScreen, Search, Position
} from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import FullScreenDialog from '@/components/FullScreenDialog.vue';
import SearchDialog from '@/components/SearchDialog.vue';
import { searchFriends, getFriendList } from '@/api/friend';
import { getContactList } from '@/api/contact';
import '@/assets/styles/home.css';
import { logoutService } from '@/api/user';
import { useUserInfoStore } from '@/stores/user';
import { formatDate, formatMessageTime } from '@/utils/time';
import { useContactStore } from '@/stores/contact';
import { getMessageById } from '@/api/chatService';
import emitter from '@/utils/eventBus';

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

// 获取联系人列表
const fetchContactList = async () => {
  console.log('=== fetchContactList 被调用 ===');
  try {
    // 确保好友列表已加载
    if (!isFriendListLoaded.value) {
      await fetchFriendList();
    }

    const res = await getContactList(contactQuery.value);
    console.log('getContactList 返回结果:', res);
    
    if (res.code === 200) {
      // 使用映射获取好友信息
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
          exep: friendInfo.exep
        };
      });
      
      console.log('更新联系人列表:', contacts);
      contactList.value = contacts;
      // 将联系人信息存储到 contact store
      contactStore.setContacts(contacts);
      
      // 获取每个联系人的最新消息
      for (const contact of contacts) {
        if (contact.lastMsgId) {
          await getLatestMessage(contact);
        }
      }
    } else {
      ElMessage.error(res.msg || '获取会话列表失败');
    }
  } catch (error) {
    console.error('获取会话列表错误:', error);
    ElMessage.error('获取会话列表失败，请稍后重试');
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
      messagePreviews.value.set(contact.friendId, res.data.content);
    }
  } catch (error) {
    console.error('获取最新消息失败:', error);
  }
};

onMounted(() => {
  console.log('Home 组件挂载，注册事件监听器');
  fetchContactList();
  if (isDarkMode.value) {
    document.body.classList.add('dark-theme');
  }
  
  // 初始化时设置活动图标
  setActiveIconFromRoute();
  
  window.addEventListener('update-active-menu', handleMenuUpdate);
  // 监听刷新联系人列表事件
  emitter.on('refresh-contact-list', () => {
    console.log('收到 refresh-contact-list 事件');
    fetchContactList();
  });
  // 监听刷新好友列表事件
  emitter.on('refresh-friend-list', () => {
    console.log('收到 refresh-friend-list 事件');
    fetchFriendList();
  });
});

onUnmounted(() => {
  window.removeEventListener('update-active-menu', handleMenuUpdate);
  emitter.off('refresh-contact-list', fetchContactList);
  emitter.off('refresh-friend-list', fetchFriendList);
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
const getIconComponent = (icon) => {
  const iconMap = {
    chat: ChatDotRound,
    mail: Message,
    user: Setting
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
    // TODO: 调用创建群聊接口
    ElMessage.success('群聊创建成功');
    showCreateGroupDialog.value = false;
  } catch (error) {
    ElMessage.error('创建失败');
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

const beforeEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateX(100%)'
}

const enter = (el, done) => {
  requestAnimationFrame(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
    el.addEventListener('transitionend', done, { once: true })
  })
}

const leave = (el, done) => {
  requestAnimationFrame(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.opacity = '0'
    el.style.transform = 'translateX(-100%)'
    el.addEventListener('transitionend', done, { once: true })
  })
}

// 添加处理聊天点击事件
const handleChat = (contact) => {
  // 如果当前已经在聊天页面，且ID相同，则不进行跳转
  if (route.path === '/chat' && route.params.id === contact.friendId.toString()) {
    return;
  }
  router.push(`/chat/${contact.friendId}`);
};
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

/* 确保过渡期间内容不会闪烁 */
.container {
  position: relative;
  min-height: calc(100vh - 64px);
}

/* 优化动画性能 */
* {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 添加新的样式 */
.search-content {
  padding: 20px;
}

.search-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 12px;
}

.tab-item {
  font-size: 16px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: var(--el-color-primary);
}

.tab-item.active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.search-input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
}

.search-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.search-button:active {
  transform: translateY(0);
}

.search-button .el-icon {
  font-size: 16px;
}

/* 暗色模式适配 */
.dark-mode .search-button {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.dark-mode .search-button:hover {
  background: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
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

.dark-mode .search-tabs {
  border-bottom-color: var(--el-border-color-darker);
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
</style>


