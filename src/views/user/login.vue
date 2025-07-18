<template>
  <div class="form-container">
    <!-- SVG 背景装饰 左下 -->
    <div class="login-svg-bg">
      <svg width="420" height="320" viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="210" cy="320" rx="210" ry="100" fill="url(#paint0_linear)"/>
        <circle cx="60" cy="260" r="40" fill="url(#paint1_radial)"/>
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="320" x2="420" y2="320" gradientUnits="userSpaceOnUse">
            <stop stop-color="#409EFF"/>
            <stop offset="1" stop-color="#1AAD19"/>
          </linearGradient>
          <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(60 260) scale(40)" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7ed957"/>
            <stop offset="1" stop-color="#409EFF" stop-opacity="0.2"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <!-- SVG 背景装饰 右上 -->
    <div class="login-svg-bg-right">
      <svg width="340" height="260" viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="170" cy="-40" rx="170" ry="100" fill="url(#paint0_linear_right)"/>
        <circle cx="300" cy="60" r="30" fill="url(#paint1_radial_right)"/>
        <defs>
          <linearGradient id="paint0_linear_right" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#eafff3"/>
            <stop offset="1" stop-color="#b3e5fc"/>
          </linearGradient>
          <radialGradient id="paint1_radial_right" cx="0" cy="0" r="1" gradientTransform="translate(300 60) scale(30)" gradientUnits="userSpaceOnUse">
            <stop stop-color="#409EFF"/>
            <stop offset="1" stop-color="#1AAD19" stop-opacity="0.18"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <!-- 添加 logo -->
    <div class="logo" @click="goToChat">
      <img src="/src/assets/image/archat.png" alt="ARCHAT" />
    </div>
    
    <div class="form-wrapper" :class="{ 'show-register': showRegister }">
      <!-- Left Panel (Welcome/Register) -->
      <div class="panel welcome-panel" :class="{ 'panel-right': showRegister }">
        <div class="panel-content">
          <h1 class="welcome-title" style="color: #409EFF;">{{ showRegister ? 'Welcome Back!' : 'Hello, Welcome!' }}</h1>
          <p class="welcome-text">{{ showRegister ? 'Already have an account?' : 'Don\'t have an account?' }}</p>
          <DangerButton type="success" class="action-button" @click="toggleForm">
            <span style="color: white;">{{ showRegister ? 'Login' : 'Register' }}</span>
          </DangerButton>
        </div>
      </div>

      <!-- Right Panel (Login Form) -->
      <div class="panel form-panel" :class="{ 'panel-left': showRegister }">
        <div class="panel-content">
          <h2 class="form-title">{{ showRegister ? 'Register' : 'Login' }}</h2>

          <!-- Login Form -->
          <div v-if="!showRegister" class="form">
            <el-form :model="loginForm" ref="loginFormRef" @submit.prevent>
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="Username" :prefix-icon="User" />
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="Password" :prefix-icon="Lock" />
              </el-form-item>

              <div class="forgot-password">
                <a href="#">Forgot password?</a>
              </div>

              <DangerButton type="primary" class="submit-button" @click="handleLogin">
                <span style="color: white!important;">Login</span>
              </DangerButton>


            </el-form>
          </div>

          <!-- Register Form -->
          <div v-else class="form">
            <el-form :model="registerForm" ref="registerFormRef" @submit.prevent>
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="username" :prefix-icon="User" />
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="Password" :prefix-icon="Lock" />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="Confirm Password"
                  :prefix-icon="Lock" />
              </el-form-item>

              <DangerButton type="primary" class="submit-button" @click="handleRegister">
                <span style="color: white;">Register</span>
              </DangerButton>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { registerService, loginService } from '@/api/user'
import { useUserInfoStore } from '@/stores/user'
import DangerButton from '@/components/dangerButton.vue'

// State
const showRegister = ref(false)
const router = useRouter()
const userInfoStore = useUserInfoStore()

// Form data
const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// Form refs
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// Methods
const toggleForm = () => {
  showRegister.value = !showRegister.value
}

const handleLogin = async () => {
  try {
    if (!loginForm.username || !loginForm.password) {
      ElMessage.error('请填写完整的登录信息')
      return
    }
    
    const res = await loginService({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (res.code === 200) {
      ElMessage.success('登录成功')
      // 使用 store 存储用户信息
      userInfoStore.setUserInfo(res.data)
      // 登录成功后建立 WebSocket 连接
      userInfoStore.connectWebSocket(res.data.token);
      // 跳转到首页
      router.push('/userHub')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后重试')
    console.error('登录错误:', error)
  }
}

const handleRegister = async () => {
  try {
    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
      ElMessage.error('请填写完整的注册信息')
      return
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }

    if (registerForm.password.length < 6 || registerForm.password.length > 20) {
      ElMessage.error('密码长度必须在6-20位之间')
      return
    }
    
    const res = await registerService({
      username: registerForm.username,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword
    })
    
    if (res.code === 200) {
      ElMessage.success('注册成功')
      // 切换到登录表单
      showRegister.value = false
      // 清空注册表单
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试')
    console.error('注册错误:', error)
  }
}

// 回到首页方法
const goToChat = () => {
  router.push('/chat')
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* 左右双色渐变背景：左蓝右绿 */
  background: linear-gradient(120deg, #e3f0ff 0%, #b3e5fc 40%, #eafff3 100%);
  position: relative;
  overflow: hidden;
}

.login-svg-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  width: 420px;
  height: 320px;
  pointer-events: none;
  opacity: 0.92;
}

/* 新增右侧渐变装饰 */
.login-svg-bg-right {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  width: 340px;
  height: 260px;
  pointer-events: none;
  opacity: 0.85;
}

/* 添加 logo 样式 */
.logo {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 10;


}


.logo img {
  height: 80px;
  width: auto;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: all 0.3s ease;
}
.logo img:hover {
  transform: scale(1.05);
}
.form-wrapper {
  position: relative;
  width:950px;
  height: 550px;
  border-radius: 25px;
  overflow: hidden;
  display: flex;
  background: #fff;
  /* 3D立体效果：多层阴影+微透视 */
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.10),
    0 1.5px 8px 0 rgba(64, 158, 255, 0.08),
    0 24px 48px 0 rgba(64, 158, 255, 0.10),
    0 1.5px 32px 0 rgba(30, 41, 88, 0.10);

  transition: box-shadow 0.4s, transform 0.4s;
}

.panel {
  position: relative;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-panel {
  /* register 左侧绿色渐变 */
  background: linear-gradient(135deg, #eafff3 0%, #7ed957 100%);
  color: #222;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  transform: translateX(0);
  border-right: 1px solid #f0f2f5;
  transition: background 0.5s;
}

.form-panel {
  /* login 右侧蓝色渐变 */
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  transform: translateX(0);
  border-left: 1px solid #f0f2f5;
  transition: background 0.5s;
}

/* 切换时左右 panel 互换渐变色 */
.show-register .welcome-panel {
  background: linear-gradient(135deg, #e3f0ff 0%, #409EFF 100%);
  transform: translateX(100%);
  border-radius: 0 20px 20px 0;
  border-right: none;
  border-left: 1px solid #f0f2f5;
}

.show-register .form-panel {
  transform: translateX(-100%);
  border-radius: 20px 0 0 20px;
  border-left: none;
  border-right: 1px solid #f0f2f5;
}

.panel-content {
  padding: 30px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 2.7rem;
  margin-bottom: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #1a8cff;
  text-shadow: 0 4px 16px rgba(64,158,255,0.10), 0 1.5px 8px 0 rgba(64, 158, 255, 0.08);
}

.welcome-text {
  margin-bottom: 32px;
  font-size: 1.08rem;
  color: #3a3a3a;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 5.1rem;
  margin-bottom: 32px;
  color: #06aa06;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.action-button {
  border: none;
  color: #fff;
  font-size: 1.08rem;
  font-weight: 700;

  letter-spacing: 1px;
}

.form {
  width: 100%;

}

/* 优化输入框样式，让嵌入效果更明显 */
:deep(.el-input__wrapper) {
  background: #f6faff;
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(204, 204, 204, 0.1) inset, 0 1.5px 8px 0 rgba(64, 158, 255, 0.08) inset;
  font-size: 1.08rem;
  font-weight: 600;
  color: #222;
  transition: box-shadow 0.3s, background 0.3s;
  padding: 2px 12px;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  background: #9ff0b1;
  box-shadow: 0 4px 24px 0 #ebedee inset, 0 2px 16px 0 #409eff22 inset;
  animation: input-embed-in 0.3s cubic-bezier(.4,0,.2,1);
}

:deep(.el-input__inner) {
  color: #222;
  font-size: 1.08rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.forgot-password {
  text-align: right;
  margin: 10px 0 20px;
}

.forgot-password a {
  color: #409EFF;
  font-weight: 500;
  text-decoration: underline dotted;
  font-size: 0.98rem;
  transition: color 0.2s;
}
.forgot-password a:hover {
  color: #1AAD19;
}

.submit-button {
  width: 100%;
  border: none;
  font-size: 1.08rem;
  font-weight: 700;

  margin-top: 12px;
  letter-spacing: 1px;

}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-wrapper {
    width: 95%;
    height: auto;
    flex-direction: column;
  }

  .panel {
    width: 100%;
    height: auto;
    min-height: 300px;
  }

  .welcome-panel {
    border-radius: 20px 20px 0 0;
    padding: 30px 0;
    transform: translateY(0);
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }

  .form-panel {
    border-radius: 0 0 20px 20px;
    padding: 30px 0;
    transform: translateY(0);
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  /* 移动端垂直切换动画 */
  .show-register .welcome-panel {
    transform: translateY(100%);
    border-radius: 0 0 20px 20px;
    border-bottom: none;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  .show-register .form-panel {
    transform: translateY(-100%);
    border-radius: 20px 20px 0 0;
    border-top: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }

  .logo {
    top: 20px;
    left: 20px;
  }
  
  .logo img {
    height: 32px;
  }
  .login-svg-bg {
    width: 160px;
    height: 80px;
  }
  .login-svg-bg-right {
    width: 120px;
    height: 60px;
  }
}
</style>