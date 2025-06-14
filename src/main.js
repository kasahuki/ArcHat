import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/theme.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化主题
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.initTheme()

// 添加主题过渡类
document.documentElement.classList.add('theme-transition')

app.mount('#app')
