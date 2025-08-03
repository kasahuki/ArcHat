<template>
  <div 
    v-if="visible" 
    class="voice-call-bubble"
    :style="bubbleStyle"
    @mousedown="startDrag"
    ref="bubbleRef"
  >
    <!-- 通话状态显示 -->
    <div class="call-header">
      <div class="user-info">
        <el-avatar :size="40" :src="userAvatar" />
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="call-status">{{ callStatusText }}</div>
        </div>
      </div>
      
      <!-- 收缩按钮 -->
      <button class="control-btn minimize-btn" @click="minimize" v-if="!isMinimized">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 12h12"/>
        </svg>
      </button>
    </div>

    <!-- 通话时长显示 -->
    <div class="call-duration" v-if="callStatus === 'connected' && !isMinimized">
      {{ formatDuration(callDuration) }}
    </div>

    <!-- 控制按钮区域 -->
    <div class="call-controls" v-if="!isMinimized">
      <!-- 静音按钮 -->
      <button 
        class="control-btn mute-btn" 
        :class="{ active: isMuted }"
        @click="toggleMute"
      >
        <svg v-if="!isMuted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="2" y1="2" x2="22" y2="22"/>
          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-1"/>
          <path d="M15.54 8.46A3 3 0 0 0 12 5a3 3 0 0 0-3 3v6a3 3 0 0 0 .54 1.54"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
        </svg>
      </button>

      <!-- 挂断按钮 -->
      <button class="control-btn hangup-btn" @click="hangup">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
      </button>
    </div>

    <!-- 最小化状态显示 -->
    <div class="minimized-content" v-if="isMinimized">
      <div class="minimized-info" @click="restore"  v-if="!isMinimized">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span class="duration-mini">{{ formatDuration(callDuration) }}</span>
      </div>
      
      <!-- 右上角展开按钮 -->
      <button class="control-btn expand-btn" @click="restore">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l3 3 7-7"/>
          <path d="M21 21H3a18 18 0 0 1 18-18v18z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: ''
  },
  userAvatar: {
    type: String,
    default: ''
  },
  callStatus: {
    type: String,
    default: 'calling', // calling, ringing, connected, ended
    validator: (value) => ['calling', 'ringing', 'connected', 'ended'].includes(value)
  },
  callDuration: {
    type: Number,
    default: 0
  },
  isMuted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['minimize', 'restore', 'mute', 'hangup', 'drag'])

// 拖拽相关 - 高性能Windows风格拖拽
const bubbleRef = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: window.innerWidth - 320, y: 100 }) // 默认右上角
const isMinimized = ref(false)

// 振铃音频相关 - 统一管理发起人和接收方振铃
const currentAudio = ref(null)
const isRingPlaying = ref(false)
const currentRingType = ref('') // 'caller' | 'receiver'

// 计算样式 - 只用于初始定位，拖拽时直接操作DOM
const bubbleStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  width: isMinimized.value ? '120px' : '280px',
  height: isMinimized.value ? '60px' : 'auto',
  position: 'fixed'
}))

// 通话状态文本
const callStatusText = computed(() => {
  switch (props.callStatus) {
    case 'calling':
      return '正在呼叫...'
    case 'ringing':
      return '对方振铃中...'
    case 'connected':
      return '通话中'
    case 'ended':
      return '通话结束'
    default:
      return '未知状态'
  }
})

// 格式化通话时长
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 高性能Windows风格拖拽 - 直接DOM操作
const startDrag = (e) => {
  if (e.target.closest('.control-btn')) return // 点击按钮时不触发拖拽
  
  isDragging.value = true
  const rect = bubbleRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  // 设置拖拽样式和优化
  if (bubbleRef.value) {
    bubbleRef.value.style.cursor = 'grabbing'
    bubbleRef.value.style.userSelect = 'none'
    bubbleRef.value.style.pointerEvents = 'none' // 防止子元素干扰
    bubbleRef.value.style.zIndex = '99999' // 确保在最顶层
  }
  
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag, { passive: false })
  e.preventDefault()
  e.stopPropagation()
}

const onDrag = (e) => {
  if (!isDragging.value || !bubbleRef.value) return
  
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  // 边界检查
  const bubbleWidth = isMinimized.value ? 120 : 280
  const bubbleHeight = isMinimized.value ? 60 : 200
  const maxX = window.innerWidth - bubbleWidth
  const maxY = window.innerHeight - bubbleHeight
  
  const boundedX = Math.max(0, Math.min(newX, maxX))
  const boundedY = Math.max(0, Math.min(newY, maxY))
  
  // 直接操作DOM，绕过Vue响应式系统
  bubbleRef.value.style.left = `${boundedX}px`
  bubbleRef.value.style.top = `${boundedY}px`
  bubbleRef.value.style.transform = 'translate3d(0, 0, 0)' // 启用硬件加速
  
  // 更新内部位置状态（但不触发重新渲染）
  position.value.x = boundedX
  position.value.y = boundedY
  
  e.preventDefault()
  e.stopPropagation()
}

const stopDrag = () => {
  isDragging.value = false
  
  // 恢复样式
  if (bubbleRef.value) {
    bubbleRef.value.style.cursor = 'grab'
    bubbleRef.value.style.userSelect = 'auto'
    bubbleRef.value.style.pointerEvents = 'auto'
    bubbleRef.value.style.zIndex = '10000'
  }
  
  // 清理事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 通知父组件最终位置
  emit('drag', position.value)
}

// 控制功能
const minimize = () => {
  isMinimized.value = true
  emit('minimize')
}

const restore = () => {
  isMinimized.value = false
  emit('restore')
}

const toggleMute = () => {
  emit('mute', !props.isMuted)
}

const hangup = () => {
  stopRingAudio() // 挂断时停止铃声
  emit('hangup')
}

// 统一振铃音频管理函数
const playRingAudio = (ringType) => {
  // 确定音频文件路径
  const audioPath = ringType === 'caller' 
    ? '/src/assets/sounds/targetRing.mp3'        // 发起人振铃
    : '/src/assets/sounds/ring.mp3'  // 接收方振铃
  
  const ringTypeName = ringType === 'caller' ? '发起人' : '接收方'
  
  // 如果当前有其他音频在播放，先停止
  if (currentAudio.value && isRingPlaying.value) {
    stopRingAudio()
  }
  
  // 创建新的音频实例
  currentAudio.value = new Audio(audioPath)
  currentRingType.value = ringType
  
  // 铃声播放结束时的处理
  currentAudio.value.addEventListener('ended', () => {
    console.log(`${ringTypeName}铃声播放结束，自动挂断通话`)
    isRingPlaying.value = false
    currentRingType.value = ''
    emit('hangup') // 自动挂断
  })
  
  // 播放错误处理
  currentAudio.value.addEventListener('error', (e) => {
    console.error(`${ringTypeName}铃声播放失败:`, e)
    isRingPlaying.value = false
    currentRingType.value = ''
  })
  
  // 开始播放
  if (!isRingPlaying.value) {
    currentAudio.value.currentTime = 0
    currentAudio.value.play().then(() => {
      isRingPlaying.value = true
      console.log(`开始播放${ringTypeName}振铃音频`)
    }).catch(error => {
      console.error(`播放${ringTypeName}振铃音频失败:`, error)
      isRingPlaying.value = false
      currentRingType.value = ''
    })
  }
}

const stopRingAudio = () => {
  if (currentAudio.value && isRingPlaying.value) {
    const ringTypeName = currentRingType.value === 'caller' ? '发起人' : '接收方'
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    isRingPlaying.value = false
    currentRingType.value = ''
    console.log(`停止播放${ringTypeName}振铃音频`)
  }
}

// 窗口大小变化时调整位置
const handleResize = () => {
  const maxX = window.innerWidth - (isMinimized.value ? 120 : 280)
  const maxY = window.innerHeight - (isMinimized.value ? 60 : 200)
  
  position.value = {
    x: Math.min(position.value.x, maxX),
    y: Math.min(position.value.y, maxY)
  }
}

// 监听通话状态变化，控制振铃音频
watch(() => props.callStatus, (newStatus, oldStatus) => {
  console.log(`通话状态变化: ${oldStatus} -> ${newStatus}`)
  
  if (newStatus === 'calling') {
    // 发起人振铃状态，播放发起人铃声
    playRingAudio('caller')
  } else if (newStatus === 'ringing') {
    // 接收方振铃状态，播放接收方铃声
    playRingAudio('receiver')
  } else {
    // 其他状态（接通、挂断、结束），停止播放铃声
    stopRingAudio()
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 清理拖拽事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 清理音频资源
  stopRingAudio()
  if (currentAudio.value) {
    currentAudio.value.removeEventListener('ended', () => {})
    currentAudio.value.removeEventListener('error', () => {})
    currentAudio.value = null
  }
  currentRingType.value = ''
})
</script>

<style scoped>
.voice-call-bubble {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10000;
  cursor: grab;
  user-select: none;
  padding: 16px;
  
  /* 高性能拖拽优化 */
  will-change: transform, left, top;
  transform: translate3d(0, 0, 0); /* 强制硬件加速 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  /* 移除所有transition，确保拖拽时无延迟 */
  transition: none !important;
  
  /* 优化渲染性能 */
  contain: layout style paint;
  isolation: isolate;
}

.call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.call-status {
  font-size: 12px;
  color: #666;
}

.call-duration {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.call-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.minimize-btn {
  background: #666;
  width: 24px;
  height: 24px;
}

.minimize-btn:hover {
  background: #555;
}

.mute-btn {
  background: #666;
}

.mute-btn:hover {
  background: #555;
}

.mute-btn.active {
  background: #ff4757;
}

.hangup-btn {
  background: #ff4757;
}

.hangup-btn:hover {
  background: #ff3838;
}

.minimized-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
}

.minimized-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  font-size: 12px;
  font-weight: 600;
  flex: 1;
}

.expand-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.expand-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.expand-btn svg {
  width: 12px;
  height: 12px;
}

.duration-mini {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* 暗色模式 */
.dark .voice-call-bubble {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .user-name {
  color: #fff;
}

.dark .call-status {
  color: #ccc;
}

.dark .call-duration {
  color: #fff;
}

.dark .minimized-info {
  color: #fff;
}

.dark .expand-btn {
  background: rgba(99, 102, 241, 0.9);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.dark .expand-btn:hover {
  background: rgba(99, 102, 241, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>
