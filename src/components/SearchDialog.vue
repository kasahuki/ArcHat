<template>
  <div>
  <FullScreenDialog
    v-model:visible="dialogVisible"
    :title="getDialogTitle"
  >
    <div class="search-content">
      <div class="search-tabs">
        <div 
          class="tab-item" 
          :class="{ active: searchType === 'friend' }"
          @click="searchType = 'friend'"
        >
          搜索好友
        </div>
        <div 
          class="tab-item" 
          :class="{ active: searchType === 'group' }"
          @click="searchType = 'group'"
        >
          搜索群聊
        </div>
      </div>
      
      <!-- 好友搜索 -->
      <template v-if="searchType === 'friend'">
        <div class="search-input-container">
          <el-input
            v-model="friendSearchQuery"
            placeholder="输入用户名搜索"
            class="search-input"
            @keyup.enter="handleFriendSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <DangerButton type="primary" @click="handleFriendSearch">
            <el-icon><Search /></el-icon>
            搜索
          </DangerButton>
        </div>

        <div class="search-results" v-if="filteredFriendResults.length > 0">
          <div
            v-for="item in filteredFriendResults"
            :key="item.id"
            class="result-item"
          >
            <el-avatar :size="0" :src="item.avatar" />
            <div class="item-info">
              <div class="level-name" >
                <span class="name">{{ item.name }}</span>
                <div class="level-badge" :style="item.levelStyle">
              Lv.{{ item.level }}
            </div>
              </div>
            
              <span class="status" :class="{ 'online': item.status === '在线', 'offline': item.status === '离线' }">
                <el-icon><CircleCheck v-if="item.status === '在线'" /><CircleClose v-else /></el-icon>
                {{ item.status }}
              </span>
              <span class="id">创建时间: {{ formatDate(item.registerTime) }}</span>
            </div>
            <DangerButton 
              type="primary" 
              @click="handleAddItem(item)"
              :disabled="item.name === currentUser?.username"
            >
              添加
            </DangerButton>
          </div>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="friendPagination.current"
              v-model:page-size="friendPagination.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="friendPagination.total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleFriendSizeChange"
              @current-change="handleFriendPageChange"
            />
          </div>
        </div>
        <div v-else-if="friendHasSearched && !friendSearchLoading" class="no-results">
          <el-empty description="未找到相关用户" />
        </div>
      </template>

      <!-- 群聊搜索 -->
      <template v-else>
        <div class="search-input-container">
          <el-input
            v-model="groupSearchQuery"
            placeholder="输入群ID或群名称搜索"
            class="search-input"
            @keyup.enter="handleGroupSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <DangerButton type="primary" @click="handleGroupSearch">
            <el-icon><Search /></el-icon>
            搜索
          </DangerButton>
        </div>

        <div class="search-results" v-if="groupSearchResults.length > 0">
          <div
            v-for="item in groupSearchResults"
            :key="item.id"
            class="result-item"
          >
            <el-avatar :size="40" :src="item.avatar" />
            <div class="item-info">
              <span class="name">{{ item.name }}</span>
              <span class="id">ID: {{ item.id }}</span>
              <span class="member-count">{{ item.memberCount }}位成员</span>
            </div>
            <DangerButton type="primary" @click="handleAddItem(item)">
              加入
            </DangerButton>
          </div>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="groupPagination.current"
              v-model:page-size="groupPagination.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="groupPagination.total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleGroupSizeChange"
              @current-change="handleGroupPageChange"
            />
          </div>
        </div>
        <div v-else-if="groupHasSearched && !groupSearchLoading" class="no-results">
          <el-empty description="未找到相关群聊" />
        </div>
      </template>
    </div>
  </FullScreenDialog>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Search, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import FullScreenDialog from '@/components/FullScreenDialog.vue';
import DangerButton from '@/components/dangerButton.vue';
import { searchFriends } from '@/api/friend';
import { addFriend } from '@/api/friend';
import { useUserInfoStore } from '/src/stores/user';
import { formatDate } from '@/utils/time';
import { getLevelBadgeStyle, calculateLevel } from '@/utils/exp';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialType: {
    type: String,
    default: 'friend',
    validator: (value) => ['friend', 'group'].includes(value)
  }
});

const emit = defineEmits(['update:visible', 'add-item']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const searchType = ref(props.initialType);

// 监听 initialType 的变化
watch(() => props.initialType, (newType) => {
  searchType.value = newType;
}, { immediate: true });

// 监听弹窗显示状态
watch(() => dialogVisible.value, (newValue) => {
  if (newValue) {
    // 当弹窗打开时，重置搜索状态
    if (searchType.value === 'friend') {
      friendSearchQuery.value = '';
      friendSearchResults.value = [];
      friendHasSearched.value = false;
    } else {
      groupSearchQuery.value = '';
      groupSearchResults.value = [];
      groupHasSearched.value = false;
    }
  }
});

// 好友搜索相关数据
const friendSearchQuery = ref('');
const friendSearchResults = ref([]);
const friendSearchLoading = ref(false);
const friendHasSearched = ref(false);
const friendPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});

// 群聊搜索相关数据
const groupSearchQuery = ref('');
const groupSearchResults = ref([]);
const groupSearchLoading = ref(false);
const groupHasSearched = ref(false);
const groupPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});

// 监听好友搜索输入
watch(friendSearchQuery, (newValue) => {
  if (!newValue) {
    friendSearchResults.value = [];
    friendHasSearched.value = false;
  }
});

// 监听群聊搜索输入
watch(groupSearchQuery, (newValue) => {
  if (!newValue) {
    groupSearchResults.value = [];
    groupHasSearched.value = false;
  }
});

const userStore = useUserInfoStore();

// 获取当前用户信息
const currentUser = computed(() => userStore.userInfo);

// 过滤搜索结果
const filteredFriendResults = computed(() => {
  if (!currentUser.value) return friendSearchResults.value;
  return friendSearchResults.value.filter(item => 
    item.name !== currentUser.value.username
  );
});



// 处理好友搜索
const handleFriendSearch = async () => {
  if (!friendSearchQuery.value) {
    friendSearchResults.value = [];
    friendHasSearched.value = false;
    return;
  }
  
  friendSearchLoading.value = true;
  friendHasSearched.value = true;
  
  try {
    const res = await searchFriends({
      keyword: friendSearchQuery.value,
      page: friendPagination.value.current,
      pageSize: friendPagination.value.pageSize
    });
    
    if (res.code === 200) {
      friendSearchResults.value = res.data.records.map(item => ({
        id: item.id,
        name: item.username,
        avatar: item.avatar || '',
        level: calculateLevel(item.exep || 0),
        status: item.status ? '在线' : '离线',
        registerTime: item.createTime,
        levelStyle: getLevelBadgeStyle(item.level)
      }));
      
      friendPagination.value.total = res.data.total;
      friendPagination.value.pages = res.data.pages;
    } else {
      ElMessage.error(res.msg || '搜索失败');
    }
  } catch (error) {
    console.error('搜索错误:', error);
    ElMessage.error('搜索失败，请稍后重试');
  } finally {
    friendSearchLoading.value = false;
  }
};


// 处理群聊搜索
const handleGroupSearch = async () => {
  if (!groupSearchQuery.value) {
    groupSearchResults.value = [];
    groupHasSearched.value = false;
    return;
  }
  
  groupSearchLoading.value = true;
  groupHasSearched.value = true;
  
  try {
    // TODO: 调用群聊搜索接口
    const res = await searchGroups({
      keyword: groupSearchQuery.value,
      page: groupPagination.value.current,
      pageSize: groupPagination.value.pageSize
    });
    
    if (res.code === 200) {
      groupSearchResults.value = res.data.records.map(item => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar || '',
        memberCount: item.memberCount
      }));
      
      groupPagination.value.total = res.data.total;
      groupPagination.value.pages = res.data.pages;
    } else {
      ElMessage.error(res.msg || '搜索失败');
    }
  } catch (error) {
    console.error('搜索错误:', error);
    ElMessage.error('搜索失败，请稍后重试');
  } finally {
    groupSearchLoading.value = false;
  }
};

// 处理分页变化
const handleFriendPageChange = (page) => {
  friendPagination.value.current = page;
  handleFriendSearch();
};

const handleFriendSizeChange = (size) => {
  friendPagination.value.pageSize = size;
  friendPagination.value.current = 1;
  handleFriendSearch();
};

const handleGroupPageChange = (page) => {
  groupPagination.value.current = page;
  handleGroupSearch();
};

const handleGroupSizeChange = (size) => {
  groupPagination.value.pageSize = size;
  groupPagination.value.current = 1;
  handleGroupSearch();
};

// 处理添加好友或加入群聊
const handleAddItem = async (item) => {
  try {
    if (searchType.value === 'friend') {
      // 添加好友
      await handleAddFriend(item);
    } else {
      // 加入群聊
      await handleJoinGroup(item);
    }
  } catch (error) {
    console.error('添加失败:', error);

  }
};

// 处理添加好友
const handleAddFriend = async (friend) => {
  try {
    // TODO: 实现添加好友的逻辑
    await addFriend(friend.id)
    ElMessage.success('好友添加请求已发送');
  } catch (error) {
    console.error('添加好友失败:', error);

  }
};

// 处理加入群聊
const handleJoinGroup = async (group) => {
  try {
    // TODO: 实现加入群聊的逻辑
    ElMessage.success('已发送加入群聊请求');
  } catch (error) {
    console.error('加入群聊失败:', error);

  }
};

// 计算属性：获取弹窗标题
const getDialogTitle = computed(() => {
  return searchType.value === 'friend' ? '添加好友' : '添加群聊';
});
</script>

<style scoped>
@import '/src/assets/styles/level.css';


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

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-bottom: 12px;
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
.level-name {
  display: flex;
  gap: 8px;
}

.id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.member-count {
  font-size: 12px;
  color: var(--el-color-primary);
}

.status {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status .el-icon {
  font-size: 14px;
}

.status.online {
  color: #67C23A;
}

.status.offline {
  color: #F56C6C;
}

.no-results {
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 暗色模式适配 */
:deep(.dark-mode) .result-item {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.dark-mode) .result-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

:deep(.dark-mode) .search-tabs {
  border-bottom-color: var(--el-border-color-darker);
}

.result-item .el-button.is-disabled {
  background: #909399;
  border-color: #909399;
  color: #fff;
  cursor: not-allowed;
}


</style> 