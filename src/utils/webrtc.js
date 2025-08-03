/**
 * WebRTC 语音通话管理器
 * 基于现有的WebSocket连接实现信令交换
 */
import { useUserInfoStore } from "@/stores/user"
import emitter from "@/utils/eventBus"
class WebRTCManager {
  constructor() {
    // === 媒体流相关 ===
    this.localStream = null      // 本地音频流（你的麦克风）
    this.remoteStream = null     // 远程音频流（对方的声音）
    this.peerConnection = null   // WebRTC连接对象
    
    // === 通话状态相关 ===
    this.isInitiator = false     // 是否是发起方
    this.callId = null           // 通话ID（唯一标识）
    this.remoteUserId = null     // 对方用户ID
    this.callStatus = 'idle'     // 通话状态
    this.isMuted = false         // 是否静音
    
    // === 回调函数 ===
    this.onCallStatusChange = null  // 状态变化时通知其他组件
    this.onRemoteStream = null      // 收到对方声音时通知其他组件
    this.onError = null             // 出错时通知其他组件
    this.onIncomingCall = null      // 收到来电邀请时触发
    
    // === WebRTC配置 ===
    this.pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  }

  /**
   * 初始化WebRTC管理器
   * @param {Object} websocket - WebSocket连接实例
   * @param {Object} userStore - 用户信息store
   */
  init(websocket, userStore) {
    console.log('WebRTC管理器初始化:', { websocket: !!websocket, userStore: !!userStore, userInfo: !!userStore?.userInfo })
    this.websocket = websocket
    this.userStore = userStore
    
    // 验证userStore是否有效
    if (!userStore || !userStore.userInfo) {
      console.error('WebRTC初始化失败: userStore或userInfo无效')
      return false
    }
    
    this.setupWebSocketListeners()
    return true
  }

  /**
   * 恢复通话连接（页面刷新后调用）
   * @param {Object} persistedState - 持久化的通话状态
   */
  async restoreCall(persistedState) {
    console.log('🔄 开始恢复通话连接:', persistedState)
    
    try {
      // 设置基本信息
      this.remoteUserId = persistedState.remoteUser?.id
      // 优先从localStorage的callId获取，其次从pendingCallId
      this.callId = persistedState.callId || persistedState.pendingCallId
      this.isMuted = persistedState.isMuted || false
      
      console.log('🔍 恢复通话ID信息:', {
        persistedCallId: persistedState.callId,
        persistedPendingCallId: persistedState.pendingCallId,
        finalCallId: this.callId,
        remoteUserId: this.remoteUserId
      })
      
      // 获取本地音频流
      await this.getLocalStream()
      console.log('✅ 本地音频流恢复成功')
      
      // 创建新的PeerConnection
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 发送恢复连接信令
      const restoreSignal = {
        type: 'call-restore',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        currentUserId: this.userStore?.userInfo?.uid, // 直接在顶层添加
        restoreInfo: {
          userId: this.userStore?.userInfo?.uid,
          timestamp: Date.now(),
          isMuted: this.isMuted
        }
      }
      
      console.log('📤 发送恢复信令详情:', restoreSignal)
      this.sendSignal(restoreSignal)
      
      // 更新状态
      this.updateCallStatus('connecting')
      console.log('✅ 通话恢复信令已发送，等待对方响应')
      
      return true
    } catch (error) {
      console.error('❌ 恢复通话连接失败:', error)
      this.handleError('恢复通话连接失败: ' + error.message)
      return false
    }
  }

  /**
   * 设置WebSocket监听器处理信令消息
   * 使用事件总线监听WebRTC信令消息（type: 6）
   */
  setupWebSocketListeners() {
    // 通过事件总线监听WebRTC信令消息
    emitter.on('webrtc-signal', this.handleSignalMessage.bind(this))
    console.log('WebRTC管理器已设置事件监听器')
  }

  /**
   * 发起语音通话
   * @param {string} targetUserId - 目标用户ID
   * @param {Object} targetUserInfo - 目标用户信息
   */
  async startCall(targetUserId, targetUserInfo) {
    console.log('WebRTC Manager startCall 被调用，参数:', { targetUserId, targetUserInfo });
    console.log('WebRTC Manager 初始化状态:', {
      websocket: !!this.websocket,
      userStore: !!this.userStore,
      userInfo: !!this.userStore?.userInfo
    });
    
    try {
      this.isInitiator = true
      this.remoteUserId = targetUserId
      this.callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` + targetUserId
      console.log('生成的 callId:', this.callId);
      
      // 获取本地音频流
      await this.getLocalStream()
      
      // 创建PeerConnection 创建WebRTC连接
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 更新通话状态
      this.updateCallStatus('calling')
      
      // 发送通话邀请信令
      this.sendSignal({
        type: 'call-invite',
        callId: this.callId,
        targetUserId: targetUserId,
        callerInfo: {
          id: this.userStore?.userInfo?.uid || 'unknown',
          name: this.userStore?.userInfo?.username || 'Unknown User',
          avatar: this.userStore?.userInfo?.avatar || ''
        }
      })
      return true
    } catch (error) {
      console.error('发起通话失败:', error)
      this.handleError('发起通话失败: ' + error.message)
      return false
    }
  }

  /**
   * 接受通话
   * @param {string} callId - 通话ID
   */
  async acceptCall(callId) {
    try {
      this.callId = callId
      this.isInitiator = false
      
      // 获取本地音频流
      await this.getLocalStream()
      
      // 创建PeerConnection
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 更新通话状态
      this.updateCallStatus('connected')
      
      // 发送接受通话信令
      this.sendSignal({
        type: 'call-accept',
        callId: this.callId,
        targetUserId: this.remoteUserId
      })
      
      return true
    } catch (error) {
      console.error('接受通话失败:', error)
      this.handleError('接受通话失败: ' + error.message)
      return false
    }
  }

  /**
   * 拒绝通话
   * @param {string} callId - 通话ID
   */
  rejectCall(callId) {
    this.sendSignal({
      type: 'call-reject',
      callId: callId,
      targetUserId: this.remoteUserId
    })
    this.endCall()
  }

  /**
   * 挂断通话
   */
  hangupCall() {
    if (this.callId) {
      this.sendSignal({
        type: 'call-hangup',
        callId: this.callId,
        targetUserId: this.remoteUserId
      })
    }
    this.endCall()
  }

  /**
   * 切换静音状态
   */
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.isMuted = !audioTrack.enabled
        return this.isMuted
      }
    }
    return false
  }

  /**
   * 获取本地音频流
   */
  async getLocalStream() {
    try {
      // 高级音频配置，增强回声消除和噪音抑制
      const audioConstraints = {
        echoCancellation: true,           // 回声消除
        noiseSuppression: true,           // 噪音抑制
        autoGainControl: true,            // 自动增益控制
        sampleRate: 48000,                // 高采样率
        sampleSize: 16,                   // 16位采样
        channelCount: 1,                  // 单声道，减少带宽
        latency: 0.01,                    // 低延迟
        volume: 0.8,                      // 限制音量防止过载
        // 高级噪音抑制设置
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,         // 高通滤波器
        googTypingNoiseDetection: true,   // 键盘噪音检测
        googAudioMirroring: false         // 禁用音频镜像
      }
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false
      })
      return this.localStream
    } catch (error) {
      console.error('获取本地音频流失败:', error)
      throw new Error('无法访问麦克风，请检查权限设置')
    }
  }

  /**
   * 创建PeerConnection 创建WebRTC连接
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.pcConfig)
    
    // 监听ICE候选 触发时机：
    //  调用createOffer()或createAnswer()后
    //  WebRTC开始自动扫描本地网络环境
    //  每发现一个可用的网络路径，就触发一次这个事件
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          callId: this.callId,
          targetUserId: this.remoteUserId,
          candidate: event.candidate
        })
      }
    }
    
    // 监听远程流
    this.peerConnection.ontrack = (event) => {
      console.log('收到远程音频流')
      this.remoteStream = event.streams[0]
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream)
      }
      this.playRemoteStream()
    }
    
    // 监听连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      console.log('PeerConnection状态:', this.peerConnection.connectionState)
      if (this.peerConnection.connectionState === 'connected') {
        this.updateCallStatus('connected')
      } else if (this.peerConnection.connectionState === 'disconnected' || 
                 this.peerConnection.connectionState === 'failed') {
        this.endCall()
      }
    }
  }

  /**
   * 播放远程音频流
   */
  playRemoteStream() {
    if (this.remoteStream) {
      // 清理之前的音频元素，防止多个播放器同时工作
      const existingAudio = document.querySelector('#webrtc-remote-audio')
      if (existingAudio) {
        existingAudio.remove()
      }
      
      const audioElement = document.createElement('audio')
      audioElement.id = 'webrtc-remote-audio'
      audioElement.srcObject = this.remoteStream
      audioElement.autoplay = true
      audioElement.style.display = 'none'
      
      // 优化音频播放设置
      audioElement.volume = 0.8              // 限制音量防止回声
      audioElement.muted = false             // 确保不静音
      audioElement.controls = false          // 隐藏控制按钮
      audioElement.preload = 'auto'          // 预加载
      
      // 防止回声的关键设置
      audioElement.setAttribute('playsinline', 'true')  // 移动设备内联播放
      
      // 监听音频事件
      audioElement.onloadedmetadata = () => {
        console.log('远程音频流元数据加载完成')
      }
      
      audioElement.onplay = () => {
        console.log('远程音频开始播放')
      }
      
      audioElement.onerror = (error) => {
        console.error('远程音频播放错误:', error)
      }
      
      document.body.appendChild(audioElement)
      
      // 存储引用以便后续清理
      this.remoteAudioElement = audioElement
    }
  }

  /**
   * 处理后端发送过来的信令消息
   */
  async handleSignalMessage(data) {
    try {
      
      switch (data.type) {
        case 'call-invite':
          await this.handleCallInvite(data)
          break
        case 'call-accept':
          await this.handleCallAccept(data)
          break
        case 'call-reject':
          this.handleCallReject(data)
          break
        case 'call-hangup':
          this.handleCallHangup(data)
          break
        case 'call-restore':
          await this.handleCallRestore(data)
          break
        case 'call-restore-response':
          this.handleCallRestoreResponse(data)
          break
        case 'offer':
          await this.handleOffer(data)
          break
        case 'answer':
          await this.handleAnswer(data)
          break
        case 'ice-candidate':
          await this.handleIceCandidate(data)
          break
      }
    } catch (error) {
      console.error('处理信令消息失败:', error)
      this.handleError('信令处理失败: ' + error.message)
    }
  }

  /**
   * 处理通话邀请
   */
  async handleCallInvite(data) {
    this.callId = data.callId
    this.remoteUserId = data.callerInfo.id
    this.updateCallStatus('ringing')
    
    // 通过回调函数将来电信息传递给上层（call store）
    if (this.onIncomingCall) {
      this.onIncomingCall(data.callerInfo, data.callId)
    } else {
      console.error('onIncomingCall callback is not defined. Auto-rejecting call.')
      this.rejectCall(data.callId, 'error')
    }
  }

  /**
   * 处理通话接受
   */
  async handleCallAccept(data) {
    this.updateCallStatus('connected')
    
    // 创建并发送offer
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    
    this.sendSignal({
      type: 'offer',
      callId: this.callId,
      targetUserId: this.remoteUserId,
      offer: offer
    })
  }

  /**
   * 处理通话拒绝
   */
  handleCallReject(data) {
    console.log('通话被拒绝 - 详细信息:', {
      callId: data.callId,
      fromUserId: data.targetUserId || data.fromUserId,
      currentCallId: this.callId,
      currentRemoteUserId: this.remoteUserId,
      currentUserId: this.userStore?.uid,
      reason: data.reason || 'unknown'
    })
    
    // 检查是否是当前通话的拒绝
    if (data.callId === this.callId) {
      this.updateCallStatus('rejected')
      this.endCall()
    } else {
      console.warn('收到不匹配的拒绝信令，忽略')
    }
  }

  /**
   * 处理通话挂断
   */
  handleCallHangup(data) {
    console.log('对方挂断通话:', data)
    this.updateCallStatus('ended')
    this.endCall()
  }

  /**
   * 处理通话恢复请求（对方发起的恢复）- 使用ICE重启策略
   */
  async handleCallRestore(data) {
    console.log('🔄 收到通话恢复请求:', data)
    
    // 检查当前状态是否适合恢复
    console.log('🔍 当前状态检查:', {
      currentCallStatus: this.callStatus,
      currentCallId: this.callId,
      currentRemoteUserId: this.remoteUserId,
      hasLocalStream: !!this.localStream,
      hasPeerConnection: !!this.peerConnection,
      connectionState: this.peerConnection?.connectionState
    })
    
    try {
      // 设置基本信息
      this.remoteUserId = data.restoreInfo?.userId || data.currentUserId || this.remoteUserId
      this.callId = data.callId
      this.isInitiator = false
      
      console.log('🔧 设置恢复信息:', {
        dataRestoreUserId: data.restoreInfo?.userId,
        currentUserId: data.currentUserId,
        finalRemoteUserId: this.remoteUserId,
        callId: this.callId,
        isInitiator: this.isInitiator
      })
      
      // 🏆 专业方案：使用ICE重启而不是重新创建连接
      const hasExistingConnection = this.peerConnection && 
        (this.peerConnection.connectionState === 'connected' || 
         this.peerConnection.connectionState === 'connecting')
      
      if (hasExistingConnection && this.localStream) {
        console.log('🚀 使用ICE重启策略恢复连接（专业方案）')
        await this.performIceRestart()
      } else {
        console.log('🔄 重新建立完整连接')
        await this.establishFreshConnection()
      }
      
      // 发送恢复响应
      const restoreResponse = {
        type: 'call-restore-response',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        success: true,
        restoreInfo: {
          userId: this.userStore?.userInfo?.uid,
          timestamp: Date.now()
        }
      }
      
      console.log('📤 发送恢复响应详情:', restoreResponse)
      this.sendSignal(restoreResponse)
      
      // 更新状态
      this.updateCallStatus('connecting')
      console.log('✅ 通话恢复响应已发送')
      
    } catch (error) {
      console.error('❌ 处理通话恢复请求失败:', error)
      
      // 发送失败响应
      this.sendSignal({
        type: 'call-restore-response',
        callId: data.callId,
        targetUserId: data.restoreInfo?.userId,
        success: false,
        error: error.message
      })
    }
  }

  /**
   * 处理通话恢复响应
   */
  async handleCallRestoreResponse(data) {
    console.log('🔄 收到通话恢复响应:', data)
    console.log('🔍 响应数据详情:', {
      hasSuccess: 'success' in data,
      successValue: data.success,
      dataKeys: Object.keys(data),
      fullData: data
    })
    
    // 检查success字段，如果不存在或为undefined，默认为true（因为能收到响应就说明对方同意）
    // 修复逻辑：只有明确的false才认为失败，其他情况都认为成功
    const isSuccess = data.success !== false
    
    console.log('🔍 恢复成功判断:', {
      originalSuccess: data.success,
      finalSuccess: isSuccess,
      willProceed: isSuccess
    })
    
    if (isSuccess) {
      console.log('✅ 对方同意恢复通话，准备重新建立连接')
      this.updateCallStatus('connecting')
      
      // 🏆 专业方案：使用ICE重启策略恢复连接
      if (this.isInitiator) {
        console.log('🚀 作为发起方，使用ICE重启策略重新建立连接')
        
        // 检查是否有现有连接可以重启
        if (this.peerConnection && this.localStream) {
          console.log('🔄 使用ICE重启恢复现有连接')
          await this.performIceRestart()
        } else {
          console.log('🔄 建立全新WebRTC连接')
          await this.establishFreshConnection()
          this.startWebRTCHandshake()
        }
      } else {
        console.log('🔄 作为接收方，等待对方重新发起连接')
        // 接收方等待对方的ICE重启offer
      }
    } else {
      console.error('❌ 对方拒绝恢复通话:', data.error)
      this.handleError('通话恢复被拒绝: ' + (data.error || '未知原因'))
    }
  }

  /**
   * 🚀 ICE重启策略 - 专业WebRTC应用的标准做法
   */
  async performIceRestart() {
    try {
      console.log('🔄 开始ICE重启流程...')
      
      // 1. 设置ICE重启标志
      const offerOptions = {
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      }
      
      // 2. 创建新的offer（带ICE重启）
      console.log('📤 创建ICE重启offer')
      const offer = await this.peerConnection.createOffer(offerOptions)
      await this.peerConnection.setLocalDescription(offer)
      
      // 3. 发送ICE重启offer
      this.sendSignal({
        type: 'offer',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        offer: offer,
        iceRestart: true  // 标记这是ICE重启
      })
      
      console.log('✅ ICE重启offer已发送')
      
    } catch (error) {
      console.error('❌ ICE重启失败:', error)
      // 如果ICE重启失败，回退到完整重建
      await this.establishFreshConnection()
    }
  }
  
  /**
   * 🔄 建立全新连接 - 当ICE重启不可用时的回退方案
   */
  async establishFreshConnection() {
    try {
      console.log('🔄 建立全新WebRTC连接...')
      
      // 1. 获取本地音频流
      await this.getLocalStream()
      
      // 2. 创建新的PeerConnection
      this.createPeerConnection()
      
      // 3. 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      console.log('✅ 全新连接已建立')
      
    } catch (error) {
      console.error('❌ 建立全新连接失败:', error)
      throw error
    }
  }

  /**
   * 开始WebRTC握手流程
   */
  async startWebRTCHandshake() {
    try {
      if (this.isInitiator) {
        // 发起方创建offer
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        
        this.sendSignal({
          type: 'offer',
          callId: this.callId,
          targetUserId: this.remoteUserId,
          offer: offer
        })
        
        console.log('✅ Offer已发送')
      }
      // 接收方等待offer，然后在handleOffer中创建answer
    } catch (error) {
      console.error('❌ WebRTC握手失败:', error)
      this.handleError('WebRTC握手失败: ' + error.message)
    }
  }

  /**
   * 处理offer
   */
  async handleOffer(data) {
    if (!this.peerConnection) {
      console.error('❌ PeerConnection不存在，无法处理offer')
      return
    }
    
    await this.peerConnection.setRemoteDescription(data.offer)
    
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    
    this.sendSignal({
      type: 'answer',
      callId: this.callId,
      targetUserId: this.remoteUserId,
      answer: answer
    })
    
    console.log('✅ Answer已发送')
  }

  /**
   * 处理answer
   */
  async handleAnswer(data) {
    if (!this.peerConnection) {
      console.error('❌ PeerConnection不存在，无法处理answer')
      return
    }
    
    await this.peerConnection.setRemoteDescription(data.answer)
    console.log('✅ Answer已处理，WebRTC连接建立中...')
    
    // WebRTC握手完成，更新状态为已连接
    this.updateCallStatus('connected')
  }

  /**
   * 处理ICE候选
   */
  async handleIceCandidate(data) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(data.candidate)
    }
  }

  /**
   * 处理通话拒绝
   */
  handleCallReject(data) {
    this.updateCallStatus('ended')
    this.endCall()
  }

  /**
   * 处理通话挂断
   */
  handleCallHangup(data) {
    this.endCall()
  }

  /**
   * 发送信令消息
   */
  sendSignal(data) {
    if (!this.websocket) {
      console.error('WebSocket实例不存在，无法发送信令')
      return false
    }
    
    const message = {
      type: 6, // WebRTC信令消息类型
      data: data
    }
    
    console.log('发送WebRTC信令:', {
      messageType: message.type,
      signalType: data.type,
      callId: data.callId,
      targetUserId: data.targetUserId,
      currentUserId: this.userStore?.userInfo?.uid,
      websocketType: this.websocket?.constructor?.name
    })
    
    // 使用ChatWebSocket的send方法，它会自动处理连接状态检查
    this.websocket.send(message)
    return true
  }

  /**
   * 更新通话状态
   */
  updateCallStatus(status) {
    this.callStatus = status
    if (this.onCallStatusChange) {
      this.onCallStatusChange(status)
    }
  }

  /**
   * 结束通话
   */
  endCall() {
    // 停止本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    // 关闭PeerConnection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    // 清理远程流
    this.remoteStream = null
    
    // 清理远程音频元素，防止回声
    if (this.remoteAudioElement) {
      this.remoteAudioElement.pause()
      this.remoteAudioElement.srcObject = null
      this.remoteAudioElement.remove()
      this.remoteAudioElement = null
    }
    
    // 清理所有WebRTC相关的音频元素
    const allWebRTCAudio = document.querySelectorAll('#webrtc-remote-audio')
    allWebRTCAudio.forEach(audio => {
      audio.pause()
      audio.srcObject = null
      audio.remove()
    })
    
    // 重置状态
    this.callId = null
    this.remoteUserId = null
    this.isInitiator = false
    this.isMuted = false
    this.updateCallStatus('ended')
    
    console.log('通话结束，所有资源已清理')
  }

  /**
   * 处理错误
   */
  handleError(message) {
    console.error('WebRTC错误:', message)
    if (this.onError) {
      this.onError(message)
    }
    this.endCall()
  }

  /**
   * 清理资源
   */
  destroy() {
    this.endCall()
    // 移除事件总线监听器
    emitter.off('webrtc-signal', this.handleSignalMessage)
    console.log('WebRTC管理器已清理事件监听器')
  }
}

// 创建全局实例
export const webrtcManager = new WebRTCManager()
export default WebRTCManager
