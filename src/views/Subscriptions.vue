<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const subscriptions = computed(() => subscriptionStore.getAllSubscriptions)
const billingCycles = subscriptionStore.billingCycles
const statuses = subscriptionStore.statuses

// 表格搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

const filteredSubscriptions = computed(() => {
  return subscriptions.value.filter(sub => {
    // 搜索条件
    const matchesSearch = searchQuery.value === '' || 
      sub.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      sub.provider.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 状态筛选
    const matchesStatus = statusFilter.value === '' || sub.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

// 查看订阅详情
const viewSubscription = (id) => {
  router.push(`/subscription/${id}`)
}

// 编辑订阅
const editSubscription = (id) => {
  router.push({
    path: `/add-subscription`,
    query: { id }
  })
}

// 取消订阅
const cancelSubscription = (id) => {
  subscriptionStore.cancelSubscription(id)
}

// 重新激活订阅
const reactivateSubscription = (id) => {
  subscriptionStore.reactivateSubscription(id)
}

// 删除订阅
const deleteSubscription = (id) => {
  subscriptionStore.deleteSubscription(id)
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取计费周期标签
const getBillingCycleLabel = (value) => {
  const cycle = billingCycles.find(c => c.value === value)
  return cycle ? cycle.label : value
}

// 获取状态标签
const getStatusLabel = (value) => {
  const status = statuses.find(s => s.value === value)
  return status ? status.label : value
}
</script>

<template>
  <div class="subscriptions-container">
    <h2 class="page-title">我的订阅</h2>
    
    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索订阅名称或提供商"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
        <el-option
          v-for="item in statuses"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      
      <el-button type="primary" @click="router.push('/add-subscription')">
        <el-icon><Plus /></el-icon> 添加订阅
      </el-button>
    </div>
    
    <!-- 订阅列表 -->
    <el-card class="subscription-list">
      <el-table :data="filteredSubscriptions" style="width: 100%">
        <el-table-column prop="name" label="订阅名称" min-width="120" />
        <el-table-column prop="provider" label="服务提供商" min-width="120" />
        <el-table-column label="费用" min-width="100">
          <template #default="scope">
            {{ scope.row.currency === 'CNY' ? '¥' : scope.row.currency }} {{ scope.row.cost }}
          </template>
        </el-table-column>
        <el-table-column label="计费周期" min-width="100">
          <template #default="scope">
            {{ getBillingCycleLabel(scope.row.billingCycle) }}
          </template>
        </el-table-column>
        <el-table-column label="续费日期" min-width="120">
          <template #default="scope">
            {{ formatDate(scope.row.renewalDate) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="viewSubscription(scope.row.id)">
                查看
              </el-button>
              <el-button size="small" type="primary" @click="editSubscription(scope.row.id)">
                编辑
              </el-button>
              <el-button 
                size="small" 
                :type="scope.row.status === 'active' ? 'warning' : 'success'"
                @click="scope.row.status === 'active' ? cancelSubscription(scope.row.id) : reactivateSubscription(scope.row.id)"
              >
                {{ scope.row.status === 'active' ? '取消' : '激活' }}
              </el-button>
              <el-popconfirm
                title="确定要删除这个订阅吗？"
                @confirm="deleteSubscription(scope.row.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.subscriptions-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: 600;
  color: #303133;
}

.filter-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.subscription-list {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>