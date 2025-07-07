<template>
  <!-- 抽屉模式 -->
  <div v-if="visible" class="group-detail-drawer-overlay" @click="handleOverlayClick">
    <div class="group-detail-drawer" @click.stop>
      <!-- 抽屉头部 -->
      <div class="drawer-header">
        <div class="drawer-handle"></div>
        <div class="drawer-title">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <h1 class="page-title">群聊信息</h1>
        </div>
      </div>

      <!-- 抽屉内容 -->
      <div class="drawer-content">
        <!-- 群基本信息 -->
        <div class="group-info-section">
          <div class="group-avatar-container">
            <el-avatar :size="80" :src="groupInfo.avatar" class="group-avatar">
              <el-icon size="32"><UserFilled /></el-icon>
            </el-avatar>
            <div class="online-indicator"></div>
          </div>
          
          <div class="group-details">
            <h2 class="group-name">{{ groupInfo.name }}</h2>
            <p class="group-meta">{{ groupInfo.memberCount }} 名成员</p>
            
            <div class="action-buttons">
              <el-button type="primary" round>发消息</el-button>
              <el-button round>语音通话</el-button>
            </div>
          </div>
        </div>

        <!-- 群公告 -->
        <div class="info-card" v-if="groupInfo.announcement">
          <div class="card-header">
            <el-icon><Bell /></el-icon>
            <span>群公告</span>
          </div>
          <p class="announcement-text">{{ groupInfo.announcement }}</p>
        </div>

        <!-- 群成员 -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-left">
              <el-icon><User /></el-icon>
              <span>群成员</span>
            </div>
            <el-button 
              type="primary" 
              link 
              @click="showAllMembers = !showAllMembers"
            >
              {{ showAllMembers ? '收起' : `查看全部` }}
            </el-button>
          </div>

          <!-- 成员搜索 -->
          <el-input
            v-if="showAllMembers"
            v-model="memberSearchQuery"
            placeholder="搜索成员"
            :prefix-icon="Search"
            class="member-search"
            clearable
          />

          <!-- 成员列表 -->
          <div class="members-container">
            <div 
              v-for="member in displayedMembers" 
              :key="member.id"
              class="member-item"
              @click="handleMemberClick(member)"
            >
              <el-badge 
                :is-dot="member.online" 
                :type="member.online ? 'success' : ''"
                class="member-badge"
              >
                <el-avatar :src="member.avatar" :size="40">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
              </el-badge>
              
              <div class="member-info">
                <div class="member-name-row">
                  <span class="member-name">{{ member.name }}</span>
                  <el-tag 
                    v-if="member.role === 'owner'" 
                    type="warning" 
                    size="small"
                    class="role-tag"
                  >
                    群主
                  </el-tag>
                  <el-tag 
                    v-else-if="member.role === 'admin'" 
                    type="danger" 
                    size="small"
                    class="role-tag"
                  >
                    管理员
                  </el-tag>
                </div>
                <span class="member-status">{{ member.online ? '在线' : '离线' }}</span>
              </div>
            </div>
            
            <!-- 添加成员 -->
            <div class="member-item add-member" @click="handleAddMember">
              <div class="add-member-avatar">
                <el-icon size="18"><Plus /></el-icon>
              </div>
              <div class="member-info">
                <span class="member-name">添加成员</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 群设置 -->
        <div class="info-card">
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>群设置</span>
          </div>
          
          <div class="settings-list">
            <div class="setting-item">
              <span>消息免打扰</span>
              <el-switch v-model="settings.mute" />
            </div>
            <div class="setting-item">
              <span>置顶聊天</span>
              <el-switch v-model="settings.pinned" />
            </div>
            <div class="setting-item clickable" @click="handleSetting('manage')">
              <span>群管理</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="info-card danger-card">
          <div class="danger-actions">
            <div class="danger-item" @click="handleDangerAction('report')">
              <el-icon color="#e6a23c"><Warning /></el-icon>
              <span>举报群聊</span>
            </div>
            <div class="danger-item" @click="handleDangerAction('leave')">
              <el-icon color="#f56c6c"><Delete /></el-icon>
              <span>退出群聊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  ArrowLeft,
  MoreFilled,
  UserFilled,
  Bell,
  User,
  Search,
  Plus,
  ChatDotRound,
  Document,
  Download,
  Link,
  ArrowRight,
  Setting,
  Warning,
  Delete
} from '@element-plus/icons-vue'

// Props定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  group: {
    type: Object,
    default: () => ({})
  }
})

// Emits定义
const emit = defineEmits(['update:visible'])

// 响应式数据
const showAllMembers = ref(false)
const memberSearchQuery = ref('')
const activeTab = ref('messages')

// 设置状态
const settings = ref({
  mute: false,
  pinned: true
})

// 群信息 - 使用props传入的数据
const groupInfo = computed(() => ({
  name: props.group.name || '群聊',
  avatar: props.group.avatar || '/placeholder.svg?height=80&width=80',
  memberCount: props.group.memberCount || 0,
  announcement: props.group.announcement || ''
}))

// 群成员数据
const members = ref([
  { id: 1, name: '张三', avatar: '/placeholder.svg?height=40&width=40', role: 'owner', online: true },
  { id: 2, name: '李四', avatar: '/placeholder.svg?height=40&width=40', role: 'admin', online: true },
  { id: 3, name: '王五', avatar: '/placeholder.svg?height=40&width=40', role: 'member', online: false },
  { id: 4, name: '赵六', avatar: '/placeholder.svg?height=40&width=40', role: 'member', online: true },
  { id: 5, name: '钱七', avatar: '/placeholder.svg?height=40&width=40', role: 'member', online: true },
  { id: 6, name: '孙八', avatar: '/placeholder.svg?height=40&width=40', role: 'member', online: false }
])

// 最近消息
const recentMessages = ref([
  {
    id: 1,
    sender: '张三',
    avatar: '/placeholder.svg?height=35&width=35',
    content: '大家好，今天分享一个Vue3的新特性',
    time: '10:30'
  },
  {
    id: 2,
    sender: '李四',
    avatar: '/placeholder.svg?height=35&width=35',
    content: '感谢分享！这个特性很实用',
    time: '10:32'
  },
  {
    id: 3,
    sender: '王五',
    avatar: '/placeholder.svg?height=35&width=35',
    content: '有没有相关的文档链接？',
    time: '10:35'
  }
])

// 文件数据
const files = ref([
  { id: 1, name: 'Vue3开发指南.pdf', size: '2.3MB', time: '昨天' },
  { id: 2, name: '项目需求文档.docx', size: '1.8MB', time: '前天' },
  { id: 3, name: '设计稿.sketch', size: '5.2MB', time: '3天前' }
])

// 图片数据
const images = ref([
  { id: 1, name: '截图1', url: '/placeholder.svg?height=120&width=120' },
  { id: 2, name: '截图2', url: '/placeholder.svg?height=120&width=120' },
  { id: 3, name: '截图3', url: '/placeholder.svg?height=120&width=120' },
  { id: 4, name: '截图4', url: '/placeholder.svg?height=120&width=120' },
  { id: 5, name: '截图5', url: '/placeholder.svg?height=120&width=120' },
  { id: 6, name: '截图6', url: '/placeholder.svg?height=120&width=120' }
])

// 链接数据
const links = ref([
  { id: 1, title: 'Vue.js 官方文档', url: 'https://vuejs.org' },
  { id: 2, title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { id: 3, title: 'GitHub - Vue', url: 'https://github.com/vuejs/vue' }
])

// 计算属性：显示的成员列表
const displayedMembers = computed(() => {
  let filteredMembers = members.value
  
  if (memberSearchQuery.value) {
    filteredMembers = members.value.filter(member => 
      member.name.toLowerCase().includes(memberSearchQuery.value.toLowerCase())
    )
  }
  
  return showAllMembers.value ? filteredMembers : filteredMembers.slice(0, 6)
})

// 方法
const goBack = () => {
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  emit('update:visible', false)
}

const handleMemberClick = (member) => {
  console.log('点击成员:', member)
}

const handleAddMember = () => {
  console.log('添加成员')
}

const handleSetting = (setting) => {
  console.log('设置:', setting)
}

const handleDangerAction = (action) => {
  console.log('危险操作:', action)
}

const openLink = (url) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
/* 抽屉样式 */
.group-detail-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.group-detail-drawer {
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  animation: slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .group-detail-drawer {
    width: 95%;
    max-width: none;
    max-height: 90vh;
    border-radius: 20px;
  }
  
  .drawer-content {
    padding: 20px;
  }
  
  .group-info-section {
    padding: 24px 16px;
  }
  
  .info-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .group-detail-drawer {
    width: 100%;
    max-height: 95vh;
    border-radius: 16px;
  }
  
  .drawer-content {
    padding: 16px;
  }
  
  .group-info-section {
    padding: 20px 12px;
  }
  
  .info-card {
    padding: 16px;
  }
}

.drawer-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
}

.drawer-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

.drawer-handle {
  width: 32px;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  margin: 0 auto 16px;
  transition: background-color 0.3s ease;
}

.drawer-handle:hover {
  background: rgba(0, 0, 0, 0.3);
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 群基本信息 */
.group-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.group-info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.group-avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.group-avatar {
  border: 3px solid #f5f5f7;
}

.online-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #67c23a;
  border: 2px solid white;
  border-radius: 50%;
}

.group-details {
  width: 100%;
}

.group-name {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px;
}

.group-meta {
  font-size: 14px;
  color: #8e8e93;
  margin: 0 0 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-buttons .el-button {
  flex: 1;
  max-width: 120px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 信息卡片 */
.info-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.card-header .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.header-left {
  display: flex;
  align-items: center;
}

/* 群公告 */
.announcement-text {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 成员搜索 */
.member-search {
  margin-bottom: 16px;
}

/* 成员列表 */
.members-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.member-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.member-badge {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.member-name {
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-status {
  font-size: 12px;
  color: #8e8e93;
}

.role-tag {
  flex-shrink: 0;
}

.add-member {
  border: 1px dashed #d0d0d0;
  background: #fafafa;
}

.add-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.clickable {
  cursor: pointer;
}

.setting-item.clickable:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 -12px;
}

/* 危险操作 */
.danger-card {
  border: 1px solid #ffebee;
  background: #fff5f5;
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.danger-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.danger-item:hover {
  background: rgba(255, 235, 238, 0.8);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
}

.danger-item span {
  font-weight: 500;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 暗色模式适配 */
.dark-mode .group-detail-drawer {
  background: rgba(26, 26, 26, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .drawer-header {
  background: rgba(26, 26, 26, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .drawer-content {
  background: rgba(15, 15, 15, 0.8);
}

.dark-mode .info-card {
  background: rgba(42, 42, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .group-info-section {
  background: rgba(42, 42, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .group-name {
  color: #ffffff;
}

.dark-mode .group-meta {
  color: #a0a0a0;
}

.dark-mode .card-header {
  color: #ffffff;
}

.dark-mode .member-name {
  color: #ffffff;
}

.dark-mode .member-status {
  color: #a0a0a0;
}

.dark-mode .setting-item {
  border-bottom-color: #333;
}

.dark-mode .danger-card {
  border-color: #4a2c2c;
  background: #2a1a1a;
}

.dark-mode .danger-item:hover {
  background: #4a2c2c;
}
</style>