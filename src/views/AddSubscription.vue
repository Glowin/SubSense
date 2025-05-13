<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const route = useRoute()
const router = useRouter()
const subscriptionStore = useSubscriptionStore()

// 判断是新增还是编辑模式
const isEditMode = computed(() => route.query.id !== undefined)
const subscriptionId = computed(() => isEditMode.value ? parseInt(route.query.id) : null)

// 表单数据
const formData = ref({
  name: '',
  provider: '',
  cost: '',
  currency: 'CNY',
  billingCycle: 'monthly',
  startDate: '',
  renewalDate: '',
  paymentMethod: '',
  notes: '',
  status: 'active',
  category: '其他'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入订阅名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请输入服务提供商', trigger: 'blur' }],
  cost: [
    { required: true, message: '请输入费用', trigger: 'blur' },
    { type: 'number', message: '费用必须为数字', trigger: 'blur', transform: value => Number(value) }
  ],
  currency: [{ required: true, message: '请选择货币', trigger: 'change' }],
  billingCycle: [{ required: true, message: '请选择计费周期', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  renewalDate: [{ required: true, message: '请选择续费日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请输入支付方式', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }]
}

// 如果是编辑模式，加载现有数据
onMounted(() => {
  if (isEditMode.value && subscriptionId.value) {
    const subscription = subscriptionStore.getAllSubscriptions.find(sub => sub.id === subscriptionId.value)
    if (subscription) {
      // 复制数据到表单
      Object.keys(formData.value).forEach(key => {
        if (key in subscription) {
          formData.value[key] = subscription[key]
        }
      })
    } else {
      // 如果找不到订阅，返回列表页
      router.push('/subscriptions')
    }
  } else {
    // 新增模式，设置默认日期
    const today = new Date()
    formData.value.startDate = today.toISOString().split('T')[0]
    
    // 默认续费日期为一个月后
    const nextMonth = new Date(today)
    nextMonth.setMonth(today.getMonth() + 1)
    formData.value.renewalDate = nextMonth.toISOString().split('T')[0]
  }
})

// 提交表单
const formRef = ref(null)
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // 转换费用为数字
      const submittedData = { ...formData.value, cost: Number(formData.value.cost) }
      
      if (isEditMode.value && subscriptionId.value) {
        // 更新现有订阅
        subscriptionStore.updateSubscription(subscriptionId.value, submittedData)
        ElMessage.success('订阅更新成功')
      } else {
        // 添加新订阅
        const newId = subscriptionStore.addSubscription(submittedData)
        ElMessage.success('订阅添加成功')
      }
      
      // 返回列表页
      router.push('/subscriptions')
    } else {
      console.log('表单验证失败', fields)
      ElMessage.error('请完成必填项')
    }
  })
}

// 取消操作
const cancelForm = () => {
  router.push('/subscriptions')
}
</script>

<template>
  <div class="add-subscription-container">
    <div class="header-actions">
      <h2 class="page-title">{{ isEditMode ? '编辑订阅' : '添加订阅' }}</h2>
      <div class="action-buttons">
        <el-button @click="cancelForm">
          取消
        </el-button>
      </div>
    </div>
    
    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="top"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-grid">
            <el-form-item label="订阅名称" prop="name">
              <el-input v-model="formData.name" placeholder="例如：网飞会员" />
            </el-form-item>
            
            <el-form-item label="服务提供商" prop="provider">
              <el-input v-model="formData.provider" placeholder="例如：Netflix" />
            </el-form-item>
            
            <el-form-item label="类别" prop="category">
              <el-select v-model="formData.category" placeholder="选择类别" style="width: 100%">
                <el-option
                  v-for="category in subscriptionStore.categories"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="选择状态" style="width: 100%">
                <el-option
                  v-for="item in subscriptionStore.statuses"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>
        
        <!-- 费用信息 -->
        <div class="form-section">
          <h3 class="section-title">费用信息</h3>
          <div class="form-grid">
            <el-form-item label="费用" prop="cost">
              <el-input v-model="formData.cost" placeholder="输入费用金额" type="number" />
            </el-form-item>
            
            <el-form-item label="货币" prop="currency">
              <el-select v-model="formData.currency" placeholder="选择货币" style="width: 100%">
                <el-option
                  v-for="item in subscriptionStore.currencies"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="计费周期" prop="billingCycle">
              <el-select v-model="formData.billingCycle" placeholder="选择计费周期" style="width: 100%">
                <el-option
                  v-for="item in subscriptionStore.billingCycles"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-input v-model="formData.paymentMethod" placeholder="例如：信用卡、支付宝" />
            </el-form-item>
          </div>
        </div>
        
        <!-- 日期信息 -->
        <div class="form-section">
          <h3 class="section-title">日期信息</h3>
          <div class="form-grid">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            
            <el-form-item label="续费日期" prop="renewalDate">
              <el-date-picker
                v-model="formData.renewalDate"
                type="date"
                placeholder="选择续费日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </div>
        </div>
        
        <!-- 备注 -->
        <div class="form-section">
          <h3 class="section-title">其他信息</h3>
          <el-form-item label="备注" prop="notes">
            <el-input
              v-model="formData.notes"
              type="textarea"
              placeholder="添加备注信息（可选）"
              :rows="3"
            />
          </el-form-item>
        </div>
        
        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button @click="cancelForm">取消</el-button>
          <el-button type="primary" @click="submitForm">{{ isEditMode ? '保存修改' : '添加订阅' }}</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.add-subscription-container {
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

.form-card {
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>