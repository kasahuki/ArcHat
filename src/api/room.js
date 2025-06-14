import request from '@/utils/request'

// 添加私聊房间
export const addPrivateRoom = (data) => {
  return request.post('/room/addPrivate', data)
}

// 删除好友（切换房间状态）
export const deleteFriend = (data)=>{
  return request.post('/room/convertStatus',data)
}

// 查询私聊房间
export const checkPrivateRoom = (fid)=>{
  return request.get('/room/checkPrivateRoom?fid='+ fid)
}
