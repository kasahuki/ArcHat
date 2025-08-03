<script setup>
import {RouterLink, RouterView} from 'vue-router'
import { useUserInfoStore } from '@/stores/user';
import { useCallStore } from '@/stores/call.js';
import { useVideoCallStore } from '@/stores/videoCall.js';
import { onMounted } from 'vue';
import { callAddVisitorOncePerDay } from '@/api/uv';
import GlobalCallBubble from '@/components/GlobalCallBubble.vue';
import IncomingCallNotification from '@/components/IncomingCallNotification.vue';
import VideoCallBubble from '@/components/VideoCallBubble.vue';
import IncomingVideoCallNotification from '@/components/IncomingVideoCallNotification.vue';

const userInfoStore = useUserInfoStore();
const callStore = useCallStore();
const videoCallStore = useVideoCallStore();

// 页面加载时检查并建立连接
onMounted(() => {
  console.log('App.vue onMounted 执行');
  console.log('用户登录状态:', {
    hasUserInfo: !!userInfoStore.userInfo,
    hasToken: !!userInfoStore.userInfo?.token,
    userId: userInfoStore.userInfo?.uid
  });
  console.log('App.vue onMounted，检查用户信息:', {
    hasUserInfo: !!userInfoStore.userInfo,
    hasToken: !!userInfoStore.userInfo?.token,
    token: userInfoStore.userInfo?.token?.substring(0, 20) + '...'
  });

  
  if (userInfoStore.userInfo?.token) {
   
    console.log('开始建立 WebSocket 连接');
    userInfoStore.connectWebSocket();
    
    // 初始化通话管理器
    setTimeout(async () => {
      console.log('=== 2秒后检查WebRTC初始化条件 ===');
      console.log('userInfoStore.chatWS:', userInfoStore.chatWS);
      console.log('userInfoStore.userInfo:', userInfoStore.userInfo);
      console.log('websocket状态:', !!userInfoStore.chatWS);
      console.log('userInfo状态:', !!userInfoStore.userInfo);
      
      if (userInfoStore.chatWS && userInfoStore.userInfo) {
      
        // 初始化语音通话管理器
        const success = callStore.initCallManager(userInfoStore.chatWS, userInfoStore);
        console.log('语音通话管理器初始化结果:', success);
        
        // 如果初始化成功，检查是否需要恢复持久化的通话状态
        if (success) {
          // 给一点时间让Pinia持久化状态完全加载
          setTimeout(async () => {
            console.log('🔄 检查并尝试恢复持久化的语音通话状态...');
            await callStore.resumeCall();
          }, 100);
        }
        
        // 初始化视频通话管理器（独立初始化）
        try {
          const videoSuccess = await videoCallStore.initVideoWebRTCManager();
          console.log('🎥 视频通话管理器初始化结果:', !!videoSuccess);
        } catch (error) {
          console.error('❗ 视频通话管理器初始化失败:', error);
        }
      } else {
        console.warn('❌ 通话管理器初始化失败: WebSocket或用户信息不可用');
     ;
      }
    }, 2000); // 增加等待时间确保完全初始化
  } else {
    console.log('用户未登录或token无效，跳过 WebSocket 连接');
  }
});
</script>

<template>
  <RouterView/>
  <!-- 全局语音通话气泡 -->
  <GlobalCallBubble />
  <!-- 语音通话来电通知 -->
  <IncomingCallNotification />
  
  <!-- 全局视频通话气泡（独立组件） -->
  <VideoCallBubble />
  <!-- 视频通话来电通知（独立组件） -->
  <IncomingVideoCallNotification />
</template>

<style scoped>

</style>
