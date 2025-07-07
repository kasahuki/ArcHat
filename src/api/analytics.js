import request from '@/utils/request';

// 获取用户活跃度数据
export const getUserActivityData = (userId, timeRange) => {
  return request({
    url: '/analytics/activity',
    method: 'get',
    params: {
      userId,
      timeRange
    }
  });
};

// 获取好友等级分布数据
export const getFriendLevelDistribution = (userId) => {
  return request({
    url: '/analytics/friend-level-distribution',
    method: 'get',
    params: {
      userId
    }
  });
};

// 获取好友聊天排行数据
export const getFriendChatRanking = (userId, timeRange) => {
  return request({
    url: '/analytics/friend-chat-ranking',
    method: 'get',
    params: {
      userId,
      timeRange
    }
  });
};

// 获取用户统计数据概览
export const getUserAnalyticsOverview = (userId) => {
  return request({
    url: '/analytics/overview',
    method: 'get',
    params: {
      userId
    }
  });
};

// 记录用户登录时间
export const recordUserLogin = (userId) => {
  return request({
    url: '/analytics/record-login',
    method: 'post',
    data: {
      userId,
      loginTime: new Date().toISOString()
    }
  });
};

// 记录用户登出时间
export const recordUserLogout = (userId) => {
  return request({
    url: '/analytics/record-logout',
    method: 'post',
    data: {
      userId,
      logoutTime: new Date().toISOString()
    }
  });
};

// 记录聊天消息（用于统计好友聊天排行）
export const recordChatMessage = (senderId, receiverId, messageType = 'text') => {
  return request({
    url: '/analytics/record-message',
    method: 'post',
    data: {
      senderId,
      receiverId,
      messageType,
      timestamp: new Date().toISOString()
    }
  });
};

// 获取用户会话统计
export const getUserSessionStats = (userId, timeRange) => {
  return request({
    url: '/analytics/session-stats',
    method: 'get',
    params: {
      userId,
      timeRange
    }
  });
};

// 获取用户行为分析
export const getUserBehaviorAnalysis = (userId, timeRange) => {
  return request({
    url: '/analytics/behavior',
    method: 'get',
    params: {
      userId,
      timeRange
    }
  });
}; 