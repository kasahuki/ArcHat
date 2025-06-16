# 构建阶段
FROM node:18 AS build-stage
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
