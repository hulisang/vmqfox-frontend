<template>
  <div class="payment-container">
    <el-card v-loading="loading" class="payment-card">
      <template #header>
        <div class="payment-header">
          <img v-if="orderInfo.payType === 1" :src="wechatPayLogo" class="payment-logo" alt="微信支付">
          <img v-else-if="orderInfo.payType === 2" :src="alipayLogo" class="payment-logo" alt="支付宝">
          <h2>{{ payTypeName }}扫码支付</h2>
        </div>
      </template>
      
      <div v-if="expired" class="payment-expired">
        <el-alert type="error" show-icon :closable="false">
          订单已过期，请返回商户网站重新发起支付
        </el-alert>
      </div>
      
      <div v-else-if="networkError" class="payment-error">
        <el-alert type="warning" show-icon :closable="false">
          网络连接异常，但您仍可继续扫码支付。完成支付后请刷新页面查看结果。
        </el-alert>
        <el-button type="primary" @click="refreshPage" class="mt-4">刷新页面</el-button>
      </div>
      
      <div v-else class="payment-content">
        <div class="payment-amount">¥{{ orderInfo.reallyPrice }}</div>
        
        <div class="qrcode-wrapper">
          <qr-code :url="orderInfo.payUrl" :pay-type="orderInfo.payType" />
        </div>
        
        <div v-if="orderInfo.price !== orderInfo.reallyPrice" class="payment-notice">
          <el-alert type="warning" :closable="false">
            为了您正常支付，请务必付款 <b>{{ orderInfo.reallyPrice }}</b> 元
          </el-alert>
        </div>
        
        <payment-countdown 
          v-if="remainingSeconds > 0"
          :timeout="remainingSeconds" 
          :created-at="Date.now() / 1000"
          @timeout="handleTimeout" 
        />
        
        <div class="payment-tip">
          <p>请使用{{ payTypeName }}扫一扫</p>
          <p v-if="orderInfo.isAuto === 0">扫描二维码完成支付</p>
          <p v-else>扫码后输入金额支付</p>
        </div>
        
        <div class="payment-detail">
          <el-collapse>
            <el-collapse-item title="订单详情" name="1">
              <div class="order-detail">
                <div class="detail-item">
                  <span class="label">商户单号：</span>
                  <span class="value">{{ orderInfo.payId }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">订单金额：</span>
                  <span class="value">{{ orderInfo.price }} 元</span>
                </div>
                <div class="detail-item">
                  <span class="label">创建时间：</span>
                  <span class="value">{{ formatDate(orderInfo.date) }}</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import QrCode from './QrCode.vue'
import PaymentCountdown from './PaymentCountdown.vue'
import { PaymentService, OrderInfo } from '@/api/paymentApi'
import wechatPayLogo from '@/assets/img/payment/wechat-pay.png'
import alipayLogo from '@/assets/img/payment/alipay.png'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.params.orderId as string)

const loading = ref(true)
const expired = ref(false)
const orderInfo = ref<OrderInfo>({} as OrderInfo)
const remainingSeconds = ref(0)
const networkError = ref(false)
let checkTimer: number | null = null
let autoRefreshTimer: number | null = null

// 支付方式名称
const payTypeName = computed(() => {
  return orderInfo.value.payType === 1 ? '微信' : '支付宝'
})

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

// 获取订单信息
const fetchOrderInfo = async () => {
  loading.value = true
  try {
    const orderData = await PaymentService.getOrder(orderId.value)
    orderInfo.value = orderData
    
    // 使用后端返回的剩余秒数
    if (orderData.remainingSeconds !== undefined) {
      remainingSeconds.value = orderData.remainingSeconds
    } else {
      // 如果后端没有返回剩余秒数，使用传统方式计算
      remainingSeconds.value = orderData.timeOut * 60
    }
    
    // 调试信息
    console.log('订单信息:', JSON.stringify(orderData, null, 2))
    console.log('订单超时时间(分钟):', orderData.timeOut)
    console.log('订单创建时间戳:', orderData.date)
    console.log('订单创建时间:', new Date(orderData.date * 1000).toLocaleString())
    console.log('后端返回的剩余秒数:', orderData.remainingSeconds)
    console.log('实际使用的剩余秒数:', remainingSeconds.value)
    
    // 检查初始订单状态
    if (orderData.state === 1) {
      // 如果订单已支付，直接跳转到结果页
      ElMessage.success('订单已支付，正在跳转...');
      router.replace(`/payment/result/${orderId.value}`);
      return; 
    }
    
    if (orderData.state === -1 || remainingSeconds.value <= 0) {
      // 如果订单已过期，显示过期提示
      expired.value = true
    } else {
      // 订单未支付，开始轮询
      startPolling()
    }
  } catch (error) {
    ElMessage.error('获取订单信息失败')
    expired.value = true
  } finally {
    loading.value = false
  }
}

// 开始轮询订单状态
const startPolling = () => {
  checkOrderStatus()
  // 每3秒检查一次订单状态（原来是1.5秒，延长间隔减轻服务器压力）
  checkTimer = window.setInterval(checkOrderStatus, 3000)
}

// 连续错误计数
let errorCount = 0;
const MAX_ERROR_COUNT = 3; // 最大允许连续错误次数

// 检查订单状态
const checkOrderStatus = async () => {
  try {
    // 如果订单已过期，停止轮询
    if (expired.value || remainingSeconds.value <= 0) {
      console.log('订单已过期或剩余时间为0，停止轮询')
      clearInterval(checkTimer!)
      return
    }
    
    const response = await PaymentService.checkOrder(orderId.value)
    
    // 调试信息
    console.log('检查订单状态响应:', response)
    
    // 重置错误计数
    errorCount = 0;
    
    // 重置网络错误状态
    networkError.value = false
    
    // 根据后端状态码处理不同情况
    if (response && response.state === 1) {
      // 支付成功
      console.log('订单支付成功，准备跳转到商户平台')
      clearInterval(checkTimer!)
      clearAutoRefreshTimer()

      // 直接跳转到商户平台，而不是自己的结果页面
      ElMessage.success('支付成功，正在跳转到商户平台...')
      await handleSuccessfulPaymentRedirect('')
    } else if (response && response.state === -1) {
      // 订单过期
      console.log('订单已过期')
      expired.value = true
      clearInterval(checkTimer!)
      clearAutoRefreshTimer()
    } else {
      // 未支付状态，继续轮询
      console.log('订单未支付，继续轮询')

      // 更新剩余时间
      if (response && response.remainingSeconds !== undefined) {
        console.log('订单剩余时间(秒):', response.remainingSeconds)
        remainingSeconds.value = response.remainingSeconds

        // 如果剩余时间小于等于0，设置为过期
        if (remainingSeconds.value <= 0) {
          console.log('订单剩余时间为0，设置为过期状态')
          expired.value = true
          clearInterval(checkTimer!)
          clearAutoRefreshTimer()
        }
      }
    }
  } catch (error) {
    errorCount++;
    console.error(`检查订单状态失败 (${errorCount}/${MAX_ERROR_COUNT})`, error)
    
    // 如果连续错误次数超过阈值，停止轮询
    if (errorCount >= MAX_ERROR_COUNT) {
      console.error('连续错误次数过多，停止轮询')
      clearInterval(checkTimer!)
      
      // 设置网络错误状态
      networkError.value = true
      
      // 显示友好的错误提示
      ElMessage.warning('网络连接异常，请完成支付后刷新页面查看结果')
      
      // 启动自动刷新定时器
      startAutoRefreshTimer()
    }
    // 否则继续尝试，不中断轮询
  }
}

// 处理支付成功后的跳转
const handleSuccessfulPaymentRedirect = async (redirectUrl: string) => {
  try {
    // 尝试通过API获取带签名的返回URL
    const response = await PaymentService.getReturnUrl(orderId.value);
    console.log('获取到带签名的返回URL:', response);

    if (response && response.returnUrl) {
      // 使用后端生成的带签名的返回URL
      console.log('跳转到后端生成的返回URL:', response.returnUrl);
      window.location.href = response.returnUrl;
    } else {
      // 如果API返回失败，跳转到自己的结果页面作为备用方案
      console.warn('API未返回有效的返回URL，跳转到结果页面');
      router.replace(`/payment/result/${orderId.value}`);
    }
  } catch (error) {
    console.error('获取带签名的返回URL失败，跳转到结果页面:', error);
    // 发生错误时跳转到自己的结果页面
    router.replace(`/payment/result/${orderId.value}`);
  }
}

// 启动自动刷新定时器
const startAutoRefreshTimer = () => {
  // 每30秒自动刷新一次页面，尝试恢复连接
  if (!autoRefreshTimer) {
    console.log('启动自动刷新定时器')
    autoRefreshTimer = window.setInterval(() => {
      console.log('执行自动刷新')
      window.location.reload()
    }, 30000)
  }
}

// 清除自动刷新定时器
const clearAutoRefreshTimer = () => {
  if (autoRefreshTimer) {
    console.log('清除自动刷新定时器')
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// 手动刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 倒计时结束处理
const handleTimeout = () => {
  console.log('倒计时组件触发timeout事件，设置订单为已过期状态')
  expired.value = true
  if (checkTimer) {
    console.log('清除订单状态检查定时器')
    clearInterval(checkTimer)
  }
}

// 组件挂载时获取订单信息
onMounted(() => {
  fetchOrderInfo()
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (checkTimer) {
    clearInterval(checkTimer)
  }
  clearAutoRefreshTimer()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.payment-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.payment-card {
  background: var(--art-main-bg-color);
  border: 1px solid var(--art-border-color);
  border-radius: calc(var(--custom-radius, 0.75rem) + 4px);
  box-shadow: var(--art-box-shadow-sm);
  overflow: hidden;

  :deep(.el-card__header) {
    background: var(--art-main-bg-color);
    border-bottom: 1px solid var(--art-border-color);
    padding: 24px 32px;
  }

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.payment-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: var(--art-text-gray-900);
  }
}

.payment-logo {
  width: 36px;
  height: 36px;
}

.payment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-amount {
  font-size: 36px;
  font-weight: 600;
  margin: 24px 0;
  color: var(--art-text-gray-900);
  background: linear-gradient(135deg, rgb(var(--art-primary)), rgb(var(--art-secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.qrcode-wrapper {
  width: 240px;
  height: 240px;
  margin: 0 auto 24px;
  padding: 20px;
  background: var(--art-main-bg-color);
  border: 2px solid var(--art-border-color);
  border-radius: calc(var(--custom-radius, 0.75rem));
  box-shadow: var(--art-box-shadow-xs);
}

.payment-notice {
  margin: 20px 0;
  width: 100%;
}

.payment-tip {
  margin: 20px 0;
  text-align: center;

  p {
    margin: 8px 0;
    font-size: 15px;
    color: var(--art-text-gray-600);
    line-height: 1.5;

    &:first-child {
      font-size: 16px;
      font-weight: 500;
      color: var(--art-text-gray-800);
    }
  }
}

.payment-detail {
  width: 100%;
  margin-top: 24px;

  :deep(.el-collapse) {
    border: 1px solid var(--art-border-color);
    border-radius: calc(var(--custom-radius, 0.75rem));
    overflow: hidden;
  }

  :deep(.el-collapse-item__header) {
    background: var(--art-gray-100);
    padding: 16px 20px;
    font-weight: 500;
    color: var(--art-text-gray-800);
  }

  :deep(.el-collapse-item__content) {
    padding: 20px;
    background: var(--art-main-bg-color);
  }
}

.order-detail {
  padding: 0;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--art-border-color);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.label {
  color: var(--art-text-gray-600);
  width: 100px;
  font-weight: 500;
  flex-shrink: 0;
}

.value {
  color: var(--art-text-gray-800);
  font-weight: 400;
  word-break: break-all;
}

.payment-expired,
.payment-error {
  padding: 40px 20px;
  text-align: center;
}

.mt-4 {
  margin-top: 20px;
}

// 响应式设计
@media only screen and (max-width: $device-ipad) {
  .payment-card {
    :deep(.el-card__header) {
      padding: 20px 24px;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .payment-amount {
    font-size: 32px;
  }

  .qrcode-wrapper {
    width: 200px;
    height: 200px;
    padding: 16px;
  }
}

@media only screen and (max-width: $device-phone) {
  .payment-card {
    :deep(.el-card__header) {
      padding: 16px 20px;
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .payment-header {
    h2 {
      font-size: 18px;
    }
  }

  .payment-logo {
    width: 32px;
    height: 32px;
  }

  .payment-amount {
    font-size: 28px;
    margin: 20px 0;
  }

  .qrcode-wrapper {
    width: 180px;
    height: 180px;
    padding: 12px;
  }

  .label {
    width: 80px;
    font-size: 14px;
  }

  .payment-expired,
  .payment-error {
    padding: 30px 15px;
  }
}
</style>