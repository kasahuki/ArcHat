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
   * @param {Object} userInfo - 用户信息对象
   */
  init(websocket, userInfo) {
    console.log('WebRTC管理器初始化:', { websocket: !!websocket, userInfo: !!userInfo })
    this.websocket = websocket
    this.userInfo = userInfo
    
    // 验证参数是否有效
    if (!websocket || !userInfo || !userInfo.uid) {
      console.error('WebRTC初始化失败: websocket或userInfo无效', { websocket: !!websocket, userInfo: !!userInfo, uid: userInfo?.uid })
      return false
    }
    
    console.log('WebRTC管理器初始化成功')
    this.setupWebSocketListeners()
    return true
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
      userInfo: !!this.userInfo
    });
    
    try {
      this.isInitiator = true
      this.remoteUserId = targetUserId
      this.callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` + targetUserId
      
      console.log('发起通话，通话ID:', this.callId)
      
      // 更新通话状态
      this.updateCallStatus('calling')
      
      // 发送通话邀请信令（不立即创建 PeerConnection）
      this.sendSignal({
        type: 'call-invite',
        callId: this.callId,
        targetUserId: targetUserId,
        callerInfo: {
          id: this.userInfo?.uid || 'unknown',
          name: this.userInfo?.username || 'Unknown User',
          avatar: this.userInfo?.avatar || ''
        }
      })
      
      console.log('通话邀请已发送，等待对方响应')
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
    console.log('接受通话:', callId)
    
    try {
      this.callId = callId
      this.isInitiator = false
      
      // 获取本地音频流
      await this.getLocalStream()
      console.log('本地音频流获取成功')
      
      // 创建 PeerConnection
      this.createPeerConnection()
      console.log('PeerConnection 创建成功')
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      console.log('本地流已添加到 PeerConnection')
      
      // 更新通话状态为等待 offer
      this.updateCallStatus('connecting')
      
      // 发送接受通话信令
      this.sendSignal({
        type: 'call-accept',
        callId: this.callId,
        targetUserId: this.remoteUserId
      })
      
      console.log('接受通话信令已发送，等待 offer')
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
    console.log(`收到信令消息: ${data.type}`, data)
    console.log(`当前状态: callStatus=${this.callStatus}, peerConnection=${!!this.peerConnection}, isInitiator=${this.isInitiator}`)
    
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
        case 'offer':
          await this.handleOffer(data)
          break
        case 'answer':
          await this.handleAnswer(data)
          break
        case 'ice-candidate':
          await this.handleIceCandidate(data)
          break
        default:
          console.warn('未知的信令消息类型:', data.type)
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
    console.log('收到通话邀请:', data)
    this.callId = data.callId
    this.remoteUserId = data.callerInfo.id
    this.updateCallStatus('ringing')
    
    // 通过事件总线发送通话邀请事件，让UI组件处理
    emitter.emit('incoming-call', {
      callId: data.callId,
      callerInfo: data.callerInfo,
      callType: 'voice'
    })
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
  console.log(`收到信令消息: ${data.type}`, data)
  console.log(`当前状态: callStatus=${this.callStatus}, peerConnection=${!!this.peerConnection}, isInitiator=${this.isInitiator}`)
  
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
      case 'offer':
        await this.handleOffer(data)
        break
      case 'answer':
        await this.handleAnswer(data)
        break
      case 'ice-candidate':
        await this.handleIceCandidate(data)
        break
      default:
        console.warn('未知的信令消息类型:', data.type)
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
  console.log('收到通话邀请:', data)
  this.callId = data.callId
  this.remoteUserId = data.callerInfo.id
  this.updateCallStatus('ringing')
  
  // 通过事件总线发送通话邀请事件，让UI组件处理
  emitter.emit('incoming-call', {
    callId: data.callId,
    callerInfo: data.callerInfo,
    callType: 'voice'
  })
}

/**
 * 处理通话接受
 */
async handleCallAccept(data) {
  if (!this.isInitiator) {
    console.warn('非发起方收到 call-accept，忽略')
    return
  }
  
  console.log('对方接受了通话，开始建立连接')
  
  try {
    // 更新通话状态
    this.updateCallStatus('connected')
    
    // 确保有本地音频流
    if (!this.localStream) {
      console.log('获取本地音频流...')
      await this.getLocalStream()
    }
    
    // 确保有 PeerConnection
    if (!this.peerConnection) {
      console.log('创建 PeerConnection...')
      this.createPeerConnection()
    }
    
    // 添加本地流到 PeerConnection
    if (this.localStream && this.peerConnection) {
      console.log('添加本地流到 PeerConnection')
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }
    
    // 创建并发送 offer
    console.log('创建 Offer...')
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    })
    
    console.log('设置本地描述...')
    await this.peerConnection.setLocalDescription(offer)
    
    console.log('发送 Offer 到对方')
    this.sendSignal({
      type: 'offer',
      callId: this.callId,
      targetUserId: this.remoteUserId,
      offer: offer
    })
    
    console.log('Offer 已发送，等待 Answer')
  } catch (error) {
    console.error('handleCallAccept 失败:', error)
    this.handleError('通话接受处理失败: ' + error.message)
  }
}

/**
 * 处理接收到的 Offer
 */
async handleOffer(data) {
  if (!this.peerConnection) {
    console.error('handleOffer: PeerConnection 为 null')
    return
  }
  
  console.log('处理 Offer:', data.offer)
  console.log('PeerConnection 状态:', this.peerConnection.signalingState)
  
  try {
    // 检查 PeerConnection 状态
    if (this.peerConnection.signalingState !== 'stable' && this.peerConnection.signalingState !== 'have-local-offer') {
      console.warn(`PeerConnection 状态不正确: ${this.peerConnection.signalingState}，重新创建连接`)
      // 重新创建 PeerConnection
      this.createPeerConnection()
      
      // 重新添加本地流
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream)
        })
      }
    }
   */
  async handleOffer(data) {
    if (!this.peerConnection) {
      console.error('handleOffer: PeerConnection 为 null')
      return
    }
    
    console.log('处理 Offer:', data.offer)
    console.log('PeerConnection 状态:', this.peerConnection.signalingState)
    
    try {
      // 检查 PeerConnection 状态
      if (this.peerConnection.signalingState !== 'stable' && this.peerConnection.signalingState !== 'have-local-offer') {
        console.warn(`PeerConnection 状态不正确: ${this.peerConnection.signalingState}，重新创建连接`)
        // 重新创建 PeerConnection
        this.createPeerConnection()
        
        // 重新添加本地流
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream)
          })
        }
      }
      
      // 设置远程描述
      await this.peerConnection.setRemoteDescription(data.offer)
      console.log('远程描述设置成功')
      
      // 创建答复
      const answer = await this.peerConnection.createAnswer()
      console.log('答复创建成功')
      
      await this.peerConnection.setLocalDescription(answer)
      console.log('本地描述设置成功')
      
      // 发送答复
      this.sendSignal({
        type: 'answer',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        answer: answer
      })
      
      console.log('Answer 已发送')
    } catch (error) {
      console.error('handleOffer 失败:', error)
      // 不要因为 offer 处理失败就终止通话，可能是状态问题
      console.warn('Offer 处理失败，但不终止通话:', error.message)
    }
  }

  /**
   * 处理answer
   */
  async handleAnswer(data) {
    if (!this.peerConnection) {
      console.error('handleAnswer: PeerConnection 为 null')
      return
    }
    
    try {
      await this.peerConnection.setRemoteDescription(data.answer)
      console.log('Answer 处理成功')
    } catch (error) {
      console.error('handleAnswer 失败:', error)
      this.handleError('Answer 处理失败: ' + error.message)
    }
  }

  /**
   * 处理ICE候选
   */
  async handleIceCandidate(data) {
    if (!this.peerConnection) {
      console.error('handleIceCandidate: PeerConnection 为 null')
      return
    }
    
    try {
      await this.peerConnection.addIceCandidate(data.candidate)
      console.log('ICE candidate 添加成功')
    } catch (error) {
      console.error('handleIceCandidate 失败:', error)
      // ICE candidate 失败不应该终止通话，只记录错误
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
  sendSignal(message) {
    if (this.websocket && this.websocket.send) {
      this.websocket.send(JSON.stringify({
        type: 6, // WebRTC信令消息类型
        data: message
      }))
    }
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
