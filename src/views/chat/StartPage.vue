<template>
  <div class="start-page">
    <div class="start-content">
      <div class="welcome-section">
        <div class="welcome-header">
          <img src="/src/assets/image/peoples.svg" class="welcome-image" alt="people decoration" />
          <h1>欢迎来到 ArcChat<span><img src="/src/assets/image/archat.png" alt="" width="10%"></span></h1>
          <p class="subtitle">开启即时通讯之旅</p>
        </div>
      </div>
      
      <div class="guide-section">
        <div class="guide-item">
          <el-icon class="guide-icon"><User /></el-icon>
          <div class="guide-text">
            <h3>好友聊天</h3>
            <p>在左侧好友列表中选择好友开始私聊</p>
          </div>
        </div>
        
        <div class="guide-item">
          <el-icon class="guide-icon"><ChatDotRound /></el-icon>
          <div class="guide-text">
            <h3>群组聊天</h3>
            <p>在群聊列表中选择群聊开始聊天</p>
          </div>
        </div>
        
        <div class="guide-item">
          <el-icon class="guide-icon"><Setting /></el-icon>
          <div class="guide-text">
            <h3>个人中心</h3>
            <p>在右下角设置中自定义您的个人信息</p>
          </div>
        </div>
      </div>

      <div class="features-section">
        <div class="feature-tag">实时通讯</div>
        <div class="feature-tag">敏感词过滤</div>
        <div class="feature-tag">AI助手</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, ChatDotRound, Setting } from '@element-plus/icons-vue'
</script>

<style scoped>
.start-page {
  border-radius: 10px;
  padding: 0;
  height: 110%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);

}

.start-content {
  max-width: 700px;
  width: 100%;
  text-align: center;
  color: var(--text-color);
  transform: translateY(-5%);
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-image {
  width: 520px;
  height: 200px;
  margin-bottom: 16px;
  opacity: 0.8;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

.welcome-image:hover {
  transform: scale(1.05);
  opacity: 1;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  background: linear-gradient(45deg, var(--primary-color), #409EFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.guide-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color-secondary);
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.guide-item:hover {
  transform: translateX(8px);
}

.guide-icon {
  font-size: 20px;
  color: var(--primary-color);
  padding: 10px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 10px;
}

.guide-text {
  text-align: left;
}

.guide-text h3 {
  font-size: 16px;
  margin-bottom: 2px;
  color: var(--text-color);
}

.guide-text p {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin: 0;
}

.features-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-tag {
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.feature-tag:hover {
  opacity: 1;
}

/* 暗色模式适配 */
.dark-mode .welcome-image {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  opacity: 0.7;
}

.dark-mode .welcome-image:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .start-content {
    padding: 0 16px;
  }
  
  .welcome-section h1 {
    font-size: 24px;
  }
  
  .guide-item {
    padding: 10px;
  }
  
  .welcome-image {
    width: 100px;
    height: 100px;
  }
}
</style> 