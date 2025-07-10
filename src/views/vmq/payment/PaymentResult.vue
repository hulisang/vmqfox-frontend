<template>
  <div class="result-container">
    <el-card class="result-card">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>
      
      <template v-else>
        <div v-if="success" class="success-state">
          <el-result
            icon="success"
            title="支付成功"
            sub-title="您的订单已支付完成"
          >
            <template #extra>
              <el-button type="primary" @click="goToMerchant">返回商户网站</el-button>
            </template>
          </el-result>
          
          <div class="order-info">
            <div class="info-item">
              <span class="label">订单金额：</span>
              <span class="value">¥{{ orderInfo.price }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单编号：</span>
              <span class="value">{{ orderInfo.payId }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付方式：</span>
              <span class="value">{{ orderInfo.payType === 1 ? '微信支付' : '支付宝支付' }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="failed-state">
          <el-result
            icon="error"
            title="支付失败"
            sub-title="订单支付未完成或已超时"
          >
            <template #extra>
              <el-button @click="retryPayment">重新支付</el-button>
              <el-button type="primary" @click="goToMerchant">返回商户网站</el-button>
            </template>
          </el-result>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PaymentService, OrderInfo } from '@/api/paymentApi'

const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId as string
const returnUrl = route.query.returnUrl as string || ''

const loading = ref(true)
const success = ref(false)
const orderInfo = ref<OrderInfo>({} as OrderInfo)

// 获取订单信息
const fetchOrderInfo = async () => {
  loading.value = true
  try {
    const orderData = await PaymentService.getOrder(orderId)
    
    // 检查数据有效性
    if (orderData) {
      orderInfo.value = orderData
      success.value = orderData.state === 1 // 1表示支付成功
    } else {
      throw new Error('无效的订单数据')
    }
  } catch (error) {
    ElMessage.error('获取订单信息失败')
    success.value = false
  } finally {
    loading.value = false
  }
}

// 返回商户网站
const goToMerchant = () => {
  if (returnUrl) {
    window.location.href = returnUrl
  } else {
    window.history.back()
  }
}

// 重新支付
const retryPayment = () => {
  router.push(`/payment/${orderId}`)
}

onMounted(() => {
  fetchOrderInfo()
})
</script>

<style scoped>
.result-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 15px;
}

.result-card {
  border-radius: 8px;
}

.loading-state {
  padding: 40px 20px;
}

.success-state, .failed-state {
  padding: 20px;
}

.order-info {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.label {
  color: #606266;
  width: 100px;
}

.value {
  font-weight: 500;
}
</style> 