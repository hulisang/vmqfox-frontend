<template>
  <div class="monitor-status">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>监控端状态</span>
        </div>
      </template>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="监控端状态">
          <el-tag :type="statusTagType">{{ monitorStatus }}</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="最后心跳">
          {{ lastHeartbeat }}
        </el-descriptions-item>
        
        <el-descriptions-item label="最后收款">
          {{ lastPayment }}
        </el-descriptions-item>
        
        <el-descriptions-item label="配置数据">
          <el-input v-model="configData" readonly>
            <template #append>
              <el-button @click="copyConfigData">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-descriptions-item>
        
        <el-descriptions-item label="配置二维码">
          <div class="qrcode-container">
            <img :src="qrcodeUrl" alt="配置二维码" class="qrcode-image" v-if="qrcodeUrl"/>
            <el-empty description="暂无二维码" v-else :image-size="100" />
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-buttons">
        <el-button type="primary" @click="downloadMonitor">
          <el-icon><Download /></el-icon>
          下载监控端
        </el-button>
        <el-button type="success" @click="downloadLatestMonitor">
          <el-icon><RefreshRight /></el-icon>
          最新版监控端下载
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Download, RefreshRight } from '@element-plus/icons-vue'
import { VmqService } from '@/api/vmqApi'

// 状态数据
const monitorState = ref(-1) // -1: 未绑定, 0: 已掉线, 1: 运行正常
const lastHeartbeat = ref('无')
const lastPayment = ref('无')
const configData = ref('')
const qrcodeUrl = ref('')

// 计算监控状态文本
const monitorStatus = computed(() => {
  switch (monitorState.value) {
    case -1:
      return '监控端未绑定，请您扫码绑定'
    case 0:
      return '监控端已掉线，请您检查App是否正常运行'
    case 1:
      return '运行正常'
    default:
      return '状态未知'
  }
})

// 计算状态标签类型
const statusTagType = computed(() => {
  switch (monitorState.value) {
    case -1:
      return 'warning'
    case 0:
      return 'danger'
    case 1:
      return 'success'
    default:
      return 'info'
  }
})

// 格式化时间戳
const formatTime = (timestamp: string | number) => {
  if (!timestamp || timestamp === '0' || timestamp === 0) return '无'
  
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000)
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 复制配置数据
const copyConfigData = () => {
  navigator.clipboard.writeText(configData.value)
    .then(() => {
      ElMessage.success('配置数据已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 下载监控端
const downloadMonitor = () => {
  window.open('/v.apk', '_blank')
}

// 下载最新版监控端
const downloadLatestMonitor = () => {
  window.open('https://github.com/szvone/vmqApk/releases', '_blank')
}

// 获取监控端状态
const fetchMonitorStatus = async () => {
  try {
    const response = await VmqService.getMonitorStatus()
    console.log('监控端状态API响应:', response)
    
    // 检查响应格式，适配后端返回的格式
    // 如果response本身就是data，说明axios拦截器已经提取了data字段
    const data = response.data || response
    
    // 确保有数据且格式正确
    if (data) {
      // 设置监控状态
      monitorState.value = parseInt(data.jkstate) || -1
      lastHeartbeat.value = formatTime(data.lastheart)
      lastPayment.value = formatTime(data.lastpay)
      
      // 获取配置数据和二维码
      // 如果API返回中没有key，则需要从系统设置接口获取
      if (!data.key) {
        try {
          // 尝试从系统设置获取key
          const settingsResponse = await VmqService.getSettings()
          console.log('系统设置API响应:', settingsResponse)
          
          if (settingsResponse && settingsResponse.key) {
            const host = window.location.host
            const configUrl = host + '/' + settingsResponse.key
            configData.value = configUrl
            qrcodeUrl.value = `/api/qrcode/generate?url=${encodeURIComponent(configUrl)}`
          } else {
            console.error('无法获取通讯密钥(key)')
            configData.value = '无法获取配置数据，请检查系统设置'
            qrcodeUrl.value = ''
          }
        } catch (settingsError) {
          console.error('获取系统设置失败:', settingsError)
          configData.value = '获取配置数据失败'
          qrcodeUrl.value = ''
        }
      } else {
        // 使用API返回的key
        const host = window.location.host
        const configUrl = host + '/' + data.key
        configData.value = configUrl
        qrcodeUrl.value = `/api/qrcode/generate?url=${encodeURIComponent(configUrl)}`
      }
    } else {
      console.error('API响应格式不符合预期:', response)
      ElMessage.error('获取监控端状态失败: 响应格式不符合预期')
    }
  } catch (error) {
    console.error('获取监控端状态失败:', error)
    ElMessage.error('获取监控端状态失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchMonitorStatus()
})
</script>

<style scoped>
.monitor-status {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.el-descriptions {
  margin-bottom: 20px;
}
</style> 