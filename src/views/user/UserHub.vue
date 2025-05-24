<template>
  <div class="personal-center">
   
    <!-- Header - Apple-inspired clean navigation -->
 

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Profile Section - Apple-inspired clean design -->
      <section class="profile-section mb-12">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div class="avatar-container">
            <el-avatar :size="120" src="https://placeholder.svg?height=120&width=120" />
          </div>
          <div class="profile-info flex-1">
            <div class="name-level">
              <h2 class="text-3xl font-bold mb-2">John Developer</h2>
              <div class="level-badge" :style="getLevelBadgeStyle(userLevel)">
                Lv.{{ userLevel }}
              </div>
              <el-button type="danger" link @click="handleLogout" class="logout-btn">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </div>
            <div class="exp-bar">
              <div class="exp-progress" :style="{ width: expPercentage + '%' }"></div>
              <span class="exp-text">{{ currentExp }}/{{ nextLevelExp }} 经验值</span>
            </div>
            <div class="stats-card bg-white rounded-lg p-4 shadow-sm mt-4">
              <div class="stats-content">
                <div class="stat-item">
                  <div class="stat-value">128</div>
                  <div class="stat-label">好友</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">12</div>
                  <div class="stat-label">群聊</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{userExp}}</div>
                  <div class="stat-label">积分值</div>
                </div>
              </div>
            </div>
          </div>
        
        </div>
      </section>

      <!-- 好友列表部分 -->
      <section class="friends-section mb-12">
        <div class="section-header">
          <h3 class="text-xl font-semibold mb-4">我的好友</h3>
        
        </div>
        <div class="friends-list">
          <div class="friends-avatars">
            <el-avatar v-for="i in 8" :key="i" :size="40" :src="`https://placeholder.svg?height=40&width=40&text=${i}`" />
            <div class="more-friends">
              <span>+120</span>
            </div>
            
          </div>
          <el-button type="primary" @click="showFriendsDialog = true">
            <el-icon><Setting /></el-icon>
            管理好友关系
          </el-button>
        </div>
      </section>

      <!-- 好友管理弹窗 -->
      <el-dialog
        v-model="showFriendsDialog"
        title="好友管理"
        width="50%"
        :close-on-click-modal="false"
        class="friends-dialog"
      >
        <div class="friends-dialog-content">
          <div class="search-section">
            <el-input
              v-model="friendSearchQuery"
              placeholder="搜索好友"
              class="search-input"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="friends-list-container">
            <div
              v-for="friend in filteredFriends"
              :key="friend.id"
              class="friend-item"
              @dblclick="handleChat(friend)"
            >
              <div class="friend-info">
                <el-avatar :size="40" :src="friend.avatar" />
                <div class="friend-details">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-status">{{ friend.status }}</span>
                </div>
              </div>
              <div class="friend-actions">
                <el-button type="primary" link @click.stop="(e) => handleView(friend, e)">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button type="danger" link @click="handleDelete(friend)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 用户详情弹窗 -->
      <user-detail-popup
        v-model:visible="showUserDetail"
        :user="selectedUser"
        :position="userDetailPosition"
        @add-friend="handleAddFriend"
        @start-chat="handleStartChat"
        class="user-detail-popup-overlay"
      />

      <!-- 群聊部分 -->
      <section class="groups-section mb-12">
        <div class="section-header">
          <h3 class="text-xl font-semibold mb-4">我的群聊</h3>
        </div>
        <div class="groups-grid">
          <div 
            v-for="i in 6" 
            :key="i" 
            class="group-card"
            @click="handleGroupClick({
              id: `G${i}`,
              name: `群聊 ${i}`,
              avatar: `https://placeholder.svg?height=60&width=60&text=G${i}`,
              memberCount: 20 + i
            }, $event)"
          >
            <div class="group-avatar">
              <el-avatar :size="60" :src="`https://placeholder.svg?height=60&width=60&text=G${i}`" />
            </div>
            <div class="group-info">
              <h4 class="group-name">群聊 {{ i }}</h4>
              <p class="group-members">{{ 20 + i }} 位成员</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 群聊详情弹窗 -->
      <group-detail-popup
        v-model:visible="showGroupDetail"
        :group="selectedGroup"
        :position="groupDetailPosition"
        @start-chat="handleStartGroupChat"
        class="group-detail-popup-overlay"
      />

      <!-- 设置表单部分 -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-xl font-semibold mb-4">账号设置</h3>
        </div>
        <div class="settings-form">
          <el-form :model="settingsForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="settingsForm.username" placeholder="请输入新用户名" />
            </el-form-item>
            <el-form-item label="原密码">
              <el-input v-model="settingsForm.oldPassword" type="password" placeholder="请输入原密码" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="settingsForm.newPassword" type="password" placeholder="请输入新密码" />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="settingsForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </main>


 
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { View, Setting, Delete, Search, SwitchButton } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import GroupDetailPopup from '@/components/GroupDetailPopup.vue';
import { getLevelStyle } from '@/utils/level';

const router = useRouter();
const showFriendsDialog = ref(false);
const friendSearchQuery = ref('');

// 等级相关数据
const userExp = ref(3300);
const levelThresholds = [0, 500, 2000, 3000, 5000, 10000];

// 计算用户等级
const userLevel = computed(() => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (userExp.value >= levelThresholds[i]) {
      return i + 1;
    }
  }
  return 1;
});

// 计算当前等级经验值和下一级所需经验值
const currentExp = computed(() => userExp.value);
const nextLevelExp = computed(() => {
  const currentLevel = userLevel.value;
  return currentLevel < 6 ? levelThresholds[currentLevel] : levelThresholds[5];
});

// 计算经验条百分比
const expPercentage = computed(() => {
  const currentLevel = userLevel.value;
  if (currentLevel >= 6) return 100;
  
  const currentLevelExp = levelThresholds[currentLevel - 1];
  const nextLevelExp = levelThresholds[currentLevel];
  const expInCurrentLevel = userExp.value - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  
  return (expInCurrentLevel / expNeededForNextLevel) * 100;
});

// 获取等级样式
const getLevelBadgeStyle = (level) => {
  return {
    ...getLevelStyle(level),
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  };
};

// 设置表单数据
const settingsForm = ref({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 保存设置
const saveSettings = () => {
  console.log('保存设置:', settingsForm.value);
};

// 模拟好友数据
const friends = ref([
  {
    id: 1,
    name: '张三',
    avatar: 'https://placeholder.svg?height=40&width=40&text=1',
    status: '在线'
  },
  {
    id: 2,
    name: '李四',
    avatar: 'https://placeholder.svg?height=40&width=40&text=2',
    status: '离线'
  },
  {
    id: 3,
    name: '王五',
    avatar: 'https://placeholder.svg?height=40&width=40&text=3',
    status: '在线'
  }
]);

// 根据搜索过滤好友列表
const filteredFriends = computed(() => {
  if (!friendSearchQuery.value) return friends.value;
  return friends.value.filter(friend => 
    friend.name.toLowerCase().includes(friendSearchQuery.value.toLowerCase())
  );
});

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

// 查看好友详情
const handleView = (friend, event) => {
  event.stopPropagation();
  const rect = event.target.getBoundingClientRect();
  userDetailPosition.value = {
    x: rect.left - 350,
    y: rect.top -160
  };
  
  selectedUser.value = {
    ...friend,
    level: 3,
    registerTime: friend.registerTime || '2024-01-01',
    signature: friend.signature || '这个人很懒，什么都没写~',
    isFriend: true
  };
  
  showUserDetail.value = true;
};

// 添加好友
const handleAddFriend = async (user) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('好友请求已发送');
    selectedUser.value.isFriend = true;
  } catch (error) {
    ElMessage.error('发送请求失败');
  }
};

// 开始聊天
const handleStartChat = (user) => {
  router.push({
    path: '/chat',
    query: { friendId: user.id },
    replace: true
  });
  showUserDetail.value = false;
  
  window.dispatchEvent(new CustomEvent('update-active-menu', {
    detail: { activeMenu: 'chat' }
  }));
};

// 点击其他地方关闭用户详情
onMounted(() => {
  document.addEventListener('click', (e) => {
    const userDetailPopup = document.querySelector('.user-detail-popup');
    const viewButton = e.target.closest('.el-button');
    
    if (userDetailPopup && !userDetailPopup.contains(e.target) && !viewButton) {
      showUserDetail.value = false;
    }
  });
});

// 删除好友
const handleDelete = (friend) => {
  ElMessageBox.confirm(
    `确定要删除好友 ${friend.name} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    friends.value = friends.value.filter(f => f.id !== friend.id);
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
};

// 双击进入聊天
const handleChat = (friend) => {
  router.push({
    path: '/chat',
    query: { friendId: friend.id },
    replace: true
  });
  
  window.dispatchEvent(new CustomEvent('update-active-menu', {
    detail: { activeMenu: 'chat' }
  }));
};

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加清除用户信息的逻辑
    router.push('/login');
  }).catch(() => {
    // 用户取消退出
  });
};

// 在 script setup 中添加
const showGroupDetail = ref(false);
const selectedGroup = ref({
  id: '',
  name: '',
  avatar: '',
  memberCount: 0,
  createTime: '',
  owner: '',
  announcement: '',
  members: []
});
const groupDetailPosition = ref({ x: 0, y: 0 });

// 处理群聊卡片点击
const handleGroupClick = (group, event) => {
  const rect = event.target.getBoundingClientRect();
  groupDetailPosition.value = {
    x: rect.left - 180, // 弹窗宽度为280px，向左偏移
    y: rect.top - 270 // 向上偏移20px
  };
  
  selectedGroup.value = {
    ...group,
    createTime: '2024-01-01',
    owner: 'John Developer',
    announcement: '欢迎加入我们的群聊！',
    members: [
      { id: 1, name: 'John Developer', avatar: 'https://placeholder.svg?height=32&width=32&text=1', isOwner: true },
      { id: 2, name: '张三', avatar: 'https://placeholder.svg?height=32&width=32&text=2', isAdmin: true },
      { id: 3, name: '李四', avatar: 'https://placeholder.svg?height=32&width=32&text=3' },
      { id: 4, name: '王五', avatar: 'https://placeholder.svg?height=32&width=32&text=4' }
    ]
  };
  
  showGroupDetail.value = true;
};

// 处理开始群聊
const handleStartGroupChat = (group) => {
  router.push({
    path: '/chat',
    query: { groupId: group.id },
    replace: true
  });
  showGroupDetail.value = false;
  
  window.dispatchEvent(new CustomEvent('update-active-menu', {
    detail: { activeMenu: 'chat' }
  }));
};

// 添加点击外部关闭群聊详情弹窗的功能
onMounted(() => {
  document.addEventListener('click', (e) => {
    const groupDetailPopup = document.querySelector('.group-detail-popup-overlay');
    const groupCard = e.target.closest('.group-card');
    
    if (groupDetailPopup && !groupDetailPopup.contains(e.target) && !groupCard) {
      showGroupDetail.value = false;
    }
  });
});
</script>

<style scoped>
.personal-center {
  background-color: #f5f7fa;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.stats-card .stats-content {
  display: flex;
  justify-content: space-between;
}

.stats-card .stat-item {
  text-align: center;
  padding: 0 10px;
}

.stats-card .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
  transition: all 0.3s ease;
}

.stats-card .stat-label {
  font-size: 0.875rem;
  color: #606266;
  transition: all 0.3s ease;
}

.friends-list {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.friends-avatars {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.more-friends {
  width: 40px;
  height: 40px;
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 14px;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.group-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.group-card:hover {
  transform: translateY(-5px);
}

.group-info {
  text-align: center;
}

.group-name {
  font-weight: 600;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.group-members {
  font-size: 14px;
  color: #909399;
  transition: all 0.3s ease;
}

.settings-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.name-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.level-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.exp-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
}

.exp-progress {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.exp-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 12px;
  color: #909399;
  transition: all 0.3s ease;
}

.friends-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
}

.friends-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
  margin-top: 8px;
}

.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--light-bg);
  transition: all 0.3s ease;
  border: 1px solid var(--light-border);
}

.friend-item:hover {
  background-color: var(--light-hover);
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.friend-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.friend-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--light-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.friend-status {
  font-size: 12px;
  color: var(--light-secondary-text);
  transition: all 0.3s ease;
}

.friend-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.search-section {
  padding: 16px;
  background-color: transparent;
  border-bottom: 1px solid var(--light-border);
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--light-sidebar-bg);
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  padding: 8px 16px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
  border: 1px solid var(--light-border);
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: var(--primary-color);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.search-input :deep(.el-input__inner) {
  height: 36px;
  font-size: 14px;
  color: var(--light-text);
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: var(--light-secondary-text);
  transition: all 0.3s ease;
}

.search-icon {
  font-size: 16px;
  color: var(--light-secondary-text);
  transition: all 0.3s ease;
}

.user-detail-popup-overlay {
  position: fixed;
  z-index: 9999 !important;
  background: var(--light-sidebar-bg);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 320px;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  pointer-events: auto;
}

:deep(.user-detail-popup) {
  z-index: 9999 !important;
}

:deep(.user-detail-content) {
  position: relative;
  z-index: 10000 !important;
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

.user-detail-content {
  padding: 20px;
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
}

.user-status {
  margin: 0;
  font-size: 14px;
  color: var(--light-secondary-text);
}

.user-actions {
  margin-bottom: 20px;
}

.user-actions .el-button {
  width: 100%;
  justify-content: center;
  gap: 8px;
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

/* 暗色模式适配 */
.dark-mode .personal-center {
  background-color: #1a1d2d;
}

.dark-mode .friends-list,
.dark-mode .group-card,
.dark-mode .settings-form {
  background: #2b2d3a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .more-friends {
  background: #3a3d4a;
  color: #a3a6ad;
}

.dark-mode .group-members {
  color: #a3a6ad;
}

.dark-mode .exp-bar {
  background-color: #2b2d3a;
}

.dark-mode .exp-text {
  color: #a3a6ad;
}

.dark-mode .friend-item {
  background-color: var(--dark-bg);
  border-color: var(--dark-border);
}

.dark-mode .friend-item:hover {
  background-color: var(--dark-hover);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .friend-name {
  color: var(--dark-text);
}

.dark-mode .friend-status {
  color: var(--dark-secondary-text);
}

.dark-mode .search-section {
  background-color: var(--dark-sidebar-bg);
  border-bottom-color: var(--dark-border);
}

.dark-mode .search-input :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--dark-border);
}

.dark-mode .search-input :deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.08);
}

.dark-mode .search-input :deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .search-input :deep(.el-input__inner) {
  color: var(--dark-text);
}

.dark-mode .search-input :deep(.el-input__inner::placeholder) {
  color: var(--dark-secondary-text);
}

.dark-mode .search-icon {
  color: var(--dark-secondary-text);
}

.dark-mode .user-detail-popup-overlay {
  background: var(--dark-sidebar-bg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.dark-mode .user-name-level h3 {
  color: var(--dark-text);
}

.dark-mode .user-status {
  color: var(--dark-secondary-text);
}

.dark-mode .user-details {
  border-top-color: var(--dark-border);
}

.dark-mode .detail-item .label {
  color: var(--dark-secondary-text);
}

.dark-mode .detail-item .value {
  color: var(--dark-text);
}

.user-hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.user-hub-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--light-text);
  transition: all 0.3s ease;
}

.dark-mode .user-hub-header h2 {
  color: var(--dark-text);
}

.logout-btn {
  margin-left: auto;
  padding: 4px 8px;
  font-size: 14px;
}

.logout-btn .el-icon {
  margin-right: 4px;
}

/* 群聊弹窗样式 */
.group-detail-popup-overlay {
  position: fixed;
  z-index: 9999 !important;
  background: var(--light-sidebar-bg);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 320px;
  overflow: hidden;
  pointer-events: auto;
  transform-origin: bottom center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 暗色模式适配 */
.dark-mode .group-detail-popup-overlay {
  background: var(--dark-sidebar-bg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}
</style>