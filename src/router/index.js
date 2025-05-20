import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('../views/Subscriptions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscription/:id',
    name: 'SubscriptionDetail',
    component: () => import('../views/SubscriptionDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-subscription',
    name: 'AddSubscription',
    component: () => import('../views/AddSubscription.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/Analytics.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查用户是否已登录
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    // 获取当前用户状态
    const { data } = await supabase.auth.getUser()
    const isAuthenticated = !!data.user
    
    if (!isAuthenticated) {
      // 未登录，重定向到登录页
      next({ path: '/auth' })
    } else {
      // 已登录，允许访问
      next()
    }
  } else {
    // 不需要认证的路由，直接访问
    next()
  }
})

export default router