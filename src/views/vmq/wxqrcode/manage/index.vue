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
            <img :src="`/api/qrcode/generate?url=${encodeURIComponent(scope.row.pay_url)}`" style="max-width: 120px; max-height: 120px;" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="金额" width="120" />
        <el-table-column prop="pay_url" label="支付链接" show-overflow-tooltip />
        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isEnabled"
              :active-value="0"
              :inactive-value="1"
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
import { VmqService, QrcodeItem, QrcodeResponse } from '@/api/vmqApi'

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
    const response = await VmqService.getWxQrcodes({
      page: currentPage.value,
      limit: pageSize.value
    })
    
    // 保存原始响应用于调试
    rawResponse.value = response
    console.log('API响应数据:', response)
    
    // 处理API返回的数据结构
    let items: QrcodeItem[] = [];
    let totalCount = 0;
    
    if (response) {
      // 检查响应数据结构
      if (Array.isArray(response)) {
        // 如果直接返回数组
        items = response;
        totalCount = items.length;
      } else if (typeof response === 'object') {
        const resp = response as any; // 使用类型断言
        // 如果是对象，尝试不同的数据结构
        if (resp.data) {
          // 如果有data字段
          if (Array.isArray(resp.data)) {
            // 如果data是数组
            items = resp.data;
            totalCount = items.length;
          } else if (resp.data.items && Array.isArray(resp.data.items)) {
            // 如果data.items是数组
            items = resp.data.items;
            totalCount = resp.data.total || items.length;
          }
        } else if (resp.items && Array.isArray(resp.items)) {
          // 如果直接有items字段
          items = resp.items;
          totalCount = resp.total || items.length;
        }
      }
      
      // 处理每个二维码项，添加isEnabled属性用于开关控制
      qrcodeList.value = items.map((item) => ({
        ...item,
        isEnabled: item.state === 0 ? 0 : 1 // 0表示启用，1表示禁用
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
    // 调用API更新二维码状态
    await VmqService.setQrcodeState(row.id, row.isEnabled)
    ElMessage.success(`二维码已${row.isEnabled === 0 ? '启用' : '禁用'}`)
  } catch (error) {
    // 如果API调用失败，恢复原状态
    row.isEnabled = row.isEnabled === 0 ? 1 : 0
    ElMessage.error('更新状态失败: ' + (error as Error).message)
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
    await VmqService.delWxQrcode(id)
    ElMessage.success('删除成功')
    // 重新加载数据
    fetchQrcodeList()
  } catch (error) {
    ElMessage.error('删除失败: ' + (error as Error).message)
  }
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