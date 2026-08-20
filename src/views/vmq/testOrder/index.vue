<template>
  <div class="test-order-container">
    <!-- 顶部说明卡片 -->
    <el-card class="intro-card mb-4" shadow="never">
      <div class="intro-header">
        <div class="intro-title">
          <el-icon class="title-icon"><Opportunity /></el-icon>
          <span>测试订单与回调联调实验室</span>
        </div>
        <el-tag type="info" effect="plain" round>联调工具</el-tag>
      </div>
      <p class="intro-desc">
        在此页面您可以模拟商户系统发起真实的订单创建请求，体验收银台扫码支付，或一键模拟监控端推送完成支付，并实时检测同步跳转与异步 Webhook 回调的数据链路。
      </p>
    </el-card>

    <!-- 左右分栏布局 -->
    <el-row :gutter="20">
      <!-- 左侧：创建测试订单表单 -->
      <el-col :xs="24" :lg="12">
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header-flex">
              <span class="font-bold">📝 1. 模拟创建待支付订单</span>
              <el-button link type="primary" :icon="Refresh" @click="resetToDefaults">
                重置测试数据
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            label-position="right"
          >
            <el-form-item label="通讯密钥 (key)" prop="key" required>
              <el-input
                v-model="formData.key"
                placeholder="系统通讯密钥"
                show-password
                clearable
              >
                <template #append>
                  <el-button @click="fetchSystemKey">读取配置</el-button>
                </template>
              </el-input>
              <div class="field-tip">与后台系统设置中的通讯密钥保持一致，作为 HMAC-SHA-256 的签名密钥。</div>
            </el-form-item>

            <el-form-item label="商户单号 (payId)" prop="payId" required>
              <el-input v-model="formData.payId" placeholder="商户自定义单号">
                <template #append>
                  <el-button :icon="RefreshRight" @click="generateNewPayId">重新生成</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="支付方式" prop="type" required>
              <el-radio-group v-model="formData.type" class="pay-type-group">
                <el-radio-button :value="1">
                  <span class="pay-type-label wechat-label">
                    <span class="pay-icon-dot wechat-dot"></span> 微信支付 (type=1)
                    <el-tag size="small" :type="wxConfigured ? 'success' : 'info'" style="margin-left: 6px;">
                      {{ wxConfigured ? '通用码已配' : '未配通用码' }}
                    </el-tag>
                  </span>
                </el-radio-button>
                <el-radio-button :value="2">
                  <span class="pay-type-label alipay-label">
                    <span class="pay-icon-dot alipay-dot"></span> 支付宝 (type=2)
                    <el-tag size="small" :type="zfbConfigured ? 'success' : 'info'" style="margin-left: 6px;">
                      {{ zfbConfigured ? '通用码已配' : '未配通用码' }}
                    </el-tag>
                  </span>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="订单金额 (元)" prop="price" required>
              <el-input
                v-model="formData.price"
                placeholder="请输入金额，如 0.01"
                type="number"
                step="0.01"
                min="0.01"
              >
                <template #prefix>¥</template>
              </el-input>
              <!-- 快捷金额选择 -->
              <div class="preset-amounts mt-2">
                <span class="preset-title">快捷预设：</span>
                <el-button
                  v-for="amt in ['0.01', '0.10', '1.00', '5.00']"
                  :key="amt"
                  size="small"
                  :type="formData.price === amt ? 'primary' : 'default'"
                  @click="formData.price = amt"
                >
                  ¥{{ amt }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="自定义透传参数" prop="param">
              <el-input v-model="formData.param" placeholder="可选，如 userId_1001"></el-input>
              <div class="field-tip">支付成功后将在回调中原样返回给商户系统。</div>
            </el-form-item>

            <el-form-item label="异步回调地址" prop="notifyUrl">
              <el-input
                v-model="formData.notifyUrl"
                placeholder="notifyUrl（接收 Webhook POST 通知）"
                clearable
              ></el-input>
            </el-form-item>

            <el-form-item label="同步跳转地址" prop="returnUrl">
              <el-input
                v-model="formData.returnUrl"
                placeholder="returnUrl（用户支付后跳转页面）"
                clearable
              ></el-input>
            </el-form-item>

            <!-- v2 签名实时预览卡片 -->
            <div class="sign-preview-box mb-4">
              <div class="sign-header">
                <span class="sign-title">🔐 v2 签名算法预览（HMAC-SHA-256）</span>
                <el-tag size="small" :type="signVectorPassed ? 'success' : 'danger'">
                  {{ signVectorPassed ? '黄金向量自检通过' : '黄金向量不一致，三端协议已漂移' }}
                </el-tag>
              </div>
              <div class="sign-formula">
                <code>sign = hmac_sha256(key, "payId=" + payId + "&param=" + param + "&type=" + type + "&price=" + price + "&notifyUrl=" + notifyUrl + "&returnUrl=" + returnUrl)</code>
              </div>
              <div class="sign-string">
                <span class="label">待签原串：</span>
                <code class="raw-string">{{ rawSignString }}</code>
              </div>
              <div class="sign-result">
                <span class="label">签名结果：</span>
                <span class="sign-value">{{ calculatedSign }}</span>
              </div>
            </div>

            <!-- 提交按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="createLoading"
                :icon="Promotion"
                @click="handleCreateOrder"
                style="width: 100%"
              >
                🚀 立即创建待支付订单
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：订单全生命周期与回调检测监控区 -->
      <el-col :xs="24" :lg="12">
        <el-card class="monitor-card" shadow="hover">
          <template #header>
            <div class="card-header-flex">
              <span class="font-bold">📊 2. 订单全生命周期与回调监控</span>
              <div v-if="currentOrder" class="polling-control">
                <span class="polling-label">自动轮询：</span>
                <el-switch v-model="autoPolling" size="small" @change="togglePolling" />
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-if="!currentOrder" class="empty-order-box">
            <el-empty
              description="暂无进行中的测试订单"
              :image-size="120"
            >
              <template #description>
                <p class="text-gray-500">👈 请在左侧填写参数并点击【立即创建测试订单】</p>
                <p class="text-xs text-gray-400 mt-1">创建后将在此处实时监控订单流转、收银台跳转与回调数据包</p>
              </template>
            </el-empty>
          </div>

          <!-- 订单存在时的监控面板 -->
          <div v-else class="order-dashboard">
            <!-- 状态卡片顶部 -->
            <div class="order-status-banner" :class="statusBannerClass">
              <div class="status-left">
                <el-icon class="status-icon" :size="24">
                  <component :is="statusIconComponent" />
                </el-icon>
                <div class="status-texts">
                  <div class="status-title">{{ statusTitle }}</div>
                  <div class="status-subtitle">{{ statusSubtitle }}</div>
                </div>
              </div>
              <div class="status-right">
                <el-tag :type="statusTagType" size="large" effect="dark" round>
                  {{ statusText }}
                </el-tag>
              </div>
            </div>

            <!-- 核心数据指标 -->
            <div class="order-metrics-grid mt-4">
              <div class="metric-item">
                <div class="metric-label">系统订单号 (orderId)</div>
                <div class="metric-value code-font">
                  {{ currentOrder.orderId }}
                  <el-button link type="primary" :icon="CopyDocument" @click="copyText(currentOrder.orderId)" />
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-label">商户订单号 (payId)</div>
                <div class="metric-value code-font">
                  {{ currentOrder.payId }}
                  <el-button link type="primary" :icon="CopyDocument" @click="copyText(currentOrder.payId)" />
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-label">标价金额</div>
                <div class="metric-value price-text">¥{{ currentOrder.price }}</div>
              </div>

              <div class="metric-item">
                <div class="metric-label">
                  实际应付金额 (reallyPrice)
                  <el-tooltip
                    v-if="Number(currentOrder.reallyPrice) !== Number(currentOrder.price)"
                    content="系统启用了金额浮动防碰撞，必须按此实付金额付款"
                    placement="top"
                  >
                    <el-icon class="tip-icon"><WarningFilled /></el-icon>
                  </el-tooltip>
                </div>
                <div
                  class="metric-value price-text"
                  :class="{ 'float-price': Number(currentOrder.reallyPrice) !== Number(currentOrder.price) }"
                >
                  ¥{{ currentOrder.reallyPrice }}
                </div>
              </div>
            </div>

            <!-- 快捷操作栏 -->
            <div class="action-buttons-group mt-4">
              <!-- 去支付页面 -->
              <el-button
                type="success"
                :icon="CreditCard"
                @click="openPaymentPage"
              >
                🔗 打开收银台去支付
              </el-button>

              <!-- 模拟监控端推送 -->
              <el-button
                type="warning"
                :loading="pushLoading"
                :disabled="orderStatusState === 1"
                :icon="Lightning"
                @click="handleMockPush"
              >
                ⚡ 模拟监控端推送 (一键秒付)
              </el-button>

              <!-- 手动刷新 -->
              <el-button
                type="default"
                :loading="checkLoading"
                :icon="Refresh"
                @click="checkOrderStatus(true)"
              >
                刷新状态
              </el-button>
            </div>

            <!-- 回调与通知检测标签页 -->
            <el-tabs v-model="activeTab" class="callback-tabs mt-4">
              <!-- Tab 1: 异步通知 (Webhook) -->
              <el-tab-pane label="📡 异步通知 (notifyUrl)" name="notify">
                <div class="tab-content-box">
                  <div class="notify-meta mb-2">
                    <span class="label">通知目标地址：</span>
                    <code class="url-text">{{ formData.notifyUrl || '系统默认通知地址' }}</code>
                  </div>

                  <div class="notify-status mb-3">
                    <span class="label">支付通知状态：</span>
                    <el-tag v-if="orderStatusState === 1" type="success" size="small">
                      已触发异步通知
                    </el-tag>
                    <el-tag v-else-if="orderStatusState === 0" type="info" size="small">
                      等待支付后自动触发
                    </el-tag>
                    <el-tag v-else type="danger" size="small">已失效</el-tag>
                  </div>

                  <div class="payload-title">📦 Webhook 回调推送数据包 (POST Payload)：</div>
                  <pre class="json-viewer"><code>{{ webhookPayloadFormatted }}</code></pre>

                  <div class="sign-verify-section mt-3">
                    <div class="verify-header">
                      <span>🔑 回调签名规则与校验：</span>
                      <el-tag
                        v-if="orderStatusState === 1"
                        type="success"
                        size="small"
                      >
                        签名匹配通过
                      </el-tag>
                    </div>
                    <code class="verify-formula">
                      notifySign = hmac_sha256(key, "payId=" + payId + "&param=" + param + "&type=" + type + "&price=" + price + "&reallyPrice=" + reallyPrice)
                    </code>
                    <div class="verify-detail mt-2">
                      <div>待签原串: <code>{{ webhookRawString }}</code></div>
                      <div>校验签名: <span class="text-success font-bold">{{ webhookSign }}</span></div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- Tab 2: 同步跳转 (returnUrl) -->
              <el-tab-pane label="🔗 同步跳转 (returnUrl)" name="return">
                <div class="tab-content-box">
                  <div class="notify-meta mb-2">
                    <span class="label">同步跳转基础地址：</span>
                    <code class="url-text">{{ formData.returnUrl || '系统默认跳转地址' }}</code>
                  </div>
                  <p class="text-sm text-gray-500 mb-2">
                    用户在收银台页面完成支付后，收银台将自动携带以下签名参数跳转回商户网站：
                  </p>
                  <div class="payload-title">🔗 完整带参跳转 URL：</div>
                  <div class="return-url-box">
                    <code class="full-url">{{ completeReturnUrl }}</code>
                    <el-button
                      size="small"
                      type="primary"
                      link
                      :icon="CopyDocument"
                      @click="copyText(completeReturnUrl)"
                    >
                      复制链接
                    </el-button>
                  </div>
                </div>
              </el-tab-pane>

              <!-- Tab 3: 原始 API 响应 -->
              <el-tab-pane label="📄 原始 API 响应报文" name="raw">
                <div class="tab-content-box">
                  <div class="payload-title">1. /api/order/create 响应：</div>
                  <pre class="json-viewer mb-3"><code>{{ JSON.stringify(createRawResponse, null, 2) }}</code></pre>
                  <div class="payload-title">2. /checkOrder 响应：</div>
                  <pre class="json-viewer"><code>{{ JSON.stringify(checkRawResponse, null, 2) }}</code></pre>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'
  import {
    Opportunity,
    Refresh,
    RefreshRight,
    Promotion,
    CopyDocument,
    CreditCard,
    Lightning,
    WarningFilled,
    CircleCheckFilled,
    Clock,
    CircleCloseFilled,
    InfoFilled
  } from '@element-plus/icons-vue'
  import { VmqService, type CreateOrderResult } from '@/api/vmqApi'
  import { PaymentService } from '@/api/paymentApi'
  import {
    amountText,
    callbackCanonical,
    callbackSign,
    createOrderCanonical,
    createOrderSign,
    pushSign,
    signTimestamp,
    verifySignVectors
  } from '@/api/vmqSign'
  import { openInNewTab } from '@/utils/navigation/safeUrl'

  // --- 表单与状态定义 ---
  const formRef = ref<FormInstance>()
  const createLoading = ref(false)
  const pushLoading = ref(false)
  const checkLoading = ref(false)
  const activeTab = ref('notify')
  const autoPolling = ref(true)
  let pollTimer: number | null = null

  // 表单数据
  const formData = reactive({
    key: '',
    payId: '',
    type: 1, // 1: 微信, 2: 支付宝
    price: '0.01',
    param: 'test_demo_param',
    notifyUrl: '',
    returnUrl: ''
  })

  // 校验规则
  const formRules = {
    key: [{ required: true, message: '请输入通讯密钥', trigger: 'blur' }],
    payId: [{ required: true, message: '请输入商户单号', trigger: 'blur' }],
    type: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
    price: [{ required: true, message: '请输入测试金额', trigger: 'blur' }]
  }

  // 当前测试订单
  const currentOrder = ref<CreateOrderResult | null>(null)
  const orderStatusState = ref<number>(0) // 0: 待支付, 1: 已支付, -1: 已过期, 2: 已关闭
  const createRawResponse = ref<any>(null)
  const checkRawResponse = ref<any>(null)

  // --- 签名计算逻辑（v2：HMAC-SHA-256，canonical 串与后端 payment 域逐字节一致）---
  // 浏览器端 HMAC 实现与后端/安卓端黄金向量的一致性自检，不一致说明三端协议已经漂移
  const signVectorPassed = verifySignVectors().every((item) => item.ok)

  // 金额定标两位小数，签名串与请求参数必须复用同一份文本
  const priceText = computed(() => amountText(formData.price))

  const createSignFields = computed(() => ({
    payId: formData.payId,
    param: formData.param,
    type: formData.type,
    price: priceText.value,
    notifyUrl: formData.notifyUrl,
    returnUrl: formData.returnUrl
  }))

  const rawSignString = computed(() => createOrderCanonical(createSignFields.value))

  const calculatedSign = computed(() => {
    if (!formData.key || !formData.payId || !priceText.value) return ''
    return createOrderSign(createSignFields.value, formData.key)
  })

  const callbackFields = computed(() => {
    const value = currentOrder.value
    if (!value) return null
    return {
      payId: value.payId,
      param: formData.param,
      type: value.payType,
      price: amountText(value.price),
      reallyPrice: amountText(value.reallyPrice || value.price)
    }
  })

  const webhookRawString = computed(() =>
    callbackFields.value ? callbackCanonical(callbackFields.value) : ''
  )

  const webhookSign = computed(() =>
    callbackFields.value && formData.key ? callbackSign(callbackFields.value, formData.key) : ''
  )

  // Webhook Payload 模拟展示
  const webhookPayloadFormatted = computed(() => {
    if (!callbackFields.value) return '{}'
    const payload = {
      ...callbackFields.value,
      sign: webhookSign.value,
      state: orderStatusState.value
    }
    return JSON.stringify(payload, null, 2)
  })

  // 同步跳转完整 URL
  const completeReturnUrl = computed(() => {
    if (!callbackFields.value) return ''
    const base = formData.returnUrl || window.location.origin
    const params = new URLSearchParams({
      payId: callbackFields.value.payId,
      param: callbackFields.value.param,
      type: String(callbackFields.value.type),
      price: callbackFields.value.price,
      reallyPrice: callbackFields.value.reallyPrice,
      sign: webhookSign.value
    })
    return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`
  })

  // --- 状态与视觉展示计算 ---
  const statusText = computed(() => {
    switch (orderStatusState.value) {
      case 0:
        return '待支付'
      case 1:
        return '已支付'
      case -1:
        return '已过期'
      case 2:
        return '已关闭'
      default:
        return '未知状态'
    }
  })

  const statusTitle = computed(() => {
    switch (orderStatusState.value) {
      case 0:
        return '订单已创建，等待用户付款'
      case 1:
        return '🎉 订单已完成支付！'
      case -1:
        return '⏰ 订单已超时失效'
      case 2:
        return '❌ 订单已被系统关闭'
      default:
        return '订单状态'
    }
  })

  const statusSubtitle = computed(() => {
    switch (orderStatusState.value) {
      case 0:
        return '请点击下方【打开收银台】进行扫码，或点击【模拟监控端推送】完成一键支付。'
      case 1:
        return '款项已成功匹配，异步 Webhook 通知已推入出站信箱并尝试回调。'
      case -1:
        return '价格锁定已自动解除，请重新发起测试订单。'
      case 2:
        return '该订单已被管理员或系统手动关闭。'
      default:
        return ''
    }
  })

  const statusBannerClass = computed(() => {
    switch (orderStatusState.value) {
      case 0:
        return 'banner-pending'
      case 1:
        return 'banner-success'
      case -1:
        return 'banner-expired'
      case 2:
        return 'banner-closed'
      default:
        return ''
    }
  })

  const statusTagType = computed(() => {
    switch (orderStatusState.value) {
      case 0:
        return 'warning'
      case 1:
        return 'success'
      case -1:
        return 'info'
      case 2:
        return 'danger'
      default:
        return 'info'
    }
  })

  const statusIconComponent = computed(() => {
    switch (orderStatusState.value) {
      case 0:
        return Clock
      case 1:
        return CircleCheckFilled
      case -1:
        return InfoFilled
      case 2:
        return CircleCloseFilled
      default:
        return InfoFilled
    }
  })

  // --- 辅助方法 ---
  const generateNewPayId = () => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const rand = Math.floor(1000 + Math.random() * 9000)
    formData.payId = `TEST_${timeStr}_${rand}`
  }

  const wxConfigured = ref(false)
  const zfbConfigured = ref(false)

  const fetchSystemKey = async () => {
    try {
      const res = await VmqService.getSettings()
      if (res) {
        formData.key = res.key || ''
        if (!formData.notifyUrl) formData.notifyUrl = res.notifyUrl || ''
        if (!formData.returnUrl) formData.returnUrl = res.returnUrl || ''
        wxConfigured.value = Boolean(res.wxpay)
        zfbConfigured.value = Boolean(res.zfbpay)

        // 智能默认：若微信未配置通用码但支付宝已配置，自动选中支付宝
        if (!wxConfigured.value && zfbConfigured.value) {
          formData.type = 2
        } else if (wxConfigured.value && !zfbConfigured.value) {
          formData.type = 1
        }

        ElMessage.success('已成功从系统设置拉取通讯密钥与收款码配置')
      }
    } catch (e) {
      ElMessage.warning('拉取系统设置失败，请手动输入通讯密钥')
    }
  }

  const resetToDefaults = () => {
    generateNewPayId()
    formData.price = '0.01'
    formData.param = 'test_demo_param'
    formData.type = 1
    fetchSystemKey()
  }

  const copyText = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制到剪贴板')
    } catch (e) {
      ElMessage.error('复制失败，请手动选择复制')
    }
  }

  // --- 核心业务方法 ---
  // 创建待支付订单
  const handleCreateOrder = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      createLoading.value = true
      try {
        const payload = {
          payId: formData.payId,
          type: formData.type,
          price: priceText.value,
          sign: calculatedSign.value,
          param: formData.param,
          isHtml: 0,
          notifyUrl: formData.notifyUrl,
          returnUrl: formData.returnUrl
        }
        const res = await VmqService.createOrder(payload)
        createRawResponse.value = res

        // 提取返回数据 (兼顾不同响应包装结构)
        const orderData: CreateOrderResult = res?.data || res
        if (orderData && orderData.orderId) {
          currentOrder.value = orderData
          orderStatusState.value = orderData.state || 0
          ElMessage.success(`订单创建成功！系统单号: ${orderData.orderId}`)
          startPolling()
        } else {
          ElMessage.error('创建订单失败：未返回有效订单数据')
        }
      } catch (err: any) {
        console.error('创建订单异常:', err)
        ElMessage.error(err?.message || '创建订单失败，请检查密钥与签名配置')
      } finally {
        createLoading.value = false
      }
    })
  }

  // 打开收银台
  const openPaymentPage = () => {
    if (!currentOrder.value?.orderId) {
      ElMessage.warning('请先创建测试订单')
      return
    }
    const payUrl = `/#/payment/${currentOrder.value.orderId}`
    openInNewTab(payUrl)
  }

  // 模拟监控端推送 (与 vmqApk 保持 100% 协议一致：v2 HMAC-SHA-256 + 毫秒时间戳)
  const handleMockPush = async () => {
    if (!currentOrder.value) {
      ElMessage.warning('请先创建测试订单')
      return
    }
    if (!formData.key) {
      ElMessage.warning('请先填写通讯密钥，签名无法计算')
      return
    }
    pushLoading.value = true
    try {
      const pushFields = {
        type: currentOrder.value.payType,
        price: amountText(currentOrder.value.reallyPrice || currentOrder.value.price),
        t: signTimestamp()
      }

      await VmqService.appPush({
        ...pushFields,
        sign: pushSign(pushFields, formData.key)
      })

      ElMessage.success('⚡ 模拟监控端推送成功！系统已匹配到款项')
      // 立即刷新订单状态
      await checkOrderStatus(false)
    } catch (err: any) {
      console.error('模拟推送失败:', err)
      ElMessage.error(err?.message || '模拟推送失败')
    } finally {
      pushLoading.value = false
    }
  }

  // 检查订单状态
  const checkOrderStatus = async (showNotice = false) => {
    if (!currentOrder.value?.orderId) return
    checkLoading.value = true
    try {
      const res = await PaymentService.checkOrder(currentOrder.value.orderId)
      checkRawResponse.value = res
      if (res && res.state !== undefined) {
        orderStatusState.value = res.state
        if (res.state === 1 && autoPolling.value) {
          stopPolling()
        }
      }
      if (showNotice) {
        ElMessage.success(`状态已更新：${statusText.value}`)
      }
    } catch (e) {
      console.error('查询订单状态失败:', e)
    } finally {
      checkLoading.value = false
    }
  }

  // 轮询控制
  const startPolling = () => {
    stopPolling()
    if (!autoPolling.value) return
    pollTimer = window.setInterval(() => {
      checkOrderStatus(false)
    }, 2500)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const togglePolling = (val: boolean) => {
    if (val) {
      startPolling()
    } else {
      stopPolling()
    }
  }

  // --- 生命周期 ---
  onMounted(() => {
    generateNewPayId()
    fetchSystemKey()
  })

  onBeforeUnmount(() => {
    stopPolling()
  })
</script>

<style scoped lang="scss">
  .test-order-container {
    padding: 16px;

    .intro-card {
      border-radius: 8px;
      border-left: 4px solid var(--el-color-primary);

      .intro-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .intro-title {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);

          .title-icon {
            margin-right: 8px;
            color: var(--el-color-primary);
            font-size: 18px;
          }
        }
      }

      .intro-desc {
        color: var(--el-text-color-secondary);
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
      }
    }

    .form-card,
    .monitor-card {
      border-radius: 8px;
      min-height: 560px;
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
      margin-top: 4px;
    }

    .pay-type-group {
      width: 100%;

      :deep(.el-radio-button) {
        flex: 1;

        .el-radio-button__inner {
          width: 100%;
        }
      }
    }

    .pay-type-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      .pay-icon-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;

        &.wechat-dot {
          background-color: #07c160;
        }

        &.alipay-dot {
          background-color: #1677ff;
        }
      }
    }

    .preset-amounts {
      display: flex;
      align-items: center;
      gap: 6px;

      .preset-title {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .sign-preview-box {
      background: var(--el-fill-color-light);
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      padding: 12px;
      font-size: 12px;

      .sign-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .sign-title {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .sign-formula {
        margin-bottom: 6px;
        code {
          color: var(--el-color-primary);
          background: var(--el-fill-color);
          padding: 2px 4px;
          border-radius: 3px;
        }
      }

      .sign-string {
        word-break: break-all;
        margin-bottom: 4px;
        color: var(--el-text-color-secondary);

        .raw-string {
          color: var(--el-color-warning);
        }
      }

      .sign-result {
        display: flex;
        align-items: center;

        .sign-value {
          font-family: monospace;
          font-weight: bold;
          color: var(--el-color-success);
          letter-spacing: 0.5px;
        }
      }
    }

    .empty-order-box {
      padding: 60px 0;
    }

    .order-dashboard {
      .order-status-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border-radius: 6px;
        margin-bottom: 16px;
        transition: all 0.3s;

        .status-left {
          display: flex;
          align-items: center;

          .status-icon {
            margin-right: 12px;
          }

          .status-title {
            font-weight: 600;
            font-size: 15px;
          }

          .status-subtitle {
            font-size: 12px;
            margin-top: 2px;
            opacity: 0.85;
          }
        }

        &.banner-pending {
          background-color: var(--el-color-warning-light-9);
          border: 1px solid var(--el-color-warning-light-5);
          color: var(--el-color-warning-dark-2);
        }

        &.banner-success {
          background-color: var(--el-color-success-light-9);
          border: 1px solid var(--el-color-success-light-5);
          color: var(--el-color-success-dark-2);
        }

        &.banner-expired {
          background-color: var(--el-color-info-light-9);
          border: 1px solid var(--el-color-info-light-5);
          color: var(--el-color-info-dark-2);
        }

        &.banner-closed {
          background-color: var(--el-color-danger-light-9);
          border: 1px solid var(--el-color-danger-light-5);
          color: var(--el-color-danger-dark-2);
        }
      }

      .order-metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .metric-item {
          background: var(--el-fill-color-light);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--el-border-color-lighter);

          .metric-label {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-bottom: 4px;
            display: flex;
            align-items: center;

            .tip-icon {
              margin-left: 4px;
              color: var(--el-color-warning);
            }
          }

          .metric-value {
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            display: flex;
            align-items: center;
            justify-content: space-between;

            &.code-font {
              font-family: monospace;
            }

            &.price-text {
              font-size: 16px;
              color: var(--el-color-danger);

              &.float-price {
                color: var(--el-color-warning);
              }
            }
          }
        }
      }

      .action-buttons-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .el-button {
          flex: 1;
        }
      }

      .callback-tabs {
        .tab-content-box {
          background: var(--el-fill-color-light);
          border-radius: 6px;
          padding: 14px;
          border: 1px solid var(--el-border-color-lighter);
        }

        .notify-meta {
          font-size: 13px;
          .label {
            color: var(--el-text-color-secondary);
          }
          .url-text {
            color: var(--el-color-primary);
            word-break: break-all;
          }
        }

        .payload-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 6px;
        }

        .json-viewer {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
          max-height: 180px;
          overflow-y: auto;
          margin: 0;
        }

        .sign-verify-section {
          background: var(--el-fill-color);
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;

          .verify-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .verify-formula {
            display: block;
            color: var(--el-color-primary);
            margin-bottom: 4px;
          }

          .verify-detail {
            color: var(--el-text-color-secondary);
          }
        }

        .return-url-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--el-fill-color);
          padding: 8px 12px;
          border-radius: 4px;

          .full-url {
            font-size: 12px;
            color: var(--el-color-primary);
            word-break: break-all;
            margin-right: 8px;
          }
        }
      }
    }
  }
</style>
