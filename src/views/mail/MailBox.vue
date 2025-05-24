<template>
  <div class="mailbox-container">
    <div class="mailbox-header">
      <h2>通知中心</h2>
      <div class="header-actions">
        <el-button type="danger" link @click="clearAllRecords">
          <el-icon><Delete /></el-icon>
          清空所有
        </el-button>
      </div>
    </div>
    
    <div class="mailbox-content">
      <!-- 发送的申请 -->
      <div class="mail-section">
        <div class="section-header">
          <div class="section-title">
            <h3>我发送的申请</h3>
            <el-button type="danger" link @click="clearSentRecords">
              <el-icon><Delete /></el-icon>
              清空记录
            </el-button>
          </div>
          <el-tabs v-model="sentActiveTab" class="mail-tabs">
            <el-tab-pane label="好友申请" name="friend">
              <div class="mail-list">
                <template v-if="sentFriendRequests.length > 0">
                  <div v-for="item in sentFriendRequests" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showUserDetail(item)"
                        @mouseleave="hideUserDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-status" :class="item.status">
                          {{ getStatusText(item.status) }}
                        </div>
                        <div class="mail-time">{{ item.time }}</div>
                      </div>
                    </div>
                    <div class="mail-actions">
                      <el-button type="danger" link @click="deleteRecord(item, 'sentFriend')">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无发送的好友申请" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="群聊申请" name="group">
              <div class="mail-list">
                <template v-if="sentGroupRequests.length > 0">
                  <div v-for="item in sentGroupRequests" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showGroupDetail(item)"
                        @mouseleave="hideGroupDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-status" :class="item.status">
                          {{ getStatusText(item.status) }}
                        </div>
                        <div class="mail-time">{{ item.time }}</div>
                      </div>
                    </div>
                    <div class="mail-actions">
                      <el-button type="danger" link @click="deleteRecord(item, 'sentGroup')">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无发送的群聊申请" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 收到的申请 -->
      <div class="mail-section">
        <div class="section-header">
          <div class="section-title">
            <h3>收到的申请</h3>
            <el-button type="danger" link @click="clearReceivedRecords">
              <el-icon><Delete /></el-icon>
              清空记录
            </el-button>
          </div>
          <el-tabs v-model="receivedActiveTab" class="mail-tabs">
            <el-tab-pane label="好友申请" name="friend">
              <div class="mail-list">
                <template v-if="receivedFriendRequests.length > 0">
                  <div v-for="item in receivedFriendRequests" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showUserDetail(item)"
                        @mouseleave="hideUserDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-message">{{ item.message }}</div>
                        <div class="mail-time">{{ item.time }}</div>
                      </div>
                    </div>
                    <div class="mail-actions">
                      <el-button type="success" link @click="handleRequest(item, 'accept')">
                        接受
                      </el-button>
                      <el-button type="danger" link @click="handleRequest(item, 'reject')">
                        拒绝
                      </el-button>
                      <el-button type="danger" link @click="deleteRecord(item, 'receivedFriend')">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无收到的好友申请" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="群聊邀请" name="group">
              <div class="mail-list">
                <template v-if="receivedGroupRequests.length > 0">
                  <div v-for="item in receivedGroupRequests" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showGroupDetail(item)"
                        @mouseleave="hideGroupDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-message">{{ item.message }}</div>
                        <div class="mail-time">{{ item.time }}</div>
                      </div>
                    </div>
                    <div class="mail-actions">
                      <el-button type="success" link @click="handleRequest(item, 'accept')">
                        接受
                      </el-button>
                      <el-button type="danger" link @click="handleRequest(item, 'reject')">
                        拒绝
                      </el-button>
                      <el-button type="danger" link @click="deleteRecord(item, 'receivedGroup')">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无收到的群聊邀请" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <user-detail-popup
      v-model:visible="showUserPop"
      :user="currentUser"
      :position="popupPosition"
      @add-friend="handleAddFriend"
      @start-chat="handleStartChat"
    />

    <group-detail-popup
      :visible="showGroupPop"
      :group="currentGroup"
      :position="popupPosition"
      :hide-start-group="true"
      @start-chat="handleStartGroupChat"
      @join-group="handleJoinGroup"
    />

    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import GroupDetailPopup from '@/components/GroupDetailPopup.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sentActiveTab = ref('friend');
const receivedActiveTab = ref('friend');

// 模拟数据
const sentFriendRequests = ref([
  {
    id: 1,
    name: '张三',
    avatar: 'https://placeholder.svg?height=40&width=40&text=1',
    time: '2024-03-20 14:30',
    status: 'pending'
  },
  {
    id: 2,
    name: '李四',
    avatar: 'https://placeholder.svg?height=40&width=40&text=2',
    time: '2024-03-19 10:15',
    status: 'accepted'
  },
  {
    id: 3,
    name: '王小明',
    avatar: 'https://placeholder.svg?height=40&width=40&text=3',
    time: '2024-03-18 16:45',
    status: 'rejected'
  },
  {
    id: 4,
    name: '赵小红',
    avatar: 'https://placeholder.svg?height=40&width=40&text=4',
    time: '2024-03-17 09:20',
    status: 'pending'
  },
  {
    id: 5,
    name: '陈大力',
    avatar: 'https://placeholder.svg?height=40&width=40&text=5',
    time: '2024-03-16 11:30',
    status: 'accepted'
  }
]);

const sentGroupRequests = ref([
  {
    id: 1,
    name: '技术交流群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G1',
    time: '2024-03-20 15:45',
    status: 'pending'
  },
  {
    id: 2,
    name: '产品设计群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G2',
    time: '2024-03-19 13:20',
    status: 'accepted'
  },
  {
    id: 3,
    name: '前端开发群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G3',
    time: '2024-03-18 10:15',
    status: 'rejected'
  },
  {
    id: 4,
    name: '后端开发群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G4',
    time: '2024-03-17 16:30',
    status: 'pending'
  }
]);

const receivedFriendRequests = ref([
  {
    id: 1,
    name: '王五',
    avatar: 'https://placeholder.svg?height=40&width=40&text=3',
    time: '2024-03-20 16:20',
    message: '你好，我是王五，想加你为好友'
  },
  {
    id: 2,
    name: '刘小华',
    avatar: 'https://placeholder.svg?height=40&width=40&text=6',
    time: '2024-03-20 15:30',
    message: '你好，我是刘小华，想和你交个朋友'
  },
  {
    id: 3,
    name: '张明',
    avatar: 'https://placeholder.svg?height=40&width=40&text=7',
    time: '2024-03-20 14:45',
    message: '你好，我是张明，想认识一下'
  },
  {
    id: 4,
    name: '李华',
    avatar: 'https://placeholder.svg?height=40&width=40&text=8',
    time: '2024-03-20 13:20',
    message: '你好，我是李华，想加你为好友'
  },
  {
    id: 5,
    name: '陈静',
    avatar: 'https://placeholder.svg?height=40&width=40&text=9',
    time: '2024-03-20 11:15',
    message: '你好，我是陈静，想和你交个朋友'
  }
]);

const receivedGroupRequests = ref([
  {
    id: 1,
    name: '产品交流群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G2',
    time: '2024-03-20 17:00',
    message: '邀请你加入产品交流群'
  },
  {
    id: 2,
    name: 'UI设计群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G5',
    time: '2024-03-20 16:45',
    message: '邀请你加入UI设计交流群'
  },
  {
    id: 3,
    name: '算法交流群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G6',
    time: '2024-03-20 15:30',
    message: '邀请你加入算法交流群'
  },
  {
    id: 4,
    name: '游戏开发群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G7',
    time: '2024-03-20 14:20',
    message: '邀请你加入游戏开发交流群'
  },
  {
    id: 5,
    name: '人工智能群',
    avatar: 'https://placeholder.svg?height=40&width=40&text=G8',
    time: '2024-03-20 13:15',
    message: '邀请你加入人工智能交流群'
  }
]);

const showUserPop = ref(false);
const showGroupPop = ref(false);
const currentUser = ref(null);
const currentGroup = ref(null);
const popupPosition = ref({ x: 0, y: 0 });

const popupStyle = computed(() => ({
  position: 'fixed',
  left: `${popupPosition.value.x}px`,
  top: `${popupPosition.value.y}px`,
  zIndex: 1000
}));

const getStatusText = (status) => {
  const statusMap = {
    pending: '等待处理',
    accepted: '已接受',
    rejected: '已拒绝'
  };
  return statusMap[status] || status;
};

const handleRequest = (item, action) => {
  if (action === 'accept') {
    ElMessage.success('已接受申请');
  } else {
    ElMessage.info('已拒绝申请');
  }
  // 从列表中移除
  if (receivedActiveTab.value === 'friend') {
    receivedFriendRequests.value = receivedFriendRequests.value.filter(req => req.id !== item.id);
  } else {
    receivedGroupRequests.value = receivedGroupRequests.value.filter(req => req.id !== item.id);
  }
};

// 删除单条记录
const deleteRecord = (item, type) => {
  ElMessageBox.confirm(
    '确定要删除这条记录吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    switch (type) {
      case 'sentFriend':
        sentFriendRequests.value = sentFriendRequests.value.filter(req => req.id !== item.id);
        break;
      case 'sentGroup':
        sentGroupRequests.value = sentGroupRequests.value.filter(req => req.id !== item.id);
        break;
      case 'receivedFriend':
        receivedFriendRequests.value = receivedFriendRequests.value.filter(req => req.id !== item.id);
        break;
      case 'receivedGroup':
        receivedGroupRequests.value = receivedGroupRequests.value.filter(req => req.id !== item.id);
        break;
    }
    ElMessage.success('删除成功');
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 清空发送的记录
const clearSentRecords = () => {
  ElMessageBox.confirm(
    '确定要清空所有发送的申请记录吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    sentFriendRequests.value = [];
    sentGroupRequests.value = [];
    ElMessage.success('清空成功');
  }).catch(() => {
    ElMessage.info('已取消清空');
  });
};

// 清空收到的记录
const clearReceivedRecords = () => {
  ElMessageBox.confirm(
    '确定要清空所有收到的申请记录吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    receivedFriendRequests.value = [];
    receivedGroupRequests.value = [];
    ElMessage.success('清空成功');
  }).catch(() => {
    ElMessage.info('已取消清空');
  });
};

// 清空所有记录
const clearAllRecords = () => {
  ElMessageBox.confirm(
    '确定要清空所有记录吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    sentFriendRequests.value = [];
    sentGroupRequests.value = [];
    receivedFriendRequests.value = [];
    receivedGroupRequests.value = [];
    ElMessage.success('清空成功');
  }).catch(() => {
    ElMessage.info('已取消清空');
  });
};

const showUserDetail = (user) => {
  // 构造完整的用户信息
  currentUser.value = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    level: 1, // 默认等级
    status: '在线', // 默认状态
    registerTime: '2024-01-01', // 默认注册时间
    isFriend: false, // 默认非好友
    hideAddFriend: true // 隐藏添加好友按钮
  };
  
  // 获取鼠标位置
  const event = window.event;
  popupPosition.value = {
    x: event.clientX - 150,
    y: event.clientY - 190
  };
  
  showUserPop.value = true;
};

const hideUserDetail = () => {
  showUserPop.value = false;
};

const handleAddFriend = (user) => {
  ElMessage.success(`已发送好友申请给 ${user.name}`);
  showUserPop.value = false;
};

const handleStartChat = (user) => {
  router.push(`/chat/${user.id}`);
  showUserPop.value = false;
};


const showGroupDetail = (group) => {
  // 构造完整的群聊信息
  currentGroup.value = {
    name: group.name,
    avatar: group.avatar,
    createTime: group.time,

  };

  
  // 获取鼠标位置
  const event = window.event;
  popupPosition.value = {
    x: event.clientX +10,
    y: event.clientY + 10
  };
  
  showGroupPop.value = true;
};

const hideGroupDetail = () => {
  showGroupPop.value = false;
};
const handleStartGroupChat = () => {
  console.log('开始聊天');
};
</script>

<style scoped>
.mailbox-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px;
}

.mailbox-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mailbox-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--light-text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.mail-section {
  background: var(--light-sidebar-bg);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--light-text);
  margin: 0;
}

.mail-tabs {
  margin-top: 12px;
}

.mail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.mail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--light-bg);
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid var(--light-border);
}

.mail-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.mail-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mail-info {
  flex: 1;
  min-width: 0;
  position: relative;
  padding-right: 8px;
}

.mail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.mail-name {
  font-weight: 600;
  color: var(--light-text);
  font-size: 14px;
}

.mail-time {
  font-size: 12px;
  color: var(--light-secondary-text);
  position: absolute;
  bottom: 0;
  right: 0;
}

.mail-message {
  font-size: 13px;
  color: var(--light-secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 4px 0 20px 0;
}

.mail-status {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 10px;
  display: inline-block;
  margin: 4px 0 20px 0;
}

.mail-status.pending {
  background: #e6f7ff;
  color: #1890ff;
}

.mail-status.accepted {
  background: #f6ffed;
  color: #52c41a;
}

.mail-status.rejected {
  background: #fff1f0;
  color: #f5222d;
}

.mail-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

:deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-empty__description) {
  margin-top: 8px;
  color: var(--light-secondary-text);
  font-size: 13px;
}

:deep(.el-button--text) {
  padding: 4px 8px;
  font-size: 13px;
}

:deep(.el-button--text .el-icon) {
  margin-right: 2px;
}

/* 暗色模式适配 */
.dark-mode .mailbox-header h2 {
  color: var(--dark-text);
}

.dark-mode .mail-section {
  background: var(--dark-sidebar-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dark-mode .section-title h3 {
  color: var(--dark-text);
}

.dark-mode .mail-item {
  background: var(--dark-bg);
  border-color: var(--dark-border);
}

.dark-mode .mail-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-color: var(--primary-color);
}

.dark-mode .mail-name {
  color: var(--dark-text);
}

.dark-mode .mail-time,
.dark-mode .mail-message {
  color: var(--dark-secondary-text);
}

.dark-mode .mail-status.pending {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.dark-mode .mail-status.accepted {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.dark-mode .mail-status.rejected {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.dark-mode :deep(.el-empty__description) {
  color: var(--dark-secondary-text);
}

.el-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.el-avatar:hover {
  transform: scale(1.05);
}
</style> 