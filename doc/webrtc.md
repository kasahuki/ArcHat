# WebRTC 语音通话功能设计文档

本文档旨在详细阐述在聊天应用中集成 WebRTC 语音通话功能的前后端设计方案与实现细节。

---

## 1. 业务场景与需求

### 1.1. 业务场景

用户在与另一位用户的聊天页面（`chat.vue`）中，希望通过 WebRTC 技术发起点对点（P2P）的实时语音通话。聊天页面的路由格式为 `/chat/{userId}`，其中 `{userId}` 是对方用户的 ID。

### 1.2. 功能需求

- **发起通话**：用户点击“语音通话”按钮，通过 WebSocket 向后端发送呼叫请求。
- **信令交互**：后端作为信令服务器，在两个用户之间转发 WebRTC 协商所需的消息（如 `offer`, `answer`, `ice-candidate`）。
- **通话接纳/拒绝**：被呼叫方可以接受或拒绝通话请求。
- **媒体传输**：通话建立后，语音数据通过浏览器之间的 P2P 连接直接传输，不经过服务器。
- **状态同步**：通话的建立、挂断等状态需要实时同步给双方。

## 2. 技术栈

- **前端**: Vue 3, WebSocket, WebRTC (natively in browser)
- **后端**: Spring Boot 3, Netty WebSocket, Redis, RabbitMQ (for future scaling)

## 3. 前端组件职责 (`chat.vue`)

前端的核心职责是管理 WebRTC 连接生命周期、处理用户交互以及与信令服务器通信。

### 3.1. 状态管理

需要维护通话状态机，例如：`idle`, `calling`, `ringing`, `in-call`, `rejected`, `failed`。

### 3.2. 核心流程

1.  **初始化**：
    -   组件加载时，初始化 `RTCPeerConnection` 对象。
    -   从路由参数中解析 `calleeId`（对方用户 ID）。
    -   从全局状态（如 Pinia/Vuex）中获取 `callerId`（当前用户 ID）。
    -   注册 `RTCPeerConnection` 的事件监听器，尤其是 `onicecandidate` 和 `ontrack`。

2.  **发起通话 (Caller)**：
    -   用户点击“语音通话”按钮。
    -   调用 `navigator.mediaDevices.getUserMedia({ audio: true })` 获取本地音频流。
    -   将获取到的音频轨道（track）添加到 `RTCPeerConnection` 中：`pc.addTrack(track, stream)`。
    -   向 WebSocket 发送 `call-request` 消息。
    -   更新 UI 为“正在呼叫...”。

3.  **接收通话请求 (Callee)**：
    -   WebSocket 收到 `call-request` 消息。
    -   弹窗提示“XXX 请求与你语音通话”，提供“接受”和“拒绝”按钮。

4.  **响应通话**：
    -   **接受 (Callee)**：
        -   点击“接受”按钮。
        -   同样调用 `getUserMedia` 获取自己的音频流并添加到 `RTCPeerConnection`。
        -   向 WebSocket 发送 `call-response` (accept) 消息。
        -   等待 `offer` 消息。
    -   **拒绝 (Callee)**：
        -   点击“拒绝”按钮。
        -   向 WebSocket 发送 `call-response` (reject) 消息。

5.  **SDP 与 ICE 协商**：
    -   **Caller**：收到 `call-response` (accept) 后，创建 `offer` (`pc.createOffer()`)，设置本地描述 (`pc.setLocalDescription(offer)`)，并通过 WebSocket 发送 `offer` 消息。
    -   **Callee**：收到 `offer` 后，设置远端描述 (`pc.setRemoteDescription(offer)`)，创建 `answer` (`pc.createAnswer()`)，设置本地描述 (`pc.setLocalDescription(answer)`)，并通过 WebSocket 发送 `answer` 消息。
    -   **Caller**：收到 `answer` 后，设置远端描述 (`pc.setRemoteDescription(answer)`)。
    -   **双方**：`onicecandidate` 事件触发时，将 `candidate` 通过 WebSocket 发送给对方。收到对方的 `ice-candidate` 后，通过 `pc.addIceCandidate(candidate)` 添加。

6.  **通话建立**：
    -   当 `RTCPeerConnection` 的 `connectionState` 变为 `connected` 时，表示通话成功建立。
    -   **双方**：通过 `ontrack` 事件接收对方的媒体流，并将其附加到 `<audio>` 元素上进行播放。
    -   更新 UI 为通话中状态，显示通话时长等信息。

7.  **挂断通话**：
    -   任意一方点击“挂断”按钮。
    -   关闭 `RTCPeerConnection` (`pc.close()`)。
    -   向 WebSocket 发送 `hang-up` 消息通知对方。
    -   重置本地状态到 `idle`。

## 4. 后端职责

后端作为信令中心，不处理媒体数据，仅负责消息的路由和转发，并维护用户在线状态。

### 4.1. 在线状态判断

- **Redis 数据结构**：使用 Redis 的 `SET` 或 `String` 类型来记录在线用户。
    -   **Key 设计**: `online:user:{userId}`
    -   **Value**: 可以简单存一个标识位 `1`。
    -   **过期时间 (TTL)**: 设置一个合理的过期时间，例如 60 秒。前端需要实现心跳机制（例如每 30 秒通过 WebSocket 发送一个 `ping` 消息），后端收到 `ping` 后刷新该 Key 的过期时间。
- **呼叫前检查**：在转发 `call-request` 之前，后端应首先检查 `calleeId` 对应的 Redis Key 是否存在。如果不存在，则认为对方不在线，直接返回错误消息给 `caller`。

### 4.2. 消息中转逻辑

- 后端 WebSocket 服务需要维护一个 `userId` 到 `WebSocket Session` 的映射关系，以便将消息精确地发送给目标用户。
- 收到任何一方发来的信令消息后，解析出 `to` 字段，从映射中找到对方的 `Session`，并将消息原样转发。

### 4.3. 多节点部署 (RabbitMQ)

当应用扩展到多个 WebSocket 服务器实例时，用户可能连接在不同的实例上。此时需要 RabbitMQ 来实现跨实例的消息通信。

- **模型**：使用 Fanout Exchange（扇出交换机）。
- **流程**：
    1.  每个 WebSocket 服务器实例启动时，都创建一个唯一的队列，并绑定到同一个 Fanout Exchange 上。
    2.  当实例 A 的用户要发消息给实例 B 的用户时，实例 A 将消息发布到 Fanout Exchange。
    3.  RabbitMQ 会将该消息广播给所有绑定的队列，包括实例 B 的队列。
    4.  实例 B 从自己的队列中消费到消息，然后通过本地的 `Session` 映射找到目标用户并发送。

## 5. 消息格式定义 (JSON)

所有消息都应包含 `type`, `from`, `to` 字段，以便后端路由。`data` 字段用于存放具体业务数据。

```json
// 通用消息结构
{
  "type": "...",
  "from": "callerId",
  "to": "calleeId",
  "data": { ... }
}
```

### 示例

1.  **发起呼叫请求**
    ```json
    {
      "type": "call-request",
      "from": "user-111",
      "to": "user-222",
      "data": {
        "callType": "audio"
      }
    }
    ```

2.  **响应呼叫**
    ```json
    {
      "type": "call-response",
      "from": "user-222",
      "to": "user-111",
      "data": {
        "accepted": true // or false
      }
    }
    ```

3.  **SDP Offer**
    ```json
    {
      "type": "offer",
      "from": "user-111",
      "to": "user-222",
      "data": {
        "sdp": { ... } // SDP 对象
      }
    }
    ```

4.  **SDP Answer**
    ```json
    {
      "type": "answer",
      "from": "user-222",
      "to": "user-111",
      "data": {
        "sdp": { ... } // SDP 对象
      }
    }
    ```

5.  **ICE Candidate**
    ```json
    {
      "type": "ice-candidate",
      "from": "user-111",
      "to": "user-222",
      "data": {
        "candidate": { ... } // Candidate 对象
      }
    }
    ```

6.  **挂断**
    ```json
    {
      "type": "hang-up",
      "from": "user-111",
      "to": "user-222",
      "data": {}
    }
    ```

## 6. WebRTC 信令流程

以下是简化的信令交互流程图：

```mermaid
graph TD
    subgraph Caller (User A)
        A1[点击呼叫]
        A2[获取本地音频流]
        A3[发送 call-request]
        A4[收到 call-response(accept)]
        A5[创建 Offer]
        A6[发送 Offer]
        A7[收到 Answer]
        A8[设置远端描述]
    end

    subgraph Signaling Server
        S1[检查 User B 是否在线]
        S2[转发 call-request]
        S3[转发 call-response]
        S4[转发 Offer]
        S5[转发 Answer]
        S6[双向转发 ICE Candidates]
    end

    subgraph Callee (User B)
        B1[收到 call-request]
        B2[用户选择接受]
        B3[发送 call-response(accept)]
        B4[收到 Offer]
        B5[设置远端描述]
        B6[创建 Answer]
        B7[发送 Answer]
    end

    A1 --> A2
    A2 --> A3 --> S1
    S1 -- 在线 --> S2 --> B1
    B1 --> B2 --> B3 --> S3 --> A4
    A4 --> A5 --> A6 --> S4 --> B4
    B4 --> B5 --> B6 --> B7 --> S5 --> A7
    A7 --> A8

    A5 -- onicecandidate --> S6
    B6 -- onicecandidate --> S6
    S6 -- 转发 --> A8
    S6 -- 转发 --> B5

    A8 <--> B5
    A8 -- 连接建立 --> C1[通话中]
    B5 -- 连接建立 --> C1
```

## 7. 异常情况处理

- **被叫方不在线**：后端检查 Redis 后发现 `callee` 不在线，直接向 `caller` 发送一条错误消息（如 `user-unavailable`），前端收到后提示用户“对方不在线”并结束呼叫流程。
- **被叫方拒绝接听**：`callee` 发送 `call-response` (reject)，`caller` 收到后提示“对方已拒绝”并结束呼叫。
- **呼叫超时**：`caller` 发起呼叫后，可以启动一个定时器（如 30 秒）。若超时仍未收到 `call-response`，则自动挂断，并提示“无人接听”。
- **SDP/ICE 协商失败**：`RTCPeerConnection` 的 `connectionState` 变为 `failed`。这通常由网络问题（如严格的 NAT 或防火墙）引起。此时应提示用户“连接失败，请检查网络环境”，并关闭连接。
- **WebSocket 断线**：在通话过程中，如果 WebSocket 连接断开，通话会继续（因为媒体流是 P2P 的），但无法再发送挂断等信令。应实现 WebSocket 的自动重连机制。如果重连失败，可以考虑结束通话。
- **获取媒体设备失败**：`getUserMedia` 失败（如用户未授权、无麦克风设备）。应捕获该错误并向用户明确提示原因。

---

## 8. 故障排除指南

### 8.1. 通话按钮点击无响应问题

**问题现象**：
- 用户点击通话按钮后没有任何反应
- 控制台没有相关日志输出
- 通话选项弹窗正常显示，但选择语音通话后无效果

**问题根因**：
`Chat.vue` 组件中虽然导入了 `useCallStore` 并创建了 `callStore` 实例，但是**从未初始化 WebRTC 管理器**，导致通话功能无法工作。

**解决方案**：

#### 步骤 1：在 Chat.vue 的 onMounted 中初始化 callStore

```javascript
// 在 onMounted 生命周期中添加
onMounted(() => {
  // ... 其他初始化代码 ...
  
  // 初始化通话管理器
  try {
    const success = callStore.initCallManager(userStore.chatWS, userStore.userInfo);
    if (success) {
      console.log('通话管理器初始化成功');
    } else {
      console.error('通话管理器初始化失败');
    }
  } catch (error) {
    console.error('通话管理器初始化错误:', error);
  }
});
```

#### 步骤 2：在 onUnmounted 中清理资源

```javascript
// 在 onUnmounted 生命周期中添加
onUnmounted(() => {
  // ... 其他清理代码 ...
  
  // 清理通话管理器资源
  try {
    callStore.cleanup();
    console.log('通话管理器资源清理成功');
  } catch (error) {
    console.error('通话管理器资源清理错误:', error);
  }
});
```

**验证修复**：

1. 刷新页面，确保新代码生效
2. 打开浏览器开发者工具的控制台
3. 点击通话按钮，应该看到以下日志：
   - `"通话管理器初始化成功"`
   - `"CallOptionsPopup: 语音通话按钮被点击"`
   - `"Chat.vue startVoiceCall 函数被调用"`
   - `"正在发起语音通话..."`

**相关文件**：
- `src/views/chat/Chat.vue` - 主要修改文件
- `src/stores/call.js` - 通话状态管理
- `src/utils/webrtc.js` - WebRTC 管理器
- `src/components/CallOptionsPopup.vue` - 通话选项弹窗

### 8.2. WebSocket 变量引用错误

**问题现象**：
- WebRTC 管理器初始化失败
- 控制台出现 `chatWS` 相关的引用错误

**问题根因**：
在某些文件中错误地使用了 `userInfoStore.userInfo.chatWS`，而正确的引用应该是 `userInfoStore.chatWS`。

**解决方案**：
检查并修正所有相关文件中的 `chatWS` 变量引用：

```javascript
// ❌ 错误的引用
userInfoStore.userInfo.chatWS

// ✅ 正确的引用
userInfoStore.chatWS
```

**影响文件**：
- `src/stores/call.js` - 已修复
- 其他可能引用 `chatWS` 的文件

### 8.3. WebRTC 信令消息类型不一致

**问题现象**：
- WebRTC 信令消息发送失败
- 后端无法识别信令消息类型
- WebSocket 连接异常断开

**解决方案**：
统一使用数字类型 `6` 作为 WebRTC 信令消息类型：

```javascript
// webrtc.js - sendSignal 方法
sendSignal(data) {
  if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket 未连接');
    return;
  }
  
  const message = {
    type: 6, // WebRTC 信令消息类型
    data: JSON.stringify(data)
  };
  
  this.websocket.send(JSON.stringify(message));
}
```

```javascript
// user.js - WebSocket 消息处理
switch (message.type) {
  case 6: // WebRTC 信令消息
    console.log('收到 WebRTC 信令消息:', message.data);
    emitter.emit('webrtc-signal', JSON.parse(message.data));
    break;
  // ... 其他消息类型
}
```

**消息类型映射**：
- `1000`: 聊天消息
- `1001`: 好友申请消息  
- `2`: 心跳包
- `4`: 群消息
- `5`: 用户上下线通知
- `6`: WebRTC 信令消息

### 8.4. 调试技巧

**启用详细日志**：
在开发过程中，可以在相关文件中添加详细的调试日志：

```javascript
// 在关键方法中添加日志
console.log('WebRTC 管理器状态:', {
  isInitialized: !!this.peerConnection,
  signalingState: this.peerConnection?.signalingState,
  connectionState: this.peerConnection?.connectionState,
  callStatus: this.callStatus
});
```

**检查 WebSocket 连接**：
```javascript
console.log('WebSocket 状态:', {
  readyState: this.websocket?.readyState,
  url: this.websocket?.url
});
```

**验证事件流程**：
确保事件传递链路完整：
1. `CallOptionsPopup.vue` 发送 `voice-call` 事件
2. `Chat.vue` 监听并调用 `startVoiceCall` 方法
3. `callStore.startVoiceCall` 被正确调用
4. `webrtcManager` 发送信令消息

