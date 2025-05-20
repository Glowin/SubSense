import { defineStore } from 'pinia'
import { subscriptionService } from '../lib/supabase'
import { useAuthStore } from './authStore'

// 保留模拟数据作为备份，实际将使用Supabase数据
const mockSubscriptions = [
  {
    id: 1,
    name: '网飞',
    provider: 'Netflix',
    cost: 89,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2023-01-15',
    renewalDate: '2023-12-15',
    paymentMethod: '信用卡',
    notes: '家庭共享账户',
    status: 'active',
    category: '流媒体'
  },
  {
    id: 2,
    name: '苹果音乐',
    provider: 'Apple',
    cost: 168,
    currency: 'CNY',
    billingCycle: 'quarterly',
    startDate: '2023-03-10',
    renewalDate: '2023-12-10',
    paymentMethod: 'Apple Pay',
    notes: '学生优惠',
    status: 'active',
    category: '音乐'
  },
  {
    id: 3,
    name: '京东Plus会员',
    provider: 'JD.com',
    cost: 299,
    currency: 'CNY',
    billingCycle: 'yearly',
    startDate: '2023-05-20',
    renewalDate: '2024-05-20',
    paymentMethod: '微信支付',
    notes: '618活动购买',
    status: 'active',
    category: '购物'
  },
  {
    id: 4,
    name: 'Office 365',
    provider: 'Microsoft',
    cost: 498,
    currency: 'CNY',
    billingCycle: 'yearly',
    startDate: '2023-02-05',
    renewalDate: '2024-02-05',
    paymentMethod: '支付宝',
    notes: '工作必备',
    status: 'active',
    category: '工作'
  },
  {
    id: 5,
    name: '喜马拉雅VIP',
    provider: 'Ximalaya',
    cost: 98,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2023-06-15',
    renewalDate: '2023-07-15',
    paymentMethod: '支付宝',
    notes: '',
    status: 'cancelled',
    category: '有声读物'
  }
]

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptions: [],
    isLoading: false,
    error: null,
    categories: ['流媒体', '音乐', '购物', '工作', '有声读物', '游戏', '云服务', '其他'],
    billingCycles: [
      { value: 'monthly', label: '月付' },
      { value: 'quarterly', label: '季付' },
      { value: 'yearly', label: '年付' }
    ],
    currencies: [
      { value: 'CNY', label: '人民币 (¥)' },
      { value: 'USD', label: '美元 ($)' },
      { value: 'EUR', label: '欧元 (€)' },
      { value: 'GBP', label: '英镑 (£)' },
      { value: 'JPY', label: '日元 (¥)' }
    ],
    statuses: [
      { value: 'active', label: '活跃' },
      { value: 'cancelled', label: '已取消' }
    ]
  }),
  
  getters: {
    // 获取所有订阅
    getAllSubscriptions: (state) => state.subscriptions,
    
    // 获取活跃订阅
    getActiveSubscriptions: (state) => state.subscriptions.filter(sub => sub.status === 'active'),
    
    // 获取已取消订阅
    getCancelledSubscriptions: (state) => state.subscriptions.filter(sub => sub.status === 'cancelled'),
    
    // 获取即将到期的订阅（30天内）
    getUpcomingRenewals: (state) => {
      const today = new Date()
      const thirtyDaysLater = new Date(today.setDate(today.getDate() + 30))
      today.setDate(today.getDate() - 30) // 重置today
      
      return state.subscriptions.filter(sub => {
        if (sub.status !== 'active') return false
        const renewalDate = new Date(sub.renewalDate)
        return renewalDate >= today && renewalDate <= thirtyDaysLater
      })
    },
    
    // 计算月度总支出
    getMonthlyTotal: (state) => {
      return state.subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((total, sub) => {
          let monthlyCost = sub.cost
          if (sub.billingCycle === 'quarterly') {
            monthlyCost = sub.cost / 3
          } else if (sub.billingCycle === 'yearly') {
            monthlyCost = sub.cost / 12
          }
          return total + monthlyCost
        }, 0)
    },
    
    // 计算年度总支出
    getYearlyTotal: (state) => {
      return state.subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((total, sub) => {
          let yearlyCost = sub.cost
          if (sub.billingCycle === 'monthly') {
            yearlyCost = sub.cost * 12
          } else if (sub.billingCycle === 'quarterly') {
            yearlyCost = sub.cost * 4
          }
          return total + yearlyCost
        }, 0)
    },
    
    // 按类别统计支出
    getExpensesByCategory: (state) => {
      const categoryMap = {}
      state.subscriptions
        .filter(sub => sub.status === 'active')
        .forEach(sub => {
          const category = sub.category || '其他'
          if (!categoryMap[category]) {
            categoryMap[category] = 0
          }
          
          let monthlyCost = sub.cost
          if (sub.billingCycle === 'quarterly') {
            monthlyCost = sub.cost / 3
          } else if (sub.billingCycle === 'yearly') {
            monthlyCost = sub.cost / 12
          }
          
          categoryMap[category] += monthlyCost
        })
      
      return Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
    }
  },
  
  actions: {
    // 从Supabase加载订阅数据
    async fetchSubscriptions() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const userId = authStore.user.id
        const { data, error } = await subscriptionService.getAllSubscriptions(userId)
        
        if (error) throw error
        
        // 将snake_case字段名转换为camelCase
        this.subscriptions = (data || []).map(item => {
          // 确保所有字段都存在，即使数据库返回的是null
          const { 
            billing_cycle, 
            start_date, 
            renewal_date, 
            payment_method, 
            ...rest 
          } = item
          
          return {
            ...rest,
            billingCycle: billing_cycle || '',
            startDate: start_date || '',
            renewalDate: renewal_date || '',
            paymentMethod: payment_method || ''
          }
        })
      } catch (err) {
        console.error('获取订阅失败:', err)
        this.error = err.message
        // 如果API失败，使用模拟数据（仅开发环境）
        if (import.meta.env.DEV) {
          this.subscriptions = [...mockSubscriptions]
        }
      } finally {
        this.isLoading = false
      }
    },
    
    // 添加新订阅
    async addSubscription(subscription) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      
      this.isLoading = true
      this.error = null
      
      try {
        // 转换字段名从camelCase到snake_case
        const { billingCycle, startDate, renewalDate, paymentMethod, ...rest } = subscription
        
        // 添加用户ID并使用正确的snake_case字段名
        const newSubscription = {
          ...rest,
          billing_cycle: billingCycle,
          start_date: startDate,
          renewal_date: renewalDate,
          payment_method: paymentMethod,
          user_id: authStore.user.id
        }
        
        const { data, error } = await subscriptionService.createSubscription(newSubscription)
        if (error) throw error
        
        // 更新本地状态
        if (data && data.length > 0) {
          // 将snake_case字段名转换为camelCase
          const { billing_cycle, start_date, renewal_date, payment_method, ...restData } = data[0]
          const formattedData = {
            ...restData,
            billingCycle: billing_cycle,
            startDate: start_date,
            renewalDate: renewal_date,
            paymentMethod: payment_method
          }
          this.subscriptions.push(formattedData)
          return formattedData.id
        }
      } catch (err) {
        console.error('添加订阅失败:', err)
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    
    // 更新订阅
    async updateSubscription(id, updatedData) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      
      this.isLoading = true
      this.error = null
      
      try {
        // 转换字段名从camelCase到snake_case
        const { billingCycle, startDate, renewalDate, paymentMethod, ...rest } = updatedData
        
        // 使用正确的snake_case字段名
        const subscription = {
          ...rest,
          billing_cycle: billingCycle,
          start_date: startDate,
          renewal_date: renewalDate,
          payment_method: paymentMethod
        }
        
        const { data, error } = await subscriptionService.updateSubscription(id, subscription)
        if (error) throw error
        
        // 更新本地状态
        const index = this.subscriptions.findIndex(sub => sub.id === id)
        if (index !== -1 && data && data.length > 0) {
          // 将snake_case字段名转换为camelCase
          const { billing_cycle, start_date, renewal_date, payment_method, ...restData } = data[0]
          const formattedData = {
            ...restData,
            billingCycle: billing_cycle,
            startDate: start_date,
            renewalDate: renewal_date,
            paymentMethod: payment_method
          }
          this.subscriptions[index] = formattedData
          return true
        }
      } catch (err) {
        console.error('更新订阅失败:', err)
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    
    // 删除订阅
    async deleteSubscription(id) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const { error } = await subscriptionService.deleteSubscription(id)
        if (error) throw error
        
        // 更新本地状态
        const index = this.subscriptions.findIndex(sub => sub.id === id)
        if (index !== -1) {
          this.subscriptions.splice(index, 1)
          return true
        }
      } catch (err) {
        console.error('删除订阅失败:', err)
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },
    
    // 取消订阅（更改状态）
    async cancelSubscription(id) {
      return this.updateSubscription(id, { status: 'cancelled' })
    },
    
    // 重新激活订阅
    async reactivateSubscription(id) {
      return this.updateSubscription(id, { status: 'active' })
    }
  }
})