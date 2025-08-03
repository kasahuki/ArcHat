import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCallStore } from './call.js'
import { useUserInfoStore } from './user.js'

/**
 * 独立的视频通话状态管理
 * 与语音通话完全解耦，确保功能独立性和互斥性
 */
export const useVideoCallStore = defineStore('videoCall', () => {
  // === 视频通话状态 ===
  const isVideoCallActive = ref(false) // 视频通话是否激活
  const videoCallStatus = ref('idle')  // 视频通话状态：idle(空闲), calling(拨打中), ringing(响铃), connected(已连接), ended(已结束)
  const videoCallDuration = ref(0) // 视频通话时长
  const isVideoMuted = ref(false) // 视频通话是否静音
  const isVideoMinimized = ref(false) // 视频画面是否最小化
  
  // === 视频相关状态 ===
  const isVideoEnabled = ref(true) // 视频是否开启
  const isCameraOn = ref(true) // 摄像头是否开启
  const currentCamera = ref('user') // 当前摄像头：'user'(前置)/'environment'(后置)
  const isVideoCallMinimized = ref(false) // 视频通话窗口是否最小化
  
  // === 视频流相关 ===
  const localVideoStream = ref(null) // 本地视频流
  const remoteVideoStream = ref(null) // 远程视频流
  
  // === 视频通话对象信息 ===
  const remoteVideoUser = ref({
    id: '',
    name: '',
    avatar: ''
  })
  
  // === 来电通知相关状态 ===
  const showIncomingVideoCallNotification = ref(false)
  const incomingVideoCallInfo = ref(null)
  const pendingVideoCallId = ref(null)
  
  // === 视频通话计时器 ===
  let videoCallTimer = null
  
  // === WebRTC管理器实例 ===
  let videoWebrtcManager = null
  
  // 状态管理调试标志
  const DEBUG_VIDEO_CALL_STATE = true
  
  // 计算属性 - 视频通话状态判断
  const isInVideoCall = computed(() => {
    const inVideoCallStates = ['calling', 'ringing', 'connected']
    const result = inVideoCallStates.includes(videoCallStatus.value)
    if (DEBUG_VIDEO_CALL_STATE) {
      console.log('🎥 isInVideoCall计算:', { videoCallStatus: videoCallStatus.value, result, inVideoCallStates })
    }
    return result
  })
  
  // 检查是否有任何通话正在进行（语音或视频）
  const isAnyCallActive = computed(() => {
    const callStore = useCallStore()
    const hasVoiceCall = callStore.isInCall
    const hasVideoCall = isInVideoCall.value
    const result = hasVoiceCall || hasVideoCall
    
    if (DEBUG_VIDEO_CALL_STATE) {
      console.log('🔍 通话互斥检查:', { 
        hasVoiceCall, 
        hasVideoCall, 
        result,
        voiceCallStatus: callStore.callStatus,
        videoCallStatus: videoCallStatus.value
      })
    }
    return result
  })
  
  /**
   * 强制重置所有视频通话状态到初始值
   */
  const forceResetVideoCallState = (reason = '未知原因') => {
    if (DEBUG_VIDEO_CALL_STATE) {
      console.log('🔄 强制重置视频通话状态 - 原因:', reason, '重置前状态:', {
        isVideoCallActive: isVideoCallActive.value,
        videoCallStatus: videoCallStatus.value,
        videoCallDuration: videoCallDuration.value,
        isVideoMuted: isVideoMuted.value,
        isVideoEnabled: isVideoEnabled.value,
        showIncomingVideoCallNotification: showIncomingVideoCallNotification.value
      })
    }
    
    // 重置所有状态到初始值
    isVideoCallActive.value = false
    videoCallStatus.value = 'idle'
    videoCallDuration.value = 0
    isVideoMuted.value = false
    isVideoMinimized.value = false
    isVideoEnabled.value = true
    isCameraOn.value = true
    currentCamera.value = 'user'
    isVideoCallMinimized.value = false
    
    // 清理来电通知状态
    showIncomingVideoCallNotification.value = false
    incomingVideoCallInfo.value = null
    pendingVideoCallId.value = null
    
    // 重置远程用户信息
    remoteVideoUser.value = {
      id: '',
      name: '',
      avatar: ''
    }
    
    // 清理视频流
    localVideoStream.value = null
    remoteVideoStream.value = null
    
    // 停止计时器
    stopVideoCallTimer()
    
    if (DEBUG_VIDEO_CALL_STATE) {
      console.log('✅ 视频通话状态重置完成，当前状态:', {
        isVideoCallActive: isVideoCallActive.value,
        videoCallStatus: videoCallStatus.value,
        isInVideoCall: isInVideoCall.value
      })
    }
  }
  
  /**
   * 开始视频通话计时
   */
  const startVideoCallTimer = () => {
    if (videoCallTimer) {
      clearInterval(videoCallTimer)
    }
    
    videoCallDuration.value = 0
    videoCallTimer = setInterval(() => {
      videoCallDuration.value++
    }, 1000)
  }
  
  /**
   * 停止视频通话计时
   */
  const stopVideoCallTimer = () => {
    if (videoCallTimer) {
      clearInterval(videoCallTimer)
      videoCallTimer = null
    }
  }
  
  /**
   * 更新视频通话状态
   */
  const updateVideoCallStatus = (newStatus, reason = '') => {
    const oldStatus = videoCallStatus.value
    videoCallStatus.value = newStatus
    
    if (DEBUG_VIDEO_CALL_STATE) {
      console.log('🎥 视频通话状态变化:', { 
        from: oldStatus, 
        to: newStatus, 
        reason,
        isInVideoCall: isInVideoCall.value 
      })
    }
    
    // 根据状态变化执行相应操作
    switch (newStatus) {
      case 'connected':
        startVideoCallTimer()
        isVideoCallActive.value = true
        break
      case 'ended':
        stopVideoCallTimer()
        isVideoCallActive.value = false
        break
      case 'calling':
        isVideoCallActive.value = true
        break
      case 'ringing':
        isVideoCallActive.value = true
        break
      case 'idle':
        forceResetVideoCallState('状态重置为idle')
        break
    }
  }
  
  /**
   * 检查WebSocket连接状态
   */
  const checkWebSocketConnection = () => {
    const userInfoStore = useUserInfoStore()
    const hasWebSocket = !!userInfoStore.chatWS
    const isConnected = hasWebSocket && 
      userInfoStore.chatWS.connectionStatus === 'connected' &&
      userInfoStore.chatWS.ws &&
      userInfoStore.chatWS.ws.readyState === WebSocket.OPEN
    
    // 强制显示调试信息来定位连接问题
    console.log('🔌 WebSocket连接检查:', { 
      hasWebSocket,
      connectionStatus: userInfoStore.chatWS?.connectionStatus,
      wsReadyState: userInfoStore.chatWS?.ws?.readyState,
      wsExists: !!userInfoStore.chatWS?.ws,
      isConnected
    })
    
    return isConnected
  }
  
  /**
   * 检查是否可以发起视频通话（互斥性检查）
   */
  const canStartVideoCall = () => {
    // 检查WebSocket连接
    if (!checkWebSocketConnection()) {
      console.warn('❌ WebSocket连接已断开，无法发起视频通话')
      return { canStart: false, reason: 'websocket_disconnected' }
    }
    
    // 检查是否有其他通话正在进行
    if (isAnyCallActive.value) {
      console.warn('❌ 当前有通话正在进行，无法发起新的视频通话')
      return { canStart: false, reason: 'call_in_progress' }
    }
    
    return { canStart: true, reason: '' }
  }
  
  /**
   * 初始化视频WebRTC管理器
   */
  const initVideoWebRTCManager = async () => {
    if (videoWebrtcManager) {
      console.log('🎥 视频WebRTC管理器已存在，跳过初始化')
      return videoWebrtcManager
    }
    
    try {
      // 动态导入视频WebRTC管理器
      const { VideoWebRTCManager } = await import('@/utils/videoWebrtc.js')
      videoWebrtcManager = new VideoWebRTCManager()
      
      const userInfoStore = useUserInfoStore()
      videoWebrtcManager.init(userInfoStore.chatWS, userInfoStore)
      
      // 设置回调函数
      videoWebrtcManager.onCallStatusChange = updateVideoCallStatus
      videoWebrtcManager.onIncomingCall = handleIncomingVideoCall
      videoWebrtcManager.onLocalVideoStream = (stream) => {
        localVideoStream.value = stream
      }
      videoWebrtcManager.onRemoteVideoStream = (stream) => {
        remoteVideoStream.value = stream
      }
      videoWebrtcManager.onError = (error) => {
        console.error('🎥 视频通话错误:', error)
        // 可以在这里添加错误处理逻辑
      }
      
      console.log('✅ 视频WebRTC管理器初始化成功')
      return videoWebrtcManager
    } catch (error) {
      console.error('❌ 视频WebRTC管理器初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 发起视频通话
   * @param {Object} targetUser - 目标用户信息
   * @param {Object} options - 通话选项
   * @param {boolean} options.cameraEnabled - 是否启用摄像头
   * @param {string} options.selectedDeviceId - 选定的摄像头设备ID
   */
  const startVideoCall = async (targetUser, options = {}) => {
    console.log('🎥 尝试发起视频通话:', {
      targetUser,
      options
    })
    
    // 检查是否可以发起通话
    const { canStart, reason } = canStartVideoCall()
    if (!canStart) {
      console.error('❌ 无法发起视频通话:', reason)
      return { success: false, reason }
    }
    
    try {
      // 初始化视频WebRTC管理器
      await initVideoWebRTCManager()
      
      // 设置远程用户信息
      remoteVideoUser.value = {
        id: targetUser.id,
        name: targetUser.name || targetUser.username,
        avatar: targetUser.avatar || ''
      }
      
      // 发起视频通话，传入摄像头选项
      const success = await videoWebrtcManager.startVideoCall(targetUser.id, targetUser, {
        cameraEnabled: options.cameraEnabled !== false, // 默认启用摄像头
        selectedDeviceId: options.selectedDeviceId // 传入选定的设备ID
      })
      
      if (success) {
        console.log('✅ 视频通话发起成功')
        return { success: true }
      } else {
        console.error('❌ 视频通话发起失败')
        forceResetVideoCallState('发起视频通话失败')
        return { success: false, reason: 'start_call_failed' }
      }
    } catch (error) {
      console.error('❌ 发起视频通话异常:', error)
      forceResetVideoCallState('发起视频通话异常')
      return { success: false, reason: 'exception', error: error.message }
    }
  }
  
  /**
   * 处理来电邀请
   */
  const handleIncomingVideoCall = (callerInfo, callId) => {
    console.log('🎥 收到视频通话邀请:', { callerInfo, callId })
    
    // 检查是否有其他通话正在进行（排除 ringing 状态，因为 ringing 表示正在接收来电）
    const callStore = useCallStore()
    const hasActiveVoiceCall = callStore.isInCall // 语音通话正在进行
    const hasActiveVideoCall = videoCallStatus.value === 'calling' || videoCallStatus.value === 'connected' // 视频通话正在进行（排除 ringing）
    
    if (hasActiveVoiceCall || hasActiveVideoCall) {
      console.warn('❌ 当前有通话正在进行，自动拒绝视频通话邀请', {
        hasActiveVoiceCall,
        hasActiveVideoCall,
        voiceCallStatus: callStore.callStatus,
        videoCallStatus: videoCallStatus.value
      })
      if (videoWebrtcManager) {
        videoWebrtcManager.rejectVideoCall(callId, 'busy')
      }
      return
    }
    
    // 设置来电信息
    incomingVideoCallInfo.value = callerInfo
    pendingVideoCallId.value = callId
    showIncomingVideoCallNotification.value = true
    
    // 设置远程用户信息
    remoteVideoUser.value = {
      id: callerInfo.id,
      name: callerInfo.name,
      avatar: callerInfo.avatar || ''
    }
  }
  
  /**
   * 接受视频通话
   */
  const acceptVideoCall = async () => {
    if (!pendingVideoCallId.value || !videoWebrtcManager) {
      console.error('❌ 无效的视频通话接受请求')
      return false
    }
    
    try {
      const success = await videoWebrtcManager.acceptVideoCall(pendingVideoCallId.value)
      
      if (success) {
        showIncomingVideoCallNotification.value = false
        console.log('✅ 视频通话接受成功')
        return true
      } else {
        console.error('❌ 视频通话接受失败')
        forceResetVideoCallState('接受视频通话失败')
        return false
      }
    } catch (error) {
      console.error('❌ 接受视频通话异常:', error)
      forceResetVideoCallState('接受视频通话异常')
      return false
    }
  }
  
  /**
   * 拒绝视频通话
   */
  const rejectVideoCall = () => {
    if (!pendingVideoCallId.value || !videoWebrtcManager) {
      console.error('❌ 无效的视频通话拒绝请求')
      return false
    }
    
    try {
      videoWebrtcManager.rejectVideoCall(pendingVideoCallId.value, 'rejected')
      forceResetVideoCallState('拒绝视频通话')
      console.log('✅ 视频通话拒绝成功')
      return true
    } catch (error) {
      console.error('❌ 拒绝视频通话异常:', error)
      return false
    }
  }
  
  /**
   * 挂断视频通话
   */
  const endVideoCall = () => {
    try {
      if (videoWebrtcManager) {
        videoWebrtcManager.endVideoCall()
      }
      forceResetVideoCallState('主动挂断视频通话')
      console.log('✅ 视频通话挂断成功')
      return true
    } catch (error) {
      console.error('❌ 挂断视频通话异常:', error)
      return false
    }
  }
  
  /**
   * 切换视频静音
   */
  const toggleVideoMute = () => {
    if (videoWebrtcManager) {
      const newMuteState = videoWebrtcManager.toggleMute()
      isVideoMuted.value = newMuteState
      return newMuteState
    }
    return isVideoMuted.value
  }
  
  /**
   * 切换视频开关
   */
  const toggleVideo = () => {
    if (videoWebrtcManager) {
      const newVideoState = videoWebrtcManager.toggleVideo()
      isVideoEnabled.value = newVideoState
      isCameraOn.value = newVideoState
      return newVideoState
    }
    return isVideoEnabled.value
  }
  
  /**
   * 切换摄像头（前置/后置）
   */
  const switchCamera = async () => {
    if (videoWebrtcManager) {
      try {
        const success = await videoWebrtcManager.switchCamera()
        if (success) {
          currentCamera.value = currentCamera.value === 'user' ? 'environment' : 'user'
          console.log('✅ 摄像头切换成功:', currentCamera.value === 'user' ? '前置' : '后置')
        }
        return success
      } catch (error) {
        console.error('❌ 摄像头切换失败:', error)
        return false
      }
    }
    return false
  }
  
  /**
   * 最小化/展开视频通话窗口
   */
  const toggleVideoCallMinimize = () => {
    isVideoCallMinimized.value = !isVideoCallMinimized.value
    return isVideoCallMinimized.value
  }
  
  return {
    // 状态
    isVideoCallActive,
    videoCallStatus,
    videoCallDuration,
    isVideoMuted,
    isVideoMinimized,
    isVideoEnabled,
    isCameraOn,
    currentCamera,
    isVideoCallMinimized,
    localVideoStream,
    remoteVideoStream,
    remoteVideoUser,
    showIncomingVideoCallNotification,
    incomingVideoCallInfo,
    pendingVideoCallId,
    
    // 计算属性
    isInVideoCall,
    isAnyCallActive,
    
    // 方法
    forceResetVideoCallState,
    updateVideoCallStatus,
    checkWebSocketConnection,
    canStartVideoCall,
    initVideoWebRTCManager,
    startVideoCall,
    handleIncomingVideoCall,
    acceptVideoCall,
    rejectVideoCall,
    endVideoCall,
    toggleVideoMute,
    toggleVideo,
    switchCamera,
    toggleVideoCallMinimize
  }
})
