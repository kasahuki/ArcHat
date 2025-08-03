# WebRTC 后端信令处理示例

## Spring Boot + Netty WebRTC 信令处理

### 1. WebRTC 信令消息类型

```java
// WebRTC信令消息类型枚举
public enum WebRTCSignalType {
    CALL_INVITE,     // 通话邀请
    CALL_ACCEPT,     // 接受通话
    CALL_REJECT,     // 拒绝通话
    CALL_HANGUP,     // 挂断通话
    OFFER,           // SDP Offer
    ANSWER,          // SDP Answer
    ICE_CANDIDATE    // ICE候选
}

// WebRTC信令消息实体
@Data
public class WebRTCSignalMessage {
    private String type;
    private String callId;
    private String targetUserId;
    private String fromUserId;
    private Object data; // 可以是offer、answer、candidate等
    private CallerInfo callerInfo;
}

@Data
public class CallerInfo {
    private String id;
    private String name;
    private String avatar;
}
```

### 2. WebSocket消息处理器

```java
@Component
public class WebRTCSignalHandler {
    
    @Autowired
    private WebSocketSessionManager sessionManager;
    
    /**
     * 处理WebRTC信令消息
     */
    public void handleWebRTCSignal(WebSocketSession session, WebRTCSignalMessage message) {
        String fromUserId = getUserIdFromSession(session);
        message.setFromUserId(fromUserId);
        
        switch (message.getType()) {
            case "call-invite":
                handleCallInvite(session, message);
                break;
            case "call-accept":
                handleCallAccept(session, message);
                break;
            case "call-reject":
                handleCallReject(session, message);
                break;
            case "call-hangup":
                handleCallHangup(session, message);
                break;
            case "offer":
                handleOffer(session, message);
                break;
            case "answer":
                handleAnswer(session, message);
                break;
            case "ice-candidate":
                handleIceCandidate(session, message);
                break;
        }
    }
    
    /**
     * 处理通话邀请
     */
    private void handleCallInvite(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            // 转发通话邀请给目标用户
            sendToUser(targetSession, message);
            log.info("转发通话邀请: {} -> {}", message.getFromUserId(), targetUserId);
        } else {
            // 目标用户不在线，发送失败消息
            WebRTCSignalMessage errorMessage = new WebRTCSignalMessage();
            errorMessage.setType("call-error");
            errorMessage.setData("目标用户不在线");
            sendToUser(session, errorMessage);
        }
    }
    
    /**
     * 处理通话接受
     */
    private void handleCallAccept(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            sendToUser(targetSession, message);
            log.info("转发通话接受: {} -> {}", message.getFromUserId(), targetUserId);
        }
    }
    
    /**
     * 处理通话拒绝
     */
    private void handleCallReject(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            sendToUser(targetSession, message);
            log.info("转发通话拒绝: {} -> {}", message.getFromUserId(), targetUserId);
        }
    }
    
    /**
     * 处理通话挂断
     */
    private void handleCallHangup(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            sendToUser(targetSession, message);
            log.info("转发通话挂断: {} -> {}", message.getFromUserId(), targetUserId);
        }
    }
    
    /**
     * 处理SDP Offer
     */
    private void handleOffer(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            sendToUser(targetSession, message);
            log.info("转发SDP Offer: {} -> {}", message.getFromUserId(), targetUserId);
        }
    }
    
    /**
     * 处理SDP Answer
     */
    private void handleAnswer(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            sendToUser(targetSession, message);
            log.info("转发SDP Answer: {} -> {}", message.getFromUserId(), targetUserId);
        }
    }
    
    /**
     * 处理ICE候选
     */
    private void handleIceCandidate(WebSocketSession session, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        WebSocketSession targetSession = sessionManager.getSession(targetUserId);
        
        if (targetSession != null && targetSession.isOpen()) {
            sendToUser(targetSession, message);
            log.info("转发ICE候选: {} -> {}", message.getFromUserId(), targetUserId);
        }
    }
    
    /**
     * 发送消息给指定用户
     */
    private void sendToUser(WebSocketSession session, WebRTCSignalMessage message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
        } catch (Exception e) {
            log.error("发送WebRTC信令失败", e);
        }
    }
    
    /**
     * 从会话中获取用户ID
     */
    private String getUserIdFromSession(WebSocketSession session) {
        // 实现获取用户ID的逻辑
        return (String) session.getAttributes().get("userId");
    }
}
```



**使用 netty 等效 ** **WebSocketSession` -> `io.netty.channel.Channel** 

~~~java


// WebRTCSignalMessage 类需要你自己定义
// ObjectMapper 也需要被注入或创建
public class WebRTCSignalHandler {

    // 使用静态的Channel管理器，或者通过构造函数注入
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 所有的处理逻辑都和你的Spring代码基本一致，只是WebSocketSession换成了Channel
    public void handleWebRTCSignal(Channel channel, WebRTCSignalMessage message) {
        String fromUserId = getUserIdFromChannel(channel);
        if (fromUserId == null) {
            // 如果无法获取用户ID，则无法处理
            return;
        }
        message.setFromUserId(fromUserId);

        switch (message.getType()) {
            case "call-invite":
                handleCallInvite(channel, message);
                break;
            // 其他 case 保持不变
            case "call-accept":
                handleCallAccept(channel, message);
                break;
            case "call-reject":
                handleCallReject(channel, message);
                break;
            case "call-hangup":
                handleCallHangup(channel, message);
                break;
            case "offer":
                handleOffer(channel, message);
                break;
            case "answer":
                handleAnswer(channel, message);
                break;
            case "ice-candidate":
                handleIceCandidate(channel, message);
                break;
        }
    }

    // 其他 handleXxx 方法...
    // 逻辑和你的Spring代码完全一样，只是把WebSocketSession换成了Channel
    private void handleCallInvite(Channel channel, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        Channel targetChannel = NettyChannelManager.getChannel(targetUserId);

        if (targetChannel != null && targetChannel.isActive()) {
            sendToUser(targetChannel, message);
            System.out.printf("转发通话邀请: %s -> %s%n", message.getFromUserId(), targetUserId);
        } else {
            // 目标用户不在线
            WebRTCSignalMessage errorMessage = new WebRTCSignalMessage();
            errorMessage.setType("call-error");
            errorMessage.setData("目标用户不在线");
            sendToUser(channel, errorMessage);
        }
    }
    
    private void handleOffer(Channel channel, WebRTCSignalMessage message) {
        String targetUserId = message.getTargetUserId();
        Channel targetChannel = NettyChannelManager.getChannel(targetUserId);

        if (targetChannel != null && targetChannel.isActive()) {
            sendToUser(targetChannel, message);
            System.out.printf("转发SDP Offer: %s -> %s%n", message.getFromUserId(), targetUserId);
        }
    }

    // 重写 sendToUser 方法，使用 Netty 的 TextWebSocketFrame
    private void sendToUser(Channel channel, WebRTCSignalMessage message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            // Netty使用TextWebSocketFrame来包装文本消息
            channel.writeAndFlush(new TextWebSocketFrame(jsonMessage));
        } catch (JsonProcessingException e) {
            System.err.println("发送WebRTC信令失败" + e.getMessage());
        }
    }

    // 从Channel中获取用户ID
    private String getUserIdFromChannel(Channel channel) {
        // 在Netty中，通常将用户ID存储在Channel的Attribute中
        // 需要在连接建立时（handshake）将userId绑定到Channel上
        return channel.attr(AttributeKey.valueOf("userId")).get();
    }
}
~~~









---



### 3. WebSocket消息路由

```java
@Component
public class WebSocketMessageRouter {
    
    @Autowired
    private WebRTCSignalHandler webrtcHandler;
    
    /**
     * 路由WebSocket消息
     */
    public void routeMessage(WebSocketSession session, String message) {
        try {
            JsonNode messageNode = objectMapper.readTree(message);
            String type = messageNode.get("type").asText();
            
            if ("webrtc-signal".equals(type)) {
                // 处理WebRTC信令消息
                WebRTCSignalMessage signalMessage = objectMapper.treeToValue(
                    messageNode.get("data"), WebRTCSignalMessage.class);
                webrtcHandler.handleWebRTCSignal(session, signalMessage);
            } else {
                // 处理其他类型消息
                handleOtherMessage(session, messageNode);
            }
        } catch (Exception e) {
            log.error("消息路由失败", e);
        }
    }
}
```

### 4. 前端发送消息格式

```javascript
// 前端发送WebRTC信令的格式
const signalMessage = {
  type: 'webrtc-signal',
  data: {
    type: 'call-invite',
    callId: 'call_123456',
    targetUserId: 'user_789',
    callerInfo: {
      id: 'user_123',
      name: '张三',
      avatar: 'avatar_url'
    }
  }
};

websocket.send(JSON.stringify(signalMessage));
```

### 5. 后端响应消息格式

```json
{
  "type": "webrtc-signal",
  "data": {
    "type": "call-invite",
    "callId": "call_123456",
    "fromUserId": "user_123",
    "targetUserId": "user_789",
    "callerInfo": {
      "id": "user_123",
      "name": "张三",
      "avatar": "avatar_url"
    }
  }
}
```

## 注意事项

1. **安全性**: 确保只有授权用户才能发起通话
2. **状态管理**: 跟踪通话状态，防止重复通话
3. **错误处理**: 处理网络断开、用户离线等异常情况
4. **资源清理**: 通话结束后清理相关资源
5. **日志记录**: 记录通话相关操作用于调试和统计
