<template>
  <div class="mailbox-container">
    <div class="mailbox-header">
      <h2 style="display: flex; align-items: center; gap: 8px;"><span style="color: wheat;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Gridicons by Automattic - https://github.com/Automattic/gridicons/blob/trunk/LICENSE.md --><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m1 15h-2v-2h2zm0-4h-2l-.5-6h3z"/></svg></span>通知中心</h2>
    </div>
    
    <div class="mailbox-content">
      <!-- 发送的申请 -->
      <div class="mail-section">
        <div class="section-header">
          <div class="section-title">
            <h3>我发送的申请</h3>
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
                        <div class="mail-status" :class="getStatusFromCode(item.status)">
                          {{ getStatusText(getStatusFromCode(item.status)) }}
                        </div>
                        <div class="mail-time">{{ formatDate(item.createTime) }}</div>
                      </div>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无发送的好友申请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="sentFriendCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="sentFriendTotal"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSentFriendSizeChange"
                    @current-change="handleSentFriendCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="群聊申请" name="group">
              <div class="mail-list">
                <template v-if="sentGroupRequests.length > 0">
                  <div v-for="item in sentGroupRequests" :key="item.id" class="mail-item" @click="() => { if(item.status === 0) handleEditGroupMsg(item) }">
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
                        <div class="mail-status" :class="getStatusFromCode(item.status)">
                          {{ getStatusText(getStatusFromCode(item.status)) }}
                        </div>
                        <div class="mail-time">{{ formatDate(item.time) }}</div>
                      </div>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无发送的群聊申请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="sentGroupCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="sentGroupTotal"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSentGroupSizeChange"
                    @current-change="handleSentGroupCurrentChange"
                  />
                </div>
              </div>
              <FullScreenDialog v-model:visible="showEditMsgDialog" title="修改群聊申请留言">
                <div style="padding: 24px;">
                  <div style="margin-bottom: 16px; font-weight: bold;">当前留言：</div>
                  <el-input v-model="editingMsg" type="textarea" :rows="4" placeholder="请输入申请留言..." />
                  <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                    <DangerButton @click="handleCancelEditMsg">取消</DangerButton>
                    <DangerButton type="success" @click="handleSaveGroupMsg">保存并发送</DangerButton>
                  </div>
                </div>
              </FullScreenDialog>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 收到的申请 -->
      <div class="mail-section">
        <div class="section-header">
          <div class="section-title">
            <h3>收到的申请</h3>
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
                        <div class="mail-status" :class="getStatusFromCode(item.status)">
                          {{ getStatusText(getStatusFromCode(item.status)) }}
                        </div>
                        <div class="mail-time">{{ formatDate(item.createTime) }}</div>
                      </div>
                    </div>
                    <div class="mail-actions" v-if="getStatusFromCode(item.status) === 'pending'">
                      <DangerButton type="primary" @click="handleRequest(item, 'accept')">
                        接受
                      </DangerButton>
                      <DangerButton type="danger" @click="handleRequest(item, 'reject')">
                        拒绝
                      </DangerButton>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无收到的好友申请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="receivedFriendCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="receivedFriendTotal"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleReceivedFriendSizeChange"
                    @current-change="handleReceivedFriendCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="群聊邀请" name="group">
              <div class="mail-list">
                <template v-if="receivedGroupRequests.length > 0">
                  <div v-for="item in currentReceivedGroupPage" :key="item.id" class="mail-item">
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
                      <DangerButton type="primary" @click="handleRequest(item, 'accept')">
                        接受
                      </DangerButton>
                      <DangerButton type="danger" @click="handleRequest(item, 'reject')">
                        拒绝
                      </DangerButton>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无收到的群聊邀请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="receivedGroupCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="receivedGroupTotal"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleReceivedGroupSizeChange"
                    @current-change="handleReceivedGroupCurrentChange"
                  />
                </div>
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
      :hide-start-chat="true"
      :hide-add-friend="true"
      @friend-request-sent="handleFriendRequestSent"
    />

    <group-detail-popup
      :visible="showGroupPop"
      :group="currentGroup"
      :position="popupPosition"
      :hide-start-group="true"
      :hide-join-group="true"
    />

    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import UserDetailPopup from '@/components/UserDetailPopup.vue';
import GroupDetailPopup from '@/components/GroupDetailPopup.vue';
import DangerButton from '@/components/dangerButton.vue';
import FullScreenDialog from '@/components/FullScreenDialog.vue';
import { useRouter } from 'vue-router';
import { getMyFriendApplyList, getMyFriendReceiveList, handleFriendApply } from '@/api/friend';
// TODO: 导入群聊相关API
import { getMyGroupApplyList, updateGroupApplyMsg } from '@/api/room';
import { calculateLevel } from '@/utils/exp';
import { useUserInfoStore } from '@/stores/user';
import { formatDate } from '@/utils/time';
import emitter from '@/utils/eventBus';

const router = useRouter();
const sentActiveTab = ref('friend');
const receivedActiveTab = ref('friend');

// 发送的申请数据
const sentFriendRequests = ref([]);
const sentGroupRequests = ref([]);

// 收到的申请数据
const receivedFriendRequests = ref([]);
const receivedGroupRequests = ref([]);

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
// 处理请求申请的数据模型
const applyModel = ref({
  friendId: '',
  status: ''
});

// 处理好友申请
const handleRequest = async (item, action) => {
  try {
    console.log('处理申请的数据:', item);
    if (!item.friendId) {
      ElMessage.error('申请人ID不存在');
      return;
    }
    
    applyModel.value.friendId = item.friendId;
    applyModel.value.status = action === 'accept' ? 1 : 2;

    const res = await handleFriendApply(applyModel.value);
    if (res.code === 200) {
      ElMessage.success(action === 'accept' ? '已接受申请' : '已拒绝申请');
      // 刷新列表
      fetchReceivedFriendRequests();
      // 通知其他组件刷新好友列表
      emitter.emit('refresh-friend-list');
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('处理好友申请失败:', error);
    ElMessage.error('处理好友申请失败');
  }
};

const showUserDetail = (user) => {
  // 构造完整的用户信息
  currentUser.value = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    level: user.level, 
    status: user.userStatus,
    createTime: user.createTime
  };
  
  // 获取鼠标位置
  const event = window.event;
  popupPosition.value = {
    x: event.clientX - 350,
    y: event.clientY - 190
  };
  
  showUserPop.value = true;
};

const hideUserDetail = () => {
  showUserPop.value = false;
  currentUser.value = null;
};

const showGroupDetail = (group) => {
  // 构造完整的群聊信息
  currentGroup.value = {
    name: group.name,
    avatar: group.avatar,
    createTime: group.time
  };
  
  // 获取鼠标位置
  const event = window.event;
  popupPosition.value = {
    x: event.clientX + 10,
    y: event.clientY + 10
  };
  
  showGroupPop.value = true;
};

const hideGroupDetail = () => {
  showGroupPop.value = false;
  currentGroup.value = null;
};

// 分页相关
const pageSize = ref(5);
const sentFriendCurrentPage = ref(1);
const sentGroupCurrentPage = ref(1);
const receivedFriendCurrentPage = ref(1);
const receivedGroupCurrentPage = ref(1);

// 为每个列表维护独立的总数
const sentFriendTotal = ref(0);
const sentGroupTotal = ref(0);
const receivedFriendTotal = ref(0);
const receivedGroupTotal = ref(0);

// 获取我发送的好友申请列表
const fetchSentFriendRequests = async () => {
  try {
    const res = await getMyFriendApplyList({
      uid: useUserInfoStore().userInfo.uid,
      page: sentFriendCurrentPage.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      // 转换数据格式
      sentFriendRequests.value = res.data.records.map(item => ({
        id: item.id,
        name: item.username,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=U',
        createTime: item.createTime,
        status: item.applyStatus,
        userStatus: item.userStatus,
        level: calculateLevel(item.exep || 0)
      }));
      // 更新发送列表的总数
      sentFriendTotal.value = res.data.total;
    }
  } catch (error) {
    console.error('获取好友申请列表失败:', error);
    ElMessage.error('获取好友申请列表失败');
  }
};

// 获取我收到的好友申请列表
const fetchReceivedFriendRequests = async () => {
  try {
    const res = await getMyFriendReceiveList({
      uid: useUserInfoStore().userInfo.uid,
      page: receivedFriendCurrentPage.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      // 转换数据格式
      receivedFriendRequests.value = res.data.records.map(item => ({
        id: item.id,
        name: item.username,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=U',
        friendId: item.friendId,
        createTime: item.createTime,
        status: item.applyStatus,
        userStatus: item.userStatus,
        level: calculateLevel(item.exep || 0)
      }));
      // 更新接收列表的总数
      receivedFriendTotal.value = res.data.total;
    }
  } catch (error) {
    console.error('获取收到的好友申请列表失败:', error);
    ElMessage.error('获取收到的好友申请列表失败');
  }
};

// 获取我发送的群聊申请列表 - TODO: 等待API实现
const fetchSentGroupRequests = async () => {
  try {
    const res = await getMyGroupApplyList({
      page: sentGroupCurrentPage.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      sentGroupRequests.value = res.data.records.map(item => ({
        id: item.id,
        roomId: item.roomId,
        name: item.name,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=G',
        msg: item.msg,
        status: item.status, // 0: pending, 1: accepted, 2: rejected
        time: item.updateTime
      }));
      sentGroupTotal.value = res.data.total;
    }
  } catch (error) {
    console.error('获取群聊申请列表失败:', error);
    ElMessage.error('获取群聊申请列表失败');
  }
};

// 获取我收到的群聊申请列表 - TODO: 等待API实现
const fetchReceivedGroupRequests = async () => {
  // try {
  //   const res = await getMyGroupReceiveList({
  //     uid: useUserInfoStore().userInfo.uid,
  //     page: receivedGroupCurrentPage.value,
  //     pageSize: pageSize.value
  //   });
  //   if (res.code === 200) {
  //     receivedGroupRequests.value = res.data.records;
  //     receivedGroupTotal.value = res.data.total;
  //   }
  // } catch (error) {
  //   console.error('获取收到的群聊申请列表失败:', error);
  //   ElMessage.error('获取收到的群聊申请列表失败');
  // }
};

// 状态码转换为状态文本
const getStatusFromCode = (code) => {
  const statusMap = {
    0: 'pending',
    1: 'accepted',
    2: 'rejected'
  };
  return statusMap[code] || 'pending';
};

// 监听分页变化
watch([sentFriendCurrentPage, pageSize], () => {
  fetchSentFriendRequests();
});

watch([sentGroupCurrentPage, pageSize], () => {
  fetchSentGroupRequests();
});

watch([receivedFriendCurrentPage, pageSize], () => {
  fetchReceivedFriendRequests();
});

// TODO: 等待群聊API实现后启用
// watch([receivedGroupCurrentPage, pageSize], () => {
//   fetchReceivedGroupRequests();
// });

// 处理分页大小变化
const handleSentFriendSizeChange = (val) => {
  pageSize.value = val;
  sentFriendCurrentPage.value = 1;
};

// 处理页码变化
const handleSentFriendCurrentChange = (val) => {
  sentFriendCurrentPage.value = val;
};

emitter.on('refresh-mail-data', () => {
  fetchReceivedFriendRequests();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchSentFriendRequests();
  fetchReceivedFriendRequests();
  fetchSentGroupRequests();
  // TODO: 等待群聊API实现后启用
  // fetchReceivedGroupRequests();
  
  // 监听刷新 mail 数据的事件
  emitter.on('refresh-mail-data', () => {
    console.log('收到刷新 mail 数据的事件');
    fetchSentFriendRequests();
    fetchReceivedFriendRequests();
    // TODO: 等待群聊API实现后启用
    // fetchSentGroupRequests();
    // fetchReceivedGroupRequests();
  });
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  emitter.off('refresh-mail-data');
});

// 处理页码改变
const handleSentGroupCurrentChange = (val) => {
  sentGroupCurrentPage.value = val;
};

const handleReceivedFriendCurrentChange = (val) => {
  receivedFriendCurrentPage.value = val;
};

const handleReceivedGroupCurrentChange = (val) => {
  receivedGroupCurrentPage.value = val;
};

// 处理每页条数改变
const handleSentGroupSizeChange = (val) => {
  pageSize.value = val;
  sentGroupCurrentPage.value = 1;
};

const handleReceivedFriendSizeChange = (val) => {
  pageSize.value = val;
  receivedFriendCurrentPage.value = 1;
};

const handleReceivedGroupSizeChange = (val) => {
  pageSize.value = val;
  receivedGroupCurrentPage.value = 1;
};

// 处理好友请求发送事件
const handleFriendRequestSent = () => {
  // 刷新发送的好友申请列表
  fetchSentFriendRequests();
};

const showEditMsgDialog = ref(false);
const editingGroupItem = ref(null);
const editingMsg = ref('');

const handleEditGroupMsg = (item) => {
  editingGroupItem.value = item;
  editingMsg.value = item.msg || '';
  showEditMsgDialog.value = true;
};

const handleSaveGroupMsg = async () => {
  if (!editingGroupItem.value) return;
  try {
    const res = await updateGroupApplyMsg({ id: editingGroupItem.value.id, msg: editingMsg.value });
    if (res.code === 200) {
      ElMessage.success('修改成功');
      showEditMsgDialog.value = false;
      fetchSentGroupRequests();
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (e) {
    ElMessage.error('修改失败');
  }
};

const handleCancelEditMsg = () => {
  showEditMsgDialog.value = false;
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
  background: var(--bg-color) !important;
  border-radius: 16px;
  padding: 22px 20px;
  margin-bottom: 24px;
  transition: box-shadow 0.3s cubic-bezier(.4,0,.2,1);
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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: all 1.5s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  box-shadow: 
    5px 5px 15px rgba(0, 0, 0, 0.1),
    -5px -5px 15px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(255, 255, 255, 0.8),
    inset -1px -1px 2px rgba(0, 0, 0, 0.05);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.mail-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transform: skewX(-25deg);
  transition: 1.2s ease;
}

.mail-item:hover::before {
  left: 150%;
}

.mail-item:hover {
  transform: translateY(-2px) rotateX(5deg);
  box-shadow: 
    8px 8px 20px rgba(0, 0, 0, 0.15),
    -8px -8px 20px rgba(255, 255, 255, 0.8),
    inset 1px 1px 2px rgba(255, 255, 255, 0.9),
    inset -1px -1px 2px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transition: all 0.5s ease;
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
.dark-mode .mail-section {
  background: var(--dark-sidebar-bg) !important;
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

/* 暗色模式适配 */
.dark-mode .mailbox-header h2 {
  color: var(--dark-text);
}


.dark-mode .section-title h3 {
  color: var(--dark-text);
}

.dark-mode .mail-item {
  background: linear-gradient(145deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.6));
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    5px 5px 15px rgba(0, 0, 0, 0.3),
    -5px -5px 15px rgba(60, 60, 60, 0.3),
    inset 1px 1px 2px rgba(255, 255, 255, 0.1),
    inset -1px -1px 2px rgba(0, 0, 0, 0.2);
}

.dark-mode .mail-item::before {
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
}

.dark-mode .mail-item:hover {
  box-shadow: 
    8px 8px 20px rgba(0, 0, 0, 0.4),
    -8px -8px 20px rgba(60, 60, 60, 0.4),
    inset 1px 1px 2px rgba(255, 255, 255, 0.15),
    inset -1px -1px 2px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
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

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}



/* 夜间模式适配 */



.dark-mode .el-pagination,
.dark-mode .el-pagination * {
  background: transparent !important;
  background-color: transparent !important;
  
}
</style> 