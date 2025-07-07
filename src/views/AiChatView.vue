<template>
  <div class="chat-container">
    <!-- 主聊天区域 -->
    <div class="chat-main" :class="{ 'sidebar-open': !sidebarCollapsed }">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <div class="ai-avatar">
            <el-icon size="20"><User /></el-icon>
          </div>
          <div class="title-info">
            <h2>{{ currentChatTitle }}</h2>
            <span class="model-info">GPT-4</span>
          </div>
        </div>
      
      </div>



      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div class="messages-list">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-section">
            <div>
                <img src="/src/assets/image/archat.png" alt="" width="120" height="100">
            </div>
            <h1 class="welcome-title">您好！我是ArcAI</h1>
            <p class="welcome-subtitle">我可以帮助您解答问题、协助工作、进行创意讨论等。请随时向我提问！</p>
          
          </div>
      <!-- 将输入框移到这里 -->
    
        <AichatInput 
          v-model="inputMessage"
          @send="sendMessage"
          :disabled="isTyping"
        />

          <!-- 聊天消息 -->
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message', message.type]"
          >
            <div class="message-avatar" v-if="message.type === 'ai'">
              <el-icon><User /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div class="message-text">{{ message.content }}</div>
              </div>
              <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
            <div class="message-avatar user-avatar" v-if="message.type === 'user'">
              <el-icon><User /></el-icon>
            </div>
          </div>

          <!-- AI正在输入 -->
          <div v-if="isTyping" class="message ai typing-message">
            <div class="message-avatar">
              <el-icon><User /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle" :class="{ 'sidebar-open': !sidebarCollapsed }" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z"/></svg>
    </div>

    <!-- 右侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-content">
        <!-- 新建对话按钮 -->
        <div class="sidebar-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><mask id="lineMdGithubLoop0" width="24" height="24" x="0" y="0"><g fill="#fff"><ellipse cx="9.5" cy="9" rx="1.5" ry="1"/><ellipse cx="14.5" cy="9" rx="1.5" ry="1"/></g></mask><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="32" stroke-dashoffset="32" d="M12 4c1.67 0 2.61 0.4 3 0.5c0.53 -0.43 1.94 -1.5 3.5 -1.5c0.34 1 0.29 2.22 0 3c0.75 1 1 2 1 3.5c0 2.19 -0.48 3.58 -1.5 4.5c-1.02 0.92 -2.11 1.37 -3.5 1.5c0.65 0.54 0.5 1.87 0.5 2.5c0 0.73 0 3 0 3M12 4c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5c0 0.73 0 3 0 3"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0"/></path><path stroke-dasharray="10" stroke-dashoffset="10" d="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5"><animate attributeName="d" dur="3s" repeatCount="indefinite" values="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5;M9 19c-1.406 0-3-.5-4-.5-.532 0-1 0-2-.5;M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5"/><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="10;0"/></path></g><rect width="8" height="4" x="8" y="11" fill="currentColor" mask="url(#lineMdGithubLoop0)"><animate attributeName="y" dur="10s" keyTimes="0;0.45;0.46;0.54;0.55;1" repeatCount="indefinite" values="11;11;7;7;11;11"/></rect></svg>
          <span>新会话<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M4 16q-.425 0-.712-.288T3 15t.288-.712T4 14h5q.425 0 .713.288T10 15t-.288.713T9 16zm0-4q-.425 0-.712-.288T3 11t.288-.712T4 10h9q.425 0 .713.288T14 11t-.288.713T13 12zm0-4q-.425 0-.712-.288T3 7t.288-.712T4 6h9q.425 0 .713.288T14 7t-.288.713T13 8zm13 12q-.425 0-.712-.288T16 19v-3h-3q-.425 0-.712-.288T12 15t.288-.712T13 14h3v-3q0-.425.288-.712T17 10t.713.288T18 11v3h3q.425 0 .713.288T22 15t-.288.713T21 16h-3v3q0 .425-.288.713T17 20"/></svg></span>
           
        </div>

        <!-- 聊天历史 -->
        <div class="chat-history-section">
          <div class="history-title">最近对话</div>
          <div class="chat-history-container">
            <div class="chat-history">
              <div 
                v-for="chat in chatHistory" 
                :key="chat.id"
                :class="['history-item', { active: chat.id === currentChatId }]"
                @click="switchChat(chat.id)"
              >
                <div class="history-content">
                  <div class="history-title">{{ chat.title }}</div>
                  <div class="history-preview">{{ chat.lastMessage }}</div>
                  <div class="history-time">{{ formatDate(chat.timestamp) }}</div>
                </div>
                <el-button 
                  :icon="Delete"
                  size="small"
                  text
                  @click.stop="deleteChat(chat.id)"
                  class="delete-button"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { 
  User, 
  Plus,
  Delete,
  Fold,
  Expand,
  ChatDotRound,
  Document,
  QuestionFilled,
  EditPen,
  ArrowRight
} from '@element-plus/icons-vue'
import AichatInput from '../components/AiChatInput.vue'

// 响应式数据
const inputMessage = ref('')
const messagesContainer = ref(null)
const currentChatId = ref(1)
const sidebarCollapsed = ref(true)
const isTyping = ref(false)

// 当前聊天标题
const currentChatTitle = computed(() => {
  const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
  return currentChat ? currentChat.title : '新对话'
})

// 消息列表
const messages = ref([])

// 聊天历史
const chatHistory = ref([
  { 
    id: 1, 
    title: '新对话', 
    lastMessage: '开始新的对话...',
    timestamp: new Date(),
    messages: []
  },
  { 
    id: 2, 
    title: 'Vue.js 开发问题', 
    lastMessage: '如何在Vue 3中使用Composition API？',
    timestamp: new Date(Date.now() - 86400000),
    messages: []
  },
  { 
    id: 3, 
    title: 'UI设计讨论', 
    lastMessage: '现代化界面设计的原则是什么？',
    timestamp: new Date(Date.now() - 172800000),
    messages: []
  },
  { 
    id: 4, 
    title: 'JavaScript 异步编程', 
    lastMessage: 'Promise和async/await的区别',
    timestamp: new Date(Date.now() - 259200000),
    messages: []
  }
])

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 处理建议点击
const handleSuggestion = (suggestionText) => {
  inputMessage.value = suggestionText
  handleSend()
}

// 处理输入
const handleInput = () => {
  // 自动调整输入框高度
  nextTick(() => {
    const textarea = document.querySelector('.message-input .el-textarea__inner')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  })
}

// 发送消息
const handleSend = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const userInput = inputMessage.value
  inputMessage.value = ''

  // 更新聊天历史
  updateChatHistory(userInput)

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 显示AI正在输入
  isTyping.value = true

  // 模拟AI回复
  setTimeout(() => {
    const aiResponses = [
      `关于"${userInput}"，这是一个很有趣的问题。让我为您详细解答...`,
      `我理解您想了解"${userInput}"。根据我的知识，我可以为您提供以下信息...`,
      `这是一个很好的问题！关于"${userInput}"，我建议从以下几个方面来考虑...`,
      `感谢您的提问。对于"${userInput}"这个话题，我认为...`
    ]
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date()
    }
    
    messages.value.push(aiMessage)
    isTyping.value = false
    nextTick(() => scrollToBottom())
  }, 1500)
}

// 创建新对话
const createNewChat = () => {
  const newChatId = Date.now()
  const newChat = {
    id: newChatId,
    title: '新对话',
    lastMessage: '开始新的对话...',
    timestamp: new Date(),
    messages: []
  }
  
  chatHistory.value.unshift(newChat)
  currentChatId.value = newChatId
  messages.value = []
}

// 切换对话
const switchChat = (chatId) => {
  currentChatId.value = chatId
  // 这里可以加载对应的聊天记录
  messages.value = []
}

// 删除对话
const deleteChat = (chatId) => {
  if (chatHistory.value.length <= 1) return
  
  chatHistory.value = chatHistory.value.filter(chat => chat.id !== chatId)
  
  if (currentChatId.value === chatId) {
    currentChatId.value = chatHistory.value[0].id
    messages.value = []
  }
}

// 更新聊天历史
const updateChatHistory = (message) => {
  const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
  if (currentChat) {
    currentChat.lastMessage = message.length > 30 ? message.substring(0, 30) + '...' : message
    currentChat.timestamp = new Date()
    
    // 如果是新对话，更新标题
    if (currentChat.title === '新对话') {
      currentChat.title = message.length > 20 ? message.substring(0, 20) + '...' : message
    }
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 格式化日期
const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  background: var(--el-bg-color);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0;
  max-width: none;
}

.chat-main.sidebar-open {
  margin-right: 320px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px 16px;
  padding-top: 32px; /* 为 MacWindowControls 留出空间 */
  background: var(--el-bg-color);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10a37f 0%, #1a7f64 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.title-info h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.model-info {
  color: #6e6e80;
  font-size: 12px;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-chat-btn {
  font-size: 14px;
}

.input-container {
  padding: 16px 40px;
  background: var(--el-bg-color);
  margin-top: -20px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
}

.messages-list {
  max-width: 768px;
  margin: 0 auto;
  padding: 24px;
}

.welcome-section {
  text-align: center;
  padding: 48px 24px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: #5079e9;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.welcome-suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.message {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  gap: 12px;
  padding: 0 24px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10a37f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-avatar {
  background: #6366f1;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 44px);
}

.message.user .message-content {
  text-align: right;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
  max-width: 80%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message.user .message-bubble {
  background: var(--el-color-primary);
  color: white;
  margin-left: auto;
}

.message.ai .message-bubble {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.ai .message-text {
  background: #f7f7f8;
  color: #1f1f1f;
}

.message.user .message-text {
  background: var(--el-color-primary);
  color: white;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  padding: 0 4px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.send-button {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgb(218, 232, 247) 0%, rgb(214, 229, 247) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 101;
  box-shadow: rgba(79, 156, 232, 0.3) 0px 3px 8px;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgb(239, 247, 255) 0%, rgb(214, 229, 247) 100%);
  box-shadow: rgba(79, 156, 232, 0.4) 0px 4px 12px;
}

.sidebar-toggle svg {
  width: 24px;
  height: 24px;
  color: #9EBCD9;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover svg {
  color: #4F9CE8;
  transform: scale(1.1);
}

.sidebar-toggle.sidebar-open {
  right: 320px;
}

.sidebar-toggle.sidebar-open svg {
  transform: rotate(180deg);
}

.sidebar {
  width: 300px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  background-color: rgba(245, 247, 250, 0.95);
  border-left: 1px solid var(--border-color);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.dark-mode .sidebar {
  background-color: rgba(20, 24, 36, 0.95);
}

.sidebar.collapsed {
  transform: translateX(100%);
}

.sidebar-content {
  padding: 20px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin-top: 35px;
  padding: 1px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  background-color: rgba(255, 255, 255, 0.6);
}

.dark-mode .sidebar-header {
  background-color: rgba(30, 34, 46, 0.6);
}

.sidebar-header:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.dark-mode .sidebar-header:hover {
  background-color: rgba(30, 34, 46, 0.8);
}

.sidebar-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  letter-spacing: 0.3px;
}

.sidebar-header svg {
  width: 20px;
  height: 20px;
}

.history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin-bottom: 12px;
  padding: 0 8px;
}

.chat-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dark-mode .history-item:hover {
  background: rgba(30, 34, 46, 0.1);
}

.history-item.active {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dark-mode .history-item.active {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-content .history-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-preview {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

.delete-button {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.history-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  color: var(--el-color-danger);
}

:root[data-theme='dark'] .sidebar {
  background: var(--el-bg-color);
  border-color: var(--el-border-color-darker);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

:root[data-theme='dark'] .history-item:hover {
  background: var(--el-fill-color-darker);
}

:root[data-theme='dark'] .chat-history::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
}

@media (max-width: 768px) {
  .messages-container {
    padding: 20px;
  }

  .input-container {
    padding: 16px 20px;
  }

  .sidebar-toggle {
    right: 0;
    transform: translateY(-50%);
  }

  .sidebar-toggle.sidebar-open {
    right: 320px;
  }
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 暗色模式适配 */
.dark-mode .chat-container {
  background: var(--dark-bg);
}

.dark-mode .chat-main {
  background: var(--dark-bg);
}

.dark-mode .chat-header {
  background: var(--dark-bg);
  border-bottom-color: var(--dark-border);
}

.dark-mode .title-info h2 {
  color: var(--dark-text);
}

.dark-mode .model-info {
  color: var(--dark-secondary-text);
}

.dark-mode .sidebar {
  background: var(--dark-sidebar-bg);
  border-left-color: var(--dark-border);
}

.dark-mode .message.ai .message-text {
  background: var(--dark-hover);
  color: var(--dark-text);
}

.dark-mode .message-time {
  color: var(--dark-secondary-text);
}

.dark-mode .input-container {
  background: var(--dark-bg);
  border-top-color: var(--dark-border);
}

.dark-mode .message-input :deep(.el-textarea__inner) {
  background: var(--dark-hover);
  border-color: var(--dark-border);
  color: var(--dark-text);
}

.dark-mode .message-input :deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.dark-mode .input-hint {
  color: var(--dark-secondary-text);
}

.dark-mode .history-item:hover {
  background: var(--dark-hover);
}



.dark-mode .history-title {
  color: var(--dark-text);
}

.dark-mode .history-preview {
  color: var(--dark-secondary-text);
}

.dark-mode .history-time {
  color: var(--dark-secondary-text);
}

.dark-mode .chat-history-section h3 {
  color: var(--dark-secondary-text);
}

.dark-mode .history-icon {
  background: var(--dark-hover);
  color: var(--dark-text);
}

.dark-mode .history-icon:hover {
  background: var(--dark-active);
}

.dark-mode .sidebar-toggle {
  background: var(--el-bg-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.dark-mode .sidebar-toggle:hover {
  background: var(--el-bg-color-darker);
}

.dark-mode .sidebar-toggle svg {
  color: var(--el-color-primary);
}

.dark-mode .sidebar-toggle:hover svg {
  color: var(--el-color-primary-light-3);
}

/* 修复标题样式 */
.title-info h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--light-text);
}

/* 按钮样式 */
.new-chat-button {
  width: 100%;
  height: 44px;
  background: var(--el-color-primary);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: white;
}

.new-chat-button.icon-only {
  width: 44px;
  border-radius: 50%;
}

.new-chat-button:hover {
  background: var(--el-color-primary-light-3);
}

.send-button {
  width: 44px;
  height: 44px;
  background: var(--el-color-primary);
  border: none;
  border-radius: 50%;
  color: white;
}

.send-button:hover {
  background: var(--el-color-primary-light-3);
}



.history-item:hover {
  background: var(--el-color-primary-light-9);
}

.message.user .message-text {
  background: var(--el-color-primary);
  color: white;
}
</style>