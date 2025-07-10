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

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.result-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.result-card {
  background: var(--art-main-bg-color);
  border: 1px solid var(--art-border-color);
  border-radius: calc(var(--custom-radius, 0.75rem) + 4px);
  box-shadow: var(--art-box-shadow-sm);
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 40px 32px;
  }
}

.loading-state {
  padding: 60px 20px;
  text-align: center;
}

.success-state, .failed-state {
  padding: 20px 0;

  :deep(.el-result) {
    padding: 20px 0;
  }

  :deep(.el-result__title) {
    color: var(--art-text-gray-900);
    font-weight: 600;
    font-size: 24px;
    margin: 16px 0;
  }

  :deep(.el-result__subtitle) {
    color: var(--art-text-gray-600);
    font-size: 16px;
    margin-bottom: 24px;
  }

  :deep(.el-result__extra) {
    margin-top: 32px;

    .el-button {
      margin: 0 8px;
      padding: 12px 24px;
      font-weight: 500;
      border-radius: calc(var(--custom-radius, 0.75rem));
    }
  }
}

.order-info {
  margin-top: 32px;
  padding: 24px;
  background: var(--art-gray-100);
  border: 1px solid var(--art-border-color);
  border-radius: calc(var(--custom-radius, 0.75rem));
}

.info-item {
  display: flex;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--art-border-color);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.label {
  color: var(--art-text-gray-600);
  width: 120px;
  font-weight: 500;
  flex-shrink: 0;
}

.value {
  color: var(--art-text-gray-800);
  font-weight: 600;
  word-break: break-all;
}

// 响应式设计
@media only screen and (max-width: $device-ipad) {
  .result-card {
    :deep(.el-card__body) {
      padding: 32px 24px;
    }
  }

  .success-state, .failed-state {
    :deep(.el-result__title) {
      font-size: 22px;
    }

    :deep(.el-result__subtitle) {
      font-size: 15px;
    }
  }

  .order-info {
    padding: 20px;
  }
}

@media only screen and (max-width: $device-phone) {
  .result-card {
    :deep(.el-card__body) {
      padding: 24px 20px;
    }
  }

  .loading-state {
    padding: 40px 15px;
  }

  .success-state, .failed-state {
    :deep(.el-result__title) {
      font-size: 20px;
    }

    :deep(.el-result__subtitle) {
      font-size: 14px;
    }

    :deep(.el-result__extra) {
      margin-top: 24px;

      .el-button {
        margin: 4px;
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .order-info {
    margin-top: 24px;
    padding: 16px;
  }

  .info-item {
    margin-bottom: 12px;
    padding: 8px 0;
  }

  .label {
    width: 80px;
    font-size: 14px;
  }

  .value {
    font-size: 14px;
  }
}
</style>