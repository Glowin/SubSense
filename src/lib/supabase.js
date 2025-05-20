import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 认证相关方法
export const auth = {
  // 用户注册
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },
  
  // 用户登录
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },
  
  // 用户登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  // 获取当前用户
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },
  
  // 重置密码
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },
  
  // 更新用户信息
  updateUser: async (userData) => {
    const { data, error } = await supabase.auth.updateUser(userData)
    return { data, error }
  }
}

// 订阅数据操作方法
export const subscriptionService = {
  // 获取所有订阅
  getAllSubscriptions: async (userId) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
    return { data, error }
  },
  
  // 获取单个订阅
  getSubscription: async (id) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },
  
  // 创建订阅
  createSubscription: async (subscription) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
    return { data, error }
  },
  
  // 更新订阅
  updateSubscription: async (id, subscription) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscription)
      .eq('id', id)
      .select()
    return { data, error }
  },
  
  // 删除订阅
  deleteSubscription: async (id) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
    return { error }
  }
}