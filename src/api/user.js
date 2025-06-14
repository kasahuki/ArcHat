import request from '/src/utils/request.js'

// 用户注册
export const registerService = (data) => {
  return request.post('/user/register', data)
}

// 用户登录
export const loginService = (data) => {
  return request.post('/user/login', data)
}
export const logoutService = (token)=>{
  return request.post("/user/logout",{token})
}

export const modifyPwdService = (data)=>{
  return request.post("/user/modifyPwd",data)
}

export const modifyUsernameService = (data)=>{
  return request.post("/user/modifyName",data)
}
