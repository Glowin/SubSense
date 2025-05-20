<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="card-header">
          <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="authForm" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        
        <div class="auth-actions">
          <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </div>
        
        <div class="auth-toggle">
          <span v-if="isLogin">
            还没有账号？ <el-button type="text" @click="isLogin = false">立即注册</el-button>
          </span>
          <span v-else>
            已有账号？ <el-button type="text" @click="isLogin = true">立即登录</el-button>
          </span>
        </div>
        
        <div v-if="isLogin" class="forgot-password">
          <el-button type="text" @click="showResetPasswordDialog = true">忘记密码？</el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 重置密码对话框 -->
    <el-dialog v-model="showResetPasswordDialog" title="重置密码" width="30%">
      <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="resetForm.email" placeholder="请输入您的注册邮箱"></el-input>
        </el-form-item>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showResetPasswordDialog = false">取消</el-button>
            <el-button type="primary" @click="handleResetPassword" :loading="resetLoading">
              发送重置邮件
            </el-button>
          </span>
        </template>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { auth } from '../lib/supabase'

const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)
const resetLoading = ref(false)
const showResetPasswordDialog = ref(false)

// 表单引用
const authForm = ref(null)
const resetFormRef = ref(null)

// 登录/注册表单
const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

// 重置密码表单
const resetForm = reactive({
  email: ''
})

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.confirmPassword !== '') {
      authForm.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ]
}

const resetRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 处理登录/注册
const handleSubmit = async () => {
  if (!authForm.value) return
  
  await authForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isLogin.value) {
          // 登录
          const { data, error } = await auth.signIn(form.email, form.password)
          if (error) throw error
          
          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else {
          // 注册
          const { data, error } = await auth.signUp(form.email, form.password)
          if (error) throw error
          
          ElMessage.success('注册成功，请查收验证邮件')
          isLogin.value = true
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 处理密码重置
const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      resetLoading.value = true
      try {
        const { error } = await auth.resetPassword(resetForm.email)
        if (error) throw error
        
        ElMessage.success('重置密码邮件已发送，请查收')
        showResetPasswordDialog.value = false
      } catch (error) {
        ElMessage.error(error.message || '发送失败，请重试')
      } finally {
        resetLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-actions {
  margin-top: 20px;
}

.auth-toggle {
  margin-top: 15px;
  text-align: center;
}

.forgot-password {
  margin-top: 10px;
  text-align: center;
}
</style>