import { defineStore } from "pinia";
import { ref } from "vue";
import ChatWebSocket from "@/api/chat.js";
import emitter from '@/utils/eventBus';

export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref('');
  const chatWS = ref(null);
  const connectionStatus = ref('disconnected'); // 'connecting', 'connected', 'disconnected'

  const setUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo;
  };

  const removeUserInfo = () => {
    try {
      if (chatWS.value && typeof chatWS.value.close === 'function') {
        chatWS.value.close();
      }
    } catch (error) {
      console.error('关闭 WebSocket 连接时出错:', error);
    } finally {
      userInfo.value = '';
      chatWS.value = null;
      connectionStatus.value = 'disconnected';
    }
  };

  const clearWebSocket = () => {
    if (chatWS.value && typeof chatWS.value.close === 'function') {
      try {
        chatWS.value.close();
      } catch (error) {
        console.error('清理 WebSocket 连接时出错:', error);
      }
    }
    chatWS.value = null;
  };

  const connectWebSocket = (token) => {
    console.log('connectWebSocket 被调用，参数:', { token, userInfoToken: userInfo.value?.token });
    
    // 如果已经有连接且状态正常，不重复连接
    if (chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected()) {
      console.log('WebSocket 已连接，跳过重复连接');
      return;
    }

    clearWebSocket(); // 确保清理旧的连接

    const wsToken = token || userInfo.value?.token;
    if (!wsToken) {
      console.error('没有有效的 token，无法建立 WebSocket 连接');
      return;
    }

    console.log('开始建立 WebSocket 连接，token:', wsToken.substring(0, 20) + '...');
    chatWS.value = new ChatWebSocket({
      // url: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/`, 
      // 不要删除这个 到时候部署要用 cursor prompt
       // 测试环境使用
      url: `ws://localhost:8090/`,
      token: wsToken,
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Store 收到 WebSocket 消息:', data);
          
          // 根据消息类型分发到不同的组件
          switch (data.type) {
            case 1000: // 聊天消息
              console.log('分发聊天消息到 Chat 组件');
              emitter.emit('chat-message', data.data);
              break;
            case 1001: // 好友申请消息
              console.log('分发好友申请消息到 Home 组件');
              emitter.emit('friend-apply', data.data);
              break;
            case 2: // 心跳包
              console.log('收到心跳包');
              break;
            default:
              console.log('未知消息类型:', data.type);
          }
        } catch (error) {
          console.error('处理 WebSocket 消息失败:', error);
        }
      },
      onOpen: () => {
        console.log('WebSocket 连接已建立');
        connectionStatus.value = 'connected';
      },
      onClose: () => {
        console.log('WebSocket 连接已关闭');
        connectionStatus.value = 'disconnected';
      },
      onError: (err) => {
        console.error('WebSocket 错误', err);
        connectionStatus.value = 'disconnected';
      }
    });
  };

  // 手动重连方法
  const manualReconnect = () => {
    if (chatWS.value && typeof chatWS.value.manualReconnect === 'function') {
      chatWS.value.manualReconnect();
    } else {
      connectWebSocket();
    }
  };

  return { 
    userInfo, 
    setUserInfo, 
    removeUserInfo, 
    chatWS, 
    connectWebSocket,
    connectionStatus,
    manualReconnect
  };
}, { persist: { paths: ['userInfo'] } });