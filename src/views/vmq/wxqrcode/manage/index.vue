<template>
  <div class="qrcode-manage-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>微信二维码管理</span>
        </div>
      </template>

      
      <el-table
        :data="qrcodeList"
        :loading="loading"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="二维码" width="150">
          <template #default="scope">
            <img :src="getQrcodeImageUrl(scope.row.pay_url)" style="max-width: 120px; max-height: 120px;" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="金额" width="120" />
        <el-table-column prop="pay_url" label="支付链接" show-overflow-tooltip />
        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isEnabled"
              :active-value="1"
              :inactive-value="0"
              @change="handleStateChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-popconfirm
              title="确定要删除这个二维码吗?"
              @confirm="handleDelete(scope.row.id)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VmqGoService } from '@/api/vmqGoApi'

// 定义收款码类型
interface QrcodeItem {
  id: number
  price: number
  pay_url: string
  status: string
  created_at: string
  type: number
}

// 加载状态
const loading = ref(false)

// 二维码列表
const qrcodeList = ref<(QrcodeItem & { isEnabled: number })[]>([])

// 原始响应数据，用于调试
const rawResponse = ref<any>(null)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取二维码列表
const fetchQrcodeList = async () => {
  loading.value = true
  try {
    // 使用Go API获取微信收款码 (type=1)
    const response = await VmqGoService.getQrcodes({
      page: currentPage.value,
      limit: pageSize.value,
      type: 1 // 1=微信
    })
    
    // 保存原始响应用于调试
    rawResponse.value = response
    console.log('API响应数据:', response)
    
    // 处理API返回的数据结构
    let items: QrcodeItem[] = [];
    let totalCount = 0;
    
    if (response) {
      // Go API返回格式: { data: Array, meta: { total, page, limit } }
      if (response.data && Array.isArray(response.data)) {
        items = response.data;
        totalCount = response.meta?.total || items.length;
      } else if (Array.isArray(response)) {
        // 兼容直接返回数组的情况
        items = response;
        totalCount = items.length;
      }
      
      // 处理每个二维码项，添加isEnabled属性用于开关控制
      qrcodeList.value = items.map((item) => ({
        ...item,
        isEnabled: item.status === 'enabled' ? 1 : 0 // 根据status字段判断状态
      }));
      total.value = totalCount;
    } else {
      qrcodeList.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error('获取二维码列表失败: ' + (error as Error).message)
    qrcodeList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理状态变更
const handleStateChange = async (row: QrcodeItem & { isEnabled: number }) => {
  try {
    // 调用Go API更新状态
    await VmqGoService.updateQrcodeStatus(row.id, row.isEnabled)
    ElMessage.success(row.isEnabled === 1 ? '已启用' : '已禁用')
  } catch (error) {
    ElMessage.error('状态更新失败: ' + (error as Error).message)
    // 恢复原状态
    row.isEnabled = row.isEnabled === 0 ? 1 : 0
  }
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchQrcodeList()
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchQrcodeList()
}

// 删除二维码
const handleDelete = async (id: number) => {
  try {
    await VmqGoService.deleteQrcode(id)
    ElMessage.success('删除成功')
    // 重新加载数据
    fetchQrcodeList()
  } catch (error) {
    ElMessage.error('删除失败: ' + (error as Error).message)
  }
}

// 获取二维码图片URL
const getQrcodeImageUrl = (url: string) => {
  return VmqGoService.getQrcodeImageUrl(url)
}

// 初始化
onMounted(() => {
  fetchQrcodeList()
})
</script>

<style scoped>
.qrcode-manage-container {
  padding: 24px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.debug-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.debug-info pre {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow: auto;
}
</style> 