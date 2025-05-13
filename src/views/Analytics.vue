<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import * as echarts from 'echarts'

const subscriptionStore = useSubscriptionStore()

// 获取数据
const monthlyTotal = computed(() => subscriptionStore.getMonthlyTotal)
const yearlyTotal = computed(() => subscriptionStore.getYearlyTotal)
const expensesByCategory = computed(() => subscriptionStore.getExpensesByCategory)
const activeSubscriptions = computed(() => subscriptionStore.getActiveSubscriptions)

// 图表引用
const categoryChartRef = ref(null)
const trendChartRef = ref(null)
let categoryChart = null
let trendChart = null

// 初始化图表
onMounted(() => {
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
    updateCategoryChart()
  }
  
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    updateTrendChart()
  }
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    if (categoryChart) categoryChart.resize()
    if (trendChart) trendChart.resize()
  })
})

// 更新分类饼图
const updateCategoryChart = () => {
  const option = {
    title: {
      text: '按类别的月度支出分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 元 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'middle',
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

// 更新趋势图（模拟数据）
const updateTrendChart = () => {
  // 生成过去6个月的日期标签
  const months = []
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthLabel = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    months.push(monthLabel)
  }
  
  // 模拟过去6个月的支出数据（基于当前月度总支出的随机波动）
  const baseValue = monthlyTotal.value
  const data = months.map((_, index) => {
    // 最后一个月使用实际值，前几个月使用模拟值
    if (index === months.length - 1) {
      return baseValue
    }
    // 模拟前几个月的数据，在当前值的80%-120%之间波动
    const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 到 1.2 之间
    return Math.round(baseValue * randomFactor * 100) / 100
  })
  
  const option = {
    title: {
      text: '月度支出趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b} <br/>{a}: {c} 元'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      name: '金额 (元)'
    },
    series: [
      {
        name: '月度支出',
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 计算订阅服务的统计信息
const subscriptionStats = computed(() => {
  const stats = {
    totalCount: activeSubscriptions.value.length,
    monthlyCount: 0,
    quarterlyCount: 0,
    yearlyCount: 0
  }
  
  activeSubscriptions.value.forEach(sub => {
    if (sub.billingCycle === 'monthly') {
      stats.monthlyCount++
    } else if (sub.billingCycle === 'quarterly') {
      stats.quarterlyCount++
    } else if (sub.billingCycle === 'yearly') {
      stats.yearlyCount++
    }
  })
  
  return stats
})

// 计算最贵的订阅（按月度计算）
const mostExpensiveSubscriptions = computed(() => {
  return [...activeSubscriptions.value]
    .map(sub => {
      let monthlyCost = sub.cost
      if (sub.billingCycle === 'quarterly') {
        monthlyCost = sub.cost / 3
      } else if (sub.billingCycle === 'yearly') {
        monthlyCost = sub.cost / 12
      }
      return { ...sub, monthlyCost }
    })
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 5) // 取前5个
})

// 格式化货币
const formatCurrency = (value, currency = 'CNY') => {
  const symbol = currency === 'CNY' ? '¥' : currency
  return `${symbol} ${value.toFixed(2)}`
}

// 获取计费周期标签
const getBillingCycleLabel = (value) => {
  const cycle = subscriptionStore.billingCycles.find(c => c.value === value)
  return cycle ? cycle.label : value
}
</script>

<template>
  <div class="analytics-container">
    <h2 class="page-title">财务分析</h2>
    
    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>月度总支出</span>
          </div>
        </template>
        <div class="card-value">{{ formatCurrency(monthlyTotal) }}</div>
        <div class="card-label">每月</div>
      </el-card>
      
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>年度总支出</span>
          </div>
        </template>
        <div class="card-value">{{ formatCurrency(yearlyTotal) }}</div>
        <div class="card-label">每年</div>
      </el-card>
      
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>活跃订阅</span>
          </div>
        </template>
        <div class="card-value">{{ subscriptionStats.totalCount }}</div>
        <div class="card-label">个服务</div>
      </el-card>
      
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>计费周期分布</span>
          </div>
        </template>
        <div class="billing-cycle-stats">
          <div class="cycle-item">
            <div class="cycle-value">{{ subscriptionStats.monthlyCount }}</div>
            <div class="cycle-label">月付</div>
          </div>
          <div class="cycle-item">
            <div class="cycle-value">{{ subscriptionStats.quarterlyCount }}</div>
            <div class="cycle-label">季付</div>
          </div>
          <div class="cycle-item">
            <div class="cycle-value">{{ subscriptionStats.yearlyCount }}</div>
            <div class="cycle-label">年付</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-container">
      <el-card class="chart-card">
        <div ref="categoryChartRef" class="chart"></div>
      </el-card>
      
      <el-card class="chart-card">
        <div ref="trendChartRef" class="chart"></div>
      </el-card>
    </div>
    
    <!-- 最贵的订阅 -->
    <el-card class="expensive-subscriptions">
      <template #header>
        <div class="card-header">
          <span>最贵的订阅服务（按月）</span>
        </div>
      </template>
      <el-table :data="mostExpensiveSubscriptions" style="width: 100%">
        <el-table-column prop="name" label="订阅名称" min-width="120" />
        <el-table-column prop="provider" label="服务提供商" min-width="120" />
        <el-table-column label="原始费用" min-width="120">
          <template #default="scope">
            {{ formatCurrency(scope.row.cost, scope.row.currency) }}
            ({{ getBillingCycleLabel(scope.row.billingCycle) }})
          </template>
        </el-table-column>
        <el-table-column label="月度费用" min-width="120">
          <template #default="scope">
            {{ formatCurrency(scope.row.monthlyCost, scope.row.currency) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 优化建议 -->
    <el-card class="optimization-tips">
      <template #header>
        <div class="card-header">
          <span>订阅优化建议</span>
        </div>
      </template>
      <ul class="tips-list">
        <li>考虑将月付订阅转为年付，通常可节省10%-20%的费用</li>
        <li>检查重复功能的订阅服务，考虑取消重叠的服务</li>
        <li>关注即将到期的订阅，评估是否继续使用</li>
        <li>查看是否有家庭共享计划可以降低人均成本</li>
        <li>定期审查不常用的订阅服务，及时取消不需要的服务</li>
      </ul>
    </el-card>
  </div>
</template>

<style scoped>
.analytics-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: 600;
  color: #303133;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.overview-card {
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

.billing-cycle-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.cycle-item {
  text-align: center;
}

.cycle-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.cycle-label {
  font-size: 12px;
  color: #909399;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  min-height: 400px;
}

.chart {
  height: 350px;
}

.expensive-subscriptions,
.optimization-tips {
  margin-bottom: 20px;
}

.tips-list {
  padding-left: 20px;
}

.tips-list li {
  margin-bottom: 10px;
  color: #606266;
}

@media (max-width: 768px) {
  .overview-cards,
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart {
    height: 300px;
  }
}
</style>