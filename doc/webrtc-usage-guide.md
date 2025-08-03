# WebRTC 语音通话功能使用指南

## 功能概述

本项目已成功集成WebRTC语音通话功能，支持用户之间进行实时语音通话。主要特性包括：

- ✅ 点击通话按钮弹出语音/视频通话选项
- ✅ 全局悬浮可拖拽的通话气泡
- ✅ 实时显示通话时长、对方头像和昵称
- ✅ 支持静音、挂断、收缩功能
- ✅ 切换聊天房间时通话气泡不消失
- ✅ 使用Iconify图标库，无需Element Plus图标
- ✅ 基于现有WebSocket连接的信令交换

## 使用方法

### 1. 发起语音通话

1. 进入任意私聊会话
2. 点击输入框左侧的**绿色通话按钮** 📞
3. 在弹出的选项中选择"语音通话"
4. 系统会向对方发送通话邀请

### 2. 接听/拒绝通话

- 收到通话邀请时，会弹出确认对话框
- 点击"确定"接听通话
- 点击"取消"拒绝通话

### 3. 通话中操作

通话气泡支持以下操作：

- **拖拽移动**: 点击气泡任意位置拖拽到屏幕任意位置
- **静音/取消静音**: 点击麦克风图标
- **挂断通话**: 点击红色挂断按钮
- **收缩气泡**: 点击最小化按钮，气泡变为小尺寸
- **恢复气泡**: 点击收缩后的气泡恢复完整界面

### 4. 通话状态

- **正在呼叫...**: 发起通话等待对方响应
- **对方振铃中...**: 对方收到邀请但未接听
- **通话中**: 双方已建立连接，显示通话时长
- **通话结束**: 通话已结束

## 技术实现

### 前端架构

```
src/
├── components/
│   ├── VoiceCallBubble.vue          # 通话气泡组件
│   ├── CallOptionsPopup.vue         # 通话选项弹窗
│   └── GlobalCallBubble.vue         # 全局通话气泡包装器
├── stores/
│   └── call.js                      # 通话状态管理
├── utils/
│   ├── webrtc.js                    # WebRTC管理器
│   └── callBubbleManager.js         # 通话气泡管理器
└── views/chat/
    └── Chat.vue                     # 聊天界面（集成通话按钮）
```

### 核心组件说明

#### 1. VoiceCallBubble.vue
- 可拖拽的通话气泡UI组件
- 支持最小化/恢复
- 显示通话状态、时长、用户信息
- 提供静音、挂断等控制按钮

#### 2. WebRTC管理器 (webrtc.js)
- 管理WebRTC连接和媒体流
- 处理信令交换（基于现有WebSocket）
- 支持音频流的获取、传输和播放
- 处理ICE候选和SDP交换

#### 3. 通话状态管理 (call.js)
- 使用Pinia管理全局通话状态
- 跟踪通话时长、静音状态等
- 提供通话控制方法

### WebRTC信令流程

```
发起方                    服务器                    接收方
  |                        |                        |
  |-- call-invite -------->|                        |
  |                        |-- call-invite -------->|
  |                        |                        |
  |                        |<-- call-accept --------|
  |<-- call-accept --------|                        |
  |                        |                        |
  |-- offer -------------->|                        |
  |                        |-- offer -------------->|
  |                        |                        |
  |                        |<-- answer --------------|
  |<-- answer -------------|                        |
  |                        |                        |
  |-- ice-candidate ------>|                        |
  |                        |-- ice-candidate ------>|
  |                        |                        |
  |<-- ice-candidate ------|<-- ice-candidate ------|
  |                        |                        |
  |========== 建立P2P连接 ==========|
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## 网络要求

- 支持STUN服务器连接（使用Google公共STUN服务器）
- 防火墙需允许WebRTC流量
- 建议在HTTPS环境下使用

## 前端WebRTC函数详解

### WebRTCManager 核心类

#### 1. 初始化流程
```javascript
// 在 App.vue 中初始化
callStore.initCallManager(websocket, userStore)

// WebRTCManager.init() 做了什么：
- 保存 websocket 和 userStore 引用
- 验证用户信息是否有效
- 设置 WebSocket 信令监听器
- 返回初始化成功/失败状态
```

#### 2. 发起通话流程 (startCall)
```javascript
// 用户点击通话按钮时调用
webrtcManager.startCall(targetUserId)

// 内部执行步骤：
1. 生成唯一的 callId (UUID)
2. 获取本地音频流 (getUserMedia)
3. 创建 RTCPeerConnection
4. 添加本地音频轨道到连接
5. 发送 'call-invite' 信令到后端
```

#### 3. 信令消息类型和处理

**前端发送的信令类型：**
- `call-invite`: 发起通话邀请
- `call-accept`: 接受通话
- `call-reject`: 拒绝通话
- `call-hangup`: 挂断通话
- `offer`: WebRTC SDP offer
- `answer`: WebRTC SDP answer
- `ice-candidate`: ICE 候选者

**前端接收的信令类型：**
- 同上所有类型（双向通信）

#### 4. 通话状态管理
```javascript
// 通话状态流转：
idle → calling → ringing → connected → ended

// 状态变化时会触发回调：
webrtcManager.onCallStatusChange = (status) => {
  // 更新UI状态
  callStore.updateCallStatus(status)
}
```

## 后端对接指南

### 1. WebSocket 信令服务器实现

#### Spring Boot + Netty 示例

```java
@Component
public class WebRTCSignalHandler {
    
    @EventListener
    public void handleWebRTCSignal(WebSocketMessageEvent event) {
        JSONObject message = event.getMessage();
        String type = message.getString("type");
        
        switch (type) {
            case "call-invite":
                handleCallInvite(event.getSession(), message);
                break;
            case "call-accept":
                handleCallAccept(event.getSession(), message);
                break;
            case "call-reject":
                handleCallReject(event.getSession(), message);
                break;
            case "call-hangup":
                handleCallHangup(event.getSession(), message);
                break;
            case "offer":
            case "answer":
            case "ice-candidate":
                relaySignalMessage(event.getSession(), message);
                break;
        }
    }
    
    // 处理通话邀请
    private void handleCallInvite(WebSocketSession session, JSONObject message) {
        String callId = message.getString("callId");
        String targetUserId = message.getString("targetUserId");
        JSONObject callerInfo = message.getJSONObject("callerInfo");
        
        // 1. 验证目标用户是否在线
        WebSocketSession targetSession = getSessionByUserId(targetUserId);
        if (targetSession == null) {
            // 发送用户不在线消息
            sendErrorMessage(session, "用户不在线");
            return;
        }
        
        // 2. 检查目标用户是否正在通话中
        if (isUserInCall(targetUserId)) {
            sendErrorMessage(session, "用户正在通话中");
            return;
        }
        
        // 3. 转发通话邀请给目标用户
        JSONObject inviteMessage = new JSONObject();
        inviteMessage.put("type", "webrtc-signal");
        inviteMessage.put("data", message);
        
        sendMessageToUser(targetUserId, inviteMessage);
        
        // 4. 记录通话状态
        recordCallSession(callId, session.getUserId(), targetUserId, "calling");
    }
    
    // 处理通话接受
    private void handleCallAccept(WebSocketSession session, JSONObject message) {
        String callId = message.getString("callId");
        String targetUserId = message.getString("targetUserId");
        
        // 1. 验证通话会话
        if (!validateCallSession(callId, session.getUserId())) {
            sendErrorMessage(session, "无效的通话会话");
            return;
        }
        
        // 2. 转发接受消息给发起者
        relaySignalMessage(session, message);
        
        // 3. 更新通话状态
        updateCallStatus(callId, "connected");
    }
    
    // 中继信令消息（offer, answer, ice-candidate）
    private void relaySignalMessage(WebSocketSession session, JSONObject message) {
        String targetUserId = message.getString("targetUserId");
        
        JSONObject relayMessage = new JSONObject();
        relayMessage.put("type", "webrtc-signal");
        relayMessage.put("data", message);
        
        sendMessageToUser(targetUserId, relayMessage);
    }
}
```

### 2. 数据库设计

```sql
-- 通话会话表
CREATE TABLE call_sessions (
    id VARCHAR(36) PRIMARY KEY,  -- callId
    caller_id VARCHAR(50) NOT NULL,
    callee_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- calling, ringing, connected, ended
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration INT DEFAULT 0  -- 通话时长（秒）
);

-- 通话记录表（可选，用于历史记录）
CREATE TABLE call_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    call_id VARCHAR(36) NOT NULL,
    caller_id VARCHAR(50) NOT NULL,
    callee_id VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration INT DEFAULT 0,
    status VARCHAR(20) NOT NULL  -- completed, missed, rejected
);
```

### 3. 关键后端方法实现

```java
// 获取用户WebSocket会话
private WebSocketSession getSessionByUserId(String userId) {
    return webSocketManager.getSessionByUserId(userId);
}

// 检查用户是否在通话中
private boolean isUserInCall(String userId) {
    return callSessionService.hasActiveCall(userId);
}

// 发送消息给指定用户
private void sendMessageToUser(String userId, JSONObject message) {
    WebSocketSession session = getSessionByUserId(userId);
    if (session != null && session.isOpen()) {
        webSocketManager.sendMessage(session, message.toString());
    }
}

// 记录通话会话
private void recordCallSession(String callId, String callerId, String calleeId, String status) {
    CallSession session = new CallSession();
    session.setId(callId);
    session.setCallerId(callerId);
    session.setCalleeId(calleeId);
    session.setStatus(status);
    callSessionService.save(session);
}

// 验证通话会话
private boolean validateCallSession(String callId, String userId) {
    CallSession session = callSessionService.findById(callId);
    return session != null && 
           (session.getCallerId().equals(userId) || session.getCalleeId().equals(userId));
}
```

### 4. 消息格式规范

#### 前端发送给后端的消息格式：
```json
{
  "type": "webrtc-signal",
  "data": {
    "type": "call-invite",
    "callId": "uuid-string",
    "targetUserId": "target-user-id",
    "callerInfo": {
      "id": "caller-user-id",
      "name": "caller-username",
      "avatar": "caller-avatar-url"
    }
  }
}
```

#### 后端转发给前端的消息格式：
```json
{
  "type": "webrtc-signal",
  "data": {
    "type": "call-invite",
    "callId": "uuid-string",
    "callerInfo": {
      "id": "caller-user-id",
      "name": "caller-username",
      "avatar": "caller-avatar-url"
    }
  }
}
```

### 5. 错误处理

```java
// 发送错误消息给前端
private void sendErrorMessage(WebSocketSession session, String errorMessage) {
    JSONObject error = new JSONObject();
    error.put("type", "webrtc-error");
    error.put("message", errorMessage);
    
    webSocketManager.sendMessage(session, error.toString());
}
```

### 6. 后端需要实现的核心功能

1. **用户在线状态管理**
   - 维护用户ID到WebSocket会话的映射
   - 处理用户上线/下线事件

2. **通话会话管理**
   - 创建、验证、更新通话会话
   - 防止重复通话和无效操作

3. **信令转发**
   - 将WebRTC信令消息在用户间转发
   - 确保消息的可靠传输

4. **状态同步**
   - 维护通话状态的一致性
   - 处理异常断线情况

## 故障排除

### 1. 无法获取麦克风权限
- 检查浏览器麦克风权限设置
- 确保在HTTPS环境下运行
- 检查系统麦克风是否被其他应用占用

### 2. 通话无声音
- 检查双方麦克风和扬声器设置
- 确认未开启静音
- 检查网络连接质量

### 3. 通话连接失败
- 检查WebSocket连接状态
- 确认双方都在线
- 检查防火墙和网络配置
- 验证后端信令转发是否正常

### 4. 通话气泡不显示
- 检查浏览器控制台错误信息
- 确认全局通话组件已正确挂载
- 检查通话状态管理器初始化

## 开发调试

### 前端调试
```javascript
// 启用详细日志
webrtcManager.debug = true;

// 监听所有WebRTC事件
webrtcManager.onCallStatusChange = (status) => {
  console.log('通话状态变化:', status);
};

webrtcManager.onError = (error) => {
  console.error('WebRTC错误:', error);
};
```

### 后端调试
- 记录所有WebRTC信令消息
- 监控通话会话状态变化
- 检查用户在线状态
- 验证消息转发路径

### 测试建议
1. 使用两个不同的浏览器标签页测试
2. 确保两个用户都已登录
3. 检查WebSocket连接状态
4. 监控前后端控制台输出
5. 测试各种异常情况（网络断开、页面刷新等）

## 后续扩展

- [ ] 视频通话支持
- [ ] 群组语音通话
- [ ] 通话录音功能
- [ ] 通话质量统计
- [ ] 自定义铃声
- [ ] 通话历史记录
- [ ] 离线消息推送
- [ ] 通话历史记录

## 注意事项

1. **隐私保护**: 通话为P2P连接，服务器不存储音频数据
2. **性能优化**: 通话时建议关闭其他占用带宽的应用
3. **电池消耗**: 长时间通话会增加设备电池消耗
4. **网络流量**: 语音通话会消耗网络流量，注意流量限制
