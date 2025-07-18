import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import ChatWebSocket from "@/api/chat.js";
import emitter from '@/utils/eventBus';

export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref('');
  const chatWS = ref(null);

  // 计算属性：从 chatWS 实例获取连接状态
  const connectionStatus = computed(() => {
    const status = chatWS.value && typeof chatWS.value.getConnectionStatus === 'function' 
      ? chatWS.value.getConnectionStatus() 
      : 'disconnected';
    console.log('userStore - connectionStatus:', status);
    console.log('userStore - chatWS.value:', chatWS.value);
    console.log('userStore - chatWS.value?.getConnectionStatus:', chatWS.value?.getConnectionStatus);
    return status;
  });

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
    }
  };

  const clearWebSocket = () => {
    try {
      if (chatWS.value && typeof chatWS.value.close === 'function') {
        chatWS.value.close();
      }
    } catch (error) {
      console.error('清理 WebSocket 连接时出错:', error);
    }
    chatWS.value = null;
  };

  const connectWebSocket = (token) => {
    
    // 如果已经有连接且状态正常，不重复连接
    if (chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected()) {
      return;
    }

    clearWebSocket(); // 确保清理旧的连接

    const wsToken = token || userInfo.value?.token;
    if (!wsToken) {
      console.error('没有有效的 token，无法建立 WebSocket 连接');
      return;
    }

    try {
      chatWS.value = new ChatWebSocket({
        // url: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/`, 
        // 不要删除这个 到时候部署要用 cursor prompt
         // 测试环境使用
        url: `ws://localhost:8090/`,
        token: wsToken,
        onMessage: (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // 根据消息类型分发到不同的组件
            switch (data.type) {
              case 1000: // 聊天消息
                emitter.emit('chat-message', data.data);
                emitter.emit('refresh-contact-list');
                break;
              case 1001: // 好友申请消息
                emitter.emit('friend-apply', data.data);
                break;
              case 2: // 心跳包
                // console.log('收到心跳包');
                break;
              case 4: // 群消息
                emitter.emit('group-message', data.data);
                emitter.emit('refresh-group-contact-list');
                break;
                // 其他用户上下线通知
              case 5:
                emitter.emit('user-status', data.data);
                console.log('收到用户上下线通知:', data.data);
                break;
              default:
                console.log('未知消息类型:', data.data);
            }
          } catch (error) {
            console.error('处理 WebSocket 消息失败:', error);
          }
        },
        onOpen: () => {
          console.log('WebSocket 连接已建立');
        },
        onClose: () => {
          console.log('WebSocket 连接已关闭');
        },
        onError: (err) => {
          console.error('WebSocket 错误', err);
          // 如果连接失败，清理实例
          if (chatWS.value) {
            chatWS.value = null;
          }
        }
      });
      
      // 验证实例是否正确创建
      if (!chatWS.value || typeof chatWS.value.close !== 'function') {
        console.error('ChatWebSocket 实例创建失败或方法缺失');
        chatWS.value = null;
      }
    } catch (error) {
      console.error('创建 ChatWebSocket 实例失败:', error);
      chatWS.value = null;
    }
  };


  return { 
    userInfo, 
    setUserInfo, 
    removeUserInfo, 
    chatWS, 
    connectWebSocket,
    connectionStatus,
    // 直接暴露 chatWS 实例的方法，避免重复
    manualReconnect: () => {
      if (chatWS.value && typeof chatWS.value.manualReconnect === 'function') {
        chatWS.value.manualReconnect();
      } else {
        connectWebSocket();
      }
    }
  };
}, { persist: { paths: ['userInfo'] } });