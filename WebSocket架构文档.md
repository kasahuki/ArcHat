# WebSocket架构文档

## 概述

本项目采用分层架构设计，将WebSocket连接管理和业务逻辑分离，确保代码的清晰性和可维护性。

## 架构设计

### 分层架构
```
chat.js (ChatWebSocket类) ← 网络连接层
    ↓
user.js (Pinia Store) ← 业务逻辑层  
    ↓
Vue组件 ← 展示层
```

### 设计原则
- **单一职责**：每个文件专注自己的领域
- **可复用性**：`chat.js` 可以用于其他需要WebSocket的场景
- **可测试性**：业务逻辑和网络逻辑分离，便于测试
- **可维护性**：修改网络逻辑不影响业务逻辑，反之亦然
- **错误隔离**：网络错误不会直接影响业务状态

## chat.js (ChatWebSocket类) - 网络连接层

### 职责
- **WebSocket连接管理**：建立、维护、关闭WebSocket连接
- **网络状态监控**：心跳包、健康检查、自动重连
- **底层事件处理**：连接、断开、错误等原生WebSocket事件

### 核心函数详解

#### 1. 构造函数
```javascript
constructor({ url, token, onMessage, onOpen, onClose, onError })
```

**用途**：初始化WebSocket实例，接收回调函数

**调用时机**：`user.js` 中创建新连接时

**作用**：
- 设置连接参数（url, token）
- 保存回调函数（onMessage, onOpen, onClose, onError）
- 初始化内部状态变量
- 自动调用 `connect()` 建立连接

**参数说明**：
- `url`: WebSocket服务器地址
- `token`: 用户认证令牌
- `onMessage`: 消息接收回调
- `onOpen`: 连接建立回调
- `onClose`: 连接关闭回调
- `onError`: 错误处理回调

#### 2. connect()
```javascript
connect()
```

**用途**：建立WebSocket连接

**调用时机**：
- 构造函数中自动调用
- 手动重连时调用
- 网络恢复时调用

**作用**：
- 创建WebSocket实例
- 绑定事件处理器（onopen, onmessage, onclose, onerror）
- 设置连接状态为 'connecting'
- 添加网络状态监听

**事件处理**：
- `onopen`: 连接成功，启动心跳包和健康检查
- `onmessage`: 接收消息，处理心跳响应
- `onclose`: 连接关闭，根据情况决定是否重连
- `onerror`: 连接错误，更新状态并触发错误回调

#### 3. send(data)
```javascript
send(data)
```

**用途**：发送消息到服务器

**调用时机**：需要向服务器发送数据时

**作用**：
- 检查WebSocket连接状态
- 发送JSON或字符串数据
- 在连接断开时给出警告

**参数**：
- `data`: 要发送的数据，可以是对象或字符串

#### 4. 心跳包机制
```javascript
startHeartbeat() / stopHeartbeat()
```

**用途**：维持连接活跃状态

**调用时机**：
- 连接成功后自动启动
- 连接断开时自动停止

**作用**：
- 每15秒发送心跳包（type: 2）
- 检测心跳响应时间
- 超时（2分钟无响应）时自动重连
- 在用户登出或连接断开时停止

#### 5. 重连机制
```javascript
reconnect() / manualReconnect()
```

**用途**：自动和手动重连

**调用时机**：
- 连接异常断开时自动重连
- 用户手动触发重连
- 网络恢复时重连

**作用**：
- `reconnect()`: 自动重连，使用指数退避策略
- `manualReconnect()`: 手动重连，重置重连计数
- 重连间隔：前3次2秒，4-6次5秒，7次以后10秒

#### 6. 状态管理
```javascript
getConnectionStatus() / isConnected()
```

**用途**：提供连接状态信息

**调用时机**：外部需要检查连接状态时

**作用**：
- `getConnectionStatus()`: 返回连接状态字符串（'connecting', 'connected', 'disconnected'）
- `isConnected()`: 返回布尔值，表示是否已连接

#### 7. close()
```javascript
close()
```

**用途**：安全关闭连接

**调用时机**：用户登出或应用关闭时

**作用**：
- 设置登出标志
- 停止心跳包和健康检查
- 清理重连定时器
- 移除网络状态监听
- 关闭WebSocket连接

#### 8. 健康检查
```javascript
startHealthCheck() / stopHealthCheck()
```

**用途**：定期检查连接健康状态

**调用时机**：
- 连接成功后启动
- 连接断开时停止

**作用**：
- 每30秒检查WebSocket连接状态
- 检测连接状态不一致时更新状态
- 在用户登出时自动停止

#### 9. 网络状态监听
```javascript
addNetworkListeners() / removeNetworkListeners()
```

**用途**：监听网络状态变化

**调用时机**：
- 连接建立时添加监听
- 连接关闭时移除监听

**作用**：
- 监听 `online` 事件：网络恢复时自动重连
- 监听 `offline` 事件：网络断开时更新状态

## user.js (Pinia Store) - 业务逻辑层

### 职责
- **用户状态管理**：用户信息、登录状态
- **业务逻辑处理**：消息类型分发、事件处理
- **连接协调**：管理WebSocket连接的生命周期

### 核心函数详解

#### 1. 状态管理
```javascript
const userInfo = ref('')           // 用户信息
const chatWS = ref(null)           // WebSocket实例引用
const connectionStatus = computed(() => {...})  // 连接状态（计算属性）
```

**用途**：存储用户信息和连接状态

**作用**：
- `userInfo`: 存储用户登录信息
- `chatWS`: 保存ChatWebSocket实例的引用
- `connectionStatus`: 计算属性，从chatWS实例获取连接状态

#### 2. setUserInfo(newUserInfo)
```javascript
const setUserInfo = (newUserInfo) => {
  userInfo.value = newUserInfo;
}
```

**用途**：设置用户信息

**调用时机**：用户登录成功后

**作用**：更新用户状态，可能触发WebSocket连接

**参数**：
- `newUserInfo`: 用户信息对象，包含token等认证信息

#### 3. connectWebSocket(token)
```javascript
const connectWebSocket = (token) => {
  // 检查是否已连接
  if (chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected()) {
    return;
  }

  clearWebSocket(); // 清理旧连接

  const wsToken = token || userInfo.value?.token;
  if (!wsToken) {
    console.error('没有有效的 token，无法建立 WebSocket 连接');
    return;
  }

  try {
    chatWS.value = new ChatWebSocket({
      url: `ws://localhost:8090/`,
      token: wsToken,
      onMessage: (event) => { /* 消息处理逻辑 */ },
      onOpen: () => { console.log('WebSocket 连接已建立'); },
      onClose: () => { console.log('WebSocket 连接已关闭'); },
      onError: (err) => { 
        console.error('WebSocket 错误', err);
        if (chatWS.value) {
          chatWS.value = null;
        }
      }
    });
    
    // 验证实例是否正确创建
    if (!chatWS.value || typeof chatWS.value.close !== 'function') {
      console.error('ChatWebSocket 实例创建失败或方法缺失');
      chatWS.value = null;
    }
  } catch (error) {
    console.error('创建 ChatWebSocket 实例失败:', error);
    chatWS.value = null;
  }
}
```

**用途**：建立WebSocket连接

**调用时机**：
- 用户登录后
- 连接断开需要重连时
- 应用初始化时

**作用**：
- 检查是否已有连接，避免重复连接
- 清理旧的WebSocket连接
- 验证token有效性
- 创建ChatWebSocket实例
- 设置消息处理回调
- 验证实例创建是否成功

**参数**：
- `token`: 可选的认证令牌，如果不提供则使用userInfo中的token

#### 4. 消息处理回调
```javascript
onMessage: (event) => {
  try {
    const data = JSON.parse(event.data);
    
    // 根据消息类型分发到不同的组件
    switch (data.type) {
      case 1000: // 聊天消息
        emitter.emit('chat-message', data.data);
        break;
      case 1001: // 好友申请消息
        emitter.emit('friend-apply', data.data);
        break;
      case 2: // 心跳包
        // 心跳包由chat.js处理，这里不需要额外处理
        break;
      default:
        console.log('未知消息类型:', data.type);
    }
  } catch (error) {
    console.error('处理 WebSocket 消息失败:', error);
  }
}
```

**用途**：处理接收到的WebSocket消息

**调用时机**：`chat.js` 接收到消息时自动调用

**作用**：
- 解析JSON消息
- 根据消息类型分发到不同组件
- 使用事件总线（emitter）通知相关组件

**消息类型**：
- `1000`: 聊天消息 → 发送到Chat组件
- `1001`: 好友申请消息 → 发送到Home组件
- `2`: 心跳包 → 由chat.js处理

#### 5. removeUserInfo()
```javascript
const removeUserInfo = () => {
  try {
    if (chatWS.value && typeof chatWS.value.close === 'function') {
      chatWS.value.close();
    }
  } catch (error) {
    console.error('关闭 WebSocket 连接时出错:', error);
  } finally {
    userInfo.value = '';
    chatWS.value = null;
  }
}
```

**用途**：用户登出时清理状态

**调用时机**：用户登出时

**作用**：
- 安全关闭WebSocket连接
- 清理用户信息
- 重置chatWS引用
- 确保即使出错也能清理状态

#### 6. clearWebSocket()
```javascript
const clearWebSocket = () => {
  try {
    if (chatWS.value && typeof chatWS.value.close === 'function') {
      chatWS.value.close();
    }
  } catch (error) {
    console.error('清理 WebSocket 连接时出错:', error);
  }
  chatWS.value = null;
}
```

**用途**：清理WebSocket连接

**调用时机**：建立新连接前

**作用**：
- 安全关闭现有连接
- 重置chatWS引用
- 确保旧连接被正确清理

#### 7. manualReconnect()
```javascript
const manualReconnect = () => {
  if (chatWS.value && typeof chatWS.value.manualReconnect === 'function') {
    chatWS.value.manualReconnect();
  } else {
    connectWebSocket();
  }
}
```

**用途**：手动重连

**调用时机**：用户点击重连按钮时

**作用**：
- 优先使用chat.js的重连方法
- 如果重连方法不可用，则重新建立连接
- 提供降级处理机制

## 调用流程示例

### 1. 用户登录流程
```
用户登录 
  ↓
setUserInfo() 
  ↓
connectWebSocket() 
  ↓
new ChatWebSocket() 
  ↓
chat.js.connect()
```

**详细步骤**：
1. 用户输入登录信息并提交
2. 后端验证成功，返回用户信息和token
3. 调用 `setUserInfo()` 保存用户信息
4. 调用 `connectWebSocket()` 建立WebSocket连接
5. 创建 `ChatWebSocket` 实例
6. 自动调用 `chat.js.connect()` 建立连接

### 2. 消息接收流程
```
服务器发送消息 
  ↓
chat.js.onmessage 
  ↓
user.js.onMessage回调 
  ↓
emitter.emit() 
  ↓
Vue组件处理
```

**详细步骤**：
1. 服务器通过WebSocket发送消息
2. `chat.js` 的 `onmessage` 事件被触发
3. 调用 `user.js` 传入的 `onMessage` 回调
4. 解析消息并根据类型分发
5. 通过事件总线通知相关Vue组件
6. Vue组件接收并处理消息

### 3. 连接断开重连流程
```
网络断开 
  ↓
chat.js.onclose 
  ↓
chat.js.reconnect() 
  ↓
自动重连
```

**详细步骤**：
1. 网络连接断开
2. `chat.js` 的 `onclose` 事件被触发
3. 检查是否为异常断开（非正常关闭）
4. 如果是异常断开，调用 `reconnect()` 自动重连
5. 使用指数退避策略进行重连

**手动重连流程**：
```
用户点击重连按钮 
  ↓
user.js.manualReconnect() 
  ↓
chat.js.manualReconnect()
```

### 4. 用户登出流程
```
用户登出 
  ↓
user.js.removeUserInfo() 
  ↓
chatWS.value.close() 
  ↓
chat.js.close()
```

**详细步骤**：
1. 用户点击登出按钮
2. 调用 `removeUserInfo()` 清理状态
3. 调用 `chatWS.value.close()` 关闭连接
4. `chat.js.close()` 执行清理操作
5. 清理所有定时器和事件监听
6. 重置用户信息和连接状态

## 错误处理机制

### 1. 连接创建失败
```javascript
try {
  chatWS.value = new ChatWebSocket({...});
  // 验证实例
  if (!chatWS.value || typeof chatWS.value.close !== 'function') {
    chatWS.value = null;
  }
} catch (error) {
  console.error('创建 ChatWebSocket 实例失败:', error);
  chatWS.value = null;
}
```

### 2. 方法调用保护
```javascript
// 所有方法调用前都检查方法是否存在
if (chatWS.value && typeof chatWS.value.close === 'function') {
  chatWS.value.close();
}
```

### 3. 错误回调处理
```javascript
onError: (err) => {
  console.error('WebSocket 错误', err);
  // 如果连接失败，清理实例
  if (chatWS.value) {
    chatWS.value = null;
  }
}
```

## 状态管理

### 连接状态
- `'connecting'`: 正在连接中
- `'connected'`: 已连接
- `'disconnected'`: 已断开

### 状态获取
```javascript
// 通过计算属性获取连接状态
const connectionStatus = computed(() => {
  return chatWS.value && typeof chatWS.value.getConnectionStatus === 'function' 
    ? chatWS.value.getConnectionStatus() 
    : 'disconnected';
});
```

## 最佳实践

### 1. 类型检查
所有方法调用前都应该检查方法是否存在：
```javascript
if (chatWS.value && typeof chatWS.value.methodName === 'function') {
  chatWS.value.methodName();
}
```

### 2. 错误边界
所有可能出错的操作都应该包含在try-catch中：
```javascript
try {
  // 可能出错的操作
} catch (error) {
  console.error('操作失败:', error);
  // 错误处理逻辑
}
```

### 3. 资源清理
确保在不需要时正确清理资源：
```javascript
// 清理定时器
if (this.interval) {
  clearInterval(this.interval);
  this.interval = null;
}

// 清理事件监听
this.removeEventListener('event', handler);
```

### 4. 状态一致性
确保状态更新的一致性：
```javascript
// 在finally块中确保状态被重置
try {
  // 操作
} catch (error) {
  // 错误处理
} finally {
  // 状态重置
}
```

## 总结

这种分层架构设计确保了：

1. **职责清晰**：网络层专注连接管理，业务层专注逻辑处理
2. **代码复用**：ChatWebSocket类可以用于其他项目
3. **易于测试**：各层可以独立测试
4. **易于维护**：修改网络逻辑不影响业务逻辑
5. **错误隔离**：网络错误不会直接影响业务状态
6. **状态管理**：通过计算属性提供响应式的连接状态

这种设计模式是典型的**分层架构**和**观察者模式**的结合，为WebSocket应用提供了稳定可靠的基础架构。 