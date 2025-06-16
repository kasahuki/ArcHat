<template>
  <div class="form-container">
    <!-- 添加 logo -->
    <div class="logo">
      <img src="/src/assets/image/archat.png" alt="ARCHAT" />
    </div>
    
    <div class="form-wrapper" :class="{ 'show-register': showRegister }">
      <!-- Left Panel (Welcome/Register) -->
      <div class="panel welcome-panel" :class="{ 'panel-right': showRegister }">
        <div class="panel-content">
          <h1 class="welcome-title" style="color: cyan;">{{ showRegister ? 'Welcome Back!' : 'Hello, Welcome!' }}</h1>
          <p class="welcome-text">{{ showRegister ? 'Already have an account?' : 'Don\'t have an account?' }}</p>
          <el-button class="action-button" @click="toggleForm">
            <span style="color: white;">{{ showRegister ? 'Login' : 'Register' }}</span>
          </el-button>
        </div>
      </div>

      <!-- Right Panel (Login Form) -->
      <div class="panel form-panel" :class="{ 'panel-left': showRegister }">
        <div class="panel-content">
          <h2 class="form-title">{{ showRegister ? 'Register' : 'Login' }}</h2>

          <!-- Login Form -->
          <div v-if="!showRegister" class="form">
            <el-form :model="loginForm" ref="loginFormRef">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="Username" :prefix-icon="User" />
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="Password" :prefix-icon="Lock" />
              </el-form-item>

              <div class="forgot-password">
                <a href="#">Forgot password?</a>
              </div>

              <el-button type="primary" class="submit-button" @click="handleLogin">
                <span style="color: white;">Login</span>
              </el-button>


            </el-form>
          </div>

          <!-- Register Form -->
          <div v-else class="form">
            <el-form :model="registerForm" ref="registerFormRef">
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

              <el-button type="primary" class="submit-button" @click="handleRegister">
                <span style="color: white;">Register</span>
              </el-button>
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
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-image: url("/src/assets/image/login.png");
  background-size: cover;
  background-position: center;
  position: relative;
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
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.form-wrapper {
  position: relative;
  width: 900px;
  height: 550px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
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
  background: rgba(9, 75, 207, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: white;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  transform: translateX(0);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
}

.form-panel {
  background: rgba(30, 41, 88, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  transform: translateX(0);
  border-left: 1px solid rgba(197, 187, 187, 0.18);

}

/* 优化切换动画 */
.show-register .welcome-panel {
  transform: translateX(100%);
  border-radius: 0 20px 20px 0;
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.18);
}

.show-register .form-panel {
  transform: translateX(-100%);
  border-radius: 20px 0 0 20px;
  border-left: none;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
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
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-text {
  margin-bottom: 30px;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.action-button {
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.8);
  color: white;
  padding: 10px 40px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: white;
}

.form {
  width: 100%;

}

/* 优化输入框样式 */
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 152, 255, 0.5);
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.95);
  border-color: #6698ff;
  box-shadow: 0 0 0 1px #6698ff;
}

.forgot-password {
  text-align: right;
  margin: 10px 0 20px;
}

.forgot-password a {
  color: rgba(153, 153, 153, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.forgot-password a:hover {
  color: #6698ff;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background: rgba(102, 152, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: rgba(102, 152, 255, 0.9);
  transform: translateY(-2px);
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
}
</style>