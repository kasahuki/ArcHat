/**
 * 获取等级对应的样式类
 * @param {number} level - 用户等级
 * @returns {string} 等级样式类名
 */
export const getLevelClass = (level) => {
  const classes = {
    1: 'level-1',
    2: 'level-2',
    3: 'level-3',
    4: 'level-4',
    5: 'level-5',
    6: 'level-6'
  };
  return classes[level] || 'level-1';
};

/**
 * 获取等级对应的颜色
 * @param {number} level - 用户等级
 * @returns {string} 等级颜色
 */
export const getLevelColor = (level) => {
  const colors = {
    1: '#909399',
    2: '#67C23A',
    3: '#409EFF',
    4: '#E6A23C',
    5: '#F56C6C',
    6: 'linear-gradient(45deg, #FFD700, #FFA500)'
  };
  return colors[level] || colors[1];
};

/**
 * 获取等级对应的样式对象
 * @param {number} level - 用户等级
 * @returns {Object} 等级样式对象
 */
export const getLevelStyle = (level) => {
  const color = getLevelColor(level);
  return {
    backgroundColor: color,
    boxShadow: level === 6 ? '0 2px 8px rgba(255, 215, 0, 0.3)' : 'none'
  };
}; 