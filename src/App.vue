<script setup>
import {RouterLink, RouterView} from 'vue-router'
import { useUserInfoStore } from '@/stores/user';
import { onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

const userInfoStore = useUserInfoStore();
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectTimeout = ref(null);

// 计算重连延迟时间（指数退避）
const getReconnectDelay = () => {
  return Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000); // 最大延迟30秒
};

// 重连函数
const reconnect = () => {
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    ElMessage.error('WebSocket 连接失败，请刷新页面重试');
    return;
  }

  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value);
  }

  reconnectTimeout.value = setTimeout(() => {
    if (userInfoStore.userInfo.token) {
      console.log(`尝试重连 (${reconnectAttempts.value + 1}/${maxReconnectAttempts})`);
      userInfoStore.connectWebSocket();
      reconnectAttempts.value++;
    }
  }, getReconnectDelay());
};

// 监听 WebSocket 状态
const handleWebSocketStatus = (status) => {
  if (status === 'disconnected') {
    reconnect();
  } else if (status === 'connected') {
    reconnectAttempts.value = 0;
    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value);
    }
  }
};

// 页面加载时检查并建立连接
onMounted(() => {
  if (userInfoStore.userInfo.token) {
    // 强制重新创建连接
    userInfoStore.chatWS = null; // 先清空旧连接
    userInfoStore.connectWebSocket(); // 重新建立连接
  }

  // 监听 WebSocket 状态变化
  userInfoStore.$subscribe((mutation, state) => {
    if (mutation.type === 'direct' && mutation.events?.wsStatus) {
      handleWebSocketStatus(state.wsStatus);
    }
  });
});

onUnmounted(() => {
  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value);
  }
});
</script>

<template>
  <RouterView/>
</template>

<style scoped>

</style>
