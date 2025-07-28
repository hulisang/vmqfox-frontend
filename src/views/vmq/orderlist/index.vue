<template>
  <div class="order-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
        </div>
      </template>

      <!-- 搜索和操作区域 -->
      <div class="table-actions">
        <el-form :inline="true" :model="searchParams" class="search-form">
          <el-form-item label="用户ID">
            <el-input v-model="searchParams.user_id" placeholder="输入用户ID" clearable style="width: 120px"></el-input>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchParams.state" placeholder="选择订单状态" clearable class="status-select">
              <el-option label="未支付" :value="0"></el-option>
              <el-option label="已支付" :value="1"></el-option>
              <el-option label="已关闭" :value="-1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <div class="buttons">
          <el-button type="warning" @click="handleCloseExpired">关闭超时订单</el-button>
          <el-button type="danger" @click="handleDeleteExpired">删除过期订单</el-button>
          <el-button type="danger" @click="handleDeleteLast">删除历史订单</el-button>
        </div>
      </div>

      <!-- 订单表格 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="order_id" label="订单号"></el-table-column>
        <el-table-column prop="pay_id" label="商户订单号"></el-table-column>
        <el-table-column prop="user_id" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="type_text" label="支付方式"></el-table-column>
        <el-table-column prop="price" label="订单金额"></el-table-column>
        <el-table-column prop="really_price" label="实付金额"></el-table-column>
        <el-table-column prop="state_text" label="状态">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusTag(row.state)">{{ row.state_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_date" label="创建时间">
          <template #default="{ row }">
            {{ formatTimestamp(row.create_date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="total > 0" background layout="prev, pager, next" :total="total"
        :page-size="searchParams.limit" @current-change="handlePageChange" class="pagination-container"></el-pagination>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VmqGoService } from '@/api/vmqGoApi'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchParams = ref({
  page: 1,
  limit: 10,
  user_id: undefined as string | undefined,
  state: undefined as number | undefined,
})

const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const fetchOrderList = async () => {
  loading.value = true
  try {
    // 转换参数格式以适配Go API
    const goParams: {
      page: number;
      limit: number;
      user_id?: number;
      status?: string;
    } = {
      page: searchParams.value.page,
      limit: searchParams.value.limit,
      status: searchParams.value.state?.toString()
    }
    
    // 只有当user_id有值时才添加到参数中，并确保转换为数字
    if (searchParams.value.user_id) {
      goParams.user_id = parseInt(searchParams.value.user_id);
    }
    
    const res = await VmqGoService.getOrders(goParams)
    console.log('订单API响应:', res)

    // Go API返回格式: { data: [...], meta: { total, page, limit } }
    tableData.value = res.data || []
    total.value = res.meta?.total || 0

    console.log('处理后的数据:', {
      tableData: tableData.value,
      total: total.value,
      length: tableData.value.length
    })
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchParams.value.page = 1
  fetchOrderList()
}

const handlePageChange = (page: number) => {
  searchParams.value.page = page
  fetchOrderList()
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    await VmqGoService.deleteOrder(id)
    ElMessage.success('删除成功')
    fetchOrderList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleCloseExpired = async () => {
  await ElMessageBox.confirm('确定要关闭所有超时订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    const res = await VmqGoService.closeExpiredOrders({ limit: 100 })
    console.log('关闭超时订单API响应:', res)
    console.log('closed_count值:', res.closed_count)
    console.log('响应类型:', typeof res)
    console.log('响应结构:', Object.keys(res))

    ElMessage.success(`成功关闭了 ${res.closed_count || 0} 个超时订单`)
    fetchOrderList()
  } catch (error) {
    console.error('关闭超时订单失败:', error)
    ElMessage.error('关闭失败')
  }
}

const handleDeleteExpired = async () => {
  await ElMessageBox.confirm('确定要删除过期订单吗？默认将删除30天前的已关闭订单', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    const res = await VmqGoService.deleteExpiredOrders({
      limit: 100,        // 限制删除100条
      only_closed: true, // 只删除已关闭的订单
      expire_days: 30    // 删除30天前的订单
    })
    ElMessage.success(`成功删除了 ${res.deleted_count || 0} 个过期订单`)
    fetchOrderList()
  } catch (error) {
    console.error('删除过期订单失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleDeleteLast = async () => {
  await ElMessageBox.confirm('确定要删除历史订单吗？将删除90天前的所有未支付和已关闭订单', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    const res = await VmqGoService.deleteExpiredOrders({
      limit: 500,        // 限制删除500条
      only_closed: false, // 删除所有未支付和已关闭的订单
      expire_days: 90    // 删除90天前的订单
    })
    ElMessage.success(`成功删除了 ${res.deleted_count || 0} 个历史订单`)
    fetchOrderList()
  } catch (error) {
    console.error('删除历史订单失败:', error)
    ElMessage.error('删除失败')
  }
}

const getOrderStatusTag = (state: number) => {
  switch (state) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case -1:
      return 'danger'
    default:
      return 'info'
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000) // 转换为毫秒
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.order-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .table-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-form {
    margin-bottom: 15px;
  }

  .buttons {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-form .el-form-item {
    margin-bottom: 10px;
  }

  .buttons {
    flex-direction: column;
  }

  .buttons .el-button {
    width: 100%;
    margin-bottom: 8px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 增加订单状态选择框宽度 */
:deep(.status-select) {
  width: 160px;
}
</style>