import request from '@/utils/request'

// 对数据库聊天记录进行crud

export const getMessageList = (params) => {
  return request.post('/message/list', params)
}

export const getMessageById = (id) => {
  return request.get(`/message/${id}`)
}
