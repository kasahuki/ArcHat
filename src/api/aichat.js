import { useUserInfoStore } from '@/stores/user'

export async function aiChatStream(data) {
  try {
    // 获取用户 token
    const userInfoStore = useUserInfoStore()
    const token = userInfoStore.userInfo?.token
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // 如果有 token，添加到请求头
    if (token) {
      headers.Authorization = token
    }
    
    const response = await fetch('/api/client/ai/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('AI聊天请求失败:', error);
    throw error;
  }
}