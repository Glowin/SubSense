import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'
import { supabase } from './lib/supabase'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, { size: 'default' })

// 初始化认证状态
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
authStore.initialize().then(() => {
  // 挂载应用
  app.mount('#app')
})
