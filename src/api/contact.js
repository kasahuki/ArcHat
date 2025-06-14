import request from '@/utils/request'
// 获取私聊会话列表
export const getContactList = (params)=>{
  return request.post('/contact/listPrivate',params)
}


