import request from '@/utils/request'
// 获取私聊会话列表
export const getContactList = (params)=>{
  return request.post('/contact/listPrivate',params)
}

// 获取群聊会话列表
export const getGroupList = (params) => {
  return request.post('/contact/listGroup', params)
}

// 分页查询未读消息数，支持批量 roomId
export const getUnreadMsgCnt = (params) => {
  return request.post('/contact/unreadMsgCnt', params)
}

