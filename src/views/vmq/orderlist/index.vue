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
        <el-form :inline="true" class="search-form">
          <el-form-item label="订单状态">
            <el-radio-group v-model="stateFilter" @change="handleFilterChange">
              <el-radio-button :value="''">全部状态</el-radio-button>
              <el-radio-button :value="0">未支付</el-radio-button>
              <el-radio-button :value="1">已支付</el-radio-button>
              <el-radio-button :value="2">通知失败</el-radio-button>
              <el-radio-button :value="-1">已关闭</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-radio-group v-model="typeFilter" @change="handleFilterChange">
              <el-radio-button :value="''">全部</el-radio-button>
              <el-radio-button :value="1">微信</el-radio-button>
              <el-radio-button :value="2">支付宝</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div class="buttons">
          <el-button type="primary" :disabled="!selectedIds.length" @click="handleBatchReissue">
            批量补单
          </el-button>
          <el-button type="warning" :disabled="!selectedIds.length" @click="handleBatchClose">
            批量关闭
          </el-button>
          <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
            批量删除
          </el-button>
          <el-button type="warning" @click="handleCloseExpired">关闭超时订单</el-button>
          <el-button type="danger" @click="handleDeleteExpired">删除过期订单</el-button>
          <el-button type="danger" @click="handleDeleteLast">删除历史订单</el-button>
        </div>
      </div>

      <!-- 订单表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48"></el-table-column>
        <el-table-column prop="order_id" label="订单号"></el-table-column>
        <el-table-column prop="pay_id" label="商户订单号"></el-table-column>
        <el-table-column prop="type_text" label="支付方式"></el-table-column>
        <el-table-column prop="price" label="订单金额"></el-table-column>
        <el-table-column prop="really_price" label="实付金额"></el-table-column>
        <el-table-column prop="state_text" label="状态">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusTag(row.state)">{{ row.state_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间"></el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="primary" :disabled="row.state === 1" @click="handleReissue(row.id)">补单</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="searchParams.limit"
        @current-change="handlePageChange"
        class="pagination-container"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { VmqService, BatchOrderResult } from '@/api/vmqApi'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchParams = ref({
  page: 1,
  limit: 10,
})

// 空字符串表示“全部”，避免使用 0 与“未支付”状态冲突
const stateFilter = ref<number | ''>('')
const typeFilter = ref<number | ''>('')

const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRows = ref<any[]>([])
const selectedIds = computed(() => selectedRows.value.map((row) => row.id))

const fetchOrderList = async () => {
  loading.value = true
  try {
    const res = await VmqService.getOrders({
      ...searchParams.value,
      ...(stateFilter.value === '' ? {} : { state: stateFilter.value }),
      ...(typeFilter.value === '' ? {} : { type: typeFilter.value }),
    })
    tableData.value = res.items
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  searchParams.value.page = 1
  fetchOrderList()
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
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
    await VmqService.deleteOrder(id)
    ElMessage.success('删除成功')
    fetchOrderList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}


const handleReissue = async (id: number) => {
  await ElMessageBox.confirm('确定要补单吗？该操作将按新版规则重新发送异步通知', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
 })

  try {
    await VmqService.reissueOrder(id)
    ElMessage.success('补单成功')
    fetchOrderList()
  } catch (error: any) {
    ElMessage.error(error?.message || '补单失败')
  }
}



const handleCloseExpired = async () => {
  await ElMessageBox.confirm('确定要关闭所有超时订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    const res = await VmqService.closeExpiredOrders()
    ElMessage.success(`成功关闭了 ${res.count} 个超时订单`)
    fetchOrderList()
  } catch (error) {
    ElMessage.error('关闭失败')
  }
}

const handleDeleteExpired = async () => {
  await ElMessageBox.confirm('确定要删除所有过期订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    const res = await VmqService.deleteExpiredOrders()
    ElMessage.success(`成功删除了 ${res.count} 个过期订单`)
    fetchOrderList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleDeleteLast = async () => {
  await ElMessageBox.confirm('确定要删除所有历史订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    const res = await VmqService.deleteLastOrders()
    ElMessage.success(`成功删除了 ${res.count} 个历史订单`)
    fetchOrderList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 批量操作统一处理结果提示与列表刷新
const runBatchOperation = async (
  action: (ids: number[]) => Promise<BatchOrderResult>,
  successLabel: string,
) => {
  const ids = selectedIds.value
  try {
    const res = await action(ids)
    if (res.failedCount > 0) {
      const firstFailure = res.failures[0]
      ElMessage.warning(
        `${successLabel}成功 ${res.successCount} 个，失败 ${res.failedCount} 个` +
          (firstFailure ? `（订单 ${firstFailure.id}：${firstFailure.message}）` : ''),
      )
    } else {
      ElMessage.success(`${successLabel}成功 ${res.successCount} 个订单`)
    }
    fetchOrderList()
  } catch (error: any) {
    ElMessage.error(error?.message || `${successLabel}失败`)
  }
}

const handleBatchReissue = async () => {
  await ElMessageBox.confirm(`确定要对选中的 ${selectedIds.value.length} 个订单补单吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await runBatchOperation(VmqService.batchReissueOrders, '批量补单')
}

const handleBatchClose = async () => {
  await ElMessageBox.confirm(
    `确定要关闭选中的 ${selectedIds.value.length} 个订单吗？仅未支付的订单可关闭`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
  await runBatchOperation(VmqService.batchCloseOrders, '批量关闭')
}

const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个订单吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await runBatchOperation(VmqService.batchDeleteOrders, '批量删除')
}

const getOrderStatusTag = (state: number) => {
  switch (state) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case -1:
      return 'danger'
    default:
      return 'info'
  }
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
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
