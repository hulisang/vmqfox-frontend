<template>
  <div class="result-container">
    <el-card class="result-card">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="4" animated />
      </div>

      <template v-else>
        <!-- 支付成功状态 -->
        <div v-if="success" class="success-state">
          <el-result
            icon="success"
            title="支付成功"
            :sub-title="isRedirecting ? '正在跳转到商户网站...' : '资金已成功到账，请勿重复支付'"
          >
            <template #extra>
              <div v-if="isRedirecting" class="redirect-info">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>{{ redirectMessage }}</span>
              </div>
            </template>
          </el-result>

          <!-- 客户定心丸与客服维权凭证提示卡片 -->
          <div class="customer-notice-box">
            <div class="notice-item success-item">
              <el-icon class="notice-icon"><CircleCheckFilled /></el-icon>
              <span><strong>支付状态确认</strong>：您的款项已成功扣除并到账，资金安全无虞，<strong>切勿重复付款</strong>。</span>
            </div>
            <div class="notice-item info-item-tip">
              <el-icon class="notice-icon"><InfoFilled /></el-icon>
              <span><strong>未自动到账/发货提示</strong>：若商户系统未自动为您发放商品或开通权益，属于商户系统回调延迟，请保存下方<strong>【商户单号】</strong>直接联系商户客服核对处理。</span>
            </div>
          </div>

          <!-- 订单明细卡片 -->
          <div class="order-info">
            <div class="info-item">
              <span class="label">实付金额：</span>
              <span class="value price-highlight">¥{{ orderInfo.reallyPrice || orderInfo.price }}</span>
            </div>
            <div class="info-item">
              <span class="label">商户单号：</span>
              <div class="value-with-btn">
                <span class="value code-font">{{ orderInfo.payId }}</span>
                <el-button
                  size="small"
                  type="primary"
                  link
                  :icon="CopyDocument"
                  @click="copyText(orderInfo.payId)"
                >
                  复制单号
                </el-button>
              </div>
            </div>
            <div class="info-item">
              <span class="label">支付方式：</span>
              <span class="value">{{ orderInfo.payType === 1 ? '微信支付' : '支付宝支付' }}</span>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div v-if="targetReturnUrl" class="action-footer mt-4">
            <el-button type="primary" size="large" @click="goToMerchant">
              立即返回商户网站
            </el-button>
          </div>
        </div>

        <!-- 支付失败或未完成状态 -->
        <div v-else class="failed-state">
          <el-result
            icon="error"
            title="支付未完成"
            sub-title="该订单尚未检测到付款到账，或已超时失效"
          >
            <template #extra>
              <el-button @click="retryPayment">重新发起支付</el-button>
              <el-button v-if="targetReturnUrl" type="primary" @click="goToMerchant">返回商户网站</el-button>
            </template>
          </el-result>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onBeforeUnmount, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Loading, CopyDocument, CircleCheckFilled, InfoFilled } from '@element-plus/icons-vue'
  import { PaymentService, OrderInfo } from '@/api/paymentApi'
  import { safeHttpUrl, navigateTo } from '@/utils/navigation/safeUrl'

  const route = useRoute()
  const router = useRouter()
  const publicToken = route.params.publicToken as string

  const loading = ref(true)
  const success = ref(false)
  const isRedirecting = ref(false)
  const targetReturnUrl = ref('')
  const orderInfo = ref<OrderInfo>({} as OrderInfo)
  const redirectMessage = ref('正在获取跳转地址...')
  let redirectTimer: number | undefined

  // 组件离开或手动跳转前取消旧计时器，避免旧页面覆盖用户的新导航。
  const clearRedirectTimer = () => {
    if (redirectTimer === undefined) return
    window.clearTimeout(redirectTimer)
    redirectTimer = undefined
  }

  // 获取订单信息
  const fetchOrderInfo = async () => {
    loading.value = true
    try {
      const orderData = await PaymentService.getOrder(publicToken)
      if (orderData) {
        orderInfo.value = orderData
        // state: 1 (已支付), 2 (通知失败但已支付) 均视为客户付款成功
        success.value = orderData.state === 1 || orderData.state === 2

        if (success.value) {
          await handleAutoRedirect()
        }
      } else {
        throw new Error('无效的订单数据')
      }
    } catch (error) {
      console.error('获取订单信息失败:', error)
      ElMessage.error('获取订单信息失败')
      success.value = false
    } finally {
      loading.value = false
    }
  }

  // 自动跳转到商户网站处理：只接受 http(s) 回跳地址，其余一律停留本页
  const handleAutoRedirect = async () => {
    try {
      const response = await PaymentService.getReturnUrl(publicToken)
      const validUrl = safeHttpUrl(response?.returnUrl ?? '')

      if (validUrl) {
        targetReturnUrl.value = validUrl
        isRedirecting.value = true
        redirectMessage.value = '即将跳转到商户网站...'

        // 延迟 1.8 秒后跳转，让用户看清成功提示；先清理旧计时器避免重复跳转。
        clearRedirectTimer()
        redirectTimer = window.setTimeout(() => {
          redirectTimer = undefined
          navigateTo(validUrl)
        }, 1800)
      } else {
        // 无有效返回 URL，停留在本页
        isRedirecting.value = false
      }
    } catch {
      console.warn('获取返回URL失败或无配置，停留在本地结果页')
      isRedirecting.value = false
    }
  }

  // 手动返回商户网站
  const goToMerchant = () => {
    clearRedirectTimer()
    if (!navigateTo(targetReturnUrl.value)) {
      window.history.back()
    }
  }

  // 重新支付
  const retryPayment = () => {
    clearRedirectTimer()
    router.push(`/payment/${publicToken}`)
  }

  // 复制文本
  const copyText = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制单号到剪贴板')
    } catch (e) {
      ElMessage.error('复制失败，请长按手动复制')
    }
  }

  onMounted(() => {
    fetchOrderInfo()
  })

  onBeforeUnmount(() => {
    clearRedirectTimer()
  })
</script>

<style lang="scss" scoped>
  @use '@/assets/styles/variables.scss' as *;

  .result-container {
    width: 100%;
    max-width: 600px;
    margin: 30px auto;
    padding: 0 16px;
  }

  .result-card {
    background: var(--art-main-bg-color, #ffffff);
    border: 1px solid var(--art-border-color, #ebeef5);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    :deep(.el-card__body) {
      padding: 32px 24px;
    }
  }

  .loading-state {
    padding: 40px 20px;
    text-align: center;
  }

  .success-state,
  .failed-state {
    :deep(.el-result) {
      padding: 10px 0 20px;
    }

    :deep(.el-result__title) {
      color: var(--el-text-color-primary, #303133);
      font-weight: 600;
      font-size: 22px;
      margin: 12px 0 6px;
    }

    :deep(.el-result__subtitle) {
      color: var(--el-text-color-secondary, #606266);
      font-size: 14px;
      margin-bottom: 12px;
    }
  }

  .customer-notice-box {
    background: #fdf6ec;
    border: 1px solid #faecd8;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 1.6;

    .notice-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-icon {
        font-size: 16px;
        margin-right: 8px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      &.success-item {
        color: #67c23a;
        .notice-icon {
          color: #67c23a;
        }
        span {
          color: #529b2e;
        }
      }

      &.info-item-tip {
        color: #e6a23c;
        .notice-icon {
          color: #e6a23c;
        }
        span {
          color: #b88230;
        }
      }
    }
  }

  .order-info {
    padding: 16px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #edf2f7;

    &:last-child {
      border-bottom: none;
    }
  }

  .label {
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .value {
    color: #1e293b;
    font-weight: 600;
    font-size: 14px;
    word-break: break-all;

    &.code-font {
      font-family: monospace;
      font-size: 13px;
    }

    &.price-highlight {
      color: #e11d48;
      font-size: 18px;
    }
  }

  .value-with-btn {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .action-footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;

    .el-button {
      width: 100%;
      border-radius: 8px;
    }
  }

  .redirect-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #3b82f6;
    font-size: 13px;
    margin-top: 4px;

    .el-icon {
      font-size: 15px;
    }
  }
</style>