<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="background-overlay"></div>
    <el-container class="app-layout">
      
      <!-- 第一部分：图标栏 -->
      <el-aside width="64px" class="icon-bar">
        <!-- 添加用户头像 -->
        <div class="user-avatar-container" @click="handleIconClick('user', '/UserHub')">
          <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
        </div>
        
        <div class="sidebar-nav">
          <div 
            v-for="(menu, key) in MENU_CONFIG" 
            :key="key"
            class="nav-item" 
            :class="{ active: activeIcon === menu.icon }"
            @click="handleIconClick(menu.icon, menu.path)"
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
            prefix-icon="Search"
            v-model="searchQuery"
            clearable
          />
        </div>
        <div v-if="!isSidebarCollapse" class="conversation-list">
          <div 
            v-for="(conversation, index) in conversations" 
            :key="index" 
            class="conversation-item"
            :class="{ 'active': conversation.company === 'Amazon' }"
          >
            <div class="conversation-avatar">
              <el-avatar :size="40" :src="conversation.avatar"></el-avatar>
            </div>
            <div class="conversation-content">
              <div class="conversation-header">
                <span class="company-name">{{ conversation.company }}</span>
                <span class="timestamp">{{ conversation.time }}</span>
              </div>
              <div class="message-preview">{{ conversation.message }}</div>
            </div>
            <div v-if="conversation.unread" class="unread-badge">
              <span>{{ conversation.unread }}</span>
            </div>
          </div>
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
          <transition 
            name="page-transition"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      <!-- 右上角主题切换按钮和添加按钮 -->
      <div class="theme-toggle-top">
        <el-dropdown trigger="click">
          <el-button circle>
            <el-icon><Plus /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleAddFriend">
                <el-icon><User /></el-icon>
                添加好友
              </el-dropdown-item>
              <el-dropdown-item @click="handleAddGroup">
                <el-icon><UserFilled /></el-icon>
                创建群聊
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="toggleTheme" circle>
          <el-icon v-if="isDarkMode"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </el-button>
      </div>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { 
  ChatDotRound, Setting, Sunny, Moon, 
  ArrowLeft, Plus, User, UserFilled, Message 
} from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

// 菜单配置
const MENU_CONFIG = {
  chat: {
    icon: 'chat',
    path: '/chat',
    label: '聊天'
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
const conversations = ref([
  {
    company: 'Amazon',
    avatar: 'https://via.placeholder.com/40?text=A',
    message: 'Ok, let me check this out for a moment, thank you for your patience',
    time: '11:32 AM',
    unread: 0
  }
]);

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

onMounted(() => {
  if (isDarkMode.value) {
    document.body.classList.add('dark-theme');
  }
  
  // 初始化时设置活动图标
  setActiveIconFromRoute();
  
  window.addEventListener('update-active-menu', handleMenuUpdate);
});

onUnmounted(() => {
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

const goTo = (path) => {
  router.push(path);
};

const handleIconClick = (icon, path) => {
  activeIcon.value = icon
  goTo(path)
}

const handleAddFriend = () => {
  ElMessage({
    message: '添加好友功能开发中...',
    type: 'info'
  });
};

const handleAddGroup = () => {
  ElMessage({
    message: '创建群聊功能开发中...',
    type: 'info'
  });
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
</script>

<style>
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  
  --light-bg: #f5f7fa;
  --light-sidebar-bg: #ffffff;
  --light-text: #303133;
  --light-secondary-text: #606266;
  --light-border: #DCDFE6;
  --light-hover: #f5f7fa;
  
  --dark-bg: #1a1d2d;
  --dark-sidebar-bg: #141824;
  --dark-text: #E5EAF3;
  --dark-secondary-text: #A3A6AD;
  --dark-border: #414243;
  --dark-hover: #2b2d3a;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: var(--light-bg);
  color: var(--light-text);
  transition: all 0.3s ease;
}

.app-container.dark-mode {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://source.unsplash.com/1600x900/?map,city');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  z-index: 0;
}

.app-layout {
  display: flex;
  height: 100vh;
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.77, 0, 0.175, 1);
}

.sidebar {
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  height: 100%;
  background-color: var(--light-sidebar-bg);
  border-right: 1px solid var(--light-border);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  max-width: 0;
  border-right: none;
  padding: 0;
}

.dark-mode .sidebar {
  background-color: var(--dark-sidebar-bg);
  border-right-color: var(--dark-border);
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--light-border);
  justify-content: space-between;
  min-height: 56px;
  flex-shrink: 0;
}

.sidebar-header .inbox-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-header .inbox-title img {
  vertical-align: middle;
  width: 50px;
  height: auto;
}

.search-container {
  padding: 12px 16px;
  flex-shrink: 0;
}

.icon-bar {
  background: var(--dark-sidebar-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  z-index: 2;
  overflow: hidden !important;
  position: relative;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  margin-top: 20px;
  margin-bottom: 16px;
}

.nav-item {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--light-secondary-text);
}

.dark-mode .nav-item {
  color: var(--dark-secondary-text);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-badge {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px;
}

.conversation-list::-webkit-scrollbar {
  width: 6px;
}

.conversation-list::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-list::-webkit-scrollbar-thumb {
  background-color: var(--light-border);
  border-radius: 3px;
}

.dark-mode .conversation-list::-webkit-scrollbar-thumb {
  background-color: var(--dark-border);
}

.conversation-item {
  display: flex;
  padding: 12px 8px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.conversation-item:hover {
  background-color: var(--light-hover);
}

.dark-mode .conversation-item:hover {
  background-color: var(--dark-hover);
}

.conversation-item.active {
  background-color: rgba(64, 158, 255, 0.1);
}

.dark-mode .conversation-item.active {
  background-color: rgba(64, 158, 255, 0.2);
}

.conversation-avatar {
  margin-right: 12px;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.company-name {
  font-weight: 600;
  font-size: 14px;
}

.timestamp {
  font-size: 12px;
  color: var(--light-secondary-text);
}

.dark-mode .timestamp {
  color: var(--dark-secondary-text);
}

.message-preview {
  font-size: 13px;
  color: var(--light-secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.dark-mode .message-preview {
  color: var(--dark-secondary-text);
}

.unread-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 10px;
  font-size: 12px;
  padding: 0 6px;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.77, 0, 0.175, 1);
}

.theme-toggle-top {
  position: fixed;
  top: 24px;
  right: 32px;
  z-index: 200;
  background: transparent;
  display: flex;
  gap: 12px;
}

.el-dropdown-menu {
  padding: 8px 0;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
}

.el-dropdown-menu__item .el-icon {
  font-size: 16px;
}

.dark-mode .el-dropdown-menu {
  background-color: var(--dark-sidebar-bg);
  border: 1px solid var(--dark-border);
}

.dark-mode .el-dropdown-menu__item {
  color: var(--dark-text);
}

.dark-mode .el-dropdown-menu__item:hover {
  background-color: var(--dark-hover);
}

.sidebar-expand-btn {
  cursor: pointer;
  position: absolute;
  left: 56px;
  top: 50px;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-expand-btn svg {
  transition: all .3s;
}

.sidebar-expand-btn svg:hover {
  color: rgb(32, 166, 228);
}

.sidebar-expand-btn svg:hover {
  color: rgb(32, 166, 228);
}

.sidebar.collapsed + .sidebar-expand-btn {
  opacity: 1;
  transform: translateX(0);
}

.dark-mode .sidebar-expand-btn {
  background: var(--dark-sidebar-bg);
}

.collapse-btn {
  margin-left: 8px;
  flex-shrink: 0;
}

.user-avatar-container {
  width: 40px;
  height: 40px;
  margin: 20px auto;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.user-avatar-container:hover {
  transform: scale(1.05);
  border-color: var(--primary-color);
}

.dark-mode .user-avatar-container {
  border-color: var(--dark-border);
}

.dark-mode .user-avatar-container:hover {
  border-color: var(--primary-color);
}
</style>

<style scoped>
/* 页面过渡动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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
</style>
