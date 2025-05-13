<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import * as echarts from 'echarts'

const subscriptionStore = useSubscriptionStore()
const activeSubscriptions = computed(() => subscriptionStore.getActiveSubscriptions)
const upcomingRenewals = computed(() => subscriptionStore.getUpcomingRenewals)
const monthlyTotal = computed(() => subscriptionStore.getMonthlyTotal)
const yearlyTotal = computed(() => subscriptionStore.getYearlyTotal)
const expensesByCategory = computed(() => subscriptionStore.getExpensesByCategory)

const categoryChartRef = ref(null)
let categoryChart = null

onMounted(() => {
  // 初始化饼图
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
    updateCategoryChart()
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      categoryChart.resize()
    })
  }
})

const updateCategoryChart = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 元 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: expensesByCategory.value.map(item => item.name)
    },
    series: [
      {
        name: '月度支出',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: expensesByCategory.value
      }
    ]
  }
  
  categoryChart.setOption(option)
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 计算剩余天数
const getDaysRemaining = (dateString) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const renewalDate = new Date(dateString)
  renewalDate.setHours(0, 0, 0, 0)
  
  const diffTime = renewalDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
</script>

<template>
  <div class="dashboard-container">
    <h2 class="page-title">仪表盘</h2>
    
    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>活跃订阅</span>
          </div>
        </template>
        <div class="card-value">{{ activeSubscriptions.length }}</div>
        <div class="card-label">个服务</div>
      </el-card>
      
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>月度支出</span>
          </div>
        </template>
        <div class="card-value">¥ {{ monthlyTotal.toFixed(2) }}</div>
        <div class="card-label">每月</div>
      </el-card>
      
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>年度支出</span>
          </div>
        </template>
        <div class="card-value">¥ {{ yearlyTotal.toFixed(2) }}</div>
        <div class="card-label">每年</div>
      </el-card>
    </div>
    
    <!-- 图表和即将到期的订阅 -->
    <div class="dashboard-content">
      <!-- 分类支出饼图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>分类支出分布</span>
          </div>
        </template>
        <div ref="categoryChartRef" class="category-chart"></div>
      </el-card>
      
      <!-- 即将到期的订阅 -->
      <el-card class="renewals-card">
        <template #header>
          <div class="card-header">
            <span>即将到期的订阅</span>
          </div>
        </template>
        <div v-if="upcomingRenewals.length > 0" class="renewals-list">
          <el-table :data="upcomingRenewals" style="width: 100%">
            <el-table-column prop="name" label="订阅名称" width="120" />
            <el-table-column prop="renewalDate" label="续费日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.renewalDate) }}
              </template>
            </el-table-column>
            <el-table-column label="剩余天数" width="100">
              <template #default="scope">
                <el-tag :type="getDaysRemaining(scope.row.renewalDate) <= 7 ? 'danger' : 'warning'">
                  {{ getDaysRemaining(scope.row.renewalDate) }} 天
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cost" label="费用" width="100">
              <template #default="scope">
                ¥ {{ scope.row.cost }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-renewals">
          <el-empty description="暂无即将到期的订阅" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: 600;
  color: #303133;
}

.overview-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.overview-card {
  flex: 1;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin: 10px 0;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.dashboard-content {
  display: flex;
  gap: 20px;
}

.chart-card {
  flex: 1;
}

.renewals-card {
  flex: 1;
}

.category-chart {
  height: 300px;
}

.renewals-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-renewals {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .overview-cards,
  .dashboard-content {
    flex-direction: column;
  }
}
</style>