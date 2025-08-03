import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { webrtcManager } from '@/utils/webrtc.js'

export const useCallStore = defineStore('call', () => {
  // 记录通话的各种状态
  const isCallActive = ref(false) // 通话是否激活
  const callStatus = ref('idle')  // 通话状态：idle(空闲), calling(拨打中), ringing(响铃), connected(已连接), ended(已结束)
  const callDuration = ref(0) // 通话时长（计算值）
  const callStartTime = ref(null) // 🏆 服务端权威通话开始时间戳
  const isMuted = ref(false) // 是否静音
  const isMinimized = ref(false) // 是否最小化
  
  // 状态管理调试标志
  const DEBUG_CALL_STATE = true
  
  // 通话对象信息
  const remoteUser = ref({
    id: '',
    name: '',
    avatar: ''
  })
  
  // 来电通知相关状态
  const showIncomingCallNotification = ref(false)
  const incomingCallInfo = ref(null)
  const pendingCallId = ref(null)
  
  // 通话计时器
  let callTimer = null
  
  // 计算属性 - 更严格的通话状态判断
  const isInCall = computed(() => {
    const inCallStates = ['calling', 'ringing', 'connected']
    const result = inCallStates.includes(callStatus.value)
    if (DEBUG_CALL_STATE) {
      console.log('🔍 isInCall计算:', { callStatus: callStatus.value, result, inCallStates })
    }
    return result
  })
  
  // 强制重置所有状态到初始值
  // 从 localStorage 恢复通话状态
  const restoreCallFromStorage = () => {
    const savedCall = localStorage.getItem('activeCallInfo');
    if (savedCall) {
      try {
        const callInfo = JSON.parse(savedCall);
        if (callInfo && callInfo.status === 'connected') {
          console.log('🔄 从localStorage恢复通话状态:', callInfo);
          remoteUser.value = callInfo.remoteUser;
          callStatus.value = 'connected';
          isCallActive.value = true;
          pendingCallId.value = callInfo.callId;
          // 可以在这里决定是否要恢复计时器，或者等重连接成功后再开始
        }
      } catch (error) {
        console.error('解析localStorage中的通话信息失败:', error);
        localStorage.removeItem('activeCallInfo');
      }
    }
  };

  // 强制重置所有状态到初始值
  const forceResetState = (reason = '未知原因') => {
    if (DEBUG_CALL_STATE) {
      console.log('🔄 强制重置通话状态 - 原因:', reason, '重置前状态:', {
        isCallActive: isCallActive.value,
        callStatus: callStatus.value,
        callDuration: callDuration.value,
        isMuted: isMuted.value,
        isMinimized: isMinimized.value,
        showIncomingCallNotification: showIncomingCallNotification.value
      })
    }
    
    // 重置所有状态到初始值
    isCallActive.value = false
    callStatus.value = 'idle'
    callDuration.value = 0
    callStartTime.value = null // 清除服务端时间戳
    isMuted.value = false
    isMinimized.value = false
    
    // 清理来电通知状态
    showIncomingCallNotification.value = false
    incomingCallInfo.value = null
    pendingCallId.value = null
    
    // 重置远程用户信息
    remoteUser.value = {
      id: '',
      name: '',
      avatar: ''
    }
    
    // 停止计时器
    stopCallTimer()
    
    // 清除localStorage
    localStorage.removeItem('activeCallInfo');
    
    if (DEBUG_CALL_STATE) {
      console.log('✅ 状态重置完成，当前状态:', {
        isCallActive: isCallActive.value,
        callStatus: callStatus.value,
        isInCall: isInCall.value
      })
    }
  }
  /**
   * 🏆 专业级服务端时间戳同步计时器
   * @param {number} serverStartTime - 服务端权威开始时间戳（毫秒）
   */
  const startCallTimer = (serverStartTime = null) => {
    if (callTimer) {
      clearInterval(callTimer)
    }
    
    if (serverStartTime) {
      // 🚀 使用服务端权威时间戳
      callStartTime.value = serverStartTime
      console.log('🏆 使用服务端权威时间戳:', new Date(serverStartTime).toLocaleTimeString())
    } else if (!callStartTime.value) {
      // 新通话：使用当前时间作为开始时间
      callStartTime.value = Date.now()
      console.log('🔄 开始新通话，记录开始时间:', new Date(callStartTime.value).toLocaleTimeString())
    }
    
    // 基于服务端时间戳计算当前时长
    const updateDuration = () => {
      if (callStartTime.value) {
        const elapsed = Math.floor((Date.now() - callStartTime.value) / 1000)
        callDuration.value = Math.max(0, elapsed)
      }
    }
    
    // 立即更新一次
    updateDuration()
    
    // 每秒更新时长（基于服务端时间戳计算）
    callTimer = setInterval(updateDuration, 1000)
    
    console.log('⏰ 服务端时间戳同步计时器已启动，当前时长:', callDuration.value, '秒')
  }
  
  /**
   * 停止通话计时
   */
  const stopCallTimer = () => {
    if (callTimer) {
      clearInterval(callTimer)
      callTimer = null
    }
  }
  

  
  /**
   * 发起语音通话
   * @param {Object} targetUser - 目标用户信息
   */
  const startVoiceCall = async (targetUser) => {
    console.log('=== CALL STORE startVoiceCall 开始执行 ===');

    
    // 检查webrtcManager是否初始化
    if (!webrtcManager) {
      console.error('webrtcManager 为 null 或 undefined!');
      return false;
    }
    
    // 检查WebRTC管理器是否正确初始化，如果没有则尝试初始化
    if (!webrtcManager.websocket || !webrtcManager.userStore) {
      console.log('WebRTC管理器未初始化，尝试重新初始化...');
      
      // 获取用户store和websocket
      const { useUserInfoStore } = await import('@/stores/user');
      const userInfoStore = useUserInfoStore();
      
      console.log('用户信息检查:', {
        hasUserInfo: !!userInfoStore.userInfo,
        hasToken: !!userInfoStore.userInfo?.token,
        hasWebsocket: !!userInfoStore.chatWS,
        currentUserId: userInfoStore.userInfo?.uid,
        currentUserName: userInfoStore.userInfo?.username,
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        websocketReadyState: userInfoStore.chatWS?.readyState
      });
      
      if (userInfoStore.chatWS && userInfoStore.userInfo) {
        console.log('开始初始化WebRTC管理器...');
        const success = webrtcManager.init(userInfoStore.chatWS, userInfoStore.userInfo);
        console.log('WebRTC管理器初始化结果:', success);
        
        if (!success) {
          console.error('WebRTC管理器初始化失败');
          return false;
        }
      } else {
        console.error('无法初始化WebRTC管理器: WebSocket或用户信息不可用');
        return false;
      }
    }
    
    try {
      remoteUser.value = targetUser
      isCallActive.value = true
      callStatus.value = 'calling'
      
      console.log('准备调用 webrtcManager.startCall，参数:', targetUser.id, targetUser)
      const success = await webrtcManager.startCall(targetUser.id, targetUser)
      console.log('webrtcManager.startCall 返回结果:', success)
      if (!success) {
        endCall()
        return false
      }
      
      return true
    } catch (error) {
      console.error('发起语音通话失败:', error)
      endCall()
      return false
    }
  }
  
  /**
   * 接受通话
   */
  const acceptCall = async () => {
    if (!pendingCallId.value) {
      console.error('无法接听：缺少通话ID')
      return false
    }
    
    try {
      const success = await webrtcManager.acceptCall(pendingCallId.value)
      if (success) {
        // 设置远程用户信息
        remoteUser.value = incomingCallInfo.value
        isCallActive.value = true
        callStatus.value = 'connected'
        startCallTimer()
        
        // 隐藏来电通知
        showIncomingCallNotification.value = false
        incomingCallInfo.value = null
        pendingCallId.value = null
      }
      return success
    } catch (error) {
      console.error('接受通话失败:', error)
      endCall()
      return false
    }
  }
  
  /**
   * 拒绝通话
   */
  const rejectCall = () => {
    if (DEBUG_CALL_STATE) {
      console.log('🙅 拒绝通话:', { pendingCallId: pendingCallId.value, callStatus: callStatus.value })
    }
    
    if (pendingCallId.value) {
      webrtcManager.rejectCall(pendingCallId.value, 'declined')
    }
    
    // 强制重置所有状态
    forceResetState('拒绝通话')
  }
  
  /**
   * 挂断通话
   */
  const hangupCall = () => {
    if (DEBUG_CALL_STATE) {
      console.log('📞 挂断通话:', { callStatus: callStatus.value })
    }
    
    webrtcManager.hangupCall()
    forceResetState('挂断通话')
  }
  
  /**
   * 切换静音状态
   */
  const toggleMute = () => {
    const muted = webrtcManager.toggleMute()
    isMuted.value = muted
    return muted
  }
  
  /**
   * 最小化通话界面
   */
  const minimizeCall = () => {
    isMinimized.value = true
  }
  
  /**
   * 恢复通话界面
   */
  const restoreCall = () => {
    isMinimized.value = false
  }
  
  /**
   * 结束通话（为了兼容性保留，但内部调用 forceResetState）
   */
  const endCall = () => {
    if (DEBUG_CALL_STATE) {
      console.log('🔚 结束通话:', { callStatus: callStatus.value })
    }
    forceResetState('结束通话')
  }
  
  /**
   * 处理来电
   * @param {Object} callerInfo - 来电者信息
   * @param {string} callId - 通话ID
   */
  const handleIncomingCall = (callerInfo, callId) => {
    if (DEBUG_CALL_STATE) {
      console.log('📞 === HANDLE INCOMING CALL ===', {
        callerInfo,
        callId,
        currentCallStatus: callStatus.value,
        isInCall: isInCall.value,
        isCallActive: isCallActive.value
      })
    }
    
    // 检查是否已在通话中（但不包括 idle 和 ended 状态）
    const busyStates = ['calling', 'connected'] // 只有这些状态才算真正占线
    const isBusy = busyStates.includes(callStatus.value)
    
    if (isBusy) {
      if (DEBUG_CALL_STATE) {
        console.log('🚫 当前已在通话中，自动拒绝来电:', { 
          callStatus: callStatus.value, 
          isBusy,
          busyStates 
        })
      }
      webrtcManager.rejectCall(callId, 'busy')
      return
    }
    
    // 如果当前状态是 ringing，说明有异常，先重置状态
    if (callStatus.value === 'ringing') {
      if (DEBUG_CALL_STATE) {
        console.log('⚠️ 检测到异常的 ringing 状态，先重置')
      }
      forceResetState('清理异常的 ringing 状态')
    }
    
    // 设置来电信息
    incomingCallInfo.value = {
      id: callerInfo.id,
      name: callerInfo.name,
      avatar: callerInfo.avatar
    }
    pendingCallId.value = callId
    callStatus.value = 'ringing'
    
    // 显示自定义来电通知组件
    showIncomingCallNotification.value = true
  }
  
  /**
   * 更新通话状态
   * @param {string} status - 新状态
   */
  const updateCallStatus = (status) => {
    callStatus.value = status
    
    if (status === 'connected' && callTimer === null) {
      // 🏆 使用服务端时间戳同步计时器
      if (callStartTime.value) {
        console.log('🏆 恢复通话计时，服务端时间戳:', new Date(callStartTime.value).toLocaleTimeString())
        startCallTimer(callStartTime.value)
      } else {
        console.log('🔄 开始新通话计时')
        startCallTimer()
      }
    } else if (status === 'ended') {
      endCall()
    }
  }
  
  /**
   * 初始化通话管理器
   * @param {Object} websocket - WebSocket实例
   * @param {Object} userStore - 用户store
   * @returns {boolean} 初始化是否成功
   */
  const initCallManager = (websocket, userStore) => {
    if (DEBUG_CALL_STATE) {
      console.log('🚀 开始初始化通话管理器')
    }
    
    // 检查是否有持久化的通话状态需要保持
    const hasPersistedCall = isCallActive.value || callStatus.value === 'connected'
    
    if (DEBUG_CALL_STATE) {
      console.log('💾 检查持久化状态:', {
        hasPersistedCall,
        isCallActive: isCallActive.value,
        callStatus: callStatus.value,
        hasRemoteUser: !!remoteUser.value?.id
      })
    }
    
    // 只有在没有持久化通话状态时才重置
    if (!hasPersistedCall) {
      if (DEBUG_CALL_STATE) {
        console.log('🔄 没有持久化通话状态，执行初始化重置')
      }
      forceResetState('初始化通话管理器')
    } else {
      if (DEBUG_CALL_STATE) {
        console.log('✨ 检测到持久化通话状态，保持现有状态')
      }
    }
    
    // 初始化WebRTC管理器
    const success = webrtcManager.init(websocket, userStore)
    
    if (!success) {
      console.error('WebRTC管理器初始化失败')
      return false
    }
    
    // 设置回调函数
    webrtcManager.onCallStatusChange = updateCallStatus // 底层状态变化时的回调
    webrtcManager.onIncomingCall = handleIncomingCall   // 来电处理回调
    webrtcManager.onError = (error) => {
      console.error('通话错误:', error)
      endCall()
    }
    
    return true
  }
  
  /**
   * 恢复语音通话（页面刷新后调用）
   * 使用Pinia持久化数据自动恢复通话状态和音频流
   */
  const resumeCall = async () => {
    // 检查是否有持久化的通话状态需要恢复
    if ((callStatus.value === 'connected' || isCallActive.value) && remoteUser.value?.id) {
      if (DEBUG_CALL_STATE) {
        console.log('🔄 开始恢复持久化的通话状态...', {
          status: callStatus.value,
          isCallActive: isCallActive.value,
          remoteUser: remoteUser.value,
          callId: pendingCallId.value,
          isMuted: isMuted.value,
          isMinimized: isMinimized.value
        });
      }
      
      try {
        // 从localStorage获取完整的通话信息
        const storedCallInfo = localStorage.getItem('activeCallInfo')
        let callIdFromStorage = null
        if (storedCallInfo) {
          try {
            const parsed = JSON.parse(storedCallInfo)
            callIdFromStorage = parsed.callId
          } catch (e) {
            console.warn('⚠️ 解析localStorage通话信息失败:', e)
          }
        }
        
        // 构建持久化状态对象，优先使用localStorage中的callId
        const persistedState = {
          callStatus: callStatus.value,
          isCallActive: isCallActive.value,
          remoteUser: remoteUser.value,
          callId: callIdFromStorage, // 从localStorage获取的callId
          pendingCallId: pendingCallId.value, // 备用的callId
          isMuted: isMuted.value,
          isMinimized: isMinimized.value,
          callDuration: callDuration.value
        }
        
        if (DEBUG_CALL_STATE) {
          console.log('🔍 恢复通话时的ID信息:', {
            storedCallInfo: storedCallInfo ? JSON.parse(storedCallInfo) : null,
            callIdFromStorage,
            pendingCallId: pendingCallId.value,
            finalCallId: callIdFromStorage || pendingCallId.value
          })
        }
        
        // 调用WebRTC管理器恢复连接
        const success = await webrtcManager.restoreCall(persistedState);
        
        if (success) {
          // 🏆 专业方案：使用服务端权威时间戳恢复计时
          if (callStartTime.value) {
            console.log('🏆 使用服务端时间戳恢复计时:', new Date(callStartTime.value).toLocaleTimeString())
            startCallTimer(callStartTime.value)
          } else {
            console.log('⚠️ 未找到服务端时间戳，使用当前时间')
            startCallTimer()
          }
          
          // 确保通话激活状态正确
          isCallActive.value = true;
          
          // 更新状态为连接中，等待WebRTC握手完成
          callStatus.value = 'connecting';
          
          if (DEBUG_CALL_STATE) {
            console.log('✅ 通话状态恢复成功，音频流已重新建立');
          }
        } else {
          console.error('❌ 通话状态恢复失败');
          // 恢复失败，清理状态
          forceResetState('恢复失败');
        }
      } catch (error) {
        console.error('❌ 通话状态恢复异常:', error);
        forceResetState('恢复异常');
      }
    } else {
      if (DEBUG_CALL_STATE) {
        console.log('🤔 无需恢复语音通话，当前状态:', {
          callStatus: callStatus.value,
          isCallActive: isCallActive.value,
          hasRemoteUser: !!remoteUser.value?.id
        });
      }
    }
  };

  /**
   * 清理资源
   */
  const cleanup = () => {
    stopCallTimer()
    webrtcManager.destroy()
  }

  /**
   * 测试用函数 - 手动设置通话状态用于测试持久化
   */
  const setTestCallState = (testRemoteUser = null) => {
    if (DEBUG_CALL_STATE) {
      console.log('🧪 设置测试通话状态用于测试持久化');
    }
    
    // 设置测试状态
    isCallActive.value = true;
    callStatus.value = 'connected';
    callDuration.value = 120; // 2分钟
    isMuted.value = false;
    isMinimized.value = false;
    pendingCallId.value = 'test_call_' + Date.now();
    
    // 设置测试用户信息
    remoteUser.value = testRemoteUser || {
      id: '999',
      name: '测试用户',
      avatar: 'https://via.placeholder.com/40'
    };
    
    console.log('✅ 测试通话状态已设置，刷新页面测试持久化');
  }

  // 监听通话状态，用于持久化到localStorage
  watch([callStatus, remoteUser], ([newStatus, newUser], [oldStatus, oldUser]) => {
    if (newStatus === 'connected' && newUser?.id) {
      // 延迟获取callId，确保webrtcManager已经设置完成
      setTimeout(() => {
        const currentCallId = webrtcManager?.callId || pendingCallId.value
        const callInfo = {
          status: 'connected',
          remoteUser: newUser,
          callId: currentCallId,
          callType: 'voice'
        };
        
        if (DEBUG_CALL_STATE) {
          console.log('💾 准备持久化通话信息:', {
            webrtcCallId: webrtcManager?.callId,
            pendingCallId: pendingCallId.value,
            finalCallId: currentCallId,
            callInfo
          })
        }
        
        // 如果callId仍然为null，再次尝试获取
        if (!currentCallId) {
          console.warn('⚠️ callId为null，尝试从webrtcManager重新获取')
          // 再次尝试获取
          setTimeout(() => {
            const retryCallId = webrtcManager?.callId || pendingCallId.value
            if (retryCallId) {
              const retryCallInfo = {
                status: 'connected',
                remoteUser: newUser,
                callId: retryCallId,
                callType: 'voice'
              };
              console.log('💾 重试持久化通话信息到localStorage:', retryCallInfo);
              localStorage.setItem('activeCallInfo', JSON.stringify(retryCallInfo));
            } else {
              console.error('❌ 无法获取有效的callId，跳过持久化')
            }
          }, 500) // 再等500ms
        } else {
          console.log('💾 持久化通话信息到localStorage:', callInfo);
          localStorage.setItem('activeCallInfo', JSON.stringify(callInfo));
        }
      }, 100) // 延迟100ms确保webrtcManager状态已更新
    } else if (oldStatus === 'connected' && newStatus !== 'connected') {
      // 只有在真正结束通话时才清除localStorage，不包括'connecting'状态
      if (newStatus === 'idle' || newStatus === 'ended' || newStatus === 'rejected') {
        console.log('🗑️ 通话结束，从localStorage清除通话信息');
        localStorage.removeItem('activeCallInfo');
      } else {
        console.log('🔄 通话状态变为', newStatus, '，保持localStorage不清除');
      }
    }
  }, { deep: true });

  // Pinia持久化会自动恢复状态，无需手动调用restoreCallFromStorage
  // 但我们需要在WebRTC管理器初始化后调用resumeCall来恢复音频流
  if (DEBUG_CALL_STATE) {
    console.log('📱 Call Store初始化完成，持久化状态:', {
      isCallActive: isCallActive.value,
      callStatus: callStatus.value,
      hasRemoteUser: !!remoteUser.value?.id
    });
  }
  
  return {
    // 状态变量 - 其他组件可以读取和监听这些状态
    isCallActive,        // 是否有活跃通话 接听中、拨打中、已连接
    callStatus,          // 通话状态 idle(空闲), calling(拨打中), ringing(响铃), connected(已连接), ended(已结束)
    callDuration,        // 通话时长（基于服务端时间戳计算）
    callStartTime,       // 🏆 服务端权威开始时间戳
    isMuted,             // 是否静音
    isMinimized,         // 是否最小化
    remoteUser,          // 对方用户信息
    
    // 来电通知相关状态
    showIncomingCallNotification,  // 是否显示来电通知
    incomingCallInfo,              // 来电者信息
    pendingCallId,                 // 待处理的通话 ID
    
    // 计算属性 - 自动计算的状态
    isInCall,            // 是否在通话中
    
    // 方法函数 - 其他组件可以调用这些函数
    startVoiceCall,      // 发起语音通话
    acceptCall,          // 接受通话
    rejectCall,          // 拒绝通话
    hangupCall,          // 挂断通话
    toggleMute,          // 切换静音
    minimizeCall,        // 最小化
    restoreCall,         // 恢复界面
    endCall,             // 结束通话
    handleIncomingCall,  // 处理来电
    updateCallStatus,    // 更新状态
    initCallManager,     // 初始化管理器
    forceResetState,     // 强制重置状态
    resumeCall,          // 恢复通话
    cleanup,             // 清理资源
    restoreCallFromStorage, // 从存储中恢复
    setTestCallState     // 测试用函数 - 设置测试通话状态
  }
}, {
  // Pinia持久化配置 - 使用简化版本
  persist: {
    key: 'call-store-v2',
    storage: localStorage,
    // 指定需要持久化的状态
    paths: [
      'isCallActive',
      'callStatus', 
      'callDuration',
      'callStartTime', // 🏆 服务端权威时间戳
      'isMuted',
      'isMinimized',
      'remoteUser',
      'pendingCallId',
      'showIncomingCallNotification',
      'incomingCallInfo'
    ]
    // 移除自定义序列化逻辑，使用Pinia默认行为
  }
})
