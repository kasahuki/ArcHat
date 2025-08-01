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

// 查询群聊房间详情信息
export const getGroupDetail = (roomId) => {
  return request.post(`/room/groupDetail?roomId=${roomId}`);
}

// 创建群聊
export const addGroupRoom = (data) => {
  // data: { name, avatar, groupDesc }
  return request.post('/room/addGroup', data);
}

// 查询群聊的成员
export const listGroupMember = (roomId, basePageReq) => {
  return request.post(`/room/list/groupMember?roomId=${roomId}`, basePageReq);
};

// 查询一个群总人数
export const getGroupMemberCount = (roomId) => {
  return request.post(`/room/group/memberCount?roomId=${roomId}`);
};

// 搜索群聊
export const searchGroup = (basePageReq, keyword) => {
  const { page, pageSize } = basePageReq;
  return request.post(`/room/group/search?keyword=${encodeURIComponent(keyword)}`, {
    page,
    pageSize
  });
};

// 发送加入群聊的申请
export const applyJoinGroup = (data) => {
  return request.post('/room/apply/joinGroup', {
    roomId: data.roomId,
    msg: data.msg
  });
};
// 获取我发送的群聊申请列表
export const getMyGroupApplyList = (basePageReq) => {
  return request.post('/room/list/myApply', basePageReq);
}

export const getOtherJoinGroupApplyList = (basePageReq) => {
  return request.post('/room/list/otherApply', basePageReq);
}

// 修改群聊申请留言
export const updateGroupApplyMsg = (data) => {

  return request.post('/room/apply/modifyMsg', data);
}



// 处理入群申请
export const handleGroupJoinApply = (data) => {
  // data: { id, status }
  return request.post('/room/apply/dealWith', data);
}

// 将成员踢出群聊
export const removeMember = (data) => {
  // data: { uid: Long, roomId: Long }
  return request.post('/room/removeMember', data);
}

// 修改群聊信息
export const modifyGroup = (data) => {
  // data: { roomId, name, groupDesc }
  return request.post('/room/group/modify', data);
}

// 授权/撤销群成员权限
export const authorizeMember = (data) => {
  // data: { uid, groupId, role }
  return request.post('/room/auth', data);
}

// 退出群聊
export const outGroup = (roomId) => {
  return request.get(`/room/outGroup/${roomId}`);
}

// 解散群聊
export const dismissGroup = (roomId) => {
  return request.delete(`/room/group/${roomId}`);
}




