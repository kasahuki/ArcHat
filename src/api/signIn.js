import request from '@/utils/request'
export const signInService = () => {
  return request.post('/signIn')
}

// 查询当月的签到情况
export const getSignInDetailService = () => {
  return request.get('/signIn/detail')
} 