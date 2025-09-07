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
          <el-input-number
            v-model="formData.expireTime"
            :min="1"
            :max="60"
            :step="1"
            :precision="0"
          ></el-input-number>
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

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type UploadFile, type UploadProps } from 'element-plus'
  import { VmqService } from '@/api/vmqApi'
  import jsQR from 'jsqr'

  // --- State and Data ---
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const formData = reactive({
    user: '',
    pass: '',
    notifyUrl: '',
    returnUrl: '',
    key: '',
    expireTime: 360,
    differMethod: 'amount_increase', // or 'amount_decrease'
    amountRange: '0.01',
    wxQrcode: '',
    zfbQrcode: '',
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
    expireTime: [{ required: true, message: '请输入订单有效时间', trigger: 'blur' }]
  }

  // --- Lifecycle Hooks ---
  onMounted(() => {
    fetchSettings()
  })

  // --- API Calls ---
  const fetchSettings = async () => {
    loading.value = true
    try {
      const res = await VmqService.getSettings()
      if (res) {
        formData.user = res.user || ''
        formData.pass = res.pass || ''
        formData.notifyUrl = res.notifyUrl || '' // 修正字段名
        formData.returnUrl = res.returnUrl || '' // 修正字段名
        formData.key = res.key || ''
        formData.expireTime = res.close ? parseInt(res.close, 10) : 360
        formData.differMethod = res.pay_qf === '2' ? 'amount_decrease' : 'amount_increase'
        formData.amountRange = res.amount_range || '0.01'
        formData.wxQrcode = res.wxpay || ''
        formData.zfbQrcode = res.zfbpay || ''
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
      const submitData = { ...formData }
      // Map frontend state to backend fields
      submitData.close = submitData.expireTime.toString()
      submitData.payQf = submitData.differMethod === 'amount_increase' ? '1' : '2'
      submitData.wxpay = submitData.wxQrcode
      submitData.zfbpay = submitData.zfbQrcode

      // 确保提交时也使用后端期望的驼峰命名
      submitData.notifyUrl = formData.notifyUrl
      submitData.returnUrl = formData.returnUrl

      await VmqService.updateSettings(submitData)
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
      formRef.value?.validateField('wxQrcode') // 清除验证状态，提供用户反馈
    })
  }

  const handleZfbQrcodeChange = (file: UploadFile) => {
    decodeQrcode(file, (decodedUrl) => {
      formData.zfbQrcode = decodedUrl
      formRef.value?.validateField('zfbQrcode') // 清除验证状态，提供用户反馈
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
    // Use the backend's QR code generation endpoint for display
    return `/api/qrcode/generate?url=${encodeURIComponent(text)}`
  }
</script>

<style lang="scss" scoped>
  .system-settings {
    padding: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .form-tip {
    margin-left: 8px;
    color: #606266;
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: #909399;
  }

  .qrcode-uploader {
    display: flex;
    align-items: center;
  }

  .qrcode-preview {
    min-height: 150px;
    margin-top: 10px;
  }

  .qr-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 150px;
    overflow: hidden;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }

  .qr-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 150px;
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
    align-items: center;
    margin-top: 10px;
  }

  .qr-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 8px;
    overflow: auto;
    font-size: 12px;
    text-align: center;
    word-break: break-all;
  }

  .regenerate-btn {
    margin-top: 10px;
  }

  .qr-text {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
