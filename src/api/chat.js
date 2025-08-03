import emitter from '@/utils/eventBus';
import { ref } from 'vue';

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
    this.connectionStatus = ref('disconnected'); // 'connecting', 'connected', 'disconnected'
    this.healthCheckInterval = null; // 连接健康检查定时器
    
    //#region 防止浏览器后台断开WebSocket连接
    // 页面可见性相关 - 防止后台断开
    this.isPageVisible = !document.hidden;
    this.backgroundHeartbeatInterval = null;
    this.visibilityChangeHandler = null;
    //#endregion
    
    this.connect();
    //#region 防止浏览器后台断开WebSocket连接 - 初始化
    this.addVisibilityListeners();
    //#endregion
  }

  connect() {
    if (this.isLoggedOut || this.isConnecting) {
      console.log('用户已登出或正在连接中，跳过连接');
      return;
    }
    
    this.isConnecting = true;
    this.connectionStatus.value = 'connecting';
    
    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`;
      console.log('尝试连接 WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('WebSocket 连接成功');
        this.isConnecting = false;
        this.connectionStatus.value = 'connected';
        this.reconnectAttempts = 0;
        this.lastHeartbeatResponse = Date.now();
        this.startHeartbeat();
        this.startHealthCheck();
        this.onOpen && this.onOpen(event);
        // 触发连接成功事件，通知GroupChat关闭loading动画
        emitter.emit('websocket:connected');
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
        this.connectionStatus.value = 'disconnected';
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
        this.connectionStatus.value = 'disconnected';
        this.onError && this.onError(event);
      };
      
      // 添加网络状态监听
      this.addNetworkListeners();
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error);
      this.isConnecting = false;
      this.connectionStatus.value = 'disconnected';
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
        if (this.connectionStatus.value === 'connected') {
          console.log('连接状态不一致，更新状态');
          this.connectionStatus.value = 'disconnected';
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
      if (this.isLoggedOut || this.connectionStatus.value !== 'connected') {
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
    this.connectionStatus.value = 'disconnected';
    this.stopHeartbeat();
    this.stopHealthCheck();
    this.removeNetworkListeners();
    //#region 防止浏览器后台断开WebSocket连接 - 清理
    this.removeVisibilityListeners(); // 清理页面可见性监听器
    //#endregion
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
    return this.connectionStatus.value;
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
        if (!this.isLoggedOut && this.connectionStatus.value !== 'connected') {
          this.manualReconnect();
        }
      });
      
      window.addEventListener('offline', () => {
        console.log('网络已断开');
        this.connectionStatus.value = 'disconnected';
      });
    }
  }

  // 移除网络状态监听
  removeNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.manualReconnect);
      window.removeEventListener('offline', () => {
        this.connectionStatus.value = 'disconnected';
      });
    }
  }

  //#region 防止浏览器后台断开WebSocket连接 - 方法实现
  // 添加页面可见性监听 - 防止后台断开
  addVisibilityListeners() {
    if (typeof document === 'undefined') return;
    
    this.visibilityChangeHandler = () => {
      this.isPageVisible = !document.hidden;
      
      if (this.isPageVisible) {
        console.log('页面变为可见，恢复正常心跳');
        // 页面变为可见时，停止后台心跳，恢复正常心跳
        this.stopBackgroundHeartbeat();
        if (this.connectionStatus.value === 'connected') {
          this.startHeartbeat();
        }
        // 检查连接状态，如果断开则重连
        if (!this.isConnected() && !this.isLoggedOut) {
          console.log('页面恢复可见时发现连接断开，尝试重连');
          this.manualReconnect();
        }
      } else {
        console.log('页面变为后台，启动后台心跳保持连接');
        // 页面变为后台时，使用更频繁的心跳保持连接
        this.startBackgroundHeartbeat();
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    
    // 监听页面焦点变化作为补充
    window.addEventListener('focus', () => {
      if (!this.isPageVisible) {
        this.isPageVisible = true;
        this.visibilityChangeHandler();
      }
    });
    
    window.addEventListener('blur', () => {
      // blur事件可能比visibilitychange更早触发，这里做一个延迟检查
      setTimeout(() => {
        if (document.hidden && this.isPageVisible) {
          this.isPageVisible = false;
          this.visibilityChangeHandler();
        }
      }, 100);
    });
  }

  // 移除页面可见性监听
  removeVisibilityListeners() {
    if (typeof document !== 'undefined' && this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
    this.stopBackgroundHeartbeat();
  }

  // 启动后台心跳 - 更频繁的心跳保持连接
  startBackgroundHeartbeat() {
    this.stopBackgroundHeartbeat();
    this.stopHeartbeat(); // 停止正常心跳
    
    console.log('启动后台心跳保持连接');
    this.backgroundHeartbeatInterval = setInterval(() => {
      if (this.isLoggedOut || this.connectionStatus.value !== 'connected') {
        this.stopBackgroundHeartbeat();
        return;
      }
      
      // 后台时使用更短的心跳间隔
      console.log('发送后台心跳包');
      this.send({ type: 2 });
    }, 8000); // 8秒间隔，比正常心跳更频繁
  }

  // 停止后台心跳
  stopBackgroundHeartbeat() {
    if (this.backgroundHeartbeatInterval) {
      clearInterval(this.backgroundHeartbeatInterval);
      this.backgroundHeartbeatInterval = null;
      console.log('停止后台心跳');
    }
  }
  //#endregion
}

export default ChatWebSocket