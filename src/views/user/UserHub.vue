<template>
  <div class="personal-center">
   
    <!-- Header - Apple-inspired clean navigation -->
 

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- 第一部分：个人信息 -->
      <div class="content-box profile-section">
        <div class="content-box-header">
          <h2 class="content-box-title">个人信息</h2>
        </div>
        <div class="content-box-body">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div class="avatar-container">
              <el-avatar :size="120" :src="userInfo.avatar" />
            </div>
            <div class="profile-info flex-1">
              <div class="name-level">
                <h2 class="text-3xl font-bold mb-2">{{userInfo.username}}</h2>
                <el-popover
                  v-model:visible="showPopover"
                  placement="top"
                  :width="300"
                  trigger="manual"
                  popper-class="username-popover"
                >
                  <template #reference>
                    <el-icon class="edit-icon" @click="handleEditUsername"><Edit /></el-icon>
                  </template>
                  <div class="popover-content">
                    <div class="popover-header">
                      <span class="popover-title">修改用户名</span>
                      <el-icon class="close-icon" @click="showPopover = false"><Close /></el-icon>
                    </div>
                    <el-input
                      v-model="editingUsername"
                      placeholder="请输入新用户名"
                      class="popover-input"
                      @keyup.enter="saveUsername"
                    >
                      <template #append>
                        <el-button @click="saveUsername">
                          <el-icon><Check /></el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </el-popover>
                <div class="level-badge" :style="getLevelBadgeStyle(userLevel)">
                  Lv.{{ userLevel }}
                </div>
               
                <DangerButton type="danger" @click="handleLogout" class="logout-btn">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </DangerButton>
              </div>
              <div class="exp-bar">
                <div class="exp-progress" :style="{ width: expPercentage + '%' }"></div>
                <span class="exp-text">{{ currentExp }}/{{ nextLevelExp }} 经验值</span>
              </div>
              <div class="stats-card bg-white rounded-lg p-4 shadow-sm mt-4">
                <div class="stats-content">
                  <div class="stat-item">
                    <div class="stat-value">{{ friendList.length }}</div>
                    <div class="stat-label">好友</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">0</div>
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
        </div>
      </div>

      <!-- 第二部分：好友和群聊 -->
      <div class="content-box social-section">
        <div class="content-box-header">
          <h2 class="content-box-title">社交关系</h2>
        </div>
        <div class="content-box-body">
          <!-- 好友部分 -->
          <div class="social-part">
            <div class="part-header">
              <h3 class="part-title">我的好友</h3>
              <el-space wrap :size="20">
                <DangerButton type="primary" @click="showFriendsDialog = true">
                  <el-icon><Setting /></el-icon>
                  管理好友
                </DangerButton>
                <DangerButton type="primary" @click="handleShowSearchDialog('friend')">
                  <el-icon><Plus /></el-icon>
                  添加好友
                </DangerButton>
              </el-space>
            </div>
            <div class="friends-list" v-if="friends.length > 0">
              <div class="friends-avatars">
                <el-avatar v-for="friend in friends" :key="friend.id" :size="40" :src="friend.avatar" />
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无好友" :image-size="120">
                <template #description>
                  <p class="empty-text">还没有好友，快去添加吧</p>
                </template>
                <DangerButton type="primary" @click="handleShowSearchDialog('friend')">
                  <el-icon><Plus /></el-icon>
                  添加好友
                </DangerButton>
              </el-empty>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="divider"></div>

          <!-- 群聊部分 -->
          <div class="social-part">
            <div class="part-header">
              <h3 class="part-title">我的群聊</h3>
              <DangerButton type="primary" @click="handleShowSearchDialog('group')">
                <el-icon><Plus /></el-icon>
                添加群聊
              </DangerButton>
            </div>
            <div class="groups-grid" v-if="groups.length > 0">
              <div v-for="group in groups" :key="group.id" class="group-card" @click="handleGroupClick(group, $event)">
                <div class="group-avatar">
                  <el-avatar :size="60" :src="group.avatar" />
                </div>
                <div class="group-info">
                  <h4 class="group-name">{{ group.name }}</h4>
                  <p class="group-members">{{ group.memberCount }} 位成员</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无群聊" :image-size="120">
                <template #description>
                  <p class="empty-text">还没有加入任何群聊</p>
                </template>
                <DangerButton type="primary" @click="handleShowSearchDialog('group')">
                  <el-icon><Plus /></el-icon>
                  添加群聊
                </DangerButton>
              </el-empty>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三部分：账号设置 -->
      <div class="content-box settings-section">
        <div class="content-box-header">
          <h2 class="content-box-title">账号设置</h2>
        </div>
        <div class="content-box-body">
          <el-form :model="settingsForm" label-width="100px" @submit.prevent>
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
              <DangerButton type="primary" @click="saveSettings">保存修改</DangerButton>
            </el-form-item>
          </el-form>
        </div>
      </div>

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
            <DangerButton type="primary" @click="handleShowSearchDialog('friend')">
              <el-icon><Plus /></el-icon>
              添加好友
            </DangerButton>
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
                  <span class="friend-status" :style="getStatusStyle(friend.status)">
                    {{ friend.status ? '在线' : '离线' }}
                  </span>
                </div>
              </div>
              <div class="friend-actions">
                <DangerButton type="primary" @click.stop="(e) => handleView(friend, e)">
                  <el-icon><View /></el-icon>
                </DangerButton>
                <DangerButton type="danger" @click="handleDelete(friend)">
                  <el-icon><Delete /></el-icon>
                </DangerButton>
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
        @friend-request-sent="handleFriendRequestSent"
        @start-chat="handleStartChat"
      />

      <!-- 群聊详情弹窗 -->
      <group-detail-popup
        v-model:visible="showGroupDetail"
        :group="selectedGroup"
        :position="groupDetailPosition"
      />

      <!-- 在模板中替换原有的搜索弹窗 -->
      <SearchDialog
        v-model:visible="showSearchDialog"
        :initial-type="searchType"
      />

      <FullScreenDialog
        v-model:visible="showCreateGroupDialog"
        title="创建群聊"
      >
        <div class="create-group-content">
          <el-form :model="groupForm" label-width="80px">
            <el-form-item label="群名称">
              <el-input v-model="groupForm.name" placeholder="请输入群名称" />
            </el-form-item>
            <el-form-item label="群头像">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="groupForm.avatar" :src="groupForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="群公告">
              <el-input
                v-model="groupForm.announcement"
                type="textarea"
                rows="3"
                placeholder="请输入群公告"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCreateGroup">创建群聊</el-button>
            </el-form-item>
          </el-form>
        </div>
      </FullScreenDialog>
    </main>


 
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { View, Setting, Delete, Search, SwitchButton, Plus, Edit, Check, Close } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import GroupDetailPopup from '@/components/GroupDetailPopup.vue';
import DangerButton from '@/components/dangerButton.vue';
import FullScreenDialog from '@/components/FullScreenDialog.vue';
import SearchDialog from '@/components/SearchDialog.vue';
import { calculateLevel, calculateExpProgress, getLevelBadgeStyle as getExpLevelBadgeStyle, getStatusStyle } from '@/utils/exp';
import { logoutService, modifyPwdService, modifyUsernameService } from '@/api/user';
import { deleteFriend } from '@/api/friend';
import { useUserInfoStore } from '@/stores/user';
import emitter from '@/utils/eventBus';

const router = useRouter();
const userInfoStore = useUserInfoStore();
const userInfo = computed(() => userInfoStore.userInfo);

const showFriendsDialog = ref(false);
const friendSearchQuery = ref('');

// 等级相关数据
const userExp = computed(() => userInfo.value.exep);
const userLevel = computed(() => calculateLevel(userExp.value));
const { currentExp, nextLevelExp, percentage: expPercentage } = computed(() => 
  calculateExpProgress(userExp.value, userLevel.value)
).value;

// 获取等级样式
const getLevelBadgeStyle = (level) => {
  return {
    ...getExpLevelBadgeStyle(level),
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  };
};

// 设置表单数据
const settingsForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const editingUsername = ref('');
const showPopover = ref(false);
const handleEditUsername = () => {
  editingUsername.value = userInfo.value.username;
  showPopover.value = true;
};
const saveUsername = async () => {
  if(editingUsername.value === '') {
    ElMessage.warning('用户名不能为空');
    return;
  }
  if(editingUsername.value === userInfo.value.username) {
    ElMessage.warning('用户名不能与原用户名相同');
    return;
  }
  if(editingUsername.value.length < 5 || editingUsername.value.length > 20) {
    ElMessage.warning('用户名长度必须在5-20个字符之间');
    return;
  }
  if(!/^[a-zA-Z0-9]+$/.test(editingUsername.value)) {
    ElMessage.warning('用户名只能包含字母和数字');
    return;
  }

  try {
    const res = await modifyUsernameService({ username: editingUsername.value });
    if (res.code === 200) {
      userInfoStore.setUserInfo({ ...userInfo.value, username: editingUsername.value });
      ElMessage.success('用户名修改成功');
      showPopover.value = false;
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改用户名失败:', error);
    ElMessage.error('修改失败，请稍后重试');
  }
};
// 保存设置（修改密码）
const saveSettings = async () => {
  if (!settingsForm.value.oldPassword || !settingsForm.value.newPassword) {
    ElMessage.warning('请填写完整的密码信息');
    return;
  }

  try {
    const res = await modifyPwdService({
      oldPassword: settingsForm.value.oldPassword,
      newPassword: settingsForm.value.newPassword,
      rePassword: settingsForm.value.confirmPassword
    });
    
    if (res.code === 200) {
      ElMessage.success('密码修改成功');
      settingsForm.value.oldPassword = '';
      settingsForm.value.newPassword = '';
      settingsForm.value.confirmPassword = '';
      userInfoStore.removeUserInfo();
      router.push('/login');
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error('修改失败，请稍后重试');
  }
};

const props = defineProps({
  friendList: {
    type: Array,
    default: () => []
  }
});

// 将 props 中的 friendList 转换为组件内部使用的 friends 数据
const friends = computed(() => props.friendList.map(friend => ({
  id: friend.id,
  name: friend.username,
  avatar: friend.avatar,
  status: friend.status,
  createTime: friend.createTime,
  level: calculateLevel(friend.exep || 0)
})));

// 群聊列表数据
const groups = ref([]);

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
  level: '',
  status: '',
  createTime: '',
});
const userDetailPosition = ref({ x: 0, y: 0 });

// 处理查看好友详情
const handleView = (friend, event) => {
  selectedUser.value = {
    ...friend,
    isFriend: true, // 标记为已经是好友
  };
  
  // 获取窗口尺寸
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 计算弹窗位置，固定在屏幕三分之一处
  userDetailPosition.value = {
    x: windowWidth / 7,  // 屏幕宽度的三分之一
    y: windowHeight / 3  // 屏幕高度的三分之一
  };
  
  showUserDetail.value = true;
};

const handleDelete = (friend) => {
  ElMessageBox.confirm(
    `确定要删除该好友 <span style="color: #409EFF; font-weight: bold;">${friend.name}</span> 吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true  // 允许使用HTML
    }
  )
  .then(async () => {
    const res = await deleteFriend(friend.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      showFriendsDialog.value = false;
    }
  })
  .catch(() => {
    // 取消删除
  });
};

// 群聊相关
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
    x: rect.left - 180,
    y: rect.top - 270
  };
  
  selectedGroup.value = {
    ...group,
    createTime: group.createTime || '',
    owner: group.owner || '',
    announcement: group.announcement || '暂无公告…',
    members: group.members || []
  };
  
  showGroupDetail.value = true;
};

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出系统吗？',
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
          userInfoStore.removeUserInfo(); // 这里会清空token并断开WebSocket
          router.push('/login');
          ElMessage.success('退出成功');
        } else {
          ElMessage.error(res.msg || '退出失败');
        }
      } catch (error) {
      }
    })
    .catch(() => {
      // 取消退出
    });
};
// 添加新的响应式变量
const showAddFriendDialog = ref(false);
const showCreateGroupDialog = ref(false);
const searchResults = ref([]);
const groupForm = ref({
  name: '',
  avatar: '',
  announcement: ''
});

// 删除原有的搜索相关变量
const showSearchDialog = ref(false);
const searchType = ref('friend');

// 处理显示搜索弹窗
const handleShowSearchDialog = (type) => {
  searchType.value = type;
  showSearchDialog.value = true;
};

// 添加新的响应式变量
const activeTab = ref('friends')

// 处理好友请求发送事件
const handleFriendRequestSent = () => {
  // 刷新好友列表
  fetchFriendList();
};

// 处理开始聊天
const handleStartChat = (user) => {
  // 通知 home 组件刷新联系人列表
  emitter.emit('refresh-contact-list');
  // 直接跳转到聊天界面
  router.push(`/chat/${user.id}`);
};
</script>

<style scoped>
@import '/src/assets/styles/level.css';


.personal-center {
  padding: 0 8%;
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
  color: #d43f09;
  transition: all 0.3s ease;
}

.stats-card .stat-label {
  font-size: 0.875rem;
  color: #020100;
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

.settings-form :deep(.el-input__wrapper) {
  border: 1px solid #dcdfe6;
  border-radius: 11px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
}

.settings-form :deep(.el-input__inner) {
  color: #303133;
  font-size: 14px;
}

.settings-form :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
  background-color: #eef1f6;
}

.settings-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.name-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
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
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-section .search-input {
  flex: 1;
  margin: 5px 1px;
}

.search-section .el-button {
  white-space: nowrap;
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

:deep(.el-button) {
  background-color: var(--el-color-primary);
  color: white !important;
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  background-color: var(--el-color-primary-light-3);
  color: white;
}
/*  */
:deep(.el-button:active) {
  background-color: var(--el-color-primary-dark-2);
  color: white;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 0;
}

.empty-state :deep(.el-empty) {
  padding: 0;
}

.empty-state :deep(.el-empty__image) {
  width: 120px;
  height: 120px;
}

.empty-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 8px 0 16px;
}

.empty-state :deep(.el-button) {
  padding: 8px 20px;
  font-size: 14px;
}

.empty-state :deep(.el-button .el-icon) {
  margin-right: 4px;
}

/* 暗色模式适配 */
.dark-mode .empty-text {
  color: var(--el-text-color-secondary);
}

/* 添加新的样式 */
.add-friend-content,
.create-group-content {
  padding: 20px;
}

.search-input {
  margin-bottom: 20px;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.no-results {
  padding: 40px 0;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.avatar-uploader .avatar-uploader-icon:hover {
  border-color: var(--el-color-primary);
}

/* 暗色模式适配 */
.dark-mode .user-item {
  background: rgba(255, 255, 255, 0.1);
}


.dark-mode .avatar-uploader .avatar-uploader-icon {
  border-color: var(--el-border-color-darker);
  color: var(--el-text-color-secondary);
}

/* 修改和添加新的样式 */
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

.search-input {
  margin-bottom: 20px;
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

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #909399; /* 默认颜色为灰色 */
}

.action-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF; /* 悬停时变为蓝色 */
}

.action-btn svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.action-btn:hover svg {
  transform: scale(1.1);
}


/* 添加内嵌 box 样式 */
.content-box {
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
/* 动画要精确匹配 */
.content-box.profile-section {
  background-image: url('/src/assets/image/mount.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  animation: waveMove 10s ease-in-out infinite alternate;
}

.content-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.content-box-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.content-box-body {
  padding: 8px 0;
}

/* 暗色模式适配 */
.dark-mode .content-box {
  background: #2b2d3a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .content-box.profile-section {
  background-image: url('/src/assets/image/wave.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  animation: waveMove 10s ease-in-out infinite alternate;
}

.dark-mode .content-box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.dark-mode .content-box-header {
  border-bottom-color: #363636;
}

.dark-mode .content-box-title {
  color: #e5eaf3;
}


.content-box {
  animation: fadeIn 0.3s ease-out;
}

/* 添加新的样式 */
.social-section {
  margin: 24px 0;
  background-image: url('/src/assets/image/social.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
}

.dark-mode .social-section {
  margin: 24px 0;
  background-image: url('/src/assets/image/socialDark.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
}

.social-tabs {
  padding: 16px 0;
}

.social-tabs :deep(.el-tabs__nav) {
  border-bottom: 1px solid #ebeef5;
}

.social-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
}

.social-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

/* 暗色模式适配 */
.dark-mode .social-tabs :deep(.el-tabs__nav) {
  border-bottom-color: #363636;
}

.dark-mode .social-tabs :deep(.el-tabs__item) {
  color: #909399;
}

.dark-mode .social-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
}

/* 社交关系部分的新样式 */
.social-section {
  margin: 24px 0;
}

.social-part {
  padding: 20px 0;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.part-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.divider {
  height: 1px;
  background: #ebeef5;
  margin: 20px 0;
}

/* 暗色模式适配 */
.dark-mode .part-title {
  color: #e5eaf3;
}

.dark-mode .divider {
  background: #363636;
}

/* 调整空状态样式 */
.empty-state {
  padding: 40px 0;
}

.empty-text {
  color: #909399;
  margin: 8px 0;
}

.dark-mode .empty-text {
  color: #a8abb2;
}

/* 表单样式 */
.settings-section :deep(.el-form-item__label) {
  color: #08325c !important;
  font-weight: 500;
}

.settings-section :deep(.el-input__inner) {
  color: #1298af;
}

.settings-section :deep(.el-input__inner::placeholder) {
  color: #a0cfff;
}

/* 暗色模式适配 */
.dark-mode .settings-section :deep(.el-form-item__label) {
  color: #62b0ffee !important;
}


.dark-mode .settings-section :deep(.el-input__inner::placeholder) {
  color: #d3e4f5;
}

/* 暗色模式适配 */
.dark-mode .stats-card .stat-value {
  color: #59e7d4;
}

.dark-mode .stats-card .stat-label {
  color: #e4e4e4;
}

@keyframes waveMove {
  0% {
    background-position: 0% bottom;
  }
  50% {
    background-position: 100% top;
  }
  100% {
    background-position: 0% center;
  }
}

.edit-icon {
  color: #409EFF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-icon:hover {
  transform: scale(1.1);
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.popover-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.close-icon {
  cursor: pointer;
  padding: 4px;
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
}

.close-icon:hover {
  color: var(--el-color-danger);
  transform: scale(1.1);
}

/* 暗色模式适配 */
:deep(.dark-mode) .popover-title {
  color: var(--el-text-color-primary);
}

:deep(.dark-mode) .close-icon {
  color: var(--el-text-color-secondary);
}

:deep(.dark-mode) .close-icon:hover {
  color: var(--el-color-danger);
}

</style>