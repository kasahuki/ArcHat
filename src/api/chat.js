import emitter from '@/utils/eventBus';

class ChatWebSocket {
  constructor({ url, token, onMessage, onOpen, onClose, onError }) {
    this.url = url;
    this.token = token;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.ws = null;
    this.heartbeatInterval = null;
    this.reconnectTimeout = null;
    this.reconnectDelay = 3000;
    this.reconnectAttempts = 0;
    this.isLoggedOut = false;
    this.lastHeartbeatResponse = Date.now();
    this.heartbeatTimeout = null;
    this.isConnecting = false;
    this.connectionStatus = 'disconnected'; // 'connecting', 'connected', 'disconnected'
    this.healthCheckInterval = null; // 连接健康检查定时器
    this.connect();
  }

  connect() {
    if (this.isLoggedOut || this.isConnecting) {
      console.log('用户已登出或正在连接中，跳过连接');
      return;
    }
    
    this.isConnecting = true;
    this.connectionStatus = 'connecting';
    
    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`;
      console.log('尝试连接 WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('WebSocket 连接成功');
        this.isConnecting = false;
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.lastHeartbeatResponse = Date.now();
        this.startHeartbeat();
        this.startHealthCheck();
        this.onOpen && this.onOpen(event);
        // 触发连接成功事件，通知GroupChat关闭loading动画
        emitter.emit('websocket-connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 2) { // 心跳响应
            this.lastHeartbeatResponse = Date.now();
          }
          this.onMessage && this.onMessage(event);
        } catch (error) {
          console.error('处理消息失败:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket 连接关闭:', event.code, event.reason);
        console.log('关闭详情:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          isLoggedOut: this.isLoggedOut,
          timestamp: new Date().toISOString()
        });
        this.isConnecting = false;
        this.connectionStatus = 'disconnected';
        this.stopHeartbeat();
        this.stopHealthCheck();
        this.onClose && this.onClose(event);
        
        // 只有在非正常关闭且未登出的情况下才重连
        if (!this.isLoggedOut && event.code !== 1000) {
          console.log('准备重连...');
          this.reconnect();
        } else {
          //  手动触发重连 显示重连弹窗
          emitter.emit('websocket-reconnect');
        }
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket 错误:', event);
        console.error('错误详情:', {
          type: event.type,
          target: event.target,
          readyState: event.target?.readyState
        });
        this.isConnecting = false;
        this.connectionStatus = 'disconnected';
        this.onError && this.onError(event);
      };
      
      // 添加网络状态监听
      this.addNetworkListeners();
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error);
      this.isConnecting = false;
      this.connectionStatus = 'disconnected';
      this.onError && this.onError(error);
      if (!this.isLoggedOut) {
        this.reconnect();
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('WebSocket 未连接，无法发送消息');
    }
  }

  // 开始连接健康检查
  startHealthCheck() {
    this.stopHealthCheck();
    
    this.healthCheckInterval = setInterval(() => {
      if (this.isLoggedOut) {
        this.stopHealthCheck();
        return;
      }
      
      // 检查WebSocket连接状态
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        console.log('检测到WebSocket连接异常，状态:', this.ws.readyState);
        if (this.connectionStatus === 'connected') {
          console.log('连接状态不一致，更新状态');
          this.connectionStatus = 'disconnected';
          this.onClose && this.onClose({ code: 1006, reason: '连接异常' });
        }
      }
    }, 30000); // 每30秒检查一次
  }

  // 停止连接健康检查
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat(); // 确保清理之前的定时器
    
    console.log('开始心跳包检测');
    this.heartbeatInterval = setInterval(() => {
      if (this.isLoggedOut || this.connectionStatus !== 'connected') {
        console.log('停止心跳包：用户已登出或连接已断开');
        this.stopHeartbeat();
        return;
      }

      const now = Date.now();
      const timeSinceLastResponse = now - this.lastHeartbeatResponse;
      
      console.log(`心跳包检测 - 距离上次响应: ${timeSinceLastResponse}ms, 当前时间: ${now}, 上次响应时间: ${this.lastHeartbeatResponse}`);
      
      // 只有在真正长时间没有心跳响应时才断开连接
      if (timeSinceLastResponse > 120000) { // 增加到2分钟超时，给网络更多缓冲
        console.log('心跳超时（2分钟无响应），重新连接...');
        this.ws.close();
        return;
      }

      console.log('发送心跳包');
      this.send({ type: 2 });
    }, 15000); // 每15秒发送一次心跳，确保后端能及时收到
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  reconnect() {
    if (this.reconnectTimeout || this.isLoggedOut || this.isConnecting) return;
    
    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts})...`);
    
    // 使用更温和的重连策略
    let delay;
    if (this.reconnectAttempts <= 3) {
      delay = 2000; // 前3次重连，2秒间隔
    } else if (this.reconnectAttempts <= 6) {
      delay = 5000; // 4-6次重连，5秒间隔
    } else {
      delay = 10000; // 7次以后，10秒间隔
    }
    
    console.log(`将在 ${delay}ms 后重连`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
      this.reconnectTimeout = null;
    }, delay);
  }

  // 手动重连方法
  manualReconnect() {
    console.log('手动重连 WebSocket');
    this.reconnectAttempts = 0;
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
    }
    this.connect();
  }

  close() {
    this.isLoggedOut = true;
    this.connectionStatus = 'disconnected';
    this.stopHeartbeat();
    this.stopHealthCheck();
    this.removeNetworkListeners();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close(1000, '正常关闭');
      this.ws = null;
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.connectionStatus;
  }

  // 检查是否连接
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // 添加网络状态监听
  addNetworkListeners() {
    // 监听网络状态变化
    if (typeof window !== 'undefined' && 'navigator' in window) {
      window.addEventListener('online', () => {
        console.log('网络已连接，尝试重连 WebSocket');
        if (!this.isLoggedOut && this.connectionStatus !== 'connected') {
          this.manualReconnect();
        }
      });
      
      window.addEventListener('offline', () => {
        console.log('网络已断开');
        this.connectionStatus = 'disconnected';
      });
    }
  }

  // 移除网络状态监听
  removeNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.manualReconnect);
      window.removeEventListener('offline', () => {
        this.connectionStatus = 'disconnected';
      });
    }
  }
}

export default ChatWebSocket