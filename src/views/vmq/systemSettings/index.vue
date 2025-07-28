<template>
  <div class="system-settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-form ref="formRef" :model="formData" label-width="120px" :rules="rules">
        <el-form-item label="后台账号" prop="user">
          <el-input v-model="formData.user" placeholder="请输入后台账号"></el-input>
        </el-form-item>
        
        <el-form-item label="后台密码" prop="pass">
          <el-input v-model="formData.pass" type="password" placeholder="请输入后台密码"></el-input>
        </el-form-item>
        
        <el-form-item label="订单有效期" prop="expireTime">
          <el-input-number v-model="formData.expireTime" :min="1" :max="60" :step="1" :precision="0"></el-input-number>
          <span class="form-tip">分钟</span>
        </el-form-item>
        
        <el-form-item label="异步回调" prop="notifyUrl">
          <el-input v-model="formData.notifyUrl" placeholder="请输入异步回调地址"></el-input>
        </el-form-item>
        
        <el-form-item label="同步回调" prop="returnUrl">
          <el-input v-model="formData.returnUrl" placeholder="请输入同步回调地址"></el-input>
        </el-form-item>
        
        <el-form-item label="通讯密钥" prop="key">
          <el-input v-model="formData.key" placeholder="请输入通讯密钥"></el-input>
        </el-form-item>

        <el-form-item label="商户ID" prop="appId">
          <el-input v-model="formData.appId" placeholder="请输入商户ID（AppID）">
            <template #append>
              <el-button @click="generateAppId">生成</el-button>
            </template>
          </el-input>
          <div class="form-tip">用于第三方平台识别您的商户身份，建议使用英文字母和数字组合</div>
        </el-form-item>

        <el-form-item label="区分方式" prop="differMethod">
          <el-select v-model="formData.differMethod" placeholder="请选择区分方式">
            <el-option label="金额递增" value="amount_increase"></el-option>
            <el-option label="金额递减" value="amount_decrease"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="微信码" prop="wxQrcode">
          <div>
            <el-upload
              class="qrcode-uploader"
              action=""
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleWxQrcodeChange"
              :before-upload="beforeQrcodeUpload"
            >
              <el-button type="success">上传收款二维码</el-button>
            </el-upload>
            <div class="upload-tip">（此处上传的是无金额的收款二维码）</div>
          </div>
          <div class="qrcode-preview">
            <div v-if="formData.wxQrcode" class="qr-container">
              <img
                :src="generateQrCodeUrl(formData.wxQrcode)"
                class="qrcode-image"
                alt="微信收款码预览"
              />
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="支付宝码" prop="zfbQrcode">
          <div>
            <el-upload
              class="qrcode-uploader"
              action=""
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleZfbQrcodeChange"
              :before-upload="beforeQrcodeUpload"
            >
              <el-button type="primary">上传收款二维码</el-button>
            </el-upload>
            <div class="upload-tip">（此处上传的是无金额的收款二维码）</div>
          </div>
          <div class="qrcode-preview">
            <div v-if="formData.zfbQrcode" class="qr-container">
              <img
                :src="generateQrCodeUrl(formData.zfbQrcode)"
                class="qrcode-image"
                alt="支付宝收款码预览"
              />
            </div>
          </div>
        </el-form-item>

        <!-- 注册配置部分 - 仅超级管理员可见 -->
        <template v-if="isSuperAdmin">
          <el-divider content-position="left">
            <span style="font-weight: bold; color: #409EFF;">用户注册配置</span>
          </el-divider>

          <el-form-item label="开放注册" prop="registerEnabled">
            <el-switch
              v-model="formData.registerEnabled"
              active-text="开启"
              inactive-text="关闭"
              :active-value="true"
              :inactive-value="false"
            />
            <div class="form-tip">是否允许新用户注册账户</div>
          </el-form-item>

          <el-form-item label="默认角色" prop="registerDefaultRole">
            <el-select v-model="formData.registerDefaultRole" placeholder="请选择新用户默认角色">
              <el-option label="普通管理员" value="admin"></el-option>
              <el-option label="超级管理员" value="super_admin"></el-option>
            </el-select>
            <div class="form-tip">新注册用户的默认权限角色</div>
          </el-form-item>

          <el-form-item label="需要审核" prop="registerRequireApproval">
            <el-switch
              v-model="formData.registerRequireApproval"
              active-text="需要"
              inactive-text="不需要"
              :active-value="true"
              :inactive-value="false"
            />
            <div class="form-tip">新用户注册后是否需要管理员审核</div>
          </el-form-item>

          <el-form-item label="频率限制" prop="registerRateLimit">
            <el-input-number
              v-model="formData.registerRateLimit"
              :min="1"
              :max="100"
              :step="1"
              :precision="0"
            />
            <span class="form-tip">次/小时（每小时最大注册次数）</span>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type UploadFile, type UploadProps } from 'element-plus'
import { VmqGoService } from '@/api/vmqGoApi'
import { useUserStore } from '@/store/modules/user'
import jsQR from 'jsqr'

// --- State and Data ---
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 计算属性：判断是否为超级管理员
const isSuperAdmin = computed(() => {
  const userInfo = userStore.getUserInfo
  console.log('权限检查 - 用户信息:', userInfo)
  console.log('权限检查 - 用户角色:', userInfo?.roles)
  return userInfo?.roles?.includes('super_admin') || false
})
const formData = reactive({
  user: '',
  pass: '',
  notifyUrl: '',
  returnUrl: '',
  key: '',
  appId: '', // 新增AppID字段
  expireTime: 360,
  differMethod: 'amount_increase', // or 'amount_decrease'
  amountRange: '0.01',
  wxQrcode: '',
  zfbQrcode: '',
  // 注册配置字段
  registerEnabled: true,
  registerDefaultRole: 'admin',
  registerRequireApproval: false,
  registerRateLimit: 10,
  // helper properties for backend mapping
  close: '360',
  payQf: '1',
  wxpay: '',
  zfbpay: ''
})

const rules = {
  user: [{ required: true, message: '请输入后台账号', trigger: 'blur' }],
  pass: [{ required: true, message: '请输入后台密码', trigger: 'blur' }],
  key: [{ required: true, message: '请输入通讯密钥', trigger: 'blur' }],
  appId: [
    { required: true, message: '请输入商户ID', trigger: 'blur' },
    { min: 6, max: 32, message: '商户ID长度应在6-32个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '商户ID只能包含字母、数字、下划线和横线', trigger: 'blur' }
  ],
  notifyUrl: [{ required: true, message: '请输入异步通知地址', trigger: 'blur' }],
  expireTime: [{ required: true, message: '请输入订单有效时间', trigger: 'blur' }],
  wxQrcode: [{ required: true, message: '请上传微信收款码', trigger: 'change' }],
  zfbQrcode: [{ required: true, message: '请上传支付宝收款码', trigger: 'change' }]
}

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchSettings()
})

// --- API Calls ---
const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await VmqGoService.getSystemConfig()
    if (res) {
      formData.user = res.user || ''
      formData.pass = res.pass || ''
      formData.notifyUrl = res.notifyUrl || ''
      formData.returnUrl = res.returnUrl || ''
      formData.key = res.key || ''
      formData.appId = res.appId || ''
      formData.expireTime = res.close ? parseInt(res.close, 10) : 360
      formData.differMethod = res.payQf === '2' ? 'amount_decrease' : 'amount_increase'
      formData.amountRange = '0.01' // 固定值，Go版API暂不支持此字段
      formData.wxQrcode = res.wxpay || ''
      formData.zfbQrcode = res.zfbpay || ''

      // 注册配置映射
      formData.registerEnabled = res.register_enabled === '1'
      formData.registerDefaultRole = res.register_default_role || 'admin'
      formData.registerRequireApproval = res.register_require_approval === '1'
      formData.registerRateLimit = res.register_rate_limit ? parseInt(res.register_rate_limit, 10) : 10

      // 同步到后端映射字段
      formData.close = res.close || '360'
      formData.payQf = res.payQf || '1'
      formData.wxpay = res.wxpay || ''
      formData.zfbpay = res.zfbpay || ''
    }
  } catch (error) {
    console.error('获取系统设置失败:', error)
    ElMessage.error('获取系统设置失败')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  loading.value = true
  try {
    // 构建Go API期望的数据格式
    const submitData = {
      user: formData.user,
      pass: formData.pass,
      notifyUrl: formData.notifyUrl,
      returnUrl: formData.returnUrl,
      key: formData.key,
      appId: formData.appId,
      close: formData.expireTime.toString(),
      payQf: formData.differMethod === 'amount_increase' ? '1' : '2',
      wxpay: formData.wxQrcode,
      zfbpay: formData.zfbQrcode,
      // 注册配置
      register_enabled: formData.registerEnabled ? '1' : '0',
      register_default_role: formData.registerDefaultRole,
      register_require_approval: formData.registerRequireApproval ? '1' : '0',
      register_rate_limit: formData.registerRateLimit.toString()
    }

    await VmqGoService.updateSystemConfig(submitData)
    ElMessage.success('系统设置保存成功')
  } catch (error) {
    console.error('保存系统设置失败:', error)
    ElMessage.error('保存系统设置失败')
  } finally {
    loading.value = false
  }
}

// --- Event Handlers ---
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      submitForm()
    }
  })
}

// --- QR Code Handling ---
const handleWxQrcodeChange = (file: UploadFile) => {
  decodeQrcode(file, (decodedUrl) => {
    formData.wxQrcode = decodedUrl
    formRef.value?.validateField('wxQrcode') // Validate after successful decoding
  })
}

const handleZfbQrcodeChange = (file: UploadFile) => {
  decodeQrcode(file, (decodedUrl) => {
    formData.zfbQrcode = decodedUrl
    formRef.value?.validateField('zfbQrcode') // Validate after successful decoding
  })
}

const beforeQrcodeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('二维码图片只支持 JPG/PNG 格式!')
    return false
  }
  const isLt2M = rawFile.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('二维码图片大小不能超过 2MB!')
    return false
  }
  return isJpgOrPng && isLt2M
}

// --- Utility Functions ---
const decodeQrcode = (file: UploadFile, callback: (url: string) => void) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) {
          ElMessage.error('无法获取Canvas上下文')
          return
        }
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0, img.width, img.height)
        const imageData = context.getImageData(0, 0, img.width, img.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code && code.data) {
          callback(code.data)
          ElMessage.success('二维码识别成功！')
        } else {
          ElMessage.error('无法识别图中的二维码，请确保图片清晰且有效')
        }
      }
      if (e.target?.result) {
        img.src = e.target.result as string
      }
    }
    reader.readAsDataURL(file.raw)
  }
}

const generateQrCodeUrl = (text: string) => {
  if (!text) return ''
  // Use the Go API's QR code generation endpoint for display
  return VmqGoService.getQrcodeImageUrl(text)
}

// 生成随机AppID
const generateAppId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'VMQ_'
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.appId = result
}
</script>

<style lang="scss" scoped>
.system-settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  margin-left: 8px;
  color: #606266;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.qrcode-uploader {
  display: flex;
  align-items: center;
}

.qrcode-preview {
  margin-top: 10px;
  min-height: 150px;
}

.qr-container {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.qr-placeholder {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.qrcode-image {
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
}

.manual-input {
  display: flex;
  margin-top: 10px;
  align-items: center;
}

.qr-content {
  width: 100%;
  height: 100%;
  padding: 8px;
  font-size: 12px;
  overflow: auto;
  word-break: break-all;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.regenerate-btn {
  margin-top: 10px;
}

.qr-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style> 