// 通用分页加载和未读消息合并工具
// 用于好友/群聊会话列表的无限滚动和未读消息批量获取

/**
 * 通用分页加载函数
 * @param {Object} options
 * @param {Function} options.apiList - 列表API (query) => Promise
 * @param {Function} options.apiUnread - 未读数API ({type, roomIdList}) => Promise
 * @param {Object} options.query - 分页参数对象（需包含page/pageSize/type等）
 * @param {Ref} options.listRef - 列表ref
 * @param {Function} options.getId - 获取唯一id的方法 (item) => id
 * @param {Function} options.getLastMsgId - 获取lastMsgId的方法 (item) => lastMsgId
 * @param {Function} options.getLatestMsg - 获取最新消息内容的方法 (item) => Promise
 * @param {Ref} options.isLoadingRef - 加载状态ref
 * @param {Ref} options.noMoreRef - 没有更多ref
 * @param {String} [options.pageSizeKey='pageSize'] - pageSize字段名
 */
export async function loadMoreList({
  apiList,
  apiUnread,
  query,
  listRef,
  getId,
  getLastMsgId,
  getLatestMsg,
  isLoadingRef,
  noMoreRef,
  pageSizeKey = 'pageSize',
}) {
  if (isLoadingRef.value || noMoreRef.value) return;
  isLoadingRef.value = true;
  query.page++;

  try {
    // 1. 拉取列表
    const listRes = await apiList(query);
    if (listRes.code !== 200) {
      noMoreRef.value = true;
      return;
    }
    const items = listRes.data.records || [];
    if (items.length === 0) {
      noMoreRef.value = true;
      return;
    }

    // 2. 批量拉取未读数
    const ids = items.map(getId);
    const unreadRes = await apiUnread({ 
      type: query.type, 
      roomIdList: ids 
    });
    const unreadMap = {};
    if (unreadRes.code === 200 && Array.isArray(unreadRes.data.records)) {
      unreadRes.data.records.forEach(item => {
        unreadMap[item.roomId] = item.count;
      });
    }

    // 3. 合并未读数
    items.forEach(item => {
      item.unreadCount = unreadMap[getId(item)] || 0;
    });

    // 4. 获取最新消息内容
    for (const item of items) {
      if (getLastMsgId(item)) {
        await getLatestMsg(item);
      }
    }

    // 5. 合并到列表
    listRef.value = listRef.value.concat(items);

    // 6. 判断是否还有更多
    if (items.length < query[pageSizeKey]) {
      noMoreRef.value = true;
    }
  } finally {
    isLoadingRef.value = false;
  }
} 