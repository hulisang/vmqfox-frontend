<template>
  <div class="debug-page">
    <ElCard>
      <h3>用户管理调试页面</h3>
      
      <ElDivider>认证状态</ElDivider>
      <p><strong>登录状态:</strong> {{ userStore.isLogin ? '已登录' : '未登录' }}</p>
      <p><strong>Access Token:</strong> {{ userStore.accessToken || '无' }}</p>
      <p><strong>用户信息:</strong> {{ JSON.stringify(userStore.getUserInfo, null, 2) }}</p>
      
      <ElDivider>API测试</ElDivider>
      <ElSpace>
        <ElButton @click="testLogin" type="primary">测试登录</ElButton>
        <ElButton @click="testGetUsers" type="success">测试获取用户列表</ElButton>
        <ElButton @click="testHealthCheck" type="info">测试健康检查</ElButton>
      </ElSpace>
      
      <ElDivider>测试结果</ElDivider>
      <ElInput
        v-model="testResult"
        type="textarea"
        :rows="10"
        readonly
        placeholder="测试结果将显示在这里..."
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElDivider, ElSpace, ElButton, ElInput, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { VmqGoService } from '@/api/vmqGoApi'
import axios from 'axios'

const userStore = useUserStore()
const testResult = ref('')

const addResult = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  testResult.value += `[${timestamp}] ${message}\n`
}

const testLogin = async () => {
  try {
    addResult('开始测试登录...')
    
    // 使用默认的管理员账号
    const response = await VmqGoService.login({
      username: 'admin',
      password: '123456'
    })
    
    addResult(`登录成功: ${JSON.stringify(response, null, 2)}`)
    
    // 设置token到store
    userStore.setToken(response.accessToken, response.refreshToken)
    userStore.setLoginStatus(true)
    userStore.setUserInfo({
      userId: response.user.id,
      userName: response.user.username,
      avatar: '',
      roles: [response.user.role],
      buttons: []
    })
    
    ElMessage.success('登录成功')
  } catch (error: any) {
    addResult(`登录失败: ${JSON.stringify(error.response?.data || error.message, null, 2)}`)
    ElMessage.error('登录失败')
  }
}

const testGetUsers = async () => {
  try {
    addResult('开始测试获取用户列表...')
    addResult(`当前token: ${userStore.accessToken}`)
    
    const response = await VmqGoService.getUsers({
      page: 1,
      limit: 10
    })
    
    addResult(`获取用户列表成功: ${JSON.stringify(response, null, 2)}`)
    ElMessage.success('获取用户列表成功')
  } catch (error: any) {
    addResult(`获取用户列表失败: ${JSON.stringify(error.response?.data || error.message, null, 2)}`)
    addResult(`错误状态码: ${error.response?.status}`)
    ElMessage.error('获取用户列表失败')
  }
}

const testHealthCheck = async () => {
  try {
    addResult('开始测试健康检查...')
    
    const response = await axios.get('http://localhost:8000/health')
    
    addResult(`健康检查成功: ${JSON.stringify(response.data, null, 2)}`)
    ElMessage.success('后端服务正常')
  } catch (error: any) {
    addResult(`健康检查失败: ${JSON.stringify(error.response?.data || error.message, null, 2)}`)
    ElMessage.error('后端服务异常')
  }
}
</script>

<style scoped>
.debug-page {
  padding: 20px;
}
</style>
