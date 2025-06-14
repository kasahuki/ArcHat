/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 获取相对时间（例如：刚刚、x分钟前、x小时前等）
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 相对时间字符串
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return formatDate(dateString);
  }
};

// 格式化消息时间
export const formatMessageTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const messageDate = new Date(date);
  const diff = now - messageDate;
  
  // 今天的消息
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // 昨天的消息
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + messageDate.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // 今年的消息
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // 更早的消息
  return messageDate.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}; 