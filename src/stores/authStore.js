import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const loading = ref(true)
  
  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  
  // 初始化 - 检查当前用户状态
  const initialize = async () => {
    loading.value = true
    try {
      const { data, error } = await auth.getCurrentUser()
      if (error) throw error
      user.value = data.user
    } catch (error) {
      console.error('认证初始化错误:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }
  
  // 登录
  const login = async (email, password) => {
    const { data, error } = await auth.signIn(email, password)
    if (error) throw error
    user.value = data.user
    return data
  }
  
  // 注册
  const register = async (email, password) => {
    const { data, error } = await auth.signUp(email, password)
    if (error) throw error
    return data
  }
  
  // 登出
  const logout = async () => {
    const { error } = await auth.signOut()
    if (error) throw error
    user.value = null
  }
  
  // 更新用户信息
  const updateUserInfo = async (userData) => {
    const { data, error } = await auth.updateUser(userData)
    if (error) throw error
    user.value = data.user
    return data
  }
  
  return {
    user,
    loading,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
    updateUserInfo
  }
})