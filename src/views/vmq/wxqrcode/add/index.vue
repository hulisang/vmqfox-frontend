<template>
  <div class="qrcode-add-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>添加微信二维码</span>
        </div>
      </template>
      <div class="upload-area">
        <el-upload
          action=""
          list-type="picture-card"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :on-preview="handlePreview"
          :multiple="true"
          accept="image/*"
          class="custom-upload"
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="el-upload__text">选择微信二维码</div>
          </div>
        </el-upload>
        <el-dialog v-model="previewVisible" title="预览图片">
          <img :src="previewImage" alt="预览" style="width: 100%" />
        </el-dialog>
      </div>

      <div class="qrcode-table" v-if="qrcodeList.length > 0">
        <el-table :data="qrcodeList" style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" />
          <el-table-column label="二维码" width="150">
            <template #default="scope">
              <img :src="scope.row.b64" style="max-width: 120px; max-height: 120px;" />
            </template>
          </el-table-column>
          <el-table-column prop="url" label="内容" show-overflow-tooltip />
          <el-table-column label="金额" width="150">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.money"
                :min="0.01"
                :step="0.01"
                :precision="2"
                placeholder="输入金额"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-popconfirm
                title="确定要删除这个二维码吗?"
                @confirm="removeQrcode(scope.row.index)"
              >
                <template #reference>
                  <el-button type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div class="action-buttons">
          <el-button type="primary" @click="saveQrcodes" :disabled="!canSave">保存二维码</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, UploadFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { VmqService } from '@/api/vmqApi'
import jsQR from 'jsqr'

interface QrcodeItem {
  index: number
  money: number
  b64: string
  url: string
}

// 预览相关
const previewVisible = ref(false)
const previewImage = ref('')

// 文件列表
const fileList = ref<any[]>([])

// 二维码列表
const qrcodeList = ref<QrcodeItem[]>([])

// 判断是否可以保存
const canSave = computed(() => {
  if (qrcodeList.value.length === 0) return false
  return qrcodeList.value.every(item => item.money > 0)
})

// 处理文件变化 - 新的前端解码逻辑
const handleChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          ElMessage.error('无法获取Canvas上下文')
          return
        }
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0, img.width, img.height)
        const imageData = context.getImageData(0, 0, img.width, img.height)
        
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          qrcodeList.value.push({
            index: qrcodeList.value.length + 1,
            money: 0,
            b64: e.target?.result as string,
            url: code.data
          })
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

// 移除文件
const handleRemove = (file: any) => {
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

// 预览图片
const handlePreview = (file: any) => {
  previewImage.value = file.url || URL.createObjectURL(file.raw)
  previewVisible.value = true
}

// 移除二维码
const removeQrcode = (index: number) => {
  qrcodeList.value = qrcodeList.value.filter(item => item.index !== index)
  // 重新编号
  qrcodeList.value.forEach((item, idx) => {
    item.index = idx + 1
  })
}

// 保存二维码
const saveQrcodes = async () => {
  if (!canSave.value) {
    ElMessage.warning('请确保所有二维码都已设置金额')
    return
  }

  try {
    // 保存所有二维码
    for (const item of qrcodeList.value) {
      await VmqService.addWxQrcode({
        pay_url: item.url,
        price: item.money
      })
    }
    ElMessage.success('所有二维码保存成功')
    // 清空列表
    qrcodeList.value = []
    fileList.value = []
  } catch (error) {
    ElMessage.error('保存失败: ' + (error as Error).message)
  }
}
</script>

<style scoped>
.qrcode-add-container {
  padding: 24px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.upload-area {
  margin-bottom: 24px;
}
.upload-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}
.el-upload__text {
  margin-top: 8px;
  color: #666;
}
:deep(.custom-upload .el-upload--picture-card) {
  display: flex;
  justify-content: center;
  align-items: center;
}
.qrcode-table {
  margin-top: 24px;
}
.action-buttons {
  margin-top: 16px;
  text-align: right;
}
</style> 