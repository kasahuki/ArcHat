<script setup>
import {RouterLink, RouterView} from 'vue-router'
import { useUserInfoStore } from '@/stores/user';
import { onMounted } from 'vue';
import { callAddVisitorOncePerDay } from '@/api/uv';

const userInfoStore = useUserInfoStore();

// 页面加载时检查并建立连接
onMounted(() => {
  console.log('App.vue onMounted，检查用户信息:', {
    hasUserInfo: !!userInfoStore.userInfo,
    hasToken: !!userInfoStore.userInfo?.token,
    token: userInfoStore.userInfo?.token?.substring(0, 20) + '...'
  });

  
  if (userInfoStore.userInfo?.token) {
   
    console.log('开始建立 WebSocket 连接');
    userInfoStore.connectWebSocket();
  } else {
    console.log('用户未登录或token无效，跳过 WebSocket 连接');
  }
});
</script>

<template>
  <RouterView/>
</template>

<style scoped>

</style>
