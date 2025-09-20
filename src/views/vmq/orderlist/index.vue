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
import { ref, onMounted } from 'vue'
import { VmqService } from '@/api/vmqApi'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchParams = ref({
  page: 1,
  limit: 10,
  state: undefined,
})

const tableData = ref([])
const total = ref(0)
const loading = ref(false)

const fetchOrderList = async () => {
  loading.value = true
  try {
    const res = await VmqService.getOrders(searchParams.value)
    tableData.value = res.items
    total.value = res.total
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
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  gap: 10px;
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