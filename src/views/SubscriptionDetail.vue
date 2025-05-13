<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const route = useRoute()
const router = useRouter()
const subscriptionStore = useSubscriptionStore()

const subscriptionId = parseInt(route.params.id)
const subscription = computed(() => {
  return subscriptionStore.getAllSubscriptions.find(sub => sub.id === subscriptionId)
})

// 如果找不到订阅，重定向到订阅列表页面
onMounted(() => {
  if (!subscription.value) {
    router.push('/subscriptions')
  }
})

// 获取计费周期标签
const getBillingCycleLabel = (value) => {
  const cycle = subscriptionStore.billingCycles.find(c => c.value === value)
  return cycle ? cycle.label : value
}

// 获取状态标签
const getStatusLabel = (value) => {
  const status = subscriptionStore.statuses.find(s => s.value === value)
  return status ? status.label : value
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 计算月度和年度费用
const monthlyFee = computed(() => {
  if (!subscription.value) return 0
  
  let monthlyCost = subscription.value.cost
  if (subscription.value.billingCycle === 'quarterly') {
    monthlyCost = subscription.value.cost / 3
  } else if (subscription.value.billingCycle === 'yearly') {
    monthlyCost = subscription.value.cost / 12
  }
  return monthlyCost
})

const yearlyFee = computed(() => {
  if (!subscription.value) return 0
  
  let yearlyCost = subscription.value.cost
  if (subscription.value.billingCycle === 'monthly') {
    yearlyCost = subscription.value.cost * 12
  } else if (subscription.value.billingCycle === 'quarterly') {
    yearlyCost = subscription.value.cost * 4
  }
  return yearlyCost
})

// 编辑订阅
const editSubscription = () => {
  router.push({
    path: `/add-subscription`,
    query: { id: subscriptionId }
  })
}

// 取消订阅
const cancelSubscription = () => {
  subscriptionStore.cancelSubscription(subscriptionId)
}

// 重新激活订阅
const reactivateSubscription = () => {
  subscriptionStore.reactivateSubscription(subscriptionId)
}

// 删除订阅
const deleteSubscription = () => {
  subscriptionStore.deleteSubscription(subscriptionId)
  router.push('/subscriptions')
}
</script>

<template>
  <div v-if="subscription" class="subscription-detail-container">
    <div class="header-actions">
      <h2 class="page-title">订阅详情</h2>
      <div class="action-buttons">
        <el-button @click="router.push('/subscriptions')">
          返回列表
        </el-button>
        <el-button type="primary" @click="editSubscription">
          编辑订阅
        </el-button>
        <el-button 
          :type="subscription.status === 'active' ? 'warning' : 'success'"
          @click="subscription.status === 'active' ? cancelSubscription() : reactivateSubscription()"
        >
          {{ subscription.status === 'active' ? '取消订阅' : '重新激活' }}
        </el-button>
        <el-popconfirm
          title="确定要删除这个订阅吗？"
          @confirm="deleteSubscription"
        >
          <template #reference>
            <el-button type="danger">
              删除订阅
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    
    <div class="detail-content">
      <!-- 基本信息卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="subscription.status === 'active' ? 'success' : 'info'">
              {{ getStatusLabel(subscription.status) }}
            </el-tag>
          </div>
        </template>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">订阅名称</div>
            <div class="detail-value">{{ subscription.name }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">服务提供商</div>
            <div class="detail-value">{{ subscription.provider }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">类别</div>
            <div class="detail-value">{{ subscription.category }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">备注</div>
            <div class="detail-value">{{ subscription.notes || '无' }}</div>
          </div>
        </div>
      </el-card>
      
      <!-- 费用信息卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>费用信息</span>
          </div>
        </template>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">费用</div>
            <div class="detail-value highlight">
              {{ subscription.currency === 'CNY' ? '¥' : subscription.currency }} {{ subscription.cost }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">计费周期</div>
            <div class="detail-value">{{ getBillingCycleLabel(subscription.billingCycle) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">月度费用</div>
            <div class="detail-value">
              {{ subscription.currency === 'CNY' ? '¥' : subscription.currency }} {{ monthlyFee.toFixed(2) }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">年度费用</div>
            <div class="detail-value">
              {{ subscription.currency === 'CNY' ? '¥' : subscription.currency }} {{ yearlyFee.toFixed(2) }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">支付方式</div>
            <div class="detail-value">{{ subscription.paymentMethod }}</div>
          </div>
        </div>
      </el-card>
      
      <!-- 日期信息卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>日期信息</span>
          </div>
        </template>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">开始日期</div>
            <div class="detail-value">{{ formatDate(subscription.startDate) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">续费日期</div>
            <div class="detail-value highlight">{{ formatDate(subscription.renewalDate) }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.subscription-detail-container {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-size: 14px;
  color: #909399;
}

.detail-value {
  font-size: 16px;
  color: #303133;
}

.detail-value.highlight {
  font-weight: bold;
  color: #409EFF;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>