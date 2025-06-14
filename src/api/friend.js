import request from '@/utils/request'

// 搜索好友
export const searchFriends = (params) => {
  return request.post('/friend/search', params)
}

// 添加好友
export const addFriend = (friendId) => {
  return request.post('/friend/add', { friendId })
}

// 删除好友
export const deleteFriend = (friendId) => {
  return request.delete(`/friend/delete/${friendId}`)
}

// 获取好友列表
export const getFriendList = (uid) => {
  return request.get('/friend/listFriend?uid='+ uid)
}

export const getMyFriendApplyList = (params) =>{
  return request.post('/friend/list/myApply',params)
}

export const getMyFriendReceiveList = (params) =>{
  return request.post('/friend/list/myReceive',params)
}

export const handleFriendApply = (params)=>{
  return request.post('/friend/dealWith',params)
}

// 检查好友 返回true 是好友 false 不是好友
export const checkFriend = (fid)=>{
  return request.get('/friend/isFriend?fid='+ fid)
}