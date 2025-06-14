import { defineStore } from "pinia";
import { ref } from "vue";
import ChatWebSocket from "@/api/chat.js";

export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref('');
  const chatWS = ref(null);

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

  // 登录后建立 WebSocket 连接
  const connectWebSocket = (token) => {
    if (chatWS.value) return;
    const wsToken = token || userInfo.value.token;
    chatWS.value = new ChatWebSocket({
      url: 'ws://localhost:8090/',
      token: wsToken,
      onMessage: (data) => {
        // 你可以在这里做全局消息分发，也可以在 Chat.vue 里监听
      },
      onOpen: () => {
        console.log('WebSocket 连接已建立');
      },
      onClose: () => {
        console.log('WebSocket 连接已关闭');
        chatWS.value = null;
      },
      onError: (err) => {
        console.error('WebSocket 错误', err);
      }
    });
  };

  return { userInfo, setUserInfo, removeUserInfo, chatWS, connectWebSocket };
}, { persist: { paths: ['userInfo'] } });