

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
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.isLoggedOut = false;
    this.connect();
  }

  connect() {
    if (this.isLoggedOut) return;
    
    try {
      // 带token参数
      const wsUrl = `${this.url}?token=${this.token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('WebSocket 连接成功');
        this.reconnectAttempts = 0; // 重置重连次数
        this.startHeartbeat();
        this.onOpen && this.onOpen(event);
      };

      this.ws.onmessage = (event) => {
      
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket 连接关闭:', event.code, event.reason);
        this.stopHeartbeat();
        this.onClose && this.onClose(event);
        if (!this.isLoggedOut) {
          this.reconnect();
        }
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket 错误:', event);
        this.onError && this.onError(event);
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error);
      this.onError && this.onError(error);
      if (!this.isLoggedOut) {
        this.reconnect();
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(() => {
      if (!this.isLoggedOut) {
        this.send({ type: 2 });
      }
    }, 10000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  reconnect() {
    if (this.reconnectTimeout || this.isLoggedOut) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
      this.reconnectTimeout = null;
    }, this.reconnectDelay * this.reconnectAttempts); // 递增重连延迟
  }

  close() {
    this.isLoggedOut = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default ChatWebSocket