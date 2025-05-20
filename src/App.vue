<script setup>
import { RouterView } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useSubscriptionStore } from './stores/subscriptionStore'

const router = useRouter()
const activeIndex = ref('1')
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

// 计算属性 - 用户是否已登录
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// 监听认证状态变化，加载订阅数据
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    loadSubscriptions()
  }
})

// 加载订阅数据
const loadSubscriptions = async () => {
  if (authStore.isAuthenticated) {
    try {
      await subscriptionStore.fetchSubscriptions()
      console.log('订阅数据加载成功')
    } catch (error) {
      console.error('加载订阅数据失败:', error)
    }
  }
}

// 初始化 - 如果用户已登录，加载订阅数据
onMounted(() => {
  if (authStore.isAuthenticated) {
    loadSubscriptions()
  }
})

const handleSelect = (key) => {
  switch (key) {
    case '1':
      router.push('/')
      break
    case '2':
      router.push('/subscriptions')
      break
    case '3':
      router.push('/analytics')
      break
    case '4':
      router.push('/add-subscription')
      break
    case '5':
      handleLogout()
      break
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/auth')
  } catch (error) {
    console.error('登出失败:', error)
  }
}
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">
            <h1>SubSense</h1>
            <span>订阅智管</span>
          </div>
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
            v-if="isAuthenticated"
          >
            <el-menu-item index="1">仪表盘</el-menu-item>
            <el-menu-item index="2">我的订阅</el-menu-item>
            <el-menu-item index="3">财务分析</el-menu-item>
            <el-menu-item index="4">
              <el-button type="primary" size="small" icon="Plus">添加订阅</el-button>
            </el-menu-item>
            <el-sub-menu index="5">
              <template #title>
                <el-avatar :size="32" v-if="user">{{ user.email?.charAt(0).toUpperCase() }}</el-avatar>
              </template>
              <el-menu-item index="5">退出登录</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
      <el-footer>
        <div class="footer-content">
          <p>© 2023 SubSense 订阅智管 - 轻松管理您的所有订阅服务</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.app-container {
  min-height: 100vh;
}

.el-container {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  font-size: 24px;
  margin-right: 10px;
  color: #409EFF;
}

.logo span {
  font-size: 14px;
  color: #909399;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-footer {
  background-color: #fff;
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.footer-content {
  text-align: center;
}
</style>
