import request from '@/utils/request'
export const addVisitor = () => {
  return request.post('/visit/add')
}
export const countVisitor = (data) => {
  return request.post('/visit/count', data)
}

export const callAddVisitorOncePerDay = async () => {
    await addVisitor();
};
export const fetchVisitorCount = () => {
  // 获取当前日期，格式为yyyyMMdd
   const now = new Date()
   const yyyy = now.getFullYear()
   const mm = String(now.getMonth() + 1).padStart(2, '0')
   const dd = String(now.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}${mm}${dd}`
   return countVisitor({ dateKey })
 
}