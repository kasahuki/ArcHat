// 后端数据分析API示例
// 这个文件展示了后端需要实现的接口结构
// 实际实现时请根据您的后端技术栈进行适配

/**
 * 用户活跃度数据接口
 * GET /analytics/activity
 * 参数: userId, timeRange (7/30/90天)
 * 返回: 每日上线次数统计
 */
const getUserActivityData = async (req, res) => {
  try {
    const { userId, timeRange } = req.query;
    
    // TODO: 实现数据库查询逻辑
    // 1. 查询用户登录记录表 (user_login_records)
    // 2. 按日期分组统计每日登录次数
    // 3. 返回指定时间范围内的数据
    
    // 示例查询SQL:
    /*
    SELECT 
      DATE(login_time) as date,
      COUNT(*) as count
    FROM user_login_records 
    WHERE user_id = ? 
      AND login_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(login_time)
    ORDER BY date ASC
    */
    
    // 模拟返回数据
    const mockData = [
      { date: '2024-01-01', count: 3 },
      { date: '2024-01-02', count: 5 },
      { date: '2024-01-03', count: 2 },
      // ... 更多数据
    ];
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: mockData
    });
  } catch (error) {
    res.json({
      code: 500,
      msg: '获取活跃度数据失败',
      data: null
    });
  }
};

/**
 * 好友等级分布数据接口
 * GET /analytics/friend-level-distribution
 * 参数: userId
 * 返回: 好友中1-6级的占比分布
 */
const getFriendLevelDistribution = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // TODO: 实现数据库查询逻辑
    // 1. 查询用户好友表 (user_friends)
    // 2. 关联用户表获取好友等级信息
    // 3. 按等级分组统计数量
    // 4. 计算各等级占比
    
    // 示例查询SQL:
    /*
    SELECT 
      u.level,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_friends WHERE user_id = ?), 2) as percentage
    FROM user_friends uf
    JOIN users u ON uf.friend_id = u.id
    WHERE uf.user_id = ?
    GROUP BY u.level
    ORDER BY u.level ASC
    */
    
    // 模拟返回数据
    const mockData = [
      { level: '1级', count: 15, percentage: 25 },
      { level: '2级', count: 12, percentage: 20 },
      { level: '3级', count: 10, percentage: 16.7 },
      { level: '4级', count: 8, percentage: 13.3 },
      { level: '5级', count: 9, percentage: 15 },
      { level: '6级', count: 6, percentage: 10 }
    ];
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: mockData
    });
  } catch (error) {
    res.json({
      code: 500,
      msg: '获取好友等级分布数据失败',
      data: null
    });
  }
};

/**
 * 好友聊天排行数据接口
 * GET /analytics/friend-chat-ranking
 * 参数: userId, timeRange
 * 返回: 与好友的聊天记录数量排行
 */
const getFriendChatRanking = async (req, res) => {
  try {
    const { userId, timeRange } = req.query;
    
    // TODO: 实现数据库查询逻辑
    // 1. 查询聊天记录表 (chat_messages)
    // 2. 统计与每个好友的聊天记录数量
    // 3. 按数量排序返回前N名
    
    // 示例查询SQL:
    /*
    SELECT 
      u.username as name,
      COUNT(*) as count
    FROM chat_messages cm
    JOIN users u ON (cm.sender_id = u.id OR cm.receiver_id = u.id)
    WHERE (cm.sender_id = ? OR cm.receiver_id = ?)
      AND cm.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      AND u.id != ?
    GROUP BY u.id, u.username
    ORDER BY count DESC
    LIMIT 10
    */
    
    // 模拟返回数据
    const mockData = [
      { name: '张三', count: 156 },
      { name: '李四', count: 89 },
      { name: '王五', count: 67 },
      // ... 更多数据
    ];
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: mockData
    });
  } catch (error) {
    res.json({
      code: 500,
      msg: '获取好友聊天排行失败',
      data: null
    });
  }
};

/**
 * 记录用户登录时间
 * POST /analytics/record-login
 * 参数: userId, loginTime
 */
const recordUserLogin = async (req, res) => {
  try {
    const { userId, loginTime } = req.body;
    
    // TODO: 实现数据库插入逻辑
    // 1. 插入用户登录记录表 (user_login_records)
    // 2. 更新用户会话表 (user_sessions)
    
    // 示例插入SQL:
    /*
    INSERT INTO user_login_records (user_id, login_time, ip_address, user_agent)
    VALUES (?, ?, ?, ?)
    
    INSERT INTO user_sessions (user_id, login_time, session_id)
    VALUES (?, ?, ?)
    */
    
    res.json({
      code: 200,
      msg: '记录登录成功'
    });
  } catch (error) {
    res.json({
      code: 500,
      msg: '记录登录失败'
    });
  }
};

/**
 * 记录用户登出时间
 * POST /analytics/record-logout
 * 参数: userId, logoutTime
 */
const recordUserLogout = async (req, res) => {
  try {
    const { userId, logoutTime } = req.body;
    
    // TODO: 实现数据库更新逻辑
    // 1. 更新用户会话表，设置登出时间
    // 2. 计算本次会话时长
    
    // 示例更新SQL:
    /*
    UPDATE user_sessions 
    SET logout_time = ?, 
        session_duration = TIMESTAMPDIFF(MINUTE, login_time, ?)
    WHERE user_id = ? AND logout_time IS NULL
    */
    
    res.json({
      code: 200,
      msg: '记录登出成功'
    });
  } catch (error) {
    res.json({
      code: 500,
      msg: '记录登出失败'
    });
  }
};

/**
 * 记录聊天消息（用于统计）
 * POST /analytics/record-message
 * 参数: senderId, receiverId, messageType, timestamp
 */
const recordChatMessage = async (req, res) => {
  try {
    const { senderId, receiverId, messageType, timestamp } = req.body;
    
    // TODO: 实现数据库插入逻辑
    // 1. 插入聊天记录表 (chat_messages)
    // 2. 更新用户统计表 (user_chat_stats)
    
    // 示例插入SQL:
    /*
    INSERT INTO chat_messages (sender_id, receiver_id, message_type, timestamp, content)
    VALUES (?, ?, ?, ?, ?)
    
    INSERT INTO user_chat_stats (user_id, friend_id, message_count, last_message_time)
    VALUES (?, ?, 1, ?)
    ON DUPLICATE KEY UPDATE 
    message_count = message_count + 1,
    last_message_time = ?
    */
    
    res.json({
      code: 200,
      msg: '记录消息成功'
    });
  } catch (error) {
    res.json({
      code: 500,
      msg: '记录消息失败'
    });
  }
};

// 数据库表结构建议

/*
-- 用户登录记录表
CREATE TABLE user_login_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_time (user_id, login_time)
);

-- 用户会话表
CREATE TABLE user_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME NULL,
  session_duration INT NULL, -- 分钟
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_session (user_id, session_id)
);

-- 聊天记录表
CREATE TABLE chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  content TEXT,
  timestamp DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sender_receiver (sender_id, receiver_id),
  INDEX idx_timestamp (timestamp)
);

-- 用户聊天统计表
CREATE TABLE user_chat_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  friend_id BIGINT NOT NULL,
  message_count INT DEFAULT 0,
  last_message_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_friend (user_id, friend_id),
  INDEX idx_user_id (user_id),
  INDEX idx_friend_id (friend_id)
);
*/

module.exports = {
  getUserActivityData,
  getFriendLevelDistribution,
  getFriendChatRanking,
  recordUserLogin,
  recordUserLogout,
  recordChatMessage
}; 