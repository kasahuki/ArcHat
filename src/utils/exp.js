// 通过 经验值获取等级 等级去获取 样式！！！！！！
// 等级阈值配置
const levelThresholds = [0, 500, 2000, 3000, 5000, 10000, 20000,30000,40000];

// 等级颜色配置
const levelColors = {
  1: '#4CAF50', // 绿色
  2: '#2196F3', // 蓝色
  3: '#9C27B0', // 紫色
  4: '#FF9800', // 橙色
  5: '#F44336',  // 红色
  6: '#FF6103',
  7: '#DDAODD',
  8: '#FFD700'

};

/**
 * 计算用户等级
 * @param {number} exp - 用户经验值
 * @returns {number} 用户等级
 */
export const calculateLevel = (exp) => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (exp >= levelThresholds[i]) {
      return i + 1;
    }
  }
  return 1;
};

/**
 * 计算当前等级经验值和下一级所需经验值
 * @param {number} exp - 用户当前经验值
 * @param {number} level - 用户当前等级
 * @returns {Object} 包含当前经验值和下一级所需经验值的对象
 */
export const calculateExpProgress = (exp, level) => {
  const currentLevelExp = levelThresholds[level - 1];
  const nextLevelExp = level < 6 ? levelThresholds[level] : levelThresholds[5];
  const expInCurrentLevel = exp - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  
  return {
    currentExp: exp,
    nextLevelExp,
    percentage: level >= 6 ? 100 : (expInCurrentLevel / expNeededForNextLevel) * 100
  };
};

/**
 * 获取等级徽章样式
 * @param {number} level - 用户等级
 * @returns {Object} 等级徽章样式对象
 */
export const getLevelBadgeStyle = (level) => {
  return {
    backgroundColor: levelColors[level] || levelColors[1],
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
};

/**
 * 获取用户状态样式
 * @param {boolean} isOnline - 是否在线
 * @returns {Object} 状态样式对象
 */
export const getStatusStyle = (isOnline) => {
  return {
    color: isOnline ? '#4CAF50' : '#F44336',
    fontSize: '12px',
    fontWeight: '500'
  };
};

/**
 * 转义 HTML 字符
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (tag) {
    const charsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return charsToReplace[tag] || tag;
  });
}

/**
 * 将文本中的 URL 转为可点击的 a 标签
 * @param {string} text
 * @returns {string}
 */
export function linkify(text) {
  if (!text) return '';
  // 先转义 HTML
  let escaped = escapeHtml(text);
  // 匹配 http(s) 链接
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![^<]*>|[^&;]+;)/g;
  return escaped.replace(urlRegex, function (url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
} 